/* M4 capture — Mandate 2.
   11 pages × 2 viewports × 3 positions = 66 PNGs.
*/
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'audit', 'm4-shots');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  // [routePath, slug]
  ['tools/csrd-applicability-checker/',  'tool-csrd'],
  ['tools/cyber-essentials-readiness/',  'tool-cyber'],
  ['tools/late-payment-calculator/',     'tool-latepay'],
  ['tools/ppn-002-calculator/',          'tool-ppn002'],
  ['tools/vsme-materiality-light/',      'tool-vsme'],
  ['intel/cyber-essentials-tracker/',    'intel-cyber'],
  ['tools-csrd-checker-methodology.html',           'meth-csrd'],
  ['tools-cyber-essentials-readiness-methodology.html', 'meth-cyber'],
  ['tools-late-payment-calculator-methodology.html', 'meth-latepay'],
  ['tools-ppn002-calculator-methodology.html',      'meth-ppn002'],
  ['tools-vsme-materiality-light-methodology.html', 'meth-vsme'],
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: 'mobile',  width: 390,  height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const BASE = 'http://localhost:8092/';

(async () => {
  const browser = await chromium.launch();
  let captured = 0;
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.hasTouch,
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') console.error('  CONSOLE-ERR', m.text().slice(0,200)); });
    for (const [route, slug] of PAGES) {
      try {
        const url = BASE + route;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        // 1. fold
        await page.screenshot({ path: path.join(OUT, `${slug}-${vp.name}-fold.png`), clip: { x:0, y:0, width: vp.width, height: vp.height }});
        // 2. full page
        await page.screenshot({ path: path.join(OUT, `${slug}-${vp.name}-full.png`), fullPage: true });
        // 3. footer (last viewport-height of page)
        const docH = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.evaluate(h => window.scrollTo(0, h), Math.max(0, docH - vp.height));
        await page.waitForTimeout(120);
        await page.screenshot({ path: path.join(OUT, `${slug}-${vp.name}-footer.png`), clip: { x:0, y:0, width: vp.width, height: vp.height }});
        captured += 3;
        console.log(`  OK ${slug}-${vp.name}  (docH=${docH})`);
      } catch (e) {
        console.error(`  FAIL ${slug}-${vp.name} :: ${e.message}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\nDone — ${captured} screenshots in ${OUT}`);
})();
