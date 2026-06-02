const { test } = require('@playwright/test');
const BASE = 'http://localhost:8092';
test('hero v2', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/?_=` + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });

  // Measure hero height
  const m = await page.evaluate(() => {
    const hero = document.querySelector('#hero, section.hero');
    return { heroHeight: hero ? hero.getBoundingClientRect().height : null };
  });
  console.log('HERO HEIGHT:', m.heroHeight);

  await page.screenshot({ path: 'tests/v2-01-hero.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/v2-02-audience.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/v2-03-walkthrough.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/v2-04-frameworks-strip.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
});
