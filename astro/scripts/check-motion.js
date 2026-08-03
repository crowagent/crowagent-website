/**
 * check-motion.js — one arrival, centrally, and the build says so.
 *
 * WHY THIS EXISTS. The charter's first rule is platform first, pages second,
 * and its list of things never to implement names "duplicate layouts, metadata,
 * ANIMATIONS or business logic". Motion is the part of that list with the worst
 * history in this repository, and it is worth restating what actually happened
 * rather than gesturing at it:
 *
 *   - The legacy tree ran ELEVEN overlapping motion systems.
 *   - `js/modules/sv-reveal.js` set `opacity: 0` on every `main > section` and
 *     made it visible only if an observer fired. A normal scroll of the legacy
 *     homepage left 4 of 9 sections PERMANENTLY INVISIBLE; a full-page capture
 *     left 7 of 9.
 *   - `sovereign-transformation-v2.js` reproduced the identical defect
 *     independently through `gsap.from()`: 20/20 cards stuck at opacity 0 on
 *     crowmark.html, 13/13 on about.html, 9/9 on contact.html. Two unrelated
 *     implementations of "fade up on scroll", one bug.
 *   - The REBUILD then shipped its own staged reveal in ReasoningTrace.astro
 *     and FAILED THE SITEWIDE AXE GATE with colour-contrast on 7 nodes, because
 *     the checker sampled while the steps were semi-transparent.
 *
 * Every one of those was a component deciding for itself how content should
 * appear. Nothing in the build has ever asserted that it may not. This does.
 *
 * ── THE CONTRACT IS THE ONE THE OTHER FIVE GATES USE ─────────────────────────
 *
 * Copied deliberately from check-design-system.js, check-links.js,
 * check-seo-parity.js and check-content-parity.js rather than reinvented:
 *
 *   - an allow-list of named exceptions, each carrying the reason it is one
 *   - the allow-list is PRINTED on every run, so a deliberate exception that
 *     nobody re-reads cannot quietly become an accidental one
 *   - entries that no longer match anything are reported as stale, so the list
 *     can only shrink
 *   - anything NOT on the list FAILS the build
 *   - a reason beginning DEBT: is counted separately, because "this is wrong
 *     and is not being fixed today" is a different statement from "this is
 *     right, and here is the argument"
 *
 * ── THE FOUR RULES ───────────────────────────────────────────────────────────
 *
 *   1 TIMELINE   A scroll-driven timeline (`animation-timeline`, `view()`,
 *                `scroll()`, `timeline-scope`, `view-timeline`, `scroll-timeline`)
 *                may be declared in src/styles/motion.css and nowhere else. Two
 *                files driving the page off the scroll position is how eleven
 *                systems happened.
 *
 *   2 ENTRANCE   A @keyframes block that starts a property away from its
 *                resting value and returns it — opacity below 1 rising to 1, or
 *                a non-identity transform resolving to identity — IS an
 *                entrance, whatever it is called. It belongs to motion.css.
 *                A keyframe that starts and ends at the same value is a LOOP
 *                (m-drift, m-arrive, every travelling light on the homepage)
 *                and is explicitly not what this rule is about.
 *
 *   3 OBSERVER   `IntersectionObserver` anywhere under src/ is the mechanism of
 *                every defect listed above. Arrival is geometry now, not an
 *                event.
 *
 *   4 REVEAL     A selector naming a reveal state — `.is-visible`, `.in-view`,
 *                `.revealed`, `.animate-in`, `.fade-in` and the rest — is the
 *                CSS half of the hide-then-reveal pattern even when the
 *                JavaScript half has not been written yet.
 *
 * ── WHAT THIS CANNOT SEE, STATED RATHER THAN IMPLIED ─────────────────────────
 *
 * It reads source text. It does not run a browser, for the reason
 * check-design-system.js records: a gate that takes tens of seconds is a gate
 * somebody eventually removes from `npm run build`. So it cannot see an element
 * left at opacity 0 by a specificity fight, an inline style written by a script
 * at runtime, or a transition that happens to look like a reveal. What it CAN
 * see is every way one has ever been WRITTEN in this repository, which is the
 * property that stops the pattern coming back in a component nobody has
 * created yet.
 *
 * It also cannot tell whether motion.css is actually imported. That is one line
 * in Base.astro and it is asserted by rule 1's own allow-list being empty of
 * alternatives rather than by a check; if somebody deletes the import, every
 * route loses its arrival silently. Recorded in ADR 0004 as a known gap.
 *
 * MOTION_SRC overrides the directory scanned, so the gate can be proved to fail
 * against a scratch copy without touching the tree another agent is editing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = process.env.MOTION_SRC || path.join(ROOT, 'src');

/** The one file allowed to own the arrival. */
const HOME = 'src/styles/motion.css';

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LIST — every entry is a decision somebody has to defend.
 *
 * Keys are `<rule>  <file>  <what>`, matched case-insensitively and WITHOUT
 * line numbers, because a line number drifts every time somebody edits the file
 * above it and an exemption that silently stops matching is how the next real
 * violation gets waved through.
 *
 * DELETE AN ENTRY THE MOMENT IT STOPS BEING TRUE.
 * ══════════════════════════════════════════════════════════════════════════ */
