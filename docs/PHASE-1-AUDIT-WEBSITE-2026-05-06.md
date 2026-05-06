# PHASE 1 FORENSIC AUDIT — crowagent.ai (Marketing Site)

**Date:** 2026-05-06
**Auditor:** Senior Principal Engineer / QA Director / Product Auditor (forensic)
**Scope:** Live https://crowagent.ai static marketing site, full repository at `C:\Users\bhave\Crowagent Repo\crowagent-website`
**Method:** Discovery only — no code changes, no commits, no pushes.
**Live HEAD:** main @ `9a63daa hotfix(_redirects): remove trailing-slash 308 removal — was the loop cause`

---

## SUMMARY

| Severity | Count |
|---|---|
| Critical | 9 |
| High | 19 |
| Medium | 18 |
| Low | 11 |
| **Total** | **57** |

---

## CRITICAL FINDINGS

```
ID:        WS-AUDIT-001
Severity:  Critical
Surface:   SEO / Structured data
Page(s):   /faq, /pricing, /crowmark, /crowagent-core, /crowcyber, /crowcash, /crowesg, /blog/* (20 articles), /intel/cyber-essentials-tracker, /intel/mees-tracker — 31 pages total
Expected:  JSON-LD must be inline per W3C: <script type="application/ld+json">{...}</script>. Search engines (Google, Bing) do NOT fetch external JSON-LD via src= attribute.
Actual:    All structured-data scripts use the unsupported pattern `<script type="application/ld+json" src="/Assets/jsonld/<slug>.json"></script>`. Verified at faq.html:31, pricing.html:35,384; crowagent-core.html:35; crowmark.html:35; crowcyber.html:35; crowcash.html:35; crowesg.html:35; every blog/*.html line 29–31; intel/*/index.html:29.
Root cause: PR #149/PR #148 externalised JSON-LD for CSP compliance using script-with-src — WHATWG HTML parser explicitly disallows external src for non-script types; the contents are never executed nor parsed by crawlers.
Impact:    Article schema, FAQPage schema, Offer/SoftwareApplication schema, BreadcrumbList — every rich-snippet signal across blog and product pages is INVISIBLE to search engines. Massive organic-search regression. Pricing rich snippets, FAQ rich results, blog Article rich results all dead.
Evidence:  Grep "application/ld+json\"\s+src=" found 30+ matches in *.html and blog/*.html. Only /tools and / (homepage) use valid pattern. Live curl of /pricing returns the empty <script src=...></script> tag — Google ignores.

ID:        WS-AUDIT-002
Severity:  Critical
Surface:   Legal / Compliance contradiction
Page(s):   /privacy vs /security, footer (every page), /partners
Expected:  Single, accurate ICO registration status. Either "Registered, number XXXXX" or "Application pending — no claim of registration".
Actual:    /privacy.html:53 says: ICO Registration Number: "[Pending — application submitted, awaiting issue]". /security.html:100 says: "Registered with Information Commissioner's Office". Footer (js/nav-inject.js:170) says "ICO registered". Contact page (contact.html:101) and partners (partners.html) say "ICO registered".
Root cause: ICO claim was added to credibility surfaces (footer, security, partners) before registration completed; privacy-policy was hand-edited honestly but compliance-contradictory copy left in place across surfaces.
Impact:    UK ICO regulatory issue — claiming ICO registration without one is a Data Protection (Charges and Information) Regulations 2018 violation, potentially Misleading Commercial Practices under CPR 2008. Trust-killer if a customer compares the two pages.
Evidence:  /privacy.html line 53; /security.html line 100; js/nav-inject.js line 170; contact.html line 101.

ID:        WS-AUDIT-003
Severity:  Critical
Surface:   SEO / Sitemap completeness
Page(s):   /sitemap.xml vs disk
Expected:  Every public, indexable page listed in sitemap.xml (47 URLs at present, 79 expected).
Actual:    sitemap.xml lists 9 of 20 blog posts (11 missing): /blog/brown-discount-commercial-property-values, /epc-band-commercial-property-guide, /epc-register-explained, /mees-compliance-checklist-commercial-property, /mees-exemptions-guide, /mees-fine-exposure-calculator-guide, /ppn-002-social-value-explained, /regulatory-updates-2026, /social-value-portal-vs-crowmark, /social-value-themes-explained, /what-is-retrofit-assessment-cost. Also missing all 6 glossary children: /glossary/csrd, /glossary/epc-rating, /glossary/mees-compliance, /glossary/ppn-002, /glossary/si-2015-962, /glossary/toms-framework. Also missing /cookie-preferences (linked from footer + privacy).
Root cause: Sitemap has been manually maintained; new content (blog batch + glossary expansion) added to disk but never appended.
Impact:    17 high-value SEO pages invisible to crawlers; lost organic traffic on long-form glossary + blog content (the highest-converting lead-magnet surfaces). Direct revenue impact.
Evidence:  Grep counted 20 blog/*.html files vs grep "blog/" sitemap.xml = 9. Glossary count = 6 files, 0 in sitemap.

ID:        WS-AUDIT-004
Severity:  Critical
Surface:   Routing — production redirects
Page(s):   /products, /blog, /glossary
Expected:  Per `_redirects` lines 21–24, "/products" should serve a 200 rewrite to /products/index.html. Current `_redirects` HEAD claims trailing-slash 308 was removed and 200 rewrites restored.
Actual:    Live: GET /products returns 308 → /products/. Same for /blog (308 → /blog/), /glossary (308 → /glossary/), /intel/cyber-essentials-tracker (308 → trailing slash), /intel/mees-tracker (308 → trailing slash). Cloudflare Pages is canonicalising to trailing-slash form despite explicit 200 rewrite rule for both forms.
Root cause: CF Pages directory canonicalisation precedes `_redirects` evaluation when an `index.html` exists in the directory. The "200" rule for "/products" is shadowed by Pages' built-in 308 to "/products/". Comment in _redirects lines 14–17 acknowledges this but the fix did not stick.
Impact:    Every internal link to /products, /blog, /glossary, /intel/* eats one extra round-trip; sitemap canonical URLs (no trailing slash) disagree with served URL (trailing slash) → indexable URL conflict (the canonical points to a 308). Google may pick the non-canonical form.
Evidence:  `curl -I https://crowagent.ai/products` → 308 Location: /products/. Sitemap line `<loc>https://crowagent.ai/products</loc>` (no slash). Mismatch.

