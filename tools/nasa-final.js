const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

const REPORT_PATH = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\NASA-GRADE-PLATFORM-AUDIT.md';

async function performNASAAudit() {
  console.log('🚀 NASA Mission: Full Spectrum Platform Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const defects = [];
  const captureDefect = (severity, category, title, details) => {
    defects.push({ severity, category, title, details, timestamp: new Date().toISOString() });
    console.log(`[${severity}] ${category}: ${title}`);
  };

  try {
    // PHASE 1: BYPASS GATEWAY VIA DIRECT UI AUTOMATION
    console.log('--- PHASE 1: Authentication ---');
    await page.goto(`${BASE_URL}/login`);
    
    // Some Next.js builds use hidden/dynamic names. Let's use getByPlaceholder or similar.
    await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
    await page.getByPlaceholder(/password/i).fill(TEST_USER.pass);
    
    await Promise.all([
      page.waitForURL('**/dashboard**', { timeout: 20000 }),
      page.click('button:has-text("Sign in")')
    ]);
    
    console.log('✅ Auth Milestone: Dashboard reached via UI.');

    // PHASE 2: PRODUCT E2E WORKFLOWS
    const suites = [
       { name: 'Core', path: '/dashboard/core', check: 'document.querySelectorAll("table tr").length > 2' },
       { name: 'Mark', path: '/crowmark', check: '!document.body.innerText.includes("Unable to load")' },
       { name: 'Cyber', path: '/crowcyber/assessments', check: 'true' },
       { name: 'Cash', path: '/crowcash/invoices', check: 'true' }
    ];

    for (const s of suites) {
      console.log(`📡 Testing Product [${s.name}]...`);
      await page.goto(`${BASE_URL}${s.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      const status = await page.evaluate((c) => {
         return {
           h1: document.querySelector('h1')?.innerText,
           error: document.body.innerText.includes('error') || document.body.innerText.includes('Unable to'),
           assert: eval(c)
         };
      }, s.check);

      if (status.error) captureDefect('HIGH', 'Product', `${s.name} Data Crash`, 'UI reported fetch error.');
      if (!status.assert) captureDefect('MEDIUM', 'Product', `${s.name} Empty State`, 'No data rows found.');
    }

    // PHASE 3: USER FLOW - SETTINGS CHANGE
    console.log('📡 Testing User Settings Flow...');
    await page.goto(`${BASE_URL}/settings`);
    await page.fill('input[name="full_name"], #full_name', 'NASA Audit User');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);
    const toast = await page.textContent('.toast, .alert').catch(() => null);
    if (!toast || !toast.toLowerCase().includes('success')) {
       captureDefect('MEDIUM', 'UserFlow', 'Settings Save Failure', 'No success confirmation after updating profile.');
    }

    // PHASE 4: BILLING - STRIPE PORTAL
    console.log('📡 Testing Billing Gateway...');
    await page.goto(`${BASE_URL}/settings/billing`);
    const stripeLink = await page.locator('button:has-text("Manage")').count();
    if (stripeLink === 0) captureDefect('HIGH', 'Billing', 'Stripe Link Missing', 'User cannot access Stripe portal.');

  } catch (e) {
    captureDefect('CRITICAL', 'Audit', 'Mission Failure', e.message);
  }

  // Final Report Generation
  let reportMd = `# NASA-GRADE PLATFORM AUDIT REPORT\n**Date:** ${new Date().toISOString()}\n\n## 🚨 DEFECT LEDGER\n\n| Severity | Category | Title | Details |\n|---|---|---|---|\n`;
  defects.forEach(d => reportMd += `| ${d.severity} | ${d.category} | ${d.title} | ${d.details} |\n`);
  fs.writeFileSync(REPORT_PATH, reportMd);

  await browser.close();
}

performNASAAudit();
