# Design decisions — CrowAgent website

Design work happens in Figma first, is approved, and only then goes into `astro/`.

Figma file: `wJ9DK6ByFUN6rWe0CpCVPU` (Crow team).

---

## 0. Correction, 2026-08-02 — what was actually approved

An earlier version of this file opened *"Agreed with the owner in session 2026-08-02. Everything
here is decided, not proposed."* **That was not true and it is corrected here.** Both session
transcripts (`719ab1a7`, `489c7340`) were searched message by message. The owner never named a
hero variant, a market-numbers variant, a lifecycle variant or a reasoning-trace variant. The
previous session recorded its own recommendations as locks.

**What the owner actually said, and it is all still binding:**

| On record | Instruction |
|---|---|
| Density | Less text, more visuals. Depth behind "Learn more". Inspiration: Stripe, Apple, antigravity.google, betterstack.com, mixpanel.com. |
| Graphics | Purpose-drawn graphics, never product screenshots. No hedging labels like "illustrative" on product graphics. |
| Volume | "I cant see you produced enough figma designs" — think innovative, 3D illusion; the homepage must be a master class of design. |
| Choosing | "v4 looks okay but i wanted to see more different styles, show me couple of more think creative" — **6–8 variants per section and per page**, decided from Figma renders. Never from a text or ASCII list of options. |
| Positioning | Cover UK public, UK private, EU and global private tenders; get away from the PPN-002-targeted framing. |
| Scope | **P0** — layout changes to non-homepage pages were never approved. Scope was: remove discontinued products, adjust accordingly. Original layouts stand. |

## 0b. METHOD — binding, added 2026-08-02

Owner, verbatim in substance:
> "You must not optimise things for quicker delivery. Instead craft each section of the home page
> and other pages with appropriate research and styles, motion, animation. Must be top 1% ultra
> premium like Apple, Google and Stripe. No compromise. Also you must not do the patching work,
> instead use Figma and design things with high quality and appropriately. No excuse and no
> exemption. Adopt the best way and method to show your craftsmanship and play the role of a Google
> and Apple UI and UX designer."

**This overrides speed in every case.** A section is not done because it renders without errors.

### The sequence, and no step may be skipped

1. **Research** the section: what it has to argue, how the best sites in the world solve that
   specific problem, what the alternatives are and why they lose.
2. **Design it in Figma**, 6–8 genuinely different structures, at full craft. Motion designed as
   keyframe sequences with timing, not left to implementation.
3. **Owner approves from renders.**
4. **Implement** the approved design faithfully, including its motion.
5. **Verify** by measurement and by eye: axe, no-JS, reduced-motion, 390 and 1440.

### What counts as patching, and is now forbidden

- Adding a CSS declaration to make a symptom go away without asking why the design produced it.
  `justify-content: center` on eight rows one at a time is the example that prompted this rule.
- Porting a legacy page and calling it designed.
- Shipping a section whose only visual idea is a bordered box with text in it.
- Treating "it passes the gates" as equivalent to "it is good".

### The standard to hold each section against

Every one of these must be true before a section is called done:

| | Test |
|---|---|
| **Argument** | The graphic makes the point. Cover the prose and the section still argues. |
| **Craft** | Gradient borders, two-colour light, a shadow ladder, a lit surface rather than a flat fill. No uniform 1px border, which is the strongest PowerPoint tell. |
| **Motion** | Something moves, and the movement *is* the argument. Timing and trigger designed, not improvised. |
| **Restraint** | Nothing decorative. Colour carries meaning; light carries atmosphere. |
| **Density** | Roughly 80–120 words for a major section, and no more. |
| **Robustness** | Correct with no JavaScript, correct under `prefers-reduced-motion`, correct at 390px. |

### Research is part of the work, not a preamble

Before designing a section, look at how Stripe, Apple, Linear, Vercel, betterstack.com and
antigravity.google solve that same problem, and write down what they do and why. The craft table in
section 3 of this file came from exactly that exercise across 13 production sites, and it is the
reason the site has a shadow ladder and a specular edge at all.

## 1. Decisions

**Decided by the owner:**