const ALLOWED = new Map([
  /* ── 1 TIMELINE ──────────────────────────────────────────────────────────
   *
   * Two scroll-driven systems existed before motion.css did, and neither was
   * found by reading the code: this gate found them on its first run. Both are
   * recorded as DEBT rather than as design, because "there are three files that
   * drive the page off the scroll position" is the exact sentence the charter
   * says must never be true, however good each one is on its own. */
  ['timeline  src/styles/tokens.css  animation-timeline:',
   'DEBT: the [data-field] ambient parallax, tokens.css:1161. A scroll-driven timeline outside motion.css, which is what this rule forbids. It is not a second arrival — it moves an aria-hidden blurred field and never content — and it paints NOTHING today, because both fields resolve from --orb-violet and --orb-teal and the owner set both to `none` on 2026-08-03. So the whole block is currently a scroll timeline driving an invisible object. It belongs in motion.css with the rest of the scroll-driven work; ADR 0004 names the move. Not done in this pass because tokens.css was being edited by another agent'],
  ['timeline  src/styles/tokens.css  view()',
   'DEBT: the timeline function of the entry above, and its @supports guard. Moves with it'],

  ['timeline  src/pages/about.astro  animation-timeline:',
   'DEBT: the trust-row dots, about.astro:946-962. A NAMED view timeline (--trust-row) driving six ::before dots through a five-step stagger, written for the right reason — the design sheet asked for an IntersectionObserver and the author refused it as the one-off JavaScript the charter forbids — and it is nonetheless a second scroll-driven system with its own ranges, its own stagger arithmetic and its own fallback argument. motion.css now owns exactly those three things. The dots themselves are a legitimate figure that the central arrival does not replace, so the correct fix is to lift the RANGES and the stagger step onto the shared custom properties, not to delete the effect'],
  ['timeline  src/pages/about.astro  view-timeline-name:',
   'DEBT: names the timeline for the entry above. Moves with it'],
  ['timeline  src/pages/about.astro  view-timeline-axis:',
   'DEBT: names the axis for the entry above. Moves with it'],
  ['timeline  src/pages/about.astro  animation-range:',
   'DEBT: the five staggered ranges for the entry above, hand-written as 12/17/22/27/32% against motion.css computing the same shape from --arrive-item-step. Moves with it'],

  /* ── 2 ENTRANCE ──────────────────────────────────────────────────────────*/
  ['entrance  src/pages/about.astro  @keyframes chip-in',
   'DEBT, AND THE WORST FINDING IN THIS LIST. `from { opacity: 0; transform: translateY(12px) }` on the four role chips at about.astro:373, staggered 0.1 of a beat apart. That is content animated from FULLY INVISIBLE, which is the pattern that left 4 of 9 legacy homepage sections permanently hidden and then failed the axe gate a second time in the rebuild. It is safer than those were, because it is time-based with `both` fill and no observer, so it cannot fail to fire — but it is the same shape, it is on a live route today, and the central arrival never goes below 0.35. Delete chip-in and let the chips inherit; that is a two-line change to a file this pass was not allowed to touch'],
  ['entrance  src/pages/about.astro  @keyframes bloom-in',
   'the hero key light on /about: two aria-hidden blurred blooms rising from 0.55 alpha on load. It is not content, it cannot be read, and 0.55 is above the central floor of 0.35 anyway. It is a LIGHT arriving rather than a block arriving, and motion.css deliberately owns only the second. Kept as design; the only thing wrong with it is that its 0.55 is written here rather than beside --arrive-floor'],
  ['entrance  src/pages/about.astro  @keyframes dot-settle',
   'the trust-row dot itself, from 0.4 alpha and no glow to its shipped state. A 6px mark, aria-hidden, and the fallback is the settled dot rather than the dim one, so a browser without the timeline shows the finished mark. Same argument as bloom-in: a mark settling is not a block arriving. It is listed under DEBT above only for the TIMELINE it hangs on, not for this'],
  ['entrance  src/components/sections/ReasoningTrace.astro  @keyframes rt-drop',
   'the dropped figure on the homepage reasoning trace: an 8px displacement with a slight overshoot on the refusal box, at the beat the light reaches Ground. It is the section ARGUING — a figure being dropped is the content, not a way of introducing it — and it runs once, never loops, which is Rule 04 on refusals. It travels 8px and settles, so this rule catches it correctly and the answer is that it is not an entrance'],

  /* ── 3 OBSERVER ──────────────────────────────────────────────────────────
   *
   * ONE IDEA, THREE COPIES, AND THE GATE IS HOW THAT BECAME VISIBLE. The
   * `data-lit` trigger is written three times: once properly in
   * src/scripts/motion.ts, and twice more as a byte-identical inline script in
   * two page files. That is the duplication the charter forbids, and none of
   * the three files says the other two exist. */
  ['observer  src/scripts/motion.ts  IntersectionObserver',
   'the `data-lit` trigger, and the one copy of it that should survive. It does not reveal content: it sets data-lit="on" once on a wrapper whose only job is to start ambient light-field loops, every one of them aria-hidden and behind the text. Rest state is final state, so if it never fires the page is complete and merely still. That is the exact inversion of the sv-reveal pattern rather than a smaller dose of it. If it ever gates something a reader has to read, it becomes a violation'],
  ['observer  src/pages/crowmark.astro  IntersectionObserver',
   'DEBT: a second, inline, byte-identical copy of the `data-lit` trigger above, at crowmark.astro:885. Same fifteen lines, same threshold of 0.25, same unobserve. The stated reason is payload — an is:inline script avoids a module request on a route already at 97 KB against a 100 KB budget — which is a real argument for INLINING and not an argument for a second implementation. It should import the shared one or the shared one should be inlined by the layout for every route'],
  ['observer  src/pages/crowmark-buyers.astro  IntersectionObserver',
   'DEBT: the THIRD copy of the same fifteen lines, at crowmark-buyers.astro:720. Identical to the crowmark.astro copy including its comment. Two pages carrying private copies of one trigger is how eleven motion systems started on the legacy site'],
  ['observer  src/components/sections/ReasoningTrace.astro  IntersectionObserver',
   'DEBT: a FOURTH observer, and a different one — not the data-lit trigger but a private count-up on the worked sum, ReasoningTrace.astro:371-395. It is carefully built: it parses the target from the DOM so the number can never disagree with the markup, it returns early under reduced motion, and if it never runs the figure is already correct. Two things are still wrong with it. It is a second observer on the SAME route as motion.ts, which already has one and could carry this. And a count-up is the primitive motion.ts deleted rather than ported, on the grounds that MarketShape.astro forbids one on its four figures BY NAME because the legacy build animated them from zero. The same argument reaches this figure'],
]);

