# Gemini CLI Instructions for `crowagent-website`
**Version:** 2.0
**Date:** 2026-05-15

---

## MANDATORY: State Recovery Hook

**EVERY SESSION START:** You MUST immediately read `.gemini/state/TRANSFORMATION-STATE.md`.
- This file is the definitive state tracking mechanism
- Do NOT make assumptions about current progress without reading it
- Update it meticulously as you complete each phase/task
- If the file shows a task as incomplete, resume from that exact point

---

## Specification Documents (READ BEFORE ANY WORK)

| Document | Path | Purpose |
|----------|------|---------|
| Requirements | `.gemini/specs/WEBSITE-REQUIREMENTS.md` | What to build (features, pages, NFRs) |
| Design | `.gemini/specs/WEBSITE-DESIGN.md` | How it looks (CSS, components, animations) |
| Execution | `.gemini/specs/WEBSITE-EXECUTION.md` | Step-by-step implementation plan |
| State | `.gemini/state/TRANSFORMATION-STATE.md` | Current progress tracker |

---

## HARD RULES (ZERO EXCEPTIONS)

### Rule 1: Brand Token Compliance
- **NEVER** hardcode hex colour values in HTML or CSS
- **ALWAYS** use `var(--token-name)` from `crowagent-brand-tokens.css`
- CTA buttons: background `var(--teal)`, text `var(--obsidian)`
- Primary text: `var(--cloud)`
- Secondary text: `var(--steel)`
- Borders: `var(--border2)`
- If you need a colour not in the token system, ASK before inventing one

### Rule 2: Motion Accessibility
- **EVERY** animation MUST be gated behind `prefers-reduced-motion` check
- Pattern for GSAP:
  ```javascript
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    // animation code here
  }
  ```
