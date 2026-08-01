# BETA MODE — where the beta message lives, and where it must never live

**Rewritten 2026-07-30.** The previous version of this file described a `BETA_MODE`
flag in `js/nav-inject.js` as "the whole mechanism", and called itself "the complete
revert checklist". That flag no longer exists and the mechanism it described has been
deliberately removed. Read this file, not the old version, for the current position.

---

## 1. The rule (owner directive, 2026-07-30)

> The website must not show itself as being in beta. The beta message must appear
> only if a user tries to log in.

Two surfaces, and only one of them carries beta language:

| Surface | Beta language? | Why |
|---|---|---|
| `crowagent.ai` (this repo, the marketing site) | **NO** | A visitor evaluating the product is not applying for access. Branding the product beta on every page devalues it, and it was reaching search results too. |
| `app.crowagent.ai` (the platform) at sign-in / sign-up | **YES** | This is the moment access actually matters, and the honest answer to "why can't I get in" is that access is invitation-only. |

The marketing site's job is to sell the product and route an interested visitor to
`Request access`. The explanation of *why* it is request-access rather than
self-serve belongs at the point of the request, not on every page.

---

## 2. Where the message lives now (verified in `crowagent-platform`, not assumed)

Nothing needed adding on the platform side. It was already correct:

- `web/app/(auth)/login/actions.ts:273` — an existing account not on the whitelist
  tries to log in: *"CrowAgent is currently in invitation-only private beta. Your
  account isn't on the beta list yet..."*
- `web/app/(auth)/login/actions.ts:630` — sign-up rejected: *"CrowAgent is currently
  invitation-only. This email isn't on the beta whitelist..."*
- `web/app/(auth)/auth/callback/route.ts:297` — Google/Microsoft OAuth is gated too;
  a new OAuth user without a valid invite has their orphan auth user deleted and is
  redirected to `/login?error=beta_invite_required`.
- `web/app/(auth)/login/LoginPanels.tsx:159` — renders that error on the page.
- `web/app/(auth)/auth/invite-required/page.tsx` — a dedicated invite-required page.

**The gate is hardcoded, not flagged.** It is enforced server-side against the
`beta_invites` table. Reopening self-serve signup at GA needs a code change in those
files; it cannot be switched off by config, and equally cannot be switched off by
accident.

---

## 3. What was removed from the website on 2026-07-30

### 3.1 The site-wide announcement bar, and the `BETA_MODE` flag with it

A dismissible ribbon injected above the nav on all 44 pages from `js/nav-inject.js`,
reading *"Private beta · Access is invitation-only"*. First element on the page,
above the logo, on the pricing page and on every blog post.

**The flag was deleted rather than set to `false`, and that matters.** Setting it to
`false` would have swapped in the `ANNOUNCE_LIVE` variant defined right beside it:

> Now live · 14-day free trial · No credit card required — **Start free trial** →
> `app.crowagent.ai/signup`

Signup is gated server-side (section 2). That bar would have promised self-serve
access the product refuses on submit, dead-ending every visitor who believed it.
There was no correct value for the flag and no honest content for the bar, so the
bar, both variants, the flag and the injector call are all gone. Nothing dead was
left behind.

**To add an announcement bar back at GA:** write one in `js/nav-inject.js` and call
it from `injectNavOnly()`. Do not restore the beta variant. Both old variants are in
the history of the commit that removed them.

### 3.2 `crowmark.html`

- `<title>`, `og:title`, `twitter:title` dropped "(Beta)". This was the worst
  instance: it showed in Google results and in the browser tab, so a searcher saw
  the product labelled beta before reaching the site at all.
- JSON-LD `"releaseNotes":"CrowMark is in beta."` deleted, and the description no
  longer opens "UK bid suite in beta.". Answer engines were reading both.
- The `01C` beta-notice section band removed.
- FAQ entry 1 rewritten from *What does "beta" mean for CrowMark?* to *Is everything
  described on this page available today?*, in the visible FAQ **and** in the
  FAQPage JSON-LD. The substantive claim survives; the framing does not.
- CTA labels: "Request beta access" → "Request access".
- Final CTA subhead → "Live, paid, and in daily use on real bids."

### 3.3 Dead status-badge CSS

