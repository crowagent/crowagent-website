#!/usr/bin/env node
/**
 * gen-brand-pack.mjs — regenerate the canonical CrowAgent branding pack from the
 * ONE in-use mark (the 4-bar mark shared by CrowAgentLogo.tsx + favicon.svg) and
 * propagate it to every place a stale logo raster lived.
 *
 * WHY (owner 2026-07-19): the `logo.png` lockups across web / portal / internal /
 * the branding pack still showed the RETIRED green "crow-network" mark, and the
 * OG image still carried the retired "Sustainability Intelligence" tagline + globe.
 * The current brand is: the 4-bar mark + the "CrowAgent" wordmark, NO TAGLINE.
 *
 * Mark artwork is inlined here verbatim from crowagent-website/Assets/logo/
 * crowagent-mark.svg (viewBox 0 0 64 64) so this generator is self-contained and
 * is itself the source of truth. Wordmark = Plus Jakarta Sans ExtraBold (the
 * brand display face), rasterised via @resvg/resvg-js with the real font file so
 * the type is exact and resolution-independent (no system-font gamble).
 *
 * Usage:  cd crowagent-website && node scripts/gen-brand-pack.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..'); // C:\Users\bhave\Crowagent Repo
const FONT = resolve(__dirname, '_brand-assets', 'PlusJakartaSans-800.ttf');
const PACK = resolve(__dirname, '_brand-assets', 'out');
mkdirSync(PACK, { recursive: true });

// ── Brand palette (canonical) ────────────────────────────────────────────────
const CLOUD = '#E8F0FA'; // wordmark on dark surfaces
const NAVY = '#0A1F3A';  // wordmark on light surfaces

// ── The canonical 4-bar mark — inner markup (no outer <svg>) ─────────────────
const MARK_INNER = `
  <defs>
    <linearGradient id="caBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="caTeal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
    <filter id="caShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-color="#0b1220" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="#FCFDFF" stroke="rgba(15,23,42,.20)" stroke-width="1.5" filter="url(#caShadow)"/>
  <rect x="15" y="48.4" width="34" height="1.2" rx="0.6" fill="#94a3b8" opacity="0.35"/>
  <rect x="15" y="34.72" width="6" height="14.28" rx="2" fill="url(#caBlue)"/>
  <rect x="24.33" y="28.6" width="6" height="20.4" rx="2" fill="url(#caBlue)"/>
  <rect x="33.67" y="22.48" width="6" height="26.52" rx="2" fill="url(#caTeal)"/>
  <rect x="43" y="15" width="6" height="34" rx="2" fill="url(#caTeal)"/>`;

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="CrowAgent"><title>CrowAgent</title>${MARK_INNER}</svg>`;

// ── Lockup (mark + "CrowAgent" wordmark), transparent, tagline-free ──────────
function lockupSvg(wordColor) {
  const H = 176, MARK = 120, PAD = 28, GAP = 26, FS = 88, W = 780;
  const markY = (H - MARK) / 2;
  const textX = PAD + MARK + GAP;
  const baseline = Math.round(H / 2 + FS * 0.34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <svg x="${PAD}" y="${markY}" width="${MARK}" height="${MARK}" viewBox="0 0 64 64">${MARK_INNER}</svg>
    <text x="${textX}" y="${baseline}" font-family="Plus Jakarta Sans ExtraBold" font-size="${FS}" letter-spacing="-3.5" fill="${wordColor}">CrowAgent</text>
  </svg>`;
}

// ── Open-Graph card (1200×630), brand navy, centred lockup, NO tagline ───────
function ogSvg() {
  const W = 1200, H = 630, MARK = 168, GAP = 34, FS = 128;
  const cy = H / 2;
  const textW = 640; // measured "CrowAgent" @128 ExtraBold ≈ 636px
  const groupW = MARK + GAP + textW;
  const x0 = Math.round((W - groupW) / 2);
  const markY = Math.round(cy - MARK / 2);
  const textX = x0 + MARK + GAP;
  const baseline = Math.round(cy + FS * 0.34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><radialGradient id="ogbg" cx="50%" cy="34%" r="75%">
      <stop offset="0" stop-color="#12315c"/><stop offset="1" stop-color="#0A1F3A"/>
    </radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#ogbg)"/>
    <svg x="${x0}" y="${markY}" width="${MARK}" height="${MARK}" viewBox="0 0 64 64">${MARK_INNER}</svg>
    <text x="${textX}" y="${baseline}" font-family="Plus Jakarta Sans ExtraBold" font-size="${FS}" letter-spacing="-5" fill="${CLOUD}">CrowAgent</text>
  </svg>`;
}

function renderPng(svg, { width } = {}) {
  const r = new Resvg(svg, {
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'Plus Jakarta Sans ExtraBold' },
    background: 'rgba(0,0,0,0)',
    ...(width ? { fitTo: { mode: 'width', value: width } } : {}),
  });
  return r.render().asPng();
}

// A lockup PNG, tightly + evenly cropped, at the requested output width.
async function lockupPng(wordColor, outWidth) {
  const raw = renderPng(lockupSvg(wordColor), { width: Math.round(outWidth * 1.1) });
  const img = sharp(raw).trim({ threshold: 6 });
  const meta = await img.metadata();
  const pad = Math.round((meta.height ?? 100) * 0.16);
  return sharp(await img.extend({ top: pad, bottom: pad, left: pad, right: pad,
    background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer())
    .resize({ width: outWidth })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// A mark PNG (square, transparent) at `size`, via sharp (keeps the soft shadow).
function markPng(size) {
  return sharp(Buffer.from(MARK_SVG), { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function write(path, buf) {
  const abs = resolve(REPO, path);
  if (!existsSync(dirname(abs))) { console.log(`· skip (no dir): ${path}`); return false; }
  writeFileSync(abs, buf);
  console.log(`✓ ${path} (${buf.length} bytes)`);
  return true;
}

const main = async () => {
  // 1. Canonical pack masters.
  const lockDark = await lockupPng(CLOUD, 1200);
  const lockLight = await lockupPng(NAVY, 1200);
  const lockDark2x = await lockupPng(CLOUD, 2400);
  const og = renderPng(ogSvg());
  writeFileSync(resolve(PACK, 'lockup-dark.png'), lockDark);
  writeFileSync(resolve(PACK, 'lockup-light.png'), lockLight);
  writeFileSync(resolve(PACK, 'lockup-dark@2x.png'), lockDark2x);
  writeFileSync(resolve(PACK, 'mark-512.png'), await markPng(512));
  writeFileSync(resolve(PACK, 'og-1200x630.png'), og);
  writeFileSync(resolve(PACK, 'crowagent-mark.svg'), MARK_SVG);
  writeFileSync(resolve(PACK, 'crowagent-lockup-dark.svg'), lockupSvg(CLOUD));
  writeFileSync(resolve(PACK, 'crowagent-lockup-light.svg'), lockupSvg(NAVY));
  console.log('— pack masters written to', PACK, '—');

  // 2. Propagate the DARK lockup to every stale logo.png (all used on dark UIs).
  const darkTargets = [
    'crowagent-platform/web/public/logo.png',
    'crowagent-platform/apps/portal/public/logo.png',
    'crowagent-platform/apps/portal/public/brand/crowagent-logo-2-dark.png',
    'crowagent-internal/public/logo.png',
    'crowagent-branding/branding-portal/assets/crowagent_logo.png',
    'crowagent-branding/branding-portal/backend/static/images/crowagent_logo.png',
    'crowagent-branding/branding-portal/backend/static/images/crowagent_logo1.png',
    'Crowagent-Core/assets/logo.png',
  ];
  for (const t of darkTargets) write(t, lockDark);

  // portal webp sibling of the dark lockup.
  const webp = await sharp(lockDark).webp({ quality: 92 }).toBuffer();
  write('crowagent-platform/apps/portal/public/brand/crowagent-logo-2-dark.webp', webp);

  // 3. OG images (tagline removed) — website + nebula + platform.
  const ogTargets = [
    'crowagent-website/Assets/brand/og-brand-1200x630.png',
    'crowagent-nebula/Assets/brand/og-brand-1200x630.png',
    'crowagent-website/Assets/og/og-image.png',
    'crowagent-website/Assets/og-image.png',
  ];
  for (const t of ogTargets) write(t, og);

  // 4. Canonical SVG sources refreshed alongside the marks.
  write('crowagent-website/Assets/logo/crowagent-lockup-dark.svg', Buffer.from(lockupSvg(CLOUD)));
  write('crowagent-website/Assets/logo/crowagent-lockup-light.svg', Buffer.from(lockupSvg(NAVY)));

  console.log('\nDone.');
};

main().catch((e) => { console.error(e); process.exit(1); });
