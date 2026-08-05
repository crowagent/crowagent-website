#!/usr/bin/env node
/**
 * build-product-screens.mjs — the width ladder for the sixteen drawn CrowMark
 * product screens, made the same way the blog heroes' ladder is made.
 *
 * ── WHY THIS EXISTS (A-93) ──────────────────────────────────────────────────
 *
 * `Assets/shots/figma-v2/` held exactly three files per screen: a PNG, a WebP
 * and an AVIF, all at the export resolution. `ui/Carousel.astro` offered all
 * three to the browser, so FORMAT was negotiated and RESOLUTION was not. The
 * consequence, measured on 2026-08-04 against the build on :8095:
 *
 *   /crowmark/         548,979 B of images at a 390 viewport — byte-identical
 *                      to the 548,979 B fetched at 1440.
 *   /crowmark-buyers/  509,624 B, likewise identical.
 *
 * `sup-1-discover` is 2880x1800 on disk and paints into 348 CSS px on a 390
 * viewport: 8.3x linear, about 69x the pixels. 31 of the 47 images the two
 * routes fetch were over 2x at 390.
 *
 * THE MECHANISM WAS ALREADY IN THE REPOSITORY AND WAS SIMPLY NOT APPLIED HERE.
 * `scripts/build-blog-photos.mjs` writes a rung per width for every blog hero
 * and `components/blog/PostImage.astro` declares the matching `srcset`/`sizes`,
 * which is why /blog/ falls from 107,444 B at 1440 to 51,801 B at 390. This
 * script is that script's shape, pointed at the product screens; it is
 * deliberately NOT a second mechanism.
 *
 * ── WHAT IT EMITS ───────────────────────────────────────────────────────────
 *
 *   {base}-400w  -600w  -800w  -1200w      in .avif, and in .avif only
 *
 * and nothing else. The three master files are already on disk and are left
 * exactly as they are: the master is the top rung of the srcset, at its own
 * intrinsic width, and the PNG is still the fallback the `<img>` carries.
 *
 * ── WHY THE LADDER IS THE BLOG'S FOUR WIDTHS AND NOT SIX ────────────────────
 *
 * 400/600/800/1200 is exactly `scripts/build-blog-photos.mjs`'s ladder. A first
 * pass added 1600 and 2000 above them, on the reasoning that a product screen is
 * painted far wider than a blog thumbnail. Measured, they earn very little and
 * cost a great deal: against a 2880w master at 89,711 B, the 1600w rung saves
 * 29% and the 2000w rung 10%, and both are only ever chosen by a retina desktop
 * — the least bandwidth-constrained reader on the site. The two of them together
 * added 2.85 MB to the build. So the ladder is the four the site already has,
 * and above 1200 the master is the candidate.
 *
 * ── AVIF ONLY, AND check-budgets.js ASKED FOR THIS IN WRITING ───────────────
 *
 * The obvious shape is a rung per width in both modern formats, which is what
 * the blog does. It is wrong here, and the reason is already recorded in
 * `astro/scripts/check-budgets.js` beside the `wholeBuild` budget:
 *
 *   "the WebP tier of those sixteen screens is LARGER than the PNG tier on all
 *    16 of 16 files (1.94 MB against 1.13 MB), because they are flat-colour
 *    interface drawings, which PNG encodes better than a lossy codec ... it is
 *    the first place to look when this budget next binds."
 *
 * It bound on the first run of this script: a WebP ladder took the build from
 * 12,541 KB to 17,831 KB against a 14,336 KB budget, and 55% of that was WebP.
 *
 * THIS DOES NOT RETIRE THE WebP TIER AND DOES NOT DELETE ANYTHING. The same
 * note says retiring it "needs an owner decision because it deletes published
 * assets", and that decision is not this script's to take. A browser that reads
 * WebP but not AVIF is served exactly the file it is served today. What is
 * declined here is EXTENDING a tier the budget file already identifies as
 * counter-productive, at 2.5 MB, for a population that in 2026 is Safari before
 * 16.4 — while the AVIF ladder those readers cannot use is what everyone else
 * gets.
 *
 * ── A RUNG MUST BE AT MOST 0.7 OF THE MASTER, AND THAT NUMBER IS MEASURED ───
 *
 * The sixteen screens are drawn at three device sizes and exported at 2x —
 * 2880x1800 desktop, 2048x1536 tablet, 780x1688 phone — so the obvious rule is
 * "every rung narrower than the master". That rule is WRONG here, and the first
 * run of this script proved it:
 *
 *   sup-5-answer-library  master 2048w AVIF  59,790 B
 *                         rung   1600w AVIF  61,041 B   HEAVIER
 *                         rung   2000w AVIF  76,310 B   HEAVIER
 *   sup-7-opportunity-detail master 780w AVIF 29,689 B
 *                         rung    600w AVIF  30,491 B   HEAVIER
 *
 * The cause is the subject. These are 2x renders of flat UI panels, so the
 * master is full of large, perfectly uniform regions that AVIF encodes almost
 * for nothing. Resampling to a nearby width replaces every crisp edge with a
 * band of interpolated greys, and the encoder pays for all of them. Below about
 * 0.7 of the master the pixel saving overtakes that cost; above it, it does not.
 *
 * A srcset whose candidates are not monotonic in bytes can only pessimise — the
 * browser picks by WIDTH, so it would happily fetch the heavier file. So the
 * rule is `rung <= 0.7 * master`, the same expression `Carousel.astro` applies
 * when it builds the srcset, and `verify()` below FAILS this script if any rung
 * that survives the rule is not in fact smaller than its master.
 *
 * ── WHY THESE SIX WIDTHS ────────────────────────────────────────────────────
 *
 * 400/600/800/1200 are `build-blog-photos.mjs`'s ladder, kept so that the two
 * image systems on this site read as one. 1600 and 2000 are added above them,
 * because a product screen is displayed far wider than a blog thumbnail and
 * without them a 1440 viewport at DPR2 would jump straight from 1200 to the
 * 2880 master. Measured live on :8095, the carousel stage is:
 *
 *   viewport >= 1063px      964.7 CSS px, capped by --measure-mid
 *   400px <= vw < 1063px    90vw - 2px      (the gutter is 5vw in that range)
 *   viewport < 400px        100vw - 42px    (the gutter has bottomed out at 20px)
 *
 * A desktop screen fills the stage, a tablet screen takes 0.833 of it and a
 * phone screen 0.289 — see `sizesFor()` in Carousel.astro, which derives those
 * fractions from each slide's own ratio rather than restating them. So the
 * widest a desktop screen is ever painted is 964.7 CSS px, which is 2894 device
 * px at DPR3, and the master remains the right top rung.
 *
 * ── IT REFUSES TO OVERWRITE ─────────────────────────────────────────────────
 *
 * Same rule, and the same reason, as the blog script: /Assets/* is served
 * `immutable` for a year and `scripts/build-dist.js` fails the build when the
 * bytes behind an unversioned URL move. An existing output is left alone unless
 * `--force` is passed, and forcing is the caller's statement that they will also
 * bump `V` in `astro/src/data/crowmark-screens.ts`.
 *
 * Usage:
 *   node scripts/build-product-screens.mjs           # make what is missing
 *   node scripts/build-product-screens.mjs --check   # report gaps, write nothing
 *   node scripts/build-product-screens.mjs --force   # re-encode everything
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve("Assets/shots/figma-v2");
const MANIFEST = path.join(DIR, "manifest.json");

/**
 * The rungs. `Carousel.astro` holds the matching list and the two must change
 * together — listed in both places rather than derived from a range, for the
 * same reason PostImage.astro lists its four: adding a width means adding the
 * file first, and a srcset that names a file nobody wrote is a 404 on a shipped
 * page. `astro/scripts/copy-assets.js` reads srcset and fails the build on a
 * missing reference, so that mistake stops a build rather than reaching a
 * reader — but it should not be made in the first place.
 */
