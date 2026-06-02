// SF46 batch #6 — Extinction probe. Founder mandate: 5 different card
// types must share IDENTICAL computed padding and border-radius. Visits
// home + about + contact + pricing + partners pages, samples one card
// per page, and asserts parity.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

const TARGETS = [
  { slug: '/',             sel: '.hw',         label: 'home .hw' },
  { slug: '/',             sel: '.uc',         label: 'home .uc' },
  { slug: '/about.html',   sel: '.about-card', label: 'about .about-card' },
  { slug: '/contact.html', sel: '.contact-card', label: 'contact .contact-card' },
  { slug: '/partners.html', sel: '.partner-card, .trust-card', label: 'partners .partner-card/.trust-card' },
];

test.describe('SF46 B6 — Card extinction', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('5 different card types share computed padding + border-radius', async ({ page }) => {
    const readings = [];
    for (const t of TARGETS) {
      await page.goto(`${BASE}${t.slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      const el = page.locator(t.sel).first();
      const exists = await el.count();
      if (!exists) continue;
      const r = await el.evaluate(node => {
        const cs = getComputedStyle(node);
        return {
          paddingTop:    cs.paddingTop,
          paddingRight:  cs.paddingRight,
          paddingBottom: cs.paddingBottom,
          paddingLeft:   cs.paddingLeft,
          borderTopLeftRadius: cs.borderTopLeftRadius,
          boxShadow: cs.boxShadow,
        };
      });
      readings.push({ label: t.label, ...r });
    }
    expect(readings.length, 'must find ≥5 card readings').toBeGreaterThanOrEqual(5);
    const ref = readings[0];
    for (const r of readings.slice(1)) {
      expect(r.paddingTop,         `${r.label} paddingTop vs ${ref.label} (${JSON.stringify(readings)})`).toBe(ref.paddingTop);
      expect(r.paddingRight,       `${r.label} paddingRight`).toBe(ref.paddingRight);
      expect(r.paddingBottom,      `${r.label} paddingBottom`).toBe(ref.paddingBottom);
      expect(r.paddingLeft,        `${r.label} paddingLeft`).toBe(ref.paddingLeft);
      expect(r.borderTopLeftRadius, `${r.label} borderRadius`).toBe(ref.borderTopLeftRadius);
    }
    // Canonical values:
    expect(ref.paddingTop, 'canonical padding').toBe('24px');
    expect(ref.paddingLeft, 'canonical padding').toBe('24px');
    expect(ref.borderTopLeftRadius, 'canonical radius').toBe('16px');
  });
});
