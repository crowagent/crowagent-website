/**
 * check-seo-parity.js — a build must not silently drop the metadata or the
 * structured data the LIVE SITE currently publishes.
 *
 * ── RE-POINTED 2026-08-05. READ THIS BEFORE THE REST. ──────────────────────
 *
 * WHAT IT USED TO DO. This file compared the Astro build against the LEGACY
 * page tree at the repo root, built into `dist/`. That was the right reference
 * for exactly as long as the legacy tree was what production served: the
 * question was "did the port lose a title, a canonical, an FAQPage block", and
 * the only honest place to ask it was the pages readers actually had.
 *
 * WHY THAT STOPPED MEANING ANYTHING. On 2026-08-05 the Cloudflare Pages deploy
 * source moved to `astro/dist`. The legacy tree still exists in the repo and is
 * served to nobody. From that moment this gate compared the shipping site
 * against a tree that does not ship, so a pass proved nothing about production
 * and a failure would have been a claim about a dead artefact. It is the same
 * defect, in the same week, as the one fixed in check-content-parity.js at
 * c46d8464, and the fix here is deliberately the same fix.
 *
 * IT WAS WORSE THAN POINTLESS, BECAUSE IT COULD ALSO SKIP ITSELF. The old code
 * ended its reference check with:
 *
 *     if (!fs.existsSync(LEGACY)) { console.log('... Skipped.'); process.exit(0); }
 *
 * so on any machine that had never run the ROOT build — which is now every
 * machine, because nobody has a reason to build a tree nobody serves — this
 * gate printed a line and exited 0 without comparing a single route. A gate
 * that passes when its reference is absent is not a gate. Board item A-91 had
 * already recorded the shape of this in writing, having crawled 44 routes and
 * found a large clean sheet: "check-seo-parity.js compares against the LEGACY
 * build, so every defect above would pass it unchanged so long as the legacy
 * build had the same shape."
 *
 * WHY RE-POINTED RATHER THAN RETIRED. The defect class did not go away with the
 * deploy-source switch, it changed tense: it used to be "the port drops a
 * canonical", it is now "a rebuild drops a canonical". Nothing else in the
 * chain would see it. check-content-parity.js reads headings, form controls and
 * link destinations, which is the body of the page and not its head.
 * check-links.js resolves link targets that are present. check-faq-parity.js
 * compares FAQPage JSON-LD against the visible prose, so it can tell you the
 * two disagree but not that the block left. check-csp.js reads headers. Not one
 * of them would notice a route shipping without a canonical, or an Article node
 * that stopped being emitted, and both cost rankings months later and silently.
 *
 * SO THE REFERENCE MOVED, AND ONLY THE REFERENCE. The extraction and the
 * comparison are unchanged, because they were never about the legacy tree
 * specifically: they assert that a field which existed still exists. What this
 * now compares against is `seo-parity.baseline.json`, a committed snapshot of
 * the CURRENTLY DEPLOYED build's head metadata and structured-data types.
 * Coverage goes from "however many Astro routes happen to have a legacy file of
 * the same name" to every route in the baseline, and it stops decaying, because
 * the baseline is refreshed with the site rather than with a tree that is
 * frozen by definition.
 *
 * ── WHAT IS ASSERTED ───────────────────────────────────────────────────────
 *
 * NOT A DIFF OF WORDS. Titles and descriptions are ALLOWED to change; copy gets
 * rewritten on purpose and a gate that fails on every edit is a gate people
 * learn to route around. What is not allowed is a field that existed and now
 * does not, or a structured-data type that was published and has vanished. So
 * each route reports:
 *
 *   MISSING   the baseline had it, this build does not   -> FAILURE
 *   CHANGED   both have it, values differ                -> reported
 *   ADDED     only this build has it                     -> reported
 *
 * Only MISSING fails. The other two are for a human to read, and ADDED is now
 * actually computed: the previous header promised it and the code never did it.
 *
 * ROBOTS IS REPORTED AND NEVER FATAL, on purpose. A route LOSING its robots
 * meta is usually a `noindex` being lifted, which is an improvement, and failing
 * a build for it would be perverse. A route GAINING one is the dangerous
 * direction, and that shows up under ADDED where a reader will see it. Making
 * it fatal in either direction would be wrong in one of them, so it sits in the
 * reported set with this sentence attached.
 *
 * ── REFRESHING THE BASELINE ────────────────────────────────────────────────
 *
 *   node scripts/check-seo-parity.js --update
 *
 * It prints every field and every schema type the new capture GIVES UP against
 * the old one, so a refresh cannot be a quiet way to make a red gate green:
 * whatever it drops is on the console and in the committed diff, and belongs in
 * the commit message. The build never passes --update.
 *
 * A capture is refused unless the tree looks whole, which is A-163's lesson
 * rather than caution in the abstract: a parity capture once read `dist` while a
 * build owned it, recorded a 404 for a route that serves 200, and deleted 84
 * lines of real captured data in a tracked file. `npm run build` clears the
 * output directory before it repopulates it, so anything reading dist mid-build
 * sees a tree with holes in it, and a baseline recording an absence makes the
 * next genuine absence look like no change at all. The guards are at
 * CAPTURE_GUARDS, and every capture records a fingerprint of the tree it read so
 * a later reader can tell whether it was valid.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const BASELINE = path.join(__dirname, 'seo-parity.baseline.json');
const REPO = path.join(__dirname, '..', '..');
const UPDATE = process.argv.includes('--update');

/*
 * A SUBTYPE SATISFIES ITS PARENT, and only in that direction. schema.org
 * defines BlogPosting as a subtype of Article, and Google's Article rich result
 * accepts Article, NewsArticle and BlogPosting interchangeably, so a page that
 * published Article and now publishes BlogPosting has become MORE specific, not
 * less. Flagging that as a loss would train the reader to ignore this check,
 * which is how a real loss gets through.
 *
 * Deliberately a short, explicit list rather than a schema.org hierarchy
 * lookup: every entry here is a judgement someone has to defend, and a general
 * rule would quietly excuse substitutions nobody reviewed.
 */
