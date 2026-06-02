// SF46 Phase 1 Step 1.2 — verify offender rules no longer match CTAs but still cover prose.
// One-shot probe, can be deleted after Phase 1 closes.
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

async function readComputed(page, selector, props) {
  return await page.$eval(selector, (el, props) => {
    const c = window.getComputedStyle(el);
    const out = {};
    for (const p of props) out[p] = c.getPropertyValue(p);
    return out;
  }, props);
}

test.describe('SF46 Step 1.2 — anchor specificity', () => {
  test('privacy.html — prose anchor is teal underlined', async ({ page }) => {
    await page.goto(`${BASE}/privacy.html`);
    const anchors = await page.$$('.priv-prose a:not(.btn):not([class*="cta"])');
    expect(anchors.length).toBeGreaterThan(0);
    const first = anchors[0];
    const styles = await first.evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine, textDecorationColor: c.textDecorationColor };
    });
    // teal #0CC9A8 = rgb(12, 201, 168)
    expect(styles.color).toBe('rgb(12, 201, 168)');
    expect(styles.textDecorationLine).toContain('underline');
  });

  test('privacy.html — CTA is NOT teal underlined by offender', async ({ page }) => {
    await page.goto(`${BASE}/privacy.html`);
    const cta = await page.$('a.priv-cta-primary, a.priv-cta');
    if (!cta) test.skip(true, 'no priv-cta on page');
    const styles = await cta.evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine };
    });
    // Anything except the literal "teal underlined" prose style is acceptable;
    // the test is: CTA must not be teal+underline by virtue of the offender rule.
    const isProseStyled = styles.color === 'rgb(12, 201, 168)' && styles.textDecorationLine.includes('underline');
    expect(isProseStyled).toBe(false);
  });

  test('terms.html — prose anchor is teal underlined', async ({ page }) => {
    await page.goto(`${BASE}/terms.html`);
    const anchors = await page.$$('main a.u-link-teal, main a.ov-cell');
    expect(anchors.length).toBeGreaterThan(0);
    const styles = await anchors[0].evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine };
    });
    expect(styles.color).toBe('rgb(12, 201, 168)');
    expect(styles.textDecorationLine).toContain('underline');
  });

  test('terms.html — CTA is NOT teal underlined by offender', async ({ page }) => {
    await page.goto(`${BASE}/terms.html`);
    const cta = await page.$('a.terms-cta--primary, a.terms-cta');
    if (!cta) test.skip(true, 'no terms-cta on page');
    const styles = await cta.evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine };
    });
    const isProseStyled = styles.color === 'rgb(12, 201, 168)' && styles.textDecorationLine.includes('underline');
    expect(isProseStyled).toBe(false);
  });

  test('security.html — prose anchor is teal underlined', async ({ page }) => {
    await page.goto(`${BASE}/security.html`);
    const anchors = await page.$$('.sec-prose a:not(.btn):not([class*="cta"]), .sec-list a:not(.btn):not([class*="cta"])');
    expect(anchors.length).toBeGreaterThan(0);
    const styles = await anchors[0].evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine };
    });
    expect(styles.color).toBe('rgb(12, 201, 168)');
    expect(styles.textDecorationLine).toContain('underline');
  });

  test('security.html — uptime CTA is NOT teal underlined by offender', async ({ page }) => {
    await page.goto(`${BASE}/security.html`);
    const cta = await page.$('a.sec-uptime-cta');
    if (!cta) test.skip(true, 'no sec-uptime-cta on page');
    const styles = await cta.evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine };
    });
    const isProseStyled = styles.color === 'rgb(12, 201, 168)' && styles.textDecorationLine.includes('underline');
    expect(isProseStyled).toBe(false);
  });

  test('cookies.html — page loads and any prose anchor is teal underlined', async ({ page }) => {
    await page.goto(`${BASE}/cookies.html`);
    const anchors = await page.$$('main a:not(.btn):not([class*="cta"]):not(.skip-link)');
    if (!anchors.length) test.skip(true, 'no eligible anchors');
    const styles = await anchors[0].evaluate(el => {
      const c = getComputedStyle(el);
      return { color: c.color, textDecorationLine: c.textDecorationLine };
    });
    expect(styles.color).toBe('rgb(12, 201, 168)');
    expect(styles.textDecorationLine).toContain('underline');
  });
});
