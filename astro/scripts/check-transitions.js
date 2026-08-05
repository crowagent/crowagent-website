/**
 * check-transitions.js — every control on the site answers a pointer, and it
 * answers on the site's own clock.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * Owner audit, O-52: "roughly 15 of 60 interactive elements have no transition".
 * Measured on the built site at 1440 across all 43 routes before anything was
 * changed: of 81 distinct interactive signatures, FOURTEEN resolved a
 * transition-duration of zero, 1,539 elements in total. Five of the fourteen
 * were the footer, and every one of those five is a control whose colour moves
 * under the cursor — 946 column links, 86 bottom links, the Companies House
 * link, 215 social icons — so a reader crossing from the body of the page into
 * the footer went from a 0.18s fade to an instant jump, on every route.
 *
 * NOT ONE OF THOSE FOURTEEN WAS A DECISION. styles/motion.css restored the
 * legacy platform rule that gives every control a transition, and scoped it to
 * <main>; the nav then restated it for itself and the footer was left. The
 * defect was the boundary of a selector, and nothing in the build could see it,
 * because every gate on this site measured either the STYLESHEETS (where the
 * rule is present and correct) or the CONTENT REGION (where it applies).
 *
 * ── WHAT IT ASSERTS ─────────────────────────────────────────────────────────
 *
 *   RULE 1  ANSWERED. Every element matching the pointer floor's own selector
 *           list resolves at least one non-zero transition-duration.
 *
 *   RULE 2  ON THE SITE'S CLOCK. Every non-zero duration is one of the four
 *           motion tokens, read from :root ON THE PAGE at run time. This file
 *           states no duration of its own, so it cannot go stale against
 *           tokens.css and it cannot be satisfied by a number somebody typed.
 *
 *   RULE 3  THE PREFERENCE IS HONOURED. With prefers-reduced-motion: reduce
 *           emulated, no control transitions for a perceptible time. tokens.css
 *           collapses all four duration tokens to 0.01ms under that setting, so
 *           this passes for free where the durations came from tokens and fails
 *           exactly where somebody wrote a literal — which is the one way the
 *           preference gets ignored on this site.
 *
 * ── THE SELECTOR IS READ FROM motion.css, NOT RESTATED HERE ─────────────────
 *
 * A gate that keeps its own copy of the list it is checking is a second
 * definition, and this repository has spent two days on what those cost. So the
 * floor's selector list is parsed out of src/styles/motion.css and used
 * verbatim. Add an element type to the floor and this gate checks it on the next
 * run with no edit; if the block is ever renamed or removed, the parse fails
 * loudly rather than silently checking nothing.
 *
 * ── IT PROVES ITSELF ON EVERY RUN ───────────────────────────────────────────
 *
 * The most expensive lesson of the last two days on this site is gates that
 * could not fail, so the first thing this script does is REINSTATE THE FAULT it
 * was written for — the floor stopping at the content landmark — on one route,
 * and require rules 1 and 2 to fire. A clean run from an instrument that has not
 * been shown to register a fault is worth nothing.
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');
const FLOOR_FILE = path.join(__dirname, '..', 'src', 'styles', 'motion.css');

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * Keyed by the signature this gate prints. EMPTY, and the measurement says it
 * can stay empty: after the O-52 fix every one of the 3,664 interactive elements
 * this gate measures resolves a transition from a token, and none of them still
 * transitions under reduced motion. An entry here would have to argue that a
 * particular control should answer a cursor instantly, which is a claim about
 * that control rather than about this rule.
 *
 * A DRAWN FIGURE IS NOT AN EXCEPTION BECAUSE IT IS NOT IN SCOPE. The lifecycle
 * ring and the reasoning trace light parts of an SVG
 * on hover, with `filter`, `stroke` and `text-shadow`, and two previous passes
 * correctly refused to flatten them into the shared recipe. None of them is an
 * <a>, a <button> or any other member of the floor's list, so this rule never
 * looks at them — which is the right way for an exception to not be needed. */
const ALLOW = [];

/* RULE 3's ceiling, in seconds. 0.05 rather than 0 because a browser reports a
 * collapsed 0.01ms as 0.00001s and floating point should not decide a build.
 * Anything a reader can perceive as a transition is far above this. */
const REDUCED_CEILING = 0.05;

/* The route the self-test runs on. It has to be one whose FOOTER carries the
 * links the historical fault was measured on, which is every route — / is used
 * because it is also the busiest. */
const SELF_TEST = '/';

