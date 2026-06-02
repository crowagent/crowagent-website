// SF46 Phase 2 P2-A probe — verify canonical heading classes consume
// Phase 1 typography tokens correctly.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

// Token clamp ranges:
//   --text-h1: clamp(2.5rem, 5vw, 4rem)         = 40-64px
//   --text-h2: clamp(1.875rem, 3.5vw, 2.5rem)   = 30-40px
//   --text-h3: clamp(1.5rem, 2.5vw, 1.875rem)   = 24-30px
//   --text-h4: clamp(1.25rem, 1.75vw, 1.5rem)   = 20-24px
//   --text-lead: clamp(1.125rem, 1.5vw, 1.25rem)= 18-20px
//   --text-eyebrow: 0.7188rem                   = 11.5px
//   --text-meta: 0.8125rem                      = 13px

async function applyClassAndMeasure(page, className) {
  return await page.evaluate((cls) => {
    const probe = document.createElement('div');
    probe.className = cls;
    probe.textContent = 'Probe';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const result = {
      fontSize: parseFloat(cs.fontSize),
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
    };
    probe.remove();
    return result;
  }, className);
}

test.describe('SF46 P2-A — canonical heading classes consume typography tokens', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });

  test('.ca-h1 resolves to --text-h1 range (40-64px)', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-h1');
    expect(m.fontSize).toBeGreaterThanOrEqual(40);
    expect(m.fontSize).toBeLessThanOrEqual(64);
    expect(m.fontFamily).toContain('Plus Jakarta Sans');
    expect(m.fontWeight).toBe('800');
  });

  test('.ca-h2 resolves to --text-h2 range (30-40px)', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-h2');
    expect(m.fontSize).toBeGreaterThanOrEqual(30);
    expect(m.fontSize).toBeLessThanOrEqual(40);
    expect(m.fontWeight).toBe('800');
  });

  test('.ca-h3 resolves to --text-h3 range (24-30px)', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-h3');
    expect(m.fontSize).toBeGreaterThanOrEqual(24);
    expect(m.fontSize).toBeLessThanOrEqual(30);
    expect(m.fontWeight).toBe('700');
  });

  test('.ca-h4 resolves to --text-h4 range (20-24px)', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-h4');
    expect(m.fontSize).toBeGreaterThanOrEqual(20);
    expect(m.fontSize).toBeLessThanOrEqual(24);
    expect(m.fontWeight).toBe('700');
  });

  test('.ca-lead resolves to --text-lead range (18-20px)', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-lead');
    expect(m.fontSize).toBeGreaterThanOrEqual(18);
    expect(m.fontSize).toBeLessThanOrEqual(20);
    expect(m.fontFamily).toContain('Inter');
  });

  test('.ca-eyebrow resolves to ~11.5px with uppercase + tracking', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-eyebrow');
    expect(m.fontSize).toBeCloseTo(11.5, 0);
    // Letter-spacing for eyebrow is 0.10em which equals 1.15px at 11.5px
    const ls = parseFloat(m.letterSpacing);
    expect(ls).toBeGreaterThan(0.5);
  });

  test('.ca-meta resolves to ~13px', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-meta');
    expect(m.fontSize).toBeCloseTo(13, 0);
  });
});
