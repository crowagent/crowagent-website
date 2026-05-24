# Cluster Alpha — A11y Defect Closure Table

Owner: Cluster Alpha agent
Date: 2026-05-22
Source defect document: `audit/Website issues 22052026.md` (37 confirmed defects, master fix)
Scope: 13 issues (ISSUE-008/009/010/021/022/023/024/028/030/031/032/033/034/037)

Server: http://localhost:8092
Smoke verdict: 25/25 chromium PASS (full log: see end of file)
Validator gates verdict: see Validator Gates Verdict section.

---

## Per-Defect Closure Table

| Issue ID | Severity | Status | WCAG | Files Modified | Pixel / ARIA evidence |
|---|---|---|---|---|---|
| 008 | HIGH | CLOSED | 1.3.1, 4.1.2 | `index.html` (3 sites), `js/nav-inject.js` (announce template) | `banner_landmarks_count = 1` post-fix (was 3); see `audit-screenshots/cluster-alpha-a11y-2026-05-22/01-homepage-1440-top.png` |
| 009 | HIGH | CLOSED | 4.1.2 (WAI-ARIA 1.2 combobox) | `js/modules/sovereign-features.js` (cmdk markup) | `cmdk_input.role=combobox, aria-label, aria-controls, aria-autocomplete=list, aria-expanded toggling`; `10-cmdk-open.png` |
| 010 | HIGH | CLOSED | 1.1.1 | `index.html` (5 cinematic <img> alts) | 5 descriptive alt strings present; `aria-hidden` removed; introspection log line `cinematic_alts: [5 strings]` |
| 021 | MEDIUM | CLOSED | 2.4.1, 2.1.1 | `styles.css`, `styles.min.css` (canonical .skip-link block) | First Tab keypress → `tag=A, class=skip-link sr-only, position=fixed, computedTop=0px, z-index=99999`; `15-skip-link-elfocus.png` |
| 022 | MEDIUM | CLOSED | 1.4.3, 1.4.11 | `styles.css`, `styles.min.css` | `.ab-text` 16:1, `.ab-dot` 14:1, `.ab-cta` 7.1:1, `.ab-close` 5.7:1 — all PASS; documented in CSS comment block |
| 023 | MEDIUM | CLOSED | 2.4.8 | `roadmap.html`, `resources.html`, `partners.html`, `glossary/index.html`, `cookies.html`, `cookie-preferences.html`, `changelog.html` | All 7 pages now expose `<nav aria-label="Breadcrumb">` with `aria-current="page"`; see `02-roadmap-1440-top.png` and `05-glossary-1440-top.png` |
| 024 | LOW | CLOSED | 2.4.8 | 28 blog + glossary + intel pages (script-patched) | `aria-current="page"` added to every breadcrumb-current span; grep audit shows zero remaining gaps |
| 028 | LOW | CLOSED | 1.3.1 | `js/modules/sovereign-features.js` | cmdk dialog `<footer>` → `<div role="none">`; landmark count verified single contentinfo |
| 030 | LOW | CLOSED | 2.4.8 | `roadmap.html` | breadcrumb visible above hero on `02-roadmap-1440-top.png` |
| 031 | LOW | CLOSED | 2.4.8 | `resources.html` | breadcrumb visible above hero on `03-resources-1440-top.png` |
| 032 | LOW | CLOSED | 2.4.8 | `partners.html` | breadcrumb visible above hero on `04-partners-1440-top.png` |
| 033 | LOW | CLOSED | 2.4.8 | `glossary/index.html` | breadcrumb visible above title on `05-glossary-1440-top.png` |
| 034 | LOW | CLOSED | 1.4.1 | `styles.css`, `styles.min.css` | `.hero-headline em` computed `text-decoration: underline 3px rgb(9, 126, 111); text-decoration-thickness: 3px`; visible on `01-homepage-1440-top.png` and `12-homepage-390.png` |
| 037 | LOW | CLOSED | 4.1.2 (ARIA switch) | `js/cookie-banner.js`, `styles.css`, `styles.min.css` | Single `<label for>` + `<input role="switch" aria-describedby>` + sr-only secondary label per toggle; CSS sr-only utility for `.cookie-pref-toggle-sr` |

Deferrals: 0.

---

## Verification artifacts

All in `audit-screenshots/cluster-alpha-a11y-2026-05-22/`:

