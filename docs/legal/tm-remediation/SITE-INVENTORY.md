# SITE-INVENTORY

**Gate 0 discovery artefact — crowagent-website. Read only; no site content was changed.**

Date of scan: 2026-07-28
Repository: `crowagent-website` (marketing site, separate from `crowagent-platform`)

---

## 1. How the site is built and routed

- **Static HTML committed to the repository**, deployed to **Cloudflare Pages**. Confirmed: `npm run build`
  in `package.json` is a no-op echo; there is no Next.js, React, or framework router anywhere in the
  shipped tree.
- Routing is entirely declarative: **`_redirects`** (251 lines) and **`_headers`** (13.8 KB) at the
  repository root. Clean URLs are produced by `200` rewrites, e.g.
  `/tools/ppn-002-calculator/methodology → /tools-ppn002-calculator-methodology  200`.
- **63 in-scope `.html` source files** were found (the brief anticipated 64 — see §6).
- **4 additional public routes have no source file of their own**: `/blog/category/ppn-002`,
  `/blog/category/csrd-esg`, `/blog/category/cyber-essentials`, `/blog/category/regulatory-updates`.
  Each is a `200` rewrite to `blog/index.html`, which reads the path and pre-applies a filter
  (`js/blog-filter.js`). They are listed in `sitemap.xml`. Total addressable public routes: **67**.

## 2. How the navigation is constructed — it is injected by JavaScript

**There is no nav markup in any HTML page.** Every page ships an empty placeholder
`<div id="ca-nav">` (and a footer placeholder), and the entire header, mega-menu, mobile menu,
announcement bar, skip link, breadcrumb and footer are written into the DOM at runtime by
**`js/nav-inject.js`** (1,790 lines).

Mechanics that matter for this mandate:

- The nav is built as a JavaScript string array `NAV_HTML` (`js/nav-inject.js` lines 265–423) and the
  footer as `FOOTER_HTML` (lines 431–593). `inject()` replaces the placeholder via `outerHTML`.
- An idempotency guard (`window.__caNavInjectRan`) means the injector runs **once per document**
  regardless of how many times the script tag appears; several pages include it 2–4 times.
- The same file also injects a **sitewide `Organization` + `WebSite` JSON-LD block** at lines
  1362–1396. That description string is therefore present in the structured data of **every page on
  the site** even though it appears nowhere in any HTML file.
- `js/nav-inject.js` is loaded with a cache-busting query string (currently
  `?v=20260726compare`). Any change to this file only reaches visitors if that `?v=` token is bumped
  **in every referencing HTML page**; otherwise the change never lands.

**Consequence for the "In nav?" column below:** the column reflects whether the route appears as a
link in the injected `NAV_HTML` (`yes`), only in the injected `FOOTER_HTML` (`footer`), or in
neither (`no`). It is not derivable from the page's own HTML.

Current injected primary nav: **Products** (mega: CrowMark, CrowCyber, CrowCash, CrowESG, All
products, Pricing, Free tools) · **Free Tools** (mega: 5 tools + hub) · **Pricing** · **Blog** ·
**FAQ** · **About**, plus Sign in / Start free trial. `/sectors/`, `/compare/`, `/integrations`,
`/resources`, `/glossary/`, `/changelog`, `/roadmap`, `/partners`, `/contact`, `/security`,
`/privacy`, `/terms`, `/cookies`, `/cookie-preferences` are footer-only.

## 3. Route inventory

`TIER 1 hits` and `TIER 2 hits` are **post-classification** counts for that page's own source file —
i.e. strings judged genuinely prohibited after TIER 0 carve-outs (system `audit trail`/`audit log`,
`npm audit`, user-sense `accounts`, internal ticket identifiers such as `WS-AUDIT-0xx`, and
qualified procurement-instrument usages) have been removed. Raw grep counts are much higher; see
`LEXICON-INVENTORY.md` §1.

**These counts exclude the injected nav and footer**, which contribute prohibited strings to *all 63
pages* from `js/nav-inject.js`. Those are inventoried separately in §4.

