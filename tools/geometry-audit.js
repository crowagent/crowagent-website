
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function geometryAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    
    const overlaps = [];
    const elements = Array.from(document.querySelectorAll('section, .sv-card, .hero, nav'));
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const r1 = elements[i].getBoundingClientRect();
        const r2 = elements[j].getBoundingClientRect();
        
        if (!(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom)) {
          // Overlap detected, but exclude nested elements
          if (!elements[i].contains(elements[j]) && !elements[j].contains(elements[i])) {
             overlaps.push({ el1: elements[i].className, el2: elements[j].className });
          }
        }
      }
    }

    return {
      horizontalScroll: docWidth > winWidth,
      docWidth,
      winWidth,
      overlaps: overlaps.slice(0, 10)
    };
  });

  console.log('--- Geometry & Overflow Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

geometryAudit().catch(console.error);
