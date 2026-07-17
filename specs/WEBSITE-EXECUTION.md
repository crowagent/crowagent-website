# Website Execution Specification: Premium Cinematic Transformation
**Scope:** `crowagent-website` ONLY
**Version:** 2.0
**Date:** 2026-05-15

---

## Execution Principles

1. **One phase at a time.** Complete and verify each phase before starting the next.
2. **Verify locally.** Every change must be checked on `localhost:8083` before proceeding.
3. **No production deploy.** Wait for explicit user approval before any merge or deploy.
4. **Update state file.** After completing each phase, update `.gemini/state/TRANSFORMATION-STATE.md`.
5. **Commit frequently.** Commit after each completed phase with a descriptive message.

---

## Phase 1: Baseline Verification & Cleanup (PRIORITY: IMMEDIATE)

### Task 1.1: Verify Local Server
- Run `npx http-server -p 8083` in the `crowagent-website` directory
- Open `http://localhost:8083` in browser
- Confirm no fatal JS errors in console
- Confirm homepage loads with hero section visible

### Task 1.2: Commit Untracked Files
- Stage all untracked `js/modules/*` files
- Stage `UX-MOTION-SPEC.md` and `COMPONENT-BREAKDOWN.md`
- Commit with message: `chore: commit cinematic engine baseline (pre-transformation)`

### Task 1.3: Deprecation Sweep
- Run: `grep -ri "crowbuild\|crowsight\|crownest\|crowtrace" --include="*.html" --include="*.js" --include="*.css"`
- For each match found:
  - If in navigation: remove the menu item entirely
  - If in product listings: remove the card/entry
  - If in copy text: rewrite to reference current 6-product lineup
  - If in CSS: remove the class/rule
- Run grep again to confirm zero results
- Files to check specifically:
  - `js/nav-inject.js` (navigation dropdown)
  - `products/index.html` (product catalog)
  - `roadmap.html` (timeline entries)
  - `pricing.html` (pricing columns)
  - `sitemap.xml` (URL entries)
  - `js/structured-data.js` (JSON-LD)

### Task 1.4: Navigation Update
- Edit `js/nav-inject.js`:
  - Products dropdown must list exactly:
    1. CrowMark (link: `/crowmark`)
    2. CSRD Checker (link: `/csrd`)
    3. CrowCyber (link: `/crowcyber`)
    4. CrowCash (link: `/crowcash`)
    5. CrowESG (link: `/crowesg`)
  - Group under: "Compliance" (CSRD, ESG) and "Growth" (CrowMark, CrowCyber, CrowCash)
  - Remove any deprecated product references

### Task 1.5: Sitemap Update
- Edit `sitemap.xml`:
  - Add: `/crowcyber`, `/crowcash`, `/crowesg`
  - Remove any deprecated product URLs
  - Verify all listed URLs return 200

**Verification:** Reload localhost, confirm nav shows 6 products, no console errors.
**Commit:** `fix: deprecation sweep + nav update to 6-product lineup`

---

## Phase 2: Hero Section Cinematic Enhancement

### Task 2.1: Hero Earth Image Optimization
- Source: Copy `marketing-screenshots/raw/Hero Image 1.png` to `Assets/photos/hero-premium-earth.png`
- Convert to WebP: use `sharp` or manual conversion at 1920w, 1200w, 600w
- Place at: `Assets/photos/hero-premium-earth-1920.webp`, etc.
- Update `index.html` hero backdrop to use `<picture>` with srcset

### Task 2.2: Hero Backdrop Layer Structure
- Verify `index.html` has this layer order (already partially done):
  ```html
  <section class="hero">
    <!-- Layer 0: WebGL mesh -->
    <canvas class="hero-mesh-canvas" data-hero-mesh aria-hidden="true"></canvas>
    <!-- Layer 1: Earth image -->
    <div class="hero-backdrop" aria-hidden="true">
      <picture>
        <source srcset="/Assets/photos/hero-premium-earth-1920.avif" type="image/avif">
        <source srcset="/Assets/photos/hero-premium-earth-1920.webp" type="image/webp">
        <img src="/Assets/photos/hero-premium-earth.png" alt="" class="hero-earth-img"
             width="1920" height="1080" loading="eager" fetchpriority="high">
      </picture>
      <div class="hero-backdrop-scrim"></div>
    </div>
    <!-- Layer 2: Orbs -->
    <div class="hero-orb hero-orb--teal" aria-hidden="true"></div>
    <div class="hero-orb hero-orb--lime" aria-hidden="true"></div>
    <!-- Layer 3: Content -->
    <div class="wrap container-wide">
      ...content...
    </div>
  </section>
  ```

