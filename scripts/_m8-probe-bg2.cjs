/* eslint-disable */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const cs of ['dark','light']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: cs, javaScriptEnabled: true });
    // bypass cache fully
    await ctx.route('**/*', (route) => route.continue());
    const page = await ctx.newPage();
    await page.goto('http://localhost:8092/contact.html?cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    const out = await page.evaluate(() => {
      const cs = (el, prop) => el ? getComputedStyle(el).getPropertyValue(prop).trim() : null;
      return {
        scheme: matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
        bodyBg: cs(document.body, 'background-color'),
        bodyColor: cs(document.body, 'color'),
        h1Color: cs(document.querySelector('h1'), 'color'),
        cloudVar: cs(document.documentElement, '--cloud'),
        bgVar: cs(document.documentElement, '--bg'),
        introColor: cs(document.querySelector('.page-intro'), 'color'),
      };
    });
    console.log(cs.toUpperCase(), JSON.stringify(out));
    await page.close();
    await ctx.close();
  }
  await browser.close();
})();
