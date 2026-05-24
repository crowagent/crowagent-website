/**
 * Targeted screenshots — capture sections that have choreography wired,
 * not just hero. Scroll to the choreographed section, wait for animation
 * to settle, then snap viewport.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const OUT = path.join(__dirname, 'screens-section');
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  // page, selector to scroll into view, label
  { page: '/', selector: '.hp-jtbd-grid', label: 'index-trinity' },
  { page: '/', selector: '.hp-moat-terminal', label: 'index-moat' },
  { page: '/', selector: '.stats-grid', label: 'index-stats' },
  { page: '/', selector: '.triple-cta-section', label: 'index-triple-cta' },
  { page: '/', selector: '.hp-cta-band', label: 'index-final-cta' },
  { page: '/crowmark.html', selector: '.pw-sf21-grid', label: 'crowmark-walkthrough' },
  { page: '/crowmark.html', selector: '[data-section="pricing-or-waitlist"]', label: 'crowmark-pricing' },
  { page: '/crowcyber.html', selector: '.product-mockup-widget', label: 'crowcyber-widget' },
  { page: '/crowcyber.html', selector: '.pw-sf21-grid', label: 'crowcyber-walkthrough' },
  { page: '/crowcash.html', selector: '.hw-grid', label: 'crowcash-usecases' },
  { page: '/crowagent-core.html', selector: '.pw-sf21-grid', label: 'core-walkthrough' },
  { page: '/crowesg.html', selector: 'section.cta-band, section[data-section="cta-band"]', label: 'esg-cta' },
  { page: '/csrd.html', selector: '.pw-sf21-grid', label: 'csrd-walkthrough' },
];

(async () => {
  const browser = await chromium.launch();
  for (const v of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    for (const shot of SHOTS) {
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + shot.page, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        const found = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return false;
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
          return true;
        }, shot.selector);
        if (!found) {
          console.log(`[SKIP] ${shot.label} ${v.name} — selector not found`);
          await page.close();
          continue;
        }
        // Let GSAP scroll-trigger fire + animation settle
        await page.waitForTimeout(2500);
        const out = path.join(OUT, `${shot.label}-${v.name}.png`);
        await page.screenshot({ path: out, fullPage: false });
        console.log(`[OK]   ${shot.label} ${v.name}`);
      } catch (err) {
        console.log(`[ERR] ${shot.label} ${v.name} — ${err.message}`);
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }
  await browser.close();
})();
