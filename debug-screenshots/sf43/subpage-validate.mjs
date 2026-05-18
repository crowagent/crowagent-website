import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const pages = ['/crowagent-core.html', '/crowcyber.html', '/pricing.html', '/about.html'];
for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const result = await page.evaluate(() => {
    const trigger = document.querySelector('.nav-dropdown-trigger');
    if (!trigger) return { ok: false, reason: 'no trigger' };
    trigger.click();
    const d = trigger.closest('.nav-dropdown');
    return {
      ok: d.getAttribute('data-open') === 'true',
      ariaExpanded: trigger.getAttribute('aria-expanded'),
    };
  });
  console.log(`${p}: ${JSON.stringify(result)}`);
}

await browser.close();
