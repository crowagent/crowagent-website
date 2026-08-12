/**
 * check-sitemap-routes.js — every URL this site advertises must be a URL this
 * site SERVES, not one it redirects away from.
 *
 * ── THE DEFECT THIS EXISTS FOR (measured on production 2026-08-12) ──────────
 *
 * sitemap.xml carried 45 URLs. Forty-four of them were the NON-slashed form of
 * a directory route, and every one of those forty-four answered 308:
 *
 *     GET /about                          308  ->  /about/
 *     GET /about/                         200
 *     GET /tools/tender-compliance-matrix 308  ->  /tools/tender-compliance-matrix/
 *
 * The same string was also the page's own `<link rel="canonical">`, because
 * Seo.astro stripped the trailing slash, so every route on the site declared a
 * canonical that redirects. Submitting that sitemap to Search Console reports
 * 44 of 45 URLs as "Page with redirect" and indexes none of them, and a
 * self-referencing canonical pointing at a redirect is the same fault a second
 * time. Nothing in the build could see it: build-sitemap.js asserts that every
 * page HAS a canonical, and check-seo-parity.js asserts that no canonical went
 * MISSING. Neither asks whether the URL in it answers 200.
 *
 * WHY THE URLS MOVED WITHOUT ANYONE CHANGING THEM. Cloudflare Pages
 * canonicalises a path before `_redirects` is consulted, and which direction it
 * canonicalises in depends on what is on disk: a flat `about.html` makes
 * `/about` the served form and `/about/` the redirect, while an
 * `about/index.html` makes `/about/` the served form and `/about` the redirect.
 * The deploy source moved from the repository root (flat `.html` files) to
 * `astro/dist` (`build.format: 'directory'`) on 2026-08-05, which flipped the
 * served form of all 44 routes without one URL being edited. That is exactly
 * the class of change no source file records, which is why this reads the built
 * tree rather than any document about it.
 *
 * ── WHY IT IS THE SITEMAP THAT MOVES, AND NEVER THE SERVER ──────────────────
 *
 * The other direction is a recorded production incident. `_redirects` block 3
 * carries it: on 2026-05-06 PR #148 removed the directory rewrites, rules of
 * the form `/foo/ -> /foo 308` were in play, they fought Cloudflare's native
 * slash-ADDING, and production threw ERR_TOO_MANY_REDIRECTS on /products and
 * /tools. Any rule that strips a trailing slash from a directory-backed route
 * re-creates that loop, because Cloudflare will put the slash straight back.
 * So this gate is deliberately one-directional: it asserts that what the site
 * ADVERTISES matches what the server already SERVES. It can never be satisfied
 * by adding a redirect rule, only by advertising the right URL.
 *
 * ── WHAT IT READS: ALL THREE REAL ARTEFACTS, NO LIST OF ITS OWN ─────────────
 *
 *   dist/sitemap.xml   the generated sitemap, as build-sitemap.js wrote it
 *   dist/**            the real route tree, which is what decides slash direction
 *   dist/_redirects    the real rule file, as copy-cf-config.js wrote it
 *
 * There is no allow-list of routes in this file and there must never be one: a
 * hand-written list of expected URLs would have passed happily on the day the
 * deploy source moved, since none of the URLs changed. The corpus is whatever
 * the build emitted.
 *
 * It checks three claims, not one: the sitemap, every canonical emitted by every
 * built page, and every page ADDRESS inside the pages' JSON-LD (BreadcrumbList
 * `item`, `mainEntityOfPage`).
 *
 * The first two are the same set today by construction, since build-sitemap.js
 * reads the canonicals out of the pages — but only for `index.html` pages:
 * `404.html` is emitted flat by Astro, is not in the sitemap, and carries a
 * canonical nothing else looks at. Checking both means the day they diverge is a
 * failure rather than a blind spot.
 *
 * THE THIRD EARNED ITS PLACE IMMEDIATELY. With the canonical fixed and the
 * sitemap clean, this arm still failed on eight URLs: four `compare/*` pages,
 * `/contact` and two `glossary/*` pages were building their own breadcrumb and
 * mainEntityOfPage URLs inline instead of going through lib/schema.ts, so they
 * went on naming the 308 form of their own page. A gate that had checked only
 * the canonical would have reported the defect fixed while a third of it was
 * still shipping.
 *
 * ── THE CONTROLS, WHICH RUN BEFORE THE CHECK ────────────────────────────────
 *
 * A gate that resolves nothing passes everything. Five controls run first and
 * each exits 1 on its own, so this cannot go green while blind:
 *
 *   1  the sitemap parses and its URL count EQUALS the number of index.html
 *      pages in dist, so a corpus that silently shrank is a failure
 *   2  `_redirects` parsed to a non-empty rule set containing the NAMED
 *      catch-all rule that control 5 depends on
 *   3  positive: a served form taken FROM THE BUILT TREE classifies as served
 *   4  negative: that same route with its trailing slash removed classifies as
 *      a redirect — this is the defect itself, so a classifier that cannot see
 *      it is a classifier that cannot fail
 *   5  negative: a path that exists nowhere classifies as not served
 *
 * Controls 3 and 4 are derived from dist at run time, not typed in here, so
 * they keep working when the routes change.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const SITE_TS = path.join(__dirname, '..', 'src', 'data', 'site.ts');

/* ------------------------------------------------------------------ *
 * INPUTS
 * ------------------------------------------------------------------ */

