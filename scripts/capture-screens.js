const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EMAIL = 'support.crowagent@gmail.com';
const PW = 'CrowE2E-Test-2026-04!K9xQ';
const OUTPUT_DIR = path.join(__dirname, '..', 'Assets', 'product-screens');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function clean(p) {
  await p.evaluate(() => {
    // Hide onboarding checklist
    document.querySelectorAll('aside[aria-label="Getting started with CrowAgent"]').forEach(e => { try { e.remove(); } catch (_) { } });
    // Remove driver.js elements
    document.querySelectorAll('.driver-popover,.driver-overlay,[class*="driver-"]').forEach(e => { try { e.remove(); } catch (_) { } });
    // Remove NPS/Feedback dialogs
    document.querySelectorAll('[role="dialog"]').forEach(d => {
      if (/recommend|how likely|feedback/i.test(d.textContent || '')) try { d.remove(); } catch (_) { }
    });
    // Hide notification banners that might be blocking top nav
    const RX = /temporarily unavailable|services are degraded|two-factor authentication isn|Enrol an authenticator|TEST MODE|invitation only|No real charges|Request access at/i;
    [...document.querySelectorAll('div,header,section,aside,nav')].forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < 170 && r.height > 0 && r.height < 92 && r.width > 360 && RX.test(el.textContent || '') && el.querySelectorAll('input,table,canvas,h1,h2,h3,article').length === 0) el.style.display = 'none';
    });
    // Hide cookie banners
    document.querySelectorAll('[class*="cookie"],.ca-floating-panel,[class*="floating-panel"]').forEach(el => {
      if (el.getBoundingClientRect().height < 240) el.style.display = 'none';
    });
    // Ensure scrollbars are hidden for cleaner shots if necessary, but we want premium look
    document.documentElement.style.overflow = 'hidden';
  });
  await p.waitForTimeout(500);
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader']
  });
  
  const context = await browser.newContext({
    viewport: { width: 2880, height: 1800 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    reducedMotion: 'no-preference'
  });

  const page = await context.newPage();
  
  console.log('Navigating to login...');
  await page.goto('https://app.crowagent.ai/login', { waitUntil: 'networkidle', timeout: 60000 });
  
  await page.fill('#signin-email', EMAIL);
  await page.fill('input[type="password"]', PW);
  
  console.log('Signing in...');
  try {
    await Promise.all([
      page.waitForURL(u => !/\/login/.test(u.href), { timeout: 30000 }),
      page.click('button:has-text("Sign in")')
    ]);
    console.log('Login successful.');
  } catch (err) {
    console.error('Login failed or timed out:', err.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'debug-login-failed.png') });
    await browser.close();
    process.exit(1);
  }
  
  // Wait for main dashboard stability
  await page.waitForTimeout(5000);
  
  // Set local storage to hide onboarding for future navigations
  await page.evaluate(() => {
    try {
      localStorage.setItem('ca:onboarding-checklist-hidden-v1', '1');
      localStorage.setItem('ca:dismissed-nps-v1', 'true');
    } catch (_) { }
  }).catch(() => {});

  const views = [
    ['/dashboard', 'dashboard-main', /Dashboard|Overview|Portfolio/i],
    ['/crowcyber', 'product-cyber', /Internet-facing|Auto-run|Cyber/i],
    ['/crowcash', 'product-cash', /Ageing|Invoice|Cash/i],
    ['/crowmark', 'product-mark', /Contracts|Active|Mark/i],
    ['/properties', 'product-core', /Properties|Assets|Core/i],
    ['/crowesg', 'product-esg', /ESG|Carbon|Sustainability/i],
    ['/analytics', 'product-analytics', /Analytics|Exposure|Risk/i]
  ];

  for (const [route, label, marker] of views) {
    console.log(`Capturing ${label} (${route})...`);
    try {
      await page.goto('https://app.crowagent.ai' + route, { waitUntil: 'load', timeout: 45000 });
      
      // Wait for marker or just wait a bit for stability
      try {
        await page.waitForFunction(m => new RegExp(m, 'i').test(document.body.innerText || ''), marker.source, { timeout: 15000 });
      } catch (e) {
        console.log(`  Marker not found for ${label} within 15s, capturing anyway...`);
      }
      
      await page.waitForTimeout(5000); // Give it extra time to render charts/data
      await clean(page);
      
      const is404 = await page.evaluate(() => /page not found|does not exist or has been relocated/i.test(document.body.innerText || ''));
      if (is404) {
        console.log(`  ✗ ${label}: 404`);
        continue;
      }

      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${label}.png`),
        fullPage: false 
      });
      console.log(`  ✓ ${label} saved.`);
    } catch (err) {
      console.error(`  Failed to capture ${label}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Capture complete.');
})();
