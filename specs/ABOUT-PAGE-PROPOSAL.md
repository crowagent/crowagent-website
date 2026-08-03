# /about — proposed correction

**Status: PROPOSAL. Nothing built yet. Awaiting owner approval.**
Written 2026-08-03 after a full audit of the current page against `46b6af55:about.html`
(the pre-26-July version the owner said they liked) and the recorded decisions.

Owner brief: *"this has so much repeated content and couple of facts we need to
correct… i liked the design and style what we had prior to 26th July and i am
thinking to similar way with updated content… it is not complete redesign but
couple of things needs correction and adjustment and enterprise level of
animation and style like we had earlier."*

**Not a redesign.** The section order and the page's argument stay. What changes
is how many times it makes each point, two claims that overreach, and the
structural richness that was lost in the port.

---

## Owner decisions taken 2026-08-03 — these are the owner's, not proposals

| Question | Decision |
|---|---|
| Is the bidding record from 2010 or 2021? | **2010 is correct.** Keep it, but state it ONCE, in the body, as a fact — never in a headline. |
| How to frame who built it | **"Built by an engineering team, with the advice of people who have written and won public sector bids."** Engineering first as the builder, bidding as the advice. |
| Animation | **Free structural wins first, CSS only.** No JavaScript, no charter change. |
| Data residency | **"UK and EU" is correct.** Keep as written. |

The framing decision matters because of a recorded trap: the page promises
suppliers can bid *"without paying a bid-writing consultancy"*. Naming ourselves
anywhere near "consulting" contradicts our own pitch, so the word does not
appear about us. The advisers' background is described as **writing and winning
public sector bids**, which says the same thing without the collision.

---

## 1. The repetition — what gets cut

The audit found 11 repetition clusters. Roughly **60% of the body prose is two
claims restated**: "we cite everything" and "s.52/s.71 exist".

| What | Today | Proposed | How |
|---|---|---|---|
| The citation promise | **8 times** | **1** | Stated once, in `#how`, with the artefact that shows it. Every later mention becomes a reference to it, not a restatement. |
| s.52 / s.71 duties | **6 times** | **1** | One "the rules we build against" block carrying s.52, s.71 and PPN 002 together. The role sections point at it. |
| The 2010 record | **2 times, in full** | **1** | Kept in the timeline only, as a dated fact. |
| "built by bid practitioners" | **3 times** + a section id | **0** | Replaced by the approved framing, said once. |
| Mission vs Vision | 2 renderings of one sentence | **1** | Vision keeps the market statement; Mission becomes what we refuse to do, which is the actual differentiator. |
| Role chip + eyebrow | Every role phrase printed **twice** on screen | **1** | The chip is the nav; the section drops its duplicate eyebrow. |
| Company number | **3 times** | **1** | Company details card only. |
| Residency | **3 times** | **1** | Trust strip only. |
| "twelve months" | **3 times** | **1** | In the duties block. |

**One of these is a recorded decision and needs explicit reversal, not a fix.**
The file header at `about.astro:26-28` says the 2010 record appears twice *on
purpose*. That reasoning was about keeping the "not a result this software
produced" disclaimer attached to both mentions. Cutting to one mention keeps the
disclaimer — it just stops saying it twice.

---

## 2. The facts — what gets corrected

| Ref | Claim | Action |
|---|---|---|
| **F1** | "since 2010" | **Owner confirms 2010.** Keep, once, in the timeline body. Never in an h1 or standfirst. |
| **F3** | "multi-million pound contracts… written, won and delivered" | **Soften.** The page's own rule says no customer, client or project is named or implied — so the biggest claim on the page currently has the least evidence. Reframe to describe the *kind* of work, not its scale, unless you want to stand behind the figure. |
| **F4** | "The founders" (plural), "Founding team experience" | **Check.** No person is named anywhere on the page and there is no `Person` schema. Either name them or use a form that does not assert a headcount. |
| **F5** | "inside regulated industries" | **Cut.** Unsourced sector claim; nothing on the site says which. |
| **F8** | "UK and EU" residency | **Owner confirms correct.** Keep. |
| **F12** | "CrowAgent Ltd is a **UK company**" | **Fix — this is OA-33, still open.** It scopes the product to one market, which contradicts the market-neutral decision of 2026-08-02. The meta description was corrected for exactly this on 2026-08-02 and the standfirst below it was left saying it. |
| **F2/F7** | 2010–2025 range, then Jan–Feb 2026, then founded March 2026 | **Close the gap.** The timeline leaves the rest of 2025 unaccounted for and dates research before incorporation without saying it is pre-incorporation work. |

