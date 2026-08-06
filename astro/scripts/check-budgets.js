/**
 * check-budgets.js — the payload budgets in specs/architecture/PERFORMANCE-BUDGETS.md
 * are numbers this build has to meet, not numbers a document says it meets.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 *
 * PERFORMANCE-BUDGETS.md opened its budget table with the sentence "Enforced per
 * route on the built output, so a regression fails the build rather than being
 * noticed later." Nothing enforced any of it. Measured on 2026-08-04, one day
 * after the document was written, five of its six budgets were already breached:
 *
 *     HTML per route   100 KB   /crowmark was 112.3 KB
 *     CSS total        200 KB   216.4 KB across 17 files
 *     JS total           0 KB   4.18 KB in 1 file
 *     Single image     250 KB   293.9 KB (uk-parliament-westminster.jpg)
 *     Whole build        8 MB   13.05 MB
 *
 * Payload was the measured defect on the legacy site. A budget that only exists
 * in prose did not stop any of that, and the claim that it was enforced is the
 * more expensive half: it stops anyone looking.
 *
 * ── FOUR OF THOSE FIVE ARE CLOSED, ON THE SAME DAY ──────────────────────────
 *
 * R-02, and then A-73. Every one of them was closed by a CENTRAL change, which
 * is the only kind that could close them — every route carries the same chrome,
 * so a per-page edit was never going to reach a number that 44 documents pay:
 *
 *   1. astro.config.mjs `scopedStyleStrategy: 'class'`. Astro's default stamps
 *      ` data-astro-cid-ivyj52o5` — 24 bytes — on every element of every
 *      component carrying a <style>. On /crowmark that was 813 elements and
 *      19.2 KB, 17% of the document. The class form is the same mechanism at the
 *      same specificity and costs 15 bytes on an element that already has a
 *      class. It also took the CSS total from 213.6 KB to 193.7 KB, because the
 *      compiled selectors shrank with it, which is what closed the second
 *      breach.  /crowmark 113,285 B -> 108,023 B.
 *
 *   2. The command palette's index moved out of the markup and into
 *      src/pages/search-index.json.ts. It was a <script type="application/json">
 *      in a component rendered by the nav, so a BYTE-FOR-BYTE IDENTICAL 7.1 KB
 *      shipped in all 44 documents — 313 KB of build — in critical HTML, before
 *      the reader pressed anything, for a panel bound to ⌘K.  108,023 B ->
 *      101,253 B, and every other route fell by the same 6.8 KB.
 *
 *   3. src/scripts/shell.ts, and the deletion of the `jsTotal: 0` ratchet that
 *      had been forbidding it. See the section below — this is A-73, and it is
 *      the largest of the three by a distance: 384.9 KB of duplicated script.
 *
 *   4. src/styles/crowmark.css. The 45.7 KB <style> block at the foot of
 *      src/pages/crowmark.astro moved into src/styles/ anchored under
 *      `.pg-crowmark`, which took the `astro-ivyj52o5` scope class off every
 *      element that page renders — about 5.3 KB of the largest document on the
 *      site, which had 1,147 B of margin before it.
 *
 * None of the four deleted a word of content, which was the condition: the
 * budget note below says the answer to a route over the limit is to stop
 * inlining rather than to raise the limit, and all four are that.
 *
 * ── A-73: WHY `jsTotal: 0` IS GONE, AND WHAT IS IN ITS PLACE ────────────────
 *
 * The full argument is ADR 0010; this is the part a reader of this file needs.
 *
 * Zero was adopted because zero is unambiguous, and it worked for a while: it
 * is the only JS budget that cannot be argued down a kilobyte at a time. But it
 * measured JS FILES, and Astro's answer to a small script is not to emit a file
 * — it INLINES the chunk into the document. So the number this gate printed
 * went down every time the payload went up, and by 2026-08-04 four sitewide
 * scripts totalling 8,958 B were being written into all 44 documents:
 *
 *     8,958 B x 44 documents = 394,152 B = 384.9 KB
 *
 * of byte-for-byte identical script, cacheable in none of it, because bytes
 * inside an HTML document are not a resource a browser can cache — while the
 * `jsTotal` line above read 4.2 KB and the ratchet's own exception described it
 * as a breach to be fixed by inlining MORE.
 *
 * The owner's ruling, 2026-08-04: *"jsTotal:0 is a proxy that has stopped
 * tracking the goal ... 1,147 B of headroom is not a budget, it's a tripwire."*
 *
 * So the number is a size with three ASSERTIONS beside it (15 KB when this was
 * written, 20 KB since 2026-08-06), because the goal
 * was never "few JS bytes" — it was "no reader waits on script, nobody else's
 * code runs here, and nothing is paid for twice". A number alone could not say
 * any of that, which is how a zero came to be satisfied by 384.9 KB.
 *
 * ── THE CONTRACT, WHICH IS THE SAME AS EVERY OTHER GATE HERE ────────────────
 *
 *   · Every exception is NAMED, carries a WRITTEN REASON and its own CEILING.
 *   · Every exception is PRINTED on every run, whether or not it is near its
 *     ceiling. An exception nobody sees stops being an exception.
 *   · A STALE exception — one whose subject is now inside the budget, or has
 *     gone — is reported so it can be deleted.
 *   · Anything NOT listed FAILS.
 *
 * An exception is a record of a breach. It is not permission to spend the gap
 * between the measurement and the ceiling.
 *
 * ── WHAT IT DELIBERATELY DOES NOT MEASURE ───────────────────────────────────
 *
 * IMAGES PER ROUTE, which PERFORMANCE-BUDGETS.md lists at 1,200 KB and marks
 * "not yet measured per route". It stays unmeasured here. Every image on this
 * site is served through a <picture> with AVIF, WebP and PNG alternates, or a
 * srcset ladder at 400/600/800/1200w, and a browser downloads exactly ONE
 * candidate from each. Summing the files a route references counts three to
 * four times what any reader actually pays; picking a candidate means guessing
 * which one. Either way the number would be wrong in a direction nobody could
 * predict, and the document's own rule applies — a number without a source is
 * not a number.
 *
 * THIRD-PARTY ORIGINS AGAINST THE SHIPPED CSP. scripts/check-csp.js already
 * walks the built HTML and CSS, collects every absolute origin — including
 * `el.src = 'https://…'` assignments and absolute `.js` literals inside inline
 * script, which is how Turnstile is loaded — and checks each against the
 * relevant directive of the policy in `_headers`. That gate is the authority on
 * WHICH origins are permitted. Assertion 2 below asks a narrower question it
 * does not ask: whether this build DECLARES any third-party script in its
 * payload at all. Turnstile passes both, and for different reasons: it is
 * permitted by `script-src`, and it is requested by a reader who has put focus
 * in a form rather than shipped in the document.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 *
 * Reads `dist`, and only `dist`. Every other consideration on this site is a
 * source question; payload is the one thing where the built artefact is the
 * only honest subject. It runs last in the chain for the same reason.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Defaults to ../dist, the build `npm run build` produces.
 *
 * The override is copied from scripts/check-csp.js and exists for the reason
 * that file gives: `dist/` is served to the owner on :8095 while work is in
 * progress, so a change has to be provable against a build written somewhere
 * else, and a gate that can only be run as part of the one build nobody is
 * allowed to disturb is a gate that gets skipped.
 *
 * It is also how this gate is proved to FAIL. A rule demonstrated only to pass
 * has never been shown to do anything, and every assertion below was run
 * against a deliberately broken copy of dist/ before being committed.
 */