function die(lines) {
  for (const l of [].concat(lines)) console.error(l);
  process.exit(1);
}

if (!fs.existsSync(DIST)) {
  die([
    'sitemap-routes: no build at astro/dist.',
    '  This gate reads the generated sitemap, the built route tree and the copied',
    '  _redirects. Run the build before it.',
  ]);
}

/*
 * The origin comes from site.ts, the same file Seo.astro builds canonicals
 * against, so a canonical or sitemap entry pointing at a FOREIGN origin is a
 * failure rather than something this quietly resolves against dist anyway.
 */
const originMatch = fs.readFileSync(SITE_TS, 'utf8').match(/origin:\s*'([^']+)'/);
if (!originMatch) die('sitemap-routes: could not read SITE.origin from src/data/site.ts.');
const ORIGIN = originMatch[1].replace(/\/$/, '');

const SITEMAP = path.join(DIST, 'sitemap.xml');
if (!fs.existsSync(SITEMAP)) {
  die([
    'sitemap-routes: dist/sitemap.xml does not exist.',
    '  scripts/build-sitemap.js emits it and must run before this gate.',
  ]);
}

const REDIRECTS = path.join(DIST, '_redirects');
if (!fs.existsSync(REDIRECTS)) {
  die([
    'sitemap-routes: dist/_redirects does not exist.',
    '  scripts/copy-cf-config.js copies it and must run before this gate.',
    '  Without it this gate would have to guess what happens to a URL that is not',
    '  a file, which is the guess it exists to remove.',
  ]);
}

/** Every `<loc>` in the generated sitemap, in file order. */
function sitemapLocs() {
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Every built page and the canonical it declares. */
const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i;

/**
 * The URLs inside a page's JSON-LD that are PAGE ADDRESSES, as distinct from
 * the many other URLs structured data carries.
 *
 * WHY ONLY THESE TWO KEYS. `image` is an asset, `sameAs` points off-site, and
 * a `logo` is neither; sweeping every URL-shaped string would make this gate
 * responsible for things it has no opinion about and would turn one asset
 * rename into a sitemap failure. `item` on a BreadcrumbList entry and
 * `mainEntityOfPage` are defined by schema.org as the address of a page, which
 * is exactly the claim this gate resolves.
 *
 * THEY WERE WRONG, WHICH IS WHY THEY ARE HERE. lib/schema.ts held its own copy
 * of the route-to-URL rule and stripped the trailing slash, so on 2026-08-12
 * every BreadcrumbList item and every BlogPosting mainEntityOfPage named the
 * 308 form of its own page. The canonical had the identical fault from a second
 * expression. Checking only the canonical would have declared that fixed while
 * half of it was still shipping.
 *
 * A fragment is kept rather than stripped: `#article` on a page URL resolves
 * through the same pathname, and dropping it here would mean this reported a
 * URL the page does not actually publish.
 */
function pageUrlsInStructuredData(html) {
  const found = new Set();
  const asUrl = (v) => {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && typeof v['@id'] === 'string') return v['@id'];
    return null;
  };
  const walk = (node, inBreadcrumb) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, inBreadcrumb));
    const breadcrumb = inBreadcrumb || node['@type'] === 'BreadcrumbList';
    if (breadcrumb && node['@type'] === 'ListItem') {
      const u = asUrl(node.item);
      if (u) found.add(u);
    }
    const mep = asUrl(node.mainEntityOfPage);
    if (mep) found.add(mep);
    for (const v of Object.values(node)) walk(v, breadcrumb);
  };
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      /* A block that does not parse publishes no URL at all, so there is
         nothing here to resolve. check-seo-parity.js is the gate that reports an
         unparseable JSON-LD block, and duplicating that verdict here would mean
         two gates to keep in step about one fault. */
      continue;
    }
    walk(parsed, false);
  }
  return found;
}

