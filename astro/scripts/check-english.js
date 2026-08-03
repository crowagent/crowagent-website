/**
 * check-english.js — the site is British, and the build says so.
 *
 * WHY THIS EXISTS. The owner reported on 2026-08-03 that British English was not
 * being followed, and they were right: `toward` had been written seven times
 * across five files, three of them added the same day. Nothing on this site
 * asserted the rule, so it was being kept by whoever happened to remember it —
 * which is the same "manual enforcement wearing a central-looking hat" that
 * produced ten hand-copied page headers.
 *
 * It is the cheapest gate in the build: a word list over the source text. No
 * browser, no build artefacts, tens of milliseconds.
 *
 * ── THE HARD PART IS NOT THE WORD LIST, IT IS THE EXEMPTIONS ────────────────
 *
 * Almost every American spelling this rule cares about is ALSO a fixed
 * identifier that must keep its American form:
 *
 *   CSS properties and keywords   color, background-color, text-align: center,
 *                                 align-items: center, transition-behavior,
 *                                 color-mix(), forced-colors, color-scheme
 *   schema.org type names         Organization, BlogPosting's publisher graph
 *   ARIA roles and DOM API        role="dialog", HTMLDialogElement, centerX
 *   package and file names        anything inside a path or an import
 *
 * A naive grep for `color` reports 22 hits on a correct codebase and gets
 * switched off within a week. So this checks PROSE only: comment bodies and
 * user-facing string literals, with code stripped first. The stripping is the
 * feature, not a workaround.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It does not spell-check. It does not have
 * an opinion on -ise versus -ize where Oxford accepts both; `organize` is
 * flagged because this repo's existing prose is consistently -ise, and
 * consistency is the point rather than correctness. It cannot see American
 * spelling in an image, in Figma, or in a git commit message — commit messages
 * are immutable here, since CLAUDE.md forbids rewriting history, so those are
 * go-forward only.
 *
 * Same contract as every other gate: an allow-list whose entries each carry a
 * reason, printed on every run, stale entries reported, anything unlisted fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');
const SCRIPTS = __dirname;

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LIST — each entry is a decision somebody has to defend.
 * Keys are `<american>  <file>`, matched case-insensitively.
 * ══════════════════════════════════════════════════════════════════════════ */
const ALLOWED = new Map([
  /* EMPTY, AND THAT IS THE POINT. The first version seeded this with `dialog`
     in CommandPalette.astro, and the gate immediately reported the entry as
     STALE — the prose extraction already strips the ARIA role, so the exemption
     was guarding nothing. An allow-list entry that matches nothing is worse
     than none: it reads as a known exception and quietly stops being one.
     Add an entry only when the gate actually reports the line. */
]);

/*
 * American -> British, as EXPLICIT patterns rather than a stem plus guessed
 * suffixes.
 *
 * THE FIRST VERSION APPENDED `(s|d|ing|ed)?` TO EACH STEM AND FLAGGED ITS OWN
 * CORRECT ANSWER: `\btoward(s)?\b` matches "towards", so every properly British
 * use was reported as a violation. A rule that cannot tell its fix from its
 * defect is worse than no rule.
 *
 * Each entry carries its own negative context where the American form is also a
 * fixed identifier, so the exclusion lives with the word instead of bloating an
 * allow-list that is supposed to shrink.
 */
const PAIRS = [
  // "towards" is British; "toward" alone is not. The lookahead is the whole rule.
  { re: /\btoward(?!s)\b/gi, want: 'towards' },

  // `transition-behavior` and `scroll-behavior` are CSS properties.
  { re: /(?<![-\w])behaviou?r(?<!behaviour)s?\b/gi, want: 'behaviour',
    skip: /-behavior|behavior\s*:/i },

  // `Organization` is a schema.org type and `#organization` a JSON-LD @id.
  { re: /\borganiz(e|es|ed|ing|ation|ations)\b/gi, want: 'organis-',
    skip: /['"`#@]|@type|schema|Organization\b/ },

  { re: /\brecogniz(e|es|ed|ing)\b/gi, want: 'recognis-' },
  { re: /\banalyz(e|es|ed|ing)\b/gi, want: 'analys-' },
  { re: /\bcustomiz(e|es|ed|ing|ation)\b/gi, want: 'customis-' },
  { re: /\bnormaliz(e|es|ed|ing|ation)\b/gi, want: 'normalis-' },
  { re: /\boptimiz(e|es|ed|ing|ation)\b/gi, want: 'optimis-' },
  { re: /\bprioritiz(e|es|ed|ing)\b/gi, want: 'prioritis-' },
  { re: /\bminimiz(e|es|ed|ing)\b/gi, want: 'minimis-' },
  { re: /\bmaximiz(e|es|ed|ing)\b/gi, want: 'maximis-' },
  { re: /\bemphasiz(e|es|ed|ing)\b/gi, want: 'emphasis-' },
  { re: /\bsummariz(e|es|ed|ing)\b/gi, want: 'summaris-' },
  { re: /\bcategoriz(e|es|ed|ing)\b/gi, want: 'categoris-' },
  { re: /\bsynchroniz(e|es|ed|ing)\b/gi, want: 'synchronis-' },
  { re: /\btokeniz(e|es|ed|ing)\b/gi, want: 'tokenis-' },

  { re: /\bfavor(s|ed|ing|ite|ites)?\b/gi, want: 'favour' },
  { re: /\bhonor(s|ed|ing)?\b/gi, want: 'honour' },
  { re: /\bdefense\b/gi, want: 'defence' },
  { re: /\boffense\b/gi, want: 'offence' },
  { re: /\bcancel(ed|ing)\b/gi, want: 'cancelled / cancelling' },
  { re: /\bcancelation\b/gi, want: 'cancellation' },
  { re: /\blabel(ed|ing)\b/gi, want: 'labelled / labelling' },
  { re: /\bmodeling\b/gi, want: 'modelling' },
  { re: /\btravel(ed|ing)\b/gi, want: 'travelled / travelling' },
  { re: /\bfulfill\b/gi, want: 'fulfil' },
  { re: /\benrollment\b/gi, want: 'enrolment' },
  { re: /\bgray\b/gi, want: 'grey', skip: /grayscale|gray\s*\(/i },
  { re: /\bcatalog\b/gi, want: 'catalogue' },
  { re: /\bjudgment\b/gi, want: 'judgement' },
  { re: /\bskeptic(al|ism)?\b/gi, want: 'sceptic-' },
  { re: /\bgotten\b/gi, want: 'got' },
  { re: /\baluminum\b/gi, want: 'aluminium' },
  { re: /\bpracticing\b/gi, want: 'practising' },

  /* DELIBERATELY ABSENT: license/licence. The NOUN is "licence" and the VERB is
     "license" in British English, so "licensed", "licensing" and "a licensed
     image" are all correct and only the bare noun is wrong. Nothing in a regex
     can tell those apart, and the first version flagged a correct sentence about
     licensed photography. A rule that cries wolf on right answers gets switched
     off, so this one is not written at all. */
];

const files = [];
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(astro|ts|js|mjs|css|md)$/.test(e.name)) files.push(p);
  }
})(SRC);
for (const e of fs.readdirSync(SCRIPTS)) {
  if (/\.(js|mjs)$/.test(e) && e !== 'check-english.js') files.push(path.join(SCRIPTS, e));
}

