const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/?v=' + Date.now(), { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);
  // Walk through and find ANY rule that has fontSize matching 56px or .hero-split-h1
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('.hero-headline');
    if (!h1) return 'no h1';
    const sheets = [...document.styleSheets];
    const m = [];
    for (const s of sheets) {
      let rules; try { rules = s.cssRules; } catch(e){ continue; }
      const walk = (rs, mq) => {
        for (const r of rs) {
          if (r.cssRules) walk(r.cssRules, r.conditionText||mq);
          if (r.selectorText && (r.selectorText.includes('hero-split-h1') || r.selectorText.includes('hero-headline'))) {
            const fs = r.style && r.style.getPropertyValue('font-size');
            if (fs) m.push({sel:r.selectorText, fs, imp:r.style.getPropertyPriority('font-size'), mq:mq||''});
          }
        }
      };
      walk(rules);
    }
    return m;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
