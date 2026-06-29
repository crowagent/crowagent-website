// Full production-page visual audit. Capture every user-facing HTML at 1440
// above-fold + footer scroll position. Outputs to C:/tmp/hp-screens/audit/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT_BASE = 'http://localhost:8092';

// Filter out dev mockup/option files. User-facing only.
const SKIP_PATTERNS = [
  /^cinematic-mockup\.html$/,
  /^demo\.html$/,
  /^premium-mockup\.html$/,
  /^final-premium-/,
  /^finished-premium-/,
  /^hero-options\//,
];

function listPages() {
  const out = [];
  function walk(dir, rel = '') {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      const relPath = rel ? `${rel}/${f}` : f;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (['node_modules', 'coverage', 'playwright-report', 'tests', 'test-results', '.git', '_archive', 'Assets', 'js', 'tools'].includes(f)) continue;
        walk(full, relPath);
      } else if (f.endsWith('.html')) {
        if (SKIP_PATTERNS.some(p => p.test(relPath))) continue;
        out.push(relPath.replace(/\\/g, '/'));
      }
    }
  }
  walk('.');
  return out.sort();
}

(async () => {
  const outDir = 'C:/tmp/hp-screens/audit';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const pages = listPages();
  console.log(`Auditing ${pages.length} pages.`);

  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  const results = [];
  for (const page of pages) {
    const url = `${ROOT_BASE}/${page}?_=${Date.now()}`;
    const safeName = page.replace(/[\/\\]/g, '__').replace(/\.html$/, '');
    try {
      const resp = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = resp ? resp.status() : 0;
      await p.waitForTimeout(1500);
      // Force-reveal everything
      await p.evaluate(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        document.querySelectorAll('.sf17-reveal').forEach(el => el.classList.add('is-revealed'));
      });
      await p.waitForTimeout(300);
      // Top
      await p.screenshot({ path: `${outDir}/${safeName}-01-top.png`, fullPage: false });
      // Footer
      await p.evaluate(() => {
        const f = document.querySelector('#ca-footer, footer, .ca-footer');
        if (f) {
          const y = f.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: y - 40, behavior: 'instant' });
        } else {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
        }
      });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${outDir}/${safeName}-02-footer.png`, fullPage: false });
      const docH = await p.evaluate(() => document.documentElement.scrollHeight);
      results.push({ page, status, docH, ok: true });
      console.log(`  ✓ ${page} (${status}, ${docH}px)`);
    } catch (e) {
      results.push({ page, error: e.message, ok: false });
      console.log(`  ✗ ${page} — ${e.message.slice(0,80)}`);
    }
  }
  await b.close();
  fs.writeFileSync(`${outDir}/_results.json`, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outDir}/_results.json`);
})();