### Task 2.3: Hero Staggered Entrance Animation
- Edit `js/modules/hero-staggered-entrance.js` (or create if missing)
- Implement the timeline from WEBSITE-DESIGN.md section 3.5
- Elements: `.hero-eyebrow`, `.hero h1`, `.hero-sub`, `.hero-btns`, `.hero-trust`, `.hero-visual`
- MUST check `prefers-reduced-motion` before creating timeline
- Wire into page via `<script src="/js/modules/hero-staggered-entrance.js" defer></script>`

### Task 2.4: Earth Scroll-Zoom
- Verify `cinematic-init.js` has the earth zoom animation (section 3.2 of design spec)
- Confirm it targets `.hero-earth-img`
- Confirm `scrub: 1.5` for smooth scroll-linked zoom
- Test: scroll down slowly, earth should scale from 1.0 to 1.25

### Task 2.5: Orb Mouse Parallax
- In `js/modules/hero-parallax.js` (or create):
  - On mousemove over `.hero`, calculate offset from centre
  - Move `.hero-orb--teal` by `x * 0.02, y * 0.02` (max 15px)
  - Move `.hero-orb--lime` by `x * -0.015, y * -0.015` (inverse, max 12px)
  - Use GSAP `quickTo` for performance
  - Gate behind `prefers-reduced-motion`

### Task 2.6: Add `data-magnetic` to Hero CTAs
- Add `data-magnetic` attribute to `.btn-primary-v2` and `.btn-secondary` in hero
- Verify `cinematic-init.js` magnetic handler picks them up

**Verification:** Reload localhost. Hero should have: earth image visible, mesh gradient behind, staggered entrance on load, earth zooms on scroll, orbs move with mouse, buttons have magnetic pull.
**Commit:** `feat: hero cinematic enhancement (layered parallax + staggered entrance)`

---

## Phase 3: Section Reveals & Scrollytelling

### Task 3.1: Add `data-section-reveal` Attributes
- Add `data-section-reveal` to every `<section>` below the hero in `index.html`
- Add `data-reveal-child` to individual cards/items within those sections
- Add CSS rule: `[data-section-reveal] { opacity: 0; transform: translateY(40px); }`
- Add no-JS fallback in a `<noscript><style>` block or via `.no-js` class

### Task 3.2: Implement Section Reveal Logic
- In `cinematic-init.js`, add the staggered reveal code from design spec section 3.3
- Use `gsap.utils.toArray('[data-section-reveal]')` to batch all sections
- Each section triggers independently at 85% viewport entry
- Children stagger at 80ms intervals

### Task 3.3: "How It Works" Scrollytelling Section
- If not already present in `index.html`, add the `.story-shell` markup:
  ```html
  <section class="story-shell" data-section-reveal>
    <div class="story-steps">
      <div class="story-step" data-step="1">
        <h3>Step 1: Connect Your Data</h3>
        <p>Upload your EPC certificates, property portfolio, or compliance documents.</p>
      </div>
      <div class="story-step" data-step="2">...</div>
      <div class="story-step" data-step="3">...</div>
      <div class="story-step" data-step="4">...</div>
    </div>
    <div class="story-visual-wrap">
      <div class="story-visual" data-visual="1"><img src="..." alt="..."></div>
      <div class="story-visual" data-visual="2"><img src="..." alt="..."></div>
      <div class="story-visual" data-visual="3"><img src="..." alt="..."></div>
      <div class="story-visual" data-visual="4"><img src="..." alt="..."></div>
    </div>
  </section>
  ```
- Verify `sticky-storytelling.js` is loaded and wires up the pinning + crossfade
- Add CSS from design spec section 2.3

