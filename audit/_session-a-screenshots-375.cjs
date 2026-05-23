/**
 * WP-WEB-AUDIT-001 Session A — 375 retry with longer timeout + manual settle.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'screenshots', '2026-05-A');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  const file = path.join(OUT, '375-home.png');
  try {
    await page.goto('http://localhost:8092/', { waitUntil: 'load', timeout: 60000 });
    // Force lazy-loaded sections to commit by scrolling to bottom in chunks.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let total = 0;
        const step = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total >= document.documentElement.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 60);
      });
    });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await page.screenshot({ path: file, fullPage: true, timeout: 120000, animations: 'disabled' });
    const stat = fs.statSync(file);
    console.log(`[OK] 375 home -> ${file} (${stat.size} bytes)`);
  } catch (e) {
    console.error(`[FAIL] 375 home: ${e.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
