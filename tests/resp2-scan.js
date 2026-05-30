const { chromium } = require('playwright');

const BASE = 'http://localhost:8092';
const OUT = 'tests/_shots';

// page -> label
const PAGES = [
  ['/tools/index.html', 'tools-index'],
  ['/tools/csrd-applicability-checker/index.html', 'tool-csrd'],
  ['/tools/cyber-essentials-readiness/index.html', 'tool-ce'],
  ['/tools/late-payment-calculator/index.html', 'tool-latepay'],
  ['/tools/mees-risk-snapshot/index.html', 'tool-mees'],
  ['/tools/ppn-002-calculator/index.html', 'tool-ppn'],
  ['/tools/vsme-materiality-light/index.html', 'tool-vsme'],
  ['/intel/mees-tracker/index.html', 'intel-mees'],
  ['/intel/cyber-essentials-tracker/index.html', 'intel-ce'],
  ['/glossary/index.html', 'gloss-index'],
  ['/glossary/csrd.html', 'gloss-csrd'],
  ['/glossary/mees-compliance.html', 'gloss-mees'],
  ['/glossary/ppn-002.html', 'gloss-ppn'],
  ['/glossary/si-2015-962.html', 'gloss-si'],
  ['/glossary/toms-framework.html', 'gloss-toms'],
  ['/glossary/epc-rating.html', 'gloss-epc'],
  ['/blog/index.html', 'blog-index'],
  ['/blog/mees-band-c-2028.html', 'blog-mees'],
  ['/blog/csrd-omnibus-i-2026.html', 'blog-csrd'],
  ['/blog/ppn-002-guide.html', 'blog-ppn'],
  ['/blog/cyber-essentials-v3-3-danzell-2026.html', 'blog-ce'],
  ['/blog/mfa-mandatory-2026.html', 'blog-mfa'],
  ['/blog/retrofit-cost-calculator-guide.html', 'blog-retrofit'],
];

const SCROLLS = [0, 750, 1500, 2250, 3000];

// allow filtering by arg: node resp2-scan.js <startIdx> <endIdx>
const startIdx = parseInt(process.argv[2] || '0', 10);
const endIdx = parseInt(process.argv[3] || String(PAGES.length), 10);

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (let i = startIdx; i < endIdx && i < PAGES.length; i++) {
    const [path, label] = PAGES[i];
    for (const W of [390, 768]) {
      const isMobile = W === 390;
      const ctx = await browser.newContext({
        viewport: { width: W, height: 844 },
        isMobile,
        deviceScaleFactor: isMobile ? 2 : 1,
        hasTouch: isMobile,
      });
      const page = await ctx.newPage();
      const url = BASE + path;
      const rec = { label, path, W, overflow: null, scrollW: null, clientW: null, err: null };
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(400);
        // measure horizontal overflow
        const m = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
          bsw: document.body ? document.body.scrollWidth : 0,
        }));
        rec.scrollW = m.sw; rec.clientW = m.cw; rec.bodyScrollW = m.bsw;
        rec.overflow = (m.sw - m.cw) > 2 ? (m.sw - m.cw) : 0;

        // find offending wide elements if overflow
        if (rec.overflow) {
          rec.wide = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const out = [];
            document.querySelectorAll('*').forEach(el => {
              const r = el.getBoundingClientRect();
              if (r.right > vw + 3 && r.width > 30) {
                out.push({ t: el.tagName, c: (el.className && el.className.toString().slice(0,40)) || '', right: Math.round(r.right), w: Math.round(r.width) });
              }
            });
            return out.slice(0, 8);
          });
        }

        for (const y of SCROLLS) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(150);
          await page.screenshot({ path: `${OUT}/resp2-${label}-${W}-y${y}.png` });
        }
      } catch (e) {
        rec.err = e.message;
      }
      results.push(rec);
      await ctx.close();
      console.log(JSON.stringify(rec));
    }
  }
  await browser.close();
}
run();
