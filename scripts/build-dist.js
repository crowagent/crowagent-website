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
const crypto = require("crypto");

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

/**
 * Directories inside an allowlisted DIR that must NOT ship. Measured 2026-07-30:
 * dist/ carried 161 assets totalling 15.3 MB that NOTHING references — the build's
 * reference check only proves the other direction (that referenced assets exist), so
 * an unreferenced file stays publicly fetchable forever. These four directories were
 * 100% unreferenced:
 *
 *   Assets/product-shots        60 files, 6.0 MB — screenshots of REMOVED products
 *                               (app-esg-*, app-cash-*, app-cyber-*). Weight is the
 *                               lesser problem: anyone could fetch
 *                               crowagent.ai/Assets/product-shots/app-cash-invoices.png
 *                               and see a product the site no longer sells.
 *   Assets/marketing-screenshots 7 files, 2.9 MB — internal working files, e.g.
 *                               `app.crowagent.ai_ppn002_social_cal.png`.
 *   Assets/photos/sectors        6 files, 581 KB
 *   Assets/blog-heroes           7 files, 132 KB
 *
 * SAFETY NET: if any of these is in fact referenced, the reference check below FAILS
 * THE BUILD. So a wrong entry here is loud, not silent.
 *
 * DELIBERATELY NOT LISTED: `Doc/` (2 legal PDFs, 510 KB, both unreferenced). Stale or
 * archived legal documents may be linked from a contract or an email, so withdrawing
 * them is an owner decision, not a build cleanup. Flagged in the backlog.
 * Also left: Assets/logo (4 KB) — too small to be worth risking a brand asset over.
 *
 * Assets/og/avif WAS left on the same "too small to matter" reasoning, and is now
 * denied. It holds one file, crowmark.avif, dated 2026-05-12, referenced by zero
 * pages. Regenerating the OG cards on 2026-07-30 changed the CrowMark card's copy,
 * so that AVIF became a publicly fetchable picture of a card that no longer exists.
 * Size stopped being the deciding factor once the content went stale.
 */
const ASSET_DENY_DIRS = [
  path.join("Assets", "product-shots"),
  path.join("Assets", "marketing-screenshots"),
  path.join("Assets", "photos", "sectors"),
  path.join("Assets", "blog-heroes"),
  path.join("Assets", "og", "avif"),
  // Assets/shots/_raw — 14 files, 3.7 MB, referenced by ZERO HTML. This is the
  // screenshot harness's staging area and it was shipping straight to production.
  //
  // Withdrawing a marketing image does not withdraw the capture it came from.
  // `mark-reports.png` was deleted from the site in f2c7bc2d for leaking internal
  // table names, and on 2026-07-30 its source, _raw/reports-desktop-dark.png, was
  // still fetchable at crowagent.ai — verified by READING the copy in dist/, which
  // shows 12 of them: crowmark_contracts, bid_learnings, crowmark_measures,
  // crowmark_evidence, crowmark_extracted_requirements, crowmark_compliance_matrix,
  // crowmark_bid_assignments, profiles, bid_answer_library, crowmark_clarifications,
  // company_frameworks, crowmark_lots.
  //
  // The rest of the directory is no better: captures already rejected for showing
  // "Your session has expired", "Couldn't load this section", "Create your first
  // contract" against a sidebar reading 18, a red "Compliance Health Score 41 Off
  // track" exposing £237 and two archived products, plus 3 internal manifest JSONs.
  // A staging directory should never have been inside the shipped tree.
  path.join("Assets", "shots", "_raw"),

  // Assets/screenshots — 6 files, 260KB, 0 of 6 referenced by anything. These are
  // NOT screenshots. Both were READ 2026-07-30 and both are hand-built MOCKUPS of
  // user interfaces that do not exist, inside fake browser chrome stamped
  // "app.crowagent.ai":
  //
  //   crowmark.png/webp/avif — a "Social Value Contracts" screen whose sidebar lists
  //     "EPC & MEES Check" and "Monitoring", neither of which is in CrowMark. It
  //     attributes INVENTED contracts and INVENTED scores to REAL public bodies:
  //     "NHS Greater Manchester - Digital Health Records Platform" 82/100,
  //     "Department for Education - Schools IT Modernisation" 91/100,
  //     "Birmingham City Council - Fleet Electrification" 67/100, plus "12 narratives
  //     generated" and a "94% average score". Naming real authorities against
  //     fabricated contracts and fabricated scores is the most serious honesty defect
  //     found on this site, and it is compounded by framing AI output as a SCORE —
  //     the product frames bid marking as rubric coverage, never a score.
  //
  //   analytics.png/webp/avif — a "Compliance Analytics" screen for the CrowAgent
  //     Core / MEES product that was switched off 2026-07-17: EPC Band Distribution,
  //     "Retrofit ROI Projection", a "CSRD Checker" nav item, £14.2M portfolio value,
  //     £127K exposure, 58.4 average EPC, 42% compliance rate, and a fabricated named
  //     user "James Thompson - Portfolio - 12 properties". MEES claims are legally
  //     sensitive on this site (see CLAUDE.md), which makes invented EPC compliance
  //     figures a poor thing to leave publicly fetchable.
  //
  // Unreferenced, so nothing on the site breaks. They must never be published.
  path.join("Assets", "screenshots"),
];
/**
 * Individual files that must not ship, for cases a directory rule cannot express:
 * both of these sit in `Assets/shots/tablet` and `Assets/shots/mobile` alongside
 * shots that ARE published, so denying the directory would pull the good ones too.
 *
 * Both were unreferenced but publicly fetchable, and both were READ before being
 * denied (2026-07-30) — the filename told you nothing:
 *
 *   shots/tablet/crowmark-tablet-dark-02.png
 *     Literal "Test Contract 1" / "Test Authority" in the contracts table. An empty
 *     tenant: 0 active contracts, "—" win rate, 0 bids won, "No submissions
 *     recorded", "No contracts awarded". A red "Unable to load opportunities" error
 *     panel. Support chat bubble baked in. Right edge clips the Delete button.
 *
 *   shots/mobile/crowmark-mobile-LIGHT-01.png
 *     Every headline metric empty or zero: 1 Total Contract, 0% Bid Win Rate, "—"
 *     Social Value Delivered, 0% Evidence Completion. Chat bubble baked in. Compare
 *     the published crowmark-mobile-dark-02, which shows 18 contracts, a 70% win
 *     rate and £2,385,950.
 *
 * Same safety net as ASSET_DENY_DIRS: if either is in fact referenced, the reference
 * check below FAILS THE BUILD, so a wrong entry here is loud rather than silent.
 * Paths are repo-relative with forward slashes.
 */