const SATISFIED_BY = {
  Article: ['BlogPosting', 'NewsArticle', 'TechArticle'],
  WebPage: ['CollectionPage', 'AboutPage', 'ContactPage', 'FAQPage'],
};

/*
 * The fields whose DISAPPEARANCE fails the build. `robots` is extracted and
 * reported but is deliberately absent from this list — see the header.
 */
const FATAL_FIELDS = ['title', 'description', 'canonical', 'ogTitle', 'ogImage', 'lang'];
const REPORTED_FIELDS = ['robots'];
const ALL_FIELDS = [...FATAL_FIELDS, ...REPORTED_FIELDS];

/* ------------------------------------------------------------------ */

function routes(dir, base = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) routes(path.join(dir, e.name), `${base}/${e.name}`, out);
    else if (e.name === 'index.html') out.push(base === '' ? '/' : `${base}/`);
  }
  return out;
}

const fileFor = (route) =>
  path.join(DIST, route === '/' ? 'index.html' : route.replace(/^\//, '') + 'index.html');

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};

function meta(html) {
  const ld = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node && node['@type']) ld.push(node['@type']);
        if (node && node['@graph']) for (const g of node['@graph']) if (g['@type']) ld.push(g['@type']);
      }
    } catch {
      /* An unparseable block is recorded rather than skipped: a JSON-LD script
         that no longer parses has stopped being structured data even though the
         tag is still on the page, and that is exactly the failure a reader would
         otherwise never see. */
      ld.push('UNPARSEABLE');
    }
  }
  return {
    title: pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i),
    canonical: pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
    ogTitle: pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i),
    ogImage: pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i),
    lang: pick(html, /<html[^>]+lang=["']([^"']*)["']/i),
    robots: pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i),
    schema: [...new Set(ld)].sort(),
  };
}

