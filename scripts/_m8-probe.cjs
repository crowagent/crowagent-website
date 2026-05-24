/* eslint-disable */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pages = ['about.html','contact.html','partners.html','privacy.html','terms.html','security.html','cookies.html','cookie-preferences.html'];
  for (const p of pages) {
    const page = await ctx.newPage();
    try {
      await page.goto('http://localhost:8092/' + p, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);
      const result = await page.evaluate(() => {
        const out = {};
        const cs = (el, prop) => el ? getComputedStyle(el).getPropertyValue(prop).trim() : null;
        out.htmlBg = cs(document.documentElement, 'background-color');
        out.htmlTheme = document.documentElement.getAttribute('data-theme');
        out.bodyBg = cs(document.body, 'background-color');
        out.bodyClass = document.body.className;
        const h1 = document.querySelector('h1');
        out.h1Text = h1 ? h1.textContent.trim().slice(0, 40) : null;
        out.h1Color = cs(h1, 'color');
        out.h1FontSize = cs(h1, 'font-size');
        out.h1Selector = h1 ? (h1.className || h1.tagName) : null;
        const intro = document.querySelector('.page-intro, .hero-subtitle, .lead');
        out.introColor = cs(intro, 'color');
        const eyebrow = document.querySelector('.section-label, .sv-eyebrow, .hero-eyebrow, .page-label');
        out.eyebrowBg = cs(eyebrow, 'background-color');
        out.eyebrowColor = cs(eyebrow, 'color');
        // probe last-updated
        const lu = Array.from(document.querySelectorAll('*')).find(e => /last[\s-]updated/i.test(e.textContent || '') && (e.children.length === 0 || e.textContent.length < 200));
        out.luColor = lu ? cs(lu, 'color') : null;
        out.luText = lu ? lu.textContent.trim().slice(0, 80) : null;
        // announce bar height & overlap probe
        const ann = document.querySelector('.announce-bar, .sf-announce, .ca-announce, .announce, [class*="announce" i]');
        out.announce = ann ? { cls: ann.className, h: ann.getBoundingClientRect().height, bottom: ann.getBoundingClientRect().bottom } : null;
        // footer
        const f = document.querySelector('footer, .site-footer, #footer');
        out.footerTop = f ? f.getBoundingClientRect().top : null;
        return out;
      });
      console.log(p, JSON.stringify(result));
    } catch (e) {
      console.error(p, 'ERR', e.message);
    } finally { await page.close(); }
  }
  await browser.close();
})();
