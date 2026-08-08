#!/usr/bin/env node
/**
 * build-platform-board.js — derive status/platform.json from the CURRENT
 * release's documents, so the tracker at :8099 can show a Platform & Portal
 * page beside the website one.
 *
 * The release is DISCOVERED (highest RELEASE-<version>-TRACKER.md on disk), not
 * hard-coded, so the board outlives R2.6.2. `--release=X.Y.Z` targets a past
 * one and deliberately does NOT rewrite the live board.
 *
 * Modes:
 *   (none)       rebuild the live board
 *   --snapshot   also freeze it into archive/ as a permanent release record
 *   --watch      rebuild whenever either source document changes
 *   --release=   read a specific release instead of the newest
 *
 * ── WHY THIS IS A GENERATOR AND NOT A SECOND HAND-MAINTAINED BOARD ──────────
 *
 * The website board (issues.json) is authored directly, because nothing else
 * owns those items. The platform's items are ALREADY owned, by
 * RELEASE-2.6.2-TRACKER.md and RELEASE-2.6.2-DEFECT-REGISTER.md, and those files
 * are the ones a release is certified against. A second hand-kept copy would
 * drift from them within a day — which is the single defect this repository has
 * recorded more often than any other, most recently as R262-D-23 (two files
 * restating one number with nothing able to compare them).
 *
 * So this READS those documents and writes a view. If they disagree with the
 * board, the documents win and the board is stale by exactly one run.
 *
 * ── WHAT IT EXTRACTS ────────────────────────────────────────────────────────
 *
 *   1. Defect headings:  `## R262-D-NN · Pn · title 🔴 OPEN`
 *      Status is read from the trailing marker where present (OPEN / RESOLVED /
 *      DIAGNOSED), defaulting to OPEN, because an entry with no marker is one
 *      nobody has closed.
 *
 *   2. Tracker rows:     `| ID | Task | Status | Evidence | Notes |`
 *      Only rows whose ID looks like an identifier are taken, so the header and
 *      separator rows are skipped without needing to know their position.
 *
 * Anything it cannot parse is REPORTED, never silently dropped: a board that
 * quietly loses rows is worse than one that admits it cannot read them.
 *
 * Usage:  node status/build-platform-board.js
 */

const fs = require('fs');
const path = require('path');

const PLATFORM = path.resolve(__dirname, '..', '..', 'crowagent-platform');
const OUT = path.join(__dirname, 'platform.json');

/* RELEASE DISCOVERY — the board must outlive R2.6.2.
 *
 * These two paths were hard-coded to `RELEASE-2.6.2-*`. That is fine until the
 * next release, at which point the board silently keeps reporting the OLD one:
 * it would not error, it would not go blank, it would just be confidently
 * stale — the single failure mode this board exists to prevent, in the board
 * itself.
 *
 * So the release is DISCOVERED from what is on disk. Highest version wins, by
 * numeric segment comparison rather than string sort (otherwise 2.6.10 sorts
 * below 2.6.2). An explicit `--release=X.Y.Z` overrides, for looking at a past
 * release deliberately.
 *
 * A tracker with no matching defect register is still usable — the register is
 * optional and its absence is reported rather than assumed empty. */
function discoverRelease(explicit) {
  const trackers = fs
    .readdirSync(PLATFORM)
    .map((f) => /^RELEASE-([\d.]+)-TRACKER\.md$/.exec(f))
    .filter(Boolean)
    .map((m) => ({ version: m[1], file: m[0] }));

  if (!trackers.length) throw new Error(`no RELEASE-*-TRACKER.md found in ${PLATFORM}`);

  const cmp = (a, b) => {
    const A = a.split('.').map(Number);
    const B = b.split('.').map(Number);
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const d = (A[i] || 0) - (B[i] || 0);
      if (d) return d;
    }
    return 0;
  };

  const chosen = explicit
    ? trackers.find((t) => t.version === explicit)
    : trackers.sort((a, b) => cmp(b.version, a.version))[0];

  if (!chosen) {
    throw new Error(
      `release ${explicit} not found. Available: ${trackers.map((t) => t.version).join(', ')}`,
    );
  }
  return chosen;
}

