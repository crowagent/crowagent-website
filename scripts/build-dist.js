#!/usr/bin/env node
/**
 * Build the deployable site into `dist/`.
 *
 * WHY THIS EXISTS. Cloudflare Pages publishes whatever directory it is pointed at,
 * and this project pointed it at the repository ROOT. That shipped every tracked
 * file: 135 files under `.dev-tools/`, 70 under `tests/`, 35 under `scripts/`, 14
 * under `specs/`, plus package.json and the lockfiles. All of it was publicly
 * fetchable on crowagent.ai and returned 200.
 *
 * ENABLED 2026-07-29: the Pages Build output directory is set to `dist`.
 *
 * `_redirects` CANNOT fix that, and this was verified live rather than assumed:
 * Cloudflare serves an existing static asset BEFORE consulting redirect rules, so
 * a rule can never shadow a file that is actually deployed. With gating rules in
 * place, /tests/accessibility.spec.js and /.dev-tools/arch1-chunk-extract.js both
 * still returned 200. The only real fix is to stop deploying them.
 *
 * ALLOWLIST, NOT DENYLIST. A denylist fails open: the day someone adds
 * `internal-notes/`, it ships. An allowlist fails closed — a new directory is
 * absent until someone deliberately adds it here, and the reference check below
 * turns that omission into a build failure rather than a silent 404 in production.
 *
 * THE REFERENCE CHECK IS THE POINT. Copying is easy to get subtly wrong, and the
 * failure mode is a missing stylesheet on one page that nobody notices for a week.
 * So after copying, every asset referenced by the built HTML *and* by the injector
 * scripts is resolved against `dist/`. Anything missing fails the build loudly.
 * That includes JS-injected assets, which an HTML-only scan would miss entirely —
 * nav-inject.js appends the nav, the footer, nav-global-fix.css, premium-gloss.css,
 * sovereign-cmdk.css and back-to-top.css at runtime.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

/** Directories the site serves in full. */
const DIRS = [
  "Assets",
  "js",
  "blog",
  "compare",
  "sectors",
  "glossary",
  "tools",
  "Doc",
];

/** Root files the site serves. Extensions, plus a few exact names. */
const ROOT_EXTS = [".html", ".css", ".js", ".xml", ".txt", ".png", ".svg", ".ico", ".webmanifest"];
const ROOT_EXACT = ["_headers", "_redirects", "manifest.json", "site.webmanifest"];

/**
 * Root files that match an allowed extension but must NOT ship. `styles.css`,
 * `styles.min.css` and `styles.purged.css` are ~2MB of legacy CSS that no page
 * loads; `styles.css` is the input to a build script and `sovereign-core-v2.css`
 * is the Tailwind source for the compiled sheet that IS loaded.
 */
const ROOT_DENY = new Set([
  "styles.css",
  "styles.min.css",
  "styles.purged.css",
  // Build INPUT for scripts.min.js, which is the file pages actually load. Its
  // only references are in comments, confirmed by the reference check below
  // passing without it.
  "scripts.js",
]);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) n += copyDir(s, d);
    else { fs.copyFileSync(s, d); n += 1; }
  }
  return n;
}

// ── 1. Build ────────────────────────────────────────────────────────────────
// Windows holds handles on freshly-created directories (indexers, watchers), so a
// bare rmSync can EPERM on a dist/ that was written seconds earlier. Retry rather
// than fail a build for a transient lock.
fs.rmSync(DIST, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
fs.mkdirSync(DIST, { recursive: true });

let copied = 0;
for (const dir of DIRS) copied += copyDir(path.join(ROOT, dir), path.join(DIST, dir));

for (const name of fs.readdirSync(ROOT)) {
  const full = path.join(ROOT, name);
  if (!fs.statSync(full).isFile()) continue;
  if (ROOT_DENY.has(name)) continue;
  // `.js` in ROOT_EXTS also matches *.test.js and *.config.js. Those shipped into
  // dist/ on the first run, which both defeats the point of this script and made
  // Jest collect them from dist/. Rejected by shape, not by listing each one.
  if (/\.(test|spec)\.[cm]?js$/.test(name)) continue;
  if (/\.config\.[cm]?js$/.test(name)) continue;
  const ok = ROOT_EXACT.includes(name) || ROOT_EXTS.includes(path.extname(name));
  if (!ok) continue;
  fs.copyFileSync(full, path.join(DIST, name));
  copied += 1;
}
console.log(`  copied ${copied} files into dist/`);

// ── 2. Prove nothing the site references was left behind ────────────────────
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) htmlFiles.push(p);
  }
})(DIST);

