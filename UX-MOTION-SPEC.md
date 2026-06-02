# CrowAgent Website — UX & Motion Requirement Spec
**Version:** 1.0 (Cinematic Transformation)
**Date:** 2026-05-14

## 1. Vision & Core Principles
Inspired by Stripe (stripe.com), the CrowAgent website follows a "Cinematic" design language:
- **Depth:** Multi-layered backgrounds (mesh, video, orbs) create a sense of scale.
- **Motion as Narrative:** Scroll-triggered reveals and pinned storytelling guide the user through complex regulatory workflows.
- **Micro-precision:** High-frequency, subtle interactions (button glows, logo shimmers) convey trust and technical excellence.

## 2. Section-by-Section Design
### Hero Section
- **Visuals:** WebGL mesh-gradient backdrop + ambient cloud video loop (15% opacity, lighten blend).
- **Motion:** Staggered entrance for H1, sub-text, and buttons. Sub-pixel mouse parallax on background orbs.
- **Goal:** Immediate "Premium" feeling, framing CrowAgent as an elite technical tool.

### Compliance Frameworks (Parallax)
- **Visuals:** Grid of cards with regulatory wordmarks. Background layer moves at 0.4x scroll speed.
- **Motion:** Cards lift and glow on hover.
- **Goal:** Trust through transparency and association with established statutes.

### "How it Works" (Scrollytelling)
- **Visuals:** Sticky visual column (right) with inline SVG mockups. Flowing text column (left).
- **Motion:** GSAP ScrollTrigger pinning. 800ms "scrub" transition between visual states (opacity + scale + rotateX).
- **Goal:** Explain the 4-step workflow without the user losing context or focus.

### Products Bento Grid
- **Visuals:** Irregular CSS Grid. Featured cards (Core, ESG) span 2 columns.
- **Motion:** Staggered reveal on scroll. Hover lift (8px) + deep shadow + teal border pulse.
- **Goal:** Showcase the suite's breadth while highlighting flagship products.

## 3. Motion System Defaults
- **Timing:** 400ms (standard), 800ms (sections), 250ms (micro).
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (The "Premium" Ease).
- **Thresholds:** Reveals trigger at 15% viewport entry.
- **Parallax:** Max offset 60px; linear relationship to scroll progress.

## 4. Accessibility & Performance
- **Reduced Motion:** All GSAP timelines check `prefers-reduced-motion`. Falls back to simple opacity fades or static states.
- **Performance:** 60fps target. Heavy assets (video, mesh) use hardware acceleration (`will-change`, WebGL).
- **Contrast:** AA minimum (4.5:1) for all text.
