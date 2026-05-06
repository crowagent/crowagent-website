/**
 * marketing-edge-cache.ts
 *
 * MP1 §11 — D2: Cloudflare Worker that caches the public marketing surface
 * (`/`, `/pricing`, `/products/*`) on Cloudflare's edge via the Cache API.
 *
 * Contract:
 *   - Only GET / HEAD are cached. Anything else passes straight through.
 *   - 1h TTL (`s-maxage=3600`) per response. Browser cache header
 *     (`max-age=300`) is shorter so client refreshes are quick.
 *   - `/pricing` varies on Accept-Language so currency switches don't poison
 *     the cache across locales.
 *   - `?nocache=1` bypasses cache entirely (admin / smoke testing).
 *   - Cache-Status response header records HIT / MISS / BYPASS for ops.
 *
 * The worker fetches origin content from `ORIGIN` (set in wrangler.toml /
 * env). For the production deployment ORIGIN is the Cloudflare Pages URL
 * (`https://crowagent-website.pages.dev`) so this Worker sits *in front* of
 * the existing Pages deployment without changing it.
 */

export interface Env {
  /** Origin URL (no trailing slash). Defaults to Pages deployment if unset. */
  ORIGIN?: string;
  /** Override default TTL (seconds). Defaults to 3600 (1 hour). */
  EDGE_TTL_SECONDS?: string;
}

const DEFAULT_ORIGIN = "https://crowagent-website.pages.dev";
const DEFAULT_TTL = 3600; // 1 hour
const CLIENT_TTL = 300;   // 5 minutes
const CACHE_NAME = "crowagent-marketing-v1";

// Routes eligible for edge caching. Order matters — most specific first.
const CACHEABLE_PATHS: Array<RegExp> = [
  /^\/$/,
  /^\/pricing\/?$/,
  /^\/products(?:\/[^?#]*)?$/,
];

// Paths whose cache key MUST include Accept-Language (currency-by-locale).
const VARY_LANGUAGE_PATHS: Array<RegExp> = [/^\/pricing\/?$/];

function isCacheable(pathname: string): boolean {
  return CACHEABLE_PATHS.some((re) => re.test(pathname));
}

function variesOnLanguage(pathname: string): boolean {
  return VARY_LANGUAGE_PATHS.some((re) => re.test(pathname));
}

function buildCacheKey(request: Request, pathname: string): Request {
  // Cache key URL — keep host/path/query, but never include the bypass param.
  const url = new URL(request.url);
  url.searchParams.delete("nocache");
  // Drop fragment-style cache busters that don't affect content.
  url.searchParams.delete("_");

  if (variesOnLanguage(pathname)) {
    // Squash Accept-Language down to its primary tag (e.g. "en-GB,en;q=0.9" → "en-gb").
    const raw = request.headers.get("accept-language") ?? "";
    const primary = raw.split(",")[0]?.trim().toLowerCase() || "default";
    url.searchParams.set("__lang", primary);
  }

  return new Request(url.toString(), {
    method: "GET",
    headers: new Headers({
      // Strip cookies/auth so per-user requests don't fragment the cache.
      accept: request.headers.get("accept") ?? "*/*",
    }),
  });
}

function withEdgeHeaders(
  response: Response,
  status: "HIT" | "MISS" | "BYPASS",
  ttl: number,
): Response {
  const headers = new Headers(response.headers);
  // Public, edge-cacheable. Browser revalidates more aggressively than the edge.
  headers.set("Cache-Control", `public, max-age=${CLIENT_TTL}, s-maxage=${ttl}`);
  headers.set("Cache-Status", `Crowagent-Edge; ${status.toLowerCase()}`);
  headers.set("X-Edge-Cache", status);
  if (variesOnLanguage(new URL(response.url || "https://x/").pathname)) {
    // Append Accept-Language to whatever Vary the origin set.
    const existingVary = headers.get("Vary");
    const merged = new Set(
      [existingVary, "Accept-Language"].filter(Boolean).flatMap((v) => v!.split(",").map((s) => s.trim())),
    );
    headers.set("Vary", Array.from(merged).join(", "));
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = (env.ORIGIN ?? DEFAULT_ORIGIN).replace(/\/$/, "");
    const ttl = Number.parseInt(env.EDGE_TTL_SECONDS ?? `${DEFAULT_TTL}`, 10) || DEFAULT_TTL;

    // Origin URL retains the request's path + query but swaps the host.
    const originUrl = new URL(origin);
    originUrl.pathname = url.pathname;
    originUrl.search = url.search;

    // Only cache safe methods on whitelisted routes.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return fetch(originUrl.toString(), request);
    }
    if (!isCacheable(url.pathname)) {
      return fetch(originUrl.toString(), request);
    }
    if (url.searchParams.get("nocache") === "1") {
      const fresh = await fetch(originUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });
      return withEdgeHeaders(fresh, "BYPASS", ttl);
    }

    const cache = await caches.open(CACHE_NAME);
    const cacheKey = buildCacheKey(request, url.pathname);

    const hit = await cache.match(cacheKey);
    if (hit) {
      return withEdgeHeaders(hit, "HIT", ttl);
    }

    const originResponse = await fetch(originUrl.toString(), {
      method: request.method,
      headers: request.headers,
      // CF-specific cache hint; Workers ignore this on inbound, but it makes
      // the subrequest itself eligible for the regular CDN cache too.
      cf: { cacheTtl: ttl, cacheEverything: true },
    } as RequestInit);

    // Don't cache error responses — re-attempt origin next time.
    if (!originResponse.ok) {
      return withEdgeHeaders(originResponse, "BYPASS", ttl);
    }

    // Clone before storing — body is a single-use stream.
    const toStore = withEdgeHeaders(originResponse.clone(), "HIT", ttl);
    ctx.waitUntil(cache.put(cacheKey, toStore.clone()));

    return withEdgeHeaders(originResponse, "MISS", ttl);
  },
};
