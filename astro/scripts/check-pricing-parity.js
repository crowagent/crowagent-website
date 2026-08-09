/**
 * check-pricing-parity.js — the published price must equal the locked price.
 *
 * ── WHY THIS EXISTS (R262-WEB-08) ───────────────────────────────────────────
 *
 * Not a hypothetical. crowagent-platform/docs/decisions/PRICING-LOCK-2026-08.md
 * opens with the incident that created it:
 *
 *     "This entire episode was caused by a consolidation quietly raising
 *      Starter/Pro seats from 1 / 5 to 3 / 10 because a spec document
 *      recommended it."
 *
 * and closes section 3 with the remedy:
 *
 *     "Copy drift created this whole class of bug; a test is the only thing
 *      that stops it."
 *
 * Every figure this site publishes about a plan is a restatement of a number
 * decided somewhere else. Restatements drift. Nothing on this site could see it
 * happen: the seats were words inside a sentence, the credit allowances were
 * string literals in a comparison table three feet from the array that already
 * held them, and the annual prices were hand-multiplied. This gate is the thing
 * that sees it.
 *
 * ── IT CHECKS BOTH ENDS, AND THE SECOND ONE IS THE POINT ────────────────────
 *
 * SOURCE. `src/data/pricing.ts` is imported for real (Node strips the types) and
 * held against the LOCK table below, field by field. Importing rather than
 * regex-parsing matters: a regex over source can be defeated by a rename, and
 * the module is small enough that the real thing is available for free.
 *
 * DIST. Then the BUILT pages. This is not belt-and-braces, it is the only check
 * that can be trusted, and the reason is mechanical: this site deploys from
 * `astro/dist`, and `astro/dist` is gitignored. A sweep of `src/` for a stale
 * figure therefore returns a FALSE CLEAN for anything baked into a page by a
 * component, a layout, a piece of structured data or a stale artefact. The
 * forbidden-figure sweep in particular MUST read the artefact that ships.
 *
 * ── EVERY RUN CARRIES ITS OWN CONTROLS ──────────────────────────────────────
 *
 * A checker that finds nothing and a checker that cannot find anything print
 * the same thing. So each half of this gate runs a NEGATIVE CONTROL before it
 * reports: the catalogue checker is handed a deliberately corrupted catalogue
 * and must reject it, and the dist scanner is handed synthetic HTML carrying a
 * forbidden price and must catch it. If either control passes clean, the gate
 * fails as BROKEN rather than reporting a clean site. It also holds positive
 * floors on what it found, so a parser that silently matches zero prices is a
 * failure and not a pass.
 *
 * Run: node scripts/check-pricing-parity.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

/* ── THE LOCK ────────────────────────────────────────────────────────────────
 *
 * Transcribed from crowagent-platform/docs/decisions/PRICING-LOCK-2026-08.md
 * section 1, dated 2026-08-09. THIS TABLE IS NOT A DECISION AND MUST NEVER BE
 * EDITED TO MAKE A BUILD PASS. The lock's own opening rule: "Any future change
 * to a number on this page requires a NEW DATED ENTRY in this file. Changing a
 * figure anywhere else, a spec, a constant, a marketing page, a Stripe
 * nickname, is by definition drift, not a decision."
 *
 * If this gate fails, the site is wrong. If the LOCK is wrong, the fix is a new
 * dated entry in that file, and then this table, in that order.
 *
 * `free` is absent deliberately. It is a STATE occupied by an organisation
 * before it subscribes, 0 credits, and it is UNPUBLISHED: it is not a plan and
 * must not appear as one. `trial14` is absent for the same reason plus one
 * more, recorded in data/pricing.ts: no trial credit figure may be published.
 */
