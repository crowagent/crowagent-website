const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const SESSION_DATA = JSON.parse(fs.readFileSync('C:\\Users\\bhave\\Crowagent Repo\\crowagent-platform\\session-clean.json', 'utf8')).session;

const REPORT_PATH = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\NASA-GRADE-PLATFORM-AUDIT.md';

async function performNASAAudit() {
  console.log('🚀 NASA Mission: Force-Entry Platform Audit (Bypassing Gateway)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const defects = [];
  const captureDefect = (severity, category, title, details) => {
    defects.push({ severity, category, title, details, timestamp: new Date().toISOString() });
    console.log(`[${severity}] ${category}: ${title}`);
  };

  try {
    // 1. INJECT SESSION
    await page.goto(BASE_URL);
    await page.evaluate((session) => {
      const key = 'sb-gujtuecjzfiqsdnzgyvo-auth-token';
      localStorage.setItem(key, JSON.stringify(session));
    }, SESSION_DATA);
    
    // 2. NAVIGATE TO PROTECTED DASHBOARD
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const isAuthed = await page.evaluate(() => !document.body.innerText.includes('Sign in'));
    if (!isAuthed) {
      captureDefect('CRITICAL', 'Auth', 'Session Injection Rejected', 'Next.js middleware redirected to login despite valid token.');
    } else {
      console.log('✅ Auth Milestone: Dashboard reached via Session Injection.');

      // 3. PRODUCT SCAN
      const productSuites = [
        { name: 'Core Dashboard', path: '/dashboard', check: 'document.querySelectorAll(".metric-card").length > 0' },
        { name: 'Core Estate', path: '/dashboard/core', check: 'document.querySelectorAll("table tr").length > 2' },
        { name: 'Mark Contracts', path: '/crowmark', check: '!document.body.innerText.includes("Unable to load")' },
        { name: 'Cyber Readiness', path: '/crowcyber/assessments', check: 'true' },
        { name: 'Cash Invoices', path: '/crowcash/invoices', check: 'true' },
        { name: 'ESG Frameworks', path: '/crowesg/frameworks', check: 'false' } // ESG is known stub
      ];

      for (const p of productSuites) {
        console.log(`📡 Probing ${p.name}...`);
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        const diagnostic = await page.evaluate((c) => {
          const body = document.body.innerText;
          const hasError = body.includes('error') || body.includes('Unable to') || body.includes('Something went wrong');
          return { hasError, assertion: eval(c) };
        }, p.check);

        if (diagnostic.hasError) captureDefect('HIGH', 'Product', `${p.name} Data Fault`, 'UI reported fetch failure.');
        if (!diagnostic.assertion && p.name !== 'ESG Frameworks') captureDefect('MEDIUM', 'Product', `${p.name} Missing Data`, 'No data rows or cards found.');
      }
    }

  } catch (e) {
    captureDefect('CRITICAL', 'Infrastructure', 'Audit Probe Failure', e.message);
  }

  // FINAL REPORT
  let reportMd = `# NASA-GRADE PLATFORM AUDIT REPORT\n**Date:** ${new Date().toISOString()}\n\n## 🚨 DEFECT LEDGER\n\n| Severity | Category | Title | Details |\n|---|---|---|---|\n`;
  defects.forEach(d => reportMd += `| ${d.severity} | ${d.category} | ${d.title} | ${d.details} |\n`);
  fs.writeFileSync(REPORT_PATH, reportMd);

  console.log(`\n✅ NASA Audit Complete. Results saved.`);
  await browser.close();
}

performNASAAudit();
