# Website Requirement Specification: Cinematic Transformation
**Scope:** `crowagent-website` ONLY
**Date:** 2026-05-14

## 1. Project Objective
To resume and complete the transformation of the CrowAgent website into a Tier-1 Enterprise SaaS platform (Apple/Stripe/Vercel standard) while fully integrating the Phase 2 product lineup.

## 2. Cinematic Narrative Requirements
- **REQ-CIN-001 (The Earth Hero):** The homepage must feature a layered, interactive Earth asset or premium background that reacts to scroll (scaling) and creates depth.
- **REQ-CIN-002 (Scrollytelling):** Complex workflows must use scroll-pinned narrative sections (sticky visual column, flowing text).
- **REQ-CIN-003 (Premium Micro-interactions):** Buttons must have magnetic pulls; product mockups must use 4px "glass chrome" frames; automated scanner sweeps should visualize intelligence.
- **REQ-CIN-004 (Symmetry):** The "Our Products" bento grid must enforce a zero-exception perfectly aligned horizontal structure (880px).

## 3. Product Portfolio Updates
- **REQ-PRD-001 (New Pages):** `crowcyber.html`, `crowcash.html`, and `crowesg.html` must be fully formatted, styled, and SEO-optimized.
- **REQ-PRD-002 (Catalog Rebuild):** The `products/index.html` and `roadmap.html` must reflect the new 6-product lineup (Core, CrowMark, CSRD, Cyber, Cash, ESG).
- **REQ-PRD-003 (Pricing Refresh):** `pricing.html` must include the new Phase 2 products and advertise a "Bundle Discount — Save 15%".
- **REQ-PRD-004 (Deprecation):** All legacy placeholders (CrowBuild, CrowSight, CrowNest, CrowTrace) must be wiped from the site.

## 4. Non-Functional Requirements
- **NFR-PERF-001:** 60 FPS floor. Heavy animations must use GSAP + `will-change`.
- **NFR-A11Y-001:** Motion features must be gated behind `prefers-reduced-motion` checks.
- **NFR-SEC-001:** No inline styles or scripts; full CSP compliance.
