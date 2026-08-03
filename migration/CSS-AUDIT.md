# CSS Audit — crowagent-website → Astro migration

Scope: the 34 stylesheets in `Assets/css/` plus `crowagent-brand-tokens.css` at the
repo root (35 files total, ~1.03 MB). Evidence gathered by scanning `<link>` tags in
all 44 served HTML pages (21 top-level (20 real pages + the non-page
`googlef2adc6102725418d.html` verification stub, excluded from the 44) + `blog/` × 9 +
`sectors/` × 5 + `compare/` × 5 + `glossary/` × 3 + `tools/**` × 3 = 20+9+5+5+3+3 = 45
files, 44 real pages) and the runtime injection logic in `js/nav-inject.js` and
`js/modules/sf21-back-to-top.js`. (The site's own internal comments, e.g.
`js/nav-inject.js` and `scripts/build-dist.js`, repeatedly say "43" — my directly
counted, current-tree total is 44 real pages; the 1-page gap is most likely a page
added after those comments were last written, e.g. `sectors/highways.html`, and isn't
investigated further here.) Not run in a browser — every claim below is from static
text evidence (grep/read), cited by file:line. Where the site's own build tooling
(`scripts/build-dist.js`) had already independently measured something, that is cited
and treated as corroborating, not sole, evidence.

`styles.css` / `styles.min.css` / `styles.purged.css` at the repo root are **not** in
this 35-file scope (no page's `<head>` links them; `build-dist.js` denies `styles.css`
outright, see §2) and are not analysed further here.

---

## 1. Per-stylesheet load map

"Pages" below counts real, live `<link rel="stylesheet">` occurrences (i.e. it
excludes the two `<link>`-shaped strings that sit inside HTML `<!-- -->` comments in
`index.html` — see §3). "Injected" means `js/nav-inject.js` also creates/updates this
link at runtime, independent of what the static HTML declares.