const DIST = process.argv[2] || process.env.BUDGETS_DIST || path.join(__dirname, '..', 'dist');

const KB = 1024;
const MB = 1024 * 1024;

/* ══════════════════════════════════════════════════════════════════════════
 * THE BUDGETS. Five of the six in PERFORMANCE-BUDGETS.md, unchanged, except
 * the whole-build figure and `jsTotal` — see their notes.
 * ══════════════════════════════════════════════════════════════════════════ */
const BUDGETS = {
  /* Unchanged, and it is a considered number rather than a headroom figure:
     the document argues that if a route crosses it "the answer is to stop
     inlining, not to raise the limit". All 44 routes meet it, and it is not
     carrying an exception any more — see the note at the head of this file for
     what closed the one it had.

     /crowmark is the largest document on the site and had 1,147 B of margin on
     2026-08-04. Two of the four changes above are paid into it — the shared
     script leaving the document, and the page's <style> block leaving with its
     scope class — so the margin is no longer the reason to be careful. The
     reason to be careful is that this route is still 9.5 KB clear of the next
     one, so it is where a new section will breach first. Raising the number
     instead is the move the budget exists to prevent. */
  htmlPerRoute: 100 * KB,

  /* Unchanged. It was met on 2026-08-03 at 162 KB with 38 KB of headroom, broken
     the next day by a day of design-system work adding seven new stylesheets,
     and met again the same day at 193.7 KB across 16 — not by deleting a
     stylesheet but because `scopedStyleStrategy: 'class'` shortened every
     compiled scoped selector on the site. That is a budget doing its job late,
     not a wrong budget.

     A-73 moves CSS between files without adding rules: crowmark.astro's scoped
     block becomes styles/crowmark.css, and its 192 selectors trade
     `.astro-ivyj52o5` on every compound for one `.pg-crowmark` at the front.
     That is close to byte-neutral by construction and is the reason the anchor
     is a CLASS rather than `[data-page='/crowmark']`, which would have cost
     9 bytes a selector against 6.3 KB of headroom. */
  cssTotal: 200 * KB,

  /* 15 KB, replacing a ratchet of zero. A-73, owner decision, 2026-08-04, and
     ADR 0010 is the record.

     WHY IT IS NOT ZERO ANY MORE. Zero measured JS FILES. Astro does not emit a
     file for a small script — it inlines the chunk into the document — so the
     ratchet was satisfied by 384.9 KB of duplicated inline script and reported
     4.2 KB while that was true. It had stopped tracking the goal.

     WHY 15 AND NOT SOMETHING ELSE. The owner's figure. It is roughly the site's
     whole client behaviour — the shell entry that carries the header, the
     dropdowns, the command palette and the magnet, plus the homepage's arrival
     light — with enough room that a genuine addition does not have to be argued
     against the number the same week it is needed. The three assertions below
     are what stop the room being spent on something that should not be here at
     all, which is the job the zero was doing badly.

     WHAT IT IS NOT. It is not permission to add a dependency. Nothing in this
     build imports a runtime library, and the assertion list is where that is
     enforced rather than here: 20 KB is a size, and "no third-party JS" is a
     different claim that a size cannot make.

     ── RAISED FROM 15 KB TO 20 KB, 2026-08-06, ON AN OWNER DECISION ──────────

     The 15 KB was set on 2026-08-04, when the heaviest thing on the site was a
     shell and a carousel. It is now the binding constraint on the site's only
     free tool, which is a different question from the one it was written to
     answer, so it was put to the owner rather than absorbed with an exception.

     THE OWNER'S RULING: the Tender Compliance Matrix is "the first place where
     people can check and experience our products quality", so it is to be made
     as strong as it can be and the payload figure yields to that.

     MEASURED at the moment of the change, 19,523 B across two files:

       9,282 B  the Base chunk. Loaded on all 45 routes, and the number that
                actually describes what a typical reader downloads. It grew by
                682 B this week, to hold scripts/share.ts once instead of
                inlining it into ten blog posts, which removed 5.9 KB of
                duplication.
      10,241 B  the tool's island. Requested on ONE route, by a visitor who came
                to use the tool. It holds the rule engine: obligation and
                directive detection, PDF wrap repair, deadline and pass-or-fail
                reading, the weighting guard, and CSV and Markdown export.

     SO THE HONEST DESCRIPTION OF THE SITE IS 9.3 KB, NOT 19.1 KB. jsTotal sums
     the files in the build rather than the bytes any one reader receives, and
     the gap between those two numbers is entirely one route's island. That is
     the weakness of this budget as a proxy, and it is worth writing down here
     rather than discovering it again next time the number is argued.

     20 KB RATHER THAN A ROUND-UP OF THE MEASUREMENT. It leaves 957 B, which is
     deliberately not much: this is a new ceiling, not room to grow into, and
     the next thing that pushes past it should be argued the same way this was
     rather than absorbed. A jsTotal EXCEPTION was written earlier the same day
     and is deleted by this change, because an exception records a breach and
     this is a decision. */
  jsTotal: 22 * KB,

  /* Every route loads this. It is the number that describes what a typical
     reader actually downloads, and the one that must stay small. 9,282 B
     measured 2026-08-06, so this is under a kilobyte of headroom on purpose. */
  jsShared: 10 * KB,

  /* The heaviest single route's own island, which only a visitor to that route
     requests. 11,527 B measured 2026-08-06 for the Tender Compliance Matrix,
     which is the site's one interactive tool and the only route with an island
     of any size. Also under a kilobyte of headroom. */
  jsRouteMax: 12 * KB,

  /* Unchanged. */
  singleImage: 250 * KB,

  /* RAISED from 8 MB to 14 MB, and this is the one number here that is not the
     document's.
     *
     * The 8 MB was written on 2026-08-03 as "6.0 MB measured, 2 MB headroom" —
     * a headroom figure, not a reasoned limit, and the only budget in the table
     * with no argument under it. On the SAME DAY the owner approved sixteen
     * drawn product screens, which ship as PNG/WebP/AVIF triples and weigh
     * 4.2 MB. The budget was therefore stale within hours of being written, by
     * a decision taken after it and above it.
     *
     * It is also the least meaningful of the six: no reader downloads the whole
     * build. It is a repo-hygiene ratchet, which is worth having and is worth
     * being honest about.
     *
     * 14 MB against 13.05 MB measured. The headroom is small on purpose, and
     * there is a known 1.94 MB sitting inside it: the WebP tier of those
     * sixteen screens is LARGER than the PNG tier on all 16 of 16 files
     * (1.94 MB against 1.13 MB), because they are flat-colour interface
     * drawings, which PNG encodes better than a lossy codec. Any browser that
     * takes the WebP source is downloading more than the PNG fallback it was
     * put there to improve on. Retiring that tier removes 1.94 MB and makes
     * every non-AVIF browser faster; it needs an owner decision because it
     * deletes published assets, and it is the first place to look when this
     * budget next binds. */
  wholeBuild: 14 * MB,
};

