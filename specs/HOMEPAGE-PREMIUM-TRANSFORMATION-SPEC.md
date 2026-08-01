# Homepage Premium Transformation — Spec

**Target:** `homepage-claude-v1.html` (served at `http://localhost:8092/homepage-claude-v1.html`)
**Status:** Section 1 shipped. Sections 2–9 specified below.
**Written:** 2026-08-01

---

## 0. Binding constraints (apply to every section)

These are not negotiable and override any design instinct.

| Constraint | Detail |
|---|---|
| **Palette frozen** | No new colours. Use only the tokens listed in §0.1. This is a *motion and layout* exercise, not a rebrand. |
| **Gradient theme frozen** | The four-stop capsule ramp and the hero/CTA `.paid` ramps stay exactly as they are. |
| **Sections stay** | Same content, same order. We are changing *how it moves and reads*, not what it says. |
| **`index.html` untouchable** | It is the comparison baseline. Never edit it. |
| **Real captures only** | No invented dashboards, no Lorem Ipsum, no placeholder art. |
| **Never imply likelihood of winning** | The string "win rate" must not appear. Watch for it *inside* captures too. |
| **No measured AI accuracy** | No percentage accuracy, no "zero hallucination". |
| **No Procurement Act compliance assertion** | May describe the Act; may not claim the product makes anyone compliant. |
| **Retired products appear nowhere** | CrowCyber, CrowCash, CrowESG, CrowAgent Core. The build fails if they reach `dist`. |
| **British English, no em-dashes** in user-facing copy. |
| **Banned vocabulary** | revolutionize, seamlessly, harness, unleash, cutting-edge, game-changing, **transform**. |

### 0.1 Design tokens (the only permitted values)

```
--nt-bg #05070E          --nt-bg-card rgba(12,16,32,.55)   --nt-border rgba(150,170,220,.12)
--nt-teal #2DD4BF        --nt-cyan #22D3EE                 --nt-violet #A78BFA
--nt-violet-deep #7C3AED --nt-pink #F472B6
--nt-text-main #FFFFFF   --nt-text-sub #B8C4E0             --nt-text-muted #8A9BC0
fonts: display/body both resolve to Inter; mono is JetBrains Mono
```

**Glass recipe** (one material across the page):
`background: var(--nt-bg-card)` + `backdrop-filter: blur(22px) saturate(150%)` + `1px solid var(--nt-border)` + `box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 20px 50px rgba(2,4,10,.45)`, with an `@supports not (backdrop-filter)` opaque fallback.

**Capsule/eyebrow:** 600 11.5px mono · letter-spacing 1.84px · uppercase · 100px pill · border `rgba(150,170,220,.22)` · `box-shadow: inset 0 0 0 200px rgba(124,58,237,.10)` · text painted `linear-gradient(90deg,#2DD4BF 0%,#5BC8FF 40%,#A78BFA 72%,#F472B6 100%)` clipped to glyphs · 6px glowing teal dot via `::before` which **must** set `-webkit-text-fill-color: initial` or it inherits the transparent fill and vanishes.

### 0.2 Motion contract

- Animate **`transform` and `opacity` only**. Never animate `width`, `top`, `filter` or `box-shadow` in a loop — they force layout/paint and drop below 60fps.
- `translate3d(...)` / `will-change` to promote to a compositor layer.
- **One `requestAnimationFrame` clock per component.** Never pair a `setInterval` with a CSS transition; they drift apart.
- Everything autoplaying runs **only while ≥25% on screen** (IntersectionObserver) and **pauses on hover and keyboard focus**, resuming on leave.
- `prefers-reduced-motion: reduce` must reach a sensible **static end state**, not a frozen mid-animation.
- Reveals are one-way: `unobserve` after firing or they re-trigger forever.

---

## 1. HERO — ✅ SHIPPED

**Reference studied:** Supabase, "Stay productive and manage your app without leaving the dashboard".
**Why it works:** the frame never feels like a screenshot because something is always moving inside it, and the chrome makes it read as a live product rather than an image.

