# The wide ProofGate card: external research, patterns, and proposals

Written 2026-08-31. Subject: the 169px of dead space between the two paragraphs of the
wide card in `astro/src/components/sections/ProofGate.astro`, left by the access terms
moving to `FinalCta` on 2026-08-07.

Nothing in this file is a component or style change. It is research plus ranked options.

---

## 0. Method, and what was actually checked

Twenty pages were requested against live URLs. Sixteen returned content and are reported
below with what is genuinely on them. Three refused the fetch with HTTP 403 and are
reported as unchecked rather than guessed at. One returned 404.

- Fetched and read: stripe.com/gb, linear.app, vercel.com, anthropic.com,
  anthropic.com/transparency, datadoghq.com, sentry.io/welcome, snyk.io, checkr.com,
  alloy.com, middesk.com, tussell.com, stotles.com, autogenai.com, socialvalueportal.com,
  vanta.com, plaid.com, glean.com, harvey.ai, legora.com, kagi.com, proton.me,
  37signals.com, spendnetwork.com, legal.thomsonreuters.com CoCounsel.
- Refused with 403, so NOT described: withpersona.com and withpersona.com/platform,
  perplexity.ai/enterprise. Persona was one of the named targets. It is absent from the
  findings rather than filled in from memory.
- 404: stripe.com/en-gb/guides/atlas.

The repo side was read directly: `ProofGate.astro`, `index.astro`, `MarketShape.astro`,
`ReasoningTrace.astro`, `sources.astro`, `src/lib/tender-matrix.ts`,
`src/data/crowmark-screens.ts`, `src/data/footer.ts`,
`src/pages/tools/tender-compliance-matrix/index.astro`, and `scripts/check-budgets.js`.

---

## 1. What is on each site

### Stripe, https://stripe.com/gb

The credibility band is section 5, headed "The backbone of global commerce". It is four
numerals with captions, plus one static chart:

- "135+ currencies and payment methods supported"
- "US$1.9tn in payments volume processed in 2025"
- "99.999% historical uptime for Stripe services"
- "200M+ active subscriptions managed on Stripe Billing"

A second numeric band sits in the developer section: "500M+ API requests per day",
"10K+ API requests per second", "150K+ transactions per minute". Above both is a logo
carousel with no text at all (Amazon, Monzo, Nvidia, Uber, Figma, Anthropic). Named
platform executives are quoted lower down.

What makes it work in that position: every figure is one Stripe alone can produce, and
the unit is stated so the reader can tell what is being counted. Nothing is a ratio or a
percentage improvement over an unnamed baseline.

Honest here? No. CrowAgent has no volume, no uptime history worth printing, and no
subscription count. Any numeral in this position would have to be invented.

### Linear, https://linear.app

The trust band is three named quotations placed near the foot, after eight sections of
product screenshots. Gabriel Peal at OpenAI, Nik Koblov at Ramp, Kaz Nejatian at
Opendoor. It closes with one sentence and one numeral: "Linear powers over 40,000 product
teams. From ambitious startups to major enterprises."

What makes it work: the quotations are about craft rather than outcome, which matches the
argument the rest of the page makes. The single count arrives last, as a floor under the
quotations rather than as the argument itself.

Honest here? No. There are no customers to quote and no team count to print.

### Vercel, https://vercel.com

There is no separate credibility band. Credibility is welded into each of the three wide
product bands as one named customer plus one scale sentence: "Notion powers millions of
agent conversations daily on Vercel", "Zapier serves over 100 million monthly website
visits on Vercel", "Mintlify powers documentation for over 20,000 companies on Vercel".
No compliance strip, no logo wall.

What makes it work: the metric belongs to the customer, not to Vercel, so it is
attributable and checkable by asking that customer.

Honest here? No, for the same reason as Linear.

### Anthropic, https://www.anthropic.com

The rigour sections are text only. The hero is a single sentence: "AI research and
products that put safety at the frontier". A section reads "Anthropic is built on hard
questions". The values band is five cards that are each a category label, a title and a
link, pointing at Core Views on AI Safety, the Responsible Scaling Policy, the Economic
Index and Claude's Constitution.