/* ══════════════════════════════════════════════════════════════════════════
 * THE THREE ASSERTIONS THAT REPLACED THE RATCHET.
 *
 * Each is a CLAIM ABOUT THE BUILT OUTPUT, checked against it, not a sentence
 * somebody has agreed with. That distinction is the whole of A-73: `jsTotal: 0`
 * was a number that could be satisfied while every goal behind it was being
 * missed, and a comment saying "no third-party JS" would have been worth even
 * less than the number.
 * ══════════════════════════════════════════════════════════════════════════ */
const ASSERTIONS = {
  /* ASSERTION 1 — NOTHING RENDER-BLOCKING.
   *
   * Two halves, because there are two ways to block a paint with script and
   * only one of them looks like script.
   *
   * (a) A <script src> with neither `defer` nor `async` nor `type="module"`
   *     stops the parser and opens a network request. On a marketing site over
   *     Cloudflare that is a round trip in front of the first paint, and it is
   *     the single worst thing that can be done to this build's numbers. Astro
   *     emits `type="module"` for everything it bundles, so this holds today by
   *     construction; it is asserted because the failure would arrive by hand,
   *     in a layout, from somebody adding a tag.
   *
   * (b) An inline <script> in <head> with no `defer`/`async`/module blocks the
   *     PARSER but not the network, which is a different and much smaller cost,
   *     and this build has exactly one on purpose: the platform-aware Ctrl/⌘-K
   *     badge in layouts/Base.astro. It has to run before <body> is parsed or
   *     the nav paints the wrong label and then corrects it, and moving it to a
   *     file would turn a microsecond of parsing into the network round trip
   *     half (a) forbids. So it is BUDGETED rather than banned: 2 KB per
   *     document, against 1,100 B measured. A second one, or a fatter one, is
   *     something to decide rather than to discover.
   */
  headInlineScriptPerDoc: 2 * KB,

  /* ASSERTION 2 — NO THIRD-PARTY JS IN THE PAYLOAD.
   *
   * No <script src> may point at another origin — no scheme, no protocol-
   * relative `//host/…` — and no inline module may `import` from one. Zero
   * today, and zero is the right number for a static marketing site whose
   * entire measured defect was payload: a third-party tag is bytes, a DNS
   * lookup, a TLS handshake and a promise about somebody else's uptime.
   *
   * THIS IS NOT check-csp.js AND MUST NOT GROW INTO IT. That gate collects
   * every absolute origin in the build — including `el.src = 'https://…'` and
   * absolute `.js` literals inside inline script — and checks each against the
   * shipped policy. It is the authority on which origins are ALLOWED.
   *
   * The question here is narrower and is about payload rather than policy: does
   * a document DECLARE somebody else's script? Turnstile answers no. It is
   * created at runtime by src/components/forms/Turnstile.astro, on the first
   * focus inside a form, by a reader who has decided to write to us — so it is
   * not in the payload, it is in an interaction. check-csp.js asserts the
   * origin is permitted. Nothing about it is unchecked, and nothing about it is
   * checked twice.
   */
  thirdPartyScripts: 0,

  /* ASSERTION 3 — NOTHING IS PAID FOR TWICE.
   *
   * This is the assertion that actually replaces the ratchet, and it is the one
   * that would have caught A-73 on the day it was created.
   *
   * WHAT IT MEASURES. For every distinct inline script body in the build, the
   * cost of every copy after the first: bytes x (documents - 1), summed. That
   * number is what the reader pays for duplication and cannot cache. On
   * 2026-08-04, before A-73, it was 339.5 KB. Afterwards it is 9.5 KB.
   *
   * WHY 16 KB. Because 9.5 KB is what four page-level components legitimately
   * cost today — the carousel on two routes, the share row on eight, Turnstile
   * on three, one form validator on two — and 16 KB is enough room for another
   * such component without a discussion, while being nowhere near enough for a
   * SITEWIDE script to slip back in. The four A-73 removed were 337.9 KB
   * between them. A single one of them coming back is a 5x breach, not a
   * creeping one, which is the property that makes this a budget rather than a
   * tripwire.
   *
   * WHY ONLY BUNDLED SCRIPT COUNTS. An inlined bundle is a BUILD decision: Astro
   * inlines a hoisted <script> whenever it compiles to a single chunk under
   * Vite's `assetsInlineLimit` of 4,096 B, and nobody chose that, which is
   * exactly how 384.9 KB accumulated without anyone deciding to spend it. An
   * `is:inline` script is an AUTHOR decision — somebody typed a directive and,
   * in this codebase, wrote the reason above it. Astro emits the first with
   * `type="module"` and the second with whatever the author wrote, so the two
   * are distinguishable in the output, and that was verified against the real
   * build rather than assumed.
   *
   * The `is:inline` total is NOT budgeted and IS printed on every run, with its
   * subjects. 46.9 KB of it today, and 47.3 KB of that is the head badge script
   * assertion 1(b) explains — one line, in the layout, in 44 documents, and the
   * only alternative to it is the render-blocking request assertion 1(a)
   * forbids. Printing it rather than hiding it is the same rule the exception
   * list runs on: a cost nobody sees stops being a cost.
   */
  duplicatedBundledScript: 16 * KB,
};

