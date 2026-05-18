# CrowAgent Hero Section Redesign — Option A: Outcome-Led Split Hero

Source of truth for the homepage hero overhaul.
Saved: 2026-05-18.

## Context & Codebase Facts

You are working on the CrowAgent homepage at `index.html`. The current hero section is `<section id="hero" class="hero section-tone-0 hero-has-backdrop hero-hud">`.

### Design token reference (already in `:root`, do not redefine)
```
--bg: #040E1A              (deepest navy, page background)
--surf: #0A1F3A            (card/surface)
--surf2: #0D2847
--surf3: #0F2D52
--surf4: #122F55
--teal: #0CC9A8            (primary accent)
--teal-d: #0AA88C          (teal dark, gradient end)
--teal-40: rgba(12,201,168,.40)
--teal-30: rgba(12,201,168,.30)
--teal-20: rgba(12,201,168,.20)
--teal-glow: rgba(12,201,168,.18)
--cloud: #E8F0FA           (near-white for headings)
--steel: #B8CCE0           (secondary text)
--mist: #8A9DB8            (muted/tertiary text)
--color-teal-primary: #00D4AA
--color-teal-secondary: #00B894
--glass-bg: rgba(10,31,58,.55)
--glass-border: rgba(12,201,168,.12)
--glass-border-hover: rgba(12,201,168,.35)
--font-size-h1: clamp(2.8rem, 1.5rem + 5vw, 4.6rem)
--font-size-h2: clamp(1.9rem, 1.5rem + 2.5vw, 3rem)
--font-body: 'Inter','Plus Jakarta Sans',system-ui,sans-serif
--font-display: 'Plus Jakarta Sans',sans-serif  (used for headings & buttons)
--font-mono: 'JetBrains Mono','Fira Code',ui-monospace,monospace
--radius-lg: 16px
--radius-md: 10px
--card-radius: 16px
--shadow-card: 0 4px 24px rgba(0,0,0,.30), 0 1px 0 rgba(255,255,255,.04) inset
--shadow-xl: 0 32px 64px -32px rgba(12,201,168,.25), 0 12px 40px rgba(0,0,0,.3)
--shadow-teal-md: 0 0 24px -4px rgba(12,201,168,.25)
--section-pad-primary: clamp(64px,8vw,120px)
--section-py-hero: clamp(80px,12vh,140px)
```

### Existing button classes (do not change their CSS)
- Primary CTA: `class="btn btn-lg btn-primary-v2"` — teal gradient, dark text, shimmer on hover
- Secondary CTA: `class="btn btn-lg btn-secondary"` — ghost border, teal hover

### Existing assets available
- `/Assets/screenshots/dashboard-1200.webp` — main compliance dashboard screenshot (16:10 ratio)
- `/Assets/screenshots/epc-check.webp`
- `/Assets/screenshots/crowmark.webp`
- `/Assets/screenshots/analytics.webp`
- `/Assets/screenshots/csrd-checker.webp`
- `/Assets/svg-mockups/hero-demo-dashboard.svg` — animated SVG dashboard preview
- `/Assets/photos/hero-premium-earth.png` — existing background image (keep)
- `/Assets/bg-hero.svg` — existing hero background SVG

### Persona/segment data attributes used by existing JS (preserve all of these)
The segment-selector JS reads `data-seg` on `.seg-btn` buttons and shows/hides `.seg-text[data-for="..."]` elements. **Do not remove this JS or change these data attributes.**

Segments: `cyber` | `finance` | `supplier` | `csrd` | `landlord` | `sme`

---

## What To Change

### 1. RESTRUCTURE `hero-inner` from centred-single-column to two-column split

**Current layout:**
```
.hero-inner (block, centred)
  └── .hero-content (text, centred, full width)
.hero-visual (below, full width, carousel + use-cases)
```

**New layout:**
```
.hero-inner (CSS grid, 2 columns: ~55% left / ~45% right, gap 48px, left-aligned)
  ├── .hero-col-copy  (left column - all text, CTAs, trust)
  └── .hero-col-visual  (right column - product screenshot + stat chips)
```

Move `.hero-visual` content INTO `.hero-col-visual`. It should no longer be a sibling of `.hero-inner` but nested inside the right column. The `hero-demo-block` (live preview section) and `.use-cases` section that currently sit below `.hero-inner` should be moved **below** the entire hero section (after `</section id="hero">`), not inside it.

