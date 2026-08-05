/**
 * check-breadcrumbs.js — the trail a reader sees is the trail the page publishes.
 *
 * WHY THIS EXISTS.
 *
 * A breadcrumb is the one component on this site that says the same thing twice:
 * once in markup, for a reader, and once in JSON-LD, for a search engine. Two
 * statements of one fact, maintained by hand, in two places, on every layout that
 * draws one. There is exactly one way that ends.
 *
 * MEASURED ON THE BUILT SITE AT 1440 AND 834, 2026-08-04, before this gate:
 *
 *   /compare/                     rendered "Home › Compare"
 *   the four /compare children    rendered "Compare › CrowMark vs X"
 *                                 published "Home > Compare > CrowMark vs X"
 *   the eight blog posts          rendered "Blog / <category>"
 *                                 published "Home > Blog > <title>"
 *
 * So twelve of the thirteen routes carrying a breadcrumb showed a reader a trail
 * that did not start where the structured data said it started, and the index
 * page beside them did. Nothing could see it: the rendered trail is in the DOM
 * and the published trail is in a <script>, and no gate on this site read both.
 *
 * AND THE TARGET SIZE, WHICH IS THE SAME DEFECT WEARING A DIFFERENT HAT. The
 * WCAG 2.2 SC 2.5.8 argument — a breadcrumb is standalone navigation, so the
 * inline exemption does not reach it — was written out in full in TWO of the
 * three implementations and was absent from the third, which shipped a 33.8 x 15
 * link at 1440 and 31.2 x 14 at 834 on all eight blog posts. check-render.js
 * cannot catch that one: its 2.5.8 rule exempts any target inside an <li>,
 * because that is what "in flowing text" means for a link in a sentence, and a
 * crumb is an <li> that is not flowing text. Two rules, two different questions;
 * this one is asked here.
 *
 * ── WHAT IT ASSERTS, AND WHY THE LEAF IS TREATED DIFFERENTLY ────────────────
 *
 * For every route that draws a breadcrumb:
 *
 *   1. It starts at Home, linking to "/". A trail that starts halfway is not a
 *      trail; it is the reason /compare and its own children disagreed.
 *   2. Every LINKED crumb matches the page's BreadcrumbList, position for
 *      position, by name and by destination.
 *   3. The last item is marked aria-current="page" and is NOT a link. You cannot
 *      navigate to where you already are, and a link that does nothing is a
 *      failure of SC 2.4.4 as much as a design tic.
 *   4. Every crumb link clears 24 x 24 CSS px, on both axes, at 1440 and at 834.
 *
 * THE LEAF LABEL IS NOT COMPARED, and that is a deliberate limit rather than a
 * gap. The BreadcrumbList leaf must NAME THE PAGE, so a blog post's is the full
 * headline; the visible leaf is set in an uppercase mono micro-label, where a
 * 45-character headline is a shout and the category is what a reader wants. Both
 * are right about different things. What has to agree is the part that is a set
 * of LINKS, because that is the part a reader and a crawler both navigate — and
 * that is what rule 2 pins. Stated here so nobody later reads the absence of a
 * leaf check as an oversight and "fixes" it by making one of the two wrong.
 *
 * ── IT ASSERTS THE RENDERED RESULT ──────────────────────────────────────────
 *
 * Every measurement below comes from a real browser on the built page. This
 * codebase has shipped three gates that read declarations and passed while the
 * thing they described was visibly broken, and a breadcrumb is the worst possible
 * candidate for a source-reading check: the trail is assembled from a layout
 * prop, a component loop and a schema helper in three different files, and
 * whether they agree is only knowable once they have all run.
 *
 * ── THE CONTRACT, WHICH IS THE SAME AS EVERY OTHER GATE HERE ────────────────
 *
 * Named exceptions, each carrying a written reason. All printed on every run.
 * Exceptions matching nothing are reported as stale. Anything not listed fails
 * the build.
 *
 * ── PROVED IN BOTH DIRECTIONS ON 2026-08-04 ────────────────────────────────
 *
 * FAILS: run against the build as it stood before the consolidation it reported
 * 12 routes whose visible trail did not start at Home and disagreed with their
 * own BreadcrumbList, and 8 routes with an undersized crumb link. Exit 1.
 *
 * PASSES: run against the build after the consolidation. Exit 0.
 *
 * Proving the pass path is not ceremony here. check-facts.js once printed "every
 * rule clean" while crashing on its reporting path, so the clean result had never
 * executed the code that reports a violation.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist, routesOf } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * Keyed by ROUTE, because a breadcrumb is a property of a page rather than of a
 * component, and a reason that only says "intentional" is not a reason.
 *
 * THIS LIST IS EMPTY AND SHOULD STAY EMPTY. There is no page for which "the
 * trail on screen may contradict the trail in the graph" is a defensible
 * position, and there is no page for which a 14px target is one.
 */