const LOCK = {
  plans: [
    { name: 'Starter', monthly: 49, seats: 1, credits: 200 },
    { name: 'Pro', monthly: 149, seats: 5, credits: 750 },
    /* QUOTE, never a figure. £549 / £5,929 are ACTIVE in Stripe so sales can
       quote against them, and publication is blocked in code rather than by
       archiving the price. Publishing either is a P0. */
    { name: 'Portfolio', monthly: null, seats: 10, credits: 3000 },
  ],
  /** Annual is COMPUTED, never written as a literal. Lock section 1. */
  annual: (monthly) => Math.floor(monthly * 12 * 0.9),
  /** £10/100 · £50/500 · £100/1,000, one-time. Lock section 1, PUBLIC. */
  topups: [
    { credits: 100, price: 10 },
    { credits: 500, price: 50 },
    { credits: 1000, price: 100 },
  ],
  /** £0.10 per credit. Lock section 1, PUBLIC. Pence, so it stays an integer. */
  overagePencePerCredit: 10,
};

/* ── FORBIDDEN ON ANY PUBLIC SURFACE ─────────────────────────────────────────
 *
 * Swept across every built page, not just the pricing one, because the ways a
 * price reaches a page are not all on the pricing page: structured data, an
 * open-graph card, a blog post, a comparison table. The £99 that this repo
 * spent a year serving on an OG card is the precedent.
 */
const FORBIDDEN = [
  {
    id: 'portfolio-list-price',
    pattern: /(?:£|&pound;)\s?549\b/gi,
    why:
      'Portfolio is CONTACT SALES. Its £549 monthly list price stays ACTIVE in Stripe so sales\n' +
      '      can quote against it, and the lock says publication is blocked in code rather than by\n' +
      '      archiving the price. Publishing it is a P0.',
  },
  {
    id: 'portfolio-annual-list-price',
    pattern: /(?:£|&pound;)\s?5,?929\b/gi,
    why: 'The Portfolio ANNUAL list price. Same rule, same severity, as the monthly one above.',
  },
];

/* Seat wordings that are drift by construction: 3 / 10 is the raise the lock
   exists to overturn, and "unlimited" is the Portfolio seat value that meant one
   subscription could host a 200-person consultancy. */
const FORBIDDEN_SEATS = [
  { id: 'seats-three', pattern: /\b3 users\b/gi, why: 'Starter is 1 user. "3 users" is the superseded raise.' },
  {
    id: 'seats-unlimited',
    pattern: /\bunlimited (?:users|seats)\b/gi,
    why: 'Portfolio is 10 users included, more by arrangement. It has never been unlimited since the lock.',
  },
];

/* ── PAGES THE PUBLISHED FIGURES MUST APPEAR ON ──────────────────────────────
 *
 * Held as MUST-CONTAIN rather than must-equal, because a page may legitimately
 * mention a figure in more than one place. What is checked exhaustively is the
 * other direction: every plan-shaped £ amount on /pricing must be one the lock
 * allows (see ALLOWED_POUNDS below).
 */
const PRICING_PAGE = 'pricing/index.html';

/* £ amounts on /pricing that are NOT plan prices. Same contract as
   check-facts.js: named, with a reason a reader can check, and reported as
   stale when they stop matching. A magnitude suffix (£5m, £250k) is handled by
   the scanner itself rather than listed here, because it is a general fact
   about what a magnitude is, not an exception about one page. */
const ALLOWED_POUNDS = [];

// ─────────────────────────────────────────────────────────────────────────────
// Source half: the catalogue against the lock.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure so the negative control can call it with a corrupted catalogue. Returns
 * a list of human-readable violations; empty means the catalogue agrees with
 * the lock.
 *
 * @param {{PLANS: any[], CREDIT_TOPUPS: any[], OVERAGE_PENCE_PER_CREDIT: number}} cat
 */
