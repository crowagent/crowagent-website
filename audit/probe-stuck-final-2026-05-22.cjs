const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const p of ['/privacy.html', '/blog/index.html', '/glossary/csrd.html']) {
    const page = await ctx.newPage();
    await page.goto('http://localhost:8092' + p, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h + 800; y += 350) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 150));
      }
    });
    await page.waitForTimeout(3000);
    const stuck = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      const out = [];
      all.forEach(e => {
        const cs = getComputedStyle(e);
        const o = parseFloat(cs.opacity);
        const rect = e.getBoundingClientRect();
        if (!isNaN(o) && o > 0.02 && o < 0.5 && e.offsetParent && rect.width > 50 && rect.height > 20) {
          out.push({ tag: e.tagName, cls: e.className.toString().slice(0, 100), opacity: cs.opacity, msReveal: e.classList.contains('ms-reveal'), msIn: e.classList.contains('ms-in') });
        }
      });
      return { url: location.pathname, total: out.length, sample: out.slice(0, 10) };
    });
    console.log(JSON.stringify(stuck, null, 2));
    await page.close();
  }
  await browser.close();
})();
