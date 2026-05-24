const { test } = require('@playwright/test');
const BASE = 'http://localhost:8092';

const VIEWPORTS = [
  { name: 'm320',  w:  320, h:  568 },
  { name: 'm390',  w:  390, h:  844 },
  { name: 't768',  w:  768, h: 1024 },
  { name: 't1024', w: 1024, h:  768 },
  { name: 'd1440', w: 1440, h:  900 },
  { name: 'd1920', w: 1920, h: 1080 },
];

const TARGETS = [
  { name: '01-hero',         sel: '#hero',                                                    offset: -40 },
  { name: '02-marquee',      sel: '.hp-sector-marquee, .hp-audience-band, .sf18-trust-bar',   offset: -40 },
  { name: '03-cinematic',    sel: '.cinematic-walkthrough',                                   offset: -100 },
  { name: '04-carousel',     sel: '.crow-carousel',                                           offset: -60 },
  { name: '05-methodology',  sel: 'section[aria-label="Our methodology"]',                    offset: -60 },
  { name: '06-prefooter',    sel: '.hp-cta-band, section[aria-label="Choose your starting workflow"]', offset: -60 },
];

test.describe('Full 6x6 visual sweep', () => {
  for (const v of VIEWPORTS) {
    test('sweep ' + v.name, async ({ page }) => {
      await page.setViewportSize({ width: v.w, height: v.h });
      await page.goto(`${BASE}/?_=` + Date.now(), { waitUntil: 'networkidle' });
      await page.waitForTimeout(2200); // GSAP + nav inject + reveal observers
      // Force-reveal all .reveal elements so the IO doesn't leave them at opacity 0 during static capture
      await page.evaluate(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        document.querySelectorAll('.sf17-reveal').forEach(el => el.classList.add('is-revealed'));
      });
      for (const t of TARGETS) {
        const y = await page.evaluate((sels) => {
          for (const s of sels.split(', ')) {
            const el = document.querySelector(s.trim());
            if (el) return el.getBoundingClientRect().top + window.scrollY;
          }
          return null;
        }, t.sel);
        if (y === null) continue;
        await page.evaluate(([yy, off]) => window.scrollTo({ top: Math.max(0, yy + off), behavior: 'instant' }), [y, t.offset]);
        await page.waitForTimeout(700);
        await page.screenshot({ path: `C:/tmp/hp-screens/sweep-${v.name}-${t.name}.png`, fullPage: false });
      }
    });
  }
});
