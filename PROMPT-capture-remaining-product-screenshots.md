# Prompt — capture the 5 remaining CrowAgent product screenshots

Copy everything below the line into the other AI. It is self-contained.

Rewritten 2026-07-31 against the live staging schema. An earlier version of this brief led to a
plan that guessed six table names that do not exist; those guesses are corrected below.

---

## Task

The CrowAgent marketing homepage (`crowagent-website`) tells a 12-frame product story across three
autoplay walkthroughs. **Seven frames are real product screenshots. Five are still CSS
illustrations.** Replace the five with genuine captures of the running product.

Every illustration is temporary technical debt. Only keep one if you have positively verified that
no truthful product representation is currently possible — and if you conclude that, say so
plainly rather than substituting something.

## The five frames

Panel IDs are in `index.html`. The other seven panels already hold a real `<img>`; these five hold
drawn markup instead.

| Panel | Step label | What the capture must actually show |
|---|---|---|
| `fdP2` | 2 · The fit score — "The reasons sit beside the number." | The bid/no-bid fit panel with a score **and its reasons visible next to it** |
| `fdP4` | 4 · The questionnaire — "Answered from your master answer set." | A Selection Questionnaire with **answered** questions, not an empty form |
| `ddP3` | 3 · The draft — "Your win themes, then critiqued and revised." | The answers workspace with a **drafted answer** and its critique |
| `ddP4` | 4 · The gate — "Figures, words and citations, then a person." | The gate result: figure/citation checks, and that **a person approves, not the model** |
| `pvP1` | 1 · The commitment — "What the bid promised stays attached." | A contract's **committed social-value measures** carried into delivery |

## START HERE — do not seed anything yet

The previous framing was "staging is empty". That is wrong. Measured on staging
(`ipgrnwvfnumgvnxkpxsc`) on 2026-07-31:

```
crowmark_opportunities   277 rows
crowmark_measures         80 rows
crowmark_evidence         51 rows
crowmark_contracts        18 rows
crowmark_sv_profiles       1 row
```

**`pvP1` (the commitment) reads from `crowmark_measures`, which already has 80 rows. It may never
have been blocked at all.** Capture it first, before writing a single row anywhere.

Then check each of the other four surfaces and record what actually renders. Seed only what is
genuinely missing.

## Why the earlier seeding attempts failed — the important part

`crowmark_bid_answers` holds 0 rows. Direct seeding was attempted **twice** and `/answers` still
rendered empty afterwards.

**The likely cause: every `crowmark_*` table carries `organisation_id` and is RLS-scoped, and the
attempts omitted it.** A row written without `organisation_id` is invisible to the application —
which is exactly the symptom observed: the insert appears to succeed, the screen stays empty.

So: set `organisation_id` to the org that owns the target contract on every insert, and **confirm
by reading the record back through the application, never through SQL.** SQL will happily show you
a row the app cannot see.

## Verified table map — the obvious guesses are all wrong

These do **not** exist: `crowmark_answer_sets`, `crowmark_answers`, `crowmark_questions`,
`crowmark_drafts`, `crowmark_markings`, `crowmark_social_values`.

| Frame | Table | Key columns |
|---|---|---|
| `fdP2` fit score | **`crowmark_bid_decisions`** | `fit_score`, `recommended_band`, `confidence`, `confidence_reason`, `blockers`, `assessment`, `rationale` |
| `fdP4` questionnaire | **`crowmark_sq_responses`** | `part` (smallint), `question_key`, `answer`, `capability_ids` |
| `ddP3` the draft | **`crowmark_bid_drafts`** | `draft_text`, `citations`, `rubric`, `critique`, `word_count` |
| `ddP4` the gate | **`crowmark_bid_drafts`** — same table | `gate_passed`, `gate_reasons`, `requires_confirmation`, `confirmed`, `confirmed_by` |
| `pvP1` the commitment | **`crowmark_measures`**, `crowmark_sv_profiles` | already populated — try capturing first |

Note `fit_score` is on `crowmark_bid_decisions`, **not** on `crowmark_bid_answers`. And there is no
separate "markings" table; gating lives on the draft row.

Every table above also has: `id`, `organisation_id`, `contract_id`, timestamps.

## Authentication — a trap worth calling out

