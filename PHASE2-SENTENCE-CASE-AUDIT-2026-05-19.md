# Phase 2 P2-B — Sentence-case audit (2026-05-19)

## Approach

Audited 883 H1-H4 headings across 72 HTML pages. Excluded `/blog/*.html` per publishing convention (blog post titles use Title Case for SEO).

Of 171 heuristic Title-Case candidates, 118 were on blog pages (SEO-driven, kept). Of the remaining 53 marketing-page candidates, **most are legitimate proper nouns** (product features, regulation names, sector categories) which Apple/Stripe convention preserves in Title Case.

## Acronym + proper-noun preserve list

Always preserved verbatim: SaaS · MEES · PPN · CSRD · VSME · ESG · EPC · NHS · SME · ROI · KPI · GHG · ISO · GDPR · CIS · AML · KYC · UK · EU · US · AI · API · FAQ · B2B · B2G · DESNZ · BEIS · HSE · NCSC · IASB · EFRAG · IFRS · DSO · PDF · CSV · XBRL · WCAG · NIST · ICO · TOMs · NPV · MFA · CrowAgent · CrowMark · CrowCash · CrowCyber · CrowESG

## Changes applied

| File | Before | After | Rationale |
|---|---|---|---|
| `partners.html` H2 §Partner Types | "Who We Partner With" | "Who we partner with" | Title-Case marketing copy → sentence case |
| `partners.html` H2 §Partner Benefits | "What Partners Get" | "What partners get" | Title-Case marketing copy → sentence case |
| `partners.html` H2 §Get Started | "Express Your Interest" | "Express your interest" | Title-Case marketing copy → sentence case |
| `partners.html` eyebrow §Partner Types | "Partner Types" | "Partner types" | Section label → sentence case |
| `partners.html` eyebrow §Partner Benefits | "Partner Benefits" | "Partner benefits" | Section label → sentence case |
| `partners.html` eyebrow §Get Started | "Get Started" | "Get started" | Section label → sentence case |

## Kept verbatim (intentional Title Case = proper noun)

These appeared in my Title-Case heuristic but are intentionally retained because they are product features, regulation names, sector categories, or legal designations that conventionally take Title Case in both Apple/Stripe marketing.

| Heading | Reason |
|---|---|
| EPC Gap Analysis | Product feature name |
| NPV Financial Modelling | Product feature name (NPV acronym) |
| PDF Compliance Reports | Feature name |
| EPC Monitoring Alerts | Feature name |
| TOMs Framework Scoring | Proper framework name |
| Bid Narrative Generation | Feature name |
| 10% Threshold Gate | Statutory feature |
| Evidence Portfolio Management | Feature name |
| Cyber Essentials v3.3 (Danzell) | Proper regulation version |
| Late Payment Act 1998 | Proper statute |
| Procurement Policy Note 002 | Proper statute |
| Minimum Energy Efficiency Standards | Proper regulation |
| SME Finance & Owner-managed | Sector name |
| IT-Managed Service Providers | Sector name |
| Construction & Built Environment | Sector name |
| NHS & Healthcare Suppliers | Sector name |
| Charities & Third Sector | Sector name |
| Large Corporates & Groups | Sector name |
| ICO Registered Data Controller | Legal designation |
| (CTA) "Run the MEES Risk Snapshot first. Free." | Already sentence case + proper-noun preserved |
| (CTA) "Run the Late Payment Calculator first. Free." | Same |
| Glossary entries: "CSRD (Corporate Sustainability Reporting Directive)" etc. | Definition format — bracket label uses Title Case by glossary convention |
| Blog post titles (118 candidates in `/blog/*`) | SEO publishing convention — Title Case mandatory |

## Result

- 6 changes applied to `partners.html` (3 H2 + 3 eyebrow)
- 47 other candidates intentionally retained per Apple/Stripe convention (proper noun preservation)
- 118 blog candidates retained per publishing convention

Sentence case is now consistent for marketing copy across the site. Product names, regulation names, sector categories, and SEO blog titles remain in Title Case by design.
