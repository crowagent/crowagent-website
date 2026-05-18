import { chromium } from 'playwright';

const pages = [
  'http://localhost:8092/',
  'http://localhost:8092/about.html',
  'http://localhost:8092/pricing.html',
  'http://localhost:8092/security.html',
  'http://localhost:8092/products/',
  'http://localhost:8092/tools/',
  'http://localhost:8092/blog/',
  'http://localhost:8092/crowcyber.html',
  'http://localhost:8092/crowmark.html',
  'http://localhost:8092/crowagent-core.html',
  'http://localhost:8092/crowcash.html',
  'http://localhost:8092/crowesg.html',
];
const widths = [768, 1024, 1280, 1440];

const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  console.log(`\n=========== viewport ${w} ===========`);
  for (const url of pages) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(300);
      const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.sh')).map((sh, i) => {
          const cs = getComputedStyle(sh);
          const label = sh.querySelector('.sh-label');
          if (!label) return null;
          const lcs = getComputedStyle(label);
          const lr = label.getBoundingClientRect();
          const shr = sh.getBoundingClientRect();
          const h2 = sh.querySelector('h2, h1, .u-h2-display');
          const hr = h2 ? h2.getBoundingClientRect() : null;
          return {
            idx: i,
            shClass: sh.className,
            shTextAlign: cs.textAlign,
            labelDisplay: lcs.display,
            labelCenter: Math.round((lr.left + lr.right) / 2),
            h2Center: hr ? Math.round((hr.left + hr.right) / 2) : null,
            shCenter: Math.round((shr.left + shr.right) / 2),
            shLeft: Math.round(shr.left),
            labelText: label.textContent.trim().slice(0, 30),
          };
        }).filter(Boolean);
      });
      for (const r of results) {
        const isCenterClass = /\b(center|force-center|is-centered)\b/.test(r.shClass);
        const aligned = r.h2Center !== null && Math.abs(r.h2Center - r.labelCenter) <= 4;
        const expectCenter = isCenterClass || r.shTextAlign === 'center';
        let verdict = 'OK';
        if (expectCenter && !aligned) verdict = 'BUG-HANGING';
        else if (!expectCenter && aligned && Math.abs(r.labelCenter - r.shCenter) <= 4) verdict = 'ok-centred';
        if (verdict === 'BUG-HANGING') {
          console.log(`  ${url.split('localhost:8092')[1]} [${r.idx}] class="${r.shClass}" textAlign=${r.shTextAlign} label="${r.labelText}" labelCenter=${r.labelCenter} h2Center=${r.h2Center} display=${r.labelDisplay} -> ${verdict}`);
        }
      }
    } catch (e) {
      console.log(`  ${url}: ${e.message}`);
    }
  }
  await ctx.close();
}
await browser.close();
