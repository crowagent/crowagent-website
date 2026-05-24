const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/?v=' + Date.now(), { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('.hero-headline');
    const cs = getComputedStyle(h1);
    const rs = getComputedStyle(document.documentElement);
    return {
      computedFs: cs.fontSize,
      cssTextInline: h1.style.cssText,
      hasInlineStyle: !!h1.getAttribute('style'),
      ancestorWithFontSize: (function(){
        let p = h1; while(p && p !== document.documentElement) { if (p.style && p.style.fontSize) return {tag:p.tagName, fs:p.style.fontSize}; p = p.parentElement; }
        return null;
      })(),
      tokens: {
        fontSizeH1: rs.getPropertyValue('--font-size-h1'),
        f8h1: rs.getPropertyValue('--f8-h1'),
        textH1: rs.getPropertyValue('--text-h1'),
        h1Display: rs.getPropertyValue('--h1-display'),
      }
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
