# CONTENT-MODEL.md — Single-source-of-truth extraction report

Scope: 42 in-scope pages (root `*.html` excluding `homepage-claude-v1.html`,
`googlef2adc6102725418d.html`, `404.html`; `blog/*.html` × 9; `compare/*.html`
× 5; `sectors/*.html` × 5; `glossary/*.html` × 3; `tools/index.html`,
`tools/ppn-002-calculator/index.html`,
`tools/ppn-002-calculator/methodology/index.html`), plus `js/nav-inject.js`
(the sitewide nav/footer injector) and `js/tool-teaser.js` (the PPN 002
calculator's upgrade-prompt injector) as required to read the injected
nav/footer/Organization content those two scripts own.

No existing site file was modified. All output lives under `migration/`:
`migration/data/site.ts`, `products.ts`, `pricing.ts`, `nav.ts`, `footer.ts`,
`faq.ts`, `seo.ts`, `structured-data.ts`, plus this report.

A sibling `migration/CSS-AUDIT.md` already existed from earlier groundwork
(a stylesheet-load audit); it was read for scope corroboration only, not
modified or duplicated here.

---

## 1. What was extracted

| File | Content | Method |
|---|---|---|
| `site.ts` | Legal entity, company number, registered office, contact emails, social links, app URLs, request-access URL, default OG image/handle | Manual read + targeted grep across all 42 pages + `js/nav-inject.js` |
| `products.ts` | CrowMark for Suppliers + CrowMark for Buyers: taglines, descriptions, key facts, features, CTAs | Manual read of `crowmark.html` / `crowmark-buyers.html` |
| `pricing.ts` | All 3 plans (Starter/Pro/Portfolio), the hidden Portfolio list price, annual discount, AI-credit metering, competitor prices, liability cap | Exhaustive `£`/`&pound;` grep across all 42 files, every hit read in context |
| `nav.ts` / `footer.ts` | Full nav tree and footer column tree | Read directly from `js/nav-inject.js` (the actual single source of truth — the HTML pages only hold empty placeholders) |
| `faq.ts` | 14 Q&A from `faq.html` + 32 Q&A (8 × 4) from `compare/*.html` | Generated programmatically from each page's FAQPage JSON-LD via a Python script, to avoid transcription error on ~40 long-form answers |
| `seo.ts` | title/description/canonical/OG/Twitter for all 42 routes | Generated programmatically via a regex-based `<head>` parser (see the bugs found, §3 below) |
| `structured-data.ts` | The Organization/WebSite graph + per-route additional schema types | Read directly from each page's JSON-LD `<script>` blocks, cross-referenced against the injected fallback in `js/nav-inject.js` |

---

## 2. Inconsistencies found (the valuable part)

### 2.1 🚨 Homepage JSON-LD contact identity does not belong to this project

`index.html`'s own static Organization JSON-LD block declares:

```json
"contactPoint": {"@type":"ContactPoint","contactType":"customer support","email":"crowagent.platform@gmail.com","name":"Crow Agent"}
```

Every other contact surface on the entire site — the footer (injected on
all 42 pages), `contact.html`, `security.html`, `terms.html`, `privacy.html`,
and even the OTHER two static Organization blocks (`resources.html`'s and
the runtime fallback in `js/nav-inject.js`) — uses `hello@crowagent.ai` and
never mentions a "Crow Agent" person. `crowagent.platform@gmail.com` /
"Crow Agent" are the identity strings mandated by a *different* repository's
CLAUDE.md (`crowagent-platform`), not this website's. This reads as a
cross-project copy/paste defect that has gone unnoticed because it sits
inside machine-only JSON-LD on the site's single highest-traffic page, not
in visible copy. It is live in production today. Recorded in `site.ts` as
`HOMEPAGE_JSONLD_CONTACT_ANOMALY` and in `structured-data.ts`'s
`ORGANIZATION_INDEX_HTML`, deliberately NOT merged into the canonical email
list — flagged for the owner rather than silently "fixed" or silently
carried forward as if it were correct.

### 2.2 Three competing Organization JSON-LD shapes

Three different, disagreeing versions of the Organization block exist:

1. **`js/nav-inject.js`'s injected fallback** (runs on the 23 pages with no
   static block of their own): name "CrowAgent Ltd", logo
   `Assets/og-image.png`, `sameAs` = LinkedIn/X/YouTube (3 links).
