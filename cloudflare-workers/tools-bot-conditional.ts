/**
 * tools-bot-conditional.ts
 *
 * MP1 §11 — Bot-conditional rendering for `/tools/*` lead-funnel pages.
 *
 * The /tools/* routes are free SEO-traffic landing pages (lead funnel). They
 * need to behave differently for bots vs. humans:
 *
 *   - Bots (Googlebot, Bingbot, Slackbot, Twitterbot, ...): served a
 *     pre-rendered HTML variant with all client-side script tags and hydration
 *     markers stripped, so search engines and link unfurlers see the inlined
 *     content. Cached aggressively (`s-maxage=86400`).
 *
 *   - Humans: served the standard interactive page from origin as-is, including
 *     any client-side widgets. Cached short-TTL (`s-maxage=300`).
 *
 * Always sets:
 *   - `Vary: User-Agent` so downstream caches do not collapse the two variants.
 *   - `X-Bot-Path: bot|human` for ops visibility and synthetic monitoring.
 *
 * Bypass cache entirely with `?nocache=1` (admin / smoke testing).
 *
 * The worker fetches origin content from `ORIGIN` (set in wrangler.toml). For
 * production this is the Cloudflare Pages URL of crowagent-website so this
 * worker sits in front of the existing Pages deployment without changing it.
 */

export interface Env {
  /** Origin URL (no trailing slash). Defaults to Pages deployment if unset. */
  ORIGIN?: string;
  /** Override default bot TTL (seconds). Defaults to 86400 (1 day). */
  BOT_TTL_SECONDS?: string;
  /** Override default human TTL (seconds). Defaults to 300 (5 minutes). */
  HUMAN_TTL_SECONDS?: string;
}

const DEFAULT_ORIGIN = "https://crowagent-website.pages.dev";
const DEFAULT_BOT_TTL = 86_400; // 1 day
const DEFAULT_HUMAN_TTL = 300; // 5 minutes
const CACHE_NAME = "crowagent-tools-bot-conditional-v1";

/**
 * Bot User-Agent substrings. Matched case-insensitively against the UA header.
 *
 * Curated for SEO + social-link-unfurling coverage:
 *   - Search crawlers: Google, Bing, DuckDuckGo, Baidu, Yandex
 *   - Social unfurlers: Slack, Twitter/X, Facebook, LinkedIn, WhatsApp, Discord
 *   - SEO tooling: Ahrefs, Semrush, Majestic (MJ12)
 */
export const BOT_USER_AGENTS: ReadonlyArray<string> = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "Slackbot",
  "Twitterbot",
  "facebookexternalhit",
  "LinkedInBot",
  "WhatsApp",
  "Discordbot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
];

/** Returns true when the User-Agent header matches one of the known bots. */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((sig) => ua.includes(sig.toLowerCase()));
}

/** Only `/tools` and `/tools/<anything>` routes are handled by this worker. */
export function isToolsPath(pathname: string): boolean {
  return pathname === "/tools" || pathname === "/tools/" || pathname.startsWith("/tools/");
}

/**
 * Strip client-side hydration markup so the bot variant is plain content.
 *
 * Removes:
 *   - <script>...</script> blocks (inline + external)
 *   - <noscript>...</noscript> blocks (irrelevant for bots; reduces noise)
 *   - Common SPA hydration attribute markers (data-reactroot, data-hydrate,
 *     data-next-page, data-n-head)
 *   - on* inline event handlers (onclick, onload, onmouseover, ...)
 *
 * Operates on raw HTML (regex). This is intentional — the alternative is a
 * full HTML parser which is overkill for a static-site lead-funnel page where
 * we only need to remove obviously-dynamic markup. The regex set is bounded
 * and tested.
 */
export function stripClientSideMarkup(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/\s+data-(?:reactroot|hydrate|next-page|n-head|hk)(?:="[^"]*")?/gi, "")
    .replace(/\s+on[a-z]+="[^"]*"/gi, "")
    .replace(/\s+on[a-z]+='[^']*'/gi, "");
}

interface BuildResponseOpts {
  bodyOverride?: string;
  ttl: number;
  botPath: "bot" | "human";
  cacheStatus: "HIT" | "MISS" | "BYPASS";
}

