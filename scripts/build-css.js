#!/usr/bin/env node
/**
 * build-css.js — issue #109 CSS slim-down pipeline
 *
 * Pipeline:
 *   styles.css (source)
 *     → PurgeCSS (drop unused selectors based on HTML scan)
 *     → CSSO (minify)
 *     → styles.min.css (deployable artifact)
 *
 * Why a Node script and not a shell one-liner:
 *   - The static site has 50+ HTML pages spread across blog/, products/,
 *     glossary/, intel/, free-tools/, and industries/ subdirs. Globbing in
 *     a portable way across Windows + Linux Cloudflare Pages requires a
 *     deterministic file list, which we generate here from `fast-glob`-style
 *     directory walking using only Node built-ins.
 *   - PurgeCSS's safelist needs to match dynamically-injected classes from
 *     scripts.js (banner, modal, toast, MFA states), inline event handlers,
 *     and runtime-only ARIA states. A static safelist file would drift; we
 *     keep the canonical list in this script alongside the scan logic.
 *
 * Brand-token contract (CLAUDE.md §10):
 *   The CSS variables defined in crowagent-brand-tokens.css MUST survive the
 *   purge — they are referenced from inline styles in HTML and from
 *   scripts.js at runtime. Variables on :root are never matched as
 *   selectors so PurgeCSS preserves them by default, but we explicitly
 *   safelist `:root`, `[data-theme]`, and `--ca-*` patterns to guard against
 *   future PurgeCSS heuristics.
 *
 * Usage:
 *   node scripts/build-css.js                   # purge + minify into styles.min.css
 *   node scripts/build-css.js --no-minify       # skip CSSO step (debugging)
 *   node scripts/build-css.js --report          # print before/after byte counts
 *
 * Exit codes:
 *   0  success
 *   1  missing dependency
 *   2  filesystem error
 *   3  size regression (purged file is LARGER than source)
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_CSS = path.join(REPO_ROOT, "styles.css");
const OUTPUT_CSS = path.join(REPO_ROOT, "styles.min.css");

const argv = process.argv.slice(2);
const SKIP_MINIFY = argv.includes("--no-minify");
const REPORT_ONLY = argv.includes("--report");

function structuredLog(level, message, extra = {}) {
  process.stdout.write(
    JSON.stringify({
      level,
      service: "build-css",
      timestamp: new Date().toISOString(),
      message,
      ...extra,
    }) + "\n",
  );
}

// ---------- HTML discovery ----------

const HTML_SCAN_DIRS = [
  "",            // repo root *.html
  "blog",
  "products",
  "glossary",
  "intel",
  "free-tools",
  "industries",
];

function discoverHtmlFiles() {
  const out = [];
  for (const rel of HTML_SCAN_DIRS) {
    const dir = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!e.name.endsWith(".html")) continue;
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

// ---------- safelist ----------
//
// Selectors that are dynamically injected by scripts.js / chatbot.js /
// cookie-banner.js at runtime, or by inline event handlers in HTML, and which
// PurgeCSS cannot statically detect. If a class is added to the DOM after
// page load, it MUST appear here (or be matched by a regex).
const SAFELIST = {
  standard: [
    // Cookie banner + preferences
    "show", "hide", "active", "open", "closed", "expanded", "collapsed",
    // Toast / banner / modal states
    "visible", "invisible", "fade-in", "fade-out", "loading", "loaded",
    "error", "success", "warning", "info",
    // Form validation states
    "is-valid", "is-invalid", "has-error", "has-success",
    // ARIA / focus states
    "focus-visible", "sr-only", "skip-to-main",
    // Cookie consent specific
    "cookie-banner", "cookie-banner-visible", "cookie-banner-dismissed",
    // Chat widget states
    "chat-open", "chat-closed", "chat-loading",
    // Header / nav scroll states
    "scrolled", "sticky", "menu-open", "menu-closed",
    // SEO / OG fallback nodes
    "og-image-fallback",
  ],
  // Regex patterns for dynamic class families.
  greedy: [
    // CrowAgent brand tokens (CSS custom properties)
    /^--ca-/,
    /^--/,
    // BEM-style modifiers
    /^is-/,
    /^has-/,
    /--[a-z]+$/,
    // Product accent classes
    /^product-/,
    // Animation / transition utility classes
    /^animate-/,
    /^transition-/,
    // Theme / color-scheme attributes
    /^data-/,
    // Tier badges
    /^tier-/,
    // Status / pill colors
    /^pill-/,
    /^badge-/,
    /^status-/,
    // Chat widget dynamic classes
    /^chat-/,
    // Cookie / consent dynamic classes
    /^consent-/,
    // Toast / notification dynamic classes
    /^toast-/,
    /^notification-/,
  ],
  deep: [
    // ARIA expanded states injected by JS
    /\[aria-expanded\]$/,
    /\[aria-hidden\]$/,
    /\[aria-current\]$/,
    /\[data-state=/,
  ],
  // Top-level `keyframes` and `variables` keys are not part of the PurgeCSS
  // safelist schema; they live at the top level of the purge() options
  // object instead. Keeping them here would crash isKeyframesSafelisted.
};

// ---------- main ----------

async function main() {
  const t0 = Date.now();

  if (!fs.existsSync(SOURCE_CSS)) {
    structuredLog("error", "Source CSS not found", { path: SOURCE_CSS });
    process.exit(2);
  }

  const sourceBytes = fs.statSync(SOURCE_CSS).size;
  const existingMinBytes = fs.existsSync(OUTPUT_CSS) ? fs.statSync(OUTPUT_CSS).size : null;

  let PurgeCSS;
  try {
    ({ PurgeCSS } = require("purgecss"));
  } catch (e) {
    structuredLog("error", "PurgeCSS not installed; run `npm install --save-dev purgecss`", {
      error: e instanceof Error ? e.message : String(e),
    });
    process.exit(1);
  }

  let csso;
  if (!SKIP_MINIFY) {
    try {
      csso = require("csso");
    } catch (e) {
      structuredLog("warn", "csso not available as require()'able module; skipping minify step", {});
      // csso-cli ships csso as a peer; if `require('csso')` fails, fall back
      // to leaving the purged output unminified. The csso-cli binary is run
      // separately by `npm run build:css:csso` if needed.
    }
  }

  const htmlFiles = discoverHtmlFiles();
  structuredLog("info", "HTML scan", { files: htmlFiles.length });

  // PurgeCSS uses fast-glob for `content`/`css` paths, which on Windows
  // mishandles `C:\…` style backslash separators and silently returns no
  // matches. The portable workaround is to pass file contents as raw objects
  // (`{ raw, extension }`) which short-circuits the globbing.
  const sourceCssRaw = fs.readFileSync(SOURCE_CSS, "utf8");
  const contentRaw = htmlFiles.concat([
    path.join(REPO_ROOT, "scripts.js"),
    path.join(REPO_ROOT, "chatbot.js"),
    path.join(REPO_ROOT, "cookie-banner.js"),
  ].filter((p) => fs.existsSync(p))).map((p) => ({
    raw: fs.readFileSync(p, "utf8"),
    extension: path.extname(p).slice(1),
  }));

  let purgeResults;
  try {
    purgeResults = await new PurgeCSS().purge({
      content: contentRaw,
      css: [{ raw: sourceCssRaw }],
      safelist: SAFELIST,
      keyframes: true,
      fontFace: true,
      variables: true,
    });
  } catch (e) {
    structuredLog("error", "PurgeCSS threw", {
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    process.exit(3);
  }

  if (!purgeResults || !purgeResults.length || !purgeResults[0].css) {
    structuredLog("error", "PurgeCSS returned empty result", {
      result_count: purgeResults ? purgeResults.length : 0,
    });
    process.exit(3);
  }

  let purgedCss = purgeResults[0].css;
  const purgedBytes = Buffer.byteLength(purgedCss, "utf8");

  let finalCss = purgedCss;
  let finalBytes = purgedBytes;
  if (csso && !SKIP_MINIFY) {
    const result = csso.minify(purgedCss, { restructure: true, comments: false });
    finalCss = result.css;
    finalBytes = Buffer.byteLength(finalCss, "utf8");
  }

  if (finalBytes >= sourceBytes) {
    structuredLog("error", "Purged output is not smaller than source", {
      source_bytes: sourceBytes,
      final_bytes: finalBytes,
    });
    process.exit(3);
  }

  if (!REPORT_ONLY) {
    fs.writeFileSync(OUTPUT_CSS, finalCss, "utf8");
  }

  structuredLog("info", "Complete", {
    source_bytes: sourceBytes,
    purged_bytes: purgedBytes,
    final_bytes: finalBytes,
    previous_min_bytes: existingMinBytes,
    minified: !!csso && !SKIP_MINIFY,
    duration_ms: Date.now() - t0,
    out: REPORT_ONLY ? null : OUTPUT_CSS,
  });
}

main().catch((err) => {
  structuredLog("error", "Unhandled error", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(3);
});
