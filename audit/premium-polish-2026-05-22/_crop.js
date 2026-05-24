/**
 * Capture viewport-only (above-the-fold) screenshots for clearer visual inspection.
 * Output: {slug}-{viewport}-fold.png (1440x900 / 390x844, NOT full page)
 */
const { chromium } = require('playwright');
const path = require('path');
const OUT = __dirname;
const BASE = 'http://localhost:8092';

const PAGES = [
  { slug: 'home',           url: '/index.html' },
  { slug: 'pricing',        url: '/pricing.html' },
  { slug: 'crowagent-core', url: '/crowagent-core.html' },
  { slug: 'crowmark',       url: '/crowmark.html' },
  { slug: 'about',          url: '/about.html' },
  { slug: 'contact',        url: '/contact.html' },
  { slug: 'faq',            url: '/faq.html' },
  { slug: 'blog-index',     url: '/blog/index.html' },
  { slug: 'blog-mees',      url: '/blog/mees-band-c-2028.html' },
  { slug: 'tools-index',    url: '/tools/index.html' },
];
const VIEWPORTS = [
  { name: 'desktop-fold', width: 1440, height: 900 },
  { name: 'mobile-fold',  width: 390,  height: 844 },
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.name.includes('mobile') ? 2 : 1,
    });
    for (const p of PAGES) {
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(OUT, `${p.slug}-${vp.name}.png`), fullPage: false });
        console.log(`OK  ${p.slug}-${vp.name}`);
      } catch (e) { console.error(`ERR ${p.slug}-${vp.name}: ${e.message}`); }
      finally { await page.close(); }
    }
    await ctx.close();
  }
  await browser.close();
})();
