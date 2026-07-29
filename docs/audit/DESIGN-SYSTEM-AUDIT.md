# Design System & CSS Architecture Audit

Scope: `crowagent-website` (static HTML, Cloudflare Pages, no build step), 41 real pages, audited against the loaded stylesheets, live computed styles on `http://localhost:8092`, and every `.css` file in the repo. Report-only; nothing in the repo was changed. All figures below were produced by parsing the actual files or querying the live DOM — see the file:line references inline.

## EXECUTIVE SUMMARY

This is not one design system, or even three. It is **at least five overlapping ones**: a Tailwind-compiled utility framework (`sovereign-core-v2.compiled.css`, 5,596 lines), a hand-rolled brand-token file (`crowagent-brand-tokens.css`) whose own dark-theme palette is **permanently overridden and never renders**, a "responsive" file that has quietly become the *real* source of truth for colour via a specificity trick, a 1,101-`!important` nav patch file that exists specifically to out-muscle everything else, and 15 fully orphaned page-specific stylesheets (8,778 lines) that ship in the repo but load on zero pages. (1) `--teal` is defined with **five different hex values** across four files, and the one that actually renders sitewide (`#2DD4BF`) is not the one in the token file positioned as canonical (`#0AA88C`/oklch) — confirmed live via `getComputedStyle`. (2) Nav/footer/command-palette/back-to-top CSS is injected by JavaScript at runtime, so **2 of the ~20 stylesheets that load on every page are invisible to any inventory that only reads `<head>`**, including this audit's own starting brief. (3) 1,841 `!important` declarations across the 18 core files, 1,101 of them in one 343-line file, is a specificity war, not a design system. (4) 266 hardcoded colour literals and 376 hardcoded spacing values bypass the ~90 colour and ~30 spacing tokens that already exist. (5) 30 of 41 pages load an identical Google Fonts `<link>` twice, and 31 of 41 pages carry their own bespoke inline `<style>` block on top of all of the above.

---

## 1. Is there one design system or several?

**Several, and they actively fight.** Scanning the 18 stylesheets named in the brief for every `--custom-property` declaration:

- **534 unique custom-property names**, **841 total definitions** (many names redefined per file or per media/theme context).
- **crowagent-brand-tokens.css is a single 13-line, 34KB, unformatted file defining 269 of those 841 definitions** (`C:\Users\bhave\Crowagent Repo\crowagent-website\crowagent-brand-tokens.css:1`). It contains ~68 tokens literally named after their own hex value — `--ca-c-0d2240:#0d2240`, `--ca-c-2ee6c4:#2ee6c4`, `--ca-c-daa520:#daa520`, etc. (same file, one giant declaration block). That is the signature of an automated "wrap every hardcoded hex in a var()" migration script run without any semantic naming pass — it converts hardcodes into tokens in name only.
- **61 token names are defined in more than one file; 51 of those 61 have different values in different files** — genuine conflicts, not harmless redundancy. Full list in the working data; the load-bearing ones:

| Token | Values found | Files |
|---|---|---|
| `--teal` | `#0AA88C` (also `var(--teal-oklch)`) / `#2DD4BF` / `#0CC9A8` **and** `#2DD4BF` again *inside the same file* / `var(--accent)` | `crowagent-brand-tokens.css`, `Assets/css/ultra-premium-responsive.css:239`, `Assets/css/premium-v2.css` (defines it twice, two different hexes), `Assets/css/roadmap-page.css`, `Assets/css/security-page.css` |
| `--bg` | `#FFFFFF` / `#05070E` / `#040E1A` **and** `#05070E` again in the same file / `var(--surface-background)` | `crowagent-brand-tokens.css`, `Assets/css/ultra-premium-responsive.css:208`, `Assets/css/premium-v2.css` (twice), `roadmap-page.css`, `security-page.css` |
| `--cloud`, `--steel`, `--mist`, `--surf`, `--surf2`, `--surf3`, `--surf4`, `--border`, `--border2`, `--border3` | each 3–6 distinct values | same file set |
| `--radius-pill` | `100px` vs `9999px` | `crowagent-brand-tokens.css` vs `roadmap-page.css` / `security-page.css` |
| `--font-mono` | `ui-monospace, SFMono-Regular, ...` vs `'JetBrains Mono', monospace` | `sovereign-core-v2.compiled.css` vs `premium-transformation-2026-05-27.css` |

