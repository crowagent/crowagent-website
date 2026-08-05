/**
 * check-controls.js — one response for every small control, asserted on the
 * rendered page and in the source that produced it.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * A-52. A hover audit counted 37 `:hover` rules under src/: 7 reached a central
 * definition, 17 were drawn-figure lighting, and 13 were hand-rolled. Read
 * together, ten of the thirteen were one object described ten times — a bordered
 * pill or circle below card scale that answers a pointer by stepping its wash
 * and brightening its hairline. styles/controls.css is now the one place that is
 * written; this is what stops an eleventh being invented next week.
 *
 * IT IS THE HOLE check-design-system.js RULE 3 LEAVES ON PURPOSE. That rule
 * separates a card from a chip by SIZE: a card radius is 12px or more, and
 * --radius-chip is 10px, so every control here is outside it by construction.
 * The file says so in as many words, and the last time something lived in that
 * gap a defect shipped through it — an 8px placeholder dot in an 18px icon slot,
 * which is why rule 6 exists. An exception in a gate is not a neutral act; it is
 * a place the gate has agreed not to look. This is the gate for that place.
 *
 * ── THE FIVE RULES ──────────────────────────────────────────────────────────
 *
 *   1 SOURCE      No file but styles/controls.css may write the control
 *                 response: a `:hover` rule declaring the wash (--c-card-hover)
 *                 or the hairline (--c-border-glow / --c-interactive on a
 *                 border). This is the only rule a careful hand-copy cannot
 *                 satisfy, which is the argument check-shared-blocks.js makes at
 *                 length: two byte-identical definitions render identically and
 *                 are still two definitions, and the next edit to either is a
 *                 coin toss.
 *
 *                 INK IS DELIBERATELY NOT A KNOB HERE. `color` moving to
 *                 --c-interactive on hover is what a text LINK does, and
 *                 styles/links.css owns that. A rule that counted it would fire
 *                 on every prose link on the site and be turned off within a
 *                 week, which is the failure mode of a gate that asserts
 *                 something adjacent to what it means.
 *
 *   2 RENDERED    Every `.control` in the build resolves its hovered wash,
 *                 hairline and ink to its OWN scope's --c-card-hover,
 *                 --c-border-glow and --c-text. Asserted against the tokens as
 *                 the element resolves them rather than against three fixed
 *                 colours, because layouts/Article.astro rebinds all three
 *                 inside `.art__pane` — the light reading pane, where the dark
 *                 palette measures 1.6:1 — and a gate that demanded the dark
 *                 values would be demanding an unreadable control.
 *
 *                 A DECLARATION IS WHAT AN AUTHOR TYPED; THIS IS WHAT A READER
 *                 SEES. Same distinction check-sheen.js and check-render.js were
 *                 written for, and it has already cost this site three rounds of
 *                 "the declarations are present" on a hover the owner could see
 *                 was wrong.
 *
 *                 AND THE WASH HALF OF IT CANNOT CURRENTLY FAIL ON THE DARK
 *                 PALETTE, WHICH IS STATED HERE RATHER THAN LEFT TO BE FOUND.
 *                 styles/tokens.css gives --c-card and --c-card-hover the SAME
 *                 value, `rgba(255, 255, 255, 0.05)`, so every control and every
 *                 card on the dark theme already renders its hovered wash at
 *                 rest. The assertion still says something true — that the
 *                 hovered value comes from the token rather than from a number
 *                 somebody typed — and it discriminates properly inside
 *                 `.art__pane`, where the two are rebound apart. But if that
 *                 wash is ever meant to STEP, the fix is one line in tokens.css
 *                 and this gate will not be the thing that tells you.
 *
 *   3 TARGET      Every `.control` renders at least 24px in both dimensions, at
 *                 1440 and at 390, and is an element a pointer can actually
 *                 activate. WCAG 2.2 SC 2.5.8, and it is here because the near
 *                 miss is on record: styles/labels.css notes that consolidating
 *                 the chip geometry would have taken `.art__pill` from 36px tall
 *                 to 27.8px as a side effect of making it consistent. A shared
 *                 recipe must never shrink a control, so this measures every one
 *                 of them on the page rather than trusting that it did not.
 *
 *                 The interactivity half is the other direction: `.control` on a
 *                 <span> is a page advertising an affordance that is not there,
 *                 which is exactly what styles/surfaces.css refuses the card
 *                 lift for.
 *
 *   4 REDUCE      Under `prefers-reduced-motion: reduce`, hovering a `.control`
 *                 leaves its transform at identity. This is A-43 one scale down.
 *                 tokens.css honours the preference by collapsing --dur to
 *                 0.01ms, which removes the ANIMATION and leaves the
 *                 displacement — so a hover transform under `reduce` still moves
 *                 the control, it just moves it instantly. `.pcar__arrow` lifted
 *                 --lift-btn and was doing exactly that; check-sheen.js asserts
 *                 this for `.surface` and `.btn` and looks at nothing else.
 *
 *   5 FLOOR       Every rule above is satisfied trivially if `.control` stops
 *                 existing. So the gate states how many controls and how many
 *                 routes it expects and fails BELOW either. On this codebase a
 *                 gate that cannot fail is the normal failure rather than the
 *                 unusual one: check-facts.js once printed "every rule clean"
 *                 while crashing on its reporting path, so the clean result had
 *                 never executed the code that reports a violation.
 *
 * ── THE CONTRACT, WHICH IS THE ONE EVERY GATE HERE USES ─────────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on every
 * run. Exceptions matching nothing are reported as stale and fail the build.
 * Anything not listed fails.
 *
 * ── PROVED IN BOTH DIRECTIONS, 2026-08-04 ───────────────────────────────────
 *
 * See the report at the foot of the A-52 pass for the two exit codes. DS_DIST
 * points the gate at a scratch copy of dist so a failure can be exercised
 * without disturbing the tree another agent is working in, the same escape
 * check-design-system.js and check-sheen.js take.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = process.env.DS_DIST || path.join(ROOT, 'dist');

/** The one file allowed to write the response. */
const OWNER = 'src/styles/controls.css';

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LIST — every entry is a decision somebody has to defend.
 *
 * Keys are `<rule>  <file>  <selector>`, matched case-insensitively and keyed
 * WITHOUT line numbers for the reason check-design-system.js states: a line
 * number drifts every time somebody edits the file above it, and an exemption
 * that silently stops matching is how the next real violation gets waved
 * through.
 *
 * A reason beginning DEBT: is counted and printed separately, because "this is
 * wrong and is not being fixed today" is a different statement from "this is
 * right, and here is the argument".
 * ══════════════════════════════════════════════════════════════════════════ */
