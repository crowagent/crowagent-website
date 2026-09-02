/**
 * audit-release.mjs
 *
 * Accessibility (axe-core) and performance (Lighthouse) over the routes that
 * actually ship. Run by hand at release time. Costs nothing.
 *
 * ── DELIBERATELY NOT IN CI, AND THIS IS THE REASON ──────────────────────────
 *
 * This replaces `.github/workflows/quality-gate.yml` and
 * `.github/workflows/lighthouse-ci.yml`, both deleted on 2026-09-01. Between
 * them they burned about 15 billed GitHub Actions minutes a week, had failed 18
 * consecutive runs since 2026-08-05, and audited the LEGACY root tree at URLs
 * such as `/pricing.html` and `/contact.html` that the live site answers with a
 * 404. They measured a site nobody is served, at a price, and went red doing it.
 *
 * Under RULE 0-G, wiring a gate into CI converts a free script into a blocking,
 * billable one, and that conversion needs the owner's explicit approval. It has
 * not been given, so THERE IS NO WORKFLOW FILE FOR THIS AND NONE SHOULD BE
 * ADDED WITHOUT ASKING. Everything below runs on the developer machine, against
 * a local build or the live domain, for zero Actions minutes and zero Vercel or
 * Cloudflare build minutes. `npm run audit:release` is the whole interface.
 *
 * ── THE TWO TRAPS THIS SCRIPT IS BUILT AROUND ───────────────────────────────
 *
 * 1. LIGHTHOUSE EXITS 1 ON A SUCCESSFUL AUDIT ON THIS MACHINE. chrome-launcher
 *    cannot delete its Windows temp profile directory and the failure surfaces
 *    as a non-zero exit long after a perfectly good report has been produced.
 *    So this script never runs the Lighthouse CLI and never reads an exit code.
 *    It calls the Node API, keeps the LHR object, and derives its verdict from
 *    the report alone. Teardown runs inside a try/catch whose only effect is a
 *    printed note. READ THE REPORT, NEVER THE EXIT CODE.
 *
 * 2. A 404 OR A REDIRECT SCORES JUST FINE. A missing page has a title, a body,
 *    a paint and a score, so it yields plausible numbers that mean nothing. A
 *    Lighthouse run on the sibling platform repo once audited six URLs that all
 *    redirected to `/login` and reported them as six pages. The deleted
 *    workflow scored `/pricing.html`, which 404s. So NOTHING IS AUDITED UNTIL
 *    IT HAS LANDED ON ITSELF: every route is fetched first and must return 200,
 *    must not have been redirected anywhere, and must not be serving the 404
 *    document. Any route that fails that stops the run before a single number
 *    is collected, and it is printed loudly rather than skipped quietly.
 *
 * ── WHAT IT MEASURES ────────────────────────────────────────────────────────
 *
 *   Accessibility  axe-core, every shipped route, WCAG 2.0/2.1 A and AA tags.
 *                  Any violation at serious or critical impact FAILS. Moderate
 *                  and minor are printed and do not fail, because they include
 *                  advisory rules the site has open decisions on.
 *
 *   Performance    Lighthouse, desktop preset by default so the figures are
 *                  comparable with the last baseline this repo recorded
 *                  (lighthouserc.json, 2026-08-02). Accessibility,
 *                  best-practices and SEO categories FAIL below threshold.
 *                  Performance is REPORTED and does not fail unless
 *                  --fail-on-perf is passed. See the caveat below: on this
 *                  machine the performance number is not trustworthy enough to
 *                  block a release on, and a gate that cries wolf gets deleted.
 *
 * ── THE CPU CAVEAT, WHICH IS NOT OPTIONAL READING ───────────────────────────
 *
 * Lighthouse records a `benchmarkIndex` for the host machine on every run, and
 * on this host that number MOVES: 475 to 561 while the machine was busy, with
 * Lighthouse attaching its slow-CPU warning to every one of those runs, and
 * 1026 to 1333 on an otherwise idle machine with no warning at all. Same
 * hardware, a factor of two apart. So the script does not carry a hardcoded
 * verdict about the CPU. It prints the benchmarkIndex this run measured and the
 * warnings Lighthouse itself raised, and picks its caveat text from those.
 *
 * What holds either way: a lab run on one developer machine is a REGRESSION
 * SIGNAL and an upper bound, never the field experience. Without --live the
 * network is simulated over a local static server, so real DNS, TLS, Cloudflare
 * edge and origin latency are all excluded. For a real-world figure use CrUX.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *
 *   npm run audit:release                 built artefact at astro/dist
 *   npm run audit:release -- --live       https://crowagent.ai
 *   npm run audit:release -- --base=http://localhost:8095
 *   npm run audit:release -- --lh-all     Lighthouse on all 45 routes, slow
 *   npm run audit:release -- --mobile     mobile preset instead of desktop
 *   npm run audit:release -- --fail-on-perf
 *   npm run audit:release -- --routes=/,/pricing/
 *   npm run audit:release -- --skip-lh    axe only, about a minute
 *   npm run audit:release -- --skip-axe   Lighthouse only
 *
 * Exit 0 when every preflight landed, no serious or critical axe violation was
 * found, and every gating Lighthouse category met its threshold. Exit 1
 * otherwise. Full JSON goes to audit-results/, which is gitignored.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDist, routesOf } from '../astro/scripts/lib/dist-server.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'astro', 'dist');
const SRC = path.join(ROOT, 'astro', 'src');
const OUT_DIR = path.join(ROOT, 'audit-results');

/* ── arguments ──────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const hit = argv.find((a) => a.startsWith(`${f}=`));
  return hit ? hit.slice(f.length + 1) : null;
};

const OPT = {
  live: has('--live'),
  base: val('--base'),
  lhAll: has('--lh-all'),
  mobile: has('--mobile'),
  failOnPerf: has('--fail-on-perf'),
  skipLh: has('--skip-lh'),
  skipAxe: has('--skip-axe'),
  routes: val('--routes'),
};

/* Category thresholds. Performance sits here for reporting only unless
   --fail-on-perf is given. The three that gate are the ones that do not move
   with host CPU: they are deterministic properties of the document.
   Values carried forward from lighthouserc.json, which set them from a
   measurement on 2026-08-02 rather than from a guess. */
