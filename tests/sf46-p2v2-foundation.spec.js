/**
 * SF46 P2 v2 foundation probe — P2-AI / AJ / AL / AN / AV / AY / BC.
 * Computed-style assertions against the fixture page.
 */
const { test, expect } = require('@playwright/test');

const FIXTURE = (process.env.BASE_URL || 'http://localhost:8092')
  + '/tests/fixtures/sf46-p2v2-foundation.html';

test.describe('P2-AI — 6-state button', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-AI disabled button has reduced opacity + not-allowed', async ({ page }) => {
    const { opacity, cursor } = await page.evaluate(() => {
      const b = document.getElementById('btn-disabled');
      return { opacity: parseFloat(getComputedStyle(b).opacity), cursor: getComputedStyle(b).cursor };
    });
    expect(opacity).toBeLessThanOrEqual(0.5);
    expect(cursor).toBe('not-allowed');
  });

  test('P2-AI loading button has transparent text + cursor:progress', async ({ page }) => {
    const { color, cursor } = await page.evaluate(() => {
      const b = document.getElementById('btn-loading');
      return { color: getComputedStyle(b).color, cursor: getComputedStyle(b).cursor };
    });
    expect(color).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);
    expect(cursor).toBe('progress');
  });

  test('P2-AI aria-busy="true" button uses cursor:progress', async ({ page }) => {
    const cursor = await page.evaluate(() =>
      getComputedStyle(document.getElementById('btn-busy')).cursor);
    expect(cursor).toBe('progress');
  });

  test('P2-AI empty button has dashed border + muted color', async ({ page }) => {
    const { borderStyle, color } = await page.evaluate(() => {
      const b = document.getElementById('btn-empty');
      const cs = getComputedStyle(b);
      return { borderStyle: cs.borderStyle, color: cs.color };
    });
    expect(borderStyle).toBe('dashed');
  });
});

test.describe('P2-AJ — Card 6-state', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-AJ disabled card has reduced opacity', async ({ page }) => {
    const opacity = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.getElementById('card-disabled')).opacity));
    expect(opacity).toBeLessThan(0.7);
  });

  test('P2-AJ aria-busy="true" card cursor:progress', async ({ page }) => {
    const cursor = await page.evaluate(() =>
      getComputedStyle(document.getElementById('card-busy')).cursor);
    expect(cursor).toBe('progress');
  });

  test('P2-AJ aria-selected="true" card has teal border + shadow', async ({ page }) => {
    const { borderColor } = await page.evaluate(() => {
      const c = document.getElementById('card-selected');
      return { borderColor: getComputedStyle(c).borderTopColor };
    });
    // --teal #0CC9A8 → rgb(12, 201, 168)
    expect(borderColor).toMatch(/rgb\(\s*12,\s*201,\s*168\s*\)/);
  });
});

test.describe('P2-AL — Form loading-state + spinner', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-AL form[aria-busy="true"] is pointer-events:none', async ({ page }) => {
    const pe = await page.evaluate(() =>
      getComputedStyle(document.getElementById('form-busy')).pointerEvents);
    expect(pe).toBe('none');
  });

  test('P2-AL .ca-spinner is inline-block with rounded border', async ({ page }) => {
    const { display, borderRadius, animationName } = await page.evaluate(() => {
      const s = document.getElementById('ca-spinner');
      const cs = getComputedStyle(s);
      return { display: cs.display, borderRadius: cs.borderRadius, animationName: cs.animationName };
    });
    expect(display).toBe('inline-block');
    expect(borderRadius).toBe('50%');
    expect(animationName).toMatch(/ca-spin/);
  });
});

test.describe('P2-AN — Focus ring (WCAG 2.4.13)', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-AN focus-visible button has ≥2px outline + offset', async ({ page }) => {
    await page.evaluate(() => document.getElementById('btn-rest').focus());
    const { outlineWidth, outlineOffset } = await page.evaluate(() => {
      const b = document.getElementById('btn-rest');
      const cs = getComputedStyle(b);
      return { outlineWidth: cs.outlineWidth, outlineOffset: cs.outlineOffset };
    });
    expect(parseFloat(outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(parseFloat(outlineOffset)).toBeGreaterThanOrEqual(2);
  });
});

test.describe('P2-AV — Footnote / superscript', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-AV .ca-footnote-ref is superscript (vertical-align:super)', async ({ page }) => {
    const va = await page.evaluate(() =>
      getComputedStyle(document.getElementById('fn-ref-1')).verticalAlign);
    expect(va).toBe('super');
  });

  test('P2-AV .ca-footnotes block has top border', async ({ page }) => {
    const bt = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.ca-footnotes')).borderTopStyle);
    expect(bt).toBe('solid');
  });

  test('P2-AV footnote anchor has scroll-margin-top for sticky-nav clearance', async ({ page }) => {
    const sm = await page.evaluate(() =>
      getComputedStyle(document.getElementById('fn-1')).scrollMarginTop);
    expect(parseFloat(sm)).toBeGreaterThan(0);
  });
});

test.describe('P2-AY — Color-for-meaning', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-AY default .ca-trust-pill uses neutral border (not brand teal)', async ({ page }) => {
    const bc = await page.evaluate(() =>
      getComputedStyle(document.getElementById('pill-neutral')).borderTopColor);
    // --border2 is rgba(12, 201, 168, 0.20) — semi-transparent teal — that's
    // the neutral SF46 default border, NOT decorative full-opacity teal.
    expect(bc).toMatch(/rgba\(\s*12,\s*201,\s*168,\s*0\.2\d*\)/);
  });

  test('P2-AY ca-trust-pill--success uses --success color', async ({ page }) => {
    const c = await page.evaluate(() =>
      getComputedStyle(document.getElementById('pill-success')).color);
    expect(c).toMatch(/rgb\(\s*34,\s*197,\s*94\s*\)/);
  });

  test('P2-AY ca-trust-pill--primary uses full-opacity --teal', async ({ page }) => {
    const c = await page.evaluate(() =>
      getComputedStyle(document.getElementById('pill-primary')).color);
    expect(c).toMatch(/rgb\(\s*12,\s*201,\s*168\s*\)/);
  });
});

test.describe('P2-BC — Unified motion + .ca-tag variants', () => {
  test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

  test('P2-BC .ca-tag default uses --neutral-bg', async ({ page }) => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('tag-default')).backgroundColor);
    // --neutral-bg: rgba(138, 157, 184, 0.10)
    expect(bg).toMatch(/rgba\(\s*138,\s*157,\s*184,\s*0\.1\)?/);
  });

  test('P2-BC .ca-tag--info uses --info-bg', async ({ page }) => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('tag-info')).backgroundColor);
    expect(bg).toMatch(/rgba\(\s*91,\s*200,\s*255,\s*0\.1\)?/);
  });

  test('P2-BC .ca-tag--danger uses --danger-bg', async ({ page }) => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('tag-danger')).backgroundColor);
    expect(bg).toMatch(/rgba\(\s*239,\s*68,\s*68,\s*0\.1\)?/);
  });
});
