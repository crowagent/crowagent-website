/**
 * check-font-coverage.js - no built page may contain a character the fonts
 * cannot paint, and no @font-face may describe a file it does not match.
 *
 * WHY THIS EXISTS
 * ===============
 *
 * Assets/fonts/ was re-cut on 2026-09-01 to take 16,684 bytes off the home
 * page's critical path. The saving came from the weight axis rather than from
 * the charset, and no codepoint was dropped, but the whole class of change is
 * one where the failure mode is invisible at the moment it is made: a character
 * removed from a font shows up only when somebody writes a page that uses it,
 * and on a site whose blog and glossary are authored in Markdown that can be
 * weeks later and by somebody who never touched a font. Under-subsetting ships
 * tofu into content nobody has written yet.
 *
 * So the subset is not the deliverable. This is. It compares FOUR things that
 * are only correct together, and any pair of them can disagree:
 *
 *   1. the unicode-range each @font-face declares in src/styles/fonts.css
 *   2. the codepoints the woff2 binary in Assets/fonts/ actually carries
 *   3. the font-weight range each @font-face declares
 *   4. the wght axis the binary actually carries
 *
 * and then the one that matters to a reader:
 *
 *   5. every character in every built page, against the union of what the
 *      site's faces can paint.
 *
 * THE DEFECT THAT MOTIVATED CHECK 1 AGAINST CHECK 2 WAS REAL AND WAS LIVE.
 * The three Plus Jakarta faces declared `unicode-range: U+0000-00FF` while the
 * files carried U+2013, U+2019, U+201C and a dozen more. A range narrower than
 * the file makes the browser refuse a face for a character the face has. The
 * /about heading "You inherit somebody else's promises" measured, through CDP
 * CSS.getPlatformFontsForNode, as 34 glyphs of Plus Jakarta Sans and ONE glyph
 * of Arial. Every gate on this site was green while that shipped, because no
 * gate had ever compared a CSS declaration against a binary.
 *
 * HOW IT COULD COME OUT WRONG, STATED SO THE NEXT READER CAN CHECK IT
 * ==================================================================
 *
 * It reads `dist`, so a route that failed to build is a route it cannot judge.
 * That is why it asserts a floor on the number of routes it saw: a run over an
 * empty or half written dist would otherwise pass by finding no characters.
 *
 * It reads the woff2 tables directly rather than trusting a manifest, and the
 * cmap parser below is written out rather than pulled from a library, because
 * this repository has no font library and adding one to run a guard would be a
 * dependency bought with a gate. The parser is deliberately narrow: it handles
 * cmap formats 4 and 12, which is what these five files use, and it FAILS
 * LOUDLY on anything else rather than reporting zero coverage, since a parser
 * that silently returns an empty set would turn this guard into an alarm that
 * always rings.
 *
 * It extracts text from HTML with a regex rather than a DOM. Script and style
 * bodies are removed first, then tags, then entities are decoded. A character
 * that only ever appears inside a JavaScript string that writes to the page is
 * therefore counted too, which over-reports rather than under-reports, and over
 * -reporting is the safe direction for a coverage check.
 *
 * SEVEN CHARACTERS THE SITE PAINTS ARE COVERED BY NO FACE ON THIS SITE, and
 * always were: U+2192 rightwards arrow, U+2318 place of interest sign, U+2713
 * check mark, U+2264, U+2265, U+2A7D and U+25D4. They fall back to a system
 * face today. They are reported as INFORMATION and do not fail, because failing
 * on them would mean this guard could never be green and a guard that is red on
 * arrival gets switched off. They are listed in KNOWN_UNCOVERED below, and the
 * important half of that list is that it is CLOSED: a character outside it
 * fails, so the list cannot quietly grow.
 *
 * Run: node scripts/check-font-coverage.js
 * Env: FONT_COVERAGE_DIST to point it at a different build directory.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = process.env.FONT_COVERAGE_DIST || path.join(ROOT, 'dist');
const FONTS_DIR = path.join(ROOT, '..', 'Assets', 'fonts');
const FONTS_CSS = path.join(ROOT, 'src', 'styles', 'fonts.css');

/* A build that produced fewer routes than this is not a build worth judging.
   45 routes measured on 2026-09-01; the floor is set below that so an added or
   removed page does not fail this gate, and high enough that an empty or
   half written dist cannot pass by having nothing to object to. */
