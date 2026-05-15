# Gemini CLI Kickoff Prompt
# Copy everything below this line and paste into Gemini CLI

---

You are executing the CrowAgent Website Premium Cinematic Transformation. Your work is STRICTLY limited to the `crowagent-website` directory. You must NOT touch `crowagent-platform`, `crowagent-portal`, or any other repository.

## IMMEDIATE FIRST ACTIONS (Do these NOW, in this exact order):

1. Read `.gemini/state/TRANSFORMATION-STATE.md` to determine where you left off
2. Read `.gemini/instructions/WEBSITE-INSTRUCTIONS.md` for all hard rules
3. Read `.gemini/specs/WEBSITE-REQUIREMENTS.md` for what to build
4. Read `.gemini/specs/WEBSITE-DESIGN.md` for how it should look
5. Read `.gemini/specs/WEBSITE-EXECUTION.md` for the step-by-step plan

## YOUR MANDATE:

Transform the CrowAgent marketing website into a Tier-1 premium SaaS site (Apple/Stripe/Notion quality) following the detailed specifications in `.gemini/specs/`. Execute phase by phase, starting from wherever the state file indicates.

## CRITICAL RULES YOU CANNOT BREAK:

1. **STATE FILE:** Update `.gemini/state/TRANSFORMATION-STATE.md` after EVERY completed task. Mark checkboxes as `[x]` when done. This is your crash-recovery mechanism. If you are interrupted or crash, the next session reads this file and resumes exactly where you left off.

2. **SCOPE LOCK:** You work ONLY on `crowagent-website`. Do NOT modify platform, portal, or any other repo. Do NOT make changes to billing, auth, or backend systems.

3. **NO PRODUCTION DEPLOYMENT:** You are FORBIDDEN from deploying to production, merging to main, or pushing to any remote branch without my explicit written approval. All work is verified on `localhost:8083` only.

4. **USER TESTING AFTER EVERY PHASE:** After completing each phase, you MUST:
   - Summarize what you changed
   - List the pages/URLs to test
   - Ask me to test on localhost:8083
   - WAIT for my feedback
   - Fix any issues I report before moving on
   - Only proceed when I say "proceed" or "looks good"

5. **RESPONSIVENESS IS BLOCKING:** Every change must work at 375px mobile. If it breaks on mobile, it is a P0 bug. Fix it before anything else.

6. **BRAND TOKENS ONLY:** Never hardcode hex colours. Always use `var(--token)` from `crowagent-brand-tokens.css`. CTA buttons: bg `var(--teal)`, text `var(--obsidian)`.

7. **8K QUALITY IMAGES:** Use only royalty-free 8K/4K images from Unsplash, Pexels, or NASA. Never use AI-generated images. The site must NOT look AI-generated.

8. **PIXEL-PERFECT ALIGNMENT:** Every section, card, icon, and element must be precisely aligned per the design spec. No "close enough."

9. **MOTION ACCESSIBILITY:** Every animation gated behind `prefers-reduced-motion`. No exceptions.

10. **ANNUAL DISCOUNT = 10%:** Monthly price x 12 x 0.9. Never 20%. MEES Band C 2028 is always "proposed." PPN 002 threshold is always 10%.

## EXECUTION ORDER:

Start from the current phase in the state file. The full sequence is:

- Phase 0: Cleanup (dead code, unused images, 8K image sourcing)
- Phase 1: Baseline verification & deprecation sweep
- Phase 2: Hero cinematic enhancement (layered parallax)
- Phase 3: Section reveals & scrollytelling
- Phase 4: Product pages polish
- Phase 5: Pricing & roadmap update
- Phase 6: Navigation & footer polish
- Phase 7: Micro-interactions
- Phase 8: Performance & accessibility audit
- Phase 9: SEO & final content
- Phase 10: Final QA & user approval

After EACH phase: update state file, ask me to test, wait for my go-ahead.

## BEGIN NOW:

Read the state file and start executing. Tell me which phase you are beginning and what you plan to do first.
