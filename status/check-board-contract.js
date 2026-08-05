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
  for (const field of referenced) {
    const v = data[field];
    if (v === undefined || v === null) {
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
    console.log(`✅ ${file} — supplies all ${referenced.length} fields the page reads`);
  }
}

console.log(`\npage reads: ${referenced.join(', ')}`);
if (failed) {
  console.error('\nA board that does not satisfy the page renders as "Could not load".');
  process.exit(1);
}
process.exit(0);
