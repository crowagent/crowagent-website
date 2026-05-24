const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/?v=' + Date.now(), { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('.hero-headline, .hero h1, main h1');
    const cs = getComputedStyle(h1);
    // Walk all sheets, find rules with font-size targeting this h1
    const matches = [];
    for (const s of document.styleSheets) {
      let rules; try { rules = s.cssRules; } catch(e){ continue; }
      const walk = (rs, mq) => {
        for (const r of rs) {
          if (r.cssRules) walk(r.cssRules, r.conditionText || mq);
          if (r.selectorText && r.style && r.style.getPropertyValue('font-size')) {
            try { if (h1.matches(r.selectorText)) {
              matches.push({ sel:r.selectorText, fs:r.style.getPropertyValue('font-size'), important:r.style.getPropertyPriority('font-size'), mq: mq||'' });
            }} catch(e){}
          }
        }
      };
      walk(rules);
    }
    return { fs:cs.fontSize, ls:cs.letterSpacing, fw:cs.fontWeight, h1class:h1.className, matchCount:matches.length, matches };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
