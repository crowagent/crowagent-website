# Website Requirement Specification: Premium Cinematic Transformation
**Scope:** `crowagent-website` ONLY (marketing site, NOT platform or portal)
**Version:** 2.0
**Date:** 2026-05-15
**Standard:** Apple / Stripe / Notion / Google Ads tier

---

## 1. Project Objective

Transform the CrowAgent marketing website into a Tier-1 Enterprise SaaS platform that matches or exceeds the visual quality of stripe.com, apple.com, notion.com, and ads.google.com. The site must communicate "premium compliance intelligence" through cinematic motion, layered depth, and pixel-perfect execution across every page.

**Success Criteria:**
- Lighthouse Performance >= 90 on all pages
- Lighthouse Accessibility >= 95 on all pages
- 60 FPS floor on all scroll-driven animations (desktop + mobile)
- Zero layout shift (CLS < 0.1)
- Every page visually indistinguishable from a Tier-1 SaaS product

---

## 2. Design Philosophy (Research-Backed)

### 2.1 From Apple (apple.com)
- **Scroll-driven narrative**: Content reveals tied to scroll position; sections "unfold" as user scrolls
- **Full-bleed imagery**: Hero images that fill the viewport with parallax depth
- **Typography as hero**: Massive display type with gradient fills, used sparingly for impact
- **Whitespace as luxury**: Generous padding between sections (80-120px desktop)
- **Video-as-texture**: Ambient video loops at low opacity as background layers

### 2.2 From Stripe (stripe.com)
- **WebGL mesh gradients**: Animated colour blobs that drift slowly behind content (already implemented in `hero-mesh-shader.js`)
- **Interactive globe/earth**: 3D earth with animated arcs showing global reach
- **Scrollytelling**: Sticky visual columns with flowing text that scrubs through states
- **Glassmorphism cards**: Semi-transparent surfaces with backdrop-blur and subtle borders
- **Micro-interactions**: Magnetic buttons, hover lifts, border pulses

### 2.3 From Notion (notion.com)
- **Clean information hierarchy**: Clear section labels, consistent spacing
- **Dark mode excellence**: Deep backgrounds with high-contrast text and accent colours
- **Bento grid layouts**: Asymmetric card grids that showcase features at a glance
- **Smooth page transitions**: View Transitions API for seamless navigation

### 2.4 From Google Ads (ads.google.com)
- **Gradient mesh backgrounds**: Soft multi-colour gradients as section backdrops
- **Illustration + UI hybrid**: Product screenshots embedded within illustrated environments
- **Trust signals**: Prominent social proof, stats, and certification badges
- **Progressive disclosure**: Tabbed interfaces that reveal detail on demand

---

## 3. Cinematic & Visual Requirements

### REQ-VIS-001: Layered Hero Backdrop (Homepage)
- **Layer 1 (deepest):** WebGL mesh-gradient canvas (`hero-mesh-shader.js`) with 4 drifting colour blobs
- **Layer 2 (mid):** Premium Earth image (`Hero Image 1.png`) with parallax scroll-zoom (scale 1.0 to 1.25 over hero scroll distance)
- **Layer 3 (scrim):** Radial gradient overlay (centre transparent, edges `var(--bg)` at 85% opacity) to ensure text legibility
- **Layer 4 (top):** Content (H1, sub-text, CTAs, trust badges)
- **Behaviour:** Earth image scales up on scroll (GSAP ScrollTrigger scrub). Mesh gradient animates continuously at 30fps. Orbs have subtle mouse-parallax (max 15px offset).
- **Fallback:** If WebGL2 unavailable OR `prefers-reduced-motion`, show static gradient + Earth image without animation.

### REQ-VIS-002: Staggered Hero Entrance
- On page load, hero elements animate in sequence:
  1. Eyebrow badge (fade + slide up, 0ms delay)
  2. H1 headline (fade + slide up, 100ms delay)
  3. Sub-text (fade + slide up, 200ms delay)
  4. CTA buttons (fade + scale from 0.95, 350ms delay)
  5. Trust badges (fade in, 500ms delay)
  6. Product carousel (fade + slide up, 600ms delay)
