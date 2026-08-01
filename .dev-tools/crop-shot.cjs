// Crop a raw product capture down to its content column.
//
// Generalised from crop-fit-score.cjs, which hardcoded one set of bounds. Raw
// captures are 3200x2000 at DSF 2 and always include the product sidebar plus
// whatever was half-cut at the viewport edge; the homepage frames want the content.
//
//   node .dev-tools/crop-shot.cjs <src> <dest> <left> <top> <width> <height>
//
// Bounds must be READ off the image, never guessed. The extract call fails loudly
// rather than silently clamping, so an out-of-range crop is a stopped run and not a
// quietly truncated frame.
const sharp = require("sharp");
const path = require("path");

const [SRC, DEST, L, T, W, H] = process.argv.slice(2);
if (!SRC || !DEST || [L, T, W, H].some((v) => v === undefined)) {
  console.error("usage: crop-shot.cjs <src> <dest> <left> <top> <width> <height>");
  process.exit(2);
}
const left = Number(L), top = Number(T), width = Number(W), height = Number(H);

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log(`source ${path.basename(SRC)} ${meta.width}x${meta.height}`);
  if (left + width > meta.width || top + height > meta.height) {
    throw new Error(`crop ${left},${top} ${width}x${height} falls outside ${meta.width}x${meta.height}`);
  }
  await sharp(SRC).extract({ left, top, width, height }).png({ compressionLevel: 9 }).toFile(DEST);
  const out = await sharp(DEST).metadata();
  console.log(`wrote ${path.basename(DEST)} ${out.width}x${out.height}`);
})();
