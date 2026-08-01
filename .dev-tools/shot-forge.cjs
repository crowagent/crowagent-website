#!/usr/bin/env node
/**
 * shot-forge — turn raw product captures into premium, cleaned marketing frames.
 *
 * Driven by a recipe JSON so the decisions live in data, not in code. Every
 * operation is one of four kinds, and each exists because a real defect on the
 * public site needed it:
 *
 *   redact  — flat patch sampled from the neighbouring background. Used to
 *             remove a whole element (a win/loss KPI tile, a stale toast).
 *   blur    — heavy blur plus a slight darken. Used for personal identifiers
 *             (avatars, email addresses) where the shape should survive but
 *             the content must not be readable.
 *   text    — redact, then paint replacement text in the same position, size,
 *             weight and colour. Used ONLY for entity labels (contract names,
 *             authority names) that were literal test data. Never used on a
 *             number, a metric or anything that reads as a claim.
 *   dim     — a translucent scrim. Used to push distracting chrome back.
 *
 * Coordinates in the recipe are FRACTIONS of the source image (0-1), so a
 * recipe stays correct if the source is ever recaptured at another size.
 *
 * Usage: node .dev-tools/shot-forge.cjs <recipe.json> [--only id1,id2] [--dry]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

function fracToPx(frac, W, H) {
  const [x0, y0, x1, y1] = frac;
  const left = Math.max(0, Math.round(x0 * W));
  const top = Math.max(0, Math.round(y0 * H));
  const width = Math.min(W - left, Math.round((x1 - x0) * W));
  const height = Math.min(H - top, Math.round((y1 - y0) * H));
  return { left, top, width: Math.max(1, width), height: Math.max(1, height) };
}

/** Average colour of a thin strip just outside a box, used as patch fill. */
async function sampleBackground(buf, W, H, box) {
  const pad = Math.max(4, Math.round(box.height * 0.35));
  const probes = [
    { left: box.left, top: Math.max(0, box.top - pad), width: box.width, height: Math.min(pad, box.top) },
    { left: box.left, top: Math.min(H - 1, box.top + box.height), width: box.width, height: Math.min(pad, H - (box.top + box.height)) },
    { left: Math.max(0, box.left - pad), top: box.top, width: Math.min(pad, box.left), height: box.height },
  ].filter(p => p.width > 1 && p.height > 1);

  let best = null;
  for (const p of probes) {
    const st = await sharp(buf).extract(p).stats();
    // Prefer the flattest probe: the one with the least channel variance is
    // almost always genuine background rather than adjacent interface.
    const spread = st.channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0);
    if (!best || spread < best.spread) {
      best = { spread, rgb: st.channels.slice(0, 3).map(c => Math.round(c.mean)) };
    }
  }
  return best ? best.rgb : [12, 16, 32];
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function applyOps(srcPath, ops, W, H) {
  let buf = await sharp(srcPath).toBuffer();
  for (const op of ops) {
    const box = fracToPx(op.frac, W, H);
    if (op.kind === 'blur') {
      const region = await sharp(buf)
        .extract(box)
        .blur(op.sigma || Math.max(8, box.height / 3))
        .modulate({ brightness: op.brightness || 0.94 })
        .toBuffer();
      buf = await sharp(buf).composite([{ input: region, left: box.left, top: box.top }]).toBuffer();
      continue;
    }
    if (op.kind === 'dim') {
      const scrim = Buffer.from(
        `<svg width="${box.width}" height="${box.height}"><rect width="100%" height="100%" fill="rgba(5,7,14,${op.alpha ?? 0.55})"/></svg>`
      );
      buf = await sharp(buf).composite([{ input: scrim, left: box.left, top: box.top }]).toBuffer();
      continue;
    }
    // redact + text both start with a background-matched patch
    const rgb = op.fill || (await sampleBackground(buf, W, H, box));
    const radius = op.radius ?? 0;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}">`
      + `<rect x="0" y="0" width="${box.width}" height="${box.height}" rx="${radius}" ry="${radius}" fill="rgb(${rgb[0]},${rgb[1]},${rgb[2]})"/>`;
    if (op.kind === 'text') {
      const size = op.size ? Math.round(op.size * H) : Math.round(box.height * 0.62);
      const weight = op.weight || 600;
      const colour = op.colour || '#E8EEFB';
      const anchor = op.align === 'center' ? 'middle' : op.align === 'right' ? 'end' : 'start';
      const x = anchor === 'middle' ? box.width / 2 : anchor === 'end' ? box.width - 2 : 2;
      const y = Math.round(box.height * 0.5 + size * 0.36);
      svg += `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter, 'Segoe UI', Arial, sans-serif"`
        + ` font-size="${size}" font-weight="${weight}" fill="${colour}"`
        + (op.letterSpacing ? ` letter-spacing="${op.letterSpacing}"` : '')
        + `>${esc(op.text)}</text>`;
    }
    svg += `</svg>`;
    buf = await sharp(buf)
      .composite([{ input: Buffer.from(svg), left: box.left, top: box.top }])
      .toBuffer();
  }
  return buf;
}