- Duration: 600ms each. Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Gated behind `prefers-reduced-motion`. If reduced, all elements appear instantly.

### REQ-VIS-003: Scroll-Driven Section Reveals
- Every section below the hero uses `[data-section-reveal]` attribute
- Triggers at 15% viewport entry (IntersectionObserver or GSAP ScrollTrigger)
- Animation: `opacity: 0 to 1`, `translateY(40px) to 0`, duration 800ms
- Stagger children by 80ms if section contains multiple cards/items
- Must NOT cause layout shift (elements occupy space before reveal via `visibility: hidden` or `will-change`)

### REQ-VIS-004: Scrollytelling "How It Works" Section
- Two-column layout: left = flowing text steps, right = sticky visual panel
- Right panel pinned via GSAP ScrollTrigger (desktop >= 1024px)
- As user scrolls through each `.story-step`, the corresponding `.story-visual` crossfades in (800ms, scale 0.95 to 1.0, rotateX -5deg to 0deg)
- Mobile: stacks vertically, visuals appear inline between steps
- Must support 4-6 steps with SVG/image visuals

### REQ-VIS-005: Products Bento Grid
- Asymmetric CSS Grid layout (Apple-style bento)
- Featured products (Core, CrowMark) span 2 columns
- All cards have uniform max-height constraint to prevent ragged rows
- Hover state: `translateY(-8px)`, `scale(1.02)` on image, border pulse to `var(--teal)`, deep shadow
- Staggered reveal on scroll (80ms between cards)
- Each card contains: product icon, name, one-line description, screenshot thumbnail in 4px chrome frame

### REQ-VIS-006: Premium Product Chrome Frames
- All product screenshots wrapped in macOS-style window chrome:
  - 4px border radius on outer frame
  - Traffic-light dots (red/yellow/green) top-left
  - URL bar showing `app.crowagent.ai/[product]`
  - Subtle inner shadow for depth
- Applied uniformly across: homepage carousel, product pages, pricing page

### REQ-VIS-007: Glassmorphism Card Surfaces
- Elevated cards use: `background: rgba(10, 31, 58, 0.6)`, `backdrop-filter: blur(20px)`, `border: 1px solid var(--border2)`
- 3D tilt on hover (max 3deg via CSS `perspective` + `rotateX/Y`). NOT on mobile.
- Spot-glow: radial gradient that follows cursor position on hover (CSS custom properties updated via JS)

### REQ-VIS-008: Magnetic Button Interactions
- All primary CTAs (`[data-magnetic]`) have cursor-proximity pull effect
- On mousemove within button bounds: translate button 15% toward cursor
- On mouseleave: spring back with elastic easing (0.7s)
- Button glow: subtle teal box-shadow pulse on hover
- Gated behind `prefers-reduced-motion`

### REQ-VIS-009: Navigation Premium Polish
- Sticky nav with backdrop-blur on scroll (shrinks from 72px to 56px height)
- Dropdown menus with glassmorphism surface
- Active page indicator: teal underline with 200ms slide transition
- Mobile: full-screen overlay with staggered menu item reveals

### REQ-VIS-010: Footer Cinematic Treatment
- Gradient mesh background (subtle, different palette from hero)
- Large CTA section above footer links ("Ready to automate compliance?")
- Footer links in multi-column grid with hover colour transitions
- Social icons with hover scale + glow

---

## 4. Page-Specific Requirements

### REQ-PAGE-001: Homepage (`index.html`)
- Hero with layered parallax (REQ-VIS-001)
- Persona selector tabs (existing, polish transitions)
- Product carousel with 4px chrome frames
- "How It Works" scrollytelling section
- Products bento grid (6 products)
- Social proof / testimonials section
- Compliance frameworks parallax section
- Final CTA section
- Footer

### REQ-PAGE-002: Product Pages (`crowagent-core.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowesg.html`, `csrd.html`)
- Product-specific hero with gradient accent colour
- Feature grid (bento or alternating left/right sections)
- Product screenshots in chrome frames with scroll-triggered reveals
- Pricing teaser with link to full pricing page
- Integration/workflow diagram (scrollytelling if complex)
- CTA section

