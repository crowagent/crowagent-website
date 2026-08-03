# Motion and interaction: crowagent.ai

**Rewritten 2026-08-03.** The previous version of this document described six primitives
(`reveal`, `parallax`, `sticky`, `counter`, `magnetic`, `sequence`) behind a `[data-motion]`
attribute, a shared `IntersectionObserver` and a 2,600ms failsafe timer, and recorded that
`initMotion()` was never called by any page. **All of that is gone.** `scripts/motion.ts` was
rewritten, the primitives were deleted rather than ported, and the file is now imported and called by
`pages/index.astro:88-90`. The motion grammar it serves; a shared beat, cycle, drift and three
easing curves: did not exist when that document was written.

**Source of truth:** `astro/src/styles/tokens.css:589-969` (the grammar and the ambient layer) and
`astro/src/scripts/motion.ts` (the one trigger). The Figma board is `wJ9DK6ByFUN6rWe0CpCVPU`, page
`139:2` "Motion — Homepage"; frame `139:7` states the binding rules and frame `141:2` is the lighting
rig.

---

## 1. The defect this exists to prevent

Two failures, and they are the reason every rule below is shaped the way it is.

### 1.1 Content that starts hidden

`js/modules/sv-reveal.js` stamped `.sv-reveal` on every `main > section` and a stylesheet rule set
`html.js-sv-reveal .sv-reveal { opacity: 0 }`. Content therefore started **invisible** and depended on
an observer firing to become visible. Measured on the legacy homepage:

| Condition | Sections hidden, of 9 |
|---|---:|
| No scroll, wait 8s | 0 |
| **Scroll through the whole page (a normal read)** | **4** |
| Full-page capture | 7 |

An observer fails to fire more often than it looks: a full-page screenshot that resizes the viewport
in one step, an anchor jump past an element, a restored scroll position on reload, printing, an
element already on screen at load in some browsers, an element inside a container that never scrolls.

**It was not a one-off.** `sovereign-transformation-v2.js` independently produced the same class of
bug; 20/20 cards stuck at `opacity: 0` on `crowmark.html`, 13/13 on `about.html`, 9/9 on
`contact.html`, through `gsap.from()` with `immediateRender: true` and a `ScrollTrigger` that did not
fire. **Two unrelated implementations of "fade up on scroll" produced the same permanently-invisible
content.** The bug is inherent to the pattern, not to either implementation.

### 1.2 The same fault, in the rebuild, wearing a different symptom

A staged entrance reveal was written into `ReasoningTrace.astro` and **failed the sitewide axe gate
with colour-contrast on 7 nodes**, because the checker sampled while the steps were mid-transition and
semi-transparent text meets 4.5:1 against nothing.

**The contrast failure was the symptom. The fault was making correct content depend on an observer
firing.** `ReasoningTrace.astro:85-90` records it: *"Motion may refine what is already there. It
may never create it."*

### 1.3 Eleven systems, seven cadences

The legacy tree ran **eleven** overlapping motion systems. The rebuild reduced that to one file, and
then had a second problem: seven of the homepage's sections each hardcoded their own numbers.
`tokens.css:597-622` records the measurement:

```
hero            3,900ms pass, 1,300ms stagger, linear,                LOOPS
numbers         1,600ms pass,   400ms stagger, linear,                once
lifecycle       1,400ms leg,  1,400ms stagger, linear,                once
                + a 6s ambient breath on var(--ease)                  LOOPS
both sides        800ms cell,   800ms stagger, linear,                once
reasoning         300ms cell,   300ms stagger, linear,                once
integrations      600ms fall,    60ms stagger, cubic(.22,1,.36,1),    once
final CTA       1,800ms sweep, ease-in-out,                           once
                + an 18s blob drift on ease-in-out                    LOOPS
```

Seven sections, seven cadences, four easing curves, and three different ideas about whether motion
stops. *"That is why the page read as seven effects rather than one system, and no amount of
per-section tuning fixes it, because there was nothing for a section to be tuned AGAINST."*

---

## 2. The five binding rules

From Figma frame `139:7`, and each is implemented rather than aspirational.

### Rule 01: Rest state IS final state

Frame 00 of every section on the board is what ships with **no JavaScript**, and it is complete.

If `motion.ts` never loads, never runs, or throws, every section renders exactly as its rest frame.
Nothing is missing, because nothing was ever hidden.

**There is no failsafe timer, and its absence is the proof.** `motion.ts:24-30`: *"The failsafe timer
was the right answer to the wrong shape. If content only ever starts CORRECT, there is nothing to
fail safe to: the page is already there."*

