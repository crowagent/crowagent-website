# Accessibility Standards — crowagent.ai

Single source of truth for the accessibility target, the automated gate, and the
specific behaviours in navigation, motion, and consent that implement it. Grounded in
`js/nav-inject.js`, `js/cookie-banner.js`, `astro/src/layouts/Base.astro`,
`astro/src/scripts/motion.ts`, `astro/src/styles/tokens.css`, and
`tests/accessibility.spec.js` as of 2026-08-02.

## 1. Target

**WCAG 2.2 AA**, stated in `specs/architecture/README.md` ("Top 1% accessibility... WCAG
2.2 AA target") and referenced directly against a specific success criterion in code —
`astro/src/styles/tokens.css:101` names 2.2's target-size floor explicitly when setting
`--btn-h-sm: 44px` ("44px is also the WCAG 2.2 target-size floor, so `--btn-h-sm` is the
smallest a control may ever be").

**This target is not fully covered by the automated gate — see §2.1.** WCAG 2.2
conformance on this site currently rests partly on manual, targeted fixes that cite
specific success criteria in code comments (§4.3 below is another example, citing
4.1.2, 2.4.3, and 2.5.8 together), not solely on a single automated check.

## 2. Automated gate — axe-core

`tests/accessibility.spec.js`, run via `npx playwright test tests/accessibility.spec.js`.
In CI: part of `quality-gate.yml`, run against `npx serve . -l 8080` after
`npm run build` (see the gap this creates in `TESTING-AND-QUALITY-GATES.md` §6 — the
served content is unbuilt source, not `dist/`). Fails on any `serious` or `critical`
axe violation, filtered from the full result set — `moderate` and `minor` violations are
recorded by axe but do not fail the test.

**13 named routes** are swept: Homepage, Pricing, Contact, About, Blog, FAQ, CrowMark,
CrowMark buyers, Compare index, Sectors index, Glossary index, PPN 002 calculator, Tools
index. The list was rewritten 2026-08-01 to drop four routes for withdrawn products
(CrowCyber, CrowCash, CrowESG, CSRD) that all 404'd — axe finds no serious violation on
the site's own 404 page, so those four tests "could only ever pass" (quoted from the
spec's own comment) and were testing nothing.

### 2.1 Tag coverage — a real, currently open gap

`tests/accessibility.spec.js` requests exactly these axe tags:
`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.

**It does not request `wcag22aa`**, despite `@axe-core/playwright ^4.11.3` supporting
that tag and the site's stated target being WCAG 2.2 AA (§1). The WCAG 2.2-only success
criteria — including 2.4.11 Focus Not Obscured (Minimum) and 2.5.8 Target Size
(Minimum), both directly relevant to a site with a sticky nav and touch-target-sized
buttons — are therefore not exercised by the automated gate at all. Where 2.2 criteria
are met today (e.g. the `--btn-h-sm` token, the footer-accordion target-size fix in
§4.3), it is because someone fixed a specific measured instance, not because a gate
would catch a regression. **Do not report the axe gate as covering WCAG 2.2 conformance
— it currently covers 2.1 AA and below only.**

### 2.2 Secondary checks — advisory, not gating

`quality-gate.yml` also runs Pa11y (WCAG2AA standard, threshold 0) against three routes,
and Lighthouse CI's accessibility category (`lighthouserc.json`: `minScore: 0.95`).
**Both `pa11y` and the Snyk/`npm audit`/`linkinator` steps in the same workflow run with
`continue-on-error: true`** — a failure in any of them does not fail the CI run or block
a merge. Only the axe-core Playwright step and the Lighthouse accessibility-score
assertion actually gate.

## 3. Skip link and `<main>` — required as a pair, and why

**A skip link with no focusable target is worse than no skip link at all**, because it
appears to offer a way past repeated navigation while silently doing nothing — a
screen-reader or keyboard user who activates it gets no feedback that it failed. This
exact defect was found and is documented directly in `astro/src/layouts/Base.astro`:

> A parity run against the legacy site found every legacy page carries a skip link and a
> `<main>`, while all 8 ported blog posts had neither: the article rendered as a bare
> `<article>` with no landmark. A keyboard or screen-reader user had no way past the
> navigation, and a skip link without a `<main>` to target is worse than none because it
> silently goes nowhere.

### 3.1 Legacy site — `js/nav-inject.js`

Injects `<a class="skip-link" href="#main-content">Skip to main content</a>` as the
**first child of `<body>`**, site-wide, idempotently (skips injection if the page already
hardcodes a `.skip-link` or an `a[href="#main-content"]`). Critically, it also makes the
target **programmatically focusable**: if `#main-content` exists but has no `tabindex`
attribute, one is set to `-1` — without this, activating the skip link scrolls the page
but leaves keyboard focus on the (now off-screen) link itself, so subsequent Tab presses
resume from the nav rather than from the content the user just skipped to. On re-injection
of the nav (which can happen after DOM mutation), the skip link is kept as the **first**
body child specifically (`BUG-014` in the source), not merely present somewhere in the
DOM — assistive technology and keyboard order both depend on encounter order, not just
existence.

### 3.2 Astro rebuild — `Base.astro`

Both elements are owned by the shell layout itself (`<a class="skip-link">` immediately
followed by `<Nav>` then `<main id="main-content" tabindex="-1">`), specifically so "no
future route can be added without them" — the fix is structural (every page necessarily
uses this layout) rather than a per-page checklist item that can be forgotten, which is
exactly how the legacy blog posts ended up with neither. The CSS keeps the link
off-screen via `transform: translateY(-120%)` — **never `display:none` or
`visibility:hidden`**, both of which remove an element from the keyboard focus order
entirely and are called out in the source comment as "the usual way this control is
broken while appearing to be present in the markup." On `:focus-visible` it transforms
into view with a 3px outline. `main:focus { outline: none }` suppresses only the focus
ring on `<main>` itself (reached via the skip link's scroll-and-focus, not via Tab), so
the landmark does not draw a visible ring around the entire page content on every skip
activation.

## 4. Keyboard and focus — navigation

### 4.1 Mobile navigation dialog focus trap

`js/nav-inject.js` implements a WCAG 2.1.2-consistent focus trap on `#mob-menu`
(`role="dialog" aria-modal="true"`), added as `NAV-001` after an audit found the mobile
hamburger menu toggled its `open` class without trapping Tab or returning focus on
close — "a keyboard user could Tab into the obscured page behind the open overlay."

Mechanics: a `MutationObserver` watches the `class` attribute on `#mob-menu` rather than
hooking whichever specific handler opens it (there are two — an inline handler and a
legacy `scripts.min.js` handler on older pages — and the trap is agnostic to which one
fired). On open: captures `document.activeElement` to restore later, adds a capturing
`keydown` listener that cycles Tab/Shift+Tab between the first and last focusable
element inside the dialog, and focuses the first item with `{ preventScroll: true }` so
opening the menu never yanks a scrolled-down viewport back to the top. Escape triggers
the hamburger's own close handler. On close: removes the listener and restores focus to
whatever had it before the dialog opened (falling back to the hamburger button itself).

### 4.2 Cookie banner focus trap — WCAG 2.1.2, and how it differs from a keyboard trap

`js/cookie-banner.js` implements the same pattern for the consent banner, with an
explicit note on why this is correct under 2.1.2 rather than a violation of it: **2.1.2
(No Keyboard Trap) is about guaranteeing an exit, not about forbidding focus retention.**
For a transient, decision-required surface like a consent banner, the success criterion
actually wants focus to *stay* inside until a decision is made, "so screen-reader users
do not 'tab past' the decision and miss it" (quoted from the source comment). Pattern:
capture the triggering element on open, ring Tab/Shift+Tab between the first and last
focusable element in the banner while it is visible, restore focus to the trigger on
close.

**Escape is the guaranteed exit**, and it does not simply close the banner — it moves
focus to `#main-content` (falling back to the first `<main>`), satisfying 2.1.2's actual
requirement (a documented way out) without silently dismissing a consent decision the
user has not made. Elsewhere in the same file, a *separate* top-level Escape listener
treats Escape-while-visible as an active PECR-safe "reject all" (dismissing without
opting in is treated as declining, never as accepting) — the two behaviours coexist:
the trap's own Escape handler moves focus out; the boot-level listener additionally
records the rejection.

**The trap yields to a newer modal opened on top of it.** If the mobile nav dialog
(`#mob-menu.open`) is open, the cookie banner's own `keydown` handler returns
immediately rather than fighting for focus — added after an audit found the banner kept
ringing focus between its own four buttons even while the mobile menu was open on top of
it, making every link in that menu keyboard-unreachable. **A consent banner should hold
focus against the page, not against a dialog opened after it** — a rule worth applying
to any future overlay this site adds.

Focusable-element discovery (`getFocusableInBanner`) explicitly excludes elements inside
a `display:none` ancestor within the banner (e.g. the collapsed detail panel), so Tab
does not stop on an invisible control — a common false-pass in a naive `:focusable`
selector that does not account for ancestor visibility.

### 4.3 Responsive-conditional ARIA — footer accordion (4.1.2, 2.4.3, 2.5.8 together)

`js/nav-inject.js`'s footer-column accordion is a concrete example of a defect that
combined three distinct WCAG criteria and required understanding all three to fix
correctly. Originally, `role="button"`, `tabindex="0"`, and `aria-*` attributes were set
**unconditionally** on every footer-column heading, but the accordion's `toggle()`
function returns early on desktop (`!isMobile()`), so on desktop the result was:

- A control with an accessible name and role whose activation does nothing (violates
  4.1.2 Name, Role, Value — the exposed role/value promised interactivity the control
  did not have).
- Three extra Tab stops in the footer that serve no purpose (violates 2.4.3 Focus
  Order — focus order should reflect meaningful sequence, and a dead stop breaks that).
- Three ~170×18 CSS-pixel "targets" that are below the WCAG 2.2 24×24 minimum
  (2.5.8 Target Size — noted here even though the element does nothing at that
  viewport, because a screen-reader or switch-access user would still land on it).

**Fix:** the `role`/`tabindex`/`aria-controls`/`aria-expanded` attributes are now applied
and removed dynamically by a `sync()` function that runs on init and on every
`resize`, gated on the same `isMobile()` (`max-width: 767px`) check the toggle logic
uses — the accordion semantics exist in the accessibility tree **only** at the viewport
width where they are functionally real. This is the general pattern for any
responsive-conditional interaction on this site: if a control's behaviour is
conditional on viewport, its ARIA exposure must be conditional on the same check, not
just its visual presentation.

## 5. Reduced motion — resolves to final state, never hides or freezes

**The binding rule, stated in `astro/src/scripts/motion.ts`:** `prefers-reduced-motion:
reduce` resolves every element to its final state. It never leaves an element
mid-animation and never hides it.

This is a direct response to the defect the entire rebuilt motion system exists to
prevent: the legacy `sv-reveal.js` stamped `opacity: 0` on every `main > section` and
depended on an `IntersectionObserver` firing to reveal it. Measured on the homepage, a
normal scroll left 4 of 9 sections permanently invisible; a full-page capture left 7 of
9. **Content was invisible by default and depended on JavaScript succeeding** — the
exact inverse of what an accessible reduced-motion implementation should do.

### 5.1 Mechanism — Astro rebuild

`REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches`, checked once
at module load. If `REDUCED` (or `IntersectionObserver` is unsupported), every
motion-tagged element (`[data-motion]`) is resolved to its finished state **immediately**,
bypassing the observer entirely — `resolve()` simply sets `data-motion-state="in"` and
clears the progress custom property. Scroll-driven effects (parallax) short-circuit the
same flag inside the scroll handler (`if (ticking || REDUCED) return`).

The five binding rules stated directly in the file's header (numbered 1–5) are, in
summary: content is visible by default and motion *removes* a hiding class rather than
motion *adding* visibility; every primitive has a 2,600ms timed failsafe regardless of
observer state; one shared `IntersectionObserver`, not one per module; reduced motion
resolves to final state (this section); only `transform` and `opacity` are animated so
everything stays on the compositor.

**Even under reduced motion, content-bearing effects still deliver their content.** The
counter primitive (`runCounter`) is explicit about this: under `REDUCED` it sets the
final formatted number directly rather than animating the count-up, with the comment
"skipping the final assignment would leave the tile blank, which is a content defect
dressed up as an accessibility feature." Reduced motion is a request to remove motion,
not licence to remove content.

### 5.2 Mechanism — token-level, applies sitewide

`astro/src/styles/tokens.css` handles reduced motion **once**, at the token level,
rather than per component:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-fast: 0.01ms;
    --dur:      0.01ms;
    --dur-slow: 0.01ms;
  }
}
```

Every transition/animation duration in the design system is expressed via these tokens,
so setting them to effectively zero collapses every CSS transition to its end state
instantly, everywhere, without editing individual component rules. The stated reasoning
directly parallels §5.1's principle: "an element that never animates and never arrives
is invisible content, which is worse than an animation somebody did not want" — i.e.
`transition: none` alone is an incomplete fix if the element's resting state was
mid-transition-dependent; collapsing duration to near-zero guarantees it always reaches
its end state.

### 5.3 Print and anchor-jump resolve to final state

`print.css` unconditionally hides chrome that has no print value (`nav`, sticky CTAs,
the mobile menu, the cookie banner, product mockup wrappers, etc.) via `display: none
!important` inside `@media print`, and forces `background: white !important; color:
black !important` on every element — this guarantees a page reached via print (which
bypasses scroll-triggered reveal entirely, since nothing scrolls) renders complete and
legible rather than depending on any motion primitive having fired. An anchor jump
(`#section-id` in the URL, or a same-page anchor link) similarly never triggers a
scroll-driven `IntersectionObserver` in the normal top-down way — motion primitives'
2,600ms failsafe timer (§5.1) is what guarantees a directly-anchored element still
resolves to visible even if it was never scrolled past.