**Built:** two stacked `<img>` layers that genuinely cross-fade (single-`src` swapping flashed an empty frame); next frame `await img.decode()`d before the fade so the first pass doesn't flicker; one rAF clock driving both progress bar and advance; scale 1.03→1 on `cubic-bezier(.16,1,.3,1)`; autoplay gated on visibility; hover/focus pause **and resume**; full `role="tablist"` + arrow keys; pointer-event swipe (40px threshold); idle-time preload of all four; per-frame alt text; simulated cursor traversing to a real control per frame with a click ripple, positioned in **percentages** so it stays on target at any width, hidden while a real user hovers.

**Verified:** advances at 5.8s · hover 6.5s leaves it unchanged · resumes on leave · cursor x=702→858→313 · axe 0 at 390/768/1040/1440 · 0 console errors.

---

## 2. STAT BAND — in progress (agent building partial)

**Reference:** Stripe `/gb`, "The backbone of global commerce".
**Why it works:** the numbers feel *observed rather than claimed*. Motion is ambient and continuous, never a one-shot gimmick; the section reads as calm authority.

**Content is fixed** (already researched and sourced):

| Stage | Figure | Claim |
|---|---|---|
| 01 FIND | 40,000+ | Tenders published every year |
| 02 QUALIFY | 55% | Are stopped at the qualification threshold |
| 03 ANSWER | 44% | Cite process complexity as the barrier |
| 04 DELIVER | £5m | Where post-award duties begin |

**Build:**
- Count-up on IntersectionObserver, once. Must preserve prefix/suffix (`40,000+`, `55%`, `£5m`) and use `Intl.NumberFormat('en-GB')`.
- SVG flow line running left→right **through** the four cards with a travelling pulse (`stroke-dashoffset`), expressing the lifecycle sequence.
- Slow ambient gradient drift behind the band.
- Staggered reveal, 80ms apart.
- Hover: lift + glow intensify.
- Responsive 4 / 2 / 1 columns at ≥1040 / 640–1039 / <640.
- Reduced motion: final values shown immediately, no pulse, no drift.
- Sourced footnote must remain, including the line stating these describe the **market, not our performance**.

---

## 3. AI BUILT FOR EVIDENCE — scroll-driven

**Reference:** Better Stack, "AI SRE".
**Why it works:** the scroll *is* the narration. Each scroll step advances one reasoning step, so the visitor learns the mechanism by moving through it rather than reading about it.

**Build:** a pinned stage with 4 scroll steps, each revealing one stage of how an answer is assembled:

1. **The question** — the published award question appears.
2. **Retrieval** — three source lanes light up: the rules, this tender, your own answer library. Nothing else is ever in scope.
3. **Drafting** — text assembles with citation chips attaching to figures.
4. **The gate** — each figure resolves to a recorded commitment; the approve control unlocks. If one cannot be traced, it stays locked.

Use the real worked example already on the page (4 jobs × £27,000 = £108,000, cited to committed measures T1M1–T1M3 and the Oxford Social Value Bank).

**No GSAP in this repo.** Implement pinning with `position: sticky` + an IntersectionObserver-driven step index. Do **not** hijack the scroll wheel — sticky + step index keeps native scrolling intact, which is both more accessible and impossible to make janky.
**Reduced motion:** all four steps shown stacked and static, no pinning.

---

## 4. ONE ENGINE, END TO END — interactive journey

**Reference:** Mixpanel, "Get from data to decision at AI speed".
**Why it works:** it renders a *system*, not a feature list. You can see where a thing enters and where it comes out.

**Build:** an animated architecture the visitor can follow:

```
Notice → Qualify → Evidence → Draft → Gate → Award → Deliver → Report
```

- Signal pulses travel the connectors continuously.
- Hovering a node lifts it, brightens its connectors, and expands its detail card.
- The four existing bento cards become the four **stations** on this flow rather than a static grid.
- Keyboard: each node focusable, expands on Enter/Space.
- Reduced motion: static diagram, hover still expands.

---

## 5. BOTH SIDES OF THE TABLE — split with shared brain

**Reference:** Mixpanel, "Your personal analyst, accessible anywhere".
**Why it works:** one idea shown twice from two vantage points, sharing a visible centre.

**Build:** supplier panel left, buyer panel right, **one shared engine in the middle**. Connections animate outward from the centre to whichever side is hovered; the opposite side dims slightly. Keeps the existing photography and the verbatim feature lists from the production page. The line to land: *one engine, both sides of the table, and almost nothing else in this market does both.*

