# Information architecture: crowagent.ai

Required by `specs/PLATFORM-CHARTER.md`, which lists it as **MISSING**.

Measured from `astro/dist` on 2026-08-03: **41 built routes**, **40 in the sitemap** (`/404` is
correctly excluded), **3 routes linked from every page that do not ship yet**.

> `specs/architecture/README.md` has linked an `INFORMATION-ARCHITECTURE.md` since it was written.
> This is that document.

---

## 1. The eight groups

### 1.1 Home: 1

| Route | Built from |
|---|---|
| `/` | `pages/index.astro` + 7 section components |

The only route assembled from `components/sections/**`. Each section is single-use and holds one
owner-approved Figma frame. See `COMPONENT-LIBRARY.md` §5.

### 1.2 Product: 3

| Route | Built from |
|---|---|
| `/crowmark` | `pages/crowmark.astro` + `data/crowmark.ts` |
| `/crowmark-buyers` | `pages/crowmark-buyers.astro` |
| `/pricing` | `pages/pricing.astro` + `data/pricing.ts` |

**CrowMark is the only product.** Discontinued products never appear anywhere on the site. The two
CrowMark pages are two audiences of one product, not two products: suppliers answer tenders, buyers
read the responses they receive against the requirements they published. **Buyers never score**,
the evaluation panel scores: and that sentence is positioning, not hedging.

`/pricing` shipped on 2026-08-02 and was the fourth previously-unported route. OA-05 asked whether
*"Active bids: Unlimited"* contradicted enforced caps of 5 and 25 a month. **It did not, and neither
number was real**: the guard holding them ran against a table that does not exist in production and
has since been deleted, and the surviving 5/25 pair belongs to CrowAgent Core's *property* limit. The
axis CrowMark is actually metered on is AI credits, 200 / 750 / 3,000 a month, which the legacy
page never published at all.

### 1.3 Comparison: 5

| Route | Built from |
|---|---|
| `/compare` | `pages/compare/index.astro` |
| `/compare/crowmark-vs-autogenai` | `content/compare/` → `layouts/Compare.astro` |
| `/compare/crowmark-vs-cleantender` | " |
| `/compare/crowmark-vs-mytender-io` | " |
| `/compare/crowmark-vs-swiftbid` | " |

Four competitors, each a collection entry. The hub is a hand-written page.

**`/compare/crowmark-vs-autogenai` is the positioning page.** AutogenAI advertise *"241% increase in
success rates"*; refusing that claim is what this product is defined against, and it is why
`ReasoningTrace` on the homepage exists. See `specs/project_positioning_*` and
`CONTENT-ARCHITECTURE.md` §6.5.

### 1.4 Sectors: 5

| Route | Built from |
|---|---|
| `/sectors` | `pages/sectors/index.astro` |
| `/sectors/construction` | `content/sectors/` → `layouts/Sector.astro` |
| `/sectors/education` | " |
| `/sectors/facilities` | " |
| `/sectors/highways` | " |

**The hub shows nine sector cards; four have a page.** The other five link straight to `/crowmark`
and stay hand-written on the hub, exactly as on the legacy site. There is no recorded threshold at
which a sector earns a page. Recorded as open.

**`/sectors` is deliberately not a top-nav link** (footer only). Inherited from `nav-inject.js`.

### 1.5 Free tools: 3

| Route | Built from |
|---|---|
| `/tools` | `pages/tools/index.astro` |
| `/tools/ppn-002-calculator` | `pages/tools/ppn-002-calculator/index.astro` + `lib/ppn002.ts` |
| `/tools/ppn-002-calculator/methodology` | `pages/tools/ppn-002-calculator/methodology.astro` |

**The only no-account route off the funnel, and it stays that way.** `FinalCta` links both the
calculator and its methodology *"even though it sends people out of the funnel, because a reader with
no next step does not convert later, they leave."*

