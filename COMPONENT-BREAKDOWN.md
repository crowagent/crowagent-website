# CrowAgent Website — Component Breakdown & Implementation Plan
**Version:** 1.0
**Date:** 2026-05-14

## 1. Global Cinematic Engine
- **Files:** `gsap.min.js`, `ScrollTrigger.min.js`, `cinematic-init.js`.
- **Behaviour:** Centralised plugin registration and default timing scale.
- **Wiring:** Shared loader in `nav-inject.js` ensures modules are available on every page.

## 2. Component: .story-shell (Sticky Storytelling)
- **Implementation:** `sticky-storytelling.js` + `sticky-storytelling-content.js`.
- **Props:** `data-step` (trigger), `data-visual` (target).
- **Animation:** GSAP ScrollTrigger pins the visual container. `onEnter` / `onLeave` hooks swap visual states with a 3D rotate + fade.
- **Visuals:** Inline SVG mockups themed to the product brand tokens.

## 3. Component: .products-bento (The Bento Grid)
- **Implementation:** CSS Grid + GSAP `fade-in-up`.
- **Behaviour:** Cards reveal in sequence as they enter the viewport.
- **Hover:** Transform `translateY(-8px)`, scale `1.02` on image, border-color transition to `--teal`.

## 4. Component: .hero-video-bg (Ambient Video)
- **Implementation:** HTML5 Video + `cinematic-init.js` gating.
- **Source:** `hero-loop.mp4` / `.webm`.
- **Performance:** `muted`, `playsinline`, `loop`. Paused/Hidden if Data Saver or Reduced Motion is on.

## 5. Component: .framework-card (Parallax Grid)
- **Implementation:** `hero-parallax.js` (adapted for section backgrounds).
- **Behaviour:** Background wordmarks or glow orbs move at a different rate than the scroll to create depth.

## 6. Component: .btn-primary-v2 (Premium Button)
- **Implementation:** CSS (gradients + shadows) + `lottie-cta.js`.
- **Hover:** 10% brightness increase, Lottie arrow animation play, shadow expansion.
- **Active:** 4px inset shadow + 0.98 scale.
