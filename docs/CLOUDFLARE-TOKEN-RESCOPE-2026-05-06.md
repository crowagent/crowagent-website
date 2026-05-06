# Cloudflare API Token — Required Scope Update

**Status:** PENDING (existing token too narrow). Marketing site already LIVE on CF Pages without these.

## What's blocked

The existing `CLOUDFLARE_API_TOKEN` GitHub secret (in `crowagent-platform` repo) has insufficient scope to:

1. **Create Turnstile widget** — needs `Account → Turnstile Sites: Edit`
2. **Deploy Cloudflare Workers** — needs `Account → Workers Scripts: Edit`
3. **Read user details** — needs `User → User Details: Read` (cosmetic; not blocking)

Verified failure: workflow run `25410116452` step "Deploy Cloudflare Workers" → `Authentication error [code: 10000]` from
`/accounts/ddced911834fc3f1278c72cd55ef143e/workers/services/tools-bot-conditional`.

## What's NOT blocked

- Marketing site at `https://crowagent.ai` — fully deployed via Cloudflare Pages on PR #148 merge (00:35:47 UTC 2026-05-06)
- All 271 audit-ledger HTML/CSS/header fixes — LIVE
- Cloudflare-workers source files in `cloudflare-workers/` — committed, ready to deploy once token rescoped

## How to rescope (≤2 minutes)

1. https://dash.cloudflare.com/profile/api-tokens
2. Edit the token in use by `CLOUDFLARE_API_TOKEN` secret
3. Add permissions:
   - `Account → Turnstile Sites: Edit` (for the marketing forms widget)
   - `Account → Workers Scripts: Edit` (for marketing-edge-cache + tools-bot-conditional + og-image)
   - `Zone → Cache Purge: Purge` on `crowagent.ai` zone (for cache busting)
4. Save. Existing token value stays the same (no GitHub secret update needed).
5. Re-run workflow: `gh workflow run cloudflare-bootstrap.yml -R crowagent/crowagent-platform`

## Compensating controls (already in place — beta launch unblocked)

- Form spam: honeypot field `name="website"` in `contact.html` + `partners.html` (silently rejects bots)
- Mail-header injection: `\r\n` regex strip on every form input before mailto/Formspree
- CSP: full hardening minus `style-src 'unsafe-inline'` (398 inline-style usages need separate CSS extraction PR)
- DDoS / rate-limit: Cloudflare Pages provides default protection at the edge
- /tools/* SEO: HTML is statically rendered; bot-conditional worker is an *optimisation* (faster bot path), not a blocker

## Files affected (parked until token rescope)

- `cloudflare-workers/marketing-edge-cache.ts` — marketing edge-cache + Turnstile siteverify proxy
- `cloudflare-workers/tools-bot-conditional.ts` — bot vs human variant for /tools/* SEO
- `cloudflare-workers/og-image.ts` — placeholder (currently using build-time PNG generation instead via `scripts/generate-og-images.js`)
- `cloudflare-workers/wrangler.toml` — route bindings on `crowagent.ai` zone
