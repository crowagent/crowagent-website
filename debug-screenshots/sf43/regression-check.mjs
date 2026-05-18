// Sanity check other pages haven't been broken
import { chromium } from 'playwright';
const browser = await chromium.launch();

const pages = ['/crowmark.html', '/crowagent-core.html', '/crowesg.html', '/'];
for (const p of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const status = await page.goto('http://localhost:8092' + p);
  await page.waitForTimeout(400);
  console.log(p, 'status=', status?.status());

  const data = await page.evaluate(() => {
    const probe = (sel) => {
      const ns = document.querySelectorAll(sel);
      if (!ns.length) return null;
      const cs = getComputedStyle(ns[0]);
      const before = getComputedStyle(ns[0], '::before');
      return {
        count: ns.length,
        display: cs.display,
        color: cs.color,
        webkitFill: cs.webkitTextFillColor,
        beforePos: before.position,
        beforeWidth: before.width,
      };
    };
    return {
      scNum: probe('.sc-num'),
      proseList: probe('.f10-prose-list li'),
      summaryBox: probe('.f10-summary-box ul li'),
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await ctx.close();
}
await browser.close();
