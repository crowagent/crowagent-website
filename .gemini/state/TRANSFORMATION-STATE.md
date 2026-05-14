# CROWAGENT_WEBSITE_STATE — THE SOURCE OF TRUTH

> **Last Updated: 2026-05-14**
> **Project:** CrowAgent Marketing Website Transformation & Maintenance
> **Status:** ACTIVE RESUMPTION (Post-Crash)

---

## 1. Current Phase: Resumption & Consolidation
We are actively resuming work on the `crowagent-website` repository after an interruption. The `crowagent-platform` and `crowagent-portal` are strictly out of scope for this phase. A local testing server is running on `http://localhost:8083`.

## 2. Completed Work (Pre-Crash)
- **Cinematic Engine Setup:** GSAP and ScrollTrigger scripts added. Untracked files like `js/modules/cinematic-init.js`, `demo-autoplayer.js`, and `sticky-storytelling.js` exist but are not yet committed.
- **Brand Consistency:** High-fidelity SVG logo and tagline ("Sustainability Intelligence") applied.
- **Symmetry & Mobile Fixes:** Product grid horizontal alignment and mobile wrapping logic were implemented (pending final visual verification).
- **New Product Pages:** Initial HTML for `crowcyber.html`, `crowcash.html`, and `crowesg.html` created.

## 3. Pending & Blocked Work Ledger

### A. Cinematic UI/UX Transformation (Specs in `.kiro/specs/website-cinematic-transformation`)
- [ ] **Earth Motif:** Integrate WebGL/Earth background scaling into `index.html` (EXEC-ST-004/005).
- [ ] **Scrollytelling:** Wire up `.story-shell` pinning and `.hero-video-bg` elements.
- [ ] **Magnetic UI & HUDs:** Add cursor-proximity pull (EXEC-ST-002) and Scanner HUD lines (EXEC-ST-008).
- [ ] **Carousel 4px Frame Alignment:** Apply standard 4px macOS chrome frames across all individual product pages (`crowmark.html`, `crowcyber.html`, etc.).

### B. Master Execution Plan (Part 2) Requirements
- [ ] **Products Index (`products/index.html`):** Add CrowCyber/CrowCash/CrowESG cards. Remove deprecated names.
- [ ] **Pricing (`pricing.html`):** Add new product pricing columns and a "Bundle Discount — Save 15%" section.
- [ ] **Roadmap (`roadmap.html`):** Mark new products as Live / Coming Q3. Remove deprecated items.
- [ ] **Homepage (`index.html`):** Update product count ("6 products"), add Cyber/Cash to showcase, verify hero copy.
- [ ] **Nav & SEO:** Update `js/nav-inject.js` with new dropdowns, append paths to `sitemap.xml`, ensure new HTML pages have unique titles, OG tags, and canonicals.
- [ ] **Deprecation Sweep:** Grep for and remove all mentions of `CrowBuild`, `CrowSight`, `CrowNest`, `CrowTrace`.

### C. Defect & QA Backlog
- [ ] **Performance & Motion Guard:** Ensure `window.__CA_CINEMATIC_READY__` is active, and test `prefers-reduced-motion` compliance.
- [ ] **Commit Pending Files:** Track and commit the currently untracked `js/modules/*` files.

## 4. Execution Policy
- **Verify Locally:** Check changes on `localhost:8083` before proceeding.
- **No Production Deploy:** Merging or deploying is blocked until the user provides explicit, one-time permission.