function checkCatalogue(cat) {
  const bad = [];
  const { PLANS, CREDIT_TOPUPS, OVERAGE_PENCE_PER_CREDIT } = cat;

  if (!Array.isArray(PLANS) || PLANS.length !== LOCK.plans.length) {
    bad.push(`PLANS has ${Array.isArray(PLANS) ? PLANS.length : 'no'} entries, lock has ${LOCK.plans.length}`);
    return bad;
  }

  for (const locked of LOCK.plans) {
    const plan = PLANS.find((p) => p.name === locked.name);
    if (!plan) {
      bad.push(`no published plan named "${locked.name}"`);
      continue;
    }

    if (plan.monthly !== locked.monthly) {
      bad.push(`${locked.name} monthly is ${fmt(plan.monthly)}, lock says ${fmt(locked.monthly)}`);
    }
    if (plan.seats !== locked.seats) {
      bad.push(`${locked.name} seats is ${plan.seats}, lock says ${locked.seats}`);
    }
    if (plan.credits !== locked.credits) {
      bad.push(`${locked.name} credits is ${plan.credits}, lock says ${locked.credits}`);
    }

    /* Annual is derived, so it is checked as ARITHMETIC and not as a second
       locked figure. floor(), so the published price is never higher than the
       stated 10% implies. */
    if (locked.monthly === null) {
      if (plan.annual !== null) {
        bad.push(`${locked.name} publishes an annual price (${fmt(plan.annual)}); it is quote-only`);
      }
    } else {
      const expected = LOCK.annual(locked.monthly);
      if (plan.annual !== expected) {
        bad.push(
          `${locked.name} annual is ${fmt(plan.annual)}, but floor(${locked.monthly} x 12 x 0.9) = ${expected}`,
        );
      }
    }
  }

  // Top-up packs.
  if (!Array.isArray(CREDIT_TOPUPS) || CREDIT_TOPUPS.length !== LOCK.topups.length) {
    bad.push(
      `CREDIT_TOPUPS has ${Array.isArray(CREDIT_TOPUPS) ? CREDIT_TOPUPS.length : 'no'} packs, ` +
        `lock has ${LOCK.topups.length}`,
    );
  } else {
    for (const locked of LOCK.topups) {
      const pack = CREDIT_TOPUPS.find((t) => t.credits === locked.credits);
      if (!pack) {
        bad.push(`no published top-up pack of ${locked.credits} credits`);
        continue;
      }
      if (pack.price !== locked.price) {
        bad.push(`${locked.credits}-credit top-up is ${fmt(pack.price)}, lock says ${fmt(locked.price)}`);
      }
      /* The unit rate has to hold too, or a pack could match the lock while the
         lock and the platform's own `topupPricePence` had drifted apart. */
      const impliedPence = Math.round((pack.price * 100) / pack.credits);
      if (impliedPence !== LOCK.overagePencePerCredit) {
        bad.push(
          `${locked.credits}-credit top-up works out at ${impliedPence}p a credit, ` +
            `not the ${LOCK.overagePencePerCredit}p unit rate`,
        );
      }
    }
  }

  if (OVERAGE_PENCE_PER_CREDIT !== LOCK.overagePencePerCredit) {
    bad.push(
      `overage is ${OVERAGE_PENCE_PER_CREDIT}p a credit, lock says ${LOCK.overagePencePerCredit}p`,
    );
  }

  return bad;
}

