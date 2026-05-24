# P-7 / ARCH-10 — Per-Archetype CSS Bundling Strategy

Audit date: 2026-05-21. Read-only investigation. No code changed.

## 1. Measured state today

| Asset | Bytes | Note |
|---|---|---|
| `/styles.min.css` | 547,024 | PurgeCSS-deployed (post P-7 first pass) |
| `/crowagent-brand-tokens.css` | 48,609 | Design tokens |
| `Assets/css/*.css` (33 files) | 454,512 total | Range 1.8 KB – 43.9 KB |
| `/print.css` | 3,291 | `media="print"` — out of scope |

Per-page `<link>` count (from `grep rel="stylesheet"` over 75 production HTML pages, excluding `_archive/` + `node_modules/`):

- Heaviest: `security.html` 16 · `contact.html` 15 · `pricing.html` / `cookies.html` / `terms.html` / `about.html` 14 · `blog/index.html` 15
- Median: 12–13 (`blog/*`, `glossary/*`, `tools/*` index, methodology pages)
- Lightest: `index.html` 5 · `crowagent-core.html` / `crowmark.html` / `crowcyber.html` / `crowesg.html` / `crowcash.html` / `csrd.html` 7

The brief says "13–18". Reality is 5–16 with most pages clustering 7–14. The number `816` (`rel="stylesheet"` occurrences) confirms heavy duplication of the same ~6 globals across pages.

## 2. Findings the bundle plan must respect

1. **Three dead `Assets/css/` files** — `hero-split.css` (13 KB), `crowesg-page.css` (5.3 KB), `product-walkthrough-sf21.css` (4.7 KB). Zero `<link>` refs in production HTML. Delete in the bundling PR, do not concat.
2. **Two existing duplicate-load bugs**: nearly every page links `styles.min.css` **twice** (e.g. `about.html` L32 + L36) and `crowagent-brand-tokens.css` twice on blog/intel pages. The bundle migration is the natural place to fix this — it is on the P-7 critical path because the bundler must not re-introduce or preserve the duplication.
3. **Cascade order is real and load-bearing.** Across every audited page the order is:
   1. `fonts-selfhosted.css` (font-face only)
   2. `crowagent-brand-tokens.css` (CSS custom properties)
   3. `styles.min.css` (the global Purged build)
   4. `sovereign-primitives.css` then `sovereign-cmdk.css` (design-system primitives)
   5. `consistency-sf41.css` (a normalisation/override layer)
   6. `page-archetype-unify.css` (when present)
   7. `page-motion-bg.css` / `nav-footer-sf21.css` / `motion-system.css` / `always-playing-sf23.css` (chrome + motion)
   8. `page-styles.css` (legacy catch-all that several pages still rely on)
   9. **Page-specific** sheet (`about-sf18.css`, `pricing-sf16.css`, `blog-article.css`, `tool-page.css` + breadcrumb, etc.)
   10. `print.css` (media="print", keep separate)

   Inverting any of 4↔5↔6↔7↔8 risks specificity regressions on already-shipped SF21–SF41 fixes. Concatenation MUST preserve numeric order.

## 3. Archetype bundles (5 total)

Page-to-archetype assignment is empirical, not guessed:

### A. `bundle-home.css` — only `index.html`
Concat order (in this exact order):
```
Assets/css/sovereign-primitives.css
Assets/css/sovereign-cmdk.css
```
Rationale: homepage already loads only 5 sheets and 3 are global (fonts, tokens, styles.min). Bundle just the 2 sovereign primitives so the homepage gets 1 sheet instead of 2. **Net request delta: -1.** Leave styles.min.css + brand-tokens.css separate (they cache across the entire site).

### B. `bundle-marketing.css` — about / pricing / contact / security / resources / faq / partners / changelog / roadmap / cookies / privacy / terms / 404 / cookie-preferences / glossary/* / products/index / blog/index / methodology pages
Concat order:
```
Assets/css/sovereign-primitives.css
Assets/css/sovereign-cmdk.css
Assets/css/consistency-sf41.css
Assets/css/page-archetype-unify.css
Assets/css/page-motion-bg.css
Assets/css/nav-footer-sf21.css
Assets/css/motion-system.css
Assets/css/page-styles.css
```
Page-specific sheet (`about-sf18.css`, `pricing-sf16.css`, `pricing-extras.css`, `contact-page.css`+`contact-sf20.css`, `security-page.css`+`security-sf19.css`, `faq-page.css`, `resources-sf21.css`, `cookies-page.css`, `privacy-page.css`, `terms-page.css`, `blog-list-sf-enh13.css`) stays a **separate** second link — these only apply to one route each, so bundling them in would balloon every page by 20-40 KB for no reuse benefit.