---

### 2. NEW `.hero-col-copy` left column content (top to bottom)

Replace the existing `.hero-content` contents with the following structure. Preserve all `seg-text`/`data-for` attributes exactly as they are.

```html
<div class="hero-col-copy">

  <!-- EYEBROW BADGE — single static pill, replaces the rotating countdown panel in this position -->
  <div class="hero-eyebrow hero-eyebrow-static" id="hero-live-badge" role="status" aria-label="Platform status">
    <span class="hw-dot" aria-hidden="true"></span>
    <span class="hero-eyebrow-text">
      Now in force,&nbsp;
      <strong>Cyber Essentials v3.3 Danzell</strong>&nbsp;·&nbsp;27 Apr 2026
    </span>
  </div>

  <!-- H1 — SINGLE PERMANENT HEADLINE (no seg-text rotation at the H1 level) -->
  <h1 class="hero-headline hero-split-h1">
    UK compliance,&nbsp;<em>quantified</em>.<br>
    Not guessed.
  </h1>

  <!-- SUBHEADLINE — static, replaces the per-segment rotating sub -->
  <p class="hero-sub hero-split-sub">
    CrowAgent maps <strong>MEES</strong>, <strong>Cyber Essentials</strong>,
    <strong>PPN 002</strong>, <strong>CSRD</strong>, <strong>Late Payment</strong>,
    and <strong>EFRAG VSME</strong> to statute, and tells you exactly what you owe,
    what you risk, and what to fix. No consultancy required.
  </p>

  <!-- PERSONA TABS — keep exactly as-is, just relocated into left column -->
  <!-- Move the existing .segment-selector block here unchanged -->
  <!-- It still drives the penalty banners and per-tab CTAs below -->

  <!-- PENALTY BANNERS — keep all six exactly as-is (hidden/shown by JS) -->

  <!-- CTA BUTTONS — simplified to one universal pair as the DEFAULT visible state -->
  <div class="hero-btns hero-split-btns">
    <span class="seg-text hero-universal-cta" id="hero-cta-default">
      <a href="https://app.crowagent.ai/signup"
         class="btn btn-lg btn-primary-v2"
         aria-label="Start your 14-day free trial, no credit card required">
        Start free trial
      </a>
      <a href="https://calendly.com/crowagent-platform/30min"
         class="btn btn-lg btn-secondary"
         aria-label="Book a 30-minute product demo">
        Book a demo
      </a>
    </span>

    <!-- Per-persona CTAs — keep all six existing .seg-text spans unchanged here -->

  </div>

  <!-- NO-CARD LINE -->
  <p class="cta-no-card">
    No credit card required&nbsp;·&nbsp;14-day free trial&nbsp;·&nbsp;Cancel anytime
  </p>

  <!-- TRUST CHIPS — keep existing .hero-trust div exactly as-is -->

</div>
```

---

### 3. NEW `.hero-col-visual` right column content

```html
<div class="hero-col-visual" aria-hidden="true">

  <!-- BROWSER CHROME WRAPPER around main dashboard screenshot -->
  <div class="hero-screen-frame">

    <!-- Fake browser chrome bar -->
    <div class="hero-screen-chrome" aria-hidden="true">
      <span class="chrome-dot chrome-dot--red"></span>
      <span class="chrome-dot chrome-dot--amber"></span>
      <span class="chrome-dot chrome-dot--green"></span>
      <span class="chrome-address-bar">app.crowagent.ai/dashboard</span>
    </div>

    <!-- Dashboard screenshot -->
    <img
      src="/Assets/screenshots/dashboard-1200.webp"
      alt="CrowAgent compliance command centre dashboard showing portfolio compliance gauge, EPC band trajectory, and aggregate exposure prevented"
      class="hero-screen-img"
      width="1200"
      height="750"
      loading="eager"
      decoding="async"
    />

    <!-- Floating KPI chip — top-right of the screenshot -->
    <div class="hero-kpi-chip hero-kpi-chip--tr" aria-label="Aggregate exposure prevented">
      <span class="hkc-label">Aggregate exposure prevented</span>
      <span class="hkc-value">£284,000</span>
      <span class="hkc-sub">Illustrative across 247 assets</span>
    </div>

    <!-- Floating compliance gauge chip — bottom-left of the screenshot -->
    <div class="hero-kpi-chip hero-kpi-chip--bl" aria-label="Portfolio compliance score">
      <span class="hkc-label">Portfolio compliance</span>
      <span class="hkc-value hkc-value--teal">78%</span>
      <span class="hkc-sub">12 added this week</span>
    </div>

  </div>

  <!-- SOCIAL PROOF STRIP -->
  <div class="hero-proof-strip">
    <span class="hero-proof-item">
      <svg class="hero-proof-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="var(--teal)" stroke-width="2.5" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      Statute-mapped to published UK law
    </span>
    <span class="hero-proof-sep" aria-hidden="true">·</span>
    <span class="hero-proof-item">
      <svg class="hero-proof-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="var(--teal)" stroke-width="2.5" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      14-day free trial
    </span>
    <span class="hero-proof-sep" aria-hidden="true">·</span>
    <span class="hero-proof-item">
      <svg class="hero-proof-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="var(--teal)" stroke-width="2.5" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      UK data residency
    </span>
  </div>

</div>
```

