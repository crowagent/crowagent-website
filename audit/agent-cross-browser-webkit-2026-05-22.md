# Cross-Browser Parity Audit — WebKit (Safari engine)

**Date:** 2026-05-22
**Engine:** Playwright `webkit` 2272 (Safari 17.x equivalent)
**Server:** http://localhost:8092
**Scope:** Top 20 marketing pages × 2 viewports (1440×900 desktop + 390×844 mobile) = 40 captures
**Method:** Capture WebKit PNG, Read each, classify defects (CRITICAL / HIGH / MEDIUM / LOW), compare to Chromium to confirm WebKit-specific vs cross-browser

---

## Result: 0 WebKit-specific defects found

WebKit renders every audited page at parity with Chromium. styles.css already pairs every WebKit-sensitive property with the `-webkit-` prefix (verified via grep + targeted pair-window scan).

| Severity | Count |
| --- | --- |
| CRITICAL | 0 |
| HIGH     | 0 |
| MEDIUM   | 0 |
| LOW      | 0 |

---

## Pages audited (20 / 20)

`index.html`, `pricing.html`, `roadmap.html`, `faq.html`, `changelog.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowagent-core.html`, `crowesg.html`, `csrd.html`, `about.html`, `contact.html`, `partners.html`, `privacy.html`, `terms.html`, `security.html`, `cookies.html`, `404.html`, `blog/index.html`

All 40 captures returned HTTP 200, no `pageerror`s, no console errors flagged. PNG sizes 45 KB - 587 KB (no blanks).

---

## WebKit-sensitive properties — pair audit on `styles.css`

`styles.css` has 31,006 lines. Targeted scan of properties that historically need `-webkit-` prefix:

| Property | Standard occurrences | Unpaired with `-webkit-` |
| --- | --- | --- |
| `backdrop-filter` | ~45 sites | 0 (one match inside `@supports not (backdrop-filter:…)` feature query — correct, not a paint property) |
| `mask-image` | ~12 sites | 0 |
| `background-clip: text` | ~6 sites | 0 (one match inside a CSS comment block — false positive) |
| `clip-path` | n/a | 0 unpaired |
| `position: sticky` | ~14 sites | 0 (Safari supports unprefixed since 13) |
| `appearance: none` | paired with `-webkit-appearance: none` everywhere | 0 |
| `user-select` | paired | 0 |

`styles.css` is already cross-browser-clean. No edits required.

---

## Cross-browser bug investigated and de-scoped

During capture I noticed product pages (`crowmark`, `crowcyber`, `crowcash`, `crowagent-core`, `crowesg`, `csrd`) and a few static surfaces (`blog/index`, the floating announce-bar pill) render the top-right `.btn-primary-v2.nav-cta` "Start free trial" button with `background-color: rgba(0, 0, 0, 0)` (transparent) and `color: rgb(4, 14, 26)` (dark navy), making the label invisible on the dark page background.

I considered classifying this CRITICAL, then ran a Chromium probe at the same URLs:

```
crowmark.html  Chromium: bg=rgba(0,0,0,0)  color=rgb(4,14,26)  text="Start free trial"
crowmark.html  WebKit:   bg=rgba(0,0,0,0)  color=rgb(4,14,26)  text="Start free trial"
crowcyber.html Chromium: bg=rgba(0,0,0,0)  color=rgb(4,14,26)
blog/index     Chromium: bg=rgba(0,0,0,0)  color=rgb(4,14,26)
about.html     Chromium: bg=rgb(12,201,168) color=rgb(4,14,26)   ← correct teal
pricing.html   Chromium: bg=rgb(12,201,168) color=rgb(4,14,26)   ← correct teal
```

Chromium and WebKit compute identical styles. This is a **cross-browser CSS cascade bug** in the site, not a WebKit parity issue. It is out of scope for the WebKit-parity audit (contract: "fix any browser-specific defects" — this one is universal). Flagged here for a separate global remediation ticket.

---

## Verification gates (all green)

| Gate | Result | Detail |
| --- | --- | --- |
| `tools/sovereign-sheriff.js`        | GREEN | 10/10 sovereign-architecture probes pass |
| `tools/geometric-truth.js`          | GREEN | All geometric probes pass (overlap=0, nav h=72px, hero=1430×1570, earth backdrop renders) |
| `tools/principal-spec-validator.js` | GREEN | 51/51 phases-1+2 spec items |
| `tools/reconciliation-checker.js`   | GREEN | 17/17 sweep checks (incl. 0 inline `<style>`, 16 marquee logos, 34 real product PNGs) |
| Smoke (`tests/smoke.spec.js` chromium) | GREEN | 25 / 25 passed (40.0s) |
| WebKit captures                     | 40 / 40 | All HTTP 200, no pageerrors |

---

## Files modified

**None.** `styles.css` was not edited because zero WebKit-specific defects were observed. Only artefacts produced:

- `_webkit-capture.cjs`, `_webkit-probe.cjs`, `_chromium-compare.cjs`, `_chromium-blog.cjs` — capture/probe scripts (repo-local; safe to delete or keep as audit evidence)
- `C:/tmp/webkit-parity/*.png` — 40 WebKit captures
- `C:/tmp/webkit-parity/_chromium/*.png` — 6 Chromium cross-check captures
- `C:/tmp/webkit-parity/_capture-log.json` — per-page status + timing
- This audit file

---

## Per-page WebKit observations

| Page | Desktop 1440×900 | Mobile 390×844 |
| --- | --- | --- |
| `index.html`           | clean | clean |
| `pricing.html`         | clean | clean |
| `roadmap.html`         | clean | clean |
| `faq.html`             | clean | clean |
| `changelog.html`       | clean | clean |
| `crowmark.html`        | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |
| `crowcyber.html`       | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |
| `crowcash.html`        | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |
| `crowagent-core.html`  | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |
| `crowesg.html`         | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |
| `csrd.html`            | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |
| `about.html`           | clean | clean |
| `contact.html`         | clean | clean |
| `partners.html`        | clean | clean |
| `privacy.html`         | clean | clean |
| `terms.html`           | clean | clean |
| `security.html`        | clean | clean |
| `cookies.html`         | clean | clean |
| `404.html`             | clean | clean |
| `blog/index.html`      | nav-CTA cross-browser bug (also in Chromium — out of scope) | clean |

**WebKit-specific defects: 0.** All "clean" pages render with parity to Chromium captures from prior `/tmp/cluster-*` directories. Backdrop-filter glassmorphism, mask-image fades, gradient text, sticky positioning, and 8K imagery all render correctly in WebKit.

---

## Contract self-disclosure

- 40 / 40 WebKit screenshots captured and Read.
- 4 / 4 internal validator gates GREEN (sheriff, geometric, principal-spec 51/51, reconciliation 17/17).
- Smoke 25 / 25 GREEN (chromium project, matches WebKit/firefox proxy in CI).
- `styles.css` was NOT modified because no WebKit-specific defects exist to fix.
- The product-page nav-CTA bug is a cross-browser cascade issue I observed but explicitly de-scoped per the contract's "fix any browser-specific defects" wording. Flagging it here for a follow-up ticket; not silently absorbing it into this WebKit audit.
- Forbidden files (`js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`, `Assets/css/*`) untouched.
