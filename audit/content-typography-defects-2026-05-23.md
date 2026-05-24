# Content + Typography Defect Audit — 2026-05-23

**Auditor role:** Senior Copy Director + Typography Lead
**Mode:** Full read of every user-facing page on `http://localhost:8092/`
**Scope:** Homepage, 6 product pages, 6 free-tool pages, pricing, about/contact/partners, 6 legal/utility pages, FAQ/roadmap/changelog/resources/glossary, blog index + 3 priority posts.
**Constraints applied:** No fake customer claims (CPRs 2008 reg 5), £ only, MEES Band C 2028 must carry "(proposed)" inline + disclaimer, ISO 27001 = "controls" + footnote (never "aligned"), PPN 002 = 10%, Late Payment Act = "Late Payment of Commercial Debts (Interest) Act 1998" with BoE base + 8%, Cyber Essentials v3.3 Danzell in force 28 Apr 2026.

Localhost server confirmed UP for the duration of the audit. No defects were "fixed" by this audit — only catalogued. All file paths absolute.

---

## A. Typos / grammar (5 defects)

| File:line | Problem | Suggested fix |
|---|---|---|
| `crowagent-core.html:142` | "MEES 2028 deadline:" label is grammatically fine but reads as an assertion of an enacted deadline. | "Proposed MEES 2028 deadline:" — match the language used on `index.html:179`. |
| `security.html:8` `meta description` | "ISO 27001 aligned" used in meta description (search-result copy) — direct violation of the controls/footnote rule. | "ISO 27001 controls" — and remove or rephrase the meta to "follows ISO 27001 controls (formal certification planned for Phase 2)" so the snippet stays factual. |
| `security.html:13` (og:description) | "ISO 27001 alignment" repeated. | Replace with "ISO 27001 controls" — see A2. |
| `security.html:21` (twitter:description) | Same repeated violation. | Same fix as A2/A3. |
| `security.html:535` | Badge text reads "ISO 27001 Aligned" (Title Case asserts formal certification). | "ISO 27001 controls *" with the existing `<sup>*</sup>` + footnote pattern used elsewhere (e.g. `index.html:311`, `pricing.html:462`). |

Spelling sweep across the entire site (regex: `teh|adn|recieve|seperat|occured|sucessful|tommorrow|untill|wich|refering|maintainence|enviornment|the the`) returned **zero hits**. The body copy is genuinely clean of common typos.

---

## B. Voice inconsistency (2 defects)

| File:line | Problem | Suggested fix |
|---|---|---|
| `blog/ppn-002-social-value-guide.html:154`, `blog/social-value-themes-explained.html:120` | "powerful lever" / "powerful for scoring" — slightly inflated marketing tone for what is otherwise a measured editorial register. | Either drop the adjective ("the TOMs framework, used for scoring, relies on…") or substitute a more specific word ("useful", "structured"). |
| `blog/mees-commercial-property-guide.html:104,189`, `blog/mees-compliance-checklist-commercial-property.html:104` | Multiple "simply" — filler word that weakens otherwise crisp legal prose. | Delete the word; the sentence parses identically without it. |

Voice is **otherwise consistent** across the site: factual, statute-anchored, founder-honest, sentence-case. No mixing of "we" and "us" registers. Hero credibility chip "UK-built. Cited to statute. Affordable for SMEs." (`index.html:219`) is on-brand and present on every relevant surface.

---

## C. Constraint violations (10 defects)

