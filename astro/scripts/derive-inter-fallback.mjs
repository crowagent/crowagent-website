/* Derive an Inter metric fallback the same way 'Jakarta Fallback' was derived,
 * and by the same two methods that had to agree — board item A-152.
 *
 * THIS IS A CONTROL BEFORE IT IS A DERIVATION. A-152 already carries proposed
 * numbers (size-adjust 106.93%, ascent 90.60, descent 22.56). They are not
 * shipped on the strength of that note: the note's own headline figure is
 * 7.55% at weight 400, and 106.93% is not 107.55%, so either the value is
 * weighted across weights in a way the note does not state or one of the two
 * is wrong. Reproduce the number first, then replace it.
 *
 * SIZE-ADJUST IS AN ADVANCE-WIDTH RATIO HERE, NOT AN X-HEIGHT ONE. That is the
 * correction fonts.css records against the shipped Jakarta values, and it is
 * worth 3.9pp on its own. The objective is that text-width-dependent layout
 * must not re-wrap when the real face arrives, and x-height matching says
 * nothing about horizontal room.
 *
 * xAvgCharWidth is NOT used, per A-100's standing warning: Arial reports the
 * old weighted-lowercase definition and modern faces the all-glyphs one.
 *
 * Run:  node scripts/derive-inter-fallback.mjs
 * Reads dist/, so build first. Writes nothing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/* ── THE CORPUS: REAL BODY TEXT, NOT A LATIN-1 SET ─────────────────────────
 * Taken from the built output rather than authored here, so the frequency
 * distribution is the site's own. Scripts, styles and the head are stripped;
 * so is anything inside an element that names the display or mono face, since
 * this face is only ever the body one. */
const strings = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      const html = fs
        .readFileSync(p, 'utf8')
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<style[\s\S]*?<\/style>/g, ' ')
        .replace(/<head[\s\S]*?<\/head>/g, ' ');
      /* Headings and the mono label recipe are excluded by tag, which is a
         coarse filter and is stated as such: it over-excludes a heading that
         happens to use the body face and under-excludes a mono <span>. The
         residual either way is small against 60k characters, and the
         alternative — resolving the computed family per node — is what the
         Chromium half below does properly. */
      const body = html
        .replace(/<h[1-6][\s\S]*?<\/h[1-6]>/g, ' ')
        .replace(/<code[\s\S]*?<\/code>/g, ' ')
        .replace(/<[^>]+>/g, '');
      /* SPLIT ON THE NEWLINE. This read `split('')` when it was written, which
         splits into single characters and makes the `length > 1` filter below
         keep almost nothing; a stray control byte then landed between the
         quotes, so it matched nothing at all and each FILE arrived as one
         string. Caught because the reported string count and the reported
         character count could not both be true of the same array. */
      for (const s of body.split(/\n+/)) {
        const t = s.replace(/&[a-z]+;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
        if (t.length > 1) strings.push(t);
      }
    }
  }
};
walk(DIST);

const freq = new Map();
let total = 0;
for (const s of strings) {
  for (const ch of s) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue;
    freq.set(ch, (freq.get(ch) || 0) + 1);
    total += 1;
  }
}
console.log(`corpus: ${strings.length} string(s), ${total} character(s) from ${DIST}`);

/* ── METHOD 2 (PRIMARY): CHROMIUM, SHAPING AND KERNING INCLUDED ────────────
 * Laid out at 400px so a one-pixel rounding is 0.25% of a character rather
 * than 25% of one, and summed over the real strings rather than over a
 * synthetic pangram. The real face is loaded from the repo's own woff2 so this
 * measures what ships, not whatever Inter the machine happens to have. */
/* dist/, not public/ — copy-assets.js places the fonts, so dist is the only
 * tree that has them and it is also the one that ships. */
const FACE = path.join(DIST, 'Assets', 'fonts', 'Inter-var.woff2');
const faceUrl = fs.existsSync(FACE)
  ? `data:font/woff2;base64,${fs.readFileSync(FACE).toString('base64')}`
  : null;
if (!faceUrl) {
  console.error(`derive: cannot read ${FACE}`);
  process.exit(1);
}

/* A sample rather than all of them, because 400px x 60k characters is a lot of
 * layout and the ratio converges long before that. The sample is DETERMINISTIC
 * — every nth string — so re-running gives the same answer, and the count is
 * printed so the reader can see what it rests on. */
const sample = strings.filter((_, i) => i % 3 === 0).slice(0, 4000);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<div id="r"></div>');
const measure = async (family, weight, extra = '') =>
  page.evaluate(
    async ({ family, weight, extra, faceUrl, sample }) => {
      const style = document.getElementById('s') || document.createElement('style');
      style.id = 's';
      style.textContent = `
        @font-face{font-family:'InterReal';src:url('${faceUrl}') format('woff2');font-weight:100 900}
        ${extra}
        #r{position:absolute;white-space:pre;font-size:400px;font-weight:${weight};font-family:${family}}`;
      document.head.appendChild(style);
      /* EXPLICIT load() BEFORE fonts.ready, AND THIS IS THE BUG THAT MADE THE
         FIRST RUN OF THIS SCRIPT REPORT NONSENSE. `document.fonts.ready`
         resolves when currently-PENDING loads settle, and a face nothing has
         laid out yet is not pending - it has not started. So the very first
         measurement returned the browser's default serif, which is narrower
         than Inter, and the ratio at weight 400 came out 15pp below every
         other weight in the same table. A face is only guaranteed loaded once
         load() for the exact size-and-weight string has resolved. */
      try {
        await document.fonts.load(`${weight} 400px ${family}`);
      } catch { /* a local() family that is absent cannot load; measured anyway */ }
      await document.fonts.ready;
      const r = document.getElementById('r');
      let sum = 0;
      for (const s of sample) {
        r.textContent = s;
        sum += r.getBoundingClientRect().width;
      }
      return sum;
    },
    { family, weight, extra, faceUrl, sample },
  );

