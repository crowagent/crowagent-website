# Design decisions — CrowAgent website

Agreed with the owner in session 2026-08-02. Everything here is **decided**, not proposed.
Design work happens in Figma first, is approved, and only then goes into `astro/`.

Figma file: `wJ9DK6ByFUN6rWe0CpCVPU` (Crow team).

---

## 1. Locked decisions

| Decision | Value | Notes |
|---|---|---|
| **Tagline** | `Qualify. Win. Get paid.` | Owner's own line, kept. |
| **Meaning of "Get paid"** | **Not** a finance product. It is the post-award half: hold the delivery promises you made, evidence them, and be paid under the contract. | Owner correction — I had wrongly read it as CrowCash. |
| **Products named** | **CrowMark only.** | Discontinued products must never appear. Verified: 0 references to CrowCash / CrowCyber / CrowESG / CSRD / Core across the Astro build. |
| **Text alignment** | **Centred**, sitewide. | Owner decision. Noted below as a live tension. |
| **Eyebrow** | **Gradient text inside an outlined capsule** (treatment 3 of 6). | Capsule gives shape once everything is centred; gradient resolves across the capsule width. |
| **Hero graphic** | **V6 — isometric strata.** | Three glowing planes: Qualify / Win / Get paid. |
| **Reserved graphic** | **V7 — signal flow.** | Kept for a "how the engine works" section further down. |
| **Hero build** | **V6, not V6.1.** | V6.1 applied the researched craft but pushed the plane saturation too far. The subtler planes win; the researched techniques still apply elsewhere. |
| **Market numbers** | **S3 — Proportional.** | Numerals with a bar beneath each showing relative scale. Final. |
| **Copy density** | **Hero ~28 words** above the fold, depth behind "Learn more". | Was ~45. Owner: less text, more visualisation. |

### Hero strata read top-to-bottom

Qualify → Win → Get paid, matching the headline directly above. The first build ran the sequence
upward, so the eye met "Get paid" first and the picture contradicted the tagline.

### No hedging labels on product graphics

A purpose-drawn graphic showing product capability needs no disclaimer — that is normal marketing
and every company does it. **One narrow exception stands:** the 40/30/20% award weightings on the
legacy homepage are labelled "Illustrative award criteria for this worked example", because a
source comment called them "the published weighting breakdown" while naming no authority, and the
section eyebrow says "Run the real engine". Specific figures presented as a real authority's
published criteria are a different thing from a product graphic.

---

## 2. Positioning

The owner rejected framings that were corporate, insurance-adjacent ("claims"), or that led with
UK-specific regulation. The brief: **disruptive, simple, immediately understood, and able to
survive new products and non-UK markets.**

Two findings that shaped this:

- **`Four claims. Three survive.` was already jurisdiction-free.** What capped the old hero at the
  UK was the *eyebrow* ("social value weighting 10%") and the supporting line — not the headline.
- **PPN 002 is a wedge, not an identity.** Leading with it caps the company at the UK and dates it
  to 2025. The durable asset is the mechanism: every figure traces to a recorded commitment, and
  the engine refuses what it cannot support. That travels to EU, US, AU procurement unchanged.

**Never claim win rates.** The competitive register to define against is AutogenAI's
"241% increase in success rates". The product's whole position is refusing that kind of claim.

---

## 3. Craft standard

Researched across 13 production sites (Linear, Vercel, Stripe, Raycast, Railway, Supabase,
Antigravity, Cursor, Warp, Liveblocks, Betterstack, Trigger.dev, Neon). The owner's verdict on the
first attempt — "looks poor, like a PowerPoint presentation" — was reached independently by that
research: **flat fills, uniform 1px borders, everything on one plane, no light.**

### The techniques that separate expensive from flat

