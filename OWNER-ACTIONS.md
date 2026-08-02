# Owner actions — running log

Things only the owner can decide or do. I add to this rather than stopping work.
Nothing here blocks the transformation; each item names what I did in the meantime.

**Legend** — `OPEN` needs you · `ANSWERED` decided, kept for the record · `CLOSED` resolved without you

Last updated: 2026-08-02

---

## OPEN — decisions

### OA-01 · 17 uncited claims on the homepage · P1 · content risk

Full extraction with exact wording in `migration/HOMEPAGE-CONTENT-MODEL.md`.
Section 1 (market numbers) is the **only** homepage section where every figure is cited.

Highest risk first:

| # | Claim | Where | Problem |
|---|---|---|---|
| 1 | "The only engine that sits on both sides", and "almost nothing else in this market does both" | Section 3, stated twice | An absolute uniqueness claim about a competitive market, with no support. This is the kind of statement a competitor can challenge cheaply. |
| 2 | 40 / 30 / 20% criterion weightings | Section 5 | A source comment in the HTML calls these "the published weighting breakdown" while naming no ITT, authority or framework. |
| 3 | "£2.80 per £100" | Section 5 | Sits immediately beside properly-cited National TOMs figures, so it borrows their credibility without having any. |
| 4 | Absolute read-only guarantee: "We never write back to your files or change a setting" | Integrations band | A security guarantee in absolute terms with no trust page linked. |
| 5 | 55% / 44% supplier figures | Section 1 | Attributed to "CIPS Supply Management and techUK" but with no survey title, year, sample size or link. Weakest of the cited items. |

**What I need:** for each, either a source I can cite, or approval to soften/remove.
**What I did meanwhile:** ported Section 1 (fully cited) and left Sections 3 and 5 unported so
nothing unsourced moves onto the new homepage by default.

**Related, already fixed without you:** the hero I built cited "the Oxford proxy constants".
The Oxford Social Value Bank does not exist and this site already stripped it from 54 places.
Removed, along with a fabricated-looking tender reference `ITT CF-2026-0417` that read as a live
procurement. The hero example is now labelled "Worked example".

### OA-04 · Consent is enforced now, but still not RECORDED · P1 · compliance

I fixed the half of this that is in this repo. The other half is in the platform.

**What was wrong (live on production until 2026-08-02):** `#cp-consent` carried
`required`, but the form sets `novalidate` and the submit handler never checked the box.
An enquiry could be sent with consent unticked — personal data processed with no consent
given at all. Now blocked client-side, with an accessible inline error and focus moved to
the control. Gated by `tests/contact-consent.spec.js`.

**What is still wrong, and needs the platform repo:** the POST payload to
`app.crowagent.ai/api/contact/submit` contains `name`, `email`, `organisation`,
`enquiry_type`, `message`, `turnstile_token` — **and no consent field**. So even when a
user ticks the box, nothing records that they did.

UK GDPR Art. 7(1) requires the controller to be able to *demonstrate* that consent was
given. A tick that is never transmitted or stored cannot be demonstrated.

**What I need:** confirmation that the API accepts an extra `gdpr_consent` field (and
ideally stores it with a timestamp). I did **not** add it to the payload unilaterally: if
that endpoint validates its schema strictly it would reject every submission, and this is
the site's primary conversion path. That is a live-traffic risk I will not take on an
assumption.

### OA-05 · Pricing says "Unlimited" where the product enforces caps · P1 · content accuracy

`pricing.html` states **"Active bids: Unlimited"** on all three tiers. A comment in that
same file records enforced caps of **Starter 5/month and Pro 25/month**.

If the caps are real, "Unlimited" is a pricing claim that contradicts what a customer will
actually experience after paying, which is the most expensive kind of copy error there is.
**What I need:** the true limits, or confirmation the caps were removed. I have not ported
the pricing page pending this.

### OA-06 · Turnstile race gives a misleading error · P2 · UX