## 6. Touch target size

**44×44px is the floor**, enforced via a single token (`--btn-h-sm: 44px`,
`astro/src/styles/tokens.css`) that the source comment ties directly to the WCAG 2.2
target-size success criterion — "44px is also the WCAG 2.2 target-size floor, so
`--btn-h-sm` is the smallest a control may ever be." This consolidated what had been
"buttons rendering at 54px and 44px with three font sizes and three weights between
them" into two heights (`--btn-h: 54px`, `--btn-h-sm: 44px`) and one weight/size.

Note the target-size violation documented in §4.3 was measured at ~170×18 CSS pixels —
under even the WCAG 2.2 **minimum** exception threshold (24×24), let alone this site's
own 44×44 floor — which is why it was treated as a genuine defect rather than an
acceptable edge case.

## 7. Images and interactive elements — sitewide rules

Carried forward from the legacy site's own enforcement rules (not re-verified
independently in this pass, stated here because they are binding and this is the
canonical accessibility document): every image requires an `alt` attribute, and every
interactive element must meet the 44×44px minimum touch target from §6. These are
enforced by convention and code review rather than by a dedicated automated gate today —
axe-core's `image-alt` rule (part of the `wcag2a` tag already requested, §2) covers
missing/empty `alt` on rendered pages, but there is no repo-specific script asserting
this independently of the axe sweep's 13-route coverage.