### Task 3.4: Products Bento Grid
- Replace existing product grid in `index.html` with bento layout
- Use CSS from design spec section 2.2
- 6 cards: Core (featured, span 2), CrowMark (featured, span 2), CSRD, CrowCyber, CrowCash, CrowESG
- Each card: product icon, name, one-line description, screenshot in chrome frame
- Add `data-reveal-child` to each `.bento-card`

**Verification:** Scroll through homepage. Sections should fade in as they enter viewport. Scrollytelling should pin and crossfade. Bento grid should be aligned and responsive.
**Commit:** `feat: section reveals + scrollytelling + bento grid`

---

## Phase 4: Product Pages Polish

### Task 4.1: Product Page Template Consistency
- Audit each product page against the template in design spec section 4.2
- Ensure each has:
  - Product-specific hero with accent gradient
  - Feature sections with screenshots in chrome frames
  - `data-section-reveal` on all sections below hero
  - Consistent CTA section at bottom
  - Proper meta tags, OG images, JSON-LD

### Task 4.2: Chrome Frame Application
- Verify ALL product screenshots use the `.product-frame` component
- Check: `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowesg.html`, `csrd.html`
- Each frame must have: traffic-light dots, URL bar, proper border radius

### Task 4.3: CrowCyber Page (`crowcyber.html`)
- Full content: Cyber Essentials v3.3 (Danzell) features
- Screenshots from `marketing-screenshots/raw/app.crowagent.ai_crowcyber*.png`
- Unique meta description, OG image, canonical URL
- Product accent colour: `var(--sky)`

### Task 4.4: CrowCash Page (`crowcash.html`)
- Full content: Late Payment Act 1998 features
- Screenshots from `marketing-screenshots/raw/app.crowagent.ai_crowcash*.png`
- Unique meta description, OG image, canonical URL
- Product accent colour: `var(--lime)`

### Task 4.5: CrowESG Page (`crowesg.html`)
- "Coming Q3 2026" state with waitlist CTA
- EFRAG VSME 2024 description
- Unique meta description, OG image, canonical URL
- Product accent colour: `var(--gold)`

**Verification:** Visit each product page. Confirm chrome frames, section reveals, proper meta tags.
**Commit:** `feat: product pages polish + chrome frames`

---

## Phase 5: Pricing & Roadmap Update

### Task 5.1: Pricing Page Rebuild
- Edit `pricing.html`:
  - Add pricing cards for all 6 products
  - Monthly/Annual toggle (annual = monthly x 12 x 0.9, exactly 10% discount)
  - Bundle discount section: "Save 15% when you subscribe to 3+ products"
  - ESG card: "Coming Q3 2026" with "Join Waitlist" CTA
  - Feature comparison table
  - FAQ accordion
- Apply glassmorphism card styling
- Add `data-section-reveal` to sections

### Task 5.2: Roadmap Page Update
- Edit `roadmap.html`:
  - Timeline entries: Core (Live), CrowMark (Live), CSRD (Live), CrowCyber (Live), CrowCash (Live), CrowESG (Q3 2026)
  - Remove ALL deprecated product entries
  - Add scroll-driven timeline animation (items reveal as user scrolls)
  - Style with brand tokens

### Task 5.3: Products Index Update
- Edit `products/index.html`:
  - Bento grid with all 6 products
  - Remove deprecated products
  - Each card links to individual product page
  - Apply section reveals

**Verification:** Check pricing toggle works, annual prices are correct (10% discount), bundle banner visible, roadmap shows correct statuses.
**Commit:** `feat: pricing rebuild + roadmap update + products index`

---

## Phase 6: Navigation & Footer Polish

### Task 6.1: Nav Glassmorphism & Shrink
- Verify nav has `backdrop-filter: blur(16px)` styling
- Implement nav shrink on scroll (72px to 56px) via `nav-shrink.js` or `cinematic-init.js`
- Add `.is-scrolled` class toggle via ScrollTrigger
- Verify dropdown menus have glassmorphism surface

### Task 6.2: Footer Enhancement
- Add gradient mesh background to footer (subtle, using CSS gradients)
- Large CTA section above footer links
- Multi-column link grid
- Social icons with hover effects
- Apply brand tokens throughout

