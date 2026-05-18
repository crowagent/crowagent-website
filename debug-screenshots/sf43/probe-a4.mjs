// Probe: where are .sh and .sh-label, are they centered?
import { chromium } from 'playwright';

const pages = [
  { url: 'http://localhost:8092/', name: 'home' },
  { url: 'http://localhost:8092/tools/', name: 'tools' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const p of pages) {
  console.log(`\n=== ${p.name} (${p.url}) ===`);
  await page.goto(p.url, { waitUntil: 'networkidle' });
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.sh')).map((sh, i) => {
      const cs = getComputedStyle(sh);
      const label = sh.querySelector('.sh-label');
      const lcs = label ? getComputedStyle(label) : null;
      const lr = label ? label.getBoundingClientRect() : null;
      const shr = sh.getBoundingClientRect();
      const h2 = sh.querySelector('h2, h1, .u-h2-display');
      const hr = h2 ? h2.getBoundingClientRect() : null;
      return {
        idx: i,
        shClass: sh.className,
        shTextAlign: cs.textAlign,
        shDisplay: cs.display,
        shLeft: Math.round(shr.left),
        shRight: Math.round(shr.right),
        shCenter: Math.round((shr.left + shr.right) / 2),
        labelDisplay: lcs ? lcs.display : null,
        labelWidth: lcs ? lcs.width : null,
        labelLeft: lr ? Math.round(lr.left) : null,
        labelRight: lr ? Math.round(lr.right) : null,
        labelCenter: lr ? Math.round((lr.left + lr.right) / 2) : null,
        h2Center: hr ? Math.round((hr.left + hr.right) / 2) : null,
        labelText: label ? label.textContent.trim().slice(0, 40) : null,
      };
    });
  });
  for (const r of results) {
    const verdict = r.h2Center !== null && r.labelCenter !== null
      ? (Math.abs(r.h2Center - r.labelCenter) <= 4 ? 'CENTRED' : 'OFFSET')
      : 'N/A';
    console.log(`  [${r.idx}] class="${r.shClass}" textAlign=${r.shTextAlign} | label="${r.labelText}" labelCenter=${r.labelCenter} h2Center=${r.h2Center} -> ${verdict}`);
  }
}

await browser.close();