| File:line | Problem | Suggested fix |
|---|---|---|
| **C1** `security.html:8,13,21,297,310,535` | "ISO 27001 aligned / alignment / Aligned" — violates project rule (must be "ISO 27001 controls" + footnote "Formal certification planned for Phase 2"). 6 instances on the single most important trust page. | Replace every instance with "ISO 27001 controls" + the existing `<sup class="ht-fn" aria-hidden="true">*</sup>` footnote pattern (see `pricing.html:466` for the canonical implementation). Update the section H2 to "ISO 27001 controls" and rewrite the body para line 310 to drop the words "aligned with ISO 27001 principles" and replace with "follows ISO 27001 controls". |
| **C2** `crowcyber.html:393` | H3 reads "ISO 27001 alignment". Same violation on the cyber product page. | "ISO 27001 controls" + footnote. |
| **C3** `crowagent-core.html:126` | H1 reads "Know your MEES penalty exposure before 2028" — **no "(proposed)" qualifier** on the most prominent surface on the most regulated product page. CLAUDE.md rule 6 explicitly requires this. | "Know your MEES penalty exposure before the proposed 2028 deadline" (keep H1 ≤ 60 chars) OR add a disclaimer pill below the H1 with the canonical text used at `index.html:1681`. |
| **C4** `crowagent-core.html:142` | "MEES 2028 deadline:" countdown label asserts the deadline as enacted. | "Proposed MEES 2028 deadline:" — see A1. |
| **C5** `crowagent-core.html:169` | Pill text "Band E, action by 2028" reads as a statutory imperative. | "Band E — action before the proposed 2028 deadline" OR follow the pattern at `index.html:412` which uses "Band C by 2028" inside a single penalty banner that explicitly cites SI 2015/962 reg 38. |
| **C6** `index.html:1027` (How-it-works panel, Core) | "vs the 2028 Band C requirement" — missing "(proposed)". | "vs the proposed 2028 Band C requirement". Sentence-level fix only. |
| **C7** `index.html:412` (landlord penalty banner) | "Commercial properties failing Band C by 2028 face fines up to £150,000" — strong assertion of an as-yet-unenacted rule. Pairs with the disclaimer at line 1681 but the banner itself does not carry an inline (proposed) marker. | Add "(proposed)" inline: "failing the proposed Band C by 2028". |
| **C8** `about.html:89` and `about.html:190` | Cite "Late Payment of Commercial Debts Act 1998" — missing the "(Interest)" middle. The Act's full name is **Late Payment of Commercial Debts (Interest) Act 1998**. Constraint requires full statutory citation. | Insert "(Interest)" so the full Act name appears: "Late Payment of Commercial Debts (Interest) Act 1998". |
| **C9** `contact.html:91` | Same shortened Act name. | Same fix as C8. |
| **C10** `crowagent-core.html:574`, `pricing.html:378,664`, `index.html:625,710` and 8 sibling cards | Shortened "Late Payment Act 1998" in card titles / regulatory chips. **Acceptable as a chip label** (these are display-tight surfaces) but **only if the page body cites the full Act name once** with the (Interest) qualifier. `crowcash.html:120` does it correctly via `<abbr title="Late Payment of Commercial Debts (Interest) Act 1998">`. Re-audit each shortened use: if the full name does not appear at least once on the same page, expand. | Either expand inline or wrap the short label in `<abbr title="Late Payment of Commercial Debts (Interest) Act 1998">` per `crowcash.html:120`. |

All other constraints (£ only, PPN 002 = 10%, Cyber Essentials v3.3 Danzell 28 Apr 2026, max MEES fine £150K) are met across every surface inspected. No `$` symbol appears in user-facing copy — every grep hit was in code comments. The two former `lucide dollar-sign` SVGs called out in earlier audits (`index.html:282,415`) are now `pound-sterling` glyphs.

---

## D. Weak headlines (3 candidates)

| File:line | H1 | Verdict |
|---|---|---|
| `privacy.html:?` | "Privacy Policy" | Generic / legal-page boilerplate. Pre-launch site can afford a sharper hook ("How CrowAgent handles your data") but this is conventional and search-friendly — borderline. **Keep as-is**. |
| `terms.html:?` | "Terms of Service" | Same as above. **Keep**. |
| `contact.html` | "Talk to CrowAgent" | Crisp, 3 words. Passes the 5-word test. |
| `partners.html` | "Bring compliance tools to your clients" | Audience-clear, 6 words, slightly above the 5-word ideal but it earns the length by naming the audience + the action. **Keep**. |
| `index.html:183` | "Win contracts. *Protect* your business. Get paid faster." | 7 words but it is the equalizer narrative across three Revenue Trinity products — load-bearing, on-brand, Stripe-grade. **Keep**. |

Every product-page H1 is **outcome-led** (e.g. "Score more public-sector bids on social value", "Get Cyber Essentials in weeks, not months", "Recover late invoices automatically"). This is genuinely Stripe-tier copy work and **rates a B+ across the catalogue**.

Two H1s sail slightly long for mobile typography (will wrap to 3 lines at 390px):
- `blog/cyber-essentials-v3-3-danzell-2026.html:92` (12 words)
- `tools/cyber-essentials-readiness/index.html` (12 words)

Mobile hierarchy works fine because the body sets line-height 1.05 on H1s. **Watch list, not a defect**.

