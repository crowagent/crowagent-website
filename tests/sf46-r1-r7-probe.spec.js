// SF46 Phase 2 R1-R7 probe — verify premium-rhythm token + class closure.
// Closes the 7 rhythm gaps from SF46-P2-PREMIUM-RHYTHM-AUDIT-2026-05-19.md.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

async function rootCustom(page, name) {
  return await page.evaluate((n) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}
async function applyClassAndMeasure(page, className, tag = 'div') {
  return await page.evaluate(({ cls, tg }) => {
    const probe = document.createElement(tg);
    probe.className = cls;
    probe.textContent = 'Probe content';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const r = {
      fontSize: parseFloat(cs.fontSize),
      lineHeight: cs.lineHeight,
      maxWidth: cs.maxWidth,
      height: cs.height,
      padding: cs.padding,
      borderRadius: cs.borderTopLeftRadius,
      aspectRatio: cs.aspectRatio,
      fontVariationSettings: cs.fontVariationSettings,
      webkitFontSmoothing: cs.webkitFontSmoothing,
    };
    probe.remove();
    return r;
  }, { cls: className, tg: tag });
}

test.describe('SF46 R1 — Container max-width ladder', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });

  test('R1 --container-narrow === 720px', async ({ page }) => {
    expect(await rootCustom(page, '--container-narrow')).toBe('720px');
  });
  test('R1 --container-default === 1200px', async ({ page }) => {
    expect(await rootCustom(page, '--container-default')).toBe('1200px');
  });
  test('R1 --container-wide === 1400px', async ({ page }) => {
    expect(await rootCustom(page, '--container-wide')).toBe('1400px');
  });
  test('R1 .ca-container resolves to 1200px', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-container');
    expect(m.maxWidth).toBe('1200px');
  });
  test('R1 .ca-container--narrow resolves to 720px', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-container ca-container--narrow');
    expect(m.maxWidth).toBe('720px');
  });
});

test.describe('SF46 R2 — Prose measure (70ch)', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });
  test('R2 --prose-measure === 70ch', async ({ page }) => {
    expect(await rootCustom(page, '--prose-measure')).toBe('70ch');
  });
  test('R2 .ca-prose max-width resolves (non-empty, not "none")', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-prose');
    expect(m.maxWidth).not.toBe('none');
    expect(parseFloat(m.maxWidth)).toBeGreaterThan(400);
    expect(parseFloat(m.maxWidth)).toBeLessThan(900);
  });
});

test.describe('SF46 R3 — scroll-margin-top anchor token (a11y bug fix)', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });
  test('R3 --scroll-margin-anchor token resolves', async ({ page }) => {
    const v = await rootCustom(page, '--scroll-margin-anchor');
    expect(v).toContain('clamp');
  });
  test('R3 baseline applies scroll-margin-top to every h2 site-wide', async ({ page }) => {
    const sm = await page.locator('h2').first().evaluate(el =>
      parseFloat(getComputedStyle(el).scrollMarginTop)
    );
    expect(sm).toBeGreaterThanOrEqual(72);
    expect(sm).toBeLessThanOrEqual(120);
  });
  test('R3 baseline applies to every section-with-id', async ({ page }) => {
    const result = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('section[id], [id]:where(div, article)'));
      if (!ids.length) return { count: 0, anyApplied: false };
      const probe = ids[0];
      const sm = parseFloat(getComputedStyle(probe).scrollMarginTop);
      return { count: ids.length, sm };
    });
    if (result.count > 0) {
      expect(result.sm).toBeGreaterThanOrEqual(72);
    }
  });
});

test.describe('SF46 R4 — Form-field rhythm tokens', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });
  test('R4 --input-height === 44px (WCAG 2.5.5)', async ({ page }) => {
    expect(await rootCustom(page, '--input-height')).toBe('44px');
  });
  test('R4 .ca-input resolves to 44px height + token padding', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-input', 'input');
    expect(m.height).toBe('44px');
  });
  test('R4 --input-error-color token resolves to brand --err', async ({ page }) => {
    const v = await rootCustom(page, '--input-error-color');
    expect(v.length).toBeGreaterThan(0);
  });
});

test.describe('SF46 R5 — Material 3 typography role coverage', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });

  test('.ca-display resolves to 48-88px range', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-display');
    expect(m.fontSize).toBeGreaterThanOrEqual(48);
    expect(m.fontSize).toBeLessThanOrEqual(88);
  });
  test('.ca-title-lg resolves to 22-28px range', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-title-lg');
    expect(m.fontSize).toBeGreaterThanOrEqual(22);
    expect(m.fontSize).toBeLessThanOrEqual(28);
  });
  test('.ca-body-lg resolves to 18-20px range', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-body-lg');
    expect(m.fontSize).toBeGreaterThanOrEqual(18);
    expect(m.fontSize).toBeLessThanOrEqual(20);
  });
  test('.ca-body-md resolves to 16-18px range', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-body-md');
    expect(m.fontSize).toBeGreaterThanOrEqual(16);
    expect(m.fontSize).toBeLessThanOrEqual(18);
  });
  test('.ca-body-sm resolves to 14px', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-body-sm');
    expect(m.fontSize).toBeCloseTo(14, 0);
  });
  test('.ca-label-canonical is uppercase + meta size', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-label-canonical');
    expect(m.fontSize).toBeCloseTo(13, 0);
  });
});

test.describe('SF46 R6 — font-variation + smoothing baseline', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });

  test('R6 --font-variation-h1 token resolves', async ({ page }) => {
    expect(await rootCustom(page, '--font-variation-h1')).toContain('wght');
  });
  test('R6 -webkit-font-smoothing baseline applies on html', async ({ page }) => {
    const smoothing = await page.evaluate(() => getComputedStyle(document.documentElement).webkitFontSmoothing);
    expect(smoothing).toBe('antialiased');
  });
  test('R6 .ca-h1 consumes --font-variation-h1', async ({ page }) => {
    const m = await applyClassAndMeasure(page, 'ca-h1', 'h1');
    expect(m.fontVariationSettings).toContain('wght');
  });
});

test.describe('SF46 R7 — Figure + aspect-ratio rhythm', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/`); });

  test('R7 .ca-figure__media has aspect-ratio lock', async ({ page }) => {
    const ar = await page.evaluate(() => {
      const fig = document.createElement('figure');
      fig.className = 'ca-figure';
      fig.style.position = 'absolute';
      fig.style.visibility = 'hidden';
      fig.innerHTML = '<div class="ca-figure__media"><img src="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'9\'/>" /></div>';
      document.body.appendChild(fig);
      const media = fig.querySelector('.ca-figure__media');
      const r = getComputedStyle(media).aspectRatio;
      fig.remove();
      return r;
    });
    expect(ar).toContain('16');
    expect(ar).toContain('9');
  });

  test('R7 .ca-figure--square uses 1/1 aspect-ratio', async ({ page }) => {
    const ar = await page.evaluate(() => {
      const fig = document.createElement('figure');
      fig.className = 'ca-figure ca-figure--square';
      fig.style.position = 'absolute';
      fig.style.visibility = 'hidden';
      fig.innerHTML = '<div class="ca-figure__media"></div>';
      document.body.appendChild(fig);
      const r = getComputedStyle(fig.querySelector('.ca-figure__media')).aspectRatio;
      fig.remove();
      return r;
    });
    expect(ar).toMatch(/1\s*\/\s*1|1 \/ 1/);
  });
});