Submitting before Cloudflare Turnstile has issued its token produces *"Please complete the
security check"* — but there is nothing for the user to complete, the widget is invisible
and simply has not resolved yet. Reproduced locally on every fast submit.

Fixing it properly means disabling the submit button until the token arrives, which changes
the form's behaviour on a live conversion path. Flagging rather than doing it silently.

### OA-07 · The magnetic CTA animation can swallow a click · P2 · UX risk

`#cpSubmitBtn` carries `data-magnetic`, so `magnetic-pull.js` translates it toward the
pointer. Traced on a repeat press of the contact form's Send button:

```
pointerdown  fires
mousedown    fires
click        NEVER FIRES
```

A browser does not synthesise a `click` when the element moves between press and release.
The submit handler is simply never reached.

**How confident I am this hits real users: not very, and I want to be straight about that.**
I reproduced it with synthetic pointer events, where the magnet is still animating during
the press. A human holding the mouse still has a stationary cursor, so the transform should
settle and the click should land. `requestSubmit()` and a real keyboard Enter both work,
which confirms the handler is fine and only click DELIVERY is affected.

But an animated primary CTA that can eat a press is worth knowing about, and it is trivially
avoidable: suppress the magnetic transform between `pointerdown` and `pointerup`. I have not
changed it, because the animation is a deliberate design choice on the main conversion path
and this is a judgement call about feel, not a defect I can prove.

### OA-08 · Partner enquiries go to an UNDISCLOSED US processor · P0 · compliance

**This is the most serious open item.** Verified in code and by driving the live form.

`js/partners-form.js:165` POSTs to **`https://formspree.io/f/xbdpkaol`**. The payload carries
`name`, `company`, `role`, `email`, **`phone`** and free text.

`privacy.html` contains **zero** occurrences of "Formspree". Nor does `cookies.html`. Meanwhile the
consent line on the form promises processing *"in line with the Privacy Policy"* — a policy that
does not name this recipient.

Two distinct UK GDPR problems:
- **Art. 13(1)(e)** — recipients of personal data must be disclosed. Formspree is not.
- **Art. 44 / Ch. V** — Formspree is US-based, so this is a restricted international transfer. The
  policy documents no transfer mechanism for it.

**What I fixed without you:** consent is now actually *recorded*. The tick was enforced (this form,
unlike the contact one, has no `novalidate`, so the browser genuinely blocks submission — verified:
*"Please check this box if you want to proceed."*) but was never transmitted. The payload now carries
`gdpr_consent`, the **exact consent wording**, and an ISO timestamp, because Art. 7(1) requires
demonstrating what the person agreed to, not merely that they agreed.

**What needs you:** naming Formspree in the privacy policy as a processor, with its purpose,
retention and transfer basis. That is legal text and a controller decision. Alternatively, move the
form to the same `app.crowagent.ai` endpoint the contact form uses and drop the third party entirely
— which is probably the better answer, since it also fixes OA-09.

### OA-09 · Partner form's Turnstile is verified by nobody · P1 · security

The token was checked in the browser and then dropped from the payload. A bot POSTing straight to
the Formspree endpoint never runs that code, so the check stopped nothing.

I now send the token so it is at least in the record. **That is not a fix.** A challenge token means
something only when verified server-side against Cloudflare's `siteverify`, and Formspree does not do
that. Real remediation is the same as OA-08: move the endpoint somewhere that can verify it.

### OA-10 · integrations.html contradicts its own security guarantee · P1 · content accuracy

The standfirst reads, in one sentence:

> "Sign in with your work identity, read documents where they live, and route alerts to your
> channels. **Read-only throughout.**"

The same page offers Slack/Teams **alerts**, evidence **exports** written to your Drive, and SMS
**reminders**. Those are writes to customer systems. The claim is refuted by the sentence it appears
in, and the meta description repeats it into every search result and social share.