| File | Size | Pages (static `<link>`) | Injected by JS? | Verdict |
|---|---:|---|---|---|
| `fonts-selfhosted.css` | 7,452 B | all 44 real pages | no | **live, universal** |
| `sovereign-core-v2.compiled.css` | 168,346 B | all 44 real pages | no | **live, universal** — hand-patched Tailwind build output (see §2) |
| `nav-global-fix-2026-05-27.css` | 138,209 B | all 44 real pages (static) | **yes** — `js/nav-inject.js:62-80` updates the `href` in place (or injects if absent) on every page | **live, universal**, but doubly-guaranteed |
| `premium-gloss-2026-05-31.css` | 19,835 B | all 44 real pages (static) | **yes** — `nav-inject.js:87-98`, same update-in-place pattern | **live, universal**, doubly-guaranteed |
| `crowagent-brand-tokens.css` (root) | 19,769 B | all 44 real pages | no | **live, universal** — see §4 for why its `:root` values are frequently *not* what renders |
| `ultra-premium-responsive.css` | 74,154 B | all 44 real pages | no | **live, universal** — also the file that actually wins the dark-theme colour cascade (§4) |
| `signature-atmosphere-2026-05-26.css` | 2,795 B | 35 of 44 pages: every page **except** the 9-page "nebula" group (`sectors/*` × 5, `blog/index.html`, `glossary/index.html`, `tools/index.html`, `tools/ppn-002-calculator/index.html`) | no | **live, large majority** |
| `premium-transformation-2026-05-27.css` | 26,946 B | 34 pages: the same 35-page set as `signature-atmosphere`, minus `blog/regulatory-updates-2026.html` (which loads `signature-atmosphere` but, unlike every other page in its group, not this one — a genuine one-off inconsistency, not part of a pattern) | no | **live, large majority** |
| `ultra-premium-interactions.css` | 7,843 B | 31 of 44 pages — missing from `404.html`, `changelog.html`, `cookie-preferences.html`, `cookies.html`, `glossary/ppn-002.html`, `glossary/toms-framework.html`, `integrations.html`, `partners.html`, `privacy.html`, `resources.html`, `security.html`, `terms.html`, `tools/ppn-002-calculator/methodology/index.html` (13 pages, all in the "legacy" group — see §1a) | **yes** — never injected; static only | **live, majority** — inconsistent inclusion across otherwise-identical page templates, no discernible pattern to which legacy pages skip it |
| `premium-v2.css` | 37,250 B | 9 pages: `blog/index.html`, `sectors/{construction,education,facilities,highways,index}.html`, `glossary/index.html`, `tools/index.html`, `tools/ppn-002-calculator/index.html` — the "nebula" group | no | **live, minority** — the nebula re-skin of `premium-transformation` (§6) |
| `no-js-content-fallback.css` | 4,691 B | 40 of 44 pages — missing from `homepage-claude-v1.html` and 3 blog posts: `blog/frameworks-and-dps-explained.html`, `blog/method-statement-that-scores.html`, `blog/private-sector-rfp-pqq-guide.html` | no | **live, large majority**, gap noted in §1b |
| `sector-steps-2026-07-30.css` | 5,037 B | `sectors/{construction,education,facilities,highways}.html` (4 pages; **not** `sectors/index.html`) | no | **live, narrow** |
| `compare-faq-2026-07-30.css` | 6,908 B | 4 of the 5 `compare/*.html` pages — every individual comparison page (`crowmark-vs-{autogenai,cleantender,mytender-io,swiftbid}.html`), **not** `compare/index.html` (the listing page, which has no FAQ content) | no | **live, narrow** |
| `legal-content.css` | 9,132 B | `cookies.html`, `privacy.html`, `terms.html` (3 pages) | no | **live, narrow** |
| `resources-page.css` | 2,758 B | `resources.html` only | no | **live, single-page** |
| `roadmap-page.css` | 10,135 B | `roadmap.html` only | no | **live, single-page** |
| `security-page.css` | 10,359 B | `security.html` only | no | **live, single-page** |
| `product-carousel-2026-05-26.css` | 3,162 B | `crowmark.html` only | no | **live, single-page** |
| `draft-demo-2026-07-30.css` | 18,905 B | `index.html` only | no | **live, single-page** |
| `find-demo-2026-07-30.css` | 22,757 B | `index.html` only | no | **live, single-page** |
| `prove-demo-2026-07-30.css` | 20,599 B | `index.html` only | no | **live, single-page** |
| `showcase-2026-07-30.css` | 10,112 B | `index.html` only | no | **live, single-page** |
| `trust-2026-07-30.css` | 18,241 B | `index.html` only | no | **live, single-page** |
| `journey-products-2026-07-30.css` | 18,835 B | `index.html` only | no | **live, single-page** |
| `statute-integrations-2026-07-30.css` | 25,248 B | `index.html` only | no | **live, single-page** |
| `nebula-livepanels.css` | 6,984 B | `index.html` only | no | **live, single-page** — sibling of the *dead* `js/nebula-livepanels.js` (different file, same name stem — see JS-AUDIT §Dead JS) |
| `sovereign-cmdk.css` | 7,066 B | **0 pages statically** | **yes** — `nav-inject.js:106-115`, same update-in-place/inject pattern | **live, universal, injection-only** |
| `back-to-top.css` | 2,592 B | **0 pages statically** | **yes**, indirectly — `js/modules/sf21-back-to-top.js:17-20`, itself injected by `nav-inject.js:1755-1764` | **live, universal, injection-only** |
| `print.css` (root, not in the 34) | — | `roadmap.html`, `security.html` (`media="print"`) | no | live, out of the 34-file scope but noted for completeness |
| `nav-footer-sf21.css` | 28,953 B | **0 pages** | no | **DEAD** — confirmed by `js/nav-inject.js:1521-1524` own comment and independently by `scripts/build-dist.js:536` | **deletion candidate** |
| `page-archetype-unify.css` | 21,266 B | **0 pages** | no | **DEAD** — `build-dist.js:536-537` | **deletion candidate** |
| `page-fixes-sf22.css` | 16,194 B | **0 pages** | no | **DEAD** — `build-dist.js:537` | **deletion candidate** |
| `pricing-sf16.css` | 19,896 B | **0 pages** (note: `pricing.html` does **not** load it despite the name) | no | **DEAD** — `build-dist.js:536` | **deletion candidate** |
| `sovereign-core-v2.css` | 18,850 B | **0 pages** | no | **DEAD as a page stylesheet** — it is the Tailwind `@import "tailwindcss"` *source* for `sovereign-core-v2.compiled.css` (line 1 of the file), not something any page links to. `build-dist.js:539-542` explicitly denies shipping it as a dev-surface leak. Do not delete the *content* without first re-deriving `.compiled.css`; deleting the *shipped copy* is safe. |
| `sovereign-primitives.css` | 60,897 B | **0 pages** | no | **DEAD as currently loaded**, but not orphaned in intent: `js/nav-inject.js:51-54` says the mega-nav markup it injects "is styled by sovereign-primitives.css/styles.css, which the transformed pages don't load" — i.e. this file used to be (or was designed to be) the nav/primitive stylesheet and `nav-global-fix-2026-05-27.css` was written specifically to replace it. `build-dist.js:551-552` independently confirms zero live references (the only two mentions elsewhere are inside comments, which the reachability scan strips). |
| `premium-ui.css` | 4,115 B | **0 pages** | no | **DEAD** — zero references anywhere in any `.html` or `.js` (verified directly; not yet in `build-dist.js`'s deny list because the file postdates that list's last measurement, see §2 note) |

### 1a. The "legacy/sovereign" vs "nebula" page split

