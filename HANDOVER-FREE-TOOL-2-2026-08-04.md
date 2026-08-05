# Handover: free tool 2, and the trap that cost a session

**Written 2026-08-04 ~19:45 by Crow Agent.** Short on purpose. The full record is
in `specs/free-tool-2-tender-compliance-matrix/`.

---

## Read this before you measure anything

**There are two `dist` directories and they disagree.**

| Path | Built | What it is |
|---|---|---|
| `dist/` | 04:50 | legacy hand-written HTML build, **stale** |
| `astro/dist/` | 19:25 | **what `:8095` serves** |

A previous session read the root `dist/`, concluded the preview was stale, and
built an entire change list against the wrong tree. Another session read
`astro/dist` and concluded the opposite. Both measurements were correct. The
assumption about which one `:8095` served was not.

**Do not infer the target from a remembered PID or from an earlier session's
note.** The server gets repointed. Ask it:

```bash
curl -s http://localhost:8095/tools/ppn-002-calculator/ | grep -c '<input'
# 3  -> astro/dist      2 -> stale root dist      9 -> legacy source
```

Two knock-on facts worth knowing:

- The root `dist/` calculator is missing 7 fields that exist in source. The root
  build does not minify HTML, so size differences there are real content.
- `check-seo-parity.js` and `check-content-parity.js` resolve their baseline
  against the root `dist/`. Parity currently grades today's Astro pages against a
  15-hour-old legacy build.

---

## What the spec says to build

A **Tender Compliance Matrix** at `/tools/tender-compliance-matrix/`. Paste
tender text, get a rule-detected matrix of requirements, each with its verbatim
source line. No upload, no AI, no server, no account.

Build in the **Astro tree only**. Four files:

- NEW `astro/src/lib/tender-matrix.ts`
- NEW `astro/src/pages/tools/tender-compliance-matrix/index.astro`
- EDIT `astro/src/data/nav.ts`
- EDIT `astro/src/pages/tools/index.astro`

Nothing else. Sitemap is generated, CF config is copied, CSP is unaffected.

**Resolved so you do not have to check it again:** new routes are exempt from
both parity gates. `check-content-parity.js:575` and `check-seo-parity.js:100`
skip a route with no legacy twin. You do not build the tool twice.

---

## Constraints that are not negotiable

- **Naming.** Inside the retained tender and procurement field. The trade mark
  filing carries an explicit exclusion covering **risk**, so no "risk checker",
  "readiness check", "assessment" or "audit". See `CLAUDE.md` O-30.
- **Never assert compliance.** Report what was detected and stop. Same rule
  already written into `astro/src/lib/ppn002.ts`.
- **Production is frozen** until the site is certified (owner, 2026-08-03).
  Build, commit locally, serve on `:8095`. Do not deploy.
- **Identity** is `Crow Agent` / `crowagent.platform@gmail.com` in all output.

---

## Two findings worth more than the tool

**1. The legacy lead-gen funnel is switched off and points at a rejection.**
`js/tool-teaser.js` has a soft wall, a run counter and an upgrade strip.
`shouldShowSoftWall()` returns `false` unconditionally. The upgrade strip that
does run promises "Sign up free, No card required, 14-day full access" and links
to `app.crowagent.ai/signup`, which per `BETA-MODE.md` rejects anyone off the
beta whitelist (`login/actions.ts:630`). The Astro tree has no teaser at all, by
design. Fixing this is a platform decision and is out of the spec's scope.

**2. There is almost no audience.** PostHog, 12 May to 4 Aug: 19 unique visitors
to crowagent.ai, 10 of them from Google, 5 pageviews on the PPN 002 calculator.
Local dev traffic over the same window was 3,448 views. Any argument about which
free tool performs better on this domain is argument from noise. The numbers and
their consequences are in `requirements.md` section 1.

---

## Where everything lives

```
specs/free-tool-2-tender-compliance-matrix/
  requirements.md   why this tool, the evidence, the constraints, acceptance criteria
  design.md         the two-dist trap, architecture, reuse inventory, gates
  tasks.md          the checklist, plus what is deliberately out of scope
```

Related and still current: `RESUME-HERE-2026-08-04.md` for servers and the board,
`WEBSITE-STATUS.md` for the status index, `CLAUDE.md` for the standing rules.

Superseded for the "which free tool" question only:
`specs/platform-fixes-and-free-tools/`. Its Workstream A record still stands.