const ASSET_DENY_FILES = new Set([
  "Assets/shots/tablet/crowmark-tablet-dark-02.png",
  "Assets/shots/mobile/crowmark-mobile-LIGHT-01.png",

  // Three copies of "og-image.png" existed and all three shipped (2026-07-30):
  //   Assets/og-image.png       100,135 B  referenced by 21 pages   <- the real one
  //   Assets/og/og-image.png    100,135 B  referenced by 0          <- byte-identical
  //   og-image.png (repo root)   27,658 B  referenced by 0          <- different file
  // Verified by md5: the first two are the same bytes, the root one is not the same
  // image at all. Neither unreferenced copy is reachable from any HTML, CSS, JS or
  // JSON, so both are withheld. Keeping the referenced Assets/og-image.png exactly
  // where the 21 pages expect it.
  "Assets/og/og-image.png",
  "og-image.png",

  // A minified twin of crowagent-brand-tokens.css, which IS loaded by 43 pages.
  // 9,112 B against the loaded sheet's 19,769 B, referenced by nothing but a
  // .dev-tools script. It sits at the repo root, so the reachability prune on
  // Assets/css cannot reach it; the root copy loop honours this list instead.
  "crowagent-brand-tokens.min.css",

  // Orphaned 2026-07-30 when nav-inject.js stopped injecting it. Its only effect was
  // toggling `body.is-scrolled`, which no loaded stylesheet reacts to — verified on 5
  // pages by forcing the class and finding zero computed differences on the nav.
  //
  // Denied as a single FILE rather than by adding js/modules to REFERENCED_ONLY_DIRS.
  // A directory rule there would need the scan to see every way a module can be
  // referenced, including dynamic import() and Worker(); two reachability prunes have
  // already broken live references this session (srcset, then <?xml-stylesheet?>), so
  // one explicit entry with evidence beats a rule whose blind spots are unproven.
  "js/modules/nav-shrink.js",

  // Orphaned 2026-07-30 with nav-shrink, for the same reason: nav-inject.js stopped
  // injecting them after each was measured to have ZERO targets on all 43 pages.
  // Dead rather than broken — for every one, neither the markup nor the effect CSS
  // exists anywhere in the repo (see the note in nav-inject.js for the per-module
  // selector counts and the evidence). 13,255 bytes between them.
  "js/modules/sticky-storytelling.js",
  "js/modules/logo-shimmer.js",
  "js/modules/section-parallax.js",
  "js/modules/demo-autoplayer.js",
  "js/modules/blog-reading-time.js",

  // Orphaned 2026-07-30 by removing their <script src> tags, after measuring that
  // each had no live work. These were loaded DIRECTLY by pages, not injected:
  //   motion-system.js       17 pages, 7,713 B — its 6 selectors (.ms-reveal,
  //     .ms-scene-step, [data-ms-scene], .ms-parallax-soft, .ms-demo video) match 0
  //     elements on all 17, and window.caMotion is referenced by 0 other files.
  //   ca-form-validation.js   2 pages, 6,815 B — a LIBRARY exposing
  //     window.CAFormValidation, which nothing calls anywhere. roadmap.html has 0
  //     forms at all; partners.html's form is handled by partners-form.js.
  //   nebula-livepanels.js    1 page (index), 9,036 B — 8 selectors match 0; the only
  //     mentions of [data-nbl] in index.html are inside comments.
  //
  // NOT removed, and both looked dead by selector count: reveal-failsafe.js builds
  // its selectors from constants (FORCE_SEL includes `main section`), and
  // tool-teaser.js exposes CAToolTeaser / CrowAgentTeaser, called by 3 other files.
  "js/modules/motion-system.js",
  "js/modules/ca-form-validation.js",
  "js/nebula-livepanels.js",

  // Orphaned 2026-07-30 when the homepage tab carousel was removed. Its ONLY job was
  // driving that carousel — its selectors are [data-nb-showcase], [role=tab],
  // .nb-panels, [data-nb-toggle], [data-nb-status], .sr-only — and it guards with
  // `if (!tabs.length) return`, so it would have loaded on the homepage and done
  // nothing at all.
  "js/nebula-showcase.js",
]);

