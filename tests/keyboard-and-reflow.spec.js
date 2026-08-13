// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * [CARRY-25 · WS10-08] The TWO untested clauses that can be automated.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * The published statement at https://crowagent.ai/accessibility enumerates what
 * has NOT been tested — which is exactly why the row could not be closed:
 *
 *   1. "Manual keyboard-only navigation of every interactive component"
 *   2. "Screen readers: NVDA, JAWS and VoiceOver"
 *   3. "Text resizing and reflow beyond what automated checks cover,
 *       including 400% zoom"
 *   4. "Testing with disabled users"
 *   5. "WCAG 2.2 criteria that are not machine-detectable"
 *
 * The owner's 2026-08-13 decision was to automate what CAN be automated and to
 * NAME what still cannot. This file covers clauses 1 and 3.
 *
 * ⚠️ CLAUSES 2, 4 and 5 REMAIN UNTESTED AND ARE NOT CLAIMED BY THIS FILE.
 * NVDA / JAWS / VoiceOver need a real screen reader; testing with disabled users
 * needs participants; the non-machine-detectable 2.2 criteria need a human
 * auditor. Nothing here may be cited as evidence for those, and the published
 * statement must NOT be weakened to claim more than is measured — it is
 * currently exemplary precisely because it declines to.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SCOPE — MEASURED, NOT ASSUMED
 * ─────────────────────────────────────────────────────────────────────────────
 * Read from the live statement 2026-08-13, verbatim: "This statement covers the
 * CrowAgent marketing website at crowagent.ai. The CrowAgent application at
 * app.crowagent.ai is a separate product and is not covered here." So this file
 * targets the marketing site ONLY. Auditing the app here would produce evidence
 * for a claim nobody made.
 *
 *   BASE_URL=https://crowagent.ai npx playwright test tests/keyboard-and-reflow.spec.js
 *
 * Default is the local Astro tree (:8095), matching accessibility.spec.js — a
 * suite that silently defaults to frozen production reports green on a build no
 * local change can reach (O-16, 2026-08-05).
 */

const BASE_URL = process.env.BASE_URL || process.env.ASTRO_URL || 'http://127.0.0.1:8095';

/** Routes that carry the site's interactive chrome (nav, forms, disclosures). */
const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'Pricing', path: '/pricing/' },
  { name: 'Contact', path: '/contact/' },
  { name: 'CrowMark', path: '/crowmark/' },
  { name: 'CrowMark buyers', path: '/crowmark-buyers/' },
  { name: 'Accessibility', path: '/accessibility/' },
];

/**
 * WCAG 2.2 AA · 1.4.10 Reflow: content must be presentable without loss at a
 * width equivalent to 320 CSS px — which IS 400% zoom on a 1280px viewport
 * (1280 / 4 = 320). Emulating the width is the standard mechanised form of the
 * "400% zoom" clause; it is not a weaker proxy.
 */
const REFLOW_VIEWPORT = { width: 320, height: 1024 };

/** 1.4.4 Resize text: 200% text size with no loss of content or function. */
const TEXT_SCALE = 2;

/** Horizontal-overflow tolerance, in CSS px. Sub-pixel rounding only. */
const OVERFLOW_TOLERANCE = 2;

// ─────────────────────────────────────────────────────────────────────────────
// 1.4.10 REFLOW · 1.4.4 RESIZE TEXT
// ─────────────────────────────────────────────────────────────────────────────

