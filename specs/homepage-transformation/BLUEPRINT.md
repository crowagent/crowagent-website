# Homepage Transformation Blueprint

Status: **authoritative for homepage work**. Written 2026-07-30 after repository-wide investigation
of `crowagent-platform` (specs registry, R2.6/R2.6.1 release docs, current type contracts, live UI
routes, git dates). Supersedes any homepage decision inferred from a single implementation file.

Why this exists: the previous homepage work was built from one file
(`web/app/api/crowmark/response/draft/route.ts`) and shipped a section that named a **retired
route**, illustrated the **wrong drafting flow**, and repeated the PPN 002 story the page already
told three times. That is what happens without this document.

---

## 1. What CrowMark actually is, as of R2.6.1 (shipped `fca6c51e`, 2026-07-29)

One product, two sides of a tender, four jobs. Everything below is `built` or `done` in
`crowagent-platform/specs/requirements.yaml` unless marked.

**Find** — live UK tender feed (Find a Tender, Contracts Finder, PCS-Scotland) matched to sector,
size and capability; deterministic 6-dimension bid/no-bid rubric; per-org fit score with reasons.

**Qualify** — company capability profile (accreditations, insurances, financial standing, policies,
case studies, named staff) held as *retrievable evidence*; regime-conditional SQ/PQQ with a reusable
master answer set, offered only above the PA2023 s.85 threshold; Central Digital Platform supplier
registration modelled, everything supplier-asserted and never self-marked "verified".

**Draft** — this is the part the homepage has been getting wrong. Current shape, from
`web/src/features/crowmark/response/types.ts` (the contract, last touched in the R2.6.1 release
commit):
- Grounding **prefers a hybrid retrieval pipeline**: query expansion → vector → lexical → reciprocal
  rank fusion → cross-encoder rerank → similarity floor → trace. Structure-aware chunking carries
  page and clause anchors.
- **Three citation buckets**, not one: the **regulatory corpus**, the **tender's own clauses**, and
  the org's **answer library**.
- The answer library is a **fallback**, and when it is used the response says so
  (`grounding_mode: 'own_library'`, `retrieval_degraded: true`). A visible degraded state replaced
  the old silent keyword fallback.
- The gate reports several dimensions: `figures_ok`, `word_count_ok`, `citation_ok`, plus
  `unconfirmed_figures`. `requires_approval` is hard-coded true.
- Newer capability the site has never mentioned: **win themes** entering every answer's prompt,
  **executive summary** generated only from drafted answers, **draft-critique-revise** scored against
  the tender's own criteria, **tone profiles**, **streaming**, and **bulk auto-fill** (async enqueue,
  202 + job id).
- Two flows feed **one** editor: the tender response flow, and the PPN 002 social-value bid-agent
  flow with its own deterministic rubric. The site previously showed only the second and called it
  "how drafting works".

**Prove** — evidence vault with deterministic claim-vs-evidence verdicts; advisory consistency checks
(Companies House, UKAS, Cyber Essentials); s.52 KPI publication and s.71 annual RAG roll-up; delivery
actuals against commitments; authority delivery report; report builder with scheduling; round-trip
export back into the buyer's own Word/Excel; board-quality print; branded proposal pack.

**Buyer side (Council Edition)** — requirement builder, advisory AI pre-read of supplier responses
(evidence quotes and narrative, **never a score**), delivery tracking, portfolio and transparency
reporting.

### Correct URL for any product illustration
`app.crowagent.ai/crowmark/contracts/<id>/answers` — the merged answer workspace.
**`/crowmark/bid-editor` is retired** and permanently redirects. Never show it again.

---

## 2. Hard content constraints (violating any of these is a defect, not a style choice)

1. **Never imply a likelihood of winning.** Win-probability framing was retired and is guard-tested
   against reintroduction. No "boost your win rate", no "odds", no score-as-prediction.
2. **Never assert Procurement Act compliance.** s.52/s.71 features are advisory, never blocking, and
   carry a not-legal-advice disclaimer.
3. **Never frame verification as fraud or lie detection.** Verdicts are consistent / discrepancy,
   investigate / could not verify.
4. **Never claim buyer-side AI scoring.** The Council pre-read never scores.
5. **Never claim live submission to a buyer portal.** No RFx issuance, no outbound POST. Say
   "portal-ready answer bundles".
6. **No benchmark claim without the data.** Only "vs your own contracts (n=N)".
7. **Do not say "Crown Commercial Service" as a current body** — superseded by the Government
   Commercial Agency on 1 April 2026.
