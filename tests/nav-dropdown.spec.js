/**
 * Regression gate for the header dropdowns — ALL of them, not one named one.
 *
 * WHY THIS FILE EXISTS. The dropdown shipped in a state where it could never be
 * closed. The CSS opened the panel on `:hover`, `:focus-within` OR `.force-open`
 * while the script owned only `.force-open`; clicking the trigger FOCUSES it, so
 * `:focus-within` held the panel open while the script set aria-expanded="false".
 * The control reported a state it did not have (WCAG 4.1.2) and Escape failed
 * the same way, because its handler ends by returning focus to the trigger.
 *
 * Then the fix introduced a second, quieter defect: opening on `mouseenter`
 * makes the menu unopenable by TOUCH, because a tap fires a synthetic
 * mouseenter before the click, so the sequence is open-then-toggle and the net
 * result is closed. Nothing in the markup or the handlers reveals that. It only
 * appears when you drive the real control on a real non-hover pointer.
 *
 * Both bugs are invisible to axe and to any static check, which is precisely why
 * they get a behavioural test. Every close path is asserted, on both pointer
 * types, because "it opens" was never the part that was broken.
 *
 * ── PARAMETERISED, 2026-08-04 ───────────────────────────────────────────────
 *
 * The owner split Products into Products + Resources. The implementation put
 * both menus on ONE component (src/components/nav/NavDropdown.astro), so this
 * file runs the same battery over both rather than testing the first menu and
 * trusting the second. A third menu is one entry in MENUS below — and if a
 * future menu is ever hand-rolled instead of using the component, these tests
 * are what notices.
 *
 * `both menus are independent` is the test that only exists because there are
 * now two: the initialiser is written once and runs for every dropdown on the
 * page, and the failure mode of getting that wrong is a shared open flag where
 * opening one menu closes the other or, worse, opens both.
 *
 * Keyboard coverage matches the pattern the component implements — Disclosure
 * Navigation, not an ARIA menu. Tab is deliberately NOT trapped inside a panel,
 * because a disclosure is not a modal; arrow keys are an enhancement on top.
 *
 * Runs against the Astro preview, not production, until cutover:
 *   ASTRO_URL=http://localhost:8095 npx playwright test tests/nav-dropdown.spec.js
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.ASTRO_URL || 'http://localhost:8095';

/** Every dropdown in the header. Ids come from NAV.menus[].id in src/data/nav.ts. */
const MENUS = [
  { name: 'Products', id: 'products' },
  { name: 'Resources', id: 'resources' },
];

const triggerSel = (id) => `#nav-${id}-trigger`;
const panelSel = (id) => `#nav-${id}-panel`;

/** Visible state and reported state must always agree — that is WCAG 4.1.2. */
async function expectState(page, id, open) {
  await expect(page.locator(panelSel(id))).toBeVisible({ visible: open });
  await expect(page.locator(triggerSel(id))).toHaveAttribute('aria-expanded', String(open));
}