`.ca-badge-beta` and `.ca-badge-dev` plus four supporting rules, about 1.1KB
injected into every page on every load. Measured: zero occurrences of either class
in any HTML. They were added on 2026-07-19 for a per-product badge pass that was
then reversed, on the correct grounds that beta is a platform state and not a
CrowMark property; the markup went and the CSS stayed. `.ca-badge-beta` cannot come
back regardless: a violet BETA pill next to a product name is exactly the pattern
this directive removes. `.ca-devnote` is unaffected and still defined.

### 3.4 Per-page copy

The remaining visible instances across ~28 pages: "Invitation-only while we are in
private beta", "currently in beta and in daily use on real bids", "Platform Beta
LIVE", the FAQ answer on `faq.html` and its JSON-LD twin, and the contact form's
"Private beta: request access" option label.

---

## 4. What must NOT change — wire values

**Every `?enquiry=beta-access` query string and every `value="beta-access"` stays.**

These are wire values, not copy. `scripts.js` reads `enquiry=beta-access` to
preselect the contact form's subject and seed the message body, and the value is
submitted to the platform contact endpoint. The **visible labels** on those links
have never said "beta" — they say "Request access". Renaming the value would break
the prefill for no visitor-facing benefit.

### Why the access CTA is not a `mailto:` (2026-07-20, still binding)

It originally was, and that was a defect. A `mailto:` only resolves if the visitor
has a registered desktop mail handler; on webmail (Gmail / Outlook-web, i.e. most of
the SME audience) the click silently does nothing at all. On a fully gated private
beta that CTA is the *only* way in, so the funnel dead-ended for a large share of
visitors with no error and no signal. It now deep-links to `/contact`, which posts
to the Turnstile-protected `app.crowagent.ai/api/contact/submit` endpoint and
delivers over Brevo. The contact page still exposes `hello@crowagent.ai` as a
visible mailto for anyone who prefers their own client. **Do not revert this to a
bare mailto.**

---

## 5. Deliberately unchanged

- **Trial language** ("14-day free trial", "no credit card required", "cancel
  anytime"). The owner confirmed the trial applies once access is granted, so these
  remain accurate for an invited user.
- **Prices.** Beta is about access, not pricing.
- **`platform_access_locks` is built but inactive** (every scope `locked = false` in
  production). It is the mechanism that would block *existing* non-whitelisted
  accounts from logging in. Today, because it is off, an existing account can still
  log in even if it is not on the whitelist. If "only approved people can use the app
  at all" is the intent, set `scope='global'` to `true`.
- **`/signup` still renders a working form.** The rejection happens on submit, not
  before. That is now the *only* place a visitor learns access is gated, which is
  exactly what the directive asks for.

---

## 6. Held for go-live, confirmed by the owner 2026-07-20

Three things are deliberately absent from the site and must land together, not
piecemeal. None is affected by the beta-copy change above.

### 6.1 AI credit allowances — HOLD
No credit figure appears anywhere on the site. The metering ledger does not exist in
the platform yet (`PRICING-AND-PACKAGING-2026-07.md` §9.1, gaps I-1 to I-9), so any
published allowance would be a commitment we cannot count. That is the same defect
as the advertised "25 bids/month", whose downgrade guard queries
`crowmark_evaluations`, a table that does not exist in production, and therefore
always passes.

**Release when:** the meter is live AND one real billing cycle has been observed.
**Then publish:** the allowances from §3.4 and the "What's an AI credit?" section
from §9.2.

### 6.2 CrowMark Free and CrowCash Free cards — HOLD
Both tiers exist in code but are unpublished. They must ship in the SAME change as
the corrected allowances, because the ladder is currently inverted: free CrowMark
gets 30 AI generations a month while the 402 copy offers "Starter for 10 per month".
Publishing the free card first would advertise a free tier more generous than the
paid one.

### 6.3 Bid/no-bid FIT and AI bid marking — HOLD
Built and tested, not deployed. They exist only on the unpushed branch
`chore/brand-pack-and-h1-marking` and no customer can reach either. Until the owner
confirms they are live in production they must not appear as a capability anywhere on
the site. **Note the conflict for whoever picks this up:** the pricing document's
§5.1 feature matrix lists both as included at Starter, while §9.1 and the code say
they are unreachable. The code is right. Do not resolve this from the matrix alone.

Related open item: `crowmark.html` still carries an unresolved `<!-- REVIEW: -->`
asking whether these two should be shown publicly as "not yet available". Answering
it needs real capability copy from product, and AI bid marking must be framed as
FIT/coverage, never as win-probability.
