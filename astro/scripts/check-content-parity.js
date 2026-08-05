/**
 * check-content-parity.js — a build must not silently drop content the LIVE
 * SITE currently serves.
 *
 * ── RE-POINTED 2026-08-05 (R262-WEB-02). READ THIS BEFORE THE REST. ─────────
 *
 * WHAT IT USED TO DO. This file compared the Astro build against the LEGACY
 * page tree at the repo root, built into `dist/`. That was the right reference
 * for exactly as long as the legacy tree was the thing production served: the
 * question was "did the port lose anything", and the answer had to be checked
 * against the pages readers actually had.
 *
 * WHY THAT STOPPED MEANING ANYTHING. On 2026-08-05 the Cloudflare Pages deploy
 * source moved to `astro/dist`. The legacy tree still exists in the repo and is
 * no longer deployed to anyone. From that moment the gate was comparing the
 * shipping site against a tree that does not ship, so a pass proved nothing
 * about production and a failure would have been a claim about a dead artefact.
 *
 * IT WAS NOT MERELY POINTLESS, IT WAS GREEN AND POINTLESS, WHICH IS WORSE. The
 * state on build 26, measured rather than remembered:
 *
 *   - it reported `40 route(s) compared ... nothing lost` and exited 0;
 *   - it printed, in the same run, that its own baseline was 2265 minutes
 *     (37.7 hours) older than the legacy source, a warning that could only be
 *     cleared by rebuilding a tree nobody serves;
 *   - 2 of the 42 deployed routes had NO legacy counterpart and were therefore
 *     outside the check entirely: `/sources/` (19 headings, 1 control) and
 *     `/tools/tender-compliance-matrix/` (5 headings, 2 controls). The second
 *     is the site's ONLY free tool. Every control on it was unguarded;
 *   - the deployed build carries 735 headings and 66 form controls. The legacy
 *     side of the comparison carried 619 and 23. So at best the gate could
 *     protect a third of the site's form controls, and the fraction was
 *     designed to shrink: every page written after the switch has no legacy
 *     counterpart and never will.
 *
 * That is a gate whose covered surface decays towards zero while its output
 * stays green. The tracker's instruction was "re-point it at the deployed tree
 * or retire it — but do not leave a green gate that cannot fail meaningfully."
 *
 * WHY RE-POINTED RATHER THAN RETIRED. The defect class this file was written
 * for did not go away with the deploy-source switch; it changed tense. It used
 * to be "the port drops a block". It is now "a rebuild drops a block". Nothing
 * else in the chain would see it: check-seo-parity.js compares titles,
 * descriptions, canonicals, og tags and structured-data types; check-links.js
 * resolves link targets that are present; check-csp.js reads headers. Not one
 * of them looks at what is on the page. That is how, before this file existed,
 * 38 routes passed every gate on three browser engines while /contact lost
 * "Send us an email", "What you will see on the call" and the newsletter
 * signup, and /about lost the same signup — a lead-capture mechanism gone, and
 * nothing in the build said a word. Retiring this file would hand that hole
 * back.
 *
 * SO THE REFERENCE MOVED, AND ONLY THE REFERENCE. The comparison logic is
 * unchanged, because it was never about the legacy tree specifically: it
 * asserts that three kinds of thing that existed still exist. What it now
 * compares against is `content-parity.baseline.json`, a committed snapshot of
 * the CURRENTLY DEPLOYED build's content signals. Coverage goes from 40 of 42
 * routes against a dead tree to 42 of 42 against the live one, and it stops
 * decaying, because the baseline is refreshed with the site.
 *
 * ── WHAT IS ASSERTED ───────────────────────────────────────────────────────
 *
 * NOT A DIFF OF WORDS. Copy gets rewritten on purpose, so near-matches are fine
 * and prose is not compared at all. Three kinds of thing must still exist:
 *
 *   HEADING        an h1-h4 whose text has no close counterpart in the build
 *   FORM CONTROL   an input/select/textarea with no counterpart in the build
 *   LINK TARGET    an href the baseline offered and the build does not
 *
 * Each is a capability a reader had and no longer has: a section to navigate
 * to, a field to type in, a place to go. Editorial rewording never trips it.
 *
 * Plus two whole-site assertions:
 *
 *   VANISHED ROUTE a route the baseline shipped that this build does not
 *   VANISHED URL   a sitemap <loc> the baseline published that this build does
 *                  not, which is a different signal: build-sitemap.js can drop
 *                  a URL while the page file is still emitted
 *
 * And one that runs whether or not anything changed, RETIRED_ROUTES, described
 * at its own definition below.
 *
 * SOURCE HTML, NOT RENDERED TEXT. An early version compared rendered innerText
 * and reported nine paragraphs "lost" from /terms and five from /security. All
 * nine were present, inside <details> elements, which innerText omits because
 * they are collapsed. Parsing the shipped HTML counts collapsed accordions, tab
 * panels and anything else hidden at first paint, which is exactly the content
 * most likely to be dropped unnoticed.
 *
 * ── REFRESHING THE BASELINE ────────────────────────────────────────────────
 *
 *   node scripts/check-content-parity.js --update
 *
 * It prints every signal the new capture GIVES UP against the old one, so a
 * refresh cannot be a quiet way to make a red gate green: whatever it drops is
 * on the console and in the committed diff, and belongs in the commit message.
 * The build never passes --update.
 *
 * A capture is refused unless the tree looks whole, which is A-163's lesson
 * rather than caution in the abstract: a parity capture once read `dist` while
 * a build owned it, recorded a 404 for a route that serves 200, and deleted 84
 * lines of real captured data in a tracked file. `npm run build` clears the
 * output directory before it repopulates it, so anything reading dist mid-build
 * sees a tree with holes in it, and a baseline recording a 404 makes the next
 * genuine 404 look like no change at all. The guards are at CAPTURE_GUARDS, and
 * every capture records a fingerprint of the tree it read so a later reader can
 * tell whether it was valid.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const BASELINE = path.join(__dirname, 'content-parity.baseline.json');
const REPO = path.join(__dirname, '..', '..');
const UPDATE = process.argv.includes('--update');

/*
 * DELIBERATE REMOVALS, EACH WITH A NAME AND A REASON.
 *
 * Same contract as the KNOWN_UNPORTED list in check-links.js: an entry here is
 * a decision someone has to defend, printed on every build, and anything NOT
 * here fails. The set can only shrink. Delete an entry the moment the content
 * comes back.
 *
 * Keys are `route  signal`, where signal is the exact string this check
 * reports. A wildcard route of `*` applies the entry to every route.
 *
 * ── IT IS EMPTY, AND EMPTYING IT WAS THE RE-POINT RATHER THAN A CLEAN-UP ────
 *
 * It held 27 entries, every one of them a migration decision: a legacy heading
 * replaced by an owner-chosen Figma variant, the withdrawn 14-day trial, the
 * PPN 002 calculator's second-order advertising on pages that survived it, the
 * cookie-preferences Save band that wrote to a localStorage key no script read.
 * Each recorded why the Astro port did not carry something the legacy page had.
 *
 * ALL 27 ARE DISCHARGED, and they are discharged by the same event that made
 * this re-point necessary. Each said "the legacy page had X and the Astro page
 * deliberately does not". The Astro build is now the site. Every one of those
 * decisions has been made, shipped and served; the new baseline is a capture of
 * the outcome, so the content they exempted is not absent from the reference,
 * it is absent from the world. An exemption for a difference that no longer has
 * two sides is exactly the stale entry this list's own discipline says to
 * delete, and leaving 27 of them would have been the second green-and-pointless
 * artefact in one file.
 *
 * They are not lost. They are in git history at 7e6d401d and earlier, the
 * homepage set is argued in specs/HOMEPAGE-DECISION-TABLE.md, and the ones that
 * were owner decisions are on the board (A-54, A-39, O-30, O-58, OA-25..OA-29).
 *
 * WHAT GOES HERE NOW is a different and narrower thing: content that the LIVE
 * SITE serves today and a build deliberately stops serving, in the window
 * before the baseline is refreshed. Most changes will not need an entry at all
 * — refresh the baseline and let the diff carry the argument. An entry is for
 * when a loss must be tolerated across several builds.
 */
