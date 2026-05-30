const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8092/crowcyber', { waitUntil: 'networkidle' });
  
  // check visibility
  const info = await page.evaluate(() => {
     const el = document.querySelector('nav[aria-label="Product suite navigation"]');
     if (!el) return null;
     const style = window.getComputedStyle(el);
     return {
        display: style.display,
        position: style.position,
        top: style.top,
        zIndex: style.zIndex
     };
  });
  
  // scroll down
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);
  
  // check if it's visible at the top
  const rect = await page.evaluate(() => {
     const el = document.querySelector('nav[aria-label="Product suite navigation"]');
     if (!el) return null;
     const r = el.getBoundingClientRect();
     return { top: r.top, visible: r.width > 0 && r.height > 0 };
  });
  
  console.log('Nav Info:', info);
  console.log('Rect after scroll:', rect);
  
  // Same at 390
  await page.setViewportSize({ width: 390, height: 800 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const mobileDisplay = await page.evaluate(() => {
     const el = document.querySelector('nav[aria-label="Product suite navigation"]');
     return el ? window.getComputedStyle(el).display : null;
  });
  console.log('Mobile Display:', mobileDisplay);
  
  await browser.close();
})();