const LADDER = [400, 600, 800, 1200];

/**
 * The fraction of the master a rung must fit inside to be worth writing. See
 * the header: measured, not chosen. `Carousel.astro` applies the same number.
 */
const MAX_OF_MASTER = 0.7;

/** The rungs one master earns. The single expression both sides share. */
export const rungsFor = (masterWidth) =>
  LADDER.filter((w) => w <= masterWidth * MAX_OF_MASTER);

/*
 * The AVIF setting `scripts/convert-shots.mjs` already uses for product screens,
 * unchanged. A screenshot of flat UI panels and a photograph do not want the
 * same quantiser — `build-blog-photos.mjs` records the other half of that same
 * finding, and settles on AVIF q60 for photography. Keeping the two scripts at
 * the values each subject was measured for is the point.
 *
 * Verified rather than assumed: re-encoding `sup-1-discover.png` at the master's
 * own 2880px lands at 91,224 B against the published master's 89,711 B, so q72
 * is the setting the published tier was made at and a rung is not quietly a
 * different picture from the file above it in the srcset.
 */
const AVIF = { quality: 72, effort: 6 };

const force = process.argv.includes("--force");
const check = process.argv.includes("--check");

let written = 0;
let missing = 0;
let bytes = 0;
/** Every `{base}-{n}w.{ext}` already in the directory, whatever wrote it. */
const onDisk = fs
  .readdirSync(DIR)
  .filter((f) => /-\d+w\.(avif|webp|png)$/.test(f));