const ALLOWED_LOSSES = new Map([]);

/*
 * ROUTES THAT WERE PUBLISHED AND ARE NOW GONE ON PURPOSE.
 *
 * THIS IS AN ASSERTION, NOT AN EXEMPTION, and that is the part worth reading.
 * Under the legacy baseline these two entries did nothing but silence a
 * vanished-route report: the routes were in the legacy sitemap, the check found
 * no file for them, the entry said "that is fine". Once the legacy sitemap
 * stopped being the reference, that shape of entry would have gone permanently
 * quiet — the retired routes are not in the new baseline either, so there would
 * be nothing left to silence, and nothing left to check.
 *
 * That would have quietly dropped a real guarantee. Nothing on the Astro site
 * links to these URLs any more, so check-links.js never reaches them: it walks
 * hrefs that exist. The only thing standing between a retired URL and a hard
 * 404 for every inbound link and every search result is a rule in _redirects,
 * and nothing was checking the rule was still there or still worked.
 *
 * So each entry is now checked in the affirmative, every run, three ways:
 *
 *   1. THE ROUTE MUST NOT SHIP. On Cloudflare Pages a static file BEATS a
 *      _redirects rule, so re-adding the page silently disables the redirect.
 *   2. A RULE MUST EXIST for the path, in _redirects.
 *   3. THE RULE MUST NOT CARRY A BANG. `301!` ships DEAD on CF Pages. Two rules
 *      in block 3 shipped that way once and both were inert; the file carries a
 *      warning at block 3 and block 6 and nothing enforced it until now.
 *
 * An entry that stops being true fails the build. Delete an entry only when the
 * redirect is genuinely withdrawn, which is a decision about inbound links and
 * indexed URLs, not a tidy-up.
 *
 * ── THE PPN 002 CALCULATOR, RETIRED 2026-08-04 ─────────────────────────────
 *
 * Owner instruction, verbatim: "remove PPN 002 calculator page completly also
 * with redirects". The reason, given the same day: it was not giving any value.
 * This supersedes board item A-24, which had frozen work on that tool pending
 * further instruction.
 *
 * Both routes were in the legacy sitemap, so search engines were told they
 * exist. A 301 consolidates only when the target is a close substitute, and
 * /glossary/ppn-002 is the site's page on the single subject both retired pages
 * had, whereas /tools is a hub and would have read as a soft 404.
 */
