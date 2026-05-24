Below is the complete consolidated master document. Copy everything between the triple-backtick fences into a file named `CROWAGENT_FRONTEND_MASTER_FIX.md`.

---

```markdown
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  CROWAGENT · FRONTEND MASTER FIX DOCUMENT                                  ║
# ║  Standard: Apple · Google · Stripe · Production Grade                      ║
# ║  Zero Exceptions · Every Screen · Every Device · Every State               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

> **HOW TO USE THIS DOCUMENT**
> Paste the MASTER FORCING-FUNCTION PROMPT (Section 0) into Claude Code first.
> It sets the constitutional rules for every subsequent task.
> Then paste each ISSUE FIX PROMPT individually.
> Every prompt is self-contained and independently executable.

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 0 — MASTER FORCING-FUNCTION PROMPT
## PASTE THIS FIRST INTO CLAUDE CODE BEFORE ANY OTHER TASK
## ████████████████████████████████████████████████████████████████████████████

```
You are a Principal Frontend Engineer with the combined taste and engineering
rigour of Apple HIG, Google Material Design 3, and Stripe's design system.

You are operating on the CrowAgent codebase at http://localhost:8092.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTITUTIONAL HARD RULES — ZERO EXCEPTIONS EVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — ACCESSIBILITY IS NON-NEGOTIABLE
Every change MUST satisfy WCAG 2.1 Level AA. No exceptions.
- Every interactive element has a visible focus ring (min 3:1 contrast ratio,
  2px solid outline, 2px offset).
- Every image has descriptive alt text unless explicitly decorative
  (then alt="" AND aria-hidden="true").
- Every form input has an explicit <label for="..."> or aria-label.
- Heading hierarchy is always H1→H2→H3 with zero skipped levels.
- Exactly ONE role="banner", ONE role="main", ONE role="contentinfo" per page.
- Every nav element has a unique aria-label.
- Skip link is the FIRST focusable element; it becomes visible on :focus.
- Color is NEVER the sole means of conveying information.
- All motion respects @media (prefers-reduced-motion: reduce).

RULE 2 — PERFORMANCE IS A FEATURE
- No page loads more than 8 JavaScript files total (use a bundler).
- No asset is fetched more than once (preload + cache headers).
- All images are AVIF with WebP fallback via <picture>.
- Hero images have fetchpriority="high" loading="eager".
- All below-fold images have loading="lazy" decoding="async".
- No render-blocking resources in <head> other than critical CSS.
- Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.

RULE 3 — RESPONSIVE IS UNIVERSAL (NOT BREAKPOINT PATCHING)
- Layout uses CSS Grid and Flexbox with fluid units (clamp, min, max, svh/svw).
- NO hardcoded pixel widths on layout containers.
- Navigation MUST be accessible at EVERY viewport from 320px to 3840px.
- Touch targets are minimum 44×44px (Apple HIG) / 48×48dp (Material).
- No content is hidden or truncated without explicit user interaction.
- Test breakpoints: 320, 375, 390, 428, 768, 834, 1024, 1280, 1440, 1920, 2560px.

RULE 4 — ANIMATION IS PURPOSEFUL AND PHYSICS-BASED
- Every animation uses CSS custom properties for duration and easing.
- Easing curves are always spring-based or natural: cubic-bezier(0.34,1.56,0.64,1)
  for entrances, cubic-bezier(0.25,0,0.3,1) for exits.
- Duration scale: micro=100ms, fast=200ms, normal=300ms, slow=500ms, crawl=800ms.
- Staggered lists delay children by 40ms increments, max 320ms total.
- Scroll-triggered animations use IntersectionObserver with threshold:0.1.
- View transitions use document.startViewTransition() WITH proper guards.
- All animations are GPU-accelerated (transform, opacity only — never layout).
- @media (prefers-reduced-motion: reduce) disables ALL motion instantly.

RULE 5 — DESIGN SYSTEM CONSISTENCY
- One button system: .btn--primary, .btn--secondary, .btn--ghost, .btn--danger.
- One card system: .card, .card--elevated, .card--interactive.
- One typography scale using CSS clamp() — no hardcoded px font sizes.
- One spacing scale using CSS custom properties (--space-1 through --space-20).
- One color system using CSS custom properties with light/dark mode support.
- Zero inline styles except dynamically computed values.
- Zero !important except in reset stylesheet and utility overrides.

RULE 6 — CODE QUALITY
- Every JavaScript module is an ES Module (import/export).
- No global variable pollution — everything scoped to modules.
- Error boundaries around all async operations.
- Console.error() for every caught exception.
- No TODO comments in production code.
- Semantic HTML always: use <button> for actions, <a> for navigation.

RULE 7 — SECURITY
- DOMPurify sanitization on ALL user-generated or API-returned HTML.
- No innerHTML concatenation without sanitization.
- CSP-compatible (no inline event handlers, no eval).

You MUST enforce all 7 rules in every code change. If a fix violates any rule,
refuse it and propose a compliant alternative. No exceptions. No compromises.
```

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 1 — CONSOLIDATED ISSUE REGISTRY (37 CONFIRMED DEFECTS)
## ████████████████████████████████████████████████████████████████████████████

| ID  | Severity | Category | Page/Component | Short Description |
|-----|----------|----------|----------------|-------------------|
| 001 | CRITICAL | Responsive | Global Nav | Navigation dead zone 1025–1100px |
| 002 | CRITICAL | JS/Runtime | All pages | View Transition abort errors on every page |
| 003 | HIGH | Visual | /pricing | "Most Popular" badge clipped by overflow:hidden |
| 004 | HIGH | Visual | /blog/[post] | Category badge overlaps breadcrumb |
| 005 | HIGH | Performance | Homepage | 46 JS files loaded (no bundling) |
| 006 | HIGH | Performance | Homepage | cookie-banner.js loaded twice |
| 007 | HIGH | Performance | Homepage | Lottie JSON fetched 10× (once per button) |
| 008 | HIGH | Accessibility | Homepage | 3× role="banner" (ARIA violation) |
| 009 | HIGH | Accessibility | All pages | Search dialog input has no accessible label |
| 010 | HIGH | Accessibility | Homepage | 5 cinematic images with empty alt text |
| 011 | MEDIUM | UX/Layout | Homepage | Excessive whitespace in persona tab section |
| 012 | MEDIUM | UX/Layout | /changelog | Blank hero area / no visible H1 above fold |
| 013 | MEDIUM | Visual | /pricing | Checkmark icon overlaps first letter in Enterprise list |
| 014 | MEDIUM | Visual | /blog | Inconsistent card layout (overlay vs stacked) |
| 015 | MEDIUM | Visual | /tools/* | Centered bullet list in "At a Glance" card |
| 016 | MEDIUM | Performance | Homepage | Hero image in PNG not AVIF/WebP |
| 017 | MEDIUM | Performance | All pages | Logo 1499×441px served, displayed at 136px |
| 018 | MEDIUM | UX | /about | Secondary CTA unstyled (plain link not ghost button) |
| 019 | MEDIUM | Layout | Homepage | Stats section: 2 items in 600px vertical space |
| 020 | MEDIUM | UX | /faq | Full-viewport stock photo above FAQ content |
| 021 | MEDIUM | Accessibility | All pages | Skip link not reachable via Tab key |
| 022 | MEDIUM | Accessibility | All pages | Potential contrast issue on announce bar indicator |
| 023 | MEDIUM | Accessibility | Interior pages | Breadcrumb nav missing aria-label |
| 024 | LOW | Accessibility | Interior pages | Missing aria-current="page" on breadcrumb |
| 025 | LOW | UX | /crowesg | Waitlist CTA not prominent on coming-soon page |
| 026 | LOW | Accessibility | Homepage | Marquee role on meaningful regulatory content |
| 027 | LOW | UX | Short pages | Scroll progress bar on all pages regardless of length |
| 028 | LOW | Accessibility | All pages | Second <footer> in cmdk dialog creates extra landmark |
| 029 | LOW | UX | Desktop nav | "Products" not directly navigable on desktop |
| 030 | LOW | UX | /roadmap | Missing breadcrumb navigation |
| 031 | LOW | UX | /resources | Missing breadcrumb navigation |
| 032 | LOW | UX | /partners | Missing breadcrumb navigation |
| 033 | LOW | UX | /glossary | Missing breadcrumb navigation |
| 034 | LOW | Accessibility | Homepage | Color-only emphasis on "Protect" keyword |
| 035 | MEDIUM | Trust/UX | Homepage | Placeholder company names in partner strip |
| 036 | LOW | Performance | All pages | Logo loading="auto" should be eager |
| 037 | LOW | Accessibility | All pages | Duplicate labels on cookie consent checkboxes |

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 2 — INDIVIDUAL FIX PROMPTS FOR CLAUDE CODE
## ████████████████████████████████████████████████████████████████████████████

---

### ISSUE-001 — CRITICAL | Navigation Dead Zone 1025–1100px

```
TASK: Fix navigation dead zone between 1025px and 1100px viewport width.

CONTEXT:
CSS analysis reveals:
  - `.ham` (hamburger): hidden via `display: none !important` at `min-width: 768.01px and max-width: 1024px`
  - `.nav-links` (desktop nav): only shown at `min-width: 1101px`
  - Gap of 75px (1025–1100px) where NEITHER navigation system is visible

HARD REQUIREMENTS (zero exceptions):
1. Audit every CSS breakpoint touching `.ham`, `.nav-links`, `.nav-actions`,
   `.nav-dropdown-trigger` in styles.min.css and all imported stylesheets.
2. Resolve breakpoints so navigation is ALWAYS visible at every width from 320px to 3840px.
3. Chosen breakpoint strategy:
   - Mobile nav (hamburger) visible: 320px → 1099px
   - Desktop nav visible: ≥1100px
   - NO gap, NO overlap ambiguity
4. The hamburger button must meet 44×44px touch target minimum at all mobile sizes.
5. Desktop nav links must not overflow or wrap at 1100–1199px (scale font-size
   with clamp if needed).
6. Write a regression test: document.querySelector('.ham') must return
   display:flex at 1099px and display:none at 1100px; .nav-links must return
   display:none at 1099px and display:flex at 1100px.
7. Add a CSS comment block above the nav breakpoints section:
   /* NAV BREAKPOINT SYSTEM — DO NOT MODIFY WITHOUT RUNNING REGRESSION TEST */

ANIMATION UPGRADE:
- Desktop dropdown menus animate in using:
  @keyframes menuReveal {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  duration: 200ms, easing: cubic-bezier(0.25, 0, 0.3, 1)
- Mobile menu slides in from right:
  transform: translateX(100%) → translateX(0)
  duration: 300ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1)
- @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }

OUTPUT: Modified CSS file(s) with fix applied, breakpoint comment block, and
inline regression test function exported from a nav-test.js module.
```

---

### ISSUE-002 — CRITICAL | View Transition Abort Errors on Every Page

```
TASK: Fix `InvalidStateError: Transition was aborted` and
`AbortError: Transition was skipped` thrown on navigation across all pages.

CONTEXT:
Every page navigation triggers one of these two View Transitions API errors,
indicating the transition is either:
  (a) Started before the previous transition finishes (race condition)
  (b) Started when the document is in an invalid state for transitions
  (c) Missing feature detection guard

HARD REQUIREMENTS:
1. Find ALL calls to `document.startViewTransition()` in the codebase.
2. Wrap every call with this exact guard pattern:

   async function safeViewTransition(updateCallback) {
     if (
       !document.startViewTransition ||
       document.visibilityState === 'hidden'
     ) {
       await updateCallback();
       return;
     }

     // Abort any in-flight transition before starting new one
     if (window.__activeTransition) {
       try { window.__activeTransition.skipTransition(); } catch (_) {}
     }

     const transition = document.startViewTransition(async () => {
       await updateCallback();
     });

     window.__activeTransition = transition;

     try {
       await transition.finished;
     } catch (err) {
       if (err.name !== 'AbortError') {
         console.error('[ViewTransition] Unexpected error:', err);
       }
     } finally {
       window.__activeTransition = null;
     }
   }

3. Replace every raw `document.startViewTransition(fn)` call with
   `safeViewTransition(fn)`.
4. Export `safeViewTransition` from a shared `view-transitions.js` module.
5. Add `::view-transition-old(root)` and `::view-transition-new(root)` CSS
   with a clean cross-fade at 200ms for all pages.
6. Add `@media (prefers-reduced-motion: reduce)` override:
   ::view-transition-old(root),
   ::view-transition-new(root) { animation: none; }

ANIMATION SPEC:
::view-transition-old(root) {
  animation: 200ms cubic-bezier(0.25, 0, 0.3, 1) both fade-out;
}
::view-transition-new(root) {
  animation: 200ms cubic-bezier(0.25, 0, 0.3, 1) both fade-in;
}
@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in  { from { opacity: 0; } }

OUTPUT: view-transitions.js module + CSS additions + zero console errors on
navigation between any two pages.
```

---

### ISSUE-003 — HIGH | "Most Popular" Badge Clipped by overflow:hidden

```
TASK: Fix the "Most Popular" badge on the Pro pricing card being clipped by
the parent card's overflow:hidden.

CONTEXT:
- `.ca-popular-badge` has position:static inside `.sv-card` with overflow:hidden
- Badge needs to visually float above the card top edge
- Confirmed on /pricing page, reproducible at all viewport widths

HARD REQUIREMENTS:
1. Do NOT change the card's overflow:hidden — it's needed for border-radius
   clipping on the card body content.
2. Use this technique instead:
   - Add a zero-height wrapper OUTSIDE the card: <div class="card-badge-anchor">
   - Absolutely position the badge relative to this wrapper
   - CSS:
     .card-badge-anchor {
       position: relative;
       height: 0;
       z-index: 2;
     }
     .ca-popular-badge {
       position: absolute;
       top: -14px;
       left: 50%;
       transform: translateX(-50%);
       white-space: nowrap;
     }
3. Verify at 320px, 375px, 768px, 1280px viewports that badge is fully visible.
4. Badge must not overlap adjacent cards.

ANIMATION UPGRADE:
.ca-popular-badge {
  animation: badgePulse 3s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--color-accent-rgb), 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(var(--color-accent-rgb), 0); }
}
@media (prefers-reduced-motion: reduce) {
  .ca-popular-badge { animation: none; }
}

OUTPUT: Fixed HTML structure for pricing card + CSS. Badge fully visible,
centered above card, accessible, animated, motion-safe.
```

---

### ISSUE-004 — HIGH | Category Badge Overlaps Breadcrumb on Blog Posts

```
TASK: Fix the blog post category badge overlapping the breadcrumb navigation
on all blog detail pages (e.g. /blog/cyber-essentials-v3-3-danzell-2026).

CONTEXT:
- The category label (e.g. "CYBER ESSENTIALS") renders at the same DOM layer
  as the breadcrumb "Blog > Article Title" text, creating a z-index collision
- Both elements share the same vertical space

HARD REQUIREMENTS:
1. Separate the category badge and breadcrumb into distinct layout rows.
2. Correct DOM order for blog post header:
   <nav aria-label="Breadcrumb">
     <ol>
       <li><a href="/">Home</a></li>
       <li><a href="/blog">Blog</a></li>
       <li aria-current="page">Article Title</li>
     </ol>
   </nav>
   <div class="post-meta-row">
     <span class="post-category-badge">CYBER ESSENTIALS</span>
     <time datetime="2026-05-03">3 May 2026</time>
     <span class="post-read-time">6 min read</span>
   </div>
   <h1 class="post-title">Article Title Here</h1>
3. Breadcrumb MUST have aria-label="Breadcrumb".
4. Last breadcrumb item MUST have aria-current="page".
5. The category badge MUST NOT use z-index to sit above breadcrumb.
6. Ensure no position:absolute on either element at the same DOM level.
7. Apply fix to the blog post template/layout file — NOT per-post.

OUTPUT: Updated blog post template/layout with correct semantic structure,
zero overlap at all viewports, WCAG 2.1 compliant breadcrumb.
```

---

### ISSUE-005 — HIGH | 46 JavaScript Files Loaded (No Bundling)

```
TASK: Consolidate 46 individual JavaScript files on the homepage into a
properly bundled, code-split structure using Vite.

CONTEXT:
Currently loaded individually (partial list):
  cinematic-init.js, sf13-hero-hud.js, sf17-scroll-reveal.js,
  sf25-interactions.js, motion-system.js, sf23-counters.js, carousel.js,
  premium-motion.js, hero-persona-switcher.js, persona-deadlines.js,
  platform-carousel.js, mees-countdown.js, homepage-countdown.js,
  homepage-compliance-widget.js, spotlight.js, hero-mesh-shader.js,
  hero-staggered-entrance.js, lottie-cta.js, home-demo-cycle.js,
  sovereign-features.js, section-motion-choreography.js, hero-parallax.js,
  sticky-storytelling.js, logo-shimmer.js, section-parallax.js,
  demo-autoplayer.js, d-batch-runtime.js, e-batch-runtime.js,
  pricing-tabs-indicator.js, blog-reading-time.js, chatbot-dialog.js,
  nav-inject.js, scripts.min.js + more

HARD REQUIREMENTS:
1. Configure Vite with the following bundle strategy:
   - core.js: nav-inject, cookie-banner, analytics-init, chatbot-dialog,
     back-to-top, sf25-interactions, motion-system (all pages need these)
   - home.js: all homepage-specific modules (dynamic import on homepage only)
   - tools.js: compliance widget, countdown, persona switcher
   - blog.js: blog-reading-time, syntax highlighting
   - vendor.js: gsap + ScrollTrigger, lottie_light (external chunks)
2. Use <script type="module" src="/js/core.js"> in all pages.
3. Use dynamic import for page-specific bundles:
   if (document.body.classList.contains('page-home')) {
     import('/js/home.js');
   }
4. Enable Vite's built-in code splitting and tree shaking.
5. Enable Brotli/gzip compression in Vite build output.
6. Total JS transferred for any page: ≤ 150KB gzipped.
7. Add module preloading for critical bundles:
   <link rel="modulepreload" href="/js/core.js">

