# NAV + FOOTER FORENSIC AUDIT — Astro rebuild vs live production

**Date:** 2026-08-02
**Mode:** READ-ONLY. No file was modified. No build, install or test suite was run.

## Files audited

| Role | Path |
|---|---|
| Astro nav | `astro/src/components/nav/Nav.astro` |
| Astro nav data | `astro/src/data/nav.ts` |
| Astro footer | `astro/src/components/footer/Footer.astro` |
| Astro footer data | `astro/src/data/footer.ts` |
| Astro shell | `astro/src/layouts/Base.astro` |
| Astro button | `astro/src/components/ui/Button.astro` |
| Astro tokens | `astro/src/styles/tokens.css` |
| Astro config | `astro/astro.config.mjs` |
| **Live source of truth** | `js/nav-inject.js` (`NAV_HTML` L270–429, `FOOTER_HTML` L444–639, behaviour L820–1163) |
| Live cookie hooks | `js/cookie-banner.js` L419–429 |
| Live status hooks | `scripts.js` L356–378 |
| Live nav CSS | `Assets/css/nav-global-fix-2026-05-27.css` |

Live markup was fetched to the scratchpad (`https://crowagent.ai/`, `https://crowagent.ai/about`) and confirmed to contain only the `id="ca-nav"` placeholder — the nav and footer are injected client-side, so `js/nav-inject.js` is the comparison baseline, as briefed. Live redirect behaviour was probed directly with `curl`.

---

## Summary

| Severity | Count |
|---|---|
| **P0 — broken** | 7 |
| **P1 — parity gap** | 12 |
| **P2 — polish** | 13 |
| **Total** | **32** |

### The five most serious

1. **NF-01** — the Products dropdown can never be closed. CSS `:hover` / `:focus-within` open rules override every JS close path.
2. **NF-03** — the nav search button is a dead control: `data-cmdk-open` has no handler anywhere in `astro/src`, and no Ctrl/Cmd-K listener exists.
3. **NF-04** — the sitewide primary CTA ("Request access") points at `/contact?…`, which is not a route in the Astro build.
4. **NF-05 / NF-06** — 15 of 17 distinct nav destinations and 17 of 21 footer destinations 404 against the current Astro route list, with nothing in the components or the build gating against it.
5. **NF-07** — the "Cookie preferences" control is inert and its route 404s: no cookie banner is loaded in the Astro shell, so there is no consent-withdrawal path at all.

---

# 1. LINK PARITY

## 1.1 Nav — desktop

Live column derived from `js/nav-inject.js`. Astro column derived from `astro/src/data/nav.ts` as consumed by `astro/src/components/nav/Nav.astro`.

| Live href | Live line | Astro href | Astro line | Parity | Route exists in Astro build? |
|---|---|---|---|---|---|
| `/` (logo) | nav-inject.js:298 | `/` | nav.ts:38 → Nav.astro:56 | ✅ identical | ✅ `/` |
| `/crowmark` (**Products trigger, an `<a>`**) | nav-inject.js:320 | *(none — rendered as `<button>`)* | Nav.astro:82–96 | ⚠️ **link removed** | n/a |
| `/crowmark` | nav-inject.js:334 | `/crowmark` | nav.ts:56 → Nav.astro:103 | ✅ identical | ❌ **404** |
| `/crowmark-buyers` | nav-inject.js:335 | `/crowmark-buyers` | nav.ts:63 | ✅ identical | ❌ **404** |
| `/compare` | nav-inject.js:336 | `/compare` | nav.ts:70 | ✅ identical | ⚠️ **308 → `/compare/`** |
| `/pricing` | nav-inject.js:337 | `/pricing` | nav.ts:77 | ✅ identical | ❌ **404** |
| `/tools/ppn-002-calculator` | nav-inject.js:341 | `/tools/ppn-002-calculator` | nav.ts:89 | ✅ identical | ❌ **404** |
| `/tools/ppn-002-calculator/methodology` | nav-inject.js:342 | `/tools/ppn-002-calculator/methodology` | nav.ts:96 | ✅ identical | ❌ **404** |
| `/tools/` | nav-inject.js:343 | `/tools/` | nav.ts:103 | ✅ identical | ❌ **404** |
| `/pricing` | nav-inject.js:348 | `/pricing` | nav.ts:115 → Nav.astro:147 | ✅ identical | ❌ **404** |
| `/blog` | nav-inject.js:349 | `/blog` | nav.ts:116 | ✅ identical | ⚠️ **308 → `/blog/`** |
| `/faq` | nav-inject.js:351 | `/faq` | nav.ts:117 | ✅ identical | ❌ **404** |
| `/about` | nav-inject.js:352 | `/about` | nav.ts:118 | ✅ identical | ❌ **404** |
| `https://app.crowagent.ai/login` | nav-inject.js:362 | same | nav.ts:124 → Nav.astro:179 | ✅ identical (`target`/`rel` preserved) | external ✅ |
| `/contact?enquiry=limited-access#contact-form` | nav-inject.js:371 | same | nav.ts:128 → Nav.astro:182 | ✅ identical | ❌ **404** |