Net request delta on `pricing.html`: 14 → **4** (`fonts`, `brand-tokens`, `styles.min`, `bundle-marketing`, `pricing-sf16+extras concatenated as one page-specific link`, `print`).

### C. `bundle-product.css` — `crowagent-core.html` / `crowmark.html` / `crowcyber.html` / `crowesg.html` / `crowcash.html` / `csrd.html`
Concat order:
```
Assets/css/sovereign-primitives.css
Assets/css/sovereign-cmdk.css
Assets/css/page-styles.css
Assets/css/product-hero-sf18.css
```
These 6 pages each load identical 7 sheets today. **Net delta: 7 → 4.**

### D. `bundle-blog.css` — `blog/*.html` (post pages, NOT `blog/index.html` which is archetype B)
Concat order:
```
Assets/css/sovereign-primitives.css
Assets/css/sovereign-cmdk.css
Assets/css/consistency-sf41.css
Assets/css/nav-footer-sf21.css
Assets/css/motion-system.css
Assets/css/blog-article.css
Assets/css/blog-post-sf-enh6.css
```
**Net delta on a blog post: 12-13 → 4.**

### E. `bundle-tool.css` — `tools/*/index.html` + `intel/*/index.html`
Concat order:
```
Assets/css/sovereign-primitives.css
Assets/css/sovereign-cmdk.css
Assets/css/consistency-sf41.css
Assets/css/page-motion-bg.css
Assets/css/nav-footer-sf21.css
Assets/css/motion-system.css
Assets/css/always-playing-sf23.css
Assets/css/tool-page.css
Assets/css/tools-breadcrumb-sf21.css
```
`intel-tracker.css` goes into a separate intel-only link OR a sub-bundle `bundle-intel.css` (only 2 pages, 9.8 KB — keep separate, no point bundling). **Net delta on a tool page: 13 → 4.**

## 4. Final per-page link sequence (template)

```html
<link rel="stylesheet" href="/Assets/css/fonts-selfhosted.css?v=BUILD">
<link rel="stylesheet" href="/crowagent-brand-tokens.css?v=BUILD">
<link rel="stylesheet" href="/styles.min.css?v=BUILD">
<link rel="stylesheet" href="/bundles/bundle-<archetype>.css?v=BUILD">
<!-- optional, route-unique only: -->
<link rel="stylesheet" href="/Assets/css/<page-specific>.css?v=BUILD">
<link rel="stylesheet" href="/print.css?v=BUILD" media="print">
```
Five or six `<link>` tags everywhere. No duplicates.

## 5. Build pipeline — `tools/build-archetype-bundles.mjs`

Reference skeleton (do not commit until P-7 implementation PR):

```js
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';
import csso from 'csso';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OUT  = path.join(ROOT, 'bundles');

const BUNDLES = {
  home:      ['sovereign-primitives','sovereign-cmdk'],
  marketing: ['sovereign-primitives','sovereign-cmdk','consistency-sf41','page-archetype-unify','page-motion-bg','nav-footer-sf21','motion-system','page-styles'],
  product:   ['sovereign-primitives','sovereign-cmdk','page-styles','product-hero-sf18'],
  blog:      ['sovereign-primitives','sovereign-cmdk','consistency-sf41','nav-footer-sf21','motion-system','blog-article','blog-post-sf-enh6'],
  tool:      ['sovereign-primitives','sovereign-cmdk','consistency-sf41','page-motion-bg','nav-footer-sf21','motion-system','always-playing-sf23','tool-page','tools-breadcrumb-sf21'],
};

// Pages-per-archetype glob list lives in BUNDLES_PAGES (mirrors §3 above).
// Used both for purgecss content[] AND for the html-rewrite step.

await mkdir(OUT, { recursive: true });
for (const [name, files] of Object.entries(BUNDLES)) {
  const concat = (await Promise.all(
    files.map(f => readFile(path.join(ROOT, 'Assets/css', `${f}.css`), 'utf8'))
  )).map((c, i) => `/* === ${files[i]}.css === */\n${c}`).join('\n');

  const purged = await new PurgeCSS().purge({
    content: BUNDLES_PAGES[name],          // archetype-scoped HTML
    css: [{ raw: concat }],
    safelist: { deep: [/^js-/, /^sf-/, /^data-/, /^aria-/], greedy: [/^is-/, /^has-/] },
  });
  const min = csso.minify(purged[0].css, { restructure: false }).css;
  const hash = crypto.createHash('sha256').update(min).digest('hex').slice(0, 8);
  await writeFile(path.join(OUT, `bundle-${name}.${hash}.css`), min);
  console.log(`bundle-${name} → ${(min.length/1024).toFixed(1)} KB (${hash})`);
}
```