**I have not rewritten it.** The accurate scope is presumably "read-only on your documents", but I do
not know the product's actual OAuth scopes, and swapping one unverified security claim for another is
exactly how this site ended up citing a framework that does not exist. Give me the real scopes and I
will make the copy match them.

### OA-11 · partners.html H1 was grammatically broken, now fixed · P2 · copy

The two hero spans concatenated to **"Put CrowMark in front of to your clients."** Not grammatical
under any reading, and it was the H1 — the page's accessible name and its indexed heading.

Removed the stray "to". Flagged rather than done silently because it is a revenue page and a
different headline may have been intended.

### OA-12 · Three FAQ answers make claims I ported verbatim · P2 · content accuracy

Rewriting published marketing copy is a controller decision, so these moved across unchanged. All
three are now in `astro/src/data/faq.ts`, where changing them is a one-line edit that updates the
visible answer AND the structured data together.

| Claim | Where | Why it is worth a look |
|---|---|---|
| "we are GDPR compliant" | *Is my data secure?* | Stated absolutely. The security page is careful elsewhere ("We follow ISO 27001 controls. We are not certified yet."), so this one is out of step with the site's own tone on compliance claims. |
| "Many local authorities and NHS trusts apply the same or a higher weighting" | *What is the 10% minimum?* | No source. Plausible, but it is a quantified claim about third parties. |
| "CrowMark is live and in daily use" | *Is CrowMark ready to use?* | A near-identical claim ("Live, paid, and in daily use") was removed from five compare pages as unevidenced. This variant survived on the FAQ. |

Also carried over: "roughly 17 times the text of a 10-page PDF" and "19 social-value measures".

### OA-13 · The roadmap stamps a quarter on work it calls uncommitted · P1 · claim risk

`roadmap.html` Phase 3 carries the header **`Q4 2026`** while its own lead paragraph reads:

> "Early research, not yet committed engineering. Anchored to live regulation rather than
> speculation."

Two named items (Regulatory Monitor, Tender reasoning copilot) sit under that quarter stamp. Phase 2's
`Q3 2026` is properly hedged; Phase 3's is not. A reader scanning the timeline takes away a delivery
date you explicitly say you have not committed to — and a public roadmap date is the kind of claim a
prospect will quote back at you.

Two clean fixes, both yours to pick: drop the quarter from Phase 3 and label it "Exploring", or keep
the quarter and drop "not yet committed" from the lead. I have not chosen, because which one is true
is a product decision.

### OA-14 · The changelog is about three months stale · P2 · trust

`changelog.html` promises *"Every shipped change, in one feed"* and carries **two entries**, the most
recent dated **2026-05-05**. Unrecorded since: the 2026-07-28 tool removals, the 2026-08-01 homepage
rebuild, and everything in this migration. Its hero also advertises "System Status" content the page
does not contain.

A changelog that stops is worse than no changelog, because it implies nothing has shipped. Either it
gets updated as part of releasing, or the promise on it should be softened.

### OA-15 · TOMs unhedged on the buyer side · P1 · **ADDRESSED IN THE PORT, confirmation still wanted**

`crowmark-buyers.html` uses **"by TOMs theme"** seven times as a rollup dimension, with no
qualification anywhere on the page. `/crowmark` is careful about exactly this:

> "aligned to National TOMs conventions"
> "**not a full National TOMs implementation**, and the AI never computes the total"

Two sibling pages describing the same engine, one disclaiming a framework claim and one not. A
contracting authority reading the buyers page can reasonably infer a full National TOMs
implementation. This is the same pattern class as the framework that had to be stripped from 54
places.

**Why I have not patched the legacy page:** the buyers page carries an FAQPage JSON-LD block whose
answers mirror the visible ones. Editing the visible copy without the schema recreates precisely the
drift I just removed from `/faq` (9 schema questions against 14 visible). Both need to change
together, and they will come from one source when this page is ported — which is where I will apply
the hedge, using the wording already published on `/crowmark` rather than inventing new.