### Rule 02: Motion may only ADD light

No animated property may lower the opacity of anything that was already on screen.

The ambient layer is **transform-only**, and that is binding rather than stylistic
(`tokens.css:843-850`): *"These fields sit behind body copy; a looping opacity change behind a
paragraph moves the contrast the text is measured against, which is the mechanism of the axe failure
this repo has already shipped once."* A scale on a 140–160px blur changes what is under a word by an
amount no contrast checker can catch mid-transition either way. Scale is also compositor-only, so
seven rigs cost one frame between them.

The shared entrance keyframe returns to exactly where it started, so the rest state is the state
before *and* after:

```css
@keyframes m-arrive { 0% { transform: scale(1); } 45% { transform: scale(1.09); } 100% { transform: scale(1); } }
```

### Rule 03: Light goes behind text, never on it

Strokes, glows and fields behind text may take a ramp hue. **Text may not.**

**A recorded, deliberate divergence from the board.** Figma's M1 frame specifies the hero's stage
label lifting `--c-text-sub` to `--c-text` as the light lands. That is a text-colour animation on a
**looping** timeline sitting directly beside prose, so it is not built. `HeroStack.astro:94-102`:
*"Not one word in this component takes a ramp hue, animates, or changes colour at any point in the
cycle."*

### Rule 04: Refusals never loop

Everything on the homepage loops now; owner instruction, 2026-08-02: *"animation in home page must be
in continuously play mode"*, which supersedes the board's rule 04 (*"Autoplay next to prose plays
once. Only the hero loops."*).

**What is not relaxed is the reason that rule existed.** `tokens.css:686-693`:

> *"Nothing that loops here carries meaning, nothing that loops touches a word or the surface a word
> sits on, and every refusal on the page — the struck return arrow, the dropped figure, the orchid
> glow on 'or dropped' — still plays once or not at all. **A refusal is a fact, not a performance.**"*

This is the rule most likely to be broken by a well-meaning edit, because "make it consistent" reads
as "make the refusal loop too". It must not.

### Rule 05: Reduced motion resolves by construction, not by override

`motion.ts:191` returns **before the observer is even built**, so `data-lit` stays unset and no
keyframe rule ever matches. Every animated block is inside
`@media (prefers-reduced-motion: no-preference)`, so it does not exist rather than existing and being
disabled.

*"Frame 00 is the reduced-motion state by construction, not by a second set of overrides that can
drift from the first."*

`tokens.css:785-791` additionally collapses `--dur-fast`, `--dur` and `--dur-slow` to `0.01ms` under
`reduce`, so transitions resolve to their final state instead of being removed: *"an element that
never animates and never arrives is invisible content, which is worse than an animation somebody did
not want."*

---

## 3. The motion grammar

`tokens.css:695-705`. **A section may choose how many beats its figure is long. It may not choose how
long a beat is, how the light eases, or when the page breathes.**

```css
--m-beat:  600ms;   /* one station */
--m-cycle: 12s;     /* exactly 20 beats */
--m-drift: 18s;     /* the ambient field's own period */

--m-ease-travel: linear;
--m-ease-land:   var(--ease);                    /* cubic-bezier(0.16, 1, 0.3, 1) */
--m-ease-breath: cubic-bezier(0.45, 0, 0.55, 1);
```

### 3.1 The unit is a beat, and a beat is one station

Every animated figure on the homepage is a light crossing a row of stations: three planes, four spine
stops, two ring legs, three rail stations, five trace steps, six inbound arrows, one card edge. So the
unit of time is the time a light takes to cross **one** of them, and a section's pass is
`--m-beat × its own station count`.

**That is the whole answer to "a wide section must not be faster than a narrow one":** a five-step
rail takes five beats and a three-station rail takes three, so the light travels at comparable speed
in both, and the difference between the sections is their **length** rather than their pace.

| Section | Beats | Composition |
|---|---:|---|
| Hero | 6 | 3 planes, 2 beats of travel each, 2 beats apart |
| MarketShape | 4 | four spine stops |
| Lifecycle | 8 | two legs of four; the second is the longer arc, so it runs slower per degree: **that pacing IS the section's argument** |
| BothSides | 3 | three stations, two lights, mirrored |
| ReasoningTrace | 5 | five steps |
| Integrations | 1 | six parallel arrows, a sixth of a beat apart |
| FinalCta | 3 | one sweep across the card's top edge |

### 3.2 And then it rests

`--m-cycle` is the period every looping light shares. A section spends its pass travelling and the
remainder dark.