const RETIRED_ROUTES = new Map([
  ['/tools/ppn-002-calculator',
   'The free PPN 002 social value calculator. Removed 2026-08-04 by owner instruction, on the ground that it was not giving any value: it did arithmetic a bidder could do unaided, against a floor that is a single constant. 301 to /glossary/ppn-002, which states that floor with its publication and mandatory dates. The remaining free tool, the Tender Compliance Matrix, is one click on from there via that entry\'s "Related tool" sidebar, which was repointed at it in the same change.'],
  ['/tools/ppn-002-calculator/methodology',
   'The calculator methodology page, retired with the calculator it documented. 301 to /glossary/ppn-002. Worth recording that this page was the site\'s longest-running accuracy defect: it described monetary proxy values, an Oxford Social Value Bank framework that does not exist, and Green Book discounting of forward-year cashflows, none of which the engine implemented — OA-17, which blocked the port, and the stale-baseline false finding that argued for capturing a fingerprint with every baseline. The glossary entry it now points at states the opposite and states it correctly: PPN 002 reports in counts, hours, litres, tonnes, square metres and pounds of direct spend, and does not use monetary proxy values at all.'],
]);

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

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', mdash: '-', ndash: '-',
  hellip: '...', pound: '£', times: 'x', middot: '.', deg: 'deg',
};
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));

/*
 * Scripts, styles and comments are stripped before anything is extracted. A
 * heading found in a script template string is not a heading on the page, and
 * counting it would make the check demand markup that never rendered.
 */
const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

const text = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/*
 * Comparison is on content words, not on the exact string. "Book a 30-minute
 * call" and "Book a 30-min call" are the same block; a strict compare would
 * fail on every copy edit for no reader-visible reason. Stop words are dropped
 * so that short headings are judged on the words that carry the meaning.
 */
