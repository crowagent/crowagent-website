const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const pages = [
    '/', '/pricing.html', '/about.html', '/crowagent-core.html', '/crowmark.html',
    '/crowcyber.html', '/crowcash.html', '/crowesg.html', '/faq.html',
    '/contact.html', '/blog/index.html', '/tools/mees-risk-snapshot/',
    '/security.html', '/privacy.html', '/roadmap.html', '/csrd.html',
    '/tools/late-payment-calculator/', '/cookies.html', '/cookie-preferences.html',
    '/resources.html', '/partners.html', '/terms.html'
  ];
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  for (const p of pages) {
    const url = 'http://localhost:8092' + p;
    errs.length = 0;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      const status = resp ? resp.status() : 'no-resp';
      // Wait a tick for nav-inject to do its rAF
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => {
        const footer = document.querySelector('footer.ca-footer');
        const placeholder = document.getElementById('ca-footer');
        return {
          hasFooter: !!footer,
          footerHeight: footer ? footer.offsetHeight : 0,
          hasPlaceholder: !!placeholder,
          placeholderHTML: placeholder ? placeholder.outerHTML.slice(0, 100) : null,
          navInjectLoaded: !!window.__caDropdownAnchorWired || !!document.querySelector('header.sv-nav'),
        };
      });
      console.log(JSON.stringify({ url: p, status, ...info, errs: errs.slice(0, 3) }));
    } catch (e) {
      console.log(JSON.stringify({ url: p, error: String(e) }));
    }
  }
  await browser.close();
})();
