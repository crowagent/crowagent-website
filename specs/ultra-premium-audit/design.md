# Website Ultra-Premium Audit Bugfix Design

## Overview

The CrowAgent website has strong fundamentals but does not achieve the visual density, interaction refinement, and perception of quality that characterises top 1% ultra-premium sites (Stripe, Linear, Apple, Vercel). This design formalises the 42 identified defects into a systematic fix plan across 7 implementation waves, targeting the static HTML/CSS/JS architecture deployed on Cloudflare Pages. Each wave is scoped to minimise cross-file regression risk by isolating changes to specific CSS layers, JS modules, or HTML templates.

## Glossary

- **Bug_Condition (C)**: A page view, interaction, or crawl event where the site fails to meet ultra-premium quality benchmarks (missing micro-interactions, abrupt transitions, poor mobile density, performance waste, missing trust signals, incomplete SEO, or weak conversion patterns)
- **Property (P)**: The desired visual, interactive, or technical behaviour as defined in the Expected Behavior clauses (2.1 to 2.42)
- **Preservation**: The 15 existing behaviours (hero globe, carousel, hamburger menu, geometric spine, pricing calculations, form submissions, accordion footer, internal links, a11y, no overflow/errors, Cloudflare build, CTA colours, tool functionality, existing SEO, eyebrow rotator) that must remain unchanged
- **crowagent-brand-tokens.css**: Single source of truth for design tokens (:root custom properties) including colours, spacing, shadows, motion, z-index, typography
- **sovereign-core-v2.compiled.css**: Tailwind v4 compiled output providing utility classes and component primitives
- **@layer order**: reset > brand > sf-fixes > components > utilities > overrides (unlayered rules win)
- **GSAP + ScrollTrigger**: Animation library (v3.15) loaded on all pages via /js/vendor/gsap.min.js
- **Three.js r128**: 3D hero globe loaded from cdnjs, initialised by /js/modules/hero-citadel.js
- **Geometric Spine**: 80rem max-width canonical layout constraint
- **Implementation Wave**: A batch of related fixes that can be built, tested, and deployed atomically

## Bug Details

### Bug Condition

The bug manifests across 42 distinct deficiencies when a visitor views, interacts with, or when a search engine crawls the CrowAgent website. The deficiencies span visual polish (10 defects), spatial design (5), mobile responsiveness (7), performance (5), trust presentation (5), SEO (5), and conversion patterns (5).

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type {page: URL, viewport: Viewport, interaction: InteractionEvent, agent: UserAgent}
  OUTPUT: boolean
  
  RETURN (input.interaction.type == 'hover' AND target IN [navLinks, cards, CTAs, magneticButtons]
          AND noMicroInteractionFeedback(target))
         OR (input.viewport.scrollPosition crosses sectionBoundary
             AND noGradientBlend(sectionBoundary))
         OR (input.viewport.width < 768 AND contentNotOptimisedForMobile(input.page))
         OR (input.viewport.width BETWEEN 768 AND 1024 AND noTabletLayout(input.page))
         OR (input.viewport.width > 2560 AND noUltraWideOptimisation(input.page))
         OR (input.agent.type == 'mobile' AND threeJsLoadsOnLowGPU())
         OR (input.agent.type == 'crawler' AND missingStructuredData(input.page))
         OR (input.page IN [homepage, productPages, pricing] AND missingConversionPattern(input.page))
         OR (input.page == ANY AND redundantGoogleFontsLoaded())
         OR (input.page == ANY AND noCriticalCSSInlined())