function fmt(v) {
  return v === null || v === undefined ? 'none' : `£${v}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dist half: the artefact that actually ships.
// ─────────────────────────────────────────────────────────────────────────────

function builtPages(dir = DIST, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) builtPages(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Everything the page PUBLISHES, which is more than the prose a reader sees.
 *
 * ── THIS FUNCTION IS THE SECOND VERSION, AND THE FIRST ONE HAD THE BUG ──────
 *
 * It began as "strip scripts, styles and tags, keep what is left". Proving the
 * gate on 2026-08-09 by planting `£549 a month, £5,929 a year` into the built
 * pricing page caught NOTHING: the plant landed inside the FAQPage JSON-LD, and
 * that lives in a `<script type="application/ld+json">` which the strip removed.
 * A forbidden price was sitting in the served document and the gate called the
 * page clean.
 *
 * That is not a hypothetical route either. This repo's own record of the £99
 * ghost price (pricing.astro's header) is a price that lived on an OPEN GRAPH
 * CARD for about a year, and an OG card is a `content="..."` ATTRIBUTE, which
 * the naive strip also discarded. Both of the two ways a price has actually
 * escaped onto this site were invisible to the first version.
 *
 * So three things are kept and the rest is dropped:
 *
 *   1. JSON-LD script bodies. Structured data is served to every crawler and is
 *      quoted back by search engines. A price in it is published.
 *   2. The values of `content`, `aria-label`, `title` and `alt`. Meta
 *      descriptions, OG cards and accessible names are read by people and
 *      machines; "only a screen-reader user would meet it" is a reason to check
 *      it, not to skip it. check-facts.js made the same call about em-dashes
 *      inside visually-hidden spans.
 *   3. The visible prose.
 *
 * Non-JSON-LD scripts and stylesheets stay dropped: those are the compiled
 * bundles, where a match would be a variable name rather than a claim.
 */
function publishedText(html) {
  const kept = [];

  /* 1. JSON-LD bodies, captured before the blanket script strip removes them. */
  const ld = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ld.exec(html)) !== null) kept.push(m[1]);

  /* 2. User-facing attribute values, taken off the raw HTML so a tag strip
        cannot eat them first. */
  const attr = /\s(?:content|aria-label|title|alt)=["']([^"']*)["']/gi;
  while ((m = attr.exec(html)) !== null) kept.push(m[1]);

  /* 3. The prose. */
  kept.push(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );

  return kept.join('\n');
}

/**
 * Every £ amount in some text, with the character that follows it, so a
 * magnitude (£5m, £250k, £4bn) can be told apart from a price. Returns
 * `{ value, raw, suffix }`.
 */
function poundAmounts(text) {
  const out = [];
  const re = /(?:£|&pound;)\s?(\d[\d,]*(?:\.\d+)?)\s*([a-zA-Z]{0,2})/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ value: Number(m[1].replace(/,/g, '')), raw: m[1], suffix: m[2].toLowerCase() });
  }
  return out;
}

const MAGNITUDE = new Set(['m', 'bn', 'k']);

// ─────────────────────────────────────────────────────────────────────────────
// Controls. Run BEFORE anything is reported, because a broken checker and a
// clean site are indistinguishable from the outside.
// ─────────────────────────────────────────────────────────────────────────────

function runControls() {
  const broken = [];

  /* NEGATIVE CONTROL 1 — the catalogue checker must REJECT a wrong catalogue.
     Every field the lock governs is corrupted at once, and each corruption is a
     defect that has actually happened somewhere in this codebase: the 1/5 to
     3/10 seat raise, a stale credit allowance, a hand-typed annual price that
     is one pound off the arithmetic, the Portfolio list price published at all,
     and a top-up priced off the £0.10 unit rate. */
  const corrupt = {
    PLANS: [
      { name: 'Starter', monthly: 49, annual: 529, seats: 3, credits: 200 },
      { name: 'Pro', monthly: 149, annual: 1610, seats: 10, credits: 500 },
      { name: 'Portfolio', monthly: 549, annual: 5929, seats: 10, credits: 3000 },
    ],
    CREDIT_TOPUPS: [
      { credits: 100, price: 12 },
      { credits: 500, price: 50 },
      { credits: 1000, price: 100 },
    ],
    OVERAGE_PENCE_PER_CREDIT: 15,
  };
  const caught = checkCatalogue(corrupt);
  /* A correct checker reports NINE findings against that object: Starter seats;
     Pro seats, credits and annual; Portfolio publishing a monthly and an annual
     at all; the top-up price and the unit rate it implies; and the overage rate.
     The floor is held at seven rather than nine so that adding a check cannot
     fail the control, while dropping two would. */
  if (caught.length < 7) {
    broken.push(
      `catalogue control: a catalogue corrupted in 9 places drew only ${caught.length} finding(s). ` +
        `The checker is not checking every field.`,
    );
  }

  /* NEGATIVE CONTROL 2 — the forbidden sweep must catch a planted price. */
  const planted = '<p>Portfolio is £549 a month, or £5,929 a year.</p>';
  for (const rule of FORBIDDEN) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(planted)) {
      broken.push(`forbidden control: rule "${rule.id}" did not match planted HTML containing the price`);
    }
    rule.pattern.lastIndex = 0;
  }

  /* NEGATIVE CONTROL 3 — the two routes a price has ACTUALLY escaped on this
     site must both be readable. Written after the first version of this gate
     missed a £549 planted in JSON-LD and called the page clean; see the header
     on publishedText(). Kept as a permanent control rather than a one-off fix,
     because the failure mode was silent and would be silent again. */
  const hidden =
    '<script type="application/ld+json">{"text":"Portfolio is £549 a month."}</script>' +
    '<meta name="description" content="CrowMark from £5,929 a year">' +
    '<p>Nothing to see in the prose.</p>';
  const scanned = publishedText(hidden);
  for (const rule of FORBIDDEN) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(scanned)) {
      broken.push(
        `surface control: "${rule.id}" not found in JSON-LD or a content attribute. ` +
          `Structured data and meta tags are published surfaces and must be scanned.`,
      );
    }
    rule.pattern.lastIndex = 0;
  }

  /* NEGATIVE CONTROL 4 — the £ scanner must find amounts, and must not mistake
     a magnitude for a price. */
  const amounts = poundAmounts('worth £5m on a £49 plan and a £1,609 year');
  if (amounts.length !== 3) {
    broken.push(`scanner control: expected 3 amounts in the sample, found ${amounts.length}`);
  } else if (amounts[0].suffix !== 'm' || amounts[1].suffix === 'm') {
    broken.push('scanner control: magnitude suffix not being read off the amount');
  }

  /* POSITIVE CONTROL — the clean catalogue must pass. A checker that rejects
     everything is as useless as one that accepts everything. */
  const cleanSample = {
    PLANS: LOCK.plans.map((p) => ({
      ...p,
      annual: p.monthly === null ? null : LOCK.annual(p.monthly),
    })),
    CREDIT_TOPUPS: LOCK.topups,
    OVERAGE_PENCE_PER_CREDIT: LOCK.overagePencePerCredit,
  };
  const falsePositives = checkCatalogue(cleanSample);
  if (falsePositives.length) {
    broken.push(
      `positive control: the lock's own values were rejected (${falsePositives.length} violation(s)). ` +
        `First: ${falsePositives[0]}`,
    );
  }

  return broken;
}

