// SF46 Phase 1 Step 1.4 — verify z-index ladder resolves correctly
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

async function zof(page, sel) {
  return await page.$eval(sel, el => parseInt(getComputedStyle(el).zIndex, 10));
}

test('z-index ladder — cookie banner sits above back-to-top', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

  const cookieZ = await zof(page, '#ca-cookie');
  const backTopZ = await zof(page, '#back-to-top').catch(() => null);

  expect(cookieZ).toBe(1150);
  if (backTopZ !== null) expect(backTopZ).toBe(1000);
  expect(cookieZ).toBeGreaterThan(backTopZ ?? 0);
});

test('z-index ladder — locale dropdown sits at mega-menu tier', async ({ page }) => {
  await page.goto(`${BASE}/`);
  const dd = await page.$('.locale-dropdown');
  if (!dd) test.skip(true, 'no locale dropdown on this page');
  const z = await dd.evaluate(el => parseInt(getComputedStyle(el).zIndex, 10));
  expect(z).toBe(300);
});

test('z-index ladder — scroll-progress at toast tier', async ({ page }) => {
  await page.goto(`${BASE}/`);
  const sp = await page.$('.scroll-progress');
  if (!sp) test.skip(true, 'no scroll-progress on this page');
  const z = await sp.evaluate(el => parseInt(getComputedStyle(el).zIndex, 10));
  expect(z).toBe(1200);
});

test('z-index ladder — skip-link at toast tier', async ({ page }) => {
  await page.goto(`${BASE}/`);
  const sl = await page.$('.skip-link, .skip-to-content, a.skip-link');
  expect(sl).not.toBeNull();
  const z = await sl.evaluate(el => parseInt(getComputedStyle(el).zIndex, 10));
  expect(z).toBe(1200);
});

test('z-index ladder — no insane stacks remaining', async ({ page }) => {
  await page.goto(`${BASE}/`);
  const insane = await page.evaluate(() => {
    const all = [];
    for (const el of document.querySelectorAll('*')) {
      const z = parseInt(getComputedStyle(el).zIndex, 10);
      if (!Number.isNaN(z) && z > 1300) all.push({ tag: el.tagName, id: el.id, cls: el.className, z });
    }
    return all;
  });
  expect(insane).toEqual([]);
});
