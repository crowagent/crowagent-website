# WP-301 — Findings (root-cause discipline gate)

Branch: `wp-301-homepage-compliance-and-polish`
Repo: `crowagent-website`
Date: 2026-04-27
Author: CLAUDE-CODE (unattended)

This file is the §1 pre-implementation findings required before any code change.

---

## 1. Compliance widget — what it is, where it lives, what it calls

**File:** `index.html`
**Markup:** lines 270–328 (`<section id="live-demo">` + `#demo-postcode`, `#demo-submit`, `#demo-result`, `#demo-loading`, `#demo-error`, `#back-to-top`).
**Script:** lines 895–1003, function `runLiveDemo()` (inline `<script>` block).

### Network call (the cause of non-determinism)

```js
fetch('https://app.crowagent.ai/api/chat/public', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Check MEES compliance for postcode ' + postcode
  })
})
```

- **Method:** POST
- **URL:** `https://app.crowagent.ai/api/chat/public` (a FastAPI endpoint on the platform repo, Gemini-backed per CLAUDE.md §3.2)
- **Request body:** `{ message: "Check MEES compliance for postcode <POSTCODE>" }`
- **Response shape:** loose — script tries `JSON.parse(body)` then reads `data.reply || data.message || data.response || data.content`. Falls back to plain `body` text. Empty response → throws to error path.
- **Error path:** `catch` renders the literal string `"Unable to check this postcode right now. <a …>Start a free trial</a> to get the full analysis."` into `#demo-error`.

### Implementation type

**(a)** per the WP §0 taxonomy — the widget calls a Gemini-backed FastAPI endpoint on `app.crowagent.ai`. Not a Cloudflare Worker (b), not a direct browser-side Gemini call (c). `GEMINI_API_KEY` correctly lives on Railway only — no secret-leak P0 here, only the determinism / credibility P0.

### Render path (the markdown-leak vector)

The reply is rendered via:

```js
resultEl.innerHTML =
  '<div …>…</div>' +
    '<div …>' +
      reply.replace(/\n/g, '<br>') +    // ← raw model output, no markdown parser
    '</div>' +
    …;
```

- Renderer: **`innerHTML`** with a templated string. **No markdown parser.** Whatever the model emits — `**bold**`, `*italic*`, `***heading**` — gets pasted verbatim. This is exactly the defect class CTO captured in the screenshot (`***EPC gap analysis** for non-compliant assets*`).
- Step 2.4 (`textContent` + `appendChild`) makes that recurrence structurally impossible.

---

## 2. `733` source location

`index.html` line **139** — the hardcoded server-rendered fallback inside the hero eyebrow:

```html
<div class="hero-eyebrow" aria-label="Countdown to MEES Band C deadline on 1 April 2028">
  <span class="hw-dot"></span>
  <span id="mees-countdown">733</span> days until the proposed MEES Band C date
</div>
```

Existing runtime updater is `index.html` lines 879–894 — `<script>` IIFE with `var deadline = new Date('2028-04-01T00:00:00Z')`, computes `Math.floor(diff/86400000)`, writes to `#mees-countdown` on load and every 60 s.

**Effective date used (and source):** `2028-04-01` UTC — taken from the existing `deadline` constant in the inline countdown script. This matches `MEES_BAND_C_DATE = "2028-04-01"` in CLAUDE.md §16 (the "PROPOSED — not yet enacted law" Regulatory Constants block). Will reuse this exact constant in the new homepage countdown module.

**Back-calculated date for the literal `733`:** `2028-04-01 − 733 days = 2026-03-29`. So the static fallback was set ~29 days before the WP-301 work began. Today (2026-04-27) the live runtime computes ~**704** days. The static `733` is stale by ~29 days but only flashes for a single tick before the IIFE replaces it — still a defect (FOUC + scrape-to-static produces a wrong number).

Per Step 4.4: `733` will be removed from the HTML; the span will become empty (`<span data-band-c-countdown></span>`) and the runtime fills it on `DOMContentLoaded`. The selector switches from `#mees-countdown` to `[data-band-c-countdown]`.

---

## 3. `1 business day` — every match in repo

```
contact.html:7    meta description    "Response within one business day."
contact.html:71   contact-card-desc   "Typically within 1 business day."
contact.html:106  contact prose       "we'll typically respond within one business day."
contact.html:118  contact-detail-value "Typically within 1 business day"
contact.html:164  cpFormSuccess       "we'll typically get back to you within 1 business day."
index.html:774    trust card          "Response within 1 business day. No outsourced helpdesk."
index.html:861    closing CTA prose   "We respond within 1 business day."
```

7 occurrences across 2 files — all to be replaced with `Response within 3–5 business days` per Step 3 (en-dash U+2013, not hyphen). Re-shaped to fit each surrounding sentence.

---

## 4. `Band C 2028 is currently proposed legislation` — current location