const STOP = new Set(
  'a an the and or of to for in on with your you our we is are be it that this by from as at all can will what how why who'.split(' ')
);

/*
 * A leading section number is presentation, not content. Left in, the digit is
 * a whole token and an identical heading scores 0.5, reporting a loss that is
 * not one. The pattern requires punctuation after the digits so that headings
 * which really start with a number, such as "28 of 28, before the deadline",
 * are untouched.
 */
const unnumber = (s) => s.replace(/^\s*\d{1,2}\s*[.):]\s+/, '');

const toks = (s) =>
  new Set(
    unnumber(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9£% ]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w && !STOP.has(w))
  );

/** How much of `a` survives inside `b`, 0..1. Deliberately one-directional: the build is allowed to say more. */
function survives(a, b) {
  const A = toks(a);
  const B = b instanceof Set ? b : toks(b);
  if (!A.size) return 1;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return hit / A.size;
}

/*
 * A baseline heading counts as still present when 60% of its content words
 * appear in some heading in this build. Two thirds of a heading surviving a
 * rewrite is the same heading; a third of it surviving is a different one. The
 * threshold was set by running every route: at 0.6 the only headings reported
 * are whole blocks that genuinely no longer exist.
 */
const HEADING_SURVIVES = 0.6;

/*
 * Separately, a heading whose words all still appear SOMEWHERE on the page has
 * been demoted, not deleted — the block is there, styled as body copy or as an
 * eyebrow. That is a design decision, so it is reported and does not fail. Set
 * high on purpose: at 0.9 a demotion claim means nearly every word is still on
 * the page.
 */
const DEMOTED_SURVIVES = 0.9;

/** `/about.html` and `/about/` are the same destination. */
function normHref(h) {
  if (!h) return '';
  let x = decode(h.trim());
  if (/^(mailto|tel):/i.test(x)) return x.split('?')[0].toLowerCase();
  if (/^(javascript:|data:)/i.test(x)) return '';
  if (x.startsWith('#')) return '';
  if (/^https?:\/\//i.test(x)) {
    try {
      const u = new URL(x);
      return (u.hostname + u.pathname).replace(/\/$/, '').toLowerCase();
    } catch {
      return x.toLowerCase();
    }
  }
  if (!x.startsWith('/')) return ''; // relative links are rare here and ambiguous without a base
  x = x.split('#')[0].split('?')[0];
  x = x.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '');
  return (x || '/').toLowerCase();
}

/** Assets are gated by copy-assets.js; a missing one is not a content loss. */
const ASSET_EXT = /\.(webp|png|jpe?g|svg|ico|gif|css|js|mjs|xml|txt|json|woff2?|pdf|zip|map)$/i;

function extract(rawHtml) {
  const html = strip(rawHtml);

  const headings = [];
  for (const m of html.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const t = text(m[2]);
    if (t) headings.push(t);
  }

  /*
   * A control is identified by its type plus whatever names it: the `name`
   * attribute first, because that is what the receiving endpoint sees, then id,
   * placeholder, aria-label. type=hidden is skipped — a reader cannot lose
   * something they could not see or fill in.
   */
  const controls = [];
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const attrs = m[2];
    const at = (n) => (attrs.match(new RegExp(`\\b${n}=["']([^"']*)["']`, 'i')) || [])[1] || '';
    const type = (m[1].toLowerCase() === 'input' ? at('type') || 'text' : m[1]).toLowerCase();
    if (type === 'hidden' || type === 'submit' || type === 'button') continue;
    const name = at('name') || at('id') || at('placeholder') || at('aria-label');
    controls.push({ type, name: decode(name) });
  }

  const links = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const n = normHref(m[1]);
    if (!n || ASSET_EXT.test(n)) continue;
    links.add(n);
  }

  return { headings, controls, links: [...links].sort(), all: toks(text(html)) };
}