This is the clearest example found of a rigour band that contains no metric, no logo and
no testimonial. It contains commitments and pointers to the documents that carry them.

### Anthropic Transparency Hub, https://www.anthropic.com/transparency

Three numbered cards at the top (Model Report, System Trust and Reporting, Voluntary
Commitments), then the widest band is a chronological list of model entries, each linking
to a full system card. Evidence appears as dated documents and named external testers
(Gray Swan, 10a Labs, ALICE) rather than as a summary claim.

What makes it work: the page does not ask to be believed. It hands over the artefact and
says where to check.

Honest here? Yes, in principle. CrowAgent has the equivalent artefact already, at
`/sources`.

### Datadog, https://www.datadoghq.com

Credibility is analyst recognition and volume of research. Top banner: "Datadog named a
Leader in the Gartner Magic Quadrant for Observability Platforms". Then "Thousands of
customers love and trust Datadog" over a logo carousel. Then a data report band: "State
of Postgres 2026", an analysis of "tens of thousands of production Postgres databases".

The report band is the interesting one. The credibility comes from having measured
something at scale and published it, not from a claim about the product.

Honest here? Not yet. There is no CrowAgent research corpus to point at.

### Sentry, https://sentry.io/welcome

Two devices. A logo wall of roughly 25 enterprise names directly under the hero. Then,
lower, a getting started band that is literal SDK installation commands for more than 20
languages, sitting in the widest content column.

Notable absence, and it was checked: no percentage claims anywhere. No "X% faster
debugging". Credibility rests on logos, three named quotations and product artefacts.

What makes the code band work: it is a real thing a reader can copy and run in thirty
seconds. It is the product's actual surface, printed on the marketing page.

Honest here? The pattern is honest. The specific device (a runnable snippet) has a
CrowAgent analogue in the free tool, discussed in the proposals.

### Snyk, https://snyk.io

Three analyst badges (Forrester Wave Leader 2024, Gartner Customers' Choice 2024, G2), a
logo carousel under "Trusted by the world's most innovative companies", five named
executive quotations, and a percentage row: "288% ROI", "80% Faster scan time", "75%
Faster remediation", "60% Faster remediation", "52% Reduced risk of a data breach".

The percentage row is the weakest thing found in the whole survey. No denominator, no
period, no methodology. It is exactly the shape of claim the CrowAgent card exists to
refuse.

Honest here? No, and it is worth naming as the anti pattern.

### Checkr, https://checkr.com

Relevant because the subject is accuracy of records. Claims are comparative and
quantified: "In head to head tests, Checkr finds more criminal records than other major
providers", "75% completion rate (v. the 48% mortgage industry average) with 99.95%
accuracy", "260M+ real identities mapped, covering 96% of US adults", "140K+ businesses
already run on Checkr". The footer carries two compliance marks (AB Seal, PBSA).

The coverage claim ("96% of US adults") is the one device here that is about the corpus
rather than about the product. That is the transferable idea.

Honest here? The coverage form is transferable only if CrowAgent can state a coverage
number it can defend. It cannot state one today.

### Alloy, https://www.alloy.com

The provenance device is a data partner wall: "Alloy's vendor neutral network gives you
access to 270+ partner solutions", with roughly 40 named provider logos (Equifax,
Experian, TransUnion, LexisNexis, Socure, Trulioo). Above it a three layer architecture
diagram (open data ecosystem, orchestration engine, actionable AI suite). Case study
percentages sit separately.

What makes it work: naming the sources is the argument. Vendor neutrality is proved by
showing many logos rather than by asserting independence.

Honest here? Partly. The equivalent named sources for CrowAgent are statutes and policy
notes rather than commercial vendors, and those need no permission. But rendering them as
a wall of marks is the idea the owner already rejected.

### Middesk, https://www.middesk.com

