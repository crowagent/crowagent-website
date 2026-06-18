# Design: Website & Platform Critical Fixes + Free Tools Implementation

## Architecture Overview

Two workstreams:
1. **Workstream A** (Days 1-3): Fix all website and platform regressions. COMPLETED.
2. **Workstream B** (Days 4-48): Build 5 Free Tools lead-generation system. IN PROGRESS.

---

## WORKSTREAM A — Website & Platform Fixes (COMPLETED)

All fixes merged across 13 PRs (Platform #550-555, Website #139-144).
- Login redirect loop: cookie-hardening.ts SameSite=Strict reverted to Lax
- Tooltip, em-dash, hero gap, how-it-works tabs, screenshots, pricing tabs: all fixed
- Sidebar restructure: Properties/Analytics/Reports moved to CrowAgent Core
- UI/UX audit: all findings fixed

---

## WORKSTREAM B — Free Tools System

### B.1 System Architecture

```
User Browser
    |
    v
[Next.js 15 App Router] -- crowagent.ai/tools/[slug]
    |                          |
    | (SSR + Client)           | (API calls)
    v                          v
[Shared Components]      [FastAPI on Railway]
  - EmailCapture              |
  - ProgressBar               v
  - ResultCard           [Calculation Logic]
  - JSON-LD utility           |
                              v
                    [Supabase (service_role)]
                         |         |
                         v         v
                    [leads]   [free_tool_submissions]
                         |
                         v
                    [Resend] --> PDF email + nurture
                         |
                         v
                    [Supabase Storage] --> PDF files (30-day TTL)
```

### B.2 Database Schema

```sql
-- Migration: 20260503_free_tools_schema.sql
-- Apply to BOTH staging (yxyuqssqgdkcygnenfjh) AND prod (gujtuecjzfiqsdnzgyvo)

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  company text,
  source_tool_slug text,
  intent_product text,
  gdpr_consent_at timestamptz NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  nurture_sequence_id text,
  nurture_started_at timestamptz,
  converted_at timestamptz,
  organisation_id uuid REFERENCES public.organisations(id),
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.free_tool_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug text NOT NULL CHECK (tool_slug IN (
    'mees-risk-snapshot', 'ppn002-calculator',
    'cyber-essentials-readiness', 'late-payment-calculator',
    'vsme-materiality-light'
  )),
  inputs jsonb NOT NULL,
  result jsonb NOT NULL,
  lead_id uuid REFERENCES public.leads(id),
  pdf_url text,
  ip_address inet,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_source_tool ON public.leads(source_tool_slug);
CREATE INDEX idx_leads_intent ON public.leads(intent_product);
CREATE INDEX idx_free_tool_submissions_tool ON public.free_tool_submissions(tool_slug);
CREATE INDEX idx_free_tool_submissions_lead ON public.free_tool_submissions(lead_id);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_tool_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No anon access" ON public.leads FOR ALL TO anon USING (false);
CREATE POLICY "No anon access" ON public.free_tool_submissions FOR ALL TO anon USING (false);
CREATE POLICY "Service role full access" ON public.leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.free_tool_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### B.3 Backend API Structure

```
api/
  app/
    routers/
      free_tools/
        __init__.py           -- Router registration + feature flag middleware
        shared.py             -- Rate limiting (slowapi), Turnstile verify, PostHog helpers
        mees_risk.py          -- POST /v1/free-tools/mees-risk-snapshot/calculate
                              -- POST /v1/free-tools/mees-risk-snapshot/send-report
        ppn002_calculator.py  -- POST /v1/free-tools/ppn002-calculator/calculate
                              -- POST /v1/free-tools/ppn002-calculator/send-report
        cyber_essentials.py   -- POST /v1/free-tools/cyber-essentials-readiness/calculate
                              -- POST /v1/free-tools/cyber-essentials-readiness/send-report
        late_payment.py       -- POST /v1/free-tools/late-payment-calculator/calculate
                              -- POST /v1/free-tools/late-payment-calculator/send-report
        vsme_materiality.py   -- POST /v1/free-tools/vsme-materiality-light/calculate
                              -- POST /v1/free-tools/vsme-materiality-light/send-report
    services/
      pdf_generator.py        -- fpdf2 branded template (try/except wrapped)
      email_service.py        -- Resend transactional + nurture enrollment
      turnstile.py            -- Cloudflare Turnstile server-side verification
      boe_rate.py             -- BoE base rate weekly cron fetcher (Redis 7-day TTL)
    templates/
      email/
        free-tools/
          mees-risk-snapshot/   -- 5 nurture emails (day 1/3/7/10/14)
          ppn002-calculator/    -- 5 nurture emails
          cyber-essentials/     -- 5 nurture emails
          late-payment/         -- 5 nurture emails x 2 variants (SME + accountant)
          vsme-materiality/     -- 5 nurture emails (demand-validation focus)
```

**Endpoint pattern (same for all 5 tools):**

```
POST /v1/free-tools/{tool-slug}/calculate
  Body: tool-specific inputs
  Response: 200 { submission_id, ...tool-specific results }
  Rate limit: 10/hour/IP
  No auth required

POST /v1/free-tools/{tool-slug}/send-report
  Body: { submission_id, email, first_name, company?, marketing_consent, turnstile_token }
  Response: 200 { ok: true } | 400 { error }
  Side effects:
    1. Verify Turnstile token
    2. Upsert lead record (email unique)
    3. Trigger PDF generation (background job, <5 seconds)
    4. Send PDF email via Resend
    5. Add to nurture sequence (tagged: tool:{slug}, intent:{product})
    6. Track PostHog free_tool_email_captured
```

### B.4 Frontend Structure

```
web/app/tools/
  layout.tsx                              -- Shared layout (nav, footer, cookie consent check)
  mees-risk-snapshot/
    page.tsx                              -- Server component: SEO meta, JSON-LD, OG
    _components/
      MeesForm.tsx                        -- Client: multi-step (count -> postcodes -> results)
      PropertyInput.tsx                   -- Postcode validation + EPC address autocomplete
      ResultsSummary.tsx                  -- Portfolio summary with traffic lights
      EmailCapture.tsx                   -- Email + Turnstile (shown AFTER results)
    methodology/page.tsx                 -- SEO: how the tool works
  ppn002-calculator/
    page.tsx
    _components/
      ContractDetails.tsx                -- Step 1: value, sector, region, duration
      MeasureSelector.tsx                -- Step 2: 12 measures, searchable, max 3
      QuantityInputs.tsx                 -- Step 3: per-measure quantity with unit hints
      LiveTotal.tsx                      -- Running total updates as user adjusts
      ResultsSummary.tsx                 -- SV value, %, threshold, missions
      EmailCapture.tsx
    methodology/page.tsx
  cyber-essentials-readiness/
    page.tsx
    _components/
      Questionnaire.tsx                  -- 5-section progressive form
      ControlSection.tsx                 -- Per-control question group with help text
      AutoFailBadge.tsx                  -- Danzell v3.3 auto-fail indicator
      LiveScore.tsx                      -- Score updates as user progresses
      ResultsSummary.tsx                 -- Score, band, control breakdown, flags
      EmailCapture.tsx
    methodology/page.tsx
  late-payment-calculator/
    page.tsx
    _components/
      CalculatorForm.tsx                 -- Single-page with live calculation
      DsoSubFlow.tsx                     -- Optional "Calculate my DSO" expansion
      BoeRateDisplay.tsx                 -- Auto-populated rate with "as of" date
      ResultsSummary.tsx                 -- Annual cost, recovery scenarios, benchmark
      EmailCapture.tsx
    methodology/page.tsx
  vsme-materiality-light/
    page.tsx
    _components/
      MaterialityQuestionnaire.tsx       -- 10-section (one per ESRS topic)
      TopicSection.tsx                   -- 3 questions + 1-paragraph explainer
      MaterialityMatrix.tsx              -- Recharts scatter plot (impact x financial)
      ResultsSummary.tsx                 -- Material count, top 3, recommendation
      MatrixDownload.tsx                 -- "Download as PNG" button
      EmailCapture.tsx
    methodology/page.tsx
```

### B.5 Per-Tool Calculation Logic

#### MEES Risk Snapshot
```python
# Reuses existing platform code:
# - app.services.epc_api.lookup_epc_by_address(postcode, address)
# - app.services.mees_rules.compute_compliance_status(band, rateable_value, date)
# - app.services.mees_rules.compute_fine_exposure(rateable_value, band, months)

# Key constraints:
# - Max fine: 150,000 GBP (SI 2015/962 reg 39)
# - Band C 2028: status = "at_risk_2028" (proposed, not law)
# - No EPC on register: status = "no_epc_on_register", recommendation = "Commission new EPC"
# - EPC API responses cached in Redis (24h TTL, key = hash(postcode+address))
# - Max 5 properties per submission
```

#### PPN 002 Calculator
```python
# CRITICAL: Query toms_measures_library table ONLY. NEVER oxford_proxy_values.
# 12 curated measures with proxy values from that table.
# Calculation: quantity x proxy_value x duration_multiplier (varies by unit type)
# Threshold: 10% of contract value (PPN 002, NOT 5% from PPN 06/20)
# Competitive benchmark: 18%+ (anecdotal)
# PPN 002 effective: 24 February 2025
# 8 missions (not 5 themes from older models)
```

#### Cyber Essentials Readiness
```python
# Danzell v3.3 (effective 27 April 2026)
# 20 questions, 5 controls
# Scoring: Yes=1.0, No=0.0, Unsure=0.5
# Per-control: sum(scores) / len(questions) * 100
# Overall: average of 5 control scores
# AUTO-FAIL: q9 (MFA) = "no" OR q15 (patching) = "no"
# Bands: ready (>=90), nearly_ready (>=75), not_ready (<75), not_ready_auto_fail
# Store question_set_version: "danzell_v3_3" in inputs JSONB
```

#### Late Payment Calculator
```python
# Statutory interest: BoE base + 8% (Late Payment of Commercial Debts Act 1998)
# Compensation: 40 GBP (<1k), 70 GBP (1k-10k), 100 GBP (>10k)
# BoE rate: auto-fetched weekly, cached Redis 7-day TTL, alert if >14 days stale
# Overdue assumption: 30% of annual revenue (UK average per Bacs)
# Cost of capital: BoE base + 4% (typical SME borrowing margin)
# Recovery scenarios: reduce DSO by 10/15/20 days
# Sector benchmarks: 12 sectors with median DSO (sourced, cited in PDF)
# Accountant detection: check email domain patterns for routing
```

#### VSME Materiality Light
```python
# 10 ESRS topics x 3 questions each = 30 questions
# Impact/financial: 0-4 scale (not_at_all=0, minor=1, moderate=2, high=3, severe=4)
# Pressure: 0-3 scale (none=0, some=1, significant=2, active_demands=3)
# Material if: impact >= 2 OR financial >= 2
# Priority score: (impact + financial) * 2 + pressure (max 19)
# VSME recommendation: full (>=5 material), basic (>=2 material), minimal (<2)
# Waitlist signal: >200 leads + >30% open rate after 6 months = build product
```

### B.6 PDF Templates

| Tool | Pages | Key content |
|------|-------|-------------|
| MEES | 3 | Cover+summary, per-property breakdown, timeline+retrofit+CTA |
| PPN 002 | 4 | Cover+score, measure breakdown, mission map, narrative starter (STOPS MID-SENTENCE) |
| Cyber Essentials | 5 | Cover+score, control breakdown, auto-fails, action plan, cert path+CTA |
| Late Payment | 4 | Cover+cost, DSO+benchmark, recovery scenarios, automation CTA |
| VSME | 5 | Cover+matrix, top 3, full breakdown, report outline, 10-week plan+waitlist |

All PDFs share:
- CrowAgent logo letterhead
- Footer: Company 17076461, ICO C1901492
- Accent: var(--teal), text: var(--obsidian)
- Tool-specific disclaimer (regulatory accuracy)
- Final page: "Continue with [Product]" CTA box
- Generated via fpdf2 (try/except wrapped), <5 seconds, Railway background job

### B.7 Nurture Sequences (5 emails per tool, 14-day cadence)

**Pattern (all tools):**
- Day 1: "Here's what your [result] means" (educational, builds trust)
- Day 3: Case study / deeper insight (social proof)
- Day 7: "How [Product] solves this at scale" (product introduction)
- Day 10: Feature highlight or comparison (differentiation)
- Day 14: "Your trial ends in 24h" / final CTA with Stripe Checkout link

**Late Payment has 2 variants:**
- SME variant: direct subscription path
- Accountant variant: partner programme path (detected by email domain)

**VSME has demand-validation focus:**
- Day 14 CTA is "Join the waitlist" not "Start trial" (product doesn't exist yet)

**Tags applied to every contact:**
- tool:{slug}
- intent:{product_slug} (core/crowmark/crowcyber/crowcash/crowesg)
- gdpr_consent:explicit

### B.8 Conversion Paths

| Tool | Target product | Conversion URL |
|------|---------------|----------------|
| MEES Risk Snapshot | CrowAgent Core | /products/crowagent-core?utm_source=mees-risk-snapshot&plan=core_starter |
| PPN 002 Calculator | CrowMark | /products/crowmark?utm_source=ppn002-calculator&plan=crowmark_solo |
| Cyber Essentials | CrowCyber | /products/crowcyber?utm_source=ce-readiness&plan=crowcyber_standard |
| Late Payment (SME) | CrowCash | /products/crowcash?utm_source=late-payment-calculator&plan=crowcash_standard |
| Late Payment (Accountant) | Partner programme | /partners/accountants?utm_source=late-payment-calculator |
| VSME Materiality | CrowESG waitlist | Waitlist capture (crowesg_waitlist status) |

All use the existing WP-E2E-BILLING-001 plan parameter flow. Do NOT build separate signup flows.

### B.9 Analytics Events (PostHog)

```typescript
// Shared event helpers - fire ONLY after cookie consent
posthog.capture('free_tool_started', { tool_slug, utm_source, utm_medium, utm_campaign })
posthog.capture('free_tool_completed', { tool_slug, submission_id })
posthog.capture('free_tool_email_captured', { tool_slug, submission_id, lead_id })
posthog.capture('free_tool_pdf_downloaded', { tool_slug, submission_id })
posthog.capture('free_tool_converted', { tool_slug, lead_id, plan })
```

Funnel: open -> complete -> capture -> download -> conversion (per tool, per time period)

### B.10 Feature Flags

```
FREE_TOOL_MEES_RISK_SNAPSHOT_ENABLED=true|false
FREE_TOOL_PPN002_CALCULATOR_ENABLED=true|false
FREE_TOOL_CYBER_ESSENTIALS_READINESS_ENABLED=true|false
FREE_TOOL_LATE_PAYMENT_CALCULATOR_ENABLED=true|false
FREE_TOOL_VSME_MATERIALITY_LIGHT_ENABLED=true|false
```

When disabled: tool page renders "Coming soon" with email capture for launch notification.
Allows staged rollout without code changes.

### B.11 SEO Implementation

Each tool page server component renders:
```tsx
export const metadata: Metadata = {
  title: `${toolName} - Free ${domain} tool - CrowAgent`,
  description: `Free ${toolName}. ${benefit}. Used by ${persona}. No signup needed.`,
  openGraph: { images: [`/tools/${slug}/og-image.png`] },
  alternates: { canonical: `https://crowagent.ai/tools/${slug}` },
}
```

JSON-LD in page body:
- SoftwareApplication (applicationCategory: BusinessApplication, offers.price: 0)
- FAQPage with 5+ Q&A pairs per tool

Sitemap: all 5 tool URLs at priority 0.9 (blog at 0.6).

### B.12 Security Design

- **Turnstile**: On email capture form ONLY (not tool input). Reduces friction on value-delivery step.
- **Rate limiting**: slowapi, 10 submissions/hour/IP/tool. Returns 429 + retry-after header.
- **RLS**: Both tables deny anon. Only service_role (FastAPI) can read/write.
- **PII**: No email addresses in PostHog events. Hash if needed for matching.
- **GDPR**: Explicit consent checkbox on email capture. Tagged in Resend. Unsubscribe link in every email.
- **Storage**: PDFs in Supabase Storage with 30-day auto-deletion policy.
- **Secrets**: No API keys in frontend. All external calls (EPC API, BoE, Resend) from Railway backend only.

---

## Technical Constraints (NEVER VIOLATE)

### Code Invariants
- organisation_id (never org_id)
- supabase.auth.getUser() in RSCs (never getSession())
- GEMINI_API_KEY Railway-only (never Vercel)
- toms_measures_library canonical (NEVER oxford_proxy_values)
- fpdf2 wrapped in try/except
- var(--ca-*) CSS tokens (no hardcoded hex)
- CTA: bg var(--teal) text var(--obsidian) (never white-on-teal)

### Regulatory Invariants
- MEES fine cap: 150,000 GBP (SI 2015/962 reg 39)
- MEES Band C 2028: "proposed" only
- PPN 002 threshold: 10% (not 5%)
- PPN 002 effective: 24 February 2025
- Statutory interest: BoE base + 8%
- Compensation: 40/70/100 GBP tiered
- Cyber Essentials v3.3 (Danzell): 27 April 2026, MFA + patching auto-fail
- CSRD Omnibus I: BOTH >1000 emp AND >450M EUR
- NPV: 3.5% (HM Treasury Green Book)
- Annual discount: exactly 10%

### Infrastructure Invariants
- Migrations: staging first, then prod within 24h
- Staging: yxyuqssqgdkcygnenfjh
- Prod: gujtuecjzfiqsdnzgyvo
- One PR per tool (not split)
- Squash-merge with --admin --delete-branch
- 4 CI gates: tests, static analysis, secrets, migrations
- git -c commit.gpgsign=false commit
- Never vercel deploy from platform repo
- Feature-flagged launches
