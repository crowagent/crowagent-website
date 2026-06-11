const { chromium } = require('playwright');
const fs = require('fs');

async function finalForensicSweep() {
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
        const rect = el.getBoundingClientRect();
        return {
          fontFamily: s.fontFamily,
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          letterSpacing: s.letterSpacing,
          maxWidth: s.maxWidth,
          textAlign: s.textAlign,
          rect: rect
        };
      };

      // 1. Audit Card Baselines & Alignment
      const cards = Array.from(document.querySelectorAll('.ca-card, .sv-card, .pgc'));
      const cardAudits = cards.map(card => {
        const btn = card.querySelector('a, button');
        const body = card.querySelector('p, .ca-card__body, .sv-card__body');
        const cardRect = card.getBoundingClientRect();
        const btnRect = btn ? btn.getBoundingClientRect() : null;
        
        return {
          cardClass: card.className,
          bodyTextAlign: body ? window.getComputedStyle(body).textAlign : null,
          btnBaseline: btnRect ? (cardRect.bottom - btnRect.bottom) : null,
          hasMtAuto: btn ? (window.getComputedStyle(btn).marginTop === 'auto' || window.getComputedStyle(btn.parentElement).marginTop === 'auto') : false
        };
      });

      // 2. Audit Spacing Ratios (Rhythmic Asymmetry)
      const sections = Array.from(document.querySelectorAll('section'));
      const sectionRatios = sections.map(s => {
          const style = window.getComputedStyle(s);
          return {
              pt: parseFloat(style.paddingTop),
              pb: parseFloat(style.paddingBottom),
              ratio: parseFloat(style.paddingTop) / parseFloat(style.paddingBottom)
          };
      });

      // 3. Namespace Audit
      const svBtns = document.querySelectorAll('.sv-btn').length;
      const caBtns = document.querySelectorAll('.sv-btn').length;
      const czBtns = document.querySelectorAll('.cz-btn').length;

      // 4. Hex Leakage (Deep)
      const allText = document.documentElement.innerHTML;
      const allHexes = allText.match(/(?<!var\([^,]*,\s*)#[0-9A-Fa-f]{3,6}/g) || [];

      return {
        h1: getStyles('h1'),
        desc: getStyles('.ca-hero-desc, .cz-hero-desc, .cz-hero-fold p'),
        cardAudits,
        sectionRatios,
        btnNamespace: { svBtns, caBtns, czBtns },
        hexLeakage: { count: allHexes.length, samples: allHexes.slice(0, 10) }
      };
    });
  }

  await browser.close();
  fs.writeFileSync('final-forensic-sweep.json', JSON.stringify(results, null, 2));
  console.log('Forensic sweep complete.');
}

finalForensicSweep();
