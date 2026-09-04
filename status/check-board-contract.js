#!/usr/bin/env node
/**
 * check-board-contract.js — every field index.html dereferences must exist in
 * BOTH boards.
 *
 * WHY THIS EXISTS. `platform.json` never carried a `directives` key, and
 * `index.html` called `DATA.directives.map(...)` unconditionally. The throw
 * happened inside `render()`, so the page did not lose one section — it died
 * with "Could not load platform.json — Cannot read properties of undefined
 * (reading 'map')". The Platform & Portal tab was therefore unviewable from the
 * day it was added.
 *
 * The JSON was correct the whole time. It was fetched, parsed and counted
 * repeatedly, and every one of those checks passed, because fetching the data
 * proves the data and only rendering the page proves the page. This gate is the
 * cheap stand-in for rendering: it reads what the page ASKS FOR out of the page
 * itself, and asserts the data supplies it.
 *
 * Deliberately NOT a hard-coded list of expected keys. A hand-kept list of the
 * fields the page uses is a second copy of the page's requirements, and would
 * drift from it exactly as `platform.json` drifted from `issues.json` — the
 * defect this whole board exists to catch.
 *
 * Exit 0 = both boards satisfy the page. Exit 1 = a field is missing, named.
 */
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const rawPage = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');

/* [R28-CI-ESTATE-01] STRIP COMMENTS BEFORE SCANNING. A TEXT SCANNER CANNOT TELL
   CODE FROM PROSE, and this one was reading its own documentation as code.

   index.html:608 is a COMMENT that says the heading is "rewritten from
   `DATA.release` on load". The scanner matched that prose mention as a read,
   found no guard around it (there is no guard in a sentence), and since a field
   is only optional when EVERY read is guarded, one mention in a comment made
   `release` mandatory for both boards. It then reported that `issues.json`
   "would throw" and the website board renders as "Could not load".

   BOTH REAL READS ARE GUARDED and the page does not throw: index.html:653 is
   `board === 'platform' && DATA && DATA.release`, and :775 is
   `DATA.release || '?'`. The guard detection below was already correct for both
   shapes. The corpus was wrong, not the rule.

   Same defect class as the raw-button ratchet that counted its own explanatory
   comments. Comments are replaced with spaces rather than removed so every
   surviving match keeps its original index, which the before/after guard
   windows depend on. */
const page = rawPage
  .replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length))   // HTML comments
  .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length)); // JS block comments

/* Every `DATA.<field>` the page reads. `DATA` is the parsed board object, so
   each one is a field the data contract must supply. */
