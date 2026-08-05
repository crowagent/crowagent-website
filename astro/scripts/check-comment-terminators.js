/**
 * check-comment-terminators.js — a comment must end where its author meant it to.
 *
 * ── THE INCIDENT THIS EXISTS FOR (A-102, 2026-08-05) ────────────────────────
 *
 * A header comment in a .astro frontmatter block listed the CSS families that a
 * removed hero had owned, and wrote them the way you would say them out loud:
 * `.stratum*` `.plane*` `.hp-*`, run together with slashes between them and no
 * spaces. Written that way, the characters `.stratum*` and the slash after it
 * spell a comment TERMINATOR. The block comment ended at that point, sixty
 * lines before its author's own closing line, and everything after it became
 * code.
 *
 * WHAT THAT COST, MEASURED. `astro check` reported 1,318 TypeScript errors.
 * esbuild failed to parse the file at all. And check-facts.js reported THREE
 * em-dash violations that were not there — the prose in the rest of the header
 * had stopped being a comment, so a gate that deliberately blanks comment
 * bodies before scanning could no longer see that these were comments. Every
 * visible symptom pointed at prose and at content. None of them pointed at the
 * one character pair that caused it. It cost a long debugging session.
 *
 * The fix, once found, was to write `.stratum* /.plane* /.hp-*` with a space
 * after each star. That fix is one keystroke and it is invisible in review,
 * which is exactly why it needs a gate rather than a rule somebody remembers.
 *
 * ── WHAT IS CHECKED, AND WHY THESE THREE ────────────────────────────────────
 *
 *   ORPHAN        A star-slash sitting in code, outside any comment, string,
 *                 template literal or regular expression. This is the DOWNSTREAM
 *                 half of the defect: once a comment has closed early, its real
 *                 closing line is left stranded in code. It is also a hard
 *                 syntax error in JavaScript, TypeScript and CSS alike, so it
 *                 can never be a deliberate thing somebody wrote.
 *
 *   EARLY         A star-slash that closes a MULTI-LINE block comment while
 *                 glued to the character before it. A multi-line comment in
 *                 this repository closes with a star-slash at the start of its
 *                 own line, always; `.stratum*` immediately followed by a slash
 *                 is the shape of an accident, not of a close. This is the
 *                 UPSTREAM half, and it reports the true location — the line the
 *                 author actually typed — rather than the wreckage sixty lines
 *                 later. Single-line comments are exempt: `/*x*` + `/` is glued
 *                 by construction and is not a defect.
 *
 *   UNTERMINATED  A block comment still open at the end of its file, or at the
 *                 end of the <style> or <script> block it lives in. The mirror
 *                 image: a comment that never closes swallows the rest of the
 *                 file instead of releasing it early.
 *
 * ── WHY IT TOKENISES INSTEAD OF GREPPING ────────────────────────────────────
 *
 * A grep for a star-slash outside a comment cannot be written, because whether
 * a given one is inside a comment is exactly the question. So this walks each
 * file with a small scanner that tracks strings, template literals with their
 * `${...}` substitutions, regular expressions, line comments and block
 * comments. The scanner exists to keep FALSE POSITIVES AT ZERO, which is the
 * only property that decides whether a gate survives: this file's own source
 * contains several star-slashes inside string literals, and a gate that failed
 * on itself would be switched off the same afternoon.
 *
 * Regular expressions get the standard division-versus-regex heuristic, plus
 * one safety rule that matters more than the heuristic: a regex literal cannot
 * contain a newline, so if the scan for its closing slash crosses one, the
 * slash is re-read as division. That makes the failure mode "scan a few
 * characters as code that were really a pattern", which at worst costs a
 * report, rather than "swallow half the file", which would cost the gate.
 *
 * .astro files are split into regions first: the frontmatter fence is
 * TypeScript, each <style> body is CSS, each <script> body is JavaScript, and
 * the template between them is markup where only `{`+star-slash-comments are
 * scanned. Markup text is deliberately NOT scanned for orphans, because a
 * star-slash in prose or in a code sample on a page is legitimate.
 *
 * Cheap, like check-english.js: source text only, no browser, no build
 * artefacts, tens of milliseconds. It runs FIRST in the chain for the reason
 * the incident demonstrated — when this defect is present, every gate after it
 * reports something else.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const SCRIPTS = __dirname;

/** The five languages that have C-style block comments in this tree. */
const EXT = /\.(astro|ts|js|mjs|css)$/;

/*
 * Words after which a slash begins a regular expression rather than a division.
 * The punctuation form of the same test is PREV_PUNCT below. Between them they
 * decide, and when they are wrong the newline rule in readRegex() catches it.
 */
const PREV_WORDS = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'do', 'else', 'yield', 'await', 'throw', 'case',
]);
const PREV_PUNCT = '(,=:[!&|?{};+-*%~^<>';

/* ── The scanner ──────────────────────────────────────────────────────────── */

/**
 * Reads one block comment starting at `open`, records anything wrong with the
 * way it ends, and returns the index just past its terminator.
 */