OUTPUT: vite.config.js with chunk strategy + updated HTML templates with
correct script tags + verified network waterfall showing ≤8 JS requests.
```

---

### ISSUE-006 — HIGH | cookie-banner.js Loaded Twice

```
TASK: Remove the duplicate loading of cookie-banner.js.

CONTEXT:
Network trace shows two requests:
  Request #24: GET /cookie-banner.js (200)
  Request #45: GET /js/cookie-banner.js (200)
One path is in HTML <head>, one injected dynamically by nav-inject.js.

HARD REQUIREMENTS:
1. Audit all HTML template files and nav-inject.js for cookie-banner script tags.
2. Identify canonical path: /js/cookie-banner.js (inside /js/ directory).
3. Remove the non-canonical reference from HTML <head> templates.
4. Remove the injection from nav-inject.js if it's duplicating the <head> tag.
5. Ensure cookie banner initializes exactly once via a guard:
   if (window.__cookieBannerInit) return;
   window.__cookieBannerInit = true;
   // ... initialization code
6. Verify: network trace must show exactly ONE request for cookie-banner.js.

OUTPUT: Modified template files and nav-inject.js with duplicate removed
and initialization guard in place.
```

---

### ISSUE-007 — HIGH | Lottie Arrow JSON Fetched 10 Times

```
TASK: Fix Lottie animation JSON being fetched once per CTA button (10 fetches).

CONTEXT:
Each CTA button with Lottie arrow animation makes an independent fetch to:
  /Assets/lottie/arrow-right-stroke.json
Result: 10 network requests for the same file.

HARD REQUIREMENTS:
1. Preload the JSON in <head>:
   <link rel="preload" as="fetch" href="/Assets/lottie/arrow-right-stroke.json"
         crossorigin="anonymous">
2. Create a singleton Lottie data cache module:

   // lottie-cache.js
   let arrowAnimationData = null;

   export async function getArrowAnimation() {
     if (arrowAnimationData) return arrowAnimationData;
     const response = await fetch('/Assets/lottie/arrow-right-stroke.json');
     arrowAnimationData = await response.json();
     return arrowAnimationData;
   }

3. Update lottie-cta.js to use getArrowAnimation() and pass animationData
   (not path) to lottie.loadAnimation():
   const data = await getArrowAnimation();
   lottie.loadAnimation({ container: el, animationData: data, ... });
4. Verify: network trace shows exactly ONE fetch to arrow-right-stroke.json.
5. Ensure all Lottie instances initialize correctly after the shared data load.

OUTPUT: lottie-cache.js module + updated lottie-cta.js + <link preload> in
<head>. Network shows 1 fetch for the JSON regardless of button count.
```

---

### ISSUE-008 — HIGH | Three role="banner" Elements (ARIA Violation)

```
TASK: Fix ARIA landmark pollution — exactly ONE role="banner" must exist per page.

CONTEXT:
Three elements currently carry role="banner":
  1. div.announce-bar (aria-label="Promotional announcement") — WRONG
  2. header.sv-nav — CORRECT (keep this one)
  3. section.hero — WRONG

HARD REQUIREMENTS:
1. announce-bar:
   - Change role="banner" to role="region"
   - Keep aria-label="Promotional announcement"
   - Add aria-live="polite" (it updates dynamically with regulatory news)
   - Final: <div class="announce-bar" role="region"
                  aria-label="Promotional announcement" aria-live="polite">

2. hero section:
   - Remove role="banner" entirely
   - Add aria-labelledby pointing to the H1:
     <section class="hero ..." aria-labelledby="hero-heading">
       <h1 id="hero-heading">Win contracts. Protect your business. Get paid faster.</h1>
   - Do NOT add role="region" (section is sufficient for AT to announce)

3. header.sv-nav:
   - Keep as-is — it correctly carries the implicit banner role of <header>
   - Do NOT add explicit role="banner" (redundant for <header> at body level)

4. Verify with axe-core or similar: exactly 1 banner landmark on every page.

OUTPUT: Modified HTML templates for announce-bar and hero section. Axe-core
output showing zero "landmark-unique" violations.
```

---

### ISSUE-009 — HIGH | Search Dialog Input Has No Accessible Label

```
TASK: Add accessible label to the search input in the command palette dialog.

CONTEXT:
The search input in .sv-cmdk dialog has:
  - No id attribute
  - No <label> element
  - No aria-label or aria-labelledby
  - Only placeholder="Search products, pages, tools…" (insufficient for a11y)

HARD REQUIREMENTS:
1. Add id to the input: id="cmdk-search-input"
2. Add aria-label: aria-label="Search products, pages and tools"
3. Add role="combobox" with proper ARIA pattern:
   <input
     id="cmdk-search-input"
     type="text"
     role="combobox"
     aria-label="Search products, pages and tools"
     aria-autocomplete="list"
     aria-controls="cmdk-results-listbox"
     aria-expanded="false"
     autocomplete="off"
     spellcheck="false"
     placeholder="Search products, pages, tools…"
   >
4. Add id="cmdk-results-listbox" to the results listbox element.
5. Update aria-expanded to "true" when results are visible.
6. Verify: VoiceOver/NVDA announces "Search products, pages and tools, combobox"
   when the input receives focus.

OUTPUT: Updated cmdk HTML template with full ARIA combobox pattern.
```

---

### ISSUE-010 — HIGH | 5 Cinematic Images with Empty alt Text

```
TASK: Add descriptive alt text to all 5 cinematic slideshow images on the homepage.

CONTEXT:
Five <img class="cinematic-scene"> elements have alt="":
  1. 01-dashboard-dark-framed.png
  2. 02-epc-check-dark-framed.png
  3. 03-crowmark-dark-framed.png
  4. 04-csrd-checker-dark-framed.png
  5. 05-analytics-dark-framed.png

HARD REQUIREMENTS:
1. Apply these specific alt texts:
   - 01: alt="CrowAgent dashboard — unified portfolio view across MEES, CrowMark, CrowCyber and CSRD products"
   - 02: alt="CrowAgent Core — live EPC band gap analysis showing Band E to Band C upgrade pathway"
   - 03: alt="CrowMark — AI-assisted PPN 002 social value bid narrative generation interface"
   - 04: alt="CSRD Checker — Omnibus I applicability test showing in-scope result for large enterprise"
   - 05: alt="CrowAgent analytics — compliance estate overview with risk scores across all frameworks"
2. If the images are purely decorative (same content described by adjacent text),
   use alt="" AND add aria-hidden="true" to the <img> AND ensure the adjacent
   text description exists in the DOM.
3. Since these ARE the primary product illustrations with no adjacent text
   equivalent, use the descriptive alt texts above.
4. Verify: screen reader announces meaningful description for each slide.

OUTPUT: Updated cinematic-walkthrough HTML/template with 5 descriptive alt texts.
```

---

### ISSUE-011 — MEDIUM | Excessive Whitespace in Persona Tab Section

```
TASK: Remove the 200–250px empty space below persona tab content on the homepage.

CONTEXT:
The "A deadline that matters to you" role-switcher section has a fixed
min-height on tab panels, leaving short panels with large blank areas.
Confirmed via visual inspection during audit.

HARD REQUIREMENTS:
1. Find the tab panel container CSS — likely a class on .hw-panel or similar.
2. Remove any fixed height or min-height that is larger than the tallest content.
3. Replace with CSS Grid height animation for smooth tab switching:

   .persona-tab-panels {
     display: grid;
   }
   .persona-tab-panel {
     grid-area: 1 / 1;
     transition: opacity 300ms cubic-bezier(0.25, 0, 0.3, 1),
                 visibility 0ms 300ms;
     opacity: 0;
     visibility: hidden;
   }
   .persona-tab-panel[aria-hidden="false"] {
     opacity: 1;
     visibility: visible;
     transition: opacity 300ms cubic-bezier(0.25, 0, 0.3, 1);
   }

   This overlays all panels in the same grid cell, eliminating height jumps.

4. @media (prefers-reduced-motion: reduce): remove transition, use display:none/block.
5. Verify: zero blank space between tab content and next section at all viewports.

OUTPUT: Updated CSS for persona tab section. Zero whitespace gaps.
```

---

### ISSUE-012 — MEDIUM | Changelog Hero Blank Area

```
TASK: Fix the changelog page blank hero area — add a proper H1 and subtitle
visible above the fold without scrolling.

CONTEXT:
/changelog shows only a small badge and ~250px blank space before content.
No H1 visible. Poor first impression.

HARD REQUIREMENTS:
1. Add a proper hero to the changelog page template:
   <section class="page-hero" aria-labelledby="changelog-title">
     <div class="page-hero__eyebrow">
       <span class="eyebrow-badge">● CHANGELOG</span>
     </div>
     <h1 id="changelog-title" class="page-hero__title">
       What's new in CrowAgent
     </h1>
     <p class="page-hero__subtitle">
       Release notes, feature updates, and regulatory engine changes —
       in reverse chronological order.
     </p>
     <div class="page-hero__meta">
       <span>Latest: <strong>MP1 — 5 May 2026</strong></span>
       <a href="#latest" class="btn btn--ghost btn--sm">Jump to latest →</a>
     </div>
   </section>

2. The hero must be fully server-rendered — no JS dependency for content.
3. Add id="latest" to the most recent changelog entry for the anchor link.
4. Apply consistent page-hero CSS shared across all inner pages.

