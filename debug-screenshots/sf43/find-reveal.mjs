import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const n = document.querySelector('.sc-num');
  if (!n) return null;
  const section = n.closest('section');
  return {
    sectionClasses: section ? section.className : null,
    sectionId: section ? section.id : null,
    parents: (function() {
      const arr = [];
      let cur = n;
      while (cur && cur !== document.body) {
        arr.push({
          tag: cur.tagName,
          cls: typeof cur.className === 'string' ? cur.className : '',
          opacity: getComputedStyle(cur).opacity,
        });
        cur = cur.parentElement;
      }
      return arr;
    })(),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
