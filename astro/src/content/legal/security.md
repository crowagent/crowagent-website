---
title: "Security | CrowAgent"
description: "How CrowAgent stores and protects your bid data: AES-256 at rest, TLS 1.3 in transit, UK and EU residency, and what we send to AI providers."
heading: "Encrypted, UK-hosted, and documented."
eyebrow: "Security & Trust"
---[System status: status.crowagent.ai](https://status.crowagent.ai)

Built on UK infrastructure. Every layer, from disk to API, is auditable.

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

## Security documentation

The detail behind each control, written for security and procurement teams. Jump to any topic, or contact us for an audit pack.

<aside aria-label="Security contact"> <strong>Security Contact</strong> <p>For security disclosures or audit requests, contact our security team at <a href="mailto:security@crowagent.ai">security@crowagent.ai</a></p> </aside>

## AES-256 encryption

All customer data is encrypted at rest using AES-256, and in transit using TLS 1.3. Encryption keys are managed at the infrastructure level and rotated automatically. Database snapshots, file storage, and backups inherit the same protection.

<dl class="deflist deflist--ledger"> <dt>At rest</dt> <dd>AES-256-GCM</dd> <dt>In transit</dt> <dd>TLS 1.3, HSTS</dd> <dt>Key rotation</dt> <dd>Automatic</dd> <dt>Backups</dt> <dd>Encrypted</dd> </dl>

## UK & EU data residency

- Primary customer data is stored in Supabase’s UK region.
- Supporting services may process metadata in the EU (PostHog EU Cloud).
- Other processors operate under Standard Contractual Clauses (SCCs).
- No personal data is sent to AI providers for training. See our [Privacy Policy](/privacy) for the full sub-processor list.

<dl class="deflist"> <dt id="sub-processors">Metadata sub-processors</dt> <dd> <dl class="deflist deflist--ledger"> <dt>PostHog</dt> <dd>EU</dd> <dt>Sentry</dt> <dd>SCC</dd> <dt>Brevo</dt> <dd>EU</dd> <dt>Cloudflare</dt> <dd>SCC</dd> <dt>Calendly</dt> <dd>SCC</dd> <dt>Stripe</dt> <dd>SCC</dd> </dl> </dd> </dl>

## GDPR compliance

- CrowAgent Ltd is registered as a data controller with the Information Commissioner’s Office (ICO) under the Data Protection (Charges and Information) Regulations 2018.
- A full Data Processing Agreement (DPA) is available on request for customers.
- Data subject rights supported: right to erasure, data portability, restriction of processing, and access.
- Data Protection Impact Assessments (DPIAs) are reviewed for new product capabilities that process personal data.

<dl class="deflist"> <dt>ICO contact &amp; registration</dt> <dd> <p>Verifiable on the <a href="https://ico.org.uk/ESDWebPages/Search">ICO public register</a> by searching for “CrowAgent Ltd”.</p> <p>Data requests: <a href="mailto:hello@crowagent.ai">hello@crowagent.ai</a></p> </dd> </dl>

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

<dl class="deflist"> <dt>What is sent</dt> <dd> <ul> <li>Prompt context for the active task.</li> <li>Public reference text where required.</li> <li>Server-side API calls only.</li> </ul> </dd> <dt>What is NOT sent</dt> <dd> <ul> <li>Customer data for training.</li> <li>Bulk exports or full org datasets.</li> <li>Authentication tokens or PII.</li> </ul> </dd> <dt>Inference &amp; retention</dt> <dd> <ul> <li>CrowAgent-brokered infrastructure.</li> <li>Provider zero-retention terms.</li> <li>Inputs not retained by the model.</li> </ul> </dd> </dl>

<dl class="deflist"> <dt>Model Usage &amp; Data Isolation</dt> <dd>Inference traffic is brokered through CrowAgent-controlled service identities. Prompts include the minimum context required to satisfy the active task. Model responses are post-processed before storage to strip provider metadata.</dd> </dl>

## Vulnerability disclosure

Report security vulnerabilities responsibly to [security@crowagent.ai](mailto:security@crowagent.ai?subject=Security%20Disclosure) with the subject “Security Disclosure”. We acknowledge receipt within two business days and triage as below.

On a narrow screen, this table scrolls sideways.

<div class="prose-scroll" role="region" aria-label="Table" tabindex="0"><table class="sec-table"> <thead> <tr> <th>Severity</th> <th>Examples</th> <th>Triage SLA</th> <th>Patch SLA</th> </tr> </thead> <tbody> <tr> <td><span class="chip">Critical</span></td> <td>RCE, auth bypass</td> <td>1 business day</td> <td>5 days</td> </tr> <tr> <td><span class="chip">High</span></td> <td>Privilege escalation</td> <td>2 business days</td> <td>14 days</td> </tr> <tr> <td><span class="chip">Medium</span></td> <td>CSRF, XSS</td> <td>3 business days</td> <td>30 days</td> </tr> <tr> <td><span class="chip">Low</span></td> <td>Hardening findings</td> <td>5 business days</td> <td>Best-effort</td> </tr> </tbody> </table></div>

## Uptime target

99.5<sup>%</sup>

CrowAgent targets 99.5% monthly uptime, with independent public status monitoring you can check yourself.

[View status page](https://status.crowagent.ai)

## Deep dives

<details class="sec-acc"> <summary> Sub-processors list </summary> <div class="sec-acc-body"> <p>Sub-processors handle metadata only. None receive customer-controlled personal data for training.</p> <ul> <li><strong>PostHog</strong> (EU Cloud), product analytics, event metadata.</li> <li><strong>Brevo</strong> (EU), transactional email delivery.</li> <li><strong>Cloudflare</strong> (global, SCC), CDN, DDoS protection.</li> <li><strong>Calendly</strong> (SCC), meeting scheduling links.</li> <li><strong>Stripe</strong> (SCC), billing and payment processing.</li> </ul> </div> </details>

<details class="sec-acc"> <summary> Severity levels in detail </summary> <div class="sec-acc-body"> <p>Our severity model follows CVSS 3.1 base scoring, adjusted for environmental impact across multi-tenant data isolation.</p> <ul> <li><strong>Critical:</strong> active exploitation paths affecting confidentiality or integrity of customer data.</li> <li><strong>High:</strong> escalation paths within an authenticated session.</li> <li><strong>Medium:</strong> targeted attacks requiring user interaction or constrained scope.</li> <li><strong>Low:</strong> defensive hardening, configuration drift, or informational findings.</li> </ul> </div> </details>

## Company & regulatory details

<dl class="deflist deflist--ledger"> <dt>ICO registration</dt> <dd>Registered Data Controller</dd> <dt>Company</dt> <dd>CrowAgent Ltd</dd> <dt>Registered</dt> <dd>England and Wales</dd> <dt>Data controller</dt> <dd>CrowAgent Ltd</dd> <dt>General Enquiries</dt> <dd><a href="mailto:hello@crowagent.ai">hello@crowagent.ai</a></dd> <dt>Security</dt> <dd><a href="mailto:security@crowagent.ai">security@crowagent.ai</a></dd> </dl>

<dl class="deflist"> <dt>Data request contact</dt> <dd>For erasure, portability, restriction, or access requests, email <a href="mailto:hello@crowagent.ai">hello@crowagent.ai</a>. We respond within statutory timeframes.</dd> </dl>

## Finished your review?

Everything above is what we can evidence today, including the gaps. If it clears your bar, the next step is access to a live workspace; if it does not, tell us which control is missing and we will say plainly whether it is on the roadmap.

[Request access](/contact?enquiry=limited-access#contact-form) [Book a 30-minute demo](https://calendly.com/crowagent-platform/30min)

ICO-registered data controller. UK and EU data residency. AES-256 at rest, TLS 1.3 in transit. ISO 27001 aligned, not certified.

[Privacy Policy](/privacy) [Sub-processors](#sub-processors) [Status Page](https://status.crowagent.ai)