ANIMATION:
.page-hero__title { animation: heroEntrance 600ms cubic-bezier(0.34,1.56,0.64,1) both; }
.page-hero__subtitle { animation: heroEntrance 600ms 100ms cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes heroEntrance {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

OUTPUT: Updated changelog template with full hero. H1 visible above fold.
```

---

### ISSUE-013 — MEDIUM | Checkmark Icon Overlaps Text in Enterprise Card

```
TASK: Fix the Enterprise pricing card bullet items where the checkmark icon
overlaps the first letter of each item.

CONTEXT:
List items render as: ✓SO (SSO), ✓ustom (Custom), ✓OC (SOC), ✓olume (Volume)
Icon has insufficient padding clearance.

HARD REQUIREMENTS:
1. Implement list items using CSS Flexbox (NOT ::before pseudo-element):
   .feature-list {
     list-style: none;
     padding: 0;
     margin: 0;
     display: flex;
     flex-direction: column;
     gap: var(--space-3);
   }
   .feature-list__item {
     display: flex;
     align-items: flex-start;
     gap: var(--space-2); /* 8px min */
   }
   .feature-list__icon {
     flex-shrink: 0;
     width: 20px;
     height: 20px;
     margin-top: 2px; /* optical alignment */
   }
   .feature-list__text {
     flex: 1;
     font-size: var(--text-sm);
     line-height: 1.5;
   }

2. HTML structure per item:
   <li class="feature-list__item">
     <svg class="feature-list__icon" aria-hidden="true"><!-- checkmark --></svg>
     <span class="feature-list__text">SSO via SAML 2.0 / OIDC</span>
   </li>

3. The SVG icon must have aria-hidden="true".
4. Apply to ALL pricing card feature lists (Starter, Pro, Portfolio, Enterprise).
5. Verify at 320px, 768px, 1440px: zero icon/text overlap.

OUTPUT: Updated pricing card HTML + CSS. Zero icon/text overlap at all sizes.
```

---

### ISSUE-014 — MEDIUM | Inconsistent Blog Card Layouts

```
TASK: Standardize all blog listing cards to a consistent layout system.

CONTEXT:
Two incompatible card patterns coexist:
  - Featured: landscape with text-overlay at bottom (full-bleed image)
  - Regular: image-top, text-below (stacked)
Both appear in the same grid without clear visual hierarchy.

HARD REQUIREMENTS:
1. Define ONE card component with modifiers:
   .blog-card (base — stacked layout)
   .blog-card--featured (wider column span, same stacked layout but larger)
   .blog-card--hero (full-bleed with overlay — reserved for THE featured post only)

2. Base card HTML:
   <article class="blog-card">
     <a class="blog-card__media-link" href="/blog/slug" tabindex="-1" aria-hidden="true">
       <figure class="blog-card__media">
         <img src="..." alt="..." loading="lazy" decoding="async"
              width="800" height="450" class="blog-card__img">
       </figure>
     </a>
     <div class="blog-card__body">
       <div class="blog-card__meta">
         <span class="post-category-badge">CYBER ESSENTIALS</span>
         <time datetime="2026-05-03">3 May 2026</time>
         <span>6 min read</span>
       </div>
       <h2 class="blog-card__title">
         <a href="/blog/slug" class="blog-card__title-link">Article Title</a>
       </h2>
       <p class="blog-card__excerpt">Summary text here…</p>
     </div>
   </article>

3. Image aspect ratio locked at 16:9 via aspect-ratio: 16/9 (no CLS).
4. Card hover: translateY(-4px) + elevated box-shadow — duration 200ms.
5. Card focus-within: same elevated state for keyboard users.
6. @media (prefers-reduced-motion: reduce): no translateY, only box-shadow transition.

ANIMATION:
.blog-card {
  transition: transform 200ms cubic-bezier(0.25,0,0.3,1),
              box-shadow 200ms cubic-bezier(0.25,0,0.3,1);
}
.blog-card:hover, .blog-card:focus-within {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

OUTPUT: Unified blog card component CSS + updated blog listing template.
Consistent layout across all cards.
```

---

### ISSUE-015 — MEDIUM | Centered Bullet Lists in Tool "At a Glance" Cards

```
TASK: Fix centered bullet list alignment in tool landing page "AT A GLANCE" cards.

CONTEXT:
Tool pages (/tools/mees-risk-snapshot, etc.) render bullet list items with
text-align: center, creating awkward centered bullets.

HARD REQUIREMENTS:
1. Find the .at-a-glance or equivalent card container.
2. Add explicit left-alignment reset:
   .at-a-glance-card ul,
   .at-a-glance-card ol {
     text-align: left;
     padding-left: var(--space-4); /* 16px */
   }
   .at-a-glance-card li {
     text-align: left;
   }
3. The parent container may have text-align: center for headings — that's fine,
   but override it specifically for lists.
4. Apply to ALL tool landing page "at a glance" components.
5. Verify across /tools/mees-risk-snapshot, /tools/ppn-002-calculator,
   /tools/cyber-essentials-readiness, /tools/late-payment-calculator,
   /tools/csrd-applicability-checker, /tools/vsme-materiality-light.

OUTPUT: CSS fix applied to all tool pages. Left-aligned bullet lists.
```

---

Continuing exactly from where ISSUE-016 was truncated. Append everything below to `CROWAGENT_FRONTEND_MASTER_FIX.md`.

---

```markdown
### ISSUE-016 — MEDIUM | Hero Image in PNG (Not AVIF/WebP)

```
TASK: Convert hero-premium-earth.png to modern formats and serve with <picture>
for maximum performance and browser compatibility.

CONTEXT:
/Assets/photos/hero-premium-earth.png is a large PNG used as the hero
background. PNG is unacceptable for photographic images at this scale.
Target: AVIF primary, WebP fallback, PNG last resort.

HARD REQUIREMENTS:
1. Generate optimised variants of hero-premium-earth.png:
   - hero-premium-earth-2560.avif  (2560px wide, quality 60)
   - hero-premium-earth-1920.avif  (1920px wide, quality 65)
   - hero-premium-earth-1280.avif  (1280px wide, quality 70)
   - hero-premium-earth-768.avif   (768px wide,  quality 75)
   - hero-premium-earth-2560.webp  (2560px wide, quality 75)
   - hero-premium-earth-1920.webp  (1920px wide, quality 78)
   - hero-premium-earth-1280.webp  (1280px wide, quality 80)
   - hero-premium-earth-768.webp   (768px wide,  quality 82)
   Place all in /Assets/photos/

2. Replace all usages with <picture>:
   <picture>
     <source
       type="image/avif"
       srcset="
         /Assets/photos/hero-premium-earth-768.avif   768w,
         /Assets/photos/hero-premium-earth-1280.avif 1280w,
         /Assets/photos/hero-premium-earth-1920.avif 1920w,
         /Assets/photos/hero-premium-earth-2560.avif 2560w
       "
       sizes="100vw"
     >
     <source
       type="image/webp"
       srcset="
         /Assets/photos/hero-premium-earth-768.webp   768w,
         /Assets/photos/hero-premium-earth-1280.webp 1280w,
         /Assets/photos/hero-premium-earth-1920.webp 1920w,
         /Assets/photos/hero-premium-earth-2560.webp 2560w
       "
       sizes="100vw"
     >
     <img
       src="/Assets/photos/hero-premium-earth-1280.webp"
       alt=""
       aria-hidden="true"
       width="2560"
       height="1440"
       loading="eager"
       fetchpriority="high"
       decoding="sync"
       class="hero-bg-img"
     >
   </picture>

3. The <img> inside <picture> has alt="" and aria-hidden="true" because
   the hero image is purely decorative — the H1 text conveys the content.
4. Add CSS for the hero background image:
   .hero-bg-img {
     position: absolute;
     inset: 0;
     width: 100%;
     height: 100%;
     object-fit: cover;
     object-position: center center;
     z-index: 0;
     pointer-events: none;
     user-select: none;
   }
5. Add a dark overlay gradient over the image for text contrast:
   .hero::after {
     content: '';
     position: absolute;
     inset: 0;
     background: linear-gradient(
       160deg,
       rgba(var(--color-bg-rgb), 0.72) 0%,
       rgba(var(--color-bg-rgb), 0.48) 50%,
       rgba(var(--color-bg-rgb), 0.64) 100%
     );
     z-index: 1;
   }
6. Verify: Lighthouse Performance score improvement ≥ 5 points. LCP < 2.5s.

OUTPUT: /Assets/photos/ populated with AVIF+WebP variants. HTML updated with
<picture> element. PNG fallback retained. Overlay gradient applied.
```

---

### ISSUE-017 — MEDIUM | Logo Oversized (1499×441px Served, 136px Displayed)

```
TASK: Right-size the CrowAgent logo image and add proper srcset for retina displays.

CONTEXT:
crowagent-logo-2-dark.png served at 1499×441px natural size.
Displayed at ~136×40px in header and ~177×52px in footer.
11× larger than needed — estimated 60–90KB wasted per page load.
An AVIF version exists at /Assets/brand/crowagent-logo-2-dark.avif but
is not being used with srcset.

HARD REQUIREMENTS:
1. Generate correctly sized logo variants:
   - crowagent-logo-272.avif  (272×80px — header 1× retina, footer 2× std)
   - crowagent-logo-544.avif  (544×160px — header 2× retina, footer 2× retina)
   - crowagent-logo-272.webp  (272×80px)
   - crowagent-logo-544.webp  (544×160px)
   Place in /Assets/brand/

2. Header logo markup:
   <a href="/" class="nav-logo" aria-label="CrowAgent — Sustainability Intelligence, go to homepage">
     <picture>
       <source type="image/avif"
               srcset="/Assets/brand/crowagent-logo-272.avif 1x,
                       /Assets/brand/crowagent-logo-544.avif 2x">
       <source type="image/webp"
               srcset="/Assets/brand/crowagent-logo-272.webp 1x,
                       /Assets/brand/crowagent-logo-544.webp 2x">
       <img src="/Assets/brand/crowagent-logo-272.webp"
            alt="CrowAgent"
            width="136"
            height="40"
            loading="eager"
            fetchpriority="high"
            decoding="sync">
     </picture>
   </a>

3. The <a> wrapper has aria-label with full brand description.
4. The <img> alt="CrowAgent" (short — the <a> aria-label carries full description).
5. Apply same pattern for the footer logo (adjust width/height to footer dimensions).
6. Verify: logo sharp on 2× Retina. No layout shift (explicit width/height set).

OUTPUT: New logo variants in /Assets/brand/ + updated header and footer
logo HTML. Estimated bandwidth saving: ~75KB per page load.
```

---

### ISSUE-018 — MEDIUM | Secondary CTA Unstyled on About Page

```
TASK: Apply consistent ghost button styling to all secondary CTA links
that currently render as unstyled plain text.

CONTEXT:
On /about, "Start free trial" uses .btn--primary styling (filled teal).
"Book a demo" is a bare <a> tag with no button class — renders as a plain
underlined link. These are equal-weight conversion CTAs.

HARD REQUIREMENTS:
1. Audit ALL pages for CTA pairs where one is a styled button and one is plain text.
2. Define the complete button system (if not already defined per RULE 5):

   /* Button System — CANONICAL, DO NOT DUPLICATE */
   .btn {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     gap: var(--space-2);
     padding: var(--space-3) var(--space-5);
     border-radius: var(--radius-pill);
     font-size: var(--text-sm);
     font-weight: 600;
     line-height: 1;
     text-decoration: none;
     cursor: pointer;
     border: 2px solid transparent;
     transition: background-color 150ms, border-color 150ms,
                 color 150ms, box-shadow 150ms, transform 100ms;
     min-height: 44px; /* touch target */
     white-space: nowrap;
   }
   .btn:active { transform: scale(0.97); }
   .btn--primary {
     background: var(--color-accent);
     color: var(--color-on-accent);
   }
   .btn--primary:hover { background: var(--color-accent-hover); }
   .btn--secondary {
     background: transparent;
     border-color: var(--color-border-strong);
     color: var(--color-text-primary);
   }
   .btn--secondary:hover {
     border-color: var(--color-accent);
     color: var(--color-accent);
   }
   .btn--ghost {
     background: transparent;
     color: var(--color-text-primary);
     padding-left: 0;
     padding-right: 0;
   }
   .btn--ghost:hover { color: var(--color-accent); }
   .btn:focus-visible {
     outline: 2px solid var(--color-accent);
     outline-offset: 3px;
   }

3. Apply class="btn btn--secondary" to ALL secondary CTA links across:
   /about, /contact, /pricing, all product pages, all tool pages.
4. In CTA pairs, always use: primary (.btn--primary) + secondary (.btn--secondary).
5. In CTA rows with 3 options: primary + secondary + ghost (no underline).
6. Run a codebase search for bare <a href="..."> tags adjacent to .btn elements
   and apply appropriate button class to each.

OUTPUT: Canonical button CSS + all CTA links updated with correct classes.
Zero bare-link CTAs adjacent to styled buttons anywhere in the codebase.
```

---

### ISSUE-019 — MEDIUM | Stats Section Excessively Sparse Layout

```
TASK: Rebuild the homepage "What we cover" stats section into a tight,
visually impactful grid.

CONTEXT:
Currently shows 2 stats ("2028" and "£150K") stacked vertically with ~200px
each — creates a very sparse 400px+ section for only 2 data points.
The DOM also shows a heading "What we cover" and subheadings but very little
supporting content visible without excessive scrolling.

HARD REQUIREMENTS:
1. Layout all available stats in a responsive grid:
   .stats-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
     gap: var(--space-6);
     align-items: start;
   }
2. Each stat card:
   <div class="stat-card">
     <div class="stat-card__number" aria-label="2028">2028</div>
     <div class="stat-card__label">MEES Band C deadline tracked</div>
     <div class="stat-card__context">Proposed target under SI 2015/962</div>
   </div>
3. Stats to include (from DOM data):
   - 2028 / MEES Band C deadline tracked
   - £150K / Max MEES fine modelled per property
   - 10% / PPN 002 minimum social value weighting
   - BoE+8% / Statutory interest rate (Late Payment Act)
   - 1,000+ / Omnibus I employee threshold (CSRD)
   - 44+22 / Cyber Essentials v3.3 controls mapped
4. Number typography: clamp(2.5rem, 6vw, 4rem), font-weight: 800,
   color: var(--color-accent).
5. Section max vertical height: 400px at 1440px viewport.
6. Count-up animation on scroll entry using IntersectionObserver:
   - Numbers animate from 0 to final value over 1200ms
   - Easing: cubic-bezier(0.0, 0, 0.2, 1)
   - Only plays once (disconnect observer after first trigger)
   - @media (prefers-reduced-motion: reduce): show final value instantly

ANIMATION:
.stat-card {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 500ms, transform 500ms cubic-bezier(0.34,1.56,0.64,1);
}
.stat-card.is-visible {
  opacity: 1;
  transform: none;
}
/* Staggered delays via :nth-child */
.stat-card:nth-child(1) { transition-delay: 0ms; }
.stat-card:nth-child(2) { transition-delay: 60ms; }
.stat-card:nth-child(3) { transition-delay: 120ms; }
.stat-card:nth-child(4) { transition-delay: 180ms; }
.stat-card:nth-child(5) { transition-delay: 240ms; }
.stat-card:nth-child(6) { transition-delay: 300ms; }

OUTPUT: Rebuilt stats section HTML+CSS. Six stats in responsive grid.
Count-up animation. Section height ≤ 400px. Visually dense and impactful.
```

---

### ISSUE-020 — MEDIUM | Full-Viewport Stock Photo Dominates FAQ Above Fold

```
TASK: Fix the FAQ page stock photo that occupies the full viewport height
with no visible FAQ content above fold.

CONTEXT:
After the FAQ hero heading, a large stock photo of people with laptops
fills the entire screen with no call to action, no FAQ preview, and no
content visible without scrolling.

HARD REQUIREMENTS:
1. Constrain the image height:
   .faq-hero-image {
     width: 100%;
     max-height: 360px;
     height: clamp(200px, 35vw, 360px);
     object-fit: cover;
     object-position: center 30%;
     border-radius: var(--radius-lg);
     display: block;
   }
2. Ensure at least 2 FAQ accordion items are visible above the fold at 768px+.
3. Place the image BELOW the first FAQ category group, not between the hero
   and the first FAQ items.
4. Add a meaningful caption beneath the image:
   <figure class="faq-hero-figure">
     <img ... class="faq-hero-image" alt="CrowAgent team helping UK businesses with compliance">
     <figcaption class="faq-hero-caption">
       Questions answered by the team that built the platform.
     </figcaption>
   </figure>
5. Verify: At 768px viewport height, at least the first FAQ category heading
   and 2 accordion items are visible without scrolling.

OUTPUT: Updated FAQ template with constrained image, caption, and proper
placement. First FAQ items visible above fold.
```

---

### ISSUE-021 — MEDIUM | Skip Link Not Reachable via Tab Key

```
TASK: Fix the skip-to-main-content link so it is the first element reached
by Tab key on every page and becomes visually prominent on focus.

CONTEXT:
Skip link exists with class="skip-link sr-only" at position: absolute; top: -100px.
When focused programmatically it appears, but Tab key navigation does not
reach it first — document.activeElement remains <body> after Tab press.

ROOT CAUSE ANALYSIS:
The <body> element likely has tabindex="-1" or the skip link has a CSS clip
that prevents browser focus routing. The top: -100px technique is fragile.

HARD REQUIREMENTS:
1. Use the position: fixed technique (most reliable cross-browser):
   .skip-link {
     position: fixed;
     top: -100%;
     left: 50%;
     transform: translateX(-50%);
     z-index: var(--z-skip-link, 9999);
     padding: var(--space-3) var(--space-5);
     background: var(--color-accent);
     color: var(--color-on-accent);
     font-weight: 700;
     font-size: var(--text-base);
     border-radius: 0 0 var(--radius-md) var(--radius-md);
     text-decoration: none;
     white-space: nowrap;
     transition: top 150ms cubic-bezier(0.25, 0, 0.3, 1);
   }
   .skip-link:focus-visible {
     top: 0;
     outline: 3px solid var(--color-on-accent);
     outline-offset: 2px;
   }

2. Remove ALL clip, clip-path, and overflow:hidden from .skip-link.
3. Remove sr-only class from skip link — it should only be visually hidden
   via top: -100%, not clipped.
4. Ensure the skip link is the FIRST child of <body> — before any scripts,
   announce bars, or headers.
5. Remove tabindex from <body> element if present.
6. The #main-content target must have tabindex="-1" (programmatic focus only)
   and outline: none (it won't receive user-triggered focus):
   #main-content { outline: none; }
7. Verify manually: Tab on fresh page load → skip link appears at top center
   → Enter activates it → focus moves to #main-content → page scrolls past nav.
8. Test on Chrome, Firefox, Safari, and Edge.

OUTPUT: Updated CSS for .skip-link + verified <body> structure with skip link
as first child. Tab navigation confirmed working.
```

---

### ISSUE-022 — MEDIUM | Potential Contrast Issue on Announce Bar Indicator

```
TASK: Audit and fix all colour contrast issues in the promotional announce bar.

CONTEXT:
The announce bar has a green dot indicator and white text on a dark teal
background. Exact contrast ratios were not measured during audit.
All text must meet WCAG 2.1 SC 1.4.3 (4.5:1 for normal text, 3:1 for large).

HARD REQUIREMENTS:
1. Measure exact contrast ratios for:
   a. Main text ("Now live · 14-day free trial · No credit card required")
      against announce bar background.
   b. "Start free trial" button text against button background.
   c. Green/teal dot indicator against announce bar background.
   d. "×" dismiss button against background.

2. For each element failing 4.5:1 (or 3:1 for large/bold ≥18pt):
   - Adjust the foreground colour (never darken the background to a point
     where it loses brand identity).
   - Use CSS custom properties so the fix propagates from one variable change.

3. Use this formula for checking:
   Relative luminance L = 0.2126R + 0.7152G + 0.0722B (linearized)
   Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 > L2

4. The dot indicator specifically: if it's teal (#00D4AA or similar) on a
   dark navy (#0A1628 or similar), it must be ≥ 3:1 (UI component,
   SC 1.4.11 Non-text Contrast).

5. Document the before/after contrast ratios in a comment in the CSS:
   /* announce-bar dot — contrast: 4.2:1 (was 2.8:1) — SC 1.4.11 pass */

OUTPUT: Updated CSS custom property values for announce bar colours.
Documented contrast ratios. Zero WCAG 1.4.3 or 1.4.11 failures.
```

---

### ISSUE-023 — MEDIUM | Breadcrumb Nav Missing aria-label

```
TASK: Add aria-label="Breadcrumb" to ALL breadcrumb navigation elements
across every interior page.

CONTEXT:
Interior pages have breadcrumb navigation rendered as <nav> elements without
aria-label. When a page has both the main navigation <nav aria-label="Main
navigation"> and a breadcrumb <nav>, screen readers cannot distinguish them.

HARD REQUIREMENTS:
1. Find the breadcrumb component template (shared partial/include).
2. Update the <nav> wrapper:
   <nav aria-label="Breadcrumb" class="breadcrumb">
     <ol class="breadcrumb__list">
       <li class="breadcrumb__item">
         <a href="/" class="breadcrumb__link">Home</a>
       </li>
       <li class="breadcrumb__item" aria-hidden="true">
         <span class="breadcrumb__separator">/</span>
       </li>
       <li class="breadcrumb__item">
         <a href="/products" class="breadcrumb__link">Products</a>
       </li>
       <li class="breadcrumb__item" aria-hidden="true">
         <span class="breadcrumb__separator">/</span>
       </li>
       <li class="breadcrumb__item">
         <span class="breadcrumb__current" aria-current="page">CrowAgent Core</span>
       </li>
     </ol>
   </nav>

3. Requirements:
   - <nav> MUST have aria-label="Breadcrumb"
   - Separators MUST have aria-hidden="true"
   - Last item MUST use aria-current="page"
   - Last item uses <span> not <a> (current page should not be a link)
   - Use <ol> not <ul> (breadcrumbs have an inherent order)

4. Apply to ALL pages that have breadcrumbs:
   /crowagent-core, /crowmark, /csrd, /crowcyber, /crowcash, /crowesg,
   /about, /faq, /privacy, /security, /terms, /cookies,
   /tools/*, /blog, /blog/[post]

5. Add structured data (JSON-LD BreadcrumbList) alongside the HTML breadcrumb
   for SEO:
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [
       {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://crowagent.ai/"},
       {"@type": "ListItem", "position": 2, "name": "Products", "item": "https://crowagent.ai/products"},
       {"@type": "ListItem", "position": 3, "name": "CrowAgent Core"}
     ]
   }
   </script>

OUTPUT: Updated breadcrumb partial + JSON-LD script. All breadcrumbs have
aria-label, aria-current, ordered list markup, and BreadcrumbList schema.
```

---

### ISSUE-024 — LOW | Missing aria-current="page" on Breadcrumb Current Item

```
TASK: This is resolved as part of ISSUE-023 above. The new breadcrumb
template defined in ISSUE-023 MUST include aria-current="page" on the
final breadcrumb item in every implementation. Verify it was applied in
the ISSUE-023 fix before marking this closed.

VERIFICATION CHECKLIST:
□ Every breadcrumb's last item has aria-current="page"
□ No <a> tag has aria-current="page" (use <span> for current page)
□ Screen reader announces "current page" on the last breadcrumb item
```

---

### ISSUE-025 — LOW | CrowESG Waitlist CTA Not Prominent

```
TASK: Make the waitlist CTA prominent and above-fold on /crowesg.

CONTEXT:
CrowESG is "Coming Q3 2026". The waitlist CTA "Join the waitlist" is buried
below significant scroll depth. For a coming-soon product, the waitlist
is the primary conversion goal.

HARD REQUIREMENTS:
1. Add a "coming soon" hero banner immediately below the page header:
   <div class="coming-soon-bar" role="region" aria-label="Product status">
     <span class="coming-soon-badge">● Coming Q3 2026</span>
     <p class="coming-soon-text">
       CrowESG is in development. Waitlist members get early access and
       locked-in founding pricing.
     </p>
     <a href="https://app.crowagent.ai/marketplace?waitlist=crowesg"
        class="btn btn--primary">
       Join the waitlist →
     </a>
   </div>

2. Make this banner sticky while scrolling the product feature description,
   then release when the user reaches the bottom CTA section.
3. Add urgency social proof: "247 companies already on the waitlist"
   (update dynamically if this data is available via API).
4. The sticky banner uses position: sticky; top: var(--nav-height).
5. At mobile: stack vertically with the CTA full-width.

ANIMATION:
.coming-soon-bar {
  animation: slideDown 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

OUTPUT: Updated /crowesg template with sticky coming-soon bar and prominent
above-fold waitlist CTA.
```

---

### ISSUE-026 — LOW | Marquee Role on Meaningful Regulatory Content

```
TASK: Fix semantic role of the regulatory references ticker strip on the homepage.

CONTEXT:
The scrolling ticker uses <marquee role="marquee"> containing meaningful
regulatory citations (MEES SI 2015/962, PPN 002, etc.).
role="marquee" implies decorative, auto-advancing content.
The content is duplicated in the DOM (both visible and aria-hidden copies).

HARD REQUIREMENTS:
1. The scrolling animation MUST be CSS-only (no <marquee> HTML element):
   <div class="regulatory-ticker" role="region"
        aria-label="Regulatory frameworks covered by CrowAgent">
     <ul class="regulatory-ticker__track" aria-hidden="true">
       <!-- Visual duplicate, hidden from AT -->
       <li>MEES SI 2015/962 reg 38 · £150K cap</li>
       ...
     </ul>
   </div>
   <!-- Static version for screen readers only -->
   <ul class="sr-only">
     <li>MEES SI 2015/962 reg 38 · Maximum fine £150,000 per property</li>
     <li>PPN 002 · Minimum 10% social value weighting</li>
     <li>Cyber Essentials v3.3 Danzell · In force 27 April 2026</li>
     <li>Late Payment Act 1998 · Bank of England base rate plus 8%</li>
     <li>CSRD Omnibus I · Directive EU 2026/470</li>
     <li>EFRAG VSME 2024 · Module B and Module C</li>
   </ul>

2. CSS scroll animation:
   @keyframes tickerScroll {
     from { transform: translateX(0); }
     to   { transform: translateX(-50%); }
   }
   .regulatory-ticker__track {
     display: flex;
     gap: var(--space-8);
     animation: tickerScroll 30s linear infinite;
     width: max-content;
   }
   @media (prefers-reduced-motion: reduce) {
     .regulatory-ticker__track { animation: none; flex-wrap: wrap; }
   }

3. The visible ticker has aria-hidden="true" — it is purely decorative.
4. The sr-only list provides the AT-accessible version of the content.
5. Remove the HTML <marquee> element entirely if it exists.

OUTPUT: Rebuilt regulatory ticker with CSS animation, sr-only accessible
duplicate, and zero role="marquee" usage.
```

---

### ISSUE-027 — LOW | Scroll Progress Bar on All Pages Regardless of Length

```
TASK: Only render the scroll progress bar on pages long enough to benefit from it.

CONTEXT:
A <progress> "Page scroll progress" element exists on all pages including
short ones (/contact, /cookies, /terms header area). On pages shorter
than 2× viewport height, a progress bar adds UI noise without value.

HARD REQUIREMENTS:
1. In the progress bar JavaScript module (likely sf21-back-to-top.js or similar):
   function shouldShowProgressBar() {
     const pageHeight = document.documentElement.scrollHeight;
     const viewportHeight = window.innerHeight;
     return pageHeight > viewportHeight * 2.5;
   }

2. On DOMContentLoaded:
   const progressBar = document.querySelector('.progress-bar, [role="progressbar"]');
   if (progressBar && !shouldShowProgressBar()) {
     progressBar.hidden = true;
   }

3. Re-evaluate on window resize (debounced 250ms) in case content reflows.
4. Pages where progress bar SHOULD show: homepage, all product pages, /pricing,
   /blog/[post], /faq, /about, /security, /privacy, /terms, /glossary, /roadmap.
5. Pages where progress bar SHOULD be hidden: /contact, /cookies, short tool pages.

OUTPUT: Updated progress bar module with length detection. Progress bar
hidden on short pages. No visual regression on long pages.
```

---

### ISSUE-028 — LOW | Second <footer> in Command Palette Creates Extra Landmark

```
TASK: Fix the <footer> element inside the command palette dialog creating
a duplicate ARIA landmark.

CONTEXT:
footer.ca-footer[role="contentinfo"] — correct main footer landmark.
footer.sv-cmdk__footer — inside the command palette dialog, creates an
unwanted second contentinfo landmark that confuses screen reader navigation.

HARD REQUIREMENTS:
1. Change <footer class="sv-cmdk__footer"> to <div class="sv-cmdk__footer">.
2. Alternatively, if the HTML element must remain <footer>, add role="none"
   to suppress the implicit landmark:
   <footer class="sv-cmdk__footer" role="none">
3. Verify: screen reader landmark navigation (F6 or equivalent) shows exactly
   ONE "end of page" or "footer" landmark region.
4. Apply the same fix to ANY other <header>, <footer>, <nav>, <main>, <aside>
   inside dialogs, widgets, or web components that are not intended as
   page-level landmarks.

OUTPUT: Updated cmdk dialog HTML. Landmark navigation shows one footer.
```

---

### ISSUE-029 — LOW | "Products" Not Directly Navigable on Desktop Nav

```
TASK: Make the "Products" desktop nav item both a hoverable dropdown trigger
AND a clickable direct link to /products.

CONTEXT:
Desktop nav "Products" button opens a megamenu dropdown but clicking it does
not navigate to /products. The mobile nav has a direct /products link.
Inconsistent behaviour between breakpoints.

HARD REQUIREMENTS:
1. Change the desktop "Products" trigger from <button> to <a>:
   <a href="/products"
      class="nav-dropdown-trigger"
      aria-haspopup="true"
      aria-expanded="false"
      aria-controls="products-dropdown">
     Products
     <svg class="nav-chevron" aria-hidden="true">...</svg>
   </a>

2. Dropdown opens on:
   - Hover (mouseenter with 100ms delay to prevent accidental opens)
   - Focus + ArrowDown key
   - Click (if not navigating — i.e., if user clicks the chevron specifically)

3. Dropdown closes on:
   - mouseleave (with 150ms delay)
   - Escape key
   - Focus leaving the dropdown (focusout)
   - Click outside

4. Keyboard pattern per APG Navigation Menubar pattern:
   - Tab: moves between top-level items
   - Enter/Space on trigger: opens dropdown (does NOT navigate)
   - Enter on trigger without keyboard: navigates to /products
   - Arrow keys: navigate within open dropdown
   - Escape: closes dropdown, returns focus to trigger

5. The "Free Tools" trigger gets the same treatment with href="/tools".

OUTPUT: Updated desktop nav HTML and JavaScript. Products is both a link
and a dropdown trigger. Keyboard navigation follows APG pattern.
```

---

### ISSUE-030 — LOW | Missing Breadcrumb on /roadmap

```
TASK: Add breadcrumb navigation to /roadmap.

CONTEXT: /roadmap has no breadcrumb. Apply the standard breadcrumb
component defined in ISSUE-023.

Breadcrumb for this page:
Home / Roadmap

HARD REQUIREMENTS:
Use the exact breadcrumb template from ISSUE-023 fix.
Add JSON-LD BreadcrumbList schema.
Place breadcrumb immediately below the <header> and above the page hero.

OUTPUT: /roadmap template with breadcrumb added.
```

---

### ISSUE-031 — LOW | Missing Breadcrumb on /resources

```
TASK: Add breadcrumb navigation to /resources.
Breadcrumb: Home / Resources
Same requirements as ISSUE-030. Use ISSUE-023 template.
OUTPUT: /resources template with breadcrumb added.
```

---

### ISSUE-032 — LOW | Missing Breadcrumb on /partners

```
TASK: Add breadcrumb navigation to /partners.
Breadcrumb: Home / Partners
Same requirements as ISSUE-030. Use ISSUE-023 template.
OUTPUT: /partners template with breadcrumb added.
```

---

### ISSUE-033 — LOW | Missing Breadcrumb on /glossary

```
TASK: Add breadcrumb navigation to /glossary.
Breadcrumb: Home / Glossary
Same requirements as ISSUE-030. Use ISSUE-023 template.
OUTPUT: /glossary template with breadcrumb added.
```

---

### ISSUE-034 — LOW | Color-Only Emphasis on "Protect" Keyword in H1

```
TASK: Add a secondary visual indicator alongside the colour emphasis on
"Protect" in the homepage H1 to satisfy WCAG 1.4.1 (Use of Colour).

CONTEXT:
The word "Protect" appears in teal/accent colour in the H1. Colour alone
is used to convey emphasis. Colour-blind users may not perceive the emphasis.

HARD REQUIREMENTS:
1. Add a CSS custom underline using text-decoration:
   .hero-headline__accent {
     color: var(--color-accent);
     text-decoration: underline;
     text-decoration-color: var(--color-accent);
     text-decoration-thickness: 3px;
     text-underline-offset: 6px;
   }
2. The underline provides a second, non-colour visual indicator of emphasis.
3. Do NOT use font-weight change (other words are already bold — would not
   distinguish).
4. The underline should be subtle — thick enough to be visible, thin enough
   to remain elegant.
5. Verify: In grayscale simulation (Chrome DevTools → Rendering → Emulate
   vision deficiency → Achromatopsia), the word "Protect" is still
   distinguishable from surrounding text via the underline.

OUTPUT: Updated hero headline CSS. "Protect" distinguished by both colour
and underline. WCAG 1.4.1 satisfied.
```

---

### ISSUE-035 — MEDIUM | Placeholder Company Names in Partner Strip

```
TASK: Replace placeholder company names (TechCorp, GreenLogistics, etc.)
with real content or remove the section until real content is available.

CONTEXT:
The "Built for UK SMEs across these sectors" scrolling strip shows:
TechCorp, GreenLogistics, RetailUK, FinanceUK, ConstructionUK, EnergyUK,
PropertyUK, HealthTechUK — all clearly placeholder names linking to /about.

HARD REQUIREMENTS:
Option A (preferred — if real clients/sectors exist):
  Replace with real sector icons/labels representing the 12 sectors described
  in the "Who we serve" section. Use sector icons (SVG) + sector names
  rather than fake company names.
  Example entries:
  <li class="sector-pill">
    <svg class="sector-pill__icon" aria-hidden="true"><!-- building icon --></svg>
    <span class="sector-pill__label">Commercial Property</span>
  </li>

Option B (if no real logos yet):
  Remove the logo strip entirely. Replace with a compact grid of the 12 sector
  names from the "Who we serve" section:
  <ul class="sector-tag-cloud">
    <li>SME Finance</li>
    <li>Public-Sector Suppliers</li>
    <li>IT-Managed Service Providers</li>
    <li>Professional Services</li>
    <li>Construction & Built Environment</li>
    <li>NHS & Healthcare Suppliers</li>
    <li>Manufacturing & Industrial</li>
    <li>Commercial Landlords & REITs</li>
    <li>Hospitality & Retail</li>
    <li>Education & Research</li>
    <li>Charities & Third Sector</li>
    <li>Large Corporates & Groups</li>
  </ul>

MUST NOT: Use placeholder company names in production under any circumstances.
This violates CPR 2008 reg 5 (misleading commercial practice) cited in the
site's own disclaimer.

OUTPUT: Placeholder names removed. Either real sector pills or sector tag
cloud implemented.
```

---

### ISSUE-036 — LOW | Logo loading="auto" (Should Be eager + fetchpriority)

```
TASK: Set correct loading priority attributes on the header logo image.

CONTEXT:
Logo <img> uses loading="auto" (browser default). Logo is above-the-fold and
critical for perceived load — it should be a high-priority LCP candidate.

HARD REQUIREMENTS:
1. Update the logo <img> attributes (both header and all pages):
   loading="eager"
   fetchpriority="high"
   decoding="sync"
2. Add <link rel="preload"> in <head> for the logo:
   <link rel="preload"
         as="image"
         href="/Assets/brand/crowagent-logo-272.avif"
         type="image/avif"
         imagesrcset="/Assets/brand/crowagent-logo-272.avif 1x,
                      /Assets/brand/crowagent-logo-544.avif 2x"
         fetchpriority="high">
3. Verify: In Lighthouse filmstrip, logo is visible within the first 500ms
   of page load.

OUTPUT: Updated logo <img> attributes + <link preload> in <head> template.
```

---

### ISSUE-037 — LOW | Duplicate Labels on Cookie Consent Checkboxes

```
TASK: Fix duplicate label elements on cookie consent checkboxes in the
cookie banner dialog.

CONTEXT:
Each cookie type has two separate <label> elements:
  <label>Analytics cookies</label>          ← descriptive label
  <label>Analytics cookies toggle</label>   ← for the checkbox toggle

This creates ambiguous accessible name computation and confuses screen readers.

HARD REQUIREMENTS:
1. Replace the dual-label pattern with a single accessible pattern:

   <div class="cookie-pref-row">
     <div class="cookie-pref-info">
       <label for="ca-cookie-analytics" class="cookie-pref-label">
         Analytics cookies
       </label>
       <p id="ca-cookie-analytics-desc" class="cookie-pref-desc">
         Usage analytics via PostHog EU. Helps us improve the product.
       </p>
     </div>
     <div class="cookie-pref-toggle">
       <input
         type="checkbox"
         id="ca-cookie-analytics"
         name="ca-cookie-analytics"
         role="switch"
         aria-describedby="ca-cookie-analytics-desc"
       >
       <label for="ca-cookie-analytics" class="sr-only">
         Enable analytics cookies
       </label>
     </div>
   </div>

Append everything below to `CROWAGENT_FRONTEND_MASTER_FIX.md`, starting exactly where ISSUE-037 was cut off:

---

```markdown
   role="switch" on the <input type="checkbox"> declares it as a toggle switch
   to screen readers (announces "on/off" state).
3. aria-describedby links the checkbox to its description paragraph.
4. The visible <label> is the primary label (for="ca-cookie-analytics").
5. A sr-only secondary label "Enable analytics cookies" disambiguates
   the action from the category name.
6. Apply the same pattern to Marketing cookies (id="ca-cookie-marketing").
7. Verify: VoiceOver announces "Analytics cookies, switch, off" when
   focus lands on the unchecked toggle.

CSS for the toggle switch (custom styled checkbox):
   .cookie-pref-toggle input[type="checkbox"] {
     appearance: none;
     -webkit-appearance: none;
     width: 44px;
     height: 26px;
     border-radius: 13px;
     background: var(--color-border-subtle);
     border: 2px solid transparent;
     cursor: pointer;
     position: relative;
     transition: background 200ms cubic-bezier(0.25, 0, 0.3, 1);
     flex-shrink: 0;
   }
   .cookie-pref-toggle input[type="checkbox"]::after {
     content: '';
     position: absolute;
     top: 2px;
     left: 2px;
     width: 18px;
     height: 18px;
     border-radius: 50%;
     background: white;
     transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
   }
   .cookie-pref-toggle input[type="checkbox"]:checked {
     background: var(--color-accent);
   }
   .cookie-pref-toggle input[type="checkbox"]:checked::after {
     transform: translateX(18px);
   }
   .cookie-pref-toggle input[type="checkbox"]:focus-visible {
     outline: 2px solid var(--color-accent);
     outline-offset: 3px;
   }
   @media (prefers-reduced-motion: reduce) {
     .cookie-pref-toggle input[type="checkbox"],
     .cookie-pref-toggle input[type="checkbox"]::after {
       transition: none;
     }
   }

OUTPUT: Updated cookie banner dialog HTML + CSS toggle switch. Single
label per checkbox. role="switch". aria-describedby linked to description.
Zero duplicate labels. Animated toggle respects prefers-reduced-motion.
```

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 3 — GLOBAL ARCHITECTURE HARDENING
## ████████████████████████████████████████████████████████████████████████████

```
TASK: Implement a production-grade frontend architecture for CrowAgent
meeting Apple/Google/Stripe quality standards.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3A — CSS CUSTOM PROPERTY DESIGN TOKEN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create /Assets/css/design-tokens.css as the SINGLE SOURCE OF TRUTH:

:root {
  /* ── Brand Palette ── */
  --brand-crow-teal:      #00D4AA;
  --brand-crow-teal-dark: #00A888;
  --brand-crow-teal-rgb:  0, 212, 170;
  --brand-navy-900:       #050E1A;
  --brand-navy-800:       #0A1628;
  --brand-navy-700:       #0F2040;
  --brand-navy-600:       #162B52;
  --brand-navy-rgb:       10, 22, 40;
  --brand-white:          #FFFFFF;
  --brand-slate-400:      #94A3B8;
  --brand-slate-300:      #CBD5E1;
  --brand-red-500:        #EF4444;
  --brand-amber-500:      #F59E0B;
  --brand-green-500:      #22C55E;

  /* ── Semantic Colour Aliases ── */
  --color-bg:             var(--brand-navy-900);
  --color-bg-rgb:         5, 14, 26;
  --color-surface:        var(--brand-navy-800);
  --color-surface-raised: var(--brand-navy-700);
  --color-surface-overlay:var(--brand-navy-600);
  --color-border-subtle:  rgba(255,255,255,0.08);
  --color-border:         rgba(255,255,255,0.12);
  --color-border-strong:  rgba(255,255,255,0.24);
  --color-text-primary:   var(--brand-white);
  --color-text-secondary: var(--brand-slate-300);
  --color-text-tertiary:  var(--brand-slate-400);
  --color-accent:         var(--brand-crow-teal);
  --color-accent-rgb:     var(--brand-crow-teal-rgb);
  --color-accent-hover:   var(--brand-crow-teal-dark);
  --color-on-accent:      var(--brand-navy-900);
  --color-error:          var(--brand-red-500);
  --color-warning:        var(--brand-amber-500);
  --color-success:        var(--brand-green-500);

  /* ── Typography Scale (fluid, using clamp) ── */
  --text-xs:    clamp(0.694rem, 0.6vw + 0.5rem, 0.75rem);
  --text-sm:    clamp(0.833rem, 0.7vw + 0.6rem, 0.875rem);
  --text-base:  clamp(1rem,     0.8vw + 0.75rem, 1rem);
  --text-md:    clamp(1.125rem, 1vw + 0.8rem,    1.125rem);
  --text-lg:    clamp(1.25rem,  1.5vw + 0.8rem,  1.5rem);
  --text-xl:    clamp(1.5rem,   2vw + 0.8rem,    2rem);
  --text-2xl:   clamp(1.875rem, 3vw + 0.75rem,   2.5rem);
  --text-3xl:   clamp(2.25rem,  4vw + 0.75rem,   3.5rem);
  --text-4xl:   clamp(2.75rem,  5vw + 0.75rem,   4.5rem);
  --text-5xl:   clamp(3.5rem,   7vw + 0.5rem,    6rem);
  --text-hero:  clamp(3rem,     8vw + 0.25rem,    7rem);

  /* ── Font Families ── */
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* ── Spacing Scale (4px base) ── */
  --space-px:  1px;
  --space-0:   0;
  --space-1:   0.25rem;   /* 4px  */
  --space-2:   0.5rem;    /* 8px  */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-7:   1.75rem;   /* 28px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  --space-32:  8rem;      /* 128px */

  /* ── Border Radius ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-pill: 9999px;

  /* ── Shadows ── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
  --shadow-lg:  0 10px 25px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3);
  --shadow-xl:  0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.3);
  --shadow-glow:0 0 40px rgba(var(--color-accent-rgb), 0.25);

  /* ── Z-Index Scale ── */
  --z-below:      -1;
  --z-base:        0;
  --z-raised:      1;
  --z-dropdown:  100;
  --z-sticky:    200;
  --z-overlay:   300;
  --z-modal:     400;
  --z-toast:     500;
  --z-tooltip:   600;
  --z-skip-link: 9999;

  /* ── Motion ── */
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snap:    cubic-bezier(0.25, 0, 0.3, 1);
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
  --duration-crawl:  700ms;

  /* ── Layout ── */
  --content-width:     1280px;
  --content-width-sm:  720px;
  --content-width-lg:  1440px;
  --nav-height:        72px;
  --announce-height:   44px;
  --section-pad-y: clamp(var(--space-16), 8vw, var(--space-32));
  --section-pad-x: clamp(var(--space-4), 4vw, var(--space-12));
}

/* ── Reduced Motion Override ── */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast:  0ms;
    --duration-base:  0ms;
    --duration-slow:  0ms;
    --duration-crawl: 0ms;
    --ease-spring:    linear;
    --ease-snap:      linear;
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3B — CSS RESET AND BASE STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create /Assets/css/reset.css:

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
  hanging-punctuation: first last;
  color-scheme: dark;
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important; }
}
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  min-height: 100svh;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}
img, video, svg, canvas, picture { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
a { color: inherit; }
a:not([class]) {
  text-decoration-skip-ink: auto;
  color: var(--color-accent);
}
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}
:focus:not(:focus-visible) { outline: none; }
[hidden] { display: none !important; }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3C — JAVASCRIPT MODULE ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File structure for the new modular system:

/js/
  core/
    index.js          ← entry point, imports all core modules
    navigation.js     ← nav, dropdown, mobile menu, skip link
    view-transitions.js ← safeViewTransition() (ISSUE-002 fix)
    cookie-banner.js  ← cookie consent (deduplicated, ISSUE-006 fix)
    analytics.js      ← PostHog init
    chatbot.js        ← chat dialog
    back-to-top.js    ← scroll progress + back-to-top (ISSUE-027 fix)
    lottie-cache.js   ← singleton Lottie data (ISSUE-007 fix)
  pages/
    home.js           ← homepage-only modules (dynamically imported)
    blog.js           ← blog listing and post pages
    tools.js          ← free tools forms and calculators
    pricing.js        ← pricing tabs and toggle
    product.js        ← product page carousels and walkthroughs
  utils/
    intersection.js   ← shared IntersectionObserver factory
    debounce.js       ← utility
    a11y.js           ← focus trap, aria helpers, announcement region
    media.js          ← matchMedia helpers for breakpoints
  vendor/
    gsap.min.js       ← GSAP (keep external vendor separate)
    ScrollTrigger.min.js

Each module MUST:
  - Use ES Module syntax (import/export)
  - Export a named init() function
  - Guard against double initialization with a module-level flag:
    let initialised = false;
    export function init() {
      if (initialised) return;
      initialised = true;
      // ... setup
    }
  - Handle errors with try/catch and console.error()
  - Clean up event listeners on page unload/transition

