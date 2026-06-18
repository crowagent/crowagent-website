# Requirements: Website & Platform Critical Fixes + Free Tools Implementation

## Overview
Two-part scope: (A) Fix all regressions and bugs on crowagent.ai website and app.crowagent.ai platform introduced by previous Claude Code sessions, and (B) Implement the 5 Free Tools lead-generation system per CrowAgent-Free-Tools-Specification-v1-0.md.

**Reference documents:**
- CrowAgent-Free-Tools-Specification-v1-0.md (primary spec, ~12,000 words)
- CA-00 Master Strategy & Product Vision v1.1
- SPEC-01 Domain Model (BC-4 Core, BC-5 CrowMark)
- SPEC-04 Architecture & API
- SPEC-05 Database Schema

---

## PART A — Website & Platform Critical Fixes (ALL COMPLETED)

### REQ-A1: Hero Section Tooltip Bug ✅ DONE (PR #139)
- **Problem**: Hover tooltip on "Commercial Landlord" tab shows text with no spaces
- **Requirement**: All tooltips must have properly spaced, readable text. No text overlap.
- **Acceptance**: All tabs in "I AM A" section render tooltips correctly.

### REQ-A2: Hero Section Em-Dash Removal ✅ DONE (PR #140)
- **Problem**: Hero text uses unprofessional em-dashes
- **Requirement**: Remove all em-dashes. Restructure sentences naturally.
- **Acceptance**: No em-dash characters in any hero text variant.

### REQ-A3: Hero Section Text Gap ✅ DONE (PR #141)
- **Problem**: Excessive vertical spacing between hero text lines
- **Requirement**: Tighten line-height and margins for cohesive text block.
- **Acceptance**: No excessive gaps between hero text lines.

### REQ-A4: "How It Works" Section — All Products ✅ DONE (PR #142)
- **Problem**: Missing CrowCyber, CrowCash, CrowESG from tabs
- **Requirement**: All 6 products have tabs with 4-step content.
- **Acceptance**: All 6 product tabs present and functional.

### REQ-A5: Product Sections — Screenshots & Autoplay ✅ DONE (PR #143)
- **Problem**: Broken images for CrowCash and CrowCyber
- **Requirement**: All product sections have working screenshots with autoplay carousel.
- **Acceptance**: No broken images. All products show visual demos.

### REQ-A6: Pricing Page — Product Selection ✅ DONE (PR #144)
- **Problem**: No product selector on pricing page
- **Requirement**: Tabbed product selector showing pricing for all products.
- **Acceptance**: User can switch between products and see correct pricing.

### REQ-A7: Login Redirect Loop (P0) ✅ DONE (PR #555)
- **Problem**: Login stuck in redirect loop
- **Root cause**: cookie-hardening.ts escalated SameSite=Lax to Strict; Safari/Firefox drop Strict cookies on RSC fetch after Server Action POST
- **Fix**: Reverted to SameSite=Lax. CSRF still guarded by validateOrigin() in proxy.ts
- **Acceptance**: Full auth flow works. 885/885 vitest PASS (+8 regression tests).

### REQ-A8: Platform Sidebar Restructure ✅ DONE (PR #553)
- **Problem**: Properties, Analytics, Reports under Overview instead of CrowAgent Core
- **Requirement**: Move to CrowAgent Core section in sidebar.
- **Acceptance**: Items under CrowAgent Core. Routes work.

### REQ-A9: Platform UI/UX Consistency ✅ DONE (PRs #550-554)
- **Problem**: General UI inconsistencies
- **Requirement**: All images load, links work, consistent styling.
- **Acceptance**: No broken images, dead links, or visual inconsistencies.

---

## PART B — Free Tools Lead Generation System

### REQ-B1: Universal Lead-Gen Mechanic (Spec Section 1.1)

Every free tool MUST follow this exact 7-step funnel:

