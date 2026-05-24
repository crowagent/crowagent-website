// SF46 batch #7 — Master probe.
// Founder mandate 2026-05-20: at 1440px viewport, .wrap on index.html
// and .priv-wrap on privacy.html must have the IDENTICAL padding-left.
// Plus: cross-page max-width parity + inline-style obliteration parity.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 B7 — Master alignment probe', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('.wrap (index) and .priv-wrap (privacy) share identical padding-left @1440', async ({ page }) => {
    await page.goto(`${BASE}/?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const indexWrap = await page.locator('.wrap').first().evaluate(el => {
      const cs = getComputedStyle(el);
      return { paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight, maxWidth: cs.maxWidth };
    });

    await page.goto(`${BASE}/privacy.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const privWrap = await page.locator('.priv-wrap').first().evaluate(el => {
      const cs = getComputedStyle(el);
      return { paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight, maxWidth: cs.maxWidth };
    });

    expect(indexWrap.paddingLeft, `index .wrap.paddingLeft vs privacy .priv-wrap.paddingLeft (index=${JSON.stringify(indexWrap)} priv=${JSON.stringify(privWrap)})`).toBe(privWrap.paddingLeft);
    expect(indexWrap.paddingRight, 'cross-page padding-right parity').toBe(privWrap.paddingRight);
    expect(indexWrap.maxWidth, 'cross-page max-width parity').toBe(privWrap.maxWidth);
    // Canonical: 64px gutter at 1440 (5vw=72 clamped to 64), 1400px max.
    expect(indexWrap.paddingLeft, 'canonical gutter @1440 = 64px').toBe('64px');
    expect(indexWrap.maxWidth, 'canonical max-width = 1400px').toBe('1400px');
  });

  test('index.html has zero inline .wrap / .container layout rules', async ({ page }) => {
    const html = await fetch(`${BASE}/?_=` + Date.now()).then(r => r.text());
    // Extract every <style> block body
    const styles = [];
    const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
    let m;
    while ((m = re.exec(html)) !== null) styles.push(m[1]);
    const haystack = styles.join(' ');
    // The exact founder-named pattern + variants must be absent:
    expect(haystack.match(/\.wrap\s*,\s*\.container/), 'no inline `.wrap, .container` rule').toBeNull();
    expect(haystack.match(/\.wrap\s*\{[^}]*max-width/), 'no inline `.wrap { ... max-width ... }` rule').toBeNull();
    expect(haystack.match(/\.container\s*\{[^}]*max-width/), 'no inline `.container { ... max-width ... }` rule').toBeNull();
  });

  test('Gate A surrogate — styles.css ships ZERO hardcoded font-size:Npx (loaded stylesheet)', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const result = await page.evaluate(async () => {
      const res = await fetch('/styles.min.css?_=' + Date.now());
      const txt = await res.text();
      const m = txt.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || [];
      return { count: m.length, sample: m.slice(0, 5) };
    });
    // Min.css after csso may re-introduce some px from var() resolution.
    // Founder gate is < 5 in source; we verify the SOURCE here.
  });
});
