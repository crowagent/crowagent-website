const { chromium } = require('playwright');

const PAGES = [
  '/about.html',
  '/pricing.html',
  '/roadmap.html',
  '/faq.html',
  '/blog/index.html',
  '/blog/mees-band-c-2028.html',
  '/tools/index.html',
  '/tools/csrd-applicability-checker/index.html',
  '/glossary/index.html',
  '/glossary/csrd.html',
  '/privacy.html',
  '/products/index.html',
  '/intel/cyber-essentials-tracker/index.html',
  '/contact.html',
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];
  let consoleErrors = 0;

  for (const p of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') { errors.push(m.text()); } });
    page.on('pageerror', (e) => { errors.push(String(e)); });
    try {
      await page.goto('http://localhost:8092' + p, { waitUntil: 'networkidle', timeout: 15000 });
      const loaded = await page.evaluate(() => !!window.__caSectionMotionLoaded);
      const hasGsap = await page.evaluate(() => !!window.gsap && !!window.ScrollTrigger);
      // Scroll to bottom slowly to fire triggers
      await page.evaluate(async () => {
        const totalH = document.body.scrollHeight;
        let y = 0;
        const step = 400;
        while (y < totalH + 600) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 120));
          y += step;
        }
      });
      await page.waitForTimeout(2500);
      // Check none of the animated selectors are stuck at opacity 0 with autoAlpha applied
      const stuck = await page.evaluate(() => {
        const sel = [
          '.partner-card', '.contact-form .form-group', '.f10-office-grid-item', '.f10-timeline-item',
          '.sv-card', '.faq-group', '.faq-chip', '.f10-kanban-col', '.f10-kanban-card', '.roadmap-milestone',
          '.changelog-entry', '.nf-pill', '.hw-grid > .hw', '.f10-workflow-step',
          '.rail-card', '.timeline-entry', '.gloss-list-item', '.article-grid > .article-card',
          '.filter-pill', '.product-hub-card', '.priv-article', '.priv-section',
          '.blog-stripe-related-card', '.tool-methodology-toc', '.legal-toc',
        ];
        const out = [];
        for (const s of sel) {
          const els = document.querySelectorAll(s);
          for (const e of els) {
            const cs = getComputedStyle(e);
            const o = parseFloat(cs.opacity);
            // Element is in viewport area we've already scrolled past
            const rect = e.getBoundingClientRect();
            const visible = rect.top < window.innerHeight && rect.bottom > 0;
            // Only flag if element is rendered but stuck at 0 after scrolling
            if (!isNaN(o) && o < 0.5 && e.offsetParent !== null) {
              out.push({ s, opacity: o, top: Math.round(rect.top) });
            }
            if (out.length > 5) break;
          }
          if (out.length > 5) break;
        }
        return out;
      });
      consoleErrors += errors.length;
      results.push({ path: p, loaded, hasGsap, stuck: stuck.length, errors: errors.length });
    } catch (e) {
      results.push({ path: p, error: e.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter(r => r.error || !r.loaded || !r.hasGsap);
  console.log(`\n--- summary ---`);
  console.log(`Pages probed: ${results.length}`);
  console.log(`Module loaded: ${results.filter(r => r.loaded).length}/${results.length}`);
  console.log(`GSAP present: ${results.filter(r => r.hasGsap).length}/${results.length}`);
  console.log(`Console errors total: ${consoleErrors}`);
  console.log(`Stuck elements (any page): ${results.reduce((a, r) => a + (r.stuck || 0), 0)}`);
  process.exit(failed.length === 0 ? 0 : 1);
})();
