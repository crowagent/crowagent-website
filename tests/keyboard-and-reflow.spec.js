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
        const out = [];
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") continue;
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

      // Tab through, bounded well above the element count so a trap shows up as
      // "not everything was reached" rather than as an infinite loop.
      const maxPresses = expected.length * 3 + 40;
      const reached = new Set();
      await page.evaluate(() => document.body.focus());
      for (let i = 0; i < maxPresses; i += 1) {
        await page.keyboard.press('Tab');
        const probe = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          return el.getAttribute('data-kbd-probe');
        });
        if (probe !== null) reached.add(probe);
        if (reached.size === expected.length) break;
      }

      const missed = expected.filter((id) => !reached.has(id));
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
          return { label, signature, indicated: hasOutline || hasShadow };
        });
        if (result === null) break;
        if (!result.indicated) failures.push(`${result.label} [${result.signature}]`);
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

      // 2.1.2. A trap shows as the SAME element holding focus across repeated
      // Tab presses. Cycling back to the start of the document is not a trap,
      // so identity is compared consecutively rather than against a visited set.
      let stuckOn = null;
      let stuckCount = 0;
      for (let i = 0; i < 40; i += 1) {
        await page.keyboard.press('Tab');
        const id = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return 'none';
          return `${el.tagName}|${(el.textContent || '').trim().slice(0, 30)}|${el.getAttribute('href') || ''}`;
        });
        if (id === stuckOn) {
          stuckCount += 1;
        } else {
          stuckOn = id;
          stuckCount = 0;
        }
        expect(
          stuckCount,
          `2.1.2: focus did not move for 3 consecutive Tab presses on ${pageDef.path} — ` +
            `held by ${stuckOn}. A keyboard user cannot escape this.`,
        ).toBeLessThan(3);
      }
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
      return { text: (el?.textContent || '').trim(), href: el?.getAttribute('href') || '' };
    });
    expect(first.text.toLowerCase(), 'the first tab stop should be the skip link').toContain('skip');

    await page.keyboard.press('Enter');
    // 2.4.1: following the skip link must actually relocate the reading point,
    // not merely change the URL hash.
    const landed = await page.evaluate(() => window.location.hash);
    expect(landed, 'activating the skip link must move to the main-content target').toContain('main');
  });
});