2. **`index.html`'s own static block**: name "CrowAgent" + `legalName`
   "CrowAgent Ltd", logo = the wordmark PNG (a *different file* to #1),
   richer (`foundingDate`, `knowsAbout`, `areaServed`), `sameAs` order
   reversed (X before LinkedIn), and carries the contact anomaly in §2.1.
3. **`resources.html`'s own static block**: name "CrowAgent" + legalName
   "CrowAgent Ltd" (matches #2's naming, not #1's), but `sameAs` has only
   **2** links and the LinkedIn URL reads
   `https://www.linkedin.com/company/crowagent` — missing `-ltd/` — while
   #1, #2 and the live footer link (`js/nav-inject.js:218`) all agree on
   `https://www.linkedin.com/company/crowagent-ltd/`. This looks like an
   uncaught typo, invisible because it's inside JSON-LD rather than
   rendered text.

All three are captured verbatim in `structured-data.ts` (not merged) so the
Astro migration can make a deliberate choice about which is canonical
rather than inheriting whichever one happened to load last.

### 2.3 `tools/index.html` has zero JSON-LD

Every other non-homepage page in scope carries at least a `BreadcrumbList`.
`tools/index.html` — the free-tools hub, and a page that reasonably could
carry rich-result markup for the calculator it links to — has none at all.
See `structured-data.ts`'s `TOOLS_INDEX_HAS_NO_JSONLD`.

### 2.4 `faq.html`'s FAQPage schema is missing 5 of its 14 visible questions

`faq.html` renders 14 `<details>/<summary>` question blocks, but its
FAQPage JSON-LD in `<head>` lists only 9. The 5 omitted from structured
data — "What plans are available?", "Can I cancel anytime?", "How do
billing periods work?", "What data do you use?", "Is my data secure?" — are
real, answered, visible questions that are simply invisible to a search
engine's rich-result parser. Captured in `faq.ts` with an `inJsonLd` flag
per item so this doesn't get silently lost in the rebuild.

### 2.5 Blog vs. compare-page author/publisher naming disagrees

The 7 standard blog posts' JSON-LD (`BlogPosting`) use `author.name` /
`publisher.name` = **"CrowAgent"** (no "Ltd"). The 4 `compare/*.html`
detail pages' JSON-LD (`Article`, not `BlogPosting` — a second, separate
naming inconsistency) use **"CrowAgent Ltd"**. Each template is internally
consistent but the two templates disagree with each other. See
`structured-data.ts` `BLOG_POSTING_EXAMPLE` vs. `COMPARE_ARTICLE_EXAMPLE`.

### 2.6 SEO metadata gaps (not duplicates — see §2.7)

- `og:type` is missing on `integrations.html` and `resources.html` (every
  other page sets it).
- `twitter:title` / `twitter:description` are missing on `faq.html`,
  `index.html` and `partners.html` (rely on OG fallback; the other 39 pages
  set both explicitly).
- `twitter:site` is missing only on `faq.html`.
- `robots` meta is present on only 22 of 42 pages; the other 20 have none
  at all (defaults to indexable, but inconsistent authoring practice).

### 2.7 No duplicate titles or meta descriptions were found

The task brief flagged "a meta description duplicated across routes" as a
likely finding. It was checked exhaustively (every one of the 42 pages'
`<title>` and meta description compared pairwise) and **no duplicate was
found anywhere** — every page has a distinct, hand-written title and
description. Recorded as a negative result rather than omitted, per the
instruction to report what was actually found rather than what was
expected.

### 2.8 CrowMark's own pricing is, notably, perfectly consistent

The task brief expected pricing drift ("13 files hardcode a price...flag
any inconsistency"). The actual result: **every one of the 9 HTML files
plus `js/nav-inject.js` that hardcode a CrowMark plan price agree exactly**
— Starter £49/mo (£529/yr), Pro £149/mo (£1,609/yr), Portfolio = contact
sales, 10% annual discount, 14-day trial. This includes cross-checking the
prose copy against the JSON-LD `Offer` prices independently declared on
`crowmark.html` and `pricing.html`, which also match. See the full
file:line citation block at the top of `pricing.ts`.

The one caveat: `pricing.html:541-544` contains an HTML comment recording
that Portfolio's real list price is **£549/mo**, deliberately kept off the
public card per an explicit 2026-07-19 owner decision
(R241-PRICING-STRATEGY) because that tier is sold as "Contact sales" only.
This is a real number, read directly from the source (not invented), but
it is intentionally unpublished — captured in `pricing.ts` as
`PORTFOLIO_HIDDEN_LIST_PRICE` with `public: false`, not surfaced as if it
were a displayed price.

### 2.9 PPN 002 apprenticeship proxy value disagrees between two pages

Outside the pricing/SEO/structured-data scope but too concrete to omit:
`blog/ppn-002-social-value-guide.html:246` states the Oxford Social Value
Bank proxy value for "each apprenticeship created" as **£56,029**.
`tools/ppn-002-calculator/methodology/index.html:188` states the same kind
of figure as **£8,460 per Level 3 apprenticeship** (also cites £27,000 per
sustained job). These are not obviously the same measure (the blog figure
may be a different Oxford SVB line item than "Level 3 apprenticeship"
specifically), but as written, a reader comparing the two pages sees two
very different numbers both described as "the apprenticeship proxy value."
Not resolved here — flagged for whoever owns the PPN 002 calculator's
constants to reconcile, since the methodology page is the one that should
be authoritative and the blog post may simply be citing an outdated or
different SVB edition.

### 2.10 The "8 pages hardcode app.crowagent.ai" / "13 files hardcode a price" brief counts don't match what's on disk

Both counts in the task brief were treated as leads to verify, not facts to
match. Actual counts:

- **`app.crowagent.ai`**: 6 in-scope HTML files have a real (non-decorative)
  occurrence — `about.html`, `contact.html`, `security.html`, plus
  decorative-only mockup text in `crowmark.html`/`index.html` that doesn't
  count as "hardcoding a URL". Two shared JS files (`nav-inject.js`,
  `tool-teaser.js`) also hardcode it and run on every/some pages. Full
  citation list in `site.ts`'s `APP_URLS` comment block. If the brief's "8"
  counted the JS files or the decorative mockup text differently, that
  would close the gap — recorded rather than silently forced to match.
- **Pricing**: 9 HTML files + `js/nav-inject.js` hardcode a genuine CrowMark
  plan price (see §2.8). 17 files in total contain a `£` amount, but 8 of
  those are unrelated figures (Procurement Act contract-value thresholds,
  Find a Tender/Contracts Finder publication thresholds, PPN 002 proxy
  values, the £1,000 liability cap) — see the "EXCLUDED £ FIGURES" block at
  the top of `pricing.ts` for the full breakdown of what was deliberately
  left out and why.

---

## 3. Two extraction-tooling bugs caught during this task (methodology note)

Not content bugs — bugs in the extraction scripts themselves, caught by
sanity-checking output rather than trusting the first pass. Recorded
because they would silently corrupt data in any future automated scrape of
this codebase:

1. **Canonical link attribute order**: every `blog/*.html` and
   `compare/*.html` page writes `<link href="..." rel="canonical"/>` (href
   before rel), opposite of the root-level pages'
   `<link rel="canonical" href="..."/>`. A canonical-only regex expecting
   one attribute order silently returned `null` for 13 pages until this was
   caught by an explicit "which pages have no canonical?" sanity check.
2. **Catastrophic backtracking on reversed meta-tag attributes**: several
   pages write `<meta content="..." property="og:image"/>` (content before
   property). A regex using a bare `(.*?)` capture group for the content
   value, combined with Python's `re.DOTALL`, matched from an unrelated
   EARLIER `<meta content="width=device-width..." name="viewport"/>` tag
   all the way across several intervening `<link>` tags to a much later
   `property="og:image"` attribute — because `re.search` returns the
   leftmost successful match, and the lazy `.*?` was free to swallow `>`
   characters (only the surrounding `[^>]*` segments were restricted, not
   the capture group). This returned syntactically plausible but wrong OG
   image URLs for every affected page until caught by checking output
   length (`> 250 chars` was an instant tell) and fixed by restricting the
   capture group to `[^<>]*` so it can never bridge a tag boundary.

---

## 4. What could not be resolved, and why

- **§2.2 (three Organization blocks) and §2.5 (blog vs. compare author
  naming)**: not resolved to a single canonical value, on purpose. Picking
  one silently would be inventing a preference the codebase itself hasn't
  settled; both/all variants are captured verbatim so the decision is made
  deliberately during the Astro rebuild, not accidentally by whichever file
  this extraction happened to read last.
- **§2.9 (apprenticeship proxy value)**: not resolved because it requires
  domain knowledge of which Oxford SVB edition/line-item each page intends,
  which is outside what static text extraction can determine.
- **§2.10 (brief counts vs. actual counts)**: not forced to match. Every
  citation needed to verify the actual counts is included in `site.ts` and
  `pricing.ts` so a reviewer can re-derive either number.
- **CrowMark's product `applicationCategory`/keyword taxonomy** (e.g. exact
  wording differences between `knowsAbout` on the homepage vs. feature
  names on `crowmark.html`) was not exhaustively diffed word-for-word
  beyond what's captured in `structured-data.ts` and `products.ts` — the
  two are drawn from the same underlying facts and no contradiction was
  found, but a full semantic diff of every adjective was out of scope for
  the time available.
