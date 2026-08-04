import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../lib/search-index';

/**
 * /search-index.json — the command palette's index, as ONE static file.
 *
 * ── WHY IT IS A ROUTE AND NOT MARKUP ────────────────────────────────────────
 *
 * It used to be a `<script type="application/json">` inside CommandPalette.astro,
 * which is rendered into the nav, which is on every page. That put a BYTE-FOR-BYTE
 * IDENTICAL 7.1 KB into all 44 documents — 313 KB of the build — and every reader
 * paid for it in the critical HTML of the first page they opened, before pressing
 * anything. It was, on its own, the second largest line item behind the per-route
 * HTML budget breach recorded in scripts/check-budgets.js.
 *
 * The index does not vary by route. Something that does not vary by route belongs
 * in one cacheable file, requested when it is first needed — which for a palette
 * bound to ⌘K and a nav button is never during first paint.
 *
 * ── WHY AN ENDPOINT RATHER THAN A FILE IN public/ ───────────────────────────
 *
 * Because lib/search-index.ts derives the index from NAV, FOOTER and the content
 * collections at build time, precisely so it cannot drift from the routes that
 * exist. A hand-maintained copy in public/ would reintroduce the drift that file
 * was written to prevent. `output: 'static'` prerenders this at build, so what
 * ships is still a plain file on the CDN.
 *
 * Nothing links to it, so scripts/check-links.js and scripts/build-sitemap.js —
 * which read `href="…"` and `index.html` respectively — correctly ignore it, and
 * it is not a page, so it carries no canonical and belongs in no sitemap.
 * `connect-src 'self'` in _headers already permits the fetch.
 */
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildSearchIndex()), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
