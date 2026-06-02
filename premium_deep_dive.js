const { chromium } = require('playwright');
const fs = require('fs');

async function premiumDeepDive() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = {};

  const targets = ['/', '/pricing.html', '/crowcyber.html'];

  for (const urlPath of targets) {
    await page.goto(`http://localhost:8092${urlPath}`, { waitUntil: 'networkidle' });
    
    results[urlPath] = await page.evaluate(() => {
      const getStyles = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        return {
          // 1. RHYTHM: Top vs Bottom spacing (Apple uses ~2:1)
          marginTop: parseFloat(s.marginTop),
          marginBottom: parseFloat(s.marginBottom),
          paddingTop: parseFloat(s.paddingTop),
          paddingBottom: parseFloat(s.paddingBottom),
          // 2. RENDERING: Font smoothing (Mandatory for Dark Mode)
          fontSmoothing: s.webkitFontSmoothing || s.mozOsxFontSmoothing,
          // 3. CONTRAST: Small text legibility
          color: s.color,
          backgroundColor: s.backgroundColor,
          // 4. ICONOGRAPHY: If icons exist
          iconStroke: document.querySelector(sel + ' svg [stroke]')?.getAttribute('stroke-width')
        };
      };

      // Check for GSAP/Motion reveal markers
      const revealElements = Array.from(document.querySelectorAll('[data-ca-reveal], [class*="reveal"], [data-aos]')).length;

      return {
        h2: getStyles('h2'),
        h3: getStyles('h3'),
        section: getStyles('section'),
        meta: getStyles('.ca-eyebrow') || getStyles('.cz-eyebrow-row'),
        revealCount: revealElements,
        hasAntialiasing: document.documentElement.style.webkitFontSmoothing === 'antialiased' || 
                         window.getComputedStyle(document.body).webkitFontSmoothing === 'antialiased'
      };
    });
  }

  await browser.close();
  fs.writeFileSync('premium-deep-dive-results.json', JSON.stringify(results, null, 2));
  console.log('Deep-dive complete.');
}

premiumDeepDive();