### Task 6.3: Announce Bar Polish
- Verify dismiss functionality works
- Add subtle entrance animation (slide down on page load)
- Persist dismissal in `sessionStorage`

**Verification:** Nav shrinks on scroll, dropdowns look premium, footer has gradient background and CTA.
**Commit:** `feat: nav + footer cinematic polish`

---

## Phase 7: Micro-Interactions & Polish

### Task 7.1: Button Hover States
- All `.btn-primary-v2`: hover lift (-2px), enhanced shadow, glow
- All `.btn-secondary`: hover border colour change, subtle background
- Verify magnetic effect works on `[data-magnetic]` elements

### Task 7.2: Card Hover Effects
- Bento cards: lift + shadow + border pulse (already in CSS)
- Product chrome frames: subtle scale on hover
- Blog cards: lift + shadow

### Task 7.3: Form Micro-Interactions
- Verify `micro-interactions.js` is loaded on all pages with forms
- Validation shake on invalid fields
- Success pulse on valid blur
- Toast notifications working

### Task 7.4: Logo Shimmer
- Verify `logo-shimmer.js` applies subtle shimmer effect to nav logo
- Should be a CSS gradient animation, not JS-heavy

### Task 7.5: Cursor Spotlight (Optional)
- If `spotlight.js` exists, verify it creates a subtle radial glow following cursor
- Should be very subtle (5% opacity max)
- Disable on mobile and reduced-motion

**Verification:** Hover over buttons, cards, nav items. All should have smooth, premium transitions.
**Commit:** `feat: micro-interactions polish`

---

## Phase 8: Performance & Accessibility Audit

### Task 8.1: Lighthouse Audit
- Run Lighthouse on: `index.html`, `pricing.html`, `crowcyber.html`, `crowmark.html`
- Target: Performance >= 90, Accessibility >= 95
- Fix any issues found (image sizes, render-blocking resources, contrast)

### Task 8.2: Reduced Motion Compliance
- Enable `prefers-reduced-motion: reduce` in browser DevTools
- Visit every page
- Confirm: no animations play, all content visible, no layout issues
- WebGL canvas should be hidden
- Parallax effects disabled
- Section reveals show content immediately (no translate/opacity animation)

### Task 8.3: Keyboard Navigation
- Tab through every page
- Confirm: focus indicators visible (2px teal outline)
- Skip link works
- All interactive elements reachable
- Carousel navigable with arrow keys
- Dropdowns openable with Enter/Space

### Task 8.4: Image Optimization
- All images have `width` and `height` attributes (prevent CLS)
- All images use `loading="lazy"` except hero LCP image
- Hero image uses `fetchpriority="high"`
- WebP/AVIF variants exist for all major images

### Task 8.5: CSS Build
- Run `npm run build:css` to regenerate `styles.min.css`
- Verify the minified file is referenced in all HTML pages
- Check file size (should be < 200KB minified)

**Verification:** Lighthouse scores meet targets. Reduced motion works. Keyboard nav complete.
**Commit:** `perf: lighthouse fixes + a11y compliance + image optimization`

---

## Phase 9: SEO & Final Content

### Task 9.1: Meta Tags Audit
- Every HTML page must have:
  - Unique `<title>` (50-60 chars)
  - Unique `<meta name="description">` (150-160 chars)
  - `<link rel="canonical">`
  - `og:title`, `og:description`, `og:image`, `og:url`
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- New pages (`crowcyber`, `crowcash`, `crowesg`) must have OG images generated

### Task 9.2: JSON-LD Structured Data
- Verify `js/structured-data.js` includes:
  - Organization schema
  - Product schemas for all 6 products
  - BreadcrumbList for navigation
  - FAQ schema on pricing page

### Task 9.3: Sitemap Final Check
- `sitemap.xml` includes all live pages
- No deprecated URLs
- `lastmod` dates updated

### Task 9.4: robots.txt
- Verify `robots.txt` allows all pages
- Sitemap URL referenced

**Verification:** Validate structured data with Google Rich Results Test. Check sitemap in browser.
**Commit:** `seo: meta tags + structured data + sitemap update`