/* ------------------------------------------------------------------ *
 * CAPTURE
 * ------------------------------------------------------------------ */

/*
 * CAPTURE_GUARDS — A-163, and why a capture can be refused.
 *
 * Same contract as check-content-parity.js, for the same reason: a baseline is
 * a tracked file and a wrong one is worse than none, because it fails in the
 * safe-looking direction. MIN_BYTES catches the obvious hole. The ratio check is
 * the half that matters: a tree that has lost a fifth of its routes since the
 * last capture is either mid-build or a change nobody would refresh a baseline
 * over without saying so.
 *
 * The titled-route guard is this file's own addition and is specific to what it
 * measures. A route emitted without a <title> is a broken render, not a design
 * choice, and capturing one would record "this route has no title" as the
 * reference — after which the gate could never again report the route as having
 * lost its title, which is the single most valuable thing it checks.
 */
const CAPTURE_GUARDS = { MIN_BYTES: 1000, MIN_ROUTES_ABS: 10, MIN_ROUTES_RATIO: 0.8 };

function fingerprint(routeList) {
  const h = crypto.createHash('sha256');
  for (const r of routeList) h.update(`${r}:${fs.statSync(fileFor(r)).size}\n`);
  return 'sha256:' + h.digest('hex').slice(0, 16);
}

function headSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim();
  } catch {
    return null; // not a checkout, or no git. Provenance is weaker, not absent.
  }
}

function capture(previous) {
  const list = routes(DIST).sort();

  if (list.length < CAPTURE_GUARDS.MIN_ROUTES_ABS) {
    console.error(`seo-parity: REFUSING to capture — only ${list.length} route(s) in ${path.relative(REPO, DIST)}.`);
    console.error('  That is a tree mid-build or a failed build, not a site. Build first, then capture.');
    process.exit(1);
  }
  if (previous && list.length < previous.routeCount * CAPTURE_GUARDS.MIN_ROUTES_RATIO) {
    console.error(`seo-parity: REFUSING to capture — ${list.length} route(s) against a baseline of ${previous.routeCount}.`);
    console.error('  Nothing may read dist while a build owns it (A-163). If this drop is real and intended,');
    console.error('  say so in the commit and lower MIN_ROUTES_RATIO deliberately rather than by accident.');
    process.exit(1);
  }
  const thin = list.filter((r) => fs.statSync(fileFor(r)).size < CAPTURE_GUARDS.MIN_BYTES);
  if (thin.length) {
    console.error(`seo-parity: REFUSING to capture — ${thin.length} route(s) under ${CAPTURE_GUARDS.MIN_BYTES} bytes:`);
    for (const t of thin) console.error(`    ${t}  (${fs.statSync(fileFor(t)).size} bytes)`);
    console.error('  A page that small is a stub, an error document, or a half-written file.');
    process.exit(1);
  }

  const captured = {};
  for (const r of list) captured[r] = meta(fs.readFileSync(fileFor(r), 'utf8'));

  const untitled = list.filter((r) => !captured[r].title);
  if (untitled.length) {
    console.error(`seo-parity: REFUSING to capture — ${untitled.length} route(s) emitted no <title>:`);
    for (const u of untitled) console.error(`    ${u}`);
    console.error('  Recording that as the reference would permanently disarm the title check on those routes.');
    process.exit(1);
  }

  return {
    capturedAt: new Date().toISOString(),
    capturedFromCommit: headSha(),
    distFingerprint: fingerprint(list),
    routeCount: list.length,
    routes: captured,
  };
}

/*
 * Every signal the old baseline had that the new one does not, so a refresh is
 * never quiet. Printed at capture time and belonging in the commit message.
 */