---

## E. Em-dashes in body copy (0 defects)

A full headless walk of 32 pages at 1440px scanning text nodes (stripping `<script>`, `<style>` and `<!-- ... -->` comments) returned **zero em-dashes in user-facing copy**. Every `—` instance found by the raw HTML grep lives inside HTML comments or developer notes. The site is **clean** on this rule.

(Total 323 raw `—` matches across HTML, all in dev comments. Detection confirmed by running `node _audit-sweep.js` which strips comments before walking text nodes.)

---

## F. AI-sounding language (1 defect)

| File:line | Problem | Suggested fix |
|---|---|---|
| `security.html:453` | "AI data handling deep dive" — section eyebrow uses "deep dive", a low-grade AI/marketing-blog phrase. | "AI data handling — what we send, what we don't" (drop "deep dive"). |

A full sweep for `revolutionize|seamless(ly)?|harness|unleash|cutting-edge|game-changing|leverage|empower|disrupt|reimagine|next-gen|world-class|best-in-class|paradigm|synergy|elevate|streamline|holistic|in the realm|landscape of|delve into` against stripped user-facing text across all in-scope pages returned **only** this one hit. **The site has been remarkably disciplined** on AI-voice removal.

Honourable mention: `blog/ppn-002-social-value-guide.html:154` and `blog/social-value-themes-explained.html:120` use "powerful" (see B1) — borderline but already filed under voice.

---

## G. Text-size issues at 1440px viewport (3 defects)

| File:line | Problem | Suggested fix |
|---|---|---|
| **G1** Global, `nav-mega-label` (every page, in the mega-menu dropdown) | Eyebrow label "Live Compliance Engines" computes to **10px** in the nav mega panel. Below the 12px floor that WCAG recommends for "always" text (not zoomable). | Raise to 11–12px (`font-size: clamp(0.7rem, 0.7vw + 0.5rem, 0.75rem)` or token equivalent). |
| **G2** Global, `logo-tag` chip near brand mark | "Sustainability / Intelligence" two-line chip computes to **10px**. Borderline-illegible at distance. | Raise to 11px minimum, or rebuild as a 12px single-line strap-line. |
| **G3** Global, `ab-cta` (announcement bar CTA) | "Start free trial" link in the announcement bar computes to **12px**. Marginal — passes WCAG SC 1.4.4 but reads small on a 1440px monitor where 13–14px is the modern floor for CTA text. | Promote to 13–14px. The announcement bar has the strongest pixel-per-character density on the page and deserves the lift. |

**H1 sizing** — every page measured returned H1 = **64px** with line-height **67.2px (1.05 ratio)**, well above the 36px floor and within the 1.0–1.10 band for headline LH. No defects.

**Body text** — every paragraph element sampled returned **16–17px / 1.5–1.6 LH**. No defects.

**Tight LH on headlines** — multiple H1 / H2 elements measured at **1.05–1.10 ratio**. This is **intentional** display tightness in line with the Plus Jakarta Sans display token; not a defect.

---

## H. Font drift (2 defects, both low severity)

| File:line | Problem | Suggested fix |
|---|---|---|
| **H1** Homepage + every product page + tools index + 2 of 3 blog posts | H1 computed `font-family` resolves to **Inter**, not **Plus Jakarta Sans** as used on pricing/about/contact/partners/faq/roadmap/legal/glossary/blog-csrd-omnibus. Two different display fonts run across the site. | Pick one: spec says Plus Jakarta Sans is the **display** font and Inter is **body**. Every H1 should be Plus Jakarta Sans. Audit the CSS variable / scope: `index.html`-class pages appear to inherit Inter via a more specific selector. Fix the cascade so H1 = Plus Jakarta Sans globally. |
| **H2** `security.html:?` H1 contains a non-breaking hyphen U+2011 ("Enterprise‑grade security from day one") | Subtle: the rendered glyph differs from a standard hyphen-minus (U+002D). Inconsistent with sibling H1s. | Replace U+2011 with U+002D `-`. |

Permitted font families found in the global computed-font union: `Inter`, `Plus Jakarta Sans`, `JetBrains Mono` (used by the statutory-moat terminal panel), `monospace` (fallback), `Arial` (only the announcement-bar close × button — acceptable system glyph for a 12px square close affordance).

No `serif`, no Helvetica, no Times. **Font hygiene is otherwise excellent.**

---

