/**
 * check-faq-parity.js — a marked-up question and answer must be ON the page.
 *
 * ── WHAT THIS CLOSES (A-87) ─────────────────────────────────────────────────
 *
 * Seventeen routes publish an FAQPage node, 103 Question nodes between them.
 * Measured on 2026-08-04, THIRTEEN answers and TWO questions did not appear
 * anywhere in the rendered page, all of them on four blog posts:
 * find-first-public-sector-contract, procurement-act-2023-sme-guide,
 * method-statement-that-scores and frameworks-and-dps-explained. The other
 * thirteen routes, 79 questions, matched verbatim — so the correct pattern was
 * already the house style and those four were where the JSON-LD had been
 * authored separately from the prose and the two copies had drifted.
 *
 * Google requires marked-up Q&A to be present on the page for the reader, so
 * that is a guideline breach and manual-action grounds. Stated honestly in both
 * directions: FAQ rich results were restricted in August 2023 to authoritative
 * government and health sites, so the lost UPSIDE is small. The exposure is the
 * breach and the quality signal, not a missing SERP feature.
 *
 * ── IT IS STATIC, AND THE DEFECT REPORT SAID IT COULD NOT BE ────────────────
 *
 * A-87 records "NO GATE CAN CATCH THIS STATICALLY. It needs the RENDERED DOM
 * with <details> forced open." That is true of a check written against a
 * BROWSER — the auditor's own first pass reported 78 false mismatches before it
 * opened the accordions. It is not true of a check written against the built
 * HTML, and the difference is worth stating because it is the whole reason this
 * gate is cheap enough to run on every build:
 *
 *   A <details> element's contents are IN THE DOCUMENT whether it is open or
 *   shut. `open` changes what is painted, not what was served. A text pass over
 *   the HTML therefore sees closed accordions for free, and needs no browser,
 *   no viewport and no settle.
 *
 * So this runs in well under a second beside gates that take minutes, and it is
 * placed immediately after check-seo-parity.js, which is the other gate that
 * reads structured data.
 *
 * ── WHAT IT COMPARES, AND HOW FORGIVING IT IS ───────────────────────────────
 *
 * Both sides are normalised to lowercase alphanumerics separated by single
 * spaces before comparison. That is deliberately generous, and each thing it
 * forgives is something that is NOT the defect:
 *
 *   markup       `**Find a Tender**` renders as <strong>, and a reader sees one
 *                phrase either way.
 *   entities     &amp; &#39; &pound; and the curly quotes Astro's typographer
 *                substitutes are the same characters to a reader.
 *   punctuation  a comma the prose has and the JSON-LD does not is a copy-edit,
 *                not a page missing its answer.
 *
 * What it does NOT forgive is a missing or reworded CLAUSE, which is exactly
 * what the four blog posts had: "It is a scored section, not a box-ticking
 * annex, so it can decide a close competition" in the JSON-LD against "It is
 * scored, so it can decide a close result" on the page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/**
 * Route floor, so the gate cannot pass by finding nothing. A run that compares
 * zero questions is a broken parser, not a clean site, and without this line the
 * two report identically. The number is the measured 17 routes / 103 questions,
 * held as a MINIMUM rather than an equality so that adding an FAQ does not fail
 * the build; losing one does.
 */
const MIN_ROUTES = 17;
const MIN_QUESTIONS = 103;

function pages(dir = DIST, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) pages(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  pound: '£', euro: '€', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
};

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);

/** Lowercase alphanumeric words, single-spaced. See the header on forgiveness. */
const norm = (s) =>
  decode(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * The page as a reader would read it. <script> and <style> go first, because a
 * JSON-LD block is itself inside a <script> and leaving it in would let every
 * answer match ITSELF — the check would pass on a page with no visible FAQ at
 * all, which is the exact defect it exists to catch.
 */
const textOf = (html) =>
  norm(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  );

/** Every FAQPage in a page's JSON-LD, whether it sits in an @graph or alone. */
function faqNodes(html) {
  const out = [];
  const blocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    const body = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      /* Reported rather than skipped: unparseable structured data on a shipped
         page is its own defect, and silently ignoring it here is how this gate
         would come to pass on a page whose FAQ nobody can read either. */
      out.push({ unparseable: true });
      continue;
    }
    const nodes = parsed['@graph'] ?? [parsed];
    for (const node of [].concat(nodes)) {
      if (node && node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) out.push(node);
    }
  }
  return out;
}

const missing = [];
const broken = [];
let routesWithFaq = 0;
let questions = 0;

for (const file of pages().sort()) {
  const route = `/${path.relative(DIST, path.dirname(file)).split(path.sep).join('/')}/`.replace('//', '/');
  const html = fs.readFileSync(file, 'utf8');
  const nodes = faqNodes(html);
  if (!nodes.length) continue;

  if (nodes.some((n) => n.unparseable)) {
    broken.push(route);
    continue;
  }

  routesWithFaq += 1;
  const text = ` ${textOf(html)} `;

  for (const node of nodes) {
    for (const entry of node.mainEntity) {
      questions += 1;
      const q = norm(entry.name ?? '');
      const a = norm(entry.acceptedAnswer?.text ?? '');
      if (q && !text.includes(` ${q} `) && !text.includes(q)) {
        missing.push({ route, kind: 'question', text: entry.name });
      }
      if (a && !text.includes(a)) {
        missing.push({ route, kind: 'answer', text: entry.acceptedAnswer.text });
      }
    }
  }
}

console.log(
  `faq-parity: ${questions} marked-up question(s) across ${routesWithFaq} route(s), ` +
    `compared against the text of the page that publishes them\n`
);

const failures = [];

if (broken.length) {
  failures.push(`${broken.length} route(s) publish JSON-LD that does not parse: ${broken.join(', ')}`);
}

if (routesWithFaq < MIN_ROUTES || questions < MIN_QUESTIONS) {
  failures.push(
    `only ${routesWithFaq} route(s) and ${questions} question(s) were found, against a floor of ` +
      `${MIN_ROUTES} and ${MIN_QUESTIONS}. Either an FAQ was lost, or this gate stopped reading them — ` +
      'and a run that compares nothing looks exactly like a clean one, which is why the floor is here.'
  );
}

if (missing.length) {
  const byRoute = new Map();
  for (const m of missing) byRoute.set(m.route, [...(byRoute.get(m.route) ?? []), m]);
  console.error(`faq-parity: ${missing.length} marked-up string(s) DO NOT APPEAR on the page\n`);
  for (const [route, items] of byRoute) {
    console.error(`  ${route}`);
    for (const i of items) console.error(`    ${i.kind.padEnd(8)} ${i.text}`);
  }
  console.error('');
  failures.push(`${missing.length} marked-up string(s) are not on the page that publishes them`);
}

if (failures.length) {
  failures.forEach((f) => console.error(`faq-parity: ${f}`));
  console.error(
    '\n  Google requires marked-up Q&A to be present on the page for the reader. Either put the\n' +
      '  answer on the page in the words the JSON-LD uses, or change the JSON-LD to the words the\n' +
      '  page uses. The two must not be separately authored copies of the same thought.'
  );
  process.exit(1);
}

console.log(
  '  every question and every answer that is marked up is also readable on the page that\n' +
    '  publishes it, closed accordions included'
);
