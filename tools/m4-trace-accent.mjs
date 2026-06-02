import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: {width:1440,height:900} });
const page = await ctx.newPage();
const res = page.on('response', r => null);
await page.goto('http://localhost:8092/tools/csrd-applicability-checker/', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  const el = document.querySelector('.hero-h1-accent');
  if (!el) return { error: 'no .hero-h1-accent' };
  const cs = getComputedStyle(el);
  return {
    bgImage: cs.backgroundImage,
    bg: cs.background,
    customSky: getComputedStyle(document.documentElement).getPropertyValue('--sky'),
    customTeal: getComputedStyle(document.documentElement).getPropertyValue('--teal'),
    customCloud: getComputedStyle(document.documentElement).getPropertyValue('--cloud'),
    customTealL: getComputedStyle(document.documentElement).getPropertyValue('--teal-l'),
    bodyClass: document.body.className,
  };
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