---

## Phase 10: Final QA & User Approval

### Task 10.1: Cross-Browser Testing
- Test in Chrome, Firefox, Safari (if available via Playwright)
- Run: `npm run test:cross-browser` (if configured)
- Manual check at minimum: Chrome + one other browser

### Task 10.2: Responsive Testing
- Check every page at: 1440px, 1024px, 768px, 375px
- Run: `npm run test:responsive` (if configured)
- Verify: no horizontal overflow, no broken layouts, touch targets >= 44px

### Task 10.3: Visual Regression (Optional)
- If baseline snapshots exist: `npm run test:visual`
- Update snapshots if intentional changes: `npm run test:visual:update`

### Task 10.4: Final Deprecation Check
- Run: `grep -ri "crowbuild\|crowsight\|crownest\|crowtrace" --include="*.html" --include="*.js"`
- Must return zero results

### Task 10.5: Present to User
- Update `.gemini/state/TRANSFORMATION-STATE.md` with completion status
- List all changes made
- Provide localhost URL for user review
- **WAIT FOR EXPLICIT USER APPROVAL before any production action**

**Commit:** `chore: final QA pass + state update`

---

## Post-Approval Actions (ONLY after user says "deploy")

1. Merge feature branch to main
2. Cloudflare Pages auto-deploys from main
3. Verify live site at `crowagent.ai`
4. Run Lighthouse on live site
5. Monitor for any 404s or errors in Cloudflare analytics

---

## MANDATORY: User Testing Protocol (Applies to ALL Phases)

After completing EACH phase (1 through 10), you MUST:

1. **Summarize** what was changed (files modified, features added)
2. **List pages to test** (specific URLs on localhost:8083)
3. **Ask the user** to test locally and provide feedback
4. **Wait** for user response. Do NOT proceed until user says "proceed" or "looks good"
5. **If user reports issues:** Fix them immediately, re-present, wait for confirmation again

### Responsiveness Check (EVERY Phase):
- Test at 1440px, 768px, 375px minimum
- Report any overflow, misalignment, or broken layouts
- Fix responsive issues BEFORE asking user to test

### Visual Quality Check (EVERY Phase):
- Does it look hand-crafted (not AI-generated)?
- Are alignments pixel-perfect?
- Are spacings consistent with the design spec?
- Do animations feel smooth and intentional?

---

## Phase 0: Cleanup & Dead Code Removal (RUN BEFORE Phase 1)

### Task 0.1: Unused Image Audit
- List all files in `/Assets/photos/`, `/Assets/screenshots/`, `/Assets/icons/`
- Cross-reference against all `.html` and `.css` files
- Move unreferenced images to `/Assets/_archive/`
- Fix any broken `<img>` tags

### Task 0.2: Dead JavaScript Removal
- Check every `<script>` tag across all HTML files
- List all JS modules in `/js/modules/`
- Remove any module not loaded by any page
- Remove commented-out code blocks and dead branches
- Remove `console.log` (except `__CA_DEBUG__` gated ones)

### Task 0.3: CSS Cleanup
- Run PurgeCSS analysis against all HTML files
- Identify unused CSS rules (classes/IDs not in any HTML)
- Remove dead CSS rules from `styles.css`
- Remove unused vendor prefixes for unsupported browsers

### Task 0.4: Legacy Content Removal
- Remove old TODO/FIXME comments
- Remove any references to deprecated products in comments
- Clean up any orphaned HTML files not in nav or sitemap

### Task 0.5: 8K Image Sourcing
- Hero Earth image: verify source is 8K quality (NASA Blue Marble or equivalent)
- If current hero image is below 4K resolution, source a replacement:
  - Search Unsplash/Pexels for "earth from space 8k" or use NASA public domain imagery
  - Must be photorealistic, cinematic, colour-gradeable to brand palette
- Process through Sharp at 1920w, 1200w, 600w in WebP + AVIF
- Verify no compression artifacts at 100% zoom

**Verification:** File count reduced, no broken references, images are high quality.
**Commit:** `chore: cleanup dead code + unused assets + source 8K images`
**ASK USER TO TEST before proceeding to Phase 1.**