**No link exists in Astro that does not exist live.** One link is *lost*: the Products trigger (NF-24).

## 1.2 Nav — mobile menu

| Live href | Live line | Astro href | Astro line | Parity | Route exists? |
|---|---|---|---|---|---|
| `/crowmark` | nav-inject.js:409 | `/crowmark` | nav.ts:144 → Nav.astro:213 | ✅ | ❌ 404 |
| `/crowmark-buyers` | nav-inject.js:410 | `/crowmark-buyers` | nav.ts:145 | ✅ | ❌ 404 |
| `/compare` | nav-inject.js:411 | `/compare` | nav.ts:146 | ✅ | ⚠️ 308 |
| `/pricing` | nav-inject.js:412 | `/pricing` | nav.ts:147 | ✅ | ❌ 404 |
| `/tools/ppn-002-calculator` ("Free PPN 002 calculator") | nav-inject.js:413 | same label + href | nav.ts:148 | ✅ | ❌ 404 |
| `/tools` (**no trailing slash — differs from the desktop `/tools/`**) | nav-inject.js:414 | `/tools` | nav.ts:149 | ✅ mismatch preserved verbatim | ❌ 404 (and would 308 if it existed) |
| `/pricing` `/blog` `/faq` `/about` | nav-inject.js:418–421 | same | nav.ts:153–156 → Nav.astro:222 | ✅ | ❌/⚠️ as above |
| Sign in + Request access | nav-inject.js:424,426 | same | Nav.astro:229,232 | ✅ | external ✅ / ❌ 404 |

## 1.3 Footer

| Column | Live href | Live line | Astro href | Astro line | Parity | Route exists? |
|---|---|---|---|---|---|---|
| brand logo | `/` | nav-inject.js:490 | `/` | Footer.astro:45 | ✅ | ✅ |
| Product | `/crowmark` | 532 | `/crowmark` | footer.ts:100 | ✅ | ❌ 404 |
| Product | `/crowmark-buyers` | 533 | same | footer.ts:101 | ✅ | ❌ 404 |
| Product | `/pricing` | 543 | same | footer.ts:102 | ✅ | ❌ 404 |
| Product | `/integrations` | 544 | same | footer.ts:103 | ✅ | ❌ 404 |
| Product | `/sectors/` | 545 | same | footer.ts:104 | ✅ | ✅ `/sectors/` |
| Product | `/tools/ppn-002-calculator` + "Free" chip | 546 | same + `chip:'Free'` | footer.ts:105 | ✅ | ❌ 404 |
| Resources | `/resources` | 571 | same | footer.ts:111 | ✅ | ❌ 404 |
| Resources | `/blog` | 572 | same | footer.ts:112 | ✅ | ⚠️ 308 |
| Resources | `/compare` | 573 | same | footer.ts:113 | ✅ | ⚠️ 308 |
| Resources | `/faq` | 574 | same | footer.ts:114 | ✅ | ❌ 404 |
| Resources | `/glossary` ("Procurement Glossary") | 579 | same | footer.ts:115 | ✅ | ⚠️ 308 |
| Resources | `/changelog` | 580 | same | footer.ts:116 | ✅ | ❌ 404 |
| Company | `/about` `/roadmap` `/contact` `/partners` | 594–597 | same | footer.ts:122–125 | ✅ | ❌ 404 ×4 |
| Legal | `/security` `/privacy` `/terms` `/cookies` | 610–613 | same | footer.ts:131–134 | ✅ | ❌ 404 ×4 |
| Legal | `/cookie-preferences` **`id="ca-cookie-reopen-footer"`** | 614 | `/cookie-preferences`, **id dropped** | footer.ts:135 → Footer.astro:98 | ⚠️ **attribute lost** | ❌ 404 |
| Bottom | Companies House `…/company/17076461` | 631 | same | footer.ts:142 → Footer.astro:115 | ✅ `target`/`rel` preserved | external ✅ |
| Bottom | `https://status.crowagent.ai` | 634 | same | footer.ts:146 → Footer.astro:120 | ✅ `target`/`rel` preserved | external ✅ |
| Bottom | `/cookie-preferences` **`id="ca-cookie-reopen" class="cookie-reopen-link"`** | 635 | `/cookie-preferences`, **id + class dropped** | footer.ts:147 → Footer.astro:123 | ⚠️ **attributes lost** | ❌ 404 |
| Social ×5 | LinkedIn / X / YouTube / Medium / Instagram | 218–228 | identical hrefs + `d` paths | footer.ts:67–94 → Footer.astro:76–88 | ✅ `target`/`rel`/`aria-label` preserved; **`class="ca-touch-target"` dropped** | external ✅ |