Two follow-on steps the script must produce (or a sibling `tools/rewrite-html-bundles.mjs`):
1. Emit `bundles/manifest.json` mapping archetype → hashed filename.
2. Rewrite each HTML file: delete the N individual `<link>` tags, insert exactly one `bundle-<archetype>.<hash>.css` link in the correct cascade position. The page-archetype assignment table lives in the script (a single Map), not duplicated across HTML files.

`restructure: false` in csso is deliberate — restructure can re-order selectors and break specificity ties (a regression risk that nullifies the safety of preserving concat order).

## 6. Cascade verification (mandatory per archetype)

For each of the 5 archetypes, pick **one representative page** (`index.html`, `pricing.html`, `crowagent-core.html`, `blog/csrd-omnibus-i-2026.html`, `tools/late-payment-calculator/index.html`). For each representative:

1. Render the page once before bundling, once after, with identical content and viewport (1440/768/390 per the website-transform charter).
2. Diff `getComputedStyle()` for ~30 anchor selectors (`body`, `.nav`, `.hero h1`, `.cta-primary`, `.footer`, plus 5 archetype-specific selectors).
3. Diff the visual screenshot via Percy or local pixel-diff with tolerance 0. Any non-zero delta = bundle order wrong, revert.
4. Run the existing Playwright `a11y/routes.ts` suite — colour-contrast regressions surface there.

This is the only way to catch a specificity flip that no static lint would notice.

## 7. Trade-off analysis

| Dimension | Status quo (N separate `<link>`) | Single mega-bundle | Per-archetype (recommended) |
|---|---|---|---|
| HTTP/2 multiplexing cost | Low — Vercel serves HTTP/2 | Lowest | Low |
| First-page-load bytes | High (worst pages download 13+ files of headers + body) | Lowest single file | ~30-40 KB per page; styles.min stays cached |
| Cross-page cache reuse | Best (every shared file already cached) | Worst (each page wants the whole bundle re-downloaded if it changes) | Best within an archetype, fine across |
| Cache-bust blast radius when one shared file changes | Tiny | Whole site | One archetype |
| Risk of cascade regression | Zero | Medium | Low (preserved per archetype) |
| Build pipeline complexity | None | Low | Medium |

Per-archetype is the explicit compromise. The brief is right. Bundling the homepage further saves nothing because `styles.min.css` already dominates payload; bundling the marketing pages buys -10 requests per page; bundling blog/tool buys -8.

## 8. Recommended sequencing (not part of this audit, but next-step guidance)

1. PR A — remove the three dead Assets/css files + fix the duplicate `styles.min.css` / `crowagent-brand-tokens.css` links across all HTML. Trivial, no bundling logic yet. Validates the HTML-rewrite tooling.
2. PR B — land `tools/build-archetype-bundles.mjs` + `bundle-product.css` + `bundle-home.css` only (smallest archetypes, 7 pages touched). Run §6 verification on `crowagent-core.html`.
3. PR C — ship `bundle-marketing.css` + `bundle-tool.css` + `bundle-blog.css`. Run §6 verification on the 4 remaining representatives + the full Playwright a11y suite.

After PR C, expected `<link>` count median per page: **4–5**, down from 12–13. Critical-path CSS request count for first paint: **4** (`fonts`, `brand-tokens`, `styles.min`, `bundle-*`).
