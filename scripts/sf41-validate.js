/* SF41 — Playwright validation: screenshots + DOM probes. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SHOT_DIR = path.join(ROOT, 'debug-screenshots', 'sf41');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const BASE = 'http://localhost:8092';

const samples = [
  { route: '/', file: 'home' },
  { route: '/about', file: 'about' },
  { route: '/security', file: 'security' },
  { route: '/pricing', file: 'pricing' },
  { route: '/faq', file: 'faq' },
  { route: '/terms', file: 'terms' },
  { route: '/cookies', file: 'cookies' },
  { route: '/404', file: '404' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = {};

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const url = page.url();
      consoleErrors[url] = consoleErrors[url] || [];
      consoleErrors[url].push(msg.text());
    }
  });

  for (const s of samples) {
    const url = BASE + s.route;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.screenshot({ path: path.join(SHOT_DIR, `${s.file}.png`), fullPage: false });
      console.log(`[shot] ${s.route} -> ${s.file}.png`);
    } catch (err) {
      console.log(`[FAIL] ${s.route}: ${err.message}`);
    }
  }

  // ---- DOM probe 1: eyebrow consistency -----------------------------
  // Find a page that contains each selector and read its computed style.
  const probeSites = [
    { route: '/', selector: '.hero-eyebrow' },
    { route: '/terms', selector: '.terms-eyebrow' },
    { route: '/security', selector: '.sec-eyebrow' },
    { route: '/cookies', selector: '.cookies-hero__eyebrow' },
    { route: '/404', selector: '.nf-eyebrow' },
  ];
  console.log('\n--- DOM probe: eyebrow computed styles ---');
  for (const p of probeSites) {
    await page.goto(BASE + p.route, { waitUntil: 'networkidle' });
    const result = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      return {
        found: true,
        fontSize: cs.fontSize,
        color: cs.color,
        borderRadius: cs.borderRadius,
        background: cs.backgroundColor,
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
        padding: cs.padding,
      };
    }, p.selector);
    console.log(`${p.route.padEnd(12)} ${p.selector.padEnd(28)} ${JSON.stringify(result)}`);
  }

  // ---- DOM probe 2: primary CTA height + radius ---------------------
  console.log('\n--- DOM probe: primary CTA size ---');
  const ctaSites = [
    { route: '/crowcyber', selector: '.btn.btn-primary-v2' },
    { route: '/pricing', selector: '.btn.btn-primary-v2' },
    { route: '/', selector: '.btn-lg.btn-primary-v2' },
  ];
  for (const p of ctaSites) {
    await page.goto(BASE + p.route, { waitUntil: 'networkidle' });
    const result = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        found: true,
        computedHeight: cs.height,
        renderedHeight: rect.height,
        borderRadius: cs.borderRadius,
        fontSize: cs.fontSize,
        padding: cs.padding,
      };
    }, p.selector);
    console.log(`${p.route.padEnd(12)} ${p.selector.padEnd(28)} ${JSON.stringify(result)}`);
  }

  // ---- DOM probe 3: card border-radius on /security, /products, /roadmap
  console.log('\n--- DOM probe: card border-radius ---');
  const cardSites = [
    { route: '/security', selector: '.sec-aes-card' },
    { route: '/products', selector: '.product-hub-card' },
    { route: '/roadmap', selector: '.roadmap-item' },
  ];
  for (const p of cardSites) {
    await page.goto(BASE + p.route, { waitUntil: 'networkidle' });
    const result = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      return { found: true, borderRadius: cs.borderRadius };
    }, p.selector);
    console.log(`${p.route.padEnd(12)} ${p.selector.padEnd(28)} ${JSON.stringify(result)}`);
  }

  // ---- DOM probe 4: lead paragraphs on terms/cookies ---------------
  console.log('\n--- DOM probe: terms/cookies lead ---');
  const leadSites = [
    { route: '/terms', selector: '.terms-lead' },
    { route: '/cookies', selector: '.cookies-hero__intro' },
  ];
  for (const p of leadSites) {
    await page.goto(BASE + p.route, { waitUntil: 'networkidle' });
    const result = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      return {
        found: true,
        fontSize: cs.fontSize,
        color: cs.color,
        textTransform: cs.textTransform,
        letterSpacing: cs.letterSpacing,
        fontWeight: cs.fontWeight,
      };
    }, p.selector);
    console.log(`${p.route.padEnd(12)} ${p.selector.padEnd(28)} ${JSON.stringify(result)}`);
  }

  // ---- DOM probe 5: H2 size on /404 and /demo ----------------------
  console.log('\n--- DOM probe: /404 + /demo h2 ---');
  for (const route of ['/404', '/demo']) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => {
      const h2 = document.querySelector('main h2');
      if (!h2) return { found: false };
      const cs = getComputedStyle(h2);
      return {
        found: true,
        text: (h2.textContent || '').trim().slice(0, 60),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
      };
    });
    console.log(`${route.padEnd(12)} ${JSON.stringify(result)}`);
  }

  console.log('\n--- console errors ---');
  if (Object.keys(consoleErrors).length === 0) {
    console.log('(none)');
  } else {
    for (const [url, errs] of Object.entries(consoleErrors)) {
      console.log(url);
      for (const e of errs) console.log('  ' + e);
    }
  }

  await browser.close();
})();
