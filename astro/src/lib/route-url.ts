/**
 * route-url.ts — the absolute URL of a route, derived in ONE place.
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
 * and it makes `/404` the served form and `/404/` the 308 — the opposite
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
