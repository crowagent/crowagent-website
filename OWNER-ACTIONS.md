# Owner actions — running log

Things only the owner can decide or do. I add to this rather than stopping work.
Nothing here blocks the transformation; each item names what I did in the meantime.

**Legend** — `OPEN` needs you · `ANSWERED` decided, kept for the record · `CLOSED` resolved without you

Last updated: 2026-08-02

---

## OPEN — decisions

### OA-26 · A published blog post attributes the s.71 duty to s.52 · P1 · accuracy · **FIXED 2026-08-02**

**Fixed and verified.** I read the statute directly rather than trusting the research summary, and
section 52 settles it in its own text: *"See section 71 for provision about assessing performance
against, and publishing information about, key performance indicators."* All three passages in
`procurement-act-2023-sme-guide.md` now split the duties, the sources list cites both sections, and
the built HTML carries `section 71` four times with the merged claim gone. Build exit 0; the SEO
parity and CSP gates ran. Left open below for the record.


Found while researching OA-25. The Procurement Act 2023 splits the KPI regime across two
sections:

- **s.52** — set and publish **at least three KPIs** before entering a public contract over
  £5m. In force 24 Feb 2025.
- **s.71** — **assess** performance against those KPIs at least annually and on termination,
  and publish breach and poor-performance information. In force 1 Jan 2026.

`src/content/blog/procurement-act-2023-sme-guide.md` merges the two, attributing the annual
assess-and-publish duty to s.52, in **three places** (lines 20, 63, 98). Line 63 is the most
explicit: *"section 52 ... sets and publishes at least three key performance indicators, then
assesses the supplier against them and publishes that performance at least once a year."*

**The site already contradicts itself on this**, which is how I am confident it is an error
rather than a judgement call. `src/content/sectors/construction.md` and
`src/content/sectors/highways.md` both split it correctly — *"section 52 for contracts above
£5m and section 71 on assessing and publishing performance"* — and all four compare pages cite
`s.52 / s.71` as a pair. One blog post is the outlier.

**Why it matters more than a citation nit:** the correction makes the product's own argument
*stronger*. s.52 makes a supplier promise; s.71 makes them prove. That is precisely the
promise-to-proof arc the post-award half of CrowMark sells. Getting it wrong on a page that
positions us as the people who read the statute properly is the worst place to be loose.

**What I need from you:** nothing, unless you disagree. This is a factual correction to our own
copy and I will fix it. Flagged here because it is live and published, not because it is blocked.

### OA-27 · Three figures on the homepage are unsourced · P1 · accuracy · **found 2026-08-02**

`src/components/sections/MarketShape.astro` — the entire section is four numbers, and I could
not source three of them:

| Figure | Attributed to | Status |
|---|---|---|
| `40,000+` notices a year | "Contracts Finder and Find a Tender" | No published total found. **Unsourced.** |
| `55%` qualification threshold | "published UK supplier surveys reported by CIPS Supply Management and techUK" | No named survey. **Unsourced.** |
| `44%` process complexity | same | No named survey. **Unsourced.** |

This is the same class of problem as OA-01, on the section whose *only* content is figures. The
`40,000+` number is also load-bearing elsewhere: it appears in the lifecycle Discover copy and
in several of the Figma variants I have built.

**What I need from you:** the original sources, if you have them. If they cannot be produced,
the numbers have to change or go — a site whose entire argument is "every figure traces to
something" cannot lead its market section with three that do not. I have not changed them yet
because guessing a replacement figure would be worse than flagging the gap.

### OA-25 · The site is a PPN 002 product site by volume, not a bid suite · P1 · positioning

**Owner direction (2026-08-02):** the narrative must cover UK public, UK private, EU and **global
private tenders** — which the owner expects to be the biggest market — and must get away from the
PPN-002-targeted framing. CrowMark is now a full bid suite.

**Measured across the 39-page Astro build**, total occurrences:

| UK-public-specific | | Broader market | |
|---|---:|---|---:|
| social value | **953** | RFP | 254 |
| PPN 002 | **937** | private sector | 129 |
| Procurement Act | 264 | international | 6 |
| National TOMs | 214 | **global** | **1** |
| Find a Tender + Contracts Finder | 234 | EU public | **0** |

Homepage alone: PPN 002 x19, social value x26, National TOMs x16, **global x0**.

This is not a copy tweak. Two structural faults in the lifecycle section specifically:

- **"Social value" as a stage name is UK-public-only.** The burden it represents exists in every
  market — security questionnaires, ESG, DEI, modern slavery, insurance, ISO 27001 / SOC 2 — but
  the name is parochial. The stage is real; the label is not portable.
- **"Discover" names only Contracts Finder and Find a Tender.** Private tenders mostly arrive by
  portal invite or email rather than a public notice. That is a different mechanism, not just a
  different source, so the stage description is wrong outside UK public.

**What I am doing:** research is running on market sizing (including whether private-sector tender
volume really is larger or simply unmeasured — I will not publish a figure I cannot source),
where opportunities surface per market, universal stage names, and which terms are UK jargon that
would lose a private or non-UK reader.

**What I need from you — one decision that shapes everything downstream:**

> Does **UK public remain the lead story** with the other markets alongside it, or does the
> narrative go **market-neutral with UK public as the proof point**?

The second travels further. It also gives up the specificity that currently makes the site
credible against generic AI bid tools — the standing positioning note is that the strength is
s.52 delivery, traceable figures, and refusing to claim win rates. Broadening badly could dilute
that into the same vague copy every competitor writes.

**Not started:** rewriting content. Guessing is how "social value" became a stage name; I would
rather re-work it from the research than from instinct.


### OA-24 · 17 structured-data blocks would be lost at cutover · P1 · SEO · **FIXED 2026-08-02**

`astro/scripts/check-seo-parity.js` compares every shipped Astro page against the legacy page that
served the same URL. Titles and descriptions are allowed to change — the rebuild rewrote copy on
purpose. A published structured-data type disappearing is not.

| Lost | Where | Why it matters |
|---|---|---|
| **FAQPage** x5 | 5 blog posts | drives the FAQ rich result in Google |
| **SoftwareApplication** | `/crowmark` | product rich result |
| **WebApplication** | the calculator | ditto |
| **Article** | `/blog/regulatory-updates-2026` | article rich result |
| **Blog** | `/blog/` | |
| **BreadcrumbList** x6 | `/blog/`, `/cookies`, `/glossary`, `/privacy`, `/security`, `/terms` | breadcrumb trail in SERPs |
| **TechArticle** | the methodology page | |
| **WebPage** | `/crowmark-buyers` | |

38 routes compared, so this is the whole site, not a sample.

**Nothing caught it.** 249 sitewide checks assert JSON-LD *parses*; none assert the same *types*
still ship. The spec requires "zero regressions in ... metadata, structured data" and this is the
first thing to actually compare them. Rankings do not fail loudly — this would have been found
months later, if at all.

**Fixed — all 17 recovered, zero lost.** `check-seo-parity.js` now runs in `npm run build`.

| Recovered | How |
|---|---|
| **FAQPage** x5 (20 Q&As) | The helper and the frontmatter field both already existed; nothing connected them. Lifted the questions and answers verbatim from the legacy build — they are already indexed against these URLs, so rewriting them during a fix would be a second invisible change. |
| **BreadcrumbList** x6 | Added at the Legal layout and the blog/glossary indexes, so a fifth legal page cannot ship without one. |
| **SoftwareApplication**, **WebApplication** | `/crowmark` and the calculator. No `aggregateRating` and no `review`: this site does not publish ratings it cannot evidence, and inventing them to win a rich result is the behaviour the product refuses. |
| **Blog**, **TechArticle**, **WebPage** | Blog index, methodology page, `/crowmark-buyers`. |
| **Article** | Not a loss. The page now emits **BlogPosting**, a schema.org subtype that Google accepts interchangeably for the Article rich result — more specific, not less. Encoded as a short explicit equivalence list rather than a hierarchy lookup, because every entry is a judgement someone should have to defend. |

Proved the guard fails by corrupting one FAQPage type and confirming exit 1.
Gate after the change: sitewide + heading-structure, 249 passed, three engines.


### OA-20 · Four unported routes are linked from EVERY page · P0 · cutover blocker

**This changes the priority of OA-05, OA-10 and OA-13.** I had been treating them as three
missing pages. They are not. All four unported routes are reached from the **global nav and
footer**, so they are linked from **38 of 38 pages** in the build. At cutover the Astro site
replaces the legacy one wholesale, and every page on the site ships with four dead links:

| Route | In | Blocked by | Linked from |
|---|---|---|---:|
| `/pricing` | main nav | OA-05 | 38/38 |
| `/integrations` | footer | OA-10 | 38/38 |
| `/roadmap` | footer | OA-13 | 38/38 |
| `/cookie-preferences` | footer | needs a consent system | 38/38 |

