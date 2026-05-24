/* WebKit cross-browser parity capture
 * Top 20 pages × 2 viewports (1440×900 desktop, 390×844 mobile) = 40 PNGs
 * Saved to /tmp/webkit-parity/{page}-{viewport}.png
 */
const { webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const OUT_DIR = 'C:/tmp/webkit-parity';

const PAGES = [
  'index.html', 'pricing.html', 'roadmap.html', 'faq.html', 'changelog.html',
  'crowmark.html', 'crowcyber.html', 'crowcash.html', 'crowagent-core.html', 'crowesg.html', 'csrd.html',
  'about.html', 'contact.html', 'partners.html',
  'privacy.html', 'terms.html', 'security.html', 'cookies.html',
  '404.html', 'blog/index.html',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await webkit.launch();
  const results = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      // Set userAgent close to real Safari to match what real Safari would render
      userAgent: vp.name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push({ kind: 'pageerror', msg: String(err) }));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push({ kind: 'console.error', msg: msg.text() });
    });

    for (const p of PAGES) {
      const url = `${BASE}/${p}`;
      const safe = p.replace(/[\\/]/g, '__').replace(/\.html$/, '');
      const file = path.join(OUT_DIR, `${safe}-${vp.name}.png`);
      const start = Date.now();
      let status = 0;
      let errPaint = null;
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        status = resp ? resp.status() : 0;
        // Wait briefly for layout/fonts
        await page.waitForTimeout(800);
        await page.screenshot({ path: file, fullPage: false });
      } catch (e) {
        errPaint = String(e).substring(0, 200);
        try { await page.screenshot({ path: file, fullPage: false }); } catch {}
      }
      const dur = Date.now() - start;
      results.push({ page: p, viewport: vp.name, status, ms: dur, errPaint, file });
      console.log(`[${vp.name}] ${p} -> ${status} ${dur}ms ${errPaint ? 'ERR: ' + errPaint : ''}`);
    }

    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT_DIR, '_capture-log.json'), JSON.stringify(results, null, 2));
  await browser.close();
  console.log('DONE. Total screenshots:', results.length);
})();
