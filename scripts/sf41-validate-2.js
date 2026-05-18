/* SF41 — Follow-up DOM probes. */
const { chromium } = require('playwright');

const BASE = 'http://localhost:8092';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- CTA: explicit md/lg variants ---');
  const ctaProbes = [
    { route: '/crowcyber', selector: '.btn-lg.btn-primary-v2' },
    { route: '/pricing',   selector: '.btn-lg.btn-primary-v2' },
    { route: '/pricing',   selector: '.btn-md.btn-primary-v2' },
    { route: '/cookies',   selector: '.btn-md.btn-primary-v2' },
    { route: '/crowcyber', selector: '.btn-sm.btn-primary-v2' },
  ];
  for (const p of ctaProbes) {
    await page.goto(BASE + p.route, { waitUntil: 'networkidle' });
    const result = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        found: true,
        height: cs.height,
        renderedHeight: rect.height,
        borderRadius: cs.borderRadius,
        fontSize: cs.fontSize,
      };
    }, p.selector);
    console.log(`${p.route.padEnd(12)} ${p.selector.padEnd(28)} ${JSON.stringify(result)}`);
  }

  console.log('\n--- Roadmap actual card ---');
  await page.goto(BASE + '/roadmap', { waitUntil: 'networkidle' });
  const roadmap = await page.evaluate(() => {
    const el = document.querySelector('.ca-roadmap-card');
    if (!el) return { found: false };
    return { found: true, borderRadius: getComputedStyle(el).borderRadius };
  });
  console.log('/roadmap .ca-roadmap-card', JSON.stringify(roadmap));

  console.log('\n--- /demo H2 check (should be 22-30px clamp) ---');
  await page.goto(BASE + '/demo', { waitUntil: 'networkidle' });
  const demoH2s = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('main h2')).map((h) => {
      const cs = getComputedStyle(h);
      return {
        text: (h.textContent || '').trim().slice(0, 50),
        className: h.className,
        fontSize: cs.fontSize,
      };
    });
  });
  console.log(JSON.stringify(demoH2s, null, 2));

  console.log('\n--- /404 ensure no h2 missing ---');
  await page.goto(BASE + '/404', { waitUntil: 'networkidle' });
  const fourOhFour = await page.evaluate(() => {
    const h1 = document.querySelector('main h1');
    const h2 = document.querySelector('main h2');
    return { h1Text: h1 ? h1.textContent.trim().slice(0, 40) : null, h2Present: !!h2 };
  });
  console.log(JSON.stringify(fourOhFour));

  await browser.close();
})();
