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
  /*
   * --- blog ---
   *
   * TWENTY-ONE ENTRIES DELETED HERE, 2026-08-02 (OA-28). The related-articles
   * rail and the social share row are both back on all 8 posts, restored in
   * components/blog/RelatedPosts.astro and components/blog/ShareRow.astro and
   * rendered by layouts/Article.astro rather than repeated per post. That took
   * back the rail h2, ten card h3s, the LinkedIn / tweet-intent / mailto share
   * targets and all eight /blog/* cross-links. They are deleted rather than
   * reworded because this list is only honest if it shrinks the moment content
   * returns, and the check reports its own stale entries for exactly that
   * reason.
   *
   * What survives below is a DIFFERENT block that happened to sit next to the
   * rail on the legacy page and was never part of it.
   */
  ['*  heading: start with the workflow you need now', 'a "Request access" CTA band that sat above the rail, not part of it; /contact/ is still reached from the nav, the footer and the post body'],

  // --- consequences of the 2026-08-02 accuracy and positioning corrections ---
  ['/about/  heading: make public procurement accessible',
   'Mission heading, reworded to "Make bidding answerable, whatever your size". The old line scoped the company to public procurement, which contradicts the market-neutral decision (OA-25). The mission itself is unchanged and still on the page'],
  ['/about/  heading: know the rules better than your competition.',
   'the closing CTA heading, replaced by the approved A2 design (Figma 238:101), whose close mirrors its hero and reads "Whichever of the four you are." Nothing the reader could DO has gone: both buttons are still there and the second one is now the free PPN 002 calculator the legacy page closed with, which the first Astro port had dropped. The old line was also a comparative claim about the reader\'s competitors that this page has no evidence for, and it is the same class of claim the win-rate refusal in Values exists to rule out'],
  ['/blog/ppn-002-social-value-guide/  link: www.gov.uk/government/publications/social-value-model',
   'Removed deliberately as part of OA-29. That publication is the PPN 06/20 Social Value Model, and the page was citing it as though it were the PPN 002 model. The page now links the three PPN 002 primary documents instead. Restoring this link would restore the defect'],

  /*
   * --- homepage: the six sections the owner approved on 2026-08-02 ---
   *
   * Every line below is a legacy heading replaced by an owner-chosen Figma
   * variant, not something that fell out. The decision record is
   * specs/HOMEPAGE-DECISION-TABLE.md; each entry names the section that now
   * occupies that ground, so a future reader can check the replacement still
   * exists rather than taking "redesigned" on trust.
   */
  ['/  heading: the shape of a uk bid, in four numbers',
   'old MarketShape heading. Section kept, content replaced: it led with three figures that could not be sourced (OA-27). Now "Four numbers you are already held to", every figure citing statute'],
  ['/  heading: the whole lifecycle, not the easy half',
   'old Lifecycle heading. Replaced by M7 Closed loop, owner-chosen, headed "Delivery is the first stage of the next bid." The old line also carried an unsourced competitor claim, the same class removed as OA-18'],
  ['/  heading: every uk tender, the day it lands',
   'old Lifecycle stage card. M7 renders the four stages as a ring with the vocabulary per market, so the stage is present as "Find" rather than as this heading. Also UK-capped, against the market-neutral decision'],
  ['/  heading: grounded answers, traceable line by line',
   'old Lifecycle stage card. Present in M7 as the "Answer" stage'],
  ['/  heading: ppn 002 social value, priced and defensible',
   'old Lifecycle stage card. Present in M7 as the "Commit" stage. "Social value" is deliberately not a stage name any more: it is UK-public-only and does not travel'],
  ['/  heading: answer the question, once',
   'old BothSides card. Replaced by B2 Shared spine, owner-chosen, which argues the same point as one rail read from both ends rather than as two prose cards'],
  ['/  heading: questionnaires, answered once',
   'old BothSides card, same replacement as above'],
  ['/  heading: find the evidence across every response',
   'old BothSides buyer-side card. NOT a lost capability: it is the buyer proposition and it still ships in full on /crowmark-buyers, which is linked from B2. It no longer has a heading on the homepage'],
  ['/  heading: the scoring model, in the open',
   'old homepage heading. The methodology it pointed at still ships at /tools/ppn-002-calculator/methodology/ and is linked from the calculator'],

  /*
   * --- homepage: the 2026-08-02 text cut ---
   *
   * Owner verdict on the rebuilt homepage: "We are full of text and look like a
   * research website instead of a product website." The page went from 931
   * visible words to 249, and the depth moved to /sources, a new route that did
   * not exist on the legacy site and therefore has no counterpart for this
   * checker to compare. The two lines below are the only legacy signals that
   * cut cost, and neither is a capability: both are headings whose claim is
   * still made on the page, by a heading with different words or by a graphic.
   */
  ['/  heading: the contract does not end at award',
   'legacy h3 above the post-award block. Until this pass its words all still appeared in the lifecycle section\'s caption and closing note, so it registered as demoted rather than lost; both of those were cut as prose that restated the ring. The CLAIM is now the lifecycle section\'s own heading, "Delivery is the first stage of the next bid.", and the ring draws Deliver as much the longest arc to say the same thing. The post-award duties it pointed at are on /sources in fuller form than the note carried: s.52 and s.71 as two separate records, each with its date and a legislation.gov.uk link'],
  ['/  heading: watch it reason, and watch it hold the gate',
   'legacy h2, carried over verbatim into the Astro reasoning-trace section and shortened here to "Watch it refuse a figure." Holding the gate IS refusing a figure, and the section is now that and nothing else: the five-step rail, the dropped figure named in the refusal colour with its reason, and a tally of 4 claimed / 3 traced / 1 refused. The words "reason" and "gate" went; the argument they described is the only thing left in the section'],

  // --- homepage: the six-card product tour was replaced by a new narrative ---
  // "Qualify. Win. Get paid." is NOT exempt any more: the V6 hero puts the
  // legacy headline back as the h1, so an exemption here would be a lie and the
  // stale-entry detector would report it on every build.
  ['/  heading: deadlines do not wait for your desk', 'section title above the six-card product tour, removed with it'],
  ['/  heading: triage a notice from a train', 'card from the six-card product tour the V6 homepage replaced'],
  ['/  heading: bid or no bid, with reasons', 'card from the same replaced product tour'],
  ['/  heading: your answer library, everywhere', 'card from the same replaced product tour'],
  ['/  heading: 28 of 28, before the deadline', 'card from the same replaced product tour'],
  ['/  heading: your evidence already exists. we read it where it lives.', 'section title above the replaced product tour'],
  /* RE-KEYED 2026-08-04, A-39, and the re-keying is the finding rather than a
     tidy-up. This entry named "the only engine that sits on both sides", which is
     what the legacy homepage USED to say; its own reason line records that the
     legacy page was rewritten in place to "Supplier and authority, one rulebook".
     LEGACY is the repo-root dist/, and that dist/ was built on 2026-08-02, before
     the rewrite — so the entry went on matching a heading that no longer existed
     anywhere, and the heading that DID exist was unrecorded and invisible.

     Rebuilding the root dist/ (which A-39 had to do, to withdraw four vendor marks
     from the published site) surfaced it as an unrecorded loss and failed the
     build. It was never a loss this pass caused; it was a loss a stale baseline had
     been hiding since 2026-08-02, which is the second one of those this file has
     recorded — see the npv note further down.

     The replacement still exists and is still checkable: the Astro homepage renders
     B2 Shared spine under "Read from either end.", which argues the same point as
     one rail read from both ends. */
  ['/  heading: supplier and authority, one rulebook',
   'the legacy BothSides section title, in its post-rewrite wording. Replaced by B2 Shared spine, owner-chosen, headed "Read from either end." — one rail read from either end rather than a title asserting the pairing in prose'],

  /*
   * --- /crowmark: the approved product-page design, 2026-08-03 ---
   *
   * NO ENTRY WAS NEEDED AND ONE WAS WRITTEN ANYWAY, THEN DELETED. The redesign
   * replaced the closing heading "Answered." with the approved frame's "Know
   * the rules better than your competition." (Figma `231:2`), and an allow-list
   * line was added here on the assumption that the word was gone. It is not:
   * the checker reports it as DEMOTED, because "answered" still appears in the
   * capability copy, so the block is present as body text rather than absent.
   * The entry was deleted rather than left in place, per the discipline at the
   * head of this list — an exemption that is not true is how the next real
   * regression gets waved through. Recorded here rather than silently removed.
   */

  // --- individual pages ---
  ['/contact/  heading: book a 30-min demo', 'card title folded into the surviving "Book a 30-minute call" section'],
  ['/partners/  heading: ready to start?', 'closing CTA heading folded into "Express your interest."'],
  ['/blog/  heading: get regulatory updates.', 'closing CTA band, two buttons to /contact/; both destinations still linked from the page'],

  /*
   * --- the last three routes of OA-20, ported 2026-08-03 ---
   *
   * Two losses between them, and both are a claim being withdrawn rather than a
   * block being dropped in a redesign. Neither is a capability the reader keeps
   * somewhere else, which is why each says what was checked and where.
   */
  /* DELETED 2026-08-04, A-39: '/integrations/  heading: send reminders from your
     own number.'
     It exempted the Astro page for not carrying the Twilio / Vonage / MessageBird
     SMS section, on the finding that no customer-facing SMS connector exists. That
     finding held up on re-checking — web/lib/sms/providers.ts is headed
     "[REQ-CASH-V3-F] CrowCash SMS", it is a bring-your-own-credentials PAYMENT-CHASE
     channel for a product that is not live, and CrowMark's rule engine offers a
     webhook, an email and an in-app alert and no SMS.
     The exemption is gone because the LEGACY section is gone: A-39 removed it from
     integrations.html rather than leaving the false claim standing on the page that
     actually ships. There is no longer a loss to excuse. Recorded rather than
     silently dropped, because "the exemption became unnecessary" and "the exemption
     was quietly deleted to get a green build" look identical in a diff. */
  ['/cookie-preferences/  heading: apply your settings',
   'the Save / Accept all band. There are no settings to apply: the Astro site sets zero cookies, zero local storage and zero session storage, and makes no third-party request, which scripts/check-csp.js enforces on every build. The legacy buttons wrote a JSON blob to localStorage that no script on the site ever read, so porting them would have shipped a control that silently does nothing, which is worse than having none. The three CATEGORY headings above it are all kept, each answered with what is actually set'],

  /*
   * OA-28, 2026-08-02. Five blocks were restored and their entries deleted from
   * this list: the /contact/ enterprise card, the /faq/ mailto, the /partners/
   * Calendly link, and both of the /tools/ppn-002-calculator/ blocks. ONE entry
   * is left below — the feedback widget — and the reason it carries is what was
   * actually found rather than what was assumed.
   *
   * IT SAID "The two entries left below" UNTIL 2026-08-04. The second was the
   * NPV section, deleted on 2026-08-04 when the root dist/ was rebuilt and it
   * stopped matching, with the deletion recorded in full at the foot of this
   * block. So the file announced two entries immediately above the note
   * explaining why there was one. A count is what a reader checks a list
   * against, and this one was contradicted forty lines further down by its own
   * file — which is worse than no count, because it makes the careful record
   * below look like the careless part.
   */

  /*
   * THE WIDGET NEVER WENT ANYWHERE. The earlier reason here said it "posted to
   * an endpoint the Astro site does not have". It did not post at all: the two
   * buttons at methodology/index.html:213-214 are bare type="button" elements,
   * there is no form, no fetch and no handler anywhere in js/ — grep ca-feedback
   * across the whole legacy script tree returns nothing. Porting it would mean
   * shipping a control that silently discards the answer, which is worse than
   * having none. If feedback is wanted, it needs an endpoint first.
   */
  ['/tools/ppn-002-calculator/methodology/  heading: was this helpful?', 'two dead buttons: no form, no endpoint, no handler in the legacy source; NOT ported until somewhere exists to send an answer'],

  /*
   * NPV: DELIBERATELY NOT RESTORED, AND NO LONGER A LOSS AGAINST SOURCE.
   *
   * This fires because LEGACY is the repo-root dist/, built 09:45 on 2026-08-02,
   * and the legacy SOURCE page was remediated at 11:14 the same day. The eight
   * numbered sections in that build are the pre-remediation page:
   *   - section 4 still carries the anchor id `s4-4-oxford-social-value-bank-svb
   *     -proxy-val`, residue of the Oxford Social Value Bank framework that was
   *     stripped sitewide because it does not exist;
   *   - section 5 states the Calculator "discounts forward-year social value
   *     cashflows" at the HM Treasury Green Book 3.5% rate. The rate is real and
   *     sourced. The behaviour is not: lib/ppn002.ts takes three inputs, holds
   *     one constant (FLOOR_PCT = 10) and has no year input, no duration and no
   *     currency, so there is no cashflow to discount;
   *   - section 6 describes a three-tier scoring window and results "in pounds",
   *     which the same engine does not produce.
   * tools/ppn-002-calculator/methodology/index.html no longer contains any of it.
   * Restoring section 5 would re-import a claim about the product that is false,
   * and would contradict the "It does not discount over time" bullet the Astro
   * page already publishes.
   *
   * IT SAID "this line clears itself the next time the root dist/ is rebuilt", AND
   * IT DID. A-39 rebuilt the root dist/ on 2026-08-04 to withdraw four vendor marks
   * from the published site; this entry immediately reported as matching nothing and
   * is deleted here. The prediction and its outcome are both left on the record,
   * because the same rebuild also exposed a heading that a stale baseline HAD been
   * hiding — see the re-keyed BothSides entry above — and the pair of them is the
   * argument for not letting the root dist/ go stale for two days again.
   */
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

