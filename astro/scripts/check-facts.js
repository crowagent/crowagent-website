/**
 * check-facts.js — the four regulatory facts this site keeps getting wrong.
 *
 * WHY THIS EXISTS. Every rule below is here because the site published the
 * error, not because someone imagined it might. OWNER-ACTIONS.md OA-29 is the
 * worst of them: two published pages listed the PPN 06/20 themes **under the
 * PPN 002 name**, and attached the Procurement Act's commencement date to
 * PPN 002. The dates alone were re-typed as prose in 12 files. On a site whose
 * whole position is that it reads the instrument properly, that is the worst
 * class of error available to us.
 *
 * OA-29 closed with a recommendation, quoted from the log: "add a grep gate
 * failing on `PPN 002` within N characters of `24 February`, which is exactly
 * the pattern that produced this bug." This is that gate, plus the three MEES
 * and threshold rules from CLAUDE.md that had no gate either.
 *
 * IT READS SOURCE, NOT dist/. A fact is wrong the moment it is typed, and this
 * needs to run without a build so it can run while a build cannot.
 *
 * SAME CONTRACT AS THE OTHER GATES. Named exceptions, each carrying a written
 * reason. Every exception printed on every run. Exceptions that no longer match
 * anything are reported as stale. Anything not on the list fails the build.
 *
 * PROXIMITY, NOT SENTENCES. Each rule matches a term within N characters of
 * another term, because the errors it catches were written across clause and
 * sentence boundaries, and a sentence splitter on prose containing "PPN 002."
 * and "£150,000." is its own source of bugs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');

/* ── THE RULES ──────────────────────────────────────────────────────────────
 *
 * `near(a, b, gap)` builds a regex matching `a` within `gap` characters of `b`
 * in either order. `unless` is a second pattern searched in the same window; if
 * it matches, the window is hedged correctly and is not a violation.
 */
function near(a, b, gap) {
  return new RegExp(`(?:${a})[\\s\\S]{0,${gap}}(?:${b})|(?:${b})[\\s\\S]{0,${gap}}(?:${a})`, 'gi');
}

