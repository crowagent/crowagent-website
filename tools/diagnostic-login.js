const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

const TEST_USER = {
  email: 'support.crowagent@gmail.com',
  pass: process.env.E2E_USER_PASSWORD
};

async function diagnosticLogin() {
  console.log(`🔍 DIAGNOSTIC: Testing login on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto(`${BASE_URL}/login`);
    console.log('Page loaded. Checking for form...');

    // Log all input names and types
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(i => ({
        name: i.name,
        type: i.type,
        id: i.id,
        placeholder: i.placeholder
      }));
    });
    console.log('Inputs found:', JSON.stringify(inputs, null, 2));

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.pass);
    
    console.log('Form filled. Clicking submit...');
    await page.click('button[type="submit"]');

    // Wait a few seconds and see what happens
    await page.waitForTimeout(5000);
    console.log('Current URL after submit:', page.url());
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Page text snippet:', bodyText);

    await page.screenshot({ path: 'audit-screenshots/diagnostic-final.png' });
  } catch (e) {
    console.error('Diagnostic error:', e.message);
  } finally {
    await browser.close();
  }
}

diagnosticLogin().catch(console.error);
