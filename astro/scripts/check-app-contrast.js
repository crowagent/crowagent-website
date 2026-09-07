#!/usr/bin/env node
/**
 * check-app-contrast.js — text drawn inside a simulated product screen owes
 * the same contrast as text anywhere else on the page.
 *
 * ── THE REPORT THIS EXISTS FOR ──────────────────────────────────────────────
 *
 * An external audit on 2026-09-07 found 12 elements on the homepage below the
 * WCAG 2.1 AA threshold, all of them inside the reasoning-trace screen. Driving
 * the same measurement here found 17, across FOUR token families rather than
 * the one the report named. The worst was 3.17:1, carrying the sidebar group
 * names, the breadcrumb and its separators.
 *
 * ── WHY THIRTY-NINE GREEN GATES DID NOT CATCH IT ────────────────────────────
 *
 * Because none of them measures this. Three gates compute a contrast ratio —
 * check-heading-ink, check-treatments and check-disclosure — and every one does
 * it for a narrow purpose of its own: is a heading drawn at full ink, does a
 * treatment differ from its neighbour, does a summary carry an affordance.
 * There was no assertion anywhere that ordinary body text meets 4.5:1. A whole
 * class of defect had no instrument pointed at it, and a clean run said nothing
 * about it either way.
 *
 * ── WHY THE SIMULATED SCREEN IS WHERE IT BIT ────────────────────────────────
 *
 * The page is dark and this screen is LIGHT, drawn inside it. Every muted role
 * on it is therefore pale grey on near-white, which is exactly where 1.4.3 is
 * lost, and none of the page's own palette guards look at these tokens because
 * they are declared locally on the component. It is a drawing of a product, but
 * it is drawn in HTML, so it is real text and the ratio is owed in full. An
 * image of the same screen would owe nothing, which is precisely the trap: what
 * makes the screen accessible is also what makes it accountable.
 *
 * ── WHAT IS MEASURED, AND HOW EACH INSTRUMENT CAN FAIL ──────────────────────
 *
 * COLOURS ARE READ RESOLVED, FROM THE RENDERED PAGE, not from the stylesheet.
 * These values are `color-mix()` of two page tokens, so the source says nothing
 * about the colour that lands, and a custom property read back with
 * getPropertyValue returns the literal `color-mix(...)` expression rather than a
 * colour. Both computed formats have to be parsed: color-mix resolves to
 * `color(srgb 0..1)` while a plain declaration resolves to `rgb(0..255)`.
 * Treating one as the other is not hypothetical. A first pass at this
 * measurement divided the 0..1 form by 255 as well, reported black on white as
 * 1.00:1, and would have passed every element on the page.
 *
 * THE BACKGROUND IS A STACK, NOT A COLOUR. Chips and tints on this screen are
 * translucent over a card over a panel. Taking the first non-transparent
 * ancestor reports a colour nobody sees, so the layers are composited down to
 * the first opaque one.
 *
 * ONLY ELEMENTS THAT HOLD THEIR OWN TEXT. A computed colour is inherited by
 * nodes that draw nothing, and counting those inflates the sample with elements
 * that cannot fail.
 *
 * LARGE TEXT IS 3:1 AND EVERYTHING ELSE 4.5:1, per 1.4.3, with large defined as
 * 24px, or 18.66px when bold. Applying the strict figure everywhere would fail
 * headings that are conformant.
 *
 * A FLOOR, BECAUSE EVERY RULE ABOVE PASSES TRIVIALLY ON AN EMPTY SELECTOR. If
 * the screen stops rendering, or is renamed, this gate measures nothing and
 * would report a clean run. That is a failure here, never a skip.
 *
 * ── SCOPE, STATED SO NOBODY READS MORE INTO A PASS THAN IT MEANS ────────────
 *
 * This measures the SIMULATED SCREENS and nothing else. It is not a sitewide
 * contrast gate and a clean run here says nothing about the rest of the site.
 * Widening it to every route is a real option and a separate decision, because
 * it would redden whatever it finds and that is the owner's call, not a side
 * effect of fixing one component.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/* The simulated screens, named by the element that establishes their palette.
   A screen drawn anywhere else is added here, and the addition is the decision
   to have another one. */
const SCREENS = [
  {
    sel: '.h2rt__app',
    route: '/',
    why: 'home2/RefusalTrace.astro draws a light CrowMark screen inside the dark page',
  },
];

/* What the homepage renders today, stated as a minimum. */
const FLOOR = { roles: 20 };

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json',
};

