const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

const PAGES_TO_TEST = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'Core Properties', url: '/dashboard/core' },
  { name: 'CrowMark', url: '/crowmark' },
  { name: 'CrowCyber', url: '/crowcyber/assessments' },
  { name: 'CrowCash', url: '/crowcash/invoices' },
  { name: 'CrowESG', url: '/crowesg/frameworks' },
  { name: 'CSRD Checker', url: '/tools/csrd-applicability-checker' },
  { name: 'PPN 002 Calc', url: '/tools/ppn-002-calculator' },
  { name: 'Cyber Readiness', url: '/tools/cyber-essentials-readiness' },
  { name: 'Late Payment Calc', url: '/tools/late-payment-calculator' },
  { name: 'VSME Light', url: '/tools/vsme-materiality-light' },
  { name: 'Profile Settings', url: '/settings/profile' },
  { name: 'Billing', url: '/settings/billing' }
];

async function runComprehensiveAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const report = {};

  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.pass);
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    page.getByRole('button', { name: /sign in/i }).click()
  ]);
  
  await page.waitForTimeout(3000);
  
  if (!page.url().includes('dashboard')) {
    console.error('Login failed! Current URL:', page.url());
    await browser.close();
    return;
  }

  for (const p of PAGES_TO_TEST) {
    console.log(`Auditing ${p.name}...`);
    try {
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // let animations settle
      
      const pageInfo = await page.evaluate(() => {
        const h1 = document.querySelector('h1')?.innerText || 'No H1';
        const errors = Array.from(document.querySelectorAll('.error, .alert-danger, .text-red-500, [role="alert"]')).map(e => e.innerText);
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(b => b);
        const hasForm = document.querySelector('form') !== null;
        
        return {
          url: window.location.href,
          h1,
          errors,
          buttons,
          hasForm,
          innerTextSnippet: document.body.innerText.substring(0, 300).replace(/\n/g, ' ')
        };
      });

      report[p.name] = pageInfo;
      
      await page.screenshot({ path: `audit-screenshots/${p.name.replace(/\s+/g, '-')}.png`, fullPage: true });
    } catch (e) {
      console.log(`Failed on ${p.name}: ${e.message}`);
      report[p.name] = { error: e.message };
    }
  }

  fs.writeFileSync('C:\\Users\\bhave\\Crowagent Repo\\audit\\REAL-WORLD-AUDIT.json', JSON.stringify(report, null, 2));
  await browser.close();
  console.log('Audit complete.');
}

runComprehensiveAudit().catch(console.error);
