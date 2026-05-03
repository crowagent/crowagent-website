# crowagent.ai — Comprehensive Enterprise Audit

**Date:** 2026-04-26
**Scope audited:** live `https://crowagent.ai` (Cloudflare-served static HTML) + source `crowagent-website/` (17 root HTML pages, 18 blog posts, 7 glossary entries, 1010-LOC index, ~2.5k LOC vanilla JS, custom CSS tokens, manual deploy via `_headers`/`_redirects`).
**Out of scope:** `app.crowagent.ai` (Next.js on Vercel), `crowagent-platform`, `crowagent-portal`.
**Method:** 12 parallel audit streams (10 specialised sub-agents + 2 my-own mechanical sweeps), live-verified where possible.

**Audit dimensions covered:**
1. Functional / UX / SEO
2. Security / CSP / privacy
3. Code-quality / JS bug
4. Accessibility (WCAG 2.2 AA) + Core Web Vitals
5. Cross-page content drift
6. Mobile / browser compat / PWA / i18n
7. Field-level form-validation tester
8. Visual / micro-UX polish
9. Interactive widget audit (41 widgets, 80+ tests)
10. Persona journey audit (8 personas, 89 steps)
11. Section / breakpoint alignment audit
12. Live mechanical sweep — 26 sitemap URLs, 54 unique internal href, 21 unique assets, 3 redirect rules, JSON-LD price reconciliation

---

## Verdict (1 paragraph)

The site **functions** — every URL returns 200, TTFB is 60–130 ms behind Cloudflare, basic SEO/structured data is present, headers are reasonable. But it would **not pass an enterprise security or quality bar**: CSP runs `'unsafe-inline'` for both scripts and styles, `form-action` and `base-uri` are missing, the chatbot renders API responses via `innerHTML` without sanitisation, the contact form has no CAPTCHA / honeypot / rate-limit, the **staging Railway URL is publicly reachable AND advertised in the production CSP**, the homepage countdown is **hardcoded ("733 days")**, `.env.local` is committed to the repo, three placeholder `test_minimal*.test.js` stubs and a 0-byte `scripts.min.js` (the prod 34 KB build was never committed back) live in the source tree, jest coverage threshold sits at 50 %, no `prefers-reduced-motion` rule, no `srcset`/WebP for hero images, and 17 HTML files duplicate the same `<head>`+nav+footer markup with no template engine. There are also factual / regulatory copy bugs an enterprise compliance buyer will spot in 30 seconds.

**Pricing parity:** verified live + source — JSON-LD and visible body prices match across `/`, `/pricing`, `/crowmark`, `/crowagent-core`. CrowMark Solo £99 / Team £149 / Agency £399. Core Starter £149 / Pro £299 / Portfolio £599. Enterprise from £999. (One earlier P0 finding "Solo £49 in JSON-LD" was an agent hallucination — retracted.)

---

## Section A — What was actually validated end-to-end (verified, not inferred)

| # | Probe | Result |
|---|---|---|
| 1 | All 26 sitemap URLs return 200 with browser UA, TTFB 60–130 ms | OK |
| 2 | `/this-page-does-not-exist-test` returns real **404** | OK |
| 3 | HTTP→HTTPS 301 | OK |
| 4 | HSTS preload header set, max-age=31536000, includeSubDomains | OK |
| 5 | All 54 unique internal hrefs from source resolve → 200 (no 4xx) | OK |
| 6 | All 21 referenced assets (CSS/JS/PNG/SVG/ICO + Calendly external) → 200 | OK |
| 7 | All 3 `_redirects` rules behave as specified (301 → 200) | OK |
| 8 | Pricing parity: visible £ in body == JSON-LD `price` on every product/pricing page | OK |
| 9 | Cache-Control on `*.min.{js,css}` = `public, max-age=31536000, immutable` | OK |
| 10 | Subdomains: `app.crowagent.ai` (Vercel, nonce-CSP), Railway prod, Railway STAGING all reachable from public internet | STAGING reachable = P0 |
| 11 | `www.crowagent.ai` returns 200 with no redirect to apex | split-horizon = P1 |
| 12 | `/.well-known/security.txt` and `/humans.txt` | 404 (P2) |
| 13 | Internal redirects with 1 wasted hop: 18 source links → `/blog/*.html`, `/glossary`, `/products/*`, `/resources.html` | self-inflicted hops = P2 |

---

## Section B — Retractions & low-confidence prior items

