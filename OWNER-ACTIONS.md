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
