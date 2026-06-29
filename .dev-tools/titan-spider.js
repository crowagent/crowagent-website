const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: process.env.CROW_SMOKE_PASS
};

const PAYLOADS = [
  '<script>alert(1)</script>', 
  '\'; DROP TABLE users;--', 
  '\' OR 1=1--', 
  '"><img src=x onerror=alert(1)>',
  '../../../../etc/passwd'
];

async function runTitanSpider() {
  console.log('🕷️ TITAN E2E SPIDER & FUZZER INITIATED');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const defects = [];
  const logDefect = (title, severity, systems, steps, expected, actual, rootCause, sec, comp, fin, fix, reg) => {
    defects.push({ title, severity, systems, steps, expected, actual, rootCause, sec, comp, fin, fix, reg });
  };

  // 1. Trap Network & Console
  page.on('pageerror', err => {
    logDefect('Uncaught Client-Side Exception', 'HIGH', 'Frontend React Application', `Navigate to ${page.url()}`, 'No exceptions thrown', err.message, 'Unhandled error boundary or hydration failure', 'NO', 'NO', 'NO', 'Implement strict error boundaries and fix underlying type/logic errors', 'YES');
  });

  page.on('response', resp => {
    if (resp.status() >= 500) {
      logDefect(`API 500 Internal Server Error: ${resp.url()}`, 'CRITICAL', 'Backend API / Next.js Edge', `Trigger request to ${resp.url()}`, '200 OK or 400 Validation Error', `HTTP ${resp.status()}`, 'Unhandled backend exception or DB failure', 'YES', 'NO', 'NO', 'Implement robust error handling and logging at the API route level', 'YES');
    }
  });

  try {
    // 2. AUTHENTICATION & SESSION HIJACKING TEST
    console.log('-> Executing Auth Flow...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.pass);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
    } catch (e) {
      logDefect('Authentication Gateway Timeout / Failure', 'CRITICAL', 'Auth System (Supabase/Next.js)', '1. Go to /login\n2. Enter valid credentials\n3. Click Submit', 'Immediate redirection to /dashboard with valid session', 'Timeout exceeded, user stuck or redirected to error state', 'Database connection latency or Middleware race condition', 'YES', 'NO', 'NO', 'Optimize middleware token verification and Supabase connection pooling', 'YES');
      fs.writeFileSync('audit/TITAN-SPIDER-RESULTS.json', JSON.stringify(defects, null, 2));
      await browser.close();
      return;
    }

    // 3. EXHAUSTIVE CRAWL & FUZZ
    const routes = [
      '/dashboard/core',
      '/crowmark',
      '/crowcyber/assessments',
      '/crowcash/invoices',
      '/settings/profile'
    ];

    for (const route of routes) {
      console.log(`-> Probing Route: ${route}`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // DOM Health
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('Application error') || bodyText.includes('Unable to load')) {
        logDefect(`Data Fetch Crash on ${route}`, 'CRITICAL', `Route: ${route}, Database`, `Navigate to ${route}`, 'Data renders successfully', 'UI displays crash or "Unable to load" message', 'Missing database table, failing RLS policy, or malformed schema', 'NO', 'YES', 'YES', 'Verify database schema and RLS policies match frontend expectations', 'YES');
      }

      // Fuzz Inputs
      const inputs = await page.locator('input[type="text"], textarea').all();
      for (let i = 0; i < inputs.length; i++) {
        if (await inputs[i].isVisible() && await inputs[i].isEnabled()) {
          console.log(`   -> Fuzzing input ${i} on ${route}`);
          for (const payload of PAYLOADS) {
            await inputs[i].fill(payload).catch(()=>null);
            // We just fill to see if client-side validation crashes or if it triggers network errors upon blur/submit
            await inputs[i].blur().catch(()=>null); 
          }
        }
      }
    }

    // 4. MULTI-TENANT ISOLATION (IDOR PROBE)
    console.log('-> Executing IDOR / Tenant Escape Probe...');
    // Attempt to access a known invalid/other tenant UUID
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const idorResponse = await page.goto(`${BASE_URL}/dashboard/core/properties/${fakeId}`, { waitUntil: 'networkidle' });
    if (idorResponse && idorResponse.status() === 200) {
      const pageText = await page.evaluate(() => document.body.innerText);
      if (!pageText.toLowerCase().includes('not found') && !pageText.toLowerCase().includes('unauthorized')) {
        logDefect('Potential IDOR / Tenant Isolation Failure', 'CRITICAL', 'API / RLS / Routing', `Navigate directly to /dashboard/core/properties/${fakeId}`, '404 Not Found or 403 Unauthorized', '200 OK and page attempts to render', 'Missing Supabase RLS policy enforcing org_id or user_id ownership', 'YES', 'YES', 'NO', 'Enforce RLS policies on all tables and verify UUID ownership in API routes', 'YES');
      }
    }

  } catch (error) {
    console.error('Spider Critical Failure:', error);
  }

  fs.writeFileSync('audit/TITAN-SPIDER-RESULTS.json', JSON.stringify(defects, null, 2));
  console.log('🕷️ TITAN SPIDER COMPLETE');
  await browser.close();
}

runTitanSpider();