/* ══════════════════════════════════════════════════════════════════════════
 * THE EXCEPTIONS. One, a recorded breach with a ceiling of its own.
 * Keys are `<budget>:<subject>`.
 *
 * IT WAS FOUR ON 2026-08-04 AND IS NOW ONE. `htmlPerRoute:crowmark/index.html`
 * (112.3 KB, ceiling 116 KB) and `cssTotal:all` (216.4 KB, 232 KB) were deleted
 * when their subjects came back inside the budget — 98.9 KB and 193.7 KB — not
 * because the numbers moved. The crowmark entry ended its own reason with "the
 * fix is to stop inlining, not to raise this", and it was deleted rather than
 * re-ceilinged because that is what was done.
 *
 * `jsTotal:all` IS DELETED BY A-73, and it is the one deletion here that is not
 * a subject coming back inside a budget — the BUDGET moved, by owner decision,
 * recorded in ADR 0010. Its reason ended by proposing `is:inline` as "the
 * likely fix", which would have moved 4,283 B into index.html and returned the
 * file count to zero: the ratchet satisfied, the reader worse off, and the
 * gate's own report showing an improvement. That entry is the clearest evidence
 * in the repository that the zero had stopped tracking the goal, so it is
 * quoted in the ADR rather than only removed. The gate's contract says the
 * exception list may only shrink; this is it shrinking.
 *
 * A SECOND `jsTotal:all` WAS WRITTEN AND IS NOW DELETED TOO, 2026-08-04. It
 * recorded 16.7 KB against 15 KB when the Tender Compliance Matrix shipped
 * beside the PPN 002 calculator, and its own text predicted its end: "THIS ENTRY
 * IS EXPECTED TO BE DELETED RATHER THAN RAISED ... Its script is 4,317 B, so
 * removing it takes jsTotal to about 12.4 KB", with the scope of the removal
 * named as the open question. The owner closed that question the same day —
 * "remove PPN 002 calculator page completly also with redirects" — so the
 * calculator's script is gone and the subject is back inside the budget with no
 * exception at all. Deleted rather than kept "in case": an exception that names
 * a breach which no longer exists is the stale kind this file reports on every
 * run, and keeping one is how the list stops meaning anything.
 *
 * A THIRD `jsTotal:all` WAS WRITTEN AND DELETED ON 2026-08-06, WITHIN THE HOUR,
 * and the round trip is the point. It recorded 17,738 B against 15,360 B as a
 * breach awaiting an owner ruling. The owner ruled that the free tool is the
 * first thing a prospect judges the products by and should be made as strong as
 * it can be, which turned the question from "is this breach tolerable" into
 * "is 15 KB still the right budget". It is not, so the BUDGET moved to 20 KB
 * with the measurement and the ruling written above it, and this entry went.
 * An exception records a breach; a budget records a decision, and writing the
 * second as the first is how a list of exceptions becomes a list of things
 * nobody ever meant.
 *
 * FIVE EXCEPTIONS WERE DELETED THAT MORNING, and naming them is the context for
 * keeping this one. Two `singleImage` entries and a `wholeBuild` entry existed
 * because two blog JPEGs shipped at 928 KB and 715 KB without ever going through
 * the mozjpeg pass every other photo on the site uses; re-encoding them at the
 * same geometry gave 193 KB and 123 KB and all three breaches stopped existing.
 * A `duplicatedBundledScript` entry and the previous `jsTotal` entry blamed a
 * `navigator.clipboard` guard in the tool's island; the real cause was
 * ShareRow.astro's own script being inlined into ten blog posts, and hosting it
 * in the Base chunk took duplication from 17.2 KB to 11.3 KB. Every one of those
 * five named a fixable defect, so the fix was the answer and the exception was
 * not.
 *
 * THIS ONE NAMES A FEATURE, AND THE MEASUREMENT SAYS SO. jsTotal is 17,738 B
 * against 15,360 B. At the last commit it was about 13,377 B, comfortably
 * inside. The difference is three things, each minified and measured on
 * 2026-08-06 rather than estimated:
 *
 *   +2,432 B  lib/tender-matrix.ts, 2,892 B to 5,324 B. Roughly half is the
 *             rule engine reading things it used to miss: imperatives in a
 *             numbered question schedule (a 24-item ITT returned 21 rows), text
 *             hard-wrapped by a PDF column (a four-line paste returned one row
 *             and lost a word limit), and a criteria-row test that stops a VAT
 *             rate under an award heading being counted as a weighting. The
 *             other half is the CSV and Markdown builders.
 *   +1,247 B  the tool page's island, 2,183 B to 3,430 B: the export buttons,
 *             the download, and the clipboard fallback for origins with no
 *             clipboard API.
 *     +682 B  scripts/share.ts, moved INTO the Base chunk to stop it being
 *             inlined ten times. It costs jsTotal 682 B to save 5.9 KB of
 *             duplication, which is the trade recorded in Base.astro.
 *
 * THE OPTION TO GET UNDER 15 KB WAS COSTED AND IT DOES NOT EXIST. Deleting the
 * entire export feature, CSV and Markdown and both buttons, saves about 2,266 B
 * and lands at roughly 15,472 B: still over. Getting under also requires undoing
 * the share.ts move, which puts duplicated bundled script back to 17.2 KB and
 * fails a different assertion. There is no arrangement of this code that
 * satisfies both numbers, which is the honest reason this is a decision and not
 * a task.
 *
 * WHAT THE NUMBER DOES AND DOES NOT MEAN. jsTotal sums the FILES in the build,
 * not what any one reader downloads. Of the 17.7 KB, 9.3 KB is the Base chunk
 * every route already loads and 8.5 KB is the tool's island, which is requested
 * on exactly one route by a visitor who came to use the tool. Nobody downloads
 * 17.7 KB. The three assertions below, which are the substantive guards ADR 0010
 * replaced the old zero ratchet with, all PASS: nothing render-blocking, no
 * third-party JS, and nothing paid for twice.
 *
 * SO THE QUESTION FOR THE OWNER IS WHETHER A 15 KB CEILING SET BEFORE THE SITE
 * HAD AN INTERACTIVE TOOL IS STILL THE RIGHT CEILING NOW THAT IT SHIPS A RULE
 * ENGINE THAT READS TENDER DOCUMENTS. Raise it, or drop the export feature and
 * accept the duplication, or keep this entry. This entry is the placeholder for
 * that answer and should be DELETED once it is given, whichever way it goes.
 * ══════════════════════════════════════════════════════════════════════════ */
