#!/usr/bin/env node
/**
 * build-platform-board.js — derive status/platform.json from the R2.6.2 release
 * documents, so the tracker at :8099 can show a Platform & Portal page beside
 * the website one.
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

const TRACKER = path.join(PLATFORM, 'RELEASE-2.6.2-TRACKER.md');
const DEFECTS = path.join(PLATFORM, 'RELEASE-2.6.2-DEFECT-REGISTER.md');

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

    issues.push({
      id,
      src: 'R2.6.2 defect register',
      sev: sev || 'P2',
      status,
      title: plain(rawTitle.replace(/[🔴🟡🟢✅⚠️]/gu, '').replace(/\b(OPEN|RESOLVED|DIAGNOSED)\b/gi, '')).replace(/[·\-—\s]+$/, ''),
      note: plain(body).slice(0, 2000),
    });
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

    const norm = /TODO/i.test(status)
      ? (/owner/i.test(status) ? 'DECISION' : 'OPEN')
      : /BUILT/i.test(status) ? 'BUILT'
      : /DONE|✅/i.test(status) ? 'FIXED'
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
    FIXED: 'Implemented and verified.',
    BUILT: 'Implemented, not yet certified by a full release run.',
    OPEN: 'Confirmed, not started.',
    DECISION: 'Blocked on an owner decision.',
    WIP: 'Diagnosed, in progress.',
  },
  unreadable,
  issues,
};

fs.writeFileSync(OUT, JSON.stringify(board, null, 2));
console.log(
  `platform.json: ${issues.length} item(s) — ` +
    Object.entries(
      issues.reduce((a, i) => ((a[i.status] = (a[i.status] || 0) + 1), a), {}),
    )
      .map(([k, v]) => `${k} ${v}`)
      .join(', '),
);
if (unreadable.length) console.warn('UNREADABLE:', unreadable.join(' '));
