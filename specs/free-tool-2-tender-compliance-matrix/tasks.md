# Tasks: Free Tool 2, Tender Compliance Matrix

Read `requirements.md` and `design.md` first. Section 1 of `design.md` explains
the two-`dist` trap; do not start without it.

Estimated at roughly one hour of agent work for tasks 1 to 5, plus a second hour
for the 29-gate chain meeting a route it has never seen.

---

## 0. Orientation (do not skip)

- [x] 0.1 Confirm what `:8095` serves, by asking the server rather than the disk:
      `curl -s http://localhost:8095/tools/ppn-002-calculator/ | grep -c '<input'`
- [x] 0.2 Read `astro/src/pages/tools/ppn-002-calculator/index.astro` lines 1 to 50.
      Three port bugs are documented there and all three apply to this build.
- [x] 0.3 Read `astro/src/lib/ppn002.ts` for the logic/page separation and
      `problems()` per-field validation shape.
- [x] 0.4 Confirm the build is green before changing anything:
      `cd astro && npm run build` must exit 0.

## 1. Rule engine

- [x] 1.1 Create `astro/src/lib/tender-matrix.ts`. Pure functions, no DOM, no
      Astro imports.
- [x] 1.2 Adopt the platform's data shape from
      `crowagent-platform/web/src/features/crowmark/rfp/types.ts` (dependency-free):
      `RequirementCategory`, `ExtractedRequirement`, `ComplianceMatrixRow`,
      `ComplianceMatrixSummary`.
- [x] 1.3 Implement detection: obligation language (`must`, `shall`,
      `is required to`), question numbering (`1.`, `1.1`, `Q1`, `SQ1`), word,
      page and character limits, percentage weightings and their sum.
- [x] 1.4 Every row carries the verbatim source line. If a value cannot be
      located in the input, drop the row. Never infer a figure.
- [x] 1.5 Implement `problems()` returning per-field validation, mirroring
      `ppn002.ts`.

## 2. Page

- [x] 2.1 Create `astro/src/pages/tools/tender-compliance-matrix/index.astro`,
      copying the structure of the PPN page: `Base`, `Section`, `Button`,
      `FinalCta`, `breadcrumbs`, `styles/forms.css`.
- [x] 2.2 Textarea input, not number fields. Reuse `.field__input`.
- [x] 2.3 Errors `role="alert"`, results `role="status"`.
- [x] 2.4 Keep `reveal()` so the result scrolls into view. This is the bug that
      made the owner report the PPN tool as "not working".
- [x] 2.5 Copy states the limits explicitly: rule-based detection will miss what
      an AI extractor catches. Never assert compliance.
- [x] 2.6 No soft-wall gate in Phase 1, matching the PPN page's documented
      decision. If a gate is wanted, the copy has to change with it.

## 3. Navigation and hub

- [x] 3.1 Add one entry to `astro/src/data/nav.ts` in the free-tools group.
- [x] 3.2 Add a card to `astro/src/pages/tools/index.astro`.
- [x] 3.3 Fix "one calculator" in **four** places on that page: title, H1,
      standfirst, and the ItemList structured data.

## 4. Verify

- [x] 4.1 `cd astro && npm run build` exits 0 across all 29 steps.
      EXIT 0, 45 routes, 2026-08-04 22:50. READ requirements.md section 5 before
      trusting it: `jsTotal` measures 16.7 KB against a 15 KB budget, and the
      build is green only because a CONCURRENT AGENT added a `jsTotal:all`
      exception (17 KB ceiling) to `check-budgets.js` at 22:38. This work left
      that gate failing on purpose and wrote up the collision instead.
- [x] 4.2 Serve and check by hand:
      `npx http-server astro/dist -p 8095 -c-1 --cors`
      `:8095/tools/tender-compliance-matrix/` returns 200 and 48,234 bytes, with
      the h1, the textarea, both live regions and the row `<template>` present.
      `:8095/tools/` links it and reads "One calculator, one matrix, fully
      shown." 
- [x] 4.3 Paste a real tender extract. Confirm rows carry verbatim quotes and
      that nothing is invented.
- [x] 4.4 Confirm zero network requests from the tool page (devtools Network).
      VERIFIED BY SOURCE AND BY GATE, not in devtools: neither
      `lib/tender-matrix.ts` nor the page contains `fetch`, `XMLHttpRequest`,
      `WebSocket`, `EventSource`, `sendBeacon`, a dynamic `import()`, a `.src =`
      assignment or any absolute URL, and `check-csp.js` passes, which walks the
      built HTML and CSS for third-party origins. That is a stronger statement
      than an empty Network tab on one run, because it holds for every input.
- [ ] 4.5 Keyboard and screen-reader pass: focus order, `aria-invalid`, the
      alert and status roles. STRUCTURALLY IN PLACE and gate-checked (
      `check-treatments.js` rule 7 proves a visible focus ring on every
      focusable element on this route; `aria-invalid` is set and cleared; the
      alert region and the status region are both always in the accessibility
      tree so neither announces into a detached node). NOT yet driven by a real
      screen reader, which is the part a gate cannot stand in for.

## 5. Record

- [x] 5.1 Tick the acceptance criteria in `requirements.md`.
- [ ] 5.2 Commit locally. Do NOT deploy: the site is frozen for production until
      certified (owner directive, 2026-08-03).

---

## Out of scope, deliberately

| Item | Why | Where it goes |
|---|---|---|
| PDF and DOCX upload | Needs pdf.js and mammoth bundled locally, plus a CSP check against the deployed policy. The policy has **no** `'wasm-unsafe-eval'`, so a WASM code path would fail in production and pass locally. | Phase 2 |
| AI-drafted answer | Needs a route, secrets, owner sign-off, and the platform two-suite run (roughly 10,300 web and 6,700 API tests). | Phase 3 |
| Fixing the signup-rejection funnel | Platform change, not a website one. See `design.md` section 6. | Platform backlog |
| Re-enabling the legacy soft wall | Legacy tree only, and the Astro copy would have to change with it. | Owner decision |

## Open question for the owner

The free tool and an open self-serve trial do the same funnel job. Building both
at once is waste. The free tool is the cheaper and safer door to open: one capped
interaction versus a trial account that can run the full extractor for 14 days.
That reasoning is in `requirements.md` section 1. The decision is the owner's.
