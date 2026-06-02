/* eslint-disable */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/about.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const ann = document.querySelector('.announce-bar');
    const navMobile = document.querySelector('.sv-nav-mobile, .mobile-menu, .mobile-drawer, [data-mobile-menu], .ca-mobile-menu, .nav-mobile-drawer');
    const trialPill = Array.from(document.querySelectorAll('a,button')).filter(e => /start free trial/i.test(e.textContent || '')).map(e => ({ cls: e.className, rect: e.getBoundingClientRect() }));
    return {
      announce: ann ? { cls: ann.className, rect: ann.getBoundingClientRect() } : null,
      navMobile: navMobile ? { cls: navMobile.className, vis: getComputedStyle(navMobile).display, rect: navMobile.getBoundingClientRect() } : null,
      trialPills: trialPill.slice(0, 5),
      bodyClass: document.body.className,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.close();
  await browser.close();
})();
