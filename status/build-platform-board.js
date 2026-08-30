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

const argOf = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

/* `--sources=DIR` / `--out=FILE` — SO THE PARSER CAN BE PROVEN TO FAIL.
 *
 * A gate that cannot fail is not a gate, and neither is a parser. The only
 * honest way to show that the status logic reacts to the documents is to change
 * a document and watch the board follow — and the release record is not a thing
 * to write test data into, even briefly.
 *
 * So the build can be pointed at COPIES: copy both documents to a scratch dir,
 * append the fake line, `--sources=<scratch> --out=<scratch>/after.json`, and
 * compare. Nothing under crowagent-platform is written, and the live board is
 * untouched because `--out` redirects it. */
const PLATFORM = path.resolve(argOf('sources') || path.join(__dirname, '..', '..', 'crowagent-platform'));
const OUT = path.resolve(argOf('out') || path.join(__dirname, 'platform.json'));

/* [R27-BOARD-03] THE STATUS VOCABULARY IS NOW ONE FILE, READ BY BOTH READERS.
 *
 * It used to be three lists that disagreed - this file's row classifier, the
 * tracker header's published list (which cited the wrong function), and
 * release_tally.py's VOCAB. Measured over 212 rows, 11 of the 16 verbs the
 * tracker told authors to use were unreadable here, so a row written
 * `FIXED - <sha>` filed as OPEN. See the $comment inside the JSON.
 *
 * DELIBERATELY NOT read from PLATFORM. `--sources` repoints PLATFORM at a
 * scratch copy for control runs, and the vocabulary is CONFIG, not one of the
 * documents under test: a control run must classify by the same rules as the
 * real run, or it is not a control.
 *
 * A MISSING OR BROKEN FILE THROWS. Every other source here degrades into
 * `unreadable` on purpose, but this one must not: defaulting to a built-in list
 * would silently restore the second writer this change exists to remove, and
 * the failure would look exactly like a working board. */
const VOCAB_FILE = path.join(__dirname, '..', '..', 'crowagent-platform', 'scripts', 'status-vocabulary.json');
const STATUS_VOCAB = (() => {
  const raw = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
  const terms = Object.entries(raw.terms || {});
  if (terms.length < 10) {
    throw new Error(`${VOCAB_FILE}: only ${terms.length} terms - refusing to classify against an empty vocabulary`);
  }
  const hyphenated = terms.filter(([t]) => t.includes('-'));
  if (hyphenated.length) {
    // The verdict split below breaks on '-', so such a term could never match.
    throw new Error(`${VOCAB_FILE}: hyphenated term(s) ${hyphenated.map(([t]) => t).join(', ')} can never be read - use spaces`);
  }
  /* [R27-BOARD-04 2026-08-17] EVERY BUCKET NAME MUST ITSELF BE A WRITABLE TERM.
   *
   * CLEARED and DECISION were buckets that were NOT terms. An author writing the
   * obvious word - the very word this board prints in its own legend - got a row
   * filed OPEN by the fallback. Six buckets, four writable. That is the same
   * "a verb the board publishes and cannot read" defect the shared vocabulary was
   * built to end, hiding in the bucket names rather than in the term list.
   *
   * Asserted here rather than fixed once in the JSON, because fixing the two
   * instances leaves the NEXT bucket free to repeat it. The hyphen check above is
   * the precedent: it does not enumerate the bad terms, it makes the class
   * impossible. Throwing matches this loader's existing contract - a broken
   * vocabulary must fail loudly, since a silently wrong bucket looks exactly like
   * a working board. */
  const bucketNames = Object.keys(raw.buckets || {});
  const unwritable = bucketNames.filter((b) => !(b in (raw.terms || {})));
  if (unwritable.length) {
    throw new Error(
      `${VOCAB_FILE}: bucket name(s) ${unwritable.join(', ')} are not terms, so writing them ` +
        `in a status cell files the row as "${raw.fallback || 'OPEN'}" instead. Add each as a ` +
        `self-mapping term (e.g. "${unwritable[0]}": "${unwritable[0]}").`,
    );
  }
  // Longest first so NOT MET is never swallowed by MET.
  return { list: terms.sort((a, b) => b[0].length - a[0].length), fallback: raw.fallback || 'OPEN' };
})();

/** Bucket a tracker row's status cell. `verdict` is its FIRST token, uppercased. */
function bucketOf(verdict, ownerBlocked) {
  for (const [term, bucket] of STATUS_VOCAB.list) {
    if (verdict.startsWith(term)) {
      // A TODO the tracker marks as the owner's is a decision, not open work.
      return bucket === 'OPEN' && ownerBlocked ? 'DECISION' : bucket;
    }
  }
  return STATUS_VOCAB.fallback;
}

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

/**
 * [R262-BOARD-TITLE 2026-08-08] Strip STATUS text that has bled into a title.
 *
 * THE DEFECT. Register headings carry their verdict inline, e.g.
 *   `## R262-D-16 · P1 · An expired trial never expires … FIXED + DEPLOYED
 *      2026-08-08 (fixed in tree, not deployed)`
 * The old rule removed only OPEN|RESOLVED|DIAGNOSED, so every other verdict —
 * FIXED, DEPLOYED, CLEARED, BUILT, WIP, WILL-NOT-DO — stayed in the title. The
 * board then rendered the title beside its OWN status column, so a row showed
 * the verdict twice, and in 22 rows the two disagreed: D-16 displayed
 * "FIXED + DEPLOYED 2026-08-08 (fixed in tree, not deployed)" — a title that
 * contradicts itself inside one sentence. That is what read as "weird status".
 *
 * WHY TRAILING-ONLY. Stripping the words anywhere would corrupt legitimate
 * titles — "the gate could not read a DROP TABLE" is fine, but a defect
 * genuinely about a fixed/cleared thing would lose a real word. Verdicts are
 * always appended, so only a trailing run is removed, repeatedly, together with
 * any trailing date and any trailing parenthetical qualifying it.
 *
 * The status COLUMN is unaffected — it is parsed separately, upstream, and
 * remains the single place a reader learns the verdict.
 */
const STATUS_WORDS =
  '(?:OPEN|RESOLVED|DIAGNOSED|FIXED|DEPLOYED|CLEARED|BUILT|WIP|WITHDRAWN|SUPERSEDED|REFUTED|WILL[- ]NOT[- ]DO|NOT[- ]BUILT|PARTIAL|MET|TODO)';
function stripTrailingStatus(title) {
  let out = String(title || '');
  let previous;
  do {
    previous = out;
    out = out
      // a trailing parenthetical that only qualifies the verdict
      .replace(/\s*\([^()]*\)\s*$/i, (m) => (new RegExp(STATUS_WORDS, 'i').test(m) ? '' : m))
      // a trailing verdict word, OPTIONALLY followed by its stamp date.
      //
      // [R262-BOARD-TITLE control] A BARE trailing date is deliberately NOT
      // stripped. The first version of this did strip one, and the comparison
      // run caught it corrupting a real title: R262-D-16 reads "…8 production
      // orgs have had free Portfolio since 2026-06-15" — there the date is the
      // sentence, not a stamp. A date is only removed when it is attached to a
      // verdict, which is the only form that means "status recorded on".
      .replace(
        new RegExp(`[\\s·\\-—+,]*${STATUS_WORDS}(?:\\s*[—\\-·]?\\s*\\d{4}-\\d{2}-\\d{2})?\\s*$`, 'i'),
        '',
      )
      .replace(/[·\-—+,\s]+$/, '')
      .trim();
  } while (out !== previous && out.length > 0);
  // Never return an empty title — if a heading was ONLY a verdict, keep the
  // original rather than rendering a blank row the owner cannot identify.
  return out.length > 0 ? out : String(title || '').trim();
}

const issues = [];
const unreadable = [];