---

### 4. HUD FLOATING CARDS — consolidate into inline indicator strip

Three existing `<aside>` floating cards (`.hero-hud-counter`, `.hero-hud-metrics`, `.hero-hud-signal`) overlap content on smaller viewports. Hide via CSS on the new split layout. Add `class="hero-split-active"` to the `<section id="hero">` element.

```css
.hero-split-active .hero-hud-counter,
.hero-split-active .hero-hud-metrics,
.hero-split-active .hero-hud-signal {
  display: none !important;
}
```

---

### 5. NEW CSS — `Assets/css/hero-split.css` imported AFTER the main hero CSS

Full stylesheet below. Linked in `<head>` with `<link rel="stylesheet" href="/Assets/css/hero-split.css?v=98">` after `styles.min.css`.

```css
/* ============================================================
   HERO SPLIT — Option A: Outcome-Led Split Hero
   ============================================================ */
.hero-split-active .hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(32px, 5vw, 64px);
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--section-py-hero) 0;
}

.hero-col-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: var(--spc-16);
  max-width: 580px;
}

.hero-split-active .hero-inner,
.hero-split-active .hero-col-copy { text-align: left; }

.hero-eyebrow-static {
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 100px;
  background: rgba(12, 201, 168, 0.08);
  border: 1px solid rgba(12, 201, 168, 0.20);
  color: var(--cloud);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.4;
  animation: hero-enter 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both;
}
.hero-eyebrow-static strong { color: var(--teal); }

.hero-split-h1 {
  font-family: var(--font-display) !important;
  font-size: clamp(2.8rem, 1.5rem + 4.5vw, 4.8rem) !important;
  font-weight: 800 !important;
  line-height: 1.08 !important;
  letter-spacing: -0.04em !important;
  color: var(--cloud) !important;
  max-width: 520px;
  text-wrap: balance;
  text-align: left !important;
  margin: 0 !important;
  text-shadow: 0 2px 24px rgba(4,14,26,.6);
}
.hero-split-h1 em {
  font-style: normal;
  color: var(--teal);
  background: linear-gradient(135deg, var(--teal) 0%, var(--color-teal-primary) 60%, #5BC8FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-split-sub {
  font-family: var(--font-body) !important;
  font-size: clamp(1rem, 1.6vw, 1.15rem) !important;
  color: var(--steel) !important;
  line-height: 1.65 !important;
  max-width: 520px;
  text-align: left !important;
  margin: 0 !important;
}
.hero-split-sub strong { color: var(--cloud); font-weight: 600; }

.hero-col-copy .segment-selector {
  justify-content: flex-start;
  margin-bottom: 0;
}

.hero-split-btns {
  justify-content: flex-start !important;
  display: flex !important;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 0 !important;
}
.hero-split-btns .seg-text { display: none; }
#hero-cta-default { display: flex !important; gap: 12px; flex-wrap: wrap; }
.segment-selector[data-active-seg] ~ .hero-btns #hero-cta-default { display: none !important; }

.hero-col-copy .cta-no-card {
  font-size: 12px;
  color: var(--mist);
  text-align: left !important;
  margin: 0 !important;
}
.hero-col-copy .hero-trust {
  justify-content: flex-start !important;
  text-align: left !important;
}

.hero-col-visual {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.hero-screen-frame {
  position: relative;
  border-radius: 24px;
  background: var(--surf2);
  border: 1px solid rgba(12, 201, 168, 0.18);
  box-shadow:
    var(--shadow-xl),
    0 0 0 1px rgba(12,201,168,.10),
    0 0 80px -20px rgba(12,201,168,.18);
  overflow: visible;
  transform: perspective(1200px) rotateY(-2deg) rotateX(1deg);
  transform-origin: center center;
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1),
              box-shadow 0.6s ease;
  will-change: transform;
}
.hero-screen-frame:hover {
  transform: perspective(1200px) rotateY(0deg) rotateX(0deg);
  box-shadow:
    0 40px 80px -20px rgba(0,0,0,.5),
    0 0 0 1px rgba(12,201,168,.25),
    0 0 100px -20px rgba(12,201,168,.25);
}

.hero-screen-chrome {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(10, 22, 40, 0.95);
  border-bottom: 1px solid rgba(12,201,168,.12);
  border-radius: 24px 24px 0 0;
}
.chrome-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.chrome-dot--red   { background: #FF5F57; }
.chrome-dot--amber { background: #FEBC2E; }
.chrome-dot--green { background: #28C840; }
.chrome-address-bar {
  flex: 1;
  margin-left: 8px;
  padding: 4px 10px;
  background: rgba(12,201,168,.06);
  border: 1px solid rgba(12,201,168,.12);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--mist);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-screen-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0 0 23px 23px;
  object-fit: cover;
}

.hero-kpi-chip {
  position: absolute;
  background: rgba(10, 31, 58, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(12, 201, 168, 0.12);
  border-radius: 16px;
  padding: 10px 14px;
  box-shadow: var(--shadow-card), 0 0 20px rgba(12,201,168,.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
  min-width: 140px;
  animation: hero-chip-float 4s ease-in-out infinite;
}
.hero-kpi-chip--tr { top: -14px; right: -18px; animation-delay: 0s; }
.hero-kpi-chip--bl { bottom: -14px; left: -18px; animation-delay: 2s; }

.hkc-label {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--mist);
}
.hkc-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: var(--cloud);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
.hkc-value--teal { color: var(--teal); }
.hkc-sub { font-size: 11px; color: var(--mist); line-height: 1.4; }

@keyframes hero-chip-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}

.hero-proof-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 0 0;
}
.hero-proof-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--mist);
  line-height: 1.4;
}
.hero-proof-icon { flex-shrink: 0; }
.hero-proof-sep { color: rgba(12,201,168,.40); font-size: 14px; }

.hero-split-active .hero-col-copy > * {
  animation: hero-enter 0.65s cubic-bezier(0.4,0,0.2,1) both;
}
.hero-split-active .hero-col-copy > *:nth-child(1) { animation-delay: 0.05s; }
.hero-split-active .hero-col-copy > *:nth-child(2) { animation-delay: 0.15s; }
.hero-split-active .hero-col-copy > *:nth-child(3) { animation-delay: 0.25s; }
.hero-split-active .hero-col-copy > *:nth-child(4) { animation-delay: 0.35s; }
.hero-split-active .hero-col-copy > *:nth-child(5) { animation-delay: 0.45s; }
.hero-split-active .hero-col-copy > *:nth-child(6) { animation-delay: 0.50s; }
.hero-split-active .hero-col-copy > *:nth-child(7) { animation-delay: 0.55s; }

.hero-split-active .hero-col-visual {
  animation: hero-slide-right 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s both;
}
@keyframes hero-slide-right {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}

@media (max-width: 1024px) {
  .hero-split-active .hero-inner {
    grid-template-columns: 1fr 1fr;
    gap: clamp(24px, 4vw, 40px);
  }
  .hero-split-h1 { font-size: clamp(2.2rem, 4vw, 3.2rem) !important; }
  .hero-screen-frame { transform: none; }
  .hero-kpi-chip--tr { right: -8px; top: -10px; }
  .hero-kpi-chip--bl { left: -8px; bottom: -10px; }
}

@media (max-width: 768px) {
  .hero-split-active .hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: clamp(48px, 8vh, 80px) 0 clamp(32px, 5vh, 56px);
  }
  .hero-col-copy { align-items: center; text-align: center; max-width: 100%; }
  .hero-split-active .hero-inner,
  .hero-split-active .hero-col-copy,
  .hero-split-h1, .hero-split-sub,
  .hero-col-copy .cta-no-card, .hero-col-copy .hero-trust {
    text-align: center !important;
  }
  .hero-split-btns, .hero-col-copy .segment-selector { justify-content: center !important; }
  .hero-col-copy .hero-trust { justify-content: center !important; }
  .hero-split-h1 { font-size: clamp(2rem, 8vw, 2.8rem) !important; max-width: 100%; }
  .hero-col-visual { order: -1; }
  .hero-screen-frame { transform: none; }
  .hero-kpi-chip { display: none; }
  .hero-proof-strip { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-kpi-chip { animation: none !important; }
  .hero-split-active .hero-col-visual { animation: none !important; }
  .hero-split-active .hero-col-copy > * { animation: none !important; }
}
```

