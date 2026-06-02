/**
 * SF46 P2-M + P2-N + P2-O probe.
 *
 * Verifies the three new Phase-2-extension layout/list/card primitives
 * compute correctly. Runs against the fixture page so computed-style
 * assertions are deterministic + isolated from live-page content drift.
 */
const { test, expect } = require('@playwright/test');

const FIXTURE = (process.env.BASE_URL || 'http://localhost:8092')
  + '/tests/fixtures/sf46-p2mno.html';

test.describe('SF46 P2-M — Stack + Cluster primitives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
  });

  test('P2-M .ca-stack-md applies 16px margin-top on adjacent children', async ({ page }) => {
    const mt = await page.evaluate(() => {
      const children = document.querySelectorAll('#stack-md > *');
      // children[0] = no top margin (first child); children[1] = 16px
      return getComputedStyle(children[1]).marginTop;
    });
    expect(mt).toBe('16px');
  });

  test('P2-M .ca-stack-md first child has no margin-top', async ({ page }) => {
    const mt = await page.evaluate(() => {
      const first = document.querySelector('#stack-md > *:first-child');
      return getComputedStyle(first).marginTop;
    });
    expect(mt).toBe('0px');
  });

  test('P2-M .ca-cluster is flex with token gap', async ({ page }) => {
    const { display, flexWrap, gap, alignItems } = await page.evaluate(() => {
      const c = document.querySelector('#cluster');
      const s = getComputedStyle(c);
      return { display: s.display, flexWrap: s.flexWrap, gap: s.gap, alignItems: s.alignItems };
    });
    expect(display).toBe('flex');
    expect(flexWrap).toBe('wrap');
    expect(alignItems).toBe('center');
    expect(gap).toBe('16px'); // --space-4
  });
});

test.describe('SF46 P2-N — Bullet/list rhythm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
  });

  test('P2-N --list-indent token resolves to 24px (--space-6)', async ({ page }) => {
    const v = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--list-indent').trim());
    expect(v).toBe('24px');
  });

  test('P2-N --list-marker-color resolves to --teal', async ({ page }) => {
    const v = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--list-marker-color').trim());
    expect(v.toLowerCase()).toMatch(/^var\(--teal\)$|^#0cc9a8$/);
  });

  test('P2-N .ca-list applies hanging indent (padding-inline-start)', async ({ page }) => {
    const pis = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#list')).paddingInlineStart);
    expect(pis).toBe('24px');
  });

  test('P2-N .ca-list--arrow renders → marker via ::before', async ({ page }) => {
    const content = await page.evaluate(() => {
      const li = document.querySelector('#list-arrow > li');
      return getComputedStyle(li, '::before').content;
    });
    expect(content).toMatch(/→|\\2192|U\+2192/);
  });

  test('P2-N .ca-list--check uses --success color', async ({ page }) => {
    const color = await page.evaluate(() => {
      const li = document.querySelector('#list-check > li');
      return getComputedStyle(li, '::before').color;
    });
    // --success is #22C55E → rgb(34, 197, 94)
    expect(color).toMatch(/rgb\(\s*34,\s*197,\s*94\s*\)|#22c55e/i);
  });
});

test.describe('SF46 P2-O — Equal-height card grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(FIXTURE);
  });

  test('P2-O .ca-grid--cards is a grid with align-items:stretch', async ({ page }) => {
    const { display, alignItems } = await page.evaluate(() => {
      const g = document.querySelector('#cards');
      const s = getComputedStyle(g);
      return { display: s.display, alignItems: s.alignItems };
    });
    expect(display).toBe('grid');
    expect(alignItems).toBe('stretch');
  });

  test('P2-O cards in same grid have matching heights at desktop width', async ({ page }) => {
    const heights = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#cards > .ca-card-v2'))
        .map(c => c.getBoundingClientRect().height);
    });
    // All three cards should be within 1px of each other (browser sub-pixel rounding)
    const max = Math.max(...heights);
    const min = Math.min(...heights);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  test('P2-O CTAs land at same vertical position via margin-top:auto', async ({ page }) => {
    const tops = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#cards > .ca-card-v2 [data-card-cta]'))
        .map(c => c.getBoundingClientRect().top);
    });
    // CTAs should land at the same baseline within 2px
    const max = Math.max(...tops);
    const min = Math.min(...tops);
    expect(max - min).toBeLessThanOrEqual(2);
  });

  test('P2-O cards are flex columns', async ({ page }) => {
    const { display, flexDirection } = await page.evaluate(() => {
      const c = document.querySelector('#cards > .ca-card-v2');
      const s = getComputedStyle(c);
      return { display: s.display, flexDirection: s.flexDirection };
    });
    expect(display).toBe('flex');
    expect(flexDirection).toBe('column');
  });
});
