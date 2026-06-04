# Website Design Specification: Premium Cinematic Transformation
**Scope:** `crowagent-website` ONLY
**Version:** 2.0
**Date:** 2026-05-15

---

## 1. Visual Language & Token System

### 1.1 Colour Palette (from `crowagent-brand-tokens.css`)
All colours MUST be referenced via CSS custom properties. Never hardcode hex.

| Token | Usage |
|-------|-------|
| `var(--bg)` | Page background (Saturn Navy) |
| `var(--surf)` | Card surfaces, elevated panels |
| `var(--surf2)` | Secondary surfaces |
| `var(--teal)` | Primary accent, CTAs, links |
| `var(--teal-d)` | CTA gradient end, hover states |
| `var(--lime)` | Secondary accent (sparingly) |
| `var(--sky)` | Tertiary accent, info states |
| `var(--cloud)` | Primary text |
| `var(--steel)` | Secondary text |
| `var(--mist)` | Tertiary text, captions |
| `var(--border2)` | Standard borders |
| `var(--obsidian)` | CTA button text colour (alias for --bg) |

### 1.2 Typography Scale
```
--text-6xl: clamp(2.5rem, 5vw, 4rem)    /* Hero H1 */
--text-5xl: 3rem                          /* Section H2 */
--text-4xl: 2.25rem                       /* Sub-section H2 */
--text-3xl: 1.875rem                      /* H3 */
--text-2xl: 1.5rem                        /* H4, large eyebrow */
--text-xl:  1.25rem                       /* Sub-heading */
--text-lg:  1.125rem                      /* Lead body */
--text-md:  1rem                          /* Body default */
--text-sm:  0.875rem                      /* Secondary, meta */
--text-xs:  0.75rem                       /* Micro-labels */
```

- **Display/Headers:** `var(--font-display)` = Plus Jakarta Sans (600, 700, 800)
- **Body:** `var(--font-body)` = Inter (400, 500, 600)
- **Mono:** `var(--font-mono)` = JetBrains Mono (code snippets only)

### 1.3 Spacing System
```
--space-section: 5rem (80px desktop) / 3rem (48px mobile)
Section padding: var(--space-section) top and bottom
Card gap: 24px (desktop), 16px (mobile)
Component internal padding: 24px-32px
```

### 1.4 Border Radius
```
var(--r):  12px  /* Standard cards */
var(--r2): 16px  /* Large cards, modals */
var(--r3): 20px  /* Hero elements */
var(--rp): 100px /* Pills, badges */
```

### 1.5 Easing & Timing
```
--ease-default: cubic-bezier(0.16, 1, 0.3, 1)  /* "Premium" ease - use for all */
Micro-interactions: 250ms
Standard transitions: 400ms
Section reveals: 800ms
Scrollytelling crossfades: 800ms
Elastic spring-back: 700ms with elastic.out(1, 0.3)
```

---

## 2. Component Design System

### 2.1 The Hero Backdrop Stack

```css
.hero {
  position: relative;
  overflow: hidden;
  min-height: 90vh;
}

.hero-mesh-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-earth-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: 50% 50%;
  /* GSAP animates: scale 1.0 -> 1.25 on scroll */
}

.hero-backdrop-scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 40%,
    transparent 0%,
    rgba(4, 14, 26, 0.4) 50%,
    rgba(4, 14, 26, 0.85) 100%
  );
  z-index: 2;
}

.hero > .wrap {
  position: relative;
  z-index: 10; /* Content above all backdrop layers */
}
```

### 2.2 The Bento Grid (`.products-bento`)

```css
.products-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(280px, auto);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Featured cards span 2 columns */
.bento-card--featured {
  grid-column: span 2;
}

/* Tablet: 2 columns */
@media (max-width: 1024px) {
  .products-bento {
    grid-template-columns: repeat(2, 1fr);
  }
  .bento-card--featured {
    grid-column: span 2;
  }
}

/* Mobile: single column */
@media (max-width: 640px) {
  .products-bento {
    grid-template-columns: 1fr;
  }
  .bento-card--featured {
    grid-column: span 1;
  }
}
```