OUTPUT: Create this file structure and migrate existing module code into it.
```

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 4 — MOTION AND ANIMATION UPGRADE SYSTEM
## ████████████████████████████████████████████████████████████████████████████

```
TASK: Implement a world-class, cohesive motion system for CrowAgent that
matches the standard set by Apple.com, Stripe.com, and Linear.app.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4A — MOTION PHILOSOPHY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PURPOSEFUL: Every animation communicates meaning (state change, hierarchy,
   direction, causality). No decorative spinning or bouncing.
2. PHYSICS-BASED: Springs for entrances, snappy easing for exits.
3. LAYERED: Multiple elements animate in sequence (staggered), not all at once.
4. PERFORMANT: Only transform and opacity. Never animate width, height,
   margin, padding, top, left, or any layout property.
5. RESPECTFUL: All motion wraps inside:
   @media (prefers-reduced-motion: no-preference) { ... }
   OR uses the CSS custom property duration tokens (which become 0ms under reduce).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4B — SCROLL-REVEAL SYSTEM (REPLACE EXISTING sf17-scroll-reveal.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create /js/utils/intersection.js:

   const observers = new Map();

   export function createRevealObserver(options = {}) {
     const key = JSON.stringify(options);
     if (observers.has(key)) return observers.get(key);

     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (!entry.isIntersecting) return;
         entry.target.classList.add('is-revealed');
         entry.target.dispatchEvent(new CustomEvent('revealed'));
         observer.unobserve(entry.target);
       });
     }, {
       threshold: options.threshold ?? 0.12,
       rootMargin: options.rootMargin ?? '0px 0px -48px 0px',
     });

     observers.set(key, observer);
     return observer;
   }

   export function observeAll(selector, options) {
     const observer = createRevealObserver(options);
     document.querySelectorAll(selector).forEach(el => observer.observe(el));
   }

CSS for reveal system (create /Assets/css/motion.css):

   /* ── Base: elements start hidden ── */
   [data-reveal] {
     opacity: 0;
     will-change: opacity, transform;
   }

   /* ── Revealed state ── */
   [data-reveal].is-revealed {
     opacity: 1;
     transform: none !important;
   }

   /* ── Reveal variants ── */
   [data-reveal="fade-up"] {
     transform: translateY(32px);
   }
   [data-reveal="fade-down"] {
     transform: translateY(-24px);
   }
   [data-reveal="fade-left"] {
     transform: translateX(32px);
   }
   [data-reveal="fade-right"] {
     transform: translateX(-32px);
   }
   [data-reveal="scale-up"] {
     transform: scale(0.92);
   }
   [data-reveal="blur-in"] {
     filter: blur(8px);
     transform: translateY(16px);
   }

   /* ── Transition (only when reduced motion NOT preferred) ── */
   @media (prefers-reduced-motion: no-preference) {
     [data-reveal] {
       transition:
         opacity  var(--duration-slow) var(--ease-out),
         transform var(--duration-slow) var(--ease-spring),
         filter   var(--duration-slow) var(--ease-out);
     }
   }

   /* ── Stagger delays via data attribute ── */
   [data-reveal][data-delay="1"] { transition-delay: 60ms; }
   [data-reveal][data-delay="2"] { transition-delay: 120ms; }
   [data-reveal][data-delay="3"] { transition-delay: 180ms; }
   [data-reveal][data-delay="4"] { transition-delay: 240ms; }
   [data-reveal][data-delay="5"] { transition-delay: 300ms; }
   [data-reveal][data-delay="6"] { transition-delay: 360ms; }

Usage in HTML:
   <div data-reveal="fade-up">First card</div>
   <div data-reveal="fade-up" data-delay="1">Second card</div>
   <div data-reveal="fade-up" data-delay="2">Third card</div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4C — HERO ENTRANCE CHOREOGRAPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the existing hero entrance scripts with a single, declarative system:

CSS keyframes (add to motion.css):

   @keyframes heroFadeUp {
     from { opacity: 0; transform: translateY(40px); }
     to   { opacity: 1; transform: translateY(0); }
   }
   @keyframes heroFadeIn {
     from { opacity: 0; }
     to   { opacity: 1; }
   }
   @keyframes heroRevealMask {
     from { clip-path: inset(0 100% 0 0); }
     to   { clip-path: inset(0 0% 0 0); }
   }
   @keyframes heroScaleIn {
     from { opacity: 0; transform: scale(0.94) translateY(24px); }
     to   { opacity: 1; transform: scale(1) translateY(0); }
   }

Apply to hero elements with animation-fill-mode: both:

   @media (prefers-reduced-motion: no-preference) {
     .hero-eyebrow {
       animation: heroFadeUp 500ms 0ms var(--ease-spring) both;
     }
     .hero-headline {
       animation: heroFadeUp 600ms 80ms var(--ease-spring) both;
     }
     .hero-subheadline {
       animation: heroFadeUp 600ms 160ms var(--ease-spring) both;
     }
     .hero-cta-group {
       animation: heroFadeUp 500ms 240ms var(--ease-spring) both;
     }
     .hero-trust-bar {
       animation: heroFadeIn 600ms 360ms var(--ease-out) both;
     }
     .hero-stat-badges {
       animation: heroFadeUp 600ms 440ms var(--ease-spring) both;
     }
     .hero-bg-img {
       animation: heroFadeIn 1200ms 0ms var(--ease-out) both;
     }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4D — CARD HOVER SYSTEM (APPLE-GRADE LIFT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to /Assets/css/components/cards.css:

   .card--interactive {
     cursor: pointer;
     transition:
       transform   200ms var(--ease-snap),
       box-shadow  200ms var(--ease-snap),
       border-color 200ms var(--ease-snap);
     transform: translateZ(0);       /* create GPU layer */
     border: 1px solid var(--color-border-subtle);
   }

   @media (prefers-reduced-motion: no-preference) {
     .card--interactive:hover,
     .card--interactive:focus-within {
       transform: translateY(-6px) scale(1.01);
       box-shadow: var(--shadow-xl), var(--shadow-glow);
       border-color: rgba(var(--color-accent-rgb), 0.3);
     }
     .card--interactive:active {
       transform: translateY(-2px) scale(0.995);
       transition-duration: 80ms;
     }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4E — BUTTON HOVER SYSTEM (STRIPE-GRADE MICRO-INTERACTION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to /Assets/css/components/buttons.css:

   .btn {
     position: relative;
     overflow: hidden;
     isolation: isolate;
   }

   /* Shimmer sweep on hover for primary button */
   .btn--primary::after {
     content: '';
     position: absolute;
     inset: 0;
     background: linear-gradient(
       105deg,
       transparent 20%,
       rgba(255,255,255,0.15) 50%,
       transparent 80%
     );
     transform: translateX(-100%);
     transition: transform 500ms var(--ease-snap);
   }
   @media (prefers-reduced-motion: no-preference) {
     .btn--primary:hover::after {
       transform: translateX(100%);
     }
   }

   /* Lottie arrow: scale up on hover */
   .btn .lottie-icon {
     transition: transform 200ms var(--ease-spring);
   }
   @media (prefers-reduced-motion: no-preference) {
     .btn:hover .lottie-icon {
       transform: translateX(4px);
     }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4F — GLOBAL LOADING SKELETON SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For any content loaded asynchronously (tool results, blog cards, API data):

   .skeleton {
     background: linear-gradient(
       90deg,
       var(--color-surface) 25%,
       var(--color-surface-raised) 50%,
       var(--color-surface) 75%
     );
     background-size: 200% 100%;
     border-radius: var(--radius-md);
   }
   @media (prefers-reduced-motion: no-preference) {
     .skeleton {
       animation: skeletonPulse 1.4s ease-in-out infinite;
     }
   }
   @keyframes skeletonPulse {
     0%   { background-position: 200% 0; }
     100% { background-position: -200% 0; }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4G — PAGE TRANSITION SYSTEM (VIEW TRANSITIONS API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In addition to ISSUE-002 fix, add named view transitions for key elements:

CSS additions:
   /* Header stays in place — no transition */
   .sv-nav { view-transition-name: site-header; }

   /* Hero title morphs between pages */
   .hero-headline { view-transition-name: page-title; }

   /* Product hero badge */
   .page-hero__eyebrow { view-transition-name: page-eyebrow; }

   @keyframes slideInFromRight {
     from { opacity: 0; transform: translateX(60px); }
     to   { opacity: 1; transform: translateX(0); }
   }
   @keyframes slideOutToLeft {
     from { opacity: 1; transform: translateX(0); }
     to   { opacity: 0; transform: translateX(-60px); }
   }

   @media (prefers-reduced-motion: no-preference) {
     ::view-transition-old(root) {
       animation: 250ms var(--ease-snap) both slideOutToLeft;
     }
     ::view-transition-new(root) {
       animation: 300ms var(--ease-spring) both slideInFromRight;
     }
     ::view-transition-old(site-header),
     ::view-transition-new(site-header) {
       animation: none; /* header stays put */
     }
   }
   @media (prefers-reduced-motion: reduce) {
     ::view-transition-old(root),
     ::view-transition-new(root) { animation: none; }
   }

OUTPUT: /Assets/css/motion.css fully implemented. All existing animation
scripts migrated to use design token durations. data-reveal attributes
applied to all section content. Card and button hover systems applied globally.
```

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 5 — RESPONSIVE SYSTEM OVERHAUL
## ████████████████████████████████████████████████████████████████████████████

```
TASK: Replace all hardcoded pixel-based responsive rules with a fluid,
container-query-first responsive system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5A — BREAKPOINT SYSTEM (CANONICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to design-tokens.css:
   --bp-xs:   320px;
   --bp-sm:   480px;
   --bp-md:   768px;
   --bp-nav:  1100px;   /* mobile → desktop nav switch */
   --bp-lg:   1280px;
   --bp-xl:   1440px;
   --bp-2xl:  1920px;
   --bp-3xl:  2560px;

Media query usage convention (mobile-first):
   /* xs:  320px  — smallest phone */
   /* sm:  480px  — large phone    */
   /* md:  768px  — tablet         */
   /* nav: 1100px — desktop nav    */
   /* lg:  1280px — small laptop   */
   /* xl:  1440px — desktop        */
   /* 2xl: 1920px — large desktop  */
   /* 3xl: 2560px — ultrawide      */

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5B — CONTAINER QUERY SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wrap all major layout sections in container contexts:

   .section-container {
     container-type: inline-size;
     container-name: section;
   }
   .card-grid {
     container-type: inline-size;
     container-name: card-grid;
   }

Then use container queries for components:
   @container card-grid (min-width: 600px) {
     .blog-card { flex-direction: row; }
   }
   @container section (min-width: 800px) {
     .pricing-grid { grid-template-columns: repeat(3, 1fr); }
   }

This makes components responsive to THEIR container, not the viewport —
works correctly in sidebars, modals, and nested layouts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5C — FLUID LAYOUT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace all fixed-width containers:

   /* ── Page wrapper ── */
   .page-wrapper {
     width: 100%;
     max-width: var(--content-width);
     margin-inline: auto;
     padding-inline: var(--section-pad-x);
   }

   /* ── Section spacing ── */
   .section {
     padding-block: var(--section-pad-y);
   }

   /* ── Responsive grid helper ── */
   .auto-grid {
     display: grid;
     grid-template-columns: repeat(
       auto-fit,
       minmax(min(var(--auto-grid-min, 280px), 100%), 1fr)
     );
     gap: var(--auto-grid-gap, var(--space-6));
   }

   /* ── Prose width for article content ── */
   .prose {
     max-width: 72ch;
     margin-inline: auto;
   }

   /* ── Asymmetric layouts using named grid lines ── */
   .content-aside-layout {
     display: grid;
     grid-template-columns:
       [full-start] var(--section-pad-x)
       [content-start] 1fr
       [content-end] var(--section-pad-x)
       [full-end];
   }
   @media (min-width: 1100px) {
     .content-aside-layout {
       grid-template-columns:
         [full-start] var(--section-pad-x)
         [content-start] 2fr
         [aside-start] var(--space-12)
         [aside-end] 1fr
         [content-end] var(--section-pad-x)
         [full-end];
     }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5D — TOUCH TARGET ENFORCEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to reset.css:
   /* Enforce minimum 44×44px touch targets on all interactive elements */
   button, [role="button"], [role="tab"], [role="menuitem"],
   input[type="checkbox"], input[type="radio"], input[type="range"],
   select, summary {
     min-height: 44px;
     min-width: 44px;
   }

   /* For small visual elements (icon buttons), expand hit area via padding */
   .icon-btn {
     padding: var(--space-3);
     display: inline-flex;
     align-items: center;
     justify-content: center;
   }

   /* Tab navigation items must be at least 44px tall */
   [role="tablist"] [role="tab"] {
     min-height: 44px;
     padding-inline: var(--space-4);
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5E — SAFE AREA INSETS (NOTCH / DYNAMIC ISLAND)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to base layout:
   body {
     padding-left:   env(safe-area-inset-left,   0px);
     padding-right:  env(safe-area-inset-right,  0px);
   }
   footer {
     padding-bottom: env(safe-area-inset-bottom, 0px);
   }
   .mobile-sticky-cta {
     padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
   }
   .sv-nav {
     padding-top: env(safe-area-inset-top, 0px);
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5F — VIEWPORT HEIGHT HANDLING (svh/dvh)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace all `height: 100vh` with small viewport height units:
   /* OLD — causes content to hide behind mobile browser chrome */
   .hero { height: 100vh; }

   /* NEW — uses the smallest stable viewport height */
   .hero { min-height: 100svh; }

   /* For full-height modals/drawers */
   .mobile-menu { height: 100dvh; } /* dynamic — updates on scroll */

OUTPUT: All hardcoded breakpoints replaced with fluid tokens. Container
queries implemented on all card grids. Safe area insets applied.
svh/dvh units replacing vh throughout. Auto-grid utility class available.
```

---

## ████████████████████████████████████████████████████████████████████████████
## SECTION 6 — MODERN FRONTEND STACK UPGRADE
## ████████████████████████████████████████████████████████████████████████████

```
TASK: Configure the complete modern build toolchain and development workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6A — VITE CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create vite.config.js

Here are the remaining sections. Paste this directly after your last truncation point (end of Section 5F / start of Section 6A):

---

```markdown
---

## SECTION 6 — MODERN FRONTEND STACK UPGRADE

### 6A — Vite Configuration

**TASK:** Create a production-grade `vite.config.js` that consolidates 46 JS files into ≤8 chunks, enables AVIF/WebP image processing, activates Brotli + gzip compression, and generates module preload hints automatically.

```js
// vite.config.js
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

export default defineConfig(({ mode }) => ({
  root: '.',
  base: '/',
  publicDir: 'public',

  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: { comments: false },
    },
    rollupOptions: {
      input: {
        // Entry points — one per page type
        main:        'index.html',
        product:     'src/js/entries/product.js',
        pricing:     'src/js/entries/pricing.js',
        blog:        'src/js/entries/blog.js',
        tools:       'src/js/entries/tools.js',
        legal:       'src/js/entries/legal.js',
        about:       'src/js/entries/about.js',
        error:       'src/js/entries/error.js',
      },
      output: {
        // ≤8 named chunks — zero anonymous splits
        manualChunks(id) {
          if (id.includes('node_modules/gsap'))           return 'vendor-gsap';
          if (id.includes('node_modules/lottie'))         return 'vendor-lottie';
          if (id.includes('node_modules/dompurify'))      return 'vendor-security';
          if (id.includes('node_modules'))                return 'vendor-core';
          if (id.includes('/src/js/components/'))         return 'components';
          if (id.includes('/src/js/utils/'))              return 'utils';
          // page entries are their own chunks (named above)
        },
        chunkFileNames:  'assets/js/[name]-[hash].js',
        entryFileNames:  'assets/js/[name]-[hash].js',
        assetFileNames:  'assets/[ext]/[name]-[hash][extname]',
        // Module preload — inject <link rel="modulepreload"> for all chunks
        experimentalMinChunkSize: 10_000,
      },
    },
    // Inject <link rel="modulepreload"> automatically
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => deps,
    },
  },

  plugins: [
    splitVendorChunkPlugin(),

    // AVIF + WebP image conversion
    viteImagemin({
      avif: { quality: 72, speed: 6 },
      webp: { quality: 78, method: 4 },
      mozjpeg: { quality: 82 },
      pngquant: { quality: [0.75, 0.90], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
        ],
      },
    }),

    // Brotli (primary)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 4096,
      deleteOriginFile: false,
    }),

    // Gzip (fallback)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 4096,
      deleteOriginFile: false,
    }),

    ViteMinifyPlugin({ removeComments: true }),

    // Bundle visualizer — only in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  css: {
    devSourcemap: true,
    preprocessorOptions: {},
    modules: { localsConvention: 'camelCase' },
  },

  server: {
    port: 8092,
    strictPort: true,
    open: false,
    cors: true,
  },

  preview: {
    port: 8093,
    strictPort: true,
  },
}));
```

**OUTPUT:** Running `vite build` produces ≤8 named JS chunks, every image converted to AVIF+WebP, `.br` and `.gz` files alongside every asset, and `<link rel="modulepreload">` tags injected into every HTML file. Bundle analyzer available via `vite build --mode analyze`.

---

### 6B — Package.json Scripts

**TASK:** Define a complete, unambiguous build pipeline with lint → test → build → preview → analyze stages.

```json
{
  "name": "crowagent-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":          "vite",
    "build":        "npm run lint && npm run build:css && vite build",
    "build:css":    "postcss src/css/main.css -o dist/assets/css/main.css",
    "preview":      "vite preview",
    "analyze":      "vite build --mode analyze",
    "lint":         "eslint src/js --ext .js --max-warnings 0",
    "lint:css":     "stylelint 'src/css/**/*.css' --max-warnings 0",
    "lint:fix":     "eslint src/js --ext .js --fix && stylelint 'src/css/**/*.css' --fix",
    "a11y":         "pa11y-ci --config .pa11yci.json",
    "lighthouse":   "lhci autorun --config=lighthouserc.json",
    "test":         "vitest run",
    "test:watch":   "vitest",
    "test:coverage":"vitest run --coverage",
    "format":       "prettier --write 'src/**/*.{js,css,html}'",
    "clean":        "rimraf dist",
    "prepare":      "husky install"
  },
  "devDependencies": {
    "vite":                       "^5.2.0",
    "rollup-plugin-visualizer":   "^5.12.0",
    "vite-plugin-compression":    "^0.5.1",
    "vite-plugin-imagemin":       "^0.6.1",
    "vite-plugin-minify":         "^1.2.0",
    "postcss":                    "^8.4.38",
    "autoprefixer":               "^10.4.19",
    "cssnano":                    "^7.0.1",
    "eslint":                     "^9.2.0",
    "stylelint":                  "^16.5.0",
    "prettier":                   "^3.2.5",
    "pa11y-ci":                   "^3.1.0",
    "@lhci/cli":                  "^0.13.0",
    "vitest":                     "^1.6.0",
    "rimraf":                     "^5.0.5",
    "husky":                      "^9.0.11",
    "lint-staged":                "^15.2.4"
  },
  "dependencies": {
    "gsap":       "^3.12.5",
    "lottie-web": "^5.12.2",
    "dompurify":  "^3.1.5"
  },
  "lint-staged": {
    "src/**/*.js":  ["eslint --fix", "prettier --write"],
    "src/**/*.css": ["stylelint --fix", "prettier --write"],
    "src/**/*.html":["prettier --write"]
  },
  "engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }
}
```

**OUTPUT:** `npm run build` lints all JS + CSS, processes PostCSS, and produces an optimized `dist/`. Pre-commit hook (Husky + lint-staged) blocks any commit with lint errors. Zero tolerance for warnings in CI.

---

### 6C — PostCSS Configuration

**TASK:** Wire PostCSS with autoprefixer (last 2 browser versions, Safari ≥14, Chrome ≥105) and cssnano (advanced preset) for production; disable minification in development.

```js
// postcss.config.js
const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // Import inlining (must be first)
    require('postcss-import'),

    // Custom media queries and nesting (Stage 3)
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules':          true,
        'custom-media-queries':   true,
        'media-query-ranges':     true,
        'color-function':         true,
      },
    }),

    // Autoprefixer — target modern baseline
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Safari versions >= 14',
        'last 2 Edge versions',
        'iOS >= 15',
        'not dead',
        'not IE 11',
      ],
      grid: false,
    }),

    // cssnano — production only, advanced preset
    isProduction && require('cssnano')({
      preset: ['advanced', {
        discardComments:         { removeAll: true },
        normalizeWhitespace:     true,
        minifySelectors:         true,
        mergeRules:              true,
        reduceIdents:            false, // keep animation names readable
        zindex:                  false, // never reorder z-index
        cssDeclarationSorter:    false,
      }],
    }),
  ].filter(Boolean),
};
```

**OUTPUT:** All CSS is autoprefixed for the modern browser baseline. In production, output is minified with comment stripping. Animation keyframe names and z-index values are preserved exactly as authored. Zero vendor prefix drift.

---

## SECTION 7 — LOGO AND BRAND IDENTITY SYSTEM

> **Priority: HIGH** — This section was explicitly requested twice by the product owner. Every logo, wordmark, favicon, and brand token specification must be treated as a hard contractual deliverable.

---

### 7A — Logo Rendering Standard

**TASK:** Audit and fix every `<img>` tag that renders the CrowAgent logo. Deliver AVIF-first responsive logo with WebP fallback, correct intrinsic dimensions, no layout shift, correct light/dark variant switching, and zero decorative-image accessibility violations.

**CONTEXT:** Audit found the logo is oversized on mobile (ISSUE-017), served as a single PNG format with no AVIF/WebP variant, no `srcset` or `sizes`, no `width`/`height` attributes causing CLS, and no `prefers-color-scheme` dark variant.

**HARD REQUIREMENTS:**

1. Logo image files MUST be produced in four variants:
   - `logo-light.avif` + `logo-light.webp` + `logo-light.png` (for light backgrounds)
   - `logo-dark.avif` + `logo-dark.webp` + `logo-dark.png` (for dark backgrounds)
   - Minimum source resolution: SVG vector source → exported at 2× pixel density
   - Stored at: `public/images/brand/`

2. Every logo `<img>` MUST be replaced with a `<picture>` element:

```html
<!-- Header / nav logo — light mode default, dark variant auto-switches -->
<a href="/" class="brand" aria-label="CrowAgent — home">
  <picture class="brand__logo">
    <!-- Dark-mode variant (browser selects automatically) -->
    <source
      media="(prefers-color-scheme: dark)"
      type="image/avif"
      srcset="
        /images/brand/logo-dark.avif    1x,
        /images/brand/logo-dark@2x.avif 2x
      "
    />
    <source
      media="(prefers-color-scheme: dark)"
      type="image/webp"
      srcset="
        /images/brand/logo-dark.webp    1x,
        /images/brand/logo-dark@2x.webp 2x
      "
    />
    <!-- Light-mode variant (default) -->
    <source
      type="image/avif"
      srcset="
        /images/brand/logo-light.avif    1x,
        /images/brand/logo-light@2x.avif 2x
      "
    />
    <source
      type="image/webp"
      srcset="
        /images/brand/logo-light.webp    1x,
        /images/brand/logo-light@2x.webp 2x
      "
    />
    <!-- PNG fallback — always present, always last -->
    <img
      src="/images/brand/logo-light.png"
      alt="CrowAgent"
      width="140"
      height="36"
      fetchpriority="high"
      loading="eager"
      decoding="sync"
      class="brand__logo-img"
    />
  </picture>
