# ADR 0001 — Astro, not Next.js, for the marketing site

**Status:** Accepted · **Date:** 2026-08-01

## Context

45 hand-written HTML pages, each carrying its own `<head>`. The heads of `index.html` and
`crowmark.html` had drifted **427 lines** apart. 13 files hardcoded a price, 8 hardcoded the
signup URL, 40 repeated the same Organization JSON-LD. A price change was a 13-file sweep.

The site has no authentication, no sessions, no per-request data. The product application
at app.crowagent.ai is a separate deployable on a separate domain.

## Decision

Astro 5, static output, Content Collections for structured content, islands only where
interactivity genuinely exists. Cloudflare Pages unchanged.

## Alternatives rejected

**Next.js.** The right choice when you need a server: auth, personalisation, per-request
data. This site needs none, and the app already is that. Next would impose a React runtime
on pages whose job is to render text quickly for search engines and LLM crawlers, and push
builds toward Vercel, which RULE 0 exists to avoid. The strongest argument for it is stack
consistency with the app; that is real but does not outweigh a runtime tax on a static site.

**11ty or Hugo.** Good at content, but no component islands, weaker TypeScript story, and
every interactive behaviour would be hand-rolled. Fixes the duplication, not the ceiling.

**Webflow or Framer.** Excellent motion and fastest for pure marketing edits. Rejected
because this site states regulatory claims (PPN 002 at 10%, MEES fine caps, "proposed"
framing on EPC B 2031, no win-rate claims). Those need version control, review, and a
claims guard in CI. A visual builder makes that discipline close to impossible and puts
legally sensitive copy one drag from being wrong. Also recurring cost and lossy export.

## Consequences

Positive: one layout replaces 45 heads; 18 pages become Markdown behind 4 templates;
automatic asset hashing removes the manual `?v=` ritual and its whole class of "the change
never landed" bugs; hosting stays £0.

Negative, stated honestly: Astro is an independent project, not hyperscaler-backed. It
ships majors roughly annually and has had breaking changes. Two mental models exist
(server components and client islands), which is a real onboarding cost.

Mitigation: the output is plain static HTML, CSS and JS with no runtime lock-in. Worst case
the built `dist/` keeps serving indefinitely. This is the lowest lock-in of any option
considered.

**Revisit if** the marketing site ever needs logged-in state or per-request personalisation.
At that point Next becomes the better fit.