/**
 * Reduce a source file to its PROSE: comment bodies plus user-facing string
 * literals. Everything else — identifiers, imports, CSS declarations, class
 * names, schema keys — is blanked to spaces so offsets still map to line
 * numbers.
 */
function prose(code, file) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  let s = code;
  // Keep comment bodies; blank the code between them.
  const kept = [];
  const commentRe = /\/\*[\s\S]*?\*\/|(^|[^:])\/\/[^\n]*|\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g;
  let m;
  let last = 0;
  let out = '';
  while ((m = commentRe.exec(s))) {
    out += blank(s.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  out += blank(s.slice(last));
  // Markdown is prose end to end.
  if (file.endsWith('.md')) return code;
  // Also keep the human-facing string literals a reader actually sees.
  for (const lit of code.matchAll(/(?:title|description|standfirst|heading|body|label|eyebrow|caption|alt|kicker|note|verdict)\s*[:=]\s*(['"`])([\s\S]{4,400}?)\1/g)) {
    kept.push(lit[2]);
  }
  return out + '\n' + kept.join('\n');
}

const rel = (f) => path.relative(path.join(__dirname, '..'), f).split(path.sep).join('/');
const hits = [];
const used = new Set();

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const text = prose(code, file);
  for (const rule of PAIRS) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text))) {
      /* The skip test reads the WHOLE LINE, not just the match. A word is
         exempt because of the company it keeps — `transition-behavior` is a CSS
         property, `'#organization'` is a JSON-LD id — and neither is visible
         from the matched substring alone. */
      const lineStart = text.lastIndexOf('\n', m.index) + 1;
      const lineEndRaw = text.indexOf('\n', m.index);
      const lineText = text.slice(lineStart, lineEndRaw === -1 ? undefined : lineEndRaw);
      if (rule.skip && rule.skip.test(lineText)) continue;
      const key = `${m[0].toLowerCase()}  ${rel(file)}`;
      if (ALLOWED.has(key)) { used.add(key); continue; }
      hits.push({
        file: rel(file),
        line: text.slice(0, m.index).split('\n').length,
        found: m[0],
        want: rule.want,
      });
    }
  }
}

/* ── Report ───────────────────────────────────────────────────────────────── */
console.log(`english: ${files.length} source file(s) scanned for British spelling`);

if (ALLOWED.size) {
  console.log(`\n  ${ALLOWED.size} allowed exception(s):`);
  for (const [k, why] of ALLOWED) {
    console.log(`    ${k}\n        ${why}`);
    if (!used.has(k)) console.log('        ⚠ STALE — this no longer matches anything; delete it');
  }
}

if (hits.length) {
  console.error(`\nenglish: ${hits.length} American spelling(s) in prose\n`);
  const byWord = new Map();
  for (const h of hits) {
    const k = `${h.found.toLowerCase()} -> ${h.want}`;
    if (!byWord.has(k)) byWord.set(k, []);
    byWord.get(k).push(`${h.file}:${h.line}`);
  }
  for (const [k, where] of [...byWord].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  ${k}`);
    for (const w of where.slice(0, 8)) console.error(`      ${w}`);
    if (where.length > 8) console.error(`      ... and ${where.length - 8} more`);
  }
  console.error(
    '\n  This checks PROSE only — comment bodies and user-facing strings. CSS\n' +
    '  keywords (color, center), schema.org types (Organization) and ARIA roles\n' +
    '  (dialog) are stripped before the check and cannot trip it. If one of these\n' +
    '  is genuinely a fixed identifier, add it to ALLOWED with the reason.\n',
  );
  process.exit(1);
}

console.log('\n  clean: every spelling in prose is British, or is named above with the\n  reason it is not.');