## 8. Verification checklist for a new interactive component

1. Does it have a keyboard-operable equivalent for every mouse interaction? (§4)
2. If it is a dialog, overlay, or transient decision surface: does it trap focus with a
   genuine exit (Escape), and does it restore focus to the trigger on close? Does it
   yield to any *other* overlay that might open on top of it, per §4.2's lesson?
3. If its ARIA role/state is conditional on viewport or state: is the exposure toggled
   in sync with the functional behaviour, never left stale? (§4.3)
4. Does any animation/reveal it uses go through the shared `motion.ts` primitives
   (§5.1) rather than a bespoke `IntersectionObserver`? A bespoke reveal-on-scroll
   implementation is exactly how the `sv-reveal` defect happened.
5. Does it resolve to a complete, correct state under `prefers-reduced-motion: reduce`,
   under print, and via a direct anchor jump — not just via a normal top-down scroll?
6. Are all touch targets at least 44×44px (§6), and does every image carry a real
   (non-empty, unless deliberately decorative with `alt=""`) `alt` attribute?
7. Run `tests/accessibility.spec.js` against the route once it exists, remembering the
   gate's actual tag coverage stops at `wcag21aa` (§2.1) — a clean axe run is not proof
   of WCAG 2.2 conformance for anything outside what was fixed and verified by hand.