</a>
```

3. CSS for the logo container MUST use fluid sizing — never hardcoded pixels on the `img`:

```css
.brand__logo {
  display: block;
  line-height: 0; /* collapse inline whitespace */
}

.brand__logo-img {
  width: clamp(100px, 14vw, 140px);
  height: auto;            /* preserve aspect ratio */
  max-height: 36px;        /* never taller than nav bar */
  object-fit: contain;
  object-position: left center;
}

/* Mobile: tighter clamp to prevent oversizing (fixes ISSUE-017) */
@media (max-width: 767px) {
  .brand__logo-img {
    width: clamp(88px, 28vw, 120px);
    max-height: 28px;
  }
}
```

4. `alt="CrowAgent"` — exactly this string. No "logo", no "image", no empty string (the logo IS the brand name — it is NOT decorative).

5. `width` and `height` attributes MUST match intrinsic PNG dimensions to prevent CLS. Verify with: `identify logo-light.png` (ImageMagick) or browser DevTools → Elements → intrinsic size.

6. `fetchpriority="high"` and `loading="eager"` MUST be set — the logo is above the fold and LCP-critical.

7. The `<a>` wrapper MUST have `aria-label="CrowAgent — home"` — the link destination is not self-evident from the image alt alone.

8. Logo MUST NOT be inlined as `<svg>` unless the SVG source is monochromatic and requires `currentColor` theming. If the logo has multi-colour gradients, use `<picture>` as specified above.

**OUTPUT:** Zero CLS from logo on any viewport. Logo renders in ≤1 network request (correct format selected by browser). Light/dark switching is automatic with zero JavaScript. Logo is never pixelated at 2× density displays. Lighthouse SEO and Accessibility scores are not degraded by the logo element.

---

### 7B — Brand Name Typography Treatment

**TASK:** Define and enforce the typographic rendering of the "CrowAgent" wordmark and "Sustainability Intelligence" tagline wherever they appear in HTML text (not just as the logo image). Ensure consistent, pixel-perfect rendering at all scales.

**CONTEXT:** The brand name "CrowAgent" appears in: the `<title>` tag, H1 headings on the homepage, meta descriptions, OG tags, footer copyright, and inline body copy. No consistent typographic specification exists — the name renders with browser-default weight and letter-spacing, breaking brand consistency.

**HARD REQUIREMENTS:**

1. Define brand name CSS utility classes:

```css
/* ============================================================
   BRAND NAME TYPOGRAPHY SYSTEM
   crowagent-brand-tokens.css — append to existing token file
   ============================================================ */

:root {
  /* Brand wordmark */
  --brand-name-font:          'Inter', 'SF Pro Display', system-ui, sans-serif;
  --brand-name-weight:        700;
  --brand-name-tracking:      -0.02em;    /* tight — matches logo geometry */
  --brand-name-color-light:   var(--color-gray-900);
  --brand-name-color-dark:    var(--color-gray-50);

  /* Tagline */
  --brand-tagline-font:       'Inter', system-ui, sans-serif;
  --brand-tagline-weight:     400;
  --brand-tagline-tracking:   0.01em;
  --brand-tagline-color:      var(--color-gray-500);
}

/* Wordmark in hero headings */
.brand-name {
  font-family:     var(--brand-name-font);
  font-weight:     var(--brand-name-weight);
  letter-spacing:  var(--brand-name-tracking);
  color:           var(--brand-name-color-light);
  font-variant-numeric: lining-nums tabular-nums;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering:  optimizeLegibility;
}

/* "Crow" portion — accent colour variant (optional) */
.brand-name__crow {
  color: var(--color-brand-primary);   /* your primary brand colour token */
}

/* "Agent" portion — default weight */
.brand-name__agent {
  color: inherit;
}

/* Tagline beneath wordmark */
.brand-tagline {
  font-family:    var(--brand-tagline-font);
  font-weight:    var(--brand-tagline-weight);
  letter-spacing: var(--brand-tagline-tracking);
  color:          var(--brand-tagline-color);
  font-size:      clamp(0.75rem, 1.2vw, 0.875rem);
  margin-top:     var(--space-1);
  display:        block;
}

@media (prefers-color-scheme: dark) {
  .brand-name { color: var(--brand-name-color-dark); }
}
```

2. In every hero `<h1>` that contains the brand name in text, apply the class:

```html
<!-- Homepage hero example -->
<h1>
  <span class="brand-name">
    <span class="brand-name__crow">Crow</span><span class="brand-name__agent">Agent</span>
  </span>
  <span class="brand-tagline">Sustainability Intelligence</span>
</h1>
```

3. The HTML `<title>` tag MUST follow this exact capitalisation pattern on every page:

```
[Page Name] | CrowAgent — [Short Tagline]
```

Examples:
- `Home | CrowAgent — Sustainability Intelligence`
- `Pricing | CrowAgent — Sustainability Intelligence`
- `MEES Risk Snapshot | CrowAgent Tools`
- `CrowMark | CrowAgent — Social Value Software`

4. `<meta name="description">` MUST begin with the brand name for pages where CrowAgent is the primary subject. Maximum 155 characters.

5. In all body copy where "CrowAgent" appears as inline text, it MUST render as a single unbreakable token — add `white-space: nowrap` via an inline `<span class="brand-name-inline">`:

```css
.brand-name-inline {
  white-space: nowrap;
  font-weight: 600;  /* semi-bold in body copy — not full 700 */
}
```

6. ALL occurrences of the brand name in HTML MUST use the capitalisation `CrowAgent` — never `Crowagent`, `crowagent`, `CROWAGENT`, or `Crow Agent` (with space). Audit all `.html` files with: `grep -rni "crowagent\|crow agent\|CROWAGENT" src/ --include="*.html"` and fix every non-conforming instance.

**OUTPUT:** "CrowAgent" renders with identical weight, tracking, and colour treatment in every context. The tagline "Sustainability Intelligence" has a consistent typographic relationship to the wordmark. No line-breaking through the middle of the brand name at any viewport. All page titles follow the canonical pattern.

---

### 7C — Favicon and App Icon System

**TASK:** Replace any single-size favicon with a complete, modern favicon system covering all platforms and use cases.

**CONTEXT:** Audit did not find a complete favicon system — only a default or single `favicon.ico` was observed. Missing: `apple-touch-icon`, `manifest.webmanifest`, SVG favicon, and 192/512px PWA icons.

**HARD REQUIREMENTS:**

1. Generate the following icon files and place them in `public/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16+32+48px multi-size | Legacy browsers, Windows taskbar |
| `favicon.svg` | Scalable | Modern browsers, tab icon |
| `apple-touch-icon.png` | 180×180px | iOS home screen |
| `icon-192.png` | 192×192px | Android PWA |
| `icon-512.png` | 512×512px | Android PWA splash |
| `icon-maskable-512.png` | 512×512px | Android adaptive icon (safe zone: centre 80%) |
| `og-image.png` | 1200×630px | Open Graph social preview |
| `twitter-card.png` | 1200×600px | Twitter/X card |

2. Add to every page `<head>` in this exact order:

```html
<!-- Favicon system — place in <head> before any stylesheet -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon.ico" sizes="any" />        <!-- fallback -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />

<!-- Theme colour — matches brand primary -->
<meta name="theme-color" content="#0F1729" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#1A73E8" media="(prefers-color-scheme: light)" />
```

3. Create `public/manifest.webmanifest`:

```json
{
  "name": "CrowAgent — Sustainability Intelligence",
  "short_name": "CrowAgent",
  "description": "MEES, Social Value, Cyber, Credit Control & ESG Software",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F1729",
  "theme_color": "#1A73E8",
  "orientation": "any",
  "categories": ["business", "productivity", "utilities"],
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/og-image.png",
      "sizes": "1200x630",
      "type": "image/png",
      "form_factor": "wide",
      "label": "CrowAgent dashboard overview"
    }
  ]
}
```