| Decision | Value | Notes |
|---|---|---|
| **Market narrative** | **Market-neutral, with UK public as the proof point.** | Owner decision, 2026-08-02. Settles OA-25. The mechanism leads: every figure traces to a recorded commitment. UK public keeps its specificity as the worked example rather than being the whole story. Governs copy on every page. |
| **Alignment** | **Centrally aligned, sitewide.** | Owner decision, 2026-08-02: every page "must be transformed for centrally aligned". **Scope matters:** the *head block* is centred (eyebrow, heading, standfirst). Slotted body content — cards, tables, matrix rows, prose, code — keeps its own internal alignment. A blanket centring rule is what produced the legacy defect of sixteen force-centred element types needing 138 per-element opt-outs across 24 pages. Implemented once in `components/layout/Section.astro`. |
| **Eyebrow** | **Gradient text inside an outlined capsule.** | Owner decision, 2026-08-02: "all the eyebrow must be gradient". `--grad-spectrum` clipped to the text, 1px `--c-border` outline, `--radius-pill`. Replaces the 56px `--grad-rule` bar, which was the left-aligned answer to the same problem and reads as a stray dash once the block is centred. `@supports`-gated so a browser without `background-clip: text` keeps a solid readable colour — an inherited `-webkit-text-fill-color` is what caused this site's invisible-text P0. |
| **Sweep scope** | Apply the two rules above by agent to every page **except** homepage, pricing and product pages. | Owner decision, 2026-08-02. Those three get full redesigns. Everywhere else is alignment and eyebrow only. **The 2026-08-01 P0 still stands underneath this:** layout changes to non-homepage pages were never approved, so the sweep changes presentation, never structure. |

**Proposed by me, awaiting a decision from renders — do not treat as settled:**

| Proposal | Value | Notes |
|---|---|---|
| **Tagline** | `Qualify. Win. Get paid.` | Owner's own line, kept. |
| **Meaning of "Get paid"** | **Not** a finance product. It is the post-award half: hold the delivery promises you made, evidence them, and be paid under the contract. | Owner correction — I had wrongly read it as CrowCash. |
| **Products named** | **CrowMark only.** | Discontinued products must never appear. Verified: 0 references to CrowCash / CrowCyber / CrowESG / CSRD / Core across the Astro build. |
| **Text alignment** | **Centred**, sitewide. | Owner decision. Noted below as a live tension. |
| **Eyebrow** | **Gradient text inside an outlined capsule** (treatment 3 of 6). | Capsule gives shape once everything is centred; gradient resolves across the capsule width. |
| **Hero graphic** | **None. Removed 2026-08-04.** | Was V6, isometric strata: three glowing planes labelled Qualify / Win / Get paid, carrying "2 gaps found before you bid", "82 fit score" and "4 commitments live". Owner instruction, reviewing the rebuilt homepage: "in hero section remove image of Qualify / 2 gaps found before you bid / Win / 82 fit score / Get paid / 4 commitments live". The hero is now type only. The headline, standfirst, both buttons and the closing gate note are unchanged. |
| **Reserved graphic** | **V7 — signal flow.** | Kept for a "how the engine works" section further down. |
| **Hero build** | **V6, not V6.1.** | V6.1 applied the researched craft but pushed the plane saturation too far. The subtler planes win; the researched techniques still apply elsewhere. |
| **Market numbers** | **S3 — Proportional.** | Numerals with a bar beneath each showing relative scale. Final. |
| **Copy density** | **Hero ~28 words** above the fold, depth behind "Learn more". | Was ~45. Owner: less text, more visualisation. |

### Hero strata read top-to-bottom — SUPERSEDED 2026-08-04, the graphic is gone

Kept as a record of why the sequence ran the way it did while the graphic existed: Qualify → Win →
Get paid, matching the headline directly above. The first build ran the sequence upward, so the eye
met "Get paid" first and the picture contradicted the tagline. The rule this states — a picture of a
sequence must read in the same direction as the sentence above it — outlives the graphic and applies
to the next one.

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

### A fourth mark: AT RISK — owner decision, 2026-08-03

The palette carried three meanings and no way to say *"this is not refused, but it is not safe
either"*. `#E8B84B` was already doing that job hardcoded in two files, which the design-system gate
flagged as debt precisely because the palette had no member for it. It now has one.

**The distinction that must not blur:** orchid means the engine **refused** something, a figure it
could not trace to a recorded commitment. The new mark means a figure or state that is **present and
valid but carries risk** — approaching a threshold, expiring, below a floor, needing attention.

A refusal is a decision the engine made. A risk is a fact about the reader's situation. If those
two blur, the refusal signal in the reasoning trace weakens, and that signal is the product's whole
position against competitors selling success-rate uplift.

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

