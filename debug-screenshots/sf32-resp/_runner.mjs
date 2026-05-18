// Read-only responsive screenshot + probe runner for SF-32.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:8092';
const OUT = path.resolve('debug-screenshots/sf32-resp');
fs.mkdirSync(OUT, { recursive: true });

const WIDTHS = [375, 768, 1024, 1280, 1440, 1920];
const PAGES = [
  '/', '/about.html', '/contact.html', '/security.html', '/pricing.html',
  '/faq.html', '/privacy.html', '/terms.html', '/resources.html', '/partners.html',
  '/crowcyber.html', '/crowcash.html', '/crowmark.html', '/crowagent-core.html',
  '/crowesg.html', '/csrd.html', '/products/', '/tools/', '/blog/',
  '/blog/cyber-essentials-v3-3-danzell-2026.html', '/glossary/'
];

const slug = (p) => {
  let s = p.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!s) s = 'index';
  return s.replace(/\//g, '_').replace(/\.html$/, '');
};

const results = {}; // page -> { widths:{w:{hScroll,broken,errors}} }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });

  for (const p of PAGES) {
    results[p] = { widths: {} };
    for (const w of WIDTHS) {
      const page = await ctx.newPage();
      await page.setViewportSize({ width: w, height: 900 });
      let consoleErrors = 0;
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors++; });
      page.on('pageerror', () => { consoleErrors++; });
      let loadOk = true;
      try {
        await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 });
      } catch {
        try {
          await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch {
          loadOk = false;
        }
      }
      await page.waitForTimeout(2000);
      let hScroll = false, broken = 0;
      try {
        hScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        broken = await page.evaluate(() => {
          const imgs = Array.from(document.images);
          return imgs.filter(i => i.naturalWidth === 0).length;
        });
      } catch {}
      const file = path.join(OUT, `${slug(p)}-${w}.png`);
      try {
        await page.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: 900 } });
      } catch {
        try { await page.screenshot({ path: file }); } catch {}
      }
      results[p].widths[w] = { hScroll, broken, errors: consoleErrors, loadOk };
      await page.close();
      process.stdout.write(`${p} @${w}: hScroll=${hScroll} broken=${broken} errors=${consoleErrors}\n`);
    }
  }

  await ctx.close();
  await browser.close();

  // Aggregate per page across widths
  const rows = [];
  for (const p of PAGES) {
    const cells = WIDTHS.map(w => results[p].widths[w]?.hScroll === true);
    const anyBroken = WIDTHS.reduce((m, w) => Math.max(m, results[p].widths[w]?.broken || 0), 0);
    const anyErrors = WIDTHS.reduce((m, w) => Math.max(m, results[p].widths[w]?.errors || 0), 0);
    rows.push({ p, cells, anyBroken, anyErrors });
  }

  let md = `# SF-32 Responsive Audit (${new Date().toISOString()})\n\n`;
  md += `| Page | 375 | 768 | 1024 | 1280 | 1440 | 1920 | broken imgs | console errors |\n`;
  md += `|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows) {
    const bad = r.cells.some(c => c) || r.anyBroken > 0 || r.anyErrors > 0;
    const mark = bad ? ' **!!**' : '';
    md += `| \`${r.p}\`${mark} | ${r.cells.map(c => c ? '**TRUE**' : 'false').join(' | ')} | ${r.anyBroken} | ${r.anyErrors} |\n`;
  }

  // Worst 5
  const scored = rows.map(r => ({
    p: r.p,
    score: r.cells.filter(Boolean).length * 10 + r.anyBroken * 2 + r.anyErrors
  })).sort((a,b)=>b.score-a.score).filter(r=>r.score>0).slice(0,5);
  md += `\n## Top 5 worst pages\n`;
  for (const s of scored) {
    md += `- \`${s.p}\` (score ${s.score}) — screenshots: `;
    md += WIDTHS.map(w => `\`debug-screenshots/sf32-resp/${slug(s.p)}-${w}.png\``).join(', ');
    md += `\n`;
  }
  if (scored.length === 0) md += `_No defects detected._\n`;

  fs.writeFileSync(path.join(OUT, 'REPORT.md'), md);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  console.log('\nWrote REPORT.md and results.json');
})();
