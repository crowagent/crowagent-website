# SEO Standards — crowagent.ai

Single source of truth for URL structure, metadata, structured data, and crawler policy.
Grounded in `astro/src/lib/schema.ts`, `astro/src/components/seo/Seo.astro`,
`astro/src/data/site.ts`, `sitemap.xml`, `robots.txt`, and the four content-collection
layouts as of 2026-08-02.

## 1. URL preservation is the binding constraint

**Not one of the 42 sitemapped URLs changes during the Astro rebuild.** This is stated
as the hardest constraint in `MODERNISATION-ARCHITECTURE.md` §3 and is "the one most
likely to be violated by accident" — every route in `astro/src/pages/` mirrors today's
URL exactly, and the 82 rules in `_redirects` (budget, mechanics and traps documented in
`DEPLOYMENT-AND-RELEASE.md` §4) are carried over unchanged.

This constraint exists because URLs are what search engines have indexed, what
`_redirects` targets, what backlinks point at, and what `og:url`/canonical tags across
the web already reference. Changing a URL during a rebuild is not a refactor, it is a
silent de-indexing event.

`ADR/0005` (referenced by `specs/architecture/README.md` as the record of this decision)
had not been written as of this pass — the constraint is currently documented in
`MODERNISATION-ARCHITECTURE.md` §3 and enforced by `tests/parity.spec.js`
(`TESTING-AND-QUALITY-GATES.md` §7), not yet by a standalone ADR.

### Route forms and Cloudflare's canonicalisation

Cloudflare Pages canonicalises **before** `_redirects` is consulted:
`/about.html` → 308 → `/about`; `/about/` → 308 → `/about`; `/sectors` → 308 →
`/sectors/`. A URL form that gets canonicalised away can never have been indexed as a
200, which is why `sitemap.xml` lists only the canonical form of every route — no
`.html` twins, no wrong-trailing-slash forms. Full mechanics:
`DEPLOYMENT-AND-RELEASE.md` §4.5.

## 2. Canonical derivation

Canonicals are **computed, never hand-written**, in `astro/src/components/seo/Seo.astro`:

```ts
const canonical = new URL(path, SITE.origin).href.replace(/\/$/, '') || SITE.origin;
```

Every page passes its own route `path` prop; the canonical is derived from that path
against `SITE.origin` (`https://crowagent.ai`, `astro/src/data/site.ts`), with any
trailing slash stripped (root falls back to the bare origin, since stripping `/` from
`https://crowagent.ai/` would otherwise produce an empty string). This closes a specific
legacy defect: the pre-rebuild site hand-wrote canonicals per page, and at least one page
was found claiming a URL that no longer existed. A canonical that is a function of the
route cannot drift from where the page actually lives.

`og:url` is set to the same computed `canonical` value, not written separately — there
is exactly one source for "what URL is this page" per render.

## 3. The metadata component — `Seo.astro`

Before the rebuild, this markup was copy-pasted into 45 separate `<head>` blocks: 44
pages repeated the OG tag block, 40 repeated an identical `Organization` JSON-LD node
verbatim, and `index.html`'s and `crowmark.html`'s `<head>` blocks had drifted 427 lines
apart from each other (`MODERNISATION-ARCHITECTURE.md` §1). `Seo.astro` is the single
place all of that is now assembled; a page supplies only what is genuinely different
about it — `title`, `description`, `path`, and optionally `image`/`schema`/`noindex`.

Emits: `<title>`, meta description, canonical link, `robots` meta (`index, follow`
unless `noindex` is explicitly passed — noindex is opt-in and must be deliberate, never
a default), the full Open Graph block (`og:site_name`, `og:locale=en_GB`, `og:type`,
title/description/url/image + dimensions/alt), the full Twitter Card block
(`summary_large_image`), `article:published_time`/`article:modified_time` when a blog
post supplies dates, and the JSON-LD `<script>` block (§4).

`ogTitle`/`ogDescription`/`twitterTitle`/`twitterDescription` default to
`title`/`description` respectively but can be overridden — this exists because some
legacy `compare/*`, `sectors/*` and `glossary/*` pages hand-wrote a genuinely different
OG title/description from their on-page `<title>`/meta description, and the port
preserves that divergence rather than collapsing it.

## 4. Structured data — the intended architecture, and where it actually holds

### 4.1 The stated principle

`astro/src/lib/schema.ts`'s own header states the architectural position precisely:

> A collection knows its own schema types. Add a post, get correct structured data for
> free. Nothing to remember, nothing to review.

The file exports three pure functions against typed inputs:

| Function | Emits | Notes |
|---|---|---|
| `blogPosting(input)` | `BlogPosting` | `mainEntityOfPage` links the node to its own page; `dateModified` falls back to `datePublished` when unset, on the basis that an unedited post genuinely has the same modified date as its published date |
| `faqPage(entries)` | `FAQPage`, or `[]` | Returns an **empty array**, not an `FAQPage` with zero questions, when there are no entries — an empty `FAQPage` is a structured-data error search engines report against, not a neutral no-op |
| `breadcrumbs(crumbs)` | `BreadcrumbList` | Positions are 1-based per the schema.org spec |

