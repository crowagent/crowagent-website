const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8092/crowcyber', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  // scroll past the hero and carousel
  await page.evaluate(() => window.scrollTo(0, 2500));
  await page.waitForTimeout(500);
  
  const rect = await page.evaluate(() => {
     const el = document.querySelector('nav[aria-label="Product suite navigation"]');
     if (!el) return null;
     const r = el.getBoundingClientRect();
     return { top: r.top, visible: r.width > 0 && r.height > 0 };
  });
  
  console.log('Rect after 2500 scroll:', rect);
  
  await browser.close();
})();