const argOf = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

const RELEASE = discoverRelease(argOf('release'));
const TRACKER = path.join(PLATFORM, RELEASE.file);
const DEFECTS = path.join(PLATFORM, `RELEASE-${RELEASE.version}-DEFECT-REGISTER.md`);

/** Collapse markdown emphasis and links to plain text for a table cell. */
const plain = (s) =>
  String(s || '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const issues = [];
const unreadable = [];

/* ── 1. DEFECTS ──────────────────────────────────────────────────────────── */
if (fs.existsSync(DEFECTS)) {
  const text = fs.readFileSync(DEFECTS, 'utf8');
  const re = /^##\s+(R262-D-\d+)\s*(?:·\s*(P\d))?\s*·?\s*([^\n]*)$/gm;
  let m;
  while ((m = re.exec(text))) {
    const [, id, sev, rawTitle] = m;
    /* The status marker is an emoji + word at the end of the heading. Absent →
       OPEN, because an entry nobody marked is an entry nobody closed. */
    let status = 'OPEN';
    /* Order matters: a heading may carry more than one of these words, and the
       CLOSED markers must win. "…NameError FIXED" and "✅ RESOLVED" are both
       closures; "🔴 OPEN — owner decision" is not, despite naming a decision. */
    if (/🔴|OPEN/u.test(rawTitle)) {
      status = /owner decision/i.test(rawTitle) ? 'DECISION' : 'OPEN';
    } else if (/✅|RESOLVED|FIXED/iu.test(rawTitle)) {
      status = 'FIXED';
    } else if (/DIAGNOSED/i.test(rawTitle)) {
      status = 'WIP';
    } else if (/owner decision/i.test(rawTitle)) {
      status = 'DECISION';
    }

    /* Body = up to the next `## ` heading, so the board can show the reasoning
       rather than only a title. */
    const start = m.index + m[0].length;
    const next = text.indexOf('\n## ', start);
    const body = text.slice(start, next === -1 ? text.length : next);

    /* [R262-D-76 2026-08-08] The date the entry last CHANGED STATE, parsed from
       the heading's own closure marker ("✅ FIXED 2026-08-08", "RESOLVED
       2026-08-05"), falling back to the first date in the body.

       WHY THIS EXISTS. Every item carried only id/src/sev/status/title/note — no
       date anywhere — so the board could not distinguish "nothing happened" from
       "25 items fixed and 30 new ones found". On 2026-08-08 it showed OPEN 173 in
       the morning and OPEN 174 in the evening, while FIXED went 53 → 78. The
       owner read the flat OPEN count and reasonably concluded there had been no
       progress. The work was real; the board had no way to show it.

       A board whose headline number cannot move while a day's work happens is
       measuring the wrong thing — the same failure this release kept finding in
       its gates, applied to its own reporting. */
    const dateMatch =
      rawTitle.match(/\b(20\d\d-\d\d-\d\d)\b/) || body.match(/\b(20\d\d-\d\d-\d\d)\b/);

    issues.push({
      id,
      src: 'R2.6.2 defect register',
      sev: sev || 'P2',
      status,
      changed: dateMatch ? dateMatch[1] : null,
      title: plain(rawTitle.replace(/[🔴🟡🟢✅⚠️]/gu, '').replace(/\b(OPEN|RESOLVED|DIAGNOSED)\b/gi, '')).replace(/[·\-—\s]+$/, ''),
      note: plain(body).slice(0, 2000),
    });
  }
}

/* ── 1b. OWNER ACTIONS ────────────────────────────────────────────────────
 *
 * The tracker's "Owner actions" table uses a DIFFERENT header
 * (`| ID | Action | Why it blocks | Rows waiting on it |`) and short ids
 * (`B-1`), so the row parser below skipped every one of them: its identifier
 * test requires 4+ characters, and `B-1` is three.
 *
 * They were therefore invisible on a board whose entire purpose is to show what
 * is outstanding — and they are the items outstanding ON THE OWNER, which is the
 * set they most need to see. Parsed explicitly here rather than by loosening the
 * identifier rule, because loosening it would start admitting header and
 * separator cells from every other table.
 *
 * Emitted as DECISION: they are not engineering work and must never sit in OPEN
 * alongside things an engineer can pick up. */
if (fs.existsSync(TRACKER)) {
  const text = fs.readFileSync(TRACKER, 'utf8');
  const start = text.indexOf('\n## Owner actions');
  if (start !== -1) {
    const next = text.indexOf('\n## ', start + 5);
    const section = text.slice(start, next === -1 ? text.length : next);
    for (const line of section.split('\n')) {
      if (!line.startsWith('|')) continue;
      const cells = line.split('|').slice(1, -1).map(plain);
      if (cells.length < 3) continue;
      const [id, action, why] = cells;
      if (!/^B-\d+$/.test(id)) continue;
      issues.push({
        id,
        src: 'Owner actions',
        sev: 'P1',
        status: 'DECISION',
        title: action,
        note: plain(`Why it blocks: ${why}. ${cells[3] ? 'Waiting on it: ' + cells[3] : ''}`).slice(0, 2000),
      });
    }
  }
}

/* ── 2. TRACKER ROWS ─────────────────────────────────────────────────────── */
if (fs.existsSync(TRACKER)) {
  const lines = fs.readFileSync(TRACKER, 'utf8').split('\n');
  let section = '';
  for (const line of lines) {
    const h = /^##\s+(WS-\d+[^\n]*)/.exec(line);
    if (h) { section = plain(h[1]); continue; }
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(plain);
    if (cells.length < 3) continue;
    const [id, task, status] = cells;
    /* An identifier, not a header or a separator. */
    if (!/^[A-Z][A-Z0-9-]{3,}$/i.test(id) || /^-+$/.test(id)) continue;

    /* READ THE VERDICT, NOT THE PROSE.
     *
     * This used to regex the WHOLE status cell, so a row's board status was
     * decided by whichever keyword happened to appear anywhere in it. Two
     * consequences, both live on 2026-08-05:
     *
     *   - `PARTIAL — built, undeployed` mapped to BUILT for the right reason
     *     BY ACCIDENT — because the word "built" sat in the qualifying prose.
     *   - `PARTIAL — cut complete, uncertified` fell through to OPEN, whose
     *     legend reads "Confirmed, NOT STARTED" — for a 929-file deletion that
     *     was very much started. The board asserted the opposite of the truth.
     *
     * The tracker's own rule is that the Status cell MUST OPEN with a term
     * from the controlled vocabulary, and `release_tally.py --check` enforces
     * it (exit 1 otherwise). So the verdict is the FIRST token, and that is
     * what gets read here. Prose after the separator is nuance, never verdict.
     *
     * PARTIAL maps to BUILT deliberately: BUILT's legend is "Implemented, not
     * yet certified by a full release run", which is precisely what PARTIAL
     * means in this tracker. An unrecognised verdict maps to OPEN, which is
     * the safe direction — it over-reports work as outstanding rather than
     * quietly claiming something is done. */
    const verdict = String(status).split(/[—–\-:(]/)[0].trim().toUpperCase();
    const norm =
        verdict.startsWith('TODO') || verdict.startsWith('NOT ')
          ? (/owner/i.test(status) ? 'DECISION' : 'OPEN')
      : verdict.startsWith('DONE') || verdict.startsWith('MET') || verdict.startsWith('✅') ? 'FIXED'
      : verdict.startsWith('PARTIAL') || verdict.startsWith('BUILT') || verdict.startsWith('IN PROGRESS') ? 'BUILT'
      : verdict.startsWith('BLOCKED') || verdict.startsWith('DEFERRED') ? 'DECISION'
      : verdict.startsWith('N/A') ? 'CLEARED'
      : 'OPEN';

    issues.push({
      id,
      src: section || 'R2.6.2 tracker',
      sev: /P0/.test(cells.join(' ')) ? 'P1' : 'P2',
      status: norm,
      title: task,
      note: plain(cells.slice(3).join(' — ')).slice(0, 2000),
    });
  }
}

if (!issues.length) unreadable.push('No items parsed — check that the R2.6.2 documents are where this expects them.');

const board = {
  updated: new Date().toISOString(),
  note:
    'DERIVED, not authored. Generated from RELEASE-2.6.2-TRACKER.md and ' +
    'RELEASE-2.6.2-DEFECT-REGISTER.md by status/build-platform-board.js. Those ' +
    'documents are what a release is certified against and they win every ' +
    'disagreement; this view is stale by at most one run. Re-run the generator ' +
    'after editing either document.',
  sources: [
    'crowagent-platform/RELEASE-2.6.2-TRACKER.md',
    'crowagent-platform/RELEASE-2.6.2-DEFECT-REGISTER.md',
  ],
  legend: {
    FIXED: 'Implemented and verified. Tracker verdict DONE or MET.',
    BUILT: 'Implemented, not yet certified by a full release run. Tracker verdict PARTIAL, BUILT or IN PROGRESS — the code landed, the suite that would prove it has not run.',
    OPEN: 'Confirmed, not started. Tracker verdict TODO, or a defect nobody marked closed.',
    DECISION: 'Blocked on an owner decision or an owner action. Tracker verdict BLOCKED or DEFERRED, or a TODO the tracker marks as the owner\'s.',
    WIP: 'Diagnosed, in progress.',
    CLEARED: 'Not applicable — the premise was false, or the item is counted against another row. Tracker verdict N/A.',
  },
  /* The page renders these under the legend. They were absent, and index.html
     called .map() on them unconditionally, so the Platform tab threw and the
     whole board showed "Could not load" — correct JSON, unviewable page.
     Carrying the release's actual standing constraints is more useful than an
     empty array, and it means the tab states the rules it is judged against. */
  directives: [
    { id: 'RULE 0', text: 'No Vercel preview deployments. Every non-main deployment must land CANCELED — CANCELED is free, BUILDING/READY/ERROR is billed.' },
    { id: 'RULE 0-B', text: 'A push is the only Actions-consuming action a push approval covers. Reruns, workflow_dispatch, a second push or a non-draft PR are each a fresh ask.' },
    { id: 'DONE', text: 'A commit hash AND a verification that ran AND a user-invocable outcome. Two of three is not done.' },
    { id: 'GATES', text: 'A gate that cannot fail is not a gate. Prove it fails before trusting that it passed, and take exit codes from UNPIPED commands.' },
    { id: 'EVIDENCE', text: 'A record of a thing is not the thing. Measure the artefact, not the comment, filename or tracker row describing it.' },
    { id: 'DERIVED', text: 'This board is DERIVED from the release tracker and defect register. Where they disagree with it, THEY WIN.' },
  ],
  unreadable,
  issues,
};

/* Writing the LIVE board is skipped when an explicit past release was asked
 * for. Found the hard way: `--release=2.5.2 --snapshot` archived 2.5.2 AND
 * replaced platform.json with its 16 rows, so the live scoreboard silently
 * became a two-release-old one. Archiving history must never mutate the
 * present — which is the whole premise of this board. */
const isExplicitRelease = Boolean(argOf('release'));
if (isExplicitRelease) {
  console.log(`(live board NOT rewritten — explicit --release=${RELEASE.version})`);
} else {
  fs.writeFileSync(OUT, JSON.stringify(board, null, 2));
}
console.log(
  `${isExplicitRelease ? `R${RELEASE.version} (not written)` : 'platform.json'}: ${issues.length} item(s) — ` +
    Object.entries(
      issues.reduce((a, i) => ((a[i.status] = (a[i.status] || 0) + 1), a), {}),
    )
      .map(([k, v]) => `${k} ${v}`)
      .join(', '),
);

/* [R262-D-76] Movement, not just position. The status counts above answer "where
   are we"; on their own they cannot answer "did anything happen today", which is
   the question actually being asked when someone opens this board. */
{
  const today = new Date().toISOString().slice(0, 10);
  const touchedToday = issues.filter((i) => i.changed === today);
  if (touchedToday.length) {
    const byStatus = touchedToday.reduce(
      (a, i) => ((a[i.status] = (a[i.status] || 0) + 1), a),
      {},
    );
    console.log(
      `  ${today}: ${touchedToday.length} item(s) changed — ` +
        Object.entries(byStatus)
          .map(([k, v]) => `${k} ${v}`)
          .join(', '),
    );
  } else {
    console.log(`  ${today}: no items changed state`);
  }
}

if (unreadable.length) console.warn('UNREADABLE:', unreadable.join(' '));

/* ── SNAPSHOT — the permanent record of a release ────────────────────────────
 *
 * `platform.json` is LIVE: it is overwritten on every run and describes only
 * whatever the release documents say right now. That is what you want while a
 * release is in flight and useless afterwards — once R2.6.3 opens, the R2.6.2
 * board is gone, and with it any way to answer "what did we actually ship, and
 * what did we know when we shipped it".
 *
 * A snapshot freezes the board under a version + date and never changes again.
 * Run `--snapshot` at each certification and at ship. The index lets the
 * scoreboard page list past releases without reading every file.
 *
 * Snapshots are DERIVED, like the board — so a snapshot disagreeing with the
 * release documents of its day means the generator changed, not that history
 * did. They are a record of the board, which is a record of the documents. */
if (process.argv.includes('--snapshot')) {
  const dir = path.join(__dirname, 'archive');
  fs.mkdirSync(dir, { recursive: true });

  // Date only, no clock — a second snapshot on the same day is a correction of
  // that day's record, not a new one, and should overwrite rather than litter.
  const day = board.updated.slice(0, 10);
  const name = `release-${RELEASE.version}-${day}.json`;
  fs.writeFileSync(path.join(dir, name), JSON.stringify(board, null, 2));

  const indexPath = path.join(dir, 'index.json');
  let index = [];
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (!Array.isArray(index)) index = [];
  } catch {
    index = []; // first snapshot, or an index that is not readable as a list
  }

  const counts = issues.reduce((a, i) => ((a[i.status] = (a[i.status] || 0) + 1), a), {});
  const entry = {
    release: RELEASE.version,
    captured: day,
    file: name,
    total: issues.length,
    counts,
  };
  index = index.filter((e) => !(e.release === entry.release && e.captured === entry.captured));
  index.push(entry);
  index.sort((a, b) => (a.release === b.release ? a.captured.localeCompare(b.captured) : a.release.localeCompare(b.release)));
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  console.log(`snapshot: archive/${name} (${issues.length} items) — index now holds ${index.length}`);
}

/* ── WATCH — so "is the board up to date?" stops being a question ────────────
 *
 * The board was refreshed whenever somebody remembered to run this script,
 * which means the honest answer to "is it current?" was always "probably".
 * Watching the two source documents makes it current by construction.
 *
 * Debounced, because an editor writes a file in several bursts and each one
 * fires a change event; regenerating mid-write reads a half-written table. */
if (process.argv.includes('--watch')) {
  let timer = null;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        // Re-exec rather than refactor the whole script into a function: the
        // build is a few milliseconds and a fresh process cannot inherit stale
        // module state, which is the failure this whole board is about.
        require('child_process').execFileSync(
          process.execPath,
          [__filename, ...process.argv.slice(2).filter((a) => a !== '--watch')],
          { stdio: 'inherit' },
        );
      } catch (e) {
        console.error('[watch] rebuild FAILED — serving the previous board:', e.message);
      }
    }, 400);
  };
  for (const f of [TRACKER, DEFECTS]) {
    if (fs.existsSync(f)) fs.watch(f, rebuild);
  }
  console.log(`[watch] tracking R${RELEASE.version} documents; board rebuilds on change.`);
}
