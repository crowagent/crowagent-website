const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:8092/about.html', { waitUntil: 'networkidle' });
  // approach section
  await page.evaluate(() => document.querySelector('#hero').nextElementSibling.scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: '__sec_approach.png' });
  // timeline + company details
  await page.evaluate(() => document.querySelector('#timeline').scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: '__sec_timeline.png' });
  // newsletter
  await page.evaluate(() => document.querySelector('.ca-newsletter').scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: '__sec_news.png' });
  await browser.close();
})();