| Prior claim | Reality | Status |
|---|---|---|
| **CrowMark Solo £49 in `crowmark.html` JSON-LD** | Live + source both show `"price": "99.00"` | **RETRACTED** — agent hallucination |
| `scripts.min.js` is 0 bytes "in prod" | Local file is 0 bytes; **prod serves 34 493 B**. So local-repo drift, not prod outage | Re-classified P1 (build hygiene) |
| Login link absent from nav | Not verifiable from raw HTML because nav is JS-injected by `nav-inject.js`; needs runtime DOM check | Marked **NEEDS LIVE VERIFICATION** |
| `runLiveDemo()` undefined | Defined inline in `index.html` (the hero demo widget) — agent didn't grep inline scripts | Re-classified P3 (architectural — should be in `scripts.js`) |

---

## Section C — Master defect register

Stable IDs `DEF-001…`. Grouped by severity. Each row is unique (deduplicated across the 12 streams). Live-verified items prefixed ✓; source-inferred prefixed ◇.

### P0 (7) — block before any further marketing push

| ID | Defect | Where | Why P0 | Fix |
|---|---|---|---|---|
| ✓DEF-001 | **Staging Railway URL publicly reachable AND advertised in production CSP** `connect-src` | `_headers`; `crowagent-platform-staging-production.up.railway.app/` returns `405 Allow: GET` (alive) | Cross-env data tampering surface, info disclosure | Remove staging from prod CSP; put staging behind Cloudflare Access / IP allow-list |
| ◇DEF-002 | `.env.local` committed to git | `crowagent-website/.env.local` | History may carry tokens; permanent leak | `git rm --cached .env.local` + `git filter-repo --invert-paths --path .env.local`; rotate any historical secrets |
| ✓DEF-003 | CSP `script-src` and `style-src` both run `'unsafe-inline'` | `_headers` (live) | Defeats CSP entirely — XSS via inline injection on ~20 inline blocks (PostHog init `index.html:99-113`, JSON-LD inline `:32-113` etc.) | Move inline to external; switch to nonce CSP (already done on `app.crowagent.ai` — port that policy) |
| ✓DEF-004 | CSP missing `form-action`, `base-uri`, `object-src`, `worker-src`, `report-to/report-uri` | `_headers` | Form-action hijacking, `<base>` rebasing, no violation telemetry | Add `base-uri 'self'; form-action 'self'; object-src 'none'; worker-src 'self'; report-to default;` + `Reporting-Endpoints` header |
| ◇DEF-005 | Contact form has no honeypot / CAPTCHA / rate-limit, posts to `formspree.io/f/xbdpkaol` (ID hardcoded twice in `scripts.js:866` + `:904`) | `contact.html:127`, partner form, notify-me forms | Trivial spam DoS against the only inbound-sales channel | Add honeypot field + Cloudflare Turnstile; ideally migrate to first-party `app.crowagent.ai/api/contact` |
| ◇DEF-006 | Email fields don't strip `\n`/`\r` before submit | `scripts.js:884-908`, `partners.html:251-256`, CSRD wizard L706 | Mail-header injection (`Bcc:`, `Subject:`) when Formspree pipes to mailer | `value.replace(/[\r\n]+/g,'')` on every email input before send |
| ◇DEF-007 | Chatbot renders API responses via `innerHTML` after a custom Markdown parser that does not validate link URLs | `chatbot.js:243-259, 276, 410` | Stored XSS via `[label](javascript:alert(1))` if backend ever returns crafted text | Use `DOMPurify.sanitize(html, {USE_PROFILES:{html:true}})`; reject `javascript:` / `data:` URLs in the parser |

### P1 (37) — must fix this sprint

#### Security & privacy

