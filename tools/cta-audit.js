
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function deepStyleAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const el = document.querySelector('.sv-btn--primary');
    if (!el) return { error: 'Primary CTA not found' };
    
    const style = window.getComputedStyle(el);
    return {
      tagName: el.tagName,
      className: el.className,
      textContent: el.textContent.trim(),
      bgImage: style.backgroundImage,
      bgColor: style.backgroundColor,
      color: style.color,
      border: style.border,
      boxShadow: style.boxShadow,
      width: style.width,
      height: style.height,
      visibility: style.visibility,
      display: style.display
    };
  });

  console.log('--- Deep CTA Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

deepStyleAudit().catch(console.error);