| Route | Source file | Page type | In nav? | In sitemap? | Product/tool it belongs to | TIER 1 hits | TIER 2 hits |
|---|---|---|---|---|---|---|---|
| `/` | `index.html` | home | no (logo only) | yes | platform-wide | 2 | 1 |
| `/404` | `404.html` | error | no | no | platform-wide | 0 | 0 |
| `/about` | `about.html` | company | yes | yes | platform-wide | 3 | 0 |
| `/blog/` | `blog/index.html` | blog index | yes | yes | platform-wide | 0 | 0 |
| `/blog/category/ppn-002` | `blog/index.html` (rewrite) | blog category | no | yes | CrowMark | 0 | 0 |
| `/blog/category/csrd-esg` | `blog/index.html` (rewrite) | blog category | no | yes | CrowESG | 0 | 0 |
| `/blog/category/cyber-essentials` | `blog/index.html` (rewrite) | blog category | no | yes | CrowCyber | 0 | 0 |
| `/blog/category/regulatory-updates` | `blog/index.html` (rewrite) | blog category | no | yes | platform-wide | 0 | 0 |
| `/blog/csrd-omnibus-i-2026` | `blog/csrd-omnibus-i-2026.html` | blog post | no | yes | CrowESG | 4 | 0 |
| `/blog/cyber-essentials-v3-3-danzell-2026` | `blog/cyber-essentials-v3-3-danzell-2026.html` | blog post | no | yes | CrowCyber | 0 | 0 |
| `/blog/find-first-public-sector-contract` | `blog/find-first-public-sector-contract.html` | blog post | no | yes | CrowMark | 0 | 0 |
| `/blog/mfa-mandatory-2026` | `blog/mfa-mandatory-2026.html` | blog post | no | yes | CrowCyber | 0 | 0 |
| `/blog/ppn-002-social-value-guide` | `blog/ppn-002-social-value-guide.html` | blog post | no | yes | CrowMark | 2 | 0 |
| `/blog/ppn-014-cyber-essentials-guide` | `blog/ppn-014-cyber-essentials-guide.html` | blog post | no | yes | CrowCyber | 0 | 0 |
| `/blog/procurement-act-2023-sme-guide` | `blog/procurement-act-2023-sme-guide.html` | blog post | no | yes | CrowMark | 0 | 0 |
| `/blog/regulatory-updates-2026` | `blog/regulatory-updates-2026.html` | blog post | no | yes | CrowESG | 3 | 0 |
| `/blog/social-value-portal-vs-crowmark` | `blog/social-value-portal-vs-crowmark.html` | blog post | no | yes | CrowMark | 0 | 0 |
| `/changelog` | `changelog.html` | company | footer | yes | platform-wide | 0 | 0 |
| `/compare/` | `compare/index.html` | comparison hub | footer | yes | CrowMark | 0 | 0 |
| `/compare/crowmark-vs-autogenai` | `compare/crowmark-vs-autogenai.html` | comparison | no | yes | CrowMark | 0 | 0 |
| `/compare/crowmark-vs-cleantender` | `compare/crowmark-vs-cleantender.html` | comparison | no | yes | CrowMark | 1 | 0 |
| `/compare/crowmark-vs-mytender-io` | `compare/crowmark-vs-mytender-io.html` | comparison | no | yes | CrowMark | 0 | 0 |
| `/compare/crowmark-vs-swiftbid` | `compare/crowmark-vs-swiftbid.html` | comparison | no | yes | CrowMark | 0 | 0 |
| `/contact` | `contact.html` | company | footer | yes | platform-wide | 0 | 0 |
| `/cookie-preferences` | `cookie-preferences.html` | legal | footer | yes | platform-wide | 0 | 0 |
| `/cookies` | `cookies.html` | **legal — report only** | footer | yes | platform-wide | 0 | 0 |
| `/crowcash` | `crowcash.html` | product | yes | yes | CrowCash | 13 | 0 |
| `/crowcyber` | `crowcyber.html` | product | yes | yes | CrowCyber | 5 | 0 |
| `/crowesg` | `crowesg.html` | product | yes | yes | CrowESG | 13 | 0 |
| `/crowmark` | `crowmark.html` | product | yes | yes | CrowMark | 2 | 0 |
| `/csrd` | `csrd.html` | redirect stub (noindex) | no | no | CrowESG | 0 | 0 |
| `/faq` | `faq.html` | faq | yes | yes | platform-wide | 7 | 0 |
| `/glossary/` | `glossary/index.html` | glossary index | footer | yes | platform-wide | 4 | 0 |
| `/glossary/csrd` | `glossary/csrd.html` | glossary term | no | yes | CrowESG | 5 | 0 |
| `/glossary/ppn-002` | `glossary/ppn-002.html` | glossary term | no | yes | CrowMark | 0 | 0 |
| `/glossary/toms-framework` | `glossary/toms-framework.html` | glossary term | no | yes | CrowMark | 1 | 0 |
| `/googlef2adc6102725418d` | `googlef2adc6102725418d.html` | search-console verification stub | no | no | n/a | 0 | 0 |
| `/integrations` | `integrations.html` | company | footer | **no** | platform-wide | 6 | 0 |
| `/intel/cyber-essentials-tracker/` | `intel/cyber-essentials-tracker/index.html` | intel tracker | no | yes | CrowCyber | 0 | 0 |
| `/partners` | `partners.html` | company | footer | yes | platform-wide | 5 | 0 |
| `/pricing` | `pricing.html` | pricing | yes | yes | platform-wide | 11 | 0 |
| `/privacy` | `privacy.html` | **legal — report only** | footer | yes | platform-wide | 2 | 0 |
| `/products/` | `products/index.html` | product hub | yes | yes | platform-wide | 0 | 0 |
| `/products/crowcash/` | `products/crowcash/index.html` | redirect stub (noindex) | no | no | CrowCash | 0 | 0 |
| `/products/crowcyber/` | `products/crowcyber/index.html` | redirect stub (noindex) | no | no | CrowCyber | 0 | 0 |
| `/products/crowesg/` | `products/crowesg/index.html` | redirect stub (noindex) | no | no | CrowESG | 0 | 0 |
| `/products/crowmark/` | `products/crowmark/index.html` | redirect stub (noindex) | no | no | CrowMark | 0 | 0 |
| `/resources` | `resources.html` | resource hub | footer | yes | platform-wide | 1 | 0 |
| `/roadmap` | `roadmap.html` | company | footer | yes | platform-wide | 3 | 0 |
| `/sectors/` | `sectors/index.html` | sector hub | footer | yes | CrowMark | 1 | 0 |
| `/sectors/construction` | `sectors/construction.html` | sector landing | no | yes | CrowMark | 0 | 0 |
| `/sectors/education` | `sectors/education.html` | sector landing | no | yes | CrowMark | 2 | 0 |
| `/sectors/facilities` | `sectors/facilities.html` | sector landing | no | yes | CrowMark | 0 | 0 |
| `/sectors/highways` | `sectors/highways.html` | sector landing | no | yes | CrowMark | 1 | 0 |
| `/security` | `security.html` | **legal/trust — report only** | footer | yes | platform-wide | 2 | 0 |
| `/terms` | `terms.html` | **legal — report only** | footer | yes | platform-wide | 0 | 0 |
| `/tools/` | `tools/index.html` | tool hub | yes | yes | free tools | 1 | 0 |
| `/tools/csrd-applicability-checker/` | `tools/csrd-applicability-checker/index.html` | tool landing | yes | yes | CrowESG (free tool) | 1 | 0 |
| `/tools/cyber-essentials-readiness/` | `tools/cyber-essentials-readiness/index.html` | tool landing | yes | yes | CrowCyber (free tool) | 2 | 0 |
| `/tools/late-payment-calculator/` | `tools/late-payment-calculator/index.html` | tool landing | yes | yes | CrowCash (free tool) | 0 | 0 |
| `/tools/ppn-002-calculator/` | `tools/ppn-002-calculator/index.html` | tool landing | yes | yes | CrowMark (free tool) | 0 | 0 |
| `/tools/vsme-materiality-light/` | `tools/vsme-materiality-light/index.html` | tool landing | yes | yes | CrowESG (free tool) | 3 | 0 |
| `/tools/csrd-applicability-checker/methodology` | `tools-csrd-checker-methodology.html` | tool methodology | no | yes (as `/tools/…/methodology`) | CrowESG | 5 | 0 |
| `/tools/cyber-essentials-readiness/methodology` | `tools-cyber-essentials-readiness-methodology.html` | tool methodology | no | yes | CrowCyber | 0 | 0 |
| `/tools/late-payment-calculator/methodology` | `tools-late-payment-calculator-methodology.html` | tool methodology | no | yes | CrowCash | 0 | 0 |
| `/tools/ppn-002-calculator/methodology` | `tools-ppn002-calculator-methodology.html` | tool methodology | no | yes | CrowMark | 0 | 0 |
| `/tools/vsme-materiality-light/methodology` | `tools-vsme-materiality-light-methodology.html` | tool methodology | no | yes | CrowESG | 0 | 0 |