function builtPages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) builtPages(full, out);
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * `_redirects`, parsed the way Cloudflare Pages reads it: comments and blank
 * lines dropped, whitespace-separated, first match wins, `*` is a splat.
 *
 * Rules whose source is an absolute URL for another host (the www -> apex rule)
 * are kept but can only match a request for that host, which no sitemap entry
 * on this origin is.
 */
function parseRedirects() {
  const rules = [];
  const unparsed = [];
  const lines = fs.readFileSync(REDIRECTS, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      unparsed.push(`line ${i + 1}: ${trimmed}`);
      return;
    }
    const [from, to, rawStatus] = parts;
    const status = rawStatus ? Number.parseInt(rawStatus, 10) : 302;
    if (!Number.isFinite(status)) {
      unparsed.push(`line ${i + 1}: unreadable status "${rawStatus}"`);
      return;
    }
    /*
     * A `:placeholder` other than `:splat` would be a matching form this parser
     * does not implement, and silently ignoring one would make every rule below
     * it fire at the wrong time. There are none today; if one is added, this
     * says so rather than mis-modelling the file.
     */
    if (/(^|\/):(?!splat\b)[a-z]/i.test(from)) {
      unparsed.push(`line ${i + 1}: placeholder syntax this parser does not implement: ${from}`);
      return;
    }
    rules.push({ from, to, status, line: i + 1 });
  });
  if (unparsed.length) {
    die([
      `sitemap-routes: ${unparsed.length} line(s) of dist/_redirects could not be parsed.`,
      '  This gate models Cloudflare first-match-wins ordering, so a line it cannot read',
      '  makes every verdict after it unsound. Fix the line or teach the parser.',
      ...unparsed.map((u) => `    ${u}`),
    ]);
  }
  return rules;
}

function ruleMatches(rule, pathname) {
  let { from } = rule;
  if (/^https?:\/\//i.test(from)) {
    let url;
    try {
      url = new URL(from);
    } catch {
      return false;
    }
    if (`${url.protocol}//${url.host}` !== ORIGIN) return false;
    from = url.pathname;
  }
  if (from.endsWith('*')) return pathname.startsWith(from.slice(0, -1));
  return from === pathname;
}

/* ------------------------------------------------------------------ *
 * THE MODEL OF WHAT CLOUDFLARE PAGES DOES WITH A PATH
 * ------------------------------------------------------------------ *
 *
 * Ordered exactly as measured against production on 2026-08-12. Every branch
 * below was confirmed with `curl -sI` against crowagent.ai on the deployed
 * build, not inferred from documentation:
 *
 *   /                                    200
 *   /about                               308 -> /about/          (add slash)
 *   /about/                              200
 *   /sectors                             308 -> /sectors/
 *   /blog                                308 -> /blog/           (despite the
 *                                        200-rewrite in _redirects, because
 *                                        canonicalisation runs first)
 *   /tools/tender-compliance-matrix      308 -> …/
 *   /404                                 200                     (flat file,
 *                                        served extensionless)
 *   /404/                                308 -> /404             (strip slash)
 *   /about.html                          404                     (no flat file
 *                                        in the Astro tree any more)
 *   /nonexistent-xyz                     404                     (the /* rule)
 *
 * The single rule underneath all of it: Cloudflare canonicalises TOWARDS
 * whichever form is backed by a file, and only then reads `_redirects`.
 */

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