| Technique | Values | Why |
|---|---|---|
| **Gradient border** | 1px, white 28–30% at top → 4–7% at bottom | A flat 1px border is the single strongest PowerPoint tell. |
| **Two-colour glow** | tight core 11.7px + wide halo 28.8px, different hues | One colour reads as a blur; two read as light. (Railway) |
| **Geometric shadow ladder** | 5–6 layers, blur = 0.8 × Y, Y ×~2 per step, alpha 5%→17% | The *ratio* is the fingerprint. Pick one and hold it. (Liveblocks) |
| **Raised surface = wash, never flat fill** | 5% white gradient over the card colour | Confirmed independently on Cursor, Linear and Clerk. |
| **Big numerals** | 162° white→#939DB8 ramp, far stop at ~110%, **0.5px white stroke**, drop-shadow 0 2px 2px rgba(0,0,0,.9) | Gradient-filled type reads lighter than solid; the stroke restores the weight. (Betterstack) |
| **Vignette** | radial in the **page colour**, not black, at **absolute px** (250×800) | Stays the same physical size at any viewport. (Betterstack) |
| **Dot grid** | 24px pitch, r=1, white 9%, radially masked | Gives the void a surface. (Railway) |
| **Specular top edge** | 1px, transparent → accent → transparent | Reads as light catching the panel edge. |
| **Backdrop blur** | always pair with `saturate(1.2–1.45)` | Blur desaturates; the boost puts colour back. (Cursor, Linear) |
| **Construction lines** | 12px grid in an **opaque** near-black, rails overshooting the section by 18px with a fade | The overshoot is the entire blueprint effect. (Trigger.dev) |

### The strategic finding

Of 13 sites, the heroes that read as expensive are **paintings, particle fields, photographs and
video**. The two that lead with product UI read as conventional — and those two are the ones an
independent reviewer judged most ordinary. This matches the standing note that product screenshots
on the public site are a credibility defect.

### Motion

- **Never scroll-jack.** NN/g found users read it as a bug. Scroll may drive elements already on
  screen; it must not take over the page.
- `animation-timeline` is ~84% supported and **still behind a flag in Firefox**. Wrap in
  `@supports`, ship the final state as the fallback, honour `prefers-reduced-motion` absolutely.
- **No entrance animation that hides content.** A staged reveal on the reasoning trace failed the
  axe gate with colour-contrast on 7 nodes, because the checker sampled mid-transition. The
  contrast failure was the symptom; the fault was making correct content depend on an observer.

### Colour carries meaning, not decoration

**teal = verified · violet/orchid = refused or flagged · cyan = interactive only.** Using all three
decoratively is the generic-AI-startup palette.

---

## 4. Licences — verified

**Safe:** Lucide (ISC) · IBM Plex, Inter, Geist (SIL OFL) · Carbon design tokens (Apache 2.0) ·
shadcn/ui, Magic UI, Motion, Observable Plot, D3 (MIT/ISC) · GSAP (free commercial since Apr 2025,
though a proprietary licence, not OSI).

**Do not use:** unDraw — its licence **explicitly prohibits AI/ML use**. Aceternity UI — no licence
statement found. Untitled UI — proprietary, no redistribution. Tailwind Plus — paid.

Figma Community files default to **CC BY 4.0 (attribution required)** — check each file.

---

## 5. Open, and owner-blocked

- **Composition tension.** Copy is centred; the hero graphic sits right with labels left. Research
  says regulated/technical B2B uses left-aligned split when there is a real artefact to show, and
  centring suits abstract visuals. The current hero is a compromise. Decide once — it sets the
  pattern for every section.
- **OA-05** — publish the AI credit numbers, or flip `CREDIT_ENFORCEMENT_MODE` to `enforce` first.
  Publishing a cap the platform does not enforce recreates OA-05 in the opposite direction.
- **`/cookie-preferences`** — analytics behind a consent banner, or rewrite `/cookies` to describe
  a site that sets none. The Astro build currently sets **zero** cookies and loads **zero**
  third-party origins, so it would launch with no analytics at all.

---