if (!fs.existsSync(DIST)) {
  console.error('app-contrast: no dist/. Build first.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  return fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

/* Runs in the page. Returns one row per distinct (class, ink, ground) triple. */
const MEASURE = (sel) => {
  const parse = (c) => {
    let m = c.match(/^color\(srgb\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)(?:\s*\/\s*([\d.eE+-]+))?\s*\)$/);
    if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255, m[4] === undefined ? 1 : +m[4]];
    m = c.match(/^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\)$/);
    if (m) {
      const a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4]);
      return [+m[1], +m[2], +m[3], a];
    }
    return null;
  };
  const over = (f, g) => f.slice(0, 3).map((v, i) => v * f[3] + g[i] * (1 - f[3]));
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (f, g) => { const a = L(f), c = L(g); return (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05); };
  const bgOf = (el) => {
    const layers = [];
    let n = el;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0) { layers.push(c); if (c[3] === 1) break; }
      n = n.parentElement;
    }
    if (!layers.length) return [255, 255, 255];
    let acc = layers[layers.length - 1].slice(0, 3);
    for (let i = layers.length - 2; i >= 0; i--) acc = over(layers[i], acc);
    return acc;
  };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  const root = document.querySelector(sel);
  if (!root) return { missing: true };
  const seen = new Map();
  for (const el of root.querySelectorAll('*')) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const fgRaw = parse(cs.color);
    if (!fgRaw) continue;
    const bg = bgOf(el);
    const fg = over(fgRaw, bg);
    const size = parseFloat(cs.fontSize);
    const weight = +cs.fontWeight || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(fg, bg);
    const cls = [...el.classList].filter((c) => !/^astro-/.test(c)).join('.') || el.tagName.toLowerCase();
    const key = `${cls}|${hex(fg)}|${hex(bg)}`;
    if (seen.has(key)) { seen.get(key).n += 1; continue; }
    seen.set(key, {
      cls, fg: hex(fg), bg: hex(bg), size: Math.round(size), weight, need,
      cr: Math.round(cr * 100) / 100, pass: cr >= need, n: 1,
      sample: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30),
    });
  }
  return { rows: [...seen.values()].sort((a, b) => a.cr - b.cr) };
};

const violations = [];
let rolesSeen = 0;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });

console.log('\n' + '='.repeat(100));
console.log('APP CONTRAST — text inside a simulated product screen meets WCAG 2.1 AA');
console.log('='.repeat(100));
for (const s of SCREENS) console.log(`  ${s.sel}  on ${s.route}  ${s.why}`);
console.log('');

for (const s of SCREENS) {
  await page.goto(base + s.route, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const out = await page.evaluate(MEASURE, s.sel);

  if (out.missing) {
    violations.push(
      `stale — ${s.sel} matched nothing on ${s.route}. It is declared here as a simulated screen and this gate is measuring no text through it. Either the screen is gone, in which case delete the entry, or it has been renamed, in which case this gate has been blind since the rename`,
    );
    console.log(`  FAIL  ${s.sel}  matched nothing on ${s.route}`);
    continue;
  }

  rolesSeen += out.rows.length;
  const fails = out.rows.filter((r) => !r.pass);
  console.log(`  ${s.route}  ${s.sel}  ${out.rows.length} distinct text role(s), ${fails.length} below threshold`);
  for (const r of out.rows) {
    if (r.pass) continue;
    console.log(
      `    FAIL  ${String(r.cr).padStart(5)}:1 (needs ${r.need})  ${r.fg} on ${r.bg}  ${r.size}px/${r.weight}  x${r.n}  .${r.cls}  "${r.sample}"`,
    );
    violations.push(
      `${s.route}  .${r.cls} — ${r.fg} on ${r.bg} is ${r.cr}:1, and ${r.size}px/${r.weight} text needs ${r.need}:1. ${r.n} element(s), e.g. "${r.sample}". These colours are a mix of the page tokens declared on ${s.sel}, so correct the MIX there rather than the rule that uses it`,
    );
  }
  if (!fails.length) console.log(`    ok    lowest ${out.rows[0].cr}:1 on .${out.rows[0].cls}`);
}

await browser.close();
server.close();

/* THE FLOOR. Every assertion above is satisfied by there being nothing to
   assert it on, and a selector that has quietly stopped matching is the
   quietest way to get there. */
if (rolesSeen < FLOOR.roles) {
  violations.push(
    `floor — ${rolesSeen} text role(s) measured across ${SCREENS.length} simulated screen(s), and every rule above passes trivially below that. Needs at least ${FLOOR.roles}`,
  );
}

console.log(`\n  ${rolesSeen} text role(s) measured across ${SCREENS.length} simulated screen(s)`);

if (violations.length) {
  console.error(`\napp-contrast: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  - ${v}`);
  console.error('');
  process.exit(1);
}

console.log('\napp-contrast: clean\n');