/* ══════════════════════════════════════════════════════════════════════════
 * READING THE SOURCE
 * ══════════════════════════════════════════════════════════════════════════ */

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/* Relative to SRC, not to ROOT, so a path is identical whether the gate is run
   normally or pointed at a scratch copy through MOTION_SRC. Allow-list keys
   therefore mean the same thing in both, which is what makes the failure proof
   in ADR 0004 a proof of THIS gate rather than of a lookalike. */
const rel = (f) => 'src/' + path.relative(SRC, f).split(path.sep).join('/');
const lineAt = (text, index) => text.slice(0, index).split('\n').length;

/**
 * Blank every comment, keeping the byte count so line numbers stay true.
 *
 * This is not cosmetic. motion.css's own header explains the observer defect at
 * length and names `IntersectionObserver`, `opacity: 0` and `.is-visible` while
 * doing so; a scanner that reads prose would report the file that exists to
 * prevent the defect as committing it. Every rule below reads `code` only.
 */
function stripComments(src, isAstro) {
  /* NEWLINES SURVIVE. Blanking a multi-line comment with `' '.repeat(m.length)`
     eats its line breaks and every line number reported after it is wrong — the
     first run of this file reported about.astro's view timeline at line 715
     when it is at 946. Replace every character EXCEPT the newlines. */
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  let out = src.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (isAstro) out = out.replace(/^[ \t]*\/\/.*$/gm, blank);
  return out;
}

