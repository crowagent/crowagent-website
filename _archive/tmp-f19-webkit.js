// F19 — WebKit cross-browser smoke test.
// Loads 5 key pages in both Chromium and WebKit and compares.
// Reports: console errors, page errors, layout sanity, simple visual diff metric.
const { chromium, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_W = path.join(__dirname, 'audit-results', 'f19-webkit');
const OUT_C = path.join(__dirname, 'audit-results', 'f19-chromium');
const BASE = 'http://localhost:8092';

const pages = [
  { name: 'home',     url: `${BASE}/index.html` },
  { name: 'pricing',  url: `${BASE}/pricing.html` },
  { name: 'contact',  url: `${BASE}/contact.html` },
  { name: 'csrd',     url: `${BASE}/csrd.html` },
  { name: 'tool-cer', url: `${BASE}/tools/cyber-essentials-readiness/index.html` },
];

async function runOn(label, browserType, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await browserType.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const results = [];
  for (const { name, url } of pages) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', e => pageErrors.push(e.message));
    page.on('requestfailed', r => failedRequests.push(`${r.url()} :: ${r.failure() && r.failure().errorText}`));

    let status = null;
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      status = resp ? resp.status() : null;
    } catch (e) {
      pageErrors.push(`nav: ${e.message}`);
    }

    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => {
      const issues = [];
      const main = document.querySelector('main') || document.body;
      const mainH = main.getBoundingClientRect().height;
      if (mainH < 100) issues.push(`main height too small: ${mainH}px`);
      // detect horizontal scroll
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      if (docW > winW + 1) issues.push(`horizontal overflow: ${docW}px > ${winW}px`);
      // text count quick sanity
      const textChars = document.body.innerText.length;
      // any visible H1
      const h1 = document.querySelector('h1');
      const h1Visible = h1 ? (h1.getBoundingClientRect().height > 0) : false;
      return { issues, mainH, docW, winW, textChars, h1Visible };
    });

    const shot = path.join(outDir, `${name}.png`);
    try { await page.screenshot({ path: shot, fullPage: false }); } catch (e) { /* ignore */ }

    results.push({ name, url, status, consoleErrors, pageErrors, failedRequests, metrics, screenshot: path.relative(__dirname, shot) });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
  return results;
}

(async () => {
  const cResults = await runOn('chromium', chromium, OUT_C);
  const wResults = await runOn('webkit',   webkit,   OUT_W);

  // diff
  const diff = [];
  for (let i = 0; i < pages.length; i++) {
    const c = cResults[i], w = wResults[i];
    const row = {
      name: pages[i].name,
      chromium: {
        status: c.status,
        consoleErrors: c.consoleErrors.length,
        pageErrors: c.pageErrors.length,
        failedRequests: c.failedRequests.length,
        textChars: c.metrics.textChars,
        mainH: Math.round(c.metrics.mainH),
        issues: c.metrics.issues,
      },
      webkit: {
        status: w.status,
        consoleErrors: w.consoleErrors.length,
        pageErrors: w.pageErrors.length,
        failedRequests: w.failedRequests.length,
        textChars: w.metrics.textChars,
        mainH: Math.round(w.metrics.mainH),
        issues: w.metrics.issues,
      },
      webkitErrorDetail: w.consoleErrors.slice(0, 5).concat(w.pageErrors.slice(0, 5)),
      chromiumErrorDetail: c.consoleErrors.slice(0, 5).concat(c.pageErrors.slice(0, 5)),
    };
    diff.push(row);
  }
  console.log(JSON.stringify(diff, null, 2));
  fs.writeFileSync(path.join(__dirname, 'audit-results', 'f19-summary.json'), JSON.stringify(diff, null, 2));
})();
