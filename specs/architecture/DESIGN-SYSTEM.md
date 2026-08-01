# Design System — crowagent-website (Astro rebuild)

**Status:** living document, single source of truth for `astro/src/`. **Scope:** the
cascade-layer architecture, the no-`!important` rule, and the component inventory that
exists today. Does not restate the migration rationale — see
[`../MODERNISATION-ARCHITECTURE.md`](../MODERNISATION-ARCHITECTURE.md) for why the
rebuild exists at all.

Every number below was measured directly against the files named next to it, on
2026-08-02. Re-run the counts before trusting them after any further change; the
commands are given so that is mechanical, not a re-audit.

---

## 1. The cascade-layer architecture

Declared at the top of `astro/src/styles/tokens.css:42`:

```css
@layer reset, tokens, base, layout, components, utilities;
```

### 1.1 Why this exists

The legacy stylesheets carry `!important` on a scale that makes them unmaintainable.
Measured directly, not estimated:

| Scope | File(s) | `!important` count | Method |
|---|---:|---:|---|
| Legacy, `Assets/css/*.css` (34 files) | the set `migration/CSS-AUDIT.md` scopes as "the 34 stylesheets" | **2,279** | `node` script summing `/!important/g` matches per file, see §1.2 |
| Legacy, `crowagent-brand-tokens.css` (root, 35th file in the audit's scope) | — | 12 | same method |
| Legacy, `styles.css` (root — **not** loaded by any page, excluded from the 34/35-file scope per `migration/CSS-AUDIT.md:18-20`) | — | 1,923 | same method |
| Legacy, `print.css` (root — noted "out of the 34-file scope" in `migration/CSS-AUDIT.md:61`) | — | 19 | same method |
| Rebuild, `astro/src/**/*.{astro,css,ts}` (23 files) | — | **0** | see §1.2 — the 3 textual matches are inside a comment, not declarations |

The headline comparison this document and `DESIGN-TOKENS.md` both cite is
**2,279 → 0**, i.e. the 34-file `Assets/css/` scope against all of `astro/src/`. The
`styles.css` and `print.css` figures are additional legacy debt that sits *outside*
that scope (unloaded by any page, or print-media-only) and are listed here only so a
future reader does not "discover" them and think the headline number is wrong.

That count is not carelessness, it is the predictable end state of a system with no
agreed priority order: every new rule has to out-shout the last one, so the only way to
win is to escalate. The clearest example (`tokens.css:9-12`): a rule forced sixteen
element types to `text-align:center` inside every section on every page. Once that
existed, any page wanting normal alignment had to fight it, and 138 per-element
opt-out attributes accumulated across 24 pages to do so. Those attributes were a
symptom. The absence of a priority order was the cause.

### 1.2 How the counts were taken

Ripgrep's line-count mode undercounts files where several `!important` tokens share
one minified line (confirmed on this repo: it reported 1,276 for `Assets/css/*.css`
where the true figure is 2,279). The counts in this document use a full-text match
count instead:

```js
// node -e "<this>", run from the repo root
const fs = require('fs'), path = require('path');
const dir = 'Assets/css';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.css'));
let total = 0;
for (const f of files) total += (fs.readFileSync(path.join(dir, f), 'utf8').match(/!important/g) || []).length;
console.log(files.length, total); // -> 34 2279
```

The same script pointed at `astro/src` (walking `.css`/`.astro`/`.ts`) returns **3**
matches, all three inside the header comment of `tokens.css` (lines 3, 6 and 36 —
the words "no `!important` anywhere", "carry 2,279 `!important` declarations" and
"RULE: no `!important` in this codebase"). Zero are CSS declarations. The rebuild's
actual `!important` count is 0.

### 1.3 Why cascade layers fix it

Layer order is resolved **before** specificity, so a single-class rule in a later
layer beats a deeply nested selector in an earlier one. Priority becomes a property of
**where** a rule lives rather than how aggressively it is written, and the escalation
that produced 2,279 `!important`s has nowhere to go. Supported everywhere that
matters: Chrome 99+, Firefox 97+, Safari 15.4+, ~96% of users (`tokens.css:19-20`).

**THE ORDER IS THE CONTRACT. Later wins.**

| Layer | Owns |
|---|---|
| `reset` | normalisation only |
| `tokens` | custom properties, no selectors that paint |
| `base` | element defaults: body, headings, links, lists |
| `layout` | containers, grids, page-level structure |
| `components` | UI. Most CSS lives here. |
| `utilities` | single-purpose helpers, deliberately able to beat components |

**Astro's scoped component styles (`<style>` inside a `.astro` file, the default) are
UNLAYERED, and unlayered styles rank ABOVE every layer named above.** That is the
correct default: a component's own styles should beat `base` and `layout` without
anyone thinking about it. Reach for the `components` layer only when a style must be
shareable across components — none of the current components do this; every `<style>`
block in every `.astro` file in this repo today is scoped and unlayered (verified by
reading all 8 files, §3).

### 1.4 The rule

**No `!important` in this codebase.** If a rule is losing, it is in the wrong layer.
Move it; do not escalate it.

**One legitimate exception**: accessibility overrides such as `forced-colors` and
`prefers-reduced-motion`, which must beat everything by design. `tokens.css:182-188`
is the one place in the current codebase this applies, and it does not use
`!important` either — it overrides the *value* of `--dur-fast`/`--dur`/`--dur-slow`
inside a `@media (prefers-reduced-motion: reduce)` block in the `tokens` layer, which
every consumer already reads through a `var()`, so no specificity fight is needed at
all. This is the pattern to repeat if a future forced-colors override is ever needed:
override the token, not the rule.

### 1.5 Tailwind is present but not yet load-bearing

`astro/astro.config.mjs:2,27` registers `@tailwindcss/vite`, and `tailwind`/
`@tailwindcss/vite` `^4.3.0` are declared in `astro/package.json`. But
`tokens.css:63-67` states, and a direct read of the file confirms, that none of the
51 tokens are wrapped in a Tailwind v4 `@theme` block yet — they are plain CSS custom
properties. `@theme` mapping is deliberately deferred until a section is verified
pixel-equal against the legacy baseline, "because doing both at once makes a visual
diff unattributable" (`tokens.css:66-67`). Until that happens, do not assume any
Tailwind utility class (`bg-teal`, `text-h1`, etc.) resolves to a token in this
codebase — none currently do.

---

## 2. Component inventory (measured, `astro/src/layouts/` + `astro/src/components/`)

8 `.astro` files exist today: 5 layouts, 3 components. This is the entire inventory —
there is no `components/sections/`, `components/ui/` or `components/motion/`
directory yet (§4).

### 2.1 Layouts (`astro/src/layouts/`)

| Layout | Renders | Real props (from the file's own `interface Props`) |
|---|---|---|
| `Base.astro` | The `<html>` shell every page renders through: `<head>` via `Seo.astro`, skip link, `Nav`, `<main id="main-content">`, `Footer`. Owns global `box-sizing`, background/colour-scheme, and the skip-link CSS. | `title: string`, `description: string`, `path: string`, `image?: string`, `type?: 'website' \| 'article'`, `publishedAt?: Date`, `updatedAt?: Date`, `noindex?: boolean`, `schema?: Record<string, unknown>[]`, `ogTitle?: string`, `ogDescription?: string`, `twitterTitle?: string`, `twitterDescription?: string` |
| `Article.astro` | Blog post layout: one `<h1>`, a 720px reading measure, eyebrow/meta line, derives `BlogPosting` + `BreadcrumbList` JSON-LD itself (not passed in). Wraps `Base`. | `title: string`, `description: string`, `path: string`, `image?: string`, `publishedAt: Date`, `updatedAt?: Date`, `category: string`, `readingTime?: number` |
| `Compare.astro` | `/compare/crowmark-vs-*` layout: breadcrumb hero, article body via slot, closing CTA band. Builds `BreadcrumbList` + `Article` + optional `FAQPage` JSON-LD from props. Wraps `Base`. | `title`, `description`, `ogDescription`, `articleDescription`, `path`, `publishedAt: Date`, `updatedAt?: Date`, `competitor`, `eyebrow`, `heroDescription`, `ogImage`, `ogImageAlt`, `ctaHeadline`, `ctaSubLine1`, `ctaSubLine2`, `faq: {question: string; answer: string}[]` |
| `Glossary.astro` | `/glossary/*` term layout: hero, article body via slot + "Read more" link, two structured sidebar cards, closing CTA. Builds `DefinedTerm` + `BreadcrumbList` JSON-LD. Wraps `Base`. | `title`, `description`, `ogTitle`, `ogDescription`, `ogImage`, `ogImageAlt`, `path`, `termName`, `termTagline`, `heroDescription`, `definedTermDescription`, `sidebarKicker`, `sidebarTitle`, `sidebarBody`, `sidebarHref`, `sidebarCta`, `productCardBody`, `readMoreHref`, `readMoreLabel`, `readMoreBody`, `ctaHeading`, `ctaSub` |
| `Sector.astro` | `/sectors/*` layout: hero, context prose via slot, a 4-step "how CrowMark helps" grid, one screenshot, FAQ accordion, closing CTA. Builds `BreadcrumbList` + optional `FAQPage` JSON-LD. Wraps `Base`. | `title`, `description`, `ogDescription`, `ogImageAlt`, `path`, `sectorLabel`, `heroTitleAccent`, `heroDescription`, `contextEyebrow`, `contextHeading`, `helpsHeading`, `steps: {accent: 'teal'\|'violet'\|'sky'; verb: string; say: string}[]`, `helpsIntro`, `figure: {avif, webp, png, width, height, alt, caption}`, `faqHeading`, `finalCtaSub`, `faq: {question; answer}[]` |

### 2.2 Components (`astro/src/components/`)

| Component | Renders | Real props |
|---|---|---|
| `nav/Nav.astro` | Sitewide sticky header: logo, Products mega-dropdown (button-triggered disclosure, not the legacy dual-purpose link+chevron — see the file's own header comment), top links, search trigger, sign-in/CTA, mobile hamburger + accordion menu. Client `<script>` handles focus trapping, dropdown state, mobile accordion. Data from `data/nav.ts`. | `currentPath: string` (drives `aria-current`) |
| `footer/Footer.astro` | Sitewide footer: trust badges, brand block + social links, link columns, legal/copyright bar. Data from `data/footer.ts`. Deliberately does **not** reproduce the legacy mobile tap-to-expand accordion on column headings (see the file's own comment: every link stays reachable, just always-expanded). | none (`Astro.props` is not destructured in the file — it reads `FOOTER` from `data/footer.ts` directly) |
| `seo/Seo.astro` | Every metadata concern in one place: `<title>`, canonical (derived from `path`, never hand-written), robots, OG, Twitter Card, `article:published_time`/`article:modified_time`, and the JSON-LD `@graph` (prepends `SITE.organizationSchema` to whatever page-specific `schema` is passed). | `title: string`, `description: string`, `path: string`, `image?: string` (default `SITE.defaultOgImage`), `type?: 'website'\|'article'` (default `'website'`), `publishedAt?: Date`, `updatedAt?: Date`, `noindex?: boolean` (default `false`), `schema?: Record<string, unknown>[]` (default `[]`), `ogTitle?: string` (default `title`), `ogDescription?: string` (default `description`), `twitterTitle?: string` (default `ogTitle`), `twitterDescription?: string` (default `ogDescription`) |

---

## 3. What does not yet exist

Stated explicitly so the gap between the architecture contract and the current tree is
visible, not implied.

1. **`components/sections/`, `components/ui/`, `components/motion/` do not exist.**
   `MODERNISATION-ARCHITECTURE.md:52` names these three directories as part of the
   target `src/` layout. Today `astro/src/components/` contains only `nav/`,
   `footer/` and `seo/`. Every page-specific block (hero, CTA band, FAQ accordion,
   step grid, sidebar card) is currently hand-written inline inside a layout's own
   `<style>` block (e.g. `.cmp-btn`, `.gl-card`, `.sec-phase` in `Compare.astro`/
   `Glossary.astro`/`Sector.astro`) rather than a shared, reusable component. This
   is expected at this stage of the migration, not a defect, but it means there is
   currently **zero** shared button/card/badge component — each layout defines its
   own button classes (`.cmp-btn-primary`, `.gl-btn-primary`, `.sec-btn-primary`,
   `.ca-btn-primary` in `Nav.astro`) with near-identical but independently
   hand-typed CSS.

2. **`Page.astro` and `Legal.astro` do not exist; `Compare.astro`, `Glossary.astro`
   and `Sector.astro` do, and are not named in the IA.**
   `MODERNISATION-ARCHITECTURE.md:51` lists the layout set as
   `Base.astro · Page.astro · Article.astro · Legal.astro`. The actual file listing
   of `astro/src/layouts/` is `Base.astro, Article.astro, Compare.astro,
   Glossary.astro, Sector.astro`. `Page.astro` (presumably a generic bespoke-page
   layout) and `Legal.astro` (presumably for `/terms`, `/privacy`, `/cookies`) have
   not been built; nothing in `astro/src/pages/` currently serves those routes.
   Conversely, three layouts exist that the architecture doc's own IA diagram never
   named. Reconcile this drift the next time either document is edited — do not
   silently pick one over the other.

3. **The motion system (`astro/src/scripts/motion.ts`) is written but not wired
   into any page.** `initMotion()` is exported but never imported by `Base.astro`,
   any other layout, or any page — confirmed by a repo-wide search of `astro/src`
   for `initMotion`, which returns only the definition itself. No component or
   page currently sets a `data-motion` attribute anywhere in `astro/src`. See
   `MOTION-AND-INTERACTION.md` §5 for the full detail and the additional gaps
   inside the file itself (the `sticky` primitive has no dedicated implementation;
   `parallax` and `sequence` currently share one code path).

4. **No component in this repo consumes cascade layers via the `components`
   layer.** Every `<style>` block audited in §2 is Astro's default scoped,
   unlayered style. This is consistent with §1.3's guidance ("reach for the
   `components` layer only when a style must be shareable"), not a violation — but
   it means the `components` layer declared in `tokens.css:42` is currently empty
   in practice, and nothing has yet tested that a rule placed there actually
   resolves before `utilities` as designed.

---

## 4. Traceability summary

| Claim | Evidence |
|---|---|
| 2,279 `!important` in legacy `Assets/css/*.css` (34 files) | `node` count script, §1.2; independently corroborated by `specs/architecture/README.md:53` and `tokens.css:6` |
| 0 `!important` declarations in `astro/src` (3 textual, all in one comment) | same script pointed at `astro/src`, §1.2 |
| Cascade layer order `reset, tokens, base, layout, components, utilities` | `astro/src/styles/tokens.css:42` |
| Astro scoped styles are unlayered and outrank all layers | Astro's documented behaviour; confirmed by direct read of all 8 `.astro` files in scope — none declare `<style is:global>` inside the `components` layer |
| 8 `.astro` files in `layouts/` + `components/` (5 + 3) | directory listing, 2026-08-02 |
| `initMotion()` never called anywhere in `astro/src` | grep for `initMotion` across `astro/src`, one match (the definition) |
| No `data-motion` attribute anywhere in `astro/src` | grep for `data-motion` across `astro/src`, matches only inside `motion.ts` itself |
| Tailwind v4 registered but tokens not in `@theme` | `astro/astro.config.mjs:2,27`; `tokens.css:63-67` |