The calculator is the one page on the site that produces a **number a user will quote to a buyer**,
which is why its arithmetic is a pure function in `lib/ppn002.ts` gated by a test that drives the
legacy page and this one with identical inputs. It reports whether a number clears the 10% floor and
**never asserts compliance**.

`/methodology` exists because publishing the working is the argument. It is the page the homepage's
old *"The scoring model, in the open"* heading pointed at.

### 1.6 Editorial: 13

| Route | Built from |
|---|---|
| `/blog` | `pages/blog/index.astro` |
| `/blog/<slug>` ×8 | `content/blog/` → `layouts/Article.astro` |
| `/glossary` | `pages/glossary/index.astro`24 terms |
| `/glossary/ppn-002` | `content/glossary/` → `layouts/Glossary.astro` |
| `/glossary/toms-framework` | " |
| `/resources` | `pages/resources.astro` |

**The blog's internal link graph is load-bearing.** All 8 posts close with a related-articles rail;
the port dropped every one, and with them six of the eight posts were reachable only from `/blog`.
That is an SEO regression, not a styling one (OA-28). Restored in `RelatedPosts.astro`, driven by
`data/blog-related.ts`, and rendered by the layout so a ninth post cannot ship without it.

**The glossary index lists 24 terms and only 2 have a page.** The other 22 are definitions in place.
The index and the collection have no build-time relationship. Recorded as open in
`CONTENT-ARCHITECTURE.md` §8.2.

### 1.7 Company and conversion: 5

| Route | Built from |
|---|---|
| `/about` | `pages/about.astro` + `NewsletterForm` |
| `/contact` | `pages/contact.astro` + `ContactForm` + `NewsletterForm` |
| `/partners` | `pages/partners.astro` + `PartnerForm` |
| `/sources` | `pages/sources.astro` |
| `/changelog` | `pages/changelog.astro` |

**`/contact` is where the site converts.** Every sitewide "Request access" CTA points at
`/contact?enquiry=limited-access#contact-form`. The query string is a **wire value** read by the page
to preselect the subject, and the fragment lands on the form rather than the top of the page. Neither
is copy.

**`/sources` is new and it is structural, not editorial.** It did not exist on the legacy site. It
was created on 2026-08-02 when the owner's verdict on the homepage was that it *"reads as a research
site rather than a product site"*, and four blocks moved there whole. Every figure now has a table
row with its dates, its threshold and a link to `legislation.gov.uk` or `gov.uk`.

**The standing rule is one link, once.** The homepage links `/sources` from `MarketShape` and from
`ReasoningTrace`, and from nowhere else.

**`/partners` has a live blocker.** Its form POSTs to `formspree.io`, which the shipped CSP's
`connect-src` and `form-action` do not permit, so the submission is blocked in production. See
`COMPONENT-LIBRARY.md` §6.

### 1.8 Legal and utility: 6

| Route | Built from |
|---|---|
| `/privacy` `/terms` `/cookies` `/security` | `content/legal/` → `layouts/Legal.astro` |
| `/404` | `pages/404.astro`**not in the sitemap**, correctly |
| *(the fifth legal slot is open)* | any Markdown file added to `content/legal/` inherits the contents rail and the breadcrumb |

The four legal documents were **converted, not retyped**. `scripts/convert-legal.js` refuses to emit
a file whose visible text is not token-identical to the legacy source, because a model quietly
rewording a retention period or a liability cap would look entirely normal in review.

---

## 2. The three routes that do not ship

`check-links.js` reports them on every build, each linked from **41 of 41 pages** because both are in
the global nav or footer:

| Route | Blocked on | Linked from |
|---|---|---|
| `/integrations` | **OA-10**: the page claims *"Read-only throughout"* while describing its own alerts and SMS | Footer, Product column |
| `/roadmap` | **OA-13**: a "Q4 2026" date above uncommitted engineering | Footer, Company column |
| `/cookie-preferences` | Needs a consent system **the Astro site does not require**, because it sets no cookies | Footer, Legal column, and the bottom bar |

