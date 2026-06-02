// Verify dual-logo fix on 7 affected pages
const { test, expect } = require('@playwright/test');

const PAGES = [
  { url: '/pricing.html',                name: 'pricing'    },
  { url: '/about.html',                  name: 'about'      },
  { url: '/contact.html',                name: 'contact'    },
  { url: '/faq.html',                    name: 'faq'        },
  { url: '/blog/index.html',             name: 'blog'       },
  { url: '/tools/index.html',            name: 'tools'      },
];

// Also try a blog-post if discoverable
const BASE = process.env.BASE_URL || 'http://localhost:8092';

for (const p of PAGES) {
  test(`dual-logo fix ${p.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for nav-inject.js to run
    await page.waitForSelector('.logo-img-wrap', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Measure: .logo-box bounding rect (should be 1x1 or off-screen) vs .logo-img-pic (must be visible)
    const measurements = await page.evaluate(() => {
      const wrap = document.querySelector('.logo-img-wrap');
      if (!wrap) return { error: 'no .logo-img-wrap' };
      const box = wrap.querySelector('.logo-box');
      const pic = wrap.querySelector('.logo-img-pic');
      const text = wrap.querySelector('.logo-text');
      const get = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const s = window.getComputedStyle(el);
        return {
          w: Math.round(r.width),
          h: Math.round(r.height),
          display: s.display,
          position: s.position,
          visibility: s.visibility,
          clip: s.clip,
        };
      };
      return {
        box: get(box),
        text: get(text),
        pic: get(pic),
      };
    });

    console.log(`[${p.name}]`, JSON.stringify(measurements));

    // Take screenshot of just the nav (top 120px)
    await page.screenshot({
      path: `C:/tmp/resp-audit/dual-logo-fix/${p.name}-after-1440.png`,
      clip: { x: 0, y: 0, width: 1440, height: 120 },
    });

    // ASSERTIONS:
    // 1. .logo-box must be 1x1 (sr-only)
    expect(measurements.box).not.toBeNull();
    expect(measurements.box.w).toBeLessThanOrEqual(1);
    expect(measurements.box.h).toBeLessThanOrEqual(1);
    // 2. .logo-img-pic must be visible (> 20px)
    expect(measurements.pic).not.toBeNull();
    expect(measurements.pic.w).toBeGreaterThan(20);
    expect(measurements.pic.h).toBeGreaterThan(20);
  });
}
