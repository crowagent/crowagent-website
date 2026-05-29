const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const tag = process.argv[2] || 'after';
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:8092/security.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    // measure hero height and gap to body text
    const m = await page.evaluate(() => {
      const hero = document.querySelector('section.ca-hero');
      const desc = document.querySelector('.ca-hero-desc');
      const opsHeading = document.getElementById('operational-standards');
      const r = hero.getBoundingClientRect();
      return {
        heroHeight: Math.round(r.height),
        heroBottom: Math.round(r.bottom + window.scrollY),
        descBottom: desc ? Math.round(desc.getBoundingClientRect().bottom + window.scrollY) : null,
        opsTop: opsHeading ? Math.round(opsHeading.getBoundingClientRect().top + window.scrollY) : null,
        vh: window.innerHeight
      };
    });
    console.log(`w=${w}`, JSON.stringify(m));
    // screenshot region from top through start of next section
    const h = Math.min(m.heroBottom + 300, 2000);
    await page.screenshot({ path: `__sec_${tag}_${w}_full.png`, clip: { x:0, y:0, width: w, height: h } });
    await page.close();
  }
  await browser.close();
  console.log('done');
})();