/** Rungs on disk that the rules above no longer keep. Reported, never deleted. */
const stale = [];
/** Rungs that are heavier than their own master. Any one of these fails the run. */
const heavier = [];

/**
 * The proof, rather than the assertion. Every rung the rule kept must actually
 * be smaller than the master, or the srcset it feeds is not monotonic in bytes
 * and the browser — which picks by WIDTH — can be sent to the heavier file.
 *
 * This is the check that caught the 0.7 rule in the first place, and it stays
 * so that the rule is falsifiable rather than remembered.
 */
function verify(basename, masterWidth, rungs) {
  const master = path.join(DIR, `${basename}.avif`);
  if (!fs.existsSync(master)) return;
  const masterBytes = fs.statSync(master).size;
  for (const w of rungs) {
    const rung = path.join(DIR, `${basename}-${w}w.avif`);
    if (!fs.existsSync(rung)) continue;
    const rungBytes = fs.statSync(rung).size;
    if (rungBytes < masterBytes) continue;
    heavier.push(
      `${basename}-${w}w.avif is ${rungBytes} B against a ${masterWidth}w master at ${masterBytes} B`
    );
  }
}

/** Writes one rung, honouring --check and the no-overwrite rule. */
async function emit(pipeline, dest) {
  const exists = fs.existsSync(dest);
  if (exists && !force) return;
  if (check) {
    if (!exists) {
      console.log(`  MISSING  ${path.basename(dest)}`);
      missing += 1;
    }
    return;
  }
  await pipeline.toFile(dest);
  written += 1;
  bytes += fs.statSync(dest).size;
}

async function run() {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`No manifest: ${MANIFEST}`);
    process.exit(2);
  }

  /* The manifest is the existing record of what was exported, including each
     screen's intrinsic size. Reading it rather than restating the sixteen names
     here means a seventeenth screen gets its ladder by being exported, not by
     being remembered. */
  const screens = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

  for (const screen of screens) {
    const { basename, width } = screen;
    const master = path.join(DIR, `${basename}.png`);
    if (!fs.existsSync(master)) {
      console.error(`  REFUSING: ${basename} is in the manifest but ${basename}.png is not on disk.`);
      process.exitCode = 1;
      continue;
    }

    /* Verified against the file rather than trusted from the manifest: the
       manifest is hand-maintained, and a wrong width here would silently
       upscale a rung. */
    const meta = await sharp(master).metadata();
    if (meta.width !== width) {
      console.error(
        `  REFUSING: ${basename}.png is ${meta.width}px wide, manifest says ${width}px.`
      );
      process.exitCode = 1;
      continue;
    }

    const rungs = rungsFor(meta.width);
    console.log(`\n${basename}  ${meta.width}x${meta.height}  rungs: ${rungs.join(", ") || "(none)"}`);

    for (const w of rungs) {
      await emit(sharp(master).resize(w).avif(AVIF), path.join(DIR, `${basename}-${w}w.avif`));
    }

    /*
     * A rung that is on disk but no longer earns its place is REPORTED rather
     * than deleted. Removing a file under /Assets is a cache decision, not a
     * build decision, and this script is not allowed to make it silently — the
     * same reasoning as the no-overwrite rule above.
     */
    const wanted = new Set(rungs.map((w) => `${basename}-${w}w.avif`));
    for (const file of onDisk.filter((f) => f.startsWith(`${basename}-`))) {
      if (wanted.has(file)) continue;
      console.log(`  STALE    ${file}`);
      stale.push(path.join(DIR, file));
    }

    verify(basename, meta.width, rungs);
  }

  if (check) {
    console.log(`\n${missing} rung(s) missing.`);
    if (missing) process.exitCode = 1;
  } else {
    console.log(`\n${written} file(s) written, ${Math.round(bytes / 1024)} KB.`);
  }

  if (stale.length) {
    console.log(
      `\n${stale.length} stale rung(s) on disk. They are not offered by the srcset ` +
        `and are not copied into dist, because astro/scripts/copy-assets.js copies ` +
        `what is REFERENCED. Delete them when convenient:`
    );
    stale.forEach((f) => console.log(`  ${path.relative(process.cwd(), f)}`));
  }

  if (heavier.length) {
    console.error(`\nFAIL: ${heavier.length} rung(s) are heavier than their own master:`);
    heavier.forEach((h) => console.error(`  ${h}`));
    console.error("A srcset that is not monotonic in bytes can only pessimise. Lower MAX_OF_MASTER.");
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(
    JSON.stringify({
      level: "error",
      service: "build-product-screens",
      operation: "run",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
  );
  process.exit(1);
});