const distPath = (pathname) => path.join(DIST, ...pathname.split('/').filter(Boolean));

const SERVED = 'served';
const REDIRECT = 'redirect';
const NOT_SERVED = 'not-served';

/**
 * @returns {{ kind: string, detail: string }}
 */
function resolve(pathname, rules) {
  const bare = pathname.replace(/\/$/, '');
  const asFile = distPath(pathname);
  const asBare = distPath(bare);

  // An explicit .html is canonicalised away by stripping the extension, so it
  // is never a served form even when the file is right there.
  if (pathname.endsWith('.html')) {
    if (isFile(asFile)) {
      const stripped = pathname.replace(/(?:index)?\.html$/, '') || '/';
      return { kind: REDIRECT, detail: `308 -> ${stripped} (Cloudflare strips .html)` };
    }
    return { kind: NOT_SERVED, detail: 'no such file' };
  }

  /*
   * The root is the one path with no unslashed form to canonicalise towards:
   * `https://crowagent.ai` and `https://crowagent.ai/` are the same request on
   * the wire, and it is answered by dist/index.html. Handled first because the
   * slash-direction logic below reads `/` as an empty path segment and would
   * otherwise fall through to the `/*` catch-all and report the homepage as a
   * 404 — which it did, before this branch existed.
   */
  if (pathname === '/') {
    const root = path.join(DIST, 'index.html');
    if (isFile(root)) return { kind: SERVED, detail: 'index.html' };
    return { kind: NOT_SERVED, detail: 'the build emitted no index.html' };
  }

  const flatTwin = isFile(`${asBare}.html`);
  const dirIndex = isFile(path.join(asBare, 'index.html'));

  /*
   * Both forms on disk at once would mean two different documents claim one
   * URL and only Cloudflare decides which wins. Refused rather than guessed:
   * a wrong guess here would be a gate confidently reporting the wrong page.
   */
  if (flatTwin && dirIndex) {
    die([
      `sitemap-routes: ${bare} is backed by BOTH ${path.relative(DIST, `${asBare}.html`)} and`,
      `  ${path.relative(DIST, path.join(asBare, 'index.html'))}. Two documents cannot own one URL,`,
      '  and which one Cloudflare serves is not something this gate should guess. Delete one.',
    ]);
  }

  if (pathname.endsWith('/') && pathname !== '/') {
    if (flatTwin) return { kind: REDIRECT, detail: `308 -> ${bare} (flat file, slash stripped)` };
    if (dirIndex) return { kind: SERVED, detail: `${path.relative(DIST, path.join(asBare, 'index.html'))}` };
  } else {
    if (isFile(asFile)) return { kind: SERVED, detail: path.relative(DIST, asFile) };
    if (dirIndex && pathname !== '/') {
      return { kind: REDIRECT, detail: `308 -> ${pathname}/ (directory, slash added)` };
    }
    if (flatTwin) return { kind: SERVED, detail: path.relative(DIST, `${asBare}.html`) };
  }

  // Nothing on disk answers this path, so `_redirects` finally gets a say.
  for (const rule of rules) {
    if (!ruleMatches(rule, pathname)) continue;
    if (rule.status >= 300 && rule.status < 400) {
      return { kind: REDIRECT, detail: `${rule.status} -> ${rule.to} (_redirects line ${rule.line})` };
    }
    if (rule.status === 200) {
      const target = rule.to.startsWith('/') ? distPath(rule.to) : null;
      if (target && isFile(target)) {
        return { kind: SERVED, detail: `200-rewrite to ${rule.to} (_redirects line ${rule.line})` };
      }
      return { kind: NOT_SERVED, detail: `200-rewrite to ${rule.to}, which is not in the build` };
    }
    return { kind: NOT_SERVED, detail: `${rule.status} (_redirects line ${rule.line})` };
  }
  return { kind: NOT_SERVED, detail: 'nothing in the build and no rule matches' };
}

/* ------------------------------------------------------------------ *
 * CONTROLS
 * ------------------------------------------------------------------ */