`Organization` and `WebSite` are described in `schema.ts`'s header comment as "appended
by `Seo.astro` on every page, so they are deliberately NOT built here."

### 4.2 What is actually true, measured per collection

**Only the blog collection (`Article.astro`) imports and uses `schema.ts`.** Verified by
reading all four ported layouts:

| Layout | Imports `schema.ts`? | JSON-LD actually emitted | How it is built |
|---|---|---|---|
| `Article.astro` (blog) | **Yes** — `blogPosting`, `breadcrumbs` | `BlogPosting`, `BreadcrumbList` | Via the shared functions |
| `Compare.astro` | **No** | `BreadcrumbList`, `Article`, `FAQPage` (conditional on `faq.length`) | Hand-assembled inline, duplicating the shape `schema.ts` already provides for `BreadcrumbList` and `FAQPage` |
| `Sector.astro` | **No** | `BreadcrumbList`, `FAQPage` (conditional) | Hand-assembled inline, same duplication |
| `Glossary.astro` | **No** | `DefinedTerm` (with `inDefinedTermSet`), `BreadcrumbList` | Hand-assembled inline; no equivalent helper exists in `schema.ts` for `DefinedTerm` |

**`WebSite` is not emitted anywhere.** Checked across `astro/src/data/site.ts` (which
defines only `organizationSchema`) and every layout — no `'@type': 'WebSite'` node exists
in the codebase, despite `schema.ts`'s own comment stating it is appended by `Seo.astro`.
This is a documentation/implementation gap, not a deliberate omission recorded anywhere.

**`Organization` is real and consistent.** `Seo.astro` prepends `SITE.organizationSchema`
to the `@graph` on every page, unconditionally, before any page-specific nodes. Its
`identifier` carries the Companies House number (`17076461`) and `email` is
`hello@crowagent.ai` — corrected during the port from a cross-project copy/paste defect
in the legacy `index.html`, whose static JSON-LD had carried `crowagent.platform@gmail.com`
/ "Crow Agent" (the `crowagent-platform` repository's identity strings, not this site's).

### 4.3 What this means in practice

The stated goal — "structured data is derived from the content model, not authored per
page" — is **true for the blog collection and not yet true for the other three**. Three
of four ported layouts currently duplicate `schema.ts`'s logic inline rather than
importing it, which is exactly the failure mode `schema.ts`'s own header warns
against ("the duplicate would drift"). This is not a hypothetical risk: it is measured
to have already produced a divergence. `migration/VISUAL-PARITY.md`
(`TESTING-AND-QUALITY-GATES.md` §7) shows **every one of the 22 currently-ported routes**
failing the parity harness's JSON-LD `@type`-set hard-failure check against legacy, and
the sampled rows are consistent with `Compare`/`Sector`/`Glossary` pages emitting a
different `@type` set than the legacy pages they replace. Bringing those three layouts
onto `schema.ts` (adding `faqPage()`/a `definedTerm()` helper as needed) is the direct
fix implied by the architecture's own stated principle, not a new requirement invented
here.

### 4.4 `@type` inventory by collection (as currently emitted)

| Route family | `@type`s emitted | Source |
|---|---|---|
| `/` and every non-collection page | `Organization` | `Seo.astro` unconditional |
| `/blog/*` post | `Organization`, `BlogPosting`, `BreadcrumbList` | `schema.ts` via `Article.astro` |
| `/compare/*` | `Organization`, `BreadcrumbList`, `Article`, `FAQPage` (if `faq` non-empty) | Inline in `Compare.astro` |
| `/sectors/*` | `Organization`, `BreadcrumbList`, `FAQPage` (if `faq` non-empty) | Inline in `Sector.astro` |
| `/glossary/<term>` | `Organization`, `DefinedTerm`, `BreadcrumbList` | Inline in `Glossary.astro` |
| Collection index pages (`/compare/`, `/sectors/`, `/glossary/`) | `CollectionPage`, plus `DefinedTermSet` on `/glossary/` | Inline, per-page (not covered by `schema.ts` at all — these are not content-collection entries, they are hand-authored index pages) |

## 5. Sitemap

`sitemap.xml` — hand-maintained XML, **42 `<url>` entries** as of this writing (counted
directly: `grep -o "<loc>[^<]*</loc>" sitemap.xml | wc -l`). Every entry carries
`<lastmod>`, `<changefreq>`, `<priority>` (homepage `1.0`, `/pricing` `0.8`, tapering by
route importance elsewhere). Historical notes embedded as XML comments at the top of the
file record why: no `www` (matches canonical form), no `.html` extensions (matches
Cloudflare's clean-URL handling), no `/products/*` legacy paths (they are 301 sources,
not indexable pages), no trailing slash on non-directory routes (matches Cloudflare's
canonicalisation).

**A route that redirects away must never be in `sitemap.xml`.** This was violated once
and fixed: the five `/blog/category/*` URLs were removed from the sitemap on 2026-07-29
specifically because they had become plain 301s rather than 200-serving pages — "a URL
that redirects away has no business being submitted for indexing" (`_redirects` §13).
Any route added to `_redirects` as a 301/302 source must be confirmed absent from
`sitemap.xml`, and vice versa.

