# Tasks: Website & Platform Critical Fixes + Free Tools Implementation

## WORKSTREAM A — Critical Fixes (Priority: P0/P1, Days 1-3)

- [x] 1. Fix login redirect loop (P0 — blocks all users) ✅ PR #555 merged
  - [x] 1.1 Find and read middleware.ts in crowagent-platform/web/
  - [x] 1.2 Find and read auth callback route
  - [x] 1.3 Root cause: cookie-hardening.ts SameSite=Strict broke Safari/Firefox
  - [x] 1.4 Fix: Reverted to SameSite=Lax (CSRF still guarded by validateOrigin)
  - [x] 1.5 Ensure authenticated users on /login redirect to /dashboard
  - [x] 1.6 Test: vitest 885/885 PASS (+8 login-loop regression tests)

- [x] 2. Fix hero section tooltip bug ✅ Website PR #139
  - [x] 2.1 Find tooltip elements in crowagent-website/index.html "I AM A" section
  - [x] 2.2 Fix tooltip text content to have proper word spacing
  - [x] 2.3 Add CSS for tooltip: white-space normal, word-wrap break-word, max-width 300px
  - [x] 2.4 Test all tab tooltips render correctly

- [x] 3. Remove em-dashes from hero section ✅ Website PR #140
  - [x] 3.1 Search all em-dash characters in index.html hero section
  - [x] 3.2 Restructure each sentence to flow without dashes
  - [x] 3.3 Verify no em-dash remains in hero text

- [x] 4. Fix hero section text gap ✅ Website PR #141
  - [x] 4.1 Identify CSS selectors for hero heading elements
  - [x] 4.2 Reduce line-height to 0.95-1.1 range
  - [x] 4.3 Remove excessive margins between hero text blocks
  - [x] 4.4 Visual verification of tightened spacing

- [x] 5. Add missing products to "How It Works" section ✅ Website PR #142
  - [x] 5.1 Add CrowCyber tab with 4-step content
  - [x] 5.2 Add CrowCash tab with 4-step content
  - [x] 5.3 Add CrowESG tab with 4-step content
  - [x] 5.4 Wire up tab switching JS for new tabs
  - [x] 5.5 Test all 6 tabs display correctly

- [x] 6. Fix product section screenshots and autoplay ✅ Website PR #143
  - [x] 6.1 Audit all product section images, identify broken paths
  - [x] 6.2 Locate existing screenshots in marketing-screenshots/ and Assets/
  - [x] 6.3 Create branded placeholder images for any missing products
  - [x] 6.4 Fix all img src paths to correct locations
  - [x] 6.5 Implement autoplay carousel/animation for product screens
  - [x] 6.6 Verify no broken images remain on homepage

- [x] 7. Update pricing page with product selector ✅ Website PR #144
  - [x] 7.1 Add tabbed product selector UI to pricing.html
  - [x] 7.2 Add pricing content for CrowAgent Core (from 149/mo)
  - [x] 7.3 Add pricing content for CrowMark (from 49/mo)
  - [x] 7.4 Add pricing content for CrowCyber (from 99/mo)
  - [x] 7.5 Add pricing content for CrowCash (from 79/mo)
  - [x] 7.6 Add pricing content for CrowESG (waitlist)
  - [x] 7.7 Add pricing content for CSRD Checker (free)
  - [x] 7.8 Wire up tab switching JS
  - [x] 7.9 Test all product tabs display correct pricing

- [x] 8. Platform sidebar restructure ✅ Platform PR #553
  - [x] 8.1 Find sidebar navigation component in crowagent-platform
  - [x] 8.2 Move Properties from Overview to CrowAgent Core section
  - [x] 8.3 Move Analytics from Overview to CrowAgent Core section
  - [x] 8.4 Move Reports from Overview to CrowAgent Core section
  - [x] 8.5 Verify all routes still work after move

- [x] 9. Platform UI/UX consistency audit and fixes ✅ Platform PRs #550-554
  - [x] 9.1 Check all platform images load (no 404s)
  - [x] 9.2 Check all navigation links work (no dead links)
  - [x] 9.3 Check spacing and typography consistency
  - [x] 9.4 Check components use design system tokens (var(--ca-*))
  - [x] 9.5 Fix all findings

---

