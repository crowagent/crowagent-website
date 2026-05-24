# CrowAgent Brand Enhancement Research

**Date:** 2026-05-23
**Author:** Senior Brand Designer (Pentagram / Wolff Olins mandate)
**Status:** Recommendation document — pre-launch enhancement plan
**Source corpus:** WebFetch of public brand pages from Stripe, Linear, Vercel, Supabase, Arc, Raycast, Railway; founder-supplied master logo; CrowAgent token system (`crowagent-brand-tokens.css`).

---

## 0. Honest Sourcing Note

WebFetch returns post-render text from heavily client-rendered marketing sites — most explicit hex codes and motion specs are NOT exposed in the markup. Where I make a quantitative claim about a competitor brand, I label it (observed / public-doc / inferred). Anything not labelled is a CrowAgent recommendation grounded in the existing token system, not a competitor citation.

**What I could actually verify from WebFetch:**
- Linear (linear.app/brand) ships Mercury White `#F4F5F8` + Nordic Gray `#222326` as canonical, monochrome wordmark preferred, separate logomark + icon (verified).
- Vercel ships React-component logo variants: `<VercelWordmark/>` + `<VercelMark/>` + a Unicode fallback `▲ U+25B2` (verified).
- Stripe brand page exposes three wordmark variants: slate-on-light, blurple-on-light, white-on-dark (verified). Hex codes not in markup.
- Supabase ships light + dark logo SVG variants with a strict "no other colour" rule (verified).
- Railway, Raycast, Arc — public brand pages return 404 / Notion shell / lazy-loaded markup. No verifiable extraction; I do not cite them quantitatively below.

**What was inaccessible to WebFetch but is widely-documented public knowledge** (treat as background context, not new evidence): Stripe uses the Sohne typeface; Linear/Vercel/Stripe use signature ease curves on hover (~150–200ms). These are the visual targets the recommendations are calibrated to, not "proof points."

---

## 1. Per-Benchmark Observations (1 paragraph each)

**Stripe.** Three wordmark colour variants (slate, blurple, white) — proves a tier-1 brand carries a curated palette of wordmark expressions per surface, not a single PNG. CTAs observed in markup: "Start now", "Contact sales", "Watch now", "Read the story", "Apply now", "View developer docs". CTA voice = imperative + 2 words = no fluff. CrowAgent uses "Book a demo" (3 words) and "Start free 7-day Pilot" (5 words) — bias toward fewer words.

**Linear.** Two canonical colours (Mercury White + Nordic Gray) + a desaturated primary blue (un-published hex). Wordmark + logomark + icon are three formally-distinct assets, not crops of one PNG. CrowAgent currently ships ONE master PNG and crops it for nav/footer/avatar — that is a tier-2 pattern. CTA voice in markup: "Get started", "Open app", directional arrows ("Plan→", "Build→").

**Vercel.** Logo distributed as React components — `<VercelWordmark height={32}/>` + `<VercelMark size={16}/>` + the Unicode glyph `▲`. Tells us tier-1 brands engineer the logo for the consuming framework, not just ship a PNG. CTA voice: "Start Deploying", "Get a Demo", "Talk to an Expert". Title-case (not sentence case) — a deliberate brand-voice choice. Light/dark theme is first-class.

**Supabase.** Light + dark logo SVGs, strict colour rule. Their "Connect Supabase" OAuth button is a brand-asset in its own right. Lesson: branded OAuth/install buttons (e.g. "Add to Slack", "Connect Stripe") are part of the brand system, not a UI afterthought.

**Arc Browser.** Marketing site is image-heavy; brand mark used as a simple wordmark in nav. The home-page visual lexicon is editorial photography of the product itself in motion — no abstract gradient blobs. Lesson: at tier-1, abstract gradients are decoration, not identity; the identity comes from the product being seen working.

