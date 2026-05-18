/**
 * sf42-inject-form-validation.js
 *
 * Adds `<script src="/js/modules/ca-form-validation.js" defer></script>`
 * to the <head> of every HTML page that contains a <form>. Idempotent
 * (skips if the tag is already present).
 *
 * Run from repo root: `node scripts/sf42-inject-form-validation.js`
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var TAG = '<script src="/js/modules/ca-form-validation.js" defer></script>';
var TAG_RE = /<script[^>]+ca-form-validation\.js/;

function walk(dir, out) {
  out = out || [];
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // Skip the usual suspects.
      if (e.name === 'node_modules' || e.name === '.git' ||
          e.name === '_archive' || e.name === 'coverage' ||
          e.name === 'playwright-report' || e.name === 'test-results' ||
          e.name === 'debug-screenshots' ||
          e.name === 'audit-screenshots-final') continue;
      walk(full, out);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function injectInto(file) {
  var src = fs.readFileSync(file, 'utf8');
  if (!/<form\b/i.test(src)) return { file: file, status: 'no-form' };
  if (TAG_RE.test(src)) return { file: file, status: 'already-present' };

  // Inject just before </head>.
  var headClose = src.search(/<\/head>/i);
  if (headClose < 0) return { file: file, status: 'no-head' };

  var before = src.slice(0, headClose);
  var after = src.slice(headClose);
  // Normalise leading whitespace so the tag indents like neighbours.
  var indented = '  ' + TAG + '\n';
  var updated = before.replace(/\s*$/, '\n') + indented + after;
  fs.writeFileSync(file, updated, 'utf8');
  return { file: file, status: 'injected' };
}

var files = walk(ROOT);
var summary = { injected: 0, alreadyPresent: 0, noForm: 0, noHead: 0 };
for (var i = 0; i < files.length; i++) {
  var r = injectInto(files[i]);
  var rel = path.relative(ROOT, r.file);
  if (r.status === 'injected') { summary.injected++; console.log('INJECT  ' + rel); }
  else if (r.status === 'already-present') { summary.alreadyPresent++; }
  else if (r.status === 'no-form') { summary.noForm++; }
  else if (r.status === 'no-head') { summary.noHead++; console.log('NO-HEAD ' + rel); }
}
console.log('---');
console.log('injected=' + summary.injected +
  ' already-present=' + summary.alreadyPresent +
  ' no-form=' + summary.noForm +
  ' no-head=' + summary.noHead);