/** Sitemap <loc> paths, normalised the same way routes are. */
function sitemapPaths(file) {
  if (!fs.existsSync(file)) return null;
  const xml = fs.readFileSync(file, 'utf8');
  const out = [];
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    let p;
    try {
      p = new URL(m[1]).pathname;
    } catch {
      continue;
    }
    p = p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
    out.push(p || '/');
  }
  return [...new Set(out)].sort();
}

/* ------------------------------------------------------------------ *
 * CAPTURE
 * ------------------------------------------------------------------ */

/*
 * CAPTURE_GUARDS — A-163, and why a capture can be refused.
 *
 * `npm run build` clears the output directory before it repopulates it, so a
 * capture that races a build reads a tree with holes in it and records absence
 * as fact. A baseline is a tracked file and a wrong one is worse than none: it
 * fails in the safe-looking direction, because a baseline that records a route
 * as missing makes the next genuine disappearance look like no change at all.
 *
 * MIN_BYTES is the crude half of it and catches the obvious hole. The ratio
 * check is the half that matters: a tree that has lost a fifth of its routes
 * since the last capture is either mid-build or a change nobody would refresh a
 * baseline over without saying so.
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
    console.error(`content-parity: REFUSING to capture — only ${list.length} route(s) in ${path.relative(REPO, DIST)}.`);
    console.error('  That is a tree mid-build or a failed build, not a site. Build first, then capture.');
    process.exit(1);
  }
  if (previous && list.length < previous.routeCount * CAPTURE_GUARDS.MIN_ROUTES_RATIO) {
    console.error(`content-parity: REFUSING to capture — ${list.length} route(s) against a baseline of ${previous.routeCount}.`);
    console.error('  Nothing may read dist while a build owns it (A-163). If this drop is real and intended,');
    console.error('  say so in the commit and lower MIN_ROUTES_RATIO deliberately rather than by accident.');
    process.exit(1);
  }
  const thin = list.filter((r) => fs.statSync(fileFor(r)).size < CAPTURE_GUARDS.MIN_BYTES);
  if (thin.length) {
    console.error(`content-parity: REFUSING to capture — ${thin.length} route(s) under ${CAPTURE_GUARDS.MIN_BYTES} bytes:`);
    for (const t of thin) console.error(`    ${t}  (${fs.statSync(fileFor(t)).size} bytes)`);
    console.error('  A page that small is a stub, an error document, or a half-written file.');
    process.exit(1);
  }
  const sitemap = sitemapPaths(path.join(DIST, 'sitemap.xml'));
  if (!sitemap || !sitemap.length) {
    console.error('content-parity: REFUSING to capture — no sitemap.xml in the build, or it is empty.');
    console.error('  Run build-sitemap.js. Without it the published-URL half of this check has no reference.');
    process.exit(1);
  }

  const out = {
    capturedAt: new Date().toISOString(),
    capturedFromCommit: headSha(),
    distFingerprint: fingerprint(list),
    routeCount: list.length,
    sitemap,
    routes: {},
  };
  for (const r of list) {
    const e = extract(fs.readFileSync(fileFor(r), 'utf8'));
    out.routes[r] = { headings: e.headings, controls: e.controls, links: e.links };
  }
  return out;
}

/*
 * Every signal the old baseline had that the new one does not, so a refresh is
 * never quiet.
 *
 * HEADINGS ARE JUDGED AGAINST HEADINGS HERE, not against the whole page, so a
 * heading demoted to body copy is listed as given up where the check itself
 * would have called it demoted and stayed silent. That is the direction to err
 * in: this list is read by whoever is about to commit a new reference for the
 * whole site, and a line they can dismiss in a second costs less than a block
 * that leaves without being named.
 */
function givenUp(prev, next) {
  const gone = [];
  if (!prev) return gone;
  for (const p of prev.sitemap || []) if (!next.sitemap.includes(p)) gone.push(`sitemap URL ${p}`);
  for (const [route, b] of Object.entries(prev.routes || {})) {
    const n = next.routes[route];
    if (!n) { gone.push(`route ${route} (and everything on it)`); continue; }
    for (const h of b.headings) {
      if (!n.headings.some((x) => survives(h, x) >= HEADING_SURVIVES)) {
        gone.push(`${route}  heading: ${unnumber(h)}`);
      }
    }
    for (const c of b.controls) {
      if (!n.controls.some((x) => x.type === c.type && (survives(c.name, x.name) >= HEADING_SURVIVES || (!c.name && !x.name)))) {
        gone.push(`${route}  form control: <${c.type}> ${c.name || '(unnamed)'}`);
      }
    }
    for (const href of b.links) if (!n.links.includes(href)) gone.push(`${route}  link: ${href}`);
  }
  return gone;
}