const RULES = [
  {
    id: 'ppn002-act-date',
    pattern: near('PPN\\s*002', '24(?:th)?\\s+February', 200),
    message: '"24 February" beside PPN 002',
    why:
      '24 February 2025 is the PROCUREMENT ACT 2023 commencement date. PPN 002 was published\n' +
      '      13 February 2025 and became mandatory 1 October 2025. Attaching the Act date to the\n' +
      '      PPN is exactly how OA-29 spread across 12 files.',
  },
  {
    id: 'ppn002-floor',
    pattern: near('PPN\\s*002', '\\b5\\s*%', 160),
    message: '"5%" beside PPN 002',
    why: 'The PPN 002 social value weighting floor is 10%. It has never been 5%. CLAUDE.md rule 8.',
  },
  {
    /*
     * R27-CERT-02. A CERTIFICATION CLAIM IS THE ONE FACT A BUYER CAN CHECK IN A
     * REGISTRY, AND THE ONE THAT ENDS AN EVALUATION WHEN IT IS WRONG.
     *
     * ISO/IEC 42001 is the AI management standard, and it is becoming the
     * credential this market sorts on. CrowAgent holds it, is audited against it
     * and is booked for it in exactly none of those senses, measured 2026-08-17:
     * zero occurrences of "42001" anywhere in this repository outside the local
     * board artefact, and the same day's owner record states CrowAgent holds none
     * of ISO 42001, ISO 27001 or SOC 2.
     *
     * THE RULE FIRES ON A MENTION, NOT ON A VERB, and that is deliberate. The
     * dangerous copy is not "we are ISO 42001 certified", which nobody would
     * write by accident. It is a badge in a footer, a logo strip, a comparison
     * table cell, or "ISO 42001 aligned" written next to a genuine control list,
     * each of which a procurement reader takes as a status. Naming the standard
     * on a published page is the act this guards.
     *
     * WHICH MAKES THE HEDGE LOAD-BEARING. The site's `/security` page is exemplary
     * about ISO 27001: "We follow ISO 27001 controls. We are not certified yet",
     * and "We do not currently hold ISO 27001, SOC 2 or Cyber Essentials
     * certification". Copy in that shape about 42001 is honest and must not fail,
     * so `unless` clears a denial within the window and nothing else does. An
     * aspiration such as "planned" or "on the roadmap" is NOT a denial and is not
     * listed: a plan published beside a standard reads as progress, which is the
     * defect this exists to catch.
     *
     * IF CERTIFICATION IS EVER ACHIEVED, this rule is the change: quote the
     * certificate number and the UKAS-accredited body on the page and add a named
     * exception here. UKAS granted its first ISO/IEC 42001 accreditations in
     * January 2026 and the pool of accredited bodies is still small, so an
     * unaccredited certificate is a live risk and a reviewer will ask which body
     * issued it.
     */
    id: 'iso42001-unearned',
    pattern: /ISO(?:\/IEC)?[\s ]*42001/gi,
    unless:
      /\bnot\s+(?:yet\s+)?(?:certified|accredited|audited)\b|\bdo(?:es)?\s+not\s+(?:currently\s+)?hold\b|\bwe\s+hold\s+(?:no|none)\b|\bno\s+ISO(?:\/IEC)?\s*42001\b/i,
    message: 'ISO 42001 named on a published page without a denial beside it',
    why:
      'CrowAgent holds no ISO/IEC 42001 certification and none is in progress. Measured\n' +
      '      2026-08-17: zero mentions in the site source, and the owner record of the same\n' +
      '      day states CrowAgent holds none of ISO 42001, ISO 27001 or SOC 2. Publishing an\n' +
      '      aspiration as a status is a credibility defect in procurement, where the claim is\n' +
      '      checkable against a certification body register. Either state the position the way\n' +
      '      /security states it for ISO 27001, or cite the certificate and the accredited body.',
  },
  {
    id: 'ppn002-old-themes',
    pattern: near('PPN\\s*002', "COVID-19 recovery|Levelling Up|Levelling-Up", 400),
    unless: /PPN\s*06\/20|superseded|replaced|predecessor|no longer/i,
    message: 'a PPN 06/20 theme name beside PPN 002',
    why:
      'COVID-19 recovery, Levelling Up, tackling climate change, equal opportunity and wellbeing\n' +
      '      are the PPN 06/20 THEMES. PPN 002 has five missions, M1 to M5. Naming the old model\n' +
      '      under the current model\'s name is the OA-29 defect itself.',
  },
  {
    id: 'mees-2028',
    pattern: near('EPC', '2028', 160),
    unless: /withdrawn|withdrew|no longer|scrapped|dropped|abandoned/i,
    message: '"2028" beside EPC with no note that it was withdrawn',
    why:
      'The EPC Band C by 2028 interim for non-domestic PRS was WITHDRAWN. The current legal\n' +
      '      minimum is Band E. Stating 2028 as live law is CLAUDE.md rule 6.',
  },
  {
    id: 'mees-2031',
    pattern: near('EPC', '2031', 160),
    unless: /propos|consultation|subject to|not law|secondary legislation/i,
    message: '"2031" beside EPC presented as settled',
    why:
      'A single EPC B standard from 2031 is PROPOSED, subject to secondary legislation. It is not\n' +
      '      law and must never be written as though it were. CLAUDE.md rule 6.',
  },
  {
    id: 'mees-cap',
    pattern: /MEES[\s\S]{0,200}£\s?([\d,]{6,})|£\s?([\d,]{6,})[\s\S]{0,200}MEES/gi,
    message: 'a MEES penalty figure',
    why: 'MEES fines are capped at £150,000 (SI 2015/962). No larger figure can be correct.',
    /* The regex cannot do the arithmetic, so the rule checks the captured number. */
    check: (m) => {
      const n = Number(String(m[1] || m[2]).replace(/,/g, ''));
      return Number.isFinite(n) && n > 150000;
    },
  },
  {
    /*
     * R27-COMPETE-01a, owner decision D-11 (2026-08-18).
     *
     * THE FEATURE IS SOLID. THE CLAIM WAS THE PROBLEM. The Defensible Decision
     * Record was described internally as unique, and the August competitive
     * audit found a larger competitor already owns an equivalent instrument.
     * The owner's decision was to withdraw the uniqueness claim and replace it
     * with a specific, evidenced difference. This rule is the half of that
     * decision that cannot be undone by a later copywriter.
     *
     * WHY IT IS A PREVENTION RULE WITH NO CURRENT HIT, AND WHY THAT IS THE
     * POINT. Swept 2026-08-18: the published site makes NO uniqueness claim
     * about this feature, and /crowmark-buyers is already scrupulously
     * non-comparative ("Your panel scores, not the AI", "Not an e-sourcing
     * portal and not a system of record"). The claim lived in research
     * documents and two API docstrings and never reached the site. So this
     * rule guards the direction the copy would drift IF the feature were ever
     * promoted to the marketing site, which is the one moment nobody would
     * think to re-check the competitive evidence.
     *
     * WHY A SUPERLATIVE IS DIFFERENT FROM AN INACCURACY. Every other rule here
     * catches a fact that is WRONG. This one catches a claim that may well be
     * TRUE and is simply NOT PROVABLE BY US. A UK public-sector buyer can
     * disprove "no other platform does this" with one search, and a buyer who
     * disproves one sentence discounts the whole page. There is no hedged form
     * that rescues it, which is why this rule has no `unless`: "we believe we
     * are the only" is the same claim wearing a hat.
     *
     * IF A UNIQUENESS CLAIM IS EVER GENUINELY EVIDENCED, this rule is the
     * change: cite the evidence in the copy itself and add a named exception
     * below carrying that citation. Quoting a COMPETITOR'S own superlative
     * (e.g. EasyPQQ's "Unique to EasyPQQ Pro") is also an exception case, not
     * a reason to weaken the pattern.
     */
    id: 'feature-uniqueness-unprovable',
    pattern: near(
      'decision\\s+record|decision\\s+of\\s+record|weight(?:ing)?\\s+lock|transparency\\s+record|defensible\\s+decision',
      'no\\s+(?:other\\s+)?(?:competitor|vendor|rival|platform|product|tool|supplier)s?\\b' +
        '|nobody\\s+(?:is|else|has|does|can)\\b' +
        '|no\\s+one\\s+else\\b' +
        '|the\\s+only\\s+(?:platform|product|tool|vendor|system|company|supplier|one)\\b' +
        '|only\\s+(?:platform|product|tool|vendor|system|company|supplier)\\b' +
        '|(?:is|are|remains)\\s+unique\\b' +
        '|unique(?:ly)?\\s+(?:to|in|positioned|placed)\\b' +
        '|first\\s+(?:platform|product|tool|vendor|company)\\b' +
        '|unrivalled|unmatched|industry[-\\s]leading|best[-\\s]in[-\\s]class',
      240,
    ),
    message: 'an unprovable uniqueness claim about the decision record',
    why:
      'Owner decision D-11 (2026-08-18) WITHDREW the uniqueness claim about the Defensible\n' +
      '      Decision Record. A competitor equivalent exists, and the evidence we hold about\n' +
      '      competitors establishes what their products HAVE, never what they LACK, so no "only"\n' +
      '      or "no other" claim about this feature can be sourced. Say what the mechanism does\n' +
      '      instead: the weighting is hashed before any response is read, the digest is\n' +
      '      re-derivable afterwards, and the lock is tamper-evident rather than tamper-proof.\n' +
      '      That is checkable by the buyer and needs no claim about anyone else.',
  },
  {
    id: 'em-dash',
    pattern: /—/g,
    message: 'an em-dash in user-facing text',
    why:
      'PLATFORM-CHARTER.md standing constraints: no em-dashes in user-facing text. Use a comma or two sentences. NOT a semicolon: RULE 0-S bans that in prose too. The rule has been binding since the charter was written and nothing enforced it, so 16 reached the built pages, three of them inside visually-hidden spans where only a screen-reader user would ever meet them. IT LIVES HERE because the hard part is knowing what is PUBLISHED, and this file already blanks comments before scanning: an em-dash in a code comment is not user-facing and must not fail a build. The EN dash is deliberately NOT matched, because it is the aria-hidden not-included marker in the pricing table, which is typography rather than prose.',
  },
];

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * `{ rule, file, reason }`. A file is exempted from ONE rule, never from the
 * gate. Every entry must carry a reason a reader can check.
 */