**Footer link set is complete and byte-identical in destination.** Nothing added, nothing removed. Only attributes were lost.

## 1.4 Trailing-slash behaviour (verified live with curl)

```
/blog       308 -> https://crowagent.ai/blog/
/sectors    308 -> https://crowagent.ai/sectors/
/compare    308 -> https://crowagent.ai/compare/
/glossary   308 -> https://crowagent.ai/glossary/
/tools      308 -> https://crowagent.ai/tools/
```

`astro.config.mjs:17` sets `trailingSlash: 'ignore'` and `build.format: 'directory'`. Cloudflare Pages resolves the slash-less form with a **308**, not a 200. Every nav/footer href to a directory route (`/blog`, `/compare`, `/glossary`, `/tools`) therefore costs a redirect hop on every page of the site. This is *parity-preserved* — the legacy hrefs are identical, so it is not a regression — but it is a live defect being carried forward, and it becomes an SEO problem in combination with NF-17.

---

# 2. ACCESSIBILITY — WCAG 2.2 AA

## 2.1 Answers to the specific questions asked

| Question | Answer |
|---|---|
| Mobile toggle a real `<button>` with a truthful `aria-expanded` and a valid `aria-controls`? | **Yes.** `Nav.astro:185` `<button type="button" … aria-expanded="false" aria-controls="mob-menu">`; updated at `Nav.astro:284`; `#mob-menu` exists at `Nav.astro:191`. Accessible name is also kept in sync (`Nav.astro:285`). |
| Keyboard trap in the mobile menu (2.1.2)? | **No trap.** `trapFocus` (`Nav.astro:244–271`) wraps Tab and releases on **Escape** (`Nav.astro:252–255`), and focus is returned to the opener (`Nav.astro:298`). Passes 2.1.2. |
| Does the Products dropdown work by keyboard, not only hover? | **Opens by keyboard, but cannot be closed by keyboard — see NF-01/NF-02.** |
| 44px target floor? | **No.** See NF-13/NF-14. Note: WCAG 2.2 **AA** 2.5.8 is a **24×24 CSS px** minimum; 44px is 2.5.5 (AAA) and this repo's own `CLAUDE.md` rule 12. Findings are graded against both, stated explicitly. |
| Visible `:focus-visible` on every interactive element? | **No.** See NF-16. |
| Nested interactive elements / unnamed icon links? | **None in the Astro build.** This is an *improvement* — see "Defects the rebuild fixes". |
| `aria-current="page"` on the current page? | **Yes, but over-applied.** See NF-11 and NF-12. |

## 2.2 Findings