8. **No measured AI accuracy number.** The F1 measurement and judge-panel CI gate are not closed.
9. **Diagrams are editable Mermaid source, not rendered images.** Do not show a polished diagram.
10. **CrowCyber, CrowCash and CrowESG are NOT retired in production.** The isolation work is paused
    and unshipped. Do not describe them as discontinued. CrowAgent Core *is* retired.
11. **Hybrid retrieval: confirm before claiming it is live.** `content_chunks` held zero rows on prod
    as of 2026-07-28, so the labelled fallback was serving live traffic. Describe the mechanism, not
    a live-state claim, until row counts are confirmed.
12. EU/TED discovery and CRDT co-editing are built but **gated off**. Not marketable.
13. PPN 002 threshold is always 10%. MEES fines never exceed £150,000.

---

## 3. Homepage purpose, audience, journey

**Purpose.** Convince a UK bid lead, in one scroll, that CrowMark does the whole tender job with
evidence they can defend to a buyer, and get them to request access.

**Primary audience.** Bid manager or director at a UK SME or mid-market supplier bidding public
sector, usually a team of one or two people alongside live delivery work.
**Secondary.** A council or authority buyer (Council Edition).

**The story, in four beats.** The hero states the outcome. Then:

1. **Find the work worth bidding** — the feed and the bid/no-bid call. The pain: missing notices,
   and wasting a fortnight on a bid you could not win.
2. **Answer it with your own evidence** — the drafting engine. The pain: a blank box, a 500-word
   limit, and a figure nobody can source. This is the beat the page has never told properly and it
   is the product's centre of gravity.
3. **Prove every number before a person signs it** — the gate, the three citation buckets, the
   evidence vault. The pain: signing an answer you cannot defend.
4. **Evidence delivery after award** — s.52/s.71, actuals against commitments. The pain: winning and
   then failing the transparency duty.

**Conversion goals.** Primary: request access. Secondary: the free PPN 002 calculator (a real,
no-account tool that proves competence). Tertiary: pricing, because published pricing is a genuine
differentiator against quote-on-request competitors.

---

## 4. Section order

Current order is hero → stats → journey → drafting → products → statute → integrations → showcase →
devices → trust → free tool → cta.

Target order and intent:

| # | Section | Job | Change needed |
|---|---|---|---|
| 1 | Hero | Outcome + one primary CTA | keep; "Qualify. Win. Get paid." is a settled owner decision |
| 2 | Proof strip | Four facts that survive scrutiny | keep |
| 3 | The journey | Name the three stages | keep |
| 4 | **Find** | The feed and the bid/no-bid call | **new** — beat 1 has no visual at all |
| 5 | **Draft** | How an answer is actually written | **rebuild** — currently wrong on three counts |
| 6 | **Prove** | Gate, citations, evidence | **new** — split out of the drafting section |
| 7 | Both sides | Supplier and buyer | keep, tighten |
| 8 | Traceability | Statute-cited outputs | keep |
| 9 | Integrations | Fits the stack you run | keep |
| 10 | Measured outcomes | The one real screenshot | keep |
| 11 | Trust | Evidence buyers expect | keep |
| 12 | Free tool | Low-friction proof | keep |
| 13 | CTA | Convert | keep |

Retire `#devices` as a standalone section: "works on any device" is table stakes for this buyer and
costs a full section. Fold the device shots into section 10 as supporting evidence. **Owner has
previously objected to section deletion, so this one is proposed, not assumed.**

---

## 5. Interaction model

- Autoplay walkthroughs advance on a fixed dwell, pause on hover and focus, expose a real
  play/pause control with an accurate status line, and gate on IntersectionObserver so nothing
  animates off-screen.
- `prefers-reduced-motion: reduce` shows every step at once and hides the transport.
- Tab lists contain only tabs (axe `aria-required-children`).
- Any simulated product chrome must show the **real current URL** and be labelled an illustration in
  visible copy and in the accessible name. Disclosure sits in our own caption voice, never inside the
  fake browser chrome as if the product were disclaiming itself.
- Real captures replace illustrations when the screenshot harness is unblocked; they do not sit
  beside them.

## 6. Design language

Dark-first. Colour only via tokens (`--nb-*` on the homepage). One accent per section. Body copy
left-aligned; only headers, standfirsts and captions centre. 44px minimum targets. No em-dashes in
user-facing copy. No AI-hype vocabulary. Type: display for headings, body for prose, mono for
product chrome and figures.

## 7. Definition of done

Not "the build passes". Done means: a bid lead scrolling the homepage can name what CrowMark does at
each of the four beats; every claim traces to a `built`/`done` requirement ID; no constraint in §2 is
violated; every product surface shown is a current route; and each new section has been **read as an
image**, not just measured.
