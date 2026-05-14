# Website Execution Specification: Cinematic Transformation
**Scope:** `crowagent-website` ONLY
**Date:** 2026-05-14

## Execution Sequence

### Phase 1: Verification & Untracked File Cleanup
1. **Local Test:** Verify the currently modified files on `localhost:8083` to ensure no fatal errors exist from the crash.
2. **Commit Untracked Work:** Stage and commit the `js/modules/*`, `UX-MOTION-SPEC.md`, and `COMPONENT-BREAKDOWN.md` files to secure the baseline.

### Phase 2: Deprecation & Content Alignment (The Sweep)
1. **Grep and Remove:** Search across all `.html` and `.js` files for `CrowBuild|CrowSight|CrowNest|CrowTrace`. Remove all references.
2. **Navigation Inject:** Update `js/nav-inject.js` to insert the new canonical product list (Core, CrowMark, CSRD, Cyber, Cash, ESG) and remove deprecated items.
3. **Sitemap:** Add `/crowcyber`, `/crowcash`, `/crowesg` to `sitemap.xml`.

### Phase 3: The Cinematic Enhancements
1. **Earth Hero (EXEC-ST-004):** Modify `index.html` to include the cinematic mesh/video background layer.
2. **Module Wiring:** Ensure `cinematic-init.js` and `sticky-storytelling.js` are linked and initialized in `scripts.js`.
3. **Product Page Alignment:** Audit `crowmark.html`, `crowcyber.html`, `crowcyber.html`, and `crowesg.html` to verify the 4px carousel chrome is applied uniformly.

### Phase 4: Pricing & Roadmap Update
1. **Pricing Update:** Edit `pricing.html` to add Cyber/Cash columns and the ESG waitlist state. Add the 15% Bundle Discount section.
2. **Roadmap Update:** Edit `roadmap.html` to mark Cyber/Cash as Live and ESG as Q3 2026. Remove legacy entries.

### Phase 5: QA & Final Verification
1. **A11y:** Check for `prefers-reduced-motion` compliance across all new GSAP logic.
2. **SEO:** Ensure new HTML pages have valid JSON-LD and unique meta descriptions.
3. **User Approval:** Present local preview status. Wait for explicit user confirmation before initiating any git merge or deploy.
