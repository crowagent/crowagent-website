# C-1 / C-2 / C-5 — Deprecated-class HTML migration research
**Investigator:** read-only, 2026-05-21
**Authority:** `/docs/design-system-registry.md` (decision of record 2026-05-21)
**Scope:** production HTML only (root + `blog/`, `tools/`, `glossary/`, `products/`, `intel/`). Excludes `_archive/`, `node_modules`, `audit-results`, `audit-screenshots*`, `debug-screenshots`, `playwright-report`, `test-results`, `coverage`.

---

## 1. Class-by-class HTML usage count

Grep methodology: `grep -rE 'class="[^"]*\b<TOKEN>\b'` (word-boundary, excludes the dirs above). Counts are HTML-attribute *lines*, not DOM nodes (one line typically = one element).

### Sovereign canonical (target) — already in use
| Class | Count | Element types |
|---|---:|---|
| `sv-card` | 89 | `div` 66, `aside` 7, `a` 6, `article` 4, `section/li/header` etc. ≈ 6 |
| `sv-container` (`--wide`/`--standard`/`--text`) | 200+ (in nav-injected + per-page) | mostly `div` |
| `sv-btn` family | 60+ (per audit C-2) | `a`, `button` |

### Deprecated families — bare-token counts
| Class (deprecated) | Replacement | HTML hits | Hot files |
|---|---|---:|---|
| `.btn` (bare, not `.sv-btn` / `.btn-*`) | `.sv-btn` | **40** | site-wide |
| `.btn-primary` (bare, not `.sv-btn--primary`) | `.sv-btn .sv-btn--primary` | **0** | already migrated |
| `.btn-secondary` | `.sv-btn .sv-btn--secondary` | **0** | already migrated |
| `.btn-primary-v2` | `.sv-btn .sv-btn--primary` | **1** (in `js/nav-inject.js` template + injected `tool-teaser.js` + `homepage-compliance-widget.js`) | JS-injected only |
| `.btn-v2`, `.is-cta-btn-*`, `.ca-btn-v2*`, `.nf-btn*` | `.sv-btn` | **0** | DEAD in HTML; CSS already deleted per registry |
| `.card` (bare token, excludes `sv-card`/`f10-related-card`/`card--*`/page-bespoke `*-card`) | `.sv-card` | **~0** (every `.card` hit overlaps a more-specific family) | n/a |
| `.card-1` … `.card-6` | `.sv-card` | **0** | clean |
| `.triple-card` | `.sv-card` | **2** (one in `index.html`, one in mockup) | low blast radius |
| `.bento-card`, `.premium-card` | `.sv-card` | **0** in production HTML (only in `_archive`) | already done |
| `.f10-related-card` (+ `--cyber/cash/mark/esg/core/csrd`) | `.sv-card` | **90** lines | 6 product pages: `crowagent-core`, `crowcyber`, `crowcash`, `crowmark`, `crowesg`, `csrd` (15 lines each) |
| `.card--cyber/cash/mark/esg/core/csrd` | `.sv-card` (monochrome) | **5 each = 30** total | each on its own product hub anchor |
| `.ca-grid` | `.sv-grid` | **3** | scattered |
| `.u-grid-3` | `.sv-grid` | **1** | one tool methodology page |
| `.u-grid-4` | `.sv-grid` | **0** | clean |
| `.container` (bare, not `.sv-container`) | `.sv-container--*` | **238** | most pages; co-occurs with `wrap` |
| `.wrap` (bare) | `.sv-container--*` | **246** | site-wide; classic `class="wrap container"` pair |
| `.ca-icon` | `.sv-icon` | **0** | clean |

### Variant shape across the broader card namespace (informational)
`ms-card-lift` 143 (motion modifier — PRESERVED), `sv-card` 89, `blog-stripe-related-card` 60, `f10-related-card-*` (name/desc/title slots) 70, `sv-card--elevated` 24, `sv-card--accent` 24, `related-card` 24, `pw-sf21-card` 24, `how-scene-card` 24, `article-card-*` 40, `gloss-card-*` 19, `glossary-card-*` 12, `pricing-toggle-btn`/`tab-btn`/`seg-btn` etc.