function withConditionalHeaders(response: Response, opts: BuildResponseOpts): Response {
  const headers = new Headers(response.headers);

  // Edge cache TTL (s-maxage) is the load-bearing one; browser TTL is shorter
  // so humans see fresh interactive content quickly.
  const browserTtl = Math.min(opts.ttl, 300);
  headers.set("Cache-Control", `public, max-age=${browserTtl}, s-maxage=${opts.ttl}`);

  // Vary: User-Agent — required so any downstream cache (browser, ISP, CF
  // itself) keeps the bot vs human variants separate.
  const existingVary = headers.get("Vary");
  const varyTokens = new Set(
    [existingVary, "User-Agent"]
      .filter(Boolean)
      .flatMap((v) => v!.split(",").map((s) => s.trim().toLowerCase()))
      .filter((s) => s.length > 0),
  );
  headers.set(
    "Vary",
    Array.from(varyTokens)
      .map((t) => (t === "user-agent" ? "User-Agent" : t))
      .join(", "),
  );

  // Ops headers for synthetic monitoring + log inspection.
  headers.set("X-Bot-Path", opts.botPath);
  headers.set("X-Edge-Cache", opts.cacheStatus);
  headers.set("Cache-Status", `Crowagent-Tools-Edge; ${opts.cacheStatus.toLowerCase()}`);

  // When stripping HTML for bots, the byte length changes — drop stale
  // Content-Length so the runtime can recompute it.
  if (opts.bodyOverride !== undefined) {
    headers.delete("Content-Length");
    headers.delete("content-length");
  }

  const body = opts.bodyOverride !== undefined ? opts.bodyOverride : response.body;

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function buildCacheKey(request: Request, botPath: "bot" | "human"): Request {
  const url = new URL(request.url);
  url.searchParams.delete("nocache");
  url.searchParams.delete("_");
  // Encode the bot/human variant into the cache key so the two never collide.
  url.searchParams.set("__variant", botPath);
  return new Request(url.toString(), {
    method: "GET",
    headers: new Headers({
      accept: request.headers.get("accept") ?? "*/*",
    }),
  });
}

/**
 * Test seam — exposes the per-request handler so unit tests can inject a
 * `fetch` implementation without monkey-patching the global.
 */
export interface HandlerDeps {
  fetchImpl?: typeof fetch;
  cacheImpl?: Cache;
}

export async function handle(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  deps: HandlerDeps = {},
): Promise<Response> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const url = new URL(request.url);

  // Hard guard — this worker should only ever bind to /tools/*, but defend in
  // depth in case a misconfigured route catches a sibling path.
  if (!isToolsPath(url.pathname)) {
    const originBase = (env.ORIGIN ?? DEFAULT_ORIGIN).replace(/\/$/, "");
    const passthroughUrl = new URL(originBase);
    passthroughUrl.pathname = url.pathname;
    passthroughUrl.search = url.search;
    return fetchImpl(passthroughUrl.toString(), request);
  }

  const origin = (env.ORIGIN ?? DEFAULT_ORIGIN).replace(/\/$/, "");
  const botTtl = Number.parseInt(env.BOT_TTL_SECONDS ?? `${DEFAULT_BOT_TTL}`, 10) || DEFAULT_BOT_TTL;
  const humanTtl =
    Number.parseInt(env.HUMAN_TTL_SECONDS ?? `${DEFAULT_HUMAN_TTL}`, 10) || DEFAULT_HUMAN_TTL;

  const userAgent = request.headers.get("user-agent");
  const botPath: "bot" | "human" = isBot(userAgent) ? "bot" : "human";
  const ttl = botPath === "bot" ? botTtl : humanTtl;

  const originUrl = new URL(origin);
  originUrl.pathname = url.pathname;
  originUrl.search = url.search;

  // Pass through unsafe methods (POST/PUT/DELETE/...) untouched and uncached.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return fetchImpl(originUrl.toString(), request);
  }

  // ?nocache=1 — bypass cache, fetch fresh, still apply variant transform.
  const bypass = url.searchParams.get("nocache") === "1";

  const cache = deps.cacheImpl ?? (await caches.open(CACHE_NAME));
  const cacheKey = buildCacheKey(request, botPath);

  if (!bypass) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      return withConditionalHeaders(hit, {
        ttl,
        botPath,
        cacheStatus: "HIT",
      });
    }
  }

  const originResponse = await fetchImpl(originUrl.toString(), {
    method: request.method,
    headers: request.headers,
    cf: { cacheTtl: ttl, cacheEverything: !bypass },
  } as RequestInit);

  // Don't cache or transform error responses — pass them through cleanly so
  // the next request retries origin.
  if (!originResponse.ok) {
    return withConditionalHeaders(originResponse, {
      ttl,
      botPath,
      cacheStatus: "BYPASS",
    });
  }

  // Only transform HTML responses. Asset/JSON requests under /tools/* (e.g.
  // /tools/foo/data.json) pass through unchanged.
  const contentType = originResponse.headers.get("content-type") ?? "";
  const isHtml = contentType.toLowerCase().includes("text/html");

  let bodyOverride: string | undefined;
  if (botPath === "bot" && isHtml && request.method === "GET") {
    const raw = await originResponse.clone().text();
    bodyOverride = stripClientSideMarkup(raw);
  }

  if (bypass) {
    return withConditionalHeaders(originResponse, {
      bodyOverride,
      ttl,
      botPath,
      cacheStatus: "BYPASS",
    });
  }

  // Build the cache entry. We store the post-transform body so subsequent
  // HITs are zero-CPU.
  const cacheable = withConditionalHeaders(originResponse.clone(), {
    bodyOverride,
    ttl,
    botPath,
    cacheStatus: "HIT",
  });
  ctx.waitUntil(cache.put(cacheKey, cacheable.clone()));

  return withConditionalHeaders(originResponse, {
    bodyOverride,
    ttl,
    botPath,
    cacheStatus: "MISS",
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handle(request, env, ctx);
  },
};
