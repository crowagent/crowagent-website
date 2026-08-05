#!/usr/bin/env node
/**
 * add-issue.js — the ONE way to add an item to status/issues.json.
 *
 * ── WHY THIS EXISTS (A-122) ─────────────────────────────────────────────────
 *
 * On 2026-08-05 two terminals worked this repository at the same time and BOTH
 * allocated `A-109` and `A-110` to different issues, minutes apart. Nothing was
 * lost, but only because the writes happened to interleave between reads.
 *
 * The cause is not carelessness, it is the allocation method. Every writer was
 * choosing an id by reading the current maximum and adding one, which is a
 * read-modify-write with no lock: two readers see 108, both write 109. And the
 * board is a WHOLE-FILE rewrite, so a concurrent write does not merge, it
 * REPLACES — the loser's entries vanish silently and the item count still looks
 * plausible, which is the worst property a corruption can have.
 *
 * ── WHAT THIS FIXES, AND WHAT IT DOES NOT ───────────────────────────────────
 *
 * It fixes id collision, by keeping a monotonic `nextId` counter in the file
 * itself. The counter only ever goes up, so an id is never reused even if an
 * item is later deleted, and a reader who takes 149 has taken it whether or not
 * they have finished writing.
 *
 * It does NOT make concurrent writes safe in general. Two processes calling
 * this at the same instant can still lose one another's entries, because the
 * underlying file is still read whole and written whole. Closing that properly
 * means one file per issue under `status/issues/`, which is a bigger change
 * than the collision warranted. What this buys is that the common case — a
 * writer adding an item — no longer silently duplicates an identifier.
 *
 * SO THE RULE THAT STILL APPLIES: re-read the board immediately before writing,
 * and diff the ids you expected against the ids present.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *
 *   node status/add-issue.js --sev P2 --status OPEN \
 *     --title "Short statement of the defect" \
 *     --note "The evidence, the mechanism, and what was ruled out." \
 *     [--src where-it-came-from]
 *
 * It prints the allocated id. Run it from the repository root.
 */

const fs = require('fs');
const path = require('path');

const P = path.join(__dirname, 'issues.json');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const sev = arg('sev');
const status = arg('status');
const title = arg('title');
const note = arg('note');
const src = arg('src', 'session');

const VALID_SEV = ['P1', 'P2', 'P3'];
/* Taken from the file's own `legend`, so this cannot drift from it. */
const board = JSON.parse(fs.readFileSync(P, 'utf8'));
const VALID_STATUS = Object.keys(board.legend);

if (!sev || !status || !title || !note) {
  console.error('add-issue: --sev, --status, --title and --note are all required.');
  console.error(`  --sev     one of ${VALID_SEV.join(', ')}`);
  console.error(`  --status  one of ${VALID_STATUS.join(', ')}`);
  process.exit(2);
}
if (!VALID_SEV.includes(sev)) {
  console.error(`add-issue: --sev must be one of ${VALID_SEV.join(', ')}, got "${sev}".`);
  process.exit(2);
}
if (!VALID_STATUS.includes(status)) {
  console.error(`add-issue: --status must be one of ${VALID_STATUS.join(', ')}, got "${status}".`);
  process.exit(2);
}

/*
 * SEED THE COUNTER FROM THE EXISTING MAXIMUM, once. After this the maximum is
 * never consulted again, which is the whole point: `nextId` is authoritative
 * even when the highest-numbered item has been deleted.
 */
if (typeof board.nextId !== 'number') {
  const nums = board.issues
    .map((i) => /^A-(\d+)$/.exec(i.id))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  board.nextId = (nums.length ? Math.max(...nums) : 0) + 1;
}

const id = `A-${board.nextId}`;
board.nextId += 1;

/* Guard anyway. If this ever fires, two writers raced and the counter is not
   enough on its own — which is exactly the limit documented at the top. */
if (board.issues.some((i) => i.id === id)) {
  console.error(`add-issue: ${id} already exists. The counter and the file disagree, which means a concurrent write. STOPPING rather than overwriting.`);
  process.exit(1);
}

board.issues.push({ id, src, sev, title, status, note });
board.updated = new Date().toISOString();

fs.writeFileSync(P, JSON.stringify(board, null, 2));
console.log(id);