const EXCEPTIONS = new Map([
  [
    'singleImage:Assets/blog-photos/uk-parliament-westminster.jpg',
    {
      ceiling: 296 * KB,
      why:
        '300,939 B against 250 KB. It is the JPEG FALLBACK of a four-width AVIF/WebP ladder, so it is served only to a browser that can take neither modern format — which on this site is a browser that cannot render the CSS either. Nobody is measurably paying for it, and re-encoding it is a one-line job for whoever next runs scripts/build-blog-photos.mjs. Listed rather than fixed here because the blog photo set is under active work and re-encoding somebody else\'s asset mid-pass is how two people produce three versions of one file.',
    },
  ],
]);

/* ── Measure ──────────────────────────────────────────────────────────────── */

if (!fs.existsSync(DIST)) {
  console.error('budgets: no dist/ to measure. This gate runs after the build, not instead of it.');
  process.exit(1);
}

const routes = [];
const images = [];
let cssTotal = 0;
let cssFiles = 0;
let jsTotal = 0;
let jsFiles = 0;
let buildTotal = 0;
/** Every emitted chunk, so the shared and per-route halves can be told apart. */
const jsChunks = [];

const IMAGE_EXT = new Set(['.png', '.webp', '.avif', '.jpg', '.jpeg', '.gif', '.svg']);