function readBlockComment(full, open, end, findings) {
  let i = open + 2;
  while (i < end && !(full[i] === '*' && full[i + 1] === '/')) i++;

  if (i >= end) {
    findings.push({ kind: 'unterminated', index: open });
    return end;
  }

  /* The character immediately before the star of the terminator. A multi-line
     comment that ends ` *` + `/` or `**` + `/` is closing on purpose; one that
     ends `m*` + `/` was closed by a filename, a glob or a CSS family that
     happened to end in a star. */
  const before = full[i - 1];
  const multiline = full.slice(open, i).includes('\n');
  if (multiline && before !== undefined && before !== '*' && !/\s/.test(before)) {
    findings.push({ kind: 'early', index: i, open });
  }

  return i + 2;
}

/** Skips a single- or double-quoted string. Bails at a newline, which neither
 *  JavaScript nor CSS allows inside one, so a stray apostrophe cannot run away
 *  with the rest of the file. */
function readQuoted(full, i, end, quote) {
  i += 1;
  while (i < end) {
    const c = full[i];
    if (c === '\\') { i += 2; continue; }
    if (c === quote) return i + 1;
    if (c === '\n') return i;
    i += 1;
  }
  return end;
}

/**
 * Reads a regular expression literal, or returns -1 to say "that slash was
 * division after all". Character classes are tracked because `[/]` is legal
 * and does not close the pattern.
 */
function readRegex(full, i, end, prevSig, prevWord) {
  const starts = prevSig === '' || PREV_PUNCT.includes(prevSig) || PREV_WORDS.has(prevWord);
  if (!starts) return -1;

  let j = i + 1;
  let inClass = false;
  while (j < end) {
    const c = full[j];
    if (c === '\\') { j += 2; continue; }
    if (c === '\n') return -1; // a regex cannot span lines, so this was division
    if (c === '[') inClass = true;
    else if (c === ']') inClass = false;
    else if (c === '/' && !inClass) {
      j += 1;
      while (j < end && /[a-z]/i.test(full[j])) j += 1; // flags
      return j;
    }
    j += 1;
  }
  return -1;
}

/**
 * Scans `full` between `start` and `end` as code.
 *
 * @param {'js'|'css'} lang  CSS has no line comments, no template literals and
 *                           no regex literals, so saying which language it is
 *                           removes three whole sources of misreading.
 */
function scanCode(full, start, end, lang, findings) {
  let i = start;
  let prevSig = '';  // last significant character, for the regex decision
  let prevWord = '';
  /* A stack rather than a flag, because `${` inside a template literal opens a
     fresh code context that can contain another template literal. */
  const stack = [{ type: 'code', sub: false, depth: 0 }];

  while (i < end) {
    const top = stack[stack.length - 1];
    const c = full[i];
    const c2 = full[i + 1];

    if (top.type === 'tpl') {
      if (c === '\\') { i += 2; continue; }
      if (c === '`') { stack.pop(); i += 1; continue; }
      if (c === '$' && c2 === '{') { stack.push({ type: 'code', sub: true, depth: 0 }); i += 2; continue; }
      i += 1;
      continue;
    }

    if (c === '/' && c2 === '*') {
      i = readBlockComment(full, i, end, findings);
      prevSig = ''; prevWord = '';
      continue;
    }

    if (lang === 'js' && c === '/' && c2 === '/') {
      while (i < end && full[i] !== '\n') i += 1;
      continue;
    }

    /* THE ORPHAN. Checked before the regex branch on purpose: the sequence
       starts with a star, so the slash branch below never sees it. */
    if (c === '*' && c2 === '/') {
      findings.push({ kind: 'orphan', index: i });
      i += 2; prevSig = ''; prevWord = '';
      continue;
    }

    if (c === '"' || c === "'") {
      i = readQuoted(full, i, end, c);
      prevSig = c; prevWord = '';
      continue;
    }

    if (lang === 'js' && c === '`') {
      stack.push({ type: 'tpl' });
      i += 1; prevSig = '`'; prevWord = '';
      continue;
    }

    if (lang === 'js' && c === '/') {
      const after = readRegex(full, i, end, prevSig, prevWord);
      if (after !== -1) { i = after; prevSig = '/'; prevWord = ''; continue; }
      i += 1; prevSig = '/'; prevWord = '';
      continue;
    }

    if (/\s/.test(c)) { i += 1; continue; }

    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < end && /[A-Za-z0-9_$]/.test(full[j])) j += 1;
      prevWord = full.slice(i, j);
      prevSig = full[j - 1];
      i = j;
      continue;
    }

    if (c === '{') { top.depth += 1; prevSig = c; prevWord = ''; i += 1; continue; }
    if (c === '}') {
      if (top.sub && top.depth === 0) { stack.pop(); i += 1; continue; }
      top.depth -= 1; prevSig = c; prevWord = ''; i += 1;
      continue;
    }

    prevSig = c; prevWord = '';
    i += 1;
  }
}

