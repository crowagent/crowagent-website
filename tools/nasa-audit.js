const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://app.crowagent.ai';
const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: 'CrowV2-Smoke-2026'
};

const REPORT_PATH = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\NASA-GRADE-PLATFORM-AUDIT.md';

async function performNASAAudit() {
  console.log('🚀 NASA Mission Control: Initiating Platform Deep Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'NASA-CrowAgent-Audit-Probe/1.0'
  });
  const page = await context.newPage();

  const defects = [];
  const captureDefect = (severity, category, title, details) => {
    defects.push({ severity, category, title, details, timestamp: new Date().toISOString() });
    console.log(`[${severity}] ${category}: ${title}`);
  };

  // Setup error trapping
  page.on('pageerror', err => captureDefect('CRITICAL', 'Runtime', 'Uncaught JS Exception', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') captureDefect('HIGH', 'Console', 'Browser Error', msg.text());
  });
  page.on('response', res => {
    if (respStatus(res.status())) captureDefect('MEDIUM', 'Network', `HTTP ${res.status()}`, res.url());
  });

  function respStatus(s) { return s >= 400 && s !== 401; }

  try {
    // 1. AUTHENTICATION GATEWAY
    console.log('\n--- PHASE 1: Authentication ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Check for hydration mismatches
    const hydrationBroken = await page.evaluate(() => document.body.innerHTML.includes('react-hydration-error'));
    if (hydrationBroken) captureDefect('HIGH', 'Architecture', 'Hydration Mismatch', 'React reported mismatch on login page.');

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.pass);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {
       captureDefect('CRITICAL', 'Auth', 'Login Failure', `Timed out redirecting from ${page.url()}`);
    });

    if (page.url().includes('dashboard')) {
      console.log('✅ Auth Milestone: Dashboard Reached');

      // 2. PRODUCT SUITE AUDIT
      const productSuites = [
        { name: 'Core', path: '/dashboard/core' },
        { name: 'Mark', path: '/crowmark' },
        { name: 'Cyber', path: '/crowcyber/assessments' },
        { name: 'Cash', path: '/crowcash/invoices' },
        { name: 'ESG', path: '/crowesg/frameworks' }
      ];

      for (const product of productSuites) {
        console.log(`\n--- PHASE 2: Auditing Product [${product.name}] ---`);
        await page.goto(`${BASE_URL}${product.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const h1 = await page.textContent('h1').catch(() => 'NO H1 FOUND');
        if (h1.includes('Coming soon') || h1.includes('Preview')) {
           captureDefect('MEDIUM', 'Product', `${product.name} is a Stub`, `Route exists but renders a placeholder H1: ${h1}`);
        }

        // Check for broken data states
        const bodyText = await page.textContent('body');
        if (bodyText.includes('Unable to load') || bodyText.includes('error fetching')) {
           captureDefect('HIGH', 'Product', `${product.name} Data Failure`, 'Page rendered but reported backend fetch error in UI.');
        }
      }

      // 3. SETTINGS & USER JOURNEY
      console.log('\n--- PHASE 3: Settings & Identity ---');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
      const emailField = await page.inputValue('input[type="email"]').catch(() => null);
      if (emailField !== TEST_USER.email) {
         captureDefect('HIGH', 'Identity', 'Settings Mismatch', `Email input shows ${emailField} instead of ${TEST_USER.email}`);
      }

      // 4. BILLING & STRIPE
      console.log('\n--- PHASE 4: Billing & Subscription ---');
      await page.goto(`${BASE_URL}/settings/billing`, { waitUntil: 'networkidle' });
      const stripePortalBtn = await page.locator('button:has-text("Manage"), a:has-text("Stripe")').count();
      if (stripePortalBtn === 0) {
         captureDefect('HIGH', 'Billing', 'Stripe Missing', 'No active billing management link found in settings.');
      }
    }

  } catch (e) {
    captureDefect('CRITICAL', 'Audit', 'Probe Failure', e.message);
  }

  // GENERATE FINAL NASA REPORT
  let reportMd = `# NASA-GRADE PLATFORM AUDIT REPORT\n**Target:** app.crowagent.ai\n**Timestamp:** ${new Date().toISOString()}\n\n## 🚨 DEFECT LEDGER\n\n| Severity | Category | Title | Details |\n|---|---|---|---|\n`;
  defects.forEach(d => {
    reportMd += `| ${d.severity} | ${d.category} | ${d.title} | ${d.details} |\n`;
  });

  fs.writeFileSync(REPORT_PATH, reportMd);
  console.log(`\n✅ NASA Audit Complete. Ledger saved to: ${REPORT_PATH}`);
  await browser.close();
}

performNASAAudit();
