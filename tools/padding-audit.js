
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function paddingAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    const main = document.querySelector('main');
    const body = document.body;
    
    return {
      bodyPaddingTop: window.getComputedStyle(body).paddingTop,
      mainPaddingTop: window.getComputedStyle(main).paddingTop,
      heroPaddingTop: window.getComputedStyle(hero).paddingTop,
      heroMarginTop: window.getComputedStyle(hero).marginTop
    };
  });

  console.log('--- Pricing Padding Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

paddingAudit().catch(console.error);