---

### 6. JS CHANGES — segment-selector universal CTA sync

```javascript
function syncUniversalCta() {
  const activeSeg = document.querySelector('.seg-btn[aria-selected="true"]');
  const universalCta = document.getElementById('hero-cta-default');
  if (!universalCta) return;
  universalCta.style.display = activeSeg ? 'none' : 'flex';
}
// Call on init (DOMContentLoaded) and after each segment click handler
```

---

### 7. MOVE `hero-demo-block` BELOW the hero

```html
</section><!-- end #hero -->

<section class="hero-demo-section section-padding" aria-labelledby="hero-demo-heading">
  <div class="wrap container-wide">
    [hero-demo-block + use-cases moved here]
  </div>
</section>
```

```css
.hero-demo-section {
  padding-top: clamp(48px, 6vw, 80px);
  padding-bottom: clamp(48px, 6vw, 80px);
  background: linear-gradient(to bottom, rgba(4,14,26,0) 0%, rgba(10,22,40,0.6) 100%);
  border-top: 1px solid rgba(12,201,168,.08);
}
```

---

### 8. KEEP UNCHANGED

- All `<aside>` HUD HTML (just hidden via CSS)
- `.hero-backdrop .hero-bg-earth` background and scrim
- `.hero-bg-grid` dot-grid
- `@keyframes hero-enter`
- Regulatory ticker/marquee below the hero
- `sf18-trust-bar` (keep inside `.hero-col-copy` below `.hero-trust`)
- All `data-for`, `data-seg`, `data-persona`
- All `href` on CTA links
- `#hero-countdown-panel` (move into `.hero-col-copy` below the static eyebrow)