| ID | Sev | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| **NF-01** | **P0** | **The Products dropdown can never be closed.** `Nav.astro:469-473` opens the panel on `:hover`, `:focus-within` **or** `.force-open`. The JS toggle only removes `.force-open` (`Nav.astro:313-320`). Clicking a `<button>` focuses it in Chrome/Firefox/Edge, so `:focus-within` stays true after the click and the panel stays visibly open while `aria-expanded` is flipped to `"false"` (`Nav.astro:315`). | `Nav.astro:469-473`, `313-320`, `331-333` | Functional break plus **WCAG 4.1.2** (state reported does not match state rendered) and **1.4.13 Dismissible** (hover/focus content with no dismiss). The `sync()` handler at `Nav.astro:337-343` only fires on mouse/focus events, so it never corrects the post-click mismatch. |
| **NF-02** | **P0** | **Escape does not close the dropdown either.** `Nav.astro:322-329` removes `.force-open` and then calls `trigger.focus()` — which re-satisfies `:focus-within`, so the panel stays open. The documented behaviour in the component's own header comment (`Nav.astro:19-21`, "Escape closes it and returns focus to the trigger") is not what the code does. | `Nav.astro:322-329` vs `469-473` | Same root cause as NF-01. **1.4.13** requires dismissal without moving pointer or focus. |
| **NF-03** | **P0** | **Search button is a dead control.** `Nav.astro:155-178` renders a button with `data-cmdk-open`, `aria-label="Search (Ctrl K)"` and a visible `Ctrl K` badge. `grep` over `astro/src` returns **zero** handlers for `data-cmdk-open`, zero `SovereignCmdK`, and no Ctrl/Cmd-K keydown listener. Live wires it at `js/nav-inject.js:912-938`. | `Nav.astro:155-178`; `nav-inject.js:912-938` | A control that announces a name and a keyboard shortcut and does nothing. **4.1.2**, and a broken promise to every user. `astro/public/` is empty and `package.json` has no palette dependency, so nothing supplies it later. |
| **NF-04** | **P0** | **Primary sitewide CTA 404s.** `Request access` → `/contact?enquiry=limited-access#contact-form` (`nav.ts:128`, used at `Nav.astro:182` and `Nav.astro:232`). `/contact` is not in the Astro route list. | `nav.ts:128`; `Nav.astro:182,232` | The single conversion path on every page of the site. The query value is also a *wire value* read by `scripts.js` (`nav-inject.js:367-370`) — that script is not loaded in the Astro shell either, so even once `/contact` is ported the subject pre-fill will be dead unless carried across. |
| **NF-05** | **P0** | **15 of 17 distinct internal nav destinations 404** against the Astro route list (see §1.1/§1.2). Only `/` resolves; `/blog` and `/compare` resolve via 308. | `nav.ts` throughout | Expected mid-migration — but **nothing in `Nav.astro`, `nav.ts`, `Base.astro` or `astro.config.mjs` gates a deploy against it**. There is no link-check step and no "route not yet ported" state. If this nav ships, every page has 13+ broken links. |
| **NF-06** | **P0** | **17 of 21 distinct internal footer destinations 404.** Only `/`, `/sectors/`, and (via 308) `/blog`, `/compare`, `/glossary` resolve. | `footer.ts:96-148` | Same as NF-05. Footer links are the site's densest internal-linking surface; shipping them broken is worse than shipping them absent. |
| **NF-07** | **P0** | **Cookie consent withdrawal is unreachable.** Two "Cookie preferences" links (`Footer.astro:98` via `footer.ts:135`, and `Footer.astro:123` via `footer.ts:147`) point at `/cookie-preferences`, which is not an Astro route. `Base.astro` loads no cookie banner; `js/cookie-banner.js:419-429` binds `#ca-cookie-reopen` **and** `a[href="/cookie-preferences"]`, and neither the script nor the ids (`nav-inject.js:614,635`) are present. | `Footer.astro:98,123`; `footer.ts:135,147`; `cookie-banner.js:419-429` | Regulatory, not cosmetic: withdrawing consent must be as easy as giving it. The footer advertises a control that does not exist and a page that 404s. |
| **NF-08** | **P1** | **Hamburger renders left-aligned on mobile.** `.ca-nav-row` is `grid-template-columns: auto 1fr auto` (`Nav.astro:376-380`). Below 900px `.ca-nav-links` and `.ca-nav-actions` are `display:none` (`Nav.astro:614-618`), so they generate no grid items. The remaining children are the logo (track 1, `auto`) and `.ca-ham` (track 2, `1fr`). `.ca-ham` has a fixed `width:44px` (`Nav.astro:599`), which defeats the default `justify-self:stretch`, so it sits at the **start** of the wide track — immediately right of the logo, not at the row end. No `margin-inline-start:auto` or `justify-self:end` is set. | `Nav.astro:376-380`, `593-604`, `614-622` | Visible layout break on every mobile page. Should be confirmed in a browser, but the cascade is unambiguous. Live avoids it with `nav-global-fix-2026-05-27.css` (`margin-left:var(--space-2)` on a flex row). |
| **NF-09** | **P1** | **Breakpoint drift: 900px vs live's 1023px.** `Nav.astro:614` collapses to the hamburger at `max-width:900px`. Live collapses at `max-width:1023px` (`nav-global-fix-2026-05-27.css`: `@media (max-width:1023px){nav .nav-links{display:none!important}…button.ham{display:inline-flex!important}}`). | `Nav.astro:614`; `nav-global-fix-2026-05-27.css` | In the 901–1023px band (iPad landscape, small laptops) Astro renders the full desktop bar — logo + trigger + 4 links + search + 2 CTAs — in a width live deliberately never asked it to fit. Expect crowding or overflow. |
| **NF-10** | **P1** | **`role="menu"` / `role="menuitem"` misuse.** `Nav.astro:97` declares `role="menu"`; its children are `div.ca-mega-col` (`Nav.astro:100`), each containing a non-menuitem `span.ca-mega-label` (`Nav.astro:101`) before the `a[role=menuitem]` items (`Nav.astro:103`). A `menu` may only own `menuitem`/`menuitemradio`/`menuitemcheckbox`/`group`/`separator`. There is also no roving `tabindex` and no Arrow/Home/End handling, which the `menu` pattern requires. | `Nav.astro:97-137` | The widget is a navigation disclosure, not an application menu. Declaring `menu` promises keyboard semantics that are not implemented, so a screen-reader user is told to use arrow keys that do nothing. Carried from live (`nav-inject.js:321`), so this is an inherited defect, not a new one — but the rebuild is the moment to drop the role. |
| **NF-11** | **P1** | **`aria-current="page"` applied to section ancestors.** `isActive` (`Nav.astro:35-40`) prefix-matches: `p.startsWith(h)`. On `/blog/ppn-002-social-value-guide/` the **Blog** nav link (`Nav.astro:147`) and the mobile Blog link (`Nav.astro:222`) both get `aria-current="page"`. Same for `/compare/*`, `/sectors/*`, `/glossary/*`. | `Nav.astro:35-40,147,222`; mirrors `nav-inject.js:183-188` | `aria-current="page"` asserts *this is the page you are on*. For an ancestor the correct value is `"true"` or nothing. Two elements can also both claim `page` at once. Inherited from live. |
| **NF-12** | **P1** | **`aria-current="page"` on a `<button>`.** `Nav.astro:90` sets `aria-current={productsActive ? 'page' : undefined}` on the Products trigger, which in the rebuild is a `<button>` with no `href` — it is not a navigational target. It also duplicates `data-active` (`Nav.astro:89`), which is what the CSS actually uses (`Nav.astro:443`). | `Nav.astro:89-90,443` | Live could justify it (the trigger was an `<a href="/crowmark">`, `nav-inject.js:320`). The rebuild removed the href but kept the attribute. |
| **NF-13** | **P1** | **Footer social icons shrink from 44×44 to 36×36.** `Footer.astro:226-227` sets `width:36px;height:36px`. Live forces 44×44 at ≤1024px via `.ca-touch-target` and `.ca-footer .foot-social a` in `nav-global-fix-2026-05-27.css`, plus `sovereign-primitives.css:1139-1141`. The `class="ca-touch-target"` emitted at `nav-inject.js:240` is not carried into `Footer.astro:76-82`. | `Footer.astro:76-82,223-231`; `nav-inject.js:240` | Passes WCAG 2.2 AA 2.5.8 (24px) but is a **regression against live** and against `CLAUDE.md` rule 12 (44×44). Icon-only targets are exactly the case the 44px rule exists for. |
| **NF-14** | **P1** | **Nav link and dropdown-trigger targets are ~31px tall.** `.ca-nav-links > a` — `font-size:var(--t-body)` (15px) + `padding:0.4rem 0` (6.4px ×2) ≈ 30.8px (`Nav.astro:412-420`). `.ca-dropdown-trigger` identical (`Nav.astro:429-441`). Footer links have no min-height at all (`Footer.astro:250-258`), ≈18px tall. | `Nav.astro:412-420,429-441`; `Footer.astro:250-258` | Footer links **pass** 2.5.8 via the spacing exception (0.65rem gap ⇒ 28.4px centre-to-centre > 24px). Nav links pass on height. **All of them fail the repo's own 44px rule**, and `Button.astro:17-19` explicitly states 44px is the floor "not a style preference" — the nav does not honour its own system. |
| **NF-15** | **P1** | **Duplicated button definition — the exact thing `Button.astro` exists to prevent.** `Nav.astro:566-591` hand-rolls `.ca-btn`, `.ca-btn-ghost`, `.ca-btn-md`, used at `Nav.astro:179` (desktop Sign in) and `Nav.astro:229` (mobile Sign in). `Button.astro` already supports this exact call: `variant="secondary"` (`Button.astro:111-119`) and it forwards `target`/`rel` specifically so sign-in links could be converted (`Button.astro:33-44`). The CTA on the very next line **does** use `<Button>` (`Nav.astro:182`, `232`). | `Nav.astro:566-591,179,229`; `Button.astro:5-10,33-44,111-119` | Two definitions of one control in one file. `Button.astro:5-10` names this as the reason it exists. The hand-rolled version also omits `Button.astro:123-126`'s `:focus-visible` ring (see NF-16). |
| **NF-16** | **P1** | **No `:focus-visible` style on any nav or footer interactive element.** Grep across the three files: the only `:focus-visible` rules are `Button.astro:123`, `Base.astro:152` (skip link), and `Nav.astro:497-500` — and the last one only swaps a **background colour**, which is not a focus indicator. Nothing exists for `.ca-nav-links > a`, `.ca-dropdown-trigger`, `.ca-search-trigger`, `.ca-ham`, `.ca-mob-close`, `.ca-mob-acc-trigger`, `.ca-mob-toplink`, `.ca-mob-sublink`, `.ca-btn-ghost`, `.ca-logo`, `.ca-social-link`, `.ca-footer-links a`, `.ca-footer-bottom-link`. | `Nav.astro` (whole `<style>` block, 365-715); `Footer.astro:130-318` | The UA default ring is the only indicator, and on a `#05070E` page (`tokens.css:142`) its contrast is browser-dependent. **2.4.11 Focus Not Obscured** and **2.4.13 Focus Appearance** are both at risk, and 2.4.7 depends entirely on UA defaults. Live at least styles the footer accordion heading focus ring (`nav-global-fix-2026-05-27.css`). |
| **NF-17** | **P1** | **Canonical URLs 308-redirect.** `Seo.astro:61` — `const canonical = new URL(path, SITE.origin).href.replace(/\/$/, '') || SITE.origin;` — strips the trailing slash, so `/blog/` canonicalises to `https://crowagent.ai/blog`, which curl confirms is a **308** to `/blog/`. | `Seo.astro:61`; curl output §1.4 | Adjacent to nav/footer but the same trailing-slash decision. A canonical that redirects is not self-referential; Google treats the page as "Alternative page with proper canonical tag" and consolidates onto the redirect target. Combined with nav/footer hrefs that also 308, **every internal signal on the site points at the redirecting form**. |
| **NF-18** | **P2** | **Footer mobile accordion dropped** (documented at `Footer.astro:8-16`). Live collapses each non-brand column below 768px (`nav-inject.js:1114-1163` + `nav-global-fix-2026-05-27.css`). Astro shows all 21 links always-expanded, single-column below 560px (`Footer.astro:310-317`). | `Footer.astro:8-16,310-317`; `nav-inject.js:1114-1163` | Deliberate and defensible; the consequence is a very long footer on a 390px viewport. Recorded so the decision is visible, not to reverse it. |
| **NF-19** | **P1** | **`#status-dot` / `#status-label` ids dropped.** `Footer.astro:70-71` emits classes only. `scripts.js:356-357` binds by id, and `nav-inject.js:510-511` emits them. | `Footer.astro:69-72`; `nav-inject.js:510-511`; `scripts.js:356-378` | The label is now a **hardcoded, permanently-green "All systems operational"** claim with no mechanism to ever say otherwise. `Footer.astro:58-63` acknowledges the polling is out of scope, but an unfalsifiable status indicator is worse than none — it will read "operational" during an outage. |
| **NF-20** | **P1** | **`#footer-year` dropped; year frozen at build time.** `Footer.astro:20` `const year = new Date().getFullYear()` runs at **build** time (`output: 'static'`, `astro.config.mjs:16`). Live re-stamps it client-side (`nav-inject.js:630`, `1210`). | `Footer.astro:20,111`; `nav-inject.js:630,1210` | A site not rebuilt after 1 January shows a stale copyright year sitewide. Legal/credibility, and a class of bug that only surfaces once a year. |