**Live-verified, the most consequential single finding of this audit:** `Assets/css/ultra-premium-responsive.css:206` scopes its dark palette to the selector `:root[data-theme=dark]`, which has higher specificity than the plain `:root{}` block in `crowagent-brand-tokens.css`. Every page in the site hardcodes `<html data-theme="dark">` (confirmed in `index.html`, `crowmark.html`, `pricing.html`, `about.html`). Result: `ultra-premium-responsive.css`'s values win **on every page, unconditionally**, regardless of load order. Verified with `getComputedStyle(document.documentElement)` on the live server:

```
index.html → crowmark.html:  --teal:#2DD4BF  --bg:#05070E  --surf:#0C1020  --cloud:#EAF1FB  --steel:#B8C4E0  --mist:#8A9BC0
security.html (independently): --teal:#2DD4BF  --bg:#05070E  --surf:#0C1020  --accent:#2DD4BF
```

Neither page ever renders `crowagent-brand-tokens.css`'s dark values (`--teal:#0AA88C`/oklch, `--bg:#040E1A`). **That entire block of the "canonical" token file is dead code, sitewide, in the site's default (and only advertised) theme.** The catch: `ultra-premium-responsive.css` defines *no* `[data-theme=light]` block, so if a user ever toggles to light mode, only `crowagent-brand-tokens.css`'s light values apply and the teal silently changes from `#2DD4BF` to `#0AA88C` — dark mode and light mode are, by construction, two different brand colours, not one palette with computed variants.

**Tokens defined but never used:** not separately re-derived here (out of scope given the size of the utility file, which defines hundreds of Tailwind-generated custom properties like `--tw-*` by design), but the 68 `--ca-c-*` hex-named tokens above are a strong candidate set — a token named after its own value has no reuse purpose and functions purely as an obfuscated hardcode.

**Hardcoded values bypassing tokens:** see §4 and §3 — 266 colour literals, 376 spacing literals, both far exceeding the size of the token vocabularies meant to replace them.

---

## 2. Typography

Parsed every `font-family`, `font-size`, `line-height`, `letter-spacing`, `font-weight` declaration across the 18 files:

| Property | Raw distinct strings | Distinct after stripping `!important` |
|---|---|---|
| `font-family` | 23 | 22 |
| `font-size` | 129 | 108 |
| `line-height` | 64 | 39 |
| `letter-spacing` | 54 | 44 |
| `font-weight` | 21 | 14 |

There is no coherent type scale in the hand-authored layer. `crowagent-brand-tokens.css` *does* define one (`--text-xs` through `--text-6xl`, plus semantic `--text-h1`…`--text-h4`, `--text-body`, `--text-lead`, 13 sizes total) — but the 108 distinct raw font-size values found in the cascade show it is used inconsistently: e.g. `12px`, `12.5px` (appears with and without `!important`, in two different files), `13px`, `14px`, `14.5px`, `16px`, `18px` all sit alongside `var(--text-sm)`, `0.875rem`, `.98rem`, `.95rem` doing the same visual job in different files. `letter-spacing` shows the same value written two ways depending on file — `.12em` (`nav-global-fix`, `premium-v2`, `security-page`) vs `0.12em` (`legal-content`, `roadmap-page`) — purely a per-author formatting habit with zero functional difference, but it defeats any find-and-replace maintenance.