if (UPDATE) {
  const previous = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
  if (!fs.existsSync(DIST)) {
    console.error('content-parity: no build to capture. Run `npm run build:deploy` first.');
    process.exit(1);
  }
  const next = capture(previous);
  const gone = givenUp(previous, next);

  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`content-parity: baseline captured — ${next.routeCount} route(s), ${next.sitemap.length} published URL(s).`);
  console.log(`  fingerprint ${next.distFingerprint}   commit ${next.capturedFromCommit || '(unknown)'}`);
  if (gone.length) {
    console.log('');
    console.log(`  ${gone.length} SIGNAL(S) GIVEN UP by this refresh. Each is something the previous`);
    console.log('  baseline recorded and this build does not offer. Justify them in the commit message:');
    for (const g of gone) console.log(`    ${g}`);
  } else if (previous) {
    console.log('  Nothing given up: this build offers everything the previous baseline recorded.');
  }
  process.exit(0);
}

/* ------------------------------------------------------------------ *
 * CHECK
 * ------------------------------------------------------------------ */

/*
 * A MISSING REFERENCE IS A FAILURE, NOT A SKIP, and this is a change from the
 * legacy version, which exited 0 with "no legacy dist/ to compare against —
 * Skipped." That was defensible when the reference was a separate build the
 * person running this could not be expected to have. It is not defensible now:
 * the baseline is a committed file in this directory, so its absence means the
 * repo is broken or someone deleted the thing that makes this gate a gate. A
 * check that passes when its reference is missing is the failure mode this
 * whole re-point exists to remove.
 */
if (!fs.existsSync(BASELINE)) {
  console.error('content-parity: NO BASELINE. Expected a committed snapshot at');
  console.error(`  ${path.relative(REPO, BASELINE)}`);
  console.error('  It is the record of what the live site serves, so without it this check asserts nothing.');
  console.error('  Restore it from git. Capture a new one only from a build you intend to deploy:');
  console.error('    node scripts/check-content-parity.js --update');
  process.exit(1);
}
if (!fs.existsSync(DIST)) {
  console.error('content-parity: no build at astro/dist. Run the build before the gates.');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));

const lost = [];    // unrecorded losses -> failure
const allowed = []; // on the list -> printed, never fatal
const demoted = []; // heading became body copy -> printed, never fatal
const seenAllowKeys = new Set();

/*
 * Allow-list keys are matched case-insensitively: the same block is written
 * with different capitalisation on different pages, and forcing a line per
 * capitalisation would make the list longer without making it truer.
 */
function record(route, signal, kind) {
  const key = `${route}  ${signal}`.toLowerCase();
  const wild = `*  ${signal}`.toLowerCase();
  const why = ALLOWED_LOSSES.get(key) ?? ALLOWED_LOSSES.get(wild);
  if (why !== undefined) {
    seenAllowKeys.add(ALLOWED_LOSSES.has(key) ? key : wild);
    allowed.push({ route, signal, why });
    return;
  }
  lost.push({ route, signal, kind });
}

const built = new Set(routes(DIST).sort());
const vanished = [];
let compared = 0;

