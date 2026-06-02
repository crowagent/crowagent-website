
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function mobileVisualAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 375, height: 812 });
  
  console.log('Auditing Mobile Homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'audit-screenshots/mobile-home.png', fullPage: true });
  
  const results = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    
    // Check if the hamburger menu is visible
    const ham = document.querySelector('.ham');
    const hamStyle = window.getComputedStyle(ham);
    
    // Check for clipped text
    const h1 = document.querySelector('h1');
    const h1Width = h1?.getBoundingClientRect().width;

    return {
      horizontalScroll: docWidth > winWidth,
      docWidth,
      winWidth,
      hamVisible: hamStyle.display !== 'none',
      h1Width,
      bodyPadding: window.getComputedStyle(document.body).paddingLeft
    };
  });

  console.log('--- Mobile visual Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

mobileVisualAudit().catch(console.error);