test.describe('[CARRY-25] 1.4.10 reflow at 320px (= 400% zoom) and 1.4.4 text at 200%', () => {
  for (const pageDef of PAGES) {
    test(`${pageDef.name}: no horizontal scrolling at 320px`, async ({ page }) => {
      await page.setViewportSize(REFLOW_VIEWPORT);
      const response = await page.goto(`${BASE_URL}${pageDef.path}`, {
        waitUntil: 'domcontentloaded',
      });
      // POSITIVE CONTROL: a 404 body has almost no content and would pass every
      // overflow assertion below. Prove the page under test actually loaded.
      expect(response?.status(), `${pageDef.path} must load`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        metrics.scrollWidth,
        `1.4.10: the document scrolls horizontally at 320px ` +
          `(scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth}). ` +
          `Two-dimensional scrolling is exactly what this criterion forbids.`,
      ).toBeLessThanOrEqual(metrics.clientWidth + OVERFLOW_TOLERANCE);
    });

    test(`${pageDef.name}: names the elements that overflow, not just that something does`, async ({
      page,
    }) => {
      await page.setViewportSize(REFLOW_VIEWPORT);
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'domcontentloaded' });

      // A bare document-level assertion says "something overflowed" and leaves
      // the next person to find it. Name the offenders. Elements that scroll on
      // purpose (overflow-x: auto/scroll) are excluded — a scrollable table is
      // an ALLOWED reflow technique under 1.4.10, not a violation.
      const offenders = await page.evaluate((tolerance) => {
        const viewport = document.documentElement.clientWidth;
        const out = [];
        /**
         * An element wider than the viewport is only a 1.4.10 problem if it
         * actually forces the PAGE to scroll. If any ancestor clips or scrolls
         * horizontally, the overflow is contained by design — a decorative
         * ambient blob, a marquee track, a deliberately scrollable tab strip.
         *
         * The first version of this probe checked only the element's OWN
         * overflow-x and reported 17 "violations" on the homepage that were all
         * contained: `i.hero__amb` (right=1215), `div.in__rail` (right=2704),
         * the `tabsw__tab` strip. The document-level assertion above passed on
         * the same page at the same moment — the two disagreeing IS the tell
         * that the finer-grained probe was wrong, not the page.
         */
        const clippedByAncestor = (el) => {
          for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (['hidden', 'auto', 'scroll', 'clip'].includes(s.overflowX)) return true;
          }
          return false;
        };
        for (const el of Array.from(document.querySelectorAll('body *'))) {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          if (['hidden', 'auto', 'scroll', 'clip'].includes(style.overflowX)) continue;
          if (clippedByAncestor(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.right > viewport + tolerance) {
            out.push(
              `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}` +
                `${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}` +
                ` right=${Math.round(rect.right)} > ${viewport}`,
            );
          }
          if (out.length >= 15) break;
        }
        return out;
      }, OVERFLOW_TOLERANCE);

      expect(offenders, `1.4.10: elements extend past the 320px viewport:\n${offenders.join('\n')}`).toEqual([]);
    });

    test(`${pageDef.name}: no content is LOST with text at 200%`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 1024 });
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'domcontentloaded' });

      // 1.4.4 is about TEXT scaling, not page zoom — so scale the root font size
      // rather than the viewport. Layouts sized in rem reflow; layouts pinned in
      // px do not, which is the failure this criterion is looking for.
      const before = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
      await page.evaluate((scale) => {
        const root = document.documentElement;
        const base = parseFloat(getComputedStyle(root).fontSize) || 16;
        root.style.fontSize = `${base * scale}px`;
      }, TEXT_SCALE);
      const after = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);

      // CONTROL: prove the mutation actually took effect. An assertion that the
      // page survives a change that never happened is worth nothing.
      expect(parseFloat(after), `root font-size must have doubled (${before} -> ${after})`).toBeGreaterThan(
        parseFloat(before) * 1.9,
      );

      // ── WHAT 1.4.4 ACTUALLY REQUIRES ──────────────────────────────────────
      // "without loss of content or functionality". Horizontal scrolling of the
      // PAGE is permitted here — it is 1.4.10 that forbids two-dimensional
      // scrolling, and only at 320px, which is asserted separately above and
      // passes on every page.
      //
      // The first version of this test asserted "no horizontal scrolling at
      // 200% text" and failed on all six pages (scrollWidth 1791 > 1280). That
      // was testing 1.4.10's rule under 1.4.4's name, and reporting it as an AA
      // failure would have overstated the finding — against a statement that is
      // scrupulous about not claiming more than it measured. LOSS is the test.
      const clipped = await page.evaluate((tolerance) => {
        /**
         * ⚠️ THE VISUALLY-HIDDEN PATTERN IS NOT LOST CONTENT — IT IS THE
         * OPPOSITE. `.visually-hidden` is the canonical WCAG utility for text
         * that is delivered to screen readers but not painted:
         *
         *   position: absolute; width: 1px; height: 1px;
         *   overflow: hidden; clip-path: inset(50%); white-space: nowrap;
         *
         * It deliberately avoids `display:none` and `visibility:hidden`
         * precisely so the text STAYS in the accessibility tree.
         *
         * The first version of this probe had no such exclusion and reported 15
         * failures — five pages on all three engines — every one of them one of
         * these spans: "Supplier:", "Authority:", and a <caption> reading
         * "CrowMark features by plan". Measured off the DOM, not inferred: each
         * had clientWidth=1, position=absolute, clip-path=inset(50%).
         *
         * In other words the probe was reporting the site's SCREEN-READER
         * AFFORDANCES as accessibility failures — a finding that would have
         * pushed a fix in exactly the wrong direction. The /accessibility page
         * passing on all three engines at the same moment was the tell: it is
         * the one page in the set with no sr-only spans.
         *
         * Excluding them is only legitimate if they really are the pattern, so
         * this matches on the MEASURED SIGNATURE rather than on a class name,
         * and a positive test below proves the pattern stays exposed to AT.
         */
        const isVisuallyHidden = (el, style) => {
          const rect = el.getBoundingClientRect();
          const tiny = rect.width <= 2 && rect.height <= 2;
          const clipped =
            style.position === "absolute" &&
            (style.clipPath !== "none" || style.clip !== "auto");
          return tiny && clipped;
        };

        /**
         * A MARQUEE does not lose content — it presents it over time. The
         * homepage integrations band is `div.in__viewport` (overflow hidden,
         * scrollWidth 4177 at 200% text) wrapping `div.in__rail`, which carries
         * `animation: in-band 36s` and a live transform. Every logo and
         * permission string in it scrolls into view.
         *
         * Read off the DOM, not assumed: the child's computed `animation-name`
         * is `in-band` and its duration 36s. The companion test below asserts
         * the 2.2.2 pause control that makes an auto-scrolling band legitimate
         * in the first place, so this exclusion cannot launder a marquee that
         * a user has no way to stop.
         */
        const isAnimatedTrack = (el) =>
          Array.from(el.children).some(
            (c) => getComputedStyle(c).animationName !== "none",
          );

        const out = [];
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") continue;
          if (isVisuallyHidden(el, style)) continue;
          // `aria-hidden` content is not content: it is removed from the
          // accessibility tree by the author on purpose. On /contact/ this is
          // `div.form__pot` — a 1px honeypot field labelled "Website" that
          // exists to catch spam bots, not to be read.
          if (el.closest('[aria-hidden="true"]')) continue;
          if (isAnimatedTrack(el)) continue;
          // Only a container that CANNOT scroll can lose content: if it scrolls,
          // the text is still reachable.
          if (style.overflowX !== "hidden" && style.overflowY !== "hidden") continue;
          if (!el.textContent || !el.textContent.trim()) continue;
          if (el.scrollWidth > el.clientWidth + tolerance && el.clientWidth > 0) {
            out.push(
              `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} ` +
                `scrollWidth=${el.scrollWidth} > clientWidth=${el.clientWidth} ` +
                `text="${el.textContent.trim().slice(0, 40)}"`,
            );
          }
          if (out.length >= 10) break;
        }
        return out;
      }, OVERFLOW_TOLERANCE);

      expect(
        clipped,
        `1.4.4: text is CLIPPED (unreachable) at 200% inside non-scrollable ` +
          `containers on ${pageDef.path}:\n${clipped.join("\n")}`,
      ).toEqual([]);
    });
  }

  /**
   * The POSITIVE half of the visually-hidden exclusion above. Skipping those
   * elements is only honest if they are genuinely the accessibility pattern and
   * not a way of quietly hiding real clipped text, so assert the property that
   * makes them legitimate: their content must still reach assistive technology.
   *
   * `display:none` and `visibility:hidden` are the two declarations that REMOVE
   * an element from the accessibility tree, and `aria-hidden="true"` removes it
   * explicitly. A visually-hidden element using any of them would be invisible
   * to everyone — sighted AND screen-reader users — which is a real defect, and
   * catching that is what earns the exclusion.
   */
  /**
   * The POSITIVE half of the marquee exclusion. 2.2.2 Pause, Stop, Hide: moving
   * content that starts automatically and lasts more than five seconds must
   * offer a way to pause it. The homepage band runs 36s, so excluding it from
   * the 1.4.4 probe is only defensible if that control exists — otherwise the
   * exclusion would be hiding a different failure rather than correcting a
   * false one.
   */
  test('the auto-scrolling band offers a 2.2.2 pause control', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const band = await page.evaluate(() => {
      const track = Array.from(document.querySelectorAll('body *')).find(
        (el) => getComputedStyle(el).animationName !== 'none' && el.scrollWidth > 2000,
      );
      if (!track) return null;

      /**
       * ⚠️ `element.closest()` MATCHES THE ELEMENT ITSELF. The first version of
       * this control used `track.closest('section, div[class*="in__"]')`, and
       * the track IS `div.in__rail` — so it "found" the rail, searched inside
       * it, reported `controls: []`, and failed on all three engines against a
       * band that does have a pause button. The control was broken, not the
       * page: a WebKit tab traversal of the homepage lands on `BUTTON:Pause`
       * and `BUTTON:Pause scrolling`.
       *
       * So walk up from the PARENT, and stop at the first ancestor that
       * actually contains a control.
       */
      let region = track.parentElement;
      let depth = 0;
      let controls = [];
      while (region && depth < 6) {
        controls = Array.from(region.querySelectorAll('button, [role="button"]')).map((b) =>
          ((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '')).trim(),
        );
        if (controls.length) break;
        region = region.parentElement;
        depth += 1;
      }
      return {
        animationName: getComputedStyle(track).animationName,
        regionClass: region && typeof region.className === 'string' ? region.className.slice(0, 40) : '',
        controls,
      };
    });

    // NAMED denominator: if the band ever stops animating, this control is
    // vacuous and must be revisited rather than silently passing.
    expect(band, 'the homepage must carry an auto-scrolling band for this control to mean anything').not.toBeNull();

    expect(
      band.controls.some((c) => /pause|stop/i.test(c)),
      `2.2.2: the band animates (${band.animationName}) with no pause/stop control. ` +
        `Controls found: ${JSON.stringify(band.controls)}`,
    ).toBe(true);
  });

  test('visually-hidden text is exposed to assistive technology, not merely invisible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto(`${BASE_URL}/pricing/`, { waitUntil: 'domcontentloaded' });

    const audit = await page.evaluate(() => {
      const hidden = Array.from(document.querySelectorAll('body *')).filter((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (
          r.width <= 2 &&
          r.height <= 2 &&
          s.position === 'absolute' &&
          (s.clipPath !== 'none' || s.clip !== 'auto') &&
          Boolean(el.textContent && el.textContent.trim())
        );
      });
      return {
        total: hidden.length,
        removedFromAxTree: hidden
          .filter((el) => {
            const s = getComputedStyle(el);
            return (
              s.display === 'none' ||
              s.visibility === 'hidden' ||
              el.closest('[aria-hidden="true"]') !== null
            );
          })
          .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 40)}"`),
      };
    });

    // NAMED denominator. If this ever reads 0 the assertion below is vacuous —
    // /pricing/ carries sr-only cell labels and a table <caption>.
    expect(
      audit.total,
      '/pricing/ must carry visually-hidden text for this control to mean anything',
    ).toBeGreaterThan(0);

    expect(
      audit.removedFromAxTree,
      `visually-hidden text was excluded from the 1.4.4 probe, but these are ` +
        `hidden from screen readers TOO — so the content really is lost:\n` +
        audit.removedFromAxTree.join('\n'),
    ).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.1.1 KEYBOARD · 2.1.2 NO KEYBOARD TRAP · 2.4.7 FOCUS VISIBLE
