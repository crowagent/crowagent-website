// @ts-check
const { test } = require('@playwright/test');

test('probe roadmap cards', async ({ page }, testInfo) => {
  test.setTimeout(30000);
  const base = process.env.BASE_URL || 'http://localhost:8092';
  await page.goto(base + '/roadmap.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const card = document.querySelector('.ca-roadmap-card');
    if (!card) return { err: 'no card' };
    const h3 = card.querySelector('h3');
    const p = card.querySelector('p');
    const cs = (el) => el ? window.getComputedStyle(el) : null;
    return {
      cardBG: cs(card).backgroundColor,
      cardColor: cs(card).color,
      h3Text: h3 ? h3.textContent.slice(0, 30) : null,
      h3Color: cs(h3).color,
      h3FontSize: cs(h3).fontSize,
      h3Weight: cs(h3).fontWeight,
      pText: p ? p.textContent.slice(0, 50) : null,
      pColor: cs(p).color,
      pFontSize: cs(p).fontSize,
    };
  });
  console.log('ROADMAP_CARD', JSON.stringify(data));
});