const ALLOW = [];

/** Viewports. 834 is where the blog crumb measured smallest. */
const VIEWPORTS = [1440, 834];

/** WCAG 2.2 SC 2.5.8 minimum, in CSS px. */
const MIN_TARGET = 24;

const server = await serveDist(DIST, 'breadcrumbs');

/* ── THE MEASUREMENT, run inside the page ───────────────────────────────────
 *
 * NO BACKTICKS ANYWHERE BELOW. Everything to the closing brace is a template
 * literal evaluated in the page, so a backtick in a comment ends the string and
 * the file stops parsing. Same constraint check-render.js and
 * check-treatments.js both document, and both learned the hard way.
 */
const MEASURE = `(() => {
  /* THE VISIBLE TRAIL. Found by the landmark rather than by class name, which is
     the point: three class names drew this component and a name list would have
     been one short of the fourth. aria-label="Breadcrumb" is what MAKES it a
     breadcrumb to a screen reader, so it is the only honest selector. */
  const nav = document.querySelector('nav[aria-label="Breadcrumb" i]');

  /* THE PUBLISHED TRAIL. Walked rather than indexed: the schema is emitted as a
     graph on some layouts and as a bare array on others, and both are valid. */
  const published = (() => {
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      let json;
      try {
        json = JSON.parse(s.textContent || '');
      } catch (e) {
        return { error: 'BreadcrumbList JSON-LD does not parse: ' + e.message };
      }
      const nodes = [];
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (!n || typeof n !== 'object') return;
        if (n['@type'] === 'BreadcrumbList') nodes.push(n);
        if (n['@graph']) walk(n['@graph']);
      };
      walk(json);
      if (nodes.length > 1) return { error: nodes.length + ' BreadcrumbList nodes on one page' };
      if (nodes.length === 1) {
        const items = (nodes[0].itemListElement || []).map((i) => ({
          name: String(i.name || ''),
          /* Absolute in the graph, path-relative in the markup. Compared as a
             path so a change of origin is not reported as a broken trail. */
          path: (() => {
            const raw = typeof i.item === 'string' ? i.item : (i.item && i.item['@id']) || '';
            try { return new URL(raw).pathname.replace(/\\/$/, '') || '/'; } catch (e) { return raw; }
          })(),
        }));
        return { items };
      }
    }
    return null;
  })();

  if (!nav && !published) return { none: true };

  const links = nav
    ? [...nav.querySelectorAll('a[href]')].map((a) => {
        const r = a.getBoundingClientRect();
        return {
          name: (a.textContent || '').trim().replace(/\\s+/g, ' '),
          path: new URL(a.href, location.href).pathname.replace(/\\/$/, '') || '/',
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        };
      })
    : [];

  const currents = nav ? [...nav.querySelectorAll('[aria-current="page"]')] : [];

  return {
    hasNav: !!nav,
    published,
    links,
    /* The leaf: marked, unlinked, and there is exactly one of it. */
    currentCount: currents.length,
    currentIsLink: currents.some((c) => c.closest('a[href]') || c.matches('a[href]')),
    currentText: currents.length ? (currents[0].textContent || '').trim().replace(/\\s+/g, ' ') : null,
    /* Whether the trail sits inside the content landmark. A breadcrumb outside
       <main> is site chrome and would not inherit the content region's rules;
       reported rather than judged, because it is a layout question. */
    inMain: nav ? !!nav.closest('main') : null,
  };
})()`;

const browser = await chromium.launch();
const all = routesOf(DIST);

/** route -> [{ viewport, problem }] */
const problems = new Map();
const used = new Set();
let withCrumb = 0;
/** Routes that publish a BreadcrumbList and draw no visible trail. See the note
    at the rule below for why that is reported rather than failed. */
let publishedOnly = 0;

