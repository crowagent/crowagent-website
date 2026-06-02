// SF46 — capture visual evidence of founder-named items so I can see what is
// actually rendered vs reported broken. Single test, multiple screenshots.
// 2026-05-20
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE_URL || 'http://localhost:8092';
const OUT = path.join(__dirname, '..', 'debug-screenshots', 'founder-2026-05-20');

test.beforeAll(() => { fs.mkdirSync(OUT, { recursive: true }); });

const PAGES = [
  { slug: '/',                 name: 'home' },
  { slug: '/partners.html',    name: 'partners' },
  { slug: '/crowagent-core.html', name: 'crowagent-core' },
  { slug: '/crowmark.html',    name: 'crowmark' },
  { slug: '/about.html',       name: 'about' },
  { slug: '/contact.html',     name: 'contact' },
  { slug: '/cookies.html',     name: 'cookies' },
  { slug: '/terms.html',       name: 'terms' },
  { slug: '/privacy.html',     name: 'privacy' },
  { slug: '/security.html',    name: 'security' },
  { slug: '/glossary/index.html', name: 'glossary' },
  { slug: '/faq.html',         name: 'faq' },
  { slug: '/changelog.html',   name: 'changelog' },
  { slug: '/roadmap.html',     name: 'roadmap' },
  { slug: '/tools/index.html', name: 'tools' },
];

const VIEWS = [
  { w: 1440, h: 900, suffix: '1440' },
  { w: 768,  h: 1024, suffix: '768' },
  { w: 375,  h: 812, suffix: '375' },
];

for (const v of VIEWS) {
  test.describe(`viewport ${v.suffix}px`, () => {
    test.use({ viewport: { width: v.w, height: v.h } });
    for (const p of PAGES) {
      test(`${p.name}@${v.suffix}`, async ({ page }) => {
        await page.context().clearCookies();
        await page.goto(`${BASE}${p.slug}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(800);
        const out = path.join(OUT, `${p.name}-${v.suffix}.png`);
        await page.screenshot({ path: out, fullPage: true });
      });
    }
  });
}