**Now done, in the Astro port only.** `/crowmark-buyers` renders its FAQ and its FAQPage JSON-LD from
one array, so the hedge lands in both with a single edit — which is exactly why I waited for the port
rather than patching the legacy page and risking the drift I had just removed from `/faq`.

Applied: the acronym is expanded to "National TOMs" throughout (0 bare "TOMs theme" occurrences
remain), and the social-value answer now ends with `/crowmark`'s already-published sentence,
"Measures are aligned to National TOMs conventions; it is not a full National TOMs implementation."

**No new claim is made — a claim is narrowed**, using wording already live on a sibling page.

**What I still need from you:** confirmation that `/crowmark`'s wording is accurate for the buyer side.
If the buyer engine genuinely differs, tell me how and I will make the copy match. The LEGACY page is
untouched and still unhedged; it stays that way until cutover or until you say otherwise.

### OA-16 · Screenshot alt text claimed live customer data · P1 · **FIXED, logged for the record**

Five places described captures from a staging/sample tenant as a **"live contract"** in `alt` text.
Two of them directly contradicted their own visible `<figcaption>`, which said "shown with a sample
account" — so screen-reader users were told the data was real while sighted users were told it was a
sample. One was the **homepage**.

An authoring comment on `crowmark.html:509` confirms the shot was "taken from staging".

Corrected in `index.html`, `crowmark.html`, `compare/crowmark-vs-autogenai.html`,
`.partials/section6-devices.html` and the Astro compare collection. Each edit removes a claim rather
than adding one. No `alt` on the site now asserts a live contract.

Recorded because this is the third instance of the same underlying issue — captures from an empty
test tenant being presented as real — after the "Test Contract 1" screenshots and the invented
`ITT CF-2026-0417` reference.

### OA-17 · The published methodology describes a calculator that does not exist · P1 · content accuracy

**This is the one I would look at next after OA-08.** `/tools/ppn-002-calculator/methodology` is the
page that makes the "no black box, the maths is verifiable" promise. It describes a substantially
different tool from the one it documents.

The engine (`js/tool-engine-ppn-002-calculator.js`) takes exactly three inputs — mission, total
weighting, social-value weighting — and performs one calculation: is the social-value weighting at
least 10% of the total. Verified by grep: the file contains **zero** occurrences of `NPV`,
`discount`, `3.5`, `proxy`, `27,000`, `8,460`, or `year`.

The methodology page says:

| Section | Claim | Reality |
|---|---|---|
| 4. National TOMs proxy values | proxy values "are mapped directly into the calculation", citing £27,000 per sustained job and £8,460 per Level 3+ apprenticeship | the tool never uses a proxy value |
| 5. NPV discount and time horizon | "the Calculator discounts forward-year social value cashflows" at "the HM Treasury Green Book rate of 3.5%" | the tool has no year input, no cashflow and no discounting |
| 6. From floor to scoring | "the Calculator returns a defensible scoring window" with minimum / competitive / differentiated tiers | the tool returns one verdict: at or above, or below |
| 7. What the Calculator does not do | "what is a defensible 10% response, **in pounds**" | the tool returns no monetary figure at all |

It reads as though written for CrowMark's fuller engine and never revised when the free tool was
narrowed. Section 7 does separate the two ("Those capabilities live in CrowMark"), which makes the
mismatch in sections 4 to 6 look like drift rather than intent.

**Why it matters more than an ordinary copy error:** this is the page a bidder is invited to cite in
a bid response — the page itself says "Defensible enough to cite in a bid response." A supplier who
cites a methodology their tool did not follow is exposed, and so is CrowAgent.

**What I did:** did NOT port the page. Porting it would republish the mismatch on the new site, and
rewriting sections 4 to 6 myself means deciding what the tool is claimed to do, which is yours.
I have proven exactly what it does compute (22-case parity against the legacy engine), so once you
tell me which way to resolve it I can make the page match the tool precisely.

