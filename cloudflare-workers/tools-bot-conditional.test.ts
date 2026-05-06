/**
 * tools-bot-conditional.test.ts
 *
 * Unit tests for the /tools/* bot-conditional Cloudflare Worker.
 *
 * Run via:
 *   npx vitest run cloudflare-workers/tools-bot-conditional.test.ts
 * or under Miniflare:
 *   npx miniflare --modules cloudflare-workers/tools-bot-conditional.ts \
 *     --test cloudflare-workers/tools-bot-conditional.test.ts
 *
 * Tests use the standard `describe`/`it`/`expect` API exposed by both Vitest
 * and Jest, so the file is runnable under either harness without changes.
 *
 * The handler is invoked with an injected `fetchImpl` and `cacheImpl` so the
 * tests have full control over origin behaviour and cache state without
 * needing the `caches` global from the Workers runtime.
 */

import {
  BOT_USER_AGENTS,
  isBot,
  isToolsPath,
  stripClientSideMarkup,
  handle,
  type Env,
} from "./tools-bot-conditional";

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (value: unknown) => any;

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

interface FakeOriginOpts {
  body: string;
  status?: number;
  contentType?: string;
}

function makeFakeFetch(
  opts: FakeOriginOpts,
): { fetchImpl: typeof fetch; calls: Array<{ url: string; init?: RequestInit }> } {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : (input as Request).url ?? String(input);
    calls.push({ url, init });
    return new Response(opts.body, {
      status: opts.status ?? 200,
      headers: {
        "content-type": opts.contentType ?? "text/html; charset=utf-8",
      },
    });
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

class FakeCache implements Cache {
  private store = new Map<string, Response>();

  async match(req: RequestInfo): Promise<Response | undefined> {
    const key = typeof req === "string" ? req : (req as Request).url;
    const stored = this.store.get(key);
    return stored ? stored.clone() : undefined;
  }
  async put(req: RequestInfo, res: Response): Promise<void> {
    const key = typeof req === "string" ? req : (req as Request).url;
    this.store.set(key, res);
  }
  // Cache API methods we don't exercise.
  async add(): Promise<void> {
    /* noop */
  }
  async addAll(): Promise<void> {
    /* noop */
  }
  async delete(): Promise<boolean> {
    return false;
  }
  async keys(): Promise<ReadonlyArray<Request>> {
    return [];
  }
  async matchAll(): Promise<ReadonlyArray<Response>> {
    return [];
  }
}

function makeCtx(): ExecutionContext {
  return {
    waitUntil: (_p: Promise<unknown>) => {
      /* swallow — tests inspect cache directly via FakeCache */
    },
    passThroughOnException: () => {
      /* noop */
    },
  } as ExecutionContext;
}

const ENV: Env = {
  ORIGIN: "https://origin.example",
  BOT_TTL_SECONDS: "86400",
  HUMAN_TTL_SECONDS: "300",
};

const HUMAN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("isBot", () => {
  it("returns true for every documented bot UA", () => {
    for (const sig of BOT_USER_AGENTS) {
      expect(isBot(`Mozilla/5.0 (compatible; ${sig}/1.0)`)).toBe(true);
    }
  });

  it("returns false for a regular Chrome UA", () => {
    expect(isBot(HUMAN_UA)).toBe(false);
  });

  it("returns false for null / empty UA", () => {
    expect(isBot(null)).toBe(false);
    expect(isBot(undefined)).toBe(false);
    expect(isBot("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isBot("googlebot")).toBe(true);
    expect(isBot("GOOGLEBOT")).toBe(true);
  });
});

describe("isToolsPath", () => {
  it("matches /tools, /tools/, and /tools/<sub>", () => {
    expect(isToolsPath("/tools")).toBe(true);
    expect(isToolsPath("/tools/")).toBe(true);
    expect(isToolsPath("/tools/csrd-checker")).toBe(true);
    expect(isToolsPath("/tools/mees/calculator")).toBe(true);
  });

  it("rejects sibling paths", () => {
    expect(isToolsPath("/")).toBe(false);
    expect(isToolsPath("/pricing")).toBe(false);
    expect(isToolsPath("/toolsx")).toBe(false);
    expect(isToolsPath("/products/tools")).toBe(false);
  });
});

describe("stripClientSideMarkup", () => {
  it("removes <script> blocks (inline + external)", () => {
    const html =
      '<html><body><h1>Hi</h1>' +
      '<script src="/scripts.min.js"></script>' +
      "<script>console.log('boot');</script>" +
      "</body></html>";
    const out = stripClientSideMarkup(html);
    expect(out.includes("<script")).toBe(false);
    expect(out.includes("<h1>Hi</h1>")).toBe(true);
  });

  it("removes <noscript> blocks", () => {
    const html = "<div><noscript>Enable JS</noscript><p>Body</p></div>";
    const out = stripClientSideMarkup(html);
    expect(out.includes("<noscript")).toBe(false);
    expect(out.includes("<p>Body</p>")).toBe(true);
  });

  it("removes inline event handlers", () => {
    const html = '<button onclick="alert(1)" onmouseover="x()">Go</button>';
    const out = stripClientSideMarkup(html);
    expect(out.includes("onclick")).toBe(false);
    expect(out.includes("onmouseover")).toBe(false);
    expect(out.includes(">Go<")).toBe(true);
  });

  it("removes hydration data-* markers", () => {
    const html =
      '<div data-reactroot="" data-hydrate="true" data-next-page="/x"><span>x</span></div>';
    const out = stripClientSideMarkup(html);
    expect(out.includes("data-reactroot")).toBe(false);
    expect(out.includes("data-hydrate")).toBe(false);
    expect(out.includes("data-next-page")).toBe(false);
    expect(out.includes("<span>x</span>")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Handler — full request/response flow
// ---------------------------------------------------------------------------

describe("handle (worker fetch)", () => {
  const HTML_BODY =
    '<!doctype html><html><head><title>Tools</title></head><body>' +
    '<main><h1>Free CSRD checker</h1><p>Lead funnel content.</p></main>' +
    '<script src="/scripts.min.js"></script>' +
    "<script>window.__init();</script>" +
    "</body></html>";

  function newReq(path: string, ua: string, query = ""): Request {
    return new Request(`https://crowagent.ai${path}${query}`, {
      method: "GET",
      headers: { "user-agent": ua },
    });
  }

  it("serves bot variant with stripped scripts when UA is Googlebot", async () => {
    const { fetchImpl } = makeFakeFetch({ body: HTML_BODY });
    const cache = new FakeCache();
    const res = await handle(
      newReq("/tools/csrd-checker", GOOGLEBOT_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );
    const body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Bot-Path")).toBe("bot");
    expect(body.includes("<script")).toBe(false);
    expect(body.includes("Free CSRD checker")).toBe(true);
    // Bot TTL — s-maxage=86400
    expect(res.headers.get("Cache-Control") || "").toContain("s-maxage=86400");
  });

  it("serves human variant unchanged when UA is Chrome", async () => {
    const { fetchImpl } = makeFakeFetch({ body: HTML_BODY });
    const cache = new FakeCache();
    const res = await handle(
      newReq("/tools/csrd-checker", HUMAN_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );
    const body = await res.text();
    expect(res.headers.get("X-Bot-Path")).toBe("human");
    // Scripts retained for humans (interactive widgets).
    expect(body.includes("<script")).toBe(true);
    // Human TTL — s-maxage=300
    expect(res.headers.get("Cache-Control") || "").toContain("s-maxage=300");
  });

  it("sets Vary: User-Agent on every response", async () => {
    const { fetchImpl } = makeFakeFetch({ body: HTML_BODY });
    const cache = new FakeCache();

    const botRes = await handle(
      newReq("/tools/x", GOOGLEBOT_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );
    const humanRes = await handle(
      newReq("/tools/x", HUMAN_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );

    expect((botRes.headers.get("Vary") || "").toLowerCase()).toContain("user-agent");
    expect((humanRes.headers.get("Vary") || "").toLowerCase()).toContain("user-agent");
  });

  it("bypasses cache on ?nocache=1 and marks X-Edge-Cache: BYPASS", async () => {
    const { fetchImpl, calls } = makeFakeFetch({ body: HTML_BODY });
    const cache = new FakeCache();

    // Prime the cache with a real request first.
    await handle(newReq("/tools/x", HUMAN_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    const callsAfterPrime = calls.length;

    const res = await handle(
      newReq("/tools/x", HUMAN_UA, "?nocache=1"),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );

    expect(res.headers.get("X-Edge-Cache")).toBe("BYPASS");
    // Bypass MUST hit origin again.
    expect(calls.length).toBe(callsAfterPrime + 1);
  });

  it("caches successful responses — second request is HIT and origin hit once", async () => {
    const { fetchImpl, calls } = makeFakeFetch({ body: HTML_BODY });
    const cache = new FakeCache();

    const first = await handle(
      newReq("/tools/csrd-checker", GOOGLEBOT_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );
    expect(first.headers.get("X-Edge-Cache")).toBe("MISS");

    const second = await handle(
      newReq("/tools/csrd-checker", GOOGLEBOT_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );
    expect(second.headers.get("X-Edge-Cache")).toBe("HIT");
    // Only the MISS hit origin.
    expect(calls.length).toBe(1);
  });

  it("caches bot and human variants separately under the same path", async () => {
    const { fetchImpl, calls } = makeFakeFetch({ body: HTML_BODY });
    const cache = new FakeCache();

    await handle(newReq("/tools/x", GOOGLEBOT_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    await handle(newReq("/tools/x", HUMAN_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    // Two distinct variants → two origin fetches, neither served from the
    // other's cache slot.
    expect(calls.length).toBe(2);

    const botHit = await handle(newReq("/tools/x", GOOGLEBOT_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    const humanHit = await handle(newReq("/tools/x", HUMAN_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    expect(botHit.headers.get("X-Edge-Cache")).toBe("HIT");
    expect(humanHit.headers.get("X-Edge-Cache")).toBe("HIT");
    expect(calls.length).toBe(2);
  });

  it("does not cache origin error responses", async () => {
    const { fetchImpl, calls } = makeFakeFetch({ body: "boom", status: 502 });
    const cache = new FakeCache();

    const r1 = await handle(newReq("/tools/x", HUMAN_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    expect(r1.status).toBe(502);
    expect(r1.headers.get("X-Edge-Cache")).toBe("BYPASS");

    const r2 = await handle(newReq("/tools/x", HUMAN_UA), ENV, makeCtx(), {
      fetchImpl,
      cacheImpl: cache,
    });
    expect(r2.headers.get("X-Edge-Cache")).toBe("BYPASS");
    expect(calls.length).toBe(2);
  });

  it("does not transform non-HTML responses for bots", async () => {
    const jsonBody = '{"hello":"world"}';
    const { fetchImpl } = makeFakeFetch({
      body: jsonBody,
      contentType: "application/json",
    });
    const cache = new FakeCache();

    const res = await handle(
      newReq("/tools/data.json", GOOGLEBOT_UA),
      ENV,
      makeCtx(),
      { fetchImpl, cacheImpl: cache },
    );
    expect(await res.text()).toBe(jsonBody);
    expect(res.headers.get("X-Bot-Path")).toBe("bot");
  });
});