// ─────────────────────────────────────────────────────────────────────────────

/** Elements a keyboard user must be able to reach and operate. */
const INTERACTIVE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), ' +
  'summary, [role="button"]:not([aria-disabled="true"])';

test.describe('[CARRY-25] 2.1.1 keyboard-only traversal of every interactive component', () => {
  for (const pageDef of PAGES) {
    test(`${pageDef.name}: every visible interactive element is reachable by Tab`, async ({ page }) => {
      /**
       * This traversal is legitimately long: `maxPresses` is `count * 3 + 40`,
       * so a 61-element page drives up to 223 Tab presses, each followed by a
       * `page.evaluate` round-trip. Against the 30s default that overruns on a
       * busy machine and surfaces as `page.evaluate: Test timeout` — which is a
       * capacity limit of the instrument, NOT a red on the page. Two such
       * timeouts appeared in one run here, on pages that pass.
       */
      test.setTimeout(120000);
      await page.setViewportSize({ width: 1280, height: 900 });
      const response = await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${pageDef.path} must load`).toBeLessThan(400);

      // The denominator, stated. A traversal that reaches 3 of 3 elements on a
      // page that has 40 is not a pass — it is a broken measurement.
      const expected = await page.evaluate((selector) => {
        /**
         * "Visible" has to mean visible TO A USER, not merely non-zero-sized.
         * A first version counted every element with a box, which swept in
         * collapsed mobile-nav links, `aria-hidden` decoration, off-screen
         * carousel slides and `inert` subtrees — none of which a keyboard user
         * can or should reach, and all of which would have been reported as
         * 2.1.1 failures against a page that is fine.
         *
         * Denominator honesty cuts both ways: inflating it invents defects, and
         * a probe that reports a defect the page does not have is as useless as
         * one that misses a real one.
         */
        const isVisible = (el) => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          if (parseFloat(style.opacity) === 0) return false;
          if (el.closest('[aria-hidden="true"], [inert], [hidden]')) return false;
          // `tabindex="-1"` on a natively-focusable element is DELIBERATE removal
          // from the tab order, and on this site it is the ROVING TABINDEX
          // pattern: `role="tab"` + `aria-selected="false"` + `tabindex="-1"`,
          // navigated with arrow keys. That is the correct WAI-ARIA tablist
          // behaviour, not a 2.1.1 failure.
          //
          // Counting them reported "8 of 70 visible interactive elements were
          // never focused by Tab" on the homepage — five carousel screen-pickers
          // and three tab links — a confident, specific, entirely FALSE finding
          // against a page implementing the pattern correctly. Verified by
          // reading the attributes off the live DOM, not by assuming.
          //
          // Excusing them is not enough on its own, so the tablist pattern gets
          // its own POSITIVE test below: the selected tab must be tabbable and
          // arrow keys must move between them.
          if (el.getAttribute('tabindex') === '-1') return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          // Positioned outside the viewport entirely (off-canvas menus, slides
          // parked to one side). A skip link sitting just above the fold is
          // deliberately NOT excluded — it is reachable and must be counted.
          if (rect.right < 0 || rect.left > document.documentElement.clientWidth) return false;
          return true;
        };
        return Array.from(document.querySelectorAll(selector))
          .filter(isVisible)
          .map((el, i) => {
            if (!el.hasAttribute('data-kbd-probe')) el.setAttribute('data-kbd-probe', String(i));
            return String(i);
          });
      }, INTERACTIVE_SELECTOR);

      expect(expected.length, `${pageDef.path} must expose interactive elements to traverse`).toBeGreaterThan(3);

      /**
       * ⚠️ ENGINE CONTROL — WebKit's DEFAULT TAB ORDER OMITS LINKS.
       *
       * Safari/WebKit ships with "press Tab to highlight each item" OFF, so Tab
       * visits form controls and buttons only. Measured here rather than assumed:
       * on /contact/ the webkit tab order ran BUTTON, BUTTON, BUTTON, INPUT,
       * INPUT, INPUT, SELECT, TEXTAREA, INPUT, BUTTON, INPUT, BUTTON — not one
       * of the page's many `<a href>` elements — while chromium and firefox
       * traversed the identical markup link by link.
       *
       * That produced 7 false webkit failures, including "61 of 76 visible
       * interactive elements were never focused by Tab" and a skip link
       * reported as unreachable. Reporting a browser PREFERENCE as a 2.1.1
       * conformance failure would overstate the finding, against a statement
       * that is careful not to claim more than it measured.
       *
       * So the criterion is NOT measurable on this engine's default, and the
       * honest move is to say so and skip — never to weaken the assertion for
       * every engine. It is decided AFTER the traversal below, by whether Tab
       * ever actually reached a link, so if WebKit changes its default this
       * simply starts running again.
       *
       * ⚠️ It cannot be decided with `link.focus()`: PROGRAMMATIC focus works
       * on a link in WebKit too — only Tab traversal skips it. A control built
       * on `.focus()` returns "links are tabbable" on the very engine whose
       * behaviour it exists to detect, and would have quietly re-armed all 7
       * false failures.
       */

      // Tab through, bounded well above the element count so a trap shows up as
      // "not everything was reached" rather than as an infinite loop.
      const maxPresses = expected.length * 3 + 40;
      const reached = new Set();
      let anchorsReached = 0;
      await page.evaluate(() => document.body.focus());
      for (let i = 0; i < maxPresses; i += 1) {
        await page.keyboard.press('Tab');
        const probe = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          return {
            id: el.getAttribute('data-kbd-probe'),
            tag: el.tagName,
            hasTabindex: el.hasAttribute('tabindex'),
          };
        });
        if (probe && probe.tag === 'A' && !probe.hasTabindex) anchorsReached += 1;
        if (probe && probe.id !== null) reached.add(probe.id);
        if (reached.size === expected.length) break;
      }

      // The engine control described above, decided on MEASURED Tab behaviour:
      // the page offers links, and Tab reached none of them.
      // ⚠️ Counted over PLAIN links only — those with no explicit `tabindex`.
      // WebKit does tab to an `<a tabindex="0">`, and the homepage has exactly
      // one ("Discover"), as does /pricing/ ("For suppliers"). A control that
      // asked "was ANY anchor reached?" therefore saw 1, concluded links were
      // tabbable, and let 2 false failures through — while the other 49 links
      // on the page went unvisited. The engine trait is specifically that
      // links WITHOUT an author tabindex are skipped.
      const anchorsOffered = await page.evaluate(
        () => document.querySelectorAll('a[href]:not([tabindex])').length,
      );
      test.skip(
        anchorsOffered > 0 && anchorsReached === 0,
        `2.1.1 NOT MEASURED on this engine: ${anchorsOffered} links without an explicit ` +
          `tabindex are present and Tab reached none of them, which is WebKit/Safari's ` +
          `default tab order (links excluded unless "Full Keyboard Access" is on) rather ` +
          `than a property of the page. The same markup passes on chromium and firefox.`,
      );

      const provisionallyMissed = expected.filter((id) => !reached.has(id));

      /**
       * ⚠️ RE-VALIDATE BEFORE ACCUSING — the denominator is a SNAPSHOT, and this
       * page rewrites its own tab order after it.
       *
       * The homepage `<a>Discover</a>` carries `tabindex="0"` at load and is
       * rewritten to `tabindex="-1"` within about six seconds, when its carousel
       * widget initialises the roving-tabindex pattern. Measured directly: t=0
       * reads "0", t=6s and t=12s both read "-1", with no change in geometry,
       * display, visibility or opacity.
       *
       * So it entered the denominator legitimately and had correctly LEFT the
       * tab order by the time Tab reached it, producing "1 of 61 visible
       * interactive elements were never focused" against a page doing the right
       * thing. Re-applying the denominator's own rules at assert time removes
       * that false positive without weakening the criterion: an element that is
       * still tabbable and still unreached fails exactly as before.
       */
      const stillMissed = await page.evaluate((ids) => {
        return ids.filter((id) => {
          const el = document.querySelector(`[data-kbd-probe="${id}"]`);
          if (!el) return false; // removed from the DOM entirely
          if (el.getAttribute('tabindex') === '-1') return false; // now roving
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') return false;
          if (parseFloat(s.opacity) === 0) return false;
          if (el.closest('[aria-hidden="true"], [inert], [hidden]')) return false;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          return true;
        });
      }, provisionallyMissed);

      const droppedAsMoved = provisionallyMissed.length - stillMissed.length;
      if (droppedAsMoved > 0) {
        test.info().annotations.push({
          type: '2.1.1-left-the-tab-order',
          description:
            `${pageDef.path}: ${droppedAsMoved} element(s) were in the denominator at load ` +
            `but had left the tab order (tabindex=-1, hidden, or removed) by the end of the ` +
            `traversal. Not counted as unreachable.`,
        });
      }

      const missed = stillMissed;
      const describeMissed = await page.evaluate((ids) => {
        return ids.slice(0, 10).map((id) => {
          const el = document.querySelector(`[data-kbd-probe="${id}"]`);
          if (!el) return `#${id} (gone)`;
          const label = (el.textContent || '').trim().slice(0, 40) || el.getAttribute('aria-label') || '';
          return `${el.tagName.toLowerCase()} "${label}"`;
        });
      }, missed);

      expect(
        missed.length,
        `2.1.1: ${missed.length} of ${expected.length} visible interactive elements were never ` +
          `focused by Tab on ${pageDef.path}:\n${describeMissed.join('\n')}`,
      ).toBe(0);
    });

    test(`${pageDef.name}: focus is visible on every element it lands on`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'domcontentloaded' });

      // 2.4.7. Measured as a COMPUTED DIFFERENCE between the focused and
      // unfocused state, never by looking for a particular CSS declaration — a
      // guard that greps for `outline` passes on a rule that renders nothing.
      const failures = [];
      const thirdParty = [];
      for (let i = 0; i < 25; i += 1) {
        await page.keyboard.press('Tab');
        const result = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const focused = getComputedStyle(el);
          const signature = [focused.outlineStyle, focused.outlineWidth, focused.outlineColor, focused.boxShadow, focused.borderColor, focused.backgroundColor].join('|');
          const label = (el.textContent || '').trim().slice(0, 40) || el.getAttribute('aria-label') || el.tagName;
          const hasOutline = focused.outlineStyle !== 'none' && parseFloat(focused.outlineWidth) > 0;
          const hasShadow = focused.boxShadow !== 'none' && focused.boxShadow !== '';

          /**
           * Focus stops this SITE did not author. 2.4.7 is asserted against the
           * page's own controls; a container injected by a third-party script,
           * carrying no author `tabindex` and exposing no visible control, is
           * not one of them and cannot be styled from here.
           *
           * Concretely, on /contact/ this is Cloudflare Turnstile's
           * `<div><input type="hidden" name="cf-turnstile-response"></div>`.
           * The first version of this test reported it as four 2.4.7 failures
           * on firefox and webkit. It is REPORTED rather than silently dropped,
           * so an unstyled stop the site DOES own can never hide here.
           */
          const nativelyFocusable = el.matches(
            'a[href], button, input, select, textarea, summary, [contenteditable="true"]',
          );
          const authored = nativelyFocusable || el.hasAttribute('tabindex');
          const visibleControl = Boolean((el.textContent || '').trim()) || el.getAttribute('aria-label');

          return {
            label,
            signature,
            indicated: hasOutline || hasShadow,
            notAuthored: !authored && !visibleControl,
            html: el.outerHTML.slice(0, 80).replace(/\s+/g, ' '),
          };
        });
        if (result === null) break;
        if (result.notAuthored) {
          thirdParty.push(result.html);
          continue;
        }
        if (!result.indicated) failures.push(`${result.label} [${result.signature}]`);
      }

      // Named, never silent: whatever was excluded is recorded on the test
      // result itself, so a reader of the report sees the coverage gap.
      if (thirdParty.length) {
        test.info().annotations.push({
          type: '2.4.7-not-asserted',
          description:
            `${pageDef.path}: ${thirdParty.length} non-authored focus stop(s) excluded ` +
            `(third-party injected, no author tabindex, no visible control): ` +
            [...new Set(thirdParty)].join(' | '),
        });
      }

      expect(
        failures,
        `2.4.7: elements received focus with no visible indicator (no outline, no box-shadow) ` +
          `on ${pageDef.path}:\n${failures.slice(0, 10).join('\n')}`,
      ).toEqual([]);
    });

    test(`${pageDef.name}: no keyboard trap — focus keeps advancing`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'domcontentloaded' });

      /**
       * 2.1.2 asks ONE question: "if focus can be moved to a component using a
       * keyboard, can focus be moved AWAY from that component using a keyboard?"
       * So the test is whether focus escapes — not whether consecutive readings
       * differ.
       *
       * ⚠️ The first version failed on 3 identical consecutive readings, and
       * reported a trap on /contact/ in firefox against a page that has none.
       * The culprit, read off the live DOM rather than guessed at:
       *
       *   <div><input type="hidden" name="cf-turnstile-response" ...></div>
       *
       * — the container Cloudflare Turnstile injects. It is third-party, carries
       * no author `tabindex`, and its only child is a hidden input.
       * `document.activeElement` reported it for four consecutive presses and
       * then focus moved on to the next link, so focus DID escape and 2.1.2 is
       * satisfied. (Both theories for WHY the parent document reports one
       * element across those presses were tested and killed: the container holds
       * no iframe — the document has none at all — and no shadow root. The
       * mechanism is undetermined and is NOT claimed here. It does not need to
       * be: the criterion's question is answered by whether focus escapes, and
       * it does.)
       *
       * Failing on repeats rather than on escape would have reported a keyboard
       * trap, one of the most serious findings this file can make, against
       * markup the site does not author and a page that is fine.
       */
      const PRESSES = 40;
      const sequence = [];
      for (let i = 0; i < PRESSES; i += 1) {
        await page.keyboard.press('Tab');
        sequence.push(
          await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return 'none';
            return `${el.tagName}|${(el.textContent || '').trim().slice(0, 30)}|${el.getAttribute('href') || ''}`;
          }),
        );
      }

      // A real trap holds focus to the END of the budget: once focus is caught,
      // no further press ever leaves. A run that ends is focus moving away.
      const tail = sequence[sequence.length - 1];
      let tailRun = 0;
      for (let i = sequence.length - 1; i >= 0 && sequence[i] === tail; i -= 1) tailRun += 1;

      // POSITIVE CONTROL: a page where Tab does nothing at all would produce one
      // unbroken run and could otherwise look like a pass under a laxer rule.
      expect(
        new Set(sequence).size,
        `2.1.2 control: Tab reached only ${new Set(sequence).size} distinct elements on ` +
          `${pageDef.path} in ${PRESSES} presses — the traversal itself is broken, so ` +
          `any trap verdict from it would be meaningless.`,
      ).toBeGreaterThan(3);

      expect(
        tailRun,
        `2.1.2: focus was held by ${tail} for the final ${tailRun} of ${PRESSES} Tab ` +
          `presses on ${pageDef.path} and never moved away. A keyboard user cannot escape this.`,
      ).toBeLessThan(PRESSES / 2);
    });
  }

  test('roving-tabindex tablists are operable by keyboard, not merely excused', async ({ page }) => {
    // The traversal test skips `tabindex="-1"` elements. That is only legitimate
    // if the pattern those elements belong to is itself keyboard-operable — so
    // prove it, rather than letting the exclusion quietly hide a real trap.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    // NAMED denominator: the homepage carries the screenshot carousel and the
    // journey strip. If this ever reads 0 the test below proves nothing.
    expect(count, 'the homepage must expose role="tab" controls to exercise').toBeGreaterThan(2);

    const state = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('[role="tab"]'));
      const selected = all.filter((t) => t.getAttribute('aria-selected') === 'true');
      return {
        total: all.length,
        selected: selected.length,
        selectedTabbable: selected.every((t) => t.getAttribute('tabindex') !== '-1'),
        unselectedRemoved: all
          .filter((t) => t.getAttribute('aria-selected') !== 'true')
          .every((t) => t.getAttribute('tabindex') === '-1'),
      };
    });

    // Exactly the roving pattern: the selected tab(s) carry the tab stop, the
    // rest are removed from the tab order and reached with arrow keys.
    expect(state.selected, 'each tablist must have a selected tab').toBeGreaterThan(0);
    expect(state.selectedTabbable, 'the SELECTED tab must be reachable by Tab').toBe(true);
    expect(state.unselectedRemoved, 'unselected tabs must be removed from the tab order').toBe(true);

    // …and arrow keys must actually move between them, which is the half that
    // makes removing them from the tab order acceptable.
    const first = tabs.first();
    await first.focus();
    const before = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent);
    await page.keyboard.press('ArrowRight');
    const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent);
    expect(
      after,
      'ArrowRight must move focus to the next tab — without it, removing the ' +
        'other tabs from the tab order strands them for keyboard users',
    ).not.toBe(before);
  });

  test('the skip link is the first stop and actually moves focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');

    const first = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName || '', text: (el?.textContent || '').trim(), href: el?.getAttribute('href') || '' };
    });

    // Same engine control as the traversal test: the skip link IS an <a href>,
    // so on an engine whose default tab order excludes links the first stop is
    // a button and this criterion cannot be measured here. Verified present in
    // the DOM either way, so a genuinely MISSING skip link still fails.
    const skipLinkExists = await page.evaluate(
      () => document.querySelector('a[href^="#"]')?.textContent?.toLowerCase().includes('skip') ?? false,
    );
    expect(skipLinkExists, 'the homepage must carry a skip link in the DOM').toBe(true);
    test.skip(
      first.tag !== 'A',
      `skip-link traversal NOT MEASURED on this engine: the first Tab stop was a ` +
        `${first.tag}, not a link — WebKit/Safari's default tab order excludes links. ` +
        `The skip link is present in the DOM and this passes on chromium and firefox.`,
    );

    expect(first.text.toLowerCase(), 'the first tab stop should be the skip link').toContain('skip');

    await page.keyboard.press('Enter');
    // 2.4.1: following the skip link must actually relocate the reading point,
    // not merely change the URL hash.
    const landed = await page.evaluate(() => window.location.hash);
    expect(landed, 'activating the skip link must move to the main-content target').toContain('main');
  });
});