**Two smaller things on the same page:**
- **A date conflict.** It says PPN 002 is "effective 24 February 2025". `CLAUDE.md` records "published
  13 Feb 2025, mandatory 1 Oct 2025", and `/crowmark` says "dated February 2025 and mandatory from
  1 October 2025". Three dates for one policy note across the site.
- **No reference is a link.** All five entries in the References section are plain text on a page
  promising verifiability. I have not added URLs because I would be guessing at specific ones.

**Fixed without you:** the references listed "National TOMs Framework." and "National TOMs." as two
separate entries — the fifth instance of the Oxford-remediation find/replace collateral. Listed once.

### OA-02 · Blog light-vs-dark at cutover · P2 · design

The 8 legacy blog articles render light; everything in the Astro rebuild is dark. Both are
defensible. Changing 8 published articles is a content decision, not a build one.
**What I did meanwhile:** ported all 8 preserving current appearance, so either choice is a
one-line change later, not a re-port.

### OA-03 · Cloudflare Bot Fight Mode injects a script on every page · P2 · perf + privacy

Verified live 2026-08-02. Every HTML response has this appended before `</body>`, by Cloudflare
and not by our build:

```
/cdn-cgi/challenge-platform/scripts/jsd/main.js   (window.__CF$cv$params)
```

Two consequences worth a decision:
1. It is a render-blocking-adjacent third-party script on 100% of pageviews, on a site whose
   entire measured problem was payload.
2. It sets storage before any consent interaction. It is arguably strictly necessary (security),
   which is the usual exemption, but this site runs a consent banner and the claim should match
   the behaviour.

**Where:** Cloudflare dashboard → Security → Bots → Bot Fight Mode.
**Recommendation:** leave it on unless the consent wording needs to be exact; the security value
is real and the cost is small. Flagging it because it is invisible in the repo, so nobody would
otherwise know it is there.

---

## CLOSED — resolved without owner action

### OA-C1 · "Cloudflare Pages is not picking up commits" · was P0 · **not reproducible, fix already live**

Verified 2026-08-02 by byte comparison rather than by dashboard inspection:

- `Assets/css/sovereign-core-v2.compiled.css`, comment-stripped, is **byte-identical** to what
  `https://crowagent.ai` serves: 159,022 bytes each, 158 `@media` blocks and 1,633 rules on both
  sides. The P0 CSS destruction deleted 644 rules and 156 `@media` blocks, so none of it is live.
- `index.html` and `dist/index.html` both match the live HTML exactly under whitespace
  normalisation. The only divergence is the Cloudflare script in OA-03, which Cloudflare injects.

Root cause of the original blockage was `core.autocrlf=true` with no `.gitattributes`, which made
content hashes differ between the working tree and a fresh clone, so the build's asset-hash guard
failed on Cloudflare while passing locally. Fixed by committing `.gitattributes` with
`* text=auto eol=lf`. **No dashboard action needed.**

### OA-C2 · Nav and Footer "still to build" · **already exist**

`astro/src/components/nav/Nav.astro` and `astro/src/components/footer/Footer.astro` are built and
wired into `Base.astro` (lines 105 and 109). A forensic parity and accessibility audit against the
live client-injected nav is running; findings will land in `migration/NAV-FOOTER-AUDIT.md`.

---

## Port status — where the migration actually is

23 of ~41 real routes are on Astro. Excludes dev/test files, `.partials/`, and the Google
verification file.

| State | Routes |
|---|---|
| **Ported (23)** | `/`, `/blog/` + 8 posts, `/compare/` + 4, `/glossary/` + 2, `/sectors/` + 4 |
| **Not yet ported (18)** | about, contact, partners, pricing, roadmap, faq, changelog, resources, integrations, crowmark, crowmark-buyers, tools/, privacy, terms, cookies, security, cookie-preferences, 404 |

The homepage is partially rebuilt: hero and Section 1 are done; Sections 2–6 are pending, and
Sections 3 and 5 are gated on OA-01.
