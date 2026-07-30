#!/usr/bin/env node
/**
 * convert-shots.mjs — publish verified raw captures at ONE canonical aspect ratio.
 *
 * WHY A SINGLE RATIO IS MANDATORY, NOT A PREFERENCE.
 * `Assets/css/premium-transformation-2026-05-27.css:250` gives the ACTIVE slide
 * `position: relative` while inactive slides are `position: absolute; inset: 0`.
 * That is deliberate — the active slide is what gives the frame its height. The
 * direct consequence is that every slide in a carousel MUST share one aspect
 * ratio, because the frame re-sizes to whichever slide is active.
 *
 * Publishing three different ratios (analytics 3200x2600 = 1.23, reports 1.60,
 * opportunities 2008x860 = 2.33) produced exactly the failure the owner reported:
 * measured live, the active slide rendered 816px tall inside a 628px viewport, so
 * the screenshot overflowed the frame and collided with the caption bar and the
 * charts beneath it. `[data-pcar] .ca-viewport { aspect-ratio: 16/10 !important }`
 * (nav-global-fix-2026-05-27.css) sets the frame to 16:10, so 16:10 is the ratio
 * the whole system is already built around.
 *
 * CANON: 3200x2000 (16:10) at DPR2 — i.e. a 1600x1000 CSS frame.
 * Crop anchor is TOP for dashboard captures: the KPI row and the first chart row
 * are the value proposition, and they sit at the top of every screen. Cropping
 * from the centre would cut the KPI tiles in half.
 */
import sharp from "sharp";
import path from "node:path";
import { existsSync, statSync } from "node:fs";

const RAW = path.resolve("Assets/shots/_raw");
const OUT = path.resolve("Assets/shots/dark");

const CANON_W = 3200;
const CANON_H = 2000; // 16:10

/** raw basename (or an already-published file) -> published basename */
const MAP = {
  "analytics-desktop-dark": "mark-analytics",
  "reports-desktop-dark": "mark-reports",
};
/** already-published shots that must be re-normalised to the canon ratio */
const RENORMALISE = ["mark-opportunities"];

const kb = (p) => (existsSync(p) ? Math.round(statSync(p).size / 1024) : 0);

async function publish(inputPath, dest) {
  if (!existsSync(inputPath)) {
    console.error(`MISSING: ${inputPath}`);
    process.exitCode = 1;
    return;
  }
  // A blank capture is ~20-30 KB at this pixel size. Refuse to publish one — three
  // blank PNGs were written earlier while the capture harness logged "ok".
  if (kb(inputPath) < 80) {
    console.error(`REFUSING ${dest}: ${kb(inputPath)} KB — looks blank`);
    process.exitCode = 1;
    return;
  }

  const base = sharp(inputPath).resize(CANON_W, CANON_H, {
    fit: "cover",
    position: "top",
  });

  await base.clone().png({ compressionLevel: 9, palette: false }).toFile(path.join(OUT, `${dest}.png`));
  await base.clone().webp({ quality: 92, effort: 6 }).toFile(path.join(OUT, `${dest}.webp`));
  await base.clone().avif({ quality: 72, effort: 6 }).toFile(path.join(OUT, `${dest}.avif`));

  const m = await sharp(path.join(OUT, `${dest}.png`)).metadata();
  console.log(
    `${dest}: ${m.width}x${m.height} (${(m.width / m.height).toFixed(3)})  ` +
      `png ${kb(path.join(OUT, dest + ".png"))}KB  webp ${kb(path.join(OUT, dest + ".webp"))}KB  ` +
      `avif ${kb(path.join(OUT, dest + ".avif"))}KB`,
  );
}

for (const [src, dest] of Object.entries(MAP)) {
  await publish(path.join(RAW, `${src}.png`), dest);
}
// Re-normalise in place via a temp read, since source and destination share a name.
for (const name of RENORMALISE) {
  const src = path.join(OUT, `${name}.png`);
  const tmp = path.join(RAW, `__renorm-${name}.png`);
  if (!existsSync(src)) { console.error(`MISSING ${src}`); process.exitCode = 1; continue; }
  await sharp(src).toFile(tmp);
  await publish(tmp, name);
}
