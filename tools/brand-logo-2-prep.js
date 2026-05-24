// Brand Logo 2.0 — Apple/Stripe/Google-grade asset preparation.
// Source: marketing-screenshots/brand logo 2.0.png (1024×1024, dark navy bg)
// Output:
//   1. brand-logo-2-dark.png      — original (for dark backgrounds)
//   2. brand-logo-2-dark.webp     — WebP same dimensions, smaller
//   3. brand-logo-2-dark.avif     — AVIF smallest
//   4. brand-logo-2-trans.png     — transparent background (chroma-key removed navy)
//   5. brand-logo-2-trans.webp
//   6. brand-logo-2-trans.avif
// Tight-cropped to the visible logo bounds (removes most of the navy padding).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.resolve('C:/Users/bhave/Crowagent Repo/marketing-screenshots/brand logo 2.0.png');
const OUT_DIR = path.resolve('Assets/brand');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('Source:', SRC);
  const meta = await sharp(SRC).metadata();
  console.log(`Source: ${meta.width}×${meta.height} ${meta.format} ${meta.channels}ch`);

  // Step 1: detect content bounds (trim near-uniform background)
  const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
  const tmeta = await sharp(trimmed).metadata();
  console.log(`Trimmed: ${tmeta.width}×${tmeta.height}`);

  // Step 2: dark variant — keep navy background, write all 3 formats
  await sharp(trimmed).png({ quality: 95, compressionLevel: 9 }).toFile(path.join(OUT_DIR, 'crowagent-logo-2-dark.png'));
  await sharp(trimmed).webp({ quality: 90 }).toFile(path.join(OUT_DIR, 'crowagent-logo-2-dark.webp'));
  await sharp(trimmed).avif({ quality: 70, effort: 6 }).toFile(path.join(OUT_DIR, 'crowagent-logo-2-dark.avif'));

  // Step 3: transparent variant — chroma-key out the navy ~#0A1F3A background
  // Strategy: extract alpha based on color distance from navy
  const { data, info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const navyR = 10, navyG = 31, navyB = 58;
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    // Distance from navy (Euclidean in RGB)
    const dist = Math.sqrt((r - navyR) ** 2 + (g - navyG) ** 2 + (b - navyB) ** 2);
    // Within 30 of navy → fully transparent
    if (dist < 30) alpha[i] = 0;
    else if (dist < 80) alpha[i] = Math.round((dist - 30) * 255 / 50);
    else alpha[i] = 255;
  }
  // Reassemble RGBA buffer
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    rgba[i * 4]     = data[i * channels];
    rgba[i * 4 + 1] = data[i * channels + 1];
    rgba[i * 4 + 2] = data[i * channels + 2];
    rgba[i * 4 + 3] = alpha[i];
  }
  const trans = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  await sharp(trans).png({ quality: 95, compressionLevel: 9 }).toFile(path.join(OUT_DIR, 'crowagent-logo-2-trans.png'));
  await sharp(trans).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT_DIR, 'crowagent-logo-2-trans.webp'));
  await sharp(trans).avif({ quality: 70, effort: 6 }).toFile(path.join(OUT_DIR, 'crowagent-logo-2-trans.avif'));

  console.log('\nGenerated:');
  for (const f of fs.readdirSync(OUT_DIR).filter(f => f.startsWith('crowagent-logo-2'))) {
    const stat = fs.statSync(path.join(OUT_DIR, f));
    console.log(`  ${f}: ${(stat.size / 1024).toFixed(1)} KB`);
  }
})();