/* ── THE FLOOR'S SELECTOR, PARSED FROM THE STYLESHEET THAT OWNS IT ──────────
 *
 * Matches the `:where(...)` list that carries `transition-property` in
 * motion.css. fs.existsSync first and an explicit failure after, rather than a
 * try/catch: a gate that cannot find the thing it checks must SAY SO, because an
 * exception escaping a gate reads as a broken script rather than as a finding,
 * and the temptation is then to wrap it and carry on. */
if (!fs.existsSync(FLOOR_FILE)) {
  console.error(`transitions: the pointer floor's stylesheet is not at ${FLOOR_FILE}`);
  process.exit(1);
}
/* COMMENTS ARE STRIPPED FIRST, AND THAT IS NOT DEFENSIVE TIDYING — IT IS THE
 * FIRST DEFECT THIS FILE SHIPPED. motion.css quotes the LEGACY platform rule in
 * its own header, verbatim, six lines of `:where(a, button, [role="button"],
 * input, select, textarea, summary, [tabindex])` followed by
 * `transition-property:`, as the evidence for why the floor exists. The parse
 * below matched that quotation instead of the live rule, and the two lists are
 * not the same: the legacy one predates `label`, so this gate ran once against a
 * set that was one element type short and reported clean about it.
 *
 * A gate reading its rule out of prose is exactly as wrong as a gate keeping its
 * own copy, and it fails more quietly. The stylesheet is stripped to
 * DECLARATIONS before anything is matched, so the only thing this can find is a
 * rule the browser also sees. */
const floorCss = fs.readFileSync(FLOOR_FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const floorMatch = floorCss.match(
  /:where\(([^)]*?\ba\b[^)]*?)\)\s*\{[^}]*?transition-property:/s,
);
if (!floorMatch) {
  console.error(
    '\ntransitions: THE POINTER FLOOR COULD NOT BE FOUND IN src/styles/motion.css\n\n' +
    '  This gate checks the elements that stylesheet claims to cover, and it reads the\n' +
    '  list from the stylesheet so the two cannot drift. Nothing matched a :where(...)\n' +
    '  block carrying transition-property, so either the floor has been removed — which\n' +
    '  is a much larger finding than anything below — or it has been rewritten in a\n' +
    '  shape this parse does not know. Fix the parse; do not delete the check.\n',
  );
  process.exit(1);
}
const SELECTOR = floorMatch[1].replace(/\s+/g, ' ').trim();

if (!fs.existsSync(DIST)) {
  console.error(`transitions: no build at ${DIST}`);
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
  const rel = decodeURIComponent(req.url.split('?')[0]);
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
const url = (route) => `http://127.0.0.1:${PORT}${route}`;

/** Every built route, as a URL path. */
function routes(dir = DIST, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) routes(f, out);
    else if (e.name === 'index.html') {
      const rel = path.relative(DIST, path.dirname(f)).split(path.sep).join('/');
      out.push('/' + (rel ? rel + '/' : ''));
    }
  }
  return out;
}

/* ── THE MEASUREMENT, run inside the page ───────────────────────────────────
 *
 * NO BACKTICKS BELOW. Everything to the closing brace is a template literal
 * evaluated in the page, and a backtick in a comment ends the string and stops
 * the file parsing. Same constraint check-render.js and check-treatments.js
 * both document, and both have been bitten by.
 *
 * A DISPLAY:NONE ELEMENT IS STILL MEASURED, deliberately, and it is the one
 * place this differs from the label and alignment gates. Those ask what a reader
 * SEES; this asks what a control DOES when it is used, and the mobile menu at
 * 1440 is hidden rather than absent — a phone reader taps every one of its
 * links. Computed style resolves for a hidden element, so there is no reason to
 * look away from it.
 *
 * SVG-NAMESPACE ELEMENTS ARE SKIPPED. querySelectorAll('a') matches an <a>
 * inside an <svg> too, and those are parts of a drawing rather than controls
 * with a pointer contract; motion.css says so at length beside the property
 * list, which carries fill and stroke for the CONTROL rather than for its art. */