function givenUp(prev, next) {
  const gone = [];
  if (!prev) return gone;
  for (const [route, b] of Object.entries(prev.routes || {})) {
    const n = next.routes[route];
    if (!n) { gone.push(`route ${route} (and all of its metadata)`); continue; }
    for (const f of ALL_FIELDS) if (b[f] && !n[f]) gone.push(`${route}  ${f}`);
    for (const t of b.schema || []) {
      if (t === 'UNPARSEABLE') continue;
      if ((n.schema || []).includes(t)) continue;
      const accepted = SATISFIED_BY[t] || [];
      if (accepted.some((x) => (n.schema || []).includes(x))) continue;
      gone.push(`${route}  structured data "${t}"`);
    }
  }
  return gone;
}

if (UPDATE) {
  if (!fs.existsSync(DIST)) {
    console.error('seo-parity: no build to capture. Run `npm run build:deploy` first.');
    process.exit(1);
  }
  const previous = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
  const next = capture(previous);
  const gone = givenUp(previous, next);

  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  const schemaCount = Object.values(next.routes).reduce((n, r) => n + r.schema.length, 0);
  console.log(`seo-parity: baseline captured — ${next.routeCount} route(s), ${schemaCount} structured-data type(s).`);
  console.log(`  fingerprint ${next.distFingerprint}   commit ${next.capturedFromCommit || '(unknown)'}`);
  if (gone.length) {
    console.log('');
    console.log(`  ${gone.length} SIGNAL(S) GIVEN UP by this refresh. Each is something the previous`);
    console.log('  baseline recorded and this build does not publish. Justify them in the commit message:');
    for (const g of gone) console.log(`    ${g}`);
  } else if (previous) {
    console.log('  Nothing given up: this build publishes everything the previous baseline recorded.');
  }
  process.exit(0);
}

/* ------------------------------------------------------------------ *
 * CHECK
 * ------------------------------------------------------------------ */

/*
 * A MISSING REFERENCE IS A FAILURE, NOT A SKIP, and this is the change that
 * matters most. The legacy version exited 0 with "no legacy dist/ to compare
 * against — Skipped", which was defensible when the reference was a separate
 * build the person running this could not be expected to have. It is not
 * defensible now: the baseline is a committed file in this directory, so its
 * absence means the repo is broken or someone deleted the thing that makes this
 * gate a gate.
 */
