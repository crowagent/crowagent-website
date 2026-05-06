const fs = require('fs');
const path = require('path');

const input = process.argv[2] || path.join('audit-results', 'live-site-audit-2026-05-05.json');
const outDir = path.dirname(input);
const date = path.basename(input).match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString().slice(0, 10);
const output = path.join(outDir, `comprehensive-issue-register-${date}.md`);

const report = JSON.parse(fs.readFileSync(input, 'utf8'));
const severityOrder = ['P0', 'P1', 'P2', 'P3'];

function esc(value) {
  return String(value || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function short(value, max = 220) {
  const text = esc(value);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function issueKey(issue) {
  let detail = issue.detail || '';
  detail = detail
    .replace(/\?url=[^&\s]+/g, '?url=...')
    .replace(/&dpl=[^&\s]+/g, '&dpl=...')
    .replace(/sha256-[A-Za-z0-9+/=]+/g, 'sha256-...')
    .replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g, '<timestamp>')
    .replace(/cf-ray: [^\s]+/gi, 'cf-ray: <id>')
    .replace(/report\/v4\?s=[^\s"]+/g, 'report/v4?s=<redacted>');
  return `${issue.severity}|${issue.issue}|${detail.slice(0, 180)}`;
}

const bySeverity = new Map();
for (const sev of severityOrder) bySeverity.set(sev, []);
for (const issue of report.issues) {
  if (!bySeverity.has(issue.severity)) bySeverity.set(issue.severity, []);
  bySeverity.get(issue.severity).push(issue);
}

const groups = new Map();
for (const issue of report.issues) {
  const key = issueKey(issue);
  if (!groups.has(key)) {
    groups.set(key, {
      severity: issue.severity,
      issue: issue.issue,
      detail: issue.detail || '',
      pages: new Map(),
    });
  }
  const group = groups.get(key);
  group.pages.set(issue.page, (group.pages.get(issue.page) || 0) + 1);
}

const grouped = [...groups.values()].sort((a, b) => {
  const sev = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
  if (sev !== 0) return sev;
  return b.pages.size - a.pages.size || a.issue.localeCompare(b.issue);
});

const lines = [];
lines.push(`# CrowAgent Comprehensive Issue Register - ${date}`);
lines.push('');
lines.push(`Base URL audited: \`${report.baseUrl}\``);
lines.push(`Generated from: \`${input.replace(/\\/g, '/')}\``);
lines.push(`Pages audited: ${report.pages.length}`);
lines.push(`Unique links probed: ${report.linkChecks.length}`);
lines.push(`Raw findings: ${report.issues.length}`);
lines.push(`Grouped defects/signals: ${grouped.length}`);
lines.push('');
lines.push('## Counts');
lines.push('');
lines.push('| Severity | Count |');
lines.push('|---|---:|');
for (const sev of severityOrder) {
  lines.push(`| ${sev} | ${bySeverity.get(sev).length} |`);
}
lines.push('');
lines.push('## Grouped Defect List');
lines.push('');
lines.push('| ID | Severity | Issue | Instances | Pages | Detail |');
lines.push('|---:|---|---|---:|---|---|');
grouped.forEach((group, index) => {
  const instanceCount = [...group.pages.values()].reduce((sum, count) => sum + count, 0);
  const pages = [...group.pages.entries()]
    .map(([page, count]) => `${page}${count > 1 ? ` (${count})` : ''}`)
    .join('<br>');
  lines.push(`| ${index + 1} | ${group.severity} | ${esc(group.issue)} | ${instanceCount} | ${short(pages, 520)} | ${short(group.detail, 520)} |`);
});
lines.push('');
lines.push('## Every Raw Finding');
lines.push('');
lines.push('| # | Severity | Page | Issue | Detail |');
lines.push('|---:|---|---|---|---|');
report.issues.forEach((issue, index) => {
  lines.push(`| ${index + 1} | ${issue.severity} | ${short(issue.page, 180)} | ${short(issue.issue, 180)} | ${short(issue.detail, 700)} |`);
});
lines.push('');
lines.push('## Page Audit Inventory');
lines.push('');
lines.push('| URL | Status | Final URL | Title |');
lines.push('|---|---:|---|---|');
for (const page of report.pages) {
  lines.push(`| ${short(page.url, 220)} | ${page.status || ''} | ${short(page.finalUrl || page.error || '', 260)} | ${short(page.title || '', 180)} |`);
}
lines.push('');
lines.push('## Link Probe Inventory');
lines.push('');
lines.push('| URL | Status/Error | Final URL |');
lines.push('|---|---|---|');
for (const link of report.linkChecks) {
  lines.push(`| ${short(link.href, 280)} | ${link.status || short(link.error, 220)} | ${short(link.finalUrl || '', 280)} |`);
}
lines.push('');

fs.writeFileSync(output, lines.join('\n'));
console.log(`Wrote ${output}`);
