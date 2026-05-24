const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: 'CrowV2-Smoke-2026'
};

async function testLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', response => {
    if (response.url().includes('login') && response.request().method() === 'POST') {
      console.log('Login POST response:', response.status(), response.url());
    }
  });

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.pass);
  await page.screenshot({ path: 'audit-screenshots/before-submit.png' });
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    page.getByRole('button', { name: /sign in/i }).click()
  ]);

  await page.waitForTimeout(5000); // Give it time
  
  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'audit-screenshots/after-submit.png' });
  
  await browser.close();
}

testLogin().catch(console.error);
