/**
 * A-241. THE PORTAL WAS UNASSESSED FOR PROSE WIDTH AND CENTRING.
 *
 * The website has check-render.js, which measures every route for a readable
 * measure and for content that centres. The portal had no equivalent and no way
 * to get one, because the row was filed when nothing could authenticate against
 * it. `PORTAL_DEV_AUTH_BYPASS=1` on a local dev server is that way, so the
 * question the website has answered for 45 routes can now be asked of the portal.
 *
 * WHAT IT ASSERTS, and each is the same question check-render asks of the site:
 *
 *   1. Every route LANDS where it was asked to land, and answers 200. This runs
 *      first and it is not a formality. A 404 or a redirect to /login still has
 *      paragraphs, a container and a width, so it yields plausible numbers that
 *      describe the wrong page. Any route that does not land is reported as
 *      UNMEASURED rather than being quietly measured.
 *   2. No line of prose runs longer than MAX_MEASURE. Past roughly 80 characters
 *      the eye loses the start of the next line.
 *   3. Body prose is not centred. Centred text has a ragged left edge, so every
 *      line starts in a different place.
 *
 * Run:  PORTAL_URL=http://localhost:3100 node scripts/measure-portal-prose.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.PORTAL_URL || 'http://localhost:3100';
const MAX_MEASURE = 80;

/* Chrome, not the portal, decides these. A route is listed here only if it is
   reachable with the dev auth bypass, so the denominator is stated rather than
   implied. */
const ROUTES = [
  '/login',
  '/portal',
  '/portal/agents',
  /* the bare section URL is a redirect stub, so name the page it lands on */
  '/portal/settings/users',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const wide = [];
const centred = [];
const unmeasured = [];
const perRoute = [];
const noProse = [];
let measuredRoutes = 0;

for (const route of ROUTES) {
  let res;
  try {
    res = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 90000 });
  } catch (err) {
    unmeasured.push({ route, why: 'navigation threw: ' + err.message.split('\n')[0] });
    continue;
  }
  const status = res ? res.status() : 0;
  const landed = new URL(page.url()).pathname;

  /* RULE 0-V check 4. Assert the status and the landed path BEFORE measuring.
     Two routes returning an identical figure is the tell that both are the same
     redirected page, and that tell is easy to miss once numbers are on screen. */
  if (status !== 200) {
    unmeasured.push({ route, why: 'answered ' + status });
    continue;
  }
  if (landed !== route) {
    unmeasured.push({ route, why: 'redirected to ' + landed });
    continue;
  }
    /* ORDER MATTERS AND I GOT IT WRONG ONCE. This wait used to sit directly
       after goto, ahead of the status and landed checks, so /portal/settings was
       reported as rendering no prose when the truth is that it REDIRECTS to
       /portal/settings/users. A content wait placed before the landing
       assertions hides the very thing those assertions exist to catch.

       THE PORTAL IS A REACT APP AND domcontentloaded IS TOO EARLY. Measured:
       at domcontentloaded this script considered ZERO paragraphs on all three
       /portal routes and still printed PASS, which is a pass over an empty
       shell. Wait for prose to exist before asking how wide it is. A route that
       never renders any is reported, not silently counted as clean. */
    try {
      await page.waitForFunction(
        () => ((document.querySelector('main') || document.body).textContent || '').trim().length >= 40,
        null,
        { timeout: 30000 },
      );
    } catch {
      unmeasured.push({ route, why: 'rendered NOTHING within 30s, so the shell never filled' });
      continue;
    }
  measuredRoutes++;

  const found = await page.evaluate((max) => {
    const sig = (el) => {
      const cls = [...el.classList].filter((c) => !/^(css|astro)-/.test(c));
      return el.tagName.toLowerCase() + (cls.length ? '.' + cls.slice(0, 3).join('.') : '');
    };
    /* One canvas, reused. measureText on the 0 glyph is the advance width the
       CSS ch unit is defined against. */
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    const chCache = new Map();
    const charWidth = (font) => {
      if (chCache.has(font)) return chCache.get(font);
      ctx.font = font;
      const w = ctx.measureText('0').width;
      chCache.set(font, w);
      return w;
    };
    const root = document.querySelector('main') || document.body;
    const tooWide = [];
    let considered = 0;
    let skippedNoCh = 0;
    const isCentred = [];
    for (const el of root.querySelectorAll('p, li, dd')) {
      const text = (el.textContent || '').trim();
      if (text.length < 60) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;

      /* Characters per line, not pixels. A pixel width means nothing without the
         font size, and the readability limit is stated in characters.

         THE ch WIDTH IS MEASURED, NOT ASSUMED. An earlier version of this script
         approximated it as half the font size, which is close enough for a
         proportional face and badly wrong for a monospace one, where the advance
         is nearer 0.6em. Asserting a defect on an approximation is how a phantom
         gets filed, so the real advance width is taken from the element own font
         by rendering a canvas at its exact computed font shorthand. */
      const ch = charWidth(cs.font || (cs.fontWeight + " " + cs.fontSize + "/" + cs.lineHeight + " " + cs.fontFamily));
      if (!ch) { skippedNoCh++; continue; }
      considered++;
      const cpl = r.width / ch;
      /* A WIDE BOX IS NOT A LONG LINE. This flagged a 64 character sentence at
         110 cpl because it measured the CONTAINER, and a short sentence in a wide
         container wraps at its own length, not at the box width. The measure only
         bites when the text is long enough to actually fill the line, so both
         conditions have to hold. Without this the rule reports a defect on copy
         that is already comfortable to read. */
      if (cpl > max && text.length > max) {
        tooWide.push({ sel: sig(el), cpl: Math.round(cpl), px: Math.round(r.width), chars: text.length });
      }
      /* A CENTRED EMPTY STATE IS A DESIGN, NOT A DEFECT. The centring rule is
         about body copy, where a ragged left edge makes every line start in a
         different place. An empty state is a short centred message inside its own
         constrained box and is centred deliberately, which is why both instances
         this found were the description prop of the shared EmptyState component.
         Exempted by ancestry rather than by class name, so a future empty state
         is covered without editing a list. */
      const inEmptyState = el.closest('[data-empty-state], .ca-empty-state, [role="status"]') !== null;
      if (cs.textAlign === 'center' && !inEmptyState) {
        isCentred.push({ sel: sig(el), text: text.slice(0, 50) });
      }
    }
    return { tooWide, isCentred, considered, skippedNoCh, chSample: charWidth(getComputedStyle(root).font || "16px sans-serif") };
  }, MAX_MEASURE);

  for (const w of found.tooWide) wide.push({ route, ...w });
  for (const c of found.isCentred) centred.push({ route, ...c });
  perRoute.push({ route, considered: found.considered, skippedNoCh: found.skippedNoCh, ch: found.chSample.toFixed(2) });
  if (found.considered === 0) noProse.push(route);
}

