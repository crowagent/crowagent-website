const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

async function visualLogin() {
  console.log(`🔍 DIAGNOSTIC: Testing login on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  if (!fs.existsSync('audit-results/screenshots')) {
    fs.mkdirSync('audit-results/screenshots', { recursive: true });
  }

  try {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"], [name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], [name="password"]', TEST_USER.pass);
    await page.click('button[type="submit"], button:has-text("Sign in")');

    // Just wait for 5 seconds to see what happens
    await page.waitForTimeout(5000);
    
    console.log('Current URL after submit:', page.url());
    
    await page.screenshot({ path: 'audit-results/screenshots/diagnostic-auth.png', fullPage: true });
    
    // Dump some text to see error
    const bodyText = await page.evaluate(() => {
       const el = document.querySelector('.error-message, .alert-danger, .text-red-500, [role="alert"]');
       return el ? el.innerText : document.body.innerText.substring(0, 300);
    });
    console.log('Page text snippet or error:', bodyText);

  } catch (e) {
    console.error('Diagnostic error:', e.message);
  } finally {
    await browser.close();
  }
}

visualLogin().catch(console.error);
