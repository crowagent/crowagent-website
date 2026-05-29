const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:8092/security.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const h1 = document.querySelector('.ca-hero-title');
    const spans = [...h1.querySelectorAll('span')];
    const cs = getComputedStyle(h1);
    const r = h1.getBoundingClientRect();
    return {
      h1: { w: r.width, fontSize: cs.fontSize, lineHeight: cs.lineHeight, textWrap: cs.textWrap, wordBreak: cs.wordBreak, display: cs.display, maxWidth: cs.maxWidth, width: cs.width },
      spans: spans.map(s => { const sc = getComputedStyle(s); const sr = s.getBoundingClientRect(); return { text: s.textContent.trim(), w: sr.width, h: sr.height, display: sc.display, whiteSpace: sc.whiteSpace }; })
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