*"A light that crosses and then rests reads as a lit object; a light that never stops reads as a
loading state, and there are two buttons inside the closing card."* The rest is also what keeps this
admissible beside prose: at 12s the page refreshes about five times a minute rather than strobing.

### 3.3 `--m-cycle` is exactly 20 beats, and that is the one arithmetic fact to keep

12,000 ÷ 600 = 20, so **one beat is exactly 5% of a cycle**, every station boundary in every section's
`@keyframes` lands on a round multiple of 5%, and the numbers in those blocks can be checked by eye.

**Change `--m-beat` or `--m-cycle` without keeping that ratio and every keyframe block on the homepage
silently drifts out of step with its own delays. Change them together.**

### 3.4 Three curves, one family

| Curve | Value | For |
|---|---|---|
| **travel** | `linear` | A lamp crossing a fixed distance moves at constant speed. Easing a travelling highlight makes it arrive early and crawl; the exact disagreement already recorded in `MarketShape` between Figma `144:2`'s named curve and its own evenly-spaced keyframe columns |
| **land** | `var(--ease)`, expo-out | An arrival: a bloom, a nudge, a cap opening. The site's existing curve, so a landing on the homepage is the same motion as a card lifting under the pointer |
| **breath** | `cubic-bezier(0.45, 0, 0.55, 1)` | Symmetric in-out, for anything ambient that reverses. The only curve here that is not one of the other two, because a field that breathes has no arrival to ease towards |

**`linear` is not a placeholder.** It is the deliberate choice for travel, and an edit that "improves"
it to an ease is a regression.

### 3.5 `--m-drift` is 18s and deliberately not a multiple of the cycle

18 against 12 means the two never land together twice in the same place, so **the page never repeats
itself exactly**. Inherited from the final CTA's blob drift, which Figma `149:98` names as the
reference rig.

---

## 4. The ambient layer

`tokens.css:822-969`. The one part of the grammar shared as CSS rather than as numbers.

Every animated section carries the same rig: a wrapper holding two or three blurred, screen-blended
`<b>` fields, clipped and radially masked so they can never widen the page. Figma `149:98` records
where it came from: *"the card's three screen-blended blobs are ALREADY SHIPPED and are the reference
rig. Nothing above invented a lighting language; it generalised this one to the other five
sections."*

Marking a wrapper `data-field` opts it into two animations, both declared once so a section cannot
have its own opinion:

| Animation | Duration | Behaviour |
|---|---|---|
| `m-drift` | `--m-drift` | Always on, alternating, each field a third of the period out of phase |
| `m-arrive` | `--m-beat` | One beat, once, when the section is lit |

**Implementation details that are load-bearing:**

- **`m-arrive` is second in the animation list on purpose.** Both target `transform`, and the later
  entry owns a property while it is running, so the entrance takes the field for its one beat and
  hands it straight back to the drift.
- **Longhands, not the shorthand.** A second `animation:` declaration would reset `animation-delay`
  for both entries and destroy the drift's phase offsets.
- **Negative delays, not positive ones.** The final CTA phased its three blobs with `6s` and `12s`,
  which means blobs two and three sat perfectly still for the first six and twelve seconds of the
  page's life. A negative delay starts the animation part-way through, so all three move from the
  first frame with the same phase offset.
- **`data-field="on"` is the hero**, and it is the one field that fires its entrance at load rather
  than on view. The hero is above the fold at every viewport, so asking an observer whether it is
  visible is a question with a known answer and a failure mode.

### 4.1 The scroll-driven parallax, and why it is not scroll-jacking

`tokens.css:907-943`. `specs/ULTRA-PREMIUM-GAP.md` §4 lever 05 measured 47 running animations, 16 of
them infinite, and **every one of the 16 is a blur field scaling between 1.00 and 1.04**. The light on
a section changes; its **position** never does, so scrolling past reads as passing a lit sign rather
than as moving through a scene.

```css
@supports (animation-timeline: view()) {
  [data-field] { animation: sv-parallax linear both; animation-timeline: view(); }
}
```

- **Nothing is pinned, nothing snaps, the scroll rate is untouched.** NN/g's rules 6 and 7 are not
  engaged because nothing takes over the scroll.
- **It runs on the compositor**, because `view()` is a CSS timeline rather than a scroll listener.
- **On the wrapper, not the fields.** The `<b>` children already own `transform` for the drift, and a
  second animation on the same property would replace the first.
- **`--par` is the per-section speed**, which is what stops seven layers moving as one sheet. Default
  30px; `0` turns it off.
