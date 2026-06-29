
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function auditBrokenResources() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const broken = [];
  page.on('requestfailed', request => {
    broken.push({ url: request.url(), error: request.failure().errorText });
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      broken.push({ url: response.url(), status: response.status() });
    }
  });

  console.log(`Auditing resources for homepage...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  console.log(`Auditing resources for crowagent-core...`);
  await page.goto(`${BASE_URL}/crowagent-core`, { waitUntil: 'networkidle' });

  console.log('--- Broken Resources Audit ---');
  if (broken.length === 0) {
    console.log('No broken resources found.');
  } else {
    console.log(JSON.stringify(broken, null, 2));
  }
  
  await browser.close();
}

auditBrokenResources().catch(console.error);
