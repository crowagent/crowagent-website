const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  // fresh context, NO cookie clearing -> banner shows (real first visit)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/security.html', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  const m = await page.evaluate(() => {
    const h1 = document.querySelector('.ca-hero-title');
    const r = h1.getBoundingClientRect();
    const phrases = [...h1.children];
    return {
      h1Height: Math.round(r.height),
      phraseCount: phrases.length,
      phrases: phrases.map(p => ({ text: p.textContent.trim().slice(0,40), h: Math.round(p.getBoundingClientRect().height), disp: getComputedStyle(p).display }))
    };
  });
  console.log(JSON.stringify(m, null, 2));
  await page.screenshot({ path: '__sec_firstvisit_1280.png', clip: { x:0, y:380, width: 1280, height: 420 } });
  await ctx.close();
  await browser.close();
})();
