const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8092/crowcyber', { waitUntil: 'networkidle' });
  
  const overflowParents = await page.evaluate(() => {
     const nav = document.querySelector('nav[aria-label="Product suite navigation"]');
     let el = nav.parentElement;
     let problematic = [];
     while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        if (style.overflow !== 'visible' || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
           problematic.push({
             tagName: el.tagName,
             id: el.id,
             className: el.className,
             overflow: style.overflow,
             overflowX: style.overflowX,
             overflowY: style.overflowY
           });
        }
        el = el.parentElement;
     }
     return problematic;
  });
  
  console.log('Problematic Ancestors:', overflowParents);
  await browser.close();
})();
