/**
 * Regression gate for the ⌘K command palette.
 *
 * The nav search button shipped as a DEAD CONTROL: `[data-cmdk-open]` existed
 * with no handler anywhere in the rebuild. Nothing static catches that — the
 * markup is perfectly valid and axe is happy with a button that does nothing.
 * Only pressing it finds out.
 *
 * The a11y assertions are not decoration. This pattern's failure mode is that
 * it looks and feels correct while being unusable without sight: focus must
 * stay in the input so typing keeps working, the active row must be reported
 * through aria-activedescendant, and each row must be exactly ONE interactive
 * element (the first implementation nested an <a> inside role="option" and axe
 * reported nested-interactive on every row).
 *
 *   ASTRO_URL=http://localhost:8095 npx playwright test tests/command-palette.spec.js
 */
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE = process.env.ASTRO_URL || 'http://localhost:8095';
const ROOT = '#cmdk';
const INPUT = '#cmdk-input';
const OPTION = '#cmdk-list [role="option"]';

test.use({ viewport: { width: 1440, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
});

test('starts hidden and the nav search button opens it', async ({ page }) => {
  await expect(page.locator(ROOT)).toBeHidden();
  await page.locator('[data-cmdk-open]').first().click();
  await expect(page.locator(ROOT)).toBeVisible();
  await expect(page.locator(INPUT)).toBeFocused();
});

test('Ctrl+K opens it and Escape closes it', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await expect(page.locator(ROOT)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(ROOT)).toBeHidden();
});

/*
 * 2026-08-05 (O-16). This read `document.getElementById('cmdk-data')`, which
 * returns null: there is no #cmdk-data element in the build and no reference
 * to that id anywhere in astro/src either. The index moved to a generated
 * /search-index.json that the palette fetches at runtime, so the test was
 * reading a mechanism that no longer exists and failing with "Cannot read
 * properties of null" rather than with anything about the index.
 *
 * Rewritten against the real source, and strengthened while it was open: the
 * stated intent was "a hand-maintained index rots into dead links", and the
 * old version never checked that a single href resolved. It does now — every
 * entry is fetched, and a 404 fails the test naming the entry.
 */
test('the index is built from real routes, not hand-written', async ({ page, request }) => {
  const entries = await page.evaluate(async () => {
    const res = await fetch('/search-index.json');
    return res.ok ? res.json() : null;
  });
  expect(entries, '/search-index.json must be served and parse as JSON').not.toBeNull();
  expect(entries.length).toBeGreaterThan(30);

  for (const e of entries) {
    expect(e.href, `entry "${e.title}" must have an href`).toBeTruthy();
    expect(e.title.trim().length).toBeGreaterThan(0);
  }

  // Every href must be a route that EXISTS. Checked over HTTP rather than
  // against a hand-kept route list, so it stays true as routes come and go.
  const dead = [];
  for (const e of entries) {
    if (/^https?:\/\//i.test(e.href) || e.href.startsWith('#')) continue;
    const res = await request.get(`${BASE}${e.href}`);
    if (res.status() >= 400) dead.push(`${e.title} -> ${e.href} (${res.status()})`);
  }
  expect(dead, 'the command palette must not offer a dead route').toEqual([]);
});

test('typing filters and ranks by relevance', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await page.locator(INPUT).type('ppn');
  await expect(page.locator(OPTION).first()).toContainText(/ppn/i);
});

test('arrow keys move the active option WITHOUT moving focus', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await page.locator(INPUT).type('c');
  await expect(page.locator(INPUT)).toHaveAttribute('aria-activedescendant', 'cmdk-opt-0');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator(INPUT)).toHaveAttribute('aria-activedescendant', 'cmdk-opt-1');
  // The whole point: the user must still be able to type while arrowing.
  await expect(page.locator(INPUT)).toBeFocused();
});

test('Enter navigates to the active option', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await page.locator(INPUT).type('ppn');
  const href = await page.locator(OPTION).first().getAttribute('href');
  await page.keyboard.press('Enter');
  await page.waitForURL(`**${href.replace(/\/$/, '')}**`);
});

test('each row is exactly one interactive element', async ({ page }) => {
  await page.keyboard.press('Control+k');
  const nested = await page.evaluate(() =>
    [...document.querySelectorAll('#cmdk-list [role="option"]')].filter(
      (o) => o.querySelectorAll('a,button,input,select,textarea').length > 0
    ).length
  );
  expect(nested, 'no option may contain another interactive element').toBe(0);
  // The href is kept deliberately, so middle-click and "copy link" still work.
  await expect(page.locator(OPTION).first()).toHaveAttribute('href', /.+/);
});

test('no WCAG 2.2 AA violations while open', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await expect(page.locator(ROOT)).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('a query with no matches shows the empty state', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await page.locator(INPUT).type('zzzzqqqq');
  await expect(page.locator('.cmdk__empty')).toBeVisible();
  await expect(page.locator(OPTION)).toHaveCount(0);
});
