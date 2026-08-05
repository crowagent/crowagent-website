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
 * And for every route, whether or not it draws one:
 *
 *   5. It publishes a BreadcrumbList at all. Root excepted: it is the thing a
 *      trail leads back to and has no ancestors to name.
 *   6. If the trail it publishes names an ancestor ABOVE Home, it draws that
 *      trail. Rules 1 to 4 police two statements that disagree; rule 6 is the
 *      case where the page makes the statement to a crawler and withholds it
 *      from the reader. Exemptions are named in NO_VISIBLE_TRAIL below.
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
 *
 * ── RULE 6 PROVED IN BOTH DIRECTIONS, AND AGAINST A CONTROL, 2026-08-05 ────
 *
 * FAILS: layouts/Sector.astro had its one <Breadcrumb> line removed and the site
 * was rebuilt. The gate reported /sectors/construction, /sectors/education,
 * /sectors/facilities and /sectors/highways by name, each quoting the trail the
 * page still published, and exited 1.
 *
 * PASSES: the line restored and rebuilt, 0 routes reported, exit 0.
 *
 * AND THE CONTROL, WHICH IS THE PART THAT PROVES THE HOLE RATHER THAN THE FIX.
 * The version of this file at commit 3c727622 — the one that read "publishing
 * without drawing is not a failure" — was run against THAT SAME BROKEN BUILD and
 * printed "every trail starts at Home ... clears 24 x 24 at both viewports" and
 * exited 0. Four routes telling a crawler about a parent they hid from the
 * reader, and the gate that existed to police breadcrumbs called it clean. A
 * green result from a rule that has never been shown to go red is a claim about
 * the runner, not about the site.
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

/* ── RULE 6's EXEMPTIONS: NESTED ROUTES THAT DELIBERATELY DRAW NO TRAIL ─────
 *
 * Separate from ALLOW above, and that separation is the point. An ALLOW entry
 * exempts a route from this gate ENTIRELY — target size, leaf marking, trail
 * agreement, all of it — which is far too much to spend on a page that has
 * simply chosen not to draw a trail it has no trail to get wrong. An entry here
 * exempts rule 6 and nothing else.
 *
 * Same contract as every other list in this directory: keyed by route, each
 * carrying a reason that is a reason, printed on every run, and reported as
 * stale when it matches nothing. A nested route that is not listed fails.
 */
