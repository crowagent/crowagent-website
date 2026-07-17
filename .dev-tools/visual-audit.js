
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';
const SCREENSHOT_DIR = 'audit-screenshots';

const PAGES = [
  { name: '01-home', path: '/' },
  { name: '02-pricing', path: '/pricing' },
  { name: '04-blog', path: '/blog/' },
  { name: '05-contact', path: '/contact' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
];

async function runAudit() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = [];

  for (const p of PAGES) {
    for (const v of VIEWPORTS) {
      console.log(`Auditing ${p.name} at ${v.name}...`);
      await page.setViewportSize({ width: v.width, height: v.height });
      
      const logs = [];
      page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
      page.on('pageerror', err => logs.push(`[ERROR] ${err.message}`));
      
      const response = await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle' });
      const status = response.status();
      
      // Wait for fonts/images to settle
      await page.waitForTimeout(1000);
      
      const screenshotPath = path.join(SCREENSHOT_DIR, `${p.name}-${v.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      report.push({
        page: p.name,
        viewport: v.name,
        status: status,
        screenshot: screenshotPath,
        logs: logs
      });
    }
  }

  fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
  await browser.close();
  console.log('Audit complete. See audit-report.json and screenshots folder.');
}

runAudit().catch(console.error);