const ALLOWED = new Map([
  /* ── THE THREE OTHER CENTRAL DEFINITIONS ─────────────────────────────────
   *
   * Each of these IS the one definition of a different object. They are listed
   * rather than exempted by filename so that a SECOND rule appearing in any of
   * them still fails: what is excused here is one selector, not a file. */
  ['response  src/styles/surfaces.css  .surface:hover, .surface:focus-within',
   'THE CARD. A card is above the 12px radius threshold and carries --blk-pad, a specular top-light, a travelling sheen and a 2px lift; a control is below it and carries none of those. They step the same wash because they sit in the same light, not because they are the same object — and routing a 44px carousel arrow through `.surface` was the obvious wrong answer this whole pass exists to avoid'],
  ['response  src/styles/surfaces.css  a.prose-card:hover, a.prose-card:focus-visible',
   'THE CARD, reached by a markdown-authored block that cannot be given a class from a stylesheet. Same recipe and the same argument as the entry above; surfaces.css records why it needs a second selector rather than a second definition'],
  ['response  src/components/ui/Button.astro  .btn:hover:not(:disabled)',
   'THE BUTTON, which is a control that has been argued into being louder rather than a fork of this one. It scales 1.05, lifts, sweeps a band across its face and carries a magnetic lean, none of which is available below it; Button.astro states each of those against a measurement. What it shares with `.control` is the hairline token, which is the system working'],
  ['response  src/styles/motion.css  main tbody tr:hover',
   'THE TABLE ROW. It steps the same wash and it is not a control: there is no border to brighten, no target to hit and nothing to activate — a row lights up so the eye can hold its place across a wide table. Central already, in the file that owns every other pointer response that is not a component'],

  /* ── THE KEPT DISTINCTIONS ───────────────────────────────────────────────
   *
   * Three of the original thirteen, each measured against the shared treatment
   * and each kept because it is a different object rather than a different
   * opinion about the same one. Consolidating these would have been the easy
   * way to a smaller number and the wrong answer. */
  ['response  src/components/nav/NavDropdown.astro  .ca-mega-item:hover, .ca-mega-item:focus-visible',
   'A ROW IN A FLOATING MENU, WHICH HAS NO BOX AT REST. It draws no wash and no hairline until the pointer arrives, so there is nothing for the shared treatment to brighten — what happens is the PANEL lighting one of its rows, not a control lighting its own edge. Giving eight menu rows a teal hairline each would be a new design rather than a consolidation. It already shares what can be shared: the wash is --c-card-hover, the same token'],
  ['response  src/components/sections/BothSides.astro  .bs__station:hover .bs__chip',
   'A LABEL ON A DRAWN FIGURE, and it is driven by the STATION hovering rather than by the chip. It comes forward on --c-lit with --shadow-ladder rather than stepping to --c-card-hover, which is the raised-label recipe `.lc__stage` uses on the lifecycle ring, and it is not a target: there is nothing to click and nothing to activate. It is in the same family as the 17 filter/text-shadow rules that light parts of these diagrams, which are deliberately out of scope — folding a diagram into a control treatment flattens the diagram'],
  ['response  src/components/sections/ReasoningTrace.astro  .rt__tally-row:hover',
   'A TABLE ROW IN A DRAWN FIGURE. It brightens ONE EDGE — border-bottom-color, the rule under the row — which is the tally reading as a ledger rather than as a set of controls. A four-sided hairline would turn each row of a proof into something that looks pressable, and none of them is'],
  ['response  src/layouts/Legal.astro  .legal__toc a:hover',
   'A MARKER ON A NAVIGATION RAIL, and it is the fourteenth rule rather than one of the thirteen: the audit that opened A-52 did not see it, and this gate did on its first run, which is the difference between a sweep and a rule. It brightens ONE EDGE — a 2px border-left that is transparent at rest — so what the reader sees is a position on the rail filling in beside the clause they are pointing at, in the same shape as the sticky rail marking where they ARE. The shared treatment would put a four-sided pill round every clause in a table of contents and lose the rail entirely'],

  /* ══════════════════════════════════════════════════════════════════════════
   * KNOWN DEBT — EMPTY, AND KEPT AS A HEADING RATHER THAN DELETED.
   *
   * It held one entry: `.ca-search-trigger:hover` in Nav.astro, the eleventh
   * copy, recorded as DEBT on 2026-08-04 because that file belonged to another
   * agent while A-52 ran. It was folded in later the same day — `control` in the
   * class list, four declarations deleted, the geometry left where it was — and
   * the entry went with it. Nothing about the object turned out to be different;
   * it was a scheduling constraint and it is gone.
   *
   * The heading stays because the machinery does: a reason beginning DEBT: is
   * still counted and printed apart from the arguments, and the next honest "this
   * is wrong and is not being fixed today" belongs here rather than disguised as
   * a decision in the block above.
   * ════════════════════════════════════════════════════════════════════════ */
]);

