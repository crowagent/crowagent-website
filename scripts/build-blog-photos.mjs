#!/usr/bin/env node
/**
 * build-blog-photos.mjs — the ONE place a blog hero's derivatives are made.
 *
 * ── WHY THIS SCRIPT EXISTS AT ALL ───────────────────────────────────────────
 *
 * `blog/PHOTO-CREDITS.md` recorded the recipe in prose: "resized to 1600px wide
 * and re-encoded (JPEG quality 82 with mozjpeg, WebP quality 76 to 82) ... The
 * width ladder is WebP quality 76." A recipe written in prose is a recipe that
 * drifts, and it had already drifted: measured 2026-08-04, seven of the eight
 * heroes carried a full-size `.avif` and one (`uk-parliament-westminster`) did
 * not, and NONE of them carried an AVIF at the ladder widths. Nothing reported
 * that, because nothing was checking. So the recipe moves out of the prose and
 * into code, and the prose keeps the part only a human can hold: where each
 * photograph came from and under what licence.
 *
 * ── WHAT IT EMITS, AND WHY THAT SHAPE ───────────────────────────────────────
 *
 *   {base}.jpg                 1600w  the fallback every browser can read
 *   {base}.webp  {base}.avif   1600w  the full-size modern pair
 *   {base}-400w  -600w -800w -1200w   in BOTH .webp and .avif
 *
 * The ladder widths are 400/600/800/1200 because that is the ladder
 * `components/blog/PostImage.astro` already declares, and the component lists
 * them explicitly rather than deriving them from a range precisely so that
 * adding a width means adding the file first. Changing the ladder means
 * changing both, together, on purpose.
 *
 * AVIF AT EVERY RUNG IS THE POINT OF THIS PASS. `PostImage` used to offer WebP
 * and a JPEG and nothing else, so the smallest encoding on disk was never
 * served. Measured across the eight heroes, AVIF lands at roughly half the WebP
 * bytes for the same picture.
 *
 * ── NEW MASTERS ARE CUT AT 16:9, AND THAT IS A DELIBERATE BREAK ─────────────
 *
 * The existing masters are 3:2 (1600x1067) or 8:5 (1600x1000). `.pi__frame`
 * renders every blog picture at `aspect-ratio: 16/9` with `object-fit: cover`,
 * so on a 3:2 master the browser downloads 1067 rows, paints 900 of them and
 * discards 167 — 16% of the pixels in every file, at every rung, on every load.
 * Cutting the master at the ratio it is rendered at costs nothing and stops
 * that. The existing four masters are NOT re-cut: see the note on `derive`.
 *
 * ── IT REFUSES TO OVERWRITE ─────────────────────────────────────────────────
 *
 * /Assets/* is served `immutable` for a year, and `scripts/build-dist.js`
 * FAILS the build when the bytes behind an unversioned URL move. Silently
 * re-encoding an existing file would therefore either break that gate or, if
 * the gate were re-recorded, ship a correction that reaches nobody who already
 * holds the old bytes. So an existing output is left alone unless `--force` is
 * passed, and forcing is the caller's statement that they will also bump the
 * reference's `?v=`.
 *
 * Usage:
 *   node scripts/build-blog-photos.mjs              # make what is missing
 *   node scripts/build-blog-photos.mjs --force      # re-encode everything
 *   node scripts/build-blog-photos.mjs --check      # report gaps, write nothing
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("Assets/blog-photos");

/** The rungs PostImage.astro declares. Both must change together. */
const LADDER = [400, 600, 800, 1200];

/** The full-size master. 16:9 is the ratio .pi__frame actually renders. */
const MASTER_W = 1600;
const MASTER_H = 900;

/*
 * Encoder settings. JPEG and WebP are the values PHOTO-CREDITS.md already
 * recorded, kept byte-compatible so a re-run of an existing file is a no-op
 * rather than a churn. AVIF at q60/effort 6 was measured against q72 (the value
 * scripts/convert-shots.mjs uses for product screens) and is indistinguishable
 * on photography while landing ~25% smaller; a screenshot of flat UI panels and
 * a photograph do not want the same quantiser.
 */
const JPEG = { quality: 82, mozjpeg: true };
const WEBP_MASTER = { quality: 82, effort: 6 };
const WEBP_RUNG = { quality: 76, effort: 6 };
const AVIF = { quality: 60, effort: 6 };

/**
 * Every hero, and where its pixels come from.
 *
 *   source  — an absolute path to an original. The master is cut from it at
 *             16:9 and the whole set is emitted. This is the path a NEW hero
 *             takes; the original is not kept in the repo, because
 *             PHOTO-CREDITS.md records the URL it can be fetched from again.
 *   derive  — no original to hand, so the existing `{base}.jpg` IS the source
 *             and its own ratio is preserved. Used to fill in formats that were
 *             never generated for a photograph that is already published and
 *             already cached. Re-cutting these to 16:9 would move the bytes
 *             under a stable URL, which is exactly what the overwrite rule
 *             above forbids.
 *
 * `crop` is the sharp `position` for the 16:9 cut. Written per photograph
 * rather than left at the default, because the default is right for three of
 * these four and wrong for the kind of picture where the subject is not in the
 * middle of the frame.
 *
 * `lift` multiplies brightness before encoding, and is recorded in
 * PHOTO-CREDITS.md wherever it is not 1. The Pexels Licence permits editing;
 * what it does not permit is an unrecorded edit, because then the file on disk
 * and the provenance note disagree about what the photograph is.
 */