Middesk verifies businesses against government registries and deliberately does not name
them on the homepage. It states "400+ government and authoritative sources. Aggregated,
continuously refreshed, and structured into a single source of truth for every business",
and "sourced directly from the systems and sources regulators trust most". No named
registry, no source panel, no coverage map.

What makes it work, and it is a genuine finding: a count of sources plus a category noun
does the credibility job without the visual cost of a logo wall and without committing to
a list that will go stale.

Honest here? A count is available and true (the instruments enumerated on `/sources`),
but the count is small, and a small count stated as a boast reads worse than no count.

### Tussell, https://www.tussell.com

Direct UK adjacent competitor. Logo wall of 14 or more client names (Microsoft, Google,
AWS, Capita, Virgin Media O2, Oracle, Serco, BT, EY). Six named testimonials. A media
credibility band showing 11 news outlet logos with the claim "Our data has been harnessed
in over 1,900 news stories since 2018".

Checked and absent: no data source attribution, no methodology statement, no contract
count, no database size. A procurement data company publishes no provenance on its
homepage.

### Stotles, https://www.stotles.com

Direct UK competitor. Logo wall of 15 or more enterprise clients (Splunk, SAP, Palo Alto,
Salesforce, Workday, Vodafone, Cloudflare, Snowflake, Civica). Six inline UI screenshots.
One testimonial attributed to a role with no company named.

Coverage is stated only as "thousands of government portals". Find a Tender and Contracts
Finder are not named. No notice count, no update frequency, no methodology.

This matters for positioning. Both direct UK competitors compete on logos and leave
provenance blank. A provenance argument in this position is unoccupied ground in this
market.

### AutogenAI, https://autogenai.com

The closest competitor by function, and the most useful negative result in the survey.
300+ client logos, video testimonials from bid directors, six compliance certification
logos (GDPR, ISO, AICPA, Texas RAMP, SOC 2, Trusted Cloud Provider), three G2 award
badges, and an impact metric band:

- "70% Increase in Drafting Speed"
- "85% Increase in Productivity"
- "241% Increase in Success Rates"
- "100% Increase in Bids Submitted"

There is no accuracy band, no hallucination band, no citation mechanism and no evidence
claim anywhere on the homepage. A bid writing AI company whose category risk is fabricated
content publishes a 241% success rate increase and says nothing about grounding.

### Social Value Portal, https://socialvalueportal.com

Methodology is the brand. The TOM System is presented as "The UK standard for Social
Value measurement" with a trademark mark. Then "200+ public and private sector
organisations trust Social Value Portal" over a logo wall of councils and contractors, a
billions of pounds impact figure, three sector testimonials, and footer certification
badges (ISO 27001, B Corp, Cyber Essentials, G-Cloud).

