
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function bodyPaddingAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    return {
      paddingBottom: window.getComputedStyle(document.body).paddingBottom,
      bannerHeight: document.getElementById('ca-cookie')?.getBoundingClientRect().height
    };
  });

  console.log('--- Body Padding-Bottom Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

bodyPaddingAudit().catch(console.error);
