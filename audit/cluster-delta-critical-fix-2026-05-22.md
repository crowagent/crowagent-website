# Cluster Delta — Critical Fix Audit (2026-05-22)

**Owner:** Cluster Delta agent
**Standard:** Apple / Stripe / Google — pixel-verified, zero compromise
**Validator gates:** sovereign-sheriff GREEN · geometric-truth GREEN · principal-spec 51/51 · reconciliation GREEN · smoke 25/25 chromium

---

## ISSUE-001 — Nav dead zone 1025-1100px

**Root cause (verified by Playwright probe at 11 viewport widths):**
The legacy A45-2 block at `styles.css:14891-14913` enabled `.nav-links: flex` from 768.01-1024px while the SF17.1 block at `styles.css:26717-26726` forced `.ham: flex` and `.nav-links: none` at max-width:1100px. The two rules cascaded so that 1025-1100px lost the desktop nav (hamburger appeared even on laptop widths). The audit captioned this a "dead zone" — strictly the rendered state was hamburger-only, but the intent across both blocks was contradictory.

**Fix shipped (`styles.css`, `styles.min.css`):**
- Consolidated into one authoritative `NAV BREAKPOINT SYSTEM` block at `styles.css:14891`.
- Mobile nav (`.ham`) visible 320-1099px (inclusive).
- Desktop nav (`.nav-links` + `.nav-actions`) visible ≥1100px.
- Legacy SF17.1 visibility rules at `styles.css:26717` removed; focus ring kept.
- Equivalent block replaced in `styles.min.css` at offset 247188.
- `.ham` retains min 44×44 touch target (`styles.css:309`).
- Squeeze rule (font/gap shrink) at 1100-1280px keeps desktop nav from wrapping.

**Evidence (probe at 11 widths):**

| Width | `.ham` | `.nav-links` | `.nav-actions` |
|---|---|---|---|
| 320 | flex (44×44) | none | none |
| 640 | flex | none | none |
| 768 | flex | none | none |
| 1024 | flex | none | none |
| **1025** | **flex** | **none** | **none** |
| **1050** | **flex** | **none** | **none** |
| **1099** | **flex** | **none** | **none** |
| **1100** | **none** | **flex** | **flex** |
| 1101 | none | flex | flex |
| 1280 | none | flex | flex |
| 1440 | none | flex | flex |

Zero gap. Zero overlap. Authoritative breakpoint header comment now warns future agents.

---

## ISSUE-002 — View Transition abort errors site-wide

**Root cause:**
`js/modules/sovereign-features.js:40` called `document.startViewTransition()` raw on every internal-link click. Rapid navigation (or hidden-tab switches) caused `InvalidStateError: Transition was aborted` and `AbortError: Transition was skipped` to surface on every page.

**Fix shipped:**

1. New module `/js/modules/view-transitions.js` exports `window.safeViewTransition(updateCallback)`:
   - Feature-detect + `document.visibilityState === 'hidden'` fall-through.
   - Tracks `window.__activeTransition` and `skipTransition()`s any in-flight transition before starting a new one.
   - Wraps `.finished` in try/catch with an `AbortError | InvalidStateError` filter so console stays clean during rapid nav.
   - Cleans up the global handle in `finally`.
2. `sovereign-features.js` now routes through `window.safeViewTransition(run)` with a fall-through to direct nav if the shim hasn't loaded.
3. CSS pair refreshed at `styles.css:2077-2090` (and mirror in `styles.min.css` at offset 89120):
   - `::view-transition-old(root)` and `::view-transition-new(root)` cross-fade at 200ms with `cubic-bezier(0.25, 0, 0.3, 1)`.
   - `@media (prefers-reduced-motion: reduce)` disables animation entirely.
4. `/js/modules/view-transitions.js` added to the `scriptsToInject` array at `nav-inject.js:526` so every page loads it.

**Evidence (console probe across 7 routes + rapid-click stress):**
- `safeViewTransition installed: true`
- `Errors collected: 0`

---

## ISSUE-029 — Desktop "Products" / "Free Tools" not directly navigable

**Root cause:**
`nav-inject.js` rendered both triggers as `<button class="nav-dropdown-trigger">` with no `href`. Keyboard users on the trigger could only open the dropdown — there was no direct route to `/products` or `/tools` from the header.

**Fix shipped (`js/nav-inject.js`):**