`/pricing` is in the **primary navigation**, between Products and Blog. It is one of the two or
three links a buyer clicks first.

The project's own success criteria in `specs/MODERNISATION-ARCHITECTURE.md` §9 require "zero
regressions against the baseline in: rendered content, **URLs**, metadata, structured data,
redirects, accessibility, Core Web Vitals". Four 404s on every page is a URL regression against
that baseline, so this is not a judgement call about polish.

**How it was found, and why it had not been.** The sitewide suite asserts every *subresource* of
a page returns 2xx. A link is not fetched during a page load, so no check looked at where links
went — 38 pages passed 11 checks each, on three browser engines, with four dead links each.
I noticed it reading a screenshot of the homepage's closing call to action, not from a test.

**What I did meanwhile:** wrote `astro/scripts/check-links.js`, which resolves every internal
link against what the build actually ships plus the 82 redirect rules, and wired it into
`npm run build`. The four above are listed by name so the build reports them on every run;
anything else fails the build. I proved it fails by injecting a bad link, because a gate that
cannot fail is the defect this project keeps re-learning. The list can only shrink.

**That checker had a false negative of its own, and it hid a fifth dead route.** It treated the
presence of a URL on the left-hand side of a `_redirects` rule as proof the link worked. But
`_redirects` carries

```
/tools/ppn-002-calculator/methodology   /tools/ppn-002-calculator/methodology/index.html   200
```

which is a **200 rewrite, not a redirect**: the browser is served that file directly. In the Astro
build that file did not exist, so the rule rewrote to nothing — a 404 linked from the footer of all
38 pages, passing a green check. A rule is not a destination. The checker now follows each rule's
destination recursively, and the same run that exposed this also confirmed nothing else was hiding
behind one. That route is now ported and ships, so the count is four, not five.

**What I need from you:** the content decisions in OA-05, OA-10 and OA-13 — or a decision to
drop those links from the nav and footer, which I can do without you but will not do silently,
since removing `/pricing` from the primary nav is a commercial choice rather than a technical one.

**`/cookie-preferences` is worse than a footer link, and I checked rather than assumed.** Measured
on the Astro build across five routes: **zero cookies, zero localStorage, zero sessionStorage and
zero third-party requests.** No analytics script exists in the Astro source at all, and there is no
consent banner component. So far so consistent.

The problem is `/cookies`, the Cookie Policy itself. It ships, it is in the footer of every page,
and it links to `/cookie-preferences` **three times** — including its closing "Manage preferences"
button, which is the page's primary action. It also describes a cookie banner, a preference centre,
and "12 cookies in total across the marketing site and the platform", on a site that currently sets
none and shows no banner.

At cutover that is a published compliance document whose main control is a 404. Note this is the
mirror image of OA-08 and much less severe: OA-08 is processing that happens and is not disclosed,
this is disclosure of a mechanism that is not there. It still should not ship.

**I can fix this one without you** once you confirm the direction, and there are only two:
either the Astro site gets analytics behind a consent banner (matching what `/cookies` already
says), or `/cookies` is rewritten to describe a site that sets no cookies and the preference
centre goes away. The second is accurate today and takes an hour. The first is a business
decision about whether you want analytics at cutover — **worth knowing that you would currently
launch the new site with no analytics of any kind**, which is a separate question from consent.

### OA-23 · A zone Cache Rule was overriding the HTML cache fix · P1 · infra · **FIXED 2026-08-02**

**Deploys are working. Cloudflare Pages is picking up commits.** That has been on the priority list
as a P0 and it is not one: the check run for today's push reads `Cloudflare Pages: success`, and a
cache-busted fetch of `/faq` returns the newly deployed byte. What is broken is the edge.

Measured on live, all clean URLs, minutes apart:

| URL | cf-cache-status | Age |
|---|---|---:|
| `/` | HIT | 3676 |
| `/faq` | HIT | 5611 |
| `/about` | HIT | 4777 |
| `/pricing` | HIT | 3676 |
| `/crowmark` | HIT | 3625 |

The origin asks for five minutes: `s-maxage=300`, `Surrogate-Control: max-age=300`, and
`CDN-Cache-Control: no-store`. The edge is holding pages for **an hour and a half**.

