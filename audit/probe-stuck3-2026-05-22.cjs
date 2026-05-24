const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const PAGES = ['/roadmap.html', '/blog/index.html', '/products/index.html', '/privacy.html'];
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto('http://localhost:8092' + p, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const totalH = document.body.scrollHeight;
      let y = 0;
      while (y < totalH + 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 120));
        y += 400;
      }
    });
    await page.waitForTimeout(1200);
    const stuck = await page.evaluate(() => {
      const all = document.querySelectorAll('.sv-card, .partner-card, .f10-kanban-col, .f10-kanban-card, .faq-group, .pricing-trust-pill, .f10-timeline-item, .changelog-entry, .article-grid > .article-card, .product-hub-card, .priv-article, .priv-section, .blog-stripe-related-card, .filter-pill, .gloss-list-item');
      const out = [];
      all.forEach(e => {
        const cs = getComputedStyle(e);
        const rect = e.getBoundingClientRect();
        if (parseFloat(cs.opacity) < 0.5 && e.offsetParent) {
          out.push({
            tag: e.tagName, cls: e.className.slice(0, 80),
            opacity: cs.opacity, top: Math.round(rect.top),
            msReveal: e.classList.contains('ms-reveal'),
            msIn: e.classList.contains('ms-in'),
            inlineOpacity: e.style.opacity,
            inlineTransform: e.style.transform,
          });
        }
      });
      return { url: location.pathname, count: out.length, stuck: out.slice(0, 10) };
    });
    console.log(JSON.stringify(stuck, null, 2));
    await page.close();
  }
  await browser.close();
})();
