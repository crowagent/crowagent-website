const { chromium } = require('playwright');
const fs = require('fs');

// We will test the currently running website on 8092, but this script is scalable to the platform/portal URLs.
const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

const ROUTES = [
  '/',
  '/pricing',
  '/tools/csrd-applicability-checker',
  '/contact',
  '/blog'
];

async function runEnterpriseAudit() {
  console.log('🚀 Initiating Enterprise E2E Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'CrowAgent-Enterprise-Auditor/1.0'
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    routes: {},
    globalErrors: []
  };

  for (const route of ROUTES) {
    console.log(`\n🔍 Auditing Route: ${route}`);
    const page = await context.newPage();
    const routeData = {
      status: null,
      consoleErrors: [],
      networkFailures: [],
      performance: {},
      interactiveElements: {}
    };

    // Trap Console Errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        routeData.consoleErrors.push(msg.text());
      }
    });

    // Trap Network Failures
    page.on('response', response => {
      if (response.status() >= 400) {
        routeData.networkFailures.push({ url: response.url(), status: response.status() });
      }
    });

    try {
      const startTime = Date.now();
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      routeData.status = response ? response.status() : 'Unknown';
      routeData.performance.loadTimeMs = Date.now() - startTime;

      // Extract basic DOM health
      routeData.interactiveElements = await page.evaluate(() => {
        return {
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a').length,
          forms: document.querySelectorAll('form').length,
          h1Count: document.querySelectorAll('h1').length
        };
      });

    } catch (e) {
      console.error(`❌ Failed to audit ${route}: ${e.message}`);
      routeData.error = e.message;
    }

    report.routes[route] = routeData;
    await page.close();
  }

  // Authentication Flow Check (Attempt to reach Login)
  console.log(`\n🔐 Auditing Authentication Gateway...`);
  try {
    const authPage = await context.newPage();
    const authResponse = await authPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    report.authStatus = authResponse ? authResponse.status() : 'Route Not Found on Website Port';
    await authPage.close();
  } catch(e) {
    report.authStatus = 'Failed to load login gateway';
  }

  fs.writeFileSync('C:\\Users\\bhave\\Crowagent Repo\\audit\\ENTERPRISE-E2E-RESULTS.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Enterprise Audit Script Completed. Results saved to JSON.');
  await browser.close();
}

runEnterpriseAudit().catch(console.error);