**Why the 2026-08-01 fix could never have worked.** `_headers` was changed that day to add
`CDN-Cache-Control: no-store`, after this exact symptom (`Age: 5261` on an `s-maxage=300`). That
was the right instinct and it cannot win. Per Cloudflare's documentation on Cache Rules:

> Edge Cache TTL Cache Rules override `s-maxage` and disable revalidation directives if present.
> When Origin Cache Control is enabled at Cloudflare, the original `Cache-Control` header passes
> downstream from our edge even if Edge Cache TTL overrides are present.

That is precisely the fingerprint here: the headers arrive at the client **untouched and correct**,
which is why the file looks right and the site behaves wrong. A Cache Rule set to *"Ignore
cache-control header and use this TTL"* (`edge_ttl.mode = override_origin`) ignores every origin
directive by design. No change to `_headers` in this repo can beat it — the fix is not in the code.

**FIXED via the Cloudflare dashboard in Chrome, on the owner's prompt.** I had recorded this as
dashboard-only because the Cloudflare MCP exposes Workers, KV, R2, D1 and docs but no zone or
Cache Rules tooling. It does not expose them; the browser does, and the owner asked why I had not
used it. Fair.

The rule was **"Cache all HTML on crowagent.ai"** — hostname equals crowagent.ai — with Edge TTL
set to **"Ignore cache-control header and use this TTL" = 2 hours**. That is
`edge_ttl.mode = override_origin`, and the measured `Age: 5611` sat exactly inside that 2-hour
window. Changed to **"Use cache-control header if present"**.

Verified on live immediately after saving:

| | before | after |
|---|---|---|
| `/` | HIT, Age 3676 | **Age 22** |
| `/faq` | HIT, Age 5611 | **BYPASS** |
| `/about` | HIT, Age 4777 | **REVALIDATED** |
| `/crowmark` | HIT, Age 3625 | **REVALIDATED** |

The edge now honours the origin's `s-maxage=300`. Deploys appear in minutes.

**This was the root cause of the standing P0** — "Cloudflare Pages is not picking up commits".
Pages was deploying correctly every time; the edge was serving HTML up to 90 minutes old, which is
indistinguishable from a failed deploy unless you check `Age` and `cf-cache-status`. The
2026-08-01 `_headers` fix could never have worked, because an Edge TTL override ignores origin
directives by design while still passing them downstream unchanged — which is why the file looked
right and the site behaved wrong.

**Why this matters beyond impatience:** it is why the P0 CSS incident looked like "Pages is not
picking up commits". A correct deploy plus a stale edge is indistinguishable from a failed deploy
unless you check `Age` and `cf-cache-status`. Anyone debugging the next one will lose the same
hours to the same illusion.

### OA-22 · The Lighthouse gate had failed 20 of its last 20 runs · P1 · CI · **CLOSED 2026-08-02**

Every push to `main` has been going red on Lighthouse CI, and the reason it gave was wrong.

**What was happening.** The workflow audited four URLs, one of which was `/csrd.html` — a page
removed with the CSRD Checker in the Core decommission. It 404s. Lighthouse aborted before
collecting a single score, and the failure step then printed:

> Lighthouse CI FAILED — scores below required thresholds
> Required: perf >= 90 (mobile), a11y = 100, SEO = 100

Three separate untruths in two lines. No score was measured, so nothing was below anything. Those
thresholds do not exist — `lighthouserc.json` asserts perf ≥ 0.30, a11y ≥ 0.95, best-practices
≥ 0.90, seo ≥ 0.95. And it says mobile where the config uses the **desktop** preset. Anyone acting
on that message would have gone looking for a performance regression that was never there.

58 of the last 100 runs passed, so this began recently and has been solidly red since.

**Fixed:** dead URL replaced with `/faq.html`; a pre-flight step that curls each target and fails
naming the URL and status; and a failure message that distinguishes "a score was below threshold"
from "Lighthouse could not load a page and measured nothing".

My first version of that pre-flight was itself wrong — a strict `200` test, when `serve` 301s
`/pricing.html` to `/pricing`, so it failed on four healthy pages. Caught locally before
committing. It now follows redirects, as Lighthouse does, and is verified to pass on the real
URLs and fail on the removed one.

**Now fully closed.** The gate went **green on the very next push** — the first success in at
least 20 runs — which produced the baseline the thresholds were always meant to be set from:

| URL | Perf | A11y | Best practices | SEO |
|---|---:|---:|---:|---:|
| `/faq` | 94 | 100 | 100 | 100 |
| `/` | 97 | 99 | 100 | 100 |
| `/contact` | 97 | 100 | 100 | 100 |
| `/pricing` | 98 | 100 | 100 | 100 |

Thresholds raised from measurement, each sitting below the worst observed score with headroom for
runner variance: **performance 0.30 → 0.85**, best-practices 0.90 → 0.95, seo and accessibility
held at 0.95. Performance keeps the widest margin because it is by far the noisiest metric on
shared CI hardware; accessibility stays a backstop because axe already gates that properly across
38 routes on three engines.

The failure message was updated in the same commit to quote the new numbers. Leaving it stale
would have recreated the exact defect this item is about — a gate whose message describes
thresholds it does not assert.

**No decision needed from you.** Flagged only so you know the number changed and why: CI can now
fail on a genuine performance regression, which it could not do before.

### OA-21 · GitHub reports 8 dependency vulnerabilities · P2 · security · **none are reachable**

GitHub warns on every push that this repo has "8 vulnerabilities (2 high)". I checked each rather
than either ignoring it or running `npm audit fix --force`, because the offered fix is
**astro 5.18.2 → 7.1.6, a two-major upgrade**, in the middle of a migration.

`npm audit` on the **root** package: **0 vulnerabilities**, dev included. All of it is in
`astro/`, and all eight advisories are against `astro` itself:

| Advisory | Needs |
|---|---|
| XSS in `define:vars` via incomplete `</script>` sanitisation | `define:vars` |
| Server island encrypted params replay | `server:defer` |
| Reflected XSS via unescaped slot name | `Astro.slots` + a server |
| Host header SSRF in prerendered error page fetch | a server |
| XSS via unescaped attribute names in spread props | `{...attrs}` |
| Reflected XSS via View Transition animation properties | `transition:*` |
| XSS via spread attribute names in `renderHTMLElement` | `{...attrs}` |
| XSS via `transition:*` on hydrated islands | `transition:*` + `client:*` |

Measured against this codebase:

```
output: 'static'      no adapter, and 0 files with prerender = false
define:vars           0 files          server:defer     0 files
transition:name|animate|persist  0     ViewTransitions/ClientRouter  0
client:* (hydrated islands)      0     Astro.slots      0
spread props {...}               0
```

**Every one of the eight needs a feature this site does not use, a runtime server this site does
not have, or both.** Cloudflare Pages serves pre-rendered files; there is no Astro process running
in production to attack. The build-time XSS advisories would require attacker-controlled content
entering the build, and the content is Markdown and `.astro` files in this repo — anyone who can
supply that already has commit access.

**Recommendation: do not take the major upgrade now.** It buys no security here and 5 → 7 across
two majors is exactly the kind of change that produces a subtle rendering regression during a
migration whose whole promise is zero regressions. Schedule it as its own piece of work after
cutover, with the full suite as the gate.

**What I need from you:** nothing urgent — but the GitHub banner will keep appearing, and it is
worth knowing it is not describing a live exposure so it does not get actioned in a hurry by
someone reading only the headline.

### OA-01 · 17 uncited claims on the homepage · P1 · **TWO BLOCKERS SOFTENED 2026-08-02**

You asked what exactly was needed here: for each claim, **either a source to cite or approval to
soften**. I cannot invent a source, so I took the option that is available to me and softened the
two that were blocking homepage sections 3 and 5. Softening only ever narrows a claim, so it
cannot overstate — the same direction taken on OA-10 and OA-13.

**Claim 1 — the uniqueness claim, stated twice.**

| Was | Now |
|---|---|
| "The only engine that sits on both sides" (h2) | "Supplier and authority, one rulebook" |
| "...and almost nothing else in this market does both" | "...the rubric an authority builds and the answer a supplier writes come from the same measures" |

Nothing true was lost, because the claim was never the substance. The section's own lede already
made the point in a defensible form — describing what the product does rather than ranking it
against every competitor — and the replacement foot line is the wording already published in the
lifecycle section. An absolute claim about a competitive market is the cheapest kind of sentence
for a rival to challenge, and it was carrying no weight the section did not already carry.

**Claim 2 — the 40/30/20% weightings.** These are not wrong; they were unlabelled. A source
comment called them "the published weighting breakdown" while naming no ITT, authority or
framework, and the section's eyebrow reads "Run the real engine" — so an illustrative split read
as a published figure. The engine is real and the trace is real; the contract is not.

