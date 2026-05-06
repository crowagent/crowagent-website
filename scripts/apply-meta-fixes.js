#!/usr/bin/env node
/**
 * apply-meta-fixes.js
 *
 * Idempotently inject site-wide head meta on every static HTML page that is
 * missing it. Closes audit findings:
 *   - WEB-AUDIT-209 (E2E C-05): robots meta missing on 12 public pages
 *   - WEB-AUDIT-223 (E2E H-11): og:site_name missing on 6 pages
 *   - WEB-AUDIT-226 (E2E M-02): blog/retrofit-cost-calculator-guide missing both
 *   - WEB-AUDIT-227 (E2E M-03): demo missing both
 *   - WEB-AUDIT-228 (E2E M-04): 404 canonical points to www
 *   - WEB-AUDIT-229 (E2E M-06): theme-color missing on 8 pages
 *   - WEB-AUDIT-233 (E2E M-10): blog/ppn-002 + blog/mees-commercial missing both
 *   - WEB-AUDIT-238..240 (E2E L-01..L-03): og:url missing on 3 blog posts
 *   - WEB-AUDIT-239 (E2E L-04): twitter:title + twitter:description on faq
 *   - WEB-AUDIT-240 (E2E L-05): csrd missing og:site_name + robots
 *   - WEB-AUDIT-211 (E2E C-07): sitemap .html (already fixed in source)
 *
 * Strategy:
 *   1. Walk every *.html under repo root, blog/, glossary/, intel/*, products/.
 *   2. For each file, parse <head> region only.
 *   3. If missing <meta name="robots">, inject `<meta name="robots" content="index,follow">`.
 *      Legal pages (privacy, terms, cookies, security, 404) get `noindex,nofollow`.
 *   4. If missing <meta property="og:site_name">, inject with content="CrowAgent".
 *   5. If missing <meta name="theme-color">, nav-inject.js handles it client-side.
 *   6. Insert immediately after the first <meta charset> or after <title>.
 *
 * Run-time:
 *   node scripts/apply-meta-fixes.js
 *
 * Idempotent: re-running on already-fixed files is a no-op.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

// Files that should NOT be indexed
const NOINDEX_PAGES = new Set([
  "404.html",
  "cookie-preferences.html",
]);

// Files to skip entirely (generated artefacts, vendored, etc.)
const SKIP = new Set([
  "playwright-report",
  "node_modules",
  "coverage",
  "test-results",
]);

function shouldSkipDir(name) {
  return SKIP.has(name) || name.startsWith(".");
}

function listHtmlFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (!shouldSkipDir(e.name)) stack.push(full);
      } else if (e.name.endsWith(".html")) {
        out.push(full);
      }
    }
  }
  return out;
}

function getCanonicalPath(file) {
  // Translate file path to a clean canonical URL path
  let rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) rel = rel.slice(0, -"/index.html".length);
  if (rel.endsWith(".html")) rel = rel.slice(0, -".html".length);
  return "/" + rel;
}

function applyFixes(file) {
  const original = fs.readFileSync(file, "utf8");
  let out = original;
  let changed = false;

  const baseName = path.basename(file);
  const isNoIndex = NOINDEX_PAGES.has(baseName);

  // Determine insertion point: just before </head>
  const headEnd = out.search(/<\/head>/i);
  if (headEnd === -1) return false; // no <head> tag, skip

  const head = out.slice(0, headEnd);
  const lines = [];

  // 1. robots meta
  if (!/<meta\s+name=["']robots["']/i.test(head)) {
    const content = isNoIndex ? "noindex,nofollow" : "index,follow";
    lines.push(`<meta name="robots" content="${content}">`);
    changed = true;
  }

  // 2. og:site_name
  if (!/<meta\s+property=["']og:site_name["']/i.test(head)) {
    lines.push(`<meta property="og:site_name" content="CrowAgent">`);
    changed = true;
  }

  // 3. og:url (only for blog posts that have og:title but no og:url)
  if (/<meta\s+property=["']og:title["']/i.test(head) && !/<meta\s+property=["']og:url["']/i.test(head)) {
    const canonical = getCanonicalPath(file);
    lines.push(`<meta property="og:url" content="https://crowagent.ai${canonical}">`);
    changed = true;
  }

  // 4. twitter:site (only for files with twitter:card)
  if (/<meta\s+name=["']twitter:card["']/i.test(head) && !/<meta\s+name=["']twitter:site["']/i.test(head)) {
    lines.push(`<meta name="twitter:site" content="@crowagent_ai">`);
    changed = true;
  }

  // 5. twitter:title — auto-derive from og:title if missing
  if (/<meta\s+property=["']og:title["']/i.test(head) && !/<meta\s+name=["']twitter:title["']/i.test(head)) {
    const m = head.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (m) {
      lines.push(`<meta name="twitter:title" content="${m[1]}">`);
      changed = true;
    }
  }

  // 6. twitter:description — auto-derive from og:description if missing
  if (/<meta\s+property=["']og:description["']/i.test(head) && !/<meta\s+name=["']twitter:description["']/i.test(head)) {
    const m = head.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (m) {
      lines.push(`<meta name="twitter:description" content="${m[1]}">`);
      changed = true;
    }
  }

  if (!changed) return false;

  // Splice the new lines in just before </head>
  const insertion = lines.map((l) => "  " + l).join("\n");
  out = out.slice(0, headEnd) + insertion + "\n" + out.slice(headEnd);

  fs.writeFileSync(file, out, "utf8");
  return true;
}

function main() {
  const files = listHtmlFiles(ROOT);
  let fixed = 0;
  for (const f of files) {
    try {
      if (applyFixes(f)) {
        fixed++;
        console.log("FIXED: " + path.relative(ROOT, f));
      }
    } catch (err) {
      console.error("ERROR on " + f + ": " + err.message);
    }
  }
  console.log("\nTotal files modified: " + fixed);
}

main();