const THRESHOLDS = {
  performance: 0.85,
  accessibility: 0.95,
  'best-practices': 0.95,
  seo: 0.95,
};
const GATING_CATEGORIES = ['accessibility', 'best-practices', 'seo'];

/* Lighthouse is expensive, roughly 20 to 40 seconds a route on this machine, so
   the default set is ONE ROUTE PER PAGE TEMPLATE rather than all 45. This is a
   sampling decision and it is recorded as one: a template's performance is a
   property of its layout and its assets, and the 9 blog posts, 4 comparisons,
   4 sectors and 4 legal pages each share theirs. --lh-all audits every route
   when a release wants the full sweep. Axe always covers all 45 regardless. */
const LH_TEMPLATE_SAMPLE = [
  '/',
  '/pricing/',
  '/crowmark/',
  '/crowmark-buyers/',
  '/contact/',
  '/blog/',
  '/blog/procurement-act-2023-sme-guide/',
  '/compare/crowmark-vs-autogenai/',
  '/sectors/construction/',
  '/glossary/ppn-026/',
  '/tools/tender-compliance-matrix/',
  '/privacy/',
];

/* ── small helpers ──────────────────────────────────────────────────────── */

const line = (s = '') => console.log(s);
const bar = (c = '=') => line(c.repeat(78));

function fmtMs(v) {
  return v == null ? 'n/a' : `${Math.round(v)} ms`;
}

/** The 404 document's title, so a soft 404 cannot pose as a page. */
function notFoundTitle() {
  const f = path.join(DIST, '404.html');
  if (!fs.existsSync(f)) return null;
  const m = fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

/** Newest mtime under a directory, so a stale build cannot be audited silently. */
function newestMtime(dir) {
  let newest = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const m = fs.statSync(p).mtimeMs;
        if (m > newest) newest = m;
      }
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return newest;
}

/* ── preflight: assert the landed URL and status before measuring ────────── */

/**
 * TRAP 2. Every route must answer 200, at its own address, with a document that
 * is not the 404 page. A route that fails any of the three is a hard stop.
 */
