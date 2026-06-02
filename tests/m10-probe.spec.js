// @ts-check
const { test, expect } = require('@playwright/test');

const PAGES = [
  ['pricing', '/pricing.html'],
  ['roadmap', '/roadmap.html'],
  ['faq', '/faq.html'],
  ['changelog', '/changelog.html'],
  ['resources', '/resources.html'],
  ['products', '/products/'],
  ['tools', '/tools/'],
  ['glossary', '/glossary/'],
  ['blog', '/blog/'],
  ['404', '/404.html'],
];

const SELECTORS = {
  pricing: ['body', 'h1', '.hero', 'p.hero-sub'],
  roadmap: ['body', 'h1', '.hero'],
  faq: ['body', 'h1', '.hero', '.sh'],
  changelog: ['body', 'h1', '.hero'],
  resources: ['body', 'h1', '.resources-hero'],
  products: ['body', 'h1', '.hero'],
  tools: ['body', 'h1.page-title', '.hero'],
  glossary: ['body', 'h1', '.hero'],
  blog: ['body', 'h1', '.blog-hero'],
  '404': ['body', 'h1.nf-title', '.nf-shell', '.nf-pill', '.nf-body'],
};

test('probe colors', async ({ page }) => {
  test.setTimeout(120000);
  const base = process.env.BASE_URL || 'http://localhost:8092';
  const out = {};
  for (const [key, url] of PAGES) {
    out[key] = {};
    await page.goto(base + url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    for (const sel of SELECTORS[key]) {
      try {
        const r = await page.locator(sel).first().evaluate((el) => {
          const cs = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            backgroundImage: cs.backgroundImage,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            visible: rect.width > 0 && rect.height > 0,
            display: cs.display,
            opacity: cs.opacity,
          };
        });
        out[key][sel] = r;
      } catch (e) {
        out[key][sel] = { err: String(e).slice(0, 80) };
      }
    }
    // Page background actually painted: look at body+html parent chain
    const bg = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const main = document.querySelector('main');
      return {
        html: getComputedStyle(root).backgroundColor,
        body: getComputedStyle(body).backgroundColor,
        main: main ? getComputedStyle(main).backgroundColor : null,
        bodyClass: body.className,
      };
    });
    out[key].__page = bg;
  }
  console.log('PROBE_RESULT=' + JSON.stringify(out, null, 2));
});
