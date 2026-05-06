# Security Pending Actions — Driver Checklist (2026-05-06)

**Purpose:** Procedural follow-ups extracted from `docs/SECURITY-ROTATION-REQUIRED-2026-05-06.md`
during the 2026-05-06 audit-execution sweep (WEB-AUDIT-149..271).

These items **cannot** be auto-fixed by an agent — they require driver-side
operations (live key rotation, DNS / dashboard configuration, git history
manipulation). Executing agent has documented them here for the supervising
driver to action and tick off.

## Status legend

- `pending` — driver action not yet started
- `in-progress` — driver started, not finished
- `done` — completed and verified
- `blocked` — blocked on external party (ICO, Cloudflare, etc.)
- `n/a` — re-classified as not applicable

---

## Checklist

| # | Item | Source row | Owner | Status | Notes |
|---|---|---|---|---|---|
| 1 | Inspect git history for any past `.env.local` containing `KEY=VALUE` lines | WEB-AUDIT-267 | driver | pending | `git log --all --follow -- .env.local` then `git show <sha>:.env.local` for each historical commit. If only comment-lines, close DEF-002/003. |
| 2 | If §1 finds real secret values: rotate every secret per the 12-row matrix | WEB-AUDIT-268 | driver | pending — conditional on §1 | See `docs/SECURITY-ROTATION-REQUIRED-2026-05-06.md` §3 for the per-secret procedure (Vercel token, PostHog key, Supabase anon, Stripe publishable, Formspree form-id, etc.). |
| 3 | If §1 finds real secret values: excise file from history | WEB-AUDIT-268 | driver | pending — conditional on §1 | `git filter-repo --invert-paths --path .env.local` then force-push (single shot, coordinated with `crowagent-platform` and `crowagent-internal`). |
| 4 | Provision Cloudflare Turnstile site for `crowagent.ai`, `www.crowagent.ai`, `app.crowagent.ai` | WEB-AUDIT-269 | driver | pending | Cloudflare dash → Turnstile → Add site. Choose Managed challenge. Capture site key + secret key. |
| 5 | Drop Turnstile widget into `contact.html` and `partners.html` forms | WEB-AUDIT-269 | driver | pending — conditional on §4 | Existing JS already gates submission on `cf-turnstile-response` token (`scripts.js:1052`, `partners-form.js:41`). Drop-in only. |
| 6 | Wire Turnstile siteverify into form action (Formspree proxy or `app.crowagent.ai/api/contact`) | WEB-AUDIT-269 | driver | pending — conditional on §4 | Either Cloudflare Worker proxy OR migrate form action to FastAPI `/api/contact`. |
| 7 | Plan multi-PR refactor to remove `style-src 'unsafe-inline'` | WEB-AUDIT-270 | engineering | pending | Migrate 23 `<style>` blocks to external `.css`; migrate ~399 inline `style="..."` attrs to utility classes; verify report-uri.com clean for 7 days. |
| 8 | ICO Registration Number replacement on `privacy.html` §1 | WEB-AUDIT-264 | driver (blocked on ICO) | blocked-external | Application drafted at `docs/legal/ico-update-draft.md`. Edit one line in `privacy.html`, set `data-ico-status="active"` when number arrives. |
| 9 | Author standalone `accessibility.html` Accessibility Statement | WEB-AUDIT-265 | engineering | pending | Run Playwright a11y suite first (`tests/accessibility.spec.js`). Document conformance level. Link from footer Legal column. Mandatory for UK public-sector buyers (CrowMark / PPN 002 audience). |
| 10 | Reconcile Reading registered office address (3 locations) | WEB-AUDIT-266 | driver (founder) | pending | `privacy.html` §1, §7 DPO postal, `js/nav-inject.js` footer use 3 different phrasings. Confirm Companies House registered office, then unify all three to identical street + postcode. |

---

## Quick reference — verification commands

```powershell
# §1 history inspection
cd "C:\Users\bhave\Crowagent Repo\crowagent-website"
git log --all --oneline --follow -- .env.local
git log --all --pretty=format:"%H %ai" -- .env.local | ForEach-Object {
    $h = ($_ -split ' ')[0]
    Write-Host "=== $_ ==="
    git show "$h`:.env.local" 2>$null
}

# §1 close-out criterion: every historical version contains ONLY comment lines
# (lines starting with `#` and blank lines). If so, close DEF-002/003 with link
# to the inspection output.

# §4 Turnstile site key (after Cloudflare provisioning)
# Insert into both forms:
#   <div class="cf-turnstile" data-sitekey="<TURNSTILE_SITE_KEY>" data-theme="dark" data-action="contact-form"></div>
#   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

---

*Author: agent run 2026-05-06 — audit-execution sweep WEB-AUDIT-149..271.*
*Update this file (do not delete) as each item progresses; commit the audit trail.*
