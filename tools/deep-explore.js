const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const TEST_USER = {
  email: 'support.crowagent@gmail.com',
  pass: 'E2E_bf698a969f2a441a8210da0aacadcd21_C!'
};

async function deepExplore() {
  console.log('🚀 Launching Deep Explorer...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'CrowAgent-Principal-QA/3.0'
  });
  const page = await context.newPage();

  const report = {
    errors: [],
    urls: [],
    links: []
  };

  page.on('console', msg => {
    if (msg.type() === 'error') report.errors.push(`Console: ${msg.text()}`);
  });
  page.on('pageerror', err => report.errors.push(`Uncaught: ${err.message}`));

  try {
    console.log('Navigate to login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.pass);
    await page.click('button[type="submit"]');

    console.log('Waiting for post-login redirection...');
    // Wait for any redirection to settle
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(e => console.log('No traditional navigation, relying on network idle.'));
    await page.waitForTimeout(5000); // give it a few seconds to load SPA state
    
    const currentUrl = page.url();
    console.log(`Currently at: ${currentUrl}`);
    report.urls.push(currentUrl);

    await page.screenshot({ path: 'audit-screenshots/deep-explore-post-login.png', fullPage: true });

    // Extract all links to map the platform
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(l => l.href && l.href.startsWith(window.location.origin));
    });
    
    report.links = links;
    
    // Check if we are on a dashboard or if there is an error
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    report.pageContentSnippet = pageText;

  } catch (e) {
    console.error('Exploration failed:', e);
    report.fatal = e.message;
  }

  fs.writeFileSync('C:\\Users\\bhave\\Crowagent Repo\\audit\\DEEP-EXPLORE.json', JSON.stringify(report, null, 2));
  await browser.close();
  console.log('Exploration complete.');
}

deepExplore();