let deniedFiles = 0, deniedBytes = 0;

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  const relFromRoot = path.relative(ROOT, src);
  if (ASSET_DENY_DIRS.some((d) => relFromRoot === d || relFromRoot.startsWith(d + path.sep))) {
    // Count what we are refusing to ship, so the build reports it rather than hiding it.
    (function tally(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) tally(p);
        else { deniedFiles += 1; deniedBytes += fs.statSync(p).size; }
      }
    })(src);
    return 0;
  }
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) { n += copyDir(s, d); continue; }
    // Authoring notes must never ship. Found 2026-07-30 by the widened retired-name
    // gate: Assets/photos/PHOTO-ATTRIBUTIONS.md was a PUBLIC URL containing 18
    // mentions of retired products. Two more (.md) files were shipping with it.
    // Markdown is an authoring format on this site; no page loads one.
    if (path.extname(entry.name).toLowerCase() === ".md") {
      deniedFiles += 1;
      deniedBytes += fs.statSync(s).size;
      continue;
    }
    if (ASSET_DENY_FILES.has(path.relative(ROOT, s).split(path.sep).join("/"))) {
      deniedFiles += 1;
      deniedBytes += fs.statSync(s).size;
      continue;
    }
    fs.copyFileSync(s, d);
    n += 1;
  }
  return n;
}

// ── 1. Build ────────────────────────────────────────────────────────────────
// Windows holds handles on freshly-created directories (indexers, watchers), so a
// bare rmSync can EPERM on a dist/ that was written seconds earlier. Retry rather
// than fail a build for a transient lock.
try {
  fs.rmSync(DIST, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
} catch (err) {
  // EPERM here almost always means a process is SERVING dist/. The retry loop above
  // cannot clear that, and the raw stack trace does not say so, which cost real time
  // more than once. Say it plainly instead.
  if (err && (err.code === "EPERM" || err.code === "EBUSY")) {
    console.error([
      "",
      "  BUILD FAILED — cannot clear dist/ (" + err.code + ").",
      "  Something is holding the directory, almost certainly a web server serving it.",
      "  Stop that server and re-run. On Windows:",
      '    netstat -ano | grep ":8093" | grep LISTENING     # find the PID',
      "    taskkill //PID <pid> //F",
      "  The repo-root server on :8092 is a different process and can stay up.",
      "",
    ].join("\n"));
    process.exit(1);
  }
  throw err;
}
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
  // Root-level files bypass copyDir entirely, so they need the same deny check or
  // an ASSET_DENY_FILES entry for one silently does nothing. Found the hard way:
  // adding "og-image.png" to the deny set left it still shipping.
  if (ASSET_DENY_FILES.has(name)) {
    deniedFiles += 1;
    deniedBytes += fs.statSync(full).size;
    continue;
  }
  fs.copyFileSync(full, path.join(DIST, name));
  copied += 1;
}
console.log(`  copied ${copied} files into dist/`);
if (deniedFiles) {
  console.log(
    "  withheld " + deniedFiles + " unreferenced asset(s), " +
      (deniedBytes / 1024 / 1024).toFixed(1) + " MB (see ASSET_DENY_DIRS)"
  );
}