Note on the five methodology files: their **bare root paths** (`/tools-csrd-checker-methodology`
etc.) are also directly reachable and are *not* in the sitemap; the canonical, sitemapped path is the
`/tools/<slug>/methodology` rewrite.

## 4. Global surfaces that appear on every route

These are not routes, but they render on (or are served alongside) every page. They carry prohibited
vocabulary that the per-page counts above deliberately exclude.

| File | What it controls | Reaches | TIER 1 | TIER 2 |
|---|---|---|---|---|
| `js/nav-inject.js` | injected nav, mega-menu, mobile menu, footer, announcement bar, sitewide `Organization` JSON-LD | all 63 pages | 3 | 0 |
| `index.html` (lines 46–52) | page-level `Organization` JSON-LD | `/` only, but it is the entity anchor for the whole domain | 0 | 1 |
| `llms.txt` | AI-crawler site summary | whole-domain descriptor | 2 | 1 |
| `llms-full.txt` | AI-crawler long-form summary | whole-domain descriptor | 2 | 1 |
| `manifest.json` | PWA install description | injected into every page by `nav-inject.js` | 1 | 0 |
| `changelog.xml` | RSS feed | feed subscribers | 1 | 0 |
| `js/tool-teaser.js` | upsell panel rendered on tool pages | 5 tool landings | 0 | 0 |
| `js/tool-engine-vsme-materiality-light.js` | tool result copy | `/tools/vsme-materiality-light/` | 3 | 0 |
| `js/tool-engine-cyber-essentials-readiness.js` | tool result copy | `/tools/cyber-essentials-readiness/` | 0 | 0 |
| `Assets/og-image.svg` | social-card source art | **orphaned — see §5** | 0 | 2 |
| `Assets/svg-mockups/*.svg` (56 files) | product screenshot mock-ups | **orphaned — see §5** | 24 | 0 |

