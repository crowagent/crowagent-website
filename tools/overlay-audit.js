
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function overlayAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const cta = document.querySelector('.sv-btn--primary');
    if (!cta) return { error: 'CTA not found' };
    
    const rect = cta.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const stack = [];
    let el = document.elementFromPoint(x, y);
    while (el && el !== document.documentElement) {
      stack.push({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        zIndex: window.getComputedStyle(el).zIndex,
        pointerEvents: window.getComputedStyle(el).pointerEvents
      });
      // Temporarily hide to find what's underneath
      const origDisplay = el.style.display;
      el.style.display = 'none';
      el = document.elementFromPoint(x, y);
    }
    
    return stack;
  });

  console.log('--- Pointer-Events Stack Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

overlayAudit().catch(console.error);
