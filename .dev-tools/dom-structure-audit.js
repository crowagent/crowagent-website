
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function domStructureAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const el = document.querySelector('.crow-carousel');
    if (!el) return { error: 'Carousel not found' };
    
    return {
      parentClass: el.parentElement.className,
      grandParentClass: el.parentElement.parentElement.className,
      isBodyChild: el.parentElement === document.body
    };
  });

  console.log('--- DOM Structure Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

domStructureAudit().catch(console.error);