1. User lands on ungated tool page (NO signup wall)
2. Tool runs in browser with instant feedback (NO email needed for input)
3. After completing inputs, user sees SUMMARY result on screen (FREE)
4. To unlock FULL branded PDF report, user provides email
5. PDF emailed via Resend with download link to Supabase Storage
6. User automatically enrolled in 5-email nurture sequence over 14 days
7. Nurture sequence ends with Stripe Checkout link to relevant paid tier

**Anti-patterns (MUST NOT do):**
- Email-gated input (kills 70%+ completion). Email asked AFTER value shown
- Asking for company size + name + phone + role on first capture (3 fields max: email, first name, optional company)
- Sending user to generic /pricing page. Each tool has dedicated post-conversion landing page
- Hiding result behind email gate. Show headline number; gate PDF and detail only
- Auto-subscribing to generic newsletter. Each tool creates tagged contact with tool name as source

### REQ-B2: Shared Technical Foundation (Spec Section 1.2)

**Frontend stack:**
- Next.js 15 App Router on crowagent.ai/tools/[tool-slug]
- TypeScript strict mode
- Tailwind CSS with var(--ca-*) brand tokens
- shadcn/ui for form primitives (Input, Select, RadioGroup, Slider, Progress, Card)
- React Hook Form + Zod validation
- No client-side state management library (React Context + useState only)

**Backend stack:**
- FastAPI Python 3.12 on Railway, namespaced under /v1/free-tools/
- ALL calculation logic server-side (reusable inside paid platform)
- Each tool: one POST /calculate endpoint + one POST /send-report endpoint

**Email + nurture:**
- Resend for transactional (PDF delivery)
- Brevo or Resend Audiences for 14-day nurture sequence
- Tags applied: tool:{slug}, intent:{product_slug}, gdpr_consent:explicit
- Nurture templates stored in api/app/templates/email/free-tools/

**Storage:**
- Submissions in free_tool_submissions table (single table, polymorphic via tool_slug)
- PDFs cached in Supabase Storage free-tool-reports/{submission_id}.pdf for 30 days then auto-deleted
- Email captures in leads table (separate from auth.users; leads self-convert later)

**Database schema:**
- leads table: id, email (UNIQUE), first_name, company, source_tool_slug, intent_product, gdpr_consent_at, marketing_consent, nurture_sequence_id, nurture_started_at, converted_at, organisation_id (FK), unsubscribed_at, created_at, updated_at
- free_tool_submissions table: id, tool_slug (CHECK constraint for 5 valid slugs), inputs (JSONB), result (JSONB), lead_id (FK nullable), pdf_url, ip_address, user_agent, utm_source, utm_medium, utm_campaign, created_at
- RLS: deny ALL from anon role; only service_role writes
- Indexes: source_tool_slug, intent_product, tool_slug, lead_id

**Rate limiting:** 10 submissions per IP per hour per tool via slowapi. Returns 429 with retry-after header.

**Bot protection:** Cloudflare Turnstile on email capture form ONLY (not on tool input form). Verify token server-side before triggering email send.

**Analytics (PostHog):**
- free_tool_started: user opens tool
- free_tool_completed: result shown
- free_tool_email_captured: email submitted
- free_tool_pdf_downloaded: PDF link clicked
- free_tool_converted: lead becomes paid customer
- NO events fire before cookie consent

**Feature flags:** Each tool gated by FREE_TOOL_{SLUG}_ENABLED env var. When disabled, show "Coming soon" with email capture for launch notification.

### REQ-B3: Shared PDF Generation (Spec Section 1.3)

- fpdf2 wrapped in try/except (platform invariant)
- Letterhead with CrowAgent logo
- Footer: company number 17076461 + ICO registration C1901492
- Branded with var(--teal) accent and var(--obsidian) text
- Tool-specific disclaimer paragraph
- Final page: "Continue with [Product]" CTA box
- Generated as Railway background job, completes within 5 seconds
- UI shows "Sending your report to {email}..." spinner, then redirects to thank-you page

### REQ-B4: Shared SEO Architecture (Spec Section 1.4)

