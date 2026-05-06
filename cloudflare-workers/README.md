# crowagent.ai — Cloudflare Workers

This directory contains the Cloudflare Workers that front the marketing site
(crowagent.ai). They sit on the Cloudflare edge in front of the Cloudflare
Pages deployment of the static site (`crowagent-website` repo) and add caching
+ bot-conditional rendering without any change to the Pages build.

## Workers

### 1. `marketing-edge-cache.ts` — MP1 §11 D2

Edge cache for the public marketing surface (`/`, `/pricing`, `/products/*`).
1-hour edge TTL, 5-minute browser TTL. Currency-by-locale variant on
`/pricing` via `Vary: Accept-Language`. `?nocache=1` bypasses cache.

### 2. `tools-bot-conditional.ts` — MP1 §11 (bot-conditional /tools/*)

Bot-conditional rendering for the `/tools/*` lead-funnel landing pages.

- **Bot path** — User-Agent matches one of: Googlebot, Bingbot, DuckDuckBot,
  Baiduspider, YandexBot, Slackbot, Twitterbot, facebookexternalhit,
  LinkedInBot, WhatsApp, Discordbot, AhrefsBot, SemrushBot, MJ12bot.
  The worker fetches origin HTML, strips client-side `<script>` /
  `<noscript>` / hydration markers / inline event handlers, and serves the
  result with `s-maxage=86400` (1 day edge TTL). Aggressive caching is safe
  because the stripped variant is purely SEO-facing static content.

- **Human path** — Origin is passed through unchanged (interactive widgets
  intact). `s-maxage=300` (5 min edge TTL).

- **Always sets** `Vary: User-Agent` so downstream caches keep the two
  variants separate, and `X-Bot-Path: bot|human` for ops + synthetic
  monitoring visibility.

- **`?nocache=1`** bypasses cache (`X-Edge-Cache: BYPASS`).

The bot/human variants are stored under different cache keys
(`?__variant=bot` vs `?__variant=human`) so they never collide.

## Files

| File | Purpose |
| --- | --- |
| `marketing-edge-cache.ts` | Edge cache worker (existing) |
| `tools-bot-conditional.ts` | Bot-conditional /tools/* worker |
| `tools-bot-conditional.test.ts` | Vitest/Jest unit tests for the worker |
| `wrangler.toml` | Wrangler config for both workers (production + staging) |

## Tests

```bash
# From repo root, with Vitest installed:
npx vitest run cloudflare-workers/tools-bot-conditional.test.ts

# Or with Jest (Vitest-compatible API):
npx jest cloudflare-workers/tools-bot-conditional.test.ts
```

The handler accepts injected `fetchImpl` and `cacheImpl` deps so tests run
in plain Node without the Workers runtime or Miniflare.

Coverage:

- bot UA → bot variant (scripts stripped, `s-maxage=86400`)
- human UA → human variant (scripts retained, `s-maxage=300`)
- `Vary: User-Agent` set on every response
- `?nocache=1` bypasses cache and re-fetches origin
- Same path with different UA classes caches under separate keys
- 5xx origin responses are not cached
- Non-HTML responses (JSON assets) are not transformed

## Deploy

> **DO NOT** run `wrangler deploy` from inside an agent session. Driver-only.
> The platform charter forbids non-main pushes; that includes Workers deploys.

Two-config approach (recommended) — keep `wrangler.toml` shared and pick the
worker via `--env`:

```bash
# Marketing edge cache — production
wrangler deploy --config cloudflare-workers/wrangler.toml --env production

# Marketing edge cache — staging
wrangler deploy --config cloudflare-workers/wrangler.toml --env staging

# Tools bot-conditional — production (zone: crowagent.ai)
# Note: wrangler picks main from the [env] block when present, so this deploys
#       the tools-bot-conditional.ts worker.
wrangler deploy --config cloudflare-workers/wrangler.toml --env tools_production

# Tools bot-conditional — staging (zone: staging.crowagent.ai)
wrangler deploy --config cloudflare-workers/wrangler.toml --env tools_staging
```

Dry-run first to confirm zone targeting:

```bash
wrangler deploy --config cloudflare-workers/wrangler.toml --env tools_production --dry-run
# Should report:
#   • Worker: crowagent-tools-bot-conditional
#   • Routes: crowagent.ai/tools, crowagent.ai/tools/, crowagent.ai/tools/*
#   • Zone:   crowagent.ai
```

## Operations

After a deploy, verify both paths via cURL:

```bash
# Human path — should NOT strip scripts, X-Bot-Path: human
curl -sI -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0" \
  https://crowagent.ai/tools/csrd-checker

# Bot path — should strip scripts, X-Bot-Path: bot, s-maxage=86400
curl -sI -A "Googlebot/2.1 (+http://www.google.com/bot.html)" \
  https://crowagent.ai/tools/csrd-checker
```

Look for these response headers:

- `X-Bot-Path: bot` or `X-Bot-Path: human`
- `X-Edge-Cache: HIT|MISS|BYPASS`
- `Vary: User-Agent`
- `Cache-Control: public, max-age=300, s-maxage={300|86400}`

For incident response, force a fresh origin fetch with
`?nocache=1`. Cloudflare cache purge from the dashboard remains the
authoritative invalidation method.

## Cost discipline

Per CLAUDE.md / charter: production-only, no preview deployments. Dry-runs
are free. Live deploys cost a Worker request budget; redeploy only when the
TS source changes.