The transferable device is the first one: a named, published, external framework raised
to the level of a brand mark. CrowAgent already cites National TOMs on `/sources`, with a
carefully limited claim ("an alignment to the conventions, not a full National TOMs
implementation").

### Vanta, https://www.vanta.com

The strongest instance of a framework strip: 35+ named standards (SOC 2, ISO 27001,
HIPAA, GDPR, HITRUST, NIST AI RMF, ISO 42001). Plus a live Trust Center artefact showing
real time posture, four statistics ("Trusted by 16,000+ customers", "2,000 hrs. saved
annually", "20% faster deal cycles", "Automated 93% of questionnaires"), a six company
logo marquee and four named case studies.

The framework strip is what the rejected "citation source chips" idea was reaching for.
The distinction worth holding on to is that Vanta's strip names the corpus the product
operates over, which is a different claim from naming the corpus it read.

### Plaid, https://plaid.com

Coverage as the credibility argument. "Access 12,000+ financial institutions and both
personal and business accounts across 20 countries", then a four stat row ("55% YoY
European customer growth", "99.99% uptime", "12,000+ financial institutions across 20
countries", "100M+ global users"). Regulatory identity is placed in the footer, naming
the two legal entities and PSD2 status.

The footer device is quietly interesting: legal identity as a trust signal, stated plainly
and checkable against a register.

### Glean, https://www.glean.com

A dedicated security and governance band with a real argument rather than only badges:
"Enterprise grade security. Users only see what they're allowed to see" and "Best in
class data governance. Built for compliance heavy environments", over six compliance
badges. A separate six item statistics strip follows (40+ LLMs, 110 hours saved annually,
93% adoption, 275+ integrations, 3B+ searches, 99.9%+ uptime).

The permissions sentence is the transferable one. It states a limit the product accepts,
in the reader's terms, in one line.

### Harvey, https://www.harvey.ai

Legal AI, where fabricated citations are the category risk. Checked specifically for a
grounding argument. There is none. The page carries 40+ client logos, three named
quotations, six compliance badges and four metrics: "25+ Average hours saved per month",
"200,000+ Professionals using Harvey", "2,400+ Law firms and in house legal teams", "70+
Countries", "75+ AmLaw 100 firms". No benchmark, no evaluation, no citation display, no
hallucination language.

### Legora, https://legora.com

Same category, same result. No trust, accuracy or citation section. One ROI figure ("30%
reported that Legora has reduced non billable hours") and a compliance banner (SOC 2, ISO
27001, GDPR, HIPAA).

### Thomson Reuters CoCounsel, https://legal.thomsonreuters.com/en/products/cocounsel

The exception, and the single most relevant page in the survey. The grounding argument is
the product argument, written in prose:

- "the only AI that reasons from authoritative Westlaw content, trusted Practical Law
  guidance, and your organization's knowledge"
- "Research built on real authority: Use the only legal AI grounded in Westlaw content,
  Practical Law guidance, and your firm's own documents, so your work reflects trusted
  authority"
- "a polished draft grounded in trusted content and prior matter context, with linked
  citations for verification"
- "every answer traceable back to its source"
- "every citation is linked so attorneys can click through and verify the work themselves"
- "Every step of the reasoning is visible as it works"

What makes it work in a wide band: it never claims the model is accurate. It claims the
corpus is authoritative and the citation is clickable, and it puts verification in the
reader's hands. That is the same move the CrowAgent card is making, made by a company
that owns the corpus it cites.

### Kagi, https://kagi.com

Positioning built on a refusal. It is delivered as plain prose repeated across sections
rather than as a pledge list or a diagram: "Search without ads, block invasive trackers,
and enjoy a noise free internet on your own terms", then "Most websites and search
engines track your clicks and serve ads instead of answers", then "Most 'free' services
track everything you do".

Structure of the device: name what everyone else does, then state what you do not do.
The contrast carries it. No numbers.

### Proton, https://proton.me

A refusal backed by four checkable facts rather than by badges. No ISO marks or audit
certificates on the homepage. Instead:

- "All our apps are open source and independently audited by security experts so that
  anyone can inspect them, use them, and trust them."
- "Our end to end encryption and zero access encryption mean that no one (not even
  Proton) has the technical means to access your data."
- Swiss jurisdiction, stated as a legal fact.
- The nonprofit Proton Foundation as primary shareholder, stated as a governance fact.

The second bullet is the strongest sentence found in the entire survey for this brief. It
converts a promise into an architectural impossibility, and it names itself as the party
that is constrained.

### 37signals, https://37signals.com

The negative space example. The page is 37 numbered principles, each a short phrase with
generous whitespace: "An obligation to independence", "We don't sell you", "Bury the
hustle", "Know no", "Planning is guessing", "Companies aren't families". No metrics, no
logos, no testimonials.

What makes it work: each statement is given room, so a phrase of four words reads as a
position rather than as a caption.

### Spend Network, https://spendnetwork.com

UK and global procurement data. Three metrics: "743 Unique sources", "420 Open
Opportunities", "160 Countries". A media logo band (FT, The Times, The Economist, BBC,
Guardian, Telegraph). And a named five step methodology: Harvest, Standardise, Enhance,
Validate, Publish.

The "743 Unique sources" figure is the Middesk device again, from a UK procurement
company. Of the four UK procurement or social value companies checked, this is the only
one that quantifies its corpus.

---

