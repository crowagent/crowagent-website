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
];

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * `{ rule, file, reason }`. A file is exempted from ONE rule, never from the
 * gate. Every entry must carry a reason a reader can check.
 */
const ALLOW = [
  {
    rule: 'ppn002-act-date',
    file: 'content/blog/private-sector-rfp-pqq-guide.md',
    reason:
      'Correct, and correct in a way no pattern can recognise: "The Procurement Act 2023, which ' +
      'went live on 24 February 2025, and the Procurement Policy Notes issued under it, including ' +
      'PPN 002". The date is attached to the ACT and the PPN is named as issued under it, which is ' +
      'the true relationship. Not hedged automatically, because "under the Procurement Act 2023" ' +
      'is also how the wrong sentence would most likely be written, and hedging on it would blind ' +
      'the rule to the bug it exists to catch.',
  },
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
