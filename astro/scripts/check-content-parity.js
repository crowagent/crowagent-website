/**
 * check-content-parity.js — the Astro page must not silently lose the legacy
 * page's CONTENT.
 *
 * WHAT THIS CLOSES. check-seo-parity.js compares titles, descriptions,
 * canonicals, og tags and structured-data types. check-links.js resolves link
 * targets. check-csp.js checks headers. Not one of them looks at what is
 * actually on the page, so 38 routes passed every gate on three browser
 * engines while whole blocks were missing:
 *
 *   /contact  lost "Send us an email", "What you will see on the call", and
 *             "Prefer regulatory updates?" — the newsletter signup. Document
 *             height 6725px -> 2416px, seven <section>s -> two.
 *   /about    lost "Get monthly UK procurement digests" — the same newsletter
 *             block. 7038px -> 4834px.
 *
 * The newsletter signup is a lead-capture mechanism. Losing it is a commercial
 * regression, not a styling one, and nothing in the build said a word.
 *
 * NOT A DIFF OF WORDS. The rebuild rewrote copy on purpose, so near-matches
 * are fine and prose is not compared at all. What this asserts is that three
 * kinds of thing that existed still exist:
 *
 *   HEADING        an h1-h4 whose text has no close counterpart in Astro
 *   FORM CONTROL   an input/select/textarea with no counterpart in Astro
 *   LINK TARGET    an href the legacy page offered and Astro does not
 *
 * Each is a capability a reader had and no longer has: a section to navigate
 * to, a field to type in, a place to go. Editorial rewording never trips it.
 *
 * SOURCE HTML, NOT RENDERED TEXT. An early version of this compared rendered
 * innerText and reported nine paragraphs "lost" from /terms and five from
 * /security. All nine were present — inside <details> elements, which
 * innerText omits because they are collapsed. Parsing the shipped HTML counts
 * collapsed accordions, tab panels and anything else hidden at first paint,
 * which is exactly the content most likely to be dropped unnoticed.
 *
 * A CONSEQUENCE WORTH KNOWING. On the legacy site the nav and footer are
 * injected at runtime by js/nav-inject.js, and the cookie banner by
 * js/cookie-banner.js. Neither is in the legacy source, so neither is
 * compared. That is the correct outcome and not a workaround: the Astro site
 * ships its own nav and footer as real markup, and it sets no cookies, so it
 * needs no consent banner. Comparing runtime chrome would report 38 identical
 * false losses and train the reader to skim the output.
 *
 * Legacy pages are read from the repo root build (`dist/`), Astro from
 * `astro/dist/`, matching check-seo-parity.js, so both are what ships rather
 * than what a dev server renders.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASTRO = path.join(__dirname, '..', 'dist');
const LEGACY = path.join(__dirname, '..', '..', 'dist');

/*
 * DELIBERATE REMOVALS, EACH WITH A NAME AND A REASON.
 *
 * Same contract as the KNOWN_UNPORTED list in check-links.js: an entry here is
 * a decision someone has to defend, printed on every build, and anything NOT
 * here fails. The set can only shrink. Delete an entry the moment the content
 * comes back.
 *
 * Keys are `route  signal`, where signal is the exact string this check
 * reports. A wildcard route of `*` applies the entry to every route, which is
 * how the eight blog posts share one line instead of forty.
 */