## 6. What is designed so far

| Page | Figma page | State |
|---|---|---|
| Hero | `Hero — FINAL (V6)` | **Chosen.** |
| Hero, researched craft | `Hero — V6.1 (researched craft)` | Alternative build. Planes more saturated — owner to compare. |
| Hero variants | `Hero graphics — variants` | V1–V8, incl. V7 reserved. |
| Eyebrow | `Decisions — eyebrow` | Treatment 3 chosen. |
| Market numbers | `Section — Market numbers` | **S3 Proportional chosen.** |
| Lifecycle (v1) | `Section — Lifecycle` | L1–L10 built, but **all ten carry the UK-public-only stage names** (`DISCOVER / ANSWER / SOCIAL VALUE / DELIVER`). Superseded — do not choose from these. |
| Lifecycle (v2) | `Section — Lifecycle v2 (market-neutral)` | M1–M4 built on `Find / Answer / Commit / Deliver`. **M5–M8 still to build.** |
| Reasoning trace | `Section — Reasoning trace` | R1–R8 for review. |

### Reasoning-trace variants (R1–R8)

Every one carries the same argument — four figures are claimed, three are traceable to a
recorded commitment, and `local supply chain spend` is refused — because that refusal *is* the
section. A variant that loses the dropped figure loses the point.

| | Structure |
|---|---|
| **R1** | Ledger — four rows, one struck through, `4 jobs × £27,000 = £108,000` |
| **R2** | Forensic log — timestamped monospace trace, refusal lit in orchid, dissolving into the page |
| **R3** | Five-step rail — retrieve · ground · compute · check · cite, with the drop hung under Ground |
| **R4** | The gate — four figures claimed on the left, three cross, one stops dead |
| **R5** | Signal flow — three sources into one engine, four figures out, one branch dashed |
| **R6** | Annotated document — the question itself, figures marked in the body, provenance in the margin |
| **R7** | Provenance tree — each figure hangs from its commitment; the fourth hangs from an empty socket |
| **R8** | The sum and the gap — £108,000 over four slots, the fourth a dashed hole rather than a card |

### Lifecycle v2, market-neutral (M1–M4 built, M5–M8 outstanding)

Stage names come from the OA-25 research and are **proposed, not locked** — the owner has not yet
ruled on them. The research rejected the earlier `Find / Answer / Prove / Deliver` hypothesis for a
structural reason worth keeping: *Prove* and *Evidence* mean "substantiate what is already true",
but stage 3 holds **forward priced promises** (PPN 002 social value, EU Art. 67/70, s.52 KPIs,
SLAs) — you cannot prove what you have not done yet. The attestation items (ISO 27001, SOC 2,
SIG/CAIQ, insurance, modern slavery) are reusable library answers and move into **Answer**, which
is what makes stage 3 coherent. *Evidence* would also collide with the post-award artefact name.

Proposed: **Find → Answer → Commit → Deliver**.
Known weakness, recorded rather than hidden: *Commit* is the blandest word on the page and it is
the stage that sells the product. Mitigation is to carry the specificity in the section heading and
body, not the tab. Fallback if rejected: `Qualify` (worse — collides with prequalification).

| | Structure |
|---|---|
| **M1** | Time bars — Deliver's bar starts exactly at the line other tools stop at |
| **M2** | Market matrix — the same four stages across UK public, EU/global public and private, Deliver lit |
| **M3** | Artefacts — the four documents the stages produce, each the input to the next |
| **M4** | Promise to proof — an arc carrying the Commit promise across the award line to Deliver |

**M2 is the one that argues the repositioning**, because it shows the stages are invariant and only
the paperwork changes. **M4 states the differentiator** most directly.

**Nothing here is in code yet.** `astro/` still runs the previous homepage. The Figma work is
design approval; implementation follows selection, and every implemented section must pass the
existing gates — sitewide (3 engines), heading structure, links, SEO parity, CSP.