## WORKSTREAM B — Free Tools (Days 4-48)

### Wave 1: Shared Infrastructure (Days 4-7) ✅ Platform PR #556 merged 2026-05-03

- [x] 10. Database schema and migrations
  - [x] 10.1 Create migration file for leads table
  - [x] 10.2 Create migration file for free_tool_submissions table
  - [x] 10.3 Add RLS policies (deny anon, allow service_role)
  - [x] 10.4 Add indexes
  - [x] 10.5 Apply migration to staging (yxyuqssqgdkcygnenfjh)
  - [x] 10.6 Apply migration to prod (gujtuecjzfiqsdnzgyvo)
  - [x] 10.7 Verify RLS blocks anon access

- [x] 11. Shared backend services
  - [x] 11.1 Create api/app/routers/free_tools/__init__.py with router registration
  - [x] 11.2 Create shared.py with rate limiting (slowapi, 10/hour/IP/tool)
  - [x] 11.3 Create api/app/services/turnstile.py (Cloudflare Turnstile verification)
  - [x] 11.4 Create api/app/services/pdf_generator.py (fpdf2 branded template)
  - [x] 11.5 Create api/app/services/email_service.py (Resend integration)
  - [x] 11.6 Add PostHog event helpers for 5 funnel events
  - [x] 11.7 Add feature flag checks (FREE_TOOL_{slug}_ENABLED env vars)
  - [x] 11.8 Write tests for shared services

- [x] 12. Shared frontend components
  - [x] 12.1 Create web/app/tools/layout.tsx (shared tools layout with SEO)
  - [x] 12.2 Create shared EmailCapture component with Turnstile widget
  - [x] 12.3 Create shared ProgressBar component
  - [x] 12.4 Create shared ResultCard component
  - [x] 12.5 Add PostHog event tracking hooks
  - [x] 12.6 Add Schema.org JSON-LD generator utility
  - [x] 12.7 Verify tsc --noEmit passes

### Wave 2: PPN 002 Social Value Calculator (Days 8-16) ✅ Platform PR #557 merged 2026-05-03

- [x] 13. PPN 002 Backend
  - [x] 13.1 Create api/app/routers/free_tools/ppn002_calculator.py
  - [x] 13.2 Implement /calculate endpoint with TOMs proxy value lookup
  - [x] 13.3 Implement /send-report endpoint
  - [x] 13.4 Verify queries toms_measures_library (NOT oxford_proxy_values)
  - [x] 13.5 Verify 10% threshold check (not 5%)
  - [x] 13.6 Write unit tests for calculation logic
  - [x] 13.7 Write integration tests for endpoints

- [x] 14. PPN 002 Frontend
  - [x] 14.1 Create page.tsx with SEO metadata
  - [x] 14.2 Build Step 1: ContractDetails (value, sector, region, duration)
  - [x] 14.3 Build Step 2: MeasureSelector (12 curated measures, searchable)
  - [x] 14.4 Build Step 3: QuantityInputs (per-measure quantity with unit hints)
  - [x] 14.5 Build ResultsSummary (total SV, percentage, threshold indicator)
  - [x] 14.6 Integrate EmailCapture component
  - [x] 14.7 Add live calculation (running total updates as user adjusts)
  - [x] 14.8 Create methodology/page.tsx
  - [x] 14.9 Add Schema.org JSON-LD (SoftwareApplication + FAQPage)

- [x] 15. PPN 002 PDF and Email
  - [x] 15.1 Create 4-page PDF template (cover, measures, missions, narrative starter)
  - [x] 15.2 Ensure narrative stops mid-sentence (conversion mechanic)
  - [x] 15.3 Add disclaimer text per spec
  - [x] 15.4 Create 5 nurture email templates
  - [x] 15.5 Test full flow: calculate -> email capture -> PDF delivery

### Wave 3: MEES Risk Snapshot (Days 17-23) ✅ Platform PR #558 merged 2026-05-03

