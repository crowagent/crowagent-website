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
    { left: Math.min(W - 1, box.left + box.width), top: box.top, width: Math.min(pad, W - (box.left + box.width)), height: box.height },
  ].filter(p => p.width > 1 && p.height > 1);

  let best = null;
  for (const p of probes) {
    // sharp ignores a pending extract when stats() is called on the same
    // instance and reports the WHOLE image, which silently made every sampled
    // fill the average of the entire screenshot. Materialise the crop first.
    const st = await sharp(await sharp(buf).extract(p).toBuffer()).stats();
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

async function applyOps(srcPath, ops, W, H, hue) {
  let buf = await sharp(srcPath).toBuffer();
  if (hue) {
    // Whole-image hue rotation, applied BEFORE any op so masks land on the
    // recoloured pixels. This exists for one measured reason: some product
    // surfaces use a success green (#1a8e52 on the bid/no-bid bars, #1c7358 on
    // its pills) that sits outside the frozen palette. A small rotation walks
    // those greens into the teal end of our ramp while leaving the teals,
    // violets and pinks inside it, rather than repainting each element by hand.
    buf = await sharp(buf).modulate({ hue }).toBuffer();
  }
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
    if (op.kind === 'clone') {
      // A flat averaged patch is visible against any surface that carries a
      // gradient, a hairline or a card edge — and every one of these captures
      // does. Cloning a same-sized region of genuinely empty background is the
      // only fill that disappears. `from` is the top-left of the source region.
      const src = {
        left: Math.round(op.from[0] * W),
        top: Math.round(op.from[1] * H),
        width: box.width,
        height: box.height,
      };
      if (src.left + src.width > W || src.top + src.height > H || src.left < 0 || src.top < 0) {
        throw new Error(`clone source out of bounds for frac ${JSON.stringify(op.frac)}`);
      }
      const region = await sharp(buf).extract(src).toBuffer();
      buf = await sharp(buf).composite([{ input: region, left: box.left, top: box.top }]).toBuffer();
      continue;
    }
    if (op.kind === 'smear') {
      // The best fill for a box on a non-flat surface. Takes a thin strip of the
      // adjacent background and stretches it across the box, so whatever
      // gradient, glow or vignette runs through that part of the screen carries
      // straight through the patch. A flat averaged colour cannot do this: every
      // one of these captures has a radial glow behind the workspace, and a flat
      // rectangle reads as a lighter block against it.
      const k = op.strip || 6;
      const dir = op.dir || 'up';
      let src;
      if (dir === 'up') src = { left: box.left, top: Math.max(0, box.top - k), width: box.width, height: k };
      else if (dir === 'down') src = { left: box.left, top: Math.min(H - k, box.top + box.height), width: box.width, height: k };
      else if (dir === 'left') src = { left: Math.max(0, box.left - k), top: box.top, width: k, height: box.height };
      else src = { left: Math.min(W - k, box.left + box.width), top: box.top, width: k, height: box.height };
      const strip = await sharp(buf).extract(src).toBuffer();
      const filled = await sharp(strip)
        .resize({ width: box.width, height: box.height, fit: 'fill' })
        .toBuffer();
      buf = await sharp(buf).composite([{ input: filled, left: box.left, top: box.top }]).toBuffer();
      continue;
    }
    if (op.kind === 'dim') {
      const scrim = Buffer.from(
        `<svg width="${box.width}" height="${box.height}"><rect width="100%" height="100%" fill="rgba(5,7,14,${op.alpha ?? 0.55})"/></svg>`
      );
      buf = await sharp(buf).composite([{ input: scrim, left: box.left, top: box.top }]).toBuffer();
      continue;
    }
    // redact + text both start by clearing the box. When `from` is supplied the
    // clear is a clone of real background, which beats a flat average anywhere
    // the surface is not perfectly uniform.
    if (op.from) {
      const src = { left: Math.round(op.from[0] * W), top: Math.round(op.from[1] * H), width: box.width, height: box.height };
      const region = await sharp(buf).extract(src).toBuffer();
      buf = await sharp(buf).composite([{ input: region, left: box.left, top: box.top }]).toBuffer();
    } else if (op.dir) {
      // Same smear fill as the standalone op, so a text repaint can sit on a
      // gradient-correct background instead of a flat rectangle.
      const k = op.strip || 6;
      const d = op.dir;
      let src;
      if (d === 'up') src = { left: box.left, top: Math.max(0, box.top - k), width: box.width, height: k };
      else if (d === 'down') src = { left: box.left, top: Math.min(H - k, box.top + box.height), width: box.width, height: k };
      else if (d === 'left') src = { left: Math.max(0, box.left - k), top: box.top, width: k, height: box.height };
      else src = { left: Math.min(W - k, box.left + box.width), top: box.top, width: k, height: box.height };
      const strip = await sharp(buf).extract(src).toBuffer();
      const filled = await sharp(strip).resize({ width: box.width, height: box.height, fit: 'fill' }).toBuffer();
      buf = await sharp(buf).composite([{ input: filled, left: box.left, top: box.top }]).toBuffer();
    }
    const radius = op.radius ?? 0;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}">`;
    if (!op.from && !op.dir) {
      // `sampleAt` names a point of known-empty background to take the fill from.
      // Automatic probing guesses from the four sides of the box and picks the
      // flattest, which is wrong whenever the box is hemmed in by interface on
      // every side — which, on a dense product screen, is most of the time.
      let rgb = op.fill;
      if (!rgb && op.sampleAt) {
        const s = Math.max(3, Math.round(Math.min(W, H) * 0.006));
        const patch = await sharp(buf).extract({
          left: Math.min(W - s, Math.max(0, Math.round(op.sampleAt[0] * W))),
          top: Math.min(H - s, Math.max(0, Math.round(op.sampleAt[1] * H))),
          width: s, height: s,
        }).toBuffer();
        const st = await sharp(patch).stats();
        rgb = st.channels.slice(0, 3).map(c => Math.round(c.mean));
      }
      if (!rgb) rgb = await sampleBackground(buf, W, H, box);
      svg += `<rect x="0" y="0" width="${box.width}" height="${box.height}" rx="${radius}" ry="${radius}" fill="rgb(${rgb[0]},${rgb[1]},${rgb[2]})"/>`;
    }
    if (op.kind === 'text') {
      const size = op.size ? Math.round(op.size * H) : Math.round(box.height * 0.62);
      const weight = op.weight || 600;
      const colour = op.colour || '#E8EEFB';
      const anchor = op.align === 'center' ? 'middle' : op.align === 'right' ? 'end' : 'start';
      const x = anchor === 'middle' ? box.width / 2 : anchor === 'end' ? box.width - 2 : 2;
      const lines = op.lines || [op.text];
      const lh = Math.round(size * (op.lineHeight || 1.5));
      const blockH = lh * lines.length;
      const top = Math.round((box.height - blockH) / 2 + size * 0.82);
      lines.forEach((ln, i) => {
        svg += `<text x="${x}" y="${top + i * lh}" text-anchor="${anchor}" font-family="Inter, 'Segoe UI', Arial, sans-serif"`
          + ` font-size="${size}" font-weight="${weight}" fill="${colour}"`
          + (op.letterSpacing ? ` letter-spacing="${op.letterSpacing}"` : '')
          + `>${esc(ln)}</text>`;
      });
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

    let buf = await applyOps(srcPath, item.ops || [], W, H, item.hue);

    if (item.crop) {
      const box = fracToPx(item.crop, W, H);
      buf = await sharp(buf).extract(box).toBuffer();
    }
    let pipe = sharp(buf);
    if (item.fitTo) {
      // Every frame in a cross-fading set MUST come out at the same pixel size.
      // The hero box has one aspect ratio; feeding it captures at 1.911, 2.184
      // and 2.203 made the composition jump on every swap and left the simulated
      // cursor pointing at empty space, because a percentage of the box stopped
      // being a percentage of the painted image. `cover` crops to the target
      // aspect rather than letterboxing, and the anchor keeps the app's own
      // top-left chrome in frame.
      pipe = pipe.resize({
        width: item.fitTo[0],
        height: item.fitTo[1],
        fit: 'cover',
        position: item.fitAnchor || 'left top',
        kernel: 'lanczos3',
      });
    } else if (item.width) {
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