Now captioned **"Illustrative award criteria for this worked example"**, which is exactly the
treatment you already approved on the hero. Numbers unchanged: their job is to give the trace
something to be scored against. Caption measured at 8.64:1 contrast, well past the 4.5:1 needed
at that size — a disclaimer nobody can read is not a disclaimer.

**Claim 3 — "£2.80 per £100"** needs no change on inspection. It appears in the demo marked
**"removed from draft"**: it is the untraced figure the engine rejects. Demonstrating a claim
being dropped is the opposite of asserting it. It now sits inside a block labelled illustrative,
which resolves the concern that it borrowed credibility from the cited National TOMs figures
beside it.

**This unblocks the port of homepage sections 3 and 5.**

**Still open: the other 14 claims**, none of which block a port. If you would rather cite than
soften on any of the three above, send the source and I will restore the stronger wording.

**Original finding, kept for the record:**

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

### OA-08 · Partner enquiries went to an UNDISCLOSED US processor · P0 · compliance · **DISCLOSED 2026-08-02**

**Fixed on your instruction.** Formspree is now named in the sub-processor list of both
`privacy.html` (live) and `astro/src/content/legal/privacy.md` (the port), stating exactly what it
receives — name, company, role, email, phone — that it is US-based, and that it is used only by the
Partners page while every other form posts first-party to CrowAgent. The international transfers
section already covers outside-UK transfers generically, so no change was needed there.

That makes the live notice **true**, which was the compliance gap. It does not remove the transfer.

**Still open, if you want it gone entirely:** routing partner enquiries first-party like the contact
form does. That needs an endpoint which does not exist — the platform has `api/contact/submit` but
nothing equivalent for partners, so it means a new route with rate limiting, Turnstile validation
and mail delivery, in the platform repo. Real work, and I will not fold it into a website change
without you asking for it. Say the word and I will scope it.

**Original finding, kept for the record:**

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

### OA-10 · integrations.html contradicted its own guarantee · P1 · **FIXED 2026-08-02**

**Fixed without waiting.** The hero read "Sign in with your work identity, read documents where
they live, and route alerts to your channels. **Read-only throughout.**" The absolute claim sat in
the same sentence as routing alerts out, and the same page offers exports and SMS further down.

The guarantee that actually matters is that we do not write into **your** systems, and the privacy
notice already makes exactly that promise, precisely, per connector: "never write back to your
ledger and never move money", "never change a setting in your tenant". The hero now matches:

> We read from the systems you connect and never write back to them.

