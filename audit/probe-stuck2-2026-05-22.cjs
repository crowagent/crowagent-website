const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const PAGES = ['/about.html', '/pricing.html', '/contact.html', '/roadmap.html', '/faq.html'];
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto('http://localhost:8092' + p, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const totalH = document.body.scrollHeight;
      let y = 0;
      while (y < totalH + 800) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 80));
        y += 400;
      }
    });
    await page.waitForTimeout(1000);
    const stuck = await page.evaluate(() => {
      const sel = ['.sv-card', '.partner-card', '.f10-kanban-col', '.f10-kanban-card', '.faq-group', '.pricing-trust-pill', '.f10-timeline-item', '.contact-form .form-group', '.changelog-entry'];
      const out = [];
      for (const s of sel) {
        const els = document.querySelectorAll(s);
        els.forEach(e => {
          const cs = getComputedStyle(e);
          const rect = e.getBoundingClientRect();
          if (parseFloat(cs.opacity) < 0.5 && e.offsetParent) {
            out.push({ s, opacity: cs.opacity, top: Math.round(rect.top), msReveal: e.classList.contains('ms-reveal'), msIn: e.classList.contains('ms-in'), styleOpacity: e.style.opacity });
          }
        });
      }
      return { url: location.pathname, stuck: out.slice(0, 8), count: out.length };
    });
    console.log(JSON.stringify(stuck, null, 2));
    await page.close();
  }
  await browser.close();
})();
