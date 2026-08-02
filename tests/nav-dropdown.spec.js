/**
 * Regression gate for the Products dropdown.
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
 * Runs against the Astro preview, not production, until cutover:
 *   ASTRO_URL=http://localhost:8095 npx playwright test tests/nav-dropdown.spec.js
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.ASTRO_URL || 'http://localhost:8095';
const TRIGGER = '#nav-products-trigger';
const PANEL = '#nav-mega-panel';

/** Visible state and reported state must always agree — that is WCAG 4.1.2. */
async function expectState(page, open) {
  await expect(page.locator(PANEL)).toBeVisible({ visible: open });
  await expect(page.locator(TRIGGER)).toHaveAttribute('aria-expanded', String(open));
}

test.describe('Products dropdown — hover-capable pointer', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  });

  test('starts closed', async ({ page }) => {
    await expectState(page, false);
  });

  test('hover opens it and moving away closes it', async ({ page }) => {
    await page.locator(TRIGGER).hover();
    await expectState(page, true);
    // Park the pointer well clear; the close is deliberately delayed so the
    // diagonal travel from trigger to panel does not dismiss it.
    await page.mouse.move(30, 750);
    await expect(page.locator(PANEL)).toBeHidden();
    await expectState(page, false);
  });

  test('Enter toggles it both ways', async ({ page }) => {
    // Focus rather than click, so the pointer never enters the dropdown and
    // this measures the keyboard path alone.
    await page.locator(TRIGGER).focus();
    await page.keyboard.press('Enter');
    await expectState(page, true);
    await page.keyboard.press('Enter');
    await expectState(page, false);
  });

  test('Escape closes it and returns focus to the trigger', async ({ page }) => {
    await page.locator(TRIGGER).focus();
    await page.keyboard.press('Enter');
    await expectState(page, true);
    await page.keyboard.press('Escape');
    await expectState(page, false);
    await expect(page.locator(TRIGGER)).toBeFocused();
  });

  test('a click outside closes it', async ({ page }) => {
    await page.locator(TRIGGER).focus();
    await page.keyboard.press('Enter');
    await expectState(page, true);
    await page.mouse.click(700, 620);
    await expectState(page, false);
  });
});

test.describe('Products dropdown — coarse pointer that cannot hover', () => {
  test.use({ viewport: { width: 1440, height: 900 }, hasTouch: true });

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

    await expectState(page, false);
    await page.locator(TRIGGER).tap();
    await expectState(page, true);
    await page.locator(TRIGGER).tap();
    await expectState(page, false);
  });
});
