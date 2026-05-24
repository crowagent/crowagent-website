const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';

async function runTitanFinancial() {
  console.log('💰 TITAN FINANCIAL & LOGIC VALIDATOR INITIATED');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const defects = [];
  
  const logDefect = (title, severity, systems, steps, expected, actual, rootCause, sec, comp, fin, fix, reg) => {
    defects.push({ title, severity, systems, steps, expected, actual, rootCause, sec, comp, fin, fix, reg });
  };

  try {
    // 1. FINANCIAL PRECISION (Late Payment Calculator)
    console.log('-> Testing Financial Integrity (Late Payment Calculator)...');
    await page.goto(`${BASE_URL}/tools/late-payment-calculator`, { waitUntil: 'networkidle' });
    
    // Attempt to inject extreme numbers
    await page.fill('input[name="invoiceAmount"], input[placeholder*="amount" i]', '999999999.999999').catch(()=>null);
    await page.fill('input[name="dueDate"], input[type="date"]', '1970-01-01').catch(()=>null);
    await page.click('button[type="submit"], button:has-text("Calculate")').catch(()=>null);
    
    await page.waitForTimeout(2000);
    const bodyContent = await page.evaluate(() => document.body.innerText);
    
    if (bodyContent.includes('NaN') || bodyContent.includes('undefined')) {
      logDefect('Financial Calculation NaN / Precision Error', 'CRITICAL', 'CrowCash / Late Payment Calculator', '1. Enter invoice amount 999999999.999999\n2. Submit', 'Graceful validation error or precise rounding to 2 decimal places', 'NaN or undefined rendered in output', 'Lack of BigInt or decimal precision libraries; standard JS float precision loss', 'NO', 'YES', 'YES', 'Implement exact-math libraries (e.g. decimal.js) for all financial calculations', 'YES');
    }

    // 2. COMPLIANCE ENGINE (CSRD Checker)
    console.log('-> Testing Compliance Logic (CSRD Checker)...');
    await page.goto(`${BASE_URL}/tools/csrd-applicability-checker`, { waitUntil: 'networkidle' });
    const is404 = await page.evaluate(() => document.body.innerText.includes('Page not found'));
    
    if (is404) {
      logDefect('Compliance Engine Offline (404)', 'HIGH', 'CSRD Checker, Routing', 'Navigate to /tools/csrd-applicability-checker', 'Tool renders', '404 Page not found', 'Route missing from build output or middleware blocking access', 'NO', 'YES', 'NO', 'Fix Next.js routing and ensure tool is statically generated or SSR enabled', 'YES');
    }

  } catch (error) {
    console.error('Financial Validator Failure:', error);
  }

  fs.writeFileSync('audit/TITAN-FINANCIAL-RESULTS.json', JSON.stringify(defects, null, 2));
  console.log('💰 TITAN FINANCIAL COMPLETE');
  await browser.close();
}

runTitanFinancial();
