const { chromium } = require('playwright');
const fs = require('fs');

async function deepDiveAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = {};

  const targets = ['/', '/pricing.html'];

  for (const urlPath of targets) {
    await page.goto(`http://localhost:8092${urlPath}`, { waitUntil: 'networkidle' });
    
    results[urlPath] = await page.evaluate(() => {
      const getStyles = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = window.getComputedStyle(el);
        const before = window.getComputedStyle(el, ':before');
        const after = window.getComputedStyle(el, ':after');
        
        return {
          // 1. TYPOGRAPHY: Letter spacing (kerning) for premium feel
          letterSpacing: s.letterSpacing,
          fontWeight: s.fontWeight,
          // 2. SPECULAR: Borders and glows
          border: s.border,
          borderRadius: s.borderRadius,
          boxShadow: s.boxShadow,
          backdropFilter: s.backdropFilter,
          // 3. MOTION: Transition precision
          transition: s.transition,
          // 4. PSEUDO: Check for border highlights (Apple-style)
          hasSpecular: (before.content !== 'none' || after.content !== 'none')
        };
      };

      return {
        h1: getStyles('h1'),
        card: getStyles('.ca-card') || getStyles('.sv-card') || getStyles('.pgc'),
        button: getStyles('a.sv-btn') || getStyles('.cz-btn-primary'),
        nav: getStyles('nav') || getStyles('header')
      };
    });
  }

  await browser.close();
  fs.writeFileSync('micro-audit-results.json', JSON.stringify(results, null, 2));
  console.log('Micro-audit complete.');
}

deepDiveAudit();