---

# 3. CODE QUALITY

## 3.1 `!important`

**Zero occurrences** in `Nav.astro`, `Footer.astro` and `Base.astro`. This honours `tokens.css:36-39`. Recorded as a pass. (Live carries thousands — see `nav-global-fix-2026-05-27.css`.)

## 3.2 Hardcoded values that should be tokens (NF-21, P2)

`tokens.css` defines the full scale. These values bypass it:

| File:line | Value | Should be |
|---|---|---|
| `Nav.astro:370` | `background: rgba(5, 7, 14, 0.72)` | `--c-bg` is `#05070E` = `rgb(5,7,14)`. Use `color-mix(in srgb, var(--c-bg) 72%, transparent)` or add a `--c-nav-bg` token. **This is the single most important one: the nav background is now decoupled from the page background token.** |
| `Nav.astro:510` | `font-size: 0.8125rem` (mega desc) | no token — `--t-micro` is 11.5px, `--t-body` 15px. A 13px tier is missing from the scale. |
| `Nav.astro:543` | `font-size: 11px` (kbd) | `--t-micro` (11.5px) |
| `Nav.astro:545` | `border-radius: 4px` | not in the `--radius-*` scale (smallest is `--radius-chip` 10px) |
| `Nav.astro:552` | `min-width: 3.4ch` | magic number; documented in-line, acceptable |
| `Nav.astro:396-397` | `width:32px; height:32px` (logo) | no size scale exists |
| `Nav.astro:598,607-608` | `gap:5px; width:20px; height:2px` (burger bars) | no token |
| `Nav.astro:599-600` | `width:44px; height:44px` | should be `var(--btn-h-sm)` (44px) — the token exists |
| `Footer.astro:162,281` | `font-size: 0.8125rem` | same missing 13px tier |
| `Footer.astro:166` | `font-size: 11px` | `--t-micro` |
| `Footer.astro:187-188` | `width:30px; height:30px` (logo) | **also inconsistent with the nav's 32px for the same mark** |
| `Footer.astro:210-212` | `width:8px; height:8px; border-radius:50%` | no token |
| `Footer.astro:226-227` | `width:36px; height:36px` | should be `var(--btn-h-sm)` — see NF-13 |
| `Footer.astro:263` | `font-size: 10px` (Free chip) | below `--t-micro`; no token |
| `Footer.astro:270` | `padding: 1px 6px` | no token |
| `Footer.astro:292` | `text-underline-offset: 2px` | no token |

