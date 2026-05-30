const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.goto('http://localhost:8092/tools/csrd-applicability-checker/index.html', { waitUntil: 'networkidle' });
  
  const isVisible = await page.evaluate(() => {
     const el = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Step 1 of 1'));
     if (!el) return 'NOT_FOUND';
     const style = window.getComputedStyle(el);
     const rect = el.getBoundingClientRect();
     return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        rect: { top: rect.top, height: rect.height, width: rect.width },
        inViewport: rect.top >= 0 && rect.top <= 800
     };
  });
  
  console.log('Step Indicator Visibility:', isVisible);
  await browser.close();
})();
