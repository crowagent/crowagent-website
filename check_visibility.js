const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8092/partners.html');
  
  const cards = await page.$$eval('.ca-card', els => 
    els.map(el => ({
      visible: el.checkVisibility(),
      opacity: window.getComputedStyle(el).opacity,
      display: window.getComputedStyle(el).display,
      height: window.getComputedStyle(el).height,
      rect: el.getBoundingClientRect()
    }))
  );
  
  console.log('Cards:', cards);
  await browser.close();
})();