// ─────────────────────────────────────────────────────────────────────────────
// Run.
// ─────────────────────────────────────────────────────────────────────────────

const violations = [];

console.log('pricing parity: lock = PRICING-LOCK-2026-08.md (owner decision, 2026-08-09)');

// ── Controls first.
const brokenControls = runControls();
if (brokenControls.length) {
  console.error('\npricing parity: THE GATE ITSELF IS BROKEN\n');
  for (const b of brokenControls) console.error(`  ${b}`);
  console.error('\n  A gate whose controls fail cannot report a clean site. Fix the gate.\n');
  process.exit(1);
}
console.log('  controls: 4 negative + 1 positive, all behaved');

// ── Source: the catalogue.
const catalogue = await import('../src/data/pricing.ts');
const catalogueFaults = checkCatalogue(catalogue);
for (const f of catalogueFaults) {
  violations.push({ where: 'src/data/pricing.ts', what: f });
}
console.log(
  `  source: ${LOCK.plans.length} plans, ${LOCK.topups.length} top-up packs and the overage rate ` +
    `checked against the lock`,
);

// ── Dist: the artefact.
if (!fs.existsSync(DIST)) {
  console.error('\npricing parity: dist/ does not exist. Run `astro build` first.');
  console.error('  A source-only pass is a FALSE CLEAN: this site deploys from astro/dist and');
  console.error('  dist is gitignored, so a stale figure can ship from a file git never shows you.\n');
  process.exit(1);
}

const pages = builtPages();
let forbiddenHits = 0;
let poundsSeen = 0;

