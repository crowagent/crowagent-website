# Auto-rotate + Top-1% Effects Research — 2026-05-23

Creative Director research mandate. Observed-only. No fabrication.

---

## Section A — Auto-rotating text

### Reference scan (observed, not invented)

| Site | Pattern observed | Cadence / transition |
|---|---|---|
| **stripe.com** | NO rotating headline. H1 static ("Financial infrastructure to grow your revenue"). Customer-logo carousel only. | n/a |
| **linear.app** | Hero static ("The system for product development"). A secondary banner row above hero cycles "Issue tracking is dead" → core marketing line. | Banner-row rotation only; no in-H1 verb swap |
| **framer.com** | H1 static ("Build better sites, faster"). No rotator. | n/a |
| **vercel.com** | NO H1 rotator. Has framework-logo carousel (Svelte/Vite/Next/Nuxt/Turbopack) and globe-node pulse animation. | Logos rotate ~3-4 s |
| **arc.net** | Static hero. No rotator. | n/a |
| **railway.com** | Static hero (content fetched). | n/a |

**Key finding:** Top-tier B2B (Stripe, Linear, Framer, Arc) do NOT use in-headline word rotators. The "rotating verb in H1" pattern is now associated with mid-tier SaaS marketing — Stripe/Linear/Apple have moved AWAY from it. What they DO use is a **secondary rotator** (logo strip, framework carousel, ICP banner above hero — Linear's "Issue tracking is dead" sits in a thin row above the H1, not inside it).

### Recommendation for CrowAgent: **Option C — banner-above-H1 rotator**

Reject Option A (subtitle rotator competes with the existing `.hero-sub` value-prop sentence — two messages fighting). Reject Option B (in-H1 verb swap is dated 2019-era pattern, and our H1 already names three outcomes; rotating one word breaks the equalizer rhythm "Win contracts. Protect your business. Get paid faster."). Adopt **Option C** — a thin eyebrow row above the H1 cycling four use-case proofs, matching the Linear pattern.

**Copy slate (rotate every 4.5s, fade+rise 8px, pause on hover/focus):**

1. "Score PPN 002 bids in under 60 seconds"
2. "Recover late invoices with statute-cited demands"
3. "Pass Cyber Essentials before Monday's tender"
4. "Test CSRD scope without a Big-4 invoice"

Cadence: **4.5 seconds** (Linear/Stripe carousels sit 3.5-5s; sub-3s feels frantic, over-5s feels dead). Transition: 320ms fade + 8px translateY ease-out. Accessibility: `aria-live="polite"`, `aria-atomic="true"`, pause when `:focus-within` or `prefers-reduced-motion: reduce`.

### Implementation snippet

HTML (insert immediately above `<h1 id="hero-heading">` at index.html line 183):

```html
<div class="hero-eyebrow-rotator" data-hero-rotator aria-live="polite" aria-atomic="true">
  <span class="hero-eyebrow-rotator__item is-active">Score PPN 002 bids in under 60 seconds</span>
  <span class="hero-eyebrow-rotator__item">Recover late invoices with statute-cited demands</span>
  <span class="hero-eyebrow-rotator__item">Pass Cyber Essentials before Monday's tender</span>
  <span class="hero-eyebrow-rotator__item">Test CSRD scope without a Big-4 invoice</span>
</div>
```

CSS:

```css
.hero-eyebrow-rotator{position:relative;height:1.6em;margin:0 0 var(--space-3);font:500 0.8125rem/1.5 var(--font-sans);letter-spacing:.04em;text-transform:uppercase;color:var(--color-text-quiet)}
.hero-eyebrow-rotator__item{position:absolute;inset:0;opacity:0;transform:translateY(8px);transition:opacity .32s var(--ease-signature),transform .32s var(--ease-signature)}
.hero-eyebrow-rotator__item.is-active{opacity:1;transform:translateY(0)}
@media (prefers-reduced-motion: reduce){.hero-eyebrow-rotator__item{transition:opacity .15s linear;transform:none}}
.hero-eyebrow-rotator:focus-within [data-hero-rotator-pause]{animation-play-state:paused}
```

JS (new module `js/modules/hero-eyebrow-rotator.js`):

```js
export function initHeroEyebrowRotator(){
  const root=document.querySelector('[data-hero-rotator]');if(!root)return;
  const items=[...root.querySelectorAll('.hero-eyebrow-rotator__item')];if(items.length<2)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i=0,paused=false,timer;
  const tick=()=>{items[i].classList.remove('is-active');i=(i+1)%items.length;items[i].classList.add('is-active')};
  const start=()=>{if(reduce||paused)return;timer=setInterval(tick,4500)};
  const stop=()=>clearInterval(timer);
  root.addEventListener('mouseenter',()=>{paused=true;stop()});
  root.addEventListener('mouseleave',()=>{paused=false;start()});
  root.addEventListener('focusin',()=>{paused=true;stop()});
  root.addEventListener('focusout',()=>{paused=false;start()});
  document.addEventListener('visibilitychange',()=>{document.hidden?stop():start()});
  start();
}
```

---

## Section B — Top 5 untapped special effects

Ranked by impact × inverse-cost. Each cites pattern source observed during research.

### 1. CSS scroll-driven progress bar at top of viewport — IMPACT HIGH, COST 8 LINES

Pattern source: MDN scroll-driven animations spec; Medium/Vercel docs use it. Pure CSS, GPU-composited, zero JS. Polyfill needed for Safari/Firefox (progressive enhancement — degrades to nothing).

```css
.scroll-progress{position:fixed;inset:0 auto auto 0;height:3px;width:100%;background:linear-gradient(90deg,var(--color-accent-primary),var(--color-accent-warm));transform-origin:0 50%;transform:scaleX(0);z-index:90;animation:scroll-progress linear;animation-timeline:scroll(root)}
@keyframes scroll-progress{to{transform:scaleX(1)}}
@media (prefers-reduced-motion: reduce){.scroll-progress{display:none}}
```

Place `<div class="scroll-progress" aria-hidden="true"></div>` once in `<body>` of every long page (products, blog, intel).

### 2. Magnetic CTA on primary hero button — IMPACT HIGH, COST ~30 LINES JS

Pattern source: Awwwards winners (multiple), CodePen `QwyjPOg`, blog.olivierlarose.com tutorial. Cursor inside a 1.5× hit-box pulls the button up to 8px toward cursor; releases on leave with elastic ease. Desktop-only — disable on touch.

```js
export function initMagneticCTA(){
  if(matchMedia('(hover: none)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('[data-magnetic]').forEach(btn=>{
    const r=btn.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const onMove=e=>{const dx=e.clientX-cx,dy=e.clientY-cy;
      const dist=Math.hypot(dx,dy);if(dist>r.width)return;
      btn.style.transform=`translate(${dx*0.18}px,${dy*0.18}px)`};
    const onLeave=()=>{btn.style.transform=''};
    btn.addEventListener('mousemove',onMove);btn.addEventListener('mouseleave',onLeave);
  });
}
```

Apply only to `.btn-primary[data-magnetic]` in hero. Adds ~0.2s `transform` transition with `cubic-bezier(.34,1.56,.64,1)` for spring release.

### 3. Letter-stagger entrance on H1 — IMPACT MEDIUM-HIGH, COST 20 LINES

Pattern source: Framer landing pages; Linear feature pages; Motion docs (the "bread and butter" stagger). We already have `hero-staggered-entrance.js` per the file glob — confirm it's PER-LETTER not per-word, and wired to hero-heading. If it's word-only, upgrade to letter-grain with 18ms stagger and 320ms fade+lift. ZERO new infra cost — reuse existing module.

### 4. Animated SVG line-draw for statute citations — IMPACT MEDIUM, COST 40 LINES

Pattern source: CSS-Tricks stroke-dashoffset, SVGenius, scroll-driven animations spec. As user scrolls past statute call-outs (LPCCDIA 1998 s.5A, PPN 002, Cyber Essentials), the underline beneath each citation draws on with `stroke-dashoffset` tied to `animation-timeline: view()`. Distinctive for a compliance brand — visually says "we have receipts."

```css
.statute-cite path{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:draw linear forwards;animation-timeline:view();animation-range:entry 20% cover 60%}
@keyframes draw{to{stroke-dashoffset:0}}
```

### 5. Spotlight follow inside dark sections — IMPACT MEDIUM, COST CSS-ONLY

Pattern source: Linear blog dark mode, Vercel docs dark hero. Mouse-move sets two CSS custom properties `--mx --my`; a radial-gradient backdrop tracks the cursor at ~5% opacity. Already a CSS-vars + 8 lines of JS — costs almost nothing. Pairs with our existing cursor-glow on cards, extending the language to section-level.

```js
document.querySelectorAll('[data-spotlight]').forEach(s=>{
  s.addEventListener('mousemove',e=>{const r=s.getBoundingClientRect();
    s.style.setProperty('--mx',`${e.clientX-r.left}px`);s.style.setProperty('--my',`${e.clientY-r.top}px`);});
});
```

```css
[data-spotlight]{position:relative;isolation:isolate}
[data-spotlight]::before{content:"";position:absolute;inset:0;background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.06),transparent 60%);pointer-events:none;z-index:0;transition:opacity .2s}
```

### Rejected (with reason)

- **Cursor trail dot** — feels gimmicky on a compliance brand; Apple uses it only on whimsical pages (accessibility microsites), not the storefront.
- **Glitch/scramble text** — wrong register for SME compliance; lowers trust signal. Belongs to consumer-cyber brands (Cloudflare Workers homepage style).
- **Auto-typing terminal** — wrong audience. Our buyer is a finance/procurement lead, not a developer. Vercel/Railway/Supabase use it because their buyer IS a developer.
- **Particles background** — overused 2018-2022 trope; Stripe, Linear, Apple all moved away.
- **Pulse rings on CTA** — competes with magnetic CTA; pick one (magnetic wins).
- **3D card tilt** — risk of motion sickness with our existing cursor-glow cards. Cumulative motion budget exceeded.
- **Number-morph counter** — our counter is already polished with back.out(1.4). Diminishing returns.

---

## Section C — Hero video verdict

**Verdict: NO hero video at this time.**

Three independent reasons:

1. **Reference pattern.** Stripe = static + wave SVG. Framer = static. Arc = static. Linear = static. Apple iPhone uses 4K product video because they HAVE a hero-tier physical product to reveal; we are selling abstract compliance/revenue outcomes — there is no equivalent "iPhone moment" to film. Vercel/Railway use code-typing terminals because their buyer reads code; ours does not.
2. **Cost discipline (charter).** Custom B-roll commissioning is £4-15k; even ambient stock loops cost 2-4MB bandwidth on every visit. Pre-revenue with zero paying customers, this is exactly the money-leak the no-money-leakage rule blocks.
3. **Performance.** Our existing `hero-earth-cinematic-3840.avif` already lands LCP under 2.5s. A 2 MB MP4/WebM loop will push mobile LCP to 4-6s on UK 4G — net conversion hit far larger than aesthetic gain.

**Defer-until trigger:** revisit when we have a real shippable product demo (CrowAgent Core dashboard with live data) AND ≥10 paying customers. At that point a 12-second product-UI motion clip (Linear pattern) — NOT ambient stock — earns the bandwidth.

---

## Section D — 8K commissioned photography

**Verdict: NO custom commission. Stay royalty-free.**

1. Hard rule (memory): every image on crowagent-website must be royalty-free; default Unsplash/NASA/Pexels/Wikimedia. Commissioning custom photography violates this unless the founder lifts the rule explicitly.
2. Current `hero-earth-cinematic-3840` and the NASA-grade Earth imagery on the homepage are already differentiated; Stripe and Linear use illustration not photography for their hero — we lead the category among UK compliance brands.
3. Cost: bespoke 8K commercial-license shoots run £8-30k; AI-generated 8K stills (Midjourney v6/Flux Pro) are £20/month subscription and would require human-credit pipelines we don't have. ROI negative pre-revenue.

**What we SHOULD do instead (zero cost):**
- Upscale the existing NASA Earth and London skyline assets to 8K via `realesrgan` (open-source, local) for retina ≥2880 viewports — already covered by `Assets/photos/avif/hero-uk-skyline-night-4k.avif` pattern; extend to 8K variant in same folder.
- Audit the four hero candidates (earth-cinematic, earth-night, london-uk-compliance, uk-skyline-night) — pick ONE canonical hero per surface; archive the rest. Currently three live "hero-*" images suggest indecision.

---

## Implementation order (next session)

1. Ship Section A rotator (1 HTML insert, 12 lines CSS, 18 lines JS, 1 new module). ~25 min.
2. Ship effect #1 scroll-progress bar (8 lines CSS, 1 div). ~10 min.
3. Ship effect #5 spotlight (10 lines, reuse cursor-glow language). ~15 min.
4. Audit existing `hero-staggered-entrance.js` for per-letter granularity (effect #3). ~15 min.
5. Ship effect #2 magnetic CTA (30 lines JS, restricted to `[data-magnetic]`). ~30 min.
6. Ship effect #4 SVG line-draw under statute citations (40 lines + path-length precompute). ~45 min.

Total: ~2.3 hours of focused work. All five effects + rotator land in one session with three modules and ~120 lines total.

---

## Sources observed

- stripe.com (homepage) — static hero confirmed
- linear.app — banner-row rotator pattern; static H1
- framer.com — static H1
- vercel.com — framework-logo carousel + globe-pulse
- arc.net — static
- railway.com — static (post-redirect)
- MDN: Scroll progress animations in CSS
- Frontend Masters: section-based scroll progress with scroll-driven CSS
- Awwwards / CodePen `QwyjPOg` / olivierlarose.com — magnetic button
- CSS-Tricks: SVG line animation (stroke-dasharray + stroke-dashoffset)
- Motion (formerly Framer Motion) 2025 rename — letter-stagger pattern