const flag = (route, problem) => {
  if (!problems.has(route)) problems.set(route, []);
  problems.get(route).push(problem);
};

for (const width of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width, height: 1200 } });
  for (const route of all) {
    await page.goto(server.url(route), { waitUntil: 'load' });
    const m = await page.evaluate(MEASURE);

    /* THE EXEMPTION IS LOOKED UP FIRST, so that it covers rule 5 below as well
       as the four rules after it. An exempt route is exempt from this gate, not
       from part of it. The list is empty, so this changes nothing today; it is
       written this way so that a future entry does not silently half-apply. */
    const ex = ALLOW.find((a) => a.route === route);
    if (ex) {
      used.add(route);
      if (!m.none && width === VIEWPORTS[0]) withCrumb += 1;
      continue;
    }

    /* ── RULE 5: A ROUTE THAT PUBLISHES NOTHING WAS INVISIBLE TO THIS GATE ──
     *
     * Added 2026-08-05, and it exists because of a defect this file's first
     * four rules structurally could not see. Every rule above compares a
     * VISIBLE trail with a PUBLISHED one, so a page carrying neither took the
     * `m.none` early exit and was never measured at all. /sectors/ was that
     * page: the one hub on the site emitting no BreadcrumbList, while all four
     * of its own children published a trail running through it. A gate whose
     * every assertion is a comparison is silent about the case where there is
     * nothing to compare, and silence read as a pass here for as long as the
     * page existed.
     *
     * THE ASSERTION IS THE CHEAPEST ONE THAT CLOSES IT: every built route
     * except the root publishes a BreadcrumbList. Root is exempt because it is
     * the thing a trail leads back to and has no ancestors to name.
     *
     * IT FIRES ONLY ON THE CASE NOTHING ELSE READS — neither drawn nor
     * published. A page that DRAWS a trail and publishes none already has a
     * rule below and would otherwise be reported twice for one fault, which
     * teaches a reader that the count and the list disagree.
     *
     * IT DOES NOT TOUCH THE 28 LEGITIMATE CASES. The rule below this one says
     * publishing without drawing is allowed and argues why; this one asks only
     * that something be published. The two are the same position — the graph
     * should always know where a page sits, the screen may or may not repeat it.
     *
     * NOT REACHED BY /404: routesOf() collects index.html only, so 404.html is
     * never in `all`. That is a pre-existing property of this gate rather than
     * a carve-out made here, and it is stated so nobody adds an exception for a
     * route that was never measured.
     *
     * PROVED IN BOTH DIRECTIONS, 2026-08-05. FAILS: run against the build made
     * before the /sectors fix, it reports exactly that one route and exits 1.
     * PASSES: run against the build after, 0 routes reported, exit 0. */
    if (m.none && width === VIEWPORTS[0] && route !== '/') {
      flag(route, 'publishes no BreadcrumbList and draws no trail; every route but the root tells the graph where it sits');
    }

    if (m.none) continue;
    if (width === VIEWPORTS[0]) withCrumb += 1;

    /* ── PUBLISHING WITHOUT DRAWING IS NOT A FAILURE, AND THAT IS ARGUED ────
     *
     * 28 of the 43 routes emit a BreadcrumbList and draw no visible trail. The
     * first version of this rule failed all 28, which would have made this gate
     * a demand that /pricing, /faq and twenty-six other pages grow a breadcrumb
     * they were never designed to have. That is a design decision, and a gate
     * that invents one is a gate somebody will delete.
     *
     * A BreadcrumbList with no visible trail is a supported and ordinary thing:
     * it tells a search result where the page sits, which is useful whether or
     * not the page repeats it on screen. What is never defensible is showing a
     * reader a trail that contradicts the one published beside it, and that is
     * what every rule below asks.
     *
     * COUNTED AND PRINTED rather than ignored, so the number is in front of
     * whoever reads a run and a decision to draw more of them is informed. */
    if (!m.hasNav) {
      if (width === VIEWPORTS[0]) publishedOnly += 1;
      continue;
    }
    if (!m.published) {
      if (width === VIEWPORTS[0]) {
        flag(route, 'renders a breadcrumb but publishes no BreadcrumbList');
      }
      continue;
    }
    if (m.published.error) {
      if (width === VIEWPORTS[0]) flag(route, m.published.error);
      continue;
    }

    /* ── TARGET SIZE, measured at this viewport ─────────────────────────── */
    for (const l of m.links) {
      if (l.w < MIN_TARGET || l.h < MIN_TARGET) {
        flag(route, `at ${width}: crumb link "${l.name}" is ${l.w} x ${l.h}, below the ${MIN_TARGET}px SC 2.5.8 minimum`);
      }
    }

    /* Structure and trail are viewport-independent. Checked once so a failure is
       reported once rather than per viewport. */
    if (width !== VIEWPORTS[0]) continue;

    if (m.currentCount !== 1) {
      flag(route, `${m.currentCount} element(s) marked aria-current="page"; a breadcrumb has exactly one leaf`);
    }
    if (m.currentIsLink) {
      flag(route, 'the aria-current="page" leaf is a link; you cannot navigate to where you already are');
    }

    const shown = m.links;
    const pub = m.published.items;

    if (!shown.length || shown[0].path !== '/') {
      flag(route, `the visible trail starts at "${shown.length ? shown[0].name : '(nothing)'}" rather than Home; the published trail starts at "${pub.length ? pub[0].name : '(nothing)'}"`);
    }

    /* The LINKED crumbs against the published trail, position for position. The
       published leaf is dropped: it names the current page, which is the one item
       that is deliberately not a link. See the header note. */
    const pubLinked = pub.slice(0, Math.max(0, pub.length - 1));
    if (shown.length !== pubLinked.length) {
      flag(route, `${shown.length} linked crumb(s) on screen against ${pubLinked.length} in the BreadcrumbList: [${shown.map((s) => s.name).join(' > ')}] vs [${pubLinked.map((s) => s.name).join(' > ')}]`);
    } else {
      for (let i = 0; i < shown.length; i += 1) {
        if (shown[i].name !== pubLinked[i].name || shown[i].path !== pubLinked[i].path) {
          flag(route, `crumb ${i + 1} on screen is "${shown[i].name}" -> ${shown[i].path}, the BreadcrumbList says "${pubLinked[i].name}" -> ${pubLinked[i].path}`);
        }
      }
    }
  }
  await page.close();
}