`font-family`: nominally 3 families (display/body/mono) but expressed 23 different ways — bare literals (`'Inter'`, `'Plus Jakarta Sans'`), var() with fallback baked in twice at different points (`var(--font-display, 'Plus Jakarta Sans', sans-serif)` in `security-page.css` vs bare `var(--font-display)` in `sovereign-core-v2.compiled.css`), a completely separate `--nb-display`/`--nb-body` pair in `Assets/css/nebula-livepanels.css`, and Tailwind's auto-generated system-font stack fallbacks.

**Self-hosted font set** (`Assets/css/fonts-selfhosted.css`, 88 lines): Inter 400/500/600, Plus Jakarta Sans 600/700/800, plus a metrics-matched `'Jakarta Fallback'` local override to prevent CLS on the hero — this file is genuinely well engineered (see §"What is genuinely good"). But it is **incomplete**: `--font-mono` resolves to `'JetBrains Mono'` throughout `roadmap-page.css`, `legal-content.css`, `premium-transformation-2026-05-27.css` — and there is no self-hosted `@font-face` for it anywhere. It is fetched from Google Fonts on every page that needs it, defeating the file's own stated purpose ("skip the render-blocking handshake").

**Duplicate font requests, verified across all 41 pages:** 30 of 41 pages (`404.html`, `about.html`, `terms.html`, `cookies.html`, every blog post, etc.) load the byte-for-byte identical `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap` **twice** in the same `<head>` — two separate `<link>` tags, same href. That's on top of Inter/Plus Jakarta Sans already being self-hosted at weights 400/500/600/600/700/800 — meaning those two families are fetched from Google Fonts *and* self-hosted *and* fetched twice, for a site whose self-hosting migration comment explicitly cites eliminating "the ~500ms render-blocking handshake."

---

## 3. Spacing and rhythm

**376 distinct raw `padding`/`margin`/`gap` values** across the 18 files. Two incompatible spacing systems sit side by side:

1. A Tailwind-generated multiplier system in `sovereign-core-v2.compiled.css`: `calc(var(--spacing) * 12)`, `calc(var(--spacing) * 4)`, `calc(var(--spacing) * 20)` etc. — internally consistent, but opaque to anyone not reading the compiled Tailwind config.
2. A hand-authored `--space-N` token scale in `crowagent-brand-tokens.css` (`--space-0` through `--space-40`, ~24 steps) that the hand-written files use **inconsistently** — `var(--space-2)` appears 23 times, but literal `8px` (the same value) appears 14 times, `0.5rem` (also the same value) 7 more times, all in the same cascade doing the same job. `1.5rem` (`--space-6`) appears as a raw literal 8 times and as the token 12 times — roughly 40% of its uses bypass the token that exists for exactly that value.

No single-file offender here the way `--teal` has one for colour; this is diffuse authoring-discipline drift across every hand-written file, most concentrated in `nav-global-fix-2026-05-27.css` and `premium-v2.css`, both of which predate the `--space-*` scale being adopted more broadly (see §7 dates).

---

## 4. Colour

**266 distinct hardcoded hex/rgb/hsl colour literals** appear directly inside colour-bearing declarations (`color`, `background`, `border`, `box-shadow`, `fill`, etc.) across the 18 files — despite ~90 dedicated colour tokens existing in `crowagent-brand-tokens.css`. Top offenders by raw occurrence count: `#fff` (36×, `premium-v2.css` + `roadmap-page.css`), `rgba(255,255,255,0.72)` (16×), `rgba(12,201,168,.18)` (8×, i.e. the "canonical" teal fragment), `rgba(255,255,255,.02)` (7×). Critically, teal shows up as **two incompatible hardcoded fragments** depending on file — `rgba(12,201,168,…)` (the brand-tokens teal, `#0CC9A8`) in `nav-global-fix`/`premium-v2`, and `#2DD4BF` (the *actually-rendered* live teal) in `nav-global-fix`/`ultra-premium-responsive` — meaning even after fixing the token conflict in §1, dozens of hardcoded rgba fragments would keep painting the *old* teal because they never referenced the token at all.