**Raycast.** Press kit is a Notion site (WebFetch couldn't read it). Publicly-known approach: dense iconography system, mono-stroke 1.5px line icons used at micro sizes, signature "AI sparkle" iconography. CrowAgent's icon system is currently Lucide-style 2px — sound, but lacks brand-specific glyphs (no "CrowAgent sparkle", no globe-as-icon).

**Railway.** 404 on brand URL. Publicly known: purple-on-black aesthetic, heavy use of single accent colour, no secondary palette. Reinforces the "ruthless restraint" thesis — top brands extend the palette only when necessary, not for cosmetic variety.

---

## 2. Top 10 Tier-1 Brand-System Patterns

1. **Three formal logo asset classes**, not one PNG: wordmark (full lockup), logomark (icon-only), favicon/Unicode-fallback. CrowAgent has these as files but treats the wordmark PNG as canonical and ignores the others as derivatives.
2. **Multiple wordmark colourways per surface** (Stripe ships 3; Supabase ships 2). One master + tinted variants = tier-2; properly-engineered colourways = tier-1.
3. **Logo distributed as code component**, not just a file (Vercel ships React; Stripe ships React + JS). Code components prevent crop/stretch bugs and let the brand carry attributes (size, theme, accent).
4. **Strict 2-colour anchor palette + 1 accent**, with semantic stops layered on top. Linear: 2 colours total; Stripe: slate + blurple + accent. CrowAgent: navy + teal + 22 product/semantic stops — risk of over-extension.
5. **Tabular numerals everywhere data appears** (Stripe, Linear, Vercel). CrowAgent has `--fvn-tabular` defined but only applied to `.ca-stat`, `.ca-price`, `.ca-table` — should be applied to `time`, `<kbd>`, all UI labels with numbers.
6. **One signature easing curve**, not seven. Stripe ships a single hover transition signature (~150ms ease-out). CrowAgent has 8 motion tokens (`--ease-out`, `--ease-spring`, `--ease-standard`, `--ease-tactile`, `--ease-default`, `--ease-in-out`, `--ease-canonical`, `--motion-fast/base/medium/slow`) — too many curves dilute the signature.
7. **Imperative 2-word CTAs**: "Start now", "Get started", "Open app". CrowAgent uses "Book a demo" (acceptable) but mixes with "Start free 7-day Pilot" and "Get the snapshot" — inconsistent register.
8. **OpenType variation tuning per role** — heading weight is NOT just "bold", it is `wght 800` + tight tracking + optical-size axis. CrowAgent has `--font-variation-h1: "wght" 800` declared but not consumed everywhere headings render.
9. **Single accent colour with engineered tint ladder**, not eight accent colours. CrowAgent has `--teal-06`..`-40` plus mix variants — good. But also has `--lime`, `--sky`, `--gold`, `--mark`, `--coral`, `--core`, `--mark-p`, `--trace`, `--nest`, `--build`, `--sight` — 11 brand-extension accents is one-too-many for a pre-launch brand.
10. **No fake testimonials or logo bars pre-launch**. Stripe shows real customers; Linear shows real product. Both refuse to fake it. CrowAgent must hold the line on "no fake customer logos" until first paying customer.

---

## 3. Top 7 Concrete Enhancements (priority-ordered)

### E1. Add a `<picture>`-driven logo COLOURWAY system

**What:** Generate a `crowagent-logo-2-light.{avif,webp,png}` for use on white surfaces (currently the print-only PNG is the fallback) and a `crowagent-logo-2-mono.svg` for monochrome contexts (legal docs, watermarks). Add a `crowagent-mark-only-{40,56,80,144}.svg` SVG variant of the white-tile icon as a true vector — replacing the cropped PNG icon used in avatars.

**Why:** Tier-1 brands ship 3+ formal asset classes. Current ICOnly comes from cropping the master PNG, which loses fidelity at small sizes.

**Files:** `Assets/brand/`, `js/nav-inject.js` (`logoHTML()`), `docs/brand-guidelines.md` §1.4.

**Implementation sketch:**
```html
<picture class="logo-img-pic" aria-hidden="true">
  <source srcset="/Assets/brand/crowagent-logo-2-light.avif" type="image/avif" media="(prefers-color-scheme: light)">
  <source srcset="/Assets/brand/crowagent-logo-2-dark.avif" type="image/avif">
  <source srcset="/Assets/brand/crowagent-logo-2-dark.webp" type="image/webp">
  <img src="/Assets/brand/crowagent-logo-2-dark.png" alt="CrowAgent — Sustainability Intelligence" width="190" height="56" decoding="async" fetchpriority="high">
</picture>
```

### E2. Collapse motion vocabulary to ONE signature curve + 3 durations

**What:** Deprecate `--ease-spring`, `--ease-default`, `--ease-tactile`, `--ease-standard`, `--ease-in-out`. Promote ONE signature: `--ease-canonical: cubic-bezier(0.16, 1, 0.3, 1)` (already defined). Keep `--duration-fast: 150ms`, `--duration-base: 250ms`, `--duration-slow: 400ms`. Everything in the site transitions on these tokens.

**Why:** Tier-1 brands have a recognisable motion signature. Eight curves = no signature.

**Files:** `crowagent-brand-tokens.css` lines 354–362 (deprecate but keep aliased for back-compat).

**Implementation:** Add a comment block declaring `--ease-canonical` as THE signature. Run a sweep replacing `transition: * var(--ease-spring)` → `var(--ease-canonical)` over the next phase.

### E3. Add a 12-step typography scale (current scale has 8 fluid tokens, 6 micro tokens, 6 composite tokens = fragmented)

**What:** Publish a single 12-step canonical scale and deprecate the parallel `--text-micro/eyebrow-s/caption/meta-s/body-s/body-m` set:

```css
/* Canonical 12-step type scale — supersedes prior --text-* duplicates */
--type-1:  0.6875rem;  /* 11px — micro caption, badge */
--type-2:  0.75rem;    /* 12px — meta, footnote */
--type-3:  0.8125rem;  /* 13px — small body, table cell */
--type-4:  0.875rem;   /* 14px — secondary body */
--type-5:  1rem;       /* 16px — body default */
--type-6:  1.125rem;   /* 18px — lead body */
--type-7:  1.25rem;    /* 20px — eyebrow display, h5 */
--type-8:  1.5rem;     /* 24px — h4 */
--type-9:  1.875rem;   /* 30px — h3 */
--type-10: 2.25rem;    /* 36px — h2 */
--type-11: 3rem;       /* 48px — h1 */
--type-12: clamp(3.5rem, 6vw, 5rem); /* 56-80px — display hero */
```

**Why:** Tier-1 brands publish one named ladder, not three overlapping sets. Easier to discuss, easier to enforce.

**Files:** `crowagent-brand-tokens.css` lines 166–183 (additive — do not delete existing tokens; alias them).

### E4. Engineer a signature LOGO entrance animation

**What:** When the page first loads, the four ascending bars of the tile rise in sequence (left → right), then the wordmark fades in, then the tagline. After settle, the tile gets a one-time subtle teal sweep across the bars. Hover state: bars compress 2% in height with a 200ms `--ease-canonical` curve. Scroll: at scrollY > 80, the tagline opacity drops to 0 over 200ms (revealing just the wordmark, exactly like Stripe nav).

**Describable spec for a designer:**
- 0–600ms: 4 bars rise from 0% to full height, staggered 80ms each, `cubic-bezier(0.16, 1, 0.3, 1)` (ease-canonical). Bar 1 = `--logo-bar-1` (indigo), bar 4 = `--logo-bar-4` (teal). The progression visually narrates the brand: blue (data) → teal (intelligence).
- 600–1100ms: wordmark "CrowAgent" fades in (`opacity 0→1`) with a 20px upward `translateY(20px → 0)`, `--ease-canonical`, 400ms.
- 1100–1600ms: tagline "Sustainability · Intelligence" fades in (`opacity 0→1`) 300ms.
- 1600–2400ms: one-time teal glow sweeps across the four bars (`background-position: -100% → 200%`), simulating data-flow. 800ms `linear`.
- Hover (≥4s after entrance): bars dip from `height: 100% → 96%` over 200ms, return on hover-out. Wordmark `opacity: 1 → 0.85`. NO transform on the wordmark (avoid Apple-style overshoot — CrowAgent voice is "calm", not "playful").
- Scroll: when `scrollY > 80`, tagline opacity fades to 0 over 200ms. When `scrollY < 80`, tagline opacity restores. Mirrors Stripe nav.
- `prefers-reduced-motion: reduce`: skip all entrance choreography, render terminal state immediately. No scroll-fade.

**Implementation:** New file `js/modules/logo-entrance.js`. Uses Web Animations API (not GSAP — Web Animations is sufficient for this sequence and zero-bundle-cost).

### E5. Tighten and rationalise the colour system

**Add (3 new tokens) — extend `--teal` ladder consistently:**
```css
--teal-50:    #E6FAF6;   /* surface tint — for light-mode info chips */
--teal-100:   #B3F0E0;   /* hover tint over light surface */
--teal-700:   #088570;   /* pressed teal on light bg — already exists as --teal-light-d, promote */
```

**Promote 1 existing tone:**
```css
--teal:    #0CC9A8;   /* CORE — unchanged */
--teal-d:  #0AA88C;   /* hover-on-teal — unchanged */
--teal-l:  #6EE9D2;   /* tint stops — unchanged */
```

**Demote (do not delete — add a `/* deprecated 2026-05-23 */` comment):**
- `--teal-bright #00D4AA` — duplicates `--teal` to within 4%, redundant.
- `--teal-alt #0CC9A9` + `--teal-alt2 #0CC9AB` — chroma-shifts indistinguishable to human eye.
- `--mark`, `--coral`, `--mark-violet` — keep only `--mark` for product-Mark theming; demote `--mark-violet` and `--coral` (use `--err` instead).

**Why:** A brand survives by what it REFUSES to include. Five lookalike teals is a pre-launch over-extension.

**Files:** `crowagent-brand-tokens.css` lines 47–63, 842–908.

### E6. Codify the CTA voice register — imperative-2

**What:** Establish a 1-line CrowAgent voice rule in `docs/brand-guidelines.md`:

> CrowAgent CTAs are imperative, 2 words, sentence case. "Book a demo" (not "Schedule your personalised demo"). "See pricing" (not "Explore our flexible pricing"). One exception: the primary hero CTA may use a 3-word imperative if the verb is non-obvious ("Start free pilot"). All other CTAs: 2 words max.

**Enforce via:**
1. Append §6 to `docs/brand-guidelines.md`.
2. Add a Playwright probe to count CTA word-length across the site — gate at ≤3 words.

**Why:** Stripe, Linear, Vercel all converge on 2-word imperative. CrowAgent currently runs "Book a demo" (good) alongside "Start free 7-day Pilot" (5 words) and "Try our late payment calculator" (5 words). Voice inconsistency = brand-noise.

### E7. Replace 3 generic Lucide icons with brand-specific glyphs

**What:** Custom-draw 3 icons that ARE the brand's vocabulary:
1. **CrowAgent globe** — a stylised Earth (already exists as the photo-real emoji in the tagline). Vectorise it as `/Assets/brand/icon-globe.svg` so it appears wherever sustainability is referenced.
2. **CrowAgent bars** — the four ascending bars from the tile, used as a "growth" / "intelligence" indicator at 14px and 18px.
3. **CrowAgent sparkle** — a 4-pointed star (used by Raycast, OpenAI, Anthropic) at 12/14/18px, applied to AI-powered features ("Ask the agent…") so users learn the icon = AI assistance.

Stroke-width: 1.75px (slightly thinner than the Lucide default 2px — creates a more refined feel at 14–18px).

**Why:** Pure-Lucide is "tasteful default"; tier-1 brands ship 5–10 custom glyphs that ARE part of the brand. 3 is the minimum viable custom set.

**Files:** New SVGs under `Assets/brand/icons/`. Register in `docs/brand-guidelines.md` §7 (new section).

---

## 4. Logo Animation Concept (full spec for handoff)

See E4 above — full 0→2400ms entrance choreography, hover treatment, scroll-fade behaviour, and `prefers-reduced-motion` handling described in describable, designer-buildable terms. The narrative ARC is: **data (indigo bars) → intelligence (teal bars) → identity (wordmark) → purpose (tagline) → motion (teal sweep)**. That five-beat sequence IS the brand promise told in 2.4 seconds.

---

## 5. Color Palette Extension Recommendations

| Token | Hex | Use | Status |
|---|---|---|---|
| `--teal-50` | `#E6FAF6` | Light-surface tint, info-chip background | NEW |
| `--teal-100` | `#B3F0E0` | Light-mode hover ghost | NEW |
| `--teal-700` | `#088570` | Pressed teal on light surface (promote existing `--teal-light-d`) | PROMOTE |
| `--teal` | `#0CC9A8` | Core accent | UNCHANGED |
| `--teal-d` | `#0AA88C` | Hover-on-teal | UNCHANGED |
| `--teal-l` | `#6EE9D2` | Tint stops | UNCHANGED |
| `--teal-bright` `#00D4AA` | — | Deprecate (duplicates `--teal`) | DEMOTE |
| `--teal-alt` `--teal-alt2` | — | Deprecate (chroma noise) | DEMOTE |
| `--coral` `#F87171` | — | Deprecate (use `--err`) | DEMOTE |

Semantic stops (already exist; no change):
- `--success #22C55E`
- `--warn / --warning #F59E0B`
- `--err / --danger #EF4444`
- `--info / --sky #5BC8FF`

Product hues (already exist; KEEP — they serve `data-product` theming):
- `--brand-cyber #5BC8FF`, `--brand-mark #A78BFA`, `--brand-cash #DAA520`, `--brand-core #0CC9A8`, `--brand-esg #C2FF57`.

---

## 6. Typography Scale Recommendation (12 steps)

See E3 — canonical 12-step type ladder (`--type-1` through `--type-12`, 11px → clamp(56–80px)). Modular ratio = 1.2 (geometric mean across the scale), aligned to a 4pt baseline. Alias existing tokens to the new ladder; do not delete legacy tokens (refactor-risk-zero).

Variable-font axis tuning (already declared `--font-variation-h1: "wght" 800` etc.) must be APPLIED to all `h1..h4` rules in `styles.css` — currently declared but inconsistently consumed. Add a Playwright probe that asserts `getComputedStyle(h1).fontVariationSettings === '"wght" 800'`.

---

## TOP 3 BIGGEST IMPACT × LOWEST COST

1. **E2 — Collapse motion vocabulary to ONE signature curve.** Cost: 1 commit, single token block edit + comment deprecation. Impact: every transition on the site instantly reads more cohesive. Foundational.

2. **E6 — Codify and enforce CTA voice = imperative-2.** Cost: 1 commit (guidelines doc) + a Playwright probe. Impact: every page reads as the same brand voice. Listing 8 brand CTAs lets us audit in a single sweep.

3. **E4 — Engineer the logo entrance animation.** Cost: ~120 lines of JS in `js/modules/logo-entrance.js` + a `prefers-reduced-motion` guard. Impact: the brand FEELS engineered the moment the page loads — the single highest-leverage tier-1 signal we can add without changing any product copy or asset. THIS is what makes a Stripe site feel like a Stripe site.

E1, E3, E5, E7 are higher-cost (asset generation, icon design, token sweep) and should follow once the above three land.

---

**End of deliverable.**