// ── 1b. Minify CSS and JS **in dist/ only** ─────────────────────────────────
//
// WHY THIS IS HERE AND NOT IN THE SOURCES. Measured with Lighthouse 13.3.0 on
// 2026-07-30, mobile, simulated throttling, against the un-minified tree:
//   performance 48/100, FCP 6.4s, LCP 8.1s, TBT 420ms, 1,031 KiB over 45 requests
//   (stylesheets alone 450 KB).
// Lighthouse attributed ~840ms to unminified CSS and ~970ms to unminified JS. The
// worst single offenders were `js/nav-inject.js` (108 KB, 62 KB of it minifiable)
// and `Assets/css/ultra-premium-responsive.css` (50 KB, 32 KB minifiable).
//
// Those sources are heavily commented ON PURPOSE. Nearly every rule in
// nav-global-fix and premium-gloss carries a note recording the defect it fixes,
// the measurement that proved it, and the owner decision behind it, and that
// documentation has already prevented several regressions from being
// re-introduced. Stripping the comments out of the sources to win bytes would
// trade the thing that keeps this CSS maintainable for a one-off page-weight gain.
// Minifying into `dist/` gets both: readable, documented sources in the repo and
// comment-free bytes in production.
//
// FAILS LOUDLY. A minifier that cannot parse a file means that file is malformed,
// which is worth knowing immediately. It is never silently shipped unminified,
// because a silent fallback would make this whole step untrustworthy.
{
  const csso = require("csso");
  // esbuild, not terser: this file is CommonJS, terser's v5 API is async-only, and
  // top-level await is not available here. esbuild's transformSync does the same
  // conservative job synchronously.
  const esbuild = require("esbuild");

  /** Already-minified or vendor payloads: re-processing risks breakage for ~0 gain. */
  const skipMinify = (rel) =>
    /\.min\.(js|css)$/i.test(rel) || rel.split(path.sep).includes("vendor");

  const targets = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(css|js)$/i.test(e.name)) targets.push(full);
    }
  })(DIST);

  let before = 0, after = 0, done = 0, skipped = 0;
  const failures = [];

  for (const full of targets) {
    const rel = path.relative(DIST, full);
    const src = fs.readFileSync(full, "utf8");
    before += Buffer.byteLength(src);
    if (skipMinify(rel)) { after += Buffer.byteLength(src); skipped += 1; continue; }
    try {
      let out;
      if (full.toLowerCase().endsWith(".css")) {
        out = csso.minify(src, { restructure: false }).css;
      } else {
        // Deliberately conservative, matching `restructure:false` on the CSS side:
        // whitespace and comments go, identifiers are NOT renamed and syntax is NOT
        // rewritten. Rewriting is where a minifier's edge cases bite, and on these
        // files the win is overwhelmingly from dropping comments rather than from
        // compression. These scripts are also loaded as plain classic scripts, so
        // nothing here may assume module scope.
        out = esbuild.transformSync(src, {
          loader: "js",
          minifyWhitespace: true,
          minifyIdentifiers: false,
          minifySyntax: false,
          legalComments: "none",
        }).code;
      }
      if (typeof out !== "string" || !out.length) throw new Error("empty output");
      fs.writeFileSync(full, out);
      after += Buffer.byteLength(out);
      done += 1;
    } catch (err) {
      failures.push(`${rel}: ${err && err.message ? err.message : err}`);
      after += Buffer.byteLength(src);
    }
  }

  if (failures.length) {
    console.error(`\n  BUILD FAILED — could not minify:\n    ${failures.join("\n    ")}`);
    process.exit(1);
  }
  const saved = before - after;
  console.log(
    `  minified ${done} file(s), skipped ${skipped} pre-minified/vendor — ` +
      `${(before / 1024).toFixed(0)}KB to ${(after / 1024).toFixed(0)}KB ` +
      `(-${(saved / 1024).toFixed(0)}KB, ${((saved / before) * 100).toFixed(1)}%)`
  );
}

// ── 1c. CSS BUNDLING WAS TRIED AND REVERTED, 2026-07-30. DO NOT RETRY BLIND ──
//
// Lighthouse named render-blocking CSS the largest remaining LCP cause on
// index.html: 11 stylesheets, estimated saving 2,340ms. So a build step was added
// here that concatenated each page's stylesheet links, per contiguous run so an
// inline <style> could never be jumped (37 of 44 pages have one between links).
// It worked as designed: 414 stylesheet links across the site collapsed to 88 via
// 20 content-hashed shared bundles, and every computed style probed on crowmark.html
// was byte-identical to the unbundled build, so the cascade was genuinely preserved.
//
// IT STILL MADE THE PAGE WORSE, AND THE MEASUREMENT IS WHY IT IS NOT HERE:
//   performance 68 -> 67 | FCP 3.9s -> 4.4s | LCP 5.7s -> 5.9s
//   total weight 647 KiB -> 754 KiB
//
// THE CAUSE, confirmed from the network log rather than guessed. `js/nav-inject.js`
// looks for its own stylesheets by href, e.g.
//   document.querySelector('link[href*="nav-global-fix-2026-05-27"]')
// and APPENDS a fresh <link> when it does not find one, so the injected nav is
// never unstyled. Bundling dissolved those hrefs, so the injector stopped
// recognising sheets that were already present inside the bundle and re-downloaded
// nav-global-fix (104 KB) and premium-gloss (7 KB) on top of it. 111 KB of exact
// duplicate, which matches the +107 KiB observed.
//
// So the build and that runtime injector are coupled through href strings. Any
// future attempt has to deal with that first: either exclude those two sheets from
// bundling (which removes most of the benefit, since nav-global-fix is the single
// largest file) or give the injector a way to detect a bundle it cannot read.
//
// AND NOTE THE HEADLINE FINDING: even before the duplicate download, collapsing 11
// requests into 1 did not improve the score. `render-blocking-insight` still
// reported ~2,240ms. The cost is dominated by CSS BYTES that must be parsed before
// first paint, not by the number of requests, and in production those requests
// multiplex over HTTP/2 anyway. Reducing bytes is the lever; collapsing requests is
// not. The remaining unused-CSS measurement (43 KB of 104 KB in nav-global-fix,
// 13 of 15 in premium-transformation, 11 of 16 in ultra-premium-responsive) is
// where the real saving is.

// ── 2. Prove nothing the site references was left behind ────────────────────
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) htmlFiles.push(p);
  }
})(DIST);