Each tool page MUST have:
- Title: "{Tool name} - Free [domain] tool - CrowAgent"
- Meta description: "Free {tool name}. {key benefit}. Used by {target persona}. No signup needed."
- Schema.org SoftwareApplication JSON-LD (applicationCategory: BusinessApplication, offers.price: 0)
- Schema.org FAQPage JSON-LD with 5+ Q&A pairs per tool
- OpenGraph + Twitter Card metadata with tool-specific share image (1200x630 PNG)
- Canonical URL
- Sitemap entry at priority 0.9 (higher than blog at 0.6)

Each tool also gets:
- /tools/[slug]/methodology page (explainer of how it works)
- 3-5 blog articles forming content cluster

### REQ-B5: MEES Risk Snapshot Tool (Spec Section 2)

**Slug:** mees-risk-snapshot
**URL:** crowagent.ai/tools/mees-risk-snapshot
**Funnels into:** CrowAgent Core (149-599 GBP/mo)
**Build effort:** 6-8 engineer-days

**Inputs:**
- Number of properties (1-5, slider)
- Per property: postcode (validated UK format)
- Per property: address from EPC API autocomplete
- Per property (optional): rateable value (defaults to median for postcode if not provided)
- Hidden: UTM parameters

**Calculation logic:**
- Reuses 80% of existing Core EPC API integration
- lookup_epc_by_address from existing platform code
- compute_compliance_status: band + rateable_value + date -> compliant/at_risk_2028/non_compliant
- compute_fine_exposure: rateable-value-based, capped at 150,000 GBP per SI 2015/962 reg 39
- Handle no_epc_on_register case gracefully (12% of commercial properties)

**On-screen output (free):**
- Portfolio summary: X properties, Y compliant, Z at risk, total fine exposure
- Per-property traffic-light status

**PDF output (email-gated):**
- 3 pages: cover+summary, per-property breakdown, timeline+retrofit+CTA
- Disclaimer: "Not a Level 5 EPC assessment. Not legal advice. Band C 2028 is proposed legislation, not enacted law."

**Conversion path:** /products/crowagent-core?utm_source=mees-risk-snapshot&plan=core_starter

**EPC API caching:** Redis, 24h TTL per postcode+address hash

**SEO keywords:** "MEES checker commercial property", "MEES compliance check", "EPC band check commercial", "MEES 2028 risk", "MEES fine calculator"

**Risks/anti-patterns:**
- NEVER promise Level 5 EPC assessment
- NEVER show "definitely will be fined 150,000" without context
- NEVER lock postcode lookup behind email
- Handle no_epc_on_register as higher-value lead (they need EPC commissioned)

### REQ-B6: PPN 002 Social Value Calculator (Spec Section 3)

**Slug:** ppn002-calculator
**URL:** crowagent.ai/tools/ppn002-calculator
**Funnels into:** CrowMark (49-399 GBP/mo)
**Build effort:** 8-10 engineer-days
**Differentiator:** NO direct free competitor exists. True green field.

**Inputs:**
- Contract value (25k-25M GBP)
- Sector (7 options: Construction, FM, Professional Services, Healthcare, Education, IT/Digital, Other)
- Region (UK NUTS 2 codes)
- Contract duration (6-60 months slider)
- Up to 3 measures from curated list of 12
- Per measure: quantity (unit-dependent)

**12 curated measures (from toms_measures_library, NEVER oxford_proxy_values):**
- NT16: Local SME spend (0.20x SROI multiplier)
- NT2: Apprenticeship Level 3 (1,837/week)
- NT26: CO2e reduction (251/tCO2e)
- NT37: Crime-reduction volunteering (13.50/hour)
- NT3: Long-term unemployed employment (9,163/person)
- NT4: Disability inclusion hire (6,895/person)
- Care leaver employment (9,500/person)
- NT45: NHS wellbeing programme (220/participant)
- NT44: Mental health first aid (187/person)
- T-Level placement (1,200/week)
- NT22: School engagement (750/session)
- NT15: Local employment within 30 miles (5,675/person)

