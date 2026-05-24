const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = 'http://localhost:8092';
const OUT = 'C:/tmp/premium-audit';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: `.cookie-banner, #cookie-banner, [class*="cookie-banner"] { display: none !important; }` });

  const probe = await page.evaluate(() => {
    const header = document.querySelector('header, .site-header, nav[role="navigation"], #site-header');
    if (!header) return { error: 'no header' };
    return {
      headerTag: header.tagName + '.' + header.className,
      headerHTML: header.outerHTML.slice(0, 6000),
      imgs: Array.from(header.querySelectorAll('img')).map(i => ({ src: i.getAttribute('src'), alt: i.alt, w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height), x: Math.round(i.getBoundingClientRect().x) })),
      svgs: Array.from(header.querySelectorAll('svg')).map(s => ({ cls: s.getAttribute('class'), w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height), x: Math.round(s.getBoundingClientRect().x), innerStart: s.innerHTML.slice(0, 200) })),
    };
  });
  fs.writeFileSync(path.join(OUT, 'nav-probe.json'), JSON.stringify(probe, null, 2));

  const header = await page.$('header, .site-header, nav[role="navigation"], #site-header');
  if (header) await header.screenshot({ path: path.join(OUT, '_nav-zoom-desktop.png') });

  await browser.close();
  console.log('DONE nav probe');
})();