const ALLOWED_LOSSES = new Map([
  // --- blog: the related-articles rail and the share row were not ported ---
  ['*  heading: related articles', 'blog related-articles rail unported; internal-linking loss, tracked for the blog pass'],
  ['*  heading: start with the workflow you need now', 'blog cross-sell rail unported, same pass as the related-articles rail'],
  ['*  heading: ppn 002: the complete guide to social value scoring', 'card title inside the unported related-articles rail'],
  ['*  heading: ppn 002: complete social value scoring guide', 'card title inside the unported related-articles rail'],
  ["*  heading: ppn 002 in 2026: what changed and what didn't", 'card title inside the unported related-articles rail'],
  ['*  heading: the procurement act 2023: what sme bidders need to know', 'card title inside the unported related-articles rail'],
  ['*  heading: how to find and win your first uk public sector contract', 'card title inside the unported related-articles rail'],
  ['*  heading: how to write a method statement that actually scores', 'card title inside the unported related-articles rail'],
  ['*  heading: frameworks and dps explained: g-cloud, lots and call-offs', 'card title inside the unported related-articles rail'],
  ['*  heading: social value portal vs crowmark: side-by-side', 'card title inside the unported related-articles rail'],
  ['*  heading: responding to corporate rfps and pqqs', 'card title inside the unported related-articles rail'],
  ['*  link: twitter.com/intent/tweet', 'social share row unported; no share UI exists in the Astro layout yet'],
  ['*  link: www.linkedin.com/feed', 'social share row unported, same as the tweet intent'],
  ['*  link: mailto:', 'the share row also carried a recipient-less mailto with the title prefilled'],
  ['*  link: /blog/find-first-public-sector-contract', 'reached only from the unported related-articles rail; the post itself still ships'],
  ['*  link: /blog/frameworks-and-dps-explained', 'reached only from the unported rail; the post itself still ships'],
  ['*  link: /blog/method-statement-that-scores', 'reached only from the unported rail; the post itself still ships'],
  ['*  link: /blog/ppn-002-social-value-guide', 'reached only from the unported rail; the post itself still ships'],
  ['*  link: /blog/private-sector-rfp-pqq-guide', 'reached only from the unported rail; the post itself still ships'],
  ['*  link: /blog/procurement-act-2023-sme-guide', 'reached only from the unported rail; the post itself still ships'],
  ['*  link: /blog/regulatory-updates-2026', 'reached only from the unported rail; the post itself still ships'],
  ['*  link: /blog/social-value-portal-vs-crowmark', 'reached only from the unported rail; the post itself still ships'],

  // --- homepage: the six-card product tour was replaced by a new narrative ---
  ['/  heading: qualify. win. get paid.', 'legacy hero headline; replaced by the locked V6 hero, owner-approved 2026-08-02'],
  ['/  heading: deadlines do not wait for your desk', 'section title above the six-card product tour, removed with it'],
  ['/  heading: triage a notice from a train', 'card from the six-card product tour the V6 homepage replaced'],
  ['/  heading: bid or no bid, with reasons', 'card from the same replaced product tour'],
  ['/  heading: your answer library, everywhere', 'card from the same replaced product tour'],
  ['/  heading: 28 of 28, before the deadline', 'card from the same replaced product tour'],
  ['/  heading: your evidence already exists. we read it where it lives.', 'section title above the replaced product tour'],
  ['/  heading: the only engine that sits on both sides', 'rewritten in place as "Supplier and authority, one rulebook"'],

  // --- individual pages ---
  ['/contact/  heading: book a 30-min demo', 'card title folded into the surviving "Book a 30-minute call" section'],
  /*
   * NOT SETTLED. The /contact/ restoration brought back the email block, the
   * "what you will see on the call" list and the newsletter signup, but not
   * the enterprise card: Entra ID single sign-on, branded exports, invoice or
   * purchase-order billing, volume pricing. That is the only route to a
   * portfolio conversation on the page. Recorded so the build is not blocked,
   * NOT because anyone decided it.
   */
  ['/contact/  heading: portfolio plan and volume licensing', 'enterprise/volume card dropped in the port; NOT a recorded decision, needs an owner call'],
  ['/faq/  link: mailto:hello@crowagent.ai', 'FAQ now routes readers to /contact/ rather than a bare mailto, per the request-access rule'],
  ['/partners/  heading: ready to start?', 'closing CTA heading folded into "Express your interest."'],
  ['/partners/  link: calendly.com/crowagent-platform/30min', 'partner booking consolidated onto /contact/; the Calendly link survives there'],
  ['/tools/ppn-002-calculator/  heading: every figure traces back to its source.', 'traceability panel folded into the calculator intro copy'],
  ['/tools/ppn-002-calculator/  heading: need the full scoring engine?', 'closing CTA folded into the single CTA the page now carries'],
  ['/tools/ppn-002-calculator/methodology/  heading: was this helpful?', 'feedback widget unported; it posted to an endpoint the Astro site does not have'],
  ['/blog/  heading: get regulatory updates.', 'closing CTA band, two buttons to /contact/; both destinations still linked from the page'],

  /*
   * NOT SETTLED. The methodology page went from eight numbered sections to
   * six. Most of the dropped text survives as prose and is reported as
   * demoted, but the NPV and discount-rate section is simply gone, and this is
   * the page that backs the "every figure traces to its source" claim.
   * Recorded so the build is not blocked, NOT because anyone decided it.
   */
  ['/tools/ppn-002-calculator/methodology/  heading: npv discount and time horizon', 'section 5 dropped in the port; NOT a recorded decision, needs an owner call'],
]);

/* ------------------------------------------------------------------ */

/** Astro route -> the legacy file that served the same URL. Same map as check-seo-parity.js. */
function legacyCandidates(route) {
  const clean = route.replace(/^\/|\/$/g, '');
  if (!clean) return ['index.html'];
  return [`${clean}.html`, `${clean}/index.html`];
}

function routes(dir, base = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) routes(path.join(dir, e.name), `${base}/${e.name}`, out);
    else if (e.name === 'index.html') out.push(base === '' ? '/' : `${base}/`);
  }
  return out;
}

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
 * Scripts, styles and comments are stripped before anything is extracted.
 * The legacy glossary and calculator build markup inside inline <script>
 * template strings, and a heading found in a string literal is not a heading
 * on the page — counting it would make the check demand markup that never
 * rendered.
 */
const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

const text = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/*
 * Comparison is on content words, not on the exact string. "Book a 30-minute
 * call" and "Book a 30-min call" are the same block; the rebuild rewrote copy
 * and a strict compare would fail on every page for no reader-visible reason.
 * Stop words are dropped so that short headings are judged on the words that
 * carry the meaning.
 */
