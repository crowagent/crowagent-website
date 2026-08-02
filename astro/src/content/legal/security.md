---
title: "Security | CrowAgent"
description: "How CrowAgent stores and protects your bid data: AES-256 at rest, TLS 1.3 in transit, UK and EU residency, and what we send to AI providers."
heading: "Encrypted, UK-hosted, and documented."
eyebrow: "Security & Trust"
---[System status status.crowagent.ai](https://status.crowagent.ai)

Built on UK infrastructure. Every layer, from disk to API, is auditable.

At a glance

## Operational standards

The controls every CrowAgent organisation inherits by default, from encryption to data residency to regulatory registration.

### AES-256 encryption at rest

Disk-level AES-256-GCM with automatic key rotation across databases, file storage, and backups.

### TLS 1.3 in transit

Forward-secret HTTPS on every request with HSTS preload and modern cipher suites only.

### GDPR-aligned data processing

Subject rights supported end to end. Full Data Processing Agreement available for customers on request.

### UK and EU data residency

Primary customer data stays in the UK region. Supporting services operate in the EU under SCCs.

### ISO 27001 controls<sup>*</sup>

\* We follow ISO 27001 controls. Formal certification planned for Phase 2.

### ICO Registered Data Controller

CrowAgent Ltd is registered with the Information Commissioner's Office and verifiable on the ICO public register.

Reference

## Security documentation

The detail behind each control, written for security and procurement teams. Jump to any topic, or contact us for an audit pack.

<aside class="sec-aside" role="region" aria-label="Documentation navigation"> <div class="sec-toc-card"> <p class="sec-toc-h">Documentation</p> </div> <div class="sec-contact"> <strong>Security Contact</strong> <p>For security disclosures or audit requests, contact our security team at <a href="mailto:security@crowagent.ai">security@crowagent.ai</a></p> </div> </aside>

## AES-256 encryption

All customer data is encrypted at rest using AES-256, and in transit using TLS 1.3. Encryption keys are managed at the infrastructure level and rotated automatically. Database snapshots, file storage, and backups inherit the same protection.

At rest

AES-256-GCM

In transit

TLS 1.3, HSTS

Key rotation

Automatic

Backups

Encrypted

## UK & EU data residency

- Primary customer data is stored in Supabase’s UK region.
- Supporting services may process metadata in the EU (PostHog EU Cloud).
- Other processors operate under Standard Contractual Clauses (SCCs).
- No personal data is sent to AI providers for training. See our [Privacy Policy](/privacy) for the full sub-processor list.

Metadata sub-processors

PostHog EU Sentry SCC Brevo EU Cloudflare SCC Calendly SCC Stripe SCC

## GDPR compliance

- CrowAgent Ltd is registered as a data controller with the Information Commissioner’s Office (ICO) under the Data Protection (Charges and Information) Regulations 2018.
- A full Data Processing Agreement (DPA) is available on request for customers.
- Data subject rights supported: right to erasure, data portability, restriction of processing, and access.
- Data Protection Impact Assessments (DPIAs) are reviewed for new product capabilities that process personal data.

ICO contact & registration

Verifiable on the [ICO public register](https://ico.org.uk/ESDWebPages/Search) by searching for “CrowAgent Ltd”.

Data requests: [hello@crowagent.ai](mailto:hello@crowagent.ai)

## Access controls

Platform access is enforced in depth: organisation-scoped roles at the application layer, Row-Level Security at the database, and multi-factor authentication at the identity layer.

### RBAC

- Org-scoped roles: Owner, Admin, Member.
- Privileged actions audit-logged.
- Invite-only org joins.

### RLS

- Row-Level Security enforced in Postgres.
- Org isolation at query time.
- Tenant data scoped to each organisation via RLS.

### MFA

- TOTP available for every account.
- Required for Owner/Admin actions.
- Session revocation on demand.

## ISO 27001 controls

Aligned, not yet certified

Our security controls programme is aligned with ISO 27001 principles. We plan to pursue formal certification as the business scales. Internal security reviews run continuously, and OWASP best practices are applied to all application development.

## AI data handling

AI inference runs through server-side API calls only. Customer-facing drafting uses Google Gemini; heavier reasoning and analysis use Anthropic's Claude. Both are data sub-processors under signed DPAs. The boundaries below describe exactly what crosses to a model provider.

What is sent

- Prompt context for the active task.
- Public reference text where required.
- Server-side API calls only.

What is NOT sent

- Customer data for training.
- Bulk exports or full org datasets.
- Authentication tokens or PII.

Inference & retention

- CrowAgent-brokered infrastructure.
- Provider zero-retention terms.
- Inputs not retained by the model.

Model Usage & Data Isolation

Inference traffic is brokered through CrowAgent-controlled service identities. Prompts include the minimum context required to satisfy the active task. Model responses are post-processed before storage to strip provider metadata.

## Vulnerability disclosure

Report security vulnerabilities responsibly to [security@crowagent.ai](mailto:security@crowagent.ai?subject=Security%20Disclosure) with the subject “Security Disclosure”. We acknowledge receipt within two business days and triage as below.

Scroll the table sideways

<div class="prose-scroll" role="region" aria-label="Table" tabindex="0"><table class="sec-table"> <thead> <tr> <th>Severity</th> <th>Examples</th> <th>Triage SLA</th> <th>Patch SLA</th> </tr> </thead> <tbody> <tr> <td class="sev-crit">Critical</td> <td>RCE, auth bypass</td> <td>1 business day</td> <td>5 days</td> </tr> <tr> <td class="sev-high">High</td> <td>Privilege escalation</td> <td>2 business days</td> <td>14 days</td> </tr> <tr> <td class="sev-med">Medium</td> <td>CSRF, XSS</td> <td>3 business days</td> <td>30 days</td> </tr> <tr> <td class="sev-low">Low</td> <td>Hardening findings</td> <td>5 business days</td> <td>Best-effort</td> </tr> </tbody> </table></div>

## Uptime target

99.5*%*

Uptime Target

CrowAgent targets 99.5% monthly uptime, with independent public status monitoring you can check yourself.

[View status page](https://status.crowagent.ai)

## Deep dives

<details class="sec-acc"> <summary> Sub-processors list </summary> <div class="sec-acc-body"> <p>Sub-processors handle metadata only. None receive customer-controlled personal data for training.</p> <ul> <li><strong>PostHog</strong> (EU Cloud), product analytics, event metadata.</li> <li><strong>Brevo</strong> (EU), transactional email delivery.</li> <li><strong>Cloudflare</strong> (global, SCC), CDN, DDoS protection.</li> <li><strong>Calendly</strong> (SCC), meeting scheduling links.</li> <li><strong>Stripe</strong> (SCC), billing and payment processing.</li> </ul> </div> </details>

<details class="sec-acc"> <summary> Severity levels in detail </summary> <div class="sec-acc-body"> <p>Our severity model follows CVSS 3.1 base scoring, adjusted for environmental impact across multi-tenant data isolation.</p> <ul> <li><strong>Critical:</strong> active exploitation paths affecting confidentiality or integrity of customer data.</li> <li><strong>High:</strong> escalation paths within an authenticated session.</li> <li><strong>Medium:</strong> targeted attacks requiring user interaction or constrained scope.</li> <li><strong>Low:</strong> defensive hardening, configuration drift, or informational findings.</li> </ul> </div> </details>

## Company & regulatory details

ICO registration Registered Data Controller

Company CrowAgent Ltd

Registered England and Wales

Data controller CrowAgent Ltd

General Enquiries [hello@crowagent.ai](mailto:hello@crowagent.ai)

Security [security@crowagent.ai](mailto:security@crowagent.ai)

Data request contact

For erasure, portability, restriction, or access requests, email [hello@crowagent.ai](mailto:hello@crowagent.ai). We respond within statutory timeframes.

## Finished your review?

Everything above is what we can evidence today, including the gaps. If it clears your bar, the next step is access to a live workspace; if it does not, tell us which control is missing and we will say plainly whether it is on the roadmap.

[Request access](/contact?enquiry=limited-access#contact-form) [Book a 30-minute demo](https://calendly.com/crowagent-platform/30min)

ISO 27001 Controls GDPR Compliant UK Data Residency AES-256 Encryption

[Privacy Policy](/privacy) [Sub-processors](#sub-processors) [Status Page](https://status.crowagent.ai)