/* ── THE FLOOR (rule 5) ─────────────────────────────────────────────────────
 *
 * Measured on the build this gate was written against, then set BELOW the
 * measurement rather than at it, so adding a control never fails the build and
 * deleting the treatment always does. */
const FLOOR = { controls: 12, routes: 4, ownerRules: 2 };

/* ══════════════════════════════════════════════════════════════════════════
 * SOURCE
 * ══════════════════════════════════════════════════════════════════════════ */

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

/**
 * Every CSS rule in the project's own stylesheets, as {file, line, selector,
 * decls}. Lifted from check-design-system.js deliberately rather than reinvented
 * — the innermost-block regex is what makes it correct inside @media without
 * needing to understand @media, and comments are BLANKED rather than removed so
 * every index still maps to a real line in a file somebody has to open.
 */
function cssRules() {
  const out = [];
  for (const file of walk(SRC).filter((f) => /\.(css|astro)$/.test(f)).sort()) {
    const raw = fs.readFileSync(file, 'utf8');
    const blocks = [];
    if (file.endsWith('.css')) {
      blocks.push({ text: raw, offset: 0 });
    } else {
      /* Astro frontmatter is JavaScript and can hold the string "<style>". */
      const fm = raw.startsWith('---') ? raw.indexOf('\n---', 3) : -1;
      const body = fm > 0 ? raw.slice(fm) : raw;
      const base = fm > 0 ? fm : 0;
      for (const m of body.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        blocks.push({ text: m[1], offset: base + m.index + m[0].indexOf(m[1]) });
      }
    }
    for (const b of blocks) {
      const text = b.text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
      const re = /([^{}@]+)\{([^{}]*)\}/g;
      let m;
      while ((m = re.exec(text))) {
        const selector = m[1].trim().replace(/\s+/g, ' ');
        if (!selector || selector.startsWith('@')) continue;
        out.push({
          file: rel(file),
          /* Measured to the first non-space character of the SELECTOR, not to
             the start of the match. The match starts wherever the previous rule
             ended, so it swallows the newline before the selector and reports
             the line above it — which sends a reader to the closing brace of
             something else. Found by the rule-1 failure proof, where a probe on
             line 2 was reported on line 1. */
          line: raw.slice(0, b.offset + m.index + (m[1].length - m[1].trimStart().length)).split('\n').length,
          selector,
          decls: m[2],
        });
      }
    }
  }
  return out;
}