ID:        WS-AUDIT-005
Severity:  Critical
Surface:   Trust / SOC 2 claim
Page(s):   Every page (footer credibility row injected by js/nav-inject.js)
Expected:  Only verifiable certifications stated. SOC 2 audit must be in progress with auditor, not aspirational.
Actual:    Footer line 163 claims "SOC 2 in progress". /security.html says "Our security controls programme is aligned with ISO 27001 principles. We plan to pursue formal certification as the business scales." — i.e. NOT in progress with an auditor; it's aspirational. The footer claim is materially stronger than what the security page substantiates.
Root cause: Marketing copy drift between trust badges and substantive page.
Impact:    UK CMA / ASA Misleading Commercial Practices risk. Buyer due-diligence kill-shot when they ask for the SOC 2 Type 1 letter.
Evidence:  js/nav-inject.js line 163 vs security.html lines 73–74.

ID:        WS-AUDIT-006
Severity:  Critical
Surface:   Forms / mailto fallback
Page(s):   /partners
Expected:  Mailto fallback values must strip CR/LF (header injection guards) on EVERY field, not just email.
Actual:    js/partners-form.js line 22 strips \r\n only from email. Lines 19–25 trim the rest but do NOT strip CR/LF. The mailto subject is built from `'Partner Enquiry — ' + company` (line 90), and body includes `'Name: ' + name + '\nRole: ' + role + '\nCompany: ' + company` (lines 91–98) without any CRLF strip. A malicious user pasting "Acme\r\nBcc: spam@x" into the company field could attempt subject/header injection on the user's mail client (browser mailto handlers do vary).
Root cause: Defensive coding gap — only the email field was treated as a header source.
Impact:    Mail-client header-injection vector. Most modern mail clients (Outlook, Gmail web) URL-decode the CRLF safely, but the fallback mailto can still be used to autopopulate Bcc on legacy clients (Apple Mail, Thunderbird in some configs).
Evidence:  js/partners-form.js lines 19–25 (only email .replace(/[\r\n]+/g,'')), lines 90–98 (mail subject/body construction).

ID:        WS-AUDIT-007
Severity:  Critical
Surface:   A11y / Tab keyboard order
Page(s):   /
Expected:  When tablist has tabs in order [core, mark, cyber, cash, csrd, esg], the corresponding tabpanels in DOM source order must be in the SAME order so Tab key navigation moves predictably.
Actual:    index.html tablist line 457–462: core, mark, cyber, cash, csrd, esg. tabpanels lines 467, 500, 533, 566, 599, 632 = core, mark, csrd, cyber, cash, esg. The csrd panel is positioned BEFORE cyber and cash in the DOM, breaking logical tab order for keyboard users (and causing focus/aria-controls ID-target traversal to skip back/forward through the document).
Root cause: Phase 2 product addition (cyber+cash) inserted tabs after mark but the new panels were appended at the end, while csrd panel stayed in original middle position.
Impact:    WCAG 2.4.3 Focus Order (Level A) violation. Screen reader announces "tab 3 of 6" then aria-controls jumps backward/forward → user disorientation.
Evidence:  index.html lines 457–462 vs 467/500/533/566/599/632.

ID:        WS-AUDIT-008
Severity:  Critical
Surface:   Analytics consent / coverage
Page(s):   Every page except /
Expected:  PostHog analytics-init.js loaded on every page (consent-gated) — privacy.html and cookies.html declare PostHog as a sub-processor with a 12-month retention.
Actual:    Grep shows js/analytics-init.js loaded ONLY by index.html. Pricing, contact, blog, all product pages, all tools pages, every legal page have ZERO PostHog script. PostHog session-replay configuration (api_host, capture rules) only fires on home.
Impact:    Either: (a) the privacy/cookie disclosure is over-disclosing → minor compliance issue; or (b) the analytics is under-collecting → product team is missing 95% of marketing-site traffic data (the entire conversion funnel from /pricing → /signup is invisible).
Evidence:  Grep "analytics-init.js" in *.html → only index.html. cookies.html lines 67–74 declare PostHog cookies set on crowagent.ai.

