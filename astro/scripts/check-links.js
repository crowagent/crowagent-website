/**
 * check-links.js — every internal link must point at something that ships.
 *
 * THE GAP THIS CLOSES. The sitewide suite asserts that a page's SUBRESOURCES
 * (images, CSS, JS) all return 2xx. It says nothing about where the page's own
 * links go, because a link is not fetched during a page load. So a link to a
 * route that was never ported passes every check on the site and 404s the
 * moment a reader clicks it.
 *
 * That is not hypothetical here. Five legacy routes are deliberately unported
 * while their content-accuracy questions sit with the owner, and the homepage's
 * closing call to action links to one of them. At cutover the Astro build
 * replaces the legacy site wholesale, so every such link becomes a 404 on the
 * busiest page.
 *
 * WHAT COUNTS AS RESOLVING. A link is fine if it hits a built page, a built
 * file, or a rule in _redirects — the last because a redirect is a deliberate
 * decision that a URL should keep working without a page behind it, and 82 of
 * those rules exist for exactly that reason. Everything else is a defect.
 *
 * Runs as a build step and FAILS the build, for the same reason copy-assets.js
 * does: a check that only prints is a check that gets ignored.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/*
 * KNOWN UNPORTED — AND THIS LIST IS NOW EMPTY. OA-20 IS CLOSED.
 *
 * It began at four routes reached from the global nav and footer, so linked
 * from every page in the build: the first run of this check found 4 targets x
 * 38 pages. None was an oversight; each was blocked on a content-accuracy
 * decision recorded in OWNER-ACTIONS.md, and inventing a page to satisfy a link
 * checker would have been the worse failure.
 *
 * The contract was that the set can only shrink, and an entry is deleted rather
 * than reworded the moment its route ships. All four have now shipped:
 *
 *   /pricing             2026-08-02.  OA-05 asked whether "Active bids:
 *                        Unlimited" contradicted enforced caps of 5 and 25 a
 *                        month. It did not, and neither number was real: the
 *                        CrowMark guard that held them ran against a table that
 *                        does not exist in production, and the surviving 5/25
 *                        pair belongs to CrowAgent Core's PROPERTY limit. The
 *                        axis CrowMark is metered on is AI credits, 200 / 750 /
 *                        3,000 a month, which the legacy page never published.
 *                        See the header of src/pages/pricing.astro.
 *   /integrations        2026-08-03.  OA-10. The page named connectors that do
 *                        not exist (Zapier, Make, customer SMS) and omitted
 *                        every document source that does. Rebuilt from the
 *                        platform repo, scope by scope, in
 *                        src/data/integrations.ts.
 *   /roadmap             2026-08-03.  OA-13. A quarter stamped on work the same
 *                        page called uncommitted. `date` is now optional on the
 *                        Phase type and `status` is not, so the defect cannot be
 *                        typed back in. See src/data/roadmap.ts.
 *   /cookie-preferences  2026-08-03.  It manages nothing, because this site sets
 *                        nothing, and it says so. /cookies was corrected in the
 *                        same change to describe the site that exists.
 *
 * THE LIST STAYS, EMPTY, AND THAT IS DELIBERATE. Deleting the mechanism with
 * the last entry would mean the next unported route fails the build with no
 * documented way to record why it is unported, and the pressure at that moment
 * is to weaken the check rather than to write the reason down. An entry here
 * costs one line and has to carry a justification somebody can disagree with.
 */
const KNOWN_UNPORTED = new Map([]);

/** Assets are verified by copy-assets.js and by the sitewide suite. */
const ASSET_EXT = /\.(webp|png|jpe?g|svg|ico|gif|css|js|mjs|xml|txt|json|woff2?|pdf|zip|map)$/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(DIST);
const rel = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/');

/* Every URL the build can actually serve, in each form a link might use it. */
const served = new Set();
for (const f of files) {
  const r = rel(f);
  served.add(r);
  if (r.endsWith('/index.html')) {
    const dirForm = r.slice(0, -'index.html'.length); // /faq/
    served.add(dirForm);
    served.add(dirForm.replace(/\/$/, '') || '/'); // /faq
  }
}

