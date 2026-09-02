/**
 * route-url.ts: the absolute URL of a route, derived in ONE place.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * "What is the URL of this page" was answered twice, by two expressions that
 * had to agree and were never checked against each other:
 *
 *   components/seo/Seo.astro   the canonical, og:url and the WebPage node
 *   lib/schema.ts `abs()`      BreadcrumbList items, BlogPosting @id,
 *                              mainEntityOfPage
 *
 * Both stripped the trailing slash, so both were wrong in the same way at the
 * same time, which is the only reason the duplication never showed. Fixing one
 * would have left the other advertising a redirecting URL from inside the
 * structured data of the very page it describes. One function, imported by
 * both, is what makes that impossible rather than unlikely.
 *
 * ── THE RULE, AND WHAT IT IS DERIVED FROM ───────────────────────────────────
 *
 * Cloudflare Pages canonicalises a request towards whichever form is backed by
 * a file, and only then reads `_redirects`. This project builds with
 * `build.format: 'directory'` (astro.config.mjs), so every route is an
 * `about/index.html` and Cloudflare ADDS the trailing slash. Measured on
 * production with `curl -sI` on 2026-08-12:
 *
 *     /about                            308 -> /about/          /about/  200
 *     /sectors                          308 -> /sectors/        /sectors/  200
 *     /tools/tender-compliance-matrix   308 -> …/               …/  200
 *     /                                 200
 *     /404                              200                     /404/    308 -> /404
 *
 * So the served form is the slashed one, and this returns it.
 *
 * ── WHY THE URL MOVES AND THE SERVER NEVER DOES ─────────────────────────────
 *
 * A `_redirects` rule that strips the slash from a directory-backed route
 * fights Cloudflare's own slash-adding and ping-pongs. That is not a
 * hypothetical: it is the documented cause of the 2026-05-06
 * ERR_TOO_MANY_REDIRECTS incident on /products and /tools, recorded in
 * `_redirects` block 3, which also says those rules "must never come back".
 * Changing what the site PUBLISHES has no second party to disagree with, so it
 * cannot loop. That asymmetry is the whole reason this fix lives here and not
 * in a rule file.
 *
 * ── THE ONE ROUTE THAT IS NOT A DIRECTORY ───────────────────────────────────
 *
 * Astro emits `src/pages/404.astro` as a flat `dist/404.html`, not as
 * `404/index.html`. That is a rule of the framework, not a choice of this site,
 * and it makes `/404` the served form and `/404/` the 308. The opposite
 * direction from every other route, measured above. Adding a slash there would
 * point the page at a redirect, so the flat-file route keeps its bare form.
 *
 * It is named here rather than sniffed because nothing in the source tree
 * records it: it is a property of the emitted build, and this module runs
 * before there is a build to look at. What checks it is
 * `scripts/check-sitemap-routes.js`, which resolves every emitted canonical,
 * breadcrumb item and sitemap URL against the tree that was actually built. If
 * Astro ever changes how it emits 404, or a second flat route appears, that gate
 * fails rather than this assumption quietly going stale.
 *
 * ── THE ANCHOR GRAPH IS GOVERNED BY THE SAME RULE, R28-WEB-SLASH ────────────
 *
 * WHAT THIS FILE FIXED IN 2026-08-12 AND WHAT IT LEFT BEHIND. It corrected
 * every address the site PUBLISHES about itself, the canonical, the og:url, the
 * sitemap and the structured data. It did not reach a single `href`, because an
 * authored anchor never calls it. So from that day the site declared
 * `https://crowagent.ai/about/` as its canonical while every link to that page
 * on all 46 documents said `/about`.
 *
 * MEASURED LIVE ON 2026-09-01, with `fetch(url, { redirect: 'follow' })` so the
 * hop is a fact rather than an inference: 44 of the 48 distinct internal link
 * targets answered 308 before reaching the page, and those 48 targets are drawn
 * 2,490 times across the 46 built documents. Nothing was broken and nothing
 * 404d, which is exactly why it survived. `scripts/check-links.js` asks whether
 * a link RESOLVES and deliberately accepts either spelling, so a redirecting
 * link is invisible to it. Every internal click cost a round trip, and every
 * internal link passed its authority through a redirect rather than into the
 * page.
 *
 * THE ANCHORS NOW CARRY THE SERVED FORM, 277 of them across 66 files. The
 * trailing slash is authored into the href itself rather than routed through
 * this function, because they live in literal markup, markdown and typed data,
 * where a function call cannot go. This module stays the source of truth for
 * what the served form IS.
 * What keeps the two in step is the built output: the route set is read out of
 * `dist`, never out of source, so a flat emitted file such as `llms.txt` or
 * `/404` can never be handed a slash it does not answer 200 on.
 *
 * THE THREE CLASSES THAT DELIBERATELY DID NOT MOVE, each because a slash there
 * would be noise or a defect rather than a fix:
 *
 *   Seo `path` props and breadcrumb `path` values reach this function, and it
 *     normalises either spelling to the same URL. Slashing them would change no
 *     emitted byte. Breadcrumb `path` values DID move, because Breadcrumb.astro
 *     also renders them as `href={c.path}`, which makes them anchors as well.
 *   `activeRoutes` in data/nav.ts are route PREFIXES, matched by Nav.astro's
 *     `isActive`, which strips a trailing slash from both sides before
 *     comparing. They are keys, not addresses.
 *   `_redirects` destinations. 65 of the 87 rules point at a bare directory
 *     route, so a legacy inbound URL takes a 301 and then a 308. That is real
 *     and it is measured, but it is a separate change to a file whose own
 *     header records a redirect-loop incident, and it belongs in its own row.
 */
import { SITE } from '../data/site';

/**
 * Routes Astro emits as a flat `<name>.html` rather than `<name>/index.html`,
 * for which Cloudflare canonicalises towards the UNSLASHED form.
 */
const FLAT_FILE_ROUTES = new Set(['/404']);

/**
 * The absolute URL of a route, in the form the server answers 200 on.
 *
 * @param path Route path, e.g. `/crowmark` or `/blog/some-post`. A trailing
 *   slash is optional; the result is the same either way, so a caller cannot
 *   produce a second spelling of one page by remembering it differently.
 */
export function routeUrl(path: string): string {
  if (FLAT_FILE_ROUTES.has(path.replace(/\/$/, '') || '/')) {
    return new URL(path.replace(/\/$/, ''), SITE.origin).href;
  }
  return new URL(path.endsWith('/') ? path : `${path}/`, SITE.origin).href;
}
