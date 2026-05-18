#!/usr/bin/env node
// Run Lighthouse on a route into audit-results/, redirecting TMPDIR
// to a repo-local folder so the sandbox can clean it up afterwards.
//
// Usage: node scripts/_run-lighthouse.js <route> <suffix>
//   route   e.g. "/"  or "/tools/"
//   suffix  e.g. "before" or "after"

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const route = process.argv[2] || '/';
const suffix = process.argv[3] || 'before';
const dateStamp = '2026-05-17';
const ROOT = path.resolve(__dirname, '..');
const tmp = path.join(ROOT, 'audit-results', '_lh-tmp');
const chromeData = path.join(tmp, 'chrome-' + Date.now());
fs.mkdirSync(chromeData, { recursive: true });

const routeName = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_');
const outputJson = path.join(ROOT, 'audit-results', `LIGHTHOUSE-${routeName}-${suffix}-${dateStamp}.json`);

const env = {
  ...process.env,
  TMPDIR: tmp,
  TEMP: tmp,
  TMP: tmp,
};

const args = [
  'lighthouse',
  'http://localhost:8092' + route,
  '--quiet',
  '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --user-data-dir=' + chromeData,
  '--only-categories=performance',
  '--output=json',
  '--output-path=' + outputJson,
  '--max-wait-for-load=45000',
];

const r = spawnSync('npx', args, { env, stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(r.status || 0);