/**
 * Directories where a file ships ONLY if something references it.
 *
 * This is the reverse of the check below, applied where being wrong is expensive.
 * `Assets/brand/integrations` holds third-party trademarks, and 19 of its 32 files
 * were referenced by nothing (measured 2026-07-30 by the prune itself) yet publicly
 * fetchable — among them Xero, Sage, QuickBooks, Creditsafe and Experian.
 *
 * Do not audit this by grepping basenames. `grep google.svg` also matches
 * `color-google.svg`, which is how google.svg first read as referenced when it is
 * not. The prune compares exact URL paths, which is the only reliable form.
 *
 * Those five matter specifically. TM-REMEDIATION-001 deleted the ACCOUNTING and
 * CREDIT DATA sections of integrations.html on 2026-07-28, and the comment left in
 * that page says why: the opposing mark belongs to an accounting network, and a page
 * footer-linked from every other page "carrying an 'Accounting' section header and
 * the logos of two credit reference agencies was the clearest evidence on the site of
 * operating in that field". The sections went. The logo files did not, so
 * /Assets/brand/integrations/color-experian.svg still resolved.
 *
 * Same failure mode as the withdrawn screenshot whose raw capture kept shipping:
 * removing the reference is not removing the asset. A snapshot list of today's 18
 * filenames would fix today and rot, so this prunes by reachability on every build
 * and prints what it dropped.
 *
 * SAFE BY CONSTRUCTION: a file is kept if any built HTML or injector references it,
 * which is the same evidence the missing-asset check uses. Comments are stripped
 * first, so a mark named only in an audit comment counts as unreferenced — which is
 * exactly the Xero case.
 */
const REFERENCED_ONLY_DIRS = [
  path.join("Assets", "brand", "integrations"),
  // Assets/blog-photos — hero and card images. 6 of 14 files were unreferenced
  // (measured 2026-07-30): mfa-mandatory-2026, ppn-002-social-value-explained and
  // social-value-themes-explained, in .jpg and .webp, about 776KB. All three posts
  // have been deleted; their images stayed. Reachability handles this better than a
  // list, because the next deleted post cleans itself up.
  //
  // Checked before adding: no CSS `url()` reaches this directory, so the HTML and
  // injector scan is the complete picture. That check is per-directory and must be
  // repeated before adding any other — it would be wrong for a directory whose
  // images are set as CSS backgrounds.
  //
  // NOT added: Assets/og. It still holds 5 retired cards (demo, csrd, crowcyber,
  // crowcash, crowesg) that are an explicit OWNER DECISION, because URLs shared in
  // the past still resolve. Pruning them automatically would pre-empt that call.
  path.join("Assets", "blog-photos"),
  // Assets/css — 6 of its 26 stylesheets were referenced by no page and no injector
  // (measured 2026-07-30): sovereign-primitives.css (28.1KB), sovereign-core-v2.css
  // (11.8KB), nav-footer-sf21.css (10.2KB), pricing-sf16.css (9.9KB),
  // page-archetype-unify.css (7.9KB) and page-fixes-sf22.css (4.3KB).
  //
  // sovereign-core-v2.css is the Tailwind SOURCE for sovereign-core-v2.compiled.css,
  // which is the sheet pages actually load. Publishing a build input is a dev-surface
  // leak in the same family as the tests/ and .dev-tools/ directories this script
  // exists to stop shipping.
  //
  // The per-directory question for stylesheets is @import, not srcset. Checked: the
  // only @import in any shipped sheet is `@import "tailwindcss"` — a bare package
  // specifier inside the orphaned source file itself, not a path to another sheet.
  //
  // Two references DID appear in files that ship, and both turned out to be COMMENTS,
  // which the scan strips. Worth recording because either would have broken the page
  // if it had been live:
  //   js/nav-inject.js names sovereign-primitives.css while explaining that the
  //     transformed pages do NOT load it, which is why it injects its own sheet.
  //   js/modules/nav-shrink.js names nav-footer-sf21.css — and nav-shrink.js is itself
  //     loaded by 0 pages, so the script and the sheet are dead together.
  path.join("Assets", "css"),
];

const referenced = new Set();
const missing = new Set();
// The closing quote is load-bearing, and the alternation is ordered longest-first.
// Without both, `js` matches inside `.json` and the alternation stops there, so
// `/manifest.json` is read as a reference to a non-existent `/manifest.js`. That
// produced 33 phantom "missing asset" failures on the first run of this script.
const ASSET_RE = /(?:src|href)="(\/[^"\s?]+\.(?:jpeg|woff2|json|webp|avif|html|css|jpg|png|svg|xml|txt|js))(?:\?[^"]*)?"/g;
// Companion to ASSET_RE for <img srcset> / <source srcset>. Deliberately loose on
// the value: it is split and validated per candidate above.
const SRCSET_RE = /srcset="([^"]+)"/g;