## 2. The patterns that recur, and where they sit

| Pattern | Seen on | Usual position | Present on this homepage already? |
| --- | --- | --- | --- |
| Numeric stat band (3 to 6 figures) | Stripe, Plaid, Snyk, Checkr, Harvey, Vanta, Alloy, Glean, Spend Network | Mid page, after the first product proof | Yes. `MarketShape` is section 3, directly below ProofGate, and prints £5m, 12, 10% |
| Logo wall | Stripe, Sentry, Datadog, Snyk, Tussell, Stotles, Harvey, AutogenAI | Immediately under the hero | No, and cannot be |
| Named testimonial | Linear, Sentry, Snyk, Stripe, Vanta, Stotles, Tussell | Late, before the closing call to action | No, and cannot be |
| Compliance or certification strip | AutogenAI, Legora, Harvey, Glean, Vanta, Social Value Portal | Late, near the footer | Partly, in the site footer, with an explicit "not certified yet" footnote |
| Corpus or framework strip (naming what the product reasons over) | Vanta, CoCounsel, Alloy, Social Value Portal | Beside the rigour argument | Related idea already rejected as chips or register marks |
| Source count without naming sources | Middesk ("400+"), Spend Network ("743") | Inside the provenance band | No |
| Published methodology as named steps | Spend Network, Social Value Portal | Mid page | Yes. `HowItRuns` is a five stage flow |
| Inline product artefact or runnable sample | Sentry, Linear, Glean, Stotles | Mid page, widest column | Yes. `ProductScreens` and `ReasoningTrace` |
| Linked, clickable verification of every claim | CoCounsel, Anthropic Transparency Hub | Inside the accuracy argument | Yes as a destination, `/sources`, but the homepage links it only from `MarketShape` |
| Refusal or constraint stated as a standing position | Kagi, Proton, 37signals, Glean permissions line, Anthropic values band | Hero adjacent or as its own band | No. The card states a refusal instance, not a standing position |
| Architectural impossibility ("not even we can") | Proton | Inside the privacy argument | No |

Two observations that bear on the choice.

First, six of the eleven patterns are already spent elsewhere on this page, and two of the
remaining five are unavailable for honesty reasons. The field is narrower than it looks.

Second, of the four direct or adjacent UK competitors checked (Tussell, Stotles,
AutogenAI, Social Value Portal), three publish no provenance argument at all and the
fourth publishes a framework brand. AutogenAI, the closest by function, publishes a 241%
success rate claim and nothing about grounding. A standing position on what the engine
will not do is unoccupied in this market.

---

## 3. What CrowAgent actually has

Verified by reading the files.

- **A provenance page with real instruments.** `astro/src/pages/sources.astro` carries
  Procurement Act 2023 s.52 and s.71 with in force dates and clause summaries, PPN 026,
  Directive 2014/24/EU Articles 67 and 70, and National TOMs, each with a publisher and a
  legislation.gov.uk or eur-lex URL.
- **A map of every homepage numeral to what it rests on.** `HOMEPAGE_MAP` in the same
  file, including the two illustrative reasoning trace figures explicitly marked as not
  National TOMs proxy values.
- **A working rule engine.** `astro/src/lib/tender-matrix.ts`, 1,473 lines, shipping as a
  route island.
- **A free tool that publishes its own rules.** `astro/src/pages/tools/tender-compliance-matrix/index.astro`.
  `RULES` at line 103 prints the detection rules verbatim. Page copy states "Nothing is
  uploaded, nothing is sent anywhere, and there is no sign up" and "It sends nothing
  anywhere. The text is read in your browser. There is no account, no email gate and no
  request to any server."
- **In product refusal text, already published.** `src/data/crowmark-screens.ts` and
  `ProductScreens.astro` line 133 both carry "This is FIT context. It is not a probability
  of award, and CrowMark does not produce one."
- **Sixteen drawn product screens** with alt text and captions governed by three rules,
  including a standing ban on win rates and probability of award.