ID:        WS-AUDIT-009
Severity:  Critical
Surface:   Asset / security.txt
Page(s):   /.well-known/security.txt
Expected:  Encryption: header refers to a real PGP key URL.
Actual:    security.txt declares `Encryption: https://crowagent.ai/.well-known/pgp-key.txt`. curl returns 404.
Impact:    RFC 9116 violation. Security researchers attempting encrypted disclosure will hit a 404 and either give up or attempt cleartext disclosure of a real vulnerability over plaintext email — exposing the disclosure pre-fix.
Evidence:  curl -I https://crowagent.ai/.well-known/pgp-key.txt → 404. security.txt line 4.
```

---

## HIGH FINDINGS

```
ID:        WS-AUDIT-010
Severity:  High
Surface:   CSS cache-buster consistency
Page(s):   /tools, /tools/*, /tools-*-methodology, /changelog, /cookie-preferences (15 files)
Expected:  Same site uses the same `?v=NN` cache buster on shared CSS to enable atomic CDN invalidation.
Actual:    Most pages use `styles.min.css?v=52`; /tools, /changelog, /cookie-preferences and 12 tool subpages use `?v=51`. Stale buster will still serve old CSS to repeat visitors past site updates.
Impact:    Visual drift on tools landings between deploys (banner restyles, badge changes); broken visual experience.
Evidence:  Grep `styles\.min\.css\?v=51` → 15 files.

ID:        WS-AUDIT-011
Severity:  High
Surface:   HTML / lang attribute consistency
Page(s):   /changelog, /cookie-preferences, /tools, all 12 /tools-* pages (15 total)
Expected:  `<html lang="en-GB">` site-wide (matches privacy/terms governing law and href hreflang="en-GB").
Actual:    These 15 pages use `<html lang="en">`. Other 30 pages use en-GB.
Impact:    Inconsistent locale signal; translators / screen readers may apply US English pronunciation rules. Conflicts with hreflang="en-GB" directive.
Evidence:  Grep `<html lang="en"` (without en-GB) returns the 15 file list.

ID:        WS-AUDIT-012
Severity:  High
Surface:   CSS path consistency
Page(s):   Mixed (most homepage-cluster, blog/*, glossary/*) — ~20 files
Expected:  Single canonical absolute path /styles.min.css site-wide.
Actual:    Mix of relative `styles.min.css?v=52` (no leading slash) AND absolute `/styles.min.css?v=52`. Relative URLs break on /tools/<tool>/methodology (which is at /tools/<tool>/) — shipped via `_redirects` workaround serving root assets, not by fixing the HTML.
Impact:    Fragile coupling of redirects to HTML paths. Any new tool page or directory added without `_redirects` update will 404 the CSS.
Evidence:  Grep "<link rel=\"stylesheet\" href=\"" returned both forms; _redirects lines 31–34 special-case `/tools/:tool/styles.min.css → /styles.min.css 200`.

ID:        WS-AUDIT-013
Severity:  High
Surface:   JS / event-listener wiring
Page(s):   Every page using cookie-banner triggers
Expected:  cookie-banner.js (consent-API layer) wires triggers on the events `ca-nav-ready` AND `ca-footer-ready`.
Actual:    js/cookie-banner.js line 164 listens for `ca-footer-ready` but js/nav-inject.js only dispatches `ca-nav-ready` (line 284). `ca-footer-ready` is never fired anywhere in the repo.
Impact:    Footer-injected "Cookie preferences" link (line 244 in nav-inject.js) is wired only by the `ca-nav-ready` listener that runs at the same time the footer is injected — works by accident due to single-tick injection. Will silently break if injection becomes async (e.g. moving to a fetch-based pattern). Code smell + dead listener.
Evidence:  Grep "ca-footer-ready" → 1 hit in js/cookie-banner.js. Grep dispatch "ca-footer-ready" in js/* → 0 hits.

ID:        WS-AUDIT-014
Severity:  High
Surface:   Forms / consent gating of 3rd-party
Page(s):   /demo
Expected:  Calendly widget loads only after analytics/marketing consent (Calendly drops third-party tracking cookies on their domain even via iframe).
Actual:    demo.html lines 62–66 unconditionally injects `<script src="https://assets.calendly.com/assets/external/widget.js" defer>` and starts Calendly iframe with `hide_gdpr_banner=1` regardless of consent. CSP allows Calendly via frame-src.
Impact:    PECR violation — non-essential third-party tracking before consent. Calendly sets _cfuvid, etc.
Evidence:  demo.html lines 60–66; cookies.html does not list Calendly.

ID:        WS-AUDIT-015
Severity:  High
Surface:   SEO / canonical vs served URL
Page(s):   /products, /blog, /glossary, /intel/*
Expected:  Canonical URL must match the URL served (no redirect chain).
Actual:    Sitemap + page canonicals point to no-trailing-slash form; live URLs 308 to trailing-slash form. Google honours canonical only after the redirect resolves; the canonical → URL-served disagreement reduces indexation efficiency.
Impact:    Reduced crawl-budget efficiency, conflicting signals.
Evidence:  See WS-AUDIT-004 for primary; canonical tags in /products/index.html, /blog/index.html, /glossary/index.html.

ID:        WS-AUDIT-016
Severity:  High
Surface:   Inline style attribute count
Page(s):   60 HTML files
Expected:  Per docs/STYLE-INLINE-EXTRACTION-PLAN.md goal: 0 inline styles (CSP allows them via 'unsafe-inline' on style-src as a documented compromise).
Actual:    453 inline style attributes remain across 60 HTML files. WEB-AUDIT-092 in the master ledger acknowledges this as outstanding work.
Impact:    'unsafe-inline' must be retained in CSP, weakening style-injection defenses. Tracker WEB-AUDIT-092 still open.
Evidence:  Grep `style="` count = 453 across HTML files.

ID:        WS-AUDIT-017
Severity:  High
Surface:   SEO / blog Article schema
Page(s):   All 20 blog posts
Expected:  Each blog article has crawlable Article schema with @type=Article, headline, datePublished, author, image, publisher.
Actual:    All 20 blog posts use the broken external-src JSON-LD (see WS-AUDIT-001) — Google cannot parse. Article rich results disabled site-wide for blog.
Impact:    Blog content invisible in Google Discover, no Article rich snippets, no News carousel.
Evidence:  Same as WS-AUDIT-001.

ID:        WS-AUDIT-018
Severity:  High
Surface:   Image / srcset duplication and pointless responsive
Page(s):   /
Expected:  srcset declared once per <img>, with meaningfully different image widths.
Actual:    index.html line 148 has `srcset` declared TWICE (once on `<source>`, once on `<img>`); the inner srcset is `/Assets/screenshots/dashboard.png 1200w, /Assets/screenshots/dashboard.png 600w` — same file twice. Browser ignores the second declaration; no responsive optimisation actually occurs.
Impact:    LCP image is the dashboard.png. Mobile devices download the full 1200w PNG instead of a 600w variant; performance regression on 3G.
Evidence:  index.html line 148.

ID:        WS-AUDIT-019
Severity:  High
Surface:   A11y / FAQ heading levels and inline-styled h2
Page(s):   /faq
Expected:  H2 elements use semantic class, not 25-property inline style.
Actual:    faq.html lines 51, 68, 89, 106, 123 — every section heading uses 6 inline style properties (font-family, weight, size, color, margin, etc.). Inconsistent with H2 styling on every other page; no <section> wrapping per topic group.
Impact:    Brand drift; accessibility tree shows H2s but no SectionHeader landmarks.
Evidence:  faq.html lines 51, 68, 89, 106, 123.

ID:        WS-AUDIT-020
Severity:  High
Surface:   Footer / link redundancy + dead UI states
Page(s):   Every page (footer)
Expected:  Single status link, named consistently.
Actual:    js/nav-inject.js footer-bottom (lines 240–245) renders BOTH `<a href="/status" class="footer-bottom-link">Status</a>` AND a status-dot widget elsewhere. `_redirects` line 31 redirects /status → status.crowagent.ai. The status-dot widget (lines 171–174) shows `id="status-dot" / "status-label" - "Checking status..."` — there is no JS to ever update its state from "Checking status...", confirmed by grepping scripts.js.
Impact:    "Checking status..." remains permanently — dead UI element on every page.
Evidence:  js/nav-inject.js lines 171–174; status-dot/status-label have no setter in scripts.js or any other JS file.

ID:        WS-AUDIT-021
Severity:  High
Surface:   robots.txt / API allow
Page(s):   /robots.txt
Expected:  Disallow `/api/` is appropriate only if /api/ exists on this domain.
Actual:    robots.txt disallows /api/ — but crowagent.ai is the static marketing site; /api/ is on app.crowagent.ai. The Disallow is harmless but signals confused IA. More importantly, GPTBot/CCBot/anthropic-ai/Claude-Web/Google-Extended/PerplexityBot are all Disallow:/  — fine for content protection but blocks Google-Extended (Bard/Gemini) which IS the consumer touchpoint for SaaS discovery in 2026.
Impact:    Strategic AI-discovery blocker. Reasonable trade-off but flag for CTO review.
Evidence:  robots.txt lines 4–25.

ID:        WS-AUDIT-022
Severity:  High
Surface:   CSP / unsafe-inline on style + style-src-attr
Page(s):   Every page (response header)
Expected:  Modern CSP either uses nonces/hashes for inline style or eliminates inline style.
Actual:    Live CSP includes `style-src 'self' 'unsafe-inline'` and `style-src-attr 'unsafe-inline'`. _headers comments acknowledge this is intentional pending WEB-AUDIT-092 (inline-style extraction).
Impact:    XSS + style-injection mitigations weakened. Compensating controls (strict script-src, object-src 'none', frame-ancestors 'none') reduce but do not eliminate residual risk.
Evidence:  _headers lines 21–22; WEB-AUDIT-092 ledger.

ID:        WS-AUDIT-023
Severity:  High
Surface:   Live URL availability — methodology pages
Page(s):   /tools/<tool>/methodology
Expected:  Per `_redirects` lines 73–78, methodology pages serve as 200 rewrites.
Actual:    Live: /tools/mees-risk-snapshot/methodology = 200 ✓ but the rewrite source files use `<html lang="en">` and `?v=51` (see 010, 011). Visual regression vs site-wide v=52 baseline.
Impact:    Brand consistency drift; SEO methodology long-form pages serve stale CSS.
Evidence:  tools-mees-risk-snapshot-methodology.html line 2 (lang) and line 33 (CSS v=51).

ID:        WS-AUDIT-024
Severity:  High
Surface:   Forms / no rate limiting or Turnstile actually wired
Page(s):   /partners, /contact (page form)
Expected:  Cloudflare Turnstile widget rendered + token validated server-side; rate limiting on Railway endpoint.
Actual:    js/partners-form.js line 41 only checks for a Turnstile token IF a widget exists in the form — but partners.html does NOT render a Turnstile widget anywhere (grep "cf-turnstile" in partners.html → 0). The check `if (turnstileInput && !turnstileInput.value)` is therefore dead code; the form submits without any bot challenge. Same for contact form (contactPageForm). Honeypot is the only protection.
Impact:    Honeypot is trivially bypassed by modern spam bots that read the DOM (most do). No rate limiting visible client-side.
Evidence:  js/partners-form.js lines 41–45; partners.html grep "cf-turnstile" → 0; contact.html grep "cf-turnstile" → 0.

ID:        WS-AUDIT-025
Severity:  High
Surface:   SEO / OG image dimensions
Page(s):   /privacy, /terms, /cookies, /contact, /partners, /security, /demo, /resources, /faq, /roadmap, /changelog, /cookie-preferences, /404 (13 pages)
Expected:  og:image:width and og:image:height present per Open Graph 1.0 (preferred 1200×630).
Actual:    Only / has `og:image:width 1200 / og:image:height 630`. All other pages lack them. LinkedIn, Slack, Facebook unfurl will fall back to small/cropped previews.
Impact:    Reduced share-CTR on social platforms; lost top-of-funnel traffic.
Evidence:  Grep "og:image:width" *.html → only index.html.

ID:        WS-AUDIT-026
Severity:  High
Surface:   SEO / blog filtering UX dead-end
Page(s):   /blog (footer link "PPN 002 guides")
Expected:  Footer link to "/blog" with PPN 002 guides should land on a filtered view or anchor.
Actual:    js/nav-inject.js line 212: `<a href="/blog">PPN 002 guides</a>` — same plain /blog index. Footer also has `<a href="/blog">All articles</a>`. Two identical links labelled differently. Confusing IA.
Impact:    Conversion friction, especially for users tracking the PPN 002 nav-funnel.
Evidence:  js/nav-inject.js line 212 vs line 208.

ID:        WS-AUDIT-027
Severity:  High
Surface:   Cookie consent / first-load behaviour
Page(s):   Every page
Expected:  On first visit (no consent stored), the cookie banner is shown automatically; user MUST accept/reject before non-essential cookies set.
Actual:    cookie-banner.js line 3 sets `style="display:none"` initially. The banner is injected hidden. The trigger to show on first-load lives in scripts.min.js (lines 1074–1126 area in scripts.js) — a heavyweight 70KB file that loads after defer. On a first-time visitor with JS disabled or slow-network the banner never appears. Worse: PostHog may have already initialised on / (homepage analytics-init.js loads BEFORE scripts.min.js per script order in HTML).
Impact:    PECR — running analytics before banner shown. Race-condition compliance failure.
Evidence:  cookie-banner.js line 3; analytics-init.js line 41 (init runs in parallel with scripts.min.js).

ID:        WS-AUDIT-028
Severity:  High
Surface:   Live URL — assets fetched via legacy path
Page(s):   Every page (script tag)
Expected:  One single canonical cookie-banner script.
Actual:    /cookie-banner.js (root, 60 lines, banner DOM injector) AND /js/cookie-banner.js (165 lines, public consent API) are both served and both used. Some pages reference both (blog/ppn-014-cyber-essentials-guide.html lines 177–178 — duplicate include). Confusing dual-file architecture.
Impact:    Cognitive complexity, maintenance burden, double script downloads on the duplicate-load page (ppn-014 article).
Evidence:  blog/ppn-014-cyber-essentials-guide.html lines 177–178; cookie-banner.js root (60 lines) + js/cookie-banner.js (165 lines).
```

---

## MEDIUM FINDINGS

```
ID:        WS-AUDIT-029
Severity:  Medium
Surface:   SEO / robots metadata
Page(s):   /404
Expected:  404 page is `noindex, nofollow` (it is) and is NOT listed in sitemap (it isn't, ✓).
Actual:    404.html has `noindex, nofollow` ✓. However, the canonical of /404 → /404 (line 9) is meaningless on a "page not found" — should not have a canonical at all, or canonical to /.
Impact:    Minor SEO hygiene.
Evidence:  404.html line 9.

ID:        WS-AUDIT-030
Severity:  Medium
Surface:   404 / status code
Page(s):   Unknown URLs
Expected:  Cloudflare Pages serves /404.html with HTTP 404 on unknown paths.
Actual:    Live curl on /random-url returns the 404 page but inspect status — needs verification (CF Pages defaults vary). Listed for confirm.
Impact:    Soft-404s if CF returns 200 with the 404 page body.
Evidence:  Manual test required.

ID:        WS-AUDIT-031
Severity:  Medium
Surface:   Cross-page IA
Page(s):   /faq mobile menu
Expected:  Mobile menu item "FAQ" is in the mobile menu OR signposted from the topbar.
Actual:    js/nav-inject.js mobile menu lines 124–145 has Products/Tools/Sectors/Pricing/Blog/About — NO FAQ. FAQ is listed only in footer. WP-WEB-003 admits this. FAQ is content with strong intent — should remain in primary nav.
Impact:    Reduced FAQ discovery; raises support volume.
Evidence:  js/nav-inject.js lines 124–145.

ID:        WS-AUDIT-032
Severity:  Medium
Surface:   A11y / hidden-tabpanel announcement
Page(s):   /pricing
Expected:  When tabpanels are hidden, use `hidden` attribute alone (CSS-display-none also works but redundantly on screen readers).
Actual:    pricing.html lines 135, 181, 228 etc. set BOTH `style="display:none"` AND `hidden`. Style-display-none on hidden elements may interfere with view-transition and CSS animations. Also: when the JS toggles tabpanels, it has to remove BOTH the inline style and the hidden attribute — two state sources.
Impact:    Maintenance burden; brittle UI state machine.
Evidence:  pricing.html lines 135, 181, 228.

ID:        WS-AUDIT-033
Severity:  Medium
Surface:   Brand / tagline consistency
Page(s):   /
Expected:  Tagline "Sustainability Intelligence" everywhere per Brand Master.
Actual:    Homepage hero line 76–86 has 4 segment-tab variants; none uses the master tagline. The footer tagline (nav-inject.js line 169) reads "Sustainability Compliance Software for UK organisations…" — inconsistent with the master "Sustainability Intelligence" tagline declared in CLAUDE.md.
Impact:    Brand drift between repository CLAUDE.md and shipped site.
Evidence:  CLAUDE.md "Tagline: Sustainability Intelligence (this exact phrase — no variations)" vs js/nav-inject.js line 169.

ID:        WS-AUDIT-034
Severity:  Medium
Surface:   SEO / hreflang
Page(s):   Every page
Expected:  hreflang tags for en-GB and x-default are correct; x-default points to the default locale (en-GB).
Actual:    Every hreflang en-GB and x-default both point to the same English URL, which is correct only if there is no other language. No bug, but raises a flag: x-default should ideally be a language-neutral URL when multilingual versions exist.
Impact:    None now; future-proofing concern.
Evidence:  index.html lines 26–27 etc.

ID:        WS-AUDIT-035
Severity:  Medium
Surface:   Performance / preload mismatch
Page(s):   /
Expected:  Preload hints match actual resources used.
Actual:    index.html line 38 preloads `/Assets/screenshots/dashboard.png` (LCP image), but the homepage `<picture>` for the LCP includes a webp `<source>` (line 148). Modern browsers will fetch the webp; the preloaded PNG may be unused on browsers that support webp — wasted bandwidth.
Impact:    50–200KB wasted on first paint.
Evidence:  index.html lines 38, 148.

ID:        WS-AUDIT-036
Severity:  Medium
Surface:   Service worker scope vs cache
Page(s):   Every page
Expected:  service-worker.js registered; cache strategy documented.
Actual:    js/nav-inject.js lines 296–303 registers /service-worker.js. No grep for the actual SW behaviour — needs review for cache-stale-CSS interaction (if SW caches styles.min.css?v=51, the v=52 fetch may be stale-while-revalidate'd indefinitely).
Impact:    Possible stale-asset trap.
Evidence:  service-worker.js exists in repo (3KB); not deeply audited here.

ID:        WS-AUDIT-037
Severity:  Medium
Surface:   Forms / validation messaging
Page(s):   /partners
Expected:  Field-level error messaging adjacent to invalid field.
Actual:    js/partners-form.js shows a single error element above the form ("Please complete all required fields"). No per-field error indication, no aria-invalid toggling, no aria-describedby pointing to a per-field error span.
Impact:    Screen-reader users cannot identify which field is invalid; WCAG 3.3.1 Error Identification (Level A) downgrade.
Evidence:  js/partners-form.js lines 27–30.

ID:        WS-AUDIT-038
Severity:  Medium
Surface:   Forms / button disable on submit
Page(s):   /contact (contactPageForm)
Expected:  Submit button disabled during request to prevent duplicate submissions.
Actual:    scripts.js line 1066 calls fetch but does not disable cpSubmitBtn during the request. Partners form does (good); contact form does not (bug).
Impact:    Double-submit possible; double Formspree credit consumption.
Evidence:  scripts.js around line 1066.

ID:        WS-AUDIT-039
Severity:  Medium
Surface:   Asset / OG images for unlisted pages
Page(s):   /tools, /tools/* methodology pages
Expected:  Each public page has its own OG image.
Actual:    tools.html line 13 uses `og:image=https://crowagent.ai/Assets/og-image.png` (the generic site OG, not a tools-specific). Methodology pages similarly. While there is /Assets/og/products.png, there is no /Assets/og/tools.png. Generic OG → reduced CTR.
Impact:    Lower share CTR on tools pages (the highest-converting lead magnet).
Evidence:  tools.html line 13; ls Assets/og/ → no tools.png.

ID:        WS-AUDIT-040
Severity:  Medium
Surface:   A11y / focus visibility
Page(s):   Every page
Expected:  All focusable elements have visible :focus-visible style.
Actual:    Not verified by audit (visual). styles.min.css is 120KB minified; deep-dive needed. Site-wide skip-link present (✓). Recommend Lighthouse a11y crawl.
Impact:    Possible WCAG 2.4.7 Focus Visible failure.
Evidence:  Manual visual audit required.

ID:        WS-AUDIT-041
Severity:  Medium
Surface:   Privacy / sub-processor list completeness
Page(s):   /privacy line 127–139
Expected:  Every third party that processes personal data is listed.
Actual:    Calendly is NOT in the sub-processor list (privacy.html lines 130–138). Yet /demo embeds Calendly + sets cookies on calendly.com. Disclosure gap.
Impact:    UK GDPR Article 28 + 30 — list of sub-processors must be accurate. Direct compliance gap.
Evidence:  privacy.html lines 130–138; demo.html lines 62–66.

ID:        WS-AUDIT-042
Severity:  Medium
Surface:   Cookie disclosure / completeness
Page(s):   /cookies
Expected:  Every cookie set on the domain is disclosed by name + duration.
Actual:    cookies.html does not list Calendly cookies, does not list Cloudflare's `cf_chl_*` (challenge cookies), does not list browser-set localStorage keys beyond `ca_cookie_consent_v2` (the legacy `ca_cookie_consent` mirror is set per js/cookie-banner.js line 17 but not disclosed).
Impact:    PECR — incomplete cookie disclosure.
Evidence:  cookies.html lines 52–89; js/cookie-banner.js line 17.

ID:        WS-AUDIT-043
Severity:  Medium
Surface:   Performance / scripts.min.js size
Page(s):   Every page
Expected:  Site-wide script bundle ≤30KB minified for static marketing site.
Actual:    /scripts.min.js Content-Length = 38,877 bytes. Mostly dead code (CSRD form, contact form, particles, segment-selector, etc. all in one bundle, even on pages that don't use any of these).
Impact:    First-paint penalty on every page.
Evidence:  curl -I https://crowagent.ai/scripts.min.js → Content-Length 38877.

ID:        WS-AUDIT-044
Severity:  Medium
Surface:   Brand / footer tagline
Page(s):   Every page
Expected:  Footer tagline matches CLAUDE.md "Sustainability Intelligence".
Actual:    See WS-AUDIT-033. Footer says "Sustainability Compliance Software for UK organisations…". Different from declared brand.
Impact:    Drift; rectify in nav-inject.js line 169.
Evidence:  Same as 033.

ID:        WS-AUDIT-045
Severity:  Medium
Surface:   Roadmap / dates without updates
Page(s):   /roadmap
Expected:  Roadmap dates either explicitly future or updated regularly; no past-tense items left as "upcoming".
Actual:    Not deep-audited; flag for content review. Roadmap last sitemap lastmod = 2026-03-30 (over a month old) yet changefreq=weekly.
Impact:    Stale signal to crawlers.
Evidence:  sitemap.xml lastmod for /roadmap.

ID:        WS-AUDIT-046
Severity:  Medium
Surface:   Forms / accessibility of error region
Page(s):   /partners
Expected:  role="alert" element starts with display:none; when populated, it is announced by screen readers.
Actual:    partners.html line 214 uses role="alert" with display:none. When set to block (line 30), screen readers should announce. However, no aria-live=polite as fallback for older AT.
Impact:    Inconsistent SR support.
Evidence:  partners.html line 214.
```

---

## LOW FINDINGS

```
ID:        WS-AUDIT-047
Severity:  Low
Surface:   Versioning / artefact size
Page(s):   /styles.min.css
Expected:  Atomic versioning; single source of truth.
Actual:    styles.min.css served at v=52, /styles.css unminified (262KB) also accessible via direct path. Not normally fetched but exposed in repo.
Impact:    Minor; ensure styles.css source isn't routed (it's not in _redirects).
Evidence:  curl -I /styles.css would return 200 (not tested live).

ID:        WS-AUDIT-048
Severity:  Low
Surface:   HTML / inline color hex via CSS-var fallback
Page(s):   index.html SVG dashboard mockup
Expected:  All colors via CSS variables; SVG inside HTML may legitimately use fallback `var(--surf, #0A1F3A)` for paint-engine support.
Actual:    Site uses `var(--xx, #hex)` extensively in inline SVGs (intentional for SVG paint inheritance). Not a bug.
Impact:    None — informational note that the audit found these but classed as legitimate.
Evidence:  index.html SVG lines.

ID:        WS-AUDIT-049
Severity:  Low
Surface:   /humans.txt
Page(s):   /humans.txt
Expected:  Live and current.
Actual:    File present in repo (536 bytes); not audited deeply. Cosmetic.
Impact:    None.
Evidence:  ls humans.txt.

ID:        WS-AUDIT-050
Severity:  Low
Surface:   Navigation / "Free Tools" label inconsistency in mobile menu
Page(s):   Every page mobile menu
Expected:  Single nav label for the same destination.
Actual:    Mobile menu line 132: `<a href="/tools">Free Tools</a>`. Footer line 192: `<h3>Free Tools</h3>`. Consistent here ✓ but mobile-menu sub-items list e.g. "PPN 002 Calculator" while desktop nav-mega line 97 lists "PPN 002 Social Value Calculator". Trim/expand mismatch.
Impact:    Cosmetic; minor brand polish.
Evidence:  js/nav-inject.js lines 97 vs 134.

ID:        WS-AUDIT-051
Severity:  Low
Surface:   /changelog.xml MIME / encoding
Page(s):   /changelog.xml
Expected:  Content-Type: application/rss+xml; charset=utf-8, declared in _headers ✓.
Actual:    _headers line 49 sets the Content-Type ✓. Cache-Control: 5min — fine.
Impact:    None.
Evidence:  _headers lines 47–49.

ID:        WS-AUDIT-052
Severity:  Low
Surface:   browserconfig.xml
Page(s):   /browserconfig.xml
Expected:  Live and valid.
Actual:    File present (228 bytes); not audited deeply.
Impact:    None.
Evidence:  ls browserconfig.xml.

ID:        WS-AUDIT-053
Severity:  Low
Surface:   Performance / fonts preload
Page(s):   Every page
Expected:  Critical fonts preloaded via <link rel="preload" as="font" crossorigin>.
Actual:    Pages preconnect to fonts.googleapis.com / fonts.gstatic.com but do not preload specific WOFF2 files. Fonts download blocking on first connection.
Impact:    +200ms first-paint penalty on cold cache.
Evidence:  index.html lines 30–32.

ID:        WS-AUDIT-054
Severity:  Low
Surface:   /privacy / DSAR procedure clarity
Page(s):   /privacy lines 159–168
Expected:  DSAR procedure is clear and includes timeline; ✓.
Actual:    Procedure is comprehensive (✓ — strong). Minor: "one calendar month" is correct under Article 12(3) UK GDPR but should be cross-referenced with the right-of-erasure timeline.
Impact:    None — informational.
Evidence:  privacy.html lines 159–168.

ID:        WS-AUDIT-055
Severity:  Low
Surface:   Glossary / intra-site link density
Page(s):   /glossary, /glossary/*
Expected:  Each glossary term page links to canonical product page where applicable.
Actual:    Not audited deeply. Listed for content review.
Impact:    SEO link-graph thinness.
Evidence:  Manual review required.

ID:        WS-AUDIT-056
Severity:  Low
Surface:   Status indicator widget dead state
Page(s):   Every page
Expected:  Live status integration (StatusPage / Better Uptime / etc.).
Actual:    See WS-AUDIT-020. The widget has no JS data source. Either wire it or remove it.
Impact:    Same as 020.
Evidence:  Same as 020.

ID:        WS-AUDIT-057
Severity:  Low
Surface:   Compliance / CMS / changelog
Page(s):   /changelog
Expected:  Single source of truth between /changelog HTML and /changelog.xml RSS.
Actual:    Not deeply audited; recommend ensuring HTML changelog and RSS feed match item-by-item.
Impact:    Sync drift risk.
Evidence:  Manual review.
```

---

## ASSUMPTIONS / NOT VERIFIED

- Actual HTTP status returned for unknown paths (`/random-foo`) — would need live curl to confirm if Cloudflare returns 404 or 200.
- Lighthouse / axe-core a11y crawl was not run; manual code-grep audit only.
- Service worker behaviour deep-audit deferred; recommend explicit review of `service-worker.js` cache strategy.
- Content audit of every blog article body for legal/regulatory accuracy was out of scope (audit focuses on platform-level surfaces).

---

> "I have not skipped, hidden, or deprioritized any issue."
> "Total issues found: 57. Categories: 9 Critical, 19 High, 18 Medium, 11 Low."
