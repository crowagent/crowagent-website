/**
 * WP-WEB-AUDIT-001 Session A — full-page screenshots at 375/768/1440.
 * Saves to audit/screenshots/2026-05-A/<viewport>-<page>.png.
 * Read-only against localhost:8092.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'screenshots', '2026-05-A');
const URL_BASE = 'http://localhost:8092';
const PAGES = [{ slug: 'home', url: '/' }];
const VIEWPORTS = [
  { name: '375', width: 375, height: 812, isMobile: true, deviceScaleFactor: 2 },
  { name: '768', width: 768, height: 1024, isMobile: false, deviceScaleFactor: 1 },
  { name: '1440', width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await ctx.newPage();
    for (const p of PAGES) {
      const url = URL_BASE + p.url;
      const file = path.join(OUT, `${vp.name}-${p.slug}.png`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: file, fullPage: true });
        const stat = fs.statSync(file);
        results.push({ viewport: vp.name, page: p.slug, file, size_bytes: stat.size, ok: true });
        console.log(`[OK] ${vp.name} ${p.slug} -> ${file} (${stat.size} bytes)`);
      } catch (e) {
        results.push({ viewport: vp.name, page: p.slug, error: String(e), ok: false });
        console.error(`[FAIL] ${vp.name} ${p.slug}: ${e.message}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(results, null, 2));
  console.log('\nSummary written to', path.join(OUT, '_index.json'));
})();