**WCAG contrast — computed, not eyeballed.** Using the live, rendered dark-theme values (confirmed via `getComputedStyle` on `crowmark.html` and `security.html`) and the relative-luminance formula:

| Pair (dark theme, as rendered) | Values | Ratio | Verdict |
|---|---|---|---|
| body text (`--cloud`) on `--bg` | `#EAF1FB` / `#05070E` | 17.71 | PASS |
| secondary text (`--steel`) on `--bg` | `#B8C4E0` / `#05070E` | 11.51 | PASS |
| muted text (`--mist`) on `--bg` | `#8A9BC0` / `#05070E` | 7.22 | PASS |
| muted text on `--surf` | `#8A9BC0` / `#0C1020` | 6.78 | PASS |
| muted text on `--surf2` | `#8A9BC0` / `#121734` | 6.29 | PASS |
| disabled text (`--dim-c`) on `--bg` | `#7E93B5` / `#05070E` | 6.45 | PASS |
| accent (`--teal`) on `--bg` | `#2DD4BF` / `#05070E` | 10.81 | PASS |

Dark mode — the default and only theme most visitors see — passes AA comfortably everywhere tested. **Light theme fails**, and light theme is reachable from the site's own theme toggle:

| Pair (light theme — `crowagent-brand-tokens.css` only, since `ultra-premium-responsive.css` defines no light override) | Values | Ratio | Verdict |
|---|---|---|---|
| accent (`--teal`) body text on `--bg` | `#0AA88C` / `#FFFFFF` | **3.00** | **FAILS AA body (needs 4.5); large-text only** |
| accent (`--teal`) on `--surf` | `#0AA88C` / `#F7F9FC` | **2.85** | **FAILS even the 3.0 large-text floor** |

Any teal-coloured link, eyebrow label, or stat highlight rendered at normal body size in light mode is a real, numbered AA failure. Everything else in light mode (body/secondary/muted/disabled text) passes (5.4–16.5).

A DOM-wide automated scan for other failures was attempted but produced too many false positives from gradient-clipped headings (`background-clip:text` with `color:transparent`, common in the hero) and gradient-background buttons (no solid `background-color` for the script to detect) to be trustworthy without manual triage per element — flagged here as a methodology limitation, not a clean result.

---

## 5. Component duplication

`.ca-card` is the closest thing to a canonical card class, and it is touched (defined, extended, or overridden) in **10 different files**: `Assets/css/ca-primitives.css`, `nav-global-fix-2026-05-27.css`, `premium-gloss-2026-05-31.css`, `premium-transformation-2026-05-27.css`, `resources-page.css`, `roadmap-page.css`, `sovereign-core-v2.compiled.css`, `sovereign-core-v2.css`, `ultra-premium-interactions.css`, `ultra-premium-responsive.css`. That is one component with ten places its rules can be won or lost, none of them a single source of truth.

Beyond that, the codebase does not reuse `.ca-card` — it reinvents it. Distinct "card" class families found: `.ca-card`, `.sv-card`, `.icard`, `.pcard`, `.xcard`, `.tl-card`, `.tm-card`, `.tm-toc-card`, `.pv-toc-card`, `.sec-toc-card`, `.ce-note-card`, `.fill-card`, `.ms-card`, `.pricing-card`, `.pricing-enterprise-card`, `.glossary-card`, `.article-card`, `.blog-card`, `.related-card`, `.about-card`, `.founder-card`, `.f10-team-card`, `.f10-mvv-card`, `.f10-office-card`, `.contact-card`, `.sec-aes-card`, `.sec-cred-card`, `.sf19-cred-card`, `.ca-roadmap-card`, `.product-hub-card`, `.changelog-card`, `.resource-card`, `.trust-card`, `.ca-tool-card`, `.pv-subcard`, `.sec-subcard`, `.sec-panel`, `.pv-panel`, `.blog-stripe-related-card` — **37 distinct card-family class names**, most defined once each, most page- or section-scoped rather than shared.