for (const file of htmlFiles) {
  const src = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, " ");
  const note = (u) => {
    referenced.add(u);
    if (!fs.existsSync(path.join(DIST, u))) missing.add(`${u}  (referenced by ${path.relative(DIST, file)})`);
  };
  for (const m of src.matchAll(ASSET_RE)) note(m[1]);
  // srcset was invisible to this check until 2026-07-30, and it is where every
  // <picture> keeps its WebP. 45 references to real files sat behind `<source
  // srcset>` on the 9 blog pages alone, so a missing .webp could never have failed
  // the build — and the reachability prune, which trusts this same evidence, deleted
  // them. Candidates are comma-separated and may carry a 1x/2x/700w descriptor.
  for (const m of src.matchAll(SRCSET_RE)) {
    for (const candidate of m[1].split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url.startsWith("/")) note(url.split("?")[0]);
    }
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
    referenced.add(m[1]);
    if (!fs.existsSync(path.join(DIST, m[1]))) missing.add(`${m[1]}  (injected by ${path.basename(file)})`);
  }
}

// CSS url() was the other half of the srcset blind spot: the scan read no CSS at
// all, so a stylesheet pointing at a missing font or background would have passed
// the build silently. Every self-hosted font on this site is reached ONLY from
// fonts-selfhosted.css, so that was the gap with the most to lose — a 404 on
// Inter-var.woff2 would have been invisible here and obvious to every visitor.
//
// Also covers <style> blocks and inline style="" in the built HTML.
//
// Skips data: and remote URLs, and skips fragment references. `%23noise` is a
// percent-encoded `#noise` — an SVG filter reference, not a file — and reading it as
// a path is how a first pass reported four phantom missing assets.
// Built with a real backreference. An earlier version of this line carried a
// literal 0x01 control byte where the \1 belonged, introduced by a shell heredoc.
// The pattern then required a character that never occurs in CSS, so it matched 0
// of the 5 font URLs in fonts-selfhosted.css and the whole check silently passed —
// while the same pattern, retyped by hand in a scratch script, matched all 5. That
// gap between "my test works" and "the build works" is the thing to watch for.
// Verify with: grep -n 'url' scripts/build-dist.js | cat -A
// No backreference: the quotes are matched as optional on both sides and the URL
// class excludes them, which handles url(x), url('x') and url("x") equally. Written
// this way on purpose — the backreference form kept arriving corrupted through shell
// heredocs, and a regex that is subtly wrong here fails SILENTLY rather than loudly.
const CSS_URL_RE = /url\(\s*['"]?([^'")]+?)['"]?\s*\)/gi;

function checkCssUrls(text, sourceLabel, baseDir) {
  for (const m of text.matchAll(CSS_URL_RE)) {
    const raw = m[1].trim();
    if (/^(?:data:|https?:|\/\/|#|%23)/i.test(raw)) continue;
    const clean = raw.split("?")[0].split("#")[0];
    if (!clean) continue;
    const abs = clean.startsWith("/")
      ? path.join(DIST, clean)
      : path.resolve(baseDir, clean);
    const urlPath = "/" + path.relative(DIST, abs).split(path.sep).join("/");
    referenced.add(urlPath);
    if (!fs.existsSync(abs)) missing.add(`${clean}  (url() in ${sourceLabel})`);
  }
}

const cssFiles = [];
(function walkCss(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkCss(full);
    else if (e.name.endsWith(".css")) cssFiles.push(full);
  }
})(DIST);
for (const file of cssFiles) {
  checkCssUrls(fs.readFileSync(file, "utf8"), path.relative(DIST, file), path.dirname(file));
}
for (const file of htmlFiles) {
  const src = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, " ");
  const label = path.relative(DIST, file);
  for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    checkCssUrls(m[1], `${label} <style>`, path.dirname(file));
  }
  for (const m of src.matchAll(/style="([^"]*)"/gi)) {
    checkCssUrls(m[1], `${label} inline style`, path.dirname(file));
  }
}

// XML feeds reference assets too, and the scan did not read them. `changelog.xml`
// carries `<?xml-stylesheet type="text/xsl" href="/Assets/css/rss.xsl"?>`, which is
// how the feed renders as a readable page in a browser rather than as raw markup.
//
// Found the hard way: adding Assets/css to REFERENCED_ONLY_DIRS pruned rss.xsl,
// because nothing the scan read mentioned it. That is the SECOND time a reachability
// prune has broken a live reference the scan could not see — srcset was the first.
// The lesson is the same both times: extend the scan, never exempt the file, or the
// gate stays wrong for the next asset of that kind.
//
// Only href attributes are read. Sitemap <loc> entries are absolute https URLs, so
// they are not asset paths and are correctly ignored.
const xmlFiles = [];
(function walkXml(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkXml(full);
    else if (e.name.endsWith(".xml") || e.name.endsWith(".xsl")) xmlFiles.push(full);
  }
})(DIST);
for (const file of xmlFiles) {
  const src = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, " ");
  const label = path.relative(DIST, file);
  for (const m of src.matchAll(/href=["'](\/[^"'?]+\.[a-z0-9]{2,5})(?:\?[^"']*)?["']/gi)) {
    referenced.add(m[1]);
    if (!fs.existsSync(path.join(DIST, m[1]))) missing.add(`${m[1]}  (href in ${label})`);
  }
}

console.log(`  ${htmlFiles.length} pages, ${INJECTORS.length} injector script(s), ${cssFiles.length} stylesheet(s), ${xmlFiles.length} feed(s) checked`);

if (missing.size) {
  console.error(`\n  BUILD FAILED — ${missing.size} referenced asset(s) are not in dist/:`);
  for (const m of [...missing].sort().slice(0, 25)) console.error(`    ${m}`);
  console.error("\n  Add the missing directory to DIRS in scripts/build-dist.js.");
  process.exit(1);
}

