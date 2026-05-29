const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:8092/crowcyber.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: '__ref_cyber_hero.png' });
  await browser.close();
})();