await browser.close();

const line = '='.repeat(78);
console.log('\n' + line);
console.log('A-241  PORTAL PROSE WIDTH AND CENTRING, measured at 1440');
console.log(line);
console.log('routes measured: ' + measuredRoutes + ' of ' + ROUTES.length);

/* THE DENOMINATOR. A pass over zero paragraphs is not a pass, and the count of
   elements this actually looked at is the only thing that separates the two. */
console.log('paragraphs considered per route:');
for (const r of perRoute) console.log('  ' + r.route + '   ' + r.considered + ' considered, ' + r.skippedNoCh + ' skipped for no ch, root ch=' + r.ch + 'px');
const totalConsidered = perRoute.reduce((a, r) => a + r.considered, 0);
console.log('  TOTAL considered: ' + totalConsidered);

/* A ROUTE THAT RENDERED BUT CARRIES NO LONG PROSE IS NOT A FAILURE, and it is
   not a silent pass either. /portal/settings/users is a members table: it has
   nothing for a measure rule to measure, which is a different fact from a page
   that never rendered, and the two were conflated until this run. Both are
   printed, only the second fails. */
if (noProse.length) {
  console.log('\nrendered, but carry no prose of 60 characters or more, so nothing to measure:');
  for (const r of noProse) console.log('  ' + r);
}

if (unmeasured.length) {
  console.log('\nUNMEASURED, and these are not passes:');
  for (const u of unmeasured) console.log('  ' + u.route + '   ' + u.why);
}

console.log('\n  prose over ' + MAX_MEASURE + ' characters per line: ' + wide.length);
for (const w of wide) console.log('    ' + w.route + '   ' + w.sel + '   ' + w.cpl + ' cpl over ' + w.px + 'px, ' + w.chars + ' characters');

console.log('  body prose centred: ' + centred.length);
for (const c of centred) console.log('    ' + c.route + '   ' + c.sel + '   "' + c.text + '"');

/* AN UNMEASURED ROUTE IS A FAILURE, NOT A PASS. The first version of this
   script printed PASS on 1 of 4 routes because the other three redirected to
   /login, which is precisely the shape of control this repository keeps
   finding: a green result standing over a corpus that is nearly empty. The
   denominator is part of the verdict, so it fails until every listed route was
   actually reached. */
const failed = wide.length || centred.length || unmeasured.length || measuredRoutes === 0 || totalConsidered === 0;
console.log('\n' + (failed ? 'FAIL' : 'PASS') + '\n');
process.exit(failed ? 1 : 0);