const rules = parseRedirects();
const locs = sitemapLocs();
const pages = builtPages(DIST);
const indexPages = pages.filter((p) => path.basename(p) === 'index.html');

// Control 1 — the corpus is the real one, and its size is stated.
if (!locs.length) die('sitemap-routes: CONTROL FAILED — dist/sitemap.xml yielded no <loc> entries.');
if (locs.length !== indexPages.length) {
  die([
    `sitemap-routes: CONTROL FAILED — the sitemap lists ${locs.length} URL(s) but the build emitted`,
    `  ${indexPages.length} index.html page(s). The sitemap is meant to be exactly the built pages, so`,
    '  a mismatch means either a page is unadvertised or the sitemap is stale. Re-run',
    '  scripts/build-sitemap.js against this build; if it still disagrees, that is the defect.',
  ]);
}

// Control 2 — _redirects parsed, and the NAMED rule control 5 leans on is present.
const catchAll = rules.find((r) => r.from === '/*' && r.status === 404);
if (!catchAll) {
  die([
    'sitemap-routes: CONTROL FAILED — dist/_redirects has no `/*  …  404` catch-all.',
    `  ${rules.length} rule(s) parsed. Control 5 asserts that an unknown path is NOT served, and`,
    '  without that rule this gate would be asserting it against a file it did not really read.',
  ]);
}

/*
 * Controls 3 and 4 — derived from the built tree at run time rather than typed
 * in, so they follow the site instead of rotting into an allow-list. The first
 * directory-backed route in dist is both the positive probe (its slashed form
 * must be served) and the negative one (its unslashed form must be a redirect,
 * which is the exact defect this gate exists for).
 */
const probeIndex = indexPages
  .map((p) => `/${path.relative(DIST, path.dirname(p)).split(path.sep).join('/')}/`)
  .filter((r) => r !== '//')
  .sort()[0];

if (!probeIndex) {
  die('sitemap-routes: CONTROL FAILED — the build contains no directory-backed route to probe with.');
}

const positive = resolve(probeIndex, rules);
if (positive.kind !== SERVED) {
  die([
    `sitemap-routes: CONTROL FAILED — the served form ${probeIndex} was classified "${positive.kind}"`,
    `  (${positive.detail}). A gate that cannot recognise a page that IS served would fail every`,
    '  correct sitemap, so its passes would mean nothing either.',
  ]);
}

const negativePath = probeIndex.replace(/\/$/, '');
const negative = resolve(negativePath, rules);
if (negative.kind !== REDIRECT) {
  die([
    `sitemap-routes: CONTROL FAILED — ${negativePath} was classified "${negative.kind}" (${negative.detail}).`,
    '  On a directory-format build that URL is the 308 source this gate was written to catch.',
    '  Classifying it as anything else means the gate can no longer see the defect it exists for,',
    '  and every green run below would be vacuous.',
  ]);
}

// Control 5 — a path that exists nowhere must not read as served.
const CONTROL_MISSING = '/__sitemap-routes-control__/does-not-exist/';
const missing = resolve(CONTROL_MISSING, rules);
if (missing.kind !== NOT_SERVED) {
  die([
    `sitemap-routes: CONTROL FAILED — ${CONTROL_MISSING} was classified "${missing.kind}" (${missing.detail}).`,
    '  A path with nothing behind it must not resolve to a served page, or this gate would pass a',
    '  sitemap full of URLs that 404.',
  ]);
}

/* ------------------------------------------------------------------ *
 * THE CHECK
 * ------------------------------------------------------------------ */

/** Every URL the site advertises, and where it was advertised. */
const advertised = new Map(); // url -> Set of sources

const advertise = (url, source) => {
  if (!advertised.has(url)) advertised.set(url, new Set());
  advertised.get(url).add(source);
};

for (const loc of locs) advertise(loc, 'sitemap.xml');

const uncanonicalled = [];
for (const file of pages) {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');

  const m = html.match(CANONICAL_RE);
  if (!m) {
    uncanonicalled.push(rel);
  } else {
    advertise(m[1].trim(), `canonical in ${rel}`);
  }

  for (const url of pageUrlsInStructuredData(html)) {
    advertise(url, `structured data in ${rel}`);
  }
}