const violations = [];
const recorded = [];
const seenKeys = new Set();

function report(rule, where, what, detail) {
  const key = `${rule}  ${where}  ${what}`;
  const why = ALLOWED.get(key.toLowerCase()) ?? ALLOWED.get(key);
  if (why !== undefined) {
    seenKeys.add(key.toLowerCase());
    recorded.push({ rule, where, what, why });
    return;
  }
  violations.push({ rule, where, what, detail });
}

/* ── RULE 1: THE RESPONSE IS WRITTEN ONCE ───────────────────────────────────
 *
 * The wash and the hairline, and nothing else. See the header for why ink is
 * not one of the signals: a `color` move to --c-interactive is a text link, and
 * a rule that counted it would fire on every link on the site.
 */
const WASH = /(?:^|[;{\s])background(?:-color|-image)?\s*:[^;}]*var\(\s*--c-card-hover\s*\)/i;
const HAIRLINE = /(?:^|[;{\s])border(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?(?:-color)?\s*:[^;}]*var\(\s*--c-(?:border-glow|interactive)\s*\)/i;

const rules = cssRules();
let ownerRules = 0;

for (const r of rules) {
  if (r.file === OWNER) {
    if (/:hover/.test(r.selector) || /^\.control\b/.test(r.selector)) ownerRules++;
    continue;
  }
  if (!/:hover/.test(r.selector)) continue;
  const knobs = [];
  if (WASH.test(r.decls)) knobs.push('the wash (--c-card-hover)');
  if (HAIRLINE.test(r.decls)) knobs.push('the hairline (--c-border-glow)');
  if (!knobs.length) continue;
  report('response', r.file, r.selector,
    `declares ${knobs.join(' and ')} on hover at line ${r.line}. That is the control response, and ${OWNER} is where it is written`);
}

if (ownerRules < FLOOR.ownerRules) {
  violations.push({
    rule: 'floor', where: OWNER, what: `${ownerRules} rule(s)`,
    detail: `the owning stylesheet declares ${ownerRules} rule(s) for .control, and every rendered rule below passes trivially if the treatment does not exist. Needs at least ${FLOOR.ownerRules}`,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * RENDERED
 * ══════════════════════════════════════════════════════════════════════════ */

const server = await serveDist(DIST, 'controls',
  'Rules 2 to 4 measure the rendered page, so they need one.');

/** Every built route that renders at least one `.control`. */
function controlRoutes() {
  const out = [];
  for (const f of walk(DIST).filter((f) => f.endsWith('.html'))) {
    if (!/class="[^"]*\bcontrol\b/.test(fs.readFileSync(f, 'utf8'))) continue;
    const r = '/' + path.relative(DIST, f).split(path.sep).join('/');
    out.push(r.replace(/index\.html$/, ''));
  }
  return out.sort();
}

const url = (route) => server.url(route);

const routes = controlRoutes();
const preflight = [];
const results = [];
const rec = (probe, name, pass, detail) => results.push({ probe, name, pass, detail });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/**
 * `load` is not enough: a web font still resolving reflows the row a control
 * sits in, and a box read before the reflow is a box the pointer will miss.
 */
async function open(p, route) {
  await p.goto(url(route), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
}

/**
 * Put the pointer on the element and confirm it landed.
 *
 * check-sheen.js records why the confirmation is not optional: a bounding box is
 * read at one instant and the pointer moved at the next, and anything that
 * reflows in between leaves the probe measuring a control nobody is touching —
 * which reports as "nothing changed", the same false clean a hidden tab gives.
 */
async function hover(p, selector) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const box = await p.locator(selector).boundingBox();
    if (!box) return false;
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await p.waitForTimeout(60);
    const on = await p.evaluate((s) => {
      const el = document.querySelector(s);
      return Boolean(el && el.matches(':hover'));
    }, selector);
    if (on) return true;
    await p.mouse.move(0, 0);
    await p.waitForTimeout(80);
  }
  return false;
}

/* Every distinct control signature seen, so the run always says what it looked
   at rather than reporting a count nobody can check. */
const signatures = new Map();
let controlsSeen = 0;
let routesWithControls = 0;

for (const route of routes) {
  await open(page, route);
  await page.waitForTimeout(150);

  /* ── RULE 3: every control on the route, geometry and interactivity ────── */
  const census = await page.evaluate(() => {
    const INTERACTIVE = new Set(['A', 'BUTTON', 'SUMMARY', 'INPUT', 'SELECT', 'TEXTAREA']);
    return [...document.querySelectorAll('.control')].map((el, i) => {
      el.setAttribute('data-ctl', String(i));
      const r = el.getBoundingClientRect();
      return {
        i,
        sig: [...el.classList].filter((c) => !/^astro-/.test(c)).join('.'),
        tag: el.tagName.toLowerCase(),
        interactive: INTERACTIVE.has(el.tagName) || el.getAttribute('role') === 'button' || el.hasAttribute('tabindex'),
        /* A CONTROL THAT IS ALREADY ON IS NOT WHAT THIS MEASURES. The glossary
           filters are the case: `.gx-chip[aria-pressed='true']` fills with
           --c-interactive and inverts its ink, deliberately and at a higher
           specificity than the shared hover, so the selected chip answers a
           pointer by NOT changing — which is correct, and which a rule about
           the response would read as a missing response. Rule 2 probes an
           unselected one; rules 3 and 4 still measure every chip. */
        selected: ['aria-pressed', 'aria-selected', 'aria-current'].some(
          (a) => el.hasAttribute(a) && el.getAttribute(a) !== 'false'),
        w: Math.round(r.width),
        h: Math.round(r.height),
        /* A control the script has not switched on yet is display:none and has
           no box; measuring one would report a 0x0 target that is not on the
           page. The carousel arrows are the case. */
        shown: r.width > 0 && r.height > 0,
      };
    });
  });

  if (!census.length) continue;
  routesWithControls++;
  controlsSeen += census.length;

  for (const c of census) {
    if (!signatures.has(c.sig)) signatures.set(c.sig, { route, tag: c.tag, w: c.w, h: c.h });
    if (!c.interactive) {
      rec(`route ${route}`, 'a control is something a pointer can activate', false,
        `.${c.sig} is a <${c.tag}> with no role and no tabindex. A control treatment on an element that does nothing advertises an affordance the page does not have`);
    }
    if (c.shown && (c.w < 24 || c.h < 24)) {
      rec(`route ${route}`, 'SC 2.5.8: the target is at least 24px', false,
        `.${c.sig} renders ${c.w}x${c.h} at 1440`);
    }
  }

  /* ── RULE 2: the response, on one control of each signature ────────────── */
  const probed = new Set();
  for (const c of census) {
    if (!c.shown || c.selected || probed.has(c.sig)) continue;
    probed.add(c.sig);
    const SEL = `[data-ctl="${c.i}"]`;
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), SEL);
    await page.waitForTimeout(80);

    const rest = await page.evaluate((s) => {
      const el = document.querySelector(s);
      const cs = getComputedStyle(el);
      /* The tokens as THIS element resolves them. layouts/Article.astro rebinds
         all three inside `.art__pane`, so a fixed expected colour would be
         wrong on the light reading pane and right nowhere else. Normalised
         through a probe so `rgba(255,255,255,.05)` and the computed
         `rgba(255, 255, 255, 0.05)` are one string. */
      const probe = document.createElement('span');
      probe.style.display = 'none';
      el.appendChild(probe);
      const norm = (raw) => {
        probe.style.color = '';
        probe.style.color = raw.trim();
        return getComputedStyle(probe).color;
      };
      const want = {
        wash: norm(cs.getPropertyValue('--c-card-hover')),
        hairline: norm(cs.getPropertyValue('--c-border-glow')),
        ink: norm(cs.getPropertyValue('--ctl-ink-hover') || cs.getPropertyValue('--c-text')),
      };
      probe.remove();
      return { want, bg: cs.backgroundColor, border: cs.borderTopColor, ink: cs.color };
    }, SEL);

    if (!(await hover(page, SEL))) {
      preflight.push(`${route} .${c.sig}: the pointer could not be brought onto the control in three attempts, so nothing was hovered and nothing could be measured.`);
      continue;
    }
    /* ── READ WHEN IT HAS SETTLED, NOT AFTER A GUESS ────────────────────────
     *
     * A single `waitForTimeout(320)` against a 0.3s transition was the first
     * draft and it was wrong in both directions on the same run: the homepage
     * and /tools reported the REST colours as though the hover had never
     * happened, while /404 and eight blog routes reported the finished ones.
     * The difference is the section arrival — these controls sit in the final
     * CTA, which is still travelling when it is scrolled into view, and a
     * frame budget spent on that is a frame the colour transition has not had.
     * A fixed wait cannot be right for both, and the version that passes on
     * some routes and fails on others is the most expensive kind of gate.
     *
     * So it polls until two consecutive reads agree, and it re-asserts `:hover`
     * on every one of them: a value that stopped changing because the pointer
     * slipped off is a settled reading of the wrong thing. */
    let lit = null;
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(80);
      const now = await page.evaluate((s) => {
        const el = document.querySelector(s);
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, border: cs.borderTopColor, ink: cs.color, hovered: el.matches(':hover') };
      }, SEL);
      /* ── A SETTLE TEST NEEDS TO KNOW THE DIFFERENCE BETWEEN FINISHED AND NOT
       *    STARTED, AND A TIMER CANNOT TELL IT ─────────────────────────────
       *
       * Traced on /crowmark and /tools over four runs each: the transition is
       * declared at 0.3s and does not always BEGIN promptly. On one run in four
       * the border was still at its rest value 320ms after the pointer landed
       * and only reached the hovered value at about 400ms — the section arrival
       * and the image decode are on the same main thread, and the frames go to
       * them first. A fixed wait, and then a wait with a 320ms floor, both
       * passed on twelve routes and failed on the same one at random.
       *
       * So the loop waits for two consecutive equal reads AND for at least one
       * of the three properties to have LEFT its rest value. Two equal reads at
       * rest are "nothing has happened yet", not "it has settled".
       *
       * THIS IS NOT A LOOP THAT WAITS UNTIL IT PASSES. The hairline moves
       * --c-border -> --c-border-glow on every control here, so a control whose
       * response is genuinely missing never leaves rest, never satisfies the
       * condition, and is reported at the ceiling with its rest values — which
       * is exactly what the two failure proofs produced. The ceiling is 1.9s,
       * six times the declared duration. */
      const moved = lit && (now.bg !== rest.bg || now.border !== rest.border || now.ink !== rest.ink);
      if (moved && now.hovered && lit.bg === now.bg && lit.border === now.border && lit.ink === now.ink) {
        lit = now;
        break;
      }
      lit = now;
    }
    await page.mouse.move(0, 0);

    if (!lit.hovered) {
      preflight.push(`${route} .${c.sig}: the pointer left the control between the hover and the reading.`);
      continue;
    }

    /* "HOLDS AT", NOT "STEPS TO". A-63, 2026-08-04: styles/tokens.css binds
       --c-card-hover to --c-card, because live keeps the 5% white fill still
       under the pointer and lets the edge and the ink carry the state. The
       ASSERTION is unchanged and always was the right one — the hovered fill
       must be whatever --c-card-hover resolves to — but the sentence beside it
       described a step that does not happen, on every run, which is the kind of
       claim this suite exists to stop making. The two rules below it are the
       ones that move. */
    rec(`${route} .${c.sig}`, 'the wash holds at --c-card-hover', lit.bg === rest.want.wash,
      `${rest.bg} -> ${lit.bg}, token resolves to ${rest.want.wash}`);
    rec(`${route} .${c.sig}`, 'the hairline brightens to --c-border-glow', lit.border === rest.want.hairline,
      `${rest.border} -> ${lit.border}, token resolves to ${rest.want.hairline}`);
    rec(`${route} .${c.sig}`, 'the ink lifts to --c-text', lit.ink === rest.want.ink,
      `${rest.ink} -> ${lit.ink}, token resolves to ${rest.want.ink}`);
  }
}