const STOP = new Set(
  'a an the and or of to for in on with your you our we is are be it that this by from as at all can will what how why who'.split(' ')
);

/*
 * A leading section number is presentation, not content. The legacy
 * methodology page numbers its sections ("8. References"); the Astro one does
 * not ("References"). Left in, the digit is a whole token and the comparison
 * scores an identical heading at 0.5, reporting a loss that is not one. The
 * pattern requires punctuation after the digits so that headings which really
 * start with a number, such as "28 of 28, before the deadline", are untouched.
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

/** How much of `a` survives inside `b`, 0..1. Deliberately one-directional: Astro is allowed to say more. */
function survives(a, b) {
  const A = toks(a);
  const B = b instanceof Set ? b : toks(b);
  if (!A.size) return 1;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return hit / A.size;
}

/*
 * A legacy heading counts as still present when 60% of its content words
 * appear in some Astro heading. Two thirds of a heading surviving a rewrite is
 * the same heading; a third of it surviving is a different one. The threshold
 * was set by running every route: at 0.6 the only headings reported are whole
 * blocks that genuinely no longer exist.
 */
const HEADING_SURVIVES = 0.6;

/*
 * Separately, a heading whose words all still appear SOMEWHERE on the Astro
 * page has been demoted, not deleted — the block is there, styled as body
 * copy or as an eyebrow. That is a design decision, so it is reported and does
 * not fail. Set high on purpose: at 0.9 a demotion claim means nearly every
 * word is still on the page.
 */
const DEMOTED_SURVIVES = 0.9;

/** Legacy `/about.html` and Astro `/about/` are the same destination. */
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
   * attribute first, because that is what the receiving endpoint sees, then
   * id, placeholder, aria-label. type=hidden is skipped — a reader cannot lose
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

  return { headings, controls, links, all: toks(text(html)) };
}

/* ------------------------------------------------------------------ */

if (!fs.existsSync(LEGACY)) {
  console.log('content-parity: no legacy dist/ to compare against — run the root build first. Skipped.');
  process.exit(0);
}

const lost = [];    // unrecorded losses -> failure
const allowed = []; // on the list -> printed, never fatal
const demoted = []; // heading became body copy -> printed, never fatal
let compared = 0;
let unmatched = 0;

const seenAllowKeys = new Set();

/*
 * Allow-list keys are matched case-insensitively. The same blog card title is
 * written "PPN 002: The Complete Guide..." on one post and "PPN 002: complete
 * guide..." on another; they are the same removed block, and forcing a line
 * per capitalisation would make the list longer without making it truer.
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

for (const route of routes(ASTRO).sort()) {
  const aFile = path.join(ASTRO, route === '/' ? 'index.html' : route.replace(/^\//, '') + 'index.html');
  if (!fs.existsSync(aFile)) continue;

  const lFile = legacyCandidates(route)
    .map((c) => path.join(LEGACY, c))
    .find((f) => fs.existsSync(f));
  if (!lFile) {
    unmatched++;
    continue; // a new page has no legacy content to lose
  }

  compared++;
  const a = extract(fs.readFileSync(aFile, 'utf8'));
  const l = extract(fs.readFileSync(lFile, 'utf8'));

  for (const h of l.headings) {
    if (a.headings.some((x) => survives(h, x) >= HEADING_SURVIVES)) continue;
    if (survives(h, a.all) >= DEMOTED_SURVIVES) {
      demoted.push({ route, signal: h });
      continue;
    }
    /* Reported without its section number so an allow-list entry survives a
       renumbering of the legacy page rather than silently going stale. */
    record(route, `heading: ${unnumber(h)}`, 'heading');
  }

  for (const c of l.controls) {
    const match = a.controls.some(
      (x) => x.type === c.type && (survives(c.name, x.name) >= HEADING_SURVIVES || (!c.name && !x.name))
    );
    if (!match) record(route, `form control: <${c.type}> ${c.name || '(unnamed)'}`, 'form control');
  }

  for (const href of l.links) {
    if (a.links.has(href)) continue;
    record(route, `link: ${href}`, 'link');
  }
}

console.log(
  `content-parity: ${compared} route(s) compared against the legacy build, ${unmatched} new route(s) skipped\n`
);

if (demoted.length) {
  console.log(`  ${demoted.length} heading(s) demoted to body copy — the words are still on the page:`);
  for (const d of demoted.slice(0, 12)) console.log(`    ${d.route.padEnd(38)} ${d.signal}`);
  if (demoted.length > 12) console.log(`    ... and ${demoted.length - 12} more`);
  console.log('');
}

if (allowed.length) {
  /* Never silent, for the same reason check-links.js prints its tracked set:
     a deliberate removal that nobody re-reads becomes an accidental one. */
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
  console.error('  Each line is something a reader could do on the legacy page and cannot do now.');
  console.error('  Restore it, or add it to ALLOWED_LOSSES in this file with the reason it went.');
  console.error('');
  process.exit(1);
}

console.log('  nothing lost: every heading, form control and link destination on a legacy');
console.log('  page is still reachable on its Astro replacement, or recorded above.');