Same pattern for chips/badges: chips — `.pv-chip`, `.sec-chip`, `.nsp-chip`, `.roadmap-item__chip`, `.coming-soon-chip`, `.faq-chip`, `.hero-reg-chip`, `.footer-free-chip`, `.footer-live-chip`, `.email-chip`, and `.intg-chip`; badges — `.ca-badge`, `.sv-badge`, `.lc-badge`, `.card-badge`, `.article-badge`, `.terms-badge`, `.sec-badge`, `.sec-iso-badge`, `.pgc-badge`, `.ca-popular-badge`, `.toggle-savings-badge`, and (see below) `.ca-badge-beta`/`.ca-badge-dev`.

**`.intg-chip` is not in any of the 18 stylesheets at all.** It lives in a `<style>` block embedded directly in `integrations.html` (`integrations.html:49-65`) — a fourth, page-local implementation of the chip pattern that never touches the shared CSS files.

**`.ca-badge-beta` / `.ca-badge-dev` are a third, independent badge system**, injected as a runtime `<style id="ca-status-badge-css">` block by `js/nav-inject.js:126-145` — hardcoded hex colours (`#A78BFA`, `#0B0620`, `#1E1608`, `#FFC24D`, `#8A6100`, `#3A2A05`, `#7A5400`, `#1A1305`, `#FFF6E3`) with `!important`, none of them tokens, entirely outside the CSS-file architecture this audit was scoped to. (Contrast checked: both pass AA — 7.27 and 11.14 — this is a duplication/architecture problem, not a legibility one.)

**Two classes the brief asked about turned out not to exist as claimed:** `.intg-chip` exists (confirmed above, but inline in HTML, not CSS) and `.nb-card` **does not exist as a class anywhere** — `--nb-card` is a *custom property* (a gradient value: `Assets/css/premium-v2.css:368` — `--nb-card:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012))`), not a component class. `.ca-product-capsule` and `.nb-conn` are real and each defined in 1–3 files (`nav-global-fix`, `ultra-premium-responsive`, `premium-transformation` for the capsule; `premium-v2` alone for `.nb-conn`) — genuinely distinct, not duplicated.

---

## 6. Dead and conflicting CSS

**File-level dead code, the strongest finding in this section:** 15 CSS files sit in `Assets/css/` with header comments explicitly claiming ownership of a specific page or section, and are referenced by **zero** of the 41 real HTML pages (verified with an exhaustive grep of every page against every filename — not a sample):

| File | Lines | Comment claims |
|---|---|---|
| `sovereign-primitives.css` | 1,337 | (core primitives, largest orphan) |
| `blog-article.css` | 1,295 | blog article styling |
| `cookies-page.css` | 914 | `/cookies` |
| `terms-page.css` | 734 | `/terms` |
| `nav-footer-sf21.css` | 690 | nav/footer patch |
| `tool-page.css` | 595 | tool pages |
| `pricing-sf16.css` | 548 | `/pricing` |
| `blog-post-sf-enh6.css` | 491 | blog post enhancement |
| `ca-primitives.css` | 420 | primitives |
| `page-archetype-unify.css` | 442 | page archetype unification |
| `contact-page.css` | 335 | `/contact` |
| `page-fixes-sf22.css` | 356 | page fixes |
| `motion-system.css` | 374 | motion system |
| `consistency-sf41.css` | 164 | consistency patch |
| `always-playing-sf23.css` | 83 | — |
| **Total** | **8,778 lines** | |

`contact-page.css` says "styling for /contact" in its own header comment; `contact.html`'s actual `<link>` list (checked directly) does not include it. Same story for `pricing-sf16.css`↔`pricing.html`, `terms-page.css`↔`terms.html`, `blog-article.css`↔every blog page, `cookies-page.css`↔`cookies.html`. These are not files awaiting a future page — the pages they name already exist and ship without them.