const MEASURE = `(() => {
  const sig = (el) => {
    const c = [...el.classList].filter((x) => !/^astro-/.test(x));
    return el.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : '');
  };
  const root = getComputedStyle(document.documentElement);
  const tokens = ['--dur-fast', '--dur', '--dur-card', '--dur-slow']
    .map((n) => ({ name: n, raw: root.getPropertyValue(n).trim() }))
    .filter((t) => t.raw)
    .map((t) => ({ name: t.name, s: t.raw.endsWith('ms') ? parseFloat(t.raw) / 1000 : parseFloat(t.raw) }));

  const out = { tokens, rows: [] };
  for (const el of document.querySelectorAll(SELECTOR_PLACEHOLDER)) {
    if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
    const cs = getComputedStyle(el);
    const durs = (cs.transitionDuration || '')
      .split(',')
      .map((s) => parseFloat(s))
      .filter((n) => Number.isFinite(n));
    /* BOTH HALVES, AND THE SECOND ONE IS NOT PEDANTRY. transition-duration and
       transition-property are independent: an element can resolve 0.18s while
       transitioning NOTHING, and it reads as a control with a transition to
       anything that only looks at the clock. This gate's own self-test found it
       the hard way — the first version cancelled the floor with
       transition-property: none, the durations stayed at 0.18s, and the rule
       reported the site clean while the fault was on the page. */
    const props = (cs.transitionProperty || '').trim();
    out.rows.push({
      s: sig(el),
      props,
      max: props === 'none' || !durs.length ? 0 : Math.max(...durs),
      /* Every distinct non-zero duration on the element, so rule 2 can name the
         one that is off the scale rather than reporting the whole list. */
      set: props === 'none' ? [] : [...new Set(durs.filter((d) => d > 0).map((d) => d.toFixed(4)))],
      where: el.closest('main') ? 'main' : el.closest('footer') ? 'footer'
        : el.closest('header, nav') ? 'nav' : 'other',
    });
  }
  return out;
})()`;

const measureFor = (selector) => MEASURE.replace('SELECTOR_PLACEHOLDER', JSON.stringify(selector));

const browser = await chromium.launch();
const preflight = [];

/* ══════════════════════════════════════════════════════════════════════════
 * THE SELF-TEST. The fault this gate was written for, reinstated, and both of
 * the rules that would have caught it required to fire.
 * ══════════════════════════════════════════════════════════════════════════ */

const probe = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/* FAULT 1: the floor stopping at the content landmark, which is what shipped.
   Re-created by cancelling it everywhere outside <main>, which is the same set
   of elements the `main ` prefix used to leave out. */
await probe.goto(url(SELF_TEST), { waitUntil: 'load' });
await probe.addStyleTag({
  content: `footer :where(${SELECTOR}) { transition-property: none; }`,
});
const faultScope = await probe.evaluate(measureFor(SELECTOR));
const faultScopeDead = faultScope.rows.filter((r) => r.max === 0);

/* FAULT 2: a duration typed into a component instead of taken from the scale. */
await probe.goto(url(SELF_TEST), { waitUntil: 'load' });
await probe.addStyleTag({
  content: `footer :where(${SELECTOR}) { transition-duration: 0.42s; }`,
});
const faultClock = await probe.evaluate(measureFor(SELECTOR));
const tokenSet = new Set(faultClock.tokens.map((t) => t.s.toFixed(4)));
const faultClockOff = faultClock.rows.filter((r) => r.set.some((d) => !tokenSet.has(d)));

if (!faultScopeDead.length) {
  preflight.push(
    'RULE 1 DID NOT FIRE. The pointer floor was cancelled on every control in the footer ' +
    `of ${SELF_TEST} and this gate still found no element without a transition. Either the ` +
    'injection is not reaching them or the rule has stopped measuring; either way a clean ' +
    'run below would mean nothing.',
  );
}
if (!faultClock.tokens.length) {
  preflight.push(
    'RULE 2 HAS NOTHING TO COMPARE AGAINST. None of --dur-fast, --dur, --dur-card or ' +
    '--dur-slow resolved on :root, so every duration on the site would pass as if it were ' +
    'on the scale. Check that styles/tokens.css is reaching the page.',
  );
}
if (!faultClockOff.length) {
  preflight.push(
    'RULE 2 DID NOT FIRE. A 0.42s duration — a number on no scale in tokens.css — was ' +
    `forced onto the footer controls of ${SELF_TEST} and this gate reported every duration ` +
    'as coming from the token set.',
  );
}
await probe.close();

/* ══════════════════════════════════════════════════════════════════════════
 * THE SITE
 * ══════════════════════════════════════════════════════════════════════════ */

const all = routes().sort();
const dead = new Map();      // rule 1
const offClock = new Map();  // rule 2
const loud = new Map();      // rule 3
const used = new Set();
let measured = 0;
let tokenNames = [];