- **The fallback is the page as it ships today.** `animation-timeline: view()` is unsupported in
  Firefox Release (behind `layout.css.scroll-driven-animations.enabled`), so roughly a sixth of
  readers get the current static field. That is correct behaviour, and it is also why this is a bonus
  rather than the answer to "the motion is not strong enough".

---

## 5. The trigger

`astro/src/scripts/motion.ts`, 228 lines, imported by `pages/index.astro:88` and called at line 90.
**No other route imports it.**

### 5.1 One idea: `data-lit`

An element that wants motion carries `data-lit`. When it comes into view the module sets
`data-lit="on"` **once** and unobserves it. Every animation is CSS keyed off `[data-lit='on']`.

**`data-lit-threshold` is per-element**, from the board: numbers 0.35, lifecycle 0.4, both sides 0.35,
reasoning trace 0.15, final CTA 0.4. A section low on the page wants a higher threshold so the light
does not start while only its first 40px is showing; the reasoning trace is tall, so 0.15 is most of a
screen. **One observer per distinct threshold**, not one per element, because
`IntersectionObserver` takes its thresholds at construction.

**Unobserving means something different now that the sections loop.** It is no longer what stops a
section repeating, CSS decides that, **it is what stops a section RESTARTING.** Leaving the observer
attached and toggling the attribute would reset every animation in that section to frame zero each
time it re-entered the viewport, so a reader scrolling up and down would re-trigger the one-shot beats
(the drop at Ground, the cross, the refusal glow) over and over. **Those play once per page load, and
that line is what makes "once" true.**

### 5.2 The attribute is a switch, not a clock

**The strongest evidence the division is right:** the entire homepage was retimed to a shared beat,
cycle and easing set on 2026-08-02, and **not one line of TypeScript was involved**. The whole change
happened in `tokens.css` and in seven `@keyframes` blocks.

`motion.ts:38-47`: *"the day this file needs to know how long a pass is is the day the page can break
by failing to run."*

### 5.3 The cursor light

`initSpotlight()`. `pointermove` sets `--mx` / `--my` on the section; a radial gradient at those
coordinates on a `pointer-events: none` overlay does the rest.

**That division is the point. This file writes two numbers; CSS decides what light means, how far it
reaches, what colour it is and whether it exists at all.**

Four guards, all present in the code rather than assumed:

1. **It adds nothing without JS.** `.sv-spot` is `opacity: 0` and only `[data-spot='on']` lifts it.
2. **It is behind every word.** The overlay is inside each section's ambient wrapper, at `z-index: -1`
   inside an isolated stacking context. Light can never land on the surface a word sits on.
3. **Touch never gets it.** `(hover: hover) and (pointer: fine)` is checked in JS *and* in the
   stylesheet, and `event.pointerType !== 'mouse'` returns early, because a pen or a touch contact can
   reach a hover-capable device.
4. **Reduced motion never gets it.** A light that follows the pointer is motion whatever it is made of.

**One `rAF` per frame, not one write per event.** A `pointermove` fires far faster than the compositor
draws; the coordinates are stored and flushed once per frame. Values are written to two decimals,
because a raw percentage arrives as `48.61111111111111%`, a longer string to parse and re-serialise
every frame for a difference no display can resolve on a 420px gradient.

**`pointerleave`, not `pointerout`.** `pointerout` fires when the pointer crosses onto a **child**,
which would strobe the light off and on across every card boundary in the section.

### 5.4 What was deleted rather than ported

`reveal`, `parallax`, `sequence`, `sticky`, `counter`, `magnetic`, the `[data-motion]` attribute, the
shared observer and the 2,600ms failsafe. **None of it was ever imported by any page.**

**`counter` in particular was a hazard on this page.** `MarketShape.astro:70` forbids a count-up
on the four figures **by name**, because the legacy build animated them from zero on scroll, which is
the hide-then-reveal pattern under a different name: *"A number that might not arrive is worse than a
number that does not animate."*

---

## 6. Interaction

Not animation, but governed by the same rules.

| Behaviour | Where | Rule |
|---|---|---|
| Card hover | `surfaces.css` | Specular and border brighten on **any** hover. The **lift** is limited to `a`, `button`, `label`, `summary` and explicit `surface--lift`,*"lifting a paragraph of text under the pointer advertises an affordance that is not there, and it moves the line somebody is reading"* |
| Lift distance | `--lift-card: -4px` | One value. The rebuild had -3px, -4px and -5px in three files |
| Transitions | `surfaces.css:66-72` | **Named properties, never `all`.** `transition: all` animates height and width during a reflow, which is why hover felt sticky on the legacy build |
| Hover gating | 11 `@media (hover: hover)` rules | So a touch device does not latch a control into its hover state |
| Focus | `forms.css` | `:focus-visible` is defined **once**, so no form can ship without it |
| Products dropdown | `Nav.astro` | A standard disclosure `<button>`: Enter/Space/click toggles, Escape closes and returns focus |
| Command palette | `CommandPalette.astro` | APG combobox-with-listbox. Focus never leaves the input; the active option is tracked with `aria-activedescendant` |