/** {file, raw, code, isAstro} for every source file that can carry motion. */
const files = walk(SRC)
  .filter((f) => /\.(css|astro|ts|js)$/.test(f))
  .sort()
  .map((f) => {
    const raw = fs.readFileSync(f, 'utf8');
    const isAstro = /\.(astro|ts|js)$/.test(f);
    return { file: rel(f), raw, code: stripComments(raw, isAstro), isAstro };
  });

const violations = [];
const recorded = [];
const seenKeys = new Set();
const counts = { timeline: 0, entrance: 0, observer: 0, reveal: 0 };

function report(rule, file, what, detail) {
  counts[rule]++;
  const key = `${rule}  ${file}  ${what}`;
  const why = ALLOWED.get(key.toLowerCase()) ?? ALLOWED.get(key);
  if (why !== undefined) {
    seenKeys.add(key.toLowerCase());
    recorded.push({ rule, file, what, why });
    return;
  }
  violations.push({ rule, file, what, detail, key });
}

/* ══════════════════════════════════════════════════════════════════════════
 * RULE 1 — ONE SCROLL TIMELINE, AND IT LIVES IN motion.css
 * ══════════════════════════════════════════════════════════════════════════ */

const TIMELINE = /\b(animation-timeline|scroll-timeline(?:-name|-axis)?|view-timeline(?:-name|-axis|-inset)?|timeline-scope|animation-range(?:-start|-end)?)\b\s*:|(?<![\w-])(?:view|scroll)\(\s*\)/g;

