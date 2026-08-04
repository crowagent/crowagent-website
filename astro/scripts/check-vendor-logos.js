/**
 * check-vendor-logos.js — every third-party mark this site serves must be a
 * recorded, on-disk, local asset.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 *
 * The marks in Assets/brand/integrations/ are other companies' registered trade
 * marks. Displaying one is a factual claim about a product, and displaying the
 * wrong one, or an out-of-date one, or one the vendor's own guidelines forbid,
 * is a defect of the same kind as a wrong statutory figure — with the added
 * feature that nobody on this side will ever notice it.
 *
 * The state this gate was written into, on 2026-08-04, is the argument for it.
 * Nine marks were being served. Not one of them had a recorded source. The
 * Microsoft corporate symbol was standing in for both SharePoint and OneDrive,
 * two products with their own published icons. Its four squares were in the
 * wrong hexes. Confluence Cloud had no mark at all and drew a placeholder dot
 * beside a name whose official mark is freely obtainable. Two more marks were
 * generations the vendor had retired. Every one of those is discoverable in
 * about a minute IF somebody thinks to look, and in the eleven months this
 * directory existed nobody did, because there was no artefact that asked.
 *
 * ── WHAT IT CHECKS, AND IT FAILS IN BOTH DIRECTIONS ─────────────────────────
 *
 *   1. FORWARD.  Every /Assets/brand/integrations/… path referenced anywhere in
 *      astro/src must have a row in LOGO-PROVENANCE.md. Adding a mark to a
 *      component without recording where it came from fails the build.
 *
 *   2. BACKWARD. Every file named in LOGO-PROVENANCE.md must exist on disk, and
 *      every referenced path must resolve to a real file. A record that names a
 *      file nobody can produce is worse than no record: it reads as evidence.
 *
 * Both directions are load-bearing. A gate that only checks one of them can be
 * satisfied by deleting the thing it was meant to protect.
 *
 * ── WHAT IT DELIBERATELY DOES NOT CHECK ─────────────────────────────────────
 *
 * Whether a mark is the vendor's CURRENT one. No script can see that; it needs a
 * person to open the vendor's brand page. What this gate does instead is make
 * sure there is always a written record naming a source and a date, so that the
 * question "is this still right?" has somewhere to start. The `Status` column in
 * the record is where the answer lives, and several rows in it currently say no.
 *
 * It also does not police the fallback. A connector with no mark renders a
 * neutral dot, which is a correct end state and not a gap — see the `logo` field
 * in src/data/integrations.ts.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 *
 * It reads SOURCE, not dist, and that is on purpose. copy-assets.js already
 * fails the build if a referenced asset is missing from the built output; this
 * one has to fire on the file a person is editing, including a mark added to a
 * component that is not yet rendered on any route.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');
const REPO_ROOT = path.join(__dirname, '..', '..');
const LOGO_DIR = path.join(REPO_ROOT, 'Assets', 'brand', 'integrations');
const RECORD = path.join(LOGO_DIR, 'LOGO-PROVENANCE.md');

/** The public path prefix every vendor mark is served from. */
const PREFIX = '/Assets/brand/integrations/';

if (!fs.existsSync(RECORD)) {
  console.error(`vendor-logos: no provenance record at ${path.relative(REPO_ROOT, RECORD)}`);
  console.error('  Every third-party mark on this site needs one. Do not delete it to pass.');
  process.exit(1);
}

/**
 * The record's rows name their file in the first cell as inline code. Parsing
 * for `` `name.svg` `` rather than for a table shape keeps the prose free to be
 * reformatted without silently emptying the list — an empty list would make this
 * gate pass by finding nothing to check, which is the failure mode a provenance
 * check must not have.
 */
const recordText = fs.readFileSync(RECORD, 'utf8');
const recorded = new Set([...recordText.matchAll(/`([A-Za-z0-9._-]+\.svg)`/g)].map((m) => m[1]));

if (recorded.size === 0) {
  console.error('vendor-logos: the provenance record names no asset files at all.');
  console.error('  Either the table was emptied or its format changed. Both need a person.');
  process.exit(1);
}

/** Every text file under src that could reference a mark. */
function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(astro|ts|tsx|js|mjs|md|mdx|css)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Matches a served path. The reference in src is usually a template literal
 * split across a prefix constant and a filename, so the filename alone is
 * matched too — a `${LOGOS}/color-slack.svg` must not slip past because the
 * directory half of it lives on another line.
 */
const FULL_PATH = new RegExp(`${PREFIX.replace(/\//g, '\\/')}([A-Za-z0-9._-]+\\.svg)`, 'g');
const TEMPLATE_PATH = /\$\{LOGOS\}\/([A-Za-z0-9._-]+\.svg)/g;

/** filename -> the src files that reference it */
const referenced = new Map();
for (const file of sourceFiles(SRC)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const re of [FULL_PATH, TEMPLATE_PATH]) {
    for (const m of text.matchAll(re)) {
      if (!referenced.has(m[1])) referenced.set(m[1], new Set());
      referenced.get(m[1]).add(path.relative(REPO_ROOT, file));
    }
  }
}

const problems = [];

/* 1. FORWARD — referenced but unrecorded, or referenced but not on disk. */
for (const [file, where] of referenced) {
  if (!fs.existsSync(path.join(LOGO_DIR, file))) {
    problems.push({
      file,
      why: 'referenced but the file is not in Assets/brand/integrations/',
      where: [...where],
    });
    continue;
  }
  if (!recorded.has(file)) {
    problems.push({
      file,
      why: 'served by the site but has no row in LOGO-PROVENANCE.md — record the vendor, the source URL, the date it was retrieved and the brand permission relied on',
      where: [...where],
    });
  }
}

/* 2. BACKWARD — recorded but missing from disk. */
for (const file of recorded) {
  if (!fs.existsSync(path.join(LOGO_DIR, file))) {
    problems.push({
      file,
      why: 'named in LOGO-PROVENANCE.md but is not on disk — a record that names a file nobody can produce reads as evidence and is not',
      where: [path.relative(REPO_ROOT, RECORD)],
    });
  }
}

console.log(
  `vendor-logos: ${referenced.size} mark(s) referenced from src, ${recorded.size} recorded in LOGO-PROVENANCE.md`
);
for (const [file, where] of referenced) {
  console.log(`  ${file}  (${where.size} file(s) in src)`);
}

/* Recorded but unreferenced is reported, not failed. An asset kept on disk while
   an owner decision is pending is legitimate; an asset nobody can account for is
   not. The distinction is a person's to draw, so this prints and moves on. */
const unreferenced = [...recorded].filter((f) => !referenced.has(f));
if (unreferenced.length) {
  console.log(`\nvendor-logos: ${unreferenced.length} recorded mark(s) not referenced anywhere in src:`);
  unreferenced.forEach((f) => console.log(`  ${f}  — still on disk and still recorded; nothing serves it`));
}

if (problems.length) {
  console.error(`\nvendor-logos: ${problems.length} problem(s)\n`);
  for (const p of problems) {
    console.error(`  ${p.file}`);
    console.error(`      ${p.why}`);
    p.where.slice(0, 5).forEach((w) => console.error(`      in: ${w}`));
  }
  console.error('\n  These marks belong to other companies. Serving one that is undocumented,');
  console.error('  missing, or invented is a claim this site cannot stand behind.');
  console.error('  Assets/brand/integrations/LOGO-PROVENANCE.md sets out what a row needs.\n');
  process.exit(1);
}

console.log('\n  every referenced mark is on disk and recorded, and every record has its file');