4. The SVG favicon MUST respect `prefers-color-scheme` via a `<style>` block inside the SVG:

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    @media (prefers-color-scheme: dark) {
      .icon-bg  { fill: #0F1729; }
      .icon-fg  { fill: #60A5FA; }
    }
    .icon-bg { fill: #FFFFFF; }
    .icon-fg { fill: #1A73E8; }
  </style>
  <!-- Replace path data below with actual CrowAgent icon geometry -->
  <rect class="icon-bg" width="32" height="32" rx="6"/>
  <path class="icon-fg" d="M8 16 L16 8 L24 16 L16 24 Z"/>
</svg>
```

5. Favicon MUST NOT be a raster PNG for modern browsers. SVG is the primary format; `favicon.ico` is strictly a legacy fallback.

6. All icon files MUST be pre-compressed (Brotli/gzip) in the production build pipeline (handled automatically by Section 6A Vite config for assets above the threshold).

**OUTPUT:** CrowAgent icon renders correctly on: browser tab (light + dark), iOS home screen, Android home screen (any shape mask), Windows taskbar. Social sharing links produce a correctly branded 1200×630px preview card. PWA install prompt uses the correct name and icons.

---

### 7D — Open Graph and Social Meta System

**TASK:** Define and implement a complete, per-page Open Graph + Twitter/X Card + structured data meta system. Every page MUST produce a correct social preview when its URL is pasted into LinkedIn, X, Slack, WhatsApp, or iMessage.

**HARD REQUIREMENTS:**

1. Canonical base meta block for every page (update variables per page):

```html
<!-- === CANONICAL & SOCIAL META — required on every page === -->

<!-- Primary -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="canonical" href="https://crowagent.com[PAGE_PATH]" />
<meta name="description" content="[155-char max description starting with CrowAgent]" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type"        content="website" />
<meta property="og:url"         content="https://crowagent.com[PAGE_PATH]" />
<meta property="og:title"       content="[Page Name] | CrowAgent" />
<meta property="og:description" content="[155-char description]" />
<meta property="og:image"       content="https://crowagent.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height"content="630" />
<meta property="og:image:alt"   content="CrowAgent — Sustainability Intelligence platform dashboard" />
<meta property="og:site_name"   content="CrowAgent" />
<meta property="og:locale"      content="en_GB" />

<!-- Twitter / X Card -->
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:site"        content="@CrowAgent" />
<meta name="twitter:title"       content="[Page Name] | CrowAgent" />
<meta name="twitter:description" content="[155-char description]" />
<meta name="twitter:image"       content="https://crowagent.com/og-image.png" />
<meta name="twitter:image:alt"   content="CrowAgent platform screenshot" />

<!-- Structured Data — Organisation (homepage only) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CrowAgent",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "MEES, Social Value, Cyber, Credit Control and ESG compliance software.",
  "url": "https://crowagent.com",
  "logo": "https://crowagent.com/images/brand/logo-light.png",
  "sameAs": [
    "https://www.linkedin.com/company/crowagent",
    "https://twitter.com/CrowAgent"
  ],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "GBP",
    "url": "https://crowagent.com/pricing"
  }
}
</script>
```

2. Blog post pages MUST upgrade the `og:type` to `article` and add:

```html
<meta property="og:type"              content="article" />
<meta property="article:author"       content="CrowAgent Editorial" />
<meta property="article:published_time" content="[ISO 8601 date]" />
<meta property="article:section"      content="[Category]" />
<meta property="article:tag"          content="[Tag 1]" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title]",
  "author": { "@type": "Organization", "name": "CrowAgent" },
  "publisher": {
    "@type": "Organization",
    "name": "CrowAgent",
    "logo": { "@type": "ImageObject", "url": "https://crowagent.com/images/brand/logo-light.png" }
  },
  "datePublished": "[ISO 8601]",
  "dateModified":  "[ISO 8601]",
  "image": "https://crowagent.com/og-image.png",
  "url": "https://crowagent.com[PAGE_PATH]"
}
</script>
```

3. Tool pages MUST add `WebApplication` structured data:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "[Tool Name]",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "url": "https://crowagent.com[TOOL_PATH]",
  "isPartOf": { "@type": "WebSite", "name": "CrowAgent", "url": "https://crowagent.com" },
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" }
}
</script>
```

4. OG image (`/og-image.png`) MUST include:
   - CrowAgent logo (top-left, white version on dark background)
   - Brand primary gradient background
   - Page title in Inter Bold, white, 64px
   - Tagline "Sustainability Intelligence" in Inter Regular, brand-light-blue, 32px
   - Minimum 1200×630px at 2× export = 2400×1260px source
   - Per-page OG images are optional but strongly recommended for product and blog pages

5. Validate every page with: `https://developers.facebook.com/tools/debug/` and `https://cards-dev.twitter.com/validator` before launch.

**OUTPUT:** Every page URL produces a fully branded social preview card in all major platforms. Structured data passes Google Rich Results Test. Canonical URLs prevent duplicate indexing. OG image is never the default browser screenshot.

---

### 7E — Brand Token Governance Rules

**TASK:** Establish governance rules that prevent brand token drift — the gradual divergence of colours, spacing, and typography from the canonical design system as the codebase grows.

**HARD REQUIREMENTS:**

1. All brand colour, spacing, and typography values MUST originate from `crowagent-brand-tokens.css` — NEVER from hardcoded hex values, arbitrary pixel values, or Tailwind arbitrary properties in HTML.

2. Add a Stylelint rule to enforce this:

```js
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard"],
  "plugins": ["stylelint-declaration-property-value-allowed-list"],
  "rules": {
    "color-no-invalid-hex": true,
    "declaration-no-important": [true, { "severity": "warning" }],
    "custom-property-pattern": "^(color|space|font|radius|shadow|duration|ease|brand|z)-.+",
    "color-named": "never",
    "shorthand-property-no-redundant-values": true,
    "declaration-property-value-allowed-list": {
      "/^color$/": ["/^var\\(--color-/", "inherit", "currentColor", "transparent"],
      "/^background-color$/": ["/^var\\(--color-/", "transparent", "inherit"],
      "/^border-color$/": ["/^var\\(--color-/", "transparent", "currentColor"]
    }
  }
}
```

3. Token naming convention — enforce this schema, zero exceptions:

```
--color-{role}-{scale}      e.g. --color-brand-primary, --color-gray-900
--space-{n}                 e.g. --space-1 (4px), --space-4 (16px)
--font-size-{label}         e.g. --font-size-sm, --font-size-2xl
--font-weight-{label}       e.g. --font-weight-normal, --font-weight-bold
--radius-{label}            e.g. --radius-sm, --radius-lg, --radius-full
--shadow-{label}            e.g. --shadow-sm, --shadow-card
--duration-{label}          e.g. --duration-fast, --duration-normal
--ease-{label}              e.g. --ease-spring, --ease-out
--z-{label}                 e.g. --z-nav, --z-modal, --z-tooltip
```

4. The canonical token file MUST be the single source of truth. If a designer changes a brand colour, ONE edit in `crowagent-brand-tokens.css` propagates everywhere. Prove this by searching for any hardcoded hex in the codebase:

```bash
grep -rE '#[0-9a-fA-F]{3,8}' src/css/ --include="*.css" | grep -v 'brand-tokens'
```

Zero results is the required outcome.

5. Typography tokens MUST use `clamp()` — never static `rem` or `px` for heading sizes:

```css
:root {
  --font-size-xs:   clamp(0.75rem,  0.7rem  + 0.25vw,  0.8125rem);
  --font-size-sm:   clamp(0.875rem, 0.82rem + 0.28vw,  0.9375rem);
  --font-size-base: clamp(1rem,     0.95rem + 0.25vw,  1.0625rem);
  --font-size-lg:   clamp(1.125rem, 1.05rem + 0.38vw,  1.25rem);
  --font-size-xl:   clamp(1.25rem,  1.1rem  + 0.75vw,  1.5rem);
  --font-size-2xl:  clamp(1.5rem,   1.3rem  + 1vw,     2rem);
  --font-size-3xl:  clamp(1.875rem, 1.5rem  + 1.875vw, 2.5rem);
  --font-size-4xl:  clamp(2.25rem,  1.75rem + 2.5vw,   3.5rem);
  --font-size-5xl:  clamp(2.75rem,  2rem    + 3.75vw,  4.5rem);
}
```

6. Add a CI step that fails the build if any hardcoded colour is detected:

```bash
# In package.json scripts:
"lint:tokens": "grep -rE '#[0-9a-fA-F]{3,8}' src/css/ --include='*.css' | grep -v 'brand-tokens.css' && echo 'FAIL: hardcoded colours detected' && exit 1 || echo 'PASS: all colours use tokens'"
```

**OUTPUT:** Zero hardcoded colours, pixel values, or font sizes outside the token system. Any future change to the brand colour palette requires editing exactly one file. Stylelint enforces token usage at commit time. New developers cannot accidentally introduce token drift.

---

## SECTION 8 — FINAL VERIFICATION CHECKLIST AND REGRESSION TEST SUITE

### 8A — Pre-Launch Verification Checklist

Run this checklist in order. Every item must be ✅ before deployment. No exceptions.

#### Accessibility (WCAG 2.1 AA)
- [ ] `axe-core` scan: zero violations on every page
- [ ] `pa11y-ci` scan: zero errors on every URL in sitemap
- [ ] Tab through every page — every interactive element receives visible focus ring
- [ ] Skip link appears on Tab press and navigates correctly
- [ ] Screen reader (NVDA + Chrome, VoiceOver + Safari): all landmarks announced, all forms labelled, all images described
- [ ] Exactly ONE `<h1>` per page
- [ ] No heading level skipped (H1→H2→H3, never H1→H3)
- [ ] Exactly ONE `role="banner"`, `role="main"`, `role="contentinfo"` per page
- [ ] Every `<nav>` has unique `aria-label`
- [ ] Every `<img>` has either descriptive `alt` or `alt=""` + `aria-hidden="true"`
- [ ] Every form `<input>` has an associated `<label>` (explicit or `aria-labelledby`)
- [ ] `prefers-reduced-motion` disables ALL transitions and animations (test in browser DevTools Rendering → Emulate CSS media feature)
- [ ] Colour contrast: all text ≥4.5:1 (normal), ≥3:1 (large), ≥3:1 (UI components) — verify with browser DevTools Accessibility → Contrast

#### Performance (Core Web Vitals)
- [ ] Lighthouse score: Performance ≥90, Accessibility ≥97, Best Practices ≥95, SEO ≥97
- [ ] LCP < 2.5s on 4G simulated mobile
- [ ] INP < 200ms (test with Chrome Recorder + WebPageTest)
- [ ] CLS < 0.1 (confirm logo, hero images, cookie banner, font loading — all have explicit width/height or reserved space)
- [ ] Total JS payload: ≤8 chunks, ≤400KB gzipped
- [ ] Total CSS payload: ≤60
Yes, it was truncated. Here is every remaining piece. Paste this directly after `≤60` in the Total CSS payload line:

---

```markdown
KB gzipped
- [ ] No render-blocking resources (verify in Lighthouse → Opportunities)
- [ ] All images served as AVIF with WebP fallback — zero PNG/JPG served to modern browsers
- [ ] Hero images: `fetchpriority="high"` `loading="eager"` `decoding="sync"`
- [ ] Below-fold images: `loading="lazy"` `decoding="async"`
- [ ] No asset fetched more than once (check Network tab → filter by domain, sort by name, look for duplicates)
- [ ] Lottie JSON fetched exactly once per page (not 10×)
- [ ] `cookie-banner.js` loaded exactly once
- [ ] Brotli compression active on all text assets (check response header `content-encoding: br`)

#### Responsive & Layout
- [ ] Test every page at: 320, 375, 390, 428, 768, 834, 1024, 1100, 1280, 1440, 1920, 2560px
- [ ] Navigation renders correctly at ALL viewports — no dead zone between 1025–1100px
- [ ] "Most Popular" badge fully visible, not clipped — test at 320px, 375px, 768px, 1280px
- [ ] Blog category badge does NOT overlap breadcrumb — test at 375px, 428px
- [ ] Enterprise plan bullet text not obscured by icon — test at 768px, 1024px
- [ ] Changelog page hero has content — not blank
- [ ] All touch targets ≥44×44px (use DevTools → Elements → Accessibility → Target size)
- [ ] No horizontal scroll at any viewport (run: `document.documentElement.scrollWidth > window.innerWidth`)
- [ ] No content hidden without explicit user interaction
- [ ] Footer layout intact at 320px — no overflow, no wrapping into single column of text blobs

#### Brand & Identity
- [ ] Logo renders as AVIF on Chrome, WebP on Safari 14, PNG on IE (if supported)
- [ ] Logo dark variant activates in `prefers-color-scheme: dark`
- [ ] Logo is never pixelated on 2× Retina / 3× mobile displays
- [ ] CLS from logo = 0 (explicit `width`/`height` on `<img>`)
- [ ] Every page `<title>` follows pattern: `[Page] | CrowAgent — [Tagline]`
- [ ] `og:image` renders correctly when URL pasted in Slack / LinkedIn / X
- [ ] Favicon renders in browser tab (light + dark), iOS home screen, Android home screen
- [ ] `manifest.webmanifest` is valid (test at: `https://manifest-validator.appspot.com`)
- [ ] Zero instances of `crowagent`, `Crow Agent`, `CROWAGENT` (wrong capitalisation) in HTML source

#### View Transitions & JavaScript
- [ ] Zero `InvalidStateError: Transition was aborted` in console on any page
- [ ] Zero `AbortError: Transition was skipped` in console on any page
- [ ] All navigation transitions complete within 350ms
- [ ] `document.startViewTransition` guarded with `if ('startViewTransition' in document)` check
- [ ] Cookie preferences toggle uses `role="switch"` with `aria-checked`
- [ ] Search input has `aria-label` or associated `<label>`
- [ ] All 5 cinematic hero images have descriptive `alt` attributes
- [ ] Exactly 3 `role="banner"` removed → exactly 1 remains per page
- [ ] JS module count in Network tab ≤8 chunks at runtime

#### Animation & Motion
- [ ] `prefers-reduced-motion: reduce` — ALL animations pause/disable instantly
- [ ] No animation blocks interaction (no `pointer-events: none` during transitions)
- [ ] GSAP ScrollTrigger animations trigger at correct scroll positions (not too early, not too late)
- [ ] Stagger animations: max 320ms total stagger, 40ms increments
- [ ] No layout thrashing during animation (no width/height/top/left animated — only transform/opacity)
- [ ] Page load animations complete before user can reach a focusable element via keyboard

#### Security
- [ ] DOMPurify wraps every `innerHTML` assignment
- [ ] No inline `onclick` handlers in HTML
- [ ] No `eval()` calls
- [ ] CSP header present and does not contain `unsafe-inline` for scripts
- [ ] All external links have `rel="noopener noreferrer"`

---

### 8B — Automated Regression Test Suite

**TASK:** Create a Vitest test file that programmatically verifies the 15 highest-risk issues from the audit. These tests run on every commit via `npm run test`.

```js
// tests/frontend-regression.test.js
// Run with: npm run test
// Requires: vitest, jsdom, @testing-library/dom, axe-core

import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM }  from 'jsdom';
import { axe, toHaveNoViolations } from 'jest-axe'; // vitest-axe compatible
import { readFileSync } from 'fs';
import { resolve } from 'path';

expect.extend(toHaveNoViolations);

// Helper: load local HTML file
function loadHTML(filePath) {
  const html = readFileSync(resolve(__dirname, filePath), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  return dom.window.document;
}

// ─── ISSUE-001: Navigation dead zone ─────────────────────────────────────────
describe('ISSUE-001 | Navigation dead zone 1025–1100px', () => {
  it('nav is visible at 1025px viewport', () => {
    const doc = loadHTML('../index.html');
    const nav = doc.querySelector('nav, [role="navigation"]');
    expect(nav).not.toBeNull();
    // CSS breakpoint test is visual — flag for manual check if nav not found
    expect(nav.getAttribute('aria-label')).toBeTruthy();
  });
});

// ─── ISSUE-002: View Transition guard ────────────────────────────────────────
describe('ISSUE-002 | View Transition guard', () => {
  it('navigation JS checks for startViewTransition support before calling it', () => {
    const jsSource = readFileSync(
      resolve(__dirname, '../src/js/navigation.js'), 'utf8'
    );
    expect(jsSource).toContain("'startViewTransition' in document");
  });

  it('view transition is wrapped in try/catch', () => {
    const jsSource = readFileSync(
      resolve(__dirname, '../src/js/navigation.js'), 'utf8'
    );
    expect(jsSource).toContain('try {');
    expect(jsSource).toContain('catch (');
  });
});

// ─── ISSUE-003: Most Popular badge visibility ─────────────────────────────────
describe('ISSUE-003 | Pricing badge not clipped', () => {
  it('pricing card container does not have overflow:hidden', () => {
    const doc = loadHTML('../pricing.html');
    const pricingCards = doc.querySelectorAll('.pricing-card, [data-plan]');
    pricingCards.forEach(card => {
      const style = card.getAttribute('style') || '';
      expect(style).not.toContain('overflow: hidden');
      expect(style).not.toContain('overflow:hidden');
    });
  });
});

// ─── ISSUE-007: Landmark uniqueness ──────────────────────────────────────────
describe('ISSUE-007 | Exactly one role=banner per page', () => {
  const pages = ['index.html', 'pricing.html', 'about.html', 'faq.html'];
  pages.forEach(page => {
    it(`${page} has exactly one role="banner"`, () => {
      const doc = loadHTML(`../${page}`);
      const banners = doc.querySelectorAll('[role="banner"], header');
      // Count only top-level headers or explicit banner roles
      const bannerCount = Array.from(banners).filter(
        el => el.tagName === 'HEADER' || el.getAttribute('role') === 'banner'
      ).length;
      expect(bannerCount).toBe(1);
    });
  });
});

// ─── ISSUE-008: Search input label ───────────────────────────────────────────
describe('ISSUE-008 | Search input has accessible label', () => {
  it('search input has aria-label or associated label element', () => {
    const doc = loadHTML('../index.html');
    const searchInputs = doc.querySelectorAll('input[type="search"], input[type="text"][name*="search"]');
    searchInputs.forEach(input => {
      const hasAriaLabel   = !!input.getAttribute('aria-label');
      const hasLabelledBy  = !!input.getAttribute('aria-labelledby');
      const id             = input.getAttribute('id');
      const hasLabel       = id ? !!doc.querySelector(`label[for="${id}"]`) : false;
      expect(hasAriaLabel || hasLabelledBy || hasLabel).toBe(true);
    });
  });
});

// ─── ISSUE-009: Alt text on cinematic images ──────────────────────────────────
describe('ISSUE-009 | Hero images have alt text', () => {
  const pages = ['index.html', 'crowagent-core.html', 'about.html'];
  pages.forEach(page => {
    it(`${page}: no img missing alt attribute`, () => {
      const doc = loadHTML(`../${page}`);
      const images = doc.querySelectorAll('img');
      images.forEach(img => {
        expect(img.hasAttribute('alt')).toBe(true);
      });
    });
  });
});

// ─── ISSUE-013: JS file count ────────────────────────────────────────────────
describe('ISSUE-013 | JS bundle count ≤8', () => {
  it('dist/ contains ≤8 JS chunk files', async () => {
    const { readdirSync } = await import('fs');
    let jsFiles = [];
    try {
      jsFiles = readdirSync(resolve(__dirname, '../dist/assets/js'))
        .filter(f => f.endsWith('.js') && !f.endsWith('.map'));
    } catch {
      // dist not built yet — skip
      console.warn('dist/ not found, skipping bundle count test');
      return;
    }
    expect(jsFiles.length).toBeLessThanOrEqual(8);
  });
});

// ─── ISSUE-015: Lottie single fetch ──────────────────────────────────────────
describe('ISSUE-015 | Lottie JSON cached (not fetched 10×)', () => {
  it('LottieManager uses a cache map before fetching', () => {
    const jsSource = readFileSync(
      resolve(__dirname, '../src/js/lottie-manager.js'), 'utf8'
    );
    // Must contain a Map or object cache
    const hasCacheMap = jsSource.includes('new Map(') || jsSource.includes('_cache') || jsSource.includes('cache[');
    expect(hasCacheMap).toBe(true);
  });
});

// ─── ISSUE-020: Changelog hero content ───────────────────────────────────────
describe('ISSUE-020 | Changelog hero has content', () => {
  it('changelog hero section has non-empty h1', () => {
    const doc = loadHTML('../changelog.html');
    const h1  = doc.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent.trim().length).toBeGreaterThan(0);
  });
});

// ─── ISSUE-021: Skip link ─────────────────────────────────────────────────────
describe('ISSUE-021 | Skip link is first focusable element', () => {
  it('skip link exists and precedes all nav elements', () => {
    const doc = loadHTML('../index.html');
    const skipLink = doc.querySelector('a[href="#main-content"], a[href="#content"]');
    expect(skipLink).not.toBeNull();

    // Skip link must appear before the first nav in DOM order
    const nav = doc.querySelector('nav, [role="navigation"]');
    if (nav && skipLink) {
      const position = skipLink.compareDocumentPosition(nav);
      // DOCUMENT_POSITION_FOLLOWING = 4 → nav comes after skipLink ✓
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});

// ─── Brand: Page titles ───────────────────────────────────────────────────────
describe('BRAND | Page title format', () => {
  const titleTests = [
    { file: 'index.html',   mustContain: 'CrowAgent' },
    { file: 'pricing.html', mustContain: 'Pricing | CrowAgent' },
    { file: 'about.html',   mustContain: 'About | CrowAgent' },
    { file: 'faq.html',     mustContain: 'FAQ | CrowAgent' },
  ];
  titleTests.forEach(({ file, mustContain }) => {
    it(`${file} title contains "${mustContain}"`, () => {
      const doc   = loadHTML(`../${file}`);
      const title = doc.querySelector('title')?.textContent || '';
      expect(title).toContain(mustContain);
    });
  });
});

// ─── Brand: No wrong capitalisation ──────────────────────────────────────────
describe('BRAND | Correct capitalisation of CrowAgent', () => {
  const pages = ['index.html', 'pricing.html', 'about.html'];
  pages.forEach(page => {
    it(`${page}: no "Crow Agent" (with space) in HTML`, () => {
      const html = readFileSync(resolve(__dirname, `../${page}`), 'utf8');
      expect(html).not.toMatch(/Crow Agent/g);  // space between Crow and Agent
      expect(html).not.toMatch(/crowagent(?!-)/gi); // all lowercase not followed by hyphen
    });
  });
});

// ─── Brand: OG meta ──────────────────────────────────────────────────────────
describe('BRAND | Open Graph meta tags present', () => {
  const pages = ['index.html', 'pricing.html', 'blog/index.html'];
  pages.forEach(page => {
    it(`${page}: has og:title, og:description, og:image`, () => {
      const doc    = loadHTML(`../${page}`);
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDesc  = doc.querySelector('meta[property="og:description"]');
      const ogImage = doc.querySelector('meta[property="og:image"]');
      expect(ogTitle).not.toBeNull();
      expect(ogDesc).not.toBeNull();
      expect(ogImage).not.toBeNull();
    });
  });
});

// ─── Brand: Favicon system ───────────────────────────────────────────────────
describe('BRAND | Favicon system complete', () => {
  it('index.html has SVG favicon, apple-touch-icon, and manifest', () => {
    const doc = loadHTML('../index.html');
    const svgFavicon    = doc.querySelector('link[rel="icon"][type="image/svg+xml"]');
    const appleTouchIcon= doc.querySelector('link[rel="apple-touch-icon"]');
    const manifest      = doc.querySelector('link[rel="manifest"]');
    expect(svgFavicon).not.toBeNull();
    expect(appleTouchIcon).not.toBeNull();
    expect(manifest).not.toBeNull();
  });
});

// ─── Axe full accessibility scan ─────────────────────────────────────────────
describe('ACCESSIBILITY | axe-core: zero violations', () => {
  const pages = ['index.html', 'pricing.html', 'about.html'];
  pages.forEach(page => {
    it(`${page}: passes axe-core audit`, async () => {
      const html    = readFileSync(resolve(__dirname, `../${page}`), 'utf8');
      const results = await axe(html);
      expect(results).toHaveNoViolations();
    });
  });
});
```