const MIN_ROUTES = 30;

/* Characters the site paints that NO face here carries. Closed list: anything
   outside it fails. Each entry names where it is used so a reader can decide
   whether the fallback is acceptable rather than taking the list on trust. */
const KNOWN_UNCOVERED = new Map([
  [0x2192, 'rightwards arrow, used in blog and terms prose'],
  [0x2318, 'place of interest sign, the command palette hint in the header'],
  [0x2713, 'check mark, cookie preferences and consent tables'],
  [0x2264, 'less-than or equal to, tender matrix rule text'],
  [0x2265, 'greater-than or equal to, crowmark-buyers copy'],
  [0x2A7D, 'less-than or slanted equal to, tender matrix rule text'],
  [0x25d4, 'circle with upper right quadrant black, pricing CSS content'],
]);

/* ── woff2 to cmap, without a font library ────────────────────────────────── */

/** woff2 stores tables brotli compressed as one block after the directory.
 *  Only the directory needs decoding here, and then the whole block at once. */
const KNOWN_TAGS = [
  'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm',
  'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern',
  'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC',
  'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar',
  'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
  'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat',
  'Gloc', 'Feat', 'Sill',
];

function readUIntBase128(buf, posRef) {
  let accum = 0;
  for (let i = 0; i < 5; i += 1) {
    const b = buf[posRef.p];
    posRef.p += 1;
    if (i === 0 && b === 0x80) throw new Error('woff2: leading zero in UIntBase128');
    if (accum & 0xfe000000) throw new Error('woff2: UIntBase128 overflow');
    accum = (accum << 7) | (b & 0x7f);
    if ((b & 0x80) === 0) return accum >>> 0;
  }
  throw new Error('woff2: UIntBase128 too long');
}