const bucket = (map, key, route, extra = {}) => {
  const rec = map.get(key) || { routes: new Set(), n: 0, ...extra };
  rec.routes.add(route);
  rec.n++;
  map.set(key, rec);
};

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const route of all) {
  await page.goto(url(route), { waitUntil: 'load' });
  const res = await page.evaluate(measureFor(SELECTOR));
  if (!tokenNames.length) tokenNames = res.tokens.map((t) => `${t.name} ${t.s}s`);
  const scale = new Set(res.tokens.map((t) => t.s.toFixed(4)));
  for (const r of res.rows) {
    measured++;
    const key = `${r.s} | ${r.where}`;
    const ex = ALLOW.find((a) => a.selector === key);
    if (ex) {
      used.add(key);
      continue;
    }
    if (r.max === 0) bucket(dead, key, route);
    for (const d of r.set) if (!scale.has(d)) bucket(offClock, `${key} | ${d}s`, route);
  }
}
await page.close();

/* RULE 3. A separate context because emulateMedia is a browser-level setting and
   the site's answer to it is a token rebinding rather than a rule, so the only
   honest way to read it is to ask the browser again with the preference on. */
const quiet = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await quiet.emulateMedia({ reducedMotion: 'reduce' });
for (const route of all) {
  await quiet.goto(url(route), { waitUntil: 'load' });
  const res = await quiet.evaluate(measureFor(SELECTOR));
  for (const r of res.rows) {
    if (r.max > REDUCED_CEILING) bucket(loud, `${r.s} | ${r.where} | ${r.max}s`, route);
  }
}
await quiet.close();

await browser.close();
server.close();

if (preflight.length) {
  console.error('\ntransitions: THE GATE COULD NOT BE SHOWN TO FAIL\n');
  for (const p of preflight) console.error(`  ${p}`);
  console.error('');
  process.exit(1);
}

console.log(
  `  self-test: cancelling the floor outside <main> leaves ${faultScopeDead.length} control(s) with no ` +
  `transition and forcing 0.42s leaves ${faultClockOff.length} off the scale — both rules fire on the ` +
  'faults they were written for',
);
console.log(`  the floor's own selector, read from src/styles/motion.css: ${SELECTOR}`);
console.log(`  the scale, read from :root on the page: ${tokenNames.join(', ')}`);

const stale = ALLOW.filter((a) => !used.has(a.selector));
if (stale.length) {
  console.log(`\n  ${stale.length} allow-list entr(ies) matched nothing — delete them:`);
  for (const s of stale) console.log(`    ${s.selector}`);
}

const failures = [];
for (const [key, rec] of dead) {
  failures.push({
    rule: 'ANSWERED',
    line: `${key} — ${rec.n} element(s) on ${rec.routes.size} route(s) resolve no transition at all`,
  });
}
for (const [key, rec] of offClock) {
  failures.push({
    rule: 'CLOCK',
    line: `${key} — ${rec.n} element(s) on ${rec.routes.size} route(s) transition on a duration that is not a token`,
  });
}
for (const [key, rec] of loud) {
  failures.push({
    rule: 'PREFERENCE',
    line: `${key} — ${rec.n} element(s) on ${rec.routes.size} route(s) still transition under prefers-reduced-motion: reduce`,
  });
}

console.log(
  `  measured ${measured} interactive element(s) across ${all.length} route(s) at 1440, and again ` +
  'with reduced motion',
);

if (failures.length) {
  console.error(`\ntransitions: ${failures.length} CONTROL RECIPE(S) OFF THE FLOOR\n`);
  const label = {
    ANSWERED: 'ANSWERED    every control answers a pointer, wherever on the page it sits',
    CLOCK: 'CLOCK       every duration comes from tokens.css, never from a number',
    PREFERENCE: 'PREFERENCE  reduced motion collapses every duration on the site',
  };
  for (const rule of ['ANSWERED', 'CLOCK', 'PREFERENCE']) {
    const group = failures.filter((f) => f.rule === rule);
    if (!group.length) continue;
    console.error(`  ${label[rule]}`);
    for (const f of group) console.error(`    ${f.line}`);
    console.error('');
  }
  console.error(
    '  The pointer floor in styles/motion.css gives every control a transition from\n' +
    '  --dur-fast and --ease, at zero specificity, so anything reported above either\n' +
    '  sits outside that rule or has cancelled it. Do not answer this by writing a\n' +
    '  transition next to the control: the floor is the shared answer, and a private\n' +
    '  one is the fork every gate in this directory exists to prevent. If a hover\n' +
    '  changes a property on a CHILD of the control — an icon\'s fill, say — the\n' +
    '  transition belongs on that child and states why, as Footer.astro does for the\n' +
    '  social icons.\n',
  );
  process.exit(1);
}

console.log('\n  every control on the site answers a pointer, on the site\'s own clock, and stops\n  when a reader asks it to\n');