Alerts, exports and SMS go outward to channels you configure; they are not writes into your
source systems. An absolute claim the same page contradicts is worth less than a narrower one
that holds. The meta and og descriptions were already correctly scoped ("pull bid documents
read-only from where your team keeps them") and are untouched.

Verified: 200 at 390 and 1440, no overflow, zero serious or critical axe violations, and the old
phrase no longer appears in the rendered text.

**If I have read your intent wrong** — if "read-only" was meant to cover outbound alerts too —
say so and I will restore a stronger claim with the alerts, exports and SMS sections reworded to
match. I chose the reading that made the page internally consistent.

**Original finding, kept for the record:**

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

### OA-13 · The roadmap stamped a quarter on work it calls uncommitted · P1 · **FIXED 2026-08-02**

**Fixed without waiting, in the direction that cannot overpromise.** Phase 3 carried the date pill
"Q4 2026" directly above the sentence "Early research, not yet committed engineering." A reader
takes the date and ignores the caveat, and the date is what gets quoted back. The pill now reads
**"No committed date"**.

I did not invent a convention — the page already sets the honest one further down: "Indicative
timing Q3 2026, subject to change", where the caveat travels with the number instead of being
stranded on the line below. Phases 1 and 2, which **are** committed, keep their quarters, and the
"Later / 2027" pill sits above "on the radar beyond the next twelve months", which is consistent.

Verified: 200 at 390 and 1440, no overflow, zero serious or critical axe violations, and the pill
holds one line (28px) at both widths.

**If you would rather keep Q4 2026**, the fix is to drop the "not yet committed engineering"
sentence instead — but only if that phase really is committed, because those two statements cannot
both stay.

**Original finding, kept for the record:**

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

### OA-17 · The published methodology described a calculator that does not exist · P1 · **RESOLVED 2026-08-02**

**Removed on your instruction — you were right that it was stale.** Verified against the engine
before cutting anything:

| On the page | In `lib/ppn002.ts` + the legacy engine |
|---|---:|
| NPV ×5, "Green Book" ×5, "3.5%", "discount" ×9 | **0** |
| "proxy value" ×16, £27,000/job, £8,460/apprenticeship | **0** |

Deleted: section 4 (proxy values), section 5 (NPV and the Green Book rate), section 6 (the
three-tier scoring window), the CrowMark screenshot whose caption claimed it showed "the same
deterministic engine", and the Green Book reference. Sections renumbered 1-6, all anchors resolve.

Replaced with a section that states the actual method. The page documented four methods that do not
exist while omitting the two equations that do — that was the heart of it.

**Also corrected, and easy to miss because none of it is visible on the page:** the meta
description, `og:description`, `twitter:description` and the `TechArticle` JSON-LD all ended
"...National TOMs proxy values and the Green Book discount rate". Those are what search engines
index. Plus PPN 002's date, given as "effective 24 February 2025" in three places against the
binding project fact of published 13 February 2025, mandatory 1 October 2025.

**And it unblocked the port.** The page is now on Astro at
`astro/src/pages/tools/ppn-002-calculator/methodology.astro`, taking the build from 37 routes to
38. The 10% figure is interpolated from the engine's own `FLOOR_PCT` constant, so the published
method cannot drift from the code again. Verified: 200 at 390/768/1440, one h1, no heading skips,
no overflow, zero serious or critical axe violations, and zero occurrences of any removed term.

**Original finding, kept for the record:**

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

### OA-18 · A sweeping claim about every competitor, dropped from the homepage port · P2 · content

Legacy homepage section 2, pane 4 ("Deliver") ends:

> "This is the ground every other bid tool has already ceded."

That is an unsourced claim about **every competitor in the market**. It is the same class as the
"Live, paid, and in daily use" line already stripped from five compare pages, and the same class as
OA-01's "the only engine that sits on both sides", which is why homepage sections 3 and 5 are not
ported at all.

**I dropped the sentence** rather than leaving the section unported. The pane's own first sentence
already makes the point in a defensible form — it describes what the product does after award,
rather than asserting what every rival does not — so nothing of substance is lost.

**If you want it back**, it needs something behind it: a named set of competitors and a checkable
statement about each, or a softer form ("most bid tools stop at submission" is arguable; "every
other bid tool has ceded this ground" is not). The legacy page is untouched and still carries it.

### OA-19 · A residual hero layout shift on the legacy site · P2 · performance

**Context:** the large shift is fixed. `/faq` measured **CLS 0.1072** — outside Google's 0.1
"good" threshold — because the breadcrumb was injected ~2s after first paint and pushed the page
down 60px. That is now rendered statically on 16 pages, and `/faq` measures **0.0421**, inside the
threshold. See the commit for the measurement.

**What is left, and why I stopped there.** A second, smaller shift remains at ~2.9s, inside the hero
itself:

```
DIV.absolute top-[-10%]     height 352 -> 329
DIV.absolute bottom-[-10%]  y 483 -> 461, height 307 -> 329
DIV.flex flex-wrap gap-4    y 517 -> 473   (the hero CTA row moves UP 44px)
```

The CTA row moving up 44px while two decorative backdrop layers resize suggests the hero's reveal
animation or a font swap settling, not a third-party insert. It is worth about 0.042 of CLS.

**Why this is logged rather than fixed:** the page now passes, and the remaining cause sits inside
the hero animation system — five interacting stylesheets, and the one area of the legacy site where
a careless change has previously produced invisible-content defects. The Astro replacement measures
**CLS 0 on every one of its 37 routes**, so this disappears at cutover regardless.

That sentence was previously here on the strength of four routes generalised to all of them. It is
now measured: `astro/scripts/measure-cwv.js` walks every route in the build under the same
Lighthouse mobile throttling used for every other performance figure in this repo, with a fresh
browser context per route so nothing inherits a warm cache.

The first sweep returned 36 routes at exactly 0 and `/compare/crowmark-vs-autogenai/` at 0.0222.
That single value did not reproduce: five isolated runs of that route measured 0 every time. The
sweep had been running alongside an `npm audit` on a 15.7 GB machine, and CPU contention under 4x
throttling is enough to produce a shift that the page does not otherwise have. Recorded because a
one-off number that disappears on re-measurement is worth knowing about before someone chases it.

LCP is measured by the same script but is **not** a pass criterion, and no LCP figure in this
document should be treated as one. Variance on this machine ran 2068-15056 ms for the same page
across runs. CLS is deterministic here; LCP is not.

If you want it chased before then, say so and I will; I did not think a further change to the legacy
hero was proportionate for 0.042 on a page that now passes.

**One page did NOT come inside the threshold: `/tools/ppn-002-calculator/`.** The breadcrumb fix
took it from 0.1744 to **0.1408**, which is still outside 0.1. Its remaining shift has a different
cause from the `/faq` one above, and I traced it rather than guessing:

```
t=  647ms   eyebrow 21   h1 22   chips 22
t= 5041ms   eyebrow 29   h1 75   chips 31
t=12631ms   eyebrow 29   h1 75   chips 72     <- +41px, the shift
```

The chip row under the hero heading reflows onto a second line once its styling settles, and pushes
everything below it down 41px.

I tested the obvious hypothesis before believing it. The page fetches four font files and preloads
none, while three other pages already preload the heading font, so a font swap looked likely. Adding
those two preloads changed CLS by **exactly nothing** — 0.1408 before, 0.1408 after, three runs each.
I reverted the experiment rather than ship a change that does not do what its comment would claim.

**Why this is logged rather than fixed:** the fix would be a reserved height on a chip row whose
settled height differs per breakpoint, hard-coded into a legacy hero that is being deleted. The same
page on Astro measures **CLS 0 and LCP 1600ms** against the legacy page's 0.1408 and 1904ms — both
inside Google's thresholds. The replacement already exists and is tested; shipping it is the fix.
This route is not among the five blocked ones, so it goes live with the cutover.

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

### OA-C3 · The 254 publicly-readable dev/source files · was P1 · **RESOLVED AND VERIFIED**

Previously logged, and recorded in a long note in `_redirects`, as: every tracked file under
`tests/`, `.dev-tools/`, `specs/` and `scripts/` was publicly readable on crowagent.ai, no
`_redirects` rule could gate it, and the only real fix was giving the Pages project a build output
directory instead of publishing the repo root.

**That fix was made and it works.** Re-verified 2026-08-02 against production, using cache-busting
query strings so every request reaches the origin rather than the CDN:

| Path | Status |
|---|---|
| `tests/smoke.spec.js` | 404 |
| `scripts/build-dist.js` | 404 |
| `specs/architecture/README.md` | 404 |
| `.dev-tools/shot-recipe-v2.json` | 404 |
| `package.json` | 404 |
| `OWNER-ACTIONS.md` | 404 |
| `migration/PERFORMANCE-MEASURED.md` | 404 |

**One residue, and it is cosmetic.** The bare `/styles.css` still answers 200 — 1.2 MB of legacy CSS
that no page references and the build deliberately excludes. It is a stale CDN cache entry, not an
origin file: the same URL with `?cb=...` returns 404. It expires on its own (`s-maxage=300`). A
dashboard purge only makes that immediate, so this needs nothing from you unless you want it gone
now.

The stale wording in `_redirects` has been corrected. A note asserting an exposure that no longer
exists is worse than no note — it sends the next reader chasing a resolved problem.



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

**38 of 42 real routes are on Astro.** Excludes dev/test files, `.partials/`, and the Google
verification file. Counted from `astro/dist`, not from memory.

| State | Routes |
|---|---|
| **Ported (38)** | `/`, about, contact, partners, faq, changelog, resources, crowmark, crowmark-buyers, security, privacy, terms, cookies, `/tools/` + the PPN 002 calculator and its methodology, `/blog/` + 8 posts, `/compare/` + 4, `/glossary/` + 2, `/sectors/` + 4 |
| **Not ported (4)** | pricing, integrations, roadmap, cookie-preferences |

All four remaining gaps are owner-blocked, not engineering-blocked — three on content-accuracy
decisions (OA-05, OA-10, OA-13), and `/cookie-preferences` because the Astro site sets zero cookies,
so there is nothing yet for it to manage. The methodology page left this list on 2026-08-02 once
OA-17 was resolved: its blocker was that it described a calculator that does not exist, and porting
it before fixing that would have carried the fabrication onto the new site.

`/partners` is built and tested but **must not go live** until OA-08 is resolved: the form posts
name, company, role, email and phone to a processor the privacy notice does not name.

The homepage is rebuilt apart from sections 3 and 5, which are gated on OA-01.
