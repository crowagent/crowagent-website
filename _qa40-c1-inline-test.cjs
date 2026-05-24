const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8092/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // Use setProperty with priority "important"
  const out = await page.evaluate(() => {
    const ol = document.querySelector('.home-demo-cycle__dots');
    ol.style.setProperty('padding-inline-start', '0px', 'important');
    ol.style.setProperty('padding-left', '0px', 'important');
    const cs = getComputedStyle(ol);
    return { paddingInlineStart: cs.paddingInlineStart, paddingLeft: cs.paddingLeft };
  });
  console.log('after important inline:', out);
  await browser.close();
})();
