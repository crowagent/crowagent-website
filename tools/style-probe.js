
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function verifyStyles() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const getStyle = (sel, prop) => {
      const el = document.querySelector(sel);
      if (!el) return `NOT FOUND: ${sel}`;
      return window.getComputedStyle(el).getPropertyValue(prop);
    };

    return {
      bodyBg: getStyle('body', 'background-color'),
      h1FontSize: getStyle('h1', 'font-size'),
      navHeight: getStyle('#ca-nav', 'height'),
      ctaBg: getStyle('.sv-btn--primary', 'background-image'), // Primary CTA often uses gradient
      tokensLoaded: !!document.querySelector('link[href*="brand-tokens"]'),
      minStylesLoaded: !!document.querySelector('link[href*="styles.min.css"]')
    };
  });

  console.log('--- Rendered Styles Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

verifyStyles().catch(console.error);
