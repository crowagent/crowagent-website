# Marketing Content Gaps — 2026-05-06

> Sweep performed against ticket #48 (ICO number on /privacy + final marketing
> site content sweep). Working directory: `crowagent-website/`.
> Footer (Company No. 17076461, ICO registered, VAT, Reading England UK) is
> centralised in `js/nav-inject.js` and injected at runtime into every page
> that loads that script — confirmed across all 51 HTML pages. Static `grep`
> for `17076461` only matches the 5 pages that ALSO render company details
> in inline body copy (about, contact, privacy, terms, security); the other
> 46 pages still ship with the same details via the injected footer.

---

## P1 — Pending external action (cannot auto-fix in HTML)

### Gap 1: ICO Registration Number not yet issued
- **Severity:** P1 (legal — UK Data Protection Charges and Information Regs 2018)
- **Where:** `privacy.html` §1 — new `<section id="ico-registration">` (added in this commit)
- **Footer also says:** "ICO registered" (line 142, `js/nav-inject.js`) — claim is currently aspirational and needs the actual number on file before launch.
- **Status:** Application drafted at `docs/legal/ico-update-draft.md`. The number returned by the ICO must replace the literal string `[Pending — application submitted, awaiting issue]` inside `<span id="ico-number">` in `privacy.html`.
- **Action when number arrives:** edit one line in `privacy.html`, set `data-ico-status="active"`, no rebuild required.

---

## P2 — Site-wide gaps surfaced during sweep

### Gap 2: No standalone Accessibility Statement page
- **Severity:** P2 (good practice; mandatory for UK public sector — not legally required for private SaaS, but the platform sells INTO public sector via CrowMark/PPN 002, which raises the expectation)
- **Where:** Footer "Legal" column (`js/nav-inject.js` lines 190-196) lists Privacy, Terms, Cookies, Security — **no Accessibility link**. No `accessibility.html` file exists in the repo.
- **Why not auto-fixed:** Writing an accessibility statement requires a real WCAG 2.2 AA conformance audit + named accessibility lead + complaints contact. Speculating on conformance level is worse than having no statement.
- **Action:** Open ticket for a separate WP — perform Playwright a11y run (`tests/accessibility.spec.js` already exists), document findings, draft statement, link from footer Legal column.

### Gap 3: Registered office address inconsistency
- **Severity:** P2 (minor consistency issue)
- **Where:**
  - `privacy.html` §1: "Reading, England, United Kingdom"
  - `privacy.html` §7 DPO postal: "Reading, Berkshire RG1 6SP, United Kingdom"
  - `js/nav-inject.js` footer: "Reading, England, UK" (no street / postcode)
  - `about.html` line 89, `contact.html` line 96: VAT GB 471 7646 10 (consistent)
- **Why not auto-fixed:** I cannot verify whether RG1 6SP is the live registered office at Companies House without going off-codebase. The two phrasings are not contradictory but they are not identical. The ICO update draft (`docs/legal/ico-update-draft.md`) already flags this for the founder to resolve via Companies House filing first.
- **Action:** Founder confirms Companies House registered office, then update all three locations to identical street + postcode in one PR.

### Gap 4: VAT number visibility on non-footer pages
- **Severity:** P3 (cosmetic — VAT is in the injected footer of every page)
- **Where:** VAT GB 471 7646 10 currently appears in: footer (every page), `about.html` company details block, `contact.html` Reading address block. Inline mention is NOT required on every page when it's in the footer — UK Companies (Trading Disclosures) Regulations 2008 require company number + registered office on websites, NOT VAT inline.
- **Action:** None. Footer placement satisfies the regulatory requirement.

---

## Verified OK (no action)

| Item | Coverage | Evidence |
| --- | --- | --- |
| Company No. 17076461 in footer | All 51 HTML pages | `js/nav-inject.js:125,142` injected on every page that loads the script |
| Registered office (Reading, England, UK) in footer | All 51 HTML pages | `js/nav-inject.js:125` |
| VAT GB 471 7646 10 in footer | All 51 HTML pages | `js/nav-inject.js:142` |
| ICO registered (claim, pending number) | All 51 HTML pages | `js/nav-inject.js:142` + new privacy.html §1 ICO section |
| Cookie banner present + compliant | All pages loading `cookie-banner.js` | `cookie-banner.js` — three categories (Necessary / Analytics / Marketing), reject-all + accept-all + manage flow, locked-on Necessary toggle |
| Privacy policy link | Footer Legal column on every page | `js/nav-inject.js:192` |
| Terms link | Footer Legal column on every page | `js/nav-inject.js:193` |
| Cookies policy link | Footer Legal column on every page | `js/nav-inject.js:194` |
| Brand tokens canonical | Single source `crowagent-brand-tokens.css` | All teal / surf / cloud / steel / mist / warn / err vars defined once at `:root`, mirrored to `--ca-*` aliases lines 67-79 |

---

## Files modified by ticket #48

- `privacy.html` — added `<section id="ico-registration">` after §1 with placeholder number ready for caseworker reply.
- `docs/marketing-content-gaps-2026-05-06.md` — this document (new).

No JS, CSS, footer, brand-tokens, or other HTML pages were touched. Footer
already carries Company No. + Reading + ICO-registered + VAT on every page via
`js/nav-inject.js`.