These are NOT in the registry deprecation list — they are page-bespoke families that audit C-1 calls out separately. They are **out of scope** for this migration sprint.

---

## 2. Semantic-element analysis for `.sv-card` (C-5)

The C-5 finding (inconsistent semantic markup) maps to the 73 `div.sv-card` vs 0 `article.sv-card` claim. Today's actual distribution (post-recent fixes):

| Host element | Count | Should it be `<article>`? |
|---|---:|---|
| `<div>` | 66 | **conditional** — see decision tree below |
| `<aside>` | 7 | NO — keep `<aside>` (At-a-glance side rails on all 6 tools + contact office card). These are correctly semantic and a registry-compliant variant. |
| `<a>` | 6 | NO — keep `<a>` (interactive product nav cards). Tag the parent `<nav>` or `<ul>` instead. |
| `<article>` | 4 | YES — already correct (`about.html` company-detail trio + company-details). |
| `<section>`/`<li>`/`<header>` (rare) | ~6 | mostly NO — `<li>` is correct inside a `<ul>` of cards; `<section>` requires its own heading and is usually inappropriate. |

### Decision tree — `div.sv-card` → ?
1. Card is a **standalone unit of content** with a heading (blog excerpt, glossary entry, product feature, methodology step, partner profile, testimonial, FAQ item)? → `<article>`.
2. Card is a **complementary aside / at-a-glance / tip box / note** alongside main content? → `<aside aria-label="...">` (already in use on 7 surfaces; pattern works).
3. Card is a **clickable navigation tile** that takes you elsewhere (cross-product card, hub link, related-product strip)? → keep `<a class="sv-card">`. Optionally wrap in `<nav aria-label="Related products">`.
4. Card is a **list item** inside an explicit list (`<ul>` of equivalent cards)? → `<li class="sv-card">`.
5. Card is **purely decorative or layout-only** (no heading, no self-contained meaning)? → keep `<div>`. Examples: stat cards, badge wrappers, icon-only cards.

Per-file `div.sv-card` audit (sample, blocking-set):
- `about.html` — 3 of 6 already `<article>`. The remaining 3 (`accent-teal about-card-spaced`) are values cards; they have h3 + body and **should become `<article>`** (criterion 1).
- `contact.html` — 3 "ways to contact us" cards (`<div>`, with h3 + body) → `<article>`. The "office and contact info" `<aside>` is correct as-is.
- `glossary/*.html` (8 files) — `gloss-card--lead` is a hero summary card; `<aside>` is the better fit (criterion 2) because the H1 lives outside.
- 6 product hub pages — the related-product strip cards are `<a class="f10-related-card">`; after migration they should be `<a class="sv-card sv-card--interactive">` (criterion 3, keep `<a>`).
- Blog post cards (`blog/ppn-002-social-value-explained.html` etc.) — `<article>` is correct (criterion 1).

---

## 3. Migration safety ranking — order to retire FIRST

Ranked from **lowest risk** to **highest risk** based on (a) HTML hit count, (b) JS-hook coupling, (c) selector reach in CSS, (d) presence of a working alias rule that survives migration.

