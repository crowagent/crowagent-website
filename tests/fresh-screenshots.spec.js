const { test } = require('@playwright/test');

const PAGES = [
  { url: '/pricing.html',          name: 'pricing'   },
  { url: '/about.html',            name: 'about'     },
  { url: '/contact.html',          name: 'contact'   },
  { url: '/faq.html',              name: 'faq'       },
  { url: '/blog/index.html',       name: 'blog'      },
  { url: '/blog/ppn-002-social-value-guide.html', name: 'blog-post' },
  { url: '/tools/index.html',      name: 'tools'     },
];

for (const p of PAGES) {
  test(`fresh screenshot ${p.name}`, async ({ page, context }) => {
    // bust cache via header
    await context.route('**/*', (route) => route.continue());
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto((process.env.BASE_URL || 'http://localhost:8092') + p.url + '?nocache=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForSelector('.logo-img-wrap', { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `C:/tmp/resp-audit/dual-logo-fix/${p.name}-final-1440.png`,
      clip: { x: 0, y: 0, width: 1440, height: 120 },
    });
  });
}