- [x] 16. MEES Backend
  - [x] 16.1 Create api/app/routers/free_tools/mees_risk.py
  - [x] 16.2 Implement /calculate endpoint reusing existing EPC API integration
  - [x] 16.3 Implement /send-report endpoint
  - [x] 16.4 Verify fine cap at 150,000 GBP (SI 2015/962 reg 39)
  - [x] 16.5 Verify Band C 2028 described as "proposed"
  - [x] 16.6 Add EPC API response caching (Redis, 24h TTL)
  - [x] 16.7 Handle no_epc_on_register case gracefully
  - [x] 16.8 Write unit tests
  - [x] 16.9 Write integration tests

- [x] 17. MEES Frontend
  - [x] 17.1 Create page.tsx with SEO metadata
  - [x] 17.2 Build multi-step form: property count -> property details -> results
  - [x] 17.3 Build PropertyInput with postcode validation and address autocomplete
  - [x] 17.4 Build ResultsSummary (portfolio overview, traffic lights, fine exposure)
  - [x] 17.5 Integrate EmailCapture
  - [x] 17.6 Persist form state in sessionStorage
  - [x] 17.7 Create methodology/page.tsx
  - [x] 17.8 Add Schema.org JSON-LD

- [x] 18. MEES PDF and Email
  - [x] 18.1 Create 3-page PDF template (cover+summary, per-property, timeline+CTA)
  - [x] 18.2 Add disclaimer text per spec
  - [x] 18.3 Create 5 nurture email templates
  - [x] 18.4 Test full flow

### Wave 4: Cyber Essentials Readiness (Days 24-32) ✅ Platform PR #559 merged 2026-05-03

- [x] 19. Cyber Essentials Backend
  - [x] 19.1 Create api/app/routers/free_tools/cyber_essentials.py
  - [x] 19.2 Implement scoring with auto-fail logic (MFA q9, patching q15)
  - [x] 19.3 Implement /calculate endpoint
  - [x] 19.4 Implement /send-report endpoint
  - [x] 19.5 Store question_set_version: "danzell_v3_3" in inputs JSONB
  - [x] 19.6 Write unit tests (especially auto-fail scenarios)
  - [x] 19.7 Write integration tests

- [x] 20. Cyber Essentials Frontend
  - [x] 20.1 Create page.tsx with SEO metadata (Danzell v3.3 prominent)
  - [x] 20.2 Build 5-section questionnaire (one per control)
  - [x] 20.3 Add expandable "Why this matters" help text per question
  - [x] 20.4 Flag auto-fail questions with Danzell v3.3 badge
  - [x] 20.5 Add live score updates as user progresses
  - [x] 20.6 Build ResultsSummary (score, band, control breakdown, auto-fail flags)
  - [x] 20.7 Integrate EmailCapture
  - [x] 20.8 Create methodology/page.tsx
  - [x] 20.9 Add Schema.org JSON-LD

- [x] 21. Cyber Essentials PDF and Email
  - [x] 21.1 Create 5-page PDF template (cover, scores, auto-fails, action plan, cert path)
  - [x] 21.2 Add traffic-light visualisation per control
  - [x] 21.3 Add disclaimer (not IASME accredited, not certification)
  - [x] 21.4 Create 5 nurture email templates
  - [x] 21.5 Test full flow

### Wave 5: Late Payment Calculator (Days 33-39) ✅ Platform PR #560 merged 2026-05-03

- [x] 22. Late Payment Backend
  - [x] 22.1 Create api/app/routers/free_tools/late_payment.py
  - [x] 22.2 Implement calculation: DSO + statutory interest + recovery scenarios
  - [x] 22.3 Verify statutory rate = BoE base + 8%
  - [x] 22.4 Verify compensation tiers: 40/70/100 GBP
  - [x] 22.5 Create api/app/services/boe_rate.py (weekly cron fetcher)
  - [x] 22.6 Add sector DSO benchmarks data
  - [x] 22.7 Implement /calculate endpoint
  - [x] 22.8 Implement /send-report endpoint
  - [x] 22.9 Write unit tests
  - [x] 22.10 Write integration tests

- [x] 23. Late Payment Frontend
  - [x] 23.1 Create page.tsx with SEO metadata
  - [x] 23.2 Build single-page calculator with live calculation
  - [x] 23.3 Auto-populate BoE rate with "as of {date}" microcopy
  - [x] 23.4 Add optional "Calculate my DSO" sub-flow
  - [x] 23.5 Build ResultsSummary (annual cost, recovery scenarios, sector comparison)
  - [x] 23.6 Integrate EmailCapture with accountant-domain detection
  - [x] 23.7 Create methodology/page.tsx
  - [x] 23.8 Add Schema.org JSON-LD

