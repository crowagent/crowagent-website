const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

async function diagnosticLogin() {
  console.log(`🔍 DIAGNOSTIC: Testing login on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  
  if (!fs.existsSync('audit-screenshots')) {
    fs.mkdirSync('audit-screenshots', { recursive: true });
  }

  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(2000);
    
    // Check buttons
    const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText));
    console.log('Available buttons:', btns);

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.pass);
    
    // Assuming 'Sign in' or similar
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await page.click('button:has-text("Sign in")');
    }

    console.log('Waiting for navigation...');
    // Don't wait for a specific URL, just wait network idle
    await page.waitForTimeout(8000);
    
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);
    
    await page.screenshot({ path: 'audit-screenshots/diagnostic-real.png', fullPage: true });
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Page text snippet:', bodyText);
    
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('audit-screenshots/page.html', html);

  } catch (e) {
    console.error('Diagnostic error:', e.message);
  } finally {
    await browser.close();
  }
}

diagnosticLogin().catch(console.error);