if (!fs.existsSync(BASELINE)) {
  console.error('seo-parity: NO BASELINE. Expected a committed snapshot at');
  console.error(`  ${path.relative(REPO, BASELINE)}`);
  console.error('  It is the record of the metadata the live site publishes, so without it this check');
  console.error('  asserts nothing. Restore it from git. Capture a new one only from a build you');
  console.error('  intend to deploy:');
  console.error('    node scripts/check-seo-parity.js --update');
  process.exit(1);
}
if (!fs.existsSync(DIST)) {
  console.error('seo-parity: no build at astro/dist. Run the build before the gates.');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const built = new Set(routes(DIST).sort());

const missing = [];  // field or schema type gone -> failure
const changed = [];  // both sides have it, values differ -> reported
const added = [];    // only this build has it -> reported
const absent = [];   // baselined route this build does not ship -> reported, see below
let compared = 0;

for (const [route, b] of Object.entries(baseline.routes)) {
  if (!built.has(route)) {
    /* Deliberately NOT fatal here, and not silent either. A route disappearing
       is a bigger fact than any field on it, and check-content-parity.js already
       owns it: it fails on a vanished route unless the route is in its
       RETIRED_ROUTES map, which also asserts the 301 exists and carries no bang.
       Duplicating that would mean a second retired-route list to keep in step
       with the first, and two lists that must agree are one list that will not.
       So this prints the route and leaves the verdict where the assertion is. */
    absent.push(route);
    continue;
  }

  compared++;
  const a = meta(fs.readFileSync(fileFor(route), 'utf8'));

  for (const f of ALL_FIELDS) {
    const fatal = FATAL_FIELDS.includes(f);
    if (b[f] && !a[f]) {
      if (fatal) missing.push(`${route}  ${f} is published on the live site and is gone`);
      else changed.push({ route, f: `${f} (dropped)`, note: 'reported, never fatal' });
    } else if (!b[f] && a[f]) {
      added.push({ route, f, to: a[f] });
    } else if (b[f] && a[f] && b[f] !== a[f]) {
      changed.push({ route, f, from: b[f], to: a[f] });
    }
  }

  for (const type of b.schema || []) {
    if (type === 'UNPARSEABLE') continue;
    if (a.schema.includes(type)) continue;
    const accepted = SATISFIED_BY[type] || [];
    const sub = accepted.find((t) => a.schema.includes(t));
    if (sub) {
      changed.push({ route, f: `${type} -> ${sub}`, from: type, to: 'subtype' });
      continue;
    }
    missing.push(`${route}  structured data "${type}" is published on the live site and is gone`);
  }

  for (const type of a.schema) {
    if (type === 'UNPARSEABLE') {
      /* Not a loss, so it cannot go in `missing`, but it is a real defect: a
         JSON-LD block that stopped parsing publishes nothing while looking like
         it publishes something. Reported loudly rather than counted as an
         addition. */
      added.push({ route, f: 'structured data', to: 'a JSON-LD block that DOES NOT PARSE' });
      continue;
    }
    if (!(b.schema || []).includes(type)) added.push({ route, f: 'structured data', to: type });
  }
}

/* A route this build ships that the baseline never saw. Not a fault — it is how
   new pages arrive — but its metadata is UNPROTECTED until the baseline is
   refreshed, and that is the exact way the legacy version's coverage decayed to
   nothing while staying green. Printed so the decay is visible. */
const fresh = [...built].filter((r) => !(r in baseline.routes)).sort();

/* ------------------------------------------------------------------ *
 * REPORT
 * ------------------------------------------------------------------ */

console.log(
  `seo-parity: ${compared} of ${baseline.routeCount} baselined route(s) compared against the deployed build.`
);
console.log(
  `  baseline captured ${baseline.capturedAt} at ${(baseline.capturedFromCommit || '(no commit)').slice(0, 8)}, ${baseline.distFingerprint}\n`
);

if (fresh.length) {
  console.log(`  ${fresh.length} route(s) in this build are NOT in the baseline, so their metadata is not protected yet:`);
  for (const f of fresh) console.log(`    ${f}`);
  console.log('    Refresh the baseline once they are what you intend to ship: --update');
  console.log('');
}

if (absent.length) {
  console.log(`  ${absent.length} baselined route(s) are not in this build, so nothing was compared on them:`);
  for (const a of absent) console.log(`    ${a}`);
  console.log('    check-content-parity.js owns whether that is a retirement or a regression.');
  console.log('');
}

if (added.length) {
  console.log(`  ${added.length} field(s) this build publishes and the baseline did not:`);
  const byRoute = {};
  for (const a of added) (byRoute[a.route] ??= []).push(`${a.f}=${a.to}`);
  for (const [r, fields] of Object.entries(byRoute)) console.log(`    ${r.padEnd(42)} ${fields.join(', ')}`);
  console.log('');
}

if (changed.length) {
  console.log(`  ${changed.length} field(s) changed value (allowed — copy gets rewritten on purpose):`);
  const byRoute = {};
  for (const c of changed) (byRoute[c.route] ??= []).push(c.f);
  for (const [r, fields] of Object.entries(byRoute)) console.log(`    ${r.padEnd(42)} ${fields.join(', ')}`);
  console.log('');
}

if (missing.length) {
  console.error(`seo-parity: ${missing.length} FIELD(S) LOST\n`);
  missing.forEach((m) => console.error(`  ${m}`));
  console.error('');
  console.error('  Each is metadata a crawler reads on the live site right now and would not read');
  console.error('  after this build. Restore it, or refresh the baseline with --update if this build');
  console.error('  is the one you intend to deploy and the loss is deliberate.');
  console.error('');
  process.exit(1);
}

console.log('  nothing lost: every title, description, canonical, og tag, lang and');
console.log('  structured-data type the live site publishes is still published by this build.');
