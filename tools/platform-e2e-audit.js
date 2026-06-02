const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

const TEST_USER = {
  email: 'support.crowagent@gmail.com',
  pass: 'E2E_bf698a969f2a441a8210da0aacadcd21_C!'
};

async function runProductionPlatformAudit() {
  console.log(`🚀 SECURE START: Authenticated Audit of ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'CrowAgent-Principal-QA/2.0'
  });
  
  const auditReport = {
    timestamp: new Date().toISOString(),
    auth: { success: false, mode: 'Credentials' },
    journeys: [],
    defects: [],
    screenshots: []
  };

  const page = await context.newPage();

  // Trap Console & Network
  page.on('console', msg => { if (msg.type() === 'error') auditReport.defects.push({ category: 'Runtime', issue: `Console: ${msg.text()}` }); });
  page.on('pageerror', err => auditReport.defects.push({ category: 'Runtime', issue: `Uncaught: ${err.message}` }));

  // 1. AUTHENTICATION JOURNEY
  console.log('🔐 Journey 1: Login');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'audit-screenshots/debug-login-init.png' });

    // Look for login fields - maybe they use different selectors
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passInput = page.locator('input[name="password"], input[type="password"]');
    
    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_USER.email);
      await passInput.fill(TEST_USER.pass);
      await page.click('button:has-text("Sign in"), button:has-text("Login"), button[type="submit"]');
      
      // Wait for redirect to dashboard or error message
      try {
        await page.waitForURL('**/dashboard**', { timeout: 15000 });
        auditReport.auth.success = true;
        console.log('✅ Login Successful.');
      } catch (e) {
        const errorText = await page.textContent('.error-message, .alert-danger').catch(() => 'No UI error visible');
        console.error(`❌ Auth Failed: ${errorText}`);
        await page.screenshot({ path: 'audit-screenshots/debug-login-failed.png' });
        auditReport.defects.push({ category: 'Auth', issue: 'Redirect timeout', uiError: errorText });
      }
    } else {
      console.error('❌ Login fields not found.');
      auditReport.defects.push({ category: 'Auth', issue: 'Selectors mismatch on login page' });
    }
  } catch (e) {
    auditReport.defects.push({ category: 'Auth', issue: 'Navigation error', error: e.message });
  }

  // Final landmarks check
  console.log('♿ Journey 5: A11y Quick Scan');
  const mainRole = await page.locator('main').count();
  if (mainRole === 0) auditReport.defects.push({ category: 'A11y', issue: 'Missing <main> landmark' });

  const resultsPath = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\PLATFORM-E2E-RESULTS.json';
  fs.writeFileSync(resultsPath, JSON.stringify(auditReport, null, 2));
  console.log(`\n✅ Platform Audit Complete. Report: ${resultsPath}`);
  
  await browser.close();
}

runProductionPlatformAudit().catch(console.error);
