# Reference brief — the Better Stack pages the owner named

Owner, 2026-08-02:
> "For products pages, use similar design like https://betterstack.com/log-management and
> https://betterstack.com/real-user-monitoring and must create similar quality of visuals from
> figma. And for our about page I still see a gap of visualisation, so check
> https://betterstack.com/enterprise and must design something similar from figma to use and add
> animation. Also we can adopt similar messaging like whom we build this for."

---

## Read this first: what I could and could not see

I fetched both pages, and the fetch **converts to markdown, which strips exactly the thing the
owner is pointing at.** Both came back reading as text-heavy pages with "no imagery, no diagrams,
no animation". That is almost certainly an artefact of the conversion, not the truth about the
pages — Better Stack is known for product-UI graphics and motion, and the owner is citing them
*because* of the visuals.

**So: the structural findings below are reliable. Any statement about their visuals is not, and
must be checked in a real browser before it is designed against.** Recording this rather than
letting a stripped fetch quietly become the brief, which is the same failure as trusting a search
summary for a citation.

---

## Structure, reliably observed

### `/enterprise` — the reference for our About page

1. Hero leading with **audience, not product**: "Designed for CTOs, loved by CFOs." Two
   stakeholders named in one line, each with their own concern.
2. A horizontal row of capability links, doing double duty as navigation and as a product map.
3. A primary value demonstration built on **one comparison table** carrying quantified,
   methodologically transparent figures ("assumes annual payments...").
4. Three standalone differentiation modules, each a short headline plus a benefit line, not a
   paragraph.
5. A consolidated trust layer: certifications grouped under one banner, positioned as table stakes
   rather than as a premium feature.
6. A closing CTA that **mirrors the opening**, bookending the page with the same offer.

**The pattern worth stealing:** *audience segmentation through headline language.* Each section is
addressed to a different decision-maker — cost, capability, compliance, deployment — so a reader
recognises themselves in one of them. That is precisely the owner's "whom we build this for".

**Our version of that** would be the two sides we already have: the supplier bidding, and the
authority evaluating. Both sides B2 already argues it; the About page does not.

### `/log-management` — the reference for our product pages

- Problem, then solution, then features.
- Hero pairs a headline with a comparison table.
- Three or four major capability blocks, each a benefit headline plus **80 to 120 words**, no more.
- Short benefit-focused headlines carrying the argument; supporting text one to three sentences.
- CTAs scattered inline throughout, then consolidated at the close.
- A guarantee at the end to reduce buyer risk.

**Copy density is the measurable takeaway: 80 to 120 words per major section.** Our homepage was
at 931 words and is now 248, so we are in the right territory; the product pages have not had that
treatment.

---

## How this maps to CrowAgent, and where it must not be copied

**Adopt:** the audience-first hero; sections addressed to a named reader; one strong quantified
artefact per page instead of scattered figures; capability blocks capped at ~100 words; a closing
CTA mirroring the opening.

**Do not adopt:**

- **The competitor comparison table.** Their entire hook is being 30x cheaper than named rivals.
  Ours is the opposite: we refuse comparative claims we cannot evidence, and a sweeping claim about
  every competitor was already removed from this site once (OA-18). We have four `/compare` pages
  that do this properly, one competitor at a time, with sourced statements.
- **Certification badges as earned credentials.** They hold SOC 2 Type 2 and ISO 27001. **We do
  not.** Our own footer says "We follow ISO 27001 controls. We are not certified yet", and that
  wording stays exactly as it is.
- **A money-back guarantee.** We have no paid self-serve product to guarantee.
- **Named customer logos.** We have no customers to name.

The quantified artefact in our hero is not a price comparison. It is the obligation itself:
**3 KPIs minimum (s.52, contracts over £5m), assessed every 12 months (s.71), 10% minimum
weighting (PPN 002)** — the numbers a reader is already held to, each citing statute.

---

## Before designing against this

Open both pages in a real browser at 1440 and 390 and capture them. Everything above about
sequence, density and audience framing holds. Everything about **how they look** is unverified,
and that is the half the owner actually asked for.
