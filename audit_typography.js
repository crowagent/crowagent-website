const { chromium } = require('playwright');

async function auditTypography() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = {};

  const pages = ['/', '/pricing.html', '/about.html'];

  for (const p of pages) {
    await page.goto(`http://localhost:8092${p}`, { waitUntil: 'networkidle' });
    
    results[p] = await page.evaluate(() => {
      const getTypo = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        // Measure "The Rag" - count characters per line approximately
        const text = el.innerText;
        const width = el.offsetWidth;
        
        return {
          text: text.substring(0, 30) + '...',
          textAlign: style.textAlign,
          textWrap: style.textWrap || style.webkitTextWrap,
          maxWidth: style.maxWidth,
          width: width,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          // Check for "Widows" - last line length
          isCentered: style.textAlign === 'center'
        };
      };

      return {
        heroTitle: getTypo('h1'),
        heroDesc: getTypo('.cz-hero-desc') || getTypo('.ca-hero-desc'),
        cardTitle: getTypo('.sv-card__title') || getTypo('.ca-card h3'),
        cardDesc: getTypo('.sv-card__body') || getTypo('.ca-card p')
      };
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

auditTypography();