for (const menu of MENUS) {
  const TRIGGER = triggerSel(menu.id);
  const PANEL = panelSel(menu.id);

  test.describe(`${menu.name} dropdown — hover-capable pointer`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    });

    test('starts closed', async ({ page }) => {
      await expectState(page, menu.id, false);
    });

    test('hover opens it and moving away closes it', async ({ page }) => {
      await page.locator(TRIGGER).hover();
      await expectState(page, menu.id, true);
      // Park the pointer well clear; the close is deliberately delayed so the
      // diagonal travel from trigger to panel does not dismiss it.
      await page.mouse.move(30, 750);
      await expect(page.locator(PANEL)).toBeHidden();
      await expectState(page, menu.id, false);
    });

    test('Enter toggles it both ways', async ({ page }) => {
      // Focus rather than click, so the pointer never enters the dropdown and
      // this measures the keyboard path alone.
      await page.locator(TRIGGER).focus();
      await page.keyboard.press('Enter');
      await expectState(page, menu.id, true);
      await page.keyboard.press('Enter');
      await expectState(page, menu.id, false);
    });

    test('Escape closes it and returns focus to the trigger', async ({ page }) => {
      await page.locator(TRIGGER).focus();
      await page.keyboard.press('Enter');
      await expectState(page, menu.id, true);
      await page.keyboard.press('Escape');
      await expectState(page, menu.id, false);
      await expect(page.locator(TRIGGER)).toBeFocused();
    });

    test('a click outside closes it', async ({ page }) => {
      await page.locator(TRIGGER).focus();
      await page.keyboard.press('Enter');
      await expectState(page, menu.id, true);
      await page.mouse.click(700, 620);
      await expectState(page, menu.id, false);
    });

    test('ArrowDown opens it onto the first link, ArrowUp onto the last', async ({ page }) => {
      const items = page.locator(`${PANEL} .ca-mega-item`);
      const count = await items.count();
      expect(count, 'a menu with no rows is not a menu').toBeGreaterThan(1);

      await page.locator(TRIGGER).focus();
      await page.keyboard.press('ArrowDown');
      await expectState(page, menu.id, true);
      await expect(items.first()).toBeFocused();

      await page.keyboard.press('Escape');
      await page.locator(TRIGGER).focus();
      await page.keyboard.press('ArrowUp');
      await expectState(page, menu.id, true);
      await expect(items.last()).toBeFocused();
    });

    test('arrow keys move between links and wrap', async ({ page }) => {
      const items = page.locator(`${PANEL} .ca-mega-item`);
      const count = await items.count();

      await page.locator(TRIGGER).focus();
      await page.keyboard.press('ArrowDown');
      await expect(items.first()).toBeFocused();

      await page.keyboard.press('ArrowDown');
      await expect(items.nth(1)).toBeFocused();

      // Up from the second is the first; up again wraps to the last.
      await page.keyboard.press('ArrowUp');
      await expect(items.first()).toBeFocused();
      await page.keyboard.press('ArrowUp');
      await expect(items.nth(count - 1)).toBeFocused();

      await page.keyboard.press('Home');
      await expect(items.first()).toBeFocused();
      await page.keyboard.press('End');
      await expect(items.nth(count - 1)).toBeFocused();
    });

    test('Escape from inside the panel closes it and returns focus', async ({ page }) => {
      await page.locator(TRIGGER).focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Escape');
      await expectState(page, menu.id, false);
      await expect(page.locator(TRIGGER)).toBeFocused();
    });

    test('it is a disclosure, not an ARIA menu', async ({ page }) => {
      // role="menu" promises roving tabindex and arrow-only traversal, which
      // these links do not implement and should not: they are links.
      await expect(page.locator(PANEL)).not.toHaveAttribute('role', 'menu');
      await expect(page.locator(TRIGGER)).toHaveAttribute('aria-controls', PANEL.slice(1));
      expect(await page.locator(`${PANEL} [role="menuitem"]`).count()).toBe(0);
    });
  });

  test.describe(`${menu.name} dropdown — coarse pointer that cannot hover`, () => {
    test.use({ viewport: { width: 1440, height: 900 }, hasTouch: true });

    /*
     * 2026-08-05 (O-16). Chromium only, for the reason the test body already
     * explains: Playwright has no first-class hover emulation, so reporting a
     * non-hover pointer goes through CDP's Emulation.setEmulatedMedia, and
     * `context.newCDPSession()` throws on Firefox and WebKit. Without this
     * guard the test contributed two failures per non-Chromium engine whose
     * message was about CDP, not about touch.
     *
     * This is a real coverage gap and should be named as one rather than
     * papered over: the defect being guarded against — a menu no touch user
     * can open — is most likely to bite on iOS, which is WebKit. The behaviour
     * is verified on the Chromium engine only. Closing it properly needs
     * Playwright to grow hover emulation, or a device-descriptor-based mobile
     * project.
     */
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'hover-media emulation needs CDP, which only Chromium exposes',
    );

    test('tap opens and closes it', async ({ page, context }) => {
      const cdp = await context.newCDPSession(page);
      // Playwright has no first-class hover emulation, so this goes through CDP.
      // Without it the page still reports (hover: hover) and the test would pass
      // while the real defect — a menu no touch user can open — survived.
      await cdp.send('Emulation.setEmulatedMedia', {
        features: [
          { name: 'hover', value: 'none' },
          { name: 'pointer', value: 'coarse' },
        ],
      });
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

      const canHover = await page.evaluate(
        () => matchMedia('(hover: hover) and (pointer: fine)').matches
      );
      expect(canHover, 'emulation must actually report a non-hover pointer').toBe(false);

      await expectState(page, menu.id, false);
      await page.locator(TRIGGER).tap();
      await expectState(page, menu.id, true);
      await page.locator(TRIGGER).tap();
      await expectState(page, menu.id, false);
    });
  });
}