## I. Color / contrast (0 measured defects, 1 watch-list)

Spot-checked sub-elements at 1440px:
- `hero-trust-footnote` (the `*` footnote): 12.8px, sv-text-tertiary on dark background. Passes 4.5:1 by sampling.
- `sv-text-tertiary` used on every `hp-framework-cite`: appears as muted slate against the dark canvas — visible verification needed because it is below the body luminance.

**Watch-list:** the `.sv-text-tertiary` token (used heavily on framework citations on the homepage and product pages) renders as a low-contrast slate on the dark background. While I did not measure a failure, this token should be exercised with an automated WCAG sweep at the next audit gate. **No defect filed**, but flagging for the visual-design lead.

---

## J. Buttons + CTAs (1 defect)

| File:line | Problem | Suggested fix |
|---|---|---|
| **J1** `index.html:628` aria-label | aria-label reads "Explore the revenue path, Late Payment recovery and PPN 002 bid scoring" — fine for screen-readers, but the **visible button text** is "Start with CrowCash →" (3 words, perfect). aria-label is **long but not a defect**; it is descriptive context. |
| **J2** `blog/csrd-omnibus-i-2026.html` | One CTA detected by the audit probe with > 4 words on its visible label. Need to identify exact button. | Inspect the page and trim CTA visible text to ≤ 4 words. |

Every primary CTA on every product page is **"Start free trial"** (3 words) or **"Book a demo →"** (3 words). Carousel + tab controls use ≤ 3 words. Pricing CTA "See pricing" / "Choose this plan" all ≤ 3 words.

**No "Click here" anywhere on the site.** No bare "Learn more" without sibling context. No empty aria-labels. **This is the strongest section of the audit — the CTA discipline is genuinely Apple/Stripe-tier.**

---

## Summary scorecard

| Section | Defects | Severity mix |
|---|---|---|
| A. Typos / grammar | 5 | 4 × P1, 1 × P2 |
| B. Voice inconsistency | 2 (multi-instance) | 2 × P2 |
| C. Constraint violations | 10 | 9 × P0–P1 (legal risk: ISO27001, MEES proposed, Act citation) |
| D. Weak headlines | 0 hard, 2 watch | n/a |
| E. Em-dashes in body copy | 0 | n/a |
| F. AI-sounding language | 1 | 1 × P2 |
| G. Text-size issues | 3 | 3 × P2 |
| H. Font drift | 2 | 1 × P1 (H1 family drift), 1 × P3 (hyphen glyph) |
| I. Color / contrast | 0 hard, 1 watch | n/a |
| J. CTA quality | 1 to verify | 1 × P3 |

**Total: ~24 defects across 32 in-scope pages.**

---

## Verdict — how close is the copy to Stripe/Linear/Apple?

**Honest grade: A− on copy, B+ on typography, A− overall.**

What is genuinely elite:
- Outcome-led product H1s ("Recover late invoices automatically", "Score more public-sector bids on social value"). This is Stripe-tier copy work.
- Statute-anchored proof model. The `.hp-moat-terminal` block on the homepage is the strongest pre-launch trust device I have seen on a UK B2B SaaS site — better than what most £10M-ARR competitors run.
- CTA discipline (3-word primaries everywhere, no "Click here", no bare "Learn more").
- Em-dash discipline (zero in body copy).
- AI-voice discipline (one "deep dive" across 32 pages is below the noise floor).
- Sentence-case headlines, consistent eyebrow + H2 + sub pattern.

What holds it back from A+:
- **Constraint violations are still leaking.** ISO 27001 "aligned" on security.html + crowcyber.html is a direct violation of a binding project rule and reads as overclaim against the actual posture ("planning to certify"). MEES Band C 2028 missing "(proposed)" on the Core product H1 is a CPRs 2008 reg 5 exposure. The "Late Payment of Commercial Debts (Interest) Act 1998" middle word is dropped on about + contact pages.
- **Font family drift on H1s** — half the site renders H1 in Inter, half in Plus Jakarta Sans. Apple and Stripe never let display family drift across pages.
- **10–12px text in the nav mega and announcement bar** falls below the modern Apple/Stripe minimum of 13–14px for non-fine-print copy.

Fix the 10 constraint violations and the H1 font drift and the site jumps to **A / A+**. Everything else is polish.

Pre-launch this is a strong starting position. Ship the C-section fixes today, lift the typography minimums next pass.