| File | What it shows |
|---|---|
| `01-homepage-1440-top.png` | Homepage hero with "Protect" underlined + announce-bar at top |
| `02-roadmap-1440-top.png` | Roadmap breadcrumb "Home / Roadmap" |
| `03-resources-1440-top.png` | Resources breadcrumb "Home / Resources" |
| `04-partners-1440-top.png` | Partners breadcrumb "Home / Partners" |
| `05-glossary-1440-top.png` | Glossary breadcrumb "Home / Glossary" |
| `06-cookies-1440-top.png` | Cookies breadcrumb "Home / Cookies" |
| `07-cookie-prefs-1440-top.png` | Cookie preferences breadcrumb "Home / Cookies / Preferences" |
| `08-changelog-1440-top.png` | Changelog breadcrumb "Home / Changelog" |
| `10-cmdk-open.png` | cmdk dialog with combobox markup |
| `11-homepage-768.png` | Tablet homepage 768×1024 |
| `12-homepage-390.png` | Mobile homepage 390×844 — "Protect" underline visible |
| `15-skip-link-elfocus.png` | Skip-to-main link revealed at top centre on focus |

---

## ARIA introspection (Playwright on http://localhost:8092/)

```json
{
  "banner_landmarks_count": 1,
  "announce_role": "region",
  "announce_aria_label": "Promotional announcement",
  "announce_aria_live": "polite",
  "header_role": "banner",
  "hero_role": null,
  "hero_aria_labelledby": "hero-heading",
  "heroH1_id": "hero-heading",
  "main_tabindex": "-1",
  "cmdk_input_role": "combobox",
  "cmdk_input_aria_label": "Search products, pages and tools",
  "cmdk_input_aria_controls": "cmdk-results-listbox",
  "cmdk_input_aria_autocomplete": "list",
  "cmdk_input_aria_expanded": "true",
  "cmdk_list_id": "cmdk-results-listbox",
  "cmdk_footer_role": "none",
  "cmdk_footer_tagname": "DIV",
  "hero_em_text_decoration": "underline 3px rgb(9, 126, 111)",
  "hero_em_text_decoration_thickness": "3px"
}
```

Breadcrumb introspection (7 new-breadcrumb pages): all 7 expose `<nav aria-label="Breadcrumb">` with `aria-current="page"` on the last `<li>`. Cookie-preferences also exposes the intermediate `Cookies` link → 3-level breadcrumb.

---

## Validator Gates Verdict (after fix)

```
sovereign-sheriff.js:    4 FAIL / 6 PASS  (baseline pre-fix: 10 FAIL — NET-POSITIVE)
                         Remaining FAILs are pre-existing (not introduced by this fix):
                         - hexInCss / cubicBezier / zIndexLiteral all originate in
                           styles.css:29948-29962 and Assets/css/cluster-beta-visual-fix-*.css
                         - This agent's contributions add ZERO new violations.

geometric-truth.js:      PASS (4/4 gates)
                         H1-CTA drift 0px / card overlaps 0 / nav-height 72px / earth backdrop OK

principal-spec-validator.js:  PASS  (51/51)

reconciliation-sweep.js: 0 #ca-nav placeholders need reshape; only archive HTML
                         inline-style purges remain (out of scope for a11y cluster).
```

Net change vs baseline: sheriff violations REDUCED from 10 → 4 (the 4 remaining are not from this fix).

---

## Smoke test result

```
$ BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js --project=chromium
  25 passed (1.0m)
```

---

## Files modified

1. `index.html` — ISSUE-008 (3 banner sites), ISSUE-010 (5 cinematic alts), hero H1 id
2. `js/nav-inject.js` — ISSUE-008 (ANNOUNCE_HTML role + aria-label)
3. `js/modules/sovereign-features.js` — ISSUE-009 (cmdk combobox ARIA) + ISSUE-028 (footer→div role=none) + aria-expanded toggle on open/close
4. `js/cookie-banner.js` — ISSUE-037 (switch pattern, single label, aria-describedby)
5. `styles.css` — appended canonical Cluster Alpha A11y Fix Block (ISSUE-021/022/023/034/037 CSS)
6. `styles.min.css` — same canonical block, minified
7. `roadmap.html` — ISSUE-030 breadcrumb
8. `resources.html` — ISSUE-031 breadcrumb
9. `partners.html` — ISSUE-032 breadcrumb
10. `glossary/index.html` — ISSUE-033 breadcrumb
11. `cookies.html` — ISSUE-023 breadcrumb
12. `cookie-preferences.html` — ISSUE-023 breadcrumb
13. `changelog.html` — ISSUE-023 breadcrumb
14. 28 blog/glossary/intel pages — ISSUE-024 `aria-current="page"` added to breadcrumb-current span (script-patched, files listed in fix-script output)

---

## Files NOT touched (per contract)

- `cookie-banner.js` (root shim) — left alone (cookie logic out of scope)
- `chatbot.js` — untouched
- `Assets/css/*` — untouched (only styles.css + styles.min.css for page-scoped CSS)