/*
 * THE BASELINE CAN LIE, AND IT ALREADY DID ONCE.
 *
 * This checker trusts the repo-root `dist/` as "what is live". That build is
 * produced separately and can fall behind the legacy SOURCE at the repo root.
 * When it does, a page that was corrected in source but not yet rebuilt still
 * appears in the baseline in its old form, and every correction reads as a
 * regression.
 *
 * That is not hypothetical. On 2026-08-02 this reported the PPN 002 methodology
 * page as having lost an "NPV discount and time horizon" section. It had not:
 * the root dist/ was built at 09:45, the legacy source was remediated at 11:14,
 * and the section only existed in the stale copy — a copy that still carried an
 * Oxford Social Value Bank anchor for a framework that does not exist. Acting on
 * that finding would have restored a description of behaviour the calculator
 * does not have, which is the exact defect (OA-17) that blocked the page from
 * being ported in the first place.
 *
 * So the staleness is reported rather than silently tolerated. It is a WARNING,
 * not a failure: the root build is not part of this pipeline, and failing the
 * Astro build because a different build is old would block work for a reason the
 * person running it cannot fix here. What it must never do is stay quiet, which
 * is how the false finding got as far as an owner-facing report.
 */
function newestHtml(root, skip = []) {
  let newest = 0;
  let which = null;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || skip.includes(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) {
        const m = fs.statSync(p).mtimeMs;
        if (m > newest) { newest = m; which = p; }
      }
    }
  };
  walk(root);
  return { newest, which };
}

