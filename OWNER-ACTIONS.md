# Owner actions — running log

Things only the owner can decide or do. I add to this rather than stopping work.
Nothing here blocks the transformation; each item names what I did in the meantime.

**Legend** — `OPEN` needs you · `ANSWERED` decided, kept for the record · `CLOSED` resolved without you

Last updated: 2026-08-02

---

## OPEN — decisions

### OA-01 · 17 uncited claims on the homepage · P1 · content risk

Full extraction with exact wording in `migration/HOMEPAGE-CONTENT-MODEL.md`.
Section 1 (market numbers) is the **only** homepage section where every figure is cited.

Highest risk first:

| # | Claim | Where | Problem |
|---|---|---|---|
| 1 | "The only engine that sits on both sides", and "almost nothing else in this market does both" | Section 3, stated twice | An absolute uniqueness claim about a competitive market, with no support. This is the kind of statement a competitor can challenge cheaply. |
| 2 | 40 / 30 / 20% criterion weightings | Section 5 | A source comment in the HTML calls these "the published weighting breakdown" while naming no ITT, authority or framework. |
| 3 | "£2.80 per £100" | Section 5 | Sits immediately beside properly-cited National TOMs figures, so it borrows their credibility without having any. |
| 4 | Absolute read-only guarantee: "We never write back to your files or change a setting" | Integrations band | A security guarantee in absolute terms with no trust page linked. |
| 5 | 55% / 44% supplier figures | Section 1 | Attributed to "CIPS Supply Management and techUK" but with no survey title, year, sample size or link. Weakest of the cited items. |

**What I need:** for each, either a source I can cite, or approval to soften/remove.
**What I did meanwhile:** ported Section 1 (fully cited) and left Sections 3 and 5 unported so
nothing unsourced moves onto the new homepage by default.

**Related, already fixed without you:** the hero I built cited "the Oxford proxy constants".
The Oxford Social Value Bank does not exist and this site already stripped it from 54 places.
Removed, along with a fabricated-looking tender reference `ITT CF-2026-0417` that read as a live
procurement. The hero example is now labelled "Worked example".

### OA-02 · Blog light-vs-dark at cutover · P2 · design

The 8 legacy blog articles render light; everything in the Astro rebuild is dark. Both are
defensible. Changing 8 published articles is a content decision, not a build one.
**What I did meanwhile:** ported all 8 preserving current appearance, so either choice is a
one-line change later, not a re-port.

### OA-03 · Cloudflare Bot Fight Mode injects a script on every page · P2 · perf + privacy

Verified live 2026-08-02. Every HTML response has this appended before `</body>`, by Cloudflare
and not by our build:

```
/cdn-cgi/challenge-platform/scripts/jsd/main.js   (window.__CF$cv$params)
```

Two consequences worth a decision:
1. It is a render-blocking-adjacent third-party script on 100% of pageviews, on a site whose
   entire measured problem was payload.
2. It sets storage before any consent interaction. It is arguably strictly necessary (security),
   which is the usual exemption, but this site runs a consent banner and the claim should match
   the behaviour.

**Where:** Cloudflare dashboard → Security → Bots → Bot Fight Mode.
**Recommendation:** leave it on unless the consent wording needs to be exact; the security value
is real and the cost is small. Flagging it because it is invisible in the repo, so nobody would
otherwise know it is there.

---

## CLOSED — resolved without owner action

### OA-C1 · "Cloudflare Pages is not picking up commits" · was P0 · **not reproducible, fix already live**

Verified 2026-08-02 by byte comparison rather than by dashboard inspection:

- `Assets/css/sovereign-core-v2.compiled.css`, comment-stripped, is **byte-identical** to what
  `https://crowagent.ai` serves: 159,022 bytes each, 158 `@media` blocks and 1,633 rules on both
  sides. The P0 CSS destruction deleted 644 rules and 156 `@media` blocks, so none of it is live.
- `index.html` and `dist/index.html` both match the live HTML exactly under whitespace
  normalisation. The only divergence is the Cloudflare script in OA-03, which Cloudflare injects.

Root cause of the original blockage was `core.autocrlf=true` with no `.gitattributes`, which made
content hashes differ between the working tree and a fresh clone, so the build's asset-hash guard
failed on Cloudflare while passing locally. Fixed by committing `.gitattributes` with
`* text=auto eol=lf`. **No dashboard action needed.**

### OA-C2 · Nav and Footer "still to build" · **already exist**

`astro/src/components/nav/Nav.astro` and `astro/src/components/footer/Footer.astro` are built and
wired into `Base.astro` (lines 105 and 109). A forensic parity and accessibility audit against the
live client-injected nav is running; findings will land in `migration/NAV-FOOTER-AUDIT.md`.

---

## Port status — where the migration actually is

23 of ~41 real routes are on Astro. Excludes dev/test files, `.partials/`, and the Google
verification file.

| State | Routes |
|---|---|
| **Ported (23)** | `/`, `/blog/` + 8 posts, `/compare/` + 4, `/glossary/` + 2, `/sectors/` + 4 |
| **Not yet ported (18)** | about, contact, partners, pricing, roadmap, faq, changelog, resources, integrations, crowmark, crowmark-buyers, tools/, privacy, terms, cookies, security, cookie-preferences, 404 |

The homepage is partially rebuilt: hero and Section 1 are done; Sections 2–6 are pending, and
Sections 3 and 5 are gated on OA-01.
