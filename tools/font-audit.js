
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function fontAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(async () => {
    // Check if fonts are ready
    await document.fonts.ready;
    
    const fonts = [];
    document.fonts.forEach(f => {
      fonts.push({ family: f.family, status: f.status, weight: f.weight });
    });

    return {
      fonts,
      h1FontFamily: window.getComputedStyle(document.querySelector('h1')).fontFamily
    };
  });

  console.log('--- Font Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

fontAudit().catch(console.error);
