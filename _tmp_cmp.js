const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8092/crowcyber.html?n=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1.ca-hero-title');
    return { fontSize: getComputedStyle(h1).fontSize, text: h1.innerText };
  });
  console.log('crowcyber 1280', JSON.stringify(info));
  await page.screenshot({ path: '_tmp_cyber_1280.png', clip: { x:0, y:0, width:1280, height:750 } });
  await browser.close();
})();
