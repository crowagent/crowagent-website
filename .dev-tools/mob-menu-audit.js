
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function mobMenuAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const mobMenu = document.querySelector('.mob-menu');
    const style = window.getComputedStyle(mobMenu);
    
    return {
      exists: !!mobMenu,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      zIndex: style.zIndex,
      top: mobMenu?.getBoundingClientRect().top
    };
  });

  console.log('--- Mobile Menu Audit (Desktop Viewport) ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

mobMenuAudit().catch(console.error);