| ID | Defect | Where | Fix |
|---|---|---|---|
| ✓DEF-008 | `www.crowagent.ai` returns 200 with no redirect to apex (split-horizon canonical) | `https://www.crowagent.ai/` | Cloudflare 301 rule `www → apex` |
| ✓DEF-009 | `/.well-known/security.txt` is 404 | RFC 9116 | Add file: `Contact:`, `Expires:`, `Encryption:`, `Preferred-Languages:` |
| ◇DEF-010 | Inline 77-line JSON-LD script + inline PostHog init violate CSP nonce strategy | `index.html:32-113`, `:99-113` | Externalise to `/structured-data.js` and `/analytics-init.js` with nonce |
| ◇DEF-011 | PostHog `posthog.init()` runs on every page; consent gate fires inside the `loaded:` callback **after** first init has already happened (~800 ms of pre-consent capture) | `index.html:102-112` + `scripts.js:952` | Block init until `ca_cookie_consent_v2.analytics === true`; otherwise call `posthog.opt_out_capturing()` synchronously before any capture |
| ◇DEF-012 | "Reject all" never calls `posthog.opt_out_capturing()` if PostHog already loaded, and never deletes existing `distinct_id` cookie | `scripts.js:910-975` | On reject: `posthog.opt_out_capturing(); posthog.reset(true);` |
| ◇DEF-013 | API endpoint **and full system prompt** for chatbot are in client JS | `chatbot.js:11-18, 482-490` | Move system prompt server-side; client sends only `{message}` |
| ◇DEF-014 | Partner-form fallback `mailto:` builds an `<a href>` from unescaped user input | `partners.html:308` | HTML-escape `company`, `name`, `email` before string-concat into href |
| ◇DEF-015 | 7 pages have `target="_blank"` without `rel="noopener noreferrer"` | grep across HTML | sed pass: every `target="_blank"` → `target="_blank" rel="noopener noreferrer"` |
| ◇DEF-016 | Privacy policy missing: explicit Google Gemini DPA / SCC reference, Sentry retention, DPO/ICO-complaint paragraph | `privacy.html` L72/99/115 | Add §: lawful basis per process, retention by category, DPO contact, ICO complaint right with link |
| ◇DEF-017 | Cookie policy lists categories but no per-cookie name / lifetime / domain | `cookies.html` | Build live cookie table (PostHog `ph_*`, Cloudflare `__cf_*`, banner `ca_cookie_consent_v2`) |
| ◇DEF-018 | No SRI on Google Fonts CSS, no SRI on Calendly widget JS | `<link rel="stylesheet">`, `https://assets.calendly.com/assets/external/widget.js` | Add `integrity="sha384-…"` + `crossorigin="anonymous"` |

#### Functional / SEO

| ID | Defect | Where | Fix |
|---|---|---|---|
| ✓DEF-019 | Sitemap lists `/products` and `/blog` without trailing slash; server forces 308 → trailing-slash | `sitemap.xml` | Match server canonicalisation; pick one form site-wide |
| ✓DEF-020 | 18 internal source links use `/blog/*.html` (force one 308 hop) and `/resources.html`, `/glossary` | All HTML pages | sed pass: drop `.html`, add `/glossary/` |
| ◇DEF-021 | `roadmap.html` and `resources.html` are stubs (~140-160 LOC) but live in sitemap with priority 0.7 | thin-content SEO penalty | Either fill with real content or 410 + remove from sitemap |
| ◇DEF-022 | Address `Reading, Berkshire RG1 6SP` only in JSON-LD; not visible in body of `contact.html` / `about.html` | UK B2B trust expectation | Add visible address block to both pages |
| ◇DEF-023 | VAT number not published anywhere | Whole site | Add to footer / about / contact (UK B2B convention) |
| ◇DEF-024 | Page `<title>` ≠ `og:title` on `pricing.html`, `crowagent-core.html`, `crowmark.html` | Per page | Standardise `<title>` template `Page — CrowAgent | Compliance Software` |
| ◇DEF-025 | All 17 pages share the same `og:image`; no per-page `og:image:alt` | Every page | Per-page OG (Satori/og-image generator) + `og:image:alt` |
| ◇DEF-026 | No blog post has visible publish date or `Article` JSON-LD `datePublished/dateModified` | 6 posts | Add `<time datetime>` + Article schema with author |
| ◇DEF-027 | Hardcoded "733 days" countdown on hero | `index.html:139` + chatbot system prompt | `setInterval` calculation against `2028-04-01` |

#### Forms & widgets

| ID | Defect | Where | Fix |
|---|---|---|---|
| ◇DEF-028 | Pricing Monthly↔Annual toggle is a `<div onclick="toggleBilling()">` — not keyboard reachable, no `role="switch"`, no `aria-checked`, no `aria-label` | `pricing.html:69` | Convert to `<button role="switch" aria-checked="false" aria-label="Toggle monthly/annual billing">` |
| ◇DEF-029 | Term tooltips MEES/EPC/PPN use `<span tabindex="0" data-tip="…">` — no visible tooltip UI; `data-tip` is never rendered | `index.html:147-154` | Convert to `<button aria-describedby="tip-mees">MEES</button> + <div id="tip-mees" role="tooltip">` |
| ◇DEF-030 | CSRD multi-step state lives only client-side; user can devtools-POST step 3 with empty employees/turnover | `csrd.html`, `scripts.js:706-710` | Server enforce step ordering + presence at `/api/v1/csrd/check` |
| ◇DEF-031 | Chatbot panel has no `role="dialog"`, no Escape-to-close, focus does not move to input on open | `chatbot.js:61-72, 270+` | `panel.role='dialog'; panel.aria-modal=true`; bind Escape; auto-focus input on open; return focus to bubble on close |
| ◇DEF-032 | Mega-menu syncs `data-open` but not `aria-expanded`/`aria-controls`; closes immediately on touch (`mouseenter/mouseleave` listeners only) | `nav-inject.js:66`, `scripts.js:99-115` | Add `aria-controls`; replace mouse listeners with click-first-then-touch logic |
| ◇DEF-033 | Pricing Product Tabs (`.ptab`) have only `.on` class — no `role="tablist"`, no `aria-selected`, no Arrow-key nav | `pricing.html:74-76` | Add ARIA tab pattern + arrow-key handler |
| ◇DEF-034 | Hero Segment Selector (`.seg-btn`) — no Arrow-key nav, selection not persisted across navigation | `index.html:140-144` | Add roving tabindex + arrow handler + `sessionStorage` persistence |
| ◇DEF-035 | Pricing toggle does not also update the JSON-LD `Offer.price` — annual price invisible to crawlers | `pricing.html:30-45` JSON-LD | Render JSON-LD server-side (or remove monthly/annual JSON-LD ambiguity) |
| ◇DEF-036 | Pricing toggle state (Monthly/Annual) does not persist via `localStorage` across navigation | `scripts.js:319-332` | `localStorage.setItem('ca_billing','annual')` |