## 5. Assets that are publicly fetchable but rendered on no page

A reference sweep across every in-scope `.html` and `.js` file found **no page or shipped script
references `Assets/svg-mockups/` at all**. The only references anywhere in the repository are in
`tests/sf46-animation-audit.spec.js` and three files under `.dev-tools/` — all excluded from scope.
The same is true of `Assets/og-image.svg` (pages reference `Assets/og-image.png`) and of the three
files under `Assets/jsonld/`.

These files are still served by Cloudflare Pages at their literal URLs, so their text is publicly
retrievable and crawlable, but they do not appear in any rendered page. This distinction is material
to prioritisation and is carried through into `LEXICON-INVENTORY.md`.

## 6. Scope, exclusions, and things that do not match the brief

**Scanned:** 294 files — `.html`, `.json`, `.txt`, `.xml`, `.svg`, `.css`, `.js` at the site root and
under `blog/`, `compare/`, `glossary/`, `intel/`, `products/`, `sectors/`, `tools/`, `js/`, `lib/`,
`Assets/`.

**Excluded, and confirmed present in the repository:**

| Path | Contents | Why excluded |
|---|---|---|
| `node_modules/` | dependencies | out of scope |
| `coverage/` | 7 generated `.html` coverage reports | build artefact |
| `tests/` | Playwright/Jest specs incl. `sf46-animation-audit.spec.js` | test code |
| `stripe-sample/` | 1 `index.html` sample | vendor sample |
| `.git/` | version control | out of scope |
| `*.test.js` at root | `crowagent.test.js`, `scripts.test.js`, `scripts-sw-register.test.js`, `tool-teaser-parity.test.js` | test code |
| `package-lock.json` | lockfile | build artefact |

**No `_archive/` directory exists** in this repository; there is an `_archive-oneshot` folder under
`scripts/`, which is excluded as tooling.

Additional directories present and excluded as non-public tooling/documentation: `.cache/`,
`.claude/`, `.dev-tools/`, `.github/`, `.husky/`, `.kiro/`, `.wrangler/`, `.well-known/`, `Doc/`,
`cloudflare-workers/`, `scripts/`, `specs/`.

**Discrepancies against the brief's description of the site:**

1. **63 in-scope HTML files, not 64.** Including the two excluded generated/vendor pages
   (`coverage/index.html`, `stripe-sample/index.html`) would over-count. The addressable public
   route total is 67 once the four `/blog/category/*` rewrites are included.
2. **`/integrations` is linked from the footer of every page but is absent from `sitemap.xml`.**
3. **Five methodology pages are addressable at two paths each** — the sitemapped
   `/tools/<slug>/methodology` and an un-sitemapped bare root path.
4. **The nav cannot be read from the HTML.** Any repositioning of navigation, product visibility, or
   the footer descriptor is a change to a single JavaScript file plus a cache-buster bump across all
   referencing pages.
5. **`css`/`js` comment noise dominates raw grep results.** 265 of 685 raw matches are internal
   ticket identifiers (`WS-AUDIT-0xx`, `WEB-AUDIT-1xx`, `CHROME-AUDIT`) or developer commentary in
   `styles.css` (1.2 MB), which is served publicly but renders nothing.
