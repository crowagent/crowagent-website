/**
 * bake-breadcrumbs.js — render the injected breadcrumb into the static HTML.
 *
 * THE DEFECT. js/nav-inject.js:741 derives a visible breadcrumb from each
 * page's own BreadcrumbList JSON-LD and inserts it with
 * `main.insertBefore(wrap, main.firstChild)`. That is a good feature badly
 * timed: it lands long after first paint and pushes every following element
 * down by 60px.
 *
 * Measured on /faq under Lighthouse mobile throttling (1.6 Mbit/s, 150ms RTT,
 * 4x CPU): first paint at 552ms, breadcrumb inserted at 2591ms, hero moves from
 * y=72 to y=132. Total CLS 0.1072 — OUTSIDE Google's 0.1 "good" threshold, and
 * identical across three consecutive runs, so a stable property of the page
 * rather than sampling noise. 18 pages take this shift on every load. Thirteen
 * others already ship a static breadcrumb and do not shift at all, which is the
 * proof that the static form is both correct and sufficient.
 *
 * THE FIX IS TO MOVE THE WORK, NOT TO CHANGE IT. This produces byte-identical
 * markup to what the script builds — same classes, same inline styles, same
 * href derivation, same aria-current on the last crumb — from the same source
 * of truth, the page's own JSON-LD. Once it is in the HTML, the script's own
 * first line ("Already has a visible breadcrumb? Leave it.") makes it skip.
 * No behaviour changes; the timing does.
 *
 * Deliberately NOT touched: pages with no BreadcrumbList (nothing to derive),
 * pages that already have a visible breadcrumb, and the homepage (a single
 * "Home" crumb is noise, and the script skips it for the same reason via its
 * `items.length < 2` guard).
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/** Every shipped page, excluding dev surfaces. */
function pages(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ['node_modules', 'dist', 'astro', 'docs', '.git', '.dev-tools', '.partials',
        'Assets', 'js', 'tests', 'scripts', 'migration', 'specs', '.husky',
        '.github', 'coverage', 'test-results', 'playwright-report', 'stripe-sample',
      ].includes(entry.name)
    ) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) pages(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const SKIP = /test|demo|sample|backup|old|draft|-v[0-9]|scratch|preview|google[0-9a-f]{16}|404\.html/i;

/** Mirrors the script's derivation exactly, including the href handling. */
function buildCrumbHtml(items) {
  const sorted = items.slice().sort((a, b) => (a.position || 0) - (b.position || 0));
  const lis = [];
  sorted.forEach((it, k) => {
    const name = it.name || (it.item && it.item.name) || '';
    if (!name) return;
    const raw = typeof it.item === 'string' ? it.item : it.item && it.item['@id'] ? it.item['@id'] : '';
    const isLast = k === sorted.length - 1;
    if (!isLast && raw) {
      let href = raw;
      try { href = new URL(raw).pathname || '/'; } catch { /* keep raw */ }
      lis.push(`<li><a href="${href}">${name}</a></li>`);
    } else {
      lis.push(`<li aria-current="page">${name}</li>`);
    }
  });
  if (!lis.length) return null;
  // Inline styles match what the script sets, so the rendered result is identical.
  return (
    '<div class="ca-container ca-breadcrumb-wrap" style="padding-top: 1rem; padding-bottom: 0;">' +
    '<nav class="ca-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: 0;">' +
    `<ol>${lis.join('')}</ol>` +
    '</nav></div>'
  );
}

let baked = 0;
const skipped = { visible: 0, noLd: 0, tooShort: 0, noMain: 0 };

for (const file of pages('.')) {
  if (SKIP.test(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const doc = new JSDOM(html).window.document;

  if (doc.querySelector('.ca-breadcrumb, nav[aria-label="Breadcrumb"]')) { skipped.visible++; continue; }

  let items = null;
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    let data;
    try { data = JSON.parse(s.textContent); } catch { continue; }
    for (const c of Array.isArray(data) ? data : [data]) {
      if (c && c['@type'] === 'BreadcrumbList' && Array.isArray(c.itemListElement)) { items = c.itemListElement; break; }
    }
    if (items) break;
  }
  if (!items) { skipped.noLd++; continue; }
  if (items.length < 2) { skipped.tooShort++; continue; }

  const crumb = buildCrumbHtml(items);
  if (!crumb) { skipped.tooShort++; continue; }

  // Insert immediately after the opening <main> tag, which is where the script
  // puts it (main.firstChild).
  const openTag = html.match(/<main\b[^>]*>/);
  if (!openTag) { skipped.noMain++; continue; }
  const at = html.indexOf(openTag[0]) + openTag[0].length;

  const marker = '\n      <!-- Baked by scripts/bake-breadcrumbs.js. Previously injected at\n' +
    '           runtime by nav-inject.js, which landed ~2s after first paint and\n' +
    '           pushed the page down 60px (CLS 0.1072 on /faq, outside the 0.1\n' +
    '           threshold). Identical markup, rendered statically. nav-inject.js\n' +
    '           now sees it and skips. -->\n      ';
  fs.writeFileSync(file, html.slice(0, at) + marker + crumb + html.slice(at), 'utf8');
  baked++;
}

console.log(`breadcrumbs: baked into ${baked} page(s)`);
console.log(
  `  skipped — already visible: ${skipped.visible}, no BreadcrumbList: ${skipped.noLd}, ` +
  `fewer than 2 crumbs: ${skipped.tooShort}, no <main>: ${skipped.noMain}`
);