**Calculation:**
- quantity x proxy_value x duration multiplier (varies by unit type)
- SV percentage = total_sv / contract_value x 100
- Threshold check: 10% minimum (PPN 002, NOT 5% from older PPN 06/20)
- Competitive benchmark: 18%+ (anecdotal from research)
- PPN 002 effective: 24 February 2025 (supersedes PPN 06/20)

**On-screen output:** Total SV value, percentage, threshold indicator, missions covered (of 8)

**PDF output (4 pages):**
- Cover + summary score
- Measure breakdown with monetised contribution
- Mission coverage map (8 PPN 002 missions)
- Draft narrative starter (200 words, STOPS MID-SENTENCE as conversion mechanic)
- Disclaimer: "Indicative TOMs proxy values. Not a guarantee of bid score."

**Conversion path:** /products/crowmark?utm_source=ppn002-calculator&plan=crowmark_solo

**SEO keywords:** "PPN 002 calculator" (own this), "social value calculator UK", "PPN 002 score", "TOMs calculator"

**Risks/anti-patterns:**
- NEVER give scores so confident user assumes they will win
- NEVER include full narrative in free PDF (must stop mid-sentence)
- NEVER exceed 12 measures in free version
- Note: some local authorities use older TOMs frameworks

### REQ-B7: Cyber Essentials Readiness Score (Spec Section 4)

**Slug:** cyber-essentials-readiness
**URL:** crowagent.ai/tools/cyber-essentials-readiness
**Funnels into:** CrowCyber (79-499 GBP/mo)
**Build effort:** 7-9 engineer-days
**Differentiator:** Built specifically against Danzell v3.3 (effective 27 April 2026)

**Inputs: 20 questions across 5 controls (Yes/No/Unsure):**

Control 1 - Firewalls (3 questions):
- Boundary firewall between network and internet
- Firewall admin interfaces protected with non-default passwords AND MFA
- Inbound firewall rules documented and reviewed every 12 months

Control 2 - Secure Configuration (4 questions):
- Unnecessary user accounts removed
- Default passwords changed on all networked devices
- Auto-run/auto-play disabled on Windows
- Unnecessary software/services removed

Control 3 - User Access Control (4 questions):
- All users have unique account (no shared)
- **MFA enforced on all admin accounts AND cloud services (AUTO-FAIL if No)**
- Admin accounts used only for admin tasks
- Documented joiner-mover-leaver process

Control 4 - Malware Protection (3 questions):
- Anti-malware on all in-scope devices
- Definitions updated daily or real-time
- Application allow-listing or sandboxing for high-risk apps

Control 5 - Security Update Management (4 questions):
- **Critical/high patches applied within 14 days (AUTO-FAIL if No)**
- All software within vendor-supported lifecycle
- OS set to receive automatic updates
- Asset inventory of all in-scope devices and software

Plus 2 contextual (not scored): device count band, cloud services used

**Scoring:**
- Yes=1.0, No=0.0, Unsure=0.5
- Per-control percentage
- Overall = average of 5 control scores
- Auto-fail: if q9 (MFA) or q15 (patching) = "no", readiness_band = "not_ready_auto_fail"
- Bands: ready (>=90%), nearly_ready (>=75%), not_ready (<75%), not_ready_auto_fail

**On-screen output:** Overall score, band, per-control breakdown, auto-fail flags, top 3 priorities

**PDF output (5 pages):**
- Cover + headline score + band
- Score per control with traffic-light
- Auto-fail flags explained (Danzell v3.3 changes)
- Per-gap action plan (specific remediation per No/Unsure answer)
- Cert path + costs (320-720 GBP IASME fee) + CrowCyber CTA

**Disclaimer:** "Not an official IASME assessment. Not certification. CrowAgent is not (yet) an accredited Certification Body."

**Conversion path:** /products/crowcyber?utm_source=ce-readiness&plan=crowcyber_standard (or waitlist if not launched)

**SEO keywords:** "Cyber Essentials readiness check", "Cyber Essentials Danzell", "Cyber Essentials MFA mandatory", "Cyber Essentials April 2026 changes"