| Rank | Class family | Hit count | JS coupling | CSS alias today | Risk |
|---:|---|---:|---|---|---|
| 1 | `.ca-icon` | 0 | none | aliased | **TRIVIAL** — already done, just delete alias |
| 2 | `.u-grid-4` | 0 | none | aliased | **TRIVIAL** |
| 3 | `.bento-card`, `.premium-card`, `.btn-v2`, `.is-cta-btn-*`, `.ca-btn-v2*`, `.nf-btn*`, `.btn-primary`, `.btn-secondary`, `.card-N` | 0 (HTML) | check JS injectors | alias may remain | **TRIVIAL** — registry says "DEAD CSS"; spot-confirm zero HTML hits, then delete CSS |
| 4 | `.triple-card` | 2 | `cinematic-init.js:170` references `.triple-card` in selector list | aliased | **LOW** — 2 manual edits + 1 JS selector edit |
| 5 | `.card--cyber/cash/mark/esg/core/csrd` (palette colour modifiers, monochrome neutralised) | 30 lines | none | already neutralised | **LOW** — can strip the suffix tokens mechanically since the colour is now monochrome; sv-card alone is equivalent |
| 6 | `.u-grid-3` | 1 | `scripts.js:1415, 1430` selector lists includes `.u-grid-3` | aliased | **LOW** — 1 HTML edit + 2 JS selector edits (or keep JS list with `.sv-grid` added) |
| 7 | `.ca-grid` | 3 | none direct | aliased | **LOW** — 3 mechanical HTML edits |
| 8 | `.f10-related-card` (+ slots `name`/`desc`) | 90 lines | none — pure CSS lookups | dedicated CSS block 14088-14108 | **LOW-MEDIUM** — 6 files, identical pattern, sed-replaceable per-file. Slots (`-name`, `-desc`) become `sv-card__title` / `sv-card__body` (C-5 fix). Visual reconciliation needed on related strip. |
| 9 | `.btn` (bare token, 40 hits) | 40 | site-wide; `scripts.js:1573` references `.btn` in disabled-state selector; `crowagent.test.js`, `scripts.test.js`, `lib/form-submit.js` reference `.btn`, `.btn-form`, `.notify-btn` | base class still defined `styles.css:341` | **MEDIUM** — high count + JS selectors. Add `.sv-btn` to every selector list before removing `.btn` selector. |
| 10 | `.container`, `.wrap` (238 + 246 = **484 hits**) | 484 | `js/modules/e-batch-runtime.js:53` matches `main .wrap`; `nav-inject.js:236` writes `class="wrap sv-container sv-container--wide sv-nav-row"` | aliased identically (styles.css:33312) | **MEDIUM-HIGH** — highest count, hardest to verify visually because container box-model is invisible. Aliases already make `.container` == `.sv-container--wide`, so JS+CSS work today. **Defer until last.** |

**Recommended retirement order (first → last):** Rank 1-3 (trivial CSS-only deletes) → 4 (`triple-card`) → 5 (`card--*` palette suffixes) → 6-7 (grids) → 8 (`f10-related-card`, this is also the C-5 BEM fix) → 9 (`.btn`) → **10 (`.container`/`.wrap` last)**.

---

## 4. JS-side risk audit (full)

Files with selectors that read/write deprecated classes. **Every one needs the new class added BEFORE the old class can be deleted from CSS or HTML.**

### Direct selector references
| File | Line(s) | Selector | Required mitigation |
|---|---|---|---|
| `scripts.js` | 1415, 1430 | `.fade-in-up, .sector-grid, .tc-grid, .hw-grid, .u-grid-3, .methodology-4col, .stats-grid` | Replace `.u-grid-3` with `.sv-grid` in the selector list before HTML migration. |
| `scripts.js` | 1573 | `'button[type="submit"], .btn-form, .notify-btn, #cpSubmitBtn'` — `.btn` referenced in adjacent comment at 1553 | Audit `.btn-form` / `.notify-btn` — these are form-bespoke, not in the deprecation set. Safe. |
| `js/modules/cinematic-init.js` | 170 | `.bento-card, .product-full-block, .framework-card, .sector, .tc, .hw, .uc, .u-card, .triple-card` | Add `.sv-card` to list; can keep `.triple-card` until rank-4 retired. |
| `js/modules/e-batch-runtime.js` | 53 | `main .legal-content, main .legal-page, main article, main .wrap` | Add `main .sv-container` to selector list before retiring `.wrap`. |
| `js/modules/lottie-cta.js` | 155 | `document.querySelectorAll('.btn-primary-v2')` | Replace with `'.sv-btn--primary, .btn-primary-v2'` before retiring v2. |
| `js/modules/csrd-wizard.js` | 125, 154 | `#csrd-email-form .btn[type="submit"]`, `.btn-form` | Add `.sv-btn` co-selector OR migrate to data attribute. |
| `js/modules/blog-reading-time.js` | 48, 67, 82, 88 | `.card-meta-read`, `.card-preview`, `.card-meta` | These are blog-bespoke slots (not in registry deprecation set). Safe. |
| `js/nav-inject.js` | 236, 302, 341 | Templates write `class="wrap sv-container sv-container--wide sv-nav-row"` and `class="btn btn-sm btn-primary-v2 nav-cta"` | Update template strings to emit canonical classes once C-2 ships. |
| `js/tool-teaser.js` | 68, 85 | Injects `class="btn btn-md btn-primary-v2"` and `class="btn btn-lg btn-primary-v2"` | Update injection strings same time as nav-inject. |
| `js/homepage-compliance-widget.js` | 83 | Injects `'a', 'btn btn-md btn-primary-v2'` | Update injection string. |
| `lib/form-submit.js` | 111 | `form.querySelector('[type="submit"], .btn-form, .notify-btn')` | `.btn-form`/`.notify-btn` are bespoke; safe. |
| `chatbot.js` | 487, 494, 495, 611 | `els.btn` is a **local variable** (NOT a selector). Safe. |

