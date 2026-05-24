const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8092/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('.home-demo-cycle__dots').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);
  // Now apply an inline style and see if it overrides
  const result = await page.evaluate(() => {
    const ol = document.querySelector('.home-demo-cycle__dots');
    ol.style.paddingInlineStart = '0px';
    ol.style.paddingLeft = '0px';
    const cs = getComputedStyle(ol);
    return { afterInline: cs.paddingInlineStart, paddingLeft: cs.paddingLeft };
  });
  console.log('after inline:', result);
  // Also check: list all CSS sheets and dump the rule from each
  const sheets = await page.evaluate(() => {
    const out = [];
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || [];
        for (const r of rules) {
          if (r.cssText && r.cssText.includes('home-demo-cycle__dots')) {
            out.push({ href: sheet.href, rule: r.cssText.slice(0, 300) });
          }
        }
      } catch (e) { out.push({ href: sheet.href, err: String(e).slice(0, 80) }); }
    }
    return out;
  });
  console.log('sheets with rule:', JSON.stringify(sheets, null, 2));
  await browser.close();
})();
