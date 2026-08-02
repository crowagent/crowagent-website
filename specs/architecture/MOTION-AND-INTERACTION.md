# Motion and Interaction — crowagent-website (Astro rebuild)

**Status:** living document, single source of truth for scroll/motion behaviour in
`astro/src/`. **Source file:** `astro/src/scripts/motion.ts` — the one motion system.
No other file in `astro/src/` implements an `IntersectionObserver`, a scroll listener,
or a `requestAnimationFrame` loop; every motion behaviour on the site is meant to run
through this one file.

**Read §5 before trusting that any of this is live.** The system described below is
fully written and, as code, matches every rule in this document — but as of
2026-08-02 it is not imported or called by any page or layout in `astro/src`, and no
component sets the `data-motion` attribute it depends on. This document describes the
system as it is written, and flags precisely where "written" and "wired in" diverge.

---

## 1. The defect this exists to prevent

`js/modules/sv-reveal.js` (the legacy system) was injected on every page by the nav.
It stamped `.sv-reveal` on every `main > section`, and a stylesheet rule set
`html.js-sv-reveal .sv-reveal { opacity: 0 }`. Content therefore started **invisible**
and depended on an `IntersectionObserver` firing to become visible.

Measured on the homepage (`motion.ts:16-17`, corroborated in full by
`migration/JS-AUDIT.md` §4, commit `c0fd0736`):

| Condition | Sections hidden (of 9) |
|---|---:|
| No scroll, wait 8s | 0 |
| Scroll through the whole page (a normal read) | **4** |
| Full-page capture | 7 |

The middle row is the one that matters: scrolling, the normal way a person reads a
page, left four sections permanently invisible.

An observer fails to fire more often than it looks. All of these are real
(`motion.ts:19-25`):

- a full-page screenshot, which resizes the viewport in one step
- an anchor jump straight past an element
- a restored scroll position on reload
- printing
- any element already on screen at load, in some browsers
- the element being inside a container that never scrolls

**This was not a one-off.** `migration/JS-AUDIT.md` §4 documents a second,
independent instance of the exact same hide-then-reveal pattern in
`sovereign-transformation-v2.js`, which stuck 20/20 cards on `crowmark.html`, 13/13 on
`about.html` and 9/9 on `contact.html` at `opacity: 0` for the same structural reason
(`gsap.from()` with `immediateRender: true`, dependent entirely on a
`ScrollTrigger` that did not fire). Two unrelated implementations of "fade up on
scroll" independently produced the same class of permanently-invisible-content bug —
the strongest evidence that the bug is inherent to the pattern (hide first, reveal on
observer), not to either specific implementation.

### 1.1 The legacy tree ran eleven overlapping systems

`MODERNISATION-ARCHITECTURE.md:20` states "eleven, not the seven first counted."
`migration/JS-AUDIT.md` §3 names all eleven directly:

1. `sv-reveal.js` — sitewide `main > section` fade-up, the incident above
2. `reveal-failsafe.js` — a failsafe written for *other* systems' failures (5 pages)
3. `section-motion-choreography.js` — GSAP `ScrollTrigger` stagger (same 5 pages)
4. `sticky-storytelling.js` — GSAP pin+scrub (dead, zero live targets)
5. `section-parallax.js` — decorative parallax (dead, zero live targets)
6. `hero-parallax.js` — cursor-driven glow drift on `.hero` (universal, injected)
7. `magnetic-pull.js` — cursor-follow on `[data-magnetic]` (7 pages)
8. `motion-system.js` — `window.caMotion`, dead, zero live targets
9. `sovereign-transformation-v2.js`'s own bundled scroll-reveal + parallax + magnetic
   (not named in the original task count, but live on all 33 "legacy" pages)
10. `nebula-home.js` — a fourth independent reveal implementation (9 "nebula" pages)
11. `roadmap-reveal.js` — a fifth, page-scoped reveal implementation (`roadmap.html`
    only, which as a result runs 4 concurrent reveal systems on one page)

Six primitives, one file, replace all eleven.

---

## 2. The six primitives

Declared as a type union in `motion.ts:47`:

```ts
type Primitive = 'reveal' | 'parallax' | 'sticky' | 'counter' | 'magnetic' | 'sequence';
```

Selected via a single attribute, `[data-motion]` (`motion.ts:49`), with the kind read
from `el.dataset.motion`.