const ALLOW = [
  /*
   * EMPTY SINCE 2026-08-30, AND THAT IS THE RIGHT STATE RATHER THAN A GAP.
   *
   * The single entry exempted content/blog/private-sector-rfp-pqq-guide.md from
   * ppn002-act-date, because that page wrote "The Procurement Act 2023, which
   * went live on 24 February 2025, and the Procurement Policy Notes issued under
   * it, including PPN 002" - the date attached to the ACT, the PPN named as
   * issued under it, which is the true relationship and one no pattern can
   * recognise. The sentence now names PPN 026, so the pattern no longer reaches
   * it and the exception matched nothing. An exception is a place the gate has
   * agreed not to look, so it is deleted the moment it stops being needed rather
   * than left to print STALE forever.
   *
   * THE THREE PPN 002 RULES ARE DELIBERATELY KEPT. Measured on this build, none
   * of them matches any published text any more: the site names PPN 026. They
   * are not pointed at nothing, they are pointed at a REGRESSION - the three
   * mistakes they encode (the Act's commencement date attached to the PPN, a 5%
   * floor, a PPN 06/20 theme name presented as the current model's) are exactly
   * what a future edit reintroducing the old edition would write, and every one
   * of them has shipped on this site at least once. Softening or deleting a
   * guard because the defect is currently absent is how it comes back.
   */
];