const PHOTOS = [
  {
    base: "office-files-on-shelves",
    source: "office-files-on-shelves.jpg",
    crop: "centre",
    /* The original is exposed for the dark room it was shot in, and at
       thumbnail size on a dark page it closed up to near-black. The owner's
       instruction on 2026-08-04 was that the pictures must be "super visible"
       and "clear", so the exposure is corrected once, here, in the file —
       rather than with a CSS `filter`, which is the thing that made every blog
       picture look washed out in the first place. */
    lift: 1.16,
  },
  { base: "workshop-owner-at-a-laptop", source: "workshop-owner-at-a-laptop.jpg", crop: "centre" },
  { base: "hm-treasury-whitehall", source: "hm-treasury-whitehall.jpg", crop: "centre" },
  { base: "reviewing-charts-together", source: "reviewing-charts-together.jpg", crop: "centre" },

  /* Published, cached, and keeping their own geometry. */
  { base: "uk-parliament-westminster", derive: true },
  { base: "writing-a-tender-response", derive: true },
  { base: "social-value-in-the-community", derive: true },
  { base: "bid-team-reviewing-proposal", derive: true },
];

const force = process.argv.includes("--force");
const check = process.argv.includes("--check");
const srcDir = process.argv.find((a) => a.startsWith("--src="))?.slice(6);

const kb = (p) => (fs.existsSync(p) ? (fs.statSync(p).size / 1024).toFixed(0) : "-");

let written = 0;
let missing = 0;

/** Writes one derivative, honouring --check and the no-overwrite rule. */
async function emit(pipeline, dest) {
  const exists = fs.existsSync(dest);
  if (exists && !force) return false;
  if (check) {
    if (!exists) {
      console.log(`  MISSING  ${path.basename(dest)}`);
      missing += 1;
    }
    return false;
  }
  await pipeline.toFile(dest);
  written += 1;
  return true;
}

/** The whole derivative set for one master, whatever its ratio. */
async function emitSet(masterBuffer, base) {
  const jpg = path.join(OUT, `${base}.jpg`);
  await emit(sharp(masterBuffer).jpeg(JPEG), jpg);
  await emit(sharp(masterBuffer).webp(WEBP_MASTER), path.join(OUT, `${base}.webp`));
  await emit(sharp(masterBuffer).avif(AVIF), path.join(OUT, `${base}.avif`));

  for (const w of LADDER) {
    const rung = () => sharp(masterBuffer).resize(w);
    await emit(rung().webp(WEBP_RUNG), path.join(OUT, `${base}-${w}w.webp`));
    await emit(rung().avif(AVIF), path.join(OUT, `${base}-${w}w.avif`));
  }
}

async function run() {
  if (!fs.existsSync(OUT)) {
    console.error(`No output directory: ${OUT}`);
    process.exit(2);
  }

  for (const photo of PHOTOS) {
    const { base } = photo;
    console.log(`\n${base}`);

    let master;
    if (photo.derive) {
      const existing = path.join(OUT, `${base}.jpg`);
      if (!fs.existsSync(existing)) {
        console.error(`  REFUSING: ${base} is marked derive but ${base}.jpg does not exist.`);
        process.exitCode = 1;
        continue;
      }
      /* Straight through, no resize and no re-crop: the published geometry is
         the geometry, and only the formats that were never made get made. */
      master = await sharp(existing).toBuffer();
    } else {
      if (!srcDir) {
        /* Nothing to cut from. Not an error: the four masters below this line
           are already on disk, and a run that only tops up the AVIF ladder has
           no business demanding the originals be re-downloaded. */
        if (fs.existsSync(path.join(OUT, `${base}.jpg`))) {
          master = await sharp(path.join(OUT, `${base}.jpg`)).toBuffer();
        } else {
          console.error(`  SKIPPED: no --src=<dir> given and ${base}.jpg is not on disk.`);
          process.exitCode = 1;
          continue;
        }
      } else {
        const src = path.join(srcDir, photo.source);
        if (!fs.existsSync(src)) {
          console.error(`  REFUSING: source not found: ${src}`);
          process.exitCode = 1;
          continue;
        }
        let pipe = sharp(src).resize(MASTER_W, MASTER_H, { fit: "cover", position: photo.crop });
        if (photo.lift) pipe = pipe.modulate({ brightness: photo.lift });
        master = await pipe.toBuffer();
      }
    }

    await emitSet(master, base);

    const m = await sharp(path.join(OUT, `${base}.jpg`)).metadata();
    console.log(
      `  ${m.width}x${m.height}  ` +
        `jpg ${kb(path.join(OUT, `${base}.jpg`))}KB  ` +
        `webp ${kb(path.join(OUT, `${base}.webp`))}KB  ` +
        `avif ${kb(path.join(OUT, `${base}.avif`))}KB`
    );
  }

  if (check) {
    console.log(`\n${missing} derivative(s) missing.`);
    if (missing) process.exitCode = 1;
  } else {
    console.log(`\n${written} file(s) written.`);
  }
}

run().catch((error) => {
  console.error(
    JSON.stringify({
      level: "error",
      service: "build-blog-photos",
      operation: "run",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
  );
  process.exit(1);
});