---

## 6. BUILT FOR HOW BID TEAMS WORK — device carousel

**Reference:** Better Stack, Tracing section.

**Build:** 6 real captures alternating **mobile / tablet / mobile / tablet / mobile / tablet** in premium glass device frames, horizontal scroll, arrow + keyboard + touch, autoplay with hover-pause, progress indicator, each frame captioned with what that surface does.

**Reuses the Section 1 cycler machinery** — one rAF clock, crossfade, hover-pause, swipe. This is not a second build.

**Blocked on assets:** needs 6 captures; we have 1 mobile + 2 tablet. Agent is capturing now into `Assets/shots/mobile/` and `Assets/shots/tablet/`.
⚠️ **Screen every capture for win/loss framing.** The analytics screen carries a "Win rate" KPI, a "Win/loss insights" tab and Won/Lost bars. Use the harness's `hideText` or pick clean surfaces.

---

## 7. PLUGGED IN, READ ONLY — polish only

Owner: *"looks fine for me."* Keep the 3×3 layout and the nine real connectors. Add only: connector lines drawn between chips on reveal, gentle icon lift on hover, ambient light behind the grid. **Do not change the layout.**

---

## 8. RUN THE REAL ENGINE — replace entirely

Owner: *"do we really need this? looks very outdated."* **Correct — remove the slider calculator.**

**Reference:** Raycast, "Your Mac just got smarter."
**Why it works:** it demonstrates the AI doing something specific and real, rather than describing capability in the abstract.

**Build — a live AI reasoning showcase.** The single most memorable section on the page, and our actual differentiator:

- A question enters.
- **Reasoning steps appear in sequence**: retrieve → ground → compute → check → cite.
- An **evidence graph** draws itself, connecting the answer to the commitments it rests on.
- **Confidence and traceability** shown as state, not as a score we invented.
- The gate resolves: every figure traced, or approval stays locked.

Must remain literally true to the product: deterministic figure computation, three permitted sources, a named human approving. No accuracy percentage, no win prediction.

---

## 9. READY WHEN YOU ARE — ✅ polish only

Owner: *"This looks great."* Already matches production exactly: `.nb-final` recipe value-for-value, three-blob mesh, "Ready when you are" gradient eyebrow, white headline with gradient "Get paid.", Request access + Book a demo with shine, free-tool row. **Leave it alone.**

---

## 10. Verification gate (every section, before it is called done)

```bash
node .dev-tools/axe-one.cjs /homepage-claude-v1.html        # must be 0 at 390/768/1040/1440
node .dev-tools/asset-404-check.cjs /homepage-claude-v1.html # 0 failures, 0 broken, all alt
node .dev-tools/shoot-page.cjs /homepage-claude-v1.html x 1440 11   # then READ the slices
```

Plus, per section:
- No horizontal overflow at **320 / 375 / 768 / 1024 / 1280 / 1440 / 1920**.
- 0 console errors.
- Autoplay pauses on hover — **measured**, by sampling state before and after, not assumed.
- Reduced-motion path reaches a sensible static end state.
- Constraint sweep: no `win rate`, no retired product names, no banned vocabulary, no em-dashes in copy.

**A render is not evidence.** Read the screenshot, and measure computed styles for anything about size, colour or position. Several defects this project has hit (the 84px nav gap, the white-instead-of-teal headline, the cropped bento previews) were invisible in source and only appeared under measurement.

---

## 11. Traps already paid for — do not rediscover

- The global nav is `position:fixed` at `--ca-nav-h: 72px`. Content must clear it or it renders underneath. Needed `!important` on this page.
- A sitewide `h2` rule paints every heading with a white→translucent gradient and will silently beat a new `background` while letting `font-size` through.
- Production uses **42%** in the hero gradient stop and **46%** in the CTA. Deliberately different.
- Headings resolve to **Inter**, not Plus Jakarta Sans — brand tokens override the display stack.
- `object-fit: cover` in a fixed-ratio window crops wide captures and cuts interface text mid-word. Use `contain` on a matching ground.
- Git Bash mangles leading-slash args to node scripts. Prefix with `MSYS_NO_PATHCONV=1`.
- Never kill port **8092** (local site server). The marketing-shots harness leaks a `next dev` on **3210** holding ~4 GB.