/** Returns the decompressed table data plus a tag to offset and length map. */
function woff2Tables(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${file}: not a woff2`);
  const numTables = buf.readUInt16BE(12);
  const totalCompressed = buf.readUInt32BE(20);
  const ref = { p: 48 };
  const entries = [];
  for (let i = 0; i < numTables; i += 1) {
    const flags = buf[ref.p];
    ref.p += 1;
    let tag;
    if ((flags & 0x3f) === 0x3f) {
      tag = buf.toString('latin1', ref.p, ref.p + 4);
      ref.p += 4;
    } else {
      tag = KNOWN_TAGS[flags & 0x3f];
      if (!tag) throw new Error(`${file}: unknown table flag ${flags & 0x3f}`);
    }
    const origLength = readUIntBase128(buf, ref);
    let transformLength = origLength;
    const version = (flags >> 6) & 0x03;
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    if (transformed) transformLength = readUIntBase128(buf, ref);
    entries.push({ tag, length: transformLength });
  }
  const data = zlib.brotliDecompressSync(buf.subarray(ref.p, ref.p + totalCompressed));
  const out = new Map();
  let off = 0;
  for (const e of entries) {
    out.set(e.tag, { offset: off, length: e.length });
    off += e.length;
  }
  return { data, out };
}

/** The codepoints a font can paint, from its cmap. Formats 4 and 12 only. */
function fontCodepoints(file) {
  const { data, out } = woff2Tables(file);
  const entry = out.get('cmap');
  if (!entry) throw new Error(`${file}: no cmap table`);
  const base = entry.offset;
  const numSubtables = data.readUInt16BE(base + 2);
  let best = null;
  for (let i = 0; i < numSubtables; i += 1) {
    const rec = base + 4 + i * 8;
    const platform = data.readUInt16BE(rec);
    const encoding = data.readUInt16BE(rec + 2);
    const offset = data.readUInt32BE(rec + 4);
    const format = data.readUInt16BE(base + offset);
    const unicode =
      (platform === 3 && (encoding === 1 || encoding === 10)) || platform === 0;
    if (!unicode) continue;
    if (!best || format === 12) best = { offset: base + offset, format };
  }
  if (!best) throw new Error(`${file}: no unicode cmap subtable`);
  const cps = new Set();
  if (best.format === 4) {
    const segX2 = data.readUInt16BE(best.offset + 6);
    const seg = segX2 / 2;
    const endBase = best.offset + 14;
    const startBase = endBase + segX2 + 2;
    for (let s = 0; s < seg; s += 1) {
      const end = data.readUInt16BE(endBase + s * 2);
      const start = data.readUInt16BE(startBase + s * 2);
      if (start === 0xffff && end === 0xffff) continue;
      for (let c = start; c <= end; c += 1) cps.add(c);
    }
  } else if (best.format === 12) {
    const nGroups = data.readUInt32BE(best.offset + 12);
    for (let g = 0; g < nGroups; g += 1) {
      const rec = best.offset + 16 + g * 12;
      const start = data.readUInt32BE(rec);
      const end = data.readUInt32BE(rec + 4);
      for (let c = start; c <= end; c += 1) cps.add(c);
    }
  } else {
    /* LOUDLY, not silently. An unhandled format must not read as no coverage. */
    throw new Error(`${file}: unsupported cmap format ${best.format}`);
  }
  return cps;
}

/** The wght axis a variable font declares, or null for a static face. */
function fontWeightAxis(file) {
  const { data, out } = woff2Tables(file);
  const entry = out.get('fvar');
  if (!entry) return null;
  const base = entry.offset;
  const axesOffset = data.readUInt16BE(base + 4);
  const axisCount = data.readUInt16BE(base + 8);
  const axisSize = data.readUInt16BE(base + 10);
  for (let i = 0; i < axisCount; i += 1) {
    const rec = base + axesOffset + i * axisSize;
    if (data.toString('latin1', rec, rec + 4) !== 'wght') continue;
    const fixed = (o) => data.readInt32BE(o) / 65536;
    return { min: fixed(rec + 4), max: fixed(rec + 12) };
  }
  return null;
}

/* ── The @font-face declarations, read from the CSS ──────────────────────── */

function parseFontFaces(css) {
  const faces = [];
  const re = /@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const body = m[1];
    const src = /url\(\s*['"]([^'"]+)['"]/.exec(body);
    if (!src) continue; /* the metric fallbacks use local() and have no file */
    const family = /font-family:\s*['"]([^'"]+)['"]/.exec(body);
    const weight = /font-weight:\s*([^;]+);/.exec(body);
    const range = /unicode-range:\s*([^;]+);/.exec(body);
    faces.push({
      family: family ? family[1] : '(unnamed)',
      url: src[1],
      weight: weight ? weight[1].trim().replace(/\s+/g, ' ') : null,
      range: range ? range[1].replace(/\s+/g, ' ').trim() : null,
    });
  }
  return faces;
}

/** "U+0000-00FF, U+0102, ..." to a Set of codepoints. */
function expandRange(text) {
  const cps = new Set();
  for (const part of text.split(',')) {
    const t = part.trim();
    if (!t) continue;
    const m = /^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/.exec(t);
    if (!m) throw new Error(`unicode-range: cannot parse "${t}"`);
    const a = parseInt(m[1], 16);
    const b = m[2] ? parseInt(m[2], 16) : a;
    for (let c = a; c <= b; c += 1) cps.add(c);
  }
  return cps;
}

/* ── The characters the built pages actually paint ───────────────────────── */

function builtCharacters(dir) {
  const chars = new Map(); /* codepoint -> first route that carries it */
  let routes = 0;
  const decode = (s) =>
    s
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'");
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (!/\.(html|css|js)$/i.test(e.name)) continue;
      const rel = path.relative(dir, p).split(path.sep).join('/');
      if (e.name.endsWith('.html')) routes += 1;
      let text = fs.readFileSync(p, 'utf8');
      if (e.name.endsWith('.html')) {
        text = text
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ');
        text = decode(text);
      }
      for (const ch of text) {
        const cp = ch.codePointAt(0);
        if (cp < 0x20) continue;
        if (!chars.has(cp)) chars.set(cp, rel);
      }
    }
  };
  walk(dir);
  return { chars, routes };
}

/* ── Run ─────────────────────────────────────────────────────────────────── */

const failures = [];
const notes = [];

if (!fs.existsSync(DIST)) {
  console.error(`check-font-coverage: no build at ${DIST}. Run astro build first.`);
  process.exit(1);
}

const css = fs.readFileSync(FONTS_CSS, 'utf8');
const faces = parseFontFaces(css);
if (faces.length === 0) failures.push('fonts.css declares no @font-face with a file');

const declaredRanges = new Set();
let union = new Set();

for (const face of faces) {
  const file = path.join(FONTS_DIR, path.basename(face.url));
  if (!fs.existsSync(file)) {
    failures.push(`${face.family}: ${face.url} is declared but no file exists at ${file}`);
    continue;
  }

  /* 1 and 2. The declared range against the file's own cmap. */
  if (!face.range) {
    failures.push(`${face.family} (${path.basename(file)}): no unicode-range declared`);
  } else {
    declaredRanges.add(face.range);
    const declared = expandRange(face.range);
    const actual = fontCodepoints(file);
    const unreachable = [...actual].filter((c) => !declared.has(c)).sort((a, b) => a - b);
    if (unreachable.length) {
      failures.push(
        `${face.family} (${path.basename(file)}): the file carries ${unreachable.length} ` +
          `codepoint(s) the declared unicode-range excludes, so the browser will paint ` +
          `them from the fallback even though this face has them: ` +
          unreachable.slice(0, 12).map((c) => `U+${c.toString(16).toUpperCase().padStart(4, '0')}`).join(' ')
      );
    }
    for (const c of actual) union.add(c);
  }

  /* 3 and 4. The declared font-weight against the file's own wght axis. */
  const axis = fontWeightAxis(file);
  const declaredWeight = face.weight;
  if (axis) {
    const want = `${axis.min} ${axis.max}`;
    if (declaredWeight !== want) {
      failures.push(
        `${face.family} (${path.basename(file)}): declares font-weight "${declaredWeight}" ` +
          `but the file's fvar wght axis is ${want}. A declaration wider than the axis ` +
          `hands the browser a weight the face cannot reach; a narrower one hides weight ` +
          `the file was paid for.`
      );
    }
  } else if (declaredWeight && /\s/.test(declaredWeight)) {
    failures.push(
      `${face.family} (${path.basename(file)}): declares a weight RANGE "${declaredWeight}" ` +
        `but the file is a static face with no fvar table.`
    );
  }
}