**Card Design:**
```css
.bento-card {
  background: rgba(10, 31, 58, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border2);
  border-radius: var(--r2);
  padding: 32px;
  transition: transform 400ms var(--ease-default),
              box-shadow 400ms var(--ease-default),
              border-color 400ms var(--ease-default);
  overflow: hidden;
}

.bento-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
              0 0 0 1px var(--teal-20);
  border-color: var(--teal-30);
}

.bento-card:hover .bento-card__img {
  transform: scale(1.02);
}
```

### 2.3 The Story Shell (`.story-shell`) - Scrollytelling

```css
.story-shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
  padding: var(--space-section) 0;
}

.story-steps {
  display: flex;
  flex-direction: column;
  gap: 120px; /* Large gap so each step has scroll room */
}

.story-step {
  opacity: 0.3;
  transition: opacity 400ms var(--ease-default);
}

.story-step.is-active {
  opacity: 1;
}

.story-visual-wrap {
  /* Pinned via GSAP ScrollTrigger on desktop */
  position: relative;
  height: 500px;
}

.story-visual {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.95) rotateX(-5deg);
  transition: opacity 800ms var(--ease-default),
              transform 800ms var(--ease-default);
}

.story-visual.is-active {
  opacity: 1;
  transform: scale(1) rotateX(0deg);
}

@media (max-width: 1023px) {
  .story-shell {
    grid-template-columns: 1fr;
  }
  .story-visual-wrap {
    position: relative; /* No pinning on mobile */
    height: auto;
  }
}
```

### 2.4 Product Chrome Frame (`.product-frame`)

```css
.product-frame {
  border-radius: var(--r);
  overflow: hidden;
  border: 4px solid var(--surf2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
  background: var(--surf);
}

.product-frame-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--surf);
  border-bottom: 1px solid var(--border);
}

/* Traffic-light dots use standard macOS UI colours (not brand tokens) */
.product-frame-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.product-frame-dot.d-r { background: var(--err); }
.product-frame-dot.d-y { background: var(--warn); }
.product-frame-dot.d-g { background: var(--success); }

.product-frame-url {
  margin-left: 12px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--mist);
}

.product-frame img {
  width: 100%;
  height: auto;
  display: block;
}
```

### 2.5 Glassmorphism Surface (`.glass-surface`)

```css
.glass-surface {
  background: rgba(10, 31, 58, 0.5);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid var(--border2);
  border-radius: var(--r2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}
```

### 2.6 CTA Buttons

```css
/* Primary CTA - bg teal, text obsidian */
.btn-primary-v2 {
  background: linear-gradient(180deg, var(--teal) 0%, var(--teal-d) 100%);
  color: var(--obsidian);
  font-family: var(--font-display);
  font-weight: 700;
  border-radius: 8px;
  padding: 14px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(10, 168, 140, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: all 250ms var(--ease-default);
}

.btn-primary-v2:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(12, 201, 168, 0.3),
              0 0 0 1px rgba(10, 168, 140, 0.9),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Secondary CTA */
.btn-secondary {
  color: var(--cloud);
  border: 1px solid var(--border2);
  background: transparent;
  border-radius: 8px;
  padding: 14px 32px;
  transition: all 250ms var(--ease-default);
}

.btn-secondary:hover {
  border-color: var(--teal-30);
  background: var(--teal-dim);
}
```

### 2.7 Section Label / Eyebrow

```css
.section-label {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 14px;
}
```

### 2.8 Navigation (`.ca-nav`)

```css
#ca-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  min-height: 72px;
  background: rgba(4, 14, 26, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  transition: min-height 300ms var(--ease-default),
              background 300ms var(--ease-default);
}

#ca-nav.is-scrolled {
  min-height: 56px;
  background: rgba(4, 14, 26, 0.95);
}
```

---

## 3. Animation & Motion Specifications

### 3.1 GSAP Configuration (cinematic-init.js)