/* ── 1. DEFECTS ──────────────────────────────────────────────────────────── */
/* [R28-BOARD-RELEASE-PROVENANCE-01 2026-08-29] The defect id shape is
   DERIVED, not hardcoded to one release.

   Both the heading parser below and the table-only guard further down were
   written as the id shape of ONE release. R2.8 uses ids like
   `R28-PORTAL-TRIAL-EXT-01`, so on this release the parser matched nothing
   and the guard, whose own comment promises "it cannot silently pass",
   matched nothing either and therefore never fired. All 8 rows of
   RELEASE-2.8-DEFECT-REGISTER.md contributed ZERO to the board and nothing
   said so. A guard scoped to a PATTERN instead of to the PROPERTY it claims
   to defend is the defect it was built to catch. */
const DEFECT_ID = String.raw`[A-Z][A-Z0-9]{1,9}(?:-[A-Z0-9]{1,14}){1,6}`;

if (fs.existsSync(DEFECTS)) {
  const text = fs.readFileSync(DEFECTS, 'utf8');
  const re = new RegExp(String.raw`^##\s+\*{0,2}(${DEFECT_ID})\*{0,2}\s*(?:·\s*\*{0,2}(P\d)\*{0,2})?\s*·?\s*([^\n]*)$`, 'gm');
  let m;
  while ((m = re.exec(text))) {
    const [, id, sev, rawTitle] = m;
    /* The status marker is an emoji + word at the end of the heading. Absent →
       OPEN, because an entry nobody marked is an entry nobody closed. */
    let status = 'OPEN';
    /* Order matters: a heading may carry more than one of these words, and the
       CLOSED markers must win. "…NameError FIXED" and "✅ RESOLVED" are both
       closures; "🔴 OPEN — owner decision" is not, despite naming a decision. */
    /* [2026-08-09] 🟡 = BUILT, and it is tested FIRST because it is the only
     * EXPLICIT marker here — the rest are word matches, and a word match cannot
     * be allowed to overrule a marker somebody deliberately placed.
     *
     * WHY THIS BRANCH HAD TO EXIST. The register could express OPEN, FIXED,
     * DIAGNOSED and DECISION, but NOT "implemented and not yet shipped" — which
     * is the single most common state in this release, because platform deploys
     * are rationed to four for the whole thing. The tracker has had it all along
     * (PARTIAL -> BUILT); the register had no way to say it.
     *
     * IT FAILED LIVE, WHICH IS WHY IT IS FIXED HERE RATHER THAN NOTED. R262-D-166
     * was written "🟡 BUILT · FIXED IN CODE, NOT DEPLOYED" — deliberately not
     * closed, because GET /api/public/pricing still serves Portfolio £549 on
     * production, unauthenticated. The old chain matched the word FIXED inside
     * "FIXED IN CODE" and put a GREEN row on the owner's board against a live,
     * unfixed P1 breach of a pinned owner decision. A status vocabulary that
     * cannot express the true state will be forced to express a false one.
     *
     * 🟡 IS THE ONLY ACCEPTED FORM. A bare `\bBUILT\b` fallback was added here and
     * REMOVED WITHIN THE MINUTE, because it misfired immediately: a concurrently
     * written R262-D-85 follow-up heading reads "use the PURPOSE-BUILT tester
     * account", and `\b` treats the hyphen as a word boundary, so `\bBUILT\b`
     * matched inside PURPOSE-BUILT and flipped an OPEN P2 to BUILT. The comment
     * directly above already said BUILT was an ordinary English word; the fallback
     * was added anyway and the register falsified a status on the next rebuild.
     * An explicit marker is the whole point — do not reintroduce a word match. */
    /* [2026-08-10] EXPLICIT EMOJI MARKERS ARE RESOLVED BEFORE ANY WORD MATCH.
     *
     * The old order tested `/🔴|\bOPEN\b/` BEFORE `/✅|FIXED/`, so a heading
     * carrying an explicit ✅ still resolved to OPEN if the word "open" appeared
     * anywhere in its prose. That is not hypothetical: the register entry
     * `R262-D-185`, headed "AUDIT OF EVERY OPEN ITEM ... ✅ FIXED", was reported
     * as OPEN. The audit entry about false flags was itself falsely flagged, by
     * the very mechanism it documents — a parser matching a word in prose.
     *
     * Same family as the `\bBUILT\b` fallback that fired inside "PURPOSE-BUILT"
     * and the `/owner/i` test that fired inside "NOT AN OWNER DECISION". A title
     * is prose; only the marker is a statement of status.
     *
     * Emoji first (🟡 BUILT, 🔴 OPEN, ✅ FIXED), and only then the word forms for
     * headings written before the markers existed. */
    if (/🟡/u.test(rawTitle)) {
      /* [2026-08-10] 🟡 marks the in-between state, but there are TWO of them —
       * BUILT ("code landed, not certified") and WIP ("diagnosed, in progress").
       * The emoji alone cannot tell them apart, so an explicit WIP word beside it
       * decides.
       *
       * WITHOUT THIS, THE BOARD GAVE TWO ANSWERS TO THE SAME HEADING. A row with
       * ONE mention kept this parser's 🟡 -> BUILT; a row with TWO OR MORE went
       * through the last-mention pass, which re-reads the WORD and returned WIP.
       * So "🟡 WIP" meant BUILT or WIP depending only on how many times the id
       * had been written about. Measured on R262-D-191 (one mention -> BUILT)
       * against R262-D-187/190 (several -> WIP), with identical marker text.
       *
       * BUILT overstates a row whose work is half unimplemented, and this one is
       * customer-facing, so the wrong answer was the flattering one. */
      status = /\bWIP\b/u.test(rawTitle) ? 'WIP' : 'BUILT';
    } else if (/🔴/u.test(rawTitle)) {
      status = 'OPEN';
    } else if (/✅/u.test(rawTitle)) {
      status = 'FIXED';
    } else if (/\bOPEN\b/u.test(rawTitle)) {
      status = 'OPEN';
    } else if (/\bRESOLVED\b|\bFIXED\b/iu.test(rawTitle)) {
      status = 'FIXED';
    } else if (/\bWITHDRAWN\b/i.test(rawTitle)) {
      /* [2026-08-09] WITHDRAWN -> CLEARED. A raised defect that was later FALSIFIED
       * is neither open nor fixed: there was nothing to fix. CLEARED is the
       * board's existing "N/A" bucket and is exactly right for it.
       *
       * WHY THIS MATTERS NOW RATHER THAN COSMETICALLY. The register had no way to
       * say "withdrawn", so a falsified row fell through to OPEN — the safe default
       * for an unmarked entry, and the wrong answer for a deliberately marked one.
       * R262-D-137 says "WITHDRAWN IN FULL, four hours after it was written" and
       * still counted as an outstanding P2. The owner's phase-4 gate is ZERO
       * P0/P1/P2/P3 outstanding, so every phantom OPEN is a blocker that can never
       * be closed by doing work — because the work does not exist.
       *
       * Placed AFTER the OPEN and FIXED branches on purpose: an explicit 🔴 OPEN or
       * ✅ FIXED marker still wins, so a row that was withdrawn and later re-raised
       * reads as re-raised. And unlike the \bBUILT\b fallback that misfired on
       * "PURPOSE-BUILT" earlier today, "withdrawn" does not occur as a component of
       * ordinary compound words in these headings — but if that ever changes, the
       * fix is an explicit marker, not a wider regex. */
      status = 'CLEARED';
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
      src: `R${RELEASE.version} defect register`,
      sev: sev || 'P2',
      /* [R27-BOARD-LANE-01] The register carries UI/UX and product defects, so it
         defaults to PRODUCT; an explicit `[LANE:CI]` in a heading still wins. A
         missing lane must never read as CI, because that would quietly move a
         product defect out of the count the owner reads as release progress. */
      lane: /\[LANE:CI\]/i.test(rawTitle) ? 'CI' : 'PRODUCT',
      status,
      changed: dateMatch ? dateMatch[1] : null,
      title: stripTrailingStatus(plain(rawTitle.replace(/[🔴🟡🟢✅⚠️]/gu, ''))),
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
  const tableRe = new RegExp(String.raw`^\|\s*\*{0,2}(${DEFECT_ID})\*{0,2}\s*\|`, 'gm');
  let t;
  while ((t = tableRe.exec(text))) tableIds.add(t[1]);
  const detailIds = new Set(issues.map((i) => i.id));
  const tableOnly = [...tableIds].filter((id) => !detailIds.has(id));
  if (tableOnly.length) {
    unreadable.push({
      src: `crowagent-platform/RELEASE-${RELEASE.version}-DEFECT-REGISTER.md`,
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
/* A markdown table SEPARATOR row — `|---|---|---|`. The row directly ABOVE one
   is that table's HEADER, by definition of the format, so this is how a header
   is recognised structurally rather than by guessing at its wording. */
const isSeparatorRow = (l) => /^\|[\s:|-]+\|\s*$/.test(String(l || '')) && /-/.test(String(l || ''));

if (fs.existsSync(TRACKER)) {
  const lines = fs.readFileSync(TRACKER, 'utf8').split('\n');
  let section = '';
  /* §1b above OWNS the "Owner actions" table and deliberately files every row
     as DECISION — those are items outstanding on the owner, not engineering
     work, and they must never sit in OPEN beside things an engineer can pick
     up. Until the id test was tightened for the `File` phantom it also
     REJECTED `B-4` by accident (three characters, and the old rule demanded
     four), so this loop never saw them. The corrected rule accepts `B-4`, which
     silently re-emitted both rows here and flipped B-4 and B-5 DECISION → OPEN.
     Skipping the section keeps §1b's ownership explicit rather than resting on
     a length coincidence. */
  let inOwnerActions = false;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (/^##\s/.test(line)) inOwnerActions = /^##\s+Owner actions/i.test(line);
    if (inOwnerActions) continue;
    const h = /^##\s+(WS-\d+[^\n]*)/.exec(line);
    if (h) { section = plain(h[1]); continue; }
    if (!line.startsWith('|')) continue;

    /* [2026-08-08 staleness sweep] A TABLE HEADER IS NEVER AN ISSUE.
     *
     * `| File | Shard | Guards | Status |` at RELEASE-2.6.2-TRACKER.md:614 was
     * parsed into a board item with id "File", severity P2, status OPEN and
     * title "Shard" — a phantom the owner could neither fix nor close, because
     * there was nothing there. The old identifier test was
     * `/^[A-Z][A-Z0-9-]{3,}$/i`, and "File" satisfies it: four characters,
     * letters only, case-insensitive.
     *
     * Fixed in BOTH directions, because either alone is a guess:
     *
     *   1. STRUCTURALLY — a row whose NEXT line is the `|---|` separator is the
     *      header of that table by the definition of the format. No wordlist,
     *      no position assumption, and it holds for every table added later.
     *   2. BY ID SHAPE — every real identifier in these documents is
     *      hyphenated and carries a digit (`SC-02`, `CARRY-18`, `R262-D-06`,
     *      `BILL-TRIAL-001`, `R262-TRIAL-V1`). Prose words like File, Task,
     *      Status, Evidence and Notes are neither, so no future header cell can
     *      slip through even in a table written without a separator row. */
    if (isSeparatorRow(line)) continue;
    if (isSeparatorRow(lines[li + 1])) continue;

    const cells = line.split('|').slice(1, -1).map(plain);
    if (cells.length < 3) continue;
    const [id, task, status] = cells;
    /* An identifier, not a header or a separator: hyphenated AND carrying a
       digit. See the note above — this is the second of the two guards. */
    if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/i.test(id) || !/\d/.test(id)) continue;

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

    /* [2026-08-10] "AWAITING THE OWNER" IS NOW AN EXPLICIT MARKER, NOT A WORD MATCH.
     *
     * The old rule was `/owner/i.test(status)` — ANY mention of the word "owner"
     * in a TODO row's status flagged it as awaiting an owner decision. So a row
     * saying "NOT AN OWNER DECISION" was flagged as an owner decision. That is
     * not a hypothetical: two rows written today said exactly that, after the
     * owner asked why things were being falsely escalated to him, and the board
     * escalated them again on the strength of the word inside the denial.
     *
     * A heuristic that cannot tell an assertion from its negation should not be
     * deciding whether to interrupt a human. Same principle already applied to
     * [SEV:Pn] and to the 🟡 BUILT marker: EXPLICIT BEATS INFERRED, and a guess
     * must never overrule — or invent — a human's answer.
     *
     * MIGRATION COST WAS MEASURED AS ZERO BEFORE CHANGING IT: of 58 TODO/NOT rows,
     * exactly 2 mentioned "owner" and BOTH were denials. No row relied on the
     * affirmative inference, so nothing silently changes status here.
     *
     * To mark a row as genuinely awaiting the owner, put `[OWNER]` in its status
     * cell. Writing the word "owner" in prose no longer does anything. */
    const ownerBlocked = /\[OWNER\]/i.test(status);
    /* [R27-BOARD-03] Was a hard-coded if/else chain here - the SECOND of three
     * disagreeing vocabularies. It now derives from scripts/status-vocabulary.json,
     * which release_tally.py also reads, so the tracker has one rule and not
     * three. The chain accepted ten prefixes; the shared file accepts thirty and
     * documents why each maps where it does. */
    const norm = bucketOf(verdict, ownerBlocked);

    /* [2026-08-09] THE TRACKER CAN NOW STATE A SEVERITY. It could not before,
     * and that gap is what kept three corrections stranded in
     * platform-overrides.json for two days.
     *
     * The old rule was the line below this comment on its own:
     *   sev: /P0/.test(cells.join(' ')) ? 'P1' : 'P2'
     * i.e. severity was INFERRED from the literal string "P0" appearing anywhere
     * in the row. There was no way to say "this row is P1" — so three verified
     * re-assessments (R262-I-04 P2→P1, R262-I-08 P2→P1, R262-WEB-01 P1→P2) could
     * only be expressed by writing "P0" into a row where it is FALSE, or by
     * deleting a true sentence that happens to contain it. Both game the parser
     * instead of recording a fact, so the previous session correctly refused to
     * do either and wrote in the overrides file: "THE DURABLE FIX IS A SEVERITY
     * COLUMN IN THE TRACKER, not three more rows here." This is that fix.
     *
     * WHY A MARKER AND NOT A COLUMN. A real column means editing every row in
     * every table in a 900-line document to keep the cell counts aligned, and a
     * miscounted row silently changes which cell is read as `status`. The marker
     * costs one edit per row that actually needs one, and rows that do not carry
     * it behave exactly as before.
     *
     * WHY `[SEV:Pn]` AND NOT THE REGISTER'S `· Pn ·`. The register puts severity
     * in a HEADING, where the middot delimiters are structure. In a table cell
     * that same shape is ordinary prose punctuation and would eventually match a
     * sentence that merely mentions a severity. `[SEV:P1]` cannot occur by
     * accident in English.
     *
     * EXPLICIT ALWAYS BEATS INFERRED — the same rule the defect-register merge
     * already enforces at line ~487, and for the same reason: a heuristic must
     * never be able to overrule a human who has stated the answer. Note the
     * asymmetry that keeps this honest: an explicit marker is authoritative in
     * BOTH directions (it can downgrade as well as upgrade), whereas the /P0/
     * inference can only ever raise. */
    const sevMatch = /\[SEV:(P[0-3])\]/i.exec(cells.join(' '));
    const sevExplicit = Boolean(sevMatch);
    const sevInferred = /P0/.test(cells.join(' ')) ? 'P1' : 'P2';

    /* [R27-BOARD-LANE-01, owner instruction 2026-08-17] SEGREGATE THE CI LANE.
     *
     * The owner asked for CI/gate/test items under their own heading, because a
     * board that mixes "a gate baseline is stale" with "a buyer is shown the
     * wrong statutory threshold" reports gate maintenance as release progress.
     *
     * The lane is read from an EXPLICIT `[LANE:CI]` marker and is NEVER inferred
     * from prose — for exactly the reason recorded above for `[SEV:Pn]`. A
     * keyword heuristic was tried first and misfiled in BOTH directions: it put
     * `R27-PRICE-MIRROR-02` in CI because its title contains "guard" when it is
     * a production billing defect, and left `R27-TOOL-01` in PRODUCT when its
     * deliverable is a codemod. Prose cannot answer "what is this row FOR".
     *
     * The test is the DELIVERABLE, not the instrument: PERF-01 stays PRODUCT
     * because Lighthouse merely measured a real Core Web Vitals miss, and SEC-08
     * / SEC-10 stay PRODUCT because they are real auth and RLS defects that a
     * guard happened to find. */
    const lane = /\[LANE:CI\]/i.test(cells.join(' ')) ? 'CI' : 'PRODUCT';

    /* [R27-BOARD-MOVED-01 2026-08-18] THE "WHAT MOVED TODAY" LINE WAS BLIND TO THE
     * TRACKER, WHICH IS WHERE ESSENTIALLY ALL THE WORK HAPPENS.
     *
     * `changed` was set in exactly two places: a defect-register heading's own
     * date, and the last-mention-wins reconciler when it MOVES an item. A tracker
     * row being closed set it NOWHERE, so the board reported "no items changed
     * state" on a day more than twenty rows were closed in this very file.
     *
     * That line is not decoration. It exists because the owner read a flat OPEN
     * count and reasonably concluded nothing had moved (R262-D-76) — so a
     * movement indicator that cannot see the tracker recreates the exact defect
     * it was added to solve, and does it while looking healthy.
     *
     * The date is read from the STATUS cell only, never the evidence prose: the
     * evidence routinely cites measurement dates, commit dates and the dates of
     * PRIOR findings, so scanning the whole row would date a closure by whichever
     * historical date happened to appear last. The status cell is where a verdict
     * carries its own date ("FIXED 2026-08-18 - ..."), which is the one date that
     * means "this row moved".
     *
     * [R27-BOARD-MOVED-02 2026-08-24] IT READ THE WRONG COLUMN, SO THE FIX ABOVE
     * NEVER WORKED, AND THE DEFECT IT DESCRIBES CAME BACK.
     *
     * `cells` is `line.split('|').slice(1, -1)`, which DROPS the empty strings
     * either side of a markdown row. So the columns are id=0, title=1, STATUS=2,
     * notes=3, and this line read `cells[3]`. Two failures at once, in opposite
     * directions:
     *
     *   a THREE column row (id, title, status), which is most of the tracker,
     *     read `undefined` and got `changed: null`. Measured on 2026-08-24: 412
     *     of 761 items, 54%, carried no change date at all.
     *   a FOUR column row read the NOTES cell, which is precisely the "evidence
     *     prose" the paragraph above forbids, so those dates were being taken
     *     from whichever historical date the evidence happened to mention.
     *
     * The destructuring three lines below already names it: `const [id, task,
     * status] = cells`. The reader and the writer of the same array disagreed
     * about its shape, and the comment asserting the correct RULE sat directly
     * on top of the code breaking it. Proved by measurement, not by reading:
     * before this change the board printed "no items changed state" on a day
     * eight rows were closed in that very file. */
    const statusDate = /\b(20\d\d-\d\d-\d\d)\b/.exec(status || '');

    issues.push({
      id,
      src: section || `R${RELEASE.version} tracker`,
      sev: sevExplicit ? sevMatch[1].toUpperCase() : sevInferred,
      sevExplicit,
      lane,
      changed: statusDate ? statusDate[1] : null,
      status: norm,
      title: task,
      note: plain(cells.slice(3).join(' — ')).slice(0, 2000),
    });
  }
}

if (!issues.length) unreadable.push(`No items parsed. Check that the R${RELEASE.version} documents are where this expects them.`);

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
  const REGISTER = `R${RELEASE.version} defect register`;
  const byId = new Map();
  const superseded = [];
  /* Same-document duplicates, and register-versus-tracker disagreements. */
  const collisions = [];
  const conflicts = [];
  for (const item of issues) {
    const prior = byId.get(item.id);
    if (!prior) { byId.set(item.id, item); continue; }
    // Keep the incumbent when it is the register's word and the newcomer is not.
    const keepPrior = prior.src === REGISTER && item.src !== REGISTER;
    const winner = keepPrior ? prior : item;
    const loser = keepPrior ? item : prior;
    /* [R28-BOARD-DUP-FALSE-POSITIVE-01 2026-08-29] Classify the merge instead of
       reporting every one of them as a possible id collision.

       An id appearing ONCE in the register and ONCE in the tracker is the
       DESIGNED shape: the register carries the root-cause analysis, the tracker
       carries the verdict, and this merge joins them. Reporting that as
       "duplicate row ids" made the board show 8 unreadable warnings the moment
       the R2.8 register became parseable, which trains a reader to ignore the
       one panel whose whole job is to say something was dropped.

       Two things ARE worth reporting and are kept apart below:
        - a COLLISION, two entries from the SAME document under one id, which is
          how two agents filing unrelated findings actually looks, and
        - a CONFLICT, the register and the tracker disagreeing about status,
          where the merge silently discards one side's verdict. */
    const line = `${item.id}: ${loser.status}(${loser.src === REGISTER ? 'register' : 'tracker'}) → ${winner.status}`;
    superseded.push(line);
    if (loser.src === winner.src) collisions.push(line);
    else if (loser.status !== winner.status) conflicts.push(line);
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
    /* [R27-BOARD-06 2026-08-17] ALSO SURFACE THE COLLAPSE ON THE PAGE, not only on stderr.
     *
     * This merge is CORRECT and its stderr line already works - proven by control:
     * with a duplicate present it printed "collapsed 1 repeated id entry:
     * R27-BOARD-05: FIXED(tracker) → FIXED", and with none it printed nothing.
     * Nothing here is being fixed because it was broken.
     *
     * What happened is narrower and worth closing anyway. Two agents in one
     * checkout picked the same next-free id within a minute (grep-then-write, no
     * lock) and filed two UNRELATED findings as R27-BOARD-05. The merge did the
     * only sane thing and kept one. But the notice went to STDERR ONLY, so a
     * reader of the BOARD - which is the status surface people actually look at -
     * had no way to see that two findings had become one. It was caught because
     * the item total was 319 where 320 was expected.
     *
     * `unreadable` renders on the page, so the collapse is now visible where the
     * consequence is. Deliberately NOT a throw: the blast radius is one row, and
     * killing the owner's only status surface would be the worse failure. */
    if (collisions.length) {
      unreadable.push({
        src: 'duplicate row ids within a single source document',
        why:
          `${collisions.length} id(s) appear more than once in the SAME document and were ` +
          `collapsed by last-mention-wins. If two UNRELATED findings were filed under one ` +
          `id, only one of them is on this board. Renumber one of each pair: ` +
          `${collisions.join(', ')}`,
      });
    }
    if (conflicts.length) {
      unreadable.push({
        src: 'the register and the tracker disagree about status',
        why:
          `${conflicts.length} id(s) carry a DIFFERENT status in the defect register than in ` +
          `the tracker. The merge kept one and discarded the other, so the board is showing ` +
          `one document's verdict and not the other's. Reconcile them at source: ` +
          `${conflicts.join(', ')}`,
      });
    }
    issues.length = 0;
    issues.push(...byId.values());
  }
}

/* ── 3. LAST MENTION WINS ────────────────────────────────────────────────────
 *
 * [2026-08-08 staleness sweep] THE ROOT CAUSE OF 47 MIS-STATED ITEMS.
 *
 * Everything above reads an item's status from the `##` heading that DECLARES
 * it, or from its tracker row. Both documents are APPEND-STRUCTURED: when an
 * item is worked, the closure is written as a LATER section further down —
 * usually a `###` addendum, sometimes a whole new `##` — while the original
 * heading is left exactly as it was, still carrying 🔴 OPEN.
 *
 * So an item could be recorded as fixed three times, with commit hashes, and
 * still display as OPEN. `R262-D-09` was the clearest case: `## R262-D-09 …
 * 🟡 DIAGNOSED` at the top, `### R262-D-09 — ✅ RESOLVED. Measured: 224.9 kB →
 * 143.8 kB, and the budget gate is GREEN` six hundred lines below, and the
 * board showing WIP. The collapse added under D-90 fixed exactly one shape of
 * this — a repeated `## ` heading — and could not see a `###` at all.
 *
 * THE RULE. For each id, every SUBJECT mention across both documents is
 * collected in document order (tracker, then register — the register is the
 * authority and is the one that gets appended to), and the LAST one that
 * states a status wins. An id with fewer than two such mentions keeps whatever
 * the existing parsers decided, so nothing that was previously right can move.
 *
 * TWO GUARDS, because the naive version is actively dangerous. Scanning whole
 * lines for status words was tried first and produced 15 flips of which 12 were
 * WRONG — `| SC-07 | … | TODO | Bundle-budget run (R262-P-04) |` reopened
 * R262-P-04 because a different row's evidence cell named it, and
 * `**Net effect on CG-09:** … cannot be marked MET` closed CG-09 by quoting the
 * criterion it was failing. So:
 *
 *   SUBJECT — the id must OPEN the line (after a heading marker, a bullet, or
 *   as a table row's first cell, and through ` and ** wrappers). A line that
 *   merely mentions an id is discussing it, not ruling on it.
 *
 *   MARKER — the verdict must be UPPERCASE and carried by a marker: an emoji
 *   (🔴 ✅ 🟡 ⛔), bold (`**DONE**`), or the end of the line. Prose is not a
 *   verdict. Without this, `### R262-D-15 — closed 2026-08-08, and why it read
 *   OPEN for six days` reopens a defect whose own heading says it was closed.
 *
 * With both guards the pass makes 3 changes on the current documents, and each
 * is a correction in the direction the documents already state. It moves items
 * BOTH ways — R262-D-35 goes FIXED → BUILT on `🟡 GATE BUILT, NOT WIRED` —
 * because a rule that can only close things is a rule that cannot fail.
 *
 * PROVEN BY CONTROL, not by inspection: `--sources=DIR` runs the whole build
 * against copies of the two documents, so a fake mention can be appended, the
 * flip observed, and the fake removed without ever writing to the release
 * record. See the session report for the before/after counts. */
const VERDICT_VOCAB = [
  [/\bREOPENED\b/, 'OPEN'], [/\bOPEN\b/, 'OPEN'], [/\bTODO\b/, 'OPEN'], [/\bNOT STARTED\b/, 'OPEN'],
  [/\bRESOLVED\b/, 'FIXED'], [/\bFIXED\b/, 'FIXED'], [/\bDONE\b/, 'FIXED'], [/\bMET\b/, 'FIXED'], [/\bCLOSED\b/, 'FIXED'],
  [/\bDIAGNOSED\b/, 'WIP'],
  /* [2026-08-10] WIP ITSELF WAS MISSING FROM THIS VOCABULARY while being one of
   * the board's own six statuses, with its own legend entry ("Diagnosed, in
   * progress"). Only DIAGNOSED could produce it. So a heading marked
   * "🟡 WIP 2026-08-10" yielded NO verdict, the last-mention pass fell back to
   * an older "🔴 OPEN" heading, and two rows carrying five commits of finished
   * migration work reported as "Confirmed, not started". The owner read that off
   * the board and asked why — the board was wrong, not the reading.
   *
   * This is precisely the VOCABULARY failure the header of this file warns
   * about: when a status cannot be expressed, it renders as the nearest wrong
   * one. Placed BEFORE PARTIAL/BUILT so an explicit WIP is not swallowed by a
   * looser word appearing later in the same heading. */
  [/\bWIP\b/, 'WIP'],
  [/\bPARTIAL\b/, 'BUILT'], [/\bBUILT\b/, 'BUILT'], [/\bIN PROGRESS\b/, 'BUILT'],
  [/\bBLOCKED\b/, 'DECISION'], [/\bDEFERRED\b/, 'DECISION'],
  [/\bN\/A\b/, 'CLEARED'], [/\bSUPERSEDED\b/, 'CLEARED'], [/\bWILL[- ]NOT[- ]DO\b/, 'CLEARED'],
  [/\bWONTFIX\b/, 'CLEARED'], [/\bWITHDRAWN\b/, 'CLEARED'],
];

/** Verdict tokens in a line, in position order — emoji-marked, bolded, or final. */
function verdictTokens(line) {
  const out = [];
  let m;
  const emojiRe = /[\u{1F534}\u{1F7E1}\u{1F7E2}✅⛔❌]\s*\*{0,2}([A-Za-z/ -]{2,14})\*{0,2}/gu;
  while ((m = emojiRe.exec(line))) out.push({ idx: m.index, word: m[1] });
  const boldRe = /\*\*([A-Za-z/ -]{2,14})\*\*/g;
  while ((m = boldRe.exec(line))) out.push({ idx: m.index, word: m[1] });
  const tail = /([A-Za-z/-]{3,14})\s*(?:\d{4}-\d\d-\d\d)?\s*$/.exec(line);
  if (tail) out.push({ idx: tail.index, word: tail[1] });
  if (/✅/u.test(line)) out.push({ idx: line.indexOf('✅'), word: 'FIXED' });
  return out.sort((a, b) => a.idx - b.idx);
}

function verdictOfLine(line) {
  for (const { word } of verdictTokens(line)) {
    /* UPPERCASE ONLY. `four still open` at the end of a heading is prose;
       `🔴 OPEN` is a verdict. Nothing else separates them. */
    if (word !== word.toUpperCase()) continue;
    for (const [re, st] of VERDICT_VOCAB) {
      if (!re.test(word)) continue;
      if (st === 'OPEN' && /owner decision/i.test(line)) return 'DECISION';
      return st;
    }
  }
  return null;
}

/** The id(s) this line is ABOUT, or [] if it merely mentions one. */
function subjectIds(line) {
  let s = line.trimStart().startsWith('|')
    ? (line.split('|')[1] || '')
    : line.replace(/^\s*(?:#{1,6}\s+|[-*>]\s+)?/, '');
  s = s.replace(/^[\s`*_]+/, '');
  const m = /^([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)/.exec(s);
  if (!m || !/\d/.test(m[1])) return [];
  const ids = [m[1]];
  /* A combined closure heading — `## R262-D-02 / D-05 / D-08 — ✅ RESOLVED` —
     rules on all three. Only a run of `/ X-NN` IMMEDIATELY after the first id
     counts, so a heading that merely names siblings in its prose is not
     misread. Same rule as the D-90 sibling logic above. */
  const sib = /^(?:\s*[`*]*\/\s*[`*]*[A-Z]+-\d+[`*]*)+/.exec(s.slice(m[1].length));
  if (sib) {
    for (const sm of sib[0].matchAll(/([A-Z]+)-(\d+)/g)) {
      ids.push(m[1].replace(/[A-Z]+-\d+$/, `${sm[1]}-${sm[2]}`));
    }
  }
  return ids;
}

{
  const mentions = new Map();
  for (const file of [TRACKER, DEFECTS]) {
    if (!fs.existsSync(file)) continue;
    const label = path.basename(file);
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const st = verdictOfLine(line);
        if (!st) return;
        for (const id of subjectIds(line)) {
          if (!mentions.has(id)) mentions.set(id, []);
          mentions.get(id).push({ st, where: `${label}:${i + 1}`, line });
        }
      });
  }

  const moved = [];
  for (const item of issues) {
    const ms = mentions.get(item.id);
    /* Mentioned once (or not at all) → the existing parsers keep the last word.
       This is what makes the pass strictly additive. */
    if (!ms || ms.length < 2) continue;
    const last = ms[ms.length - 1];
    if (last.st === item.status) continue;
    moved.push(`${item.id}: ${item.status} → ${last.st} (${last.where})`);
    item.note = `[status read from the LAST mention, ${last.where}] ${item.note || ''}`.slice(0, 2000);
    item.status = last.st;
    item.resolvedBy = `last-mention · ${last.where}`;
    const d = last.line.match(/\b(20\d\d-\d\d-\d\d)\b/);
    if (d) item.changed = d[1];
  }
  if (moved.length) console.error(`[board] last-mention-wins moved ${moved.length}: ${moved.join(', ')}`);
  else console.error('[board] last-mention-wins moved 0 items');
}

/* ── 4. VERIFIED CORRECTIONS ─────────────────────────────────────────────────
 *
 * [2026-08-08 staleness sweep] `platform-overrides.json` — corrections measured
 * against the ARTEFACT (a file:line, a live query, a Railway variable) where
 * the release documents have not caught up.
 *
 * WHY THIS EXISTS AT ALL, given the board's founding rule is that the documents
 * win. Because the alternative was worse: a sweep verified 47 of 175 open items
 * as mis-stated, and the only way to correct them in the documents is to edit
 * the release record, which this session is not permitted to do. Leaving them
 * wrong on the board — the owner's single source of truth, refreshed constantly
 * — is a bigger lie than carrying a dated, evidenced correction beside them.
 *
 * IT IS NEVER SILENT. Every override carries `evidence` (rendered into the note
 * a reader sees), sets `override: true`, and — where it CONTRADICTS what the
 * documents currently say — is listed in `unreadable`, which the page renders,
 * and printed on stderr. That list is the write-back queue: it shrinks only
 * when someone edits the register, and it will nag until they do.
 *
 * Overrides win over the parsed status ON PURPOSE, because they are the newer
 * measurement. Ordinary staleness in the other direction is still caught: the
 * conflict list names every id whose documents disagree. */
{
  const file = path.join(__dirname, 'platform-overrides.json');
  if (fs.existsSync(file)) {
    const ov = JSON.parse(fs.readFileSync(file, 'utf8'));
    const byId = new Map(issues.map((i) => [i.id, i]));
    const missing = [];
    const conflicts = [];

    for (const rm of ov.remove || []) {
      const at = issues.findIndex((i) => i.id === rm.id);
      /* Already absent is SUCCESS, not a stale override: the point of the `File`
         removal was to fix the PARSER, and once that is done the phantom never
         reaches this layer. The entry stays so the deletion remains a recorded
         decision, and it must not nag about doing nothing. */
      if (at === -1) { console.error(`[board] remove ${rm.id}: already absent (the parser no longer produces it)`); continue; }
      issues.splice(at, 1);
      byId.delete(rm.id);
      console.error(`[board] removed ${rm.id} — ${rm.why}`);
    }

    for (const am of ov.amend || []) {
      const item = byId.get(am.id);
      if (!item) { missing.push(`amend ${am.id}`); continue; }
      const changes = [];
      if (am.status && am.status !== item.status) {
        changes.push(`status ${item.status} → ${am.status}`);
        item.status = am.status;
      }
      if (am.sev && am.sev !== item.sev) {
        changes.push(`severity ${item.sev} → ${am.sev}`);
      }
      if (!changes.length) changes.push('text corrected, status unchanged');
      conflicts.push(`${am.id} (${changes.join(', ')})`);
      if (am.sev) item.sev = am.sev;
      if (am.title) item.title = am.title;
      item.override = true;
      item.changed = am.changed || ov.dated || item.changed;
      item.note = plain(`${am.evidence} — [prior board text] ${item.note || ''}`).slice(0, 2000);
    }

    for (const add of ov.add || []) {
      if (byId.has(add.id)) { missing.push(`add ${add.id} — already present, amend it instead`); continue; }
      const entry = {
        id: add.id,
        src: add.src || `${ov.dated} staleness sweep — NOT YET IN THE RELEASE DOCUMENTS`,
        sev: add.sev || 'P2',
        sevExplicit: true,
        status: add.status || 'OPEN',
        changed: add.changed || ov.dated || null,
        title: add.title,
        note: plain(add.note).slice(0, 2000),
        override: true,
      };
      issues.push(entry);
      byId.set(add.id, entry);
      conflicts.push(`${add.id} is on the board but in NEITHER release document — write it into the register`);
    }

    if (missing.length) {
      unreadable.push({
        src: 'status/platform-overrides.json',
        why:
          `${missing.length} override(s) name an id the documents no longer produce, so they did ` +
          `nothing: ${missing.join('; ')}. Delete the override or fix the id.`,
      });
      console.error(`[board] WARNING: overrides that matched nothing: ${missing.join('; ')}`);
    }
    if (conflicts.length) {
      unreadable.push({
        src: 'status/platform-overrides.json',
        why:
          `WRITE-BACK QUEUE — ${conflicts.length} board item(s) are corrected here and NOT yet in ` +
          `RELEASE-${RELEASE.version}-TRACKER.md or RELEASE-${RELEASE.version}-DEFECT-REGISTER.md. ` +
          `Each carries its evidence in its own note. The release is certified against those ` +
          `documents, not against this board, so until they are edited the certification still ` +
          `reads the old state: ${conflicts.join('; ')}.`,
      });
      console.error(`[board] ${conflicts.length} override(s) contradict the release documents (write-back queue)`);
    }
  }
}

/* ── 5. DEPLOY BUDGET AND PHASES ─────────────────────────────────────────────
 *
 * [2026-08-09, owner] The release's deploy rules lived only in conversation, and
 * were broken three times because of it. Nothing on this board could answer the
 * two questions that decide whether a merge is allowed to ship:
 *
 *     which phase are we in, and how many deploys are left?
 *
 * The board showed 364 items and not one number about deployment. So the rules
 * were followed by memory, and memory produced a docs-only commit consuming a
 * production deploy.
 *
 * THE OWNER'S RULES, as issued 2026-08-09:
 *   1. crowagent-platform-web + crowagent-portal: FOUR production deploys for the
 *      whole release, ONE at each phase boundary. Nothing mid-phase, for any
 *      reason.
 *   2. crowagent-website is SEPARATE — it does not count, and ships as and when
 *      ready.
 *   3. Railway, staging AND production: deploy whenever needed. No approval.
 *   4. Supabase, staging AND production: apply whenever needed. No approval.
 *   5. There is NO Phase 5. Phase 2 is closed; everything left is Phase 3 or 4.
 *   6. Never report deploy or phase state from a repository document or git log.
 *      Read the LIVE surface.
 *
 * ── WHY THIS IS DERIVED AND CARRIES NO FIGURES OF ITS OWN ───────────────────
 *
 * Every number below is read from `crowagent-platform/scripts/deploy-phase-
 * boundaries.json` (the declaration the gate `scripts/verify-deploy-budget.mjs`
 * enforces) and from the generated `PHASE-ASSIGNMENT-*.md`. Hard-coding "2 spent,
 * 2 remaining" here would create a third copy of a fact two files already state —
 * the defect this board exists to catch, and the one it has recorded most often.
 *
 * ── AND WHAT IT IS NOT ──────────────────────────────────────────────────────
 *
 * Rule 6 applies to this panel too, so it says so on its face: this is a view of
 * a repository declaration, NOT a live read of Vercel. It can only tell you what
 * has been DECLARED. Before you rely on it, run the gate against a real dump:
 *
 *     node scripts/verify-deploy-budget.mjs --deployments=<file.json>
 *
 * A missing or unparseable source is REPORTED into `unreadable`, never defaulted
 * to a comfortable zero: "no data, so nothing is wrong" is the silent green this
 * release kept finding in its gates.
 */
/* [R28-BOARD-DEPLOY-BUDGET-RELEASE-01 2026-08-29] The deploy budget is PER
   RELEASE and is NOT inherited. RULE 0-R says so in as many words: R2.8 starts
   at zero spent.

   This read one un-suffixed `deploy-phase-boundaries.json` whose contents are
   R2.6.2's, so on R2.8 the board reported "5 spent, 0 remaining" and named R2.7
   phases. That is not a cosmetic staleness. It tells the owner the release has
   no deploys left when it has spent none, which is the kind of wrong number a
   release plan gets built on.

   Resolution order: the release-specific file wins, the legacy file is a
   fallback, and a fallback is NEVER shown as though it belonged to this
   release. */
function resolveBoundariesFile() {
  const scoped = path.join(PLATFORM, 'scripts', `deploy-phase-boundaries-${RELEASE.version}.json`);
  if (fs.existsSync(scoped)) return { file: scoped, scoped: true };
  return { file: path.join(PLATFORM, 'scripts', 'deploy-phase-boundaries.json'), scoped: false };
}

function deployState() {
  const resolved = resolveBoundariesFile();
  const boundariesFile = resolved.file;
  const base = {
    scope: ['crowagent-platform-web', 'crowagent-portal'],
    notCounted: [
      'crowagent-website (marketing) — SEPARATE, ships as and when ready',
      'Railway — staging AND production, unrestricted, never waits',
      'Supabase — staging AND production, unrestricted, never waits',
    ],
    source: `crowagent-platform/scripts/deploy-phase-boundaries-${RELEASE.version}.json + docs/release-${RELEASE.version}/PHASE-ASSIGNMENT-*.md`,
    authority:
      'DECLARED state, not a live read. Vercel is the authority on what production is running — ' +
      'never report deploy or phase state from a repository document or git log (owner rule 6). ' +
      'Check with: node scripts/verify-deploy-budget.mjs --deployments=<file.json>',
  };

  let decl;
  try {
    decl = JSON.parse(fs.readFileSync(boundariesFile, 'utf8'));
  } catch (err) {
    unreadable.push({
      src: 'crowagent-platform/scripts/deploy-phase-boundaries.json',
      why:
        `The deploy budget could not be read (${err.message}), so this board CANNOT say how many ` +
        `production deploys are left. It is not zero and it is not fine — it is unknown. The owner's ` +
        `rule is FOUR production deploys for crowagent-platform-web and crowagent-portal for the whole ` +
        `release, one at each phase boundary.`,
    });
    console.error(`[board] WARNING: deploy budget unreadable — ${err.message}`);
    return { ...base, unavailable: `could not read ${boundariesFile}: ${err.message}` };
  }

  /* The file carries no release of its own, so an unscoped one is assumed to
     belong to an EARLIER release. Say so rather than showing its spend as this
     release's. A budget that resets is worse than useless when it is displayed
     as already exhausted. */
  const declaredRelease = typeof decl.release === 'string' ? decl.release : null;
  if (!resolved.scoped && declaredRelease !== RELEASE.version) {
    unreadable.push({
      src: `crowagent-platform/scripts/deploy-phase-boundaries-${RELEASE.version}.json`,
      why:
        `No deploy budget has been declared for R${RELEASE.version}, so the panel below is the ` +
        `PREVIOUS release's and its spend does NOT apply here. RULE 0-R: the budget resets per ` +
        `release and is not inherited, so R${RELEASE.version} starts at zero spent. Declare this ` +
        `release's boundaries in that file. Until then treat the numbers below as history.`,
    });
    console.error(`[board] WARNING: no deploy budget for R${RELEASE.version}; showing the previous release's, labelled`);
    base.appliesToRelease = declaredRelease || 'an earlier release';
    base.staleBudget = true;
  } else {
    base.appliesToRelease = RELEASE.version;
    base.staleBudget = false;
  }

  /* Item counts per phase, from the GENERATED phase assignment. Newest by
     filename, so a regenerated assignment is picked up without editing this. */
  const itemsByPhase = {};
  let assignmentFile = null;
  try {
    const dir = path.join(PLATFORM, 'docs', `release-${RELEASE.version}`);
    const cand = fs
      .readdirSync(dir)
      .filter((f) => /^PHASE-ASSIGNMENT-[\d-]+\.md$/.test(f))
      .sort()
      .reverse();
    if (cand.length) {
      assignmentFile = cand[0];
      const lines = fs.readFileSync(path.join(dir, assignmentFile), 'utf8').split('\n');
      let cur = null;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const h = /^##\s+PHASE\s+(\d+)/i.exec(l);
        if (h) { cur = Number(h[1]); itemsByPhase[cur] = itemsByPhase[cur] || 0; continue; }
        if (cur === null || !l.startsWith('|')) continue;
        /* Same two guards as the tracker parser: a header row (the one directly
           above a `|---|` separator) is never an item, and an identifier is
           hyphenated AND carries a digit. Without them the summary table at the
           top and every `| id | status | item |` header vote in the counts —
           which is exactly R262-D-144, a summary row counted as an item. */
        if (isSeparatorRow(l) || isSeparatorRow(lines[i + 1])) continue;
        const id = plain((l.split('|')[1] || ''));
        if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/i.test(id) || !/\d/.test(id)) continue;
        itemsByPhase[cur]++;
      }
    }
  } catch (err) {
    console.error(`[board] phase item counts unavailable: ${err.message}`);
  }
  if (!assignmentFile) {
    unreadable.push({
      src: `crowagent-platform/docs/release-${RELEASE.version}/`,
      why:
        `No PHASE-ASSIGNMENT-*.md found, so the board shows the phases without item counts. ` +
        `Regenerate it with scripts/assign-phases.mjs — an unassigned item is an item that ships ` +
        `into whichever phase happens to be open.`,
    });
  }

  const phases = (decl.boundaries || []).map((b) => ({
    phase: b.phase,
    name: b.name,
    items: Object.prototype.hasOwnProperty.call(itemsByPhase, b.phase) ? itemsByPhase[b.phase] : null,
    sha: b.sha || null,
    shipped: b.shipped || null,
    state: b.sha ? 'SHIPPED' : 'NOT MERGED',
    note: b.note || '',
  }));

  const spent = phases.filter((p) => p.sha).length;
  const budget = typeof decl.budget === 'number' ? decl.budget : null;
  const violations = (decl.recorded_violations || []).map((v) => ({
    sha: v.sha, project: v.project, when: v.when || null, why: v.why || '',
  }));

  /* A phase with no items assigned is not a finished phase — unless it shipped.
     Reported rather than rendered as a confident 0. */
  const unassigned = phases.filter((p) => !p.sha && (p.items === null || p.items === 0));
  if (assignmentFile && unassigned.length) {
    unreadable.push({
      src: `crowagent-platform/docs/release-${RELEASE.version}/${assignmentFile}`,
      why:
        `Phase(s) ${unassigned.map((p) => p.phase).join(', ')} have not shipped and carry no items in ` +
        `the phase assignment. Either the assignment is stale or work is unassigned; a phase with no ` +
        `items and no ship date is not a phase, it is a gap.`,
    });
  }

  return {
    ...base,
    headline:
      `${budget === null ? '?' : budget} Vercel production deploys for the whole release, one per phase boundary. ` +
      `${spent} spent, ${budget === null ? '?' : Math.max(budget - spent, 0)} remaining` +
      (violations.length ? `, ${violations.length} spent OUTSIDE a boundary and unrecoverable.` : '.'),
    budget,
    spent,
    remaining: budget === null ? null : Math.max(budget - spent, 0),
    breached: violations.length,
    phases,
    violations,
    assignment: assignmentFile ? `docs/release-${RELEASE.version}/${assignmentFile}` : null,
  };
}
const deploy = deployState();

const board = {
  updated: new Date().toISOString(),
  /* [R28-BOARD-RELEASE-PROVENANCE-01] The release the board actually read, so
     the VIEW never has to hardcode one. index.html renders its heading and
     its provenance line from this field. */
  release: RELEASE.version,
  note:
    `DERIVED, not authored. Generated from RELEASE-${RELEASE.version}-TRACKER.md and ` +
    `RELEASE-${RELEASE.version}-DEFECT-REGISTER.md by status/build-platform-board.js. Those ` +
    'documents are what a release is certified against and they win every ' +
    'disagreement, and this view is stale by at most one run. Re-run the ' +
    'generator after editing either document.',
  sources: [
    `crowagent-platform/RELEASE-${RELEASE.version}-TRACKER.md`,
    `crowagent-platform/RELEASE-${RELEASE.version}-DEFECT-REGISTER.md`,
    /* The deploy panel only. It does not contribute a single issue row. */
    'crowagent-platform/scripts/deploy-phase-boundaries.json',
    `crowagent-platform/docs/release-${RELEASE.version}/PHASE-ASSIGNMENT-*.md`,
  ],
  /* [2026-08-10] PER-PHASE, PER-STATUS BREAKDOWN — read, never recomputed.
   *
   * WHY IT EXISTS. The owner read "the board shows 66 OPEN, and Phase 4 has 55
   * items" and reasonably concluded Phase 3 had 11 left. It had 21. The two
   * figures have DIFFERENT DENOMINATORS: the phase split counts everything NOT
   * DONE (OPEN + BUILT + DECISION), while the headline OPEN count excludes BUILT
   * and DECISION. Publishing both without the split invites that subtraction, and
   * a board that invites a wrong subtraction is a reporting defect, not a
   * presentation preference.
   *
   * READ FROM `phase-breakdown.json`, WRITTEN BY `assign-phases.mjs`. Deliberately
   * not recomputed here: the phase-assignment rule then has exactly ONE
   * implementation. Two copies of an assignment rule is precisely the drift this
   * release exists to remove.
   *
   * ORDER MATTERS, and staleness is surfaced rather than hidden: build the board,
   * run assign-phases against it, then build the board again to pick this up. If
   * the file is missing the panel simply does not render — an absent panel is
   * honest; a panel showing last run's numbers is not. */
  phaseBreakdown: (() => {
    try {
      const p = path.join(path.dirname(OUT), 'phase-breakdown.json');
      if (!fs.existsSync(p)) return null;
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));

      /* [2026-08-10] STALENESS IS DETECTED, NOT ASSUMED AWAY.
       *
       * This panel went stale within the hour of being built and showed the owner
       * "Phase 3: 38 ... 5 needing an owner decision" when the truth was 36 and
       * ZERO — because the board rebuilds independently of assign-phases.mjs, and
       * I had relied on RUN ORDER to keep them together. Order is something a
       * person remembers or forgets; it is not a guarantee.
       *
       * assign-phases now stamps a fingerprint of the issue set it derived from.
       * Recompute it here and compare. On mismatch the panel is marked stale and
       * the page refuses to render its numbers — showing nothing is honest,
       * showing last run's figures is not, and this file already said so before
       * it happened anyway. */
      const fp = issues.map((i) => `${i.id}:${i.status}`).sort().join('|');
      let h = 0;
      for (let n = 0; n < fp.length; n += 1) h = (Math.imul(31, h) + fp.charCodeAt(n)) | 0;
      const current = `${issues.length}:${h}`;

      if (parsed.sourceFingerprint && parsed.sourceFingerprint !== current) {
        unreadable.push(
          'status/phase-breakdown.json — STALE. It was generated from a different issue set than ' +
          'this board (fingerprint ' + parsed.sourceFingerprint + ' vs ' + current + '). The ' +
          'per-phase panel is SUPPRESSED rather than shown with out-of-date numbers. Re-run: ' +
          'node scripts/assign-phases.mjs <path-to-platform.json>, then rebuild this board.'
        );
        return { ...parsed, stale: true };
      }
      return parsed;
    } catch {
      return null;
    }
  })(),
  legend: {
    FIXED: 'Implemented and verified. Tracker verdict DONE or MET.',
    BUILT: 'Implemented, not yet certified by a full release run. Tracker verdict PARTIAL, BUILT or IN PROGRESS — the code landed, the suite that would prove it has not run.',
    OPEN: 'Confirmed, not started. Tracker verdict TODO, or a defect nobody marked closed.',
    DECISION: 'Blocked on an owner decision or an owner action. Tracker verdict BLOCKED or DEFERRED, or a TODO the tracker marks as the owner\'s.',
    WIP: 'Diagnosed, in progress.',
    CLEARED: 'Not applicable — the premise was false, or the item is counted against another row. Tracker verdict N/A.',
    'ON HOLD': 'Parked, and NOT actionable by us. Blocked on something the owner has declined or cannot do yet, such as a paid plan tier or an external dependency. Tracker verdict HELD, ON HOLD or PARKED. Distinct from DECISION, which is waiting on an owner ANSWER we have asked for.',
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
    /* [2026-08-10, owner] PERMANENT and release-agnostic. Carried on the board
       itself rather than only in docs/STATUS-BOARD-CHARTER.md, because a rule
       about reading the board that lives somewhere else is a rule that gets
       missed by exactly the session it is meant to bind. */
    { id: 'KICKOFF', text: 'MANDATORY for every release, every session: start by reading this board. Be able to state total raised, how many are done, and of the rest how many are not started / written-awaiting-certification / awaiting an owner decision — INCLUDING which population each number belongs to. The headline counts and the per-phase counts measure different things; subtracting one from the other gives a wrong answer.' },
    { id: 'HANDOVER', text: 'At release close every item goes to exactly ONE place: still pending (not started, built, or awaiting a decision) HANDS OVER to the next release with its evidence; done and cleared are SAVED AS RELEASE DELIVERY. The board then re-points at the new release. Nothing is dropped at a boundary. See docs/STATUS-BOARD-CHARTER.md.' },
    { id: 'VOCABULARY', text: 'If a status cannot express the truth, ADD THE STATE — never pick the nearest wrong one. Twice this release a status was falsified by a missing word: built-but-not-shipped read as FIXED, and withdrawn read as OPEN forever. A phantom OPEN is as damaging as a phantom FIXED.' },
    /* [2026-08-09, owner] The deploy rules, verbatim in substance. They existed
       only in chat until now, which is why three of them were broken. The
       numbers live in the panel above; these are the rules themselves, so a
       reader of the board is told the constraint and not only the count. */
    { id: 'DEPLOY 4', text: 'crowagent-platform-web + crowagent-portal get FOUR Vercel production deploys for the whole release — ONE at each phase boundary. Nothing mid-phase, for any reason, including a docs-only commit.' },
    { id: 'WEBSITE', text: 'crowagent-website is SEPARATE. It does not count against that budget and ships as and when ready.' },
    { id: 'RAILWAY', text: 'Railway, staging AND production: deploy whenever needed. No approval, no waiting.' },
    { id: 'SUPABASE', text: 'Supabase, staging AND production: apply whenever needed. No approval, no waiting. Via MCP apply_migration, never db push.' },
    { id: 'NO PHASE 5', text: 'There is no Phase 5. Phase 2 is CLOSED. Every remaining item is Phase 3 or Phase 4.' },
    { id: 'LIVE ONLY', text: 'Never report deploy or phase state from a repository document or git log. Read the live surface — Vercel, Stripe, Supabase, Railway.' },
  ],
  /* [2026-08-09] Phases and the deploy budget, DERIVED from
     scripts/deploy-phase-boundaries.json. See deployState() above for why this
     carries no figures of its own and why it is not a live read. */
  deploy,
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

/* [2026-08-09] The deploy position, printed beside the item counts. A CLI run of
   this generator is how most people see the board's state, and "how many deploys
   are left" is the question that decides whether a merge may ship at all. */
if (deploy.unavailable) {
  console.log(`  deploy budget: UNKNOWN — ${deploy.unavailable}`);
} else {
  console.log(`  deploy budget: ${deploy.headline}`);
  for (const p of deploy.phases) {
    console.log(
      `    phase ${p.phase} ${p.name.padEnd(38)} ${String(p.items ?? '—').padStart(3)} item(s)  ` +
        (p.sha ? `SHIPPED ${p.shipped} ${p.sha}` : 'NOT MERGED'),
    );
  }
}

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

/* `unreadable` holds OBJECTS ({src, why}); joining them printed
   "UNREADABLE: [object Object] [object Object]" — a warning that names nothing
   is a warning nobody can act on, which is the same failure as a gate that
   cannot fail. Rendered properly here and on the page. */
if (unreadable.length) {
  console.warn('UNREADABLE:');
  for (const u of unreadable) console.warn(`  · ${typeof u === 'string' ? u : `${u.src} — ${u.why}`}`);
}

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