### Test files (these protect us — don't change them blindly, change in lockstep with HTML)
- `tests/sf46-foundations-probe.spec.js` — asserts `.sv-card` + `.about-card` co-exist on `about.html` (the about-card fallback is the safety net during migration).
- `tests/sf46-sovereign-drift-detector.spec.js:97-121` — asserts `.sv-btn` / `.sv-card` / `.sv-grid` rules exist. **Keep.**
- `tests/sf46-visual-reconciliation.spec.js:102, 169-184` — visual asserts on `.sv-btn--primary, a[class*="btn-primary"]` and `.sv-card` cards. Keeps backward compat while migration runs.
- `tests/visual-audit.spec.js:42, 74` — locators query `.sv-btn--primary, .btn-primary-v2` and `.sv-card, [class*="-card"]`. **Compatible with migration in either direction.**
- `tests/sf46-p2c-rollout.spec.js`, `tests/sf46-b9-probe.spec.js`, `tests/sf46-p2mno-probe.spec.js` — assert legacy `.ca-btn-v2` / `.ca-card-v2` / `.ca-grid--cards`. These are NOT in the registry deprecation set; leave alone.
- `tests/sf46-p2e-a11y.spec.js`, `scripts/sf41-validate.js`, `scripts/sf41-validate-2.js`, `scripts/sf6-button-debug*.js` — selectors hit `.ca-btn-v2`, `.btn-primary-v2`. Update **after** JS injectors switch to `.sv-btn--primary`.

### Existing codemod
`tools/migrate-to-sovereign.js` (582 LoC) already contains the complete BUTTON_MAP, CARD_CONTAINER_MAP, RGBA_MAP, HEX_MAP. It runs `--dry-run` by default and `--apply` mutates files; it is documented idempotent. **Use it.** This is the canonical execution path for ranks 4, 5, 8, 9.

---

## 5. What is sed-replaceable vs what needs per-instance review

### Sed-safe (mechanical, 1-to-1 token swap)
- All rank 1-3 dead classes (zero HTML hits — pure CSS delete).
- `.ca-icon` → `.sv-icon` (zero HTML hits; CSS aliases only).
- `.u-grid-3`/`.u-grid-4`/`.ca-grid` → `.sv-grid` (4 total HTML hits; identical alias today).
- `.card--cyber/cash/mark/esg/core/csrd` — strip the modifier suffix (the colour was already neutralised; the modifier is now no-op).
- `.btn-primary-v2` → `sv-btn sv-btn--primary` in JS injector templates (3 files).
- `.btn-v2--lg` → `.sv-btn--lg`, `.btn-lg` → `.sv-btn--lg`, etc. (size modifiers, all covered by BUTTON_MAP in the existing codemod).

### Per-instance review required
- **Every `<div>` with `.sv-card`** — apply the C-5 decision tree (article vs aside vs a vs li vs div). 66 elements. Estimate ~3-5 minutes each for tag swap + heading-level audit.
- **`.f10-related-card` slots** — `-name` → `sv-card__title`, `-desc` → `sv-card__body`. 90 lines but 6 nearly-identical files; once one is correct the pattern can be applied with confidence.
- **`.btn` bare token (40 hits)** — many will already have `.sv-btn` co-class from previous migration passes; visually verify each retains its hover/focus/disabled state because the CSS rule at `styles.css:341` is a full button definition (not just a shim).
- **`.container` / `.wrap` (484 hits)** — alias today is mathematically identical (`max-width: min(1320px, 100% - 2rem)`). Swap is mechanical but the volume + invisibility of regression means we want VRT screenshots per page before/after.