Separately, `styles.css` at the repo root is **34,050 lines** and loads on exactly one file in the whole repo: `stripe-sample/index.html` (a vendor sample page, not one of the 41 real pages). `styles.min.css` is a 0-byte empty stub. `styles.purged.css` is 12 lines. None of the three are part of the live site.

**Selector-level dead code within the 18 live files:** matching every class selector against every `class="..."` attribute in all 41 HTML pages *and* every class string built by JavaScript (both `classList.add()` calls and HTML-string template literals in `js/nav-inject.js` and friends, which is how nav/footer/badges are injected) found **573 of 1,209 distinct class selectors (47%) with zero match anywhere**. Filtering out matches that live *only* inside the auto-generated Tailwind utility bundle (`sovereign-core-v2.compiled.css` — expected bloat for an unpurged utility build, lower priority) leaves **328 dead classes that touch at least one hand-authored file**:

| File | Dead-class hits |
|---|---|
| `nav-global-fix-2026-05-27.css` | 117 |
| `premium-v2.css` | 64 |
| `security-page.css` | 56 |
| `ultra-premium-responsive.css` | 20 |
| `premium-transformation-2026-05-27.css` | 17 |
| `premium-gloss-2026-05-31.css` | 16 |
| `print.css` | 15 |
| `product-carousel-2026-05-26.css` | 11 |
| `signature-atmosphere-2026-05-26.css` | 10 |

`nav-global-fix-2026-05-27.css` alone (343 lines) has 117 dead-class hits — roughly a third of its selector surface targets markup that does not exist on any current page.

**A whole feature's CSS with no corresponding markup or script anywhere:** `Assets/css/signature-atmosphere-2026-05-26.css` (134 lines, loaded on 31 pages) defines `.atmos`, `.atmos__aurora`, `.atmos__beam`, `.atmos__canvas`, `.atmos__grid`, `.atmos__vignette` — a BEM-style background-effect component. None of these class names appear in any HTML file's `class=` attribute, and none are injected by any JS file (checked `js/` recursively). The wrapper element the whole effect depends on (`.atmos`) is never created. 31 pages pay to download and parse a stylesheet whose primary component never mounts.

**Confusing/inert self-reference:** `security-page.css:9-11` and `roadmap-page.css` both declare, inside `@layer brand { :root { ... } }`: `--teal-40: var(--teal-40); --teal-30: var(--teal-30); --teal-06: var(--teal-06);` — a token defined as a reference to itself. Because `crowagent-brand-tokens.css` defines the same names *unlayered* (outside any `@layer`), and unlayered rules always beat layered ones regardless of order, these self-references are inert (they never win, so never actually resolve to invalid/`unset`) — but they are unreadable at a glance and clearly not intentional.

**`!important` — raw, verbatim counts** (`grep -c '!important'`, cross-checked against a full CSS parse):

| File | `!important` count |
|---|---|
| `nav-global-fix-2026-05-27.css` | **1,101** |
| `sovereign-core-v2.compiled.css` | 269 |
| `premium-transformation-2026-05-27.css` | 209 |
| `ultra-premium-responsive.css` | 72 |
| `premium-gloss-2026-05-31.css` | 54 |
| `print.css` | 26 |
| `roadmap-page.css` | 25 |
| `resources-page.css` | 25 |
| `premium-v2.css` | 19 |
| `crowagent-brand-tokens.css` | 12 |
| `nebula-shotpanels.css` | 7 |
| `nebula-livepanels.css` | 7 |
| `legal-content.css` | 5 |
| `ultra-premium-interactions.css` | 4 |
| `signature-atmosphere-2026-05-26.css` | 4 |
| `security-page.css` | 1 |
| `product-carousel-2026-05-26.css` | 1 |
| `fonts-selfhosted.css` | 0 |
| **Total across 18 files** | **1,841** |

**1,101 `!important` in a single 343-line file is not a design system, it is a specificity war**, and the file's own code comments say so explicitly: `nav-global-fix-2026-05-27.css:74` — *"nav-global-fix already uses `!important` on its canonical rules"* — meaning the team's own working assumption is that this file wins by force, not by cascade design. 478 individual rules in that file carry at least one `!important`.

