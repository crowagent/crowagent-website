const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const SESSION = JSON.parse(fs.readFileSync('C:\\Users\\bhave\\Crowagent Repo\\crowagent-platform\\session-clean.json', 'utf8')).session;

async function executeNASAMission() {
  console.log('🚀 NASA Mission: Authenticated Deep Probe starting...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Inject session into LocalStorage & Cookies (Standard Supabase SSR pattern)
  await page.goto(BASE_URL);
  
  const tokenName = 'sb-gujtuecjzfiqsdnzgyvo-auth-token';
  const sessionString = JSON.stringify(SESSION);
  
  await context.addCookies([{
    name: tokenName,
    value: Buffer.from(sessionString).toString('base64'),
    domain: 'app.crowagent.ai',
    path: '/',
    secure: true,
    sameSite: 'Lax'
  }]);

  await page.evaluate(({ name, val }) => {
    localStorage.setItem(name, val);
  }, { name: tokenName, val: sessionString });

  console.log('Session injected. Navigating to Dashboard...');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  
  const auditReport = {
    timestamp: new Date().toISOString(),
    results: []
  };

  const testPath = async (name, path, assertion) => {
    console.log(`📡 Probing [${name}] at ${path}...`);
    try {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Wait for hydration
      
      const pageData = await page.evaluate((assertionStr) => {
        const bodyText = document.body.innerText;
        const h1 = document.querySelector('h1')?.innerText || 'NONE';
        const errorVisible = bodyText.includes('error') || bodyText.includes('Unable to') || bodyText.includes('failed');
        
        // Execute dynamic assertion
        let assertionResult = 'SKIP';
        if (assertionStr) {
           assertionResult = eval(assertionStr) ? 'PASS' : 'FAIL';
        }

        return { h1, errorVisible, assertionResult, snippet: bodyText.substring(0, 200).replace(/\n/g, ' ') };
      }, assertion);

      auditReport.results.push({ name, path, ...pageData });
      await page.screenshot({ path: `audit-results/screenshots/nasa-${name.replace(/\s+/g, '-')}.png`, fullPage: true });
    } catch (e) {
      auditReport.results.push({ name, path, error: e.message });
    }
  };

  // EXECUTE MISSION PLAN
  await testPath('Dashboard', '/dashboard', 'document.querySelectorAll(".metric-card").length > 0');
  await testPath('Core Properties', '/dashboard/core', 'document.querySelectorAll("table tr").length > 1');
  await testPath('CrowMark', '/crowmark', '!document.body.innerText.includes("Unable to load")');
  await testPath('CrowCyber', '/crowcyber/assessments', 'true');
  await testPath('CrowCash', '/crowcash/invoices', 'true');
  await testPath('Profile Settings', '/settings', 'document.querySelector("input[type=\'email\']").value !== ""');
  await testPath('Billing', '/settings/billing', 'document.body.innerText.includes("Plan")');

  fs.writeFileSync('C:\\Users\\bhave\\Crowagent Repo\\audit\\NASA-MISSION-DATA.json', JSON.stringify(auditReport, null, 2));
  
  console.log('\n📊 MISSION SUMMARY:');
  auditReport.results.forEach(r => {
    const status = r.errorVisible ? '❌ ERROR' : (r.assertionResult === 'FAIL' ? '⚠️ ASSERT FAIL' : '✅ OK');
    console.log(`${status} | ${r.name}: ${r.h1}`);
  });

  await browser.close();
  console.log('\n✅ NASA Mission Complete.');
}

executeNASAMission().catch(console.error);