**These are not oversights.** Each is blocked on a content-accuracy decision recorded in
`OWNER-ACTIONS.md`, and *"inventing a page to satisfy a link checker would be the worse failure."*
The gate lists them rather than ignoring them, anything not on the list fails the build, and the set
can only shrink.

`/pricing` was the fourth and shipped on 2026-08-02. Its entry was **deleted rather than reworded**,
which is the contract: the list is only honest if it shrinks the moment a route lands.

**At cutover these become live 404s** unless a `_redirects` rule covers them. `check-links.js` counts
a redirect as resolving, because *"a redirect is a deliberate decision that a URL should keep working
without a page behind it"*, and 82 such rules exist.

---

## 3. Navigation

### 3.1 Primary nav,`data/nav.ts`

```
[logo]  Products ▾   Pricing   Blog   FAQ   About        Sign in   Request access
```

The **Products** dropdown is one merged mega-menu in two columns:

| *Bid and tender software* | *Try it free* |
|---|---|
| CrowMark for Suppliers → `/crowmark` | PPN 002 Social Value Calculator → `/tools/ppn-002-calculator` |
| CrowMark for Buyers → `/crowmark-buyers` | How the score is calculated → `/tools/ppn-002-calculator/methodology` |
| Compare CrowMark → `/compare` | Free tools hub → `/tools/` |
| Pricing → `/pricing` | |

The two-menu "Products" + "Free Tools" nav was merged into this on 2026-07-28 (TM-REMEDIATION-001).

**Three structural decisions carried forward from the legacy injector, all deliberate:**

- **"How it works" is intentionally not a nav link** (founder directive).
- **"Sectors" is deliberately not a top-nav link** (footer only).
- **Nav order is fixed:** Products / Pricing / Blog / FAQ / About.

**The Products trigger is a single `<button>`, and that is a change from legacy.** There it was an
`<a href="/crowmark">` that *also* toggled the dropdown via a separate chevron, reconciled at runtime
by ~150 lines of capture-phase interception because it fought a second handler in `scripts.min.js`.
That handler does not exist in the rebuild, so neither does the workaround. The first item in the
panel covers the destination the old trigger pointed at, so no route becomes unreachable.

