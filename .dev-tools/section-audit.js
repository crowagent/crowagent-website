
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function sectionAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, .hero, .sv-section, footer'));
    return sections.map(s => {
      const rect = s.getBoundingClientRect();
      return {
        tag: s.tagName,
        id: s.id,
        classes: s.className,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        display: window.getComputedStyle(s).display,
        position: window.getComputedStyle(s).position
      };
    });
  });

  console.log('--- Homepage Section Layout Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

sectionAudit().catch(console.error);
