/* eslint-disable */
const fs = require('fs');
const path = require('path');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'a11y-raw-2026-05-23.json'), 'utf8'));

const ruleCounts = {};        // rule -> { impact, totalNodes, pages:Set }
const contrastFails = [];     // {page, html, target, summary}
const focusFails = [];
const tapFails = [];
const ariaFails = [];
const headingFails = [];
const otherFails = [];
const skipLink = {};
const smallTargets = {};

for (const [pageId, d] of Object.entries(raw.pages)) {
  if (d.error) continue;
  skipLink[pageId] = d.probes.firstAnchor;
  smallTargets[pageId] = d.probes.smallTargets;
  for (const v of d.axeViolations) {
    if (!ruleCounts[v.id]) ruleCounts[v.id] = { impact: v.impact, totalNodes: 0, pages: new Set(), help: v.help, wcag: v.wcag };
    ruleCounts[v.id].totalNodes += v.count;
    ruleCounts[v.id].pages.add(pageId);
    for (const n of v.samples) {
      const entry = { page: pageId, rule: v.id, impact: v.impact, html: n.html, target: n.target, summary: n.failureSummary };
      if (v.id === 'color-contrast' || v.id === 'color-contrast-enhanced') contrastFails.push(entry);
      else if (/focus|focus-order|tabindex/.test(v.id)) focusFails.push(entry);
      else if (/target-size/.test(v.id)) tapFails.push(entry);
      else if (/aria/.test(v.id) || /button-name|link-name|label/.test(v.id)) ariaFails.push(entry);
      else if (/heading|page-has-heading/.test(v.id)) headingFails.push(entry);
      else otherFails.push(entry);
    }
  }
}

console.log('=== RULE TOTALS ===');
const rows = Object.entries(ruleCounts).sort((a,b) => (b[1].totalNodes - a[1].totalNodes));
for (const [r, info] of rows) {
  console.log(`${r.padEnd(36)} ${String(info.impact).padEnd(9)} nodes=${String(info.totalNodes).padEnd(4)} pages=${info.pages.size} wcag=${(info.wcag||[]).join(',')}`);
  console.log('   help: ' + info.help);
}

console.log('\n=== CONTRAST SAMPLES (first 25) ===');
for (const c of contrastFails.slice(0, 25)) {
  // Extract fg/bg/ratio from summary
  const m = c.summary.match(/contrast of ([\d.]+).*?foreground color:\s*(#[0-9a-fA-F]+).*?background color:\s*(#[0-9a-fA-F]+)/s) ||
            c.summary.match(/foreground color:\s*(#[0-9a-fA-F]+).*?background color:\s*(#[0-9a-fA-F]+).*?contrast ratio of ([\d.]+)/s);
  let ratio = '', fg = '', bg = '';
  const r2 = c.summary.match(/contrast of ([\d.]+)/);
  const r3 = c.summary.match(/foreground color:\s*(#[0-9a-fA-F]+)/);
  const r4 = c.summary.match(/background color:\s*(#[0-9a-fA-F]+)/);
  if (r2) ratio = r2[1];
  if (r3) fg = r3[1];
  if (r4) bg = r4[1];
  console.log(`[${c.page}] ratio=${ratio} fg=${fg} bg=${bg}  target=${JSON.stringify(c.target)}`);
  console.log(`   ${c.html}`);
}

console.log('\n=== TARGET SIZE SAMPLES (first 15) ===');
for (const c of tapFails.slice(0, 15)) {
  console.log(`[${c.page}] ${c.target.join(' >> ')}`);
  console.log(`   ${c.html.slice(0,200)}`);
  console.log(`   ${c.summary.slice(0,200)}`);
}

console.log('\n=== ARIA / NAME SAMPLES (first 15) ===');
for (const c of ariaFails.slice(0, 15)) {
  console.log(`[${c.page}] ${c.rule}  ${c.target.join(' >> ')}`);
  console.log(`   ${c.html}`);
}

console.log('\n=== OTHER VIOLATIONS (first 15) ===');
for (const c of otherFails.slice(0, 15)) {
  console.log(`[${c.page}] ${c.rule}  ${c.target.join(' >> ')}`);
  console.log(`   ${c.html.slice(0,200)}`);
}

console.log('\n=== SKIP LINK FIRST ANCHOR (per page) ===');
for (const [p, a] of Object.entries(skipLink)) {
  console.log(`${p.padEnd(10)} -> ${a ? (a.href + ' "' + a.text + '"') : 'NONE'}`);
}

console.log('\n=== SMALL TARGET SAMPLES (per page, first 3) ===');
for (const [p, list] of Object.entries(smallTargets)) {
  if (!list || !list.length) continue;
  console.log(`[${p}]`);
  for (const t of list.slice(0, 3)) console.log(`   <${t.tag}> ${t.w}x${t.h}px "${t.text}" aria="${t.aria}"`);
}