// -- 2b. Prune unreferenced files from referenced-only directories -----------
// Runs after the check above so `referenced` is complete, and after its exit so a
// build that is already failing is never also mutated.
const pruned = [];
let prunedBytes = 0;
for (const rel of REFERENCED_ONLY_DIRS) {
  const dir = path.join(DIST, rel);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const urlPath = "/" + path.join(rel, entry.name).split(path.sep).join("/");
    if (referenced.has(urlPath)) continue;
    const abs = path.join(dir, entry.name);
    prunedBytes += fs.statSync(abs).size;
    fs.rmSync(abs);
    pruned.push(urlPath);
  }
}
if (pruned.length) {
  console.log(
    "  pruned " + pruned.length + " unreferenced file(s) from " + REFERENCED_ONLY_DIRS.join(", ") +
      " -- " + (prunedBytes / 1024).toFixed(1) + "KB of third-party marks nothing links",
  );
  for (const u of pruned.sort()) console.log("      " + u);
}

// ── 2c. Immutable-cache lock ────────────────────────────────────────────────
//
// /Assets/* is served `Cache-Control: public, max-age=31536000, immutable`. That is
// correct for a versioned URL and a trap for an unversioned one: change the file and
// nobody who already fetched it sees the change for a year.
//
// This already bit once. The OG cards were regenerated on 2026-07-30 to remove a
// "CrowMark from £99/mo" price that does not exist, and because 24 of 25 were
// referenced with no ?v=, that correction could not have reached anyone — or any
// social platform — holding the old card. The fix was real and inert.
//
// The remaining exposure was documented as "if you re-crop a blog photo, remember to
// bump ?v=". A note nobody reads is not a control, so this makes it a build gate:
// hash every unversioned /Assets/* asset that something references, compare against a
// committed lock, and FAIL when the bytes move without the URL moving.
//
// Deliberately a lock rather than a rule requiring every asset to be versioned: fonts
// and the width-suffixed thumbnails carry their version in the filename, so demanding
// ?v= there would be churn for files that never change in place.
//
// To accept an intentional change: bump the reference's ?v= (preferred — that is what
// actually reaches users), or run `node scripts/build-dist.js --accept-asset-changes`
// to re-record the hash when the asset genuinely is not user-visible.
const LOCK_PATH = path.join(ROOT, "scripts", "asset-version-lock.json");
const acceptAssetChanges = process.argv.includes("--accept-asset-changes");

// Which referenced /Assets/* URLs arrived without a ?v=. `referenced` holds bare paths,
// so recover the query by re-scanning what the pages actually wrote.
const versionedUrls = new Set();
for (const file of [...htmlFiles, ...cssFiles, ...xmlFiles]) {
  // These lists were collected BEFORE section 2b pruned unreferenced files, so some of
  // the paths no longer exist. A pruned file is unreferenced by definition, so skipping
  // it cannot hide a versioned reference. (Without this guard the build crashed on
  // dist/Assets/css/nav-footer-sf21.css, which the prune had just removed.)
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/(\/Assets\/[A-Za-z0-9._/-]+\.[a-z0-9]{2,5})\?v=/gi)) {
    versionedUrls.add(m[1]);
  }
}

const lock = fs.existsSync(LOCK_PATH) ? JSON.parse(fs.readFileSync(LOCK_PATH, "utf8")) : {};
const nextLock = {};
const drifted = [];
for (const urlPath of [...referenced].sort()) {
  if (!urlPath.startsWith("/Assets/")) continue;
  if (versionedUrls.has(urlPath)) continue;          // URL changes when content does
  const abs = path.join(DIST, urlPath);
  if (!fs.existsSync(abs)) continue;                 // already reported by the check above
  const hash = crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex").slice(0, 16);
  nextLock[urlPath] = hash;
  if (lock[urlPath] && lock[urlPath] !== hash) drifted.push({ urlPath, was: lock[urlPath], now: hash });
}

if (drifted.length && !acceptAssetChanges) {
  console.error("\n  BUILD FAILED — " + drifted.length +
    " unversioned asset(s) changed content while their URL stayed the same.");
  console.error("  /Assets/* is cached `immutable` for a year, so this change would NOT reach");
  console.error("  anyone who already fetched it, including social-media scrapers.\n");
  for (const d of drifted) console.error(`    ${d.urlPath}\n        ${d.was} -> ${d.now}`);
  console.error("\n  Fix by bumping that reference's ?v= (this is what actually reaches users),");
  console.error("  or re-record with: node scripts/build-dist.js --accept-asset-changes\n");
  process.exit(1);
}

const lockChanged = JSON.stringify(lock) !== JSON.stringify(nextLock);
if (lockChanged) {
  fs.writeFileSync(LOCK_PATH, JSON.stringify(nextLock, null, 2) + "\n");
}
console.log("  immutable-cache lock: " + Object.keys(nextLock).length + " unversioned asset(s) tracked" +
  (drifted.length ? ", " + drifted.length + " re-recorded" : "") +
  (lockChanged ? " (lock updated)" : ""));

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