- **A footer trust row that already refuses an unbacked badge.** `src/data/footer.ts`
  lists five checkable claims and the note "* We follow ISO 27001 controls. We are not
  certified yet." The same file records that GDPR compliant was deleted because it was
  "checkable against nothing".

Things the site does not have, checked rather than assumed: no certifications, no
customer logos with permission, no testimonials, no published win rate, no live metric
computable at build time, and no public status page on this domain (the footer status link
points at the external `status.crowagent.ai`).

### The byte constraint, measured

`astro/scripts/check-budgets.js` sets `htmlPerRoute: 100 * KB`, which is 102,400 bytes.
The built `dist/index.html` on disk at the time of writing is 104,270 bytes, so 1,870
bytes over. The brief states 3,447 bytes over, which is a newer local build, so treat the
overage as between 1.9 KB and 3.5 KB and rising.

Calibration for the estimates below: the entire existing wide card, from the eyebrow to
the start of the gate card, renders as 789 bytes of `dist` HTML. Each element also carries
roughly 16 bytes of scoped class (`astro-s37exqcv`). So around 55 words of prose in two
elements costs roughly 400 to 450 bytes. Nothing proposed here is free, and the route is
already over. Every proposal below should be read as needing either a paired removal
elsewhere on the route or an owner decision on the budget.

---

## 4. Proposals, ranked by fit to the argument

### 1. The standing refusal: three things the engine will not do

**What it is.** A short block under the second paragraph. An eyebrow or small label, then
three one line statements of what CrowAgent does not produce, each already true and
already enforced in the product. Drawn from published repo text rather than written fresh:

- It does not produce a win rate or a probability of award.
- It does not price a commitment that has not been confirmed.
- It does not sign off its own answer. A named person approves before anything leaves.

**Pattern it draws on.** 37signals, where a four word phrase given whitespace reads as a
position. Kagi, where the refusal is the positioning and is stated as plain prose. Proton,
where the constraint names the constrained party. Glean's permissions line, which states a
limit in the reader's terms in one sentence.

**Why it suits this card.** The heading is "The engine that refuses to make things up."
Today the card asserts that and then changes the subject to market neutrality. The narrow
card beside it shows one refusal happening. Neither states the standing policy. A policy
is a different object from an instance, so this does not duplicate the gate card, the
`ReasoningTrace` ledger or the `HowItRuns` stage list. It is also the pattern the four
competitors checked have all left vacant.

**Built from existing material?** Entirely. Every line already exists in the tree.
"Not a probability of award, and CrowMark does not produce one" is in
`ProductScreens.astro` line 133 and in `crowmark-screens.ts`. "Every pound and every
percentage in a CrowAgent answer is computed from a commitment you have confirmed" is in
this card's own twin. "The engine cannot clear its own gate. A named person approves"
already renders in the section immediately above ProofGate in `dist`. No new asset, no new
fact, no new claim.

**Bytes.** Three short list items plus a label, roughly 380 to 500 bytes of HTML. Styling
would reuse `.meta` and existing rhythm rather than adding a recipe.

**Honesty check.** It claims nothing new. It does not claim accuracy, does not claim the
model never errs, does not claim certification, does not name a customer, and does not
print a number. Its only risk is that a reader treats it as a guarantee about model
output, which the third line pre empts by naming the human approval step. If any one of
the three lines ever stops being true in the product, the line comes off the page, and
that dependency should be written into the component comment.

### 2. Quote the product refusing itself

**What it is.** One short quotation block carrying the sentence the CrowMark interface
prints at the point of decision, attributed to the product surface rather than to a
person: "This is FIT context. It is not a probability of award, and CrowMark does not
produce one." One line of attribution beneath, naming the screen it appears on.

**Pattern it draws on.** The named quotation band (Linear, Sentry, Snyk, Stripe), with the
speaker replaced. And CoCounsel, whose accuracy argument is carried entirely by quoted
product behaviour rather than by a metric.

