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
  const re = /^##\s+(R262-D-\d+)\s*(?:·\s*\*{0,2}(P\d)\*{0,2})?\s*·?\s*([^\n]*)$/gm;
  let m;
  while ((m = re.exec(text))) {
    const [, id, sev, rawTitle] = m;
    /* The status marker is an emoji + word at the end of the heading. Absent →
       OPEN, because an entry nobody marked is an entry nobody closed. */
    let status = 'OPEN';
    /* Order matters: a heading may carry more than one of these words, and the
       CLOSED markers must win. "…NameError FIXED" and "✅ RESOLVED" are both
       closures; "🔴 OPEN — owner decision" is not, despite naming a decision. */
    if (/🔴|\bOPEN\b/u.test(rawTitle)) {
      status = /owner decision/i.test(rawTitle) ? 'DECISION' : 'OPEN';
    } else if (/✅|\bRESOLVED\b|\bFIXED\b/iu.test(rawTitle)) {
      status = 'FIXED';
    } else if (/\bDIAGNOSED\b/i.test(rawTitle)) {
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

    /* [R262-D-90 2026-08-08] CREDIT EVERY ID IN A COMBINED HEADING.
       The register closes related defects together:
         `## R262-D-02 / D-05 / D-08 — ✅ RESOLVED 2026-08-01`
       The heading regex captures only the FIRST id, so D-05 and D-08 never
       received their own resolution and stayed OPEN on the board for a week
       after they were fixed — while the tracker, which did know, was outvoted.
       Only a run of `/ D-NN` immediately following the id counts, so a heading
       that merely MENTIONS sibling defects in its prose is not misread. */
    const siblingRun = rawTitle.match(/^(?:\s*\/\s*D-\d+)+/);
    const ids = [id, ...(siblingRun ? [...siblingRun[0].matchAll(/D-(\d+)/g)].map((s) => `R262-D-${s[1]}`) : [])];

    const entry = {
      /* A CONTINUATION heading — `## R262-D-10 — the production evidence…` —
         carries no `· Pn ·` marker. Recording that lets the merge below keep the
         CANONICAL heading's title and severity instead of overwriting them with
         a follow-up section's, which had renamed R262-D-10 to "— the production
         evidence, and the defect underneath it" and demoted it P0 → P2. */
      sevExplicit: Boolean(sev),
      src: 'R2.6.2 defect register',
      sev: sev || 'P2',
      status,
      changed: dateMatch ? dateMatch[1] : null,
      title: plain(rawTitle.replace(/[🔴🟡🟢✅⚠️]/gu, '').replace(/\b(OPEN|RESOLVED|DIAGNOSED)\b/gi, '')).replace(/[·\-—\s]+$/, ''),
      note: plain(body).slice(0, 2000),
    };
    for (const each of ids) issues.push({ id: each, ...entry });
  }

  /* [R262-D-82 2026-08-08] RECONCILE THE SUMMARY TABLE AGAINST THE DETAIL
     SECTIONS — a register row with no `## ` heading was being dropped SILENTLY.

     The parser above keys off `## R262-D-NN` headings. The register also opens
     with a summary TABLE, and an entry can legitimately be written into that
     table and never given a detail section. When that happened the board did
     not warn, did not count it, and did not render it — it simply showed a
     smaller total that looked entirely plausible.

     Measured on 2026-08-08: R262-D-78 and R262-D-79 were table-only and had
     been invisible on the board since they were logged, while R262-D-70, D-76,
     D-77 and D-81 were referenced by ID in shipped code and never written to
     the register at all. Six FIXED defects the board could not show — which is
     exactly the complaint that "there is no progress on the board", and the
     same defect class the D-76 `changed` field was added to solve.

     This is scoped to the PROPERTY (every advertised id must be renderable),
     not to those six ids. It cannot silently pass: any future table-only row
     lands in `unreadable`, which the board renders, and prints on stderr. */
  const tableIds = new Set();
  const tableRe = /^\|\s*(R262-D-\d+)\s*\|/gm;
  let t;
  while ((t = tableRe.exec(text))) tableIds.add(t[1]);
  const detailIds = new Set(issues.map((i) => i.id));
  const tableOnly = [...tableIds].filter((id) => !detailIds.has(id));
  if (tableOnly.length) {
    unreadable.push({
      src: 'crowagent-platform/RELEASE-2.6.2-DEFECT-REGISTER.md',
      why:
        `${tableOnly.length} id(s) appear in the register summary table but have no ` +
        `"## <id>" detail section, so they cannot be rendered: ${tableOnly.join(', ')}. ` +
        `Add a detail section for each — do NOT delete the table row.`,
    });
    console.error(
      `[board] WARNING: table-only defect ids (not rendered): ${tableOnly.join(', ')}`,
    );
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

/* [R262-D-90 2026-08-08] COLLAPSE REPEATED IDS — LAST OCCURRENCE WINS.
 *
 * The defect register is APPEND-STRUCTURED: when an item is later resolved, a
 * second section is written for the same id — e.g.
 * `## R262-D-02 / D-05 / D-08 — ✅ RESOLVED 2026-08-01`, added a week after the
 * original `## R262-D-02 · P0 · … 🔴 OPEN`. The parser emitted BOTH, so the
 * board double-counted them AND rendered the stale one, because every consumer
 * here reads with `.find()`, which returns the FIRST match.
 *
 * Measured 2026-08-08: 10 ids had more than one entry, and SIX of them carried a
 * stale OPEN beside a later FIXED — D-02, D-04, D-05, D-06, D-08, D-10. Among
 * them the register's ONLY open P0 ("live checkout charges prices that do not
 * match the published price table"), which had in fact been resolved on
 * 2026-08-01 with the owner's authorisation. The board had been reporting a
 * fixed live-revenue P0 as outstanding for a week.
 *
 * Last-wins is the correct rule for an append-structured document: later text is
 * the more recent statement about the same item. It is applied by document
 * ORDER, not by status rank, so a genuine RE-OPEN (an item closed and later
 * reopened) is still honoured rather than being overridden by a closure that
 * came first.
 *
 * The collapse is never silent. Every superseded status is recorded on the
 * surviving item as `supersededBy`, and the count is logged, so a merge can be
 * seen rather than inferred from a total that quietly shrank. This is the fourth
 * defect in this reporting path (D-76, D-82, D-89, this) and every one of them
 * understated completed work. */
{
  // The DEFECT REGISTER is the authority on a defect's status; the tracker is
  // task-tracking that can lag it. So a tracker row must never override a
  // register entry for the same id — only a LATER REGISTER entry may. Without
  // this, R262-D-09 (register: 🟡 DIAGNOSED) was overridden to OPEN by a tracker
  // row, silently reversing a status the register had moved forward.
  const REGISTER = 'R2.6.2 defect register';
  const byId = new Map();
  const superseded = [];
  for (const item of issues) {
    const prior = byId.get(item.id);
    if (!prior) { byId.set(item.id, item); continue; }
    // Keep the incumbent when it is the register's word and the newcomer is not.
    const keepPrior = prior.src === REGISTER && item.src !== REGISTER;
    const winner = keepPrior ? prior : item;
    const loser = keepPrior ? item : prior;
    superseded.push(`${item.id}: ${loser.status}(${loser.src === REGISTER ? 'register' : 'tracker'}) → ${winner.status}`);
    /* SEVERITY NEVER DROPS ON A MERGE. A follow-up section is usually written as
       `## R262-D-10 — the production evidence…` with no `· Pn ·` marker, so it
       parses at the P2 default. Taking the winner's severity blindly therefore
       DEMOTED R262-D-10 from P0 to P2 — silently losing the highest-severity
       item on the board, which is the opposite of what a merge should risk.
       The most severe severity seen for an id is kept; a genuine downgrade is
       done by editing the original heading, where it is visible. */
    // Only an EXPLICIT severity may win. The `sev || 'P2'` default is not a
    // severity anyone assigned, and treating it as one let a tracker row with no
    // marker UPGRADE a register entry: R262-D-07 is written `· P3 ·` and the
    // board showed it P2, because the defaulted P2 outranked the real P3. A
    // merge must not be able to invent severity in either direction.
    const rank = (s) => Number(String(s || 'P2').slice(1));
    const sev = prior.sevExplicit && item.sevExplicit
      ? (rank(prior.sev) <= rank(item.sev) ? prior.sev : item.sev)
      : prior.sevExplicit
        ? prior.sev
        : item.sevExplicit
          ? item.sev
          : winner.sev;
    // Same reasoning for the TITLE: a continuation heading names the follow-up,
    // not the defect. Keep the title from whichever entry declared a severity.
    const titled = prior.sevExplicit && !item.sevExplicit ? prior : winner;
    byId.set(item.id, {
      ...winner,
      sev,
      title: titled.title,
      sevExplicit: prior.sevExplicit || item.sevExplicit,
      supersededBy: [...(prior.supersededBy || []), loser.status],
    });
  }
  if (superseded.length) {
    const collapsed = issues.length - byId.size;
    console.error(`[board] collapsed ${collapsed} repeated id entr${collapsed === 1 ? 'y' : 'ies'}: ${superseded.join(', ')}`);
    issues.length = 0;
    issues.push(...byId.values());
  }
}

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
