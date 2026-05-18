const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8092/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll to put contact section in middle of viewport
  await page.evaluate(() => {
    const c = document.querySelector('#contact');
    const r = c.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top - 150, behavior: 'instant' });
  });
  await page.waitForTimeout(800);

  // Capture full contact section at 2x
  const contact = await page.$('#contact');
  await contact.screenshot({ path: 'debug-screenshots/sf6/contact-area-2x.png' });

  // Get full computed style of the button
  const styles = await page.evaluate(() => {
    const btn = document.querySelector('#contact .contact-section-actions .btn-primary-v2');
    const cs = getComputedStyle(btn);
    const obj = {};
    ['background','backgroundImage','backgroundColor','color','border','boxShadow','padding','width','height','display','alignItems','justifyContent','overflow','position','zIndex'].forEach(p => obj[p] = cs[p] || cs.getPropertyValue(p));
    // any ::before / ::after pseudo with content?
    const before = getComputedStyle(btn, '::before');
    const after = getComputedStyle(btn, '::after');
    return {
      styles: obj,
      before: { content: before.content, bg: before.background, position: before.position },
      after:  { content: after.content,  bg: after.background,  position: after.position },
      innerHTML: btn.innerHTML.slice(0, 500),
    };
  });
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