const EXT = new Set(['.astro', '.md', '.mdx', '.ts', '.tsx', '.js', '.json']);

/* ── COMMENTS ARE NOT PUBLISHED, SO THEY ARE NOT SCANNED ────────────────────
 *
 * The first run of this gate reported 7 violations and ALL SEVEN WERE FALSE.
 * Four were comments that exist precisely to stop the bug — `lib/ppn002.ts`
 * saying "the floor is 10%, NEVER 5%", `sources.astro` warning that 24 February
 * is not PPN 002's publication date, `pricing.astro` recording the fix. A gate
 * that fires on the warning against a bug is worse than no gate: it trains
 * whoever runs it to add exceptions, and an exception is a place the gate has
 * agreed not to look.
 *
 * These rules are about WHAT WE PUBLISH. A comment is not published, so it is
 * blanked before scanning. The cost is real and worth stating: a wrong fact
 * sitting in a comment is invisible to this gate. That is the right trade,
 * because the reader never sees it and the corrective comments are the ones
 * that keep being written.
 *
 * Blanked with spaces of equal length rather than deleted, so every reported
 * line number still points at the real line.
 */
function stripComments(text, ext) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  if (ext === '.md' || ext === '.mdx') {
    return text.replace(/<!--[\s\S]*?-->/g, blank);
  }
  return text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:\w])\/\/[^\n]*/g, (m, p1) => p1 + blank(m.slice(p1.length)))
    .replace(/<!--[\s\S]*?-->/g, blank);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (EXT.has(path.extname(e.name))) out.push(f);
  }
  return out;
}

/** Line number of a character offset, for a clickable location. */
function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

const files = walk(SRC);
const violations = [];
const usedExceptions = new Set();

for (const file of files) {
  const rel = path.relative(SRC, file).replace(/\\/g, '/');
  const text = stripComments(fs.readFileSync(file, 'utf8'), path.extname(file));

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      if (rule.check && !rule.check(m)) continue;
      /* `unless` reads a WIDER window than the match.
       *
       * Found by running this gate: `ppn-002-social-value-guide.md` writes
       * "Answering PPN 002 with the old themes. A response organised around
       * COVID-19 recovery, Levelling Up ... is answering PPN 06/20". The
       * corrective clause naming PPN 06/20 sits AFTER the theme list, so it
       * falls outside a match that ends at the theme list, and the gate fired
       * on the sentence that exists to prevent the error. Prose puts the
       * correction after the thing being corrected, so the hedge has to be
       * looked for on both sides. */
      const context = text.slice(Math.max(0, m.index - 300), m.index + m[0].length + 300);
      if (rule.unless && rule.unless.test(context)) continue;

      const exception = ALLOW.find((a) => a.rule === rule.id && a.file === rel);
      if (exception) {
        usedExceptions.add(`${exception.rule}::${exception.file}`);
        continue;
      }

      violations.push({
        rule,
        file: rel,
        line: lineOf(text, m.index),
        excerpt: m[0].replace(/\s+/g, ' ').trim().slice(0, 110),
      });
    }
  }
}

console.log(`facts: ${RULES.length} rules over ${files.length} source files`);
console.log(`  ${ALLOW.length} named exception(s):`);
for (const a of ALLOW) {
  const stale = usedExceptions.has(`${a.rule}::${a.file}`) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.rule}  ${a.file}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW.length) console.log('    none');

const stale = ALLOW.filter((a) => !usedExceptions.has(`${a.rule}::${a.file}`));
if (stale.length) {
  console.log(`\n  ${stale.length} exception(s) match nothing and should be deleted.`);
}

if (violations.length) {
  console.error(`\nfacts: ${violations.length} violation(s)\n`);
  const byRule = new Map();
  for (const v of violations) {
    if (!byRule.has(v.rule.id)) byRule.set(v.rule.id, []);
    byRule.get(v.rule.id).push(v);
  }
  for (const [id, list] of byRule) {
    const rule = RULES.find((r) => r.id === id);
    console.error(`  ${id} — ${rule.message}`);
    console.error(`      ${rule.why}`);
    for (const v of list) console.error(`\n      src/${v.file}:${v.line}\n        ...${v.excerpt}...`);
    console.error('');
  }
  console.error('  Fix the fact, or add a named exception with a reason that survives a reader');
  console.error('  checking it against the primary source.\n');
  process.exit(1);
}

console.log('\n  every rule clean');