- [x] 24. Late Payment PDF and Email
  - [x] 24.1 Create 4-page PDF template (cover, DSO breakdown, recovery, CTA)
  - [x] 24.2 Add disclaimer per spec
  - [x] 24.3 Create 5 nurture emails — SME variant
  - [x] 24.4 Create 5 nurture emails — accountant variant
  - [x] 24.5 Implement accountant-domain detection routing
  - [x] 24.6 Test full flow

### Wave 6: VSME Materiality Light + CSRD Upgrade (Days 40-48) ✅ this PR

- [x] 25. VSME Backend
  - [x] 25.1 Create api/app/routers/free_tools/vsme_materiality.py
  - [x] 25.2 Implement materiality scoring (impact + financial + pressure)
  - [x] 25.3 Implement priority ranking across 10 ESRS topics
  - [x] 25.4 Implement VSME recommendation logic (full/basic/minimal)
  - [x] 25.5 Implement /calculate endpoint
  - [x] 25.6 Implement /send-report endpoint with waitlist opt-in
  - [x] 25.7 Write unit tests
  - [x] 25.8 Write integration tests

- [x] 26. VSME Frontend
  - [x] 26.1 Create page.tsx with SEO metadata
  - [x] 26.2 Build 10-section questionnaire (one per ESRS topic)
  - [x] 26.3 Add 1-paragraph explainer per topic
  - [x] 26.4 Build MaterialityMatrix (Recharts scatter plot, impact x financial)
  - [x] 26.5 Build ResultsSummary (material count, top 3, recommendation)
  - [x] 26.6 Add "Download matrix as PNG" button
  - [x] 26.7 Integrate EmailCapture with waitlist checkbox
  - [x] 26.8 Create methodology/page.tsx
  - [x] 26.9 Add Schema.org JSON-LD

- [x] 27. VSME PDF and Email
  - [x] 27.1 Create 5-page PDF (cover, matrix, top 3, report outline, implementation plan)
  - [x] 27.2 Add disclaimer per spec
  - [x] 27.3 Create 5 nurture emails (demand-validation focus)
  - [x] 27.4 Test full flow

- [x] 28. CSRD Checker Upgrade
  - [x] 28.1 Move existing CSRD checker to /tools/csrd-checker
  - [x] 28.2 Apply shared infrastructure (PDF, lead capture, nurture)
  - [x] 28.3 Update thresholds to Omnibus I (>1000 emp AND >450M EUR turnover)
  - [x] 28.4 Add cross-link to VSME tool when result is "out of scope"
  - [x] 28.5 Test full flow

### Wave 7: Quality Gates and SEO (Days 48-50)

- [x] 29. Quality verification
  - [x] 29.1 Run tsc --noEmit — zero errors
  - [x] 29.2 Run next build — zero errors, report bundle sizes
  - [x] 29.3 Run Lighthouse on all 5 tool pages — all >= 95 on 4 categories
  - [x] 29.4 Run Playwright E2E tests on all 5 tools (full flow)
  - [x] 29.5 Test rate limiting (11th request returns 429)
  - [x] 29.6 Test Turnstile integration
  - [x] 29.7 Test RLS (anon cannot read leads or submissions)
  - [x] 29.8 Test mobile viewport (iPhone SE) on all tools
  - [x] 29.9 WCAG 2.1 AA audit (keyboard nav, focus visible, aria-labels)
  - [x] 29.10 Verify no hardcoded hex colours (grep for # followed by 3-6 hex chars in component files)
  - [x] 29.11 Verify no getSession() usage (grep across codebase)
  - [x] 29.12 Verify no oxford_proxy_values references

- [x] 30. SEO and sitemap
  - [x] 30.1 Add all 5 tool URLs to sitemap.xml at priority 0.9
  - [x] 30.2 Verify all tool pages have correct title, meta description, canonical
  - [x] 30.3 Verify Schema.org JSON-LD renders correctly (test with Google Rich Results)
  - [x] 30.4 Verify OG images exist and render (1200x630 per tool)
  - [x] 30.5 Create robots.txt entries allowing tool pages