---

### 9. ACCESSIBILITY CHECKLIST

- [ ] `<h1>` appears exactly once on the page
- [ ] `role="status"` on eyebrow badge for live region
- [ ] All `.hero-kpi-chip` have `aria-label` or `aria-hidden="true"`
- [ ] `.hero-col-visual` has `aria-hidden="true"`
- [ ] Focus order: eyebrow → h1 → sub → segment tabs → CTAs
- [ ] `prefers-reduced-motion` disables all animations (above CSS does this)
- [ ] Colour contrast: `--mist` on `--surf2` passes WCAG AA
- [ ] Browser chrome fake address bar `aria-hidden="true"`

---

### 10. VISUAL RESULT CHECKLIST

At 1280px+ viewport:

- [ ] Dark navy background with earth image, teal grid overlay — unchanged
- [ ] Left column text starts at ~10% from left edge, vertically centred with right column
- [ ] "UK compliance," on one line, "quantified." on second line, with "quantified" in gradient teal
- [ ] Subheadline in `--steel`, max 520px wide, readable
- [ ] Persona tabs horizontally laid out, left-aligned
- [ ] "Start free trial" + "Book a demo" buttons side by side, left-aligned
- [ ] Right column: browser-chrome-framed dashboard screenshot at ~45% viewport width
- [ ] Top-right KPI chip floating slightly outside frame top-right corner
- [ ] Bottom-left KPI chip floating slightly outside frame bottom-left corner
- [ ] Both chips gently floating (CSS animation)
- [ ] Proof strip below screenshot: 3 items with teal checkmarks
- [ ] No floating HUD cards visible (hidden)
- [ ] Zero horizontal scrollbar at any viewport width