/* All five faces must declare the SAME range. CSS has no way to share a
   descriptor, so the only defence against one of them drifting is to compare
   them with each other. */
if (declaredRanges.size > 1) {
  failures.push(
    `the ${faces.length} @font-face blocks declare ${declaredRanges.size} different ` +
      `unicode-range values. They cover the same charset and must read identically, ` +
      `or a future edit will fix one and leave the rest.`
  );
}

/* 5. Every character on every built page. */
const { chars, routes } = builtCharacters(DIST);
if (routes < MIN_ROUTES) {
  failures.push(
    `only ${routes} built page(s) found under ${DIST}, below the floor of ${MIN_ROUTES}. ` +
      `A coverage check over an empty build passes by having nothing to look at.`
  );
}

const uncovered = [];
for (const [cp, where] of chars) {
  if (union.has(cp)) continue;
  if (KNOWN_UNCOVERED.has(cp)) {
    notes.push(
      `U+${cp.toString(16).toUpperCase().padStart(4, '0')} ${String.fromCodePoint(cp)} ` +
        `falls back to a system face (${KNOWN_UNCOVERED.get(cp)})`
    );
    continue;
  }
  uncovered.push([cp, where]);
}
uncovered.sort((a, b) => a[0] - b[0]);
for (const [cp, where] of uncovered) {
  failures.push(
    `U+${cp.toString(16).toUpperCase().padStart(4, '0')} "${String.fromCodePoint(cp)}" ` +
      `appears in ${where} and NO font on this site carries it. Either add it to the ` +
      `subset in scripts/build-fonts.py and re-run it, or replace the character in the ` +
      `copy. Do not add it to KNOWN_UNCOVERED without deciding that a system fallback ` +
      `is acceptable there.`
  );
}

console.log(`check-font-coverage: ${faces.length} face(s), ${union.size} codepoints covered, ` +
  `${chars.size} distinct characters across ${routes} built page(s)`);
for (const n of notes.sort()) console.log(`  note  ${n}`);

if (failures.length) {
  console.error(`\ncheck-font-coverage FAILED with ${failures.length} finding(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('check-font-coverage OK');