**Risks/anti-patterns:**
- NEVER claim CrowAgent is IASME-accredited (INFRA-15 still open)
- NEVER promise certification
- NEVER use Willow v3.2 question wording (Danzell v3.3 is current)
- Question wording needs IASME-accredited reviewer sign-off before launch

### REQ-B8: Late Payment Cost Calculator (Spec Section 5)

**Slug:** late-payment-calculator
**URL:** crowagent.ai/tools/late-payment-calculator
**Funnels into:** CrowCash (~29 GBP/mo accountant tier)
**Build effort:** 5-7 engineer-days

**Inputs:**
- Monthly revenue (GBP)
- Current DSO (0-120 days slider) OR "Calculate from AR" sub-flow (AR balance + 12-month sales)
- Customer count (1-10,000)
- Average invoice value (auto-calculated from revenue/customers if blank)
- Industry/sector (12 SIC code groups)
- Current chasing method (None / Manual / Some automation)
- Bank of England base rate (auto-populated, currently 4.25%)

**Calculation:**
- AR balance = daily_revenue x DSO
- Cost of capital = BoE base + 4% (typical SME borrowing margin)
- Annual carrying cost = AR_balance x cost_of_capital_rate
- Statutory interest = BoE base + 8% (Late Payment of Commercial Debts Act 1998)
- Overdue value = annual_revenue x 0.30 (UK average per Bacs)
- Compensation per overdue invoice: 40 GBP (<1k), 70 GBP (1k-10k), 100 GBP (>10k)
- Recovery scenarios: reduce DSO by 10/15/20 days -> cash recovered
- Sector benchmark comparison (12 sectors with median DSO)

**Sector DSO benchmarks (must be sourced and cited):**
- Construction: 65, Professional services: 45, Manufacturing: 50, Retail/wholesale: 38
- IT/software: 42, Healthcare: 48, Education: 55, Hospitality: 30
- Transport: 55, Utilities: 60, Real estate: 70, Other: 50

**On-screen output:** Annual cost, statutory interest claimable, compensation claimable, recovery scenarios, sector comparison

**PDF output (4 pages):**
- Cover + headline annual cost
- DSO breakdown + sector benchmark
- Cash recovery scenarios + 30/60/90-day improvement plan
- "How automation closes the gap" + CrowCash CTA
- Disclaimer: cites BoE rate, Late Payment Act 1998, sector benchmark sources

**BoE rate fetcher:** Weekly cron from BoE Statistical Interactive Database, cached in Redis with 7-day TTL. Alert if stale >14 days.

**Accountant-domain detection:** Check email domain for accountant patterns (icaew.com, aat.org.uk, common firm patterns). If matched, route nurture to partner-programme content instead of direct subscription.

**Conversion paths:**
- SME: /products/crowcash?utm_source=late-payment-calculator&plan=crowcash_standard
- Accountant: /partners/accountants?utm_source=late-payment-calculator

**SEO keywords:** "late payment calculator UK", "DSO calculator", "statutory interest calculator UK", "cash flow improvement calculator"

**Risks/anti-patterns:**
- NEVER present statutory interest as "free money" (damages customer relationships)
- NEVER over-promise DSO improvement
- Sector benchmarks must be sourced and cited (Bacs/Intuit/Xero data)
- BoE rate cron must actually run; alert if cached value >14 days old

### REQ-B9: VSME Materiality Light + CSRD Checker Upgrade (Spec Section 6)

**VSME Slug:** vsme-materiality-light
**CSRD Slug:** csrd-checker (existing, upgrade)
**Funnels into:** CrowESG (validation only, product not yet built)
**Build effort:** 5-7 engineer-days for new tool + 2 days CSRD upgrade
**Purpose:** Demand validation. If waitlist >200 leads AND >30% open rate after 6 months, build CrowESG. Otherwise sunset.

**VSME Inputs: 30 questions across 10 ESRS topics (3 per topic):**