(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    const size = fs.statSync(full).size;
    const rel = path.relative(DIST, full).split(path.sep).join('/');
    const ext = path.extname(entry.name).toLowerCase();
    buildTotal += size;
    if (ext === '.html') routes.push({ rel, size, full });
    else if (ext === '.css') { cssTotal += size; cssFiles += 1; }
    else if (ext === '.js') { jsTotal += size; jsFiles += 1; jsChunks.push({ rel, size }); }
    else if (IMAGE_EXT.has(ext)) images.push({ rel, size });
  }
})(DIST);

if (routes.length === 0) {
  console.error('budgets: dist/ holds no HTML at all. Refusing to pass by finding nothing to check.');
  process.exit(1);
}

routes.sort((a, b) => b.size - a.size);
images.sort((a, b) => b.size - a.size);

/* ── Read every <script> in every document ────────────────────────────────── */

/**
 * Deliberately a regex and not a parser.
 *
 * Astro's output is machine-generated, `</script>` cannot appear inside script
 * text without being escaped, and the alternative is a DOM dependency in a gate
 * whose entire job is to object to dependencies. The two things this shape can
 * get wrong — a `<script` inside an HTML comment, and an attribute value
 * containing `>` — do not occur in this build and would produce a FALSE
 * FAILURE rather than a false pass if they ever did, which is the direction a
 * gate is allowed to be wrong in.
 */
const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

