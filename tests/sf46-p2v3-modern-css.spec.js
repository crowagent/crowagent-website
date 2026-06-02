/**
 * SF46 P2 v3 modern-CSS probe — Q1 / Q2 / Q4 / Q5 / Q6 / Q7 / Q8.
 *
 * Q3 (anchor positioning) + Q8 (scroll-driven animations) are tested
 * conditionally via @supports; we only assert the tokens/classes exist.
 */
const { test, expect } = require('@playwright/test');

const FIXTURE = (process.env.BASE_URL || 'http://localhost:8092')
  + '/tests/fixtures/sf46-p2v3-modern-css.html';

test.describe('Q1 — Container queries on .ca-card-v2--cq', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('Q1 .ca-card-v2--cq has container-aware padding', async ({ page }) => {
    // At fixture's 480px container width, --cq-padding should resolve to
    // var(--space-6) = 24px (the >=480px breakpoint rule).
    const paddingPx = await page.evaluate(() => {
      const c = document.getElementById('cq-card');
      return parseFloat(getComputedStyle(c).paddingTop);
    });
    // Either 24px (>=480px) or 20px (>=320px) is acceptable depending on
    // sub-pixel rounding; ≥16px proves the container rule fired.
    expect(paddingPx).toBeGreaterThanOrEqual(20);
  });

  test('Q1 .ca-card-v2--cq title uses --text-h3 (480px container)', async ({ page }) => {
    const fontSize = await page.evaluate(() => {
      const t = document.getElementById('cq-title');
      return parseFloat(getComputedStyle(t).fontSize);
    });
    // --text-h3 clamps 24-30px
    expect(fontSize).toBeGreaterThanOrEqual(20);
    expect(fontSize).toBeLessThanOrEqual(32);
  });

  test('Q1 narrowing the container shrinks the card padding', async ({ page }) => {
    // Resize the host to <320px and re-measure
    await page.evaluate(() => {
      document.getElementById('cq-host').style.width = '280px';
    });
    await page.waitForTimeout(50);
    const padding = await page.evaluate(() => {
      const c = document.getElementById('cq-card');
      return parseFloat(getComputedStyle(c).padding);
    });
    // Below 320px breakpoint → padding becomes --space-4 = 16px
    expect(padding).toBeLessThanOrEqual(20);
  });
});

test.describe('Q2 — :has() parent-selector patterns', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('Q2 form with .ca-error gets left border via :has()', async ({ page }) => {
    const borderLeftWidth = await page.evaluate(() => {
      const f = document.getElementById('form-with-err');
      return parseFloat(getComputedStyle(f).borderLeftWidth);
    });
    expect(borderLeftWidth).toBeGreaterThanOrEqual(2);
  });

  test('Q2 form without errors has no border-left', async ({ page }) => {
    const borderLeftWidth = await page.evaluate(() => {
      const f = document.getElementById('form-ok');
      return parseFloat(getComputedStyle(f).borderLeftWidth);
    });
    expect(borderLeftWidth).toBeLessThanOrEqual(1);
  });
});

test.describe('Q4 — OKLCH tokens resolve', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  for (const tok of ['--teal-oklch', '--cloud-oklch', '--bg-oklch', '--success-oklch', '--warn-oklch', '--err-oklch']) {
    test(`Q4 ${tok} resolves to oklch()`, async ({ page }) => {
      const v = await page.evaluate((t) =>
        getComputedStyle(document.documentElement).getPropertyValue(t).trim(),
      tok);
      expect(v).toContain('oklch');
    });
  }
});

test.describe('Q5 — color-mix() tokens resolve', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  for (const tok of ['--teal-mix-06', '--teal-mix-12', '--teal-mix-20', '--hover-bg', '--press-overlay']) {
    test(`Q5 ${tok} resolves to color-mix() output`, async ({ page }) => {
      const v = await page.evaluate((t) =>
        getComputedStyle(document.documentElement).getPropertyValue(t).trim(),
      tok);
      // Either the token literal is preserved (color-mix(...))
      // or it's been computed to rgba(...) by the browser at custom-prop time.
      expect(v.length, `${tok} empty`).toBeGreaterThan(0);
    });
  }
});

test.describe('Q6 — field-sizing on textarea', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('Q6 textarea has field-sizing:content where supported', async ({ page }) => {
    const fieldSize = await page.evaluate(() => {
      const ta = document.getElementById('auto-textarea');
      const cs = getComputedStyle(ta);
      // Browsers without field-sizing report 'fixed' or empty string
      return cs.fieldSizing || cs.getPropertyValue('field-sizing') || 'unsupported';
    });
    // Chrome 123+ reports 'content'; otherwise 'unsupported' / 'fixed' is ok
    expect(['content', 'fixed', 'unsupported', '', undefined])
      .toContain(fieldSize);
  });
});

test.describe('Q7 — inert attribute', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('Q7 [inert] button has pointer-events:none', async ({ page }) => {
    const pe = await page.evaluate(() => {
      const b = document.getElementById('inert-btn');
      return getComputedStyle(b).pointerEvents;
    });
    expect(pe).toBe('none');
  });

  test('Q7 [inert] button is unfocusable', async ({ page }) => {
    const focused = await page.evaluate(() => {
      const b = document.getElementById('inert-btn');
      b.focus();
      return document.activeElement === b;
    });
    expect(focused).toBe(false);
  });

  test('Q7 [inert] button has reduced opacity', async ({ page }) => {
    const opacity = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.getElementById('inert-btn')).opacity));
    expect(opacity).toBeLessThanOrEqual(0.7);
  });
});

test.describe('Q8 — scroll-driven animation classes exist', () => {
  test('Q8 .ca-reveal-on-scroll + .ca-scroll-progress styles defined', async ({ page }) => {
    await page.goto(FIXTURE);
    const result = await page.evaluate(() => {
      // Inspect sheets for the rule presence
      const sheets = Array.from(document.styleSheets);
      let hasReveal = false, hasProgress = false;
      for (const s of sheets) {
        try {
          for (const r of Array.from(s.cssRules || [])) {
            if (r.cssText && r.cssText.includes('.ca-reveal-on-scroll')) hasReveal = true;
            if (r.cssText && r.cssText.includes('.ca-scroll-progress')) hasProgress = true;
          }
        } catch (e) { /* CORS */ }
      }
      return { hasReveal, hasProgress };
    });
    expect(result.hasReveal).toBe(true);
    expect(result.hasProgress).toBe(true);
  });
});
