# AGENTS: read the onboarding guide first

**Every AI tool working in `crowagent-website` (Codex, Cursor, Copilot, Kiro, Gemini, Claude and any
other) reads `../crowagent-platform/docs/AI-ONBOARDING-GUIDE.md` before doing anything.** Its rules
bind here too. The canonical rule text is `../crowagent-platform/ENGINEERING-STANDARDS.md`. Added
2026-10-09.

## What this repository is

- `astro/` is the live marketing site for `crowagent.ai`, built and served by Cloudflare Pages.
- `status/` is the local status board on `http://localhost:8099`, never deployed. Its Platform tab
  is generated from the platform release tracker, and the `architecture-*.html` pages are hand
  written and must cite the date of every measurement they show.

## The six hardest rules

1. **A push to `main` IS a production deploy of the live site**, and needs the owner's per push
   approval, stated with its cost (Cloudflare Pages build plus `astro-gates.yml`, `robots-guard.yml`
   and `smoke-test.yml`). No other git act without approval either.
2. **No em dash and no semicolon in user facing text.** The deploy fails on an em dash. British
   English, sentence case, never "council", never "PPN 002", only CrowMark and CrowMark Buyer.
3. **Secrets (guide section 3.7).** Never put a key on a command line, never print one, never paste
   one anywhere. Only Claude Code has a hook that blocks this, so every other tool enforces it
   itself. Cloudflare stays on the free plan, never offer a paid item.
4. **Design tokens only.** Never a hardcoded colour, font or spacing value (RULE 0-C).
5. **Verify on the built page.** A claim about the site is true only on the output of
   `npm run build` in `astro/`, looked at in a browser, never on the source alone.
6. **Shared machine, measured claims.** Check free RAM before heavy work, never kill a process you
   did not start, report only what you measured, and all identity is
   `Crow Agent <crowagent.platform@gmail.com>`.

Note: `CLAUDE.md` in this repository still describes an older transformation spec and pages for
decommissioned products. Where it disagrees with the onboarding guide, the guide wins.