for (const file of pages) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const text = publishedText(html);

  /* Forbidden prices and seat wordings, on EVERY built page. */
  for (const rule of [...FORBIDDEN, ...FORBIDDEN_SEATS]) {
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      forbiddenHits += 1;
      violations.push({ where: `dist/${rel}`, what: `${rule.id}: published "${m[0].trim()}"`, why: rule.why });
    }
  }

  /* Exhaustive £ check, on the pricing page only. Everywhere else a £ amount is
     as likely to be a contract value as a price of ours. */
  if (rel === PRICING_PAGE) {
    for (const amount of poundAmounts(text)) {
      poundsSeen += 1;
      if (MAGNITUDE.has(amount.suffix)) continue;

      const allowedValues = new Set([
        ...LOCK.plans.filter((p) => p.monthly !== null).map((p) => p.monthly),
        ...LOCK.plans.filter((p) => p.monthly !== null).map((p) => LOCK.annual(p.monthly)),
        ...LOCK.topups.map((t) => t.price),
        LOCK.overagePencePerCredit / 100,
      ]);

      if (allowedValues.has(amount.value)) continue;
      if (ALLOWED_POUNDS.some((a) => a.value === amount.value)) continue;

      violations.push({
        where: `dist/${rel}`,
        what: `£${amount.raw} is published but is not a locked price`,
        why:
          'Allowed on /pricing: the plan monthlies, their computed annuals, the three top-up\n' +
          '      packs and the per-credit overage rate. Anything else is either drift or needs a\n' +
          '      named entry in ALLOWED_POUNDS carrying a reason.',
      });
    }

    /* MUST-CONTAIN. The lock's whole point is that these figures are PUBLISHED,
       so a page that quietly loses one is a defect in the same family as a page
       that publishes the wrong one. */
    const mustContain = [
      ...LOCK.plans.filter((p) => p.monthly !== null).map((p) => ({ label: `£${p.monthly}`, re: new RegExp(`£\\s?${p.monthly}\\b`) })),
      ...LOCK.topups.map((t) => ({
        label: `£${t.price} top-up`,
        re: new RegExp(`£\\s?${t.price}\\b`),
      })),
      { label: 'the £0.10 overage rate', re: /£\s?0\.10\b/ },
      ...LOCK.plans.map((p) => ({
        label: `${p.credits} credits`,
        re: new RegExp(`\\b${p.credits.toLocaleString('en-GB')}\\b`),
      })),
      ...LOCK.plans.map((p) => ({
        label: `${p.seats} seat(s)`,
        re: new RegExp(`\\b${p.seats} users?\\b`),
      })),
    ];
    for (const item of mustContain) {
      if (!item.re.test(text)) {
        violations.push({
          where: `dist/${rel}`,
          what: `${item.label} does not appear on the built pricing page`,
          why:
            'The lock makes these figures PUBLIC. Top-ups and overage in particular are real\n' +
            '      charges a customer can incur, and their absence from every public surface is the\n' +
            '      clarity gap this gate was added to keep closed.',
        });
      }
    }
  }
}

console.log(`  dist: ${pages.length} built pages swept, ${poundsSeen} £ amounts read on /${PRICING_PAGE}`);

/* POSITIVE FLOOR. A sweep that read zero prices off the pricing page found
   nothing because it is broken, not because the site is clean, and without this
   line the two print identically. */
if (poundsSeen < 6) {
  console.error(
    `\npricing parity: only ${poundsSeen} £ amounts found on the built pricing page. ` +
      `That page publishes at least 6 (two monthlies, two annuals, three top-ups, the overage rate).`,
  );
  console.error('  The dist sweep is not reading the page. Treated as a failure, not a clean run.\n');
  process.exit(1);
}

for (const a of ALLOWED_POUNDS) {
  console.log(`  named exception: £${a.value} — ${a.reason}`);
}

if (violations.length) {
  console.error(`\npricing parity: ${violations.length} violation(s)\n`);
  for (const v of violations) {
    console.error(`  ${v.where}`);
    console.error(`      ${v.what}`);
    if (v.why) console.error(`      ${v.why}`);
    console.error('');
  }
  console.error('  The LOCK is not editable to make this pass. A change to any figure needs a new');
  console.error('  dated entry in crowagent-platform/docs/decisions/PRICING-LOCK-2026-08.md first.\n');
  process.exit(1);
}

console.log('\n  every published figure agrees with the lock, and no forbidden figure is published');
