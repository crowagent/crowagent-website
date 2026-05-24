/* ISSUE-017 + ISSUE-036 (Cluster Gamma 2026-05-22) — logo asset family.
 *
 * The canonical logo master is 1499×441px (3.4:1 aspect). It is rendered
 * at 136×40px nav / 116×34px footer — a ~10× linear oversize. This script
 * generates AVIF + WebP variants at the actual display sizes:
 *   272×80  → 1x asset for nav (136×40 CSS pixels)
 *   544×160 → 2x retina asset for nav
 *   232×68  → 1x asset for footer (116×34 CSS pixels)
 *   464×136 → 2x retina asset for footer
 *
 * Output paths under Assets/brand/. Filenames keep the canonical
 * `crowagent-logo-2-dark` prefix so the nav-inject change is a single
 * srcset edit (no rename of the master).
 *
 * AVIF quality 60 (sharp's effort 4) keeps each variant well under 6KB —
 * meaningful saving over the 19394-byte master.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.resolve(__dirname, '../Assets/brand/crowagent-logo-2-dark.png');
const OUT_DIR = path.resolve(__dirname, '../Assets/brand');

const VARIANTS = [
  { w: 272, h: 80, label: 'nav-1x' },
  { w: 544, h: 160, label: 'nav-2x' },
  { w: 232, h: 68, label: 'footer-1x' },
  { w: 464, h: 136, label: 'footer-2x' }
];

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error('Source logo missing:', SRC);
    process.exit(1);
  }
  const meta = await sharp(SRC).metadata();
  console.log(`Source: ${meta.width}×${meta.height} (${meta.format}, ${meta.size || 'unknown'} bytes)`);

  for (const v of VARIANTS) {
    const base = `crowagent-logo-2-dark-${v.w}`;
    const avifOut = path.join(OUT_DIR, `${base}.avif`);
    const webpOut = path.join(OUT_DIR, `${base}.webp`);

    /* Resize within the variant's width — sharp preserves aspect ratio.
       fit:'contain' with background:transparent prevents up-scaling artefacts. */
    const pipe = sharp(SRC).resize({
      width: v.w,
      withoutEnlargement: true,
      kernel: 'lanczos3'
    });

    await pipe.clone().avif({ quality: 60, effort: 4 }).toFile(avifOut);
    await pipe.clone().webp({ quality: 80, effort: 5 }).toFile(webpOut);

    const avifBytes = fs.statSync(avifOut).size;
    const webpBytes = fs.statSync(webpOut).size;
    console.log(`  ${v.label} ${v.w}× → ${path.basename(avifOut)} ${avifBytes}B + ${path.basename(webpOut)} ${webpBytes}B`);
  }
  console.log('Done.');
})().catch((err) => {
  console.error('logo-variants failed:', err);
  process.exit(1);
});
