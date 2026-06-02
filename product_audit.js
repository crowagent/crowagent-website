const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pages = [
  '/products/index.html',
  '/products/crowagent-core/index.html',
  '/products/crowcash/index.html',
  '/products/crowcyber/index.html',
  '/products/crowesg/index.html',
  '/products/crowmark/index.html',
  '/products/csrd/index.html'
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 }
];

async function runAudit() {
  const browser = await chromium.launch();
  const results = [];

  for (const pagePath of pages) {
    const pageResults = { path: pagePath, viewports: {} };
    const url = `http://localhost:8092${pagePath}`;

    for (const viewport of viewports) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const metrics = await page.evaluate(() => {
          const getRect = (sel) => {
            const el = document.querySelector(sel);
            return el ? el.getBoundingClientRect() : null;
          };

          return {
            title: document.title,
            alignment: {
              heroH1Left: getRect('#hero h1')?.left || getRect('h1')?.left,
              containerLeft: getRect('.ca-container')?.left || getRect('.container')?.left || getRect('.wrap')?.left
            }
          };
        });

        pageResults.viewports[viewport.name] = { metrics: metrics };

      } catch (e) {
        pageResults.viewports[viewport.name] = { error: e.message };
      }
      await page.close();
    }
    results.push(pageResults);
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

runAudit();
