# Review of the external AI's screenshot-capture plan

Verified against the live **staging** schema (`ipgrnwvfnumgvnxkpxsc`) on 2026-07-31.

**Verdict: do not run it as written.** The direction is right — seed staging, then capture — but
the plan writes to tables that do not exist, writes columns to the wrong table, and its safety
checks cannot do what they claim. Below is what is wrong, and the corrected target list, which is
the genuinely useful output of this review.

---

## 1. Six of the eight tables it writes to do not exist

Measured, `SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'crowmark%'`:

| Table in the plan | Reality |
|---|---|
| `crowmark_contracts` | ✅ exists — **18 rows** |
| `crowmark_bid_answers` | ✅ exists — 0 rows |
| `crowmark_answer_sets` | ❌ does not exist |
| `crowmark_answers` | ❌ does not exist |
| `crowmark_questions` | ❌ does not exist |
| `crowmark_drafts` | ❌ does not exist — real name is **`crowmark_bid_drafts`** |
| `crowmark_markings` | ❌ does not exist — gating lives on `crowmark_bid_drafts` |
| `crowmark_social_values` | ❌ does not exist — real names are **`crowmark_measures`** / **`crowmark_sv_profiles`** |

The script would fail on its second write.

## 2. It writes `fit_score` to the wrong table

`fit_score` is **not** a column on `crowmark_bid_answers`. That table is
`(id, organisation_id, contract_id, question_key, answer_text, citations, validation_status,
validation_errors, word_count, updated_by, created_at, updated_at, question_id)`.

`fit_score` lives on **`crowmark_bid_decisions`**, alongside `recommended_band`, `confidence`,
`confidence_reason`, `blockers`, `assessment`. So even the one table the plan got right receives
columns that do not exist on it.

## 3. This is very likely why the two earlier seeding attempts failed

**Every one of these tables carries `organisation_id`, and the plan never sets it.** The rows are
org-scoped and RLS-protected. An insert that omits `organisation_id` either violates NOT NULL or
lands invisible to the application — which is exactly the observed symptom: rows appear to be
written, and `/answers` still renders empty.

Anyone retrying this must set `organisation_id` to the staging org that owns the target contract,
and must confirm afterwards by reading the row **back through the app**, not through SQL.

## 4. The BFF token is not a PostgREST credential

The plan sends the BFF service token as both `apikey` and `Authorization: Bearer` against
`${API_URL}/rest/v1/…`. Those are different auth systems. The BFF token authenticates to the
application's BFF; PostgREST wants a Supabase key. As written this returns 401 before any row is
written.

## 5. The image validation cannot detect what it claims

- Step D says it will "load the PNG via `read_file` and check it does not contain 'Select…',
  'Test Contract'…". **You cannot string-match text inside a PNG.** Those strings are rendered
  pixels. This check is not weak, it is impossible.
- `isValidImage()` accepts "PNG magic bytes + size > 50 KB". The actual failing capture from
  batch 6 — the word "split" on a blank canvas — is a large dark PNG and passes this check
  comfortably. It screens out corruption, not emptiness, which is the only failure mode that
  matters here.
- There is also a literal bug: the magic-byte array ends `0x0aa` (= 170), not `0x0a`. `.equals()`
  therefore returns **false for every valid PNG**, so the helper would reject all captures.

## 6. Two runtime bugs

- `const answerSetId = …` is reassigned three lines later → `TypeError: Assignment to constant`.
- `crowmark_contracts` is queried by `name=eq.…`; confirm the column is `name` before relying on
  it.

## 7. Content and destination problems

- `fit_score: 78` with `fit_reason: "Matches 4 of 5 required criteria"` is **invented content
  headed for a public marketing page.** Seeded numbers have to be defensible. A fit score is
  coverage against your own record; it must never read as a likelihood of award.
- Captures go to `Assets/shots/dark/` as an **avif + webp + png triplet**, not to
  `crowagent-website/screenshots/`. That folder is not how this site serves images.

---

## Corrected target list — use this instead

| # | Homepage frame | Correct table(s) | Notes |
|---|---|---|---|
| 1 | `#find` step 2 — the fit score | `crowmark_bid_decisions` | `fit_score`, `recommended_band`, `confidence`, `confidence_reason`, `blockers`, `assessment` |
| 2 | `#find` step 4 — the questionnaire | `crowmark_sq_responses` | `part` (smallint), `question_key`, `answer`, `capability_ids` |
| 3 | `#drafting` step 3 — the draft | `crowmark_bid_drafts` | `draft_text`, `citations`, `rubric`, `critique` |
| 4 | `#drafting` step 4 — the gate | `crowmark_bid_drafts` | **same table** — `gate_passed`, `gate_reasons`, `requires_confirmation`. There is no separate markings table. |
| 5 | `#prove` step 1 — the commitment | `crowmark_measures`, `crowmark_sv_profiles` | ⚠️ **`crowmark_measures` already holds 80 rows and `crowmark_sv_profiles` 1.** This frame may not be blocked at all — try capturing it before seeding anything. |

Staging also already holds **277 `crowmark_opportunities`**, **51 `crowmark_evidence`** and
**18 `crowmark_contracts`**. Considerably more of the product is populated than the "everything is
empty" framing suggests. Check what renders before writing a single row.

Every insert must carry `organisation_id`, and every capture must be **looked at** before it is
accepted — never approved on the basis of a filename or an exit code.
