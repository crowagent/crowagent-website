/**
 * Diagnose the XML parse error chromium shows in how-step SVGs.
 */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const svgs = [
    '/Assets/svg-mockups/how-step-1-upload.svg?v=94',
    '/Assets/svg-mockups/how-step-2-analyse.svg?v=94',
    '/Assets/svg-mockups/how-step-3-report.svg?v=94',
    '/Assets/svg-mockups/how-step-4-export.svg?v=94',
    '/Assets/svg-mockups/hero-demo-dashboard.svg?v=94',
  ];
  for (const s of svgs) {
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    const resp = await page.goto('http://localhost:8092' + s, { waitUntil: 'networkidle' });
    const body = await page.locator('body').innerText().catch(() => '');
    const isError = body.includes('error on line') || body.includes('contains the following errors');
    console.log('───', s);
    console.log('  HTTP:', resp.status(), 'content-type:', resp.headers()['content-type']);
    console.log('  body has XML error message?', isError);
    if (isError) console.log('  ERROR TEXT:\n', body.slice(0, 600));
    console.log();
  }
  await browser.close();
})();