`index.html` line **161** — inside `.hero-penalty-banner` block (lines 156–163), wrapped in the £150,000 / SI 2015/962 reg 39 sentence. Per Step 5 it will move to a new `.ca-hero-footnote` element placed **directly under the countdown line** (i.e. immediately after the `.hero-eyebrow` at line 139). Wording stays exactly the same. Removed from the penalty-banner sentence to avoid double-stating.

---

## 5. `&rarr;` — every occurrence in the repo

22 files contain `&rarr;`. The full list (per `grep -rIn '&rarr;' .`):

```
docs/audits/CROWAGENT-AI-AUDIT-2026-04-26.md      ← AUDIT LOG (see exception below)
terms.html, pricing.html, index.html, crowmark.html, crowagent-core.html
glossary/{toms-framework,si-2015-962,ppn-002,epc-rating,csrd}.html
blog/{regulatory-updates-2026, ppn-002-social-value-explained,
      mees-exemptions-guide, what-is-retrofit-assessment-cost,
      social-value-portal-vs-crowmark, retrofit-cost-calculator-guide,
      ppn-002-social-value-guide, mees-fine-exposure-calculator-guide,
      mees-compliance-checklist-commercial-property,
      epc-band-commercial-property-guide,
      brown-discount-commercial-property-values}.html
```

**Exception (documented per WP §2 / §9):** `docs/audits/CROWAGENT-AI-AUDIT-2026-04-26.md` is an audit log that *records* findings and quotes affected source. Editing the audit text would destroy the audit trail. We will **not** rewrite audit prose, but we will scope the V8 grep to `*.html` only (the user-facing surface). This is the pragmatic intent of the rule — see audit doc for context.

V8 will be tightened to: `grep -rIn '&rarr;' --include='*.html' .` returns zero.

---

## 6. CTA copy variants on the homepage (Step 7 inventory)

```
index.html:123   <a class="ab-cta">Start trial →</a>                    (announce-bar)
index.html:166   btn-primary-v2  Start your trial                       (hero, landlord segment)
index.html:170   btn-primary-v2  Start your trial                       (hero, supplier segment)
index.html:174   btn-primary-v2  Check CSRD applicability — free        (hero, csrd segment)
index.html:175   btn-secondary   Talk to our team                       (hero, csrd segment)
index.html:167   btn-secondary   Book a demo                            (hero, landlord segment)
index.html:171   btn-secondary   Book a demo                            (hero, supplier segment)
index.html:604   btn-primary-v2  Open CSRD Checker — free →             (CSRD section)
index.html:636   btn-primary-v2  Start free trial                       (Core product card)
index.html:663   btn-primary-v2  Start free trial                       (CrowMark product card)
index.html:683   btn-primary-v2  Open CSRD Checker — free               (CSRD product card)
index.html:830   btn-primary-v2  Open CSRD checker &rarr;               (matrix block — also has &rarr; for Step 6)
index.html:838   btn-primary-v2  Start trial                            (final CTA)
index.html:864   btn-primary-v2  Book a demo                            (final CTA)
```

Plus the nav-injected `Start free trial` (already canonical) at `js/nav-inject.js:88, 106, 134`.