---

## 7. Verification

| Property | Verified by | In the build? |
|---|---|---|
| Every word painted with no JS | manual, scripts disabled | No |
| Reduced motion ships the final state | manual | No |
| Contrast on the settled page | `tests/accessibility.spec.js`, axe | No: Playwright, manual |
| **Contrast mid-animation** | nothing | **No**: and this is exactly what caught the 7-node failure once, by accident |
| **No horizontal overflow mid-animation** | nothing | **No**: see `RESPONSIVE-STANDARDS.md` §4.2 |
| Durations and easing come from `--m-*` | nothing | **No** |

**How to measure anything mid-animation.** Pause every animation and scrub it, because a travelling
light only misbehaves while it is moving:

```js
const anims = document.getAnimations();
anims.forEach((a) => a.pause());
for (let t = 0; t <= 12000; t += 600) {        // --m-cycle in --m-beat steps
  anims.forEach((a) => { a.currentTime = t; });
  await new Promise(requestAnimationFrame);
  // assert here: scrollWidth, contrast, whatever the check is
}
```

Twenty samples covers every station boundary, because `--m-cycle` is exactly 20 beats and every
keyframe boundary lands on a multiple of 5%.

**Note for anyone auditing with a headless browser or an MCP tab:** a tab in
`visibilityState: 'hidden'` freezes transitions, and `getComputedStyle` will report `opacity: 0` on
elements that are perfectly visible in a real tab. That has already produced false blank-section
reports on this site. Check `el.getAnimations()` before believing an opacity reading.

---

## 8. Open, not decided

1. **No gate asserts any of §3.** A section could hardcode `1400ms` and nothing would notice. The
   grammar is held entirely by `tokens.css`'s header comment and by review.
2. **Contrast and overflow are never sampled mid-animation.** The method is in §7; nothing runs it.
   The 7-node axe failure was found by accident, when a checker happened to sample mid-transition.
3. **`motion.ts` runs on `/` only.** No other route has a `data-lit` element, so that is correct
   today. It also means a section component reused on a second route would silently lose its
   entrance, and nothing would say so.
4. **`animation-timeline: view()` has no fallback beyond "no parallax".** That is deliberate and
   recorded, but the ~16% of readers on Firefox Release get a materially quieter page and nobody has
   looked at it in that state.
5. **`MODERNISATION-ARCHITECTURE.md` §2 still records a decision *for* GSAP + ScrollTrigger.** There
   is no GSAP anywhere in `astro/`, and the current implementation is 228 lines of vanilla with no
   dependency. **The two documents contradict each other.** The defect that decision was trying to
   prevent has not recurred, so the honest resolution is to update
   `MODERNISATION-ARCHITECTURE.md`, but that is an owner decision, not an agent's.

---

## 9. Traceability

| Claim | Where to check |
|---|---|
| `--m-beat` 600ms, `--m-cycle` 12s, `--m-drift` 18s, three curves | `astro/src/styles/tokens.css:695-705` |
| Cycle is exactly 20 beats | `tokens.css:655-660`, and 12000 ÷ 600 |
| Seven sections, seven cadences, four curves before the grammar | `tokens.css:597-622` |
| Refusals never loop | `tokens.css:686-693` |
| Text is exempt from the ramp; divergence from Figma M1 recorded | `HeroStack.astro:94-102` |
| Ambient layer is transform-only, and why | `tokens.css:843-850` |
| `motion.ts` is 228 lines, called from `index.astro:90` | `grep -n initMotion astro/src/pages/index.astro` |
| The six deleted primitives and the deleted failsafe | `motion.ts:14-31` |
| No count-up on the market figures | `MarketShape.astro:70` |
| Travelling lights overflow only mid-animation | `BothSides.astro:548-558` |
| Legacy: 4 of 9 sections hidden after a normal scroll | `migration/JS-AUDIT.md` §4, commit `c0fd0736` |
| Legacy: eleven overlapping motion systems | `MODERNISATION-ARCHITECTURE.md:20`, `migration/JS-AUDIT.md` §3 |
