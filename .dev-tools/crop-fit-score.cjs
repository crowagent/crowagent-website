// Crop the fit-score capture down to the content column.
//
// The raw capture is 3200x2000 at DSF 2 and includes the product sidebar and a
// half-cut banner at the top edge. The homepage frame wants the result itself:
// the posture chip, the score, the confidence row, and the reasons underneath it
// (the frame's own headline is "A score that shows its reasons", so the reasons
// are not optional decoration — they ARE the frame).
//
// Bounds were read off the image, not guessed. Everything left of x=700 is chrome.
const sharp = require("sharp");
const path = require("path");

const SRC = process.argv[2];
const DEST = process.argv[3];
const LEFT = 700, TOP = 150, WIDTH = 1580, HEIGHT = 1665;

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log(`source ${meta.width}x${meta.height}`);
  if (LEFT + WIDTH > meta.width || TOP + HEIGHT > meta.height) {
    throw new Error(`crop ${LEFT},${TOP} ${WIDTH}x${HEIGHT} falls outside ${meta.width}x${meta.height}`);
  }
  await sharp(SRC)
    .extract({ left: LEFT, top: TOP, width: WIDTH, height: HEIGHT })
    .png({ compressionLevel: 9 })
    .toFile(DEST);
  const out = await sharp(DEST).metadata();
  console.log(`wrote ${path.basename(DEST)} ${out.width}x${out.height}`);
})();