For each topic (E1 Climate, E2 Pollution, E3 Water, E4 Biodiversity, E5 Resource Use, S1 Own Workforce, S2 Workers in Value Chain, S3 Affected Communities, S4 Consumers, G1 Business Conduct):
- Q1 Impact materiality: "How significant is your business's impact on this topic?" (Not at all / Minor / Moderate / High / Severe)
- Q2 Financial materiality: "How significant is the financial risk/opportunity from this topic?" (same scale)
- Q3 Stakeholder pressure: "How much pressure from customers/investors/regulators?" (None / Some / Significant / Active demands)

**Scoring:**
- Impact/financial: 0-4 scale
- Pressure: 0-3 scale
- Material if impact >= 2 OR financial >= 2
- Priority score = (impact + financial) x 2 + pressure (max 19)
- VSME recommendation: full (>=5 material), basic (>=2), minimal (<2)

**On-screen output:** Material topics count, top 3 priorities, materiality matrix (2D heatmap), VSME report recommendation

**PDF output (5 pages):**
- Cover + matrix visualisation
- Top 3 priority disclosures with explainer
- Full topic-by-topic breakdown
- Draft VSME report outline (skeleton with section headers)
- 10-week implementation plan + "Join CrowESG waitlist" CTA
- Disclaimer: "Light assessment based on EFRAG VSME standard. Not full Double Materiality Assessment per CSRD ESRS."

**CSRD Checker upgrade:**
- Move to /tools/csrd-checker
- Apply shared infrastructure (PDF, lead capture, nurture)
- Update thresholds to Omnibus I: BOTH >1,000 employees AND >450M EUR turnover (both required)
- Cross-link to VSME tool when result is "out of scope but want to report voluntarily"

**Conversion path:** Waitlist for CrowESG (crowesg_waitlist lead status). Monthly regulatory update email. Auto-alert on product launch.

**SEO keywords:** "VSME materiality assessment", "double materiality SME", "CSRD applicability checker", "VSME report template UK"

**Risks/anti-patterns:**
- NEVER promise CSRD audit-ready output
- NEVER invent ESRS materiality thresholds (defer to EFRAG VSME guidance)
- Be honest in CTAs that product doesn't exist yet
- If waitlist signals fail after 6 months, sunset tools too

### REQ-B10: Implementation Roadmap (Spec Section 7)

Waves MUST be executed in this order:
1. Shared infrastructure (4 days) - foundation everything depends on
2. PPN 002 Calculator (9 days) - highest leverage, green field, no competitors
3. MEES Risk Snapshot (7 days) - reuses Core EPC API, generates leads for existing tier
4. Cyber Essentials Readiness (9 days) - time-sensitive (Danzell v3.3 differentiator decays)
5. Late Payment Calculator (7 days) - CrowCash not yet built; lead capture for future
6. CSRD Checker upgrade + VSME Materiality Light (9 days) - lowest priority, demand validation only

**Total: 45 engineer-days (~9 engineer-weeks)**

### REQ-B11: Quality Gates (Spec Section 8.3)

Every tool page MUST pass before merge:
- Lighthouse >= 95 on Performance, Accessibility, Best Practices, SEO
- WCAG 2.1 AA compliance
- Keyboard-navigable forms with visible focus and aria-labels on every input
- Mobile-first, tested on iPhone SE (375px, smallest reasonable viewport)
- TypeScript strict; tsc --noEmit passes
- All API endpoints validated with Pydantic
- Rate-limited via slowapi
- Sentry captures exceptions
- E2E Playwright test covering: input -> calculate -> email capture -> PDF generation success
- Cookie consent banner respected (no PostHog before consent)

---

## PART C — Architectural Invariants (NEVER VIOLATE)

### C.1 Code Invariants
- organisation_id everywhere (NEVER org_id)
- supabase.auth.getUser() in RSCs (NEVER getSession())
- GEMINI_API_KEY Railway-only (NEVER Vercel)
- toms_measures_library is canonical for PPN 002 (NEVER query oxford_proxy_values)
- All PDFs use fpdf2 wrapped in try/except
- CSS: var(--ca-*) tokens (NO hardcoded hex)
- CTA buttons: bg var(--teal) text var(--obsidian) (NEVER white-on-teal)
- Production AI model: claude-sonnet-4-6 (if AI used)