| Primitive | What it does | Implementation in `motion.ts` |
|---|---|---|
| `reveal` | Fade/translate an element in once it nears the viewport | Handled entirely by the shared observer + failsafe (§3) — no dedicated branch in `initMotion()`; being included in the `[data-motion]` query and resolved to `motionState: 'in'` **is** the reveal |
| `parallax` | Transform tied continuously to scroll position | `initMotion()` pushes the element into the shared `scrollDriven` array (§4), speed from `data-motion-speed` (default `40`) |
| `sequence` | A scroll-scrubbed sequence of steps | **Currently shares the exact same code path as `parallax`** — pushed into the same `scrollDriven` array, same `translate3d` write. There is no behavioural distinction between the two primitives in the code today (see §5.2) |
| `sticky` | Pin an element and scrub through steps as the user scrolls past it | **No dedicated implementation exists.** `initMotion()`'s `if/else if` chain checks only `'parallax' \|\| 'sequence'`, `'counter'`, and `'magnetic'` — an element with `data-motion="sticky"` falls through to none of those branches and receives only the generic reveal-and-resolve behaviour from the shared observer. It will become visible; it will not pin or scrub (see §5.1) |
| `counter` | Animate a number from 0 to a target value once revealed | `runCounter()` (§6): `Intl.NumberFormat`-formatted count-up, `easeOutExpo`-adjacent easing, fires once `motionState` flips to `'in'` |
| `magnetic` | Small, bounded cursor-follow translate on hover | `wireMagnetic()` (§7): `pointermove`/`pointerleave` listeners writing inline `transform`, gated behind `(hover: hover)` and `!REDUCED` |

---

## 3. The five binding rules

Stated in the file's own header (`motion.ts:27-40`) as **not negotiable**.

### Rule 1 — Content is visible by default

Motion is applied by **removing** a class/state, not by adding visibility. If every
line of `motion.ts` fails to run, the page still reads correctly. This is the exact
inverse of the legacy `sv-reveal` design (§1) and is the whole point.

In practice: nothing in `astro/src` sets an element to `opacity: 0` by default and
waits for JavaScript to reveal it. An element carrying `data-motion="reveal"` must be
styled by its own component CSS to be visible at rest, with any entrance animation
keyed off `[data-motion-state="in"]` or similar — the primitive only ever adds that
state, it is never the thing that makes the element visible in the first place.

### Rule 2 — Every primitive has a timed failsafe

Regardless of what the observer does or does not do, every `[data-motion]` element is
resolved to its final state by a fixed deadline:

```ts
const FAILSAFE_MS = 2600; // motion.ts:45
window.setTimeout(() => els.forEach(resolve), FAILSAFE_MS);
```

This single timer is what makes the invisible-section class of bug **impossible**
rather than merely unlikely (`motion.ts:87-90`) — it is not scroll-driven, resize-
driven, or dependent on any browser API firing at all.

### Rule 3 — One observer, shared

Not one per module. A single module-level `IntersectionObserver` instance
(`observer`, `motion.ts:59`) is created once, lazily, and every `[data-motion]`
element on the page is registered against it in one pass
(`els.forEach((el) => observer!.observe(el))`, `motion.ts:85`). Compare this to the
legacy tree, where `roadmap.html` alone ran four independent observers with four
independent timing constants (§1.1).

### Rule 4 — `prefers-reduced-motion: reduce` resolves to final state

It never leaves an element mid-animation and never hides it (`motion.ts:42,67-70`):

```ts
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ...
if (REDUCED || typeof IntersectionObserver === 'undefined') {
  els.forEach(resolve);
  return;
}
```

Reduced motion also disables the scroll-driven loop (`onScroll()` returns
immediately if `REDUCED`, `motion.ts:99`) and the magnetic listener is never attached
at all (`wireMagnetic()` returns immediately if `REDUCED`, `motion.ts:148`). The
counter primitive is the one case that needs special handling: reduced motion still
gets the **number**, just not the count-up — skipping the final assignment would
leave the tile blank, "a content defect dressed up as an accessibility feature"
(`motion.ts:126-127`).

Print and anchor-jump also resolve everything up front rather than leaving content
mid-state, because both bypass scrolling entirely (`motion.ts:195-202`):

```ts
window.addEventListener('beforeprint', () =>
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(resolve),
);
if (location.hash) {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(resolve);
}
```