**Why it suits this card.** It is the strongest available answer to the question a
sceptical reader asks at this exact point, which is whether the refusal survives contact
with a commercial incentive. A win probability is the single most saleable number this
category could print, AutogenAI prints 241%, and CrowMark's own interface says it will not
produce one. The proof is that the refusal is already built into the shipped surface.

**Built from existing material?** Yes, verbatim, from two files. The attribution line can
name the bid or no bid screen, which is already published on this site inside
`ProductScreens`.

**Bytes.** A blockquote and a caption, roughly 300 to 400 bytes.

**Honesty check.** It does not claim a customer said it, does not claim an outcome, and
does not claim the screen is a photograph of a live system. The one hazard is rule 1 in
`crowmark-screens.ts`: nothing may imply the drawn screens are the live product. The
attribution must therefore name the screen, not a session, and must not use the words
screenshot, live or customer. Written that way it is compliant. Written loosely it breaks
a standing rule, so the wording is load bearing.

### 3. Hand the reader something to check

**What it is.** One sentence and one link closing the card, offering the reader the means
to test the claim rather than more claim. The free Tender Compliance Matrix reads a
tender the reader pastes, returns each requirement with the line it was read from, and
publishes its own detection rules on the same page. No account, no email gate, nothing
sent to a server.

**Pattern it draws on.** Sentry, whose widest band is a runnable installation command
rather than an assertion. Proton, "anyone can inspect them". Anthropic's Transparency Hub,
which answers a rigour question by handing over the document. CoCounsel, "so attorneys can
click through and verify the work themselves".

**Why it suits this card.** A card headed with a refusal to invent is the natural place to
say the claim is testable now, without a sales conversation. It also converts the section
from assertion to invitation at the exact point the reader is most sceptical.

**Built from existing material?** Entirely. The tool is live, the no account and no
upload facts are already published on its own page, and the rule list is already printed
there.

**Bytes.** One sentence and one anchor, roughly 200 to 260 bytes. The cheapest of the
four.

**Honesty check.** It claims only what the tool page already claims and what the code
does. It does not claim the tool is the product, does not claim accuracy, and does not
gate anything. Two real objections. First, `FinalCta` already links the same tool with
"Read a tender, free", so this is the second link to one destination on the route, which
the repo has previously argued against on the grounds that a duplicated call to action is
a choice with no consequence. The defence is that these are different acts, one is the
ask and one is the evidence, but that is a judgement for the owner rather than a settled
point. Second, on its own it fills less than 169px, so it works best as the closing line
of proposal 1 rather than as the whole answer.

### 4. The page audits its own numbers

**What it is.** A compact statement that every figure printed on this homepage is mapped
to the instrument it rests on, with the two illustrative figures marked as illustrative,
and that the map is published. Two or three lines of prose, ending at `/sources#homepage`.

**Pattern it draws on.** The Anthropic Transparency Hub, which presents commitments as
dated documents rather than as summary claims. CoCounsel's "every answer traceable back to
its source". Middesk and Spend Network, which quantify the corpus rather than describing
it.

**Why it suits this card.** `HOMEPAGE_MAP` in `sources.astro` is a genuinely unusual
artefact. It lists £5m, 12, 10%, £27,000 and £108,000, and it marks the last two as
illustrative placeholders that are explicitly not National TOMs proxy values. Publishing a
self audit that names your own illustrative figures is a stronger proof of the card's
heading than any adjective could be, and none of the four UK competitors does anything
like it.

**Built from existing material?** Entirely, and the destination page already exists.

**Bytes.** Two or three lines plus an anchor, roughly 280 to 380 bytes.

**Honesty check.** It claims nothing that the destination does not already carry. Two
caveats stated plainly. The map is complete as of the last audit rather than by
construction, so the sentence must say the figures are mapped and not that they are
"automatically verified", because no gate enforces that today. And `MarketShape`, the very
next section, already closes with "Every figure, sourced" pointing at the same anchor.
Two links to `/sources#homepage` within one screen is real repetition. That is why this
ranks fourth despite being the closest match to what the repo already believes about
itself.

### Recommended combination

