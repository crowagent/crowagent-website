/* eslint-disable */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/contact.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1200);
  const out = await page.evaluate(() => {
    const cs = (el, prop) => el ? getComputedStyle(el).getPropertyValue(prop).trim() : null;
    const main = document.querySelector('main');
    const section = document.querySelector('main section');
    return {
      htmlColorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'no-pref'),
      bodyBg: cs(document.body, 'background-color'),
      bodyColor: cs(document.body, 'color'),
      mainBg: main ? cs(main, 'background-color') : null,
      sectionBg: section ? cs(section, 'background-color') : null,
      h1Color: cs(document.querySelector('h1'), 'color'),
      cloudVar: cs(document.documentElement, '--cloud'),
      bgVar: cs(document.documentElement, '--bg'),
    };
  });
  console.log('DARK:', JSON.stringify(out, null, 2));
  await page.close();

  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const p2 = await ctx2.newPage();
  await p2.goto('http://localhost:8092/contact.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p2.waitForTimeout(1200);
  const out2 = await p2.evaluate(() => {
    const cs = (el, prop) => el ? getComputedStyle(el).getPropertyValue(prop).trim() : null;
    return {
      htmlColorScheme: matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'other',
      bodyBg: cs(document.body, 'background-color'),
      bodyColor: cs(document.body, 'color'),
      h1Color: cs(document.querySelector('h1'), 'color'),
      cloudVar: cs(document.documentElement, '--cloud'),
      bgVar: cs(document.documentElement, '--bg'),
    };
  });
  console.log('LIGHT:', JSON.stringify(out2, null, 2));
  await browser.close();
})();
