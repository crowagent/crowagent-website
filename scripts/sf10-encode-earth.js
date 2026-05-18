#!/usr/bin/env node
// SF10 — Encode NASA Blue Marble (10800x10800) to web-ready hero variants.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.resolve(__dirname, '..', 'Assets', 'photos', 'hero-earth-cinematic-raw.jpg');
const OUT_DIR = path.resolve(__dirname, '..', 'Assets', 'photos');

const VARIANTS = [
  { size: 3840, suffix: '3840', webpQ: 80, avifQ: 60, jpgQ: 82 },
  { size: 1920, suffix: '1920', webpQ: 82, avifQ: 62, jpgQ: 84 },
  { size: 960,  suffix: '960',  webpQ: 84, avifQ: 64, jpgQ: 86 },
];

const start = Date.now();

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error('Missing source:', SRC);
    process.exit(1);
  }
  for (const v of VARIANTS) {
    const base = sharp(SRC).resize(v.size, v.size, { kernel: 'lanczos3' });
    const webpPath = path.join(OUT_DIR, `hero-earth-cinematic-${v.suffix}.webp`);
    const avifPath = path.join(OUT_DIR, `hero-earth-cinematic-${v.suffix}.avif`);
    const jpgPath  = path.join(OUT_DIR, `hero-earth-cinematic-${v.suffix}.jpg`);
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