---

## 7. Cascade order risk

The physical `<link>` order in a representative page (`404.html`, `contact.html`) is: `fonts-selfhosted` → Google Fonts (×2, see §2) → `sovereign-core-v2.compiled` → `signature-atmosphere` → `product-carousel` → `premium-transformation` → `nav-global-fix` → `premium-gloss` → `crowagent-brand-tokens` → `ultra-premium-interactions` → `ultra-premium-responsive`. **The "canonical" token file loads second-to-last**, after five layers of component/effect CSS that consume its tokens via `var()`. This mostly doesn't matter for `var()` resolution (which is late-bound) but matters enormously for which `:root{}` block *wins* when two files define the same custom property — and per §1, `ultra-premium-responsive.css` wins for colour regardless, by specificity, not just order.

**The real, live cascade order is not the order in the HTML source**, because two stylesheets are injected by JavaScript and land wherever `document.head.appendChild()` puts them at runtime — confirmed by reading `document.styleSheets` live on the running server:

```
index.html order (live): fonts-selfhosted, css2(Google), sovereign-core-v2.compiled, signature-atmosphere,
  premium-transformation, nav-global-fix, premium-gloss, crowagent-brand-tokens, ultra-premium-interactions,
  ultra-premium-responsive, nebula-livepanels, [inline], sovereign-cmdk, [inline], back-to-top, [inline], [inline]
```

`sovereign-cmdk.css` and `back-to-top.css` are **not in the brief's list of 18 stylesheets and not in any page's static `<head>`** — they are injected sitewide by `js/nav-inject.js:106-115` and `js/modules/sf21-back-to-top.js:16-19` respectively, and both land at the *very end* of the stylesheet list, after everything else, on every page. `sf21-back-to-top.js`'s own code comment states the intent plainly: *"Appearance: self-injects `/Assets/css/back-to-top.css` (loaded last → wins)"* — i.e., load-order-as-specificity-hack is a deliberate, documented pattern in this codebase, not an accident. That means **the actual number of stylesheets governing every page is 20, not 18**, and the two missing from inventory are, by design, the ones with final say.

`nav-global-fix-2026-05-27.css` and `premium-gloss-2026-05-31.css` have a *third* behaviour layered on top: `nav-inject.js:62-98` checks whether a static `<link>` for each already exists in `<head>`; if yes, it patches the `href` in place (no reorder, no refetch — a deliberate anti-FOUC fix per the code comment at `nav-inject.js:68-74`); if no, it `appendChild`s a fresh `<link>` at the end of `<head>`. **This means their effective cascade position is not constant across the site — it depends on whether a given page's HTML author remembered the static tag.** 39 of 41 pages have the static tag (consistent position); the 2 that don't get it appended last (highest-precedence position), silently changing which rules win on exactly those two pages relative to the other 39.

There is also a runtime-injected, unlayered `<style id="ca-status-badge-css">` block (§5) that lands after all file-based stylesheets on every page — it wins over anything in the 20 files by simple source order, which is presumably why it needed `!important` on every declaration to be safe regardless.

---

## 8. Per-page stylesheets

| File | Pages | Justified? |
|---|---|---|
| `legal-content.css` | 3 (terms, privacy-adjacent, cookies) | Yes — genuinely shared prose/legal-layout rules across 3 legal pages; reasonable to keep separate from the marketing bundle so marketing pages don't pay for it. |
| `nebula-shotpanels.css` / `nebula-livepanels.css` | 2 / 1 | Yes — both are extensively self-documented (see §"good"), functionally distinct (per-screenshot overlay vs homepage showcase entrance animation), and deliberately kept apart per their own header comments ("same technique as ... livepanels"). Not duplication, parallel implementation of a related but different job. |
| `print.css` | 2 | Yes — print stylesheets are conventionally separate; low risk. |
| `resources-page.css`, `roadmap-page.css`, `security-page.css` | 1 each | **Borderline.** Each re-declares an entire local token override block (`@layer brand { :root { --bg: var(--surface-background); --teal: var(--accent); ... } }`) instead of just writing page-specific component rules against the existing tokens — this is where the inert self-referencing tokens in §6 live. The override layer adds a redundant indirection hop (`--bg` → `--surface-background` → the real value) for no apparent benefit over using `--surface-background` directly, and duplicates ~15–20 token names already defined once in `crowagent-brand-tokens.css`. Folding the *component* rules into a shared file while dropping the redundant token re-declaration would remove real duplication without losing the page-specific styling. |

