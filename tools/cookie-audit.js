
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function cookieAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const banner = document.getElementById('ca-cookie');
    if (!banner) return { error: 'Cookie banner not found' };
    
    const style = window.getComputedStyle(banner);
    return {
      id: banner.id,
      display: style.display,
      position: style.position,
      pointerEvents: style.pointerEvents,
      zIndex: style.zIndex,
      height: banner.getBoundingClientRect().height,
      bottom: style.bottom
    };
  });

  console.log('--- Cookie Banner Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

cookieAudit().catch(console.error);
