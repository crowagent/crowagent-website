const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8092/index.html', { waitUntil: 'networkidle' });
  
  const h = await page.evaluate(() => {
     const hero = document.getElementById('hero');
     return hero ? hero.getBoundingClientRect().height : null;
  });
  
  console.log('Hero height:', h);
  
  const children = await page.evaluate(() => {
     const layout = document.querySelector('.ca-hero-layout');
     return layout ? {
        height: layout.getBoundingClientRect().height,
        content: layout.querySelector('.ca-hero-content').getBoundingClientRect().height,
        visual: layout.querySelector('.ca-hero-visual-col').getBoundingClientRect().height
     } : null;
  });
  
  console.log('Layout dims:', children);
  
  await browser.close();
})();
