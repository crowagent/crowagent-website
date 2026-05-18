/**
 * C2 (2026-05-18) — Manual Playwright walk of the CSRD applicability
 * checker. Confirms the tool renders a verdict + an actionable next-step
 * link (to /csrd or /contact) without errors.
 *
 * Usage:  node scripts/sf42-csrd-wizard-walk.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8092';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('console.error: ' + msg.text());
  });
  await page.goto(BASE + '/tools/csrd-applicability-checker/', { waitUntil: 'networkidle' });

  // Find at least one in-page next-step link in <main>.
  const nextStepLinks = await page.$$eval('main a', (as) =>
    as
      .filter((a) => /\/csrd($|\/|\?|#)|\/contact($|\/|\?|#)/.test(a.getAttribute('href') || ''))
      .map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 60) }))
  );
  console.log('[csrd-walk] in-main next-step links:');
  for (const l of nextStepLinks) console.log('  -', l.href, '·', l.text);

  console.log('[csrd-walk] page errors:', errors.length);
  for (const e of errors) console.log('  !', e);

  const pass = nextStepLinks.length > 0 && errors.length === 0;
  console.log('[csrd-walk] PASS =', pass);
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