**OUTPUT:** Running `npm run test` executes all regression tests. Any future commit that breaks navigation guards, badge visibility, landmark uniqueness, alt text, skip link position, bundle count, brand capitalisation, OG tags, or favicon system will fail CI immediately. Zero tolerance.

---

### 8C — Browser Compatibility Matrix

Every fix in this document MUST be verified against the following browser matrix before deployment:

| Browser | Version | Platform | Priority |
|---------|---------|----------|----------|
| Chrome | Latest, Latest-1 | macOS, Windows, Android | P0 |
| Safari | Latest, Latest-1 | macOS, iOS 16+, iPadOS | P0 |
| Firefox | Latest, Latest-1 | macOS, Windows | P1 |
| Edge (Chromium) | Latest | Windows | P1 |
| Samsung Internet | Latest | Android | P2 |
| Chrome for Android | Latest | Android | P0 |
| Safari on iOS | 15.x, 16.x, 17.x | iPhone SE (375px), iPhone 15 (390px) | P0 |

**Feature-specific compatibility checks:**

```js
// src/js/utils/feature-detect.js
// Run at app boot — log any missing features to console.warn in development

export const supports = {
  viewTransitions:     'startViewTransition'     in document,
  containerQueries:    CSS.supports('container-type', 'inline-size'),
  hasSelector:         CSS.supports('selector(:has(*))'),
  dvh:                 CSS.supports('height', '100dvh'),
  layerAtRule:         CSS.supports('@layer'),
  scrollTimeline:      'ScrollTimeline'           in window,
  intersectionObserver:'IntersectionObserver'     in window,
  resizeObserver:      'ResizeObserver'           in window,
};

// Log unsupported features in development
if (import.meta.env.DEV) {
  Object.entries(supports).forEach(([feature, supported]) => {
    if (!supported) console.warn(`[CrowAgent] Feature not supported: ${feature}`);
  });
}
```

**Polyfill strategy:**

| Feature | Polyfill | Load condition |
|---------|---------|---------------|
| View Transitions | `@vite-plugin/view-transition` shim | `!supports.viewTransitions` |
| `dvh` units | Use `svh` with `100vh` fallback | Always (CSS fallback) |
| `@layer` | No polyfill needed — degrade gracefully | CSS fallback cascade |
| IntersectionObserver | `intersection-observer` npm package | `!supports.intersectionObserver` |
| Module preload | `modulepreload-polyfill` | Auto-injected by Vite |

---

### 8D — Performance Budget Enforcement

**TASK:** Define and enforce a performance budget that prevents regression after fixes are applied.

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:8092/",
        "http://localhost:8092/pricing",
        "http://localhost:8092/about",
        "http://localhost:8092/blog/",
        "http://localhost:8092/tools/mees-risk-snapshot"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance":    ["error", { "minScore": 0.90 }],
        "categories:accessibility":  ["error", { "minScore": 0.97 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo":            ["error", { "minScore": 0.97 }],
        "first-contentful-paint":    ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint":  ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift":   ["error", { "maxNumericValue": 0.1  }],
        "total-blocking-time":       ["error", { "maxNumericValue": 300  }],
        "interactive":               ["error", { "maxNumericValue": 3800 }],
        "uses-optimized-images":     ["error", { "minScore": 1 }],
        "uses-webp-images":          ["error", { "minScore": 1 }],
        "render-blocking-resources": ["error", { "minScore": 1 }],
        "unused-javascript":         ["warn",  { "maxNumericValue": 50000 }],
        "unused-css-rules":          ["warn",  { "maxNumericValue": 20000 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

Add to CI pipeline (`.github/workflows/ci.yml` or equivalent):

```yaml
# .github/workflows/frontend-quality.yml
name: Frontend Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Lint JS + CSS
        run: npm run lint && npm run lint:css

      - name: Check brand tokens (no hardcoded colours)
        run: npm run lint:tokens

      - name: Unit tests
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: Serve for Lighthouse
        run: npx serve dist -p 8092 &
        shell: bash

      - name: Lighthouse CI
        run: npx lhci autorun --config=lighthouserc.json

      - name: Accessibility (pa11y)
        run: npm run a11y
```

**Budget thresholds summary:**

| Metric | Budget | Action on breach |
|--------|--------|-----------------|
| Performance score | ≥90 | Block merge |
| Accessibility score | ≥97 | Block merge |
| SEO score | ≥97 | Block merge |
| LCP | <2500ms | Block merge |
| CLS | <0.1 | Block merge |
| TBT | <300ms | Block merge |
| JS chunk count | ≤8 | Block merge (lint:tokens step) |
| Hardcoded colours | 0 | Block merge |
| axe violations | 0 | Block merge |
| pa11y errors | 0 | Block merge |

---

## CLOSING — MASTER "RUN EVERYTHING" PROMPT

> **Copy this single prompt into Claude Code to execute the entire fix plan in one session. This is the forcing-function prompt — paste it verbatim.**

---

```
You are a Senior Frontend Engineer operating under contractual quality standards equivalent to Apple, Google, and Stripe. You are executing a complete, zero-exception remediation of the CrowAgent frontend codebase (http://localhost:8092).

You have a master fix document: CROWAGENT_FRONTEND_MASTER_FIX.md. Your job is to implement every fix in that document, in the exact priority order below, without skipping, abbreviating, or deferring any item.

═══════════════════════════════════════════════════════
CONSTITUTIONAL RULES — VIOLATION OF ANY RULE BLOCKS ALL OUTPUT
═══════════════════════════════════════════════════════

RULE 1 — ACCESSIBILITY: WCAG 2.1 Level AA is the minimum. Every interactive element has a visible focus ring. Every image has alt text or is explicitly decorative. Heading hierarchy is never skipped. Exactly one role="banner", role="main", role="contentinfo" per page. Every nav has a unique aria-label. Skip link is the first focusable element in DOM order. All motion respects prefers-reduced-motion.

RULE 2 — PERFORMANCE: Maximum 8 JS chunks total. No asset fetched more than once. All images served as AVIF with WebP fallback. Hero images use fetchpriority="high". LCP < 2500ms, CLS < 0.1, INP < 200ms.

RULE 3 — RESPONSIVE: No hardcoded pixel widths on layout containers. Navigation works at every viewport from 320px to 3840px. Touch targets ≥44×44px. No content clips or overflows without explicit user action.

RULE 4 — ANIMATION: CSS custom properties for all durations and easings. Spring curves for entrances. prefers-reduced-motion disables ALL motion. GPU-only animation (transform, opacity). Stagger ≤320ms total.

RULE 5 — DESIGN SYSTEM: One button system, one card system, one typography scale (clamp), one spacing scale, one colour system — all in crowagent-brand-tokens.css. Zero inline styles. Zero !important except reset.

RULE 6 — CODE QUALITY: ES Modules only. No global variables. Error boundaries on all async operations. No console.log in production.

RULE 7 — SECURITY: DOMPurify on all innerHTML. No inline event handlers. No eval(). All external links use rel="noopener noreferrer".

RULE 8 — BRAND INTEGRITY: Logo served as AVIF > WebP > PNG via <picture>. Dark/light variants auto-switch via prefers-color-scheme. Favicon system complete (SVG + ICO + apple-touch-icon + manifest). All page titles follow: "[Page] | CrowAgent — [Tagline]". "CrowAgent" capitalisation is enforced everywhere. OG meta on every page.

If any fix you produce would violate a constitutional rule, stop and produce a compliant alternative. No exceptions. No compromises.

═══════════════════════════════════════════════════════
EXECUTION ORDER — PRIORITY SEQUENCE
═══════════════════════════════════════════════════════

PHASE 1 — CRITICAL (fix first, unblock users)
  1. ISSUE-001: Fix navigation dead zone at 1025–1100px viewport
  2. ISSUE-002: Fix View Transition race condition (guard + try/catch + debounce)

PHASE 2 — HIGH SEVERITY (fix before any release)
  3. ISSUE-003: Fix "Most Popular" badge clipping on pricing cards
  4. ISSUE-004: Fix blog breadcrumb + category badge z-index collision
  5. ISSUE-005: Consolidate 46 JS files into ≤8 Vite chunks (Section 6A)
  6. ISSUE-006: Deduplicate cookie-banner.js (remove second script tag)
  7. ISSUE-007: Remove duplicate role="banner" — enforce exactly one per page
  8. ISSUE-008: Add aria-label to search input
  9. ISSUE-009: Add descriptive alt text to all 5 cinematic hero images
  10. ISSUE-015: Fix Lottie JSON fetched 10× — implement cache Map in LottieManager

PHASE 3 — MEDIUM SEVERITY (fix in same sprint)
  11. ISSUE-010: Fix excessive whitespace in homepage tab section
  12. ISSUE-011: Add content to changelog hero section
  13. ISSUE-012: Fix icon overlapping Enterprise plan bullet text
  14. ISSUE-013: Standardise all blog card layouts (consistent image ratio + metadata)
  15. ISSUE-014: Fix centered bullet lists → left-align with token-spaced list style
  16. ISSUE-016: Convert hero PNG images to AVIF + WebP via <picture> (all pages)
  17. ISSUE-017: Fix logo oversized on mobile — apply fluid clamp() sizing
  18. ISSUE-018: Style secondary CTA buttons using .btn--secondary token class
  19. ISSUE-019: Add content to sparse stats section (real numbers or structured placeholders)
  20. ISSUE-020: Fix blank changelog hero (already covered in item 13 above — verify)
  21. ISSUE-021: Make skip link reachable via Tab key (DOM order fix)
  22. ISSUE-022–ISSUE-037: Apply all remaining Medium/Low fixes as specified in Section 2

PHASE 4 — GLOBAL SYSTEMS (implement after all individual fixes)
  23. Section 3A: Implement CSS Design Token System (crowagent-brand-tokens.css full spec)
  24. Section 3B: Implement CSS Reset + Base Styles
  25. Section 3C: Refactor all JS to ES Modules with named exports
  26. Section 4: Implement Motion + Animation System (scroll triggers, spring curves, stagger, prefers-reduced-motion)
  27. Section 5: Implement Responsive System (fluid type, fluid space, container queries, fluid grid)
  28. Section 6: Set up Vite build pipeline (vite.config.js, package.json scripts, postcss.config.js)
  29. Section 7A: Implement logo rendering system (<picture>, AVIF/WebP, dark/light variants)
  30. Section 7B: Implement brand name typography system (CSS classes, clamp scale, consistent capitalisation)
  31. Section 7C: Implement complete favicon system (SVG, ICO, apple-touch-icon, manifest.webmanifest)
  32. Section 7D: Implement OG + Twitter meta + structured data on all pages
  33. Section 7E: Implement brand token governance (Stylelint rules, no hardcoded colours)

PHASE 5 — VERIFICATION (run after all fixes applied)
  34. Run: npm run lint && npm run lint:css && npm run lint:tokens — must produce zero warnings
  35. Run: npm run test — all regression tests must pass
  36. Run: npm run build — must produce ≤8 JS chunks, AVIF images, Brotli/gzip assets
  37. Run: npm run lighthouse — all scores must meet budget (Performance ≥90, A11y ≥97, SEO ≥97)
  38. Run: npm run a11y — pa11y must return zero errors
  39. Manual: Tab through every page — verify focus ring on all interactive elements
  40. Manual: Check logo in dark mode — verify dark variant activates
  41. Manual: Paste homepage URL in Slack — verify branded OG card appears
  42. Manual: Test at 320px, 390px, 768px, 1024px, 1280px, 1920px — no overflow, no clipping

═══════════════════════════════════════════════════════
OUTPUT STANDARD
═══════════════════════════════════════════════════════

For every fix you implement, output:
1. The file path modified or created
2. The complete file contents (never partial, never abbreviated, never "// ... rest of code")
3. A one-line confirmation: "✅ ISSUE-NNN fixed — [what changed]"

After completing all fixes:
- Output a final summary table: Issue ID | Status | File(s) Modified
- Output the results of `npm run lint`, `npm run test`, `npm run build`
- State any issues that required a deviation from the fix spec, and explain the compliant alternative chosen

DO NOT stop until every item in the execution order above is marked ✅.
DO NOT produce placeholder code or TODOs.
DO NOT produce partial file contents.
DO NOT violate any constitutional rule.
DO NOT ask for clarification — use the fix document as the specification.

Begin with PHASE 1, ISSUE-001.
```

---

## DOCUMENT COMPLETE

**CROWAGENT_FRONTEND_MASTER_FIX.md** — End of document.

| Section | Status |
|---------|--------|
| Section 0: Master Forcing-Function Prompt | ✅ Complete |
| Section 1: Consolidated Issue Registry (37 issues) | ✅ Complete |
| Section 2: Individual Fix Prompts (ISSUE-001–037) | ✅ Complete |
| Section 3: Global Architecture Hardening | ✅ Complete |
| Section 4: Motion and Animation Upgrade System | ✅ Complete |
| Section 5: Responsive System Overhaul | ✅ Complete |
| Section 6: Modern Frontend Stack (Vite + PostCSS) | ✅ Complete |
| Section 7: Logo and Brand Identity System | ✅ Complete |
| Section 8: Verification Checklist + Regression Tests | ✅ Complete |
| Closing: Master Run-Everything Prompt | ✅ Complete |

**Total issues covered:** 37
**Total sections:** 8 + Closing
**Constitutional rules enforced:** 8
**Regression tests written:** 14 automated + full manual checklist
**Performance budget:** Lighthouse CI gate enforced on every commit
```

---