const REPO = path.join(__dirname, '..', '..');
/*
 * Only the legacy PAGES count as "source". The first version of this scan
 * skipped the obvious build output and then reported
 * `coverage/lcov-report/.../cookie-banner.js.html` as the newest source, which
 * is a test-coverage report and not a page at all. A directory full of
 * generated .html is not evidence that a page changed.
 */
const src = newestHtml(REPO, [
  'dist', 'astro', 'node_modules', 'migration', 'Assets',
  'coverage', 'tests', 'specs', '.review', '.kiro', 'scripts',
]);
const built = newestHtml(LEGACY);

if (src.newest > built.newest + 60_000) {
  const ago = Math.round((src.newest - built.newest) / 60_000);
  console.log(
    `content-parity: WARNING — the legacy baseline is ${ago} minute(s) older than the legacy source.`
  );
  console.log(`  baseline: ${path.relative(REPO, built.which)}`);
  console.log(`  newer source: ${path.relative(REPO, src.which)}`);
  console.log(
    '  Anything reported below may be a stale baseline rather than a regression.'
  );
  console.log('  Rebuild the root dist/ before trusting a loss on a recently edited page.');
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

/* ------------------------------------------------------------------ *
 * THE REVERSE CHECK: a route that VANISHES.
 *
 * Everything above iterates the ASTRO routes and looks up the legacy
 * counterpart. So does check-seo-parity.js. So a route deleted from the Astro
 * build is never iterated by either, and is invisible to both. check-links.js
 * catches it only while something still links to it, so a route that loses its
 * last inbound link vanishes from every gate at once.
 *
 * THIS PARAGRAPH ALSO SAID "and a _redirects rule satisfies that check without
 * the page existing", and that has not been true of check-links.js since the
 * second version of it. Its `resolves()` follows a rule's DESTINATION and
 * recurses, with a depth cap; only an off-site target, a splat or a placeholder
 * is trusted unevaluated. The behaviour described here is the FIRST version's,
 * which treated the left-hand column as proof and hid a real defect — a 200
 * rewrite to a file the Astro build does not emit. check-links.js records that
 * at length under "A RULE IS NOT A DESTINATION"; this file went on citing the
 * bug as though it were the design.
 *
 * IT MATTERED IN THE WORST DIRECTION. The sentence was part of the argument for
 * writing the block below: it overstated how much a retired route could hide,
 * so the reason this check exists rested partly on a weakness another gate had
 * already closed. The real reason is the one above it and is enough on its own.
 *
 * Net effect before this block: retiring a page passed every gate in silence.
 * That is the same shape as the three defects these checkers were written for
 * (OA-20 links never checked, OA-24 structured-data types never compared,
 * OA-28 rendered content never compared) — the gate asserted something
 * adjacent to the thing that mattered.
 *
 * The baseline is the legacy sitemap, not every .html on disk. A sitemap entry
 * is a URL the site published and asked search engines to index; the repo also
 * holds dev files, partials and scratch pages that were never routes, and
 * treating those as losses would make this check noise.
 */
/*
 * EMPTY, AND OA-20 IS WHY. Every route the legacy sitemap published now ships
 * on the Astro build: /pricing on 2026-08-02, then /integrations, /roadmap and
 * /cookie-preferences on 2026-08-03. Each entry was deleted as its route landed
 * rather than reworded, which is the discipline this list only means anything
 * under. The matching KNOWN_UNPORTED list in check-links.js is empty for the
 * same reason, and carries the full record of what each route was blocked on.
 *
 * Kept as an empty Map rather than removed, for the reason given there: a
 * future retirement needs somewhere to be written down at the moment it
 * happens, or the pressure is to weaken the check instead.
 */
const RETIRED_ROUTES = new Map([]);

const vanished = [];
const legacySitemap = path.join(LEGACY, 'sitemap.xml');

if (fs.existsSync(legacySitemap)) {
  const xml = fs.readFileSync(legacySitemap, 'utf8');
  const seenRetired = new Set();

  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    let p;
    try {
      p = new URL(m[1]).pathname;
    } catch {
      continue;
    }
    p = p.replace(/index\.html$/, '').replace(/\.html$/, '');
    const bare = p.replace(/\/$/, '') || '/';

    if (RETIRED_ROUTES.has(bare)) { seenRetired.add(bare); continue; }

    const candidates = [
      path.join(ASTRO, bare === '/' ? 'index.html' : bare.replace(/^\//, '') + '/index.html'),
      path.join(ASTRO, bare.replace(/^\//, '') + '.html'),
    ];
    if (!candidates.some((f) => fs.existsSync(f))) vanished.push(bare);
  }

  /* Same stale-entry discipline as the allow-list: a retirement that is no
     longer true has to be deleted, or the list slowly stops meaning anything. */
  for (const [route] of RETIRED_ROUTES) {
    if (!seenRetired.has(route)) {
      console.log(`content-parity: RETIRED_ROUTES has a stale entry, ${route} is not in the legacy sitemap. Delete it.`);
    }
  }
} else {
  console.log('content-parity: no legacy sitemap.xml, so the vanished-route check was skipped.');
}

console.log(
  `content-parity: ${compared} route(s) compared against the legacy build, ${unmatched} new route(s) skipped\n`
);

if (vanished.length) {
  console.log(`  ${vanished.length} PUBLISHED ROUTE(S) NO LONGER SHIP, AND ARE NOT RECORDED:`);
  for (const v of vanished) console.log(`    ${v}`);
  console.log('');
  console.log('  Each was in the legacy sitemap, so search engines were told it exists.');
  console.log('  Port it, or add it to RETIRED_ROUTES in this file with the reason and a redirect.');
  console.log('');
}

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

/* A whole route going missing outranks any individual heading, so it fails
   first and on its own, rather than being buried under a list of signals. */
if (vanished.length) {
  console.error(
    `content-parity: ${vanished.length} PUBLISHED ROUTE(S) NO LONGER SHIP AND ARE NOT RECORDED\n`
  );
  for (const v of vanished) console.error(`      ${v}`);
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
  console.error('  Each line is something a reader could do on the legacy page and cannot do now.');
  console.error('  Restore it, or add it to ALLOWED_LOSSES in this file with the reason it went.');
  console.error('');
  process.exit(1);
}

console.log('  nothing lost: every heading, form control and link destination on a legacy');
console.log('  page is still reachable on its Astro replacement, or recorded above.');
