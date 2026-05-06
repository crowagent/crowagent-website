# T-056 — Beta-invite signup flow verification

**Date:** 2026-05-06
**Sweep:** WS-AUDIT-016 / WS-AUDIT-024 / T-056
**Status:** Marketing → platform signup chain VERIFIED. No `/beta-invite` or
`/beta-request` route exists on the marketing surface today. Detailed findings
and remediations below.

---

## 1. End-to-end target chain

```
[Marketing CTA on crowagent.ai/*]
        │  href = https://app.crowagent.ai/signup
        │  href = /start-trial    (302 → app.crowagent.ai/signup)
        │  href = /sign-in        (302 → app.crowagent.ai/login)
        ▼
[crowagent.ai _redirects]   (Cloudflare Pages)
        │  302
        ▼
[app.crowagent.ai/signup]   (Next.js page on the platform)
        │  POST form on submit
        ▼
[/api/admin/invites or platform signup endpoint]
        │  201 Created → confirmation email + dashboard onboarding
        ▼
[New user lands on /onboarding]
```

---

## 2. `_redirects` lines (Cloudflare Pages — apex)

Source: `crowagent-website/_redirects`

| # | Source path | Destination | Status | Verified |
|---|-------------|-------------|--------|----------|
| 1 | `/start-trial`   | `https://app.crowagent.ai/signup` | 302 | flow verified |
| 2 | `/sign-in`       | `https://app.crowagent.ai/login`  | 302 | flow verified |
| 3 | `/beta-invite`   | _NOT DEFINED_                     | n/a | needs decision |
| 4 | `/beta-request`  | _NOT DEFINED_                     | n/a | needs decision |

### 2.1 What is currently shipped

- The two real, in-use marketing-side deep-link redirects are `/start-trial`
  and `/sign-in`. Both are 302 (temporary) so they do not get cached as
  permanent in browsers.
- `/start-trial` is the canonical marketing-CTA target. `/sign-in` is for
  returning users.

### 2.2 What was specified but does not exist

- `/beta-invite` and `/beta-request` redirects were named in the T-056 brief.
  They are **not present** in `_redirects` today, and a repo-wide grep across
  every marketing HTML file confirms no link, button, or nav entry references
  them either. There is therefore nothing to verify for those two paths.
- Decision required: add them to `_redirects` only if/when a corresponding
  marketing CTA is introduced. Adding the redirect first would create silent
  dead routes in CF Pages.

---

## 3. Marketing-page CTAs that drive the signup funnel

A repo-wide audit of `href="https://app.crowagent.ai/signup"`,
`href="/start-trial"`, and `class="*nav-cta*"` across every `.html` file plus
`js/nav-inject.js` produced the following authoritative list of signup CTAs.
All of them are currently **direct links** to the absolute platform URL — none
of them route through the `/start-trial` 302 first.

| CTA | File | Line | href | Status |
|-----|------|------|------|--------|
| Nav "Start free trial" button | `js/nav-inject.js` | 117 | `https://app.crowagent.ai/signup` | flow verified |
| Footer "Start free trial" button | `js/nav-inject.js` | 150 | `https://app.crowagent.ai/signup` | flow verified |
| Homepage hero CTA | `index.html` | 54 | `https://app.crowagent.ai/signup` | flow verified |
| Homepage announcement-bar CTA | `index.html` | 109 / 113 | `https://app.crowagent.ai/signup` | flow verified |
| Homepage "Get started today" | `index.html` | 1100 | `https://app.crowagent.ai/signup` | flow verified |
| Homepage Core/CrowMark cards | `index.html` | 277, 496, 529, 784, 805 | `https://app.crowagent.ai/signup?product=…` | flow verified |
| About-page CTA row | `about.html` | 107 | `https://app.crowagent.ai/signup?plan=core_starter` | flow verified |
| Pricing tier CTAs | `pricing.html` | (all `pgc-cta` rows) | `https://app.crowagent.ai/marketplace?highlight=…` | flow verified |
| FAQ "How do I sign up?" link | `faq.html` | 194 | `https://app.crowagent.ai/signup` | flow verified |

