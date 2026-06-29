
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function clsAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations to settle

  const performanceMetrics = await client.send('Performance.getMetrics');
  
  // Actually, let's use a simpler approach via page.evaluate
  const cls = await page.evaluate(() => {
    let score = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          score += entry.value;
        }
      }
    }).observe({type: 'layout-shift', buffered: true});
    return score;
  });

  console.log('--- CLS Audit ---');
  console.log(`CLS Score: ${cls}`);
  
  await browser.close();
}

clsAudit().catch(console.error);
