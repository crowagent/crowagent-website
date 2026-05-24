/* QA40 Cluster 1 P0 — before/after screenshot probe (2026-05-22) */
const { chromium } = require('playwright');
const path = require('path');

const phase = process.argv[2] || 'after';
const outDir = path.join('audit', `qa40-cluster-1-${phase}`);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const shots = [
    // BUG-001 + BUG-002: hero triple widget on homepage
    { url: '/', name: 'home-hero-triple', selector: '.hero-triple-output' },
    // BUG-001: crowcash glyph
    { url: '/crowcash.html', name: 'crowcash-hw-icon', selector: '.hw-grid' },
    // BUG-003: crowcore mock card
    { url: '/crowagent-core.html', name: 'crowcore-mock', selector: '.product-mockup-widget[data-mockup="mees"]' },
    // BUG-005: home carousel dots
    { url: '/', name: 'home-dots', selector: '.home-demo-cycle__dots' },
    // BUG-004: footer probes on N pages
    { url: '/', name: 'home-full', fullPage: true },
    { url: '/pricing.html', name: 'pricing-full', fullPage: true },
    { url: '/contact.html', name: 'contact-full', fullPage: true },
  ];

  for (const s of shots) {
    try {
      await page.goto('http://localhost:8092' + s.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1200);
      const file = path.join(outDir, s.name + '.png');
      if (s.selector) {
        const loc = await page.locator(s.selector).first();
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await loc.screenshot({ path: file });
        } else {
          await page.screenshot({ path: file, fullPage: false });
        }
      } else {
        await page.screenshot({ path: file, fullPage: !!s.fullPage });
      }
      console.log('OK', s.url, s.name);
    } catch (e) {
      console.log('FAIL', s.url, s.name, String(e).slice(0, 120));
    }
  }
  await browser.close();
})();
