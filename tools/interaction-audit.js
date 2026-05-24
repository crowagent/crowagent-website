
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function interactionAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cta = document.querySelector('.sv-btn--primary');
    
    const isVisible = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      );
    };

    const isClickable = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const topEl = document.elementFromPoint(cx, cy);
      return topEl === el || el.contains(topEl);
    };

    return {
      h1: { visible: isVisible(h1), clickable: isClickable(h1) },
      cta: { visible: isVisible(cta), clickable: isClickable(cta) },
      topElementAtCenter: document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)?.tagName,
      topElementAtCTA: document.elementFromPoint(cta?.getBoundingClientRect().left, cta?.getBoundingClientRect().top)?.tagName
    };
  });

  console.log('--- Interaction & Visibility Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

interactionAudit().catch(console.error);
