const { chromium } = require('playwright');
const fs = require('fs');

async function verifyAllFixes() {
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
          textRendering: s.textRendering,
          fontVariationSettings: s.fontVariationSettings,
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          letterSpacing: s.letterSpacing,
          maxWidth: s.maxWidth,
          color: s.color, // Will help check for OKLCH indirectly if it resolves to something unique
          rect: rect
        };
      };

      // 1. Check for OKLCH in stylesheets
      const hasOKLCH = Array.from(document.styleSheets).some(ss => {
        try {
          return Array.from(ss.cssRules).some(rule => rule.cssText.includes('oklch'));
        } catch(e) { return false; }
      });

      // 2. Check for Kinetic Staggering
      const revealElements = Array.from(document.querySelectorAll('[data-ca-reveal], [class*="reveal"], [data-aos]'));
      const hasStagger = revealElements.some(el => window.getComputedStyle(el).animationDelay !== '0s');

      // 3. Check Card Baseline Consistency
      const cards = Array.from(document.querySelectorAll('.ca-card, .sv-card, .pgc'));
      const cardButtons = cards.map(card => {
          const btn = card.querySelector('a, button');
          return btn ? (card.getBoundingClientRect().bottom - btn.getBoundingClientRect().bottom) : null;
      });

      // 4. Check for .sv-btn namespace
      const svBtnCount = document.querySelectorAll('.sv-btn').length;
      const legacyBtnCount = document.querySelectorAll('.cz-btn, .sv-btn-v2').length;

      return {
        h1: getStyles('h1'),
        desc: getStyles('.ca-hero-desc') || getStyles('.cz-hero-desc') || getStyles('.cz-hero-fold p'),
        section: getStyles('section'),
        hasOKLCH,
        hasStagger,
        revealCount: revealElements.length,
        cardButtonBaselines: cardButtons,
        svBtnCount,
        legacyBtnCount,
        hexCount: document.documentElement.innerHTML.match(/(?<!var\([^,]*,\s*)#[0-9A-Fa-f]{3,6}/g)?.length || 0
      };
    });
  }

  await browser.close();
  fs.writeFileSync('final-verification-results.json', JSON.stringify(results, null, 2));
  console.log('Final verification complete.');
}

verifyAllFixes();