### REQ-PAGE-003: Pricing (`pricing.html`)
- 6-product pricing table (Core, CrowMark, CSRD, Cyber, Cash, ESG)
- Toggle: Monthly / Annual (annual = exactly 10% discount: monthly x 12 x 0.9)
- Bundle discount banner: "Save 15% when you subscribe to 3+ products"
- ESG shown as "Coming Q3 2026, Join Waitlist" state
- Comparison table with feature checkmarks
- FAQ accordion below pricing

### REQ-PAGE-004: Products Index (`products/index.html`)
- Overview of all 6 products in bento grid
- Each card links to individual product page
- Remove ALL references to deprecated products (CrowBuild, CrowSight, CrowNest, CrowTrace)

### REQ-PAGE-005: Roadmap (`roadmap.html`)
- Timeline visualization (vertical, scroll-driven)
- Products marked: Core (Live), CrowMark (Live), CSRD (Live), CrowCyber (Live), CrowCash (Live), CrowESG (Q3 2026)
- Remove all deprecated product entries

### REQ-PAGE-006: About (`about.html`)
- Team section with hover effects
- Company values with icon animations
- Timeline/milestones section

### REQ-PAGE-007: Blog Index (`blog/index.html`)
- Card grid with hover lifts
- Category filter tabs
- Featured post hero card

### REQ-PAGE-008: Tools Landing (`tools.html`)
- Bento grid of free tools
- Each tool card with icon, description, "Try Free" CTA
- Scroll-triggered reveals

### REQ-PAGE-009: Contact (`contact.html`)
- Split layout: form left, info right
- Form with micro-interactions (validation shake, success pulse)
- Map or office illustration

---

## 5. Product Portfolio Requirements

### REQ-PRD-001: Canonical Product List (6 Products)
1. **CrowAgent Core** - MEES compliance, EPC gap analysis, retrofit planning
2. **CrowMark** - PPN 002 social value scoring (10% threshold), bid narrative AI
3. **CSRD Checker** - Omnibus I applicability, double materiality
4. **CrowCyber** - Cyber Essentials v3.3 (Danzell), evidence library, CE+ readiness
5. **CrowCash** - Late Payment Act 1998, statutory interest calculator, automated chasing
6. **CrowESG** - EFRAG VSME, sustainability reporting (Coming Q3 2026)

### REQ-PRD-002: Deprecation Sweep
- **MANDATORY:** Remove ALL references to `CrowBuild`, `CrowSight`, `CrowNest`, `CrowTrace` from:
  - All `.html` files
  - All `.js` files (especially `nav-inject.js`)
  - `sitemap.xml`
  - Any CSS class names referencing these products
  - JSON-LD structured data
- Verification: `grep -ri "crowbuild\|crowsight\|crownest\|crowtrace" --include="*.html" --include="*.js"` must return zero results

### REQ-PRD-003: New Product Pages
- `crowcyber.html` - fully styled, SEO-optimized, with unique meta/OG tags
- `crowcash.html` - fully styled, SEO-optimized, with unique meta/OG tags
- `crowesg.html` - fully styled, SEO-optimized, with "Coming Q3 2026" state

### REQ-PRD-004: Navigation Update
- `js/nav-inject.js` must render the canonical 6-product dropdown
- Products grouped: "Compliance" (Core, CSRD, CrowESG), "Growth" (CrowMark, CrowCyber, CrowCash)
- Mobile nav must match desktop product list exactly

---

## 6. Non-Functional Requirements

### NFR-PERF-001: 60 FPS Animation Floor
- All GSAP animations use `transform` and `opacity` only (never `width`, `height`, `top`, `left`)
- `will-change: transform` applied to animated elements ONLY during animation (remove after)
- WebGL shader capped at 30fps (sufficient for slow mesh drift)
- ScrollTrigger uses `scrub: true` with `invalidateOnRefresh: true`
- Debounce resize handlers; use `ScrollTrigger.config({ ignoreMobileResize: true })`

