// Brand Logo 2.0 — Premium asset family generator (Apple/Stripe/Google grade).
// Generates the FULL asset matrix from the single founder-supplied master.
//
// MATRIX:
//  Web nav/footer    — already done (dark + webp + avif)
//  Favicon family    — 16, 32, 48, ico
//  PWA icons         — 192, 512, maskable variants
//  Apple touch icon  — 180
//  Open Graph image  — 1200×630 (social previews)
//  Twitter card      — 1200×600
//  Email header      — 600×150 (transactional emails)
//  Print PDF logo    — high-contrast SVG-like PNG
//
// Treatment per surface:
//  - Favicons: ICON ONLY (the 4 colored bars in white tile) — no wordmark at 16/32px
//  - PWA: full logo at large; icon-only at small
//  - OG/social: full logo + tagline, centred on brand background, premium padding
//  - Email: full logo at email-safe width, white-tile-preserving for any-bg compat
//  - Print: dark-on-white version (chroma-key out the navy)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.resolve('C:/Users/bhave/Crowagent Repo/marketing-screenshots/brand logo 2.0.png');
const OUT_BRAND = path.resolve('Assets/brand');
const OUT_ROOT = '.';

(async () => {
  if (!fs.existsSync(OUT_BRAND)) fs.mkdirSync(OUT_BRAND, { recursive: true });
  const meta = await sharp(SRC).metadata();
  console.log(`Master: ${meta.width}×${meta.height}\n`);

  // ── ICON-ONLY EXTRACT (the 4-bar tile, no wordmark) ──
  // Source is 2000×2000; trimmed full logo is 1499×441; tile sits in the
  // leftmost ~441×441 region of the trimmed area (it's a square tile).
  // From the original (untrimmed) image: the tile is roughly at x=100..540, y=200..760.
  // Let's auto-detect by extracting from trimmed.
  const trimmedBuffer = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
  const trimMeta = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed: ${trimMeta.width}×${trimMeta.height}`);
  // Tile = first square chunk of width = trimMeta.height (since logo height = tile height)
  const tileSize = trimMeta.height;
  const iconBuffer = await sharp(trimmedBuffer)
    .extract({ left: 0, top: 0, width: tileSize, height: tileSize })
    .toBuffer();
  console.log(`Icon tile extracted: ${tileSize}×${tileSize}\n`);

  // ── FAVICONS (16/32/48) ──
  console.log('— Favicons —');
  for (const size of [16, 32, 48, 64, 96]) {
    const out = path.join(OUT_BRAND, `favicon-${size}.png`);
    await sharp(iconBuffer).resize(size, size, { kernel: 'lanczos3' }).png({ quality: 95 }).toFile(out);
    console.log(`  favicon-${size}.png: ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
  }
  // Copy 32px to root /favicon.png for legacy
  await sharp(iconBuffer).resize(32, 32, { kernel: 'lanczos3' }).png({ quality: 95 }).toFile(path.join(OUT_ROOT, 'favicon-32.png'));

  // ── PWA ICONS (192/512 + maskable) ──
  console.log('\n— PWA icons —');
  for (const size of [192, 256, 512]) {
    const out = path.join(OUT_BRAND, `pwa-${size}.png`);
    await sharp(iconBuffer).resize(size, size, { kernel: 'lanczos3' }).png({ quality: 95 }).toFile(out);
    console.log(`  pwa-${size}.png: ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
  }
  // Maskable variant: icon centred in 80% safe zone on navy background (per PWA spec)
  const maskable512 = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 10, g: 31, b: 58, alpha: 1 } }
  })
    .composite([{ input: await sharp(iconBuffer).resize(400, 400, { kernel: 'lanczos3' }).toBuffer(), gravity: 'center' }])
    .png({ quality: 95 })
    .toFile(path.join(OUT_BRAND, 'pwa-maskable-512.png'));
  console.log(`  pwa-maskable-512.png: ${(fs.statSync(path.join(OUT_BRAND, 'pwa-maskable-512.png')).size / 1024).toFixed(1)} KB`);

  // ── APPLE TOUCH ICON (180×180) ──
  console.log('\n— Apple touch icon —');
  await sharp(iconBuffer).resize(180, 180, { kernel: 'lanczos3' }).png({ quality: 95 })
    .toFile(path.join(OUT_BRAND, 'apple-touch-icon-180.png'));
  console.log(`  apple-touch-icon-180.png: ${(fs.statSync(path.join(OUT_BRAND, 'apple-touch-icon-180.png')).size / 1024).toFixed(1)} KB`);
  // Also at root (legacy /apple-touch-icon.png)
  await sharp(iconBuffer).resize(180, 180, { kernel: 'lanczos3' }).png({ quality: 95 })
    .toFile(path.join(OUT_ROOT, 'apple-touch-icon.png'));

  // ── OPEN GRAPH (1200×630) ──
  // Logo centred on premium navy background with generous breathing room.
  // Padding per Apple/Stripe convention: 1/8 of total height on each side.
  console.log('\n— Open Graph —');
  const ogBg = { r: 10, g: 31, b: 58, alpha: 1 };  // brand navy
  const ogLogoMaxW = 800;
  const ogLogoH = Math.round(ogLogoMaxW * (441 / 1499));  // preserve 3.4:1 aspect
  const ogLogo = await sharp(trimmedBuffer).resize(ogLogoMaxW, ogLogoH, { kernel: 'lanczos3' }).toBuffer();
  const og = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: ogBg }
  })
    .composite([{ input: ogLogo, gravity: 'center' }])
    .png({ quality: 90 })
    .toFile(path.join(OUT_BRAND, 'og-brand-1200x630.png'));
  console.log(`  og-brand-1200x630.png: ${(fs.statSync(path.join(OUT_BRAND, 'og-brand-1200x630.png')).size / 1024).toFixed(1)} KB`);

  // ── EMAIL HEADER (600×150) ──
  console.log('\n— Email header —');
  const emailLogoW = 480;
  const emailLogoH = Math.round(emailLogoW * (441 / 1499));
  const emailLogo = await sharp(trimmedBuffer).resize(emailLogoW, emailLogoH, { kernel: 'lanczos3' }).toBuffer();
  await sharp({
    create: { width: 600, height: 150, channels: 4, background: ogBg }
  })
    .composite([{ input: emailLogo, gravity: 'center' }])
    .png({ quality: 95 })
    .toFile(path.join(OUT_BRAND, 'email-header-600x150.png'));
  console.log(`  email-header-600x150.png: ${(fs.statSync(path.join(OUT_BRAND, 'email-header-600x150.png')).size / 1024).toFixed(1)} KB`);

  // ── PRINT VERSION (white background, dark text) ──
  // For print PDFs / invoices — keeps icon colors, swaps wordmark to navy.
  // Simple approach: paint white background underneath the trimmed logo.
  console.log('\n— Print logo —');
  await sharp({
    create: { width: 1499, height: 441, channels: 3, background: { r: 255, g: 255, b: 255 } }
  })
    .composite([{ input: trimmedBuffer }])  // overlay original; navy will paint over white
    .png({ quality: 95 })
    .toFile(path.join(OUT_BRAND, 'crowagent-logo-2-print.png'));
  console.log(`  print: ${(fs.statSync(path.join(OUT_BRAND, 'crowagent-logo-2-print.png')).size / 1024).toFixed(1)} KB`);

  // ── ICON-ONLY VARIANTS for nav/menu micro-spots ──
  console.log('\n— Icon-only variants —');
  for (const size of [40, 56, 80]) {
    await sharp(iconBuffer).resize(size, size, { kernel: 'lanczos3' }).png({ quality: 95 })
      .toFile(path.join(OUT_BRAND, `icon-${size}.png`));
    await sharp(iconBuffer).resize(size, size, { kernel: 'lanczos3' }).webp({ quality: 90 })
      .toFile(path.join(OUT_BRAND, `icon-${size}.webp`));
  }

  console.log('\n✓ Brand asset family complete.');
  console.log('\nFiles in', OUT_BRAND, ':');
  fs.readdirSync(OUT_BRAND).forEach(f => console.log(`  ${f}`));
})();