test.describe('the header dropdowns are independent', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('opening one does not open or close the other', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const [a, b] = MENUS;

    await page.locator(triggerSel(a.id)).focus();
    await page.keyboard.press('Enter');
    await expectState(page, a.id, true);
    await expectState(page, b.id, false);

    // Focus leaving the first dropdown closes it; the second opens on its own.
    await page.locator(triggerSel(b.id)).focus();
    await page.keyboard.press('Enter');
    await expectState(page, b.id, true);
    await expectState(page, a.id, false);
  });
});

test.describe('the nav hovers as one', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /**
   * O-21/O-27. Hover used to change the HUE, and to two different hues in the
   * same row: top-level links went cyan, the Products trigger went teal, and
   * the rows inside the panel did nothing at all because they were already at
   * full white. The reference build lifts brightness and does not shift hue.
   *
   * Asserted as a property — "rest is not white, hover is white, everywhere" —
   * rather than against fixed rgb strings, so a token change is not a failure
   * but a fork reappearing is.
   */
  const WHITE = 'rgb(255, 255, 255)';

  /*
   * 2026-08-05 (O-16). This failed as "Expected rgb(255,255,255), Received
   * rgb(210,219,238)" and looked like a hover regression. It is not one:
   * rgb(210,219,238) is the REST colour, and the call log's last line was
   * "Test timeout of 30000ms exceeded" — the poll was still polling when the
   * test deadline arrived and reported the last value it had seen. Measured
   * directly afterwards, all four top-level links, both triggers and every
   * panel row go from rgb(210,219,238) to pure white on hover. The property
   * holds; the budget did not.
   *
   * The test hovers roughly twenty separate elements, each with a settle poll,
   * and it shares the machine with three other workers. test.slow() triples
   * the budget rather than raising the global timeout, so one deliberately
   * long test does not buy every other test permission to hang.
   *
   * 2026-08-05, second pass: test.slow()'s 90s was enough on Chromium and
   * Firefox and NOT on WebKit, which drives roughly twenty hover transitions
   * appreciably slower. Replaced with an explicit budget so the number is
   * visible and deliberate rather than a multiplier of a global default.
   */
  test.setTimeout(240000);

  test('every nav link, top level and in a panel, lifts to white on hover', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

    const topLinks = page.locator('.ca-nav-links > a');
    for (let i = 0; i < (await topLinks.count()); i++) {
      const link = topLinks.nth(i);
      await page.mouse.move(5, 700);
      const rest = await link.evaluate((el) => getComputedStyle(el).color);
      expect(rest, 'a nav link at rest must have somewhere to lift to').not.toBe(WHITE);
      await link.hover();
      await expect
        .poll(async () => link.evaluate((el) => getComputedStyle(el).color))
        .toBe(WHITE);
    }

    for (const menu of MENUS) {
      const trigger = page.locator(triggerSel(menu.id));
      await page.mouse.move(5, 700);
      const rest = await trigger.evaluate((el) => getComputedStyle(el).color);
      expect(rest).not.toBe(WHITE);
      await trigger.hover();
      await expect
        .poll(async () => trigger.evaluate((el) => getComputedStyle(el).color))
        .toBe(WHITE);

      const items = page.locator(`${panelSel(menu.id)} .ca-mega-item`);
      for (let i = 0; i < (await items.count()); i++) {
        const item = items.nth(i);
        await trigger.hover();
        const itemRest = await item.evaluate((el) => getComputedStyle(el).color);
        expect(itemRest, 'a dropdown row must have hover feedback too').not.toBe(WHITE);
        await item.hover();
        await expect
          .poll(async () => item.evaluate((el) => getComputedStyle(el).color))
          .toBe(WHITE);
      }
    }
  });
});