/* ── RULE 3, again at 390 ───────────────────────────────────────────────────
 *
 * A target that clears 24px on a desktop and not on a phone is a target that
 * fails for the readers most likely to be aiming with a thumb. Separate pass
 * rather than a second viewport inside the loop above, because the response
 * probe needs a pointer and a narrow context is where `(hover: hover)` stops
 * being the honest thing to assert. */
const small = await browser.newContext({ viewport: { width: 390, height: 844 } });
const spage = await small.newPage();
for (const route of routes) {
  await open(spage, route);
  await spage.waitForTimeout(120);
  const tiny = await spage.evaluate(() =>
    [...document.querySelectorAll('.control')]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { sig: [...el.classList].filter((c) => !/^astro-/.test(c)).join('.'), w: Math.round(r.width), h: Math.round(r.height) };
      })
      .filter((c) => c.w > 0 && c.h > 0 && (c.w < 24 || c.h < 24)));
  for (const t of tiny) {
    rec(`route ${route} @390`, 'SC 2.5.8: the target is at least 24px', false, `.${t.sig} renders ${t.w}x${t.h}`);
  }
}
if (!routes.length) preflight.push('no built route renders a .control at all, so nothing above was measured.');

/* ── RULE 4: THE NEGATIVE ───────────────────────────────────────────────────
 *
 * A hover transform under `reduce` is not disabled by collapsing --dur; it is
 * applied instantly. So this asserts the control does not MOVE, not that it does
 * not animate. Different construction from check-sheen.js's A-43 assertion, same
 * guarantee, one scale down. */