`crowagent-platform/web/.env.marketing-shots` holds a **BFF service token**. That authenticates to
the application's BFF. It is **not** a Supabase key and will not work as `apikey` /
`Authorization: Bearer` against `…/rest/v1/…` — that returns 401 before anything is written. Use
the proper Supabase credential for direct DB work, or drive the app itself.

Do not commit, print, or echo the token.

## Environment

- Platform repo: `crowagent-platform/web`
- Harness: `crowagent-platform/web/scripts/marketing-shots.mjs` — run `node scripts/marketing-shots.mjs <batch>`
- Batch 5: `disc-marking`, `disc-verification`, `disc-delivery`, `disc-social-value`, `disc-kpis`
- Batch 6: `disc-answers`, `disc-questions`, `disc-sq`, `disc-evidence`, `disc-contracts`
- Output lands in the OS temp dir under `marketing_shots/`
- Supabase **staging** `ipgrnwvfnumgvnxkpxsc`. **Prod is `gujtuecjzfiqsdnzgyvo` — do not touch it.**
- Prefer the existing staging contract **"Reablement & Home Support Services"** (£1,560,000,
  PPN 002, Riverford County Council). It reads as plausible; test fixtures do not.

### Two operational traps that cost an hour each

1. **The harness leaks its dev server.** It boots `next dev` on port **3210** and never shuts it
   down. A leaked one was found holding **3,927 MB**. Kill it before and after every batch.
2. **Never kill the process on port 8092** — that is the marketing site's local server, needed by
   other work.

## Where the files go, and in what format

Not a `screenshots/` folder. Captures live in **`crowagent-website/Assets/shots/dark/`** as a
**three-format set** — `.avif`, `.webp` and `.png` of the same image, referenced from a `<picture>`
with the PNG as the `<img>` fallback.

Match the existing captures: roughly **2360–2480 px wide** (2× density), e.g.
`mark-tender-questions.png` is 2464×1168, `mark-answer-library.png` 2360×1180. The `<img>` tag's
`width`/`height` must equal the real pixel dimensions — a mismatch makes the CSS box crop the
image, which is exactly how the hero shipped with a chart sliced in half.

**Crop so the frame ends on complete objects.** No half-drawn panel, no clipped axis label, no
sentence cut mid-line.

## Hard content constraints — a capture that breaks these cannot ship

- Never imply a likelihood of winning. No win rate, no win probability, no odds. A fit score is
  coverage against your own record, never a prediction of award.
- Never assert Procurement Act compliance — the s.52/s.71 checks are advisory, never blocking.
- Never show buyer-side AI scoring. The evaluation panel scores; the AI never does.
- Never show live submission to a buyer portal.
- Never show a measured AI accuracy percentage.
- Never show the retired route `/crowmark/bid-editor`. The current workspace is
  `/crowmark/contracts/<id>/answers`.
- The names **CrowCyber, CrowCash, CrowESG and CrowAgent Core must not appear anywhere.**
- **Do not invent numbers.** Any seeded figure appears on a public marketing page and must be
  defensible. "Matches 4 of 5 required criteria" beside a score of 78 is fabricated content, not a
  screenshot.

## Definition of done — the part that gets skipped

**A capture counts only once you have opened the image and looked at it.** Never accept one because
the filename is right or the harness exited 0.

Automated checks cannot substitute for this. You cannot string-match text inside a PNG, and a
file-size threshold does not detect an empty state — the known bad capture is a large dark PNG
showing the single word "split" on a blank canvas, and it passes every byte-level check.

Reject a capture showing any of:
- an empty state, a blank panel, or "no data yet"
- an unset control, e.g. a dropdown still reading "Select…"
- "Your session has expired" (the BFF token was not picked up)
- placeholder names such as "Test Contract 1" or "Test Authority"

## Deliverables

1. **What you changed in staging**, per frame — which tables, which records, which
   `organisation_id` — so it is reproducible.
2. The capture files, as avif + webp + png triplets at the sizes above, each confirmed by having
   actually viewed it.
3. For any frame you **could not** capture: say so plainly and state exactly what was missing.
   Do not substitute an illustration and do not ship an empty screen. **An empty product screen on
   the homepage is worse than the drawing it replaced.**
