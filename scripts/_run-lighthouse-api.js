#!/usr/bin/env node
/*
 * Run Lighthouse via its Node API directly to avoid chrome-launcher's EPERM
 * on Windows temp-dir cleanup. Writes JSON to audit-results/.
 *
 * Usage: node scripts/_run-lighthouse-api.js <route> <suffix>
 */
const path = require('path');
const fs = require('fs');

(async () => {
  // Args may be Git-Bash-converted into absolute paths (e.g. /tools/ → C:/Program Files/Git/tools/).
  // Recover by stripping the prefix when present.
  let route = process.env.ROUTE || process.argv[2] || '/';
  if (route.includes(':') && route.toLowerCase().includes('/git/')) {
    const m = route.match(/\/git\/(.*)$/i);
    if (m) route = '/' + m[1];
  }
  const suffix = process.env.SUFFIX || process.argv[3] || 'before';
  const dateStamp = '2026-05-17';
  const ROOT = path.resolve(__dirname, '..');
  const tmp = path.join(ROOT, 'audit-results', '_lh-tmp');
  fs.mkdirSync(tmp, { recursive: true });

  const routeName = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_');
  const outPath = path.join(ROOT, 'audit-results', `LIGHTHOUSE-${routeName}-${suffix}-${dateStamp}.json`);

  // Dynamic ESM import
  const chromeLauncher = await import('chrome-launcher');
  const { default: lighthouse } = await import('lighthouse');

  const userData = path.join(tmp, 'chrome-' + Date.now());
  fs.mkdirSync(userData, { recursive: true });

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=' + userData],
  });

  try {
    const url = 'http://localhost:8092' + route;
    console.log('LH url:', JSON.stringify(url));
    const res = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      maxWaitForLoad: 45000,
    }, {
      extends: 'lighthouse:default',
      settings: { onlyCategories: ['performance'] },
    });
    fs.writeFileSync(outPath, res.report);
    console.log('Wrote ' + outPath + ' (' + fs.statSync(outPath).size + ' bytes)');
  } finally {
    try { await chrome.kill(); } catch (e) { /* swallow EPERM */ }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
