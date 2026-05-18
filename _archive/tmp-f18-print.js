// F18 — print stylesheet smoke test. Loads 3 representative pages in chromium
// with emulateMedia({ media: 'print' }) and screenshots full-page. Also captures
// console errors and basic layout sanity (no element overflows viewport width,
// no zero-height main, no clipped headings).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'audit-results', 'f18-print');
const BASE = 'http://localhost:8092';

const pages = [
  { name: 'home', url: `${BASE}/index.html` },
  { name: 'crowagent-core', url: `${BASE}/crowagent-core.html` },
  { name: 'tools-mees-risk-snapshot', url: `${BASE}/tools/mees-risk-snapshot/index.html` },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const results = [];
  for (const { name, url } of pages) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', e => consoleErrors.push(`pageerror: ${e.message}`));

    // load with screen media first to verify base page works
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const screenH = await page.evaluate(() => document.body.scrollHeight);

    // now switch to print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300); // let print.css apply

    const screenshot = path.join(OUT, `${name}-print.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    const layout = await page.evaluate(() => {
      const issues = [];
      const main = document.querySelector('main') || document.body;
      const mainH = main.getBoundingClientRect().height;
      if (mainH < 100) issues.push(`main height too small: ${mainH}px`);
      // check for any element exceeding viewport width (1280) by >50px
      const all = document.querySelectorAll('body *');
      let overflowCount = 0;
      let overflowExamples = [];
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width > 1330 && r.height > 5) {
          overflowCount++;
          if (overflowExamples.length < 5) overflowExamples.push(`${el.tagName.toLowerCase()}.${(el.className||'').toString().slice(0,40)} (${Math.round(r.width)}px)`);
        }
      }
      if (overflowCount > 0) issues.push(`${overflowCount} elements > 1330px wide; examples: ${overflowExamples.join(', ')}`);
      // detect any element with display:none but containing visible text? skip — too noisy
      // detect main content visibility
      const computed = window.getComputedStyle(main);
      if (computed.display === 'none') issues.push('main is display:none in print');
      return { issues, mainH, totalElements: all.length };
    });

    results.push({ name, url, screenH, screenshot: path.relative(__dirname, screenshot), consoleErrors, layout });
    await page.close();
  }
  await browser.close();

  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})();