No hardcoded **hex** colours appear in the CSS of either component. The only hex values are inside the inline brand SVGs (`Nav.astro:61-74`, `Footer.astro:50-63`), which are copied verbatim from the canonical mark (`nav-inject.js:167-181`) — correct, since they are artwork, not theme.

One genuine colour-token check: `Nav.astro:48-51` maps `accent:'mark'` → `var(--c-violet)`. Live uses `var(--mark)`, defined as `#A78BFA` in `Assets/css/ultra-premium-responsive.css:245`. `tokens.css:160` defines `--c-violet: #A78BFA`. **Colour-exact.** ✅

## 3.3 Duplicated button definition (NF-15)

See §2.2 NF-15. `Nav.astro:566-591` duplicates `Button.astro`.

## 3.4 Dead classes (NF-22, P2)

| File:line | Class | Status |
|---|---|---|
| `Nav.astro:179` | `ca-nav-login` | no rule anywhere in the component `<style>` |
| `Nav.astro:182` | `ca-nav-cta` (passed via `Button`'s `class` prop) | no rule anywhere |

Both are inert. Either style them or drop them — a class with no rule is a hook that looks load-bearing to the next reader.

## 3.5 Progressive-enhancement fragility (NF-29, P2)

`Nav.astro:210` renders the mobile Products panel with the `hidden` attribute; the six product links only become reachable when the module script runs `panel.hidden = !willOpen` (`Nav.astro:355`). Live uses a CSS `max-height` collapse (`nav-inject.js:407-415` + CSS), which degrades to *visible* rather than *absent*. If the bundled module fails to load, Astro loses six links; live loses none.

---

# 4. SEO

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| — | ✅ | **Footer link set is complete.** All 21 internal + 7 external destinations present, in the same columns, same order, same labels. No internal-linking signal lost. | §1.3 |
| — | ✅ | **No `rel="nofollow"` added or dropped.** Neither live nor Astro uses it anywhere in nav or footer. | `nav-inject.js:240,362,424,631,634`; `Footer.astro:78,115,120`; `Nav.astro:179,229` |
| — | ✅ | **`target="_blank"` + `rel="noopener noreferrer"` preserved on all 8 external links** (5 social, Sign in ×2, Status, Companies House). | `Footer.astro:78,115,120`; `Nav.astro:179,229` |
| **NF-24** | **P2** | **One internal link to `/crowmark` lost per page.** Live's Products trigger is `<a href="/crowmark">` (`nav-inject.js:320`); the rebuild makes it a `<button>` (`Nav.astro:82-96`). The mega panel still links `/crowmark` (`Nav.astro:103` via `nav.ts:56`), so the target keeps a sitewide link — the count drops from 2 to 1. Deliberate and documented (`Nav.astro:12-23`). | `nav-inject.js:320`; `Nav.astro:82-96` |
| **NF-17** | **P1** | Canonical/internal-link disagreement over trailing slashes. See §2.2. | `Seo.astro:61` |
| **NF-27** | **P2** | **Desktop/mobile href mismatch preserved verbatim**: desktop "Free tools hub" → `/tools/` (`nav.ts:103`), mobile → `/tools` (`nav.ts:149`). Two internal link forms for one destination, one of which 308s. Preserved on purpose per the hrefs-verbatim rule (`nav.ts:132-139`) — recorded so it is a decision, not an accident. | `nav.ts:103,149`; `nav-inject.js:343,414` |
| **NF-26** | **P2** | Footer link groups are `<div class="ca-footer-links">` with bare `<a>` children (`Footer.astro:96`), not `<ul>/<li>`. Same as live (`nav-inject.js:531`). Screen readers get no "list of 6 items" count; crawlers are unaffected. | `Footer.astro:96`; `nav-inject.js:531` |
| **NF-32** | **P2** | `Base.astro` renders none of live's other sitewide injections — breadcrumb from JSON-LD (`nav-inject.js:741-800`), cookie banner, analytics, `sv-reveal`. Out of strict nav/footer scope, but `nav-inject.js` is the single script that supplied all of them, so retiring it retires all of them at once. Only the cookie banner is graded (NF-07). | `Base.astro:92-111`; `nav-inject.js:741-800` |

---

# 5. Remaining P2 findings

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| **NF-23** | P2 | The `<sup>` wrapper on the ISO asterisk is lost. Live: `ISO 27001 controls<sup style="font-size:0.6em;opacity:0.7">*</sup>` (`nav-inject.js:473`). Astro: the asterisk is plain text inside the badge string (`footer.ts:50`, rendered `Footer.astro:35`). Cosmetic; the footnote it refers to is present (`Footer.astro:40`). | `footer.ts:50`; `nav-inject.js:473` |
| **NF-25** | P2 | Inconsistent new-tab disclosure. Social links announce "(opens in a new tab)" (`Footer.astro:80`, matching `nav-inject.js:240`), but the two Sign-in links (`Nav.astro:179,229`) and the Status link (`Footer.astro:120`) open in a new tab with no notice. Same inconsistency exists live. | `Footer.astro:80,120`; `Nav.astro:179,229` |
| **NF-28** | P2 | `role="contentinfo"` on `<footer>` (`Footer.astro:24`) is redundant — a `<footer>` that is a direct child of `<body>` already maps to `contentinfo`, and `Base.astro:109` places it there. Valid, just noise. Matches live (`nav-inject.js:446`). | `Footer.astro:24`; `Base.astro:109` |
| **NF-30** | ✅ | **Zero `!important`** across all three files. Recorded as a pass against `tokens.css:36-39`. | — |
| **NF-31** | P2 | Platform-aware badge, platform-blind label. `Base.astro:76-89` stamps `data-kbd-os="mac"` and `Nav.astro:555-564` swaps the visible badge to `⌘K`, but the accessible name stays `"Search (Ctrl K)"` (`Nav.astro:158-159`) on every platform. On macOS the visible text and the accessible name disagree — a **2.5.3 Label in Name** edge case (the visible label is `⌘K`, which the accessible name does not contain). | `Nav.astro:158-159,555-564`; `Base.astro:76-89` |

---

# 6. Defects the rebuild genuinely fixes (do not regress these)

Recorded so a future "restore parity with live" pass does not undo them.

| Live defect | Live evidence | Fixed at |
|---|---|---|
| **Nested interactive elements.** The Products trigger is `<a href="/crowmark">` containing `<span role="button" tabindex="0" aria-label="Open Products menu">` — an interactive control inside an interactive control, requiring ~80 lines of capture-phase click/keydown interception to disambiguate. | `nav-inject.js:320`, `824-905` | `Nav.astro:82-96` — one `<button>`. |
| **Hardcoded Mac `⌘K` badge for every visitor**, including Windows and Linux. | `nav-inject.js:360` | `Base.astro:76-89` + `Nav.astro:166-177,555-564` — pre-paint platform detection, no layout shift. |
| **`aria-expanded` never updated on the desktop dropdown** (hardcoded `"false"` in markup; the 2026-07-31 sync at `nav-inject.js:1026-1046` is a patch over it). | `nav-inject.js:320,1014-1046` | `Nav.astro:315` — genuinely toggled. *(But see NF-01: the CSS defeats it again.)* |
| **Blog posts had no skip link and no `<main>` landmark.** | `Base.astro:93-103` (documents the parity run) | `Base.astro:104-108` — both live in the shell, so no route can omit them. |
| **Inline styles in the footer** (`style="font-size:11px;color:rgba(232,240,250,0.5)"` on the trust note; `style="border-top:1px solid var(--border);margin-top:8px"` on the tools-hub row). | `nav-inject.js:343,486` | `Footer.astro:165-170` — tokenised class. |
| **`aria-label` on a role-less `<div>`** (discarded by AT). Fixed live on 2026-07-30 and correctly carried across. | `nav-inject.js:448-458` | `Footer.astro:26` — `role="group"` retained. |
| **Duplicate injection / duplicate ids** requiring a global idempotency guard. | `nav-inject.js:16-23` | Server-rendered once. Gradient ids are slot-suffixed (`Nav.astro:60,64` vs `Footer.astro:49,53`) — verified no collision. |

---

# 7. Recommended fix order

1. **NF-01 / NF-02** — delete `:hover` and `:focus-within` from `Nav.astro:469-473`, leaving `.force-open` as the only open state, and add `mouseenter`/`mouseleave` JS if hover-open is wanted. One change fixes the toggle, Escape, outside-click and 1.4.13 together.
2. **NF-05 / NF-06 / NF-04 / NF-07** — add a build-time link check that fails when a nav or footer href has no corresponding route. This is the gate that stops all four from shipping.
3. **NF-08** — `justify-self: end` or `margin-inline-start: auto` on `.ca-ham`.
4. **NF-03** — either implement the palette or remove the button. A dead control with a keyboard shortcut in its accessible name is worse than no control.
5. **NF-16 / NF-15** — one shared `:focus-visible` rule in the `components` layer, and convert the two Sign-in links to `<Button variant="secondary">`.
6. **NF-17** — stop stripping the trailing slash in `Seo.astro:61`, and normalise nav/footer hrefs to the slashed form in `nav.ts`/`footer.ts`.
7. Everything else in severity order.