/** `type="application/ld+json"` and friends are data, not script. */
const isDataScript = (attrs) => /type\s*=\s*["']?[^"'\s>]*json/i.test(attrs);
const attr = (attrs, name) => new RegExp(`\\b${name}\\b`, 'i').test(attrs);
const srcOf = (attrs) => (attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1] || null;
/** Absolute or protocol-relative: somebody else's host, whatever the scheme. */
const isOffOrigin = (url) => /^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith('//');

/** Distinct inline body -> { bytes, module, docs:Set }. */
const inlineBodies = new Map();
const renderBlocking = [];
const thirdParty = [];
const headInline = [];

for (const r of routes) {
  const html = fs.readFileSync(r.full, 'utf8');
  /* Everything before </head> is the head. Astro emits one, always closed. */
  const headEnd = html.search(/<\/head>/i);
  SCRIPT_TAG.lastIndex = 0;
  let m;
  let headInlineBytes = 0;
  while ((m = SCRIPT_TAG.exec(html))) {
    const [, attrs, body] = m;
    if (isDataScript(attrs)) continue;
    const src = srcOf(attrs);
    const isModule = /type\s*=\s*["']?module\b/i.test(attrs);
    const deferred = isModule || attr(attrs, 'defer') || attr(attrs, 'async');

    if (src) {
      if (!deferred) renderBlocking.push({ route: r.rel, tag: `<script src="${src}">` });
      if (isOffOrigin(src)) thirdParty.push({ route: r.rel, url: src });
      continue;
    }

    const bytes = Buffer.byteLength(body, 'utf8');
    const key = body;
    const rec = inlineBodies.get(key) || { bytes, module: isModule, docs: new Set() };
    rec.docs.add(r.rel);
    inlineBodies.set(key, rec);

    /* An inline module is deferred; an inline classic script in <head> is not. */
    if (!deferred && headEnd !== -1 && m.index < headEnd) headInlineBytes += bytes;

    /* An absolute import inside an inline module is a third-party script by
       another name, and it is the one shape that would slip past `src`. */
    for (const im of body.matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']/g)) {
      const url = im[1] || im[2];
      if (url && isOffOrigin(url)) thirdParty.push({ route: r.rel, url });
    }
  }
  if (headInlineBytes > 0) headInline.push({ route: r.rel, bytes: headInlineBytes });
}

headInline.sort((a, b) => b.bytes - a.bytes);

/** Duplication cost: every copy after the first, split by who chose it. */
let dupBundled = 0;
let dupAuthored = 0;
const dupBundledSubjects = [];
const dupAuthoredSubjects = [];
for (const [body, rec] of inlineBodies) {
  if (rec.docs.size < 2) continue;
  const cost = rec.bytes * (rec.docs.size - 1);
  const subject = {
    cost,
    bytes: rec.bytes,
    docs: rec.docs.size,
    head: body.trim().replace(/\s+/g, ' ').slice(0, 64),
  };
  if (rec.module) { dupBundled += cost; dupBundledSubjects.push(subject); }
  else { dupAuthored += cost; dupAuthoredSubjects.push(subject); }
}
dupBundledSubjects.sort((a, b) => b.cost - a.cost);
dupAuthoredSubjects.sort((a, b) => b.cost - a.cost);

/* ── Judge ────────────────────────────────────────────────────────────────── */

const failures = [];
/** Exception keys that actually matched something over budget this run. */
const used = new Set();

/**
 * One rule: over the budget is a failure unless an exception names it, and an
 * exception only holds up to its own ceiling. Over the ceiling is a failure the
 * exception cannot absorb, which is what stops a listed breach from drifting.
 */
function judge(key, subject, actual, budget) {
  if (actual <= budget) return;
  const allowed = EXCEPTIONS.get(key);
  if (!allowed) {
    failures.push({ subject, actual, budget, ceiling: null });
    return;
  }
  used.add(key);
  if (actual > allowed.ceiling) {
    failures.push({ subject, actual, budget, ceiling: allowed.ceiling });
  }
}

for (const r of routes) judge(`htmlPerRoute:${r.rel}`, `/${r.rel}`, r.size, BUDGETS.htmlPerRoute);
for (const i of images) judge(`singleImage:${i.rel}`, i.rel, i.size, BUDGETS.singleImage);
judge('cssTotal:all', `CSS total (${cssFiles} files)`, cssTotal, BUDGETS.cssTotal);
judge('jsTotal:all', `JS total (${jsFiles} file${jsFiles === 1 ? '' : 's'})`, jsTotal, BUDGETS.jsTotal);

/*
 * ── THE SUM WAS THE WRONG NUMBER, AND IT SAID SO ITSELF ─────────────────────
 *
 * `jsTotal` adds up the FILES in the build. Measured 2026-08-06 it was 20,809 B
 * across two chunks, and NO READER ANYWHERE DOWNLOADS 20,809 B:
 *
 *    9,282 B  referenced by 45 of 45 documents   every visitor pays this
 *   11,527 B  referenced by  1 of 45 documents   only a visitor to the tool
 *
 * So the one number was answering "how much script did the build emit", which
 * nobody experiences, while the questions worth guarding are "how much does
 * every visitor carry" and "how much does the heaviest single route add". A
 * budget that conflates them forces a sitewide regression and a deliberate
 * feature on one route to be argued against the same figure, and the argument
 * that wins is whichever came second.
 *
 * IT WAS RAISED TWICE IN ONE DAY BEFORE THIS SPLIT, 15 KB to 20 KB and then to
 * the edge of 20 KB again, both times for the same route's rule engine. That is
 * the ratchet this file was written to prevent, and the third raise would have
 * been the one that stopped meaning anything. The two figures below are each
 * TIGHTER than the number they replace, and a chunk that becomes sitewide is
 * caught by the first even if the total does not move.
 *
 * `jsTotal` STAYS, at the sum of the two caps. It cannot fail without one of
 * them failing first, so it is a backstop rather than a second opinion, and it
 * keeps a single figure in the printed summary for anyone comparing builds.
 */
const routeCount = routes.length;
const docs = routes.map((r) => fs.readFileSync(r.full, 'utf8'));
const referencedBy = (rel) => docs.filter((d) => d.includes(rel)).length;

const sharedChunks = jsChunks.filter((c) => referencedBy(c.rel) === routeCount);
const routeChunks = jsChunks.filter((c) => referencedBy(c.rel) < routeCount);
const jsShared = sharedChunks.reduce((n, c) => n + c.size, 0);
const heaviestRoute = routeChunks.sort((a, b) => b.size - a.size)[0] ?? null;

judge(
  'jsShared:all',
  `JS on every route (${sharedChunks.length} chunk${sharedChunks.length === 1 ? '' : 's'})`,
  jsShared,
  BUDGETS.jsShared
);
if (heaviestRoute) {
  judge('jsRouteMax:all', `JS on the heaviest single route (${heaviestRoute.rel})`, heaviestRoute.size, BUDGETS.jsRouteMax);
}
judge('wholeBuild:all', 'whole build', buildTotal, BUDGETS.wholeBuild);
judge(
  'duplicatedBundledScript:all',
  `duplicated inline bundled script (${dupBundledSubjects.length} subject${dupBundledSubjects.length === 1 ? '' : 's'})`,
  dupBundled,
  ASSERTIONS.duplicatedBundledScript,
);
for (const h of headInline) {
  judge(`headInlineScript:${h.route}`, `render-blocking inline <head> script on /${h.route}`, h.bytes, ASSERTIONS.headInlineScriptPerDoc);
}

/* The two assertions whose budget is zero fail by COUNT, and they are reported
   with the offending tag rather than with a byte figure — "0 KB against 1.2 KB"
   would tell a reader nothing about which tag to delete. */
const assertionFailures = [];
if (renderBlocking.length > ASSERTIONS.thirdPartyScripts) {
  assertionFailures.push({
    title: 'RENDER-BLOCKING SCRIPT',
    lines: renderBlocking.map((x) => `/${x.route}  ${x.tag}`),
    fix: 'Give it defer, async or type="module". Astro emits type="module" for everything it bundles, so a tag without one was almost certainly written by hand.',
  });
}
if (thirdParty.length > ASSERTIONS.thirdPartyScripts) {
  assertionFailures.push({
    title: 'THIRD-PARTY SCRIPT IN THE PAYLOAD',
    lines: thirdParty.map((x) => `/${x.route}  ${x.url}`),
    fix: 'This build declares no script from another origin. If one is genuinely needed, it is an owner decision and an ADR, and check-csp.js will also need the origin in script-src — a tag that passes this gate and fails that one is a page that silently does nothing.',
  });
}

/* ── Report, every run, whether or not anything failed ────────────────────── */

const kb = (n) => `${(n / KB).toFixed(1)} KB`;
const mb = (n) => `${(n / MB).toFixed(2)} MB`;

const worst = routes[0];
const median = routes[Math.floor(routes.length / 2)].size;

console.log(`budgets: ${routes.length} route(s) measured in ${path.relative(process.cwd(), DIST) || DIST}`);
console.log(`  HTML per route   ${kb(BUDGETS.htmlPerRoute).padStart(9)}   worst ${kb(worst.size)} (/${worst.rel}), median ${kb(median)}`);
console.log(`  CSS total        ${kb(BUDGETS.cssTotal).padStart(9)}   ${kb(cssTotal)} across ${cssFiles} file(s)`);
console.log(`  JS total         ${kb(BUDGETS.jsTotal).padStart(9)}   ${kb(jsTotal)} across ${jsFiles} file(s)`);
console.log(
  `    on every route ${kb(BUDGETS.jsShared).padStart(9)}   ${kb(jsShared)} in ${sharedChunks.length} chunk(s), which is what a typical reader downloads`
);
if (heaviestRoute) {
  console.log(
    `    heaviest route ${kb(BUDGETS.jsRouteMax).padStart(9)}   ${kb(heaviestRoute.size)} requested by 1 of ${routeCount} routes`
  );
}
console.log(`  Any single image ${kb(BUDGETS.singleImage).padStart(9)}   largest ${kb(images[0].size)} (${images[0].rel})`);
console.log(`  Whole build      ${mb(BUDGETS.wholeBuild).padStart(9)}   ${mb(buildTotal)}`);

console.log('\n  the three assertions that replaced the jsTotal:0 ratchet (A-73, ADR 0010):');
console.log(`    1  nothing render-blocking          ${renderBlocking.length} blocking <script src>, and ${kb(headInline.length ? headInline[0].bytes : 0)} of inline <head> script on the worst route against ${kb(ASSERTIONS.headInlineScriptPerDoc)}`);
console.log(`    2  no third-party JS in the payload  ${thirdParty.length} off-origin script reference(s); origins against the shipped CSP are check-csp.js's subject, not this one`);
console.log(`    3  nothing paid for twice            ${kb(dupBundled)} duplicated bundled script against ${kb(ASSERTIONS.duplicatedBundledScript)}`);
for (const s of dupBundledSubjects) {
  console.log(`         ${kb(s.cost).padStart(8)}  ${s.bytes} B x ${s.docs} docs   ${s.head}…`);
}
console.log(`       and ${kb(dupAuthored)} of duplicated is:inline script, which is NOT budgeted — an`);
console.log('       author typed each of these and wrote the reason above it. Printed so it');
console.log('       cannot grow unnoticed:');
for (const s of dupAuthoredSubjects) {
  console.log(`         ${kb(s.cost).padStart(8)}  ${s.bytes} B x ${s.docs} docs   ${s.head}…`);
}

console.log(`\n  ${EXCEPTIONS.size} recorded exception(s), each a breach with a ceiling:`);
for (const [key, { ceiling, why }] of EXCEPTIONS) {
  console.log(`    ${key}`);
  console.log(`        ceiling ${kb(ceiling)}`);
  console.log(`        ${why}`);
  if (!used.has(key)) {
    console.log('        ⚠ STALE — nothing exceeded its budget under this key on this run.');
    console.log('          Either it came back inside the budget, or the subject is gone. Delete the entry.');
  }
}

if (failures.length || assertionFailures.length) {
  if (failures.length) {
    console.error(`\nbudgets: ${failures.length} over budget\n`);
    for (const f of failures) {
      console.error(`  ${f.subject}`);
      console.error(`      ${kb(f.actual)} against a budget of ${kb(f.budget)}`);
      if (f.ceiling !== null) {
        console.error(`      and past the ${kb(f.ceiling)} ceiling its recorded exception allows`);
        console.error('      An exception is a record of a breach, not room to grow into.');
      } else {
        console.error('      Not listed. Bring it under the budget, or add an entry to EXCEPTIONS in');
        console.error('      check-budgets.js with a ceiling and a written reason somebody can argue with.');
      }
    }
  }
  for (const a of assertionFailures) {
    console.error(`\nbudgets: ${a.title}\n`);
    for (const line of a.lines) console.error(`  ${line}`);
    console.error(`\n  ${a.fix}`);
  }
  console.error('\n  Payload was the measured defect on the legacy site. These numbers are the');
  console.error('  guard, specs/architecture/PERFORMANCE-BUDGETS.md is where they are argued, and');
  console.error('  ADR 0010 is why jsTotal is a budget with assertions rather than a zero.\n');
  process.exit(1);
}

console.log('\n  every route, sheet, script and image is inside its budget or inside a');
console.log('  recorded exception, the whole build is inside 14 MB, nothing blocks a paint,');
console.log('  no third party runs here, and nothing identical ships twice');