- Pattern for CSS:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .animated-element {
      animation: none !important;
      transition: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
  ```
- WebGL canvas: `display: none` when reduced motion is active

### Rule 3: Performance Budget
- Animate ONLY `transform` and `opacity` (never width, height, top, left, margin)
- Use `will-change: transform` sparingly and remove after animation completes
- WebGL shader: 30fps cap (not 60fps, the drift is slow enough)
- Images: always include `width` and `height` attributes
- Hero LCP image: `loading="eager"` + `fetchpriority="high"`
- All other images: `loading="lazy"`

### Rule 4: No Inline Scripts
- All JavaScript MUST be in external `.js` files
- Use `defer` attribute on all script tags
- Exception: the critical CSS `<style>` block is permitted (documented in `Assets/css/critical-above-fold.css`)

### Rule 5: Deprecation Enforcement
- The following product names are BANNED from the codebase:
  - `CrowBuild`
  - `CrowSight`
  - `CrowNest`
  - `CrowTrace`
- Before committing ANY change, run: `grep -ri "crowbuild\|crowsight\|crownest\|crowtrace" --include="*.html" --include="*.js"`
- If grep returns ANY results, fix them before committing

### Rule 6: Canonical Product List
- The site has exactly 6 products. No more, no less:
  1. CrowAgent Core
  2. CrowMark
  3. CSRD Checker
  4. CrowCyber
  5. CrowCash
  6. CrowESG (Coming Q3 2026)

### Rule 7: Regulatory Content Accuracy
- MEES Band C 2028: ALWAYS "proposed" - never "confirmed" or "enacted"
- MEES fines: NEVER exceed 150,000 GBP
- PPN 002 threshold: ALWAYS 10% - never 5%
- Late Payment Act interest: Bank of England base + 8 percentage points
- Cyber Essentials version: v3.3 "Danzell" (in force 28 April 2026)
- CSRD Omnibus I: >1,000 employees AND >450M EUR turnover
- Annual pricing discount: EXACTLY 10% (monthly x 12 x 0.9) - never 20%

### Rule 8: No Production Deployment
- NEVER deploy to production without explicit user approval
- All verification happens on `localhost:8083`
- Command to start local server: `npx http-server -p 8083`
- Present changes to user and WAIT for "deploy" or "approved" confirmation

### Rule 9: Scope Lock
- You are working ONLY on `crowagent-website` (marketing site)
- Do NOT modify `crowagent-platform` or `crowagent-portal`
- Do NOT modify files outside the `crowagent-website` directory
- Do NOT install new npm packages without documenting why

### Rule 10: Commit Discipline
- Commit after each completed phase (not after each file edit)
- Use conventional commit messages: `feat:`, `fix:`, `perf:`, `chore:`, `seo:`
- Never commit `node_modules/`, `.cache/`, or build artifacts that should be gitignored
- Stage specific files, not `git add .`

---

## CONTROL HOOKS (Verification Checkpoints)

### Before ANY CSS Change:
1. Does it use brand tokens? (No hardcoded hex)
2. Does it have a `prefers-reduced-motion` fallback?
3. Does it animate only `transform`/`opacity`?
4. Is it responsive (tested at 1440px, 768px, 375px)?

### Before ANY JS Change:
1. Does it check `prefers-reduced-motion`?
2. Does it use `defer` loading?
3. Does it gracefully handle missing DOM elements (null checks)?
4. Does it clean up event listeners / observers when appropriate?

### Before ANY HTML Change:
1. Does it use semantic elements (`<section>`, `<article>`, `<nav>`, etc.)?
2. Do images have `width`, `height`, `alt`, and `loading` attributes?
3. Are ARIA attributes correct (roles, labels, states)?
4. Is the content factually accurate per Rule 7?

### Before ANY Commit:
1. Run deprecation grep (Rule 5)
2. Verify on localhost (no console errors)
3. Check responsive at 375px (no overflow)
4. Update `.gemini/state/TRANSFORMATION-STATE.md`

---

## EXECUTION WORKFLOW

```
1. Read state file -> Determine current phase
2. Read execution spec -> Find next incomplete task
3. Implement the task (following all hard rules)
4. Verify locally on localhost:8083
5. Run control hook checks
6. If phase complete: commit + update state file
7. Move to next task/phase
8. After Phase 10: Present to user for approval
```

---

## TECH STACK REFERENCE

| Technology | Version | Location | Purpose |
|-----------|---------|----------|---------|
| GSAP | 3.x | `/js/vendor/gsap.min.js` | Animation engine |
| ScrollTrigger | 3.x | `/js/vendor/ScrollTrigger.min.js` | Scroll-driven animations |
| WebGL2 | Native | `/js/modules/hero-mesh-shader.js` | Mesh gradient backdrop |
| Plus Jakarta Sans | Variable | Google Fonts | Display typography |
| Inter | Variable | Google Fonts | Body typography |
| Sharp | 0.34.x | devDependency | Image conversion |
| PurgeCSS | 8.x | devDependency | CSS optimization |
| Terser | 5.x | devDependency | JS minification |

---

## FILE MAP (Key Files)

```
crowagent-website/
  index.html                    # Homepage (primary transformation target)
  styles.css                    # Main stylesheet (add new sections here)
  styles.min.css                # Minified output (regenerate with npm run build:css)
  scripts.js                    # Main JS entry point
  crowagent-brand-tokens.css    # Brand token system (DO NOT EDIT without approval)
  
  js/
    nav-inject.js               # Navigation (update product list here)
    modules/
      cinematic-init.js         # GSAP setup + earth zoom + magnetic buttons
      hero-mesh-shader.js       # WebGL2 mesh gradient
      sticky-storytelling.js    # Scrollytelling pinning
      hero-staggered-entrance.js # Hero entrance animation
      hero-parallax.js          # Orb mouse parallax
      micro-interactions.js     # Form interactions + page-load reveal
      nav-shrink.js             # Nav height reduction on scroll
      carousel.js               # Product carousel
      logo-shimmer.js           # Logo hover effect
      spotlight.js              # Cursor spotlight (optional)
  
  Assets/
    photos/                     # Hero images, backgrounds
    screenshots/                # Product screenshots (WebP/AVIF)
    icons/                      # SVG icons
    lottie/                     # Lottie animation files
    css/
      critical-above-fold.css   # Source for inline critical CSS
  
  .gemini/
    specs/                      # These specification documents
    state/                      # Progress tracking
    instructions/               # This file
```

---

## COMMON PATTERNS

### Adding a New Section to Homepage:
```html
<section class="[section-name] section-tone-[0-3]" data-section-reveal>
  <div class="wrap">
    <span class="section-label">SECTION TITLE</span>
    <h2>Heading Text</h2>
    <p class="section-sub">Description text</p>
    <!-- Content here, with data-reveal-child on items -->
  </div>
</section>
```

### Adding a Product Screenshot:
```html
<div class="product-frame" data-reveal-child>
  <div class="product-frame-chrome" aria-hidden="true">
    <span class="product-frame-dot d-r"></span>
    <span class="product-frame-dot d-y"></span>
    <span class="product-frame-dot d-g"></span>
    <span class="product-frame-url">app.crowagent.ai/[product]</span>
  </div>
  <picture>
    <source srcset="/Assets/screenshots/[name].avif" type="image/avif">
    <source srcset="/Assets/screenshots/[name].webp" type="image/webp">
    <img src="/Assets/screenshots/[name].png" alt="[description]"
         width="1600" height="900" loading="lazy" decoding="async">
  </picture>
</div>
```

### Adding a CTA Button:
```html
<a class="btn btn-lg btn-primary-v2" href="[url]" data-magnetic>
  [Button Text]
</a>
<a class="btn btn-lg btn-secondary" href="[url]" data-magnetic>
  [Button Text]
</a>
```

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| GSAP not loading | Check `/js/vendor/gsap.min.js` exists and has `defer` attribute |
| WebGL not rendering | Check browser supports WebGL2; verify canvas has `data-hero-mesh` |
| Animations janky | Profile in DevTools; ensure only transform/opacity animated |
| Layout shift on load | Add explicit width/height to images; check `[data-section-reveal]` initial state |
| Nav not updating | Clear browser cache; check `nav-inject.js` for syntax errors |
| Styles not applying | Run `npm run build:css`; check `styles.min.css` is linked |
| Reduced motion not working | Verify `prefers-reduced-motion` check exists in JS module |

---

## QUALITY ENFORCEMENT

If you are about to:
- Skip a task: **STOP.** Complete it fully.
- Simplify an animation: **STOP.** Implement as specified in the design doc.
- Use a hardcoded colour: **STOP.** Find the token in `crowagent-brand-tokens.css`.
- Deploy without approval: **STOP.** Present to user first.
- Ignore reduced motion: **STOP.** Add the check.
- Leave deprecated names: **STOP.** Run the grep and fix.
- Skip responsive testing: **STOP.** Test at 1440px, 768px, 375px.
- Use low-quality images: **STOP.** Source 8K royalty-free alternatives.
- Proceed without user testing: **STOP.** Ask user to test after each phase.
- Leave misaligned elements: **STOP.** Fix alignment to pixel-perfect.

The user expects Tier-1 quality. Every pixel matters. Every animation must be smooth. Every interaction must feel premium. No shortcuts. No compromises.

---

## MANDATORY USER TESTING PROTOCOL

After completing EACH execution phase, you MUST follow this exact sequence:

```
1. Summarize changes made (files, features, fixes)
2. List specific pages/URLs to test on localhost:8083
3. Highlight what to look for (new animations, layout changes, etc.)
4. ASK: "Please test these changes on localhost:8083 and let me know if anything needs adjustment."
5. WAIT for user response
6. If issues reported: fix immediately, re-present, wait again
7. Only proceed to next phase after user confirms
```

**NEVER skip this protocol. NEVER assume changes are acceptable without user confirmation.**

---

## RESPONSIVENESS RULES (BLOCKING)

- Responsiveness is NOT optional polish. It is a BLOCKING requirement.
- Every change must work at 375px before it is considered complete.
- If a layout breaks on mobile, it is a P0 bug that blocks all other work.
- Test order: Desktop first (1440px), then tablet (768px), then mobile (375px).
- Common mobile issues to watch for:
  - Horizontal overflow (check `overflow-x: hidden` on body)
  - Text too small (minimum 16px body text)
  - Touch targets too small (minimum 44x44px)
  - Grids not collapsing (check media queries)
  - Images overflowing containers (check `max-width: 100%`)
  - Fixed elements covering content

---

## ALIGNMENT & VISUAL PRECISION RULES

- Every section must align to the 1400px container grid
- No element should be "close enough" - it must be EXACT
- Use browser DevTools to verify pixel alignment
- Cards in a row must be identical height (use `grid-auto-rows: 1fr`)
- Icons within a section must be the same size
- Spacing between elements must follow the design spec exactly
- If something looks "off" visually, it IS off - fix it

---

## IMAGE QUALITY RULES

- ALL hero/background images: 8K source, royalty-free (Unsplash, Pexels, NASA)
- NEVER use AI-generated images (no DALL-E, Midjourney, Stable Diffusion output)
- NEVER use low-resolution or pixelated images
- Product screenshots: real platform screenshots at 2x DPI
- Process all images through Sharp for WebP/AVIF conversion
- Verify no compression artifacts at 100% zoom before committing
- The site must look like a premium human-designed product, not AI-generated content

---

## CAROUSEL EXCELLENCE RULES

- Transitions must be buttery smooth (500ms, no frame drops)
- Touch/swipe must feel native on mobile
- Auto-play pauses on hover and focus
- Keyboard accessible (arrow keys + tab)
- All slides in chrome frames with consistent dimensions
- Responsive: full-width on mobile, peek adjacent on desktop
- If carousel feels janky or cheap, rebuild it until it feels premium
