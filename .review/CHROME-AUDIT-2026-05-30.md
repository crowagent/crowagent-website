# Chrome QA Audit (owner-supplied, 2026-05-30) — Triage + Fix Tracker

Owner pasted a ~70-item Chrome browser audit. Claude triaged EACH against the CURRENT live
site (the report was largely captured on a CACHED/older render). Status legend:
- ❌ STALE/FALSE — not reproducible on current site (Chrome tested old cache); evidence given.
- ✅ ALREADY DONE — fixed in a prior session; verified.
- 🔧 REAL-FIX — genuinely open; Claude to fix.
- 🟣 NEEDS-OWNER-DECISION — conflicts with charter (fabrication) or is a product/business call.

---

## PART 1 — Critical / High

| ID | Verdict | Note |
|---|---|---|
| BUG-001 desktop hamburger-only | ❌ STALE | Probe: 8 desktop nav links at 1280 (Products/Free Tools/Sectors/Pricing/Blog/FAQ/About/Sign in); hamburger hidden ≥1025. Desktop nav EXISTS. |
| BUG-002 /sectors 404 | 🟣 DECISION | Nav "Sectors" → `/#sectors` anchor (works, not 404). A dedicated /sectors landing page = a NEW page (product decision). |
| BUG-003 blank dark sections homepage | 🔧 REAL-FIX | Investigate sv-reveal IntersectionObserver — sections may sit opacity:0 if observer mis-fires; add no-JS/seen failsafe. |
| BUG-004 Solve/Prove/Profit overlap | ❌ STALE | Reworked into a card band (LM-035); re-verify no overlap. |
| BUG-005 10/21 images broken | ❌ STALE | Probe: 21 imgs, 0 broken. |
| BUG-006 counters frozen mid-anim | ✅ DONE | Counter-tween verified resolving to final values (2,028/£150K/10%/Base+8%/1,000+/44+22). Re-verify guaranteed final value. |
| BUG-007 blog slug 404 no suggestions | 🔧 REAL-FIX (partial) | 404 page recovery (see UX-015). Slug structure is fine. |
| BUG-008 pricing tab empty white area | ✅ DONE | LM-006 void fixed + switcher restyle. Re-verify scroll position. |
| BUG-009 sticky pricing ghost nav | 🔧 REAL-FIX | Verify no duplicate nav during pricing scroll. |
| BUG-010 /products/<name> 404 | 🔧 REAL-FIX | Add redirect or `/products/<name>` stubs → /<name>. Static site: add small redirect HTML pages. |
| NAV-001 no products mega-menu | ❌ STALE | Mega-menu EXISTS (Products dropdown verified LM-028). |
| NAV-002 hamburger no focus trap | 🔧 REAL-FIX | Add focus trap + return focus to .ham on close (Claude's nav-inject hamburger handler). |
| NAV-003 close button placement | 🟡 minor | Mobile menu close — review position/label. |
| NAV-004 CrowESG coming-soon no badge | 🔧 REAL-FIX | Add "Coming Q3 2026" muted badge in nav for CrowESG. |
| LINK-001 cookie pref clipped by back-to-top | 🔧 REAL-FIX | Back-to-top overlaps footer (also UI-008). Reposition / z-index / hide near footer. |
| LINK-002 no social links | ❌ STALE | 3 social links found in footer (LinkedIn/X/etc.). |
| LINK-003 external links same tab | 🔧 REAL-FIX | status.crowagent.ai / app.crowagent.ai external links → target=_blank rel=noopener. |
| LINK-004 hello@ not mailto | 🔧 REAL-FIX | Ensure hello@crowagent.ai is a mailto: link everywhere. |

## PART 1 — Responsive / A11y / SEO / UI

| ID | Verdict | Note |
|---|---|---|
| RESP-001 announce bar no wrap mobile | 🔧 REAL-FIX | Verify announce bar wraps/dismisses at 375px. |
| RESP-002 hero CTA hierarchy mobile | 🟡 minor | Secondary CTA arrow styling at mobile. |
| RESP-003 sectors ticker no edge fade | 🔧 REAL-FIX | Add gradient fade mask on marquee edges. |
| RESP-004 pricing single-column at 1280 | 🔧 REAL-FIX | 3 pricing cards should be 3-col ≥1024 (verify they are; report saw 806px). |
| RESP-005 blog index overlap mid-width | 🔧 REAL-FIX | Verify featured/grid at ~806px. |
| RESP-006 API code block no h-scroll | 🔧 REAL-FIX | overflow-x:auto on homepage code block. |
| RESP-007 contact no form | ❌ STALE | Contact form EXISTS (9 fields, just restyled LM-158). |
| RESP-008 FAQ empty space top | 🔧 REAL-FIX | Tighten FAQ hero→accordion gap. |
| A11Y-001 skip link not visible on focus | ✅ DONE | sr-only + :focus reveal verified (LM-029). |
| A11Y-002 OG/Twitter meta MISSING | 🔧 REAL-FIX | Probe: index has NO og/twitter. Some pages do (terms/roadmap). Add OG+Twitter to all pages missing them. |
| A11Y-003 no JSON-LD schema | 🔧 REAL-FIX | 0 JSON-LD. Add Organization + SoftwareApplication (home), FAQPage (faq), Article (blogs), BreadcrumbList. |
| A11Y-004 2 inputs no label | 🔧 REAL-FIX | Find + label the 2 unlabelled inputs (waitlist/API email). |
| A11Y-005 no focus indicator | ❌ likely STALE | brand-tokens G2 defines :focus-visible outline globally; verify, strengthen if weak. |
| A11Y-006 hamburger aria-expanded | ✅ DONE | Claude's handler sets aria-expanded true/false (LM-155). Verify. |
| A11Y-007 blog hero text contrast | 🔧 REAL-FIX | Add scrim/overlay behind blog hero text over photos. |
| A11Y-008 pricing FAQ non-semantic | 🔧 REAL-FIX | Use <details>/<summary> or role=button+aria-expanded for accordions. |
| SEO-001 canonical | ✅ DONE | All 28 canonicals = crowagent.ai (LM-094). |
| SEO-002 titles not optimised | 🟣 DECISION | Title rewrites are copy/SEO strategy — propose, owner approves keywords. |
| SEO-003 H1 issues | 🔧 REAL-FIX (partial) | Verify one H1 per page; FAQ/pricing H1 keywords = copy decision. |
| SEO-004 no sitemap ref | 🔧 REAL-FIX | Add sitemap.xml + robots reference + footer link if missing. |
| SEO-005 blog Load More not paginated | 🟣 DECISION | SSR pagination = bigger architecture change; static fallback exists. |
| UI-001 inconsistent buttons | 🔧 REAL-FIX (partial) | Unify to one .ca-btn system (overlaps LM-075). |
| UI-002 arrow-in-CTA inconsistent | 🟡 minor | Standardise → usage. |
| UI-003 logo small mobile | 🟡 minor | Header padding at mobile. |
| UI-004 pricing tab uneven | ✅ DONE | Switcher restyled to even segmented control (LM-157). |
| UI-005 hero gradient inconsistent | 🟡 minor | legal heroes flat vs metallic — minor. |
| UI-006 breadcrumb case inconsistent | 🔧 REAL-FIX | Standardise breadcrumb case + active colour. |
| UI-007 status dot green vs teal | 🟡 minor | Brand-consistency of status dot. |
| UI-008 back-to-top overlaps footer | 🔧 REAL-FIX | Reposition bottom-right or hide near footer (also LINK-001). |
| UI-009 carousel dots no arrows / small | 🔧 REAL-FIX | Add prev/next arrows + ensure 44px dot tap targets. |
| UI-010 excessive hero empty space | 🟡 minor | Hero padding (premium spacing — verify not excessive). |

## PART 2 — UX / Content / Improvements

| ID | Verdict | Note |
|---|---|---|
| UX-001 no social proof | 🟣 DECISION | Pre-launch = NO customers; testimonials/logos would be FABRICATION (charter forbids). Use honest "no customers yet, statute is the trust signal" (LM-096). NEEDS OWNER CALL. |
| UX-002 no live chat | ❌ STALE | A SupportChat/chatbot exists (chatbot.js). Verify it loads. |
| UX-003 comparison table below fold | 🟡 minor | Move/anchor comparison table higher (UX). |
| UX-004 role cards → signup not product | 🔧 REAL-FIX | Point role-card CTAs to product pages, not /signup. |
| UX-005 waitlist no validation feedback | 🔧 REAL-FIX | Add inline validation + success toast. |
| UX-006 blog no pagination indicator | 🟡 minor | Load-more count/indicator. |
| UX-007 Calendly no warning | 🟡 minor | Label "Opens Calendly" / new-tab icon. |
| UX-008 no back-to-blog on article | 🔧 REAL-FIX | Sticky back-to-blog on article pages. |
| UX-009 no ToC on long blogs | ❌ partial STALE | Several blogs HAVE a TOC sidebar (verified danzell). Ensure all long blogs do. |
| UX-010 cookie pref no manager | ❌ STALE | Cookie banner + /cookie-preferences toggles work (LM-101). |
| UX-011 no site search | 🟣 DECISION | Site-wide search = feature build. Blog/glossary have own search. |
| UX-012 FAQ anchors no smooth-scroll | 🔧 REAL-FIX | Add scroll-behavior:smooth / JS smooth scroll. |
| UX-013 monthly/annual toggle broken | ✅ DONE | Verified: toggle flips £149/mo → £1,490/yr (LM-084). |
| UX-014 no sticky header | 🟣 DECISION | Sticky header is a UX pattern change — verify current nav scroll behaviour first. |
| UX-015 404 no recovery options | 🔧 REAL-FIX | 404 has 2 CTAs (homepage/pricing). Add search + top-links list. |
| COPY-001 "by engineers" mismatch | 🟣 DECISION | Brand copy call. |
| COPY-002 Companies House in pricing hero | 🔧 REAL-FIX | Move CH number out of pricing hero subtext to footer/legal. |
| COPY-003 VSME waitlist no explanation | 🟡 minor | Add microcopy to waitlist. |
| COPY-004 "REST architecture UK/EU" vague | 🟡 minor | Reword API copy. |
| COPY-005 response-time format inconsistent | 🟡 minor | Standardise "3–5 business days". |
| COPY-006 "EXECUTE." CTA off-brand | 🔧 REAL-FIX | Reword homepage final-CTA "EXECUTE." to benefit-led. |
| IMPROVE-001 testimonials | 🟣 DECISION | FABRICATION risk (no customers). Owner call. |
| IMPROVE-002 customer/logo bar | 🟣 DECISION | FABRICATION risk. Owner call (framework logos need permission). |
| IMPROVE-003 pricing CTA/anchor at top | 🔧 REAL-FIX | Add "Plans from £99/mo" anchor in pricing hero. |
| IMPROVE-004 tool step indicator | 🔧 REAL-FIX | Add "Step 1 of N" to multi-step tools. |
| IMPROVE-005 read-time in article body | 🟡 minor | Already in byline (verified). |
| IMPROVE-006 related articles | ❌ partial STALE | Blogs HAVE "Continue reading"/related cards (verified). Ensure all do. |
| IMPROVE-007 product how-it-works | ❌ partial STALE | crowmark has "4 steps"; ensure all product pages have a step section. |
| IMPROVE-008 pricing "who is this for" | 🔧 REAL-FIX | Add persona line per plan. |
| IMPROVE-009 cookie consent banner | ❌ STALE | Banner exists. |
| IMPROVE-010 blog share buttons | 🔧 REAL-FIX | Add LinkedIn/X/Copy-link share on articles. |
| IMPROVE-011 glossary placeholder cut off | 🔧 REAL-FIX | Fix glossary search placeholder + add clear button. |
| IMPROVE-012 inconsistent "Last updated" dates | 🔧 REAL-FIX | Standardise legal date format (ISO-style). |

---
## Claude work order (REAL-FIX, batched)
1. SEO/social foundation: A11Y-002 OG+Twitter sitewide, A11Y-003 JSON-LD (Organization/SoftwareApplication/FAQPage/Article/BreadcrumbList), SEO-004 sitemap.
2. Links/forms: LINK-003 external target=_blank, LINK-004 mailto, A11Y-004 input labels, UX-005 validation, UX-004 role-card CTAs.
3. Nav/a11y: NAV-002 focus trap, NAV-004 ESG badge, A11Y-008 accordion semantics, UX-012 smooth scroll.
4. Layout: UI-008/LINK-001 back-to-top, RESP-003 marquee fade, RESP-006 code scroll, RESP-008/FAQ gap, BUG-003 reveal failsafe, A11Y-007 blog hero scrim.
5. Content: COPY-002/006, IMPROVE-003/008/011/012, UX-008/UX-015, IMPROVE-010 share, BUG-010 /products redirects.

## 🟣 NEEDS OWNER DECISION (exclude or direct)
- UX-001 / IMPROVE-001 / IMPROVE-002: testimonials, customer logos, social proof → **fabrication on a pre-launch no-customer site; charter forbids fake customers.** Exclude, OR use honest "no customers yet — statutory authority is the trust signal", OR owner supplies real quotes/logos.
- BUG-002: dedicated /sectors landing PAGE (new page) — build or keep anchor?
- SEO-002/003: title/H1 keyword rewrites (SEO strategy) — owner approves keywords.
- SEO-005: blog SSR pagination (architecture) — worth it?
- UX-011 site-wide search; UX-014 sticky header — confirm desired.
- COPY-001 "Intelligence by engineers." — keep or reword?