#### A11y / perf

| ID | Defect | Where | Fix |
|---|---|---|---|
| ◇DEF-037 | No `prefers-reduced-motion` global rule (carousel blink, hover-scale, scroll reveal, chatbot typewriter setInterval, MEES countdown 60 s ticker — all run regardless) | `styles.css`, `chatbot.js:268`, `scripts.js:338-350` | Global CSS rule that zeroes animation/transition durations + JS guards for typewriter & interval |
| ◇DEF-038 | Hero LCP image (`/Assets/screenshots/dashboard.png`) has `loading="eager" fetchpriority="high"` but no `<link rel="preload" as="image" fetchpriority="high">` and no `srcset`/WebP for mobile | `index.html` head + hero | Preload + WebP/AVIF + 1× / 2× srcset |
| ◇DEF-039 | `styles.min.css` is **173 KB** single file with comments and dead light-mode tokens | `https://crowagent.ai/styles.min.css` | Run real minifier (terser/lightningcss) + delete dead light-mode rules |
| ◇DEF-040 | Service worker registration not found in any HTML — SW exists at `/service-worker.js` but is never `register()`-ed; PWA install prompt never fires; offline support absent | `service-worker.js` vs grep across HTML | Add `if('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js')` to nav-inject.js |
| ◇DEF-041 | `manifest.json` lacks 512×512 icon and a maskable-purpose icon → A2HS Android prompt won't fire | `manifest.json` | Add 512 px PNG + `purpose:"maskable any"` |
| ◇DEF-042 | `await fetch()` calls without `AbortSignal.timeout` — CSRD wizard, partner form, notify-me form, chatbot can hang forever | `scripts.js:447-459, 584, 702`, `chatbot.js:482` | `AbortSignal.timeout(8000)` + visible "try again" |
| ◇DEF-043 | `setInterval(advance, 7000)` in carousel never cleared (timer leak) | `scripts.js:415` | Save id + `clearInterval` on `pagehide` |
| ◇DEF-044 | `setInterval` in `chatbot.js:268` typewriter never cleared between consecutive renders (timer leak) | `chatbot.js` | Track `tw_interval`, clear before next |

#### Code & build hygiene

| ID | Defect | Where | Fix |
|---|---|---|---|
| ◇DEF-045 | `scripts.min.js` committed as 0 bytes locally (prod has 34 KB, but next deploy from this tree would white-screen the site) | `crowagent-website/scripts.min.js` | Run minifier in pre-commit / CI, or commit the artifact |
| ◇DEF-046 | jest coverage threshold = **50 %** and only `scripts.js` is in `collectCoverageFrom` | `jest.config.js` | Raise to 75 %; add `chatbot.js`, `cookie-banner.js`, `service-worker.js` |
| ◇DEF-047 | Three placeholder tests `test_minimal{,2,3}.test.js` (1 LOC each) | repo root | Delete |
| ◇DEF-048 | 17 HTML files duplicate `<head>`+nav+footer markup (~495 KB total). nav-inject covers nav, but `<head>`/`<style>`/JSON-LD still hand-maintained per file | All `*.html` | Migrate to 11ty / Astro / Next static export |
| ◇DEF-049 | `crowagent-website/CLAUDE.md` (22 KB) lists obsolete plan names ("Starter £49 / Professional £149"); contradicts current Solo £99 / Team £149 | repo CLAUDE.md | Sync with live; delete duplicate of repo-root CLAUDE.md |

### P2 (≈ 95) — backlog (grouped one-liners)