for (const [route, b] of Object.entries(baseline.routes)) {
  const bare = route.replace(/\/$/, '') || '/';
  if (!built.has(route)) {
    if (!RETIRED_ROUTES.has(bare)) vanished.push(route);
    continue;
  }
  compared++;
  const a = extract(fs.readFileSync(fileFor(route), 'utf8'));

  for (const h of b.headings) {
    if (a.headings.some((x) => survives(h, x) >= HEADING_SURVIVES)) continue;
    if (survives(h, a.all) >= DEMOTED_SURVIVES) {
      demoted.push({ route, signal: h });
      continue;
    }
    /* Reported without its section number so an allow-list entry survives a
       renumbering of the page rather than silently going stale. */
    record(route, `heading: ${unnumber(h)}`, 'heading');
  }

  for (const c of b.controls) {
    const match = a.controls.some(
      (x) => x.type === c.type && (survives(c.name, x.name) >= HEADING_SURVIVES || (!c.name && !x.name))
    );
    if (!match) record(route, `form control: <${c.type}> ${c.name || '(unnamed)'}`, 'form control');
  }

  for (const href of b.links) {
    if (a.links.includes(href)) continue;
    record(route, `link: ${href}`, 'link');
  }
}

/* A route this build ships that the baseline never saw. Not a fault — it is how
   new pages arrive — but it is UNPROTECTED until the baseline is refreshed, and
   that is the exact way the legacy version's coverage decayed to nothing while
   staying green. Printed so the decay is visible rather than assumed absent. */
const fresh = [...built].filter((r) => !(r in baseline.routes)).sort();

/* Published URLs, which is a different signal from route files: build-sitemap.js
   can drop a <loc> while the page is still emitted, and then the page exists and
   nothing tells a crawler so. */
const currentSitemap = sitemapPaths(path.join(DIST, 'sitemap.xml'));
const droppedUrls = currentSitemap
  ? (baseline.sitemap || []).filter((p) => !currentSitemap.includes(p) && !RETIRED_ROUTES.has(p))
  : [];

