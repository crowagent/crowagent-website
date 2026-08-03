/**
 * check-render.js — the alignment rule, measured on the rendered page.
 *
 * WHY THIS EXISTS, AND IT IS WORTH READING BEFORE CHANGING ANYTHING HERE.
 *
 * The owner reported the same defect three times: content inside cards sitting
 * left instead of centred. Each time it was fixed and each time it came back
 * somewhere else, and `check-design-system.js` rule 1 passed throughout.
 *
 * Rule 1 fires on `text-align: left` or `start` being DECLARED. The
 * "Plugged in, read only" chips never declared it. They were a two-column grid
 * — an 18px logo column, then the name and scope in column two — and they
 * inherited `start` from the document like everything else. There was nothing
 * to grep for. The rule was not weak; it was looking at the wrong artefact.
 *
 * A declaration is what an author typed. Alignment is where the box ended up.
 * Those are different questions, and only the second one is what the owner sees.
 * So this gate renders the built site and measures.
 *
 * IT IS THE MOST EXPENSIVE GATE WE HAVE — a browser, one page load per route.
 * That is the price of asking the real question, and it is the reason it is a
 * separate script rather than more rules bolted onto the static gate: the static
 * gate must stay fast enough to run constantly.
 *
 * SAME CONTRACT AS EVERY OTHER GATE. Named exceptions, each with a written
 * reason. All of them printed on every run. Exceptions matching nothing are
 * reported as stale. Anything not listed fails the build.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * `{ route, selector, reason }`. `selector` is the block's class signature as
 * this gate prints it. A reason that only says "intentional" is not a reason.
 */
const ALLOW = [];

/* How far a child's centre may sit from its block's centre before it counts as
 * left-aligned. Sub-pixel layout and border rounding produce ~1px routinely;
 * a genuine left-alignment in a 342px chip was 145px out. */
const TOLERANCE_PX = 4;

if (!fs.existsSync(DIST)) {
  console.error(`render: no build at ${DIST}`);
  process.exit(1);
}

/* ── A static server, because file:// breaks absolute asset paths ────────── */
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.json': 'application/json', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(DIST, rel);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;

/** Every built route, as a URL path. */
function routes(dir = DIST, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) routes(f, out);
    else if (e.name === 'index.html') {
      const rel = path.relative(DIST, path.dirname(f)).replace(/\\/g, '/');
      out.push('/' + (rel ? rel + '/' : ''));
    }
  }
  return out;
}

/* ── THE MEASUREMENT, run inside the page ───────────────────────────────────
 *
 * A card is a block that LOOKS like a card to a reader: it has a background or
 * a border, a card-scale radius, and padding. That is deliberately a visual
 * test rather than a class-name test, because the defect this gate exists to
 * catch was a block that never used the card class.
 */