### NFR-PERF-002: Core Web Vitals
- LCP < 2.5s (hero image preloaded with `fetchpriority="high"`)
- FID < 100ms (defer all non-critical JS)
- CLS < 0.1 (reserve space for images with `width`/`height` attributes)
- INP < 200ms

### NFR-PERF-003: Asset Optimization
- All images in WebP + AVIF with `<picture>` fallbacks
- Critical CSS inlined in `<style>` block (above-the-fold only)
- Full stylesheet loaded via `preload` + `onload` swap pattern
- GSAP loaded with `defer` attribute
- Fonts: preload primary weight (Plus Jakarta Sans 700)

### NFR-A11Y-001: Motion Accessibility
- ALL animations gated behind `prefers-reduced-motion` media query check
- GSAP timelines: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before creating
- WebGL canvas: hidden and replaced with static fallback when reduced motion active
- Parallax effects: disabled entirely for reduced motion users
- Focus indicators: visible 2px teal outline on all interactive elements

### NFR-A11Y-002: Semantic HTML & ARIA
- All sections use semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`)
- Carousel: `aria-roledescription="carousel"`, slides with `role="group"`
- Tabs: proper `role="tablist"`, `role="tab"`, `aria-selected`
- Tooltips: `role="tooltip"`, `aria-describedby` on trigger
- Skip link: visible on focus, links to `#main-content`
- Colour contrast: WCAG AA minimum (4.5:1 for body text, 3:1 for large text)

### NFR-SEC-001: Content Security Policy
- No inline `<script>` tags (all JS externalized)
- Inline `<style>` permitted ONLY for critical above-fold CSS (documented in `Assets/css/critical-above-fold.css`)
- All external resources use `crossorigin` attribute where applicable
- Subresource Integrity (SRI) on vendor scripts where CDN-hosted

### NFR-SEO-001: Search Optimization
- Every page: unique `<title>`, `<meta description>`, `<link rel="canonical">`
- OG tags: `og:title`, `og:description`, `og:image` (1200x630), `og:url`
- Twitter cards: `summary_large_image`
- JSON-LD structured data (externalized in `/js/structured-data.js`)
- `sitemap.xml` includes ALL live pages (including `/crowcyber`, `/crowcash`, `/crowesg`)
- `hreflang` tags for `en-GB` and `x-default`

### NFR-BRAND-001: Token Compliance
- **MANDATORY:** All colours via CSS custom properties from `crowagent-brand-tokens.css`
- Never hardcode hex values in HTML or component CSS
- Use `var(--ca-*)` prefixed aliases for component-level tokens
- Typography: `var(--font-display)` for headings, `var(--font-body)` for body
- Border radius: `var(--r)` (12px), `var(--r2)` (16px), `var(--r3)` (20px)
- CTA buttons: background `var(--teal)`, text colour `var(--obsidian)`

---

## 7. Technical Constraints

### CONSTRAINT-001: Tech Stack
- 100% Vanilla HTML / CSS / JavaScript
- No React, Vue, Svelte, or any framework
- No build step required for deployment (pre-built assets committed)
- GSAP 3.x + ScrollTrigger (already loaded from `/js/vendor/`)
- WebGL2 for mesh shader (graceful fallback to CSS gradients)

### CONSTRAINT-002: Deployment
- Hosted on Cloudflare Pages
- NO production deployment without explicit user approval
- All changes verified on `localhost:8083` (`npx http-server -p 8083`) first
- Git: commit to feature branch, never directly to main

### CONSTRAINT-003: Browser Support
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Mobile: iOS Safari 15+, Chrome Android 90+
- WebGL2: graceful degradation (not a hard requirement)

---

## 8. Image & Asset Requirements

### REQ-ASSET-001: Hero Earth Image
- Source: `marketing-screenshots/raw/Hero Image 1.png`
- Must be converted to WebP + AVIF at multiple sizes (600w, 1200w, 1920w)
- Placed at `/Assets/photos/hero-premium-earth.{webp,avif,png}`
- Preloaded with `fetchpriority="high"` for LCP

