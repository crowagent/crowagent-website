const { chromium } = require('playwright');
const fs = require('fs');

async function finalValidation() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = {};

  const targets = ['/', '/pricing.html', '/about.html'];

  for (const urlPath of targets) {
    await page.goto(`http://localhost:8092${urlPath}`, { waitUntil: 'networkidle' });
    
    results[urlPath] = await page.evaluate(() => {
      const getStyles = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = window.getComputedStyle(el);
        return {
          fontFamily: s.fontFamily,
          textAlign: s.textAlign,
          textWrap: s.textWrap || s.webkitTextWrap,
          letterSpacing: s.letterSpacing,
          transition: s.transition,
          maxWidth: s.maxWidth,
          left: el.getBoundingClientRect().left
        };
      };

      // Check for hardcoded hexes in a smarter way (excluding var fallbacks)
      const allText = document.documentElement.innerHTML;
      const hexMatches = allText.match(/(?<!var\([^,]*,\s*)#[0-9A-Fa-f]{3,6}/g) || [];

      // Audit Card-Button Alignment
      const cards = Array.from(document.querySelectorAll('.ca-card, .sv-card, .pgc'));
      const cardAudits = cards.map(card => {
        const btn = card.querySelector('a, button');
        const cardRect = card.getBoundingClientRect();
        const btnRect = btn ? btn.getBoundingClientRect() : null;
        
        return {
          cardClass: card.className,
          hasButton: !!btn,
          buttonAlignedBottom: btnRect ? (cardRect.bottom - btnRect.bottom < 60) : null,
          buttonCentered: btnRect ? (Math.abs((cardRect.left + cardRect.width/2) - (btnRect.left + btnRect.width/2)) < 5) : null
        };
      });

      return {
        h1: getStyles('h1'),
        desc: getStyles('.cz-hero-desc') || getStyles('.ca-hero-desc'),
        hexCount: hexMatches.length,
        cardAudits
      };
    });
  }

  await browser.close();
  fs.writeFileSync('final-validation-results.json', JSON.stringify(results, null, 2));
  console.log('Final validation complete.');
}

finalValidation();
