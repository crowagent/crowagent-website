
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function hudAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const orbit = document.querySelector('.hero-orbit-stage');
    const counter = document.querySelector('.hero-hud-counter');
    const pulse = document.querySelector('.hero-hud-pulse');
    
    return {
      orbit: orbit?.getBoundingClientRect(),
      counter: counter?.getBoundingClientRect(),
      pulse: pulse?.getBoundingClientRect(),
      orbitZIndex: window.getComputedStyle(orbit).zIndex,
      counterZIndex: window.getComputedStyle(counter).zIndex
    };
  });

  console.log('--- Hero HUD Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

hudAudit().catch(console.error);