END FUNCTION
```

### Examples

- **Defect 1.1**: Visitor hovers nav link, no underline animation, no colour transition, just static text
- **Defect 1.14**: Visitor toggles pricing monthly/annual, price numbers instant-swap with no animation
- **Defect 1.22**: Mobile visitor loads homepage, Three.js attempts to render, Lighthouse score approximately 30
- **Defect 1.33**: Googlebot crawls homepage, no JSON-LD Organization, no BreadcrumbList structured data
- **Defect 1.37**: Visitor compares pricing tiers, only card bullets, no side-by-side feature comparison table

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Hero section (cz-* namespace, holographic gradient, Three.js globe on capable devices, centred layout) must render identically on desktop
- Product carousel cycling, transitions, browser chrome frame, and glass caption overlay must work identically
- Mobile hamburger menu open/close with correct aria states and z-index isolation
- Geometric spine (80rem max-width, symmetric gutters) across all sections on 1440px
- Pricing annual toggle calculation: (monthly x 12 x 0.9) shown per month "billed annually"
- Formspree + Cloudflare Turnstile form submission
- Accordion-style footer columns on mobile
- All internal links resolve without 404
- axe WCAG 2.1 AA: 0 violations
- 0 horizontal overflow, 0 console errors, 0 broken images
- Cloudflare Pages static build process
- Brand-correct CTA colours (bg teal, text obsidian for primary)
- Compliance tools functionality (results before email capture)
- Existing SEO elements (title, meta descriptions, canonical URLs)
- Eyebrow rotator cycling with smooth transitions

**Scope:**
All changes are additive CSS/JS enhancements or HTML additions. No existing selectors are removed. No existing JS module APIs change. The @layer system ensures new rules in the components or utilities layers cannot override existing overrides layer rules without explicit intent.

## Hypothesized Root Cause

Based on the audit, the root causes are:

1. **Incomplete Interaction Design**: Nav links, cards, and CTAs were shipped with minimal CSS transitions (opacity-only or translateY-only) without the multi-property compound transforms and spring-physics curves that define premium feel. The token system (var(--ease-spring), var(--shadow-card-hover)) exists but is underutilised.

2. **Missing CSS Architecture for Transitions**: Section boundary styling relies on flat background-color changes with no pseudo-element gradient blends. The @layer system supports adding these in the components layer without conflict.

3. **No Mobile/Tablet Intermediate Breakpoints**: CSS jumps directly from less than 768px to greater than 768px with no 768 to 1024px tablet or greater than 2560px ultra-wide media queries.

4. **Performance Anti-patterns**: Three.js loads unconditionally (no GPU/device capability check), Google Fonts API loaded alongside self-hosted fonts, no critical CSS extraction, no resource hints for first carousel image.

5. **Missing Structured Data and SEO Markup**: No JSON-LD scripts exist in any HTML file. No hreflang tags. Sitemap may not cover all public pages.

6. **Missing Conversion Patterns**: Homepage lacks "How it works" section, pricing lacks feature comparison table, product pages lack inline FAQs, no secondary CTA option exists.

7. **Missing Trust Signals**: No technology partner logos, no status page link, no social proof scaffold, no certifications/badges in footer.

## Correctness Properties

Property 1: Bug Condition - Visual and Interaction Defects Resolved

_For any_ page view or interaction event where the bug condition holds (isBugCondition returns true), the fixed website SHALL display the correct ultra-premium micro-interaction, transition, layout, performance optimisation, structured data, trust signal, or conversion pattern as specified in Expected Behavior clauses 2.1 through 2.42.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.26, 2.27, 2.28, 2.29, 2.30, 2.31, 2.32, 2.33, 2.34, 2.35, 2.36, 2.37, 2.38, 2.39, 2.40, 2.41, 2.42**

Property 2: Preservation - Existing Behaviour Unchanged

_For any_ page view or interaction where the bug condition does NOT hold (non-affected interactions, existing component behaviour, build process, accessibility compliance), the fixed website SHALL produce exactly the same behaviour as the current site, preserving all 15 documented regression-prevention requirements.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15**

## Fix Implementation

### Implementation Wave Architecture

Changes are organised into 7 waves, each targeting specific file sets within the existing @layer cascade. All CSS additions use the components or utilities layer to avoid overriding existing overrides layer rules.

---

### Wave 1: Visual Polish and Micro-Interactions (Defects 1.1 through 1.10)

**New File**: `Assets/css/ultra-premium-interactions.css` (in @layer components)
**Modified Files**: `crowagent-brand-tokens.css`, `js/modules/section-motion-choreography.js`

**Specific Changes:**

1. **Nav hover micro-interaction (1.1)**: Add CSS rule for nav link underline animation using a ::after pseudo-element. The pseudo-element starts at width: 0 and transitions to width: 100% on hover over 200ms using var(--ease-out). Colour transitions from var(--steel) to var(--white).

2. **Card compound hover (1.2)**: Enhanced .ca-card:hover using compound transform translateY(-4px) + border glow intensification via var(--teal-25) + shadow depth increase via var(--shadow-card-hover). Uses var(--ease-spring) for the overshoot physics feel.

3. **Section gradient blend (1.3)**: Add ::before pseudo-element on sections following dark-to-light transitions. 80-120px gradient overlap zone using linear-gradient from var(--bg) to transparent. Positioned absolutely at the top of the lighter section.

4. **GSAP stagger enhancement (1.4)**: Modify section-motion-choreography.js to stagger child elements within each section reveal. Sequence: eyebrow at 0ms, heading at 100ms, description at 200ms, CTA at 300ms. Uses gsap.from() with stagger property on children matching .ca-eyebrow, h2, p, .btn selectors.

5. **Product bento accent colours (1.5)**: Add data-product attribute to each product card in index.html. CSS maps: [data-product="crowcash"] uses var(--sky), [data-product="crowmark"] uses var(--mark), [data-product="crowcyber"] uses var(--teal-l), [data-product="core"] uses var(--teal-d). Applied to border-color, icon tint, and gradient accent.

6. **"How it works" section (1.6)**: Add new HTML section in index.html after the hero. Content: 4 numbered steps (Sign up, Configure your compliance, Get actionable intelligence, Scale across frameworks). Uses existing .ca-container layout. CSS for horizontal stepper layout on desktop with connecting line, vertical stack on mobile. Each step has: numbered circle (var(--teal) border), heading, and description.

7. **CTA spring hover + press (1.7)**: Enhanced button interactions on .btn-primary, .sv-btn-primary, and [data-cta] elements. Hover state: scale(1.02) + var(--shadow-btn-hover). Active state: scale(0.98). Transition uses var(--ease-spring) over var(--motion-base). No change to existing translateY(-2px) except addition of scale and shadow.

8. **Footer density (1.8)**: Modify nav-inject.js footer template to add multi-column link groups with visual separators. CSS adds border-right: 1px solid var(--white-06) between columns. Top gradient border via ::before pseudo-element on .ca-footer with linear-gradient(90deg, transparent, var(--teal-12), transparent).

9. **Announcement bar shimmer (1.9)**: Add CSS animation on .announce-bar using a ::before pseudo-element with linear-gradient(90deg, transparent, var(--teal-08), transparent). Keyframe animation slides left-to-right over 3s with ease-in-out timing, infinite loop.

10. **Scroll progress gradient (1.10)**: Update #scroll-progress styles. Replace solid background with linear-gradient(90deg, var(--teal), var(--teal-l)). Add box-shadow: 0 0 8px var(--teal-40) for glow at the leading edge. Transition: width 100ms linear for smooth tracking.

---

### Wave 2: Section Transitions and Spatial Design (Defects 1.11 through 1.15)

**Modified Files**: `Assets/css/ultra-premium-interactions.css`, `js/modules/section-parallax.js`, `js/modules/pricing-billing-toggle.js`
**New File**: `js/modules/magnetic-pull.js`

**Specific Changes:**

1. **Depth layering between sections (1.11)**: Add subtle parallax offset via ScrollTrigger on decorative pseudo-elements at section boundaries. CSS adds overlapping section edges using negative margin-top on subsequent sections combined with relative z-index stacking. Pseudo-element shadows create the illusion of depth (box-shadow: 0 -20px 40px -20px rgba(0,0,0,0.3) on ::before).

2. **"Who it's for" icon refinement (1.12)**: Add per-card gradient backgrounds to icon containers using :nth-child selectors combined with existing product colour tokens. Each icon box gets a unique subtle gradient background (e.g., first card uses linear-gradient(135deg, var(--teal-06), var(--teal-12))), refined border-radius, and inner shadow for dimensionality.

3. **Marquee enhancements (1.13)**: The gradient fade masks already exist in sovereign-core-v2.css via -webkit-mask-image. Add hover pause: .ca-marquee-band:hover .ca-marquee-list { animation-play-state: paused }. Refine typography with letter-spacing: 0.15em and font-weight: 800 for more premium density.

4. **Pricing counter animation (1.14)**: Modify pricing-billing-toggle.js to import and use the existing counter-tween.js module. When toggling between monthly/annual, animate price numbers using a 400ms count-up/down interpolation instead of instant DOM text replacement. Counter-tween module already handles GSAP-based number tweening.

5. **Magnetic button feedback (1.15)**: Create new JS module js/modules/magnetic-pull.js. On mousemove within a 60px radius of [data-magnetic] elements, apply subtle translateX/Y transform toward cursor position (maximum 4px offset). On mouseleave, animate back to origin using var(--ease-spring). Uses requestAnimationFrame for performance. Module self-initialises via DOMContentLoaded.

---

### Wave 3: Mobile and Responsive Refinement (Defects 1.16 through 1.21, 1.42)

**New File**: `Assets/css/ultra-premium-responsive.css` (in @layer components)
**Modified Files**: HTML product pages (6 files), `pricing.html`

**Specific Changes:**

1. **Mobile dashboard screenshots (1.16)**: Add @media (max-width: 767px) rules targeting product-page dashboard images. Apply object-fit: cover + object-position: top left to focus on key metrics area rather than showing the entire desktop dashboard at unreadable sizes. Container gets a fixed aspect-ratio: 4/3 on mobile to ensure consistent framing.

2. **Carousel frame mobile fit (1.17)**: Adjust .ca-viewport on mobile to use height: auto instead of fixed aspect-ratio, allowing image natural height to determine container size. Eliminates whitespace below the dashboard image within the browser frame.

3. **Carousel caption contrast (1.18)**: Add mobile-specific styles for carousel captions: minimum font-size: 14px, semi-transparent dark backdrop background: rgba(0,0,0,0.6), padding: var(--space-3) var(--space-4), and border-radius: var(--radius-sm). Ensures 4.5:1 contrast ratio.

4. **Pricing mobile comparison (1.19)**: Add mobile-native pricing layout for @media (max-width: 767px). Replace the min-width: 800px table with a stacked accordion where each tier is a collapsible section showing its features. Uses the existing .faq-item accordion pattern from FAQ page. Removes horizontal scroll requirement.

5. **Tablet intermediate layout (1.20 and 1.42)**: Add @media (min-width: 768px) and (max-width: 1024px) breakpoint. Convert 4-column desktop grids to 2-column. Adjust padding (increase from mobile values). Ensure all touch targets are minimum 44px. Specific adjustments for .ca-sector-grid (2 columns instead of 4), pricing cards (2-up grid), and product bento (2-column stack).

6. **Ultra-wide scaling (1.21)**: Add @media (min-width: 2560px) rules. Increase .ca-container max-width from 90rem to 100rem. Scale typography proportionally using font-size: clamp() values that extend beyond the desktop cap. Add proportionally larger section padding using calc(var(--space-section) * 1.25).

7. **iPad portrait grid (1.42)**: Addressed as part of the tablet breakpoint in item 5 above. The 768-1024px media query specifically handles iPad portrait with 2-column grid and spacing optimised for touch.

8. **Blog page responsive compatibility (all devices)**: Blog posts use a 12-column grid (4-col sidebar TOC + 8-col article) which breaks on mobile/tablet. Add responsive rules: on mobile (max-width: 767px) the grid becomes single-column with TOC collapsed or hidden below the article; on tablet (768-1024px) TOC becomes a 3-col span and article 9-col; article body text gets proper font-size scaling (clamp(1rem, 1.1rem + 0.2vw, 1.25rem)); images within .article-body get max-width: 100% with proper aspect-ratio; the sticky TOC sidebar disables sticky on mobile (position: static); blog hero section gets proper vertical spacing on mobile; blog index grid (blog/index.html) uses 1-column on mobile, 2-column on tablet, 3-column on desktop. All 20+ blog pages inherit these fixes through shared CSS classes.

---

### Wave 4: Performance Perception (Defects 1.22 through 1.26)

**Modified Files**: `js/modules/hero-citadel.js`, `index.html` (and all HTML pages), build scripts
**New File**: `scripts/build-critical-css.js`

**Specific Changes:**

1. **Conditional Three.js loading (1.22)**: Modify hero-citadel.js to check device capability before initialising the 3D globe. Detection logic: if (navigator.hardwareConcurrency <= 2 || window.innerWidth < 768 || (navigator.connection && navigator.connection.effectiveType !== '4g')) then skip Three.js initialisation and display a CSS-only animated gradient background as fallback. The Three.js script tag in HTML gets moved to dynamic insertion (document.createElement('script')) inside the capability check, so mobile devices never download the 200KB+ library. CSS fallback uses @keyframes with radial-gradient animation mimicking the globe's colour feel.

2. **Remove Google Fonts API (1.23)**: Remove from ALL HTML files: the link href="https://fonts.googleapis.com/css2?..." stylesheet tag and the two link rel="preconnect" tags for fonts.googleapis.com and fonts.gstatic.com. Self-hosted fonts in /Assets/fonts/ with fonts-selfhosted.css already cover all required weights (Inter 400/500/600, Plus Jakarta Sans 600/700/800). This eliminates 2 DNS lookups + 1 render-blocking CSS request.

3. **Critical CSS inline (1.24)**: Create build script scripts/build-critical-css.js that: (a) reads the compiled CSS files, (b) extracts rules matching above-the-fold selectors (nav, hero, announce-bar, body, html), (c) outputs a style block for inline insertion. Update HTML pages to include this inline style in the head. Remaining CSS loads via link with media="print" onload="this.media='all'" pattern for non-blocking delivery.

4. **CSS consolidation (1.25)**: Merge the 6+ render-blocking CSS link elements on the homepage into 2 requests maximum: one critical inline style (from item 3 above) + one deferred async bundle combining all remaining CSS files. Build script concatenates: sovereign-core-v2.compiled.css + signature-atmosphere.css + product-carousel.css + premium-transformation.css + nav-global-fix.css + premium-gloss.css + brand-tokens.css into a single file Assets/css/ultra-premium-bundle.css. Pages reference only the inline critical + this single deferred bundle.

5. **Carousel image preload (1.26)**: Add resource hint to index.html head: link rel="preload" as="image" href="/Assets/img/products/crowagent-core-dashboard.webp" (or whichever is the first carousel slide image). This ensures the first visible carousel image is prioritised by the browser's resource scheduler.

---

### Wave 5: Trust and Credibility Presentation (Defects 1.27 through 1.31)

**Modified Files**: `index.html`, `contact.html`, `js/nav-inject.js` (footer template)
**New File**: `Assets/svg/trust-badges/` (directory with inline SVG badge files)

**Specific Changes:**

1. **Technology partner strip (1.27)**: Add new HTML section in index.html (positioned after the "How it works" section or before the footer). Contains inline SVG badges for: Cloudflare Pages (infrastructure), Stripe Billing (payments), UK Gov Digital Standards (compliance). CSS: horizontal flex layout with gap, logos at reduced opacity (0.5) brightening to 0.9 on hover. "Built on" or "Powered by" eyebrow label above the strip.

2. **Status page link in footer (1.28)**: Modify the footer template in js/nav-inject.js to include a "System Status" link in the support/resources column. Links to /status.json or a future dedicated status page. Uses an inline SVG status dot indicator (green circle) alongside the text.

3. **Social proof scaffold (1.29)**: Add testimonial section HTML in index.html with placeholder architecture. Structure: section container with 3 testimonial cards, each containing avatar slot (placeholder circle), quote slot (lorem-style placeholder text), and attribution slot (name + role). CSS uses the existing .ca-card glass style adapted for testimonial cards. Content can be populated when real testimonials are available.

4. **Contact response time (1.30)**: Add text element to contact.html near the form. Content: "We aim to respond within 1 business day" displayed as a small informational badge below or beside the submit button. Styled with var(--teal-06) background, var(--steel) text, and a clock SVG icon.

5. **Footer certifications (1.31)**: Modify js/nav-inject.js footer template to add a certifications row at the bottom. Contains inline SVG badges: ICO Registration badge (with registration number text), UK Data Residency indicator, and Cyber Essentials badge. CSS: horizontal flex layout, muted colour (var(--mist)), small size (var(--icon-sm) to var(--icon-md)).

---

### Wave 6: SEO and Technical Quality (Defects 1.32 through 1.36)

**Modified Files**: All HTML pages, `scripts/generate-og-images.js`, `sitemap.xml`

**Specific Changes:**

1. **Page-specific og:images (1.32)**: Audit scripts/generate-og-images.js to ensure coverage for all main pages: index, pricing, about, contact, faq, roadmap, all 6 product pages, all 6 tool pages, all methodology pages. Update each HTML file's meta property="og:image" to reference its generated page-specific image (e.g., /Assets/og/pricing.png, /Assets/og/crowcash.png). Run build:og to regenerate.

2. **JSON-LD structured data (1.33)**: Add script type="application/ld+json" blocks to HTML pages:
   - Homepage (index.html): Organization schema with name, url, logo, sameAs, contactPoint
   - Product pages (6 files): SoftwareApplication schema (covered in item 4 below)
   - FAQ page (faq.html): FAQPage schema with mainEntity array of Question/Answer pairs
   - All pages: BreadcrumbList schema with itemListElement array representing the page hierarchy

3. **hreflang tags (1.34)**: Add to ALL public HTML pages in the head section:
   - link rel="alternate" hreflang="en-GB" href="https://crowagent.ai/{canonical-path}"
   - link rel="alternate" hreflang="x-default" href="https://crowagent.ai/{canonical-path}"
   This signals to search engines the geographic and language targeting.

4. **Product page SoftwareApplication schema (1.35)**: Add to each of the 6 product pages (crowagent-core.html, crowcash.html, crowcyber.html, crowmark.html, crowesg.html, csrd.html) a JSON-LD block with: @type SoftwareApplication, name, description, applicationCategory ("BusinessApplication"), operatingSystem ("Web"), offers (with price from pricing page data), and aggregateRating placeholder.

5. **Complete sitemap (1.36)**: Audit sitemap.xml against all public pages. Ensure inclusion of: all 6 tool pages (/tools/*/index.html), all 6 methodology pages (tools-*-methodology.html), all blog posts (/blog/*/), the glossary page, changelog, resources page, and any other public-facing URL. Add lastmod dates and priority values.

---

### Wave 7: Conversion Patterns (Defects 1.37 through 1.41)

**Modified Files**: `pricing.html`, product pages (6), `index.html`, `print.css`

**Specific Changes:**

1. **Feature comparison table (1.37)**: Add HTML table section to pricing.html below the pricing cards. Structure: sticky header row with tier names, feature rows with checkmarks (SVG tick icons using var(--teal)) or dashes for excluded features. Categories: Core Features, Compliance Modules, Reporting, Support, Integrations. CSS: responsive table with alternating row backgrounds (var(--white-03) / transparent), column highlighting on the recommended tier. On mobile, transforms to scrollable with sticky first column.

2. **Product-specific FAQs (1.38)**: Add 3 to 5 FAQ items in collapsible accordion at the bottom of each product page. Reuses existing .faq-item accordion pattern and CSS from the FAQ page. Each product page gets contextually relevant questions (e.g., CrowCyber: "What certifications does CrowCyber help with?", "How long does the readiness assessment take?"). Accordion uses details/summary HTML elements for zero-JS progressive enhancement.

3. **Secondary CTA (1.39)**: Add ghost "Join the waitlist" button alongside "Start 14-day free trial" in hero CTA areas. Uses existing .sv-btn-ghost class. Positioned as the second button in the .ca-hero-btns flex container. Links to a waitlist form or signup with a waitlist parameter. Appears on homepage and product pages.

4. **Portfolio tier CTA text (1.40)**: In pricing.html, change the text content of the Portfolio (enterprise) tier CTA button from "Contact sales" to "Talk to founders". No CSS changes required, only HTML text content modification.

5. **Print stylesheet enhancements (1.41)**: Extend existing print.css with pricing-specific rules: hide the billing toggle, display all tier cards in a single-column stack, force the comparison table to render full-width in black-on-white, suppress gradient backgrounds and animations, ensure feature checkmarks print as text characters. The existing print.css already handles nav/footer hiding and general formatting; this extends it for the pricing-specific content that was added in defect 1.37.

---

### File Change Summary

| File | Waves | Change Type |
|------|-------|-------------|
| `Assets/css/ultra-premium-interactions.css` (NEW) | 1, 2 | New CSS file in @layer components |
| `Assets/css/ultra-premium-responsive.css` (NEW) | 3 | New CSS file for responsive breakpoints |
| `js/modules/magnetic-pull.js` (NEW) | 2 | New module for magnetic button feedback |
| `scripts/build-critical-css.js` (NEW) | 4 | Build script for critical CSS extraction |
| `Assets/svg/trust-badges/` (NEW) | 5 | Directory with inline SVG badge files |
| `crowagent-brand-tokens.css` | 1 | Add new tokens if needed (minimal) |
| `js/modules/section-motion-choreography.js` | 1 | Add stagger timing to child reveals |
| `js/modules/section-parallax.js` | 2 | Add depth pseudo-element parallax |
| `js/modules/pricing-billing-toggle.js` | 2 | Integrate counter-tween for price animation |
| `js/modules/hero-citadel.js` | 4 | Add device capability detection, conditional load |
| `js/nav-inject.js` | 5 | Update footer template (status link, badges) |
| `scripts/generate-og-images.js` | 6 | Ensure all page coverage |
| `index.html` | 1, 4, 5, 6, 7 | How it works, preload hints, trust strip, JSON-LD, secondary CTA |
| `pricing.html` | 3, 6, 7 | Mobile comparison, JSON-LD, feature table, CTA text |
| `contact.html` | 5, 6 | Response time text, JSON-LD |
| `crowagent-core.html` | 6, 7 | JSON-LD, inline FAQs |
| `crowcash.html` | 6, 7 | JSON-LD, inline FAQs |
| `crowcyber.html` | 6, 7 | JSON-LD, inline FAQs |
| `crowmark.html` | 6, 7 | JSON-LD, inline FAQs |
| `crowesg.html` | 6, 7 | JSON-LD, inline FAQs |
| `csrd.html` | 6, 7 | JSON-LD, inline FAQs |
| `faq.html` | 6 | FAQPage JSON-LD |
| `about.html` | 4, 6 | Remove Google Fonts, hreflang, JSON-LD |
| All other HTML pages | 4, 6 | Remove Google Fonts, add hreflang |
| `sitemap.xml` | 6 | Add missing URLs |
| `print.css` | 7 | Extend pricing print rules |
| `blog/*.html` (20 files) | 3, 4, 6 | Responsive grid, remove Google Fonts, hreflang, BlogPosting JSON-LD |
| `blog/index.html` | 3, 6 | Blog index responsive grid, hreflang |

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate defects on the unfixed code, then verify fixes work correctly and preserve existing behaviour. The existing test infrastructure (Jest 30, Playwright, Lighthouse CI) provides all necessary tooling.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples demonstrating each defect category BEFORE implementing fixes. Confirm root cause analysis per wave.

**Test Plan**: Write Playwright tests that capture current (defective) states, running against the live unfixed site to observe and document failures.

**Test Cases**:
1. **Nav Hover Test**: Capture computed styles on nav link hover, assert no ::after pseudo-element with width transition exists (demonstrates defect 1.1)
2. **Card Hover Test**: Capture transform/shadow on .ca-card:hover, assert only basic translateY without spring curve or shadow escalation (demonstrates 1.2)
3. **Section Boundary Test**: Screenshot between dark and light sections, assert hard colour edge with no gradient blend (demonstrates 1.3)
4. **Mobile Three.js Test**: Load homepage at 375px viewport width, assert Three.js script element present in DOM and Lighthouse performance score below 50 (demonstrates 1.22)
5. **Google Fonts Test**: Inspect network requests on page load, assert request to fonts.googleapis.com occurs (demonstrates 1.23)
6. **JSON-LD Test**: Parse page HTML source, assert zero script[type="application/ld+json"] elements exist (demonstrates 1.33)
7. **Pricing Mobile Test**: Load pricing.html at 360px width, assert document.body.scrollWidth > window.innerWidth (demonstrates 1.19)
8. **Feature Comparison Test**: Query pricing.html DOM, assert no comparison table element exists (demonstrates 1.37)

**Expected Counterexamples**:
- Missing CSS transitions/animations on hover states (no ::after, no compound transforms)
- Three.js loading unconditionally on all devices including mobile
- Google Fonts API requests present on every page load
- No structured data in any page HTML
- Mobile pricing requiring horizontal scroll due to min-width: 800px table

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed site produces the expected behaviour.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderPage_fixed(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Test Cases by Wave:**

Wave 1 (Visual Polish):
- Playwright hover tests verify computed transform includes scale and translateY on .ca-card
- Assert box-shadow matches var(--shadow-card-hover) token value on card hover
- Assert nav link ::after pseudo-element transitions width from 0 to 100% on hover
- Assert GSAP stagger timeline has 100ms intervals between child element animations
- Assert product bento cards have differentiated border-color per data-product attribute
- Assert "How it works" section exists with 4 step elements
- Assert CTA buttons have scale(1.02) on hover and scale(0.98) on active
- Assert footer has multi-column layout with visual separators
- Assert announce-bar has animated ::before pseudo-element
- Assert scroll-progress uses gradient background

Wave 2 (Spatial Design):
- Visual regression screenshots at section boundaries show gradient overlap
- Assert icon containers have unique gradient backgrounds per nth-child
- Assert marquee pauses on hover (animation-play-state: paused)
- Assert pricing toggle animates numbers over approximately 400ms (not instant)
- Assert [data-magnetic] elements respond to mouse proximity with transform

Wave 3 (Responsive):
- Mobile viewport (375px): product screenshots use object-fit: cover, are readable
- Mobile viewport: carousel frame has no whitespace below image
- Mobile viewport: carousel captions have 14px+ font-size and 4.5:1 contrast
- Mobile viewport (360px): pricing page has no horizontal overflow
- Tablet viewport (768px): grids display 2 columns, touch targets are 44px+
- Ultra-wide viewport (2560px): container max-width is 100rem, content scales

Wave 4 (Performance):
- Mobile load: no Three.js network request, CSS gradient fallback renders
- All pages: no network request to fonts.googleapis.com or fonts.gstatic.com
- Homepage: inline style element present in head with critical CSS
- Homepage: maximum 2 render-blocking CSS requests (ideally 0 blocking + 1 deferred)
- Homepage: first carousel image has preload link in head
- Lighthouse mobile score: 70+ (target)

Wave 5 (Trust):
- Homepage: technology partner strip section exists with 3+ SVG badges
- Footer: "System Status" link present and resolves
- Homepage: testimonial section scaffold exists with card architecture
- Contact page: response time text present near form
- Footer: certification badges (ICO, data residency, Cyber Essentials) present

Wave 6 (SEO):
- All main pages: og:image meta tag references page-specific image (not generic)
- Homepage: JSON-LD Organization schema validates against schema.org
- Product pages: JSON-LD SoftwareApplication schema present and valid
- FAQ page: JSON-LD FAQPage schema present with Question/Answer pairs
- All pages: BreadcrumbList JSON-LD present
- All pages: hreflang en-GB and x-default link elements present
- sitemap.xml: all public URLs present (tools, methodologies, blog posts)

Wave 7 (Conversion):
- Pricing page: feature comparison table present with tier columns and feature rows
- Product pages: FAQ accordion section present with 3+ items each
- Homepage/product pages: secondary ghost CTA button present alongside primary
- Pricing page: Portfolio tier CTA reads "Talk to founders"
- Print stylesheet: pricing page renders cleanly in print preview (Playwright print emulation)

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed site produces the same result as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT renderPage_original(input) = renderPage_fixed(input)
END FOR
```

**Testing Approach**: Visual regression testing via Playwright is the primary preservation strategy because:
- Screenshots capture pixel-level changes across all 30+ pages at canonical 1440px width
- Existing test:visual script provides baseline comparison infrastructure
- Cross-browser tests (test:cross-browser) catch rendering engine differences
- axe-core integration verifies 0 WCAG violations remain after changes
- The Playwright test suite already covers responsive and visual regression

**Test Plan**: Run full test suite on UNFIXED code to establish baselines, then run after each wave to catch regressions immediately.

**Test Cases**:
1. **Hero Preservation**: Visual regression of hero section at 1440px (globe, gradient, layout unchanged)
2. **Carousel Preservation**: Functional test verifying carousel auto-cycles, transitions work, captions display correctly
3. **Hamburger Menu Preservation**: Mobile functional test verifying open/close, aria-expanded states, z-index isolation
4. **Geometric Spine Preservation**: Assert .ca-container max-width remains 90rem on standard desktop (changes only at 2560px+)
5. **Pricing Calc Preservation**: Assert annual calculation (monthly x 12 x 0.9) produces correct values for all tiers
6. **Form Submission Preservation**: Verify Formspree endpoint + Turnstile validation still functions on contact/partner forms
7. **Footer Accordion Preservation**: Mobile test verifying accordion columns still collapse/expand correctly
8. **A11y Preservation**: Run axe-core on all pages, assert 0 violations (existing @axe-core/playwright dependency)
9. **Link Integrity Preservation**: Crawl all internal links across all pages, assert 0 404 responses
10. **Console Error Preservation**: Load all pages, assert 0 console.error entries
11. **Overflow Preservation**: Assert document.body.scrollWidth <= window.innerWidth on all pages at all breakpoints
12. **Build Process Preservation**: Run npm run build, assert exit code 0 (Cloudflare Pages compatibility)
13. **CTA Colour Preservation**: Assert primary CTA buttons maintain bg teal + text obsidian colour scheme
14. **Tool Functionality Preservation**: Load each tool page, interact with calculator, verify results display before any email prompt
15. **Eyebrow Rotator Preservation**: Assert rotator cycles through messages with smooth transitions, no FOUC

### Unit Tests

- Test hero-citadel.js device detection logic (mock navigator.hardwareConcurrency, navigator.connection, window.innerWidth) returns correct boolean for skip/render decision
- Test pricing-billing-toggle.js counter animation produces correct intermediate values and reaches target price within 400ms tolerance
- Test magnetic-pull.js transform calculation stays within bounds (maximum 4px offset in any direction)
- Test JSON-LD generation produces valid schema.org output (validate against schema.org vocabulary)
- Test critical CSS extraction script includes above-fold selectors (nav, hero, body) and excludes below-fold (footer, carousel slides)
- Test sitemap includes all expected URL patterns via static analysis of HTML files in repository

### Property-Based Tests

- Generate random viewport widths (320 to 3840px) and verify no horizontal overflow on any page
- Generate random hover sequences on interactive elements and verify transform values stay within expected bounds (translateY between -5px and 0, scale between 0.98 and 1.02)
- Generate random pricing toggle sequences (rapid toggle back and forth) and verify final displayed price matches the mathematical calculation
- Generate random page URLs from sitemap and verify hreflang and BreadcrumbList JSON-LD presence
- Generate random cursor positions near [data-magnetic] elements and verify transform offset never exceeds 4px

### Integration Tests

- Full page load flow: homepage at 360px, 768px, 1024px, 1440px, 2560px (all content visible, interactive, no overflow)
- Navigation flow: visit every page via nav links (no 404s, no console errors, all pages load within 3s)
- Pricing flow: load pricing, toggle billing, verify all tier prices update with animation, check comparison table renders
- Mobile Three.js bypass: load homepage at mobile viewport, verify CSS gradient fallback renders, verify no Three.js related errors in console
- Print flow: trigger print on pricing page via Playwright, verify print stylesheet activates correctly (comparison table visible, no decorative elements)
- SEO validation: fetch each page, parse JSON-LD, validate against schema.org specifications
- Cross-browser: run core interaction tests on Chromium, Firefox, WebKit via existing Playwright projects
- Lighthouse CI: run scripts/run-lighthouse-ci.js, assert performance score 70+ on mobile for homepage
