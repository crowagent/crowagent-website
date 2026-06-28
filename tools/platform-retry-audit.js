const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

// Updated credentials provided by user (fetched via environment or direct input)
const TEST_USER = {
  email: 'support.crowagent@gmail.com',
  pass: process.env.E2E_USER_PASSWORD
};

async function runProductionPlatformAudit() {
  console.log(`🚀 RE-INITIATING: Authenticated Audit of ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'CrowAgent-Principal-QA/2.1'
  });
  
  const auditReport = {
    timestamp: new Date().toISOString(),
    auth: { success: false, mode: 'Credentials' },
    defects: []
  };

  const page = await context.newPage();

  console.log('🔐 Attempting Login...');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Fill login using robust selectors found in research
    const emailInput = page.locator('input[type="email"], [name="email"]');
    const passInput = page.locator('input[type="password"], [name="password"]');
    
    await emailInput.fill(TEST_USER.email);
    await passInput.fill(TEST_USER.pass);
    await page.click('button[type="submit"], button:has-text("Sign in")');

    // Wait for Dashboard redirection (or handle errors)
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 15000 }),
      page.waitForSelector('.error-message, .alert', { timeout: 15000 })
    ]);

    if (page.url().includes('dashboard')) {
      auditReport.auth.success = true;
      console.log('✅ Login SUCCESSFUL. Redirection confirmed.');
      await page.screenshot({ path: 'audit-screenshots/dashboard-success.png', fullPage: true });
      
      // JOURNEY 2: Portfolio Pulse
      console.log('📊 Verifying Dashboard Data...');
      const metrics = await page.locator('.metric-card, [class*="card"]').count();
      if (metrics === 0) auditReport.defects.push({ category: 'UI', issue: 'Dashboard metrics empty' });
      
      // JOURNEY 3: Billing State (Apple/Stripe Standard)
      console.log('💳 Checking Billing Integration...');
      await page.goto(`${BASE_URL}/settings/billing`, { waitUntil: 'networkidle' }).catch(() => null);
      const billingStatus = await page.textContent('body').catch(() => '');
      if (billingStatus.includes('error')) auditReport.defects.push({ category: 'Billing', issue: 'Billing page error' });
    } else {
      const errorText = await page.textContent('.error-message, .alert').catch(() => 'Unknown Error');
      console.error(`❌ Login REJECTED: ${errorText}`);
      auditReport.defects.push({ category: 'Auth', issue: 'Credential rejection', details: errorText });
      await page.screenshot({ path: 'audit-screenshots/login-rejected.png' });
    }
  } catch (e) {
    console.error(`❌ System Failure during Auth: ${e.message}`);
    auditReport.defects.push({ category: 'Auth', issue: 'Test Runner Timeout', error: e.message });
  }

  const resultsPath = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\PLATFORM-RETRY-RESULTS.json';
  fs.writeFileSync(resultsPath, JSON.stringify(auditReport, null, 2));
  console.log(`\n✅ Platform Audit Complete. Report: ${resultsPath}`);
  
  await browser.close();
}

runProductionPlatformAudit().catch(console.error);
