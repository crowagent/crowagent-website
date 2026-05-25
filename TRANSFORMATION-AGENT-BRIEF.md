# CrowAgent Website — Transformation Agent Brief (2026-05-25)

**You are a top-1% front-end engineer** (Apple / Stripe / Google bar) on the CrowAgent
website. Your job: transform your assigned pages into genuinely top-1%, premium,
production-grade surfaces. **No compromise. No patching. Polish, merge, optimise — never
delete good work.** Read this brief fully before editing.

Companion docs (read them): `TRANSFORMATION-SPEC.md` (design system, archetypes, section
patterns), `AUDIT-LEDGER-2026-05-24.md` (tracked defects), `crowagent-website/CLAUDE.md` (hard rules).

---

## 0. NON-NEGOTIABLES (instant-reject if violated)
- **LOCAL-ONLY. NEVER push, PR, merge, or deploy. NEVER run git push.** Do NOT touch `vercel.json`.
- **Do NOT commit.** Leave your edits in the working tree — the orchestrator commits after pixel-verifying.
- **Edit ONLY your assigned files** (your HTML pages + your own new CSS module). See §5.
- **NEVER edit shared globals:** `styles.css`, `styles.min.css`, `styles.purged.css`,
  `sovereign-primitives.css`, `crowagent-brand-tokens.css*`, `Assets/css/page-archetype-unify.css`,
  `Assets/css/motion-system.css`, `Assets/css/nav-footer-sf21.css`, and any `js/nav-inject.js`,
  `js/cookie-banner.js`, `js/chatbot.js`, `js/modules/*`. If you believe a global change is
  required, WRITE IT DOWN in your final report (file + exact rule) — do NOT make it. The
  orchestrator serialises all global edits.
- **Your report WILL be independently pixel-verified.** Any "done/fixed" claim not backed by a
  screenshot you actually captured and inspected will be rejected. Do not over-claim.

## 1. HARD CONTENT LAWS
- **£ only** (never $). **No individual names** — reference only "CrowAgent Ltd, Companies House No. 17076461".
- **No fabricated customers, testimonials, logos, metrics, or dashboards.** Dynamic ≠ fake. The
  abstract SVG product mock diagrams are illustrative (fine); never present them as real customer data.
- **No em-dashes** in user-facing copy (use commas/semicolons/periods). **No AI-speak**
  (revolutionize, seamlessly, harness, unleash, cutting-edge, game-changing, elevate, supercharge).
- **Statute accuracy:** MEES Band C 2028 is **"proposed"** (never confirmed law); MEES fines **never > £150,000**;
  PPN 002 social-value floor is **10%** (never 5%); Cyber Essentials v3.3 (Danzell) in force 27 Apr 2026.
- Images: royalty-free only (default unsplash.com); every `<img>` needs `alt`.

## 2. THE PRODUCT NARRATIVE (apply consistently everywhere)
The site over-indexes on CrowAgent Core / MEES. **Rebalance to foreground the four products in
active enforcement windows, as a co-equal premium suite:**

| Tier | Product | One-line hook (statute-anchored) |
|---|---|---|
| **PUSH** | **CrowCyber** | Pass Cyber Essentials v3.3 (Danzell), in force 27 Apr 2026, in days not months. |
| **PUSH** | **CrowMark** | Win the 10% social-value score on every PPN 002 bid (mandatory since 1 Oct 2025). |
| **PUSH** | **CrowCash** | Recover late invoices automatically — statutory interest under SI 2002/1674 + £40/£70/£100 comp. |
| **PUSH** | **CrowESG** | GRI, TCFD, CSRD/ESRS, ISSB & UK SDR from one dataset (Q3 2026 waitlist; enforcement live now). |
| Support | CrowAgent Core | The MEES 2028 (proposed Band C) intelligence foundation — the platform anchor, not the headline. |
| Support | CSRD Checker | Free scope tool (Omnibus I) — the no-account funnel into CrowESG. |