/*
 * Control 6 — the structured-data arm is REACHING something.
 *
 * Once the defect is fixed these URLs are byte-identical to the canonicals and
 * dedupe into them, so the advertised count says nothing about whether they were
 * read at all: a walker that silently returned nothing would look exactly like a
 * clean build. This counts the sources instead. It is the arm that found the
 * eight URLs in compare/*, contact and glossary/* that bypassed lib/schema.ts
 * entirely, which no count of distinct URLs would have shown.
 */
const structuredDataSources = [...advertised.values()].reduce(
  (n, sources) => n + [...sources].filter((s) => s.startsWith('structured data in ')).length,
  0
);
if (structuredDataSources === 0) {
  die([
    'sitemap-routes: CONTROL FAILED — not one page URL was found in any JSON-LD block.',
    `  ${pages.length} built page(s) were read. Every route on this site emits a BreadcrumbList,`,
    '  so zero means the walker stopped matching and this gate is now checking canonicals only',
    '  while still reporting a clean run.',
  ]);
}

const failures = [];
const foreign = [];
let servedCount = 0;

for (const [url, sources] of advertised) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    failures.push({ url, sources, detail: 'not a parseable absolute URL' });
    continue;
  }
  if (`${parsed.protocol}//${parsed.host}` !== ORIGIN) {
    foreign.push({ url, sources });
    continue;
  }
  const verdict = resolve(parsed.pathname, rules);
  if (verdict.kind === SERVED) {
    servedCount++;
    continue;
  }
  failures.push({ url, sources, detail: verdict.detail, kind: verdict.kind });
}

/* ------------------------------------------------------------------ *
 * REPORT
 * ------------------------------------------------------------------ */

console.log(
  `sitemap-routes: ${advertised.size} advertised URL(s) resolved against the built tree, ` +
    `${rules.length} redirect rule(s) and ${indexPages.length} built page(s).`
);
console.log(
  `  corpus: ${locs.length} sitemap <loc>, ${pages.length} built HTML page(s) each read for its own canonical,`
);
console.log(
  `          ${structuredDataSources} page-address claim(s) read out of JSON-LD (BreadcrumbList item, mainEntityOfPage).`
);
console.log(
  `  controls: ${probeIndex} served, ${negativePath} classified redirect, ` +
    `${CONTROL_MISSING} classified not-served.`
);

if (foreign.length) {
  console.log(`\n  ${foreign.length} URL(s) point at another origin and were not resolved here:`);
  for (const f of foreign) console.log(`    ${f.url}   (${[...f.sources].join(', ')})`);
}

if (uncanonicalled.length) {
  console.error(`\nsitemap-routes: ${uncanonicalled.length} built page(s) declare no canonical:`);
  for (const u of uncanonicalled) console.error(`    ${u}`);
  console.error('  A page with no canonical cannot be checked, and cannot tell a crawler where it lives.');
  process.exit(1);
}

if (failures.length) {
  console.error(`\nsitemap-routes: ${failures.length} of ${advertised.size} ADVERTISED URL(S) ARE NOT SERVED\n`);
  for (const f of failures) {
    console.error(`  ${f.url}`);
    console.error(`      ${f.kind === REDIRECT ? 'REDIRECTS' : 'DOES NOT RESOLVE'}: ${f.detail}`);
    console.error(`      advertised by: ${[...f.sources].join(', ')}`);
  }
  console.error('');
  console.error('  Search Console reports a sitemapped redirect as "Page with redirect" and indexes');
  console.error('  nothing behind it, and a self-referencing canonical that redirects is the same fault');
  console.error('  on the page itself.');
  console.error('');
  console.error('  FIX THE URL, NEVER THE SERVER. Adding a rule to make the advertised form serve 200');
  console.error('  means fighting Cloudflare canonicalisation, which is the documented cause of the');
  console.error('  2026-05-06 ERR_TOO_MANY_REDIRECTS incident recorded in _redirects block 3. The');
  console.error('  canonical is computed in src/components/seo/Seo.astro and the sitemap is derived');
  console.error('  from it, so both move together from that one place.');
  process.exit(1);
}

console.log(
  `\n  clean: all ${servedCount} advertised URL(s) resolve to a page this build serves with no redirect hop.`
);