**One preserved inconsistency:** the mobile Products accordion uses different labels and hrefs for two
free-tools rows than the desktop menu (*"Free PPN 002 calculator"* / `/tools` against *"PPN 002 Social
Value Calculator"* / `/tools/`). That mismatch is in `nav-inject.js` itself and is preserved verbatim
under the hrefs-must-be-preserved-exactly rule.

`aria-current` is driven by a route-prefix match, so `/crowmark*` and `/tools*` keep the Products
trigger active.

### 3.2 Command palette: Cmd/Ctrl + K

The search affordance in the nav is real. Its index is built at build time from the actual routes
(`lib/search-index.ts`) and ships as a JSON block on every route.

It exists because `[data-cmdk-open]` shipped in `Nav.astro` **with no handler anywhere**: the button
was dead. *"The choice was to remove the button or honour it, and on a site with 40-odd routes a
palette is the single highest-leverage navigation affordance there is."*

### 3.3 Footer,`data/footer.ts`

Four link columns plus a legal column, a six-badge trust row, five social links, and a bottom bar.

| Product | Resources | Company | Legal |
|---|---|---|---|
| CrowMark for Suppliers | Resources hub | About | Security |
| CrowMark for Buyers | Blog | **Roadmap** ⚠ | Privacy |
| Pricing | Compare CrowMark | Contact | Terms |
| **Integrations** ⚠ | FAQ | Partners | Cookies |
| Sectors | Procurement Glossary | | **Cookie preferences** ⚠ |
| PPN 002 Calculator `Free` | Sources | | |
| | Changelog | | |

⚠ = does not ship yet. See §2.

**Legal is its own column, not absorbed into Company.** That reverses an older "exactly four columns"
acceptance criterion once it produced a 12-item Company column (2026-07-30). The Product column
mirrors the desktop Products menu in the same order (2026-07-29 nav/footer alignment fix).

The copyright and legal-entity line is a required Companies Act 2006 §82 / ICO disclosure, not
decoration.

**The mobile column accordion is deliberately not reproduced.** Every link is present and reachable,
just always expanded. Reproducing it would duplicate a second stateful disclosure implementation next
to the one in `Nav`. Left out on the record rather than dropped silently.

---

## 4. URL rules

1. **Hrefs are preserved exactly.** They are live, indexed URLs. Never "corrected" or normalised in
   `nav.ts` or `footer.ts`. `ADR/0005-url-preservation-is-binding.md`.
2. **The build emits directory URLs** (`/faq/index.html` → `/faq/`). `check-links.js` treats `/faq`,
   `/faq/` and `/faq/index.html` as the same served resource.
3. **Canonicals are derived from the route**, never hand-written. `Seo.astro` strips the trailing
   slash everywhere **except `/`**, which canonicalises to `https://crowagent.ai/`, matching the live
   page and the legacy sitemap. *"Changing a homepage's declared canonical is not something that
   should ride along inside a redesign."*
4. **A slug is the route segment.** A Markdown filename in `content/blog/` is the URL.
5. **`_redirects` is the compatibility surface.** 82 rules. **Cloudflare Pages honours only about the
   first 109 rules and static files beat `_redirects`**, so sitemapped URLs go at the top and every
   rule is verified live. A `301!` rule ships **dead** on CF Pages: `!` is Netlify syntax.
6. **`/404` is built and excluded from the sitemap.** 41 routes, 40 sitemap entries.

---

## 5. Cross-links that are structural, not editorial

| From | To | Why it must stay |
|---|---|---|
| `MarketShape`, `ReasoningTrace` | `/sources` | The only citation route. **Once each, and from nowhere else** |
| `FinalCta` | `/tools/ppn-002-calculator` + `/methodology` | The only zero-commitment door on the homepage |
| `BothSides` | `/crowmark-buyers` | The buyer proposition no longer has a homepage heading; this link is how it is reached |
| Every blog post | 3–4 sibling posts | The internal link graph. Without it, 6 of 8 are orphaned from search |
| `/glossary/ppn-002` | `/tools/ppn-002-calculator` | A definition to the tool that applies it |
| Every "Request access" | `/contact?enquiry=limited-access#contact-form` | The wire value and the fragment are both functional |

---

## 6. Open, not decided

1. **Three routes are linked from all 41 pages and do not exist.** `/integrations`, `/roadmap`,
   `/cookie-preferences`. Each blocked on an owner decision. At cutover they 404 unless redirected.
2. **Five of nine sectors have no page.** No recorded threshold for when one earns a page.
3. **22 of 24 glossary terms have no page.** Same question, and the index is not derived from the
   collection.
4. **There is no hub for the eight blog posts by category.** `data/faq.ts` has categories and
   `content/blog` has a `category` field, but no `/blog/category/<x>` routes exist. Not a defect; an
   unexplored option.
5. **`/resources` and `/tools` overlap in purpose** and it is not written down which is the canonical
   entry point for a reader looking for something free.
6. **Breadcrumbs are inconsistent in both forms, and nothing says which is right.** Measured on
   `astro/dist`:
   - **Visible trail:** only the 8 blog articles and `/compare`. Not on `/crowmark`, `/about`,
     `/terms`, `/sectors` or anywhere else.
   - **`BreadcrumbList` JSON-LD:** present on almost every route via `breadcrumbs()` or a hand-written
     block, **absent entirely on `/sectors`**,`pages/sectors/index.astro` imports `Base`, `SITE` and
     `Button` and no schema helper at all. Correctly absent on `/`.

   Two hub pages built the same week, `/compare` and `/sectors`, disagree on both counts. There is no
   recorded rule saying when a page gets a visible trail, so the answer today is *whoever wrote the
   page*.
