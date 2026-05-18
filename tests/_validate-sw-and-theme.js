// Ad-hoc validation script for P2f + TH1 — run via Playwright.
// node-less smoke. Removed after use.
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const BASE = process.env.BASE_URL || 'http://localhost:8092';

  await page.goto(BASE + '/');
  // Give the SW time to install + activate.
  await page.waitForTimeout(2500);

  const swState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const keys = await caches.keys();
    return {
      keys,
      controller: !!navigator.serviceWorker.controller,
      regScope: reg ? reg.scope : null,
    };
  });
  console.log('SW state:', JSON.stringify(swState));

  // Light theme screenshot.
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/light-theme-home.png', fullPage: false });
  const lightBg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  console.log('Light --bg:', lightBg);

  // Reset to dark.
  await page.evaluate(() => { document.documentElement.removeAttribute('data-theme'); });
  await page.waitForTimeout(300);
  const darkBg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  console.log('Default --bg:', darkBg);

  await browser.close();
})();
