# Website Transformation — Live Progress (2026-05-25)

**Mandate (CTO, 2026-05-25):** full autonomous transformation of ALL pages to top-1%
(Apple/Stripe/Google grade). Enhance visual, animation, automation, background animation,
messaging alignment. No compromise. Don't lose good work — merge/optimise/polish.
Rebalance product narrative to foreground the FOUR enforcement products (CrowCyber,
CrowMark, CrowCash, CrowESG); Core = foundation, CSRD = free funnel. **Local-only — NO
push/deploy.** When all done → ask CTO to test at localhost:8092 and confirm (`APPROVED FOR PUSH — main`).

Governing docs: `TRANSFORMATION-AGENT-BRIEF.md` (rubric + rules), `TRANSFORMATION-SPEC.md`,
`AUDIT-LEDGER-2026-05-24.md`. Orchestrator = Opus; pixel-verifies every agent claim (no trust).

## Parallel streams (disjoint file ownership; each owns its HTML + one new CSS module)
| Stream | Scope | Owned files | Status |
|---|---|---|---|
| Pre | Security heading §1.3 | security-sf19.css | ✅ committed 8643818 (verified 1280) |
| S1 | Homepage | index.html + transform-home-2026-05-25.css | 🟡 running |
| S2 | CrowCyber + CrowCash | crowcyber/crowcash.html + transform-cybercash-2026-05-25.css | 🟡 running |
| S3 | CrowMark + CrowESG | crowmark/crowesg.html + transform-markesg-2026-05-25.css | 🟡 running |
| S4 | Core + CSRD + hubs | crowagent-core/csrd/products-index/tools-index + transform-support-2026-05-25.css | 🟡 running |
| S5 | Company/info (×9) | about/contact/partners/roadmap/faq/changelog/resources/pricing/glossary + transform-company-2026-05-25.css | 🟡 running |

## Verification protocol (orchestrator, per stream completion)
1. `git status` — confirm stream touched ONLY its files + its new CSS (no global edits).
2. Run `node tests/_verify-all.js "<page list>"` → 1280 + 390 PNGs.
3. **Read every PNG.** Score against the 10-point rubric. Note pass/fail per page.
4. CSS braces balanced; page returns 200; content visible (no opacity:0); no em-dash/AI-speak/$/names.
5. If pass → stage that stream's files + commit (author crowagent.platform@gmail.com). If fail →
   SendMessage to the same agent with the exact screenshot-grounded corrections; re-verify.

## Already-verified before this wave (A-CONTENT)
- privacy/terms/cookies = polished, on-rubric (TOC, eyebrow, canonical H1, summary cards, visible
  bullet markers, ~720 measure). GP-LEG1 already tokenised. No change needed.
- security = fixed "Operational standards" all-caps inflation (8643818).

## Not in wave-1 (follow-up): tool calculator subpages, blog posts, glossary term pages, 404, cookie-preferences.

## Log
- 2026-05-25: dispatched S1-S5 (background). Awaiting completions; verify each on arrival.
