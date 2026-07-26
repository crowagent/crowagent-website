#!/usr/bin/env node
// verify-robots.mjs — AI-crawler regression guard for crowagent.ai.
//
// Purpose: crowagent.ai deliberately ALLOWS AI-discovery crawlers (ClaudeBot,
// GPTBot, CCBot, Google-Extended, PerplexityBot, OAI-SearchBot) because the
// marketing content is exactly the corpus we want surfaced in AI-search answers.
// This script fails loudly if that policy silently regresses, most commonly when
// Cloudflare's "Managed robots.txt" / "Block AI bots" feature is toggled on in
// the dashboard and starts prepending a `Disallow: /` block for AI crawlers.
//
// No dependencies. Uses the built-in global fetch (Node 18+).
//
// Exit code 0 = all assertions pass. Non-zero = at least one failure (message printed).

const ORIGIN = process.env.ROBOTS_ORIGIN || "https://crowagent.ai";
const ROBOTS_URL = `${ORIGIN}/robots.txt`;
const LLMS_URL = `${ORIGIN}/llms.txt`;

// Crawlers whose stanza must NOT be disallowed from the whole site.
const AI_CRAWLERS = [
  "ClaudeBot",
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "PerplexityBot",
  "OAI-SearchBot",
];

const failures = [];

function fail(msg) {
  failures.push(msg);
}

async function getText(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "crowagent-robots-guard/1.0" },
  });
  return { status: res.status, body: await res.text() };
}

// Parse robots.txt into stanzas keyed by user-agent. A stanza runs from a
// `User-agent:` line to the next blank line or next `User-agent:` group.
function parseStanzas(body) {
  const lines = body.split(/\r?\n/);
  const map = new Map(); // lowercased UA -> array of directive lines
  let currentAgents = [];
  let collecting = false;
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (line === "") {
      collecting = false;
      currentAgents = [];
      continue;
    }
    const m = line.match(/^user-agent\s*:\s*(.+)$/i);
    if (m) {
      // A run of consecutive User-agent lines shares the following directives.
      if (!collecting) currentAgents = [];
      collecting = true;
      currentAgents.push(m[1].trim().toLowerCase());
      for (const a of currentAgents) if (!map.has(a)) map.set(a, []);
      continue;
    }
    collecting = false;
    for (const a of currentAgents) {
      const arr = map.get(a);
      if (arr) arr.push(line);
    }
  }
  return map;
}

async function main() {
  let robots;
  try {
    robots = await getText(ROBOTS_URL);
  } catch (err) {
    fail(`Could not fetch ${ROBOTS_URL}: ${err instanceof Error ? err.message : String(err)}`);
    return report();
  }

  if (robots.status !== 200) {
    fail(`${ROBOTS_URL} returned HTTP ${robots.status}, expected 200.`);
  }

  const body = robots.body;
  const stanzas = parseStanzas(body);

  // (a) No AI crawler stanza may contain `Disallow: /` (full-site block).
  for (const crawler of AI_CRAWLERS) {
    const directives = stanzas.get(crawler.toLowerCase());
    if (!directives) {
      fail(
        `No stanza found for ${crawler}. It should be present with "Allow: /" ` +
          `(a missing stanza can mean the "User-agent: *" default now blocks it).`
      );
      continue;
    }
    const blocked = directives.some((d) => /^disallow\s*:\s*\/\s*$/i.test(d));
    if (blocked) {
      fail(`${crawler} stanza contains "Disallow: /" — AI crawler is blocked from the whole site.`);
    }
  }

  // Also guard the wildcard default: if `User-agent: *` blocks the whole site,
  // AI crawlers with no explicit Allow would inherit the block.
  const wildcard = stanzas.get("*");
  if (wildcard && wildcard.some((d) => /^disallow\s*:\s*\/\s*$/i.test(d))) {
    fail(`"User-agent: *" stanza contains "Disallow: /" — this blocks the whole site by default.`);
  }

  // (b) Cloudflare Managed robots.txt marker must be absent.
  if (body.includes("BEGIN Cloudflare Managed content")) {
    fail(
      `robots.txt contains "BEGIN Cloudflare Managed content" — Cloudflare's ` +
        `managed robots.txt is enabled and is overriding the repo file. ` +
        `Disable it in the Cloudflare dashboard (Security / Bots, or the managed robots.txt toggle).`
    );
  }

  // (c) A Sitemap: line must be present.
  if (!/^\s*sitemap\s*:/im.test(body)) {
    fail(`robots.txt has no "Sitemap:" line.`);
  }

  // (d) llms.txt must return 200.
  try {
    const llms = await getText(LLMS_URL);
    if (llms.status !== 200) {
      fail(`${LLMS_URL} returned HTTP ${llms.status}, expected 200.`);
    }
  } catch (err) {
    fail(`Could not fetch ${LLMS_URL}: ${err instanceof Error ? err.message : String(err)}`);
  }

  return report();
}

function report() {
  // Set exitCode rather than calling process.exit(): forcing exit while undici's
  // keep-alive sockets are still open trips a libuv assertion on Windows and can
  // clobber the exit code. Setting exitCode lets the event loop drain and exit cleanly.
  if (failures.length === 0) {
    console.log(`PASS: robots.txt and llms.txt AI-discoverability checks passed for ${ORIGIN}.`);
    process.exitCode = 0;
    return;
  }
  console.error(`FAIL: ${failures.length} robots/llms discoverability check(s) failed for ${ORIGIN}:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(`FAIL: unexpected error: ${err instanceof Error ? err.stack : String(err)}`);
  process.exitCode = 1;
});