const missing = new Set();
// The closing quote is load-bearing, and the alternation is ordered longest-first.
// Without both, `js` matches inside `.json` and the alternation stops there, so
// `/manifest.json` is read as a reference to a non-existent `/manifest.js`. That
// produced 33 phantom "missing asset" failures on the first run of this script.
const ASSET_RE = /(?:src|href)="(\/[^"\s?]+\.(?:jpeg|woff2|json|webp|avif|html|css|jpg|png|svg|xml|txt|js))(?:\?[^"]*)?"/g;

for (const file of htmlFiles) {
  const src = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, " ");
  for (const m of src.matchAll(ASSET_RE)) {
    if (!fs.existsSync(path.join(DIST, m[1]))) missing.add(`${m[1]}  (referenced by ${path.relative(DIST, file)})`);
  }
}

// Assets appended at runtime by the injectors are invisible to the scan above.
const INJECTORS = [path.join(DIST, "js", "nav-inject.js")];
const modDir = path.join(DIST, "js", "modules");
if (fs.existsSync(modDir)) {
  for (const f of fs.readdirSync(modDir)) if (f.endsWith(".js")) INJECTORS.push(path.join(modDir, f));
}
const INJ_RE = /['"](\/[A-Za-z0-9_./-]+\.(?:woff2|json|webp|avif|css|svg|png|js))(?:\?[^'"]*)?['"]/g;
for (const file of INJECTORS) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
  for (const m of src.matchAll(INJ_RE)) {
    if (!fs.existsSync(path.join(DIST, m[1]))) missing.add(`${m[1]}  (injected by ${path.basename(file)})`);
  }
}

console.log(`  ${htmlFiles.length} pages, ${INJECTORS.length} injector script(s) checked`);

if (missing.size) {
  console.error(`\n  BUILD FAILED — ${missing.size} referenced asset(s) are not in dist/:`);
  for (const m of [...missing].sort().slice(0, 25)) console.error(`    ${m}`);
  console.error("\n  Add the missing directory to DIRS in scripts/build-dist.js.");
  process.exit(1);
}

// ── 3. Prove the dev surface did NOT ship ───────────────────────────────────
const MUST_NOT_SHIP = ["tests", ".dev-tools", "specs", "scripts", "docs", "cloudflare-workers", ".github", ".husky", "node_modules", "coverage", "package.json", "package-lock.json", "pnpm-lock.yaml"];
const leaked = MUST_NOT_SHIP.filter((n) => fs.existsSync(path.join(DIST, n)));

// Pattern leaks the name list cannot express. A stray *.test.js in dist/ passed the
// check above and was only caught because Jest then collected it from dist/.
const strays = [];
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) scan(full);
    else if (/\.(test|spec)\.[cm]?js$/.test(e.name) || /\.config\.[cm]?js$/.test(e.name)) {
      strays.push(path.relative(DIST, full));
    }
  }
})(DIST);
if (strays.length) {
  console.error(`
  BUILD FAILED — test/config files leaked into dist/: ${strays.join(", ")}`);
  process.exit(1);
}
if (leaked.length) {
  console.error(`\n  BUILD FAILED — dev surface leaked into dist/: ${leaked.join(", ")}`);
  process.exit(1);
}

console.log("  no referenced asset missing; no dev surface leaked");
console.log("  dist/ is ready — set the Pages build output directory to `dist`");