const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rpage = await reduced.newPage();
for (const route of routes) {
  await open(rpage, route);
  await rpage.waitForTimeout(120);
  const first = await rpage.evaluate(() => {
    const el = [...document.querySelectorAll('.control')].find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!el) return null;
    el.setAttribute('data-ctl-rm', '');
    el.scrollIntoView({ block: 'center' });
    return { sig: [...el.classList].filter((c) => !/^astro-/.test(c)).join('.') };
  });
  if (!first) continue;
  const SEL = '[data-ctl-rm]';
  if (!(await hover(rpage, SEL))) {
    preflight.push(`reduce ${route}: the pointer could not be brought onto .${first.sig}.`);
    continue;
  }
  await rpage.waitForTimeout(300);
  const t = await rpage.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, SEL);
  await rpage.mouse.move(0, 0);
  rec(`reduce ${route}`, 'nothing moves under prefers-reduced-motion', t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)',
    `.${first.sig}: the hovered control's transform is ${t}`);
}

await browser.close();
server.close();

/* ── RULE 5: THE FLOOR ──────────────────────────────────────────────────── */
if (controlsSeen < FLOOR.controls) {
  violations.push({
    rule: 'floor', where: 'dist/', what: `${controlsSeen} control(s)`,
    detail: `every rendered rule above is satisfied by there being no controls. Needs at least ${FLOOR.controls}`,
  });
}
if (routesWithControls < FLOOR.routes) {
  violations.push({
    rule: 'floor', where: 'dist/', what: `${routesWithControls} route(s)`,
    detail: `the treatment is meant to be sitewide. Needs at least ${FLOOR.routes}`,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT
 * ══════════════════════════════════════════════════════════════════════════ */

const pad = (s, n) => String(s).padEnd(n);
console.log('\n' + '='.repeat(104));
console.log('CONTROLS — one response for every small control, measured at 1440 and 390 and under reduced motion');
console.log('='.repeat(104));

/* PRINTED ON EVERY RUN. An exception nobody re-reads becomes an accidental one. */
const debt = recorded.filter((r) => r.why.startsWith('DEBT:'));
const decisions = recorded.filter((r) => !r.why.startsWith('DEBT:'));
console.log(`\n  ${ALLOWED.size} recorded exception(s): ${decisions.length} matched decision(s), ${debt.length} matched debt`);
for (const r of [...decisions, ...debt]) {
  console.log(`    ${r.rule}  ${r.where}  ${r.what}`);
  console.log(`        ${r.why}`);
}

/* Lowercased on BOTH sides. It was compared raw against a lowercased set for
   the first run of this gate and reported six of its seven live entries as
   stale — every key carrying a capital letter, which is every key naming a
   .astro file. A stale report that is itself wrong is worse than none: it
   teaches the next reader that the stale column is noise. */
const stale = [...ALLOWED.keys()].filter((k) => !seenKeys.has(k.toLowerCase()));
if (stale.length) {
  console.log(`\n  ${stale.length} entr(ies) matched nothing:`);
  for (const k of stale) console.log(`    STALE  ${k}`);
}

console.log(`\n  ${controlsSeen} control(s) on ${routesWithControls} route(s), ${signatures.size} signature(s):`);
for (const [sig, s] of [...signatures].sort()) {
  console.log(`    ${pad(`.${sig}`, 42)} <${s.tag}> ${s.w}x${s.h} first seen on ${s.route}`);
}

console.log('');
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? ' PASS' : ' FAIL'}  ${pad(r.probe, 34)} ${pad(r.name, 44)} ${r.detail}`);
}
console.log('='.repeat(104));
console.log(`${results.length - failed}/${results.length} rendered assertion(s) passed`);

if (violations.length) {
  console.error(`\ncontrols: ${violations.length} unrecorded violation(s) in the source:\n`);
  for (const v of violations) {
    console.error(`  ${v.rule}  ${v.where}  ${v.what}`);
    console.error(`      ${v.detail}`);
  }
  console.error(
    `\n  Reach ${OWNER} by putting \`control\` in the class list, or add an entry to\n` +
    '  ALLOWED in this file with the argument for why this one is a different object.\n',
  );
}

/* A preflight failure is not a violation: it means the measurement never
   happened, and printing it beside a clean run is how "we could not look"
   becomes "we looked and it was fine". */
if (preflight.length) {
  console.error(`\ncontrols: ${preflight.length} preflight failure(s). NOTHING BELOW THEM WAS MEASURED:\n`);
  for (const p of preflight) console.error(`  ${p}`);
}

if (stale.length) {
  console.error(`\ncontrols: ${stale.length} allow-list entr(ies) matched nothing. The list may only shrink.\n`);
}

if (failed || violations.length || preflight.length || stale.length) process.exit(1);

console.log('\n  Every small control on the site steps one wash, brightens one hairline and lifts');
console.log('  its ink from one definition; every one of them clears 24px at 1440 and at 390;');
console.log('  and none of them moves under prefers-reduced-motion.\n');
