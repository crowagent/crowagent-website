// M1 — scan all production HTML pages for elements stuck at opacity:0 or visibility:hidden after page load.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules','coverage','playwright-report','tests','test-results','.git','_archive','snapshots','.kiro','audit','remediation','styles'].includes(f)) continue;
      walk(full, out);
    } else if (f.endsWith('.html')) {
      const rel = path.relative('.', full).replace(/\\/g, '/');
      out.push(rel);
    }
  }
  return out;
}

const BASE = 'http://localhost:8092';
const pages = walk('.');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const allFindings = [];

  for (const p of pages) {
    const url = `${BASE}/${p}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);  // give GSAP 2s to settle
      // Scroll through the page in chunks to trigger ScrollTrigger reveals
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);
      const stuck = await page.evaluate(() => {
        const stuck = [];
        document.querySelectorAll('.reveal, .sf17-reveal, [data-reveal]').forEach(el => {
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          // Element is in viewport range AND opacity:0
          if ((parseFloat(cs.opacity) === 0 || cs.visibility === 'hidden') && rect.height > 0 && rect.top < 5000) {
            stuck.push({
              tag: el.tagName,
              cls: el.className.toString().slice(0, 80),
              opacity: cs.opacity,
              visibility: cs.visibility,
              top: rect.top,
            });
          }
        });
        return stuck;
      });
      if (stuck.length > 0) {
        allFindings.push({ page: p, stuckCount: stuck.length, samples: stuck.slice(0, 3) });
        console.log(`  ${p}: ${stuck.length} stuck`);
      }
    } catch (e) {
      console.log(`  ${p}: ERROR ${e.message.slice(0, 60)}`);
    }
  }

  await browser.close();
  fs.writeFileSync('audit/opacity-stuck.json', JSON.stringify(allFindings, null, 2));
  console.log(`\nTotal pages with stuck opacity: ${allFindings.length} / ${pages.length}`);
  console.log('Report: audit/opacity-stuck.json');
})();