async function preflight(urlFor, routes, badTitle) {
  const results = [];
  for (const route of routes) {
    const target = urlFor(route);
    let row = { route, target, ok: false, status: null, landed: null, why: null };
    try {
      const res = await fetch(target, { redirect: 'follow', headers: { 'User-Agent': 'crowagent-release-audit' } });
      const body = await res.text();
      row.status = res.status;
      row.landed = res.url;

      const wanted = new URL(target);
      const landed = new URL(res.url);
      const samePath = wanted.pathname.replace(/\/+$/, '/') === landed.pathname.replace(/\/+$/, '/');

      const titleMatch = body.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      if (res.status !== 200) row.why = `status ${res.status}, expected 200`;
      else if (landed.origin !== wanted.origin || !samePath) row.why = `redirected to ${res.url}`;
      else if (badTitle && title === badTitle) row.why = `serving the 404 document (title "${title}")`;
      else if (body.length < 500) row.why = `body is only ${body.length} bytes, too small to be a real page`;
      else {
        row.ok = true;
        row.title = title;
      }
    } catch (err) {
      row.why = `request failed: ${err.message}`;
    }
    results.push(row);
  }
  return results;
}

/* ── accessibility: axe-core over every shipped route ────────────────────── */

async function runAxe(urlFor, routes) {
  const { chromium } = await import('playwright');
  const { default: AxeBuilder } = await import('@axe-core/playwright');

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const rows = [];

  for (const route of routes) {
    process.stdout.write(`  axe ${route} ... `);
    try {
      await page.goto(urlFor(route), { waitUntil: 'networkidle', timeout: 45000 });
      const res = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const byImpact = { critical: [], serious: [], moderate: [], minor: [] };
      for (const v of res.violations) {
        (byImpact[v.impact] ||= []).push({ id: v.id, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') });
      }
      const blocking = byImpact.critical.length + byImpact.serious.length;
      rows.push({ route, byImpact, blocking, total: res.violations.length });
      line(blocking ? `${blocking} BLOCKING, ${res.violations.length} total` : `clean (${res.violations.length} advisory)`);
    } catch (err) {
      rows.push({ route, error: err.message, blocking: 1, total: 0, byImpact: {} });
      line(`ERROR ${err.message}`);
    }
  }

  await browser.close();
  return rows;
}

/* ── performance: Lighthouse via the Node API, never the CLI ─────────────── */

async function runLighthouse(urlFor, routes) {
  const { default: lighthouse } = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');

  let chrome = null;
  const rows = [];

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    for (const route of routes) {
      process.stdout.write(`  lighthouse ${route} ... `);

      const config = {
        extends: 'lighthouse:default',
        settings: OPT.mobile ? {} : { formFactor: 'desktop', screenEmulation: { disabled: true }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } },
      };
      const opts = { port: chrome.port, output: 'json', logLevel: 'error' };

      /* ONE RETRY, AND ONLY FOR A TRACE FAULT. NO_NAVSTART and its siblings are
         Lighthouse failing to record the page load, not the page failing to
         load: measured on /pricing/ over the live domain on 2026-09-01, where
         the immediate retry scored normally. Retrying a genuine failure would
         be the thing RULE 0-G calls rerunning until green, so nothing else is
         retried, and a second trace fault is reported as the error it is. */
      let runnerResult = await lighthouse(urlFor(route), opts, config);
      if (!runnerResult?.lhr || runnerResult.lhr.runtimeError) {
        process.stdout.write('trace fault, one retry ... ');
        runnerResult = await lighthouse(urlFor(route), opts, config);
      }

      /* TRAP 1. The verdict comes from the report object. No exit code is read
         anywhere in this function, and there is no CLI process to read one from. */
      const lhr = runnerResult?.lhr;
      if (!lhr) {
        rows.push({ route, error: 'lighthouse returned no report' });
        line('ERROR no report');
        continue;
      }
      if (lhr.runtimeError) {
        rows.push({ route, error: `${lhr.runtimeError.code}: ${lhr.runtimeError.message}` });
        line(`ERROR ${lhr.runtimeError.code}`);
        continue;
      }

      const cat = (id) => (lhr.categories[id] ? lhr.categories[id].score : null);
      const aud = (id) => (lhr.audits[id] ? lhr.audits[id].numericValue : null);

      /* A CATEGORY SCORE NAMES NOTHING. "best-practices 92" is not something
         anybody can act on, which is the same defect check-cwv.js was written to
         fix when its predecessor printed a CLS figure and no element. So every
         category carries the list of audits that actually cost it points. */
      const failingAudits = (id) => {
        const c = lhr.categories[id];
        if (!c) return [];
        return c.auditRefs
          .map((ref) => lhr.audits[ref.id])
          .filter((a) => a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable')
          .map((a) => ({ id: a.id, title: a.title, score: a.score, display: a.displayValue || null }));
      };

      const row = {
        route,
        finalUrl: lhr.finalDisplayedUrl || lhr.finalUrl,
        scores: {
          performance: cat('performance'),
          accessibility: cat('accessibility'),
          'best-practices': cat('best-practices'),
          seo: cat('seo'),
        },
        failing: {
          performance: failingAudits('performance'),
          accessibility: failingAudits('accessibility'),
          'best-practices': failingAudits('best-practices'),
          seo: failingAudits('seo'),
        },
        metrics: {
          fcp: aud('first-contentful-paint'),
          lcp: aud('largest-contentful-paint'),
          tbt: aud('total-blocking-time'),
          cls: lhr.audits['cumulative-layout-shift']?.numericValue,
          tti: aud('interactive'),
          si: aud('speed-index'),
        },
        benchmarkIndex: lhr.environment?.benchmarkIndex,
        warnings: lhr.runWarnings || [],
      };
      rows.push(row);
      line(
        `perf ${Math.round((row.scores.performance ?? 0) * 100)} a11y ${Math.round((row.scores.accessibility ?? 0) * 100)} ` +
          `bp ${Math.round((row.scores['best-practices'] ?? 0) * 100)} seo ${Math.round((row.scores.seo ?? 0) * 100)}`,
      );
    }
  } finally {
    /* TRAP 1 again, the other half. chrome-launcher fails to remove its Windows
       temp profile and throws here. It has nothing to do with the audit, so it
       is caught, named and discarded. Letting it propagate is exactly how a
       clean run gets reported as broken. */
    if (chrome) {
      try {
        await chrome.kill();
      } catch (err) {
        line(`  note: chrome teardown could not remove its temp profile (${err.code || err.message}). Harmless, and it is why this script never reads an exit code.`);
      }
    }
  }

  return rows;
}

/* ── main ───────────────────────────────────────────────────────────────── */

async function main() {
  bar();
  line('CROWAGENT WEBSITE RELEASE AUDIT');
  line('Accessibility (axe-core) and performance (Lighthouse). Local, free, not in CI.');
  bar();

  if (!fs.existsSync(DIST)) {
    console.error(`No build at ${DIST}. Run: cd astro && npm run build:deploy`);
    process.exit(1);
  }

  const allRoutes = routesOf(DIST);
  const routes = OPT.routes ? OPT.routes.split(',').map((r) => r.trim()).filter(Boolean) : allRoutes;

  /* A build older than the source it was built from is a stale artefact, and a
     number measured on one describes a site that is not the one under review. */
  const distAge = newestMtime(DIST);
  const srcAge = newestMtime(SRC);
  if (srcAge > distAge) {
    line('');
    line('WARNING: astro/src has been edited since astro/dist was built.');
    line(`  dist newest ${new Date(distAge).toISOString()}`);
    line(`  src  newest ${new Date(srcAge).toISOString()}`);
    line('  These numbers describe the OLD build. Rebuild before trusting them.');
  }

  let server = null;
  let base = null;
  if (OPT.live) base = 'https://crowagent.ai';
  else if (OPT.base) base = OPT.base.replace(/\/+$/, '');

  const urlFor = base ? (route) => `${base}${route}` : null;
  let resolve = urlFor;
  if (!base) {
    server = await serveDist(DIST, 'audit-release', 'It audits the built artefact, so it needs one.');
    resolve = (route) => server.url(route);
  }

  line('');
  line(`Target       ${base || 'astro/dist over a local server on an ephemeral port'}`);
  line(`Routes       ${routes.length} shipped`);
  line(`Preset       ${OPT.mobile ? 'mobile (4x CPU throttle)' : 'desktop (no CPU throttle)'}`);
  line('');

  /* ── PREFLIGHT ─────────────────────────────────────────────────────────── */
  line('PREFLIGHT: every route must land on itself with a 200 before anything is measured.');
  const pre = await preflight(resolve, routes, notFoundTitle());
  const bad = pre.filter((r) => !r.ok);

  if (bad.length) {
    line('');
    bar('!');
    line(`PREFLIGHT FAILED. ${bad.length} of ${routes.length} routes did not land on themselves.`);
    line('Nothing was audited. A 404 or a redirect produces plausible scores that mean nothing,');
    line('so the run stops here rather than reporting numbers for pages nobody is served.');
    bar('!');
    for (const r of bad) line(`  ${r.route}  ->  ${r.why}`);
    if (server) server.close();
    /* NOT process.exit(). Calling it here aborts libuv mid-close on Windows
       ("Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)") which replaces
       a clean exit 1 with a crash, and a crash is a different thing to report
       than a failed audit. Setting exitCode lets the server finish closing. */
    process.exitCode = 1;
    return;
  }
  line(`  all ${routes.length} routes returned 200 at their own address`);
  line('');

  /* ── AXE ───────────────────────────────────────────────────────────────── */
  let axeRows = [];
  if (!OPT.skipAxe) {
    line(`ACCESSIBILITY: axe-core over all ${routes.length} routes, WCAG 2.0/2.1 A and AA.`);
    axeRows = await runAxe(resolve, routes);
    line('');
  }

  /* ── LIGHTHOUSE ────────────────────────────────────────────────────────── */
  let lhRows = [];
  if (!OPT.skipLh) {
    const lhRoutes = (OPT.routes || OPT.lhAll) ? routes : LH_TEMPLATE_SAMPLE.filter((r) => routes.includes(r));
    line(`PERFORMANCE: Lighthouse over ${lhRoutes.length} routes${OPT.lhAll || OPT.routes ? '' : ' (one per page template, --lh-all for every route)'}.`);
    lhRows = await runLighthouse(resolve, lhRoutes);
    line('');
  }

  if (server) server.close();

  /* ── REPORT ────────────────────────────────────────────────────────────── */
  bar();
  line('RESULTS');
  bar();

  let failed = false;

  if (axeRows.length) {
    const blocking = axeRows.filter((r) => r.blocking > 0);
    const advisory = axeRows.filter((r) => !r.blocking && r.total > 0);
    line('');
    line(`ACCESSIBILITY  ${axeRows.length} routes swept`);
    if (blocking.length) {
      failed = true;
      line(`  FAIL. ${blocking.length} route(s) carry a serious or critical violation.`);
      for (const r of blocking) {
        line(`    ${r.route}`);
        if (r.error) line(`      ERROR ${r.error}`);
        for (const impact of ['critical', 'serious']) {
          for (const v of r.byImpact[impact] || []) line(`      [${impact}] ${v.id}: ${v.help} (${v.nodes} node(s), e.g. ${v.sample})`);
        }
      }
    } else {
      line('  PASS. No serious or critical violation on any shipped route.');
    }
    if (advisory.length) {
      line(`  ${advisory.length} route(s) carry moderate or minor findings, reported and not gating:`);
      const seen = new Map();
      for (const r of advisory) {
        for (const impact of ['moderate', 'minor']) {
          for (const v of r.byImpact[impact] || []) {
            const k = `${impact}|${v.id}`;
            seen.set(k, (seen.get(k) || 0) + 1);
          }
        }
      }
      for (const [k, n] of [...seen].sort((a, b) => b[1] - a[1])) line(`    ${k.replace('|', ' ')} on ${n} route(s)`);
    }
  }

  if (lhRows.length) {
    line('');
    line(`PERFORMANCE  ${lhRows.length} routes scored`);
    const bench = lhRows.map((r) => r.benchmarkIndex).filter(Boolean);
    line('');
    line('  route                                    perf  a11y  bp  seo    FCP      LCP      TBT      CLS');
    for (const r of lhRows) {
      if (r.error) {
        failed = true;
        line(`  ${r.route.padEnd(40)} ERROR ${r.error}`);
        continue;
      }
      const pct = (v) => String(Math.round((v ?? 0) * 100)).padStart(4);
      line(
        `  ${r.route.padEnd(40)}${pct(r.scores.performance)}${pct(r.scores.accessibility)}${pct(r.scores['best-practices'])}${pct(r.scores.seo)}  ` +
          `${fmtMs(r.metrics.fcp).padStart(8)} ${fmtMs(r.metrics.lcp).padStart(8)} ${fmtMs(r.metrics.tbt).padStart(8)}  ${(r.metrics.cls ?? 0).toFixed(3)}`,
      );
    }

    line('');
    for (const r of lhRows) {
      if (r.error) continue;
      const named = (c) => {
        for (const a of r.failing?.[c] || []) line(`         ${a.id}: ${a.title}${a.display ? ` (${a.display})` : ''}`);
      };
      for (const c of GATING_CATEGORIES) {
        if ((r.scores[c] ?? 0) < THRESHOLDS[c]) {
          failed = true;
          line(`  FAIL ${r.route} ${c} ${Math.round(r.scores[c] * 100)} is below the ${THRESHOLDS[c] * 100} threshold`);
          named(c);
        }
      }
      if ((r.scores.performance ?? 0) < THRESHOLDS.performance) {
        if (OPT.failOnPerf) failed = true;
        line(`  ${OPT.failOnPerf ? 'FAIL' : 'FLAG'} ${r.route} performance ${Math.round(r.scores.performance * 100)} is below the ${THRESHOLDS.performance * 100} threshold`);
        named('performance');
      }
    }

    /* The caveat is DERIVED, never asserted. benchmarkIndex is remeasured on
       every run and moves a long way with whatever else the machine is doing:
       this host has recorded 475 under load and 1333 idle. Hardcoding "the CPU
       is slow" would state a fact about one past run as a fact about this one,
       so the text below is chosen from what this run actually measured, and the
       slow-CPU line only appears when Lighthouse itself raised it. */
    const warns = [...new Set(lhRows.flatMap((r) => r.warnings || []))];
    if (bench.length) {
      const lo = Math.min(...bench);
      const hi = Math.max(...bench);
      const slow = lo < 1000;
      line('');
      line('  HOW MUCH TO TRUST THE TIMINGS ABOVE');
      line(`  Measured this run: benchmarkIndex ${lo === hi ? lo : `${lo} to ${hi}`}. Lighthouse raised ${warns.length} run warning(s).`);
      if (slow) {
        line('  Under 1000 is the band where host CPU starts dominating the result. Every timing');
        line('  above is PESSIMISTIC against typical visitor hardware, by an amount that is not a');
        line('  fixed offset you can subtract. Read them as an upper bound, not as an experience.');
      } else {
        line('  Above 1000, so the host was not the bottleneck on this run. The figures are still a');
        line('  single sample on one machine, and benchmarkIndex on this host has been measured as');
        line('  low as 475 under load, so a run that looks worse may be the machine and not the site.');
      }
      if (!base) {
        line('  The network is SIMULATED over a local server, so these numbers exclude real DNS, TLS,');
        line('  Cloudflare edge and origin latency. Use --live for the figure a visitor gets.');
        line('');
        line('  AND THE PART A LOCAL RUN CANNOT SEE AT ALL. The dist server sends the built bytes and');
        line('  NO HEADERS: no CSP, no HSTS, none of the _headers file, and none of the scripts');
        line('  Cloudflare injects at the edge after every build step has run. Measured 2026-09-01,');
        line('  that gap is worth 8 best-practices points: every route scored 100 locally and 92 live,');
        line('  because Cloudflare JavaScript Detections is edge-injected into the served HTML and');
        line('  CSP-blocked there. IT IS NOT INJECTED AT RUNTIME, and calling it that sends the next');
        line('  reader hunting for a script that does not exist. It sits in the served markup as the');
        line('  last inline <script> in <body>, carrying window.__CF$cv$params and a per-request');
        line('  CF-RAY id, so its SHA-256 differs on EVERY response and no hash can ever admit it.');
        line('  Four consecutive fetches on 2026-09-01 gave four different hashes. Comparing the');
        line('  served HTML against one hash from one audit run therefore reports a false absence.');
        line('  No build-time gate can see it: the injection happens after the build. See OA-35.');
        line('  A local PASS is not evidence about production.');
        line('  Run --live before a release. It is the only mode that measures what is served.');
      }
      line('  For a real-world number use field data (CrUX), not a lab run.');
    }
    if (warns.length) {
      line('');
      line('  Lighthouse run warnings:');
      for (const w of warns) line(`    ${w}`);
    }
  }

  /* ── PERSIST ───────────────────────────────────────────────────────────── */
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(OUT_DIR, `release-audit-${stamp}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        target: base || 'astro/dist (local ephemeral server)',
        preset: OPT.mobile ? 'mobile' : 'desktop',
        routesShipped: allRoutes.length,
        routesAudited: routes.length,
        preflight: pre,
        axe: axeRows,
        lighthouse: lhRows,
        thresholds: THRESHOLDS,
        gatingCategories: GATING_CATEGORIES,
        performanceGates: OPT.failOnPerf,
        verdict: failed ? 'FAIL' : 'PASS',
      },
      null,
      2,
    ),
  );

  line('');
  bar();
  line(`VERDICT: ${failed ? 'FAIL' : 'PASS'}`);
  line(`Full JSON: ${outFile}`);
  line('This script is NOT wired into CI, by design. See the header for why.');
  bar();

  process.exitCode = failed ? 1 : 0;
}

main().catch((err) => {
  console.error('audit-release: unrecoverable error');
  console.error(err);
  process.exit(1);
});
