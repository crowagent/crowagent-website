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
const page = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');

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
      return (
        /(&&|\|\||\?|!|typeof)\s*$/.test(before) ||          // guarded before the read
        /^\s*(&&|\|\||\?\.|\?)/.test(after) ||                // guards immediately after
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
  // Printed whether or not the board failed: an absent optional field is not an
  // error, but it IS a section the reader will not see, and silence about it is
  // how a missing panel gets mistaken for an empty one.
  for (const n of notes) console.log(`     · ${n}`);
}

console.log(`\npage reads: ${referenced.join(', ')}`);
if (failed) {
  console.error('\nA board that does not satisfy the page renders as "Could not load".');
  process.exit(1);
}
process.exit(0);