**Beyond the brief's list of 18:** 15 more page-scoped files (§6, 8,778 lines) exist for exactly this same purpose — one file per page/section — and are **completely unloaded** on every page whose name they carry. Whatever authored these clearly intended a legitimate per-page pattern (matching the resources/roadmap/security-page precedent above); they were simply never wired up, or were wired up and then orphaned when the page was rebuilt. Either way, the codebase already has 8 examples of "per-page CSS done and shipped" (legal-content ×3, nebula ×3, print ×2 pages, resources/roadmap/security ×3) sitting alongside 15 examples of "per-page CSS written and never shipped" — the pattern itself is sound, the execution is inconsistent.

**Also outside the brief's scope entirely:** 31 of 41 pages carry at least one inline `<style>` block in the page source itself (`index.html` has 3, several blog posts have 2), including the `.intg-chip` component (§5) that exists nowhere else. This is a further, un-auditable-by-file-list layer of the same per-page-styling impulse.

---

## WHAT IS GENUINELY GOOD

- **`Assets/css/fonts-selfhosted.css`** is excellent engineering: self-hosted subsets, `font-display: swap`, and a metrics-matched `'Jakarta Fallback'` face with hand-computed `size-adjust`/`ascent-override`/`descent-override` values, documented with the actual font-metrics math and the measured CLS improvement (0.106 → fixed) in the file's own comments. This is the single best-documented file in the codebase. Its only real flaw is incompleteness (JetBrains Mono never got self-hosted) and the duplicate Google Fonts `<link>` undermining it at the page level — the file itself is not the problem.
- **`Assets/css/nebula-shotpanels.css` and `nebula-livepanels.css`** are unusually well-documented for what they do and why (the "why fake data would be dishonest, so here's what we do instead" reasoning in the header comments is a genuinely good practice worth preserving as a pattern, not just the code).
- **The `--space-*` scale, `--text-h1`…`--text-h4` semantic type tokens, and the `--surface-1`…`--surface-elevated` / `--text-primary`…`--text-disabled` semantic aliasing layer in `crowagent-brand-tokens.css`** are a well-designed *intended* system — the problem is adoption and the dark-theme override collision (§1), not the design of the scale itself. A future rewrite should keep this naming layer and fix who is allowed to write to it, not replace it.
- **The self-documented rationale for JS-injected CSS** (`nav-inject.js`'s inline comments explaining *why* each injection exists — FOUC avoidance, idempotency, single-source-of-truth `?v=` versioning to stop 60 pages drifting on stale cache-busters) shows real engineering discipline in intent, even though the net effect (§7) is an unpredictable cascade. The *versioning* mechanism itself (`href` patched in place rather than re-fetched) is worth keeping when the architecture is consolidated.
- **WCAG contrast in the default dark theme is genuinely solid** (§4) — every body/secondary/muted/disabled/accent text-on-background pairing tested passes AA, several by a wide margin (up to 17.71:1). Whoever chose the live `#2DD4BF` teal and the `#EAF1FB`/`#B8C4E0`/`#8A9BC0` text ramp got the *accessibility* math right even though it was never reconciled with the "canonical" token file. Any consolidation should audit which palette to keep by more than just "which file says CANONICAL in its name" — on the evidence here, the un-appointed one (`ultra-premium-responsive.css`'s dark block) is the one that actually ships and actually passes.