/* RETIRED_ROUTES, asserted rather than assumed. See the note at its definition. */
const retiredFaults = [];
const redirectFile = path.join(DIST, '_redirects');
const redirectLines = fs.existsSync(redirectFile)
  ? fs.readFileSync(redirectFile, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'))
  : null;

if (redirectLines === null) {
  retiredFaults.push('no _redirects in the build, so not one retired route redirects anywhere');
} else {
  for (const [route] of RETIRED_ROUTES) {
    const shadow = [
      path.join(DIST, route.replace(/^\//, '') + '/index.html'),
      path.join(DIST, route.replace(/^\//, '') + '.html'),
    ].find((f) => fs.existsSync(f));
    if (shadow) {
      retiredFaults.push(`${route} ships a static file (${path.relative(DIST, shadow)}). On CF Pages a file BEATS a _redirects rule, so its 301 is dead`);
      continue;
    }
    const rules = redirectLines
      .map((l) => l.trim().split(/\s+/))
      .filter((p) => p[0] === route || p[0] === route + '/');
    if (!rules.length) {
      retiredFaults.push(`${route} has no rule in _redirects — every inbound link and indexed result hard-404s`);
      continue;
    }
    const bang = rules.filter((p) => (p[2] || '').endsWith('!'));
    if (bang.length) {
      retiredFaults.push(`${route} has ${bang.length} rule(s) flagged with a bang (${bang[0][2]}). A "301!" ships DEAD on CF Pages`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * REPORT
 * ------------------------------------------------------------------ */

console.log(
  `content-parity: ${compared} of ${baseline.routeCount} baselined route(s) compared against the deployed build.`
);
console.log(
  `  baseline captured ${baseline.capturedAt} at ${(baseline.capturedFromCommit || '(no commit)').slice(0, 8)}, ${baseline.distFingerprint}\n`
);

if (fresh.length) {
  console.log(`  ${fresh.length} route(s) in this build are NOT in the baseline, so nothing on them is protected yet:`);
  for (const f of fresh) console.log(`    ${f}`);
  console.log('    Refresh the baseline once they are what you intend to ship: --update');
  console.log('');
}

if (demoted.length) {
  console.log(`  ${demoted.length} heading(s) demoted to body copy — the words are still on the page:`);
  for (const d of demoted.slice(0, 12)) console.log(`    ${d.route.padEnd(38)} ${d.signal}`);
  if (demoted.length > 12) console.log(`    ... and ${demoted.length - 12} more`);
  console.log('');
}

if (allowed.length) {
  /* Never silent, for the same reason check-links.js prints its tracked set: a
     deliberate removal that nobody re-reads becomes an accidental one. */
  const bySignal = new Map();
  for (const a of allowed) {
    const k = a.signal.toLowerCase();
    if (!bySignal.has(k)) bySignal.set(k, { signal: a.signal, why: a.why, routes: new Set() });
    bySignal.get(k).routes.add(a.route);
  }
  console.log(
    `  ${allowed.length} recorded loss(es) across ${new Set(allowed.map((a) => a.route)).size} route(s), each with a reason:`
  );
  for (const g of [...bySignal.values()].sort((x, y) => y.routes.size - x.routes.size)) {
    const where = g.routes.size === 1 ? [...g.routes][0] : `${g.routes.size} routes`;
    console.log(`    ${where.padEnd(38)} ${g.signal}`);
    console.log(`    ${''.padEnd(38)}   ${g.why}`);
  }
  console.log('');
}

if (RETIRED_ROUTES.size) {
  console.log(`  ${RETIRED_ROUTES.size} retired route(s), each still redirecting:`);
  for (const [r] of RETIRED_ROUTES) console.log(`    ${r}`);
  console.log('');
}

/*
 * An allow-list entry that no longer matches anything means the content came
 * back, or the signal changed. Either way the line is now a lie, and a stale
 * exemption is how the next real loss gets waved through. Reported, not fatal:
 * failing the build for content being RESTORED would be perverse.
 */
const stale = [...ALLOWED_LOSSES.keys()].filter((k) => !seenAllowKeys.has(k));
if (stale.length) {
  console.log(`  ${stale.length} allow-list entr(ies) matched nothing — delete them, the content is back:`);
  for (const k of stale) console.log(`    ${k}`);
  console.log('');
}

/* A retired route that stopped redirecting is a hard 404 on a URL that is
   indexed and linked from off-site, so it fails ahead of any content signal. */
if (retiredFaults.length) {
  console.error(`content-parity: ${retiredFaults.length} RETIRED ROUTE(S) NO LONGER REDIRECT\n`);
  for (const f of retiredFaults) console.error(`      ${f}`);
  console.error('');
  console.error('  Each is a URL search engines were told about and off-site links still point at.');
  console.error('  Fix the rule in _redirects, or withdraw the entry from RETIRED_ROUTES deliberately.');
  console.error('');
  process.exit(1);
}

/* A whole route going missing outranks any individual heading, so it fails on
   its own rather than being buried under a list of signals. */
if (vanished.length || droppedUrls.length) {
  if (vanished.length) {
    console.error(`content-parity: ${vanished.length} DEPLOYED ROUTE(S) NO LONGER SHIP AND ARE NOT RECORDED\n`);
    for (const v of vanished) console.error(`      ${v}`);
    console.error('');
  }
  if (droppedUrls.length) {
    console.error(`content-parity: ${droppedUrls.length} PUBLISHED URL(S) LEFT THE SITEMAP\n`);
    for (const d of droppedUrls) console.error(`      ${d}`);
    console.error('');
  }
  console.error('  Each is live right now and a crawler has been told it exists.');
  console.error('  Restore it, or add it to RETIRED_ROUTES with a reason and a 301 in _redirects.');
  console.error('');
  process.exit(1);
}

if (lost.length) {
  console.error(`content-parity: ${lost.length} CONTENT ITEM(S) LOST AND NOT RECORDED\n`);
  const byRoute = new Map();
  for (const x of lost) {
    if (!byRoute.has(x.route)) byRoute.set(x.route, []);
    byRoute.get(x.route).push(x);
  }
  for (const [route, items] of [...byRoute].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  ${route}`);
    for (const i of items) console.error(`      ${i.signal}`);
  }
  console.error('');
  console.error('  Each line is something a reader can do on the live site and could not do after this build.');
  console.error('  Restore it, add it to ALLOWED_LOSSES with the reason it went, or refresh the');
  console.error('  baseline with --update if this build is the one you intend to deploy.');
  console.error('');
  process.exit(1);
}

console.log('  nothing lost: every heading, form control and link destination the live site');
console.log('  serves is still reachable on this build, or recorded above.');
