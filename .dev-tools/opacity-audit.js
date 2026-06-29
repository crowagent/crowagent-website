
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function opacityAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const reveals = Array.from(document.querySelectorAll('.reveal, .sf17-reveal, .ms-reveal'));
    return reveals.map(el => ({
      classes: el.className,
      opacity: window.getComputedStyle(el).opacity,
      visibility: window.getComputedStyle(el).visibility,
      height: el.getBoundingClientRect().height
    }));
  });

  console.log('--- Reveal Opacity Audit ---');
  const hidden = results.filter(r => r.opacity === '0');
  if (hidden.length === 0) {
    console.log('All reveal elements are visible.');
  } else {
    console.log(`${hidden.length} elements are still at opacity 0:`);
    console.log(JSON.stringify(hidden, null, 2));
  }
  
  await browser.close();
}

opacityAudit().catch(console.error);
