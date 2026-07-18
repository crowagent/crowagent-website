const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

async function exhaustivePlatformAudit() {
  console.log(`🚀 STARTING EXHAUSTIVE ENTERPRISE E2E TEST: ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'CrowAgent-Enterprise-Auditor/4.0',
    recordVideo: { dir: 'audit-results/videos/' } // Optional if needed, let's skip to save space, but we take fullpage screenshots
  });
  
  if (!fs.existsSync('audit-results')) {
    fs.mkdirSync('audit-results');
  }
  if (!fs.existsSync('audit-results/screenshots')) {
    fs.mkdirSync('audit-results/screenshots');
  }

  const auditReport = {
    timestamp: new Date().toISOString(),
    auth: { success: false },
    pages: {},
    defects: [],
    networkErrors: [],
    consoleErrors: []
  };

  const page = await context.newPage();

  // Trap all errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      auditReport.consoleErrors.push({ url: page.url(), error: msg.text() });
    }
  });
  page.on('pageerror', err => {
    auditReport.consoleErrors.push({ url: page.url(), error: `Uncaught: ${err.message}` });
  });
  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('telemetry') && !resp.url().includes('posthog')) {
      auditReport.networkErrors.push({ url: resp.url(), status: resp.status() });
    }
  });

  const checkPageHealth = async (pageName) => {
    await page.waitForTimeout(2000); // Allow react to render
    const url = page.url();
    await page.screenshot({ path: `audit-results/screenshots/${pageName}.png`, fullPage: true });
    
    // Check for obvious crash/error boundaries
    const hasError = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('application error') || text.includes('something went wrong');
    });

    if (hasError) {
      auditReport.defects.push({ category: 'Runtime', issue: `React Error Boundary hit on ${pageName}`, url });
    }

    auditReport.pages[pageName] = { url, hasError };
  };

  try {
    console.log('🔐 Journey: Authentication...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"], [name="email"], #email', TEST_USER.email);
    await page.fill('input[type="password"], [name="password"], #password', TEST_USER.pass);
    await page.click('button[type="submit"], button:has-text("Sign in")');

    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 15000 }),
      page.waitForSelector('.error-message, .alert', { timeout: 15000 })
    ]);

    if (page.url().includes('dashboard')) {
      auditReport.auth.success = true;
      console.log('✅ Login SUCCESSFUL.');
      await checkPageHealth('Dashboard');

      // Check Dashboard features
      console.log('📊 Journey: Dashboard functionality...');
      const metricCount = await page.locator('.metric-card, [class*="card"]').count();
      if (metricCount === 0) {
        auditReport.defects.push({ category: 'UI', issue: 'Dashboard metrics missing' });
      }

      // Check Products
      console.log('📦 Journey: Products...');
      const products = [
        { name: 'CrowMark', url: '/mark' },
        { name: 'CrowCyber', url: '/cyber' },
        { name: 'CrowCash', url: '/cash' },
        { name: 'CSRD Checker', url: '/csrd' }
      ];

      for (const product of products) {
        console.log(`   -> Visiting ${product.name}`);
        await page.goto(`${BASE_URL}${product.url}`, { waitUntil: 'networkidle' }).catch(() => null);
        await checkPageHealth(product.name);
      }

      // Check Settings & Profile
      console.log('⚙️ Journey: Settings & Profile...');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' }).catch(() => null);
      await checkPageHealth('Settings-Profile');
      
      const emailValue = await page.inputValue('input[type="email"], [name="email"]').catch(() => null);
      if (emailValue && emailValue !== TEST_USER.email) {
        auditReport.defects.push({ category: 'Settings', issue: 'Profile email mismatch in inputs' });
      }

      // Check Billing
      console.log('💳 Journey: Billing & Subscription...');
      await page.goto(`${BASE_URL}/settings/billing`, { waitUntil: 'networkidle' }).catch(() => null);
      await checkPageHealth('Settings-Billing');
      
      const billingStatus = await page.textContent('body').catch(() => '');
      if (billingStatus.toLowerCase().includes('error retrieving subscription')) {
        auditReport.defects.push({ category: 'Billing', issue: 'Stripe integration error on billing page' });
      }

      // Check Team Management
      console.log('👥 Journey: Team Management...');
      await page.goto(`${BASE_URL}/settings/team`, { waitUntil: 'networkidle' }).catch(() => null);
      await checkPageHealth('Settings-Team');

    } else {
      const errorText = await page.textContent('.error-message, .alert').catch(() => 'Unknown Error');
      console.error(`❌ Login REJECTED: ${errorText}`);
      auditReport.defects.push({ category: 'Auth', issue: 'Credential rejection', details: errorText });
      await page.screenshot({ path: 'audit-results/screenshots/login-rejected.png', fullPage: true });
    }
  } catch (e) {
    console.error(`❌ System Failure: ${e.message}`);
    auditReport.defects.push({ category: 'Runtime', issue: 'Fatal E2E Timeout', error: e.message });
  }

  const resultsPath = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\COMPREHENSIVE-E2E-RESULTS.json';
  fs.writeFileSync(resultsPath, JSON.stringify(auditReport, null, 2));
  console.log(`\n✅ Platform Audit Complete. Report: ${resultsPath}`);
  
  await browser.close();
}

exhaustivePlatformAudit().catch(console.error);
