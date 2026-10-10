# CLAUDE.md: crowagent-website

Rewritten 2026-10-09 on owner instruction ("Website CLAUDE.md rewrite: yes"). The previous version
told every session to execute an old transformation spec, keep a server on port 8092 and check pages
for decommissioned products (`crowagent-core.html`, `crowcyber.html`, `crowcash.html`) that no longer
ship. Every standing rule it carried that still holds is kept below.

## Read first

1. `../crowagent-platform/docs/AI-ONBOARDING-GUIDE.md`: the single onboarding source for every AI
   tool. Sections 3.7 (secrets) and 3.8 (enforced guardrails) bind here.
2. `../CLAUDE.md` (workspace root) and `../crowagent-platform/ENGINEERING-STANDARDS.md`: the
   canonical rules. RULE 0, RULE 0-B, RULE 0-C, RULE 0-G, RULE 0-L, RULE 0-P, RULE 0-R, RULE 0-S,
   RULE 0-T, RULE 0-V and the IDENTITY HARD RULE all apply to this repository unchanged.
3. `AGENTS.md` and `GEMINI.md` in this directory for other tools.

## What this repository is

| Path | What it is | How it ships |
|---|---|---|
| `astro/` | the live marketing site for `https://crowagent.ai` | Cloudflare Pages builds `astro/dist` on every push to `main` |
| `status/` | the local status board on `http://localhost:8099` | never deployed. Served by `status/start-tracker.cmd` |
| root `Assets/`, `_headers`, `_redirects`, `robots.txt`, `llms*.txt` | load bearing inputs copied into `astro/dist` by `astro/scripts/copy-assets.js` and `copy-cf-config.js` | with the site |
| root legacy HTML tree | frozen. Only `scripts/generate-og-images.js` still reads its titles for the OG cards | not served. Whether it stays is an OWNER decision |

## The hard rules for this repository

1. **A push to `main` IS a production deploy of the live site.** It needs the owner's per push
   approval, with the cost stated first: a Cloudflare Pages build plus `astro-gates.yml` (when
   `astro/**` or `Assets/**` changed), `robots-guard.yml` and `smoke-test.yml`. The pre-push hook
   refuses a push to `main` unless `CA_PUSH_APPROVAL` carries the owner's text naming the sha7, and
   only the owner sets that variable. Never push to see whether a gate passes.
2. **Verify locally, on the BUILT site.** `cd astro && npm run build` runs the full gate chain
   (`scripts/run-gates.mjs`: facts, English, links, SEO and content parity, design system, palette
   roles, motion, CSP, render, budgets and the browser gates). A claim about the site is true only
   on the built output looked at in a browser, never on the source alone. `npm run dev` serves on
   8093 and `npm run preview` on 8094.
3. **Writing style (RULE 0-S).** No em dash and no en dash used as punctuation, and no semicolons in
   prose: an em dash in user facing text FAILS the Cloudflare deploy. British English, sentence case,
   no banned vocabulary (the list is in the workspace `CLAUDE.md`), no AI sounding language
   (revolutionise, harness, unleash, cutting edge, game changing).
4. **Products and naming.** The live estate is CrowMark and CrowMark Buyer only. Never "council" or
   "Public Sector edition" in anything a reader sees, and never PPN 002: PPN 026 is the only social
   value framework. CrowAgent Core, CrowCash, CrowCyber, CrowESG and the CSRD Checker are
   decommissioned and never return to the site.
5. **Claims.** Never state a win rate, an AI accuracy figure, or that the product makes anyone
   compliant. `astro/scripts/check-facts.js` is the authority on regulated facts and fails the
   deploy on a violation. Flag anything unverifiable with an `<!-- REVIEW: [claim] -->` comment
   rather than publishing it.
6. **Design system (RULE 0-C).** Colours, type and spacing come from `astro/src/styles/tokens.css`
   and `astro/src/styles/brand.source.json` only. A hardcoded hex value is a defect, caught by
   `check-design-system.js`, `check-palette-roles.js` and `check-brand-drift.js`.
7. **Accessibility and behaviour.** Respect `prefers-reduced-motion: reduce`. Every image has an
   `alt` attribute. Every interactive target is at least 44 by 44 px. Do not break navigation,
   footer, the cookie preferences page or any shared block.
8. **Secrets (guide section 3.7).** Never put a key on a command line, never print one, never paste
   one anywhere. Cloudflare stays on the FREE plan: never offer Advanced Certificate Manager, Total
   TLS or any paid item, not even as an option.
9. **Shared machine (RULE 0-L).** Check free RAM before a build, never start heavy work below 2 GB
   free, never kill a process you did not start.
10. **Identity (IDENTITY HARD RULE).** Every commit, document and generated file is authored as
    `Crow Agent <crowagent.platform@gmail.com>`. The pre-commit hook enforces it.

## Standing owner decisions (kept from the previous version)

- **One free tool:** the Tender Compliance Matrix at `/tools/tender-compliance-matrix`. `/tools`
  says "one tool" everywhere. Anything describing the site as having a free calculator is stale.
- **The PPN 002 calculator is gone** (owner, 2026-08-04): both routes 301 to `/glossary/ppn-026/`
  and are listed in `RETIRED_ROUTES` in `astro/scripts/check-content-parity.js`. Never restore it.
- **The Cyber Essentials readiness tool is not coming back** (owner decision on O-30, 2026-08-04).
  A second free tool, if any, is built inside the retained procurement field.
- **No conceded trade mark field returns** without Aparajita signing it off in writing.
- `js/`, `cookie-banner.js`, `scripts.js`, `scripts.min.js`, `service-worker.js` and the jest suite
  were deleted on 2026-09-07 (A-258) because nothing loaded them. Never restore them.

## The status board (`status/`)

- The Platform tab is GENERATED from the highest `RELEASE-*-TRACKER.md` in `crowagent-platform`.
  Rebuild: `node status/build-platform-board.js`, then from `crowagent-platform`
  `node scripts/assign-phases.mjs ../crowagent-website/status/platform.json`, then the board again.
  `platform.json` and `phase-breakdown.json` are generated and never committed.
- The `#website` tab is hand authored in `status/issues.json`.
- The `architecture-*.html` pages are hand written fragments. Each states the date of every
  measurement it shows. `node status/check-board-contract.js` must pass before a commit that touches
  them: no script, no colour literal, every token resolves, and it checks every view `index.html`
  offers.

## Enforced, not just written

The pre-commit hook here runs the shared checker
`../crowagent-platform/scripts/guardrails/guardrails.mjs` and fails closed if it is missing. It
refuses a commit that adds a secret, deletes or renames a rule file, removes a rule identifier, guts
a rule file or changes a hook. Never bypass it with `--no-verify`.

**This file itself is NOT tracked by git** (`.gitignore` line 101 ignores it), so it has no history
and the commit guard cannot protect it. Whether to track it is the owner's decision: tracking it
would give it history and put it under the same guard as every other rule file.