Two largely-disjoint sets of pages exist, distinguished by which second-tier
stylesheet/JS bundle they load. This split matters more for the JS audit
(`migration/JS-AUDIT.md`) but it explains most of the CSS load-pattern differences
above:

- **Legacy/sovereign** (34 pages: `404.html`, `about.html`, `changelog.html`,
  `contact.html`, `cookie-preferences.html`, `cookies.html`, `crowmark.html`,
  `crowmark-buyers.html`, `faq.html`, `integrations.html`, `partners.html`,
  `pricing.html`, `privacy.html`, `resources.html`, `roadmap.html`, `security.html`,
  `terms.html`, all 5 `compare/*.html`, all 8 `blog/*.html` except `blog/index.html`,
  `glossary/{ppn-002,toms-framework}.html`, `tools/ppn-002-calculator/methodology/`)
  load `signature-atmosphere-2026-05-26.css` + `premium-transformation-2026-05-27.css`
  (with the one `blog/regulatory-updates-2026.html` exception noted above) and, in JS,
  GSAP + ScrollTrigger + `sovereign-transformation-v2.js`.
- **Nebula** (9 pages: `index.html`, `sectors/*.html` × 5, `blog/index.html`,
  `glossary/index.html`, `tools/index.html`, `tools/ppn-002-calculator/index.html`)
  load `premium-v2.css` instead, and in JS `nebula-home.js` instead of GSAP.