// ---------------------------------------------------------------------------
// STRIP AUTHORING COMMENTS FROM THE SHIPPED ARTIFACT
//
// Why. Source comments in this repo carry real provenance (why a claim was removed,
// which owner decision settled a layout, which capture was rejected and on what
// evidence). That is valuable to maintainers and worthless to visitors, and it SHIPS:
// an HTML comment is served to the public and readable in view-source.
//
// It was also leaking retired product names. CrowCyber, CrowCash and CrowESG appear
// nowhere in the rendered site (measured: 0 visible text mentions and 0 linked URLs
// across all 43 pages), but 149 references survived inside remediation comments in
// dist/, e.g. 30 in pricing.html and 14 in about.html. The owner's instruction is that
// these products must not appear anywhere on the website. Stripping at BUILD time
// removes them from what the public gets while keeping the reasoning in source, which
// is the right trade: deleting the comments from source would destroy the record of
// WHY the copy says what it says.
//
// Runs LAST, after every scan and the lock gate, so the reference checks still see the
// source as authored. Conditional comments (`<!--[if ...]`) are preserved; a repo-wide
// search found none, and no script reads comment nodes (no COMMENT_NODE, nodeType===8,
// createTreeWalker or SHOW_COMMENT anywhere), so nothing depends on them.
// ---------------------------------------------------------------------------
let strippedFiles = 0, strippedBytes = 0;
(function stripComments(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { stripComments(full); continue; }
    const ext = path.extname(e.name).toLowerCase();
    // HTML/XML ONLY. CSS is deliberately NOT stripped.
    //
    // A first version also stripped `/* ... */` from stylesheets. It silently destroyed
    // real rules: comparing the rule counts the BROWSER actually parsed, source vs dist,
    // `no-js-content-fallback.css` and `signature-atmosphere-2026-05-26.css` each lost one
    // rule, and 7 of 10 sampled pages rendered taller in dist by up to 3,298px with
    // identical text. Losing a rule from the no-js fallback sheet is exactly the kind of
    // defect that ships looking fine and breaks a real visitor.
    // The gain was never in CSS anyway: 149 of the 153 retired-name references were in HTML
    // comments, and the 4 CSS ones were dead `[data-product]` rules now deleted at source.
    if (![".html", ".xml", ".xsl"].includes(ext)) continue;
    const before = fs.readFileSync(full, "utf8");
    let after = before.replace(/<!--([\s\S]*?)-->/g, (m, body) =>
      /^\[if\b/i.test(body.trim()) ? m : "");
    // An XML declaration or stylesheet PI must stay on line 1, so only collapse the blank
    // lines the removals left behind rather than trimming the head of the file.
    after = after.replace(/\n[ \t]*\n[ \t]*\n+/g, "\n\n");
    if (after !== before) {
      fs.writeFileSync(full, after);
      strippedFiles += 1;
      strippedBytes += Buffer.byteLength(before) - Buffer.byteLength(after);
    }
  }
})(DIST);
console.log(
  "  stripped authoring comments from " + strippedFiles + " file(s), " +
    (strippedBytes / 1024).toFixed(1) + " KB removed from the shipped artifact"
);

// Fail loudly if a retired product name still reaches the public artifact.
//
// WIDENED 2026-07-30 after this gate reported "no retired product name in dist/"
// while dist/Assets/og/crowcash.png, crowcyber.png and crowesg.png were shipping.
// The old version `continue`d past every extension that is not text, so a retired
// name in a FILENAME was never examined -- only file CONTENTS were. Three public
// URLs carried a retired product name for as long as that hole existed.
//
// Now: every file's NAME is checked, and text files also have their CONTENTS checked.
// "crowagent core" is included per the owner directive that CrowAgent Core appear
// nowhere. It is matched as a phrase, never as a bare "core", because legitimate
// filenames here contain that word (sovereign-core-v2.compiled.css).
const RETIRED_NAMES = /crowcyber|crowcash|crowesg|crowagent[-_\s]?core/i;
const TEXT_EXT = [".html", ".xml", ".xsl", ".css", ".js", ".txt", ".json", ".md", ".svg", ".webmanifest"];
const retiredLeaks = [];
(function scanRetired(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { scanRetired(full); continue; }
    const rel = path.relative(DIST, full);
    if (RETIRED_NAMES.test(e.name)) {
      retiredLeaks.push(rel + " (filename)");
      continue;
    }
    if (!TEXT_EXT.includes(path.extname(e.name).toLowerCase())) continue;
    const s = fs.readFileSync(full, "utf8");
    const n = (s.match(new RegExp(RETIRED_NAMES.source, "gi")) || []).length;
    if (n) retiredLeaks.push(rel + " (" + n + " in content)");
  }
})(DIST);
if (retiredLeaks.length) {
  console.error(
    "\n  BUILD FAILED — retired product names reached dist/: " + retiredLeaks.join(", ") +
      "\n  CrowCyber, CrowCash and CrowESG must not appear anywhere in the shipped site."
  );
  process.exit(1);
}
console.log("  no retired product name in dist/");

console.log("  dist/ is ready — set the Pages build output directory to `dist`");
