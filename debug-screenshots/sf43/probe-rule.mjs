// Identify which selectors apply to those unnamed li
import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/csrd.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// Find all li with padding-left ~20px and absolute before, get path
const result = await page.evaluate(() => {
  const lis = Array.from(document.querySelectorAll('li'));
  const out = [];
  for (const li of lis) {
    const before = getComputedStyle(li, '::before');
    if (before.position !== 'absolute') continue;
    const path = [];
    let cur = li;
    let depth = 0;
    while (cur && depth < 8) {
      path.unshift(cur.tagName.toLowerCase() + (cur.className ? '.' + (typeof cur.className === 'string' ? cur.className.split(' ').join('.') : '').slice(0, 50) : ''));
      cur = cur.parentElement;
      depth++;
    }
    out.push({
      path: path.join(' > '),
      text: (li.textContent || '').trim().slice(0, 60),
      classes: (typeof li.className === 'string' ? li.className : '').slice(0, 60),
    });
  }
  return out.slice(0, 30);
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