---

## 6. Step-by-step migration sprint plan

### 1-day sprint (lowest-risk wins, no semantic work)
1. **Confirm dead CSS** with `tools/migrate-to-sovereign.js --dry-run`.
2. Delete dead-CSS class blocks from `styles.css` for ranks 1-3 (`.bento-card`, `.premium-card`, `.btn-v2`, `.is-cta-btn-*`, `.ca-btn-v2*`, `.nf-btn*`, `.card-N`, `.ca-icon` aliases). Each block is already noted "DEAD" in the registry.
3. Update 3 JS injector templates (`js/nav-inject.js`, `js/tool-teaser.js`, `js/homepage-compliance-widget.js`) — replace `btn btn-md btn-primary-v2` strings with `sv-btn sv-btn--primary sv-btn--md`.
4. Run `pnpm playwright test tests/sf46-sovereign-drift-detector.spec.js tests/sf46-foundations-probe.spec.js`.
5. Take 1440/768/390 VRT screenshots of `index.html`, `pricing.html`, `crowagent-core.html`. Diff against baseline.
6. **Rollback step:** revert the 3 JS files + restore the CSS blocks. Each is a single-file `git checkout`.

Expected delta: ~200 lines of dead CSS gone; nav/tools/homepage CTAs now emit canonical classes. Zero HTML files touched.

### 3-day sprint (cumulative — adds ranks 4-7)
**Day 1:** as above.
**Day 2 — grids + colour modifiers + triple-card:**
1. Update `scripts.js:1415, 1430` and `js/modules/cinematic-init.js:170` selector lists to include `.sv-grid` / `.sv-card` alongside the legacy classes.
2. Run codemod `--apply` scoped to the 4 affected HTML files (1 × `u-grid-3`, 3 × `ca-grid`, 2 × `triple-card`).
3. Sed-strip `card--cyber/cash/mark/esg/core/csrd` modifiers across the 30 lines (the underlying `.sv-card` keeps the visual; modifier was neutralised in registry).
4. VRT screenshots + sovereign-sheriff CI gate.

**Day 3 — `f10-related-card` (the C-5 semantic fix):**
1. For each of 6 product hub pages: replace `<a class="f10-related-card f10-related-card--<product> ms-card-lift" href="...">` with `<a class="sv-card sv-card--interactive ms-card-lift" href="...">`.
2. Rename inner slots: `.f10-related-card-name` → `.sv-card__title`, `.f10-related-card-desc` → `.sv-card__body`.
3. Wrap each related-product strip in `<nav aria-label="Related products">` if not already inside one.
4. Visual reconciliation: VRT screenshots at 1440/768/390 for all 6 product pages.
5. Delete `.f10-related-card*` rule blocks at `styles.css:14088-14108, 16395, 17718`.
6. **Rollback per file:** `git checkout -- crowcyber.html` (etc.). Each file's diff is contained.

Expected delta: 130+ HTML lines migrated; ~30 lines of CSS deleted; C-5 BEM discipline restored for product hub strips.

### 5-day sprint (full retirement — adds ranks 8, 9, 10 and the C-5 semantic sweep)
**Days 1-3:** as above.