/**
 * Scans an .astro template: markup, where the only thing that can be a comment
 * is `{` followed by a block comment, HTML comments are skipped so a
 * commented-out fragment cannot be misread, and a <style> or <script> body is
 * handed to scanCode in the right language.
 *
 * THIS WALKS RATHER THAN REGEX-SPLITTING, and the first version did not. It
 * found the <style> and <script> bodies with a global regex over the whole
 * file, which matched the words "<style> block" written INSIDE a template
 * comment in Footer.astro. The scanner then treated the second half of that
 * comment as a CSS region and reported the comment as unterminated. Eighteen
 * false positives across nine files, all from that one shortcut. A tag only
 * counts when the walker reaches it as markup.
 */
function scanTemplate(full, lower, start, end, findings) {
  let i = start;
  while (i < end) {
    const c = full[i];

    if (c === '<') {
      if (full.startsWith('!--', i + 1)) {
        const close = full.indexOf('-->', i + 4);
        i = close === -1 || close >= end ? end : close + 3;
        continue;
      }
      const tag = lower.startsWith('<style', i) ? 'style' : lower.startsWith('<script', i) ? 'script' : null;
      /* `<styled-thing>` is not `<style`, so the character after the tag name
         has to end it. */
      if (tag && /[\s/>]/.test(full[i + 1 + tag.length] ?? '')) {
        const gt = full.indexOf('>', i);
        if (gt === -1 || gt >= end) return;
        /* `<script src="..." />` has no body and no closing tag of its own;
           treating it as if it did would swallow everything up to the next. */
        if (full[gt - 1] === '/') { i = gt + 1; continue; }
        const bodyStart = gt + 1;
        const close = lower.indexOf(`</${tag}`, bodyStart);
        const bodyEnd = close === -1 || close > end ? end : close;
        scanCode(full, bodyStart, bodyEnd, tag === 'style' ? 'css' : 'js', findings);
        i = bodyEnd;
        continue;
      }
      i += 1;
      continue;
    }

    if (c === '{' && full[i + 1] === '/' && full[i + 2] === '*') {
      i = readBlockComment(full, i + 1, end, findings);
      continue;
    }
    i += 1;
  }
}

/** Splits an .astro file into its frontmatter fence and its template. */
function scanAstro(full, findings) {
  const lower = full.toLowerCase();
  let cursor = 0;

  if (full.startsWith('---')) {
    const fenceEnd = full.indexOf('\n---', 3);
    if (fenceEnd !== -1) {
      scanCode(full, 3, fenceEnd, 'js', findings);
      cursor = fenceEnd + 4;
    }
  }

  scanTemplate(full, lower, cursor, full.length, findings);
}

/* ── Walk, scan, report ───────────────────────────────────────────────────── */

const files = [];
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXT.test(e.name)) files.push(p);
  }
})(SRC);
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXT.test(e.name)) files.push(p);
  }
})(SCRIPTS);

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

/** file:line:column plus the source line, so the report names the keystroke. */
function locate(text, index) {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1;
  let lineEnd = text.indexOf('\n', index);
  if (lineEnd === -1) lineEnd = text.length;
  return {
    line: text.slice(0, index).split('\n').length,
    col: index - lineStart + 1,
    source: text.slice(lineStart, lineEnd).trim().slice(0, 120),
  };
}

const REASON = {
  orphan:
    'a comment terminator in code. Nothing opened a comment here, so a comment\n'
    + '      above this line closed earlier than its author meant it to.',
  early:
    'a multi-line comment closed by a terminator glued to the text before it.\n'
    + '      Put a space before the star, or rewrite the glob so it does not end in one.',
  unterminated:
    'a block comment that is never closed. It swallows the rest of the file.',
};

const problems = [];
for (const file of files) {
  const full = fs.readFileSync(file, 'utf8');
  const findings = [];
  if (file.endsWith('.astro')) scanAstro(full, findings);
  else if (file.endsWith('.css')) scanCode(full, 0, full.length, 'css', findings);
  else scanCode(full, 0, full.length, 'js', findings);

  for (const f of findings) problems.push({ file: rel(file), ...f, ...locate(full, f.index) });
}

console.log(`comment-terminators: ${files.length} source file(s) scanned in src/ and scripts/`);

if (problems.length) {
  console.error(`\ncomment-terminators: ${problems.length} broken comment boundar(y/ies)\n`);
  for (const p of problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    console.error(`  ${p.file}:${p.line}:${p.col}  ${p.kind.toUpperCase()}`);
    console.error(`      ${p.source}`);
    console.error(`      ${REASON[p.kind]}`);
  }
  console.error(
    '\n  This is the A-102 defect. On 2026-08-05 one of these produced 1,318\n'
    + '  TypeScript errors, an esbuild parse failure and three em-dash failures in\n'
    + '  check-facts.js that were not real, because the prose after the accidental\n'
    + '  terminator had stopped being a comment. Fix the boundary first and the\n'
    + '  other symptoms go with it.\n',
  );
  process.exit(1);
}

console.log('\n  clean: every block comment in the tree opens and closes where it says it does.');