**Headers & CSP (8):** Add `Cross-Origin-Opener-Policy: same-origin`, `COEP: require-corp` (after image audit), `CORP: same-site`, `Surrogate-Control` for Cloudflare-edge caching, `manifest-src 'self'`, `media-src 'none'`, `frame-src` whitelist for non-Calendly, `Content-Security-Policy-Report-Only` on staging path.

**SEO / structured data (10):** Sitemap `lastmod` is uniform 2026-04-08 (auto-generate from mtime); meta descriptions over 160 chars on `crowmark.html`/`crowagent-core.html`; `crowagent-core.html` h2/h3 hierarchy skip; Twitter handle drift `x.com/CrowAgentLtd` vs `@crowagent_ai`; per-post Article schema; canonical URL audit; CSRD page lacks Calendly CTA (only contact form); `/contact?topic=csrd` query param does not pre-select dropdown; OG image alt missing 40+ pages; no `/press`, `/media`, or downloadable kit.

**Forms (12):** All forms `novalidate`; consent-checkbox label 24 words wraps badly mobile; `cp-email` regex accepts `a@b`; missing `autocomplete` on partner / CSRD / notify / chatbot inputs; CSRD step-1 reset doesn't clear `.csrd-option.selected` visual; `errBox.className` overwritten twice (`scripts.js:468`); silent `catch` on `JSON.parse(localStorage)` (`scripts.js:925, 1041`); chatbot has no client rate-limit; double-submit window between click and `disabled=true`; success message tone vague; `cookie-banner.js` injects HTML via `tempDiv.innerHTML`; "FR coming soon" locale visible but broken.

**Widgets (12):** Carousel: no `aria-roledescription="carousel"`, no Arrow-key nav, dots small tap target; Mobile menu: documented as good (focus-trap, Esc, scroll lock all present — keep); CSRD result panel: no `role="status"`/`aria-live`; Mega-menu: no auto-focus on first item; Tabs everywhere lack arrow nav; Card hover styles trigger on touch; pricing comparison `<th>` lacks `scope="col"`; FAQ uses native `<details>` on `faq.html` but custom JS pattern on `pricing.html` — pick one; locale dropdown `min-width:170px` overflows 375 px; announce-bar `.ab-close` 28×28 px sub-44 px; chatbot input 14 px font triggers iOS focus zoom (need ≥ 16 px); `.btn-sm`, `.seg-btn`, `.ca-input-send` (38 px), social icons (32 px) all sub-44 px touch.

**Performance / assets (10):** Service-worker `CACHE_NAME='crowagent-v51'` manually bumped (auto-version from build); SW offline fallback returns `/index.html` (which redirects unauthenticated → broken offline UX); SW precache list contains `/pricing` (no `.html`) — must match `_redirects`; Calendly iframe in `/demo` not `loading="lazy"` and not sandboxed; 6 Google Font weights with no `&subset=latin`; inline `<style>` blocks across HTML pages defeat CSP — consolidate; preload only the LCP image; defer non-critical JS; `print.css` → black-on-white forces dark sections; `chatbot.js` 30 s auto-open is desktop-only (mobile users never see it).

**Mobile / breakpoint alignment (15):** Live demo widget input+button row overflows at 375 px; segment selector buttons don't stack at 480 px; `.locale-dropdown min-width:170px`, `.ca-notify-input 200px`, `.notify-input 160px` all overflow ≤ 375 px; `.ab-text white-space:nowrap`, `.ticker-item` no scroll affordance, cookie buttons `white-space:nowrap`; pricing comparison table at 320 px loses scroll affordance; pricing card column transition 768→1024 px misaligns heights; founders grid breakpoint at 769 px (non-standard); chatbot panel `bottom:92px` overlaps cookie banner ≤ 480 px; `<canvas id="ca-particles">` decorative but missing `aria-hidden`; 2 px hover-lift inconsistency between `.btn-ghost-sm`/`.btn-teal-sm`; no `@media (hover:none)` to strip hover styles on touch; `@supports(grid-template-rows:subgrid)` used without fallback (Safari < 17 breaks); status dot fetches `/api/v1/health` but site is static — request will 404.

**Privacy / cookies (5):** Cookie banner appears 800 ms after PostHog init; no per-category granularity beyond Necessary/Analytics/Marketing; `ca_cookie_consent_v2` localStorage has no expiry → re-consent never re-triggers; no Modern Slavery statement page (UK ≥ £36 m turnover requires); cookies.html not yet linked from every legal page footer.