### REQ-ASSET-002: Product Screenshots
- Source: `marketing-screenshots/raw/` and `marketing-screenshots/framed/`
- All screenshots converted to WebP at 600w, 1200w, 2400w
- AVIF variants for supporting browsers
- Wrapped in 4px chrome frame component in HTML

### REQ-ASSET-003: Icons & Illustrations
- Product icons: SVG format, inline or sprite
- UI icons: Lucide icon set (already used in hero penalty banners)
- Lottie animations for CTA arrows and loading states (`/Assets/lottie/`)

### REQ-ASSET-004: Video Assets (Optional Enhancement)
- Ambient cloud/particle video loop for hero (15% opacity, `mix-blend-mode: lighten`)
- Format: WebM (primary) + MP4 (fallback)
- Max file size: 2MB (compressed, short loop)
- `prefers-reduced-motion`: video paused and hidden

---

## 9. Cleanup & Housekeeping Requirements

### REQ-CLEAN-001: Dead Code Removal
- Audit ALL `.js` files in `/js/` and `/js/modules/` for unused functions, dead branches, commented-out blocks
- Remove any JS module that is not referenced by any HTML page (check all `<script>` tags across all `.html` files)
- Remove any CSS rules in `styles.css` that target classes/IDs not present in any HTML file (use PurgeCSS report)
- Remove any event listeners or DOM queries targeting elements that no longer exist

### REQ-CLEAN-002: Unused Image Cleanup
- Audit ALL files in `/Assets/photos/`, `/Assets/screenshots/`, `/Assets/icons/`, `/Assets/brand/`
- Cross-reference every image filename against all `.html` and `.css` files
- Any image NOT referenced by any HTML or CSS file must be moved to a `/Assets/_archive/` folder (not deleted, in case needed later)
- Remove any broken `<img>` tags pointing to non-existent files
- Remove duplicate images (same content, different filenames)

### REQ-CLEAN-003: Legacy Code Sweep
- Remove any `<!-- TODO -->` or `<!-- FIXME -->` comments older than 30 days
- Remove any `console.log` statements (except those gated behind `__CA_DEBUG__`)
- Remove any unused CSS vendor prefixes for browsers below the support floor (Chrome 90+)
- Remove any polyfills for features supported by all target browsers

### REQ-CLEAN-004: File Organization
- Ensure no orphaned HTML files (pages not linked from nav or sitemap)
- Ensure all JS modules follow the IIFE pattern already established
- Ensure all CSS sections are clearly commented with section markers

---

## 10. Responsiveness Requirements (CRITICAL - BLOCKING)

### REQ-RESP-001: Breakpoint Testing (MANDATORY at Every Phase)
- Every change MUST be tested at these exact widths:
  - 1440px (large desktop)
  - 1280px (standard desktop)
  - 1024px (tablet landscape)
  - 768px (tablet portrait)
  - 640px (mobile large)
  - 375px (mobile small / iPhone SE)
  - 320px (minimum supported width)
- NO horizontal overflow at any breakpoint
- NO text truncation that hides meaning
- NO touch targets smaller than 44x44px on mobile

### REQ-RESP-002: Layout Integrity
- All grids must collapse gracefully (3-col to 2-col to 1-col)
- Hero section must remain visually impactful at all sizes
- Navigation must switch to hamburger menu at <= 1024px
- Product chrome frames must scale proportionally (never clip content)
- Bento grid cards must maintain aspect ratio when stacking
- Footer columns must stack on mobile with proper spacing

### REQ-RESP-003: Typography Scaling
- All headings use `clamp()` for fluid scaling
- Body text never smaller than 16px on mobile (readability)
- Line length never exceeds 75 characters (max-width on text containers)
- Spacing scales proportionally (use `var(--space-section)` which steps down on mobile)

### REQ-RESP-004: Image Responsiveness
- All images use `srcset` with appropriate breakpoints
- Art direction via `<picture>` element where mobile needs different crop
- Images never overflow their container
- Aspect ratios preserved (no stretching or squishing)

---

## 11. Image Quality & Sourcing Requirements