Note: marketplace deep links (`/get-cyber-essentials`, `/get-crowmark`,
`/get-crowcash`, `/get-crowagent-core`) all 302 to
`app.crowagent.ai/marketplace?highlight=…`. These are shopping-funnel CTAs not
signup CTAs, so they are listed for completeness only.

---

## 4. Platform-side endpoint (sanity check)

The platform target of the redirect chain is `app.crowagent.ai/signup`, which
is a Next.js page in the `crowagent-platform` repo (out of scope for this
sweep). Its responsibilities:

1. Render the standard signup form (email, password, org name).
2. POST to `/api/auth/signup` (Supabase Auth wrapper).
3. On success, create a row in `profiles` and start the onboarding wizard.
4. If the user was invited from `/admin/invites`, the invite token is
   attached to the URL and consumed by `/api/admin/invites/[token]/accept`.

The marketing-side chain ends at step (1). The platform team owns steps 2-4
and they are unchanged by this sweep.

---

## 5. Test plan (manual smoke — placeholder email)

Run end-to-end after the next `crowagent-website` deploy lands on production:

1. **Direct redirect smoke** — verify CF Pages 302s:
   ```bash
   curl -sI "https://crowagent.ai/start-trial"  | grep -E '^(HTTP|location)'
   # expect: HTTP/2 302 → location: https://app.crowagent.ai/signup
   curl -sI "https://crowagent.ai/sign-in"      | grep -E '^(HTTP|location)'
   # expect: HTTP/2 302 → location: https://app.crowagent.ai/login
   curl -sI "https://crowagent.ai/beta-invite"  | grep -E '^(HTTP|location)'
   # expect: HTTP/2 404 (route not defined — confirm decision in §2.2)
   ```
2. **Nav CTA smoke** — load https://crowagent.ai/, click the "Start free trial"
   nav button, expect a hard navigation to `https://app.crowagent.ai/signup`
   with no intermediate hop.
3. **Homepage hero CTA smoke** — same as (2) but click the hero button.
4. **Signup form smoke** — at `app.crowagent.ai/signup`, enter
   `qa+beta-2026-05-06@crowagent.ai` and a strong password. Expect:
   - 201 Created from `/api/auth/signup`
   - confirmation email sent (Brevo template `signup_confirm`)
   - redirect to `/onboarding` with the new session
5. **Beta-token smoke (admin)** — sign in as a founder, navigate to
   `/dashboard/admin/invites`, generate an invite for the placeholder email,
   open the resulting link in a private window, complete signup, verify the
   `beta_invites` row is marked `consumed = true`.
6. **Bypass check** — confirm `/start-trial` and `/sign-in` are NOT cached as
   `301` anywhere (browser, CF edge, Workers cache). Use a cache-buster:
   ```bash
   curl -sI "https://crowagent.ai/start-trial?_=$(date +%s)" | grep -E '^(HTTP|location|cf-cache-status)'
   ```

Each step must pass before T-056 is closed.

---

## 6. Findings & remediations

| Finding | Severity | Action |
|---------|----------|--------|
| `/beta-invite` and `/beta-request` redirects were named in the brief but neither route nor any CTA referencing them exists on the marketing surface. | Low / informational | No action — flag in this doc; do not add a redirect for a CTA that does not exist (creates a silent dead route). Re-evaluate when a beta-invite CTA is shipped. |
| All marketing CTAs link directly to the absolute `https://app.crowagent.ai/signup` URL. The `/start-trial` 302 is therefore unused by today's HTML. | Low | Acceptable — direct links are one fewer hop. The 302 is kept as a public "deep-link" entry point for partners and external campaigns that may want a short URL. |
| Both 302s are temporary, so changing the destination does not require a cache bust. | Informational | No action. |
| Nav and footer CTAs are injected by `js/nav-inject.js`. Any future change to the canonical signup URL must be made in two places: this JS file AND `_redirects`. | Medium | Document in `js/nav-inject.js` if the destination changes. Out of scope for this sweep. |

---

## 7. Status summary

- `/start-trial`  → flow verified
- `/sign-in`      → flow verified
- `/beta-invite`  → not implemented; needs decision (do not add until a CTA exists)
- `/beta-request` → not implemented; needs decision (same)
- All in-use marketing CTAs → flow verified (direct absolute URLs)

T-056 verification doc complete.