**Code quality (12):** `scripts.js` 1482 LOC monolith; `chatbot.js` Markdown parser allows `[x](javascript:)`; hardcoded GBP→EUR 1.18 / GBP→USD 1.28 FX rates with no warning; `verify-light-theme.js` exists but no theme switcher in HTML — dead code; `coverage/`, `audit_website.txt`, four `DEBUG-REPORT-*.md` / `E2E-AUDIT-REPORT-*.md` / `LIGHT-THEME-DEPLOYMENT-CHECKLIST.md` committed; mixed deploy targets (`_headers`+`_redirects` Cloudflare AND `.vercel/`); no CI runs `npm audit`/Lighthouse/axe/Pa11y/link-check on this repo; pre-commit doesn't run a linter or formatter; brand name "CrowAgent" vs "Crowagent" capitalisation drift; some images served as PNG where WebP would shave ~30 %; chatbot CORS request mode default `same-origin` to a different origin; no `humans.txt`.

**Visual / micro-UX (11):** No `button:disabled` styling (no `cursor:not-allowed`/opacity); no `:visited` link styling; no `::selection` brand colour; no per-page custom `:focus-visible` on cards; CTA verb chaos ("Get started" / "Book a demo" / "Start free trial"); button arrow `→` / `&rarr;` inconsistent across pages; cookie banner timing creates visible flash; `view-transition: same-origin` declared but no transition tokens defined; success/error messages non-actionable; loading state missing on every async action — UI freezes; "Annual save 10 %" not shown as side-by-side comparison.

### P3 (~50) — polish (one-liner each)

Trademark/® inconsistency review · pluralisation handling for `1 plan / 2 plans` · date format DD/MM vs ISO mix in blog · `m²` vs `sq m` units · `.ham` button only 44 px (footer social only 32 px) · unused `@keyframes shimmerSweep`, `status-pulse`, `step-complete` (~0.5 KB dead) · `.demo-section display:none` styles still ship · redundant `.mob-menu` transition rules · multiple `@media (max-width:640px)` blocks should consolidate · `position:absolute right:16px` on `.ab-close` could use `inset-inline-end` · hardcoded `rgba(0,0,0,…)` shadow values should be a CSS var · "Translation coming soon" FR locale visible · partners.html `.partner-form` description uses `maxlength="200"` (inconsistent) · partner form `description` has placeholder text but no help-text association · several `<th>` cells lack `scope` attribute · footer alignment differs slightly between `about.html` and others · several inline `style="max-width:960px;"` overrides should be a class · grid baseline not snapped to 8 px multiples · scroll-snap not used on mobile carousel · favicon-180 (iPad) missing · Calendly URL hardcoded in 5+ files · "Coming soon" suffix on roadmap headlines · roadmap.html dates use month-year format inconsistently · `.foot-grid` 2→4 column transition jumps at 1024 · share buttons on CSRD use `window.open` without `noopener` · `data-m`/`data-a` on price spans don't follow a documented schema · animated counters fire even if user has reduced-motion · chatbot `system_prompt` sent on every request (token waste) · cookie banner buttons `white-space:nowrap` overflow narrow · skip-link not visible on first Tab in some pages · image `alt="logo"` instead of `alt="CrowAgent"` · `fonts.gstatic.com` preconnect missing `crossorigin="anonymous"` · `<noscript>` fallback only on `demo.html` · `aria-label="Postcode"` redundant if `<label for>` present · `manifest.json` `display="standalone"` correct but no `display_override` · per-page `theme-color` mostly `#040E1A` but `partners.html:17` is `#0A1F3A` (token drift) · `humans.txt` 404 (informational) · `print.css` has no `@page { margin }` · partner form `description` field caps at 200 chars but no live counter · view-transitions opt-in but nothing actually transitions · several blog posts lack a "Last updated" timestamp · CSRD verdict copy doesn't link to EU Omnibus I press release · no `/security` page CTA to "Talk to compliance" · sub-processor list missing country flags / SCC link per processor.

---

## Section D — Cross-cutting root causes (the 5 things that, fixed, kill 60 % of the backlog)

1. **No template engine.** Migrating 17 HTML pages → 11ty/Astro deletes ~50 % of duplication defects (per-page OG, head meta, JSON-LD drift, copyright year, address, plan names, footer alignment).
2. **Cloudflare-Pages vs Vercel deploy ambiguity.** Choose one. The 0-byte `scripts.min.js`, mixed `.vercel/` + `_headers`/`_redirects` artifacts, and silent `verify-light-theme.js` are all symptoms.
3. **Marketing-site CSP an order of magnitude weaker than `app.crowagent.ai`.** Port the platform's nonce-CSP + `report-uri /api/csp-report`.
4. **No automated quality gate.** Lighthouse-CI / axe-CI / Pa11y / link-check / `npm audit` / Snyk should run on every push and block merge below thresholds.
5. **Form layer is paste-coded, not abstracted.** A single `lib/form-submit.js` would solve `\n` stripping, double-submit, ARIA-live, autocomplete, telemetry, and Formspree → first-party migration in one place.