---

## 3. The structure and style — restoring what the port dropped

All of the following is **CSS only**, per the owner's decision. No JavaScript, no
charter change, no payload cost.

| # | Restore | What it was |
|---|---|---|
| 1 | **The white Values band** | Legacy put Mission/Vision/Values on a full-bleed white section with hairline borders. Every section on the current page is dark, so the page has no tonal rhythm. This is the single biggest "it felt richer before" item. |
| 2 | **Gradient section dividers** | Four `transparent → white 10% → transparent` hairlines between sections. Today sections butt together. |
| 3 | **Sticky company card beside a railed timeline** | Legacy was two columns: timeline left with a real vertical rail and dots on it, company details right in a sticky card. Today they are two stacked full-width sections. |
| 4 | **Film grain overlay** | One element over the page. The site already has `--grain` as a token, so this costs nothing new. |
| 5 | **Hover lift and arrow slide** | Cards lifted on hover; the `→` slid away from its label. Pure CSS, and the site's existing `--lift-card` token already carries the distance. |
| 6 | **Hero eyebrow as a capsule with a live dot** | Legacy had a badge with a pulsing dot. The capsule is already the sitewide eyebrow treatment; this adds the dot. |

### Deliberately NOT restored in this pass

The kinetic hero, scroll-reveal on every card, magnetic buttons, cursor-tracking
card glow and 3D tilt all came from a GSAP orchestrator
(`js/modules/compiled/sovereign-transformation-v2.js`, plus GSAP and
ScrollTrigger). The Astro build ships **0 KB of JavaScript** as a charter
property, and the owner's decision for this pass is CSS only.

Recorded so it is a decision rather than an omission: those effects are
available whenever the owner wants them, and the cost is one shared motion
module plus an ADR, not a page-local script.

---

## 4. Proposed section order

Unchanged from today except where marked. This is deliberately close to what
ships, because the brief was correction rather than redesign.

| # | Section | Change |
|---|---|---|
| 1 | Hero | Standfirst reframed: drops "UK company" (OA-33) and "built by bid practitioners". Eyebrow gains the live dot. |
| 2 | The four roles | Kept. Duplicate eyebrows removed; each role points at the duties block instead of restating s.52/s.71. |
| 3 | **How it works** | The citation promise, stated **once**, with the artefact. Absorbs the eight scattered mentions. |
| 4 | **The rules we build against** | s.52, s.71, PPN 002 in one block. Absorbs the six scattered mentions. |
| 5 | Principles | On a **white band**. Mission becomes the refusal; Vision keeps the market statement; the duplicate sentence goes. |
| 6 | Timeline + company | **Two columns**, railed timeline with a sticky company card. Carries the 2010 fact, once. |
| 7 | Who builds it | The approved framing, said once. Replaces the `#practitioners` section, whose id itself encoded the claim. |
| 8 | Trust | Kept. Residency and ICO stated once each. |
| 9 | Close | Kept. |

Net effect: **9 sections instead of 10**, and roughly a third less body prose,
with nothing removed that the page actually argues.

---

## 5. The alignment defect this page shares with 18 others

Measured across all 43 routes at 1440: **39 of 43 h1s are dead centre**. The
heading is not the problem. The defect is a content column carrying a
`max-width` **without `margin-inline: auto`**, which pins it to the left gutter
and leaves 200–430px of dead space on the right.

`/about/` has it at `.tl__body` (−183px). The worst cases are the four legal
pages, where `.legal__title` is a hand-copy of `h1.section__title` that dropped
its `margin-inline: auto` — so the h1 sits 61px left while the body sits 156px
right, **217px apart on the same screen**.

This is a sitewide fix and a gate, not an About fix. It is proposed separately.