const NO_VISIBLE_TRAIL = [
  {
    route: '/glossary/ppn-002/',
    reason:
      'layouts/Glossary.astro draws an explicit "Back to glossary" link in the hero, above the ' +
      'title, which is the whole of what a two-link trail would say. Two upward links side by ' +
      'side is the duplication this gate exists to stop, not an improvement on one.',
  },
  {
    route: '/glossary/toms-framework/',
    reason: 'Same layout, same "Back to glossary" link. See the entry above.',
  },
  {
    route: '/tools/tender-compliance-matrix/',
    reason:
      'The page draws its head through components/layout/Section.astro, which owns the whole ' +
      'band and has no slot ahead of its eyebrow. Every route that draws a trail puts it above ' +
      'the head block in an element the page owns, and this is the one route whose head block ' +
      'is a section rather than a hero. Giving Section such a slot to serve one page would let ' +
      'any page push arbitrary markup into the shared band, which is the argument PageHeader ' +
      'already lost once.',
  },
];

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
/** NO_VISIBLE_TRAIL entries that matched a route, for the stale report. */
const usedNoTrail = new Set();
let withCrumb = 0;
/** Routes one hop from the root that publish a trail and draw none. See rule 6
    for why that is counted rather than failed. */
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

    /* THE EXEMPTION IS LOOKED UP FIRST, so that it covers rules 5 and 6 below as
       well as the four rules after them. An ALLOW entry exempts a route from this
       gate, not from part of it. The list is empty, so this changes nothing
       today; it is written this way so that a future entry does not silently
       half-apply. NO_VISIBLE_TRAIL is the deliberately narrower list — it
       exempts rule 6 alone, and is read at rule 6 rather than here. */
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
     * IT DOES NOT TOUCH THE ONE-HOP CASES, of which 20 remain. This rule asks
     * only that something be published; whether the page then DRAWS what it
     * published is rule 6's question, and rule 6 answers it differently
     * depending on how deep the page sits. The two rules are one position — the
     * graph should always know where a page sits, and the screen must repeat it
     * whenever the page's parent is another page.
     *
     * THAT PARAGRAPH SAID SOMETHING ELSE UNTIL A-172. It read "IT DOES NOT TOUCH
     * THE 28 LEGITIMATE CASES. The rule below this one says publishing without
     * drawing is allowed and argues why", and it stopped being true the moment
     * rule 6 was narrowed to the nested case. It is corrected here rather than
     * left, because a comment that describes a rule the file no longer contains
     * is how the next reader learns the wrong contract from the right file.
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

    /* ── RULE 6: PUBLISHING A NESTED TRAIL AND DRAWING NONE ────────────────
     *
     * Rewritten 2026-08-05 under A-172, and the version it replaces is worth
     * stating because it was RIGHT ABOUT 26 ROUTES AND WRONG ABOUT SEVEN.
     *
     * It read: "publishing without drawing is not a failure". Its argument was
     * that failing all 28 such routes would make this gate a demand that
     * /pricing, /faq and twenty-six others grow a breadcrumb they were never
     * designed to have, that this is a design decision, and that a gate which
     * invents one is a gate somebody will delete. All of that still holds — for
     * a page whose published trail is Home > Itself. Its only ancestor is the
     * root, every page on the site links the root from the header logo, and a
     * one-hop trail on screen is decoration.
     *
     * IT DOES NOT HOLD ONE LEVEL DOWN, and that is the scope error A-172 found.
     * /sectors/highways published "Home > Sectors > Highways" and drew nothing.
     * The page therefore knew it had a parent, told a crawler so, and gave the
     * reader no link to it anywhere in the hero; the only route back to the hub
     * was "All sectors" in the closing band, at the far end of the page. Beside
     * it, /compare/crowmark-vs-autogenai published the same shape and drew it.
     * Same depth, opposite treatment, and this gate could not see the difference
     * because every assertion it made was a COMPARISON, and a page with only one
     * of the two statements has nothing to compare.
     *
     * That is the shape the A-172 note names: a check whose question is well
     * chosen but whose scope excludes the failing case, so it reports clean and
     * is believed. The fix is not a new gate, it is the same question asked of
     * the one case that was outside it.
     *
     * WHERE THE LINE FALLS, AND WHY IT IS THIS ONE. An ancestor above Home is
     * information a reader cannot reconstruct from the chrome. Home is already
     * a link in the header on every route. So the rule fires when the published
     * trail carries two or more LINKED ancestors, which is exactly the routes
     * whose parent is a page rather than the root.
     *
     * THE 26 ONE-HOP ROUTES ARE STILL COUNTED AND PRINTED rather than ignored,
     * so the number stays in front of whoever reads a run.
     *
     * PROVED IN BOTH DIRECTIONS, 2026-08-05. See the header note. */
    if (!m.hasNav) {
      if (width === VIEWPORTS[0]) {
        const items = m.published && !m.published.error ? m.published.items : [];
        /* The leaf names this page, so the ancestors are everything before it. */
        const ancestors = Math.max(0, items.length - 1);
        const exempt = NO_VISIBLE_TRAIL.find((n) => n.route === route);
        if (ancestors >= 2 && exempt) {
          usedNoTrail.add(route);
        } else if (ancestors >= 2) {
          flag(
            route,
            `publishes "${items.map((i) => i.name).join(' > ')}" and draws no visible trail; ` +
              'a page whose parent is another page must show the reader the ancestor it tells a crawler about',
          );
        } else {
          publishedOnly += 1;
        }
      }
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
console.log(`  ${publishedOnly} route(s) sit one hop from the root, publish "Home > themselves" and draw`);
console.log('  no visible trail. Allowed, and not silence: their only ancestor is the root, which');
console.log('  the header logo links from every page, so the graph gains a position a reader');
console.log('  already has. A page whose parent is another page does not get that argument and');
console.log('  is failed by rule 6 unless it is named below.');
console.log(`  ${NO_VISIBLE_TRAIL.length} nested route(s) exempt from rule 6 only:`);
for (const n of NO_VISIBLE_TRAIL) {
  const stale = usedNoTrail.has(n.route) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${n.route}${stale}`);
  console.log(`        ${n.reason}`);
}
console.log(`  ${ALLOW.length} route(s) exempt from the gate entirely:`);
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
console.log('  same page publishes, every leaf is marked and unlinked, every crumb link clears');
console.log('  24 x 24 at both viewports, and every page whose parent is another page draws the');
console.log('  ancestor it publishes');