console.log(`\nadvance-width ratio, Chromium, ${sample.length} real string(s) at 400px`);
console.log('weight   Inter          Segoe UI       ratio      Arial          ratio');
const rows = [];
for (const w of [400, 500, 600, 700]) {
  const inter = await measure("'InterReal'", w);
  const segoe = await measure("'Segoe UI'", w);
  const arial = await measure("'Arial'", w);
  const rs = inter / segoe;
  const ra = inter / arial;
  rows.push({ w, inter, segoe, arial, rs, ra });
  console.log(
    `${String(w).padEnd(8)} ${inter.toFixed(0).padEnd(14)} ${segoe.toFixed(0).padEnd(14)} ` +
      `${(rs * 100).toFixed(2)}%    ${arial.toFixed(0).padEnd(14)} ${(ra * 100).toFixed(2)}%`,
  );
}

/* ── THE LINE BOX, WHICH IS THE HALF size-adjust DOES NOT ADDRESS ──────────
 * Measured rather than computed from the tables, because whether a face's
 * sTypo or hhea metrics win depends on USE_TYPO_METRICS and on the engine. */
const lineBox = async (family, extra = '') =>
  page.evaluate(
    async ({ family, extra, faceUrl }) => {
      const style = document.getElementById('s2') || document.createElement('style');
      style.id = 's2';
      style.textContent = `
        @font-face{font-family:'InterReal2';src:url('${faceUrl}') format('woff2');font-weight:100 900}
        ${extra}
        #b{position:absolute;font-size:1000px;line-height:normal;font-family:${family}}`;
      document.head.appendChild(style);
      try {
        await document.fonts.load(`400 400px ${family}`);
      } catch { /* see the note in measure() */ }
      await document.fonts.ready;
      let b = document.getElementById('b');
      if (!b) {
        b = document.createElement('div');
        b.id = 'b';
        document.body.appendChild(b);
      }
      b.textContent = 'Hxg';
      return b.getBoundingClientRect().height / 1000;
    },
    { family, extra, faceUrl },
  );

console.log('\nline box at line-height:normal, em');
for (const [label, fam] of [
  ['Inter (real)', "'InterReal2'"],
  ['Segoe UI', "'Segoe UI'"],
  ['Arial', "'Arial'"],
]) {
  console.log(`  ${label.padEnd(14)} ${(await lineBox(fam)).toFixed(4)}em`);
}

/* ── THE PROPOSED DESCRIPTORS, AND THE VALIDATION OF THEM ──────────────────
 * The overrides are multiplied by size-adjust, so a target of A must be
 * declared as A / size-adjust — the same relation fonts.css records for
 * Jakarta and which is confirmed here by measuring the resulting line box
 * against the real face rather than trusting the arithmetic. */
const interAsc = 1984 / 2048;
const interDesc = 494 / 2048;
console.log(
  `\nInter sTypo/hhea per em: ascent ${interAsc.toFixed(5)}  descent ${interDesc.toFixed(5)}` +
    `  line-gap 0  ->  ${(interAsc + interDesc).toFixed(4)}em line box`,
);

for (const r of rows.filter((x) => x.w === 400)) {
  for (const [name, ratio] of [
    ['Segoe UI', r.rs],
    ['Arial', r.ra],
  ]) {
    const sa = ratio * 100;
    console.log(
      `\n  against local('${name}') at weight 400:` +
        `\n    size-adjust:       ${sa.toFixed(2)}%` +
        `\n    ascent-override:   ${((interAsc / ratio) * 100).toFixed(2)}%` +
        `\n    descent-override:  ${((interDesc / ratio) * 100).toFixed(2)}%` +
        `\n    line-gap-override: 0%`,
    );
    const extra = `@font-face{font-family:'Probe${name.replace(/\s/g, '')}';src:local('${name}');
      size-adjust:${sa.toFixed(2)}%;ascent-override:${((interAsc / ratio) * 100).toFixed(2)}%;
      descent-override:${((interDesc / ratio) * 100).toFixed(2)}%;line-gap-override:0%}`;
    const probe = await measure(`'Probe${name.replace(/\s/g, '')}'`, 400, extra);
    const real = rows.find((x) => x.w === 400).inter;
    console.log(
      `    VALIDATED in Chromium: residual ${(probe / real).toFixed(5)} against the real face` +
        ` (1.00000 is exact)`,
    );
    const lb = await lineBox(`'Probe${name.replace(/\s/g, '')}'`, extra);
    console.log(
      `    line box ${lb.toFixed(4)}em against the real face's ${(interAsc + interDesc).toFixed(4)}em`,
    );
  }
}

await browser.close();
