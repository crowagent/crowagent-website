#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro', 'coverage', 'lcov-report',
  'hero-options', 'tools',
]);
function walk(d, list) {
  for (const f of fs.readdirSync(d)) {
    if (SKIP.has(f) || f.startsWith('.')) continue;
    const p = path.join(d, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, list);
    else if (/\.html$/i.test(f) && !/(mockup|finished-premium|premium-homepage|premium-pricing|premium-product)/i.test(f)) list.push(p);
  }
  return list;
}
function walkTools(d, list) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walkTools(p, list);
    else if (/\.html$/i.test(f)) list.push(p);
  }
  return list;
}
const list = [];
walk(ROOT, list);
walkTools(path.join(ROOT, 'tools'), list);

const routes = list.map(abs => {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  const url = rel.endsWith('index.html') ? '/' + rel.replace(/index\.html$/, '') : '/' + rel;
  let title = '';
  let desc = '';
  try {
    const html = fs.readFileSync(abs, 'utf8');
    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) title = t[1].replace(/\s*[\-—|·].*$/, '').trim();
    const d = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']{20,140})["']/i);
    if (d) desc = d[1].trim();
  } catch {}
  return { url, file: rel, title, desc };
}).sort((a, b) => a.url.localeCompare(b.url));

console.log('Total routes: ' + routes.length);
console.log(JSON.stringify(routes, null, 2));
