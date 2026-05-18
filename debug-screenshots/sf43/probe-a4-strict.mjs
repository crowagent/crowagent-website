// Strict probe: any .sh where textAlign=center but label NOT centered horizontally within sh
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
  'http://localhost:8092/csrd.html',
  'http://localhost:8092/faq.html',
  'http://localhost:8092/contact.html',
  'http://localhost:8092/partners.html',
  'http://localhost:8092/roadmap.html',
];
const widths = [375, 768, 1024, 1280, 1440];

const browser = await chromium.launch();
let bugCount = 0;
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const url of pages) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(250);
      const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.sh, .sh-label')).map((el, i) => {
          // If element is .sh
          let sh = el.classList.contains('sh') ? el : el.closest('.sh');
          if (!sh) return null;
          const label = sh.querySelector('.sh-label');
          if (!label) return null;
          const cs = getComputedStyle(sh);
          const lr = label.getBoundingClientRect();
          const shr = sh.getBoundingClientRect();
          return {
            tagDataset: sh.className,
            textAlign: cs.textAlign,
            labelLeftRelToSh: Math.round(lr.left - shr.left),
            shWidth: Math.round(shr.width),
            labelWidth: Math.round(lr.width),
            // is label horizontally centered within sh?
            offsetFromCentered: Math.round((lr.left + lr.right) / 2 - (shr.left + shr.right) / 2),
          };
        }).filter(Boolean);
      });
      // dedupe by serializing
      const seen = new Set();
      for (const r of results) {
        const k = JSON.stringify(r);
        if (seen.has(k)) continue;
        seen.add(k);
        if (r.textAlign === 'center' && Math.abs(r.offsetFromCentered) > 4) {
          bugCount++;
          console.log(`  ${url.split('localhost:8092')[1]} w=${w} class="${r.tagDataset}" offsetFromCentered=${r.offsetFromCentered}px labelLeftFromShLeft=${r.labelLeftRelToSh}px`);
        }
      }
    } catch (e) {
      console.log(`  ${url} w=${w}: ${e.message}`);
    }
  }
  await ctx.close();
}
console.log(`\nTotal hanging-label bugs: ${bugCount}`);
await browser.close();