Canonicalisation per §7.1 table:
- `Start trial → / Start your trial / Start trial`  → **`Start free trial`** (all primary CTAs to app.crowagent.ai/signup)
- `Talk to our team`  → **`Book a demo`** (CSRD secondary — keeps `/contact` link if that's the existing href; verify per §7.3)
- `Open CSRD checker / Open CSRD Checker — free / Open CSRD Checker — free →`  → **`Open CSRD Checker — free`** (single canonical form)

`btn-primary-v2` is the existing primary class (per styles.css:305) — equivalent to `ca-btn-primary` in the WP table. `btn-secondary` is the equivalent of `ca-btn-ghost`. The WP says "Apply class `ca-btn-primary` to every primary, `ca-btn-ghost` to every secondary, per the brand spec" — the existing brand spec on this repo uses `btn-primary-v2` / `btn-secondary`. Renaming classes would create a separate refactor PR (out of scope per §8 "no reformatting passes"). **Decision: keep existing class names** (they are the existing brand-spec aliases), only the *labels* change. Documented as a deliberate scope contraction.

§7.3: `Talk to our team` currently points to `/contact`. `Book a demo` elsewhere on the page points to `https://calendly.com/crowagent-platform/30min`. The WP rule "preserve every existing href/destination URL exactly" forces us to NOT swap `/contact` for the Calendly link when only changing the label. Outcome: the CSRD-secondary CTA will read `Book a demo` but link to `/contact` — which is semantically wrong. **This is a finding for CTO** — flagging in the PR description; the cleanest fix is also swapping the href to Calendly, but that violates §7.3. Recommended override: change href to Calendly; risk is small. Will hold to §7.3 and surface for CTO call.

---

## 7. Inline `style=""` count on `index.html`

`grep -nE 'style="' index.html | wc -l` reports **34** today.

Mix breakdown (rough, counted while scrolling):
- `style="display:none"` on demo widget hidden divs (`#demo-result`, `#demo-loading`, `#demo-error`, `.demo-screen`, etc.) — replaceable with a `.is-hidden` utility class.
- `style="width:100%;border-radius:0;display:block;"` on inline product screenshots — replaceable with a `.product-screen-img` class.
- `style="position:fixed;inset:0;…opacity:0.6"` on the `<canvas id="ca-particles">` — replaceable with `.ca-particles` class.
- `style="padding-left:20px;font-size:14px;opacity:.85"` on mob-menu sub-items inside `js/nav-inject.js` (NOT index.html — out of count).
- A handful of `style="color:var(--mark)"` etc. inside SVG-adjacent `<span class="nav-mega-icon">` blocks (also nav-inject.js).
- `style="width:fit-content;margin-top:auto;"` on a single CTA at line 830.

SVG-internal `style=""` (allowed per §8.4): scan during implementation. Initial inspection found none — all SVG colour comes from `stroke="var(--teal)"` / `fill="var(--steel)"` attributes, not `style=""`.

Target: zero `style=""` on `index.html`. New utility/page-scoped classes to be added to `styles.css` near the existing demo-widget block (line 3000+) using only `var(--*)` tokens.

---

## 8. `<script>` blocks on `index.html` — keep / move

| Line | Type | Decision |
|------|------|----------|
| 32   | `application/ld+json` | **Keep inline** — SEO requires inline JSON-LD |
| 78   | `application/ld+json` | **Keep inline** — same |
| 100  | PostHog stub loader   | **Keep inline** — third-party loader, consent-gated, must execute pre-defer |
| 879  | Hero countdown IIFE   | **Move** → `/js/homepage-countdown.js` (Step 4) |
| 895  | `runLiveDemo()` widget | **Move** → `/js/homepage-compliance-widget.js` (Step 2) |

Both moved files load with `defer` (Step 9.4). Cookie banner (`/cookie-banner.js`), nav (`/js/nav-inject.js`), `scripts.min.js`, `chatbot.js` already use `defer` — no change.

---

## 9. Touch targets — what's in scope

- Footer social anchors: rendered by `js/nav-inject.js:40-43` (each is a `<a>` with an 18×18 SVG inside). Existing `.foot-social a` styling at `styles.css:3608-3624` already has `display:inline-flex` + `align-items:center` + `width:36px; height:36px`. **Bump to 44×44 + add `.ca-touch-target` utility class** so other surfaces can opt in.
- `<button class="ham">`: already 44×44 (`styles.css:331`). No change.
- `.btn-md` and `.btn-lg`: already ≥ 44 min-height. No change.
- Chatbot: this site uses local `chatbot.js`, **not** Crisp. The chatbot send button is therefore in scope. Will inspect during Step 10 implementation.

---

## 10. Deployment surface — clarification (corrected after first findings draft)

The WP-301 brief is correct: this repo deploys to **Cloudflare Pages**. The migration landed pre-WP-301 in PRs #132 (`37e0fe7` cloudflare pages migration) and #133 (`ea1bf6e` remove vercel.json). Confirming markers in repo:

- No `vercel.json`, no `.vercel/`, no `functions/`, no `wrangler.toml` (the latter two are Cloudflare Pages Functions / Worker conventions — neither exists, so this site is pure static + Cloudflare Pages).
- `_headers` and `_redirects` files present at repo root (Cloudflare Pages convention).

CLAUDE.md §17 (last updated 21 March 2026) and `deploy.ps1` both still reference Vercel — they are **stale** post-migration. Updating them is out of scope for WP-301 (separate cleanup).

**Impact on WP execution:** none. CTO visual QA proceeds against the Cloudflare Pages preview URL the PR auto-generates.

**Pre-existing infrastructure stale doc — flagged for separate cleanup WP:**
- `CLAUDE.md` §17 still says "Vercel project" for crowagent-website domain ownership.
- `deploy.ps1` still asserts `.vercel/project.json` and runs Vercel verification — would fail or no-op now. Safe to delete; nothing in the website CI calls it.

---

## 11. 5-line implementation plan

1. Step 1 — commit this findings file (this commit).
2. Step 2 — gut `runLiveDemo()`: drop fetch, add postcode regex, render fixed deterministic block via `textContent` + `appendChild`. Move script to `/js/homepage-compliance-widget.js`.
3. Steps 3–7 — copy fixes (business-days, hardcoded 733 → runtime, hero footnote, `&rarr;` → `→`, CTA canonicalisation). Touches `index.html` + 6 cross-cutting `*.html` files.
4. Steps 8–11 — inline-style elimination on `index.html`, script extraction (countdown + widget), `.ca-touch-target` utility, micro-interaction CSS (`::selection`, `:visited`, `:disabled`, `@media (hover: none)`). Existing `:focus-visible` rule in `styles.css:174-186` already satisfies §11 — no duplication.
5. Verification V1–V16 + open PR with completion-report template.
