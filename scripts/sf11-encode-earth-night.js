#!/usr/bin/env node
// SF11 — Encode NASA Black Marble Europe-at-Night (4960x4000) to web variants.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.resolve(__dirname, '..', 'Assets', 'photos', 'hero-earth-night-raw.png');
const OUT_DIR = path.resolve(__dirname, '..', 'Assets', 'photos');

const VARIANTS = [
  { w: 3840, h: 3096, suffix: '3840', webpQ: 80, avifQ: 58, jpgQ: 82 },
  { w: 1920, h: 1548, suffix: '1920', webpQ: 82, avifQ: 60, jpgQ: 84 },
  { w: 960,  h: 774,  suffix: '960',  webpQ: 84, avifQ: 62, jpgQ: 86 },
];

const start = Date.now();

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error('Missing source:', SRC);
    process.exit(1);
  }
  const meta = await sharp(SRC).metadata();
  console.log('source:', meta.width, 'x', meta.height, meta.format);
  for (const v of VARIANTS) {
    const base = sharp(SRC).resize(v.w, v.h, { kernel: 'lanczos3', fit: 'cover' });
    const webpPath = path.join(OUT_DIR, `hero-earth-night-${v.suffix}.webp`);
    const avifPath = path.join(OUT_DIR, `hero-earth-night-${v.suffix}.avif`);
    const jpgPath  = path.join(OUT_DIR, `hero-earth-night-${v.suffix}.jpg`);
    await base.clone().webp({ quality: v.webpQ, effort: 5 }).toFile(webpPath);
    await base.clone().avif({ quality: v.avifQ, effort: 5 }).toFile(avifPath);
    await base.clone().jpeg({ quality: v.jpgQ, mozjpeg: true, progressive: true }).toFile(jpgPath);
    const w = fs.statSync(webpPath).size;
    const a = fs.statSync(avifPath).size;
    const j = fs.statSync(jpgPath).size;
    console.log(`${v.suffix}px  webp=${(w/1024).toFixed(0)}K  avif=${(a/1024).toFixed(0)}K  jpg=${(j/1024).toFixed(0)}K`);
  }
  console.log(`done in ${((Date.now() - start)/1000).toFixed(1)}s`);
})().catch(e => { console.error(e); process.exit(1); });
