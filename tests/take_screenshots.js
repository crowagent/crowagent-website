const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = 'file://' + path.resolve('partners.html');
  
  console.log('Taking screenshot at 1280px...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'partners-1280.png', fullPage: true });
  
  console.log('Taking screenshot at 390px...');
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'partners-390.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshots saved: partners-1280.png, partners-390.png');
})();