### Rule 5 — Only `transform` and `opacity` animate

So everything stays on the compositor (`motion.ts:38-39`). The parallax/sequence loop
writes only `transform: translate3d(...)` and the `--motion-progress` custom
property (§4); `resolve()` never touches anything but `dataset.motionState`. No
primitive in the current file animates `top`/`left`/`width`/`height` or triggers
layout.

---

## 4. Mechanics

### 4.1 `resolve()` — the idempotent finish line

```ts
function resolve(el: HTMLElement): void {
  el.dataset.motionState = 'in';
  el.style.removeProperty('--motion-progress');
}
```

Safe to call any number of times on the same element. Every path in the file —
observer intersection, the failsafe timeout, reduced motion, print, anchor jump —
converges on this one function.

### 4.2 The shared observer

```ts
observer ??= new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      resolve(entry.target as HTMLElement);
      observer!.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
);
```

A generous bottom margin (`-12%`) so an element resolves slightly before it is
scrolled to, rather than visibly popping once already on screen (`motion.ts:80-82`).
Unobserves each element immediately once resolved — a one-shot reveal, not a
repeating one.

### 4.3 The scroll-driven loop (parallax / sequence)

One `rAF`-throttled scroll handler drives every `parallax`/`sequence` element from a
single array:

```ts
function onScroll(): void {
  if (ticking || REDUCED) return;
  ticking = true;
  requestAnimationFrame(() => {
    const vh = window.innerHeight;
    for (const { el, speed } of scrollDriven) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2); // -1..1, 0 = dead centre
      el.style.setProperty('--motion-progress', p.toFixed(4));
      el.style.transform = `translate3d(0, ${(p * speed).toFixed(2)}px, 0)`;
    }
    ticking = false;
  });
}
```

Skips elements currently off-screen (`r.bottom < 0 || r.top > vh`) rather than
computing for the whole page every frame. `--motion-progress` is exposed as a CSS
custom property so a component's own `<style>` block can read it for anything beyond
a straight translate, though nothing in `astro/src` currently does (§5.3).

### 4.4 Counter

```ts
function runCounter(el: HTMLElement): void {
  const to = Number(el.dataset.motionTo ?? '0');
  const dp = Number(el.dataset.motionDecimals ?? '0');
  // Intl.NumberFormat, en-GB, fixed decimal places
  // reduced motion: format(to) immediately, no animation
  // otherwise: requestAnimationFrame step, easeOutExpo-adjacent, data-motion-duration ms (default 1400)
}
```

Wired so the counter fires exactly once, when the element is actually resolved — not
on page load regardless of visibility — via a `MutationObserver` watching
`data-motion-state` if the element has not already resolved by the time `initMotion()`
runs (`motion.ts:170-183`).

### 4.5 Magnetic

```ts
function wireMagnetic(el: HTMLElement): void {
  if (REDUCED || !window.matchMedia('(hover: hover)').matches) return;
  const strength = Number(el.dataset.motionStrength ?? '0.28');
  el.addEventListener('pointermove', (e) => { /* bounded translate toward pointer */ });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
}
```

