const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:8092/crowcyber.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '__cyber_1280_top.png', clip: { x:0, y:0, width: 1280, height: 900 } });
  const data = await page.evaluate(() => {
    const h1 = document.querySelector('.ca-hero-title');
    const top = [...h1.children];
    return {
      html: h1.outerHTML.slice(0, 400),
      directChildren: top.map(c => ({ tag: c.tagName, cls: c.className, disp: getComputedStyle(c).display, text: c.textContent.trim().slice(0,40) }))
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