await browser.close();
server.close();

console.log(`breadcrumbs: ${all.length} route(s) measured at ${VIEWPORTS.join(' and ')}, ${withCrumb} carrying a trail`);
console.log(`  ${publishedOnly} route(s) publish a BreadcrumbList and draw no visible trail, which is`);
console.log('  allowed and is not silence: the graph tells a search result where a page sits');
console.log('  whether or not the page repeats it on screen. What is never allowed is the two');
console.log('  disagreeing, which is what every rule below asks.');
console.log(`  ${ALLOW.length} route(s) exempt:`);
if (!ALLOW.length) {
  console.log('    none, which is the state to keep it in');
} else {
  for (const a of ALLOW) {
    const stale = used.has(a.route) ? '' : '   [STALE — matches nothing]';
    console.log(`    ${a.route}${stale}`);
    console.log(`        ${a.reason}`);
  }
}

if (problems.size) {
  console.error(`\nbreadcrumbs: ${problems.size} route(s) whose trail is wrong\n`);
  for (const [route, list] of problems) {
    console.error(`  ${route}`);
    for (const p of list) console.error(`      · ${p}`);
  }
  console.error(
    '\n  One component draws every breadcrumb on this site: components/ui/Breadcrumb.astro.\n' +
      '  It takes the SAME array of ancestors the page hands lib/schema.ts breadcrumbs(),\n' +
      '  so the trail on screen and the trail in the graph cannot drift apart — they are\n' +
      '  one list. If a layout needs a different trail, change the list; do not write a\n' +
      '  second one beside it. Three implementations of this component existed on\n' +
      '  2026-08-04 and the third one carried a comment saying it should not.\n' +
      '\n  The 24px floor is SC 2.5.8 and is stated in that component. A breadcrumb is\n' +
      '  standalone navigation, so the inline exemption that covers a link inside a\n' +
      '  sentence does not reach it, and check-render.js will not catch this for you:\n' +
      '  its target rule exempts everything inside an <li>, which every crumb is.\n',
  );
  process.exit(1);
}

console.log('\n  every trail starts at Home, every linked crumb matches the BreadcrumbList the');
console.log('  same page publishes, every leaf is marked and unlinked, and every crumb link');
console.log('  clears 24 x 24 at both viewports');
