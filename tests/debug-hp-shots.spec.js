const { test } = require('@playwright/test');
const BASE = 'http://localhost:8092';

test.describe('Honest visual audit — home', () => {
  for (const v of [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'desktop-1920', w: 1920, h: 1080 },
    { name: 'tablet-768',   w: 768,  h: 1024 },
    { name: 'mobile-390',   w: 390,  h: 844 },
  ]) {
    test('Home @ ' + v.name, async ({ page }) => {
      await page.setViewportSize({ width: v.w, height: v.h });
      await page.goto(`${BASE}/?_=` + Date.now(), { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500); // GSAP + nav-inject + scroll-reveal observers

      // Above-the-fold shot
      await page.screenshot({ path: `/tmp/hp-screens/${v.name}-01-hero.png`, fullPage: false });

      // Sector marquee + metrics band (scroll to ~700px)
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/tmp/hp-screens/${v.name}-02-marquee-stats.png`, fullPage: false });

      // Live demo / how-it-works (scroll ~1600)
      await page.evaluate(() => window.scrollTo(0, 1800));
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/tmp/hp-screens/${v.name}-03-mid.png`, fullPage: false });

      // Products bento (scroll ~3200)
      await page.evaluate(() => window.scrollTo(0, 3400));
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/tmp/hp-screens/${v.name}-04-products.png`, fullPage: false });

      // Sectors + trust + CTA (scroll ~4500)
      await page.evaluate(() => window.scrollTo(0, 4800));
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/tmp/hp-screens/${v.name}-05-bottom.png`, fullPage: false });
    });
  }
});