`changelog.xml` carries its own `<?xml-stylesheet type="text/xsl" href="/Assets/css/rss.xsl"?>`
processing instruction so the RSS feed renders as a readable page in a browser rather
than raw markup — this is a real, build-checked reference (`scripts/build-dist.js`
resolves `href` attributes in XML/XSL feeds; `TESTING-AND-QUALITY-GATES.md` §2.2).

## 6. Robots

`robots.txt`: `User-agent: * / Allow: /` as the default, plus explicit `Allow: /` blocks
for named AI/LLM crawlers — `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `CCBot`,
`anthropic-ai`, `ClaudeBot`, `Claude-Web`, `Google-Extended`, `PerplexityBot`,
`Perplexity-User`, `Applebot-Extended`, `Bytespider`, `Meta-ExternalAgent`. This is a
deliberate strategic choice (WS-AUDIT-021, recorded in the file's own comments): the
site's content — regulation explainers, free tools, methodology pages — is exactly the
corpus the owner wants surfaced in AI-search answers, and no proprietary data lives on
`crowagent.ai` (product data lives behind auth on `app.crowagent.ai`). `Sitemap:
https://crowagent.ai/sitemap.xml` is declared at the end of the file.

### The robots guard is expected to fail until a dashboard setting changes

`.github/workflows/robots-guard.yml` runs `scripts/verify-robots.mjs` on every push to
`main`, daily at 06:17 UTC, and on manual dispatch. **Its own header comment states it
is expected to fail** until Cloudflare's "Block AI bots" / managed-robots feature is
disabled in the dashboard — that feature prepends a `Disallow: /` block for AI crawlers
at the edge, overriding the repo's `robots.txt` regardless of what the file says. A red
run on this workflow is not evidence of a code defect; it is the intended visible
reminder that the dashboard setting still needs to be turned off. Once it is off, the
guard goes green and becomes a regression alarm if the feature is ever re-enabled.

## 7. `llms.txt` / `llms-full.txt`

Present at the repository root, outside the scope of `astro/`'s templated pages —
site-wide summaries intended for LLM-based crawlers/agents rather than for
`robots.txt`-style access control. Not independently re-verified for content accuracy
in this pass; flagged here as existing and in scope for a future audit of AI-discovery
surfaces, consistent with the `robots.txt` strategy in §6.

## 8. Content model — collections and template count

Four Astro content collections, defined with Zod schemas in `astro/src/content.config.ts`,
each behind one shared layout:

| Collection | Entries (counted 2026-08-02) | Layout | Schema highlights |
|---|---|---|---|
| `blog` | 8 | `Article.astro` | `faq` field feeds both the visible accordion and `FAQPage`-equivalent data from one source — the comment in `content.config.ts` explicitly notes 5 of 8 legacy posts carried an `FAQPage` block that a parity run found did not survive an earlier port attempt |
| `compare` | 4 | `Compare.astro` | `description`, `ogDescription`, and `articleDescription` are three genuinely distinct hand-written sentences on every legacy page and are kept distinct rather than collapsed |
| `sectors` | 4 | `Sector.astro` | Only the 4 sectors with a real page (construction, education, facilities, highways) are modelled; 5 more cards on the `/sectors` hub link straight to `/crowmark` and stay hand-written, matching the legacy hub |
| `glossary` | 2 | `Glossary.astro` | Only `ppn-002` and `toms-framework` have standalone pages; the other 21 of 23 glossary terms have no page to route to and the index stays a static page |

**18 pages total from 4 templates** (matches `specs/architecture/README.md`'s measured
total). `MODERNISATION-ARCHITECTURE.md` §2's original figure of "27 pages from 5
templates" (including a `legal` collection at 6 pages) is **stale against what is
actually built** — no `legal` content collection exists in `astro/src/content.config.ts`
or `astro/src/content/` as of this pass; legal pages are not yet modelled as a
collection.

## 9. Verification checklist for a new or changed page

1. Does its canonical derive from `path` via `Seo.astro`, or is it hand-written anywhere?
   Hand-writing a canonical is the exact defect §2 exists to prevent.
2. If it belongs to `compare`, `sectors`, or `glossary`: its JSON-LD is currently
   hand-rolled per §4.2, not derived from `schema.ts`. Do not assume parity with the
   blog collection's approach without checking the actual layout file.
3. Is the route already in `sitemap.xml`? If it redirects rather than serving 200,
   it must **not** be (§5).
4. If the route is new (not a port of an existing legacy URL): confirm it does not
   collide with anything the URL-preservation constraint in §1 depends on, and that
   `tests/parity.spec.js` route discovery (which walks `astro/dist` automatically) will
   pick it up without a hand-maintained list.
5. Run `tests/parity.spec.js` against both servers before treating a ported page as
   equivalent to its legacy predecessor — see `TESTING-AND-QUALITY-GATES.md` §7 for the
   current measured state (22/22 routes still failing the hard-failure checks as of this
   pass, largely on the JSON-LD gap in §4.3).