for (const f of files) {
  if (f.file === HOME) continue;
  const seen = new Set();
  for (const m of f.code.matchAll(TIMELINE)) {
    /* Keyed on the PROPERTY, not on the line it sits in. A file that declares
       one named timeline writes five or six of these across as many lines, and
       six allow-list entries for one decision would be six chances to stop
       reading them — and six keys that break the moment somebody reformats. */
    const what = (m[1] ? `${m[1]}:` : m[0]).trim();
    if (seen.has(what)) continue;
    seen.add(what);
    report('timeline', f.file, what,
      `a scroll-driven timeline outside ${HOME} (first at line ${lineAt(f.code, m.index)})`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * RULE 2 — AN ENTRANCE IS AN ENTRANCE WHATEVER IT IS CALLED
 *
 * The test is behavioural rather than nominal, because naming is the one thing
 * a developer writing a private reveal will always get "right": the legacy one
 * was called `sv-reveal`, the rebuild's was called `step-in`, and a third would
 * be called something else again.
 *
 * A block is an entrance when EITHER
 *   its first offset sets opacity below 1 and it ends at 1, OR
 *   its first offset TRANSLATES and it ends at zero translation.
 *
 * A block whose first and last offsets AGREE is a loop and is left alone. That
 * is what every legitimate figure on this site is: m-drift scales 1 -> 1.04
 * alternating, m-arrive goes 1 -> 1.09 -> 1, and every travelling light crosses
 * from one edge to the other without resolving to identity.
 *
 * ── AN IMPLICIT END IS STILL AN END ─────────────────────────────────────────
 *
 * `@keyframes chip-in { from { opacity: 0; transform: translateY(12px) } }` has
 * ONE block and no `to` at all, and it is the most complete example of the
 * forbidden pattern in this repository: four content chips on /about animated
 * from fully invisible. The first version of this rule required two offsets and
 * walked straight past it. A missing `to` is not the absence of an end state,
 * it is the element's OWN state, which is the resting state by definition — so
 * a `from`-only block is an entrance whenever its `from` is away from rest.
 *
 * ── TRANSLATE IS AN ARRIVAL; SCALE IS A DRAWING ─────────────────────────────
 *
 * Deliberately narrower than "any transform resolving to identity", and the
 * line is drawn where the meaning changes rather than where the syntax does.
 * `scaleX(0) -> scaleX(1)` on a 2px rule is a bar being DRAWN: the element has
 * no resting size to be missing from, and the four such figures on /crowmark
 * (cw-fill, cw-grow, cw-tick, cw-rise) are diagrams of a process, not content
 * that failed to appear. Flagging them would put four permanent entries on the
 * allow-list and teach the next reader that the list is where findings go to be
 * dismissed. A TRANSLATE is different in kind: the element is fully drawn and
 * is somewhere it does not belong, which is the arrival this file centralises.
 * ══════════════════════════════════════════════════════════════════════════ */

/** Does the value contain a translation of anything other than zero? */
function hasTranslation(value) {
  if (!value) return false;
  for (const m of value.matchAll(/\btranslate[XYZ3d]*\(([^)]*)\)/gi)) {
    if (m[1].split(',').some((a) => parseFloat(a) !== 0 && !Number.isNaN(parseFloat(a)))) return true;
  }
  if (/\btranslate\s*:/.test(value)) return true;
  return false;
}

for (const f of files) {
  if (f.file === HOME) continue;
  /* @keyframes <name> { ... }, matched by brace balance rather than by regex,
     because a keyframe body contains braces and a non-greedy match would stop
     at the first one. */
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(f.code))) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < f.code.length && depth > 0) {
      if (f.code[i] === '{') depth++;
      else if (f.code[i] === '}') depth--;
      i++;
    }
    const body = f.code.slice(m.index + m[0].length, i - 1);
    const name = m[1];
    const line = lineAt(f.code, m.index);

    /* Each offset block in source order. `from` is 0% and `to` is 100%. */
    const stops = [];
    const sre = /([^{}]+)\{([^{}]*)\}/g;
    let s;
    while ((s = sre.exec(body))) {
      const sel = s[1].trim().toLowerCase();
      const pcts = [...sel.matchAll(/(-?[\d.]+)%/g)].map((x) => +x[1]);
      const at = sel.includes('from') ? 0 : sel.includes('to') ? 100 : pcts.length ? Math.min(...pcts) : null;
      if (at === null) continue;
      const grab = (prop) =>
        ((s[2].match(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`, 'i')) || [])[1] || '').trim();
      stops.push({ at, opacity: grab('opacity'), transform: grab('transform') });
    }
    if (!stops.length) continue;
    stops.sort((a, b) => a.at - b.at);
    const first = stops[0];
    /* The end is the last written offset, or — when there is none — the
       element's own resting state, which is opacity 1 and no translation. */
    const last = stops.length > 1 ? stops[stops.length - 1] : { opacity: '', transform: '' };
    if (first.at > 0) continue; // starts mid-timeline: a phase, not an entrance

    const opacityEntrance =
      first.opacity !== '' &&
      !first.opacity.includes('var(') &&
      parseFloat(first.opacity) < 1 &&
      (last.opacity === '' || parseFloat(last.opacity) === 1);

    const travelEntrance = hasTranslation(first.transform) && !hasTranslation(last.transform);

    if (opacityEntrance || travelEntrance) {
      report('entrance', f.file, `@keyframes ${name}`,
        `${opacityEntrance ? `opacity ${first.opacity} -> ${last.opacity || '1 (the element itself)'}` : ''}${
          opacityEntrance && travelEntrance ? ' and ' : ''
        }${travelEntrance ? `transform ${first.transform} -> ${last.transform || 'none (the element itself)'}` : ''}` +
        ` resolves to the resting state, which is an entrance. Line ${line}`);
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * RULE 3 — NO OBSERVER DRIVES APPEARANCE
 * ══════════════════════════════════════════════════════════════════════════ */

for (const f of files) {
  if (!f.isAstro) continue;
  if (/\bIntersectionObserver\b/.test(f.code)) {
    const idx = f.code.indexOf('IntersectionObserver');
    report('observer', f.file, 'IntersectionObserver',
      `arrival is geometry now, not an event (line ${lineAt(f.code, idx)})`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * RULE 4 — NO REVEAL-STATE CLASS
 *
 * MATCHED AS A CLASS, NEVER AS A WORD, and that is a correction rather than
 * caution. The first version matched the bare token anywhere in the source and
 * reported two findings that were English: "Higher-value notices APPEAR on Find
 * a Tender" in a glossary definition, and "before the contract is ENTERED into"
 * in a PPN 002 source note. A gate that reports prose as a defect is a gate
 * people learn to ignore. So a hit needs one of two shapes:
 *
 *   .is-visible          a class selector in a stylesheet
 *   classList.add('..')  a class being written by script
 *
 * `.reveal-panel` is caught by the first; `.revenue` is not, because the token
 * has to end at a class-name boundary.
 * ══════════════════════════════════════════════════════════════════════════ */

const REVEAL_WORDS =
  'is-visible|in-view|is-inview|revealed|reveal|animate-in|animate-on-scroll|fade-in|fade-up|slide-up|scroll-reveal|has-entered|sv-reveal|js-reveal|aos-init';
const REVEAL_SELECTOR = new RegExp(`\\.(${REVEAL_WORDS})(?![\\w-])`, 'g');
const REVEAL_SCRIPT = new RegExp(
  `(?:classList\\s*\\.\\s*(?:add|toggle|remove)|className\\s*[+]?=|setAttribute\\s*\\(\\s*['"\`]class)[^;\\n]*?['"\`\\s](${REVEAL_WORDS})(?![\\w-])`,
  'g'
);

for (const f of files) {
  if (f.file === HOME) continue;
  const seen = new Set();
  for (const re of [REVEAL_SELECTOR, REVEAL_SCRIPT]) {
    for (const m of f.code.matchAll(re)) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      report('reveal', f.file, `"${m[1]}"`,
        `a reveal-state class is the CSS half of hide-then-reveal (line ${lineAt(f.code, m.index)})`);
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT
 * ══════════════════════════════════════════════════════════════════════════ */

const homeExists = fs.existsSync(path.join(SRC, 'styles/motion.css'));
console.log(
  `motion: ${files.length} source file(s) scanned, arrival owned by ${HOME}${homeExists ? '' : ' — MISSING'}`
);
if (!homeExists) {
  console.error('motion: src/styles/motion.css does not exist. There is no central arrival to inherit.');
  process.exit(1);
}

if (recorded.length) {
  const isDebt = (x) => /^debt:/i.test(x.why.trim());
  const byKey = new Map();
  for (const x of recorded) {
    const k = `${x.rule}  ${x.file}  ${x.what}`;
    if (!byKey.has(k)) byKey.set(k, { ...x, n: 0 });
    byKey.get(k).n++;
  }
  const unique = [...byKey.values()];
  const design = unique.filter((x) => !isDebt(x));
  const debt = unique.filter(isDebt);
  const order = ['timeline', 'entrance', 'observer', 'reveal'];
  const print = (list) => {
    for (const rule of order) {
      for (const x of list.filter((y) => y.rule === rule)) {
        console.log(`    [${x.rule}] ${x.file}${x.n > 1 ? `  (x${x.n})` : ''}`);
        console.log(`            ${x.what}`);
        console.log(`            ${x.why}`);
      }
    }
  };
  if (design.length) {
    console.log(`\n  ${design.length} recorded exception(s), each with the argument for it:\n`);
    print(design);
  }
  if (debt.length) {
    console.log(`\n  ${debt.length} KNOWN DEBT — recorded, named, and still wrong:\n`);
    print(debt);
  }
}

const stale = [...ALLOWED.keys()].filter((k) => !seenKeys.has(k.toLowerCase()));
if (stale.length) {
  console.log(`\n  ${stale.length} allow-list entr(ies) matched nothing — delete them, the exception is gone:`);
  for (const k of stale) console.log(`    ${k}`);
}

if (violations.length) {
  const label = {
    timeline: `TIMELINE    a scroll-driven timeline may only be declared in ${HOME}`,
    entrance: 'ENTRANCE    a component may not define its own entrance; it inherits the central arrival',
    observer: 'OBSERVER    appearance is never driven by IntersectionObserver',
    reveal: 'REVEAL      no hide-then-reveal state class',
  };
  console.error(`\nmotion: ${violations.length} MOTION VIOLATION(S), NOT RECORDED\n`);
  for (const rule of ['timeline', 'entrance', 'observer', 'reveal']) {
    const group = violations.filter((v) => v.rule === rule);
    if (!group.length) continue;
    console.error(`  ${label[rule]}`);
    for (const v of group) {
      console.error(`    ${v.file}`);
      console.error(`        ${v.what}`);
      if (v.detail) console.error(`        ${v.detail}`);
    }
    console.error('');
  }
  console.error('  Delete it and let the element inherit the arrival from src/styles/motion.css,');
  console.error('  which every route already gets through <main> with no class and no opt-in. If it');
  console.error('  genuinely cannot, add the key below to ALLOWED in this file WITH THE REASON. A');
  console.error('  reason is a sentence somebody can disagree with, not a restatement, and if the');
  console.error('  honest reason is "this is wrong and is not being fixed today", say that and start');
  console.error('  it with DEBT: so it is counted as debt rather than as design.');
  console.error('');
  for (const key of new Set(violations.map((v) => v.key))) console.error(`    ['${key}', '...'],`);
  console.error('');
  process.exit(1);
}

console.log(
  `\n  clean: one arrival, ${HOME}, inherited by every route through <main>. No component`
);
console.log('  defines its own entrance, no scroll timeline is declared anywhere else, and no');
console.log('  appearance depends on an observer firing.');
process.exit(0);
