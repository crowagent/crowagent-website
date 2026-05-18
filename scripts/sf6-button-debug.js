const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8092/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll to contact section
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(800);

  const info = await page.evaluate(() => {
    const btn = document.querySelector('#contact .contact-section-actions .btn-primary-v2');
    if (!btn) return { found: false };
    const r = btn.getBoundingClientRect();
    const cs = getComputedStyle(btn);
    const text = (btn.textContent || '').trim();
    return {
      found: true,
      outerHTML: btn.outerHTML.slice(0, 400),
      text: text,
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      bg: cs.backgroundImage || cs.backgroundColor,
      color: cs.color,
      visibility: cs.visibility,
      opacity: cs.opacity,
      display: cs.display,
      transform: cs.transform,
      fontSize: cs.fontSize,
    };
  });
  console.log(JSON.stringify(info, null, 2));

  // Capture just that button area
  const btn = await page.$('#contact .contact-section-actions .btn-primary-v2');
  if (btn) {
    await btn.screenshot({ path: 'debug-screenshots/sf6/contact-btn.png' });
    console.log('Saved: contact-btn.png');
  }
  await browser.close();
})();
