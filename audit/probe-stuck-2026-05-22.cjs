const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/pricing.html', { waitUntil: 'networkidle' });
  // scroll fully
  await page.evaluate(async () => {
    const totalH = document.body.scrollHeight;
    let y = 0;
    while (y < totalH) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 100));
      y += 500;
    }
    window.scrollTo(0, totalH);
    await new Promise(r => setTimeout(r, 300));
  });
  await page.waitForTimeout(1200);
  const stuck = await page.evaluate(() => {
    const sel = ['.sv-card', '.partner-card', '.f10-kanban-col', '.f10-kanban-card', '.faq-group', '.pricing-trust-pill', '.f10-timeline-item'];
    const out = [];
    for (const s of sel) {
      const els = document.querySelectorAll(s);
      els.forEach(e => {
        const cs = getComputedStyle(e);
        const rect = e.getBoundingClientRect();
        if (parseFloat(cs.opacity) < 0.5 && e.offsetParent) {
          out.push({ s, opacity: cs.opacity, top: Math.round(rect.top), bottom: Math.round(rect.bottom), gsap: !!window.gsap });
        }
      });
    }
    return out.slice(0, 20);
  });
  console.log(JSON.stringify(stuck, null, 2));
  await browser.close();
})();