Rules: the 4 PUSH products lead the story and get equal, rich treatment. Core = "foundation",
CSRD = "free entry tool" — present, credible, but **not** the dominant narrative. Keep every
product's existing real, statute-cited copy; rebalance prominence/order/visual weight, don't invent.

## 3. QUALITY RUBRIC (the benchmark — every assigned page must pass all 10)
1. **Layout:** one centred content column; consistent gutter; no left "step-drift" between hero & body;
   card grids balanced (3→3, 4→4, **5→4+1 centred**, 6→3×2); equal-height cards; CTA pinned bottom.
2. **Type:** fluid scale, **no px orphans on headings**; **sentence case (NO ALL-CAPS except eyebrows)**;
   prose measure ≤ ~720px; `text-wrap: balance` on headings.
3. **Colour/theme:** dark tokens only (`var(--teal)`, `var(--bg)`, `var(--cloud)`, `var(--surf)`…);
   **no hardcoded hex** in your new CSS; per-product accent hue consistent.
4. **Motion:** scroll reveals (subtle fade-up ≤500ms), card hover lift -2px, honest rotators/countdowns
   where they exist; **everything respects `prefers-reduced-motion: reduce`**; pause off-screen; zero jank/CLS.
5. **Messaging:** crisp, concrete, statute-cited; §1 + §2 obeyed.
6. **Trust/compliance:** citations accurate; sustainability + enforcement framing foregrounded.
7. **A11y:** WCAG 2.2 AA; **44×44px** min touch targets; `alt` on images; `:focus-visible`; semantic HTML.
8. **Responsive:** clean at **1280 AND 390** (also sane at 1440/768); no horizontal overflow; nav collapses ≤1024.
9. **No regression:** carousel / nav inject / footer inject / cookie banner still work; **content visible**
   (no `opacity:0` stuck); CSS braces balanced; page returns 200.
10. **Premium feel:** Apple restraint (one message per section, generous whitespace), Stripe specificity
    (cite the statute, animations that explain), Google rigor (8px grid, focus, reduced-motion).

## 4. PER-PAGE WORKFLOW (mandatory loop)
For EACH assigned page:
1. Read the current HTML + the CSS that styles it. Understand before changing.
2. Map sections to `TRANSFORMATION-SPEC.md` archetypes; rewrite/polish markup + add CSS to YOUR module.
3. **Screenshot at 1280 and 390** against `http://localhost:8092` (server is already running — do NOT kill it).
   Use Playwright (`node_modules/.bin`); save PNGs to `tests/_shots/` with a label prefixed by your stream id.
4. **READ your own PNGs.** Confirm the rubric visually. Iterate until it genuinely passes. Screenshots are truth.
5. Record in your final report: page → what changed → screenshot path → which rubric points you verified.

Playwright snippet (path-conversion safe on Windows — set `MSYS_NO_PATHCONV=1` if using bash):
```js
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
 for(const w of [1280,390]){const c=await b.newContext({viewport:{width:w,height:900},reducedMotion:'reduce'});
 const p=await c.newPage();await p.goto('http://localhost:8092/PAGE.html',{waitUntil:'networkidle'});
 await p.waitForTimeout(1200);await p.screenshot({path:`tests/_shots/STREAM-PAGE-${w}.png`,fullPage:true});await c.close();}
 await b.close();})();
```

## 5. FILE OWNERSHIP — see your dispatch message for your exact set.
Create ONE new CSS module for your stream (e.g. `Assets/css/transform-<stream>-2026-05-25.css`) and
`<link>` it LAST (after existing stylesheets, before `print.css`) in each of your owned HTML pages,
with `?v=20260525`. Put ALL your style overrides there. Do not edit any other stream's files or any global.

## 6. WHAT "DONE" MEANS
All assigned pages pass all 10 rubric points, verified by screenshots you inspected, with no regression,
no global-file edits, nothing committed/pushed, and a precise report the orchestrator can re-verify.