const MEASURE = `(() => {
  const TOL = ${TOLERANCE_PX};
  const out = [];

  const sig = (el) => {
    const cls = [...el.classList].filter((c) => !/^astro-/.test(c));
    return cls.length ? '.' + cls.join('.') : el.tagName.toLowerCase();
  };

  const isCard = (el, cs) => {
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const pad = parseFloat(cs.paddingTop) || 0;
    const painted =
      (cs.backgroundImage && cs.backgroundImage !== 'none') ||
      (cs.backgroundColor && !/rgba?\\(0, 0, 0, 0\\)|transparent/.test(cs.backgroundColor)) ||
      (parseFloat(cs.borderTopWidth) > 0 && !/rgba?\\(0, 0, 0, 0\\)/.test(cs.borderTopColor));
    return radius >= 8 && pad >= 10 && painted;
  };

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (!isCard(el, cs)) continue;

    /* Opted out on purpose, with a reason recorded in the design system. */
    if (el.classList.contains('surface--read')) continue;

    /* ── WHAT IS READ RATHER THAN SCANNED ────────────────────────────────
     *
     * The first run reported 37 blocks, and the top two were a blockquote in
     * eight blog posts and a Shiki code block. Both are CORRECT left-aligned:
     * the design rule centres what is scanned and leaves what is read, and
     * centred code is unreadable regardless of the rule.
     *
     * Excluded STRUCTURALLY rather than by allow-list, because an allow-list
     * entry per blog post would grow with the content and would be a place the
     * gate had agreed not to look. This mirrors the STRUCTURAL_TAGS list
     * check-design-system.js rule 1 already uses, so the two gates answer the
     * same question the same way. */
    if (/^(BLOCKQUOTE|PRE|CODE|TABLE|THEAD|TBODY|TR|TH|TD|FIGURE|FIGCAPTION|DL|DT|DD|FORM|FIELDSET|LABEL|LEGEND|DETAILS|SUMMARY)$/.test(el.tagName)) continue;
    if (el.closest('pre, code, blockquote, table, .prose, .legal__body, .article-body, .gl-article')) continue;

    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 24) continue;

    const centre = r.left + r.width / 2;
    const reasons = [];

    /* THE COMPUTED value, not the authored one. This is the whole point: a
       block that inherits 'start' reports 'start' here and reports nothing at
       all to a grep. */
    const hasText = [...el.querySelectorAll('*')].some(
      (n) => n.childNodes.length && [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())
    ) || [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());

    if (hasText && (cs.textAlign === 'start' || cs.textAlign === 'left')) {
      reasons.push('computed text-align is ' + cs.textAlign);
    }

    /* Children narrower than the block, sitting off its centre line. Catches
       the case where text-align is fine but a grid or flex track puts the box
       somewhere else. */
    for (const kid of el.children) {
      const ks = getComputedStyle(kid);
      if (ks.display === 'none' || ks.position === 'absolute' || ks.position === 'fixed') continue;
      const kr = kid.getBoundingClientRect();
      if (kr.width === 0 || kr.height === 0) continue;
      if (kr.width > r.width - 4) continue; // full-bleed, nothing to centre
      const off = kr.left + kr.width / 2 - centre;
      if (Math.abs(off) > TOL) {
        reasons.push(sig(kid) + ' sits ' + off.toFixed(0) + 'px off centre');
      }
    }

    if (reasons.length) out.push({ selector: sig(el), reasons: [...new Set(reasons)].slice(0, 4) });
  }
  return out;
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const all = routes();
const violations = [];
const used = new Set();

for (const route of all) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  const found = await page.evaluate(MEASURE);
  for (const f of found) {
    const ex = ALLOW.find((a) => a.route === route && a.selector === f.selector);
    if (ex) {
      used.add(`${ex.route}::${ex.selector}`);
      continue;
    }
    violations.push({ route, ...f });
  }
}

await browser.close();
server.close();

console.log(`render: ${all.length} route(s) measured at 1440`);
console.log(`  ${ALLOW.length} named exception(s):`);
for (const a of ALLOW) {
  const stale = used.has(`${a.route}::${a.selector}`) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.route}  ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW.length) console.log('    none');

if (violations.length) {
  /* One selector repeated across 40 routes is one defect, not forty. */
  const bySelector = new Map();
  for (const v of violations) {
    if (!bySelector.has(v.selector)) bySelector.set(v.selector, { routes: [], reasons: v.reasons });
    bySelector.get(v.selector).routes.push(v.route);
  }

  console.error(`\nrender: ${bySelector.size} block(s) with content off the centre line, on ${violations.length} route instance(s)\n`);
  for (const [selector, info] of [...bySelector].sort((a, b) => b[1].routes.length - a[1].routes.length)) {
    console.error(`  ${selector}   (${info.routes.length} route(s), e.g. ${info.routes.slice(0, 3).join(' ')})`);
    for (const r of info.reasons) console.error(`      ${r}`);
  }
  console.error('\n  DESIGN-DECISIONS.md: card content centres, because it is scanned rather than');
  console.error('  read. Long-form prose stays left via surface--read, which requires a written');
  console.error('  reason. Fix the block, or add a named exception that gives one.\n');
  process.exit(1);
}

console.log('\n  every card centres its content');
