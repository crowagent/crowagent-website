import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/products/', { waitUntil: 'networkidle' });
const results = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.sh')).map((sh, i) => {
    const label = sh.querySelector('.sh-label');
    if (!label) return null;
    const cs = getComputedStyle(sh);
    const lcs = getComputedStyle(label);
    const lr = label.getBoundingClientRect();
    const shr = sh.getBoundingClientRect();
    const h2 = sh.querySelector('h2, h1');
    const hr = h2 ? h2.getBoundingClientRect() : null;
    return {
      idx: i,
      classes: sh.className,
      style: sh.getAttribute('style'),
      shTextAlign: cs.textAlign,
      labelDisplay: lcs.display,
      labelWidth: lcs.width,
      labelJustifyContent: lcs.justifyContent,
      labelAlignSelf: lcs.alignSelf,
      labelMarginLeft: lcs.marginLeft,
      labelLeft: Math.round(lr.left - shr.left),
      labelCenter: Math.round((lr.left + lr.right) / 2),
      shCenter: Math.round((shr.left + shr.right) / 2),
      h2Center: hr ? Math.round((hr.left + hr.right) / 2) : null,
    };
  }).filter(Boolean);
});
console.log(JSON.stringify(results, null, 2));
await browser.close();
