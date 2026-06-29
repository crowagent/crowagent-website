
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function pinAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const spacers = Array.from(document.querySelectorAll('[class*="pin-spacer"]'));
    return spacers.map(s => ({
      className: s.className,
      height: s.getBoundingClientRect().height,
      top: s.getBoundingClientRect().top,
      child: s.firstElementChild?.className
    }));
  });

  console.log('--- GSAP Pin Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

pinAudit().catch(console.error);
