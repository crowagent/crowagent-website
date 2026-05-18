// NU2 — Card truncation audit
import { chromium } from 'playwright';

const pages = [
  '/',
  '/about.html',
  '/pricing.html',
  '/security.html',
  '/products/',
  '/tools/',
  '/blog/',
  '/crowcyber.html',
  '/crowmark.html',
  '/crowagent-core.html',
  '/crowcash.html',
  '/crowesg.html',
  '/csrd.html',
];
const widths = [375, 480, 768, 1024, 1280, 1440];

const browser = await chromium.launch();
const summary = [];
const detailed = [];

for (const path of pages) {
  const row = { path };
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto('http://localhost:8092' + path, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(400);
      const data = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[class*="card"]')).filter((el) => {
          // visible content
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
          return true;
        });
        const truncations = [];
        for (const card of cards) {
          const texts = card.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,div');
          for (const el of texts) {
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            // Skip elements with no direct text content
            const directText = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim()).length > 0;
            if (!directText) continue;
            let truncated = false;
            let reason = '';
            if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
              truncated = true;
              reason = 'ellipsis horizontal';
            }
            if (cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 1 && cs.webkitLineClamp && cs.webkitLineClamp !== 'none') {
              truncated = true;
              reason = `line-clamp ${cs.webkitLineClamp}`;
            }
            if (cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 4 && !cs.webkitLineClamp) {
              // Plain overflow:hidden clipping content
              truncated = true;
              reason = 'overflow-hidden clipping';
            }
            if (truncated) {
              truncations.push({
                tag: el.tagName,
                class: el.className && typeof el.className === 'string' ? el.className.slice(0, 50) : '',
                text: el.textContent.trim().slice(0, 60),
                reason,
                cardClass: card.className && typeof card.className === 'string' ? card.className.slice(0, 50) : '',
                scrollH: el.scrollHeight,
                clientH: el.clientHeight,
                scrollW: el.scrollWidth,
                clientW: el.clientWidth,
              });
            }
          }
        }
        // Dedupe
        const seen = new Set();
        const unique = [];
        for (const t of truncations) {
          const k = t.tag + '|' + t.class + '|' + t.text;
          if (!seen.has(k)) { seen.add(k); unique.push(t); }
        }
        return { cardCount: cards.length, truncations: unique };
      });
      row[`v${w}`] = `${data.cardCount}/${data.truncations.length}`;
      if (data.truncations.length > 0) {
        for (const t of data.truncations) {
          detailed.push({ path, w, ...t });
        }
      }
    } catch (e) {
      row[`v${w}`] = 'err';
    }
    await ctx.close();
  }
  summary.push(row);
}

console.log('\n=== Per-page (cardCount/truncatedCount) ===\n');
const cols = ['path', ...widths.map(w => `v${w}`)];
console.log(cols.map(c => c.padEnd(20)).join('|'));
for (const row of summary) {
  console.log(cols.map(c => String(row[c] || '').padEnd(20)).join('|'));
}

console.log(`\n=== Detailed truncations (${detailed.length}) ===`);
for (const d of detailed.slice(0, 30)) {
  console.log(`${d.path} w=${d.w} <${d.tag}> "${d.text}" reason=${d.reason} card="${d.cardClass}"`);
}

await browser.close();