### REQ-IMG-001: Quality Standard
- ALL decorative/hero images must be 8K quality (7680x4320 or equivalent high-res source)
- Minimum source resolution: 4K (3840x2160) for any full-width image
- Product screenshots: captured at 2x DPI minimum (Retina quality)
- NO low-resolution, pixelated, or obviously stock-photo images
- NO images that look AI-generated (no uncanny valley faces, no impossible geometry, no telltale AI artifacts)

### REQ-IMG-002: Sourcing Rules
- Hero/background images: royalty-free from Unsplash, Pexels, or equivalent (CC0 / Unsplash License)
- Product screenshots: real screenshots from the actual CrowAgent platform
- Icons: SVG vector format (infinitely scalable, no pixelation)
- Team photos: real photos of real people (if used)
- NEVER use obviously AI-generated faces or scenes
- NEVER use generic stock photos with watermarks or visible attribution requirements

### REQ-IMG-003: Processing Pipeline
- Source images downloaded at maximum available resolution
- Processed through Sharp: resize to needed dimensions, convert to WebP + AVIF
- Output sizes: 600w, 1200w, 1920w, 2400w (for srcset)
- Quality settings: WebP q=82, AVIF q=72 (optimal quality/size balance)
- All images must pass visual inspection (no compression artifacts visible at 100% zoom)

### REQ-IMG-004: Earth/Globe Hero Image
- The hero Earth image must be photorealistic, cinematic quality
- Source: NASA Blue Marble or equivalent 8K Earth imagery (public domain)
- Must show Earth from space with visible atmosphere glow
- Colour-graded to match brand palette (teal/navy tones)
- NO cartoonish or flat-design Earth illustrations

---

## 12. Carousel & Interactive Component Excellence

### REQ-CAROUSEL-001: Carousel Standards
- Smooth, buttery transitions (no jank, no frame drops)
- Touch/swipe support on mobile (native feel, not laggy)
- Keyboard navigation (arrow keys, tab to controls)
- Auto-play with pause on hover/focus (6-second interval)
- Dot indicators or progress bar showing current position
- Infinite loop (wraps from last to first seamlessly)
- Transition: 500ms ease with slight scale effect on entering slide

### REQ-CAROUSEL-002: Visual Quality
- All carousel images in chrome frames (consistent presentation)
- Smooth crossfade or slide transition (not abrupt cuts)
- Active slide slightly elevated (shadow + scale 1.02)
- Inactive slides dimmed (opacity 0.6) if visible in viewport
- Figcaptions styled consistently below each slide

### REQ-CAROUSEL-003: Responsive Carousel
- Desktop: show 1 full slide with peek of adjacent slides
- Tablet: show 1 full slide, swipe enabled
- Mobile: full-width single slide, swipe enabled, dots below
- Controls (prev/next arrows) hidden on mobile (swipe only)

---

## 13. Alignment & Visual Precision Requirements

### REQ-ALIGN-001: Grid Alignment
- ALL sections must align to the same max-width container (1400px with clamp padding)
- Section headings, body text, and CTAs must share the same left edge
- Bento grid cards must have ZERO pixel misalignment between rows
- Product chrome frames must be identical dimensions within the same context
- Icon sizes must be consistent within a section (16px, 20px, or 24px, never mixed)

### REQ-ALIGN-002: Vertical Rhythm
- Consistent spacing between sections: `var(--space-section)` (80px desktop, 48px mobile)
- Consistent spacing within sections: 24px between elements, 48px between sub-sections
- Headers: 14px margin-bottom for eyebrow, 12px for H1, 16px for H2, 8px for H3
- Cards: equal padding on all sides (32px desktop, 24px mobile)
- No orphaned single items at the end of a grid row (use CSS `grid-auto-flow: dense` or adjust spans)

### REQ-ALIGN-003: Header & Footer Consistency
- Navigation height: exactly 72px (56px when scrolled)
- Logo size: consistent across all pages (same height, same position)
- Footer: same layout on every page (no per-page variations)
- Announce bar: exactly 40px height, centred content
- All pages must have identical top spacing below nav (no page-specific overrides)

