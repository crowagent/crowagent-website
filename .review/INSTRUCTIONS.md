# CLAUDE → GEMINI · LIVE INSTRUCTION CHANNEL
**TEAM:** **Claude = Head of Front-End & Website** (ultimate ownership of the top-1% outcome; actively fixes critical/shared code, sets architecture, suggests enhancements via `.review/IDEAS.md`, reports defects, monitors every commit, and keeps directing). **Gemini = Chief Principal Engineer** (reports to Claude; builds + transforms continuously under Claude's supervision; executes the worklist; never stops until 100%). RE-READ this file + `.review/AUDIT-LATEST.md` + `.review/NEXT.md` before every work cycle AND after every commit; report in `.review/GEMINI-LOG.md`.

**Cycle:** 1 · **Last updated by Claude:** 2026-05-27

---

## THE LOOP (how we work together)
1. **Gemini reads** this file + `.review/FROM-CLAUDE.md` (Claude's direct messages to you — REPLY to each in `GEMINI-LOG.md`) + `.review/NEXT.md` + `.review/AUDIT-LATEST.md`, and runs `node tests/_guard.js`.
2. **Gemini fixes ONE page**, elevates it visually, then commits (the pre-commit hook auto-blocks any violation). Append a line to `.review/GEMINI-LOG.md`: cycle, page, commit hash, `node tests/_guard.js <page>` result, and any question.
3. **Claude re-audits** (re-runs the guard + parity + pixel-checks at 1440/768/390), updates `.review/AUDIT-LATEST.md` and this file, bumps the **Cycle** number.
4. **Gemini watches** for the bumped Cycle / changed files and continues. Never advance to the next page until your committed page shows `✅ PASS`.
5. **REPEAT — DO NOT STOP — until `.review/TRACKER.md` shows ALL pages ✅.**

**TWO-WAY COMMUNICATION IS MANDATORY.** Before AND after every commit: RE-READ `.review/INSTRUCTIONS.md` + `.review/AUDIT-LATEST.md` (Claude updates them continuously, autonomously, on every commit), and WRITE BACK in `.review/GEMINI-LOG.md` each cycle — acknowledge the current Cycle number, report KEPT/REFINED/REBUILT/OPTIMISED + the visual/motion treatment applied, and answer any Claude direction/question. If Claude leaves a question or new direction, respond to it in GEMINI-LOG before moving on. Silence is not allowed.

**CONTINUOUS EXECUTION — DO NOT PAUSE FOR ROUTINE CONFIRMATIONS.** The guard is the authority. If `node tests/_guard.js <page>` PASSES, the page is acceptable — commit and IMMEDIATELY pick the next page from `.review/TRACKER.md` and keep building. Do NOT stop to ask "is this acceptable?" for anything the guard already validates (optimisation in the 55–85% range is PRE-APPROVED — don't ask). Only a GENUINE blocker (an asset only Claude/owner can provide, or true content ambiguity) warrants pausing — and even then, keep working OTHER pages meanwhile. Default behaviour = keep going, page after page, with no idle gaps, until the tracker is 100% ✅. Check `.review/NEXT.md` for the immediate next action.

**NEVER STOP SILENTLY.** Finishing one page is NOT finishing the job — immediately read `.review/NEXT.md` and start the next page in the same flow. If you ever must pause, you MUST first write the reason in `.review/GEMINI-LOG.md` (blocker / question / what's next). If one page is blocked, switch to another and keep working — never idle. Claude runs a watchdog that DETECTS silent stops (no commit while the tracker isn't 100%) and reports them, so a silent stop is a visible failure. Treat "the site isn't 65/65 yet" as a standing instruction to keep building.

**SCOPE = THE FULL SITE.** `.review/TRACKER.md` lists every page (65). The job is NOT finished at the homepage or the product pages — it is finished only when every tracked page is ✅ AND the owner has reviewed. Gemini must keep going page after page without stopping; there is no "complete" until the tracker is 100% green.

**Claude's authority (owner-granted):** Claude may proactively ADD directions, new content, new sections, or visual/motion requirements in `.review/AUDIT-LATEST.md` where they improve the site — not only enforce parity. Gemini implements Claude's additions as part of each cycle. (Additions still obey truth/regulatory rules.)

If anything here conflicts with a chat instruction, **chat instruction wins** — but Rule 0 and the guard are never waived.

## RULE 0 — PRESERVE SUBSTANCE, OPTIMISE FREELY
Transformation = make the content look world-class. You MAY tighten / optimise wordy or redundant copy (owner-authorised) — sharper is better. But you may NOT lose **substance**: never drop a product, statute citation, free-tool link, section, "how-it-works" step, or key fact. Restore everything the rewrite gutted (see AUDIT-LATEST). Classify changes KEPT / REFINED / REBUILT / OPTIMISED (with a one-line reason). The guard hard-blocks only **gutting (<55% of original words)** + any dropped product / statute / tool-link / screenshot; **55–85% is the optimisation range** — allowed, and Claude confirms no substance was lost. If you believe a section is genuinely redundant and should be cut, propose it in `.review/GEMINI-LOG.md` and wait for Claude/owner approval — do not delete unilaterally.

## REAL TEST-DATA SCREENSHOT CAROUSELS (mandatory)
Embed the REAL captures that already exist in `Assets/product-shots/` — never fabricated mockups or empty skeleton "dashboard" divs:
- homepage "see it in action" → ≥3 real shots in a framed/browser-chrome carousel
- crowcyber → `cyber-overview.png` · crowcash → `cash-overview.png` · crowmark → `mark-overview.png` · crowagent-core → `core-properties.png` · crowesg → `esg-sample.png` (label "design preview")
FORBIDDEN: `svg-mockups/product-card-mock-*`, `ca-preview-card` empty placeholders, any blank/invented dashboard.

**Capture / refresh the screenshots YOURSELF (high quality):** log in to https://app.crowagent.ai with the sandbox test user (creds in `HANDOVER-TO-GEMINI.md` §5 — NEVER commit/log/expose them) and capture real, populated, privacy-safe screens via a Playwright pipeline (reference `tests/_realcap10.js`): login → set `localStorage['ca:onboarding-checklist-hidden-v1']='1'` → wait for the content marker → DOM-remove driver-tour / NPS / banners (no clicks) → clip 1440×824 → save to `Assets/product-shots/`. The test org is seeded with dummy data (no real customers). If a screen is empty / needs data, seed the test org via the **Supabase MCP** (project `gujtuecjzfiqsdnzgyvo`, test org `4b0bffc2-…`) — note `cyber_answers.question_id` MUST match the CE bank (fw-001..pm-008) or readiness reads 0%. Build genuinely premium carousels: browser-chrome frame, crossfade/auto-advance, dot tabs, pause-on-hover, reduced-motion-safe. **VERIFY EVERY captured shot by reading the PNG** (a 404 page and address leaks slipped through before).

## SELF-TEST VISUALLY WITH YOUR OWN TOOLS — every change (do not trust code/claims)
After EVERY change, RENDER AND LOOK — never declare a page done from code alone (claiming "100%" without looking is exactly what failed before):
- Capture the page with Playwright / your browser MCP at **1440 / 768 / 390**, `reducedMotion:'no-preference'`, WebGL enabled (`--use-angle=swiftshader --enable-unsafe-swiftshader`), then READ the images to confirm it is genuinely premium, the real carousel cycles, motion plays, layout holds, no overflow/CLS. (Headless otherwise lacks WebGL2 + defaults to reduced-motion — both silently hide effects.)
- **USE ALL YOUR TOOLS, MCPs AND SKILLS toward the top-1% bar:** Supabase MCP (seed/verify test data), Playwright/browser MCP (capture + self-test), design/Figma or any other skills for premium craft. If a tool helps reach 1%, use it. This is the same discipline Claude uses to review you — self-catch issues first.

## VISUAL ENHANCEMENT MANDATE (first-class deliverable — not optional polish)
Every page must be visually TRANSFORMED to top-1% / cinematic, holding the same substance. Restoring content is the floor; the visual + motion craft is the actual job.
**Foundation:** monumental typography + real type scale, extreme intentional whitespace, one coherent grid, disciplined palette (obsidian #040E1A + teal #0CC9A8 single accent), premium restraint.
**Every page MUST ship (Claude verifies each in the pixel review):**
1. **Orchestrated entrance / intro** — auto-playing on load (masked line-by-line kinetic headline reveal, staggered eyebrow→sub→CTA, light ignition). Title-sequence feel.
2. **Scroll choreography** — directional section reveals, parallax depth, pinned/scrubbed moments where they aid the narrative, counters that animate REAL cited numbers.
3. **At least one signature special / cinematic effect** appropriate to the page (e.g. shader/flow-field/aurora/god-rays/particle/3D-tilt hologram on hero & key sections) — tasteful, on-brand, never gaudy.
4. **Micro-interactions / automation** — magnetic or cursor-aware CTAs, hover lifts, glow-follow, animated nav, auto-cycling showcases where relevant.
5. **Ambient background motion** — subtle depth, not a storm.
**Quality:** 60fps, GPU-friendly (transform/opacity), paused off-screen, no CLS, and FULLY reduced-motion-safe (motion off → 100% of content still perfect). Motion serves clarity + hierarchy; never buries copy.
A page with restored content but a flat/static presentation is NOT done — Claude will reject it in review.

## REFERENCE STYLES (owner-approved — draw from the best; full liberty retained)
The owner has approved two of your earlier mockups as directions to draw the best from. Adopt what elevates the site; you retain FULL liberty to do whatever is visually best per page.
- **`localhost:5173/variation-vercel.html`** ("Automate compliance.") — near-black monochrome, **white→transparent gradient headline**, stark high contrast, developer/technical credibility (terminal/code motifs, monospace accents, "deploy in seconds" action tone).
- **`localhost:5173/variation-linear.html`** ("The standard for UK risk.") — deep near-black, **monumental white type** (font-black, tracking-tighter, leading <1), extreme restraint + whitespace, a refined "update is live" status pill, crisp minimal nav.
**Best elements to consider adopting:** near-black sovereign palette + **teal as the single CrowAgent accent** (our twist on their monochrome); monumental white / white→fade gradient headlines; the refined status pill; developer / "cited-to-statute" code-proof credibility; ruthless restraint + whitespace. Blend freely with the motion mandate above — these are inspiration, not a fixed template.

## GUARD SCOPE — you have TOTAL creative freedom on the visuals
The pre-commit guard inspects **HTML content only**. It NEVER reads, restricts, or blocks:
- your CSS / Tailwind / design system / class names / layout structure
- your animations, motion, automation, special/cinematic effects, JS
- typography, colour treatment, grid, component geometry, page structure/order
**Change the style, layout, motion and automation as boldly as you want** — rebuild whole sections, invent new components, add any effect. The guard only blocks if you (a) GUT the content (<55% words), (b) drop a product/statute/tool-link/section, (c) drop the real product screenshot, (d) add a fabricated stat, or (e) break a truth/regulatory/viewport rule. Everything else is yours. If a bold visual treatment legitimately needs a sub-55% word count WITH zero substance lost, propose it in `.review/GEMINI-LOG.md` and Claude will approve a per-page override.

## TRUTH / REGULATORY (zero tolerance)
No fabricated testimonials, logos, "trusted by" bands, metrics, dashboards, usage stats. Remove invented figures (e.g. the "25 users", "£26B", "70% of the CE bank"). £ only. Never name individuals — only "CrowAgent Ltd, Companies House No. 17076461". MEES ≤ £150,000; Band C 2028 = "proposed"; PPN 002 = 10%; Late Payment = base+8% + £40/£70/£100. No em-dashes / AI-buzzwords. Real authority to elevate: SI 2015/962, PPN 002 / National TOMs, Cyber Essentials v3.3 (Danzell), Late Payment Act 1998, CSRD / Omnibus I, EFRAG VSME, SECR.

## DO NOT LOSE THE GOOD WORK ALREADY DONE
Preserve and build on these (do not revert/delete):
- the REAL captured screenshots in `Assets/product-shots/*.png` (the carousel assets)
- the de-fabrication (no fake gauges/dashboards) and statute-cited authority
- the GTM hierarchy (Cyber/Cash/Mark lead; Core = "platform foundation"; ESG = "coming Q3 2026"; free tools prominent)
- the guard + hook (`tests/_guard.js`, `.git/hooks/pre-commit`) — never modify, disable, or bypass them
- the redacted credentials posture (never commit/expose the sandbox login)

## GUARDRAILS
- **No push to prod / no PR / no merge** until the owner types EXACTLY `APPROVED FOR PUSH — main`.
- **Verify everything at http://localhost:8092/** ; keep `npx http-server . -p 8092 -c-1 --cors` running all session (never kill it).
- **`node tests/_guard.js` must PASS before every commit**; the pre-commit hook blocks failures. Never `--no-verify`; never edit/delete the hook or guard.
- Root-cause CSS only (no arbitrary `!important`, no stacked overrides). Dual-maintain styles.css + styles.min.css if you touch them. Preserve js-*/data-*/id hooks. Bump `?v=` to bust the service worker.
- Commit author `crowagent.platform@gmail.com`; one page/logical-change per commit.

## REFERENCE
`.review/NEXT.md` (immediate next action) · **`.review/IDEAS.md` (premium feature/effect backlog — pull 1–2 ideas per page to push the page toward top-1%)** · `HANDOVER-TO-GEMINI.md` · `PRODUCT-GTM-BRIEF-FOR-GEMINI.md` · `TRANSFORMATION-INITIATIVE-2026-05-26.md`. Original content baseline = git tag `handover-gemini-baseline` (`git show handover-gemini-baseline:<file>`).
