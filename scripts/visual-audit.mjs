import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:8092';
const PAGES = [
  '/',
  '/pricing.html',
  '/about.html',
  '/csrd.html',
  '/tools/index.html'
];

const VIEWPORTS = [];
for (let w = 320; w <= 1920; w += 50) {
  VIEWPORTS.push({ width: w, height: 1080 });
}

async function runAudit() {
  const browser = await chromium.launch();
  const results = {
    visibility_defects: [],
    overlaps: [],
    overflows: [],
    invisible_elements: [],
    asset_failures: []
  };

  for (const path of PAGES) {
    const url = `${BASE_URL}${path}`;
    console.log(`Auditing ${url}...`);
    
    const page = await browser.newPage();
    
    // Task 5: Capture console and network errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.asset_failures.push({ url, type: 'console-error', text: msg.text() });
      }
    });
    page.on('requestfailed', request => {
      results.asset_failures.push({ url, type: 'network-failure', requestUrl: request.url(), error: request.failure()?.errorText });
    });
    page.on('response', response => {
      if (response.status() >= 400) {
        results.asset_failures.push({ url, type: 'http-error', status: response.status(), requestUrl: response.url() });
      }
    });

    await page.goto(url, { waitUntil: 'networkidle' });

    // Task 1: Text Visibility & Contrast
    // Task 2: Card/Tile Overlap
    // Task 4: Invisible Rendered Elements
    const pageAnalysis = await page.evaluate(() => {
      const issues = {
        visibility: [],
        overlaps: [],
        invisible: []
      };

      // Helper for contrast (simplified)
      function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function getContrast(rgb1, rgb2) {
        const l1 = getLuminance(...rgb1) + 0.05;
        const l2 = getLuminance(...rgb2) + 0.05;
        return l1 > l2 ? l1 / l2 : l2 / l1;
      }

      function parseRGB(rgbString) {
        const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
        if (!match) return [0, 0, 0];
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }

      // Task 1 & 4
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        // Task 1: Visibility
        const isHeading = /H[1-6]/.test(el.tagName);
        const isButton = el.tagName === 'BUTTON' || el.tagName === 'A' && (el.classList.contains('btn') || style.appearance === 'button' || el.getAttribute('role') === 'button');
        const isCTA = el.classList.contains('cta');

        if (isHeading || isButton || isCTA) {
          if (style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') {
            issues.visibility.push({ tag: el.tagName, text: el.innerText.substring(0, 20), issue: 'Hidden but interactive/heading' });
          } else {
             // Basic contrast check (text vs background)
             const fg = parseRGB(style.color);
             // This is tricky as background might be an image or parent background
             // For simplicity, we'll try to find the nearest non-transparent background
             let bgEl = el;
             let bgStyle = window.getComputedStyle(bgEl);
             while (bgStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || bgStyle.backgroundColor === 'transparent') {
                if (bgEl.parentElement) {
                  bgEl = bgEl.parentElement;
                  bgStyle = window.getComputedStyle(bgEl);
                } else {
                  break;
                }
             }
             const bg = parseRGB(bgStyle.backgroundColor);
             const contrast = getContrast(fg, bg);
             if (contrast < 4.5) {
               issues.visibility.push({ tag: el.tagName, text: el.innerText.substring(0, 20), issue: `Low contrast: ${contrast.toFixed(2)}:1`, fg: style.color, bg: bgStyle.backgroundColor });
             }
          }
        }

        // Task 4: Invisible Rendered Elements
        const hasText = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 && el.innerText && el.innerText.trim().length > 0;
        if (hasText) {
          if (rect.width === 0 && rect.height === 0) {
            issues.invisible.push({ tag: el.tagName, text: el.innerText.substring(0, 20), issue: '0x0 dimensions' });
          } else if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
             // Check if it's intentionally off-screen (like sr-only)
             if (style.position !== 'absolute' && style.position !== 'fixed') {
                issues.invisible.push({ tag: el.tagName, text: el.innerText.substring(0, 20), issue: 'Off-screen' });
             } else if (Math.abs(rect.left) > 5000) {
                // likely sr-only, skip if it matches common patterns
                if (!el.classList.contains('sr-only') && !el.classList.contains('visually-hidden')) {
                   // issues.invisible.push({ tag: el.tagName, text: el.innerText.substring(0, 20), issue: 'Extreme off-screen' });
                }
             }
          }
        }
      });

      // Task 2: Card Overlap
      const cards = Array.from(document.querySelectorAll('.pgc, .bento-card, .u-card, .about-card'));
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const r1 = cards[i].getBoundingClientRect();
          const r2 = cards[j].getBoundingClientRect();
          
          const overlap = !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
          if (overlap && r1.width > 0 && r1.height > 0 && r2.width > 0 && r2.height > 0) {
            issues.overlaps.push({ card1: cards[i].className, card2: cards[j].className });
          }
        }
      }

      return issues;
    });

    results.visibility_defects.push(...pageAnalysis.visibility.map(i => ({ ...i, url })));
    results.overlaps.push(...pageAnalysis.overlaps.map(i => ({ ...i, url })));
    results.invisible_elements.push(...pageAnalysis.invisible.map(i => ({ ...i, url })));

    // Task 3: Responsive Layout Stress Test
    console.log(`  Checking responsive viewports for ${url}...`);
    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      // Wait a bit for layout to settle
      await page.waitForTimeout(50);
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (hasOverflow) {
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        results.overflows.push({ url, viewport: vp.width, scrollWidth });
      }
    }

    await page.close();
  }

  await browser.close();
  return results;
}

runAudit().then(results => {
  console.log('AUDIT COMPLETE');
  console.log('--- SUMMARY ---');
  console.log('Visibility Defects:', results.visibility_defects.length);
  console.log('Overlaps:', results.overlaps.length);
  console.log('Overflows:', results.overflows.length);
  console.log('Invisible Elements:', results.invisible_elements.length);
  console.log('Asset Failures:', results.asset_failures.length);
  console.log('---------------');
  console.log(JSON.stringify(results, null, 2));
}).catch(err => {
  console.error(err);
  process.exit(1);
});
