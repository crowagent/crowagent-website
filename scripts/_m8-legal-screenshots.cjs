/* eslint-disable */
// Agent M8 — capture fold/full/footer for 8 legal/support pages × desktop+mobile
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = process.env.M8_OUT || 'C:/tmp/m8-legal';
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  'about.html',
  'contact.html',
  'partners.html',
  'privacy.html',
  'terms.html',
  'security.html',
  'cookies.html',
  'cookie-preferences.html',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile',  width: 390,  height: 844, mobile: true  },
];

const BASE = 'http://localhost:8092/';

(async () => {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      userAgent: vp.mobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    for (const file of PAGES) {
      const slug = file.replace(/\.html$/, '');
      const url = BASE + file + '?cb=' + Date.now();
      const page = await ctx.newPage();
      try {
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        } catch (e) {
          // networkidle can hang on chatbot polling; fall back
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(1500);
        }
        // give carousels/JS one beat
        await page.waitForTimeout(800);
        // dismiss cookie banner if it appears so it doesn't overlay footer
        await page.evaluate(() => {
          try { localStorage.setItem('crowagent-cookie-pref', 'accepted'); } catch (e) {}
          const b = document.querySelector('.cookie-banner, #cookie-banner, [data-cookie-banner]');
          if (b) b.style.display = 'none';
        }).catch(() => {});

        // fold
        await page.screenshot({
          path: path.join(OUT_DIR, `${slug}-${vp.name}-fold.png`),
          fullPage: false,
        });
        // full
        await page.screenshot({
          path: path.join(OUT_DIR, `${slug}-${vp.name}-full.png`),
          fullPage: true,
        });
        // footer — scrollIntoView is more reliable than scrollTo on long pages
        await page.evaluate(() => {
          const f = document.querySelector('footer, .site-footer, #footer, .ca-footer');
          if (f) f.scrollIntoView({ behavior: 'instant', block: 'end' });
          else window.scrollTo(0, document.documentElement.scrollHeight);
        });
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(OUT_DIR, `${slug}-${vp.name}-footer.png`),
          fullPage: false,
        });

        const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        console.log(`${slug} ${vp.name} OK docHeight=${docHeight}`);
      } catch (err) {
        console.error(`FAIL ${slug} ${vp.name}: ${err.message}`);
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('DONE');
})();