const referenced = [...new Set([...page.matchAll(/\bDATA\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))];

/* How the page uses each — a field it calls .map() or .length on must be an
   array, and Object.entries() implies an object. Anything else only has to be
   present. Read from the page rather than assumed, for the same reason as above. */
const arrayish = new Set(
  referenced.filter((f) =>
    new RegExp(`DATA\\.${f}\\s*(\\)?\\s*\\.(map|filter|forEach|join|length)|\\))`).test(page),
  ),
);
const objectish = new Set(
  referenced.filter((f) => new RegExp(`Object\\.(entries|keys|values)\\(DATA\\.${f}`).test(page)),
);

/* [R27-BOARD-08 2026-08-17] FIELDS THE PAGE READS BEHIND A GUARD ARE OPTIONAL,
   AND TREATING THEM AS MANDATORY MADE THIS CHECK CRY WOLF ON EVERY RUN.

   `issues.json` has no `phaseBreakdown` — correctly, since the website board has
   no phases — and this script reported it as "the page would throw". It would not.
   index.html:335 reads it as

       const pb = DATA.phaseBreakdown && typeof DATA.phaseBreakdown === 'object'
                    ? DATA.phaseBreakdown : null;

   and then branches on `pb &&`, so a missing field renders no panel and throws
   nothing. The check therefore exited 1 on a healthy board, on every single
   invocation — including inside start-tracker.cmd, which prints a scary WARNING
   about a board that "will render as Could not load" and then serves it perfectly.

   That is worse than a missing check. A gate that is always red teaches everyone
   to ignore it, so the day it reports the REAL defect it was written for — the
   `DATA.directives.map()` crash that made the Platform tab unviewable for a day —
   nobody will look. Fixing the false positive is what keeps the true positive
   audible.

   Detected from the page, not from a hand-kept list, for the same reason the rest
   of this script is: a field is OPTIONAL if every read of it is protected by a
   truthiness test, an optional-chain, a `typeof` check or a `||` default. If ANY
   read is unguarded the field stays mandatory, which is the safe direction —
   `directives` is read as `DATA.directives.map(...)` bare, so it remains required
   and this change does not weaken the case that matters. */
const guarded = new Set(
  referenced.filter((f) => {
    const reads = [...page.matchAll(new RegExp(`DATA\\.${f}\\b`, 'g'))];
    if (!reads.length) return false;
    return reads.every((m) => {
      // 40 chars either side is enough to see the guard that wraps a read.
      const before = page.slice(Math.max(0, m.index - 40), m.index);
      const after = page.slice(m.index + m[0].length, m.index + m[0].length + 12);
      /* [R28-CI-ESTATE-01] A READ INSIDE A TERNARY THE SAME FIELD GUARDS.
         index.html:653-654 is
           (board === 'platform' && DATA && DATA.release)
             ? 'Release ' + DATA.release + ' status: ...'
         The condition is guarded and detected. The read in the CONSEQUENT is
         the same field, reached only when that condition was truthy, so it is
         guarded too. The 40 character window cannot see that far, so it called
         the field mandatory on the strength of a read that can never run
         unguarded. Widened to 200 characters and looking for a test of THIS
         field followed by the `?` that opens the branch this read sits in. */
      const wide = page.slice(Math.max(0, m.index - 200), m.index);
      const guardedByOwnTernary = new RegExp(`DATA\\.${f}\\b[^?]*\\?`).test(wide);
      return (
        /(&&|\|\||\?|!|typeof)\s*$/.test(before) ||          // guarded before the read
        /^\s*(&&|\|\||\?\.|\?)/.test(after) ||                // guards immediately after
        guardedByOwnTernary ||                                // inside a branch this field guards
        new RegExp(`typeof\\s+DATA\\.${f}`).test(before + m[0]) // typeof DATA.x
      );
    });
  }),
);

const boards = ['issues.json', 'platform.json'];
let failed = false;

for (const file of boards) {
  const full = path.join(HERE, file);
  if (!fs.existsSync(full)) {
    console.error(`❌ ${file} — MISSING. The page cannot render a board that is not there.`);
    failed = true;
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (e) {
    console.error(`❌ ${file} — not parseable JSON: ${e.message}`);
    failed = true;
    continue;
  }

  const problems = [];
  const notes = [];
  for (const field of referenced) {
    const v = data[field];
    if (v === undefined || v === null) {
      // [R27-BOARD-08] Absent is fine when EVERY read of it is guarded; the page
      // renders one section fewer and throws nothing. Reported as a note so the
      // absence is still visible, never as a failure.
      if (guarded.has(field)) {
        notes.push(`${field} absent — optional, every read of it is guarded`);
        continue;
      }
      problems.push(`${field} is ${v === null ? 'null' : 'MISSING'}`);
      continue;
    }
    // `Array.isArray` first: an array also satisfies Object.entries, and the
    // page's real requirement is whichever it actually calls.
    if (arrayish.has(field) && !Array.isArray(v) && typeof v !== 'string') {
      if (!objectish.has(field)) problems.push(`${field} must be an array (page calls .map/.length on it)`);
    }
    if (objectish.has(field) && typeof v !== 'object') {
      problems.push(`${field} must be an object (page calls Object.entries on it)`);
    }
  }

  if (problems.length) {
    console.error(`❌ ${file} — the page would throw:`);
    for (const p of problems) console.error(`     · ${p}`);
    failed = true;
  } else {
    const mandatory = referenced.length - notes.length;
    console.log(
      `✅ ${file} — supplies all ${mandatory} mandatory field(s) the page reads` +
        (notes.length ? `, and ${notes.length} guarded optional one(s) are absent` : ''),
    );
  }
  // [R28-BOARD-DOCTABLE-LEAK-01] A POSITIONAL SELECTOR IS A DEFECT WAITING FOR
  // MORE CONTENT.
  //
  // The document boards hide the issue list so a prose page does not render a
  // table of severities underneath it. That was done with
  // `querySelector('table')`, which matches the FIRST table in the DOM. Since
  // `#docbody` sits ABOVE the issue table and the architecture documents contain
  // tables of their own, switching between document views matched a DOCUMENT
  // table, hid that, and left the R2.8 issue list on screen over an
  // architecture page. The owner saw it before any test did.
  //
  // Asserted here rather than in a new file because this checker already owns
  // "does the page behave", and a guard is not a work item of its own.
  // Comments are stripped first, because the explanation above names the very
  // pattern it forbids and a text scanner cannot tell code from prose.
  if (file === boards[0]) {
    const sel = "querySelector('table')";
    if (page.includes(sel)) {
      console.error(
        '❌ index.html reaches the issue table POSITIONALLY.\n' +
          `     · found ${sel} in code. #docbody precedes the issue table and\n` +
          '       injected documents contain their own tables, so this can hide the\n' +
          '       wrong one and leave the issue list visible on a document board.\n' +
          "     · use document.getElementById('issuetable') instead.",
      );
      failed = true;
    }
    if (!rawPage.includes('id="issuetable"')) {
      console.error('❌ index.html: the issue table has no id="issuetable" to target.');
      failed = true;
    }
  }

  // Printed whether or not the board failed: an absent optional field is not an
  // error, but it IS a section the reader will not see, and silence about it is
  // how a missing panel gets mistaken for an empty one.
  for (const n of notes) console.log(`     · ${n}`);
}

/* ════════════════════════════════════════════════════════════════════════════
   [R28-BOARD-DOCCSS-01] THE INJECTED DOCUMENT CONTRACT.

   Three invariants that the four architecture documents rely on, all three of
   which fail SILENTLY. Asserted here rather than in a new file, because this
   checker already owns "does the page behave" and a guard is not a work item of
   its own (RULE 0-G).

   1. NO SCRIPT ELEMENT. index.html injects a document with
      `host.innerHTML = body`, and innerHTML does NOT execute script elements it
      parses. A script written in a document is therefore dead code that looks
      alive, and nothing at runtime says so.

   2. NO COLOUR LITERAL. Every colour must resolve to a token declared on :root
      in index.html. A literal in a document is a value that cannot be changed
      once, and it is RULE 0-C.

   3. EVERY `var(--x)` MUST RESOLVE. A var() naming a custom property nobody
      declares renders with NO colour and throws nothing. It is the archetype of
      a control that reaches nothing: the rule is present, the intent is legible,
      and the pixel is wrong. This is what caught the typo class during the
      2026-08-29 rebuild.
   ════════════════════════════════════════════════════════════════════════════ */
const DOCS = [
  'architecture-tenancy.html',
  'architecture-ci-estate.html',
  'architecture-target-state.html',
  'architecture-release-and-environments.html',
];

/* Strip comments and numeric entities the SAME way for every file, index.html
   included. The first version derived the :root block from the RAW page and then
   tried to subtract it from the comment-stripped one, so the two strings never
   matched and every token declaration was reported as a literal outside :root.
   A guard that fails on the correct state is worse than no guard: it teaches the
   reader to ignore it. One transform, applied once, used everywhere. */
const strip = (t) =>
  t
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/&#\d+;/g, ' ');

/* The token vocabulary is whatever :root in index.html declares. Read from the
   page, never from a hand-kept list, for the same reason as everything above. */
const pageCode = strip(rawPage);
const rootBlock = (pageCode.match(/:root\s*\{[\s\S]*?\n\s*\}/) || [''])[0];
const declaredTokens = new Set([...rootBlock.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));

/* index.html is checked too: it is the file that declares the tokens, and it is
   also the file most likely to consume one it has since renamed. */
for (const file of ['index.html', ...DOCS]) {
  const full = path.join(HERE, file);
  if (!fs.existsSync(full)) {
    console.error(`❌ ${file} — MISSING. The board offers a view it cannot load.`);
    failed = true;
    continue;
  }
  const raw = fs.readFileSync(full, 'utf8');
  const problems = [];

  if (file !== 'index.html' && /<script[\s>]/i.test(raw)) {
    problems.push(
      'contains a <script> element. innerHTML does not execute it, so it is dead ' +
        'code that looks alive. Use CSS only, or move the behaviour into index.html.',
    );
  }

  /* Comments are stripped first, because a text scanner cannot tell code from
     prose and the explanations in these files name the very patterns they forbid.
     Numeric HTML entities look exactly like hex literals, so they go too. */
  const code = strip(raw);

  if (file !== 'index.html') {
    const hex = [...new Set([...code.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)].map((m) => m[0]))];
    const fn = [...new Set([...code.matchAll(/\b(?:rgba?|hsla?)\(/g)].map((m) => m[0]))];
    if (hex.length) problems.push(`hardcoded colour literal(s): ${hex.join(' ')}`);
    if (fn.length) problems.push(`hardcoded colour function(s): ${fn.join(' ')}`);
  } else {
    /* index.html may hold literals ONLY inside the :root token block. Anywhere
       else is a value that cannot be changed once. */
    const outside = code.replace(rootBlock, ' ');
    const hex = [...new Set([...outside.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)].map((m) => m[0]))];
    const fn = [...new Set([...outside.matchAll(/\b(?:rgba?|hsla?)\(/g)].map((m) => m[0]))];
    if (hex.length) problems.push(`colour literal(s) outside :root: ${hex.join(' ')}`);
    if (fn.length) problems.push(`colour function(s) outside :root: ${fn.join(' ')}`);
  }

  const used = [...new Set([...code.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]))];
  const unresolved = used.filter((t) => !declaredTokens.has(t));
  if (unresolved.length) {
    problems.push(
      `var() names token(s) nothing declares: ${unresolved.join(' ')}. ` +
        'This renders silently with no colour.',
    );
  }

  if (problems.length) {
    console.error(`❌ ${file}:`);
    for (const p of problems) console.error(`     · ${p}`);
    failed = true;
  } else {
    console.log(
      `✅ ${file} — no script, no colour literal, and all ${used.length} token(s) it uses resolve`,
    );
  }
}

/* The board offers four views. A view whose file is not on disk is a button that
   renders "Could not load", so the registry and the directory must agree. */
const declaredViews = [...rawPage.matchAll(/(?:doc|frame):\s*'([^']+\.html)'/g)].map((m) => m[1]);
for (const v of new Set(declaredViews)) {
  if (!fs.existsSync(path.join(HERE, v))) {
    console.error(`❌ index.html offers a view for ${v}, which is not on disk.`);
    failed = true;
  }
}
console.log(`\nviews offered: ${[...new Set(declaredViews)].join(', ')}`);
console.log(`tokens declared on :root: ${declaredTokens.size}`);

console.log(`\npage reads: ${referenced.join(', ')}`);
if (failed) {
  console.error('\nA board that does not satisfy the page renders as "Could not load".');
  process.exit(1);
}
process.exit(0);