/*
 * Redirect rules, as from -> {to, status}.
 *
 * A RULE IS NOT A DESTINATION. The first version of this file treated the mere
 * presence of a URL on the left-hand side as proof the link worked, which is
 * wrong and hid a real defect: `_redirects` carries
 *
 *   /tools/ppn-002-calculator/methodology  /tools/ppn-002-calculator/methodology/index.html  200
 *
 * a 200 REWRITE, not a redirect. The browser is served that file directly. In
 * the Astro build that file does not exist, so the rule rewrites to nothing and
 * the link 404s — while passing a checker that only looked at the left column.
 * The Astro calculator page links there, so this was a fifth dead route hiding
 * behind a green check.
 *
 * A link now resolves through a rule only if the rule's DESTINATION resolves
 * too, followed recursively (rules chain) with a depth cap. External
 * destinations are trusted: they are outside this build's control.
 */
const rules = new Map();
const redirectFile = path.join(DIST, '_redirects');
if (fs.existsSync(redirectFile)) {
  for (const line of fs.readFileSync(redirectFile, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, status] = t.split(/\s+/);
    if (!from || !to) continue;
    const entry = { to, status: status || '301' };
    for (const k of [from, from.replace(/\/$/, ''), from + '/']) {
      if (!rules.has(k)) rules.set(k, entry);
    }
  }
}

/** Does this path correspond to something the build actually emits? */
function isServed(href) {
  return [
    href,
    href + '/',
    href.replace(/\/$/, ''),
    href.replace(/\/?$/, '/') + 'index.html',
  ].some((f) => served.has(f));
}

function resolves(href, depth = 0) {
  if (isServed(href)) return true;
  if (depth > 5) return false; // a rule loop is not a resolution

  for (const form of [href, href + '/', href.replace(/\/$/, '')]) {
    const rule = rules.get(form);
    if (!rule) continue;
    // Off-site, or a splat/placeholder we cannot evaluate statically: trust it.
    if (/^https?:\/\//i.test(rule.to) || rule.to.includes(':') || rule.to.includes('*')) return true;
    if (resolves(rule.to.split('#')[0].split('?')[0], depth + 1)) return true;
  }
  return false;
}

const broken = new Map(); // href -> Set(pages)

for (const f of files.filter((x) => x.endsWith('.html'))) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const raw = m[1];
    const href = raw.split('#')[0].split('?')[0];
    if (!href || href.startsWith('/_assets') || href.startsWith('/Assets')) continue;
    if (ASSET_EXT.test(href)) continue;
    if (resolves(href)) continue;
    if (!broken.has(href)) broken.set(href, new Set());
    broken.get(href).add(rel(f));
  }
}

const pageCount = files.filter((x) => x.endsWith('.html')).length;

/* Split into the tracked set and everything else. Only the latter fails. */
const tracked = [];
const unexpected = [];
for (const [href, pages] of broken) {
  const key = href.replace(/\/$/, '') || '/';
  (KNOWN_UNPORTED.has(key) ? tracked : unexpected).push([href, pages, KNOWN_UNPORTED.get(key)]);
}

if (tracked.length) {
  /* Never silent. A link that 404s on every page of the site is the kind of
     thing that gets discovered by a reader, and the spec's success criteria
     say zero regressions in URLs. */
  console.log(
    `links: ${tracked.length} target(s) do not ship yet, each blocked on an owner decision:`
  );
  for (const [href, pages, why] of tracked.sort((a, b) => b[1].size - a[1].size)) {
    console.log(`  ${href.padEnd(22)} ${why.padEnd(22)} linked from ${pages.size}/${pageCount} pages`);
  }
}

if (unexpected.length) {
  console.error(`\nlinks: ${unexpected.length} internal link target(s) do not ship and are NOT tracked\n`);
  for (const [href, pages] of unexpected.sort((a, b) => b[1].size - a[1].size)) {
    console.error(`  ${href}`);
    for (const p of [...pages].sort()) console.error(`      linked from ${p}`);
  }
  console.error('');
  process.exit(1);
}

console.log(`links: every other internal link across ${pageCount} pages resolves`);
process.exit(0);