### REQ-ALIGN-004: Icon & Logo Standards
- Product icons: 32px in nav, 48px in bento cards, 64px in product page heroes
- Trust badge icons: 16px consistently
- Social icons in footer: 24px with 16px gap
- Logo in nav: max-height 32px, vertically centred
- All icons must be optically centred (not just mathematically centred)

### REQ-ALIGN-005: Tile & Card Uniformity
- Within any grid, all cards must be the same height per row (use `grid-auto-rows: 1fr` or explicit heights)
- Card content must not overflow (use `overflow: hidden` with proper padding)
- Card borders must be uniform thickness (1px) and colour (`var(--border2)`)
- Hover states must not cause adjacent cards to shift (use `transform` only, not margin/padding changes)

---

## 14. User Testing & Feedback Loop (MANDATORY)

### REQ-TEST-001: Testing Checkpoints
- After EVERY phase completion (Phases 1-10), the executor MUST:
  1. Start local server (`npx http-server -p 8083`)
  2. Present a summary of changes made
  3. List specific pages/sections to review
  4. ASK the user to test locally and provide feedback
  5. WAIT for user response before proceeding to next phase
- Do NOT proceed to the next phase until user confirms "looks good" or "proceed"

### REQ-TEST-002: Feedback Accommodation
- When user reports a defect, bug, or visual issue:
  1. Acknowledge the issue immediately
  2. Fix it BEFORE moving to any new work
  3. Re-present the fix for verification
  4. Only proceed after user confirms the fix is acceptable
- User feedback takes priority over the execution plan
- If feedback requires reworking a completed phase, do it without complaint

### REQ-TEST-003: Responsiveness Testing Protocol
- At each testing checkpoint, explicitly test and report:
  - Desktop (1440px): screenshot or description of layout
  - Tablet (768px): confirm grid collapse, nav hamburger
  - Mobile (375px): confirm single-column, touch targets, no overflow
- If ANY responsive issue is found, fix it before proceeding
- Responsiveness is not optional polish; it is a blocking requirement

### REQ-TEST-004: Visual Quality Bar
- The website must NOT look like it was generated by AI
- Every section must look hand-crafted and intentionally designed
- Text must read naturally (no generic filler, no repetitive patterns)
- Images must look curated and purposeful (not random stock)
- Spacing must look deliberate (not default browser spacing)
- The overall impression must be: "a human designer spent weeks on this"

---

## 15. Quality Gates (Must Pass Before Production)

1. **Visual QA:** Every page reviewed on localhost at 1440px, 1024px, 768px, 375px
2. **Performance:** Lighthouse >= 90 Performance on all pages
3. **Accessibility:** Lighthouse >= 95 Accessibility; zero axe-core critical/serious violations
4. **Animation:** 60fps confirmed via Chrome DevTools Performance panel (no jank on scroll)
5. **Cross-browser:** Tested in Chrome, Firefox, Safari (via Playwright)
6. **Reduced Motion:** All pages functional and readable with `prefers-reduced-motion: reduce`
7. **SEO:** All pages have valid JSON-LD, unique meta, OG images
8. **Deprecation:** Zero grep hits for deprecated product names
9. **User Approval:** Explicit sign-off from user before any merge/deploy

---

## 10. Regulatory Content Rules (HARD CONSTRAINTS)

These rules apply to ALL content on the website:

1. MEES Band C 2028 is ALWAYS described as "proposed" - never as confirmed or enacted law
2. MEES fines must NEVER exceed 150,000 GBP (rateable-value basis per SI 2015/962 reg 39)
3. PPN 002 social value threshold is ALWAYS 10% - never 5%
4. Late Payment Act interest is Bank of England base rate + 8 percentage points
5. Statutory compensation: 40 GBP (debt under 1000), 70 GBP (1000-9999), 100 GBP (10000+)
6. Cyber Essentials v3.3 is the "Danzell" update, in force 28 April 2026
7. CSRD Omnibus I thresholds: >1,000 employees AND >450M EUR turnover
8. EFRAG VSME 2024: Module B (Basic) + optional Module C (Comprehensive)
