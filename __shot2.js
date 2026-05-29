const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto('http://localhost:8092/about.html', { waitUntil: 'networkidle' });
  // scroll through to trigger reveals
  for (let y = 0; y < 5000; y += 800) { await page.evaluate(_y => window.scrollTo(0, _y), y); await page.waitForTimeout(300); }
  await page.evaluate(() => window.scrollTo(0, 1400)); await page.waitForTimeout(600);
  await page.screenshot({ path: '__mid1.png' });
  await page.evaluate(() => window.scrollTo(0, 2200)); await page.waitForTimeout(600);
  await page.screenshot({ path: '__mid2.png' });
  // check computed opacity of key sections
  const info = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('main section, main aside')];
    return secs.map(s => ({ cls: s.className.slice(0,40), op: getComputedStyle(s).opacity, h: s.offsetHeight, vis: getComputedStyle(s).visibility }));
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})();