Gated behind both reduced motion and `(hover: hover)` — never attached on touch
devices, where a "cursor-follow" effect has no meaning. This closes a real gap found
in the legacy `sovereign-transformation-v2.js`, whose magnetic-button code checked
`isTouch` but not `prefers-reduced-motion` (`migration/JS-AUDIT.md` §5, primitive #2).

---

## 5. What does not yet exist / gaps against the intent

Stated plainly because the task this document exists for requires it, not because any
of this is an emergency — the file is new and the site has not yet cut over.

### 5.1 The `sticky` primitive has no implementation

`sticky` is a valid value in the `Primitive` type union and would be a legitimate
value for `data-motion`, but `initMotion()`'s dispatch (`motion.ts:166-186`) has no
branch for it — only `'parallax' || 'sequence'`, `'counter'`, and `'magnetic'` are
handled. An element marked `data-motion="sticky"` today would be swept into the
generic `[data-motion]` query, observed, and resolved to `motionState: 'in'` — i.e.
it gets the `reveal` behaviour, not pin-and-scrub. `MODERNISATION-ARCHITECTURE.md`
§5 names this primitive `sticky-scene`; `migration/JS-AUDIT.md` §5 (primitive #6)
recommends keeping it only if there is a concrete near-term use case, since the
legacy equivalent (`sticky-storytelling.js`) had zero live targets anywhere in the
repo. Build the pin+scrub logic before shipping any component that asks for it.

### 5.2 `parallax` and `sequence` are not yet behaviourally distinct

Both are pushed into the same `scrollDriven` array and driven by the identical
`translate3d(0, progress * speed, 0)` calculation (§4.3). Nothing in the current file
differentiates "continuous parallax drift" from "a scroll-scrubbed sequence of
discrete steps" — that distinction exists only in the type name today. If `sequence`
is meant to step between discrete states (as `MODERNISATION-ARCHITECTURE.md` §5's
naming implies) rather than translate continuously, that logic has not been written.

### 5.3 `initMotion()` is never called

Confirmed by a repo-wide search of `astro/src` for `initMotion`: the only match is
the `export function initMotion()` declaration itself (`motion.ts:163`). No layout —
not `Base.astro`, which is the file that would be the natural place for it, since
every page renders through it — imports `motion.ts` or invokes `initMotion()`. The
system is fully written and, per §§3–4, matches every rule in this document, but as
of 2026-08-02 it does not run on any page.

### 5.4 No component sets `data-motion`, and no CSS reads `data-motion-state`

Two further repo-wide searches confirm this: zero occurrences of `data-motion="..."`
outside `motion.ts` itself, and zero occurrences of `[data-motion-state]` or
`--motion-progress` in any `<style>` block across the 8 `.astro` files in
`astro/src`. Even if `initMotion()` were wired up today, no element would be
selected by it, and no CSS exists yet to visually react to `motionState: 'in'` or to
`--motion-progress`. The primitive contract (attribute in, state out) is complete;
the consuming side (component markup + component CSS) has not been built for any
component yet.

### 5.5 Divergence from `MODERNISATION-ARCHITECTURE.md`'s stated target stack

`MODERNISATION-ARCHITECTURE.md` §2 records a deliberate decision **for** GSAP +
ScrollTrigger and explicitly **against** "bespoke IntersectionObserver code," on the
stated grounds that bespoke IntersectionObserver code is what produced the
invisible-sections defect in the first place. `motion.ts` as written is exactly that
rejected option: a hand-written `IntersectionObserver` + `requestAnimationFrame`
system, with no import of GSAP or ScrollTrigger anywhere in `astro/src`. The system
as built satisfies every specific rule §3 requires (guaranteed-visible failsafe, one
shared observer, reduced-motion resolves to final state, GPU-safe properties only) —
the defect the target-stack decision was trying to prevent does not appear to have
recurred — but the two documents disagree on which *library* should have been used to
get there. This is a genuine, unresolved contradiction between the architecture
contract and the shipped code, not a wording nit; flag it for an explicit owner
decision (keep the vanilla implementation and update
`MODERNISATION-ARCHITECTURE.md` §2, or port `motion.ts`'s behaviour onto GSAP) rather
than letting either document keep asserting something the other one contradicts.

---

## 6. Traceability summary

| Claim | Evidence |
|---|---|
| Legacy: 4 of 9 sections hidden after a normal scroll on the homepage | `motion.ts:16-17`; corroborated by `migration/JS-AUDIT.md` §4, commit `c0fd0736` |
| Legacy: eleven overlapping motion systems | `MODERNISATION-ARCHITECTURE.md:20`; full enumeration in `migration/JS-AUDIT.md` §3 |
| `FAILSAFE_MS = 2600` | `motion.ts:45` |
| One shared `IntersectionObserver` instance | `motion.ts:59,72-83` |
| Reduced motion resolves to final state, never hides | `motion.ts:42,67-70,126-127` |
| Only `transform`/`opacity`/a custom property are ever written | direct read of `resolve()`, `onScroll()`, `wireMagnetic()` — no other CSS property assignment exists in the file |
| `initMotion()` never called anywhere in `astro/src` | grep across `astro/src` for `initMotion`, one match (the definition) |
| No `data-motion` attribute anywhere outside `motion.ts` | grep across `astro/src` for `data-motion` |
| No CSS reads `data-motion-state` or `--motion-progress` | grep across `astro/src` for both strings, matches confined to `motion.ts` |
| No GSAP/ScrollTrigger import in `astro/src` | direct read of all `.ts`/`.astro` files' imports; `motion.ts` has none |