---

## Section E — Severity tally & fix sequencing

| Bucket | Count | Wallclock |
|---|---|---|
| P0 | 7 | Same day, 4–6 h hot-fix branch |
| P1 | 37 | Sprint 1 (~5 days, ~30 h) |
| P2 | ~95 | Sprint 2 + 3 (~10 days, ~60 h) |
| P3 | ~50 | Backlog grooming (~20 h) |
| Strengths preserved | ~15 | Don't break |

**Recommended sequence**

1. **Hot-fix (today)** — DEF-001, -002, -003 partial (`base-uri` + `form-action` only), DEF-005 (Turnstile), DEF-006 (`\n` strip), DEF-027 (countdown), DEF-045 (commit `scripts.min.js`), DEF-008 (www→apex).
2. **Sprint 1** — DEF-003 full (nonce CSP), DEF-004 (full directives), DEF-007 (DOMPurify), DEF-009-012 (privacy/cookie wiring), DEF-019-021 (sitemap/redirect/stub pages), DEF-028-031 (toggle / tooltip / CSRD step / chatbot dialog), DEF-037 (`prefers-reduced-motion`), DEF-038 (LCP preload + WebP), DEF-046-047 (jest threshold + delete stub tests), DEF-049 (CLAUDE.md sync).
3. **Sprint 2 — Foundation** — Migrate to 11ty/Astro (DEF-048); first-party form abstraction; Lighthouse-CI / axe-CI in PR workflow; per-page OG generator; SW registration on every page; `manifest.json` 512 + maskable.
4. **Sprint 3 — Compliance polish** — Sub-processor table, Modern Slavery statement, ICO complaint paragraph, Gemini DPA reference, cookie inventory, post-Omnibus I CSRD copy, hyperlink every regulation reference.

---

## Section F — What's actually strong (don't regress)

- HSTS preload set, X-Frame-Options DENY + `frame-ancestors 'none'`, Permissions-Policy zeroes camera/mic/geo/FLoC, Cloudflare NEL telemetry.
- Clean-URL canonicals (no .html in production URLs).
- JSON-LD Organization on every page; **prices consistent across body + JSON-LD on every product/pricing page** (verified live).
- All sitemap URLs return 200; no broken assets; all redirect rules behave.
- Mobile hamburger menu is the cleanest widget on the site — focus trap, Esc handler, scroll lock, ARIA dialog, focus return on close all present.
- CSRD wizard 2-step UX is best-in-class for a compliance tool.
- Live demo widget removes scepticism without login.
- Calendly embedded inline on `/demo` → no redirect friction.
- Comprehensive AI-bot block list in `robots.txt` plus Cloudflare Content-Signal.
- Service worker exists and a `print.css` exists — both rare for marketing sites.
- Trust signals (security badges, founder names, ICO registration) visible above the fold.

---

## Section G — Why the site reads "not visibly very professional" (UX diagnosis)

### Root causes (evidence from live homepage HTML)

1. **Zero social proof.** Searched live homepage for `testimonial / quote / case-study / client-logo / featured-in / trusted-by` → **0 hits**. Trust strip lists technical claims (AES-256, GDPR, UK data residency, ISO 27001 aligned, 99.5% uptime target) instead of customer logos. Self-asserted, not third-party verified. `G-Cloud 16 listed` exists in source but is **HTML-commented out**.
2. **Three competing value props in the hero** — segment selector "I am a… Commercial Landlord / Public Sector Supplier / Sustainability / CSRD" is a confession that positioning isn't picked.
3. **6 different competing CTAs** within first viewport: `Start trial →`, `Start your trial`, `Start free trial`, `Book a demo`, `Talk to our team`, `Check CSRD applicability — free`, `Open CSRD Checker — free →`. Three variants of "trial", two of "CSRD checker".
4. **Hardcoded "733 days" countdown** visible on hero — rots daily.
5. **"Band C 2028 is currently proposed legislation"** disclaimer immediately below hero CTA — defensive lawyering above the fold.
6. **Regulations-as-logos strip** ("MEES 2028 Band C Proposed", "PPN 002 Mandatory Since Feb 2025", "Procurement Act 2023", "SI 2015/962 Reg 39 · £150K", etc.) — replaces what would normally be customer logos.
7. **Mixed arrow encoding** `→` and `&rarr;` in adjacent buttons — different authors, different sessions.
8. **Founder card uses initials-avatars** instead of real photos — pre-seed startup tell.
9. **29 inline `style=""` attributes + 10 inline `<script>` blocks** on the homepage alone — design system not enforced; spacing/colour drift visible.
10. **Generic 2024-era SaaS visual fingerprint** — dark navy + teal accent + left-aligned hero + three-column "how it works" + icon grids + segmented control. Competent but indistinguishable from 200 other B2B tools.
11. **No micro-interactions**: no `:visited`, no `::selection`, no `button:disabled` styling, no focus rings on cards, no `@media (hover: none)` for touch, sub-44 px touch targets, loading state missing on every async action.
12. **Five chrome elements** (chatbot bubble + cookie banner + announce bar + back-to-top + segment selector) compete for above-the-fold attention.

