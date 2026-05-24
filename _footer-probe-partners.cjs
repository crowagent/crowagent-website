const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  try {
    const resp = await page.goto('http://localhost:8092/partners.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const footer = document.querySelector('footer.ca-footer');
      return { hasFooter: !!footer, footerHeight: footer ? footer.offsetHeight : 0 };
    });
    console.log('partners:', JSON.stringify({ status: resp ? resp.status() : 'no-resp', ...info, errs }));
  } catch (e) { console.log('partners ERR:', String(e)); }
  await browser.close();
})();