### C.2 Regulatory Invariants
- MEES fine: rateable-value based, capped at 150,000 GBP per SI 2015/962 reg 39 (NEVER 30,000 flat)
- MEES Band C 2028: "proposed" (NEVER "confirmed law")
- MEES Band B 2030/2035: "expected industry consensus" (not law)
- PPN 002 minimum SV weighting: 10% (NOT 5% from older PPN 06/20)
- PPN 002 effective: 24 February 2025 (not earlier)
- CSRD Omnibus I thresholds: BOTH >1,000 employees AND >450M EUR turnover (both required)
- Cyber Essentials v3.3 (Danzell): effective 27 April 2026, MFA and patching are auto-fail
- Late Payment Act statutory rate: BoE base + 8%
- Late Payment compensation: 40/70/100 GBP tiered by debt size
- NPV discount rate: 3.5% (HM Treasury Green Book)
- Annual subscription discount: exactly 10% (NEVER 20%)

### C.3 Infrastructure Invariants
- Supabase migrations applied to BOTH prod (gujtuecjzfiqsdnzgyvo) AND staging (yxyuqssqgdkcygnenfjh) in lockstep
- Each free tool ships as one PR (not split across many)
- Squash-merge only with --admin and --delete-branch
- 4 mandatory CI gates: tests, static analysis, secret detection, migration validation
- git -c commit.gpgsign=false commit always
- Never vercel deploy CLI from platform repo
- Migrations: staging first, manually verified, then prod within 24 hours

### C.4 Process Invariants
- WP numbering: WP-FT-001 through WP-FT-005 (Free Tools series)
- Status flow: OPEN -> PACKAGED -> IN-PROGRESS -> REVIEW -> DONE
- Feature-flagged via FREE_TOOL_{slug}_ENABLED env var (staged launches)

---

## Correctness Properties

### CP-1: Regulatory Accuracy
- MEES fine never exceeds 150,000 GBP
- MEES Band C 2028 always described as "proposed"
- PPN 002 threshold is 10% (not 5%)
- Statutory interest = BoE base + 8%
- Compensation tiers: 40 GBP (<1k), 70 GBP (1k-10k), 100 GBP (>10k)
- Cyber Essentials v3.3 auto-fails: MFA + 14-day patching
- CSRD Omnibus I: BOTH >1000 emp AND >450M EUR (both conditions)

### CP-2: Data Integrity
- free_tool_submissions.tool_slug always matches one of 5 valid slugs (CHECK constraint)
- leads.email is unique (UNIQUE constraint)
- RLS denies all anon access to both tables
- Rate limit: max 10 submissions/hour/IP/tool
- PDF auto-deleted after 30 days from Supabase Storage

### CP-3: Lead Funnel Integrity
- Email is NEVER required before showing results
- PDF is ONLY sent after email capture + Turnstile verification
- Nurture sequence tagged with correct tool_slug and intent_product
- PostHog events fire in correct order: started -> completed -> captured -> downloaded -> converted
- No PostHog events before cookie consent
- 3 fields max on email capture: email, first_name, optional company

### CP-4: Auth Flow (Platform)
- Login always redirects to dashboard on success
- No redirect loops possible (SameSite=Lax, not Strict)
- Session persists across page refreshes
- getUser() used everywhere (never getSession())

### CP-5: Calculation Accuracy
- MEES: compute_fine_exposure from existing platform code (never reimplemented)
- PPN 002: proxy values from toms_measures_library table (never oxford_proxy_values)
- Late Payment: BoE rate auto-fetched weekly, never hardcoded, alert if >14 days stale
- Cyber Essentials: auto-fail logic correctly triggers on q9 AND q15
- VSME: material if impact >= 2 OR financial >= 2 (not AND)
