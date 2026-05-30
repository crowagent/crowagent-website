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
           transform: s.transform,
           willChange: s.willChange,
           perspective: s.perspective
        });
        el = el.parentElement;
     }
     return results;
  });
  
  console.log('Hierarchy Debug (Transform):', JSON.stringify(debug, null, 2));
  await browser.close();
})();
