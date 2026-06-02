const { test } = require('@playwright/test');
test('framework card content visibility', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
  await page.evaluate(() => { document.querySelector('#compliance-frameworks').scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const card = document.querySelector('.framework-card');
    if (!card) return { error: 'no .framework-card' };
    const name = card.querySelector('.framework-card-name');
    const desc = card.querySelector('.framework-card-desc');
    return {
      card: { rect: card.getBoundingClientRect(), height: card.getBoundingClientRect().height },
      name: name ? { text: name.textContent.trim(), color: getComputedStyle(name).color, fontSize: getComputedStyle(name).fontSize, opacity: getComputedStyle(name).opacity, display: getComputedStyle(name).display, rect: name.getBoundingClientRect() } : null,
      desc: desc ? { text: desc.textContent.trim().slice(0,40), color: getComputedStyle(desc).color, opacity: getComputedStyle(desc).opacity, display: getComputedStyle(desc).display, rect: desc.getBoundingClientRect() } : null,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await page.screenshot({ path: 'tests/v2-fw-cards.png' });
});
