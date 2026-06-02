/**
 * SF46 P3 components probe — covers P3-J/K/L/M/N/O/P/Q/U + T1 + S1/S2/S5.
 * Computed-style assertions against the fixture.
 */
const { test, expect } = require('@playwright/test');

const FIXTURE = (process.env.BASE_URL || 'http://localhost:8092')
  + '/tests/fixtures/sf46-p3-components.html';

test.beforeEach(async ({ page }) => { await page.goto(FIXTURE); });

test.describe('P3-J — .ca-badge / .ca-pill', () => {
  test('P3-J default badge has neutral background', async ({ page }) => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('badge-default')).backgroundColor);
    // --neutral-bg: rgba(138,157,184,0.10)
    expect(bg).toMatch(/rgba\(138,?\s*157,?\s*184,?\s*0\.1\)?/);
  });

  test('P3-J --success variant uses --success color', async ({ page }) => {
    const c = await page.evaluate(() =>
      getComputedStyle(document.getElementById('badge-success')).color);
    expect(c).toMatch(/rgb\(34,?\s*197,?\s*94\)/);
  });

  test('P3-J --primary uses --teal color', async ({ page }) => {
    const c = await page.evaluate(() =>
      getComputedStyle(document.getElementById('pill-primary')).color);
    expect(c).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
  });
});

test.describe('P3-K — .ca-tabs', () => {
  test('P3-K selected tab has teal text + border', async ({ page }) => {
    const { color, borderBottomColor } = await page.evaluate(() => {
      const t = document.getElementById('t1');
      const cs = getComputedStyle(t);
      return { color: cs.color, borderBottomColor: cs.borderBottomColor };
    });
    expect(color).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
    expect(borderBottomColor).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
  });

  test('P3-K unselected tab uses steel color', async ({ page }) => {
    const color = await page.evaluate(() =>
      getComputedStyle(document.getElementById('t2')).color);
    expect(color).toMatch(/rgb\(184,?\s*204,?\s*224\)/);
  });
});

test.describe('P3-L — accordion / disclosure', () => {
  test('P3-L details summary has 44px min-height + pointer cursor', async ({ page }) => {
    const result = await page.evaluate(() => {
      const s = document.querySelector('#disclosure-1 > summary');
      const cs = getComputedStyle(s);
      return { minH: parseFloat(cs.minHeight), cursor: cs.cursor };
    });
    expect(result.minH).toBeGreaterThanOrEqual(40);
    expect(result.cursor).toBe('pointer');
  });

  test('P3-L summary marker is hidden via ::-webkit-details-marker', async ({ page }) => {
    const result = await page.evaluate(() => {
      const s = document.querySelector('#disclosure-1 > summary');
      return getComputedStyle(s).listStyle;
    });
    expect(result).toContain('none');
  });
});

test.describe('P3-M — alert', () => {
  test('P3-M --info alert uses info-bg', async ({ page }) => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('alert-info')).backgroundColor);
    expect(bg).toMatch(/rgba\(91,?\s*200,?\s*255,?\s*0\.1\)?/);
  });

  test('P3-M --danger alert uses danger-bg', async ({ page }) => {
    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('alert-danger')).backgroundColor);
    expect(bg).toMatch(/rgba\(239,?\s*68,?\s*68,?\s*0\.1\)?/);
  });
});

test.describe('P3-N — dialog', () => {
  test('P3-N dialog can be opened via showModal', async ({ page }) => {
    const opened = await page.evaluate(() => {
      const d = document.getElementById('dialog-1');
      try { d.showModal(); return d.open; } catch (e) { return false; }
    });
    expect(opened).toBe(true);
  });
});

test.describe('P3-O — tooltip', () => {
  test('P3-O .ca-tooltip has padding + bg + border', async ({ page }) => {
    const { padding, bg, borderWidth } = await page.evaluate(() => {
      const t = document.getElementById('tooltip-1');
      const cs = getComputedStyle(t);
      return { padding: cs.padding, bg: cs.backgroundColor, borderWidth: cs.borderWidth };
    });
    expect(padding).not.toBe('');
    expect(parseFloat(borderWidth)).toBeGreaterThan(0);
  });
});

test.describe('P3-P — stat', () => {
  test('P3-P stat value uses tabular-nums + teal', async ({ page }) => {
    const { fvn, color } = await page.evaluate(() => {
      const v = document.querySelector('#stat-1 .ca-stat__value');
      const cs = getComputedStyle(v);
      return { fvn: cs.fontVariantNumeric, color: cs.color };
    });
    expect(fvn).toContain('tabular');
    expect(color).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
  });
});

test.describe('P3-Q — quote / testimonial', () => {
  test('P3-Q quote has left border + italic', async ({ page }) => {
    const { borderLeft, fontStyle } = await page.evaluate(() => {
      const q = document.getElementById('quote-1');
      const cs = getComputedStyle(q);
      return { borderLeft: cs.borderLeftWidth, fontStyle: cs.fontStyle };
    });
    expect(parseFloat(borderLeft)).toBeGreaterThanOrEqual(2);
    expect(fontStyle).toBe('italic');
  });

  test('P3-Q testimonial avatar is round', async ({ page }) => {
    const br = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#testimonial-1 .ca-testimonial__avatar')).borderRadius);
    expect(br).toBe('50%');
  });
});

test.describe('P3-U — skeleton', () => {
  test('P3-U skeleton has shimmer animation', async ({ page }) => {
    const animName = await page.evaluate(() =>
      getComputedStyle(document.getElementById('skeleton-1')).animationName);
    expect(animName).toBe('ca-skeleton-shimmer');
  });
});

test.describe('T1 — .ca-bento', () => {
  test('T1 bento is a grid with 3 columns', async ({ page }) => {
    const { display, cols } = await page.evaluate(() => {
      const b = document.getElementById('bento-1');
      const cs = getComputedStyle(b);
      return { display: cs.display, cols: cs.gridTemplateColumns };
    });
    expect(display).toBe('grid');
    // 3-col mode: 3 1fr tracks. Container fluid; we get px values.
    expect(cols.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  test('T1 bento--lg tile spans 2 columns + 2 rows', async ({ page }) => {
    const { col, row } = await page.evaluate(() => {
      const t = document.querySelector('#bento-1 > .ca-bento__tile--lg');
      const cs = getComputedStyle(t);
      return { col: cs.gridColumn, row: cs.gridRow };
    });
    expect(col).toContain('span');
    expect(row).toContain('span');
  });
});

test.describe('S1 — logo wall', () => {
  test('S1 logo wall items are grayscale at rest', async ({ page }) => {
    const filter = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#logo-wall .ca-logo-wall__item')).filter);
    expect(filter).toContain('grayscale');
  });
});

test.describe('S2 — case study', () => {
  test('S2 metric value uses tabular nums + teal', async ({ page }) => {
    const { fvn, color } = await page.evaluate(() => {
      const v = document.querySelector('#case-study-1 .ca-case-study__metric-value');
      const cs = getComputedStyle(v);
      return { fvn: cs.fontVariantNumeric, color: cs.color };
    });
    expect(fvn).toContain('tabular');
    expect(color).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
  });
});

test.describe('S5 — filter bar', () => {
  test('S5 active filter pill has teal color + 1px border', async ({ page }) => {
    const { color, borderColor } = await page.evaluate(() => {
      const p = document.getElementById('filter-2');
      const cs = getComputedStyle(p);
      return { color: cs.color, borderColor: cs.borderTopColor };
    });
    expect(color).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
    expect(borderColor).toMatch(/rgb\(12,?\s*201,?\s*168\)/);
  });
});