async function run() {
  const recipePath = process.argv[2];
  if (!recipePath) {
    console.error('usage: node .dev-tools/shot-forge.cjs <recipe.json> [--only a,b] [--dry]');
    process.exit(1);
  }
  const only = (process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
  const onlySet = only ? new Set(only.split(',')) : null;
  const dry = process.argv.includes('--dry');

  const recipe = JSON.parse(fs.readFileSync(recipePath, 'utf8'));
  const srcDir = path.resolve(ROOT, recipe.sourceDir);
  const outDir = path.resolve(ROOT, recipe.outDir);
  if (!dry) fs.mkdirSync(outDir, { recursive: true });

  const report = [];
  for (const item of recipe.items) {
    if (onlySet && !onlySet.has(item.out)) continue;
    const srcPath = path.join(srcDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.error(`MISSING SOURCE: ${item.out} -> ${item.src}`);
      report.push({ out: item.out, ok: false, why: 'source missing' });
      continue;
    }
    const meta = await sharp(srcPath).metadata();
    const W = meta.width, H = meta.height;

    let buf = await applyOps(srcPath, item.ops || [], W, H);

    if (item.crop) {
      const box = fracToPx(item.crop, W, H);
      buf = await sharp(buf).extract(box).toBuffer();
    }
    let pipe = sharp(buf);
    if (item.width) {
      pipe = pipe.resize({ width: item.width, withoutEnlargement: true, kernel: 'lanczos3' });
    }
    const base = path.join(outDir, item.out);
    const finalBuf = await pipe.toBuffer();
    const fm = await sharp(finalBuf).metadata();

    if (dry) {
      console.log(`DRY ${item.out}  ${W}x${H} -> ${fm.width}x${fm.height}  ops=${(item.ops || []).length}`);
      report.push({ out: item.out, ok: true, w: fm.width, h: fm.height, ops: (item.ops || []).length });
      continue;
    }
    await sharp(finalBuf).png({ compressionLevel: 9 }).toFile(`${base}.png`);
    await sharp(finalBuf).webp({ quality: 88, effort: 6 }).toFile(`${base}.webp`);
    await sharp(finalBuf).avif({ quality: 62, effort: 6 }).toFile(`${base}.avif`);
    const sz = f => (fs.statSync(`${base}.${f}`).size / 1024).toFixed(0) + 'KB';
    console.log(`OK  ${item.out}  ${fm.width}x${fm.height}  png ${sz('png')}  webp ${sz('webp')}  avif ${sz('avif')}  ops=${(item.ops || []).length}`);
    report.push({ out: item.out, ok: true, w: fm.width, h: fm.height, ops: (item.ops || []).length });
  }

  const failed = report.filter(r => !r.ok);
  console.log(`\n${report.length - failed.length}/${report.length} frames forged.`);
  if (failed.length) {
    console.error('FAILED:', failed.map(f => f.out).join(', '));
    process.exit(1);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
