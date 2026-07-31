# Prompt — capture the 5 remaining CrowAgent product screenshots

Copy everything below the line into the other AI.

---

## Task

The CrowAgent marketing homepage (`crowagent-website`) shows a 12-frame product story across
three autoplay walkthroughs. **Seven frames are real product screenshots. Five are still CSS
illustrations**, and they must be replaced with genuine captures of the running product.

Your job is to make those five captures possible and take them.

## Why they are currently blocked — verified, not assumed

The screenshot harness works and is already written. The blocker is **staging data**, not tooling.

Measured on 2026-07-31:
- `crowmark_bid_answers` holds **0 rows**.
- Capturing `/crowmark/contracts/<id>/answers` produced a screen that renders **essentially
  empty** — the literal word "split" on a blank canvas.
- Capturing `/crowmark/contracts/<id>/sq` produced the classification gate with an **unset
  "Select…" dropdown**, not an answered questionnaire.
- Seeding `crowmark_bid_answers` directly has been attempted twice and did **not** make
  `/answers` render a draft.

So the real work is: **get a staging contract into a state where these screens have content**,
then capture.

## The five frames that need real captures

| # | Homepage frame | Step label | Product surface that would prove it |
|---|---|---|---|
| 1 | `#find` step 2 | "The fit score" | bid/no-bid fit panel with a scored posture and reasons |
| 2 | `#find` step 4 | "The questionnaire" | a Selection Questionnaire with **answered** questions from the master answer set |
| 3 | `#drafting` step 3 | "The draft" | the answers workspace with a **drafted answer** visible |
| 4 | `#drafting` step 4 | "The gate" | the figure-grounding / marking result showing a pass or a blocked approval |
| 5 | `#prove` step 1 | "The commitment" | a contract's committed social-value measures carried into delivery |

## Environment

- Platform repo: `crowagent-platform/web`
- Harness: `crowagent-platform/web/scripts/marketing-shots.mjs`
- Staging BFF service token already exists at `crowagent-platform/web/.env.marketing-shots`
  (gitignored — do not commit, print or echo it)
- Supabase **staging** project: `ipgrnwvfnumgvnxkpxsc`  (prod is `gujtuecjzfiqsdnzgyvo` — do not
  touch prod)
- Run a batch with: `node scripts/marketing-shots.mjs <batchNumber>` from `crowagent-platform/web`
- Output lands in the OS temp dir under `marketing_shots/`

Batches already defined that cover the surfaces above:
- **batch 5** — `disc-marking`, `disc-verification`, `disc-delivery`, `disc-social-value`, `disc-kpis`
- **batch 6** — `disc-answers`, `disc-questions`, `disc-sq`, `disc-evidence`, `disc-contracts`

Neither batch 5 nor the useful parts of batch 6 has ever produced a usable capture.

## Two operational traps that will cost you an hour each

1. **The harness leaks its dev server.** It boots `next dev` on port **3210** and does not shut
   it down. Left running it holds **~4 GB of RAM** and blocks the next run. Before and after
   every batch, check port 3210 and kill the owning process. On this machine a leaked one was
   found holding 3,927 MB.
2. **Do not kill the process on port 8092** — that is the marketing site's local server and is
   needed by other work.

## Definition of done for each capture — this is the important part

A capture is only acceptable if you **open the image and look at it**. Never accept a
screenshot on the basis of its filename or the fact the harness exited 0.

Reject a capture if it shows any of:
- an empty state, a blank panel, or a "no data yet" message
- an unset form control (e.g. a dropdown still reading "Select…")
- "Your session has expired" (means the BFF token was not picked up)
- placeholder or obviously fake names such as "Test Contract 1" or "Test Authority"

The staging tenant currently contains a contract named **"Reablement & Home Support Services"**
(£1,560,000, PPN 002, Riverford County Council) which reads as plausible. Prefer that one.

## Hard content constraints — a capture that breaks these cannot ship

The site is bound by these and they apply to anything visible inside a screenshot:
- Never imply a likelihood of winning. No win rate, no win probability, no odds. A fit score is
  coverage against your own record, never a prediction of award.
- Never assert Procurement Act compliance — the s.52/s.71 checks are advisory, never blocking.
- Never show buyer-side AI scoring. The evaluation panel scores; the AI never does.
- Never show live submission to a buyer portal.
- Never show a measured AI accuracy percentage.
- Never show the retired route `/crowmark/bid-editor`. The current answer workspace is
  `/crowmark/contracts/<id>/answers`.
- The names CrowCyber, CrowCash, CrowESG and CrowAgent Core must not appear anywhere.

## Deliverables

1. A short note on **what you changed in staging** to make each screen render content (which
   tables, which records) so it can be reproduced.
2. The capture PNGs, one per frame above, each confirmed by having actually viewed it.
3. For any frame you could **not** capture, say so plainly and state what specifically was
   missing. Do not substitute an illustration and do not ship an empty screen — an empty
   product screen on the homepage is worse than the drawing it replaced.
