const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  '/',
  '/about.html',
  '/pricing.html',
  '/contact.html',
  '/crowagent-core.html',
  '/crowcash.html',
  '/crowcyber.html',
  '/crowesg.html',
  '/crowmark.html',
  '/csrd.html',
  '/faq.html',
  '/security.html',
  '/terms.html',
  '/privacy.html'
];

const BREAKPOINTS = [
  { name: 'mobile-small', width: 320, height: 568 },
  { name: 'mobile-medium', width: 375, height: 667 },
  { name: 'mobile-large', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-small', width: 1280, height: 800 },
  { name: 'desktop-standard', width: 1440, height: 900 },
  { name: 'desktop-large', width: 1920, height: 1080 }
];

const BASE_URL = 'http://localhost:8092';
const SCREENSHOT_DIR = path.join(__dirname, 'audit-results', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function audit() {
  const browser = await chromium.launch();
  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const url = `${BASE_URL}${route}`;
    console.log(`Auditing ${url}...`);

    for (const bp of BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        // Wait a bit for GSAP/animations
        await page.waitForTimeout(1000);

        const screenshotName = `${route.replace(/\//g, '_').replace('.html', '')}_${bp.name}.png`.replace(/^_+/, '');
        const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Basic checks
        const metrics = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            consoleErrors: [] // Page-level console error tracking would need listener
          };
        });

        results.push({
          page: route,
          breakpoint: bp.name,
          width: bp.width,
          hasOverflow: metrics.hasOverflow,
          screenshot: screenshotName,
          status: metrics.hasOverflow ? 'FAIL' : 'PASS'
        });

      } catch (err) {
        console.error(`Error auditing ${route} at ${bp.name}:`, err);
        results.push({
          page: route,
          breakpoint: bp.name,
          width: bp.width,
          error: err.message,
          status: 'ERROR'
        });
      }
    }
    await page.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, 'audit-results', 'audit-report.json'),
    JSON.stringify(results, null, 2)
  );

  // Generate a simple markdown report
  let mdReport = '# Premium Website Audit Report\n\n';
  mdReport += '| Page | Breakpoint | Overflow | Status | Screenshot |\n';
  mdReport += '|------|------------|----------|--------|------------|\n';
  results.forEach(r => {
    mdReport += `| ${r.page} | ${r.breakpoint} | ${r.hasOverflow ? 'YES' : 'NO'} | ${r.status} | [View](./screenshots/${r.screenshot}) |\n`;
  });

  fs.writeFileSync(path.join(__dirname, 'audit-results', 'audit-report.md'), mdReport);
  console.log('Audit complete. Results in audit-results/');
}

audit();