**Day 4 — `.btn` retirement + per-page semantic sweep for `<div>.sv-card`:**
1. Run codemod `--apply` to convert any remaining `<a class="btn …">` / `<button class="btn …">` into `<a class="sv-btn …">`. The codemod's BUTTON_MAP already handles this.
2. Semantic-element sweep for the 66 `<div class="sv-card">` instances using the decision tree in §2. Group by file (about.html: 3; contact.html: 3; glossary/*: ~16; blog posts: ~8; tools/*: ~6; products/index: ~12; index/pricing/roadmap: ~18).
3. After tag swaps, re-verify heading-outline (no h2 → footer-h3 jumps) — this catches A8 from the master tracker.
4. Add `.sv-btn` to JS selector lists at `scripts.js:1573`, `js/modules/csrd-wizard.js:125`, `js/modules/lottie-cta.js:155`, then delete `.btn` from those selector lists.
5. Delete `.btn` rule block at `styles.css:341` and the adjacent legacy `.btn-primary` definitions (lines 372, 2396, 3516, 3774).

**Day 5 — `.container` / `.wrap` final cleanup (the riskiest):**
1. Codemod sweep: every `class="wrap container"` → `class="sv-container sv-container--wide"`. Volume = ~484 lines, ~60 files.
2. Update `js/modules/e-batch-runtime.js:53` selector to `main .sv-container, main .legal-content, main .legal-page, main article`.
3. Update `js/nav-inject.js:236` template to emit `sv-container sv-container--wide sv-nav-row` only (drop the `wrap` co-class).
4. Run full Playwright suite + VRT on every page (1440/768/390 = 3 viewports × ~25 pages = 75 screenshots).
5. Diff against pre-migration baseline; investigate any pixel-diff > 1%.
6. Delete `.container, .wrap` alias block at `styles.css:106` and `styles.css:33312`.

Expected delta: 484 HTML lines migrated; ~80 lines of CSS deleted; site now has a single container API.

---

## 7. Rollback strategy per step

The migration is structured so **each rank is independently revertable**:

| Rank | Rollback |
|---|---|
| 1-3 (dead CSS) | `git checkout -- styles.css styles.min.css` (single-file revert). No HTML touched. |
| 4 (`triple-card`) | `git checkout -- index.html js/modules/cinematic-init.js styles.css`. 3 files. |
| 5 (palette modifiers) | `git checkout -- crow{cyber,cash,mark,esg,core}.html csrd.html`. Per-page revert. |
| 6 (`u-grid-3`) | Codemod is idempotent — re-running with the legacy mapping restores. Or `git checkout` 1 HTML + scripts.js. |
| 7 (`ca-grid`) | `git checkout -- <3 affected files>`. |
| 8 (`f10-related-card`) | **Per-file revert** — each of the 6 product pages has an isolated `<section>` for related products. `git checkout -- crowcyber.html` etc. restores that single page. |
| 9 (`.btn`) | The CSS class definition at `styles.css:341` is the single source — restoring it un-breaks every `.btn` reference at once. JS selector lists were additive, so they keep working even if HTML reverts. |
| 10 (`.container`/`.wrap`) | **High-risk, batched.** Tag the pre-migration commit with `pre-c4-container-migration`. Roll back with `git revert <merge-sha>` if VRT shows any regression. Because the alias is mathematically identical to the new class, **partial rollback per page is safe** if needed. |

### Universal safety net
- The CSS alias block at `styles.css:33302-33326` (C-3, C-4, C-8) explicitly maps `.ca-grid`/`.u-grid-3`/`.u-grid-4`/`.container`/`.wrap`/`.ca-icon` to the same behaviour as their `.sv-*` equivalents. **Keep this block until rank 10 is fully complete.** It is the difference between "broken page" and "two classes that do the same thing".
- Sovereign-sheriff CI gate (`tools/sovereign-sheriff.js`) prevents NEW deprecated classes from entering the codebase. Migration sprints don't need to fear regression from in-flight work.
- Existing codemod `tools/migrate-to-sovereign.js` is **idempotent**. Re-running it after a botched apply will not double-migrate. Safe to re-run as a verification step.

---

## 8. Summary recommendation

- **Rank 1-3 work is "free" (~1 day) and should ship immediately** — zero HTML risk, removes ~200 lines of dead CSS, unblocks audit C-1 partial credit.
- **`.f10-related-card` is the highest-value semantic win (Day 3)** — fixes both C-1 (one of the 72 card families) and C-5 (slot BEM discipline) in a single coherent 6-file pass.
- **`.container`/`.wrap` (rank 10) is the only genuinely scary step** — defer to last, batch it on its own day with full VRT, and tag a rollback commit. Alias is identical today so the migration is a no-op visually; the risk is purely "did the codemod miss a class combo".
- **JS injectors must migrate one push ahead of HTML codemod** — otherwise injected DOM (announce bar, tool teaser, compliance widget) emits classes that no longer have CSS rules.
- **Existing tooling (`tools/migrate-to-sovereign.js`) handles ~80% of the mechanical work.** Custom edits needed only for: rank 8 slot renames (`-name`/`-desc` → `sv-card__title`/`__body`), rank 9 JS selector list updates, rank 10 nav-inject template string.
