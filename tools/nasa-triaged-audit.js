const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

const REPORT_PATH = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\NASA-GRADE-PLATFORM-AUDIT.md';

async function performNASAAudit() {
  console.log('🚀 NASA Mission Control: Full System Triage...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const defects = [];
  const captureDefect = (severity, category, title, details) => {
    defects.push({ severity, category, title, details, timestamp: new Date().toISOString() });
    console.log(`[${severity}] ${category}: ${title}`);
  };

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log('Login page loaded. Waiting for form hydration...');
    
    // Wait for the actual interactive fields to appear
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.pass);
    
    console.log('Submitting credentials...');
    await page.click('button[type="submit"]');

    // Monitor for the redirect OR error
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 20000 }),
      page.waitForSelector('.error-message, .alert, [role="alert"]', { timeout: 20000 })
    ]);

    if (page.url().includes('dashboard')) {
      console.log('✅ Auth Milestone: Dashboard Authenticated.');
      
      // DEEP PRODUCT SCAN
      const products = [
        { name: 'Dashboard (Global)', url: '/dashboard' },
        { name: 'Core (Estate)', url: '/dashboard/core' },
        { name: 'Mark (Contracts)', url: '/crowmark' },
        { name: 'Cyber (Security)', url: '/crowcyber/assessments' },
        { name: 'Cash (Credit)', url: '/crowcash/invoices' }
      ];

      for (const p of products) {
        console.log(`📡 Orbiting ${p.name}...`);
        await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const diagnostic = await page.evaluate(() => {
          const body = document.body.innerText;
          const h1 = document.querySelector('h1')?.innerText;
          const hasError = body.includes('Unable to load') || body.includes('Error fetching') || body.includes('Something went wrong');
          const hasTableData = document.querySelectorAll('table tr').length > 1;
          const hasCards = document.querySelectorAll('.metric-card, [class*="card"]').length > 0;
          
          return { h1, hasError, hasData: hasTableData || hasCards };
        });

        if (diagnostic.hasError) {
          captureDefect('HIGH', 'Product', `${p.name} Data Fault`, 'Backend query failed in UI.');
        }
        if (!diagnostic.hasData && !p.url.includes('settings')) {
           captureDefect('MEDIUM', 'Product', `${p.name} Empty/Stub`, 'No data containers rendered.');
        }
        
        await page.screenshot({ path: `audit-results/screenshots/nasa-prod-${p.name.replace(/\W/g, '-')}.png`, fullPage: true });
      }

      // SETTINGS INTERACTION
      console.log('📡 Testing Profile Mutation Flow...');
      await page.goto(`${BASE_URL}/settings`);
      await page.fill('input[name="full_name"]', 'NASA Test ' + Date.now());
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(2000);
      const success = await page.evaluate(() => document.body.innerText.includes('Success') || document.body.innerText.includes('saved'));
      if (!success) captureDefect('HIGH', 'Functional', 'Profile Save Failed', 'No feedback after settings update.');

    } else {
      captureDefect('CRITICAL', 'Auth', 'Login Rejected', 'Credentials accepted but redirect failed or error shown.');
    }

  } catch (e) {
    captureDefect('CRITICAL', 'Infrastructure', 'Audit Crashed', e.message);
  }

  // FINAL REPORT
  let reportMd = `# NASA-GRADE PLATFORM AUDIT REPORT\n**Project:** app.crowagent.ai\n**Status:** FINAL\n\n## 🚨 DEFECT LIST\n\n| Severity | Category | Title | Details |\n|---|---|---|---|\n`;
  defects.forEach(d => reportMd += `| ${d.severity} | ${d.category} | ${d.title} | ${d.details} |\n`);
  fs.writeFileSync(REPORT_PATH, reportMd);

  console.log(`\n✅ NASA Audit Complete. Ledger: ${REPORT_PATH}`);
  await browser.close();
}

performNASAAudit();
