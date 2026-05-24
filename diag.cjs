const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/pricing.html?v=' + Date.now(), { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('main h1, .page-title');
    const cs = getComputedStyle(h1);
    // Get all matched CSS rules using inspector trick via document.styleSheets
    const sheets = [...document.styleSheets];
    const matches = [];
    for (const s of sheets) {
      let rules; try { rules = s.cssRules; } catch(e){ continue; }
      for (const r of rules) {
        if (r.selectorText && h1.matches(r.selectorText.split(',').map(x=>x.trim()).filter(x=>!x.startsWith('@')).join(',') || '*:not(*)')) {
          if (r.cssText.includes('font-size')) matches.push({ sel:r.selectorText, src: s.href||'inline', css:r.cssText.slice(0,200) });
        }
      }
    }
    return { fs:cs.fontSize, ls:cs.letterSpacing, fw:cs.fontWeight, count:matches.length, last5:matches.slice(-8) };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