```javascript
// Global defaults
gsap.defaults({
  ease: "power3.out",
  duration: 0.8
});

ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true
});

// Reduced motion check (MANDATORY before any animation)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### 3.2 Earth Parallax Zoom (Hero)

```javascript
if (!prefersReducedMotion) {
  const earthImg = document.querySelector('.hero-earth-img');
  if (earthImg) {
    gsap.set(earthImg, { scale: 1.0, transformOrigin: "50% 50%" });
    gsap.to(earthImg, {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5
      },
      scale: 1.25,
      yPercent: 5,
      ease: "none"
    });
  }
}
```

### 3.3 Staggered Section Reveals

```javascript
if (!prefersReducedMotion) {
  gsap.utils.toArray('[data-section-reveal]').forEach(section => {
    const children = section.querySelectorAll('[data-reveal-child]');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
    
    if (children.length) {
      tl.fromTo(children, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" }
      );
    } else {
      tl.fromTo(section,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  });
}
```

### 3.4 Magnetic Button Effect

```javascript
if (!prefersReducedMotion) {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) - rect.width / 2;
      const y = (e.clientY - rect.top) - rect.height / 2;
      gsap.to(el, { x: x * 0.15, y: y * 0.15, duration: 0.4, ease: "power2.out" });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
  });
}
```

### 3.5 Hero Staggered Entrance

```javascript
if (!prefersReducedMotion) {
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .fromTo('.hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
    .fromTo('.hero h1', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.5')
    .fromTo('.hero-sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .fromTo('.hero-btns', { y: 15, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 }, '-=0.3')
    .fromTo('.hero-trust', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2')
    .fromTo('.hero-visual', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.3');
}
```

### 3.6 Nav Shrink on Scroll

```javascript
const nav = document.getElementById('ca-nav');
if (nav) {
  ScrollTrigger.create({
    start: "top -80",
    onUpdate: (self) => {
      nav.classList.toggle('is-scrolled', self.progress > 0);
    }
  });
}
```

---

## 4. Page Layout Specifications

### 4.1 Homepage Section Order
1. Announce bar (40px, dismissible)
2. Navigation (72px sticky)
3. Hero section (min-height: 90vh)
4. Social proof logos strip
5. "How It Works" scrollytelling (4 steps)
6. Products bento grid
7. Compliance frameworks (parallax cards)
8. Testimonials / case studies
9. Final CTA ("Ready to automate compliance?")
10. Footer

### 4.2 Product Page Template
1. Navigation
2. Product hero (gradient accent, product name, tagline, CTA)
3. Key metrics / stats bar
4. Feature sections (alternating image/text or bento)
5. Product screenshots in chrome frames
6. Workflow / integration section
7. Pricing teaser
8. CTA section
9. Footer

### 4.3 Pricing Page Layout
1. Navigation
2. Hero (simple: "Simple, transparent pricing")
3. Monthly/Annual toggle
4. Pricing cards grid (3x2 or responsive)
5. Bundle discount banner
6. Feature comparison table
7. FAQ accordion
8. CTA section
9. Footer

---

## 5. Responsive Breakpoints

```css
/* Desktop-first approach */
/* Large desktop: default (1400px max-width container) */
/* Desktop: 1200px */
/* Tablet landscape: 1024px */
/* Tablet portrait: 768px */
/* Mobile large: 640px */
/* Mobile small: 375px */

@media (max-width: 1024px) {
  /* Scrollytelling: disable pinning, stack vertically */
  /* Bento grid: 2 columns */
  /* Nav: hamburger menu */
}

@media (max-width: 768px) {
  /* Section padding: 48px */
  /* Typography scale down */
  /* Cards: full width */
}

@media (max-width: 640px) {
  /* Hero: reduced padding */
  /* Bento grid: single column */
  /* Hide non-essential decorative elements */
}
```

---

## 6. Dark/Light Mode

- **Default:** Dark mode (Saturn Navy background)
- **Light mode:** Supported via `crowagent-brand-tokens.css` light mode section
- **Toggle:** Respect `prefers-color-scheme` system preference
- **Implementation:** CSS custom properties swap via `[data-theme="light"]` on `<html>`
- **Persistence:** `localStorage` for user preference override

---

## 7. File Architecture for New CSS

All new cinematic styles go into the main `styles.css` under clearly marked sections:

```
/* === CINEMATIC TRANSFORMATION v2.0 === */
/* Section: Hero Backdrop */
/* Section: Bento Grid */
/* Section: Story Shell */
/* Section: Product Chrome */
/* Section: Glassmorphism */
/* Section: Animations & Reveals */
/* Section: Navigation Polish */
/* Section: Footer */
/* === END CINEMATIC TRANSFORMATION === */
```

After editing `styles.css`, run `npm run build:css` to regenerate `styles.min.css`.
