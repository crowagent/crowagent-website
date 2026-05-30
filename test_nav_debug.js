const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8092/crowcyber', { waitUntil: 'networkidle' });
  
  const debug = await page.evaluate(() => {
     const nav = document.querySelector('nav[aria-label="Product suite navigation"]');
     const results = [];
     let el = nav;
     while (el) {
        const s = window.getComputedStyle(el);
        results.push({
           tagName: el.tagName,
           id: el.id,
           className: el.className,
           position: s.position,
           overflow: s.overflow,
           overflowX: s.overflowX,
           overflowY: s.overflowY,
           height: s.height,
           maxHeight: s.maxHeight
        });
        el = el.parentElement;
     }
     return results;
  });
  
  console.log('Hierarchy Debug:', JSON.stringify(debug, null, 2));
  await browser.close();
})();