Proposal 1 as the block, closing with proposal 3's single sentence. That is one strong
idea plus one line, roughly 600 to 750 bytes, and it fills the space with a position
rather than with furniture. Proposal 2 is the alternative if a quoted voice is preferred
to a list. Proposals 1 and 2 should not both ship, because both put the same refusal in
the same card twice.

---

## 5. Rejected, and why

**Anything requiring a fabricated number.** Every metric band found (Stripe, Plaid, Snyk,
Checkr, Harvey, Vanta, Alloy, Glean, Spend Network, AutogenAI) rests on a figure the
company measures. CrowAgent has no volume, uptime, customer count, accuracy rate, time
saved figure or win rate it can produce. Snyk's "288% ROI" and AutogenAI's "241% Increase
in Success Rates" are the exact shape this card exists to refuse, and printing one under
the heading "The engine that refuses to make things up" would be self refuting. Rejected
outright rather than proposed with a caveat.

**A logo wall.** The most common device in the survey and unavailable twice over. There
are no permissioned customer logos, and both direct UK competitors are already doing it
with real customers, so a thin wall would lose the comparison it invited.

**A testimonial.** No named customer quotation exists. Fabricating or paraphrasing one is
out of scope of anything this site may do.

**A certification or compliance strip.** AutogenAI shows six marks, Harvey six, Glean six,
Legora four. CrowAgent holds none of them. `src/data/footer.ts` records the decision in
terms that settle this: "GDPR compliant" was deleted from the footer because it was
"checkable against nothing", and the same file quotes `Integrations.astro`, "Cyber
Essentials, ISO 27001, SOC 2, a GDPR mark, and this company holds none of them. The
owner's instruction is that an unbacked badge is WORSE." A strip in the most prominent
card on the site would be a larger version of the badge that was already removed from the
footer.

**A live or near live metric.** Stripe's 99.999% and Plaid's 99.99% are computed from
systems those companies run. This is a static Cloudflare build with a zero JavaScript
budget of consequence and a public status page on a different host. There is no number
this page can compute at build time that is worth printing.

**A count of sources, in the Middesk or Spend Network form.** Honest and available, since
`/sources` enumerates them. Rejected on strength rather than honesty. Middesk says 400+
and Spend Network says 743. CrowAgent's defensible count is six instruments. A small
number stated as a boast invites the comparison and loses it, and the value of those six
is that they are the right ones rather than that there are many.

**A methodology ladder in the Spend Network form (Harvest, Standardise, Enhance, Validate,
Publish).** Honest, and it would fill the space well. Rejected as duplication. `HowItRuns`
is a five stage flow on the same page, and `index.astro` already records that three
consecutive five item sequences was a measured defect fixed on 2026-08-07 by reordering
the sections. Adding a fourth five item sequence directly reopens a closed defect.

**A product screenshot in the gap.** `ProductScreens` carries all sixteen drawn screens
lower on the same page, so it duplicates. It also fails the byte test on its own terms:
`singleImage` allows up to 250 KB and the route is already over its 100 KB HTML budget, so
this is the most expensive option available for a duplicated argument.

**An animated diagram.** `ReasoningTrace` already carries the page's one animated
argument, and its own file records the cost of that decision at length. A second animated
object in the section above it competes with the one that is load bearing.

**Closing the gap by rebalancing the two cards.** Already rejected by the owner and not
re proposed. Noted only to separate it from the 37signals finding, which is not a
rebalance. 37signals gives a short statement room deliberately, which means occupying the
space with something small, not removing the space.

**Citation source chips, and naming the two UK registers as marks.** Already rejected by
the owner and not re proposed. Recorded here because the Vanta framework strip and the
Alloy data partner wall are the industry form of that idea, so the rejection has closed
off the single most common way this position is filled by comparable companies. Proposals
1, 2 and 4 are the three routes found that reach the same credibility without rendering
the corpus as a row of marks.

**Persona, and Perplexity Enterprise.** Both refused the fetch with HTTP 403. Neither is
described anywhere above. If the owner wants Persona specifically, it needs a browser
session rather than a fetch.