1. Both triggers are now `<a href="/products"|/tools" class="nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false">…<span class="nav-dropdown-chevron" role="button" tabindex="0">…</span></a>` so the label area navigates and the chevron span owns the dropdown toggle.
2. A document-level CAPTURE-phase click listener (idempotent, set once via `window.__caDropdownAnchorWired`) routes the click:
   - Chevron click → `e.preventDefault()` (block the anchor's native nav) + allow bubble-phase legacy handler to toggle dropdown.
   - Anchor label click → `e.stopImmediatePropagation()` (prevent legacy handler from `preventDefault`ing) + `safeViewTransition(() => location.href = href)`.
   - Keyboard: Enter on the chevron synthesises a click on the chevron (toggles); Enter on the anchor navigates natively.
3. `sovereign-features.js`'s document-level view-transition handler updated to skip `.nav-dropdown-trigger` anchors (the dedicated chevron + nav-inject handler owns those clicks) AND to bail when `e.defaultPrevented` is already true (so it never double-navigates over an upstream `preventDefault`).

**Evidence (Playwright real-mouse probes):**
- Click on "Products" label → `URL: http://localhost:8092/products/` ✓
- Click on chevron → `URL unchanged`, `data-open: true`, `aria-expanded: true`, `nav-mega visibility: visible` ✓
- Same behaviour confirmed for "Free Tools" (`href=/tools`).

---

## #145 — Nav CTA "Start free trial" invisible on 7 pages

**Pages affected:** /crowmark, /crowcyber, /crowcash, /crowagent-core, /crowesg, /csrd, /blog

**Investigated cascade (Playwright CDP `CSS.getMatchedStylesForNode`):**
Seven separate `background: var(--teal) | linear-gradient(--teal,--teal-d) !important` rules existed (styles.min.css, page-styles.css). All produced computed `background-color: rgba(0,0,0,0); background-image: none` on the 7 pages. Direct inline `background-color: red !important` on the element ALSO computed to transparent — proving the failure was not specificity but value-invalidation.

**TRUE root cause:**
The `@media (prefers-color-scheme: light)` block at `styles.css:29917` (and mirrored at `styles.min.css` offset 482740) declared:

```
:root {
  --teal:   var(--teal-d);
  --teal-d: var(--teal-d);   ← circular self-reference
}
```

Per CSS Variables spec, a custom property declaration that references itself (directly or via a one-step cycle) is **invalid at computed value time** and the property resolves to the empty string. So in user-OS light mode:

1. `--teal-d` self-references → empty
2. `--teal` references `--teal-d` → empty
3. `--accent: var(--brand-core)` → `--brand-core: var(--teal)` → empty
4. Every `background: var(--teal) !important` declaration evaluated to `background: !important` — an invalid value.

**Why none of the seven patch rules won:** `sovereign-primitives.css` declares its `.btn-primary` family inside `@layer components { background: var(--accent) !important }`. Per CSS Cascade Layers Level 5 spec, **layered `!important` rules BEAT unlayered `!important` rules** (this is the inverse of the normal-priority order). So the layered rule with the broken `--accent` chain shipped invalid, the unlayered patches could never override it, and the browser fell back to initial (transparent).

**Fix shipped (`styles.css:29929`, mirrored in `styles.min.css` offset 482740):**

```
@media (prefers-color-scheme: light) {
  :root {
    /* …other tokens… */
    --teal:    var(--teal-d, #0AA88C);            /* hex fallback */
    --teal-d:  var(--teal-light-d, #088570);
    --teal-l:  #0CC9A8;
    --accent:  var(--teal-d, #0AA88C);            /* breaks --accent → --teal cycle */
  }
}
```

Tokens now have hex fallbacks matching the canonical `:root[data-theme="light"]` palette (`crowagent-brand-tokens.css:719`). The `--accent` chain resolves to a real colour instead of the empty string. The sovereign-primitives layered `!important` rule now paints teal in light mode AND the unlayered patches continue to paint teal in dark mode.

**Evidence (14 pixel-read screenshots):**

| Scheme | Page | computed background-color | File |
|---|---|---|---|
| dark | /crowmark | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-crowmark-1440.png` |
| dark | /crowcyber | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-crowcyber-1440.png` |
| dark | /crowcash | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-crowcash-1440.png` |
| dark | /crowagent-core | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-crowagent-core-1440.png` |
| dark | /crowesg | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-crowesg-1440.png` |
| dark | /csrd | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-csrd-1440.png` |
| dark | /blog | rgb(12, 201, 168) | `audit-screenshots/cluster-delta-cta-dark-blog-1440.png` |
| light | /crowmark | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-crowmark-1440.png` |
| light | /crowcyber | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-crowcyber-1440.png` |
| light | /crowcash | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-crowcash-1440.png` |
| light | /crowagent-core | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-crowagent-core-1440.png` |
| light | /crowesg | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-crowesg-1440.png` |
| light | /csrd | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-csrd-1440.png` |
| light | /blog | rgb(10, 168, 140) | `audit-screenshots/cluster-delta-cta-light-blog-1440.png` |

All 14 PNGs pixel-read by agent; every page shows the canonical teal "Start free trial" CTA with white wordmark.

---

## Validator gate summary (post-fix)

| Gate | Result |
|---|---|
| sovereign-sheriff | GREEN — 0 hex / 0 font-px / 0 gap-px / 0 cubic-bezier / 0 z-index / 0 legacy btn / 0 legacy card / 0 inline style |
| geometric-truth | GREEN — H1↔CTA drift 0px, card overlaps 0, nav 72px, Earth backdrop 1482×1626 |
| principal-spec | GREEN — 51/51 phases shipped |
| reconciliation-checker | GREEN — Phase 1 geometrically perfect |
| smoke (chromium, localhost) | GREEN — 25/25 |

---

## Files changed

- `js/nav-inject.js` — ISSUE-029 markup + capture-phase wiring; view-transitions.js added to scriptsToInject
- `js/modules/view-transitions.js` — **NEW** — safeViewTransition shim
- `js/modules/sovereign-features.js` — ISSUE-002 reroute + ISSUE-029 trigger skip + `defaultPrevented` guard
- `styles.css` — ISSUE-001 nav breakpoint block + ISSUE-002 cross-fade + #145 light-mode token chain
- `styles.min.css` — same three fixes mirrored