### What would change perception fastest (impact-per-hour)

1. Add **5 real customer logos** (or pilot logos with "Pilot" badges) directly under hero. Replace regulations-as-logos strip.
2. **One real customer testimonial** with name + title + photo + company above the fold. One. Not three. Not a carousel.
3. **Pick one positioning** for hero — pick CrowAgent Core (MEES, most quantifiable). Drop segment selector. Move CrowMark + CSRD to nav as separate products.
4. **Pick one primary CTA** ("Start free trial") + one secondary ("Book a demo"). Search-and-replace the other 5 variants out.
5. **Replace founder initials with real photos.** Same about-page, 1 hour.
6. **Add 30-sec product video / Loom embed** in hero replacing static screenshot. Animation = "this is real software". Static PNG = "we didn't film a demo because we don't have one".
7. **Move "proposed legislation" disclaimer** off hero into a footnote.
8. **Hide chatbot bubble for first 30 s on mobile.**
9. **Fix hardcoded countdown** (also DEF-027).
10. **Surface real framework membership** (G-Cloud / NHS / CCS) the moment it's claimable.

Items 1–4 alone, in one focused day, materially move the "doesn't look professional" perception.

---

## Section H — Recommended frontend test program

What was done in this audit was static & semi-automated (~60 % of defects). A real test program runs at six layers; four are missing here.

| Layer | Tool | Status |
|---|---|---|
| 1. Static / linting | ESLint, Stylelint, htmlhint, Prettier, axe-linter | **Missing** — no linter in pre-commit |
| 2. Headless functional | Playwright or Cypress | **Missing** — `playwright.config.ts` exists in `crowagent-platform/web`, none in `crowagent-website` |
| 3. Visual regression | Percy / Chromatic / Playwright `toHaveScreenshot()` | **Missing** |
| 4. Performance / Web Vitals | Lighthouse-CI (PR), WebPageTest, PostHog Web Vitals (RUM) | **Partial** — `lighthouserc.json` lives in `web/`, not `crowagent-website/` |
| 5. Accessibility | axe-core in Playwright, Pa11y, manual NVDA / VoiceOver | **Missing** |
| 6. Cross-browser / device | BrowserStack, real iPhone + Pixel + iPad | **Missing** |
| 7. Real-user behaviour | PostHog session replay + heatmaps + funnels | **Missing** — session replay not enabled |
| 8. Qualitative UX | 5-second test (UsabilityHub), moderated UserTesting / Maze sessions | **Missing — answers the "doesn't look professional" feedback directly** |

### Priority adds this month (2 weeks)

1. **PostHog session replay + heatmap on `/`, `/pricing`, `/contact`, `/csrd`** — turn it on tonight; already paid for.
2. **Playwright suite — 25 smoke tests** covering every nav link, every CTA destination, contact-form happy & sad, CSRD wizard end-to-end, chatbot open/close, cookie banner accept/reject, all 6 blog posts. ~1 day.
3. **Lighthouse-CI in PR workflow** with budgets: perf ≥ 90 mobile, a11y = 100, SEO = 100. Block merge below.
4. **axe-core inside same Playwright run** — fail build on any `serious`/`critical` violation. ~1 hr.
5. **Five real iPhones (TestFlight or BrowserStack)** at iPhone SE 1st gen (320 px), iPhone 12 (390 px), Pixel 6 (412 px), iPad mini, MacBook 13″.
6. **5 moderated user tests** via UserTesting or Maze — script: *"You're a UK landlord with 25 commercial properties. Find out what this product would cost you and what penalty exposure you have. Think out loud."*
7. **First-impression test** (UsabilityHub 5-second test) — show hero for 5 s to 10 strangers; ask "what does this company do?" and "would you trust them with your data?" ~$50.

---

**Total raw findings across 12 streams:** ~500 · **Deduplicated:** **189** (P0: 7 · P1: 37 · P2: ≈ 95 · P3: ≈ 50). One prior P0 retracted. One prior "deploy break" demoted to build hygiene.