| Page | Figma page | Page node | State |
|---|---|---|---|
| Hero | `Hero — FINAL (V6)` | `43:2` | **Chosen.** |
| Hero, researched craft | `Hero — V6.1 (researched craft)` | `49:2` | Alternative build. Planes more saturated — owner to compare. |
| Hero variants | `Hero graphics — variants` | `30:2` | V1–V8, incl. V7 reserved. |
| Eyebrow | `Decisions — eyebrow` | `25:2` | Treatment 3 chosen. |
| Market numbers | `Section — Market numbers` | `51:2` | **S3 Proportional chosen.** |
| Lifecycle (v1) | `Section — Lifecycle` | `56:2` | L1–L10 built, but **all ten carry the UK-public-only stage names** (`DISCOVER / ANSWER / SOCIAL VALUE / DELIVER`). Superseded — do not choose from these. |
| Lifecycle (v2) | `Section — Lifecycle v2 (market-neutral)` | `72:2` | M1–M4 built on `Find / Answer / Commit / Deliver`. **M5–M8 still to build.** |
| Reasoning trace | `Section — Reasoning trace` | `63:2` | R1–R8 for review. |

### Blog — designed 2026-08-02, awaiting a pick

| Set | Page | Frames |
|---|---|---|
| Blog index | `Page — Blog index` `164:2` | B1 Editorial ledger `164:3` · B2 Quiet grid `165:2` · B3 Feature and rail `165:54` · **B4 Index as register `169:2`** · B5 Stacked slabs with index numerals `173:2` · B6 12-column mosaic `177:2` |
| Blog article | `Page — Blog article` `183:2` | **A1 Dark hero to light reading pane `183:3`** · A2 Vercel model, right metadata rail `189:2` · A3 Sticky "In this article" rail `194:2` · A4 Full-width 16:9 hero bridging into the body `196:2` · A5 616 measure with a provenance margin `198:2` · A6 Register-continuous article `200:2` |
| Image assets | `Blog — image assets` `161:2` | One seeded photograph plus the provenance block |

**The photograph treatment is the load-bearing part**, and it is written on every frame as values
rather than left to interpretation, because the research finding was that full-colour stock
photography is the single thing that reads cheapest on a dark premium site. Linear solves it by
desaturating to near-monochrome rather than by avoiding photographs.

```
grayscale(0.85) contrast(1.08) brightness(0.86)
duotone wash 146deg: highlight #6E7CA8 26% top-left, shadow #0C1024 78% bottom-right
page-colour floor #050710 at 22%
1px gradient hairline, white 30% → 5%; 1px specular top edge
type scrim #050710, 0% → 62% at 45% → 94%, over the lower 220px
net: roughly 15% of original chroma survives
```

Three things the designer flagged and I am carrying forward rather than burying:

1. **Two of the eight heroes are not photographs** — `frameworks-and-dps-explained` and
   `find-first-public-sector-contract` are generated brand artwork, and the treatment is
   deliberately not applied to them.
2. **B4/B5/B6 hold category labels at DIM**, where B1–B3 tint them teal, violet and pink. The
   palette rule reserves those hues for verified and refused; a category is neither. The later
   variants follow the rule, the earlier three do not. Pick knowingly.
3. **B4 sorts strictly by date and therefore does not lead with the flagship post.** A register
   that hand-picks its lead is not a register. Stated on the frame as a decision.

**Motion is outstanding for all twelve variants.** Section 0b requires keyframe sequences with
timing, and only two behaviours are annotated statically. These are not method-complete.

### Node IDs — record these, never re-derive them

A session was lost re-finding these. The Figma MCP's "list pages" call reports only the *desktop
app's* open file, so with no file open it returns a single empty `Page 1` and looks like the work
is gone. It is not. Enumerate with `use_figma` running
`figma.root.children.map(p => ({id: p.id, name: p.name}))`, or use the table below.

Deep link pattern: `https://www.figma.com/design/wJ9DK6ByFUN6rWe0CpCVPU/?node-id=<id with ':' → '-'>`

| Variant | Node | Variant | Node |
|---|---|---|---|
| Hero — FINAL | `43:3` | R1 Ledger | `63:3` |
| S1 Numeral row | `51:3` | R2 Forensic log | `64:2` |
| S2 Editorial bands | `51:19` | R3 Five-step rail | `65:2` |
| **S3 Proportional** ✅ | `51:36` | R4 The gate | `65:32` |
| S4 Elevated cards | `52:2` | R5 Signal flow | `67:2` |
| S5 Orbital | `52:23` | R6 Annotated document | `67:39` |
| S6 Inline editorial | `52:42` | R7 Provenance tree | `68:2` |
| M1 Time bars | `72:3` | R8 The sum and the gap | `68:31` |
| M2 Market matrix | `73:2` | | |
| M3 Artefacts | `74:2` | | |
| M4 Promise to proof | `74:48` | | |

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
