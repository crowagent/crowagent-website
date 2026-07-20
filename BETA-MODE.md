# BETA MODE — what is switched on, and how to switch it off at GA

**Set 2026-07-19.** The platform is in private beta: self-serve signup is closed and
access is granted by invitation. This file is the complete revert checklist. Nothing
else on the site is beta-conditional.

---

## 1. The switch

**File:** `js/nav-inject.js`
**Flag:** `var BETA_MODE = true;`

That single boolean is the whole mechanism. It selects between two announcement-bar
variants that are both defined right next to it:

| `BETA_MODE` | Bar text | CTA | CTA target |
|---|---|---|---|
| `true` (now) | "Private beta · CrowAgent is invitation-only while we onboard early customers" | Request access | `mailto:hello@crowagent.ai?subject=CrowAgent%20access%20request` |
| `false` (GA) | "Now live · 14-day free trial · No credit card required" | Start free trial | `https://app.crowagent.ai/signup` |

The bar is injected site-wide by `nav-inject.js`, so it appears on all 54 pages from
this one place. No page has a hardcoded announcement bar.

### To go live
1. Set `BETA_MODE = false` in `js/nav-inject.js`.
2. Bump the `?v=` cache-buster on `js/nav-inject.js` in **every** HTML file that
   references it. Cloudflare Pages serves the stale asset at an unchanged URL, so the
   buster IS the purge. There is no purge tool.
3. Delete `ANNOUNCE_BETA` and the flag if you want to tidy up, or leave them in place
   in case beta is ever re-entered.

---

## 2. What was deliberately NOT changed, and why

These were considered and rejected to keep the change small and reversible:

- **The 72 `app.crowagent.ai/signup` links across 35 files were left alone.** The gate
  is enforced at the application, not the website. Rewriting every CTA would be a large,
  hard-to-revert change for no functional gain.
- **Trial language was kept** ("14-day free trial", "no credit card required",
  "cancel anytime"). The owner confirmed the trial still applies once access is granted,
  so these remain accurate for an invited user.
- **Prices were left visible.** Beta is about access, not pricing.

---

## 3. How the gate actually works (verified in the platform repo, 2026-07-19)

Confirmed by reading `crowagent-platform`, not assumed:

- `web/app/(auth)/signup/actions.ts` — after validation and rate limiting, signup is
  checked against the `beta_invites` table by token, then by email. No match means no
  Supabase auth user is created, and the user sees: *"CrowAgent is currently
  invitation-only. This email isn't on the beta whitelist - please request access at
  hello@crowagent.ai."*
- `web/app/(auth)/login/actions.ts` — the login page's sign-up tab carries the identical gate.
- `web/app/(auth)/auth/callback/route.ts` — Google/Microsoft OAuth is gated too. A new
  OAuth user without a valid invite has their orphan auth user deleted and is redirected
  to `/login?error=beta_invite_required`.
- `web/app/(auth)/signup/SignupPanels.tsx` — the signup page already shows its own
  invite-only notice above the form, with the same `hello@crowagent.ai` request link.

**The gate is hardcoded, not flagged.** Reopening self-serve signup at GA requires a code
change in those three files; it cannot be switched off by config, and equally cannot be
turned off by accident.

### Two things worth knowing
1. **`/signup` still renders a fully working form.** The rejection happens on submit, not
   before. The site banner now sets expectations before the click, which is the gap it was
   added to close.
2. **`platform_access_locks` is built but inactive** (every scope `locked = false` in
   production). It is the mechanism that would block *existing* non-whitelisted accounts
   from logging in. Today, because it is off, an existing account can still log in even if
   it is not on the whitelist. If "only approved people can use the app at all" is the
   intent, set `scope='global'` to `true` — that is what implements it.

---

## 4. Related: per-product beta badges

An earlier pass added `ca-badge-beta` pills to CrowMark specifically (product page,
pricing, products hub, sectors, roadmap, nav mega-menu). That was based on a
misunderstanding: beta is a **platform** state, not a CrowMark property. Those badges are
being removed in favour of the single site-wide banner above. The badge CSS
(`.ca-badge-beta`, `.ca-badge-dev`) remains defined in `nav-inject.js` and is harmless if
unused.

Two CrowMark capabilities, **AI bid marking** and **bid/no-bid FIT scoring**, were also
removed from the site entirely on 2026-07-19: they exist only on an unpushed branch
(`chore/brand-pack-and-h1-marking`) and are unreachable in production. Restore them to the
site only once they are merged, deployed, and reachable by a real user.

---

## 5. Held for go-live, confirmed by the owner 2026-07-20

Three things are deliberately absent from the site and must land together, not piecemeal.

### 5.1 AI credit allowances — HOLD
No credit figure appears anywhere on the site. The metering ledger does not exist in the
platform yet (`PRICING-AND-PACKAGING-2026-07.md` SS9.1, gaps I-1 to I-9), so any published
allowance would be a commitment we cannot count. That is the same defect as the advertised
"25 bids/month", whose downgrade guard queries `crowmark_evaluations`, a table that does not
exist in production, and therefore always passes.

**Release when:** the meter is live AND one real billing cycle has been observed.
**Then publish:** the allowances from SS3.4 and the "What's an AI credit?" section from SS9.2.

### 5.2 CrowMark Free and CrowCash Free cards — HOLD
Both tiers exist in code but are unpublished. They must ship in the SAME change as the
corrected allowances, because the ladder is currently inverted: free CrowMark gets 30 AI
generations a month while the 402 copy offers "Starter for 10 per month". Publishing the free
card before that is fixed would advertise a free tier that is more generous than the paid one.

### 5.3 Bid/no-bid FIT and AI bid marking — HOLD
Built and tested, not deployed. They exist only on the unpushed branch
`chore/brand-pack-and-h1-marking` and no customer can reach either. The owner will confirm when
they are live in production; they then go on the Starter card as SS9.2 line 486 describes.
Until that confirmation, they must not appear as a capability anywhere on the site.

**Note the conflict for whoever picks this up:** the pricing document's SS5.1 feature matrix
lists both as included at Starter, while SS9.1 and the code say they are unreachable. The code
is right. Do not resolve this from the matrix alone.