- `homepage-claude-v1.html` is a third, singular case (the 44th page): it loads
  `signature-atmosphere` and `premium-transformation` (so structurally it resembles
  the "legacy" group) but has no `premium-v2.css` either, and additionally carries its
  own large inline `<style>` block (see §4) that most legacy pages don't have. It is a
  **prototype homepage**, not yet promoted — its most recent commit (`f60a6f9d`, "stop
  the prototype homepage competing with the real one") set `noindex,nofollow`
  specifically because it duplicates `index.html`'s purpose. It is live and publicly
  reachable, shares the sitewide nav-inject pipeline, and is a strong candidate to
  become the new `index.html` at some point — treat it as in-scope for the migration,
  not as scratch content.

### 1b. `no-js-content-fallback.css` gap

Confirmed missing (no `<link>`) on `homepage-claude-v1.html` and 3 of the 9 blog posts
(`blog/frameworks-and-dps-explained.html`, `blog/method-statement-that-scores.html`,
`blog/private-sector-rfp-pqq-guide.html`). This
sheet is the CSS half of the reveal-failsafe pattern discussed in
`migration/JS-AUDIT.md` (it forces `.sv-reveal`/`.reveal`/etc. to `opacity:1` when JS
never runs, keyed off the *absence* of `html.nb-js` / `html.js-sv-reveal`). On the 5
pages missing it, a user with JavaScript disabled has no guaranteed CSS fallback for
whatever reveal classes those pages' scripts would otherwise add — this is a real gap,
not just a missed optimisation, and should be closed in the Astro rebuild by making
the no-JS fallback a global include rather than a per-page opt-in.

---

## 2. Build/source relationship (why "0 pages" isn't always "delete it")

`scripts/build-dist.js` (the site's own deploy-time pruner) already carries a
measured, dated audit of `Assets/css` reachability, comment at lines 517-556:

> "`Assets/css` — 6 of its 26 stylesheets were referenced by no page and no injector
> (measured 2026-07-30): `sovereign-primitives.css` (28.1KB), `sovereign-core-v2.css`
> (11.8KB), `nav-footer-sf21.css` (10.2KB), `pricing-sf16.css` (9.9KB),
> `page-archetype-unify.css` (7.9KB) and `page-fixes-sf22.css` (4.3KB)."

(The KB figures there are gzipped/different-measurement; this audit's table above uses
raw file size from `ls`, which is why the numbers don't match — same 6 files either
way.) That count was 26 sheets on 2026-07-30; there are 34 today, so 8 sheets were
added since, one of which (`premium-ui.css`, timestamped today, 2026-08-01) is
**also** dead but isn't in that list yet because it postdates the measurement. This
audit independently re-verified all 7 dead files by direct grep against the current
tree rather than trusting the comment alone.

Two files in the dead-file list are structurally different from the other five and
need different handling in the Astro migration:
- `sovereign-core-v2.css` is Tailwind **source** (`@import "tailwindcss";` is its only
  line-1 content, `Assets/css/sovereign-core-v2.css:1`). `sovereign-core-v2.compiled.css`
  is its build output, hand-patched since (`package.json`'s `build:css` script
  refuses to run, with an explanatory error: regenerating from source "drops 472
  utility rules, loses the srgb `color-mix()` fallbacks... and reintroduces the
  hardcoded hex/z-index/px values the token pass removed"). For Astro, treat
  `sovereign-core-v2.compiled.css` as the actual design-system input to port, and
  treat `sovereign-core-v2.css` + the Tailwind toolchain as **not currently
  reproducible** — the compiled file has drifted from anything Tailwind would
  regenerate.
- `sovereign-primitives.css` was written as the nav/primitive stylesheet, then
  effectively replaced in shipped pages by `nav-global-fix-2026-05-27.css` (per the
  comment at `js/nav-inject.js:51-54`), leaving it orphaned rather than never-used. Its
  60.9KB is the largest of the dead files and, being named "primitives," is worth a
  read before deletion in case it holds care redlined that never made it into
  `nav-global-fix`.

**Deletion candidates, safe to drop without further investigation**: `nav-footer-sf21.css`,
`page-archetype-unify.css`, `page-fixes-sf22.css`, `pricing-sf16.css`, `premium-ui.css`.
Combined: 90.4 KB.

---

## 3. `index.html`'s stylesheet count — the claimed 20-with-2-duplicates does not hold up

`grep -n 'rel="stylesheet"' index.html` returns 20 matches. But two of them —
`index.html:571` and `index.html:909` — sit inside HTML `<!-- ... -->` comment blocks
that document *insertion requirements* for content sections that were pasted into the
page during its assembly:

```
index.html:568-571
<!-- ============================================================================
     FIND THE WORK WORTH BIDDING — beat 1 of the homepage story.
     Added 2026-07-30. Insert BETWEEN #journey and #drafting.
     Requires: <link rel="stylesheet" href="/Assets/css/find-demo-2026-07-30.css?v=20260731c">
```
```
index.html:902-909
<!-- =============================================================================
     PROVE YOU DELIVERED — beat 4 of the homepage story.
     ...
     Requires one stylesheet link in <head>, after draft-demo-2026-07-30.css:
       <link rel="stylesheet" href="/Assets/css/prove-demo-2026-07-30.css?v=20260730a">
```

Both `find-demo-2026-07-30.css` and `prove-demo-2026-07-30.css` **are** genuinely
loaded, once each, from real `<link>` tags in `<head>` (lines 52 and 53). The
requirement note was written when the section was pasted in and simply never deleted
once the real `<link>` was added up top — it is dead documentation, not a duplicate
load. Excluding the two comment matches, index.html has **18 live `<link
rel="stylesheet">` tags, all with distinct hrefs**: `fonts-selfhosted`,
`sovereign-core-v2.compiled`, `signature-atmosphere-2026-05-26`,
`premium-transformation-2026-05-27`, `nav-global-fix-2026-05-27`,
`premium-gloss-2026-05-31`, `crowagent-brand-tokens`, `ultra-premium-interactions`,
`ultra-premium-responsive`, `nebula-livepanels`, `draft-demo-2026-07-30`,
`find-demo-2026-07-30`, `prove-demo-2026-07-30`, `showcase-2026-07-30`,
`trust-2026-07-30`, `journey-products-2026-07-30`, `statute-integrations-2026-07-30`,
`no-js-content-fallback` (lines 39, 42-57, 380).

I could not find a second genuine duplicate anywhere in the static markup, and
`nav-inject.js`'s runtime handling of `nav-global-fix-2026-05-27.css` and
`premium-gloss-2026-05-31.css` (its only two CSS injections that are also usually
present statically) is explicitly **update-in-place**, not append — `nav-inject.js:63-67`
and `:88-92` both check `document.querySelector('link[href*="…"]')` first and mutate
the existing tag's `href` rather than creating a second `<link>`. So I cannot confirm
a real 2-duplicate load on `index.html` from static evidence, and the most likely
explanation for the "20 stylesheets, 2 loaded twice" premise is exactly this
comment-vs-live-tag confusion — a naive line-count of `rel="stylesheet"` occurrences
(which is what I did on the first pass too, before checking each line's context)
produces 20, and the two extra are the comments above. **I did not load the page in a
browser** (forbidden by this task's constraints), so I cannot rule out a
runtime-only duplicate from some other script; but nothing in the static HTML or in
`nav-inject.js` produces one. Flag this premise as unconfirmed/likely-incorrect rather
than building the Astro `<head>` around avoiding a duplicate that doesn't appear to
exist.

---

## 4. Design-token mapping: `crowagent-brand-tokens.css` (`--ca-*`/base) vs `homepage-claude-v1.html`'s inline system (`--nt-*`/`--sec-*`/`--t-*`/`--r-*`/`--btn-*`)

This is the load-bearing section for the Astro design system. Two systems exist:

1. **`crowagent-brand-tokens.css`** (root, loaded on all 44 pages) — the nominal
   sitewide canonical token file. It sets a large `:root` block (`crowagent-brand-tokens.css:18`,
   one very long line — the whole `:root` is minified onto it) plus a
   `@supports (color-gamut:p3)` override block and a `:root[data-theme=light]` block
   that no page currently activates (every page hardcodes `<html data-theme="dark">`,
   confirmed by the file's own top-of-file comment).
2. **`homepage-claude-v1.html`'s inline `<style>` block** (`homepage-claude-v1.html:79-188`)
   — a self-contained, from-scratch `:root` token set built specifically for that one
   page, explicitly *not* reusing `--ca-*`. Its own comments (lines 80-84, 105-108,
   114-116) describe it as a deliberate consolidation of previously-inconsistent
   per-section values ("the page previously rendered cards at 28, 26, 24, 20, 16, 14,
   12 and 10px... alongside three competing scales that disagreed with each other") —
   i.e. it is itself a mini design-system-within-a-page, built in isolation from the
   sitewide one.

There is also a **third** relevant file, because the sitewide `--teal`/`--bg`/`--surf`
etc. that actually render are not the ones in `crowagent-brand-tokens.css`'s plain
`:root` — see the note under "teal" below. `Assets/css/ultra-premium-responsive.css`
carries a `:root[data-theme=dark]` block (`ultra-premium-responsive.css:198-...`) that
wins the cascade on every page (loads after `crowagent-brand-tokens.css`, and an
attribute selector beats a bare `:root`). The mapping table below cites that file
where it's the one actually driving the rendered colour.

### Mapping table

| Concept | `crowagent-brand-tokens.css` (`:root`, non-P3) | What actually wins on a real page | `homepage-claude-v1.html` inline | Agree? |
|---|---|---|---|---|
| Brand teal | `--teal:#0CC9A8` (`crowagent-brand-tokens.css:18`, first `--teal:` at char offset 1516) | `--teal:#2DD4BF`, from `ultra-premium-responsive.css:231` inside `:root[data-theme=dark]` (unconditional, no `@supports` gate) — this beats the brand-tokens value on every page because of selector specificity + load order | `--nt-teal:#2DD4BF` **and separately** `--nt-teal-dark:#0CC9A8` (`homepage-claude-v1.html:157-158`) | **Partial.** The homepage's `--nt-teal` agrees with what *actually renders* (`#2DD4BF`), not with brand-tokens.css's plain `:root` value. It keeps `#0CC9A8` too, under a different name (`--nt-teal-dark`), so both historical values survive as two different tokens instead of one being retired. `crowagent-brand-tokens.css` itself has a 2026-07-29 comment (lines 1-17) claiming to have just fixed this exact mismatch ("Set to the value that actually ships") — but the value it landed on, `#0CC9A8`, is **not** the value `ultra-premium-responsive.css`'s unconditional dark-theme override actually ships. The brand-tokens.css `@supports (color-gamut:p3)` branch (its second `--teal:` declaration, char offset ~10185) *does* set `#2DD4BF`, matching — but that branch only applies on P3-capable displays, while `ultra-premium-responsive.css`'s override is unconditional. Net: **three different values claim to be "the" brand teal** depending which file and which media feature you read. |
| Page background | `--bg:#040E1A` (brand-tokens `:root`) | `--bg:#05070E` (`ultra-premium-responsive.css:200`, `:root[data-theme=dark]`) | `--nt-bg:#05070E` (`homepage-claude-v1.html:149`) | Homepage agrees with the *winning* file, disagrees with brand-tokens.css's nominal value. Same pattern as teal. |
| Card/panel surface | `--surf:#0A1F3A` (brand-tokens `:root`) | `--surf:#0C1020` (`ultra-premium-responsive.css:210`) | `--nt-panel:#0C1020` (`homepage-claude-v1.html:169`) | Same pattern again. |
| Primary text colour | `--cloud:#E8F0FA` (brand-tokens `:root`); `ultra-premium-responsive.css` sets a very close `#EAF1FB` for the same slot | `--nt-text-main:#FFFFFF` (`homepage-claude-v1.html:171`, pure white) | **Disagree.** Neither sitewide file uses pure white for body text; the homepage does. This is a real, not just cosmetic, divergence in the visual system. |
| Hairline border colour | `--border:rgba(12,201,168,0.10)` — teal-tinted (brand-tokens `:root`) | `--nt-border:rgba(160,180,228,0.18)` — blue-grey tinted, ~2× the opacity (`homepage-claude-v1.html:154`) | **Disagree**, both in hue and alpha. The homepage's own comment at line 152-154 explains it deliberately raised the opacity from an earlier `.12` "so the hairlines... are actually visible," but the *hue* change (teal → blue-grey) is undocumented and is a genuine system fork, not just a contrast fix. |
| Card radius | `--r:12px`, `--r2:16px`, `--r3:20px`, `--rp:100px` (brand-tokens `:root`); also `--radius-md:10px`, `--radius-lg:16px`, `--radius-xl:24px`, `--btn-radius:10px`, `--btn-radius-pill:100px` in the same file | `--r-card:20px`, `--r-panel:16px`, `--r-chip:10px`, `--r-pill:100px` (`homepage-claude-v1.html:109-112`) | **Agree on value, disagree on naming/mapping.** `--r-card`(20)=`--r3`(20); `--r-panel`(16)=`--r2`(16)=`--radius-lg`(16); `--r-chip`(10)=`--radius-md`(10)=`--btn-radius`(10); `--r-pill`(100)=`--rp`(100)=`--btn-radius-pill`(100). Four numerically-identical pairs with four different name pairs — a pure renaming/consolidation opportunity for Astro, not a value conflict. |
| Body copy size | `--text-body:clamp(1rem,1.2vw,1.125rem)` [16-18px] and `--text-md:1rem` [16px] (brand-tokens `:root`) | — | `--t-body:0.9375rem` [15px] (`homepage-claude-v1.html:98`) | **Disagree.** Homepage body copy renders ~1-3px smaller than the sitewide token would produce. |
| Lede/lead paragraph size | `--text-lead:clamp(1.125rem,1.5vw,1.25rem)` [18-20px] (brand-tokens) | — | `--t-lede:1.02rem` [~16.3px] (`homepage-claude-v1.html:97`) | **Disagree**, homepage lede is smaller than sitewide lead across the whole clamp range. |
| Micro/eyebrow label size | `--text-micro:0.6563rem` [~10.5px], `--text-eyebrow-s:0.7188rem` [~11.5px] (brand-tokens) | — | `--t-micro:11.5px` (`homepage-claude-v1.html:99`) | **Coincidentally agrees** with `--text-eyebrow-s` almost exactly (11.5px vs 11.5px) but not with `--text-micro`. Likely the homepage author picked a value that happened to land on an existing token without knowing it. |
| Primary button height | `--btn-h-sm:36px`, `--btn-h-md:44px`, `--btn-h-lg:52px`, `--btn-h-xl:60px` (brand-tokens) | — | `--btn-h:54px` (`homepage-claude-v1.html:117`) | **Disagree.** 54px does not match any of the four sitewide button-height steps — it sits between `--btn-h-lg`(52) and `--btn-h-xl`(60), a genuinely new fifth value. |
| Secondary button height | (see above) `--btn-h-md:44px` | — | `--btn-h-sm:44px` (`homepage-claude-v1.html:118`) | **Agree on value** (44px = 44px), but the homepage calls its 44px button "sm" while brand-tokens calls the same height "md" — a naming collision waiting to confuse anyone cross-referencing the two systems. |
| Display font family | `--font-display:'Plus Jakarta Sans', …` | — | `--nt-font-display:'Plus Jakarta Sans', system-ui, …` (`homepage-claude-v1.html:177`) | **Agree.** |
| Body font family | `--font-body:'Inter', …` | — | `--nt-font-body:'Inter', …` (`:178`) | **Agree.** |
| Mono font family | `--font-mono:'JetBrains Mono', …` | — | `--nt-font-mono:'JetBrains Mono', …` (`:179`) | **Agree.** |
| Standard easing curve | `--ease-out:cubic-bezier(0.16,1,0.3,1)`, aliased as `--ease-canonical` | — | `--nt-ease:cubic-bezier(0.16,1,0.3,1)` (`:186`) | **Agree**, exactly. |
| Section vertical padding | `--section-y-primary:clamp(64px,8vw,120px)` (brand-tokens; keyed to **vw**) | — | `--sec-pad-y:clamp(64px,8vh,128px)` (`:141`; keyed to **vh**) | **Same floor value (64px), different unit basis and different ceiling** (120 vs 128px). The homepage's own comment (lines 122-127) explains the vh-vs-vw choice was deliberate: "a section's height is a vertical problem: a vw clamp gives a 768px laptop exactly the same padding it gives a 1080px screen." This is a considered, documented improvement over the sitewide token, not an accidental drift — worth carrying into Astro as the *new* canonical approach rather than reconciling toward the old one. |

**Summary for the Astro design system**: font families and the primary easing curve
are already unified and should be adopted as-is. Radii are unified in value but need
one naming scheme (recommend the homepage's `--r-card`/`--r-panel`/`--r-chip`/`--r-pill`
naming, since it's semantic rather than ordinal). Colour (teal, bg, surface, text,
border) and type scale (body, lede, button height) are **not** unified — the homepage
system was built by measuring what a fresh page needed, not by reading the sitewide
tokens, and in the two-way color-mismatches (teal/bg/surf) it happens to agree with
whichever *file actually wins the cascade* rather than with the token file that
documents itself as canonical. The practical implication: `crowagent-brand-tokens.css`
is not a trustworthy single source of truth today — before porting any color token
into Astro, check `ultra-premium-responsive.css`'s `:root[data-theme=dark]` block for
an override, because that file, not brand-tokens.css, determines the actual rendered
colour on every existing page.

---

## 5. Full `--ca-c-*` raw hex tail

Worth flagging separately: the back half of `crowagent-brand-tokens.css`'s `:root`
block (`crowagent-brand-tokens.css:18`, from roughly the `--ca-c-0d2240` token onward)
is a long tail of ~50 tokens named after their own hex value (`--ca-c-2ee6c4:#2ee6c4`,
`--ca-c-f472b6:#f472b6`, etc.) — i.e. auto-generated names that record a colour a
component happened to hardcode, not a semantic decision. These are not part of the
`--nt-*` comparison above (the homepage doesn't reference any `--ca-c-*` token) and
are a strong signal that a mechanical hex-to-token migration pass was run at some
point without a follow-up semantic-naming pass. Worth pruning/renaming during the
Astro token-system build rather than carrying forward as-is.

---

## 6. Duplication across sheets, and the "successive re-skin" pattern

Exact redundant-rule counting would need an AST diff, which is out of scope for a
static audit; the numbers below are direct, cited measurements (selector presence and
rule-block counts) that stand in as a lower bound.

**Selector reach across the 34 sheets** (files that contain at least one rule for the
selector; a file being counted here does not mean the rule is identical to another
file's, only that both style the same target):

| Selector family | Files defining it | Of those, loaded together on the same page(s) |
|---|---:|---|
| `.btn` / `[class*=btn]` | 9 files: `nav-global-fix-2026-05-27`, `page-archetype-unify`(dead), `page-fixes-sf22`(dead), `premium-transformation-2026-05-27`, `premium-v2`, `pricing-sf16`(dead), `sovereign-core-v2`(dead/source), `sovereign-primitives`(dead), `ultra-premium-interactions` | 4 live files co-load on the "legacy" page group: `nav-global-fix`, `premium-transformation`, `ultra-premium-interactions` (+ `premium-v2` on the "nebula" group instead of `premium-transformation`) |
| `.ca-card` | 10 files: `nav-global-fix-2026-05-27`, `no-js-content-fallback`, `premium-gloss-2026-05-31`, `premium-transformation-2026-05-27`, `resources-page`, `roadmap-page`, `sovereign-core-v2.compiled`, `sovereign-core-v2`(dead/source), `ultra-premium-interactions`, `ultra-premium-responsive` | Up to 6 live files style `.ca-card` on the same page simultaneously (`nav-global-fix`, `no-js-content-fallback`, `premium-gloss`, `premium-transformation`, `ultra-premium-interactions`, `ultra-premium-responsive`, plus `sovereign-core-v2.compiled` which is always loaded — that's 7) |
| `.hero` | 8 files: `nav-global-fix-2026-05-27`, `no-js-content-fallback`, `page-archetype-unify`(dead), `page-fixes-sf22`(dead), `premium-gloss-2026-05-31`, `premium-v2`, `signature-atmosphere-2026-05-26`, `sovereign-primitives`(dead) | Up to 4 live files (`nav-global-fix`, `no-js-content-fallback`, `premium-gloss`, plus `signature-atmosphere` or `premium-v2` depending on page group) |
| `.cta` | 3 files: `nav-global-fix-2026-05-27`, `page-archetype-unify`(dead), `sovereign-primitives`(dead) | Only 1 live file (the other two are already dead) — **not actually duplicated in production**, despite 3 files defining it |
| `backdrop-filter` (glassmorphism) | 13 files, including 4 already-dead ones (`nav-footer-sf21`, `pricing-sf16`, `sovereign-core-v2`, `sovereign-primitives`) | Up to 6 live files simultaneously (`nav-global-fix`, `premium-gloss`, `premium-transformation`/`premium-v2`, `resources-page` on that one page, `sovereign-core-v2.compiled`, `ultra-premium-responsive`) |
| `-webkit-text-fill-color` (gradient/clip text) | 8 files: `compare-faq-2026-07-30`, `legal-content`, `nav-global-fix-2026-05-27`, `premium-gloss-2026-05-31`, `premium-transformation-2026-05-27`, `premium-v2`, `showcase-2026-07-30`, `ultra-premium-responsive` | Up to 4-5 live files depending on page — this is the exact mechanism behind the invisible-text defect recorded in project memory (`project_2026_07_26_website_textvis_fix`), i.e. more files touching this property than any one page needs is not hypothetical risk, it already caused a shipped bug |

**Keyframe name collisions** (same `@keyframes` identifier defined in two different
*live* files, which means whichever loads last silently wins for any element using
that animation-name): `@keyframes pulse` is defined both in `premium-v2.css:152`
(`50%{opacity:.4}`) and in `sovereign-core-v2.compiled.css:5514` (Tailwind's default
`animate-pulse` keyframe, presumably `50%{opacity:.5}` — not fully verified against
Tailwind's default since the compiled file is hand-patched, but the identifier match
alone is the collision). Both files load together on every "nebula" page
(`sectors/*`, `blog/index.html`, `glossary/index.html`, `tools/*`). `@keyframes
marquee` is defined in both `sovereign-core-v2.compiled.css:5099` and
`sovereign-core-v2.css:495` — not a live collision, since the second file is the dead
Tailwind source for the first.

**Rule-block counts** (raw `{` count, a rough proxy for rule density) for the files
that most resemble successive re-skins of the same component set, per the task's own
naming hint:

| File | Date in filename | Rule blocks (`{` count) |
|---|---|---:|
| `signature-atmosphere-2026-05-26.css` | 2026-05-26 | 8 |
| `premium-transformation-2026-05-27.css` | 2026-05-27 | 129 |
| `premium-gloss-2026-05-31.css` | 2026-05-31 | 32 |
| `premium-v2.css` | undated (filename suggests v2 of the above pair) | 336 |
| `ultra-premium-interactions.css` | undated | 29 |
| `ultra-premium-responsive.css` | undated | 172 |
| `premium-ui.css` | undated, newest (Aug 1, dead) | 36 |

Read as a timeline: `signature-atmosphere` (26 May) → `premium-transformation` (27
May, 16× the rule count of its predecessor) → `premium-gloss` (31 May, a lighter
specular/highlight layer on top) → `premium-v2` (undated, but loaded only on the
newer "nebula" page group, and at 336 rule blocks is the largest single "premium"
file — reads as a from-scratch redo rather than a patch) → `ultra-premium-interactions`
/ `ultra-premium-responsive` (undated, "ultra" superseding "premium," together ~201
rule blocks) → `premium-ui.css` (newest by file timestamp, never wired up — an
abandoned sixth attempt). Six files, one visual concept ("make the UI feel premium"),
each not replacing but adding to the ones before it — every live page still loads
between 3 and 5 of these six simultaneously (see the selector-reach table above). This
is the single clearest case in the whole CSS surface for Astro consolidation: one
component layer (buttons, cards, hero glass, gradient text, glow/gloss highlights)
should replace all six.

---

## 7. Files list (all 35, for reference)

```
back-to-top.css                          2,592 B   live (JS-injected only)
compare-faq-2026-07-30.css               6,908 B   live (compare/* only)
crowagent-brand-tokens.css (root)       19,769 B   live (universal)
draft-demo-2026-07-30.css               18,905 B   live (index.html only)
find-demo-2026-07-30.css                22,757 B   live (index.html only)
fonts-selfhosted.css                     7,452 B   live (universal)
journey-products-2026-07-30.css         18,835 B   live (index.html only)
legal-content.css                        9,132 B   live (3 legal pages)
nav-footer-sf21.css                     28,953 B   DEAD
nav-global-fix-2026-05-27.css          138,209 B   live (universal, JS-managed)
nebula-livepanels.css                    6,984 B   live (index.html only)
no-js-content-fallback.css               4,691 B   live (40 of 44 pages)
page-archetype-unify.css                21,266 B   DEAD
page-fixes-sf22.css                     16,194 B   DEAD
premium-gloss-2026-05-31.css            19,835 B   live (universal, JS-managed)
premium-transformation-2026-05-27.css   26,946 B   live (34 of 44 pages, legacy group)
premium-ui.css                           4,115 B   DEAD
premium-v2.css                          37,250 B   live (9-page nebula group)
pricing-sf16.css                        19,896 B   DEAD
product-carousel-2026-05-26.css          3,162 B   live (crowmark.html only)
prove-demo-2026-07-30.css               20,599 B   live (index.html only)
resources-page.css                       2,758 B   live (resources.html only)
roadmap-page.css                        10,135 B   live (roadmap.html only)
sector-steps-2026-07-30.css              5,037 B   live (4 sector pages)
security-page.css                       10,359 B   live (security.html only)
showcase-2026-07-30.css                 10,112 B   live (index.html only)
signature-atmosphere-2026-05-26.css      2,795 B   live (35 of 44 pages, legacy group)
sovereign-cmdk.css                       7,066 B   live (universal, JS-injected only)
sovereign-core-v2.compiled.css         168,346 B   live (universal)
sovereign-core-v2.css                   18,850 B   DEAD (Tailwind source, not shipped-to-page)
sovereign-primitives.css                60,897 B   DEAD (superseded by nav-global-fix)
statute-integrations-2026-07-30.css     25,248 B   live (index.html only)
trust-2026-07-30.css                    18,241 B   live (index.html only)
ultra-premium-interactions.css           7,843 B   live (partial, 31 of 44 pages)
ultra-premium-responsive.css            74,154 B   live (universal)
```

Total: 1,057,443 B (~1.03 MB). Dead: `nav-footer-sf21.css` + `page-archetype-unify.css`
+ `page-fixes-sf22.css` + `premium-ui.css` + `pricing-sf16.css` + `sovereign-core-v2.css`
+ `sovereign-primitives.css` = 170,061 B (~166 KB, ~16% of the total by size, 7 of 35
files by count).
