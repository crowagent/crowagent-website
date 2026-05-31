#!/usr/bin/env node
/* TOKEN MIGRATE (2026-06-01) — one-shot, lossless brand-hex -> token migration.
 * Uses the EXACT same value-position detection as token-guard.js so it only rewrites
 * hex in property VALUES (never inside Tailwind escaped-class selectors .text-\[\#..\]).
 * Lossless: each token is defined to the identical hex, so rendered output is unchanged.
 * Writes files in place. Run token-guard.js + visual diff afterwards to prove parity.
 */
const fs = require('fs');
const path = require('path');

const TOKENS = {
  '#0cc9a8': 'var(--teal)',
  '#040e1a': 'var(--bg)',
  '#000212': 'var(--bg-deep)',
  '#a78bfa': 'var(--mark)',
  '#e8f0fa': 'var(--cloud)',
};
const HEX_RE = /#[0-9a-fA-F]{6}\b/g;

function handAuthoredCss() {
  const dir = 'Assets/css';
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.css'))
    .filter(f => !/\.compiled\.css$|\.min\.css$/.test(f))
    .filter(f => f !== 'crowagent-brand-tokens.css' && f !== 'sovereign-core-v2.css')
    .map(f => path.join(dir, f));
}
function isValuePosition(line, idx) {
  const before = line.slice(Math.max(0, idx - 2), idx);
  if (before.endsWith('\\')) return false;
  return line.slice(0, idx).includes(':');
}

let changed = 0, files = 0;
for (const file of handAuthoredCss()) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let fileChanged = false;
  const out = lines.map(line => {
    // rebuild the line, replacing only value-position brand hexes
    let result = '', last = 0, m;
    HEX_RE.lastIndex = 0;
    while ((m = HEX_RE.exec(line)) !== null) {
      const hex = m[0].toLowerCase();
      if (TOKENS[hex] && isValuePosition(line, m.index)) {
        result += line.slice(last, m.index) + TOKENS[hex];
        last = m.index + m[0].length;
        changed++; fileChanged = true;
      }
    }
    result += line.slice(last);
    return result;
  });
  if (fileChanged) { fs.writeFileSync(file, out.join('\n')); files++; }
}
console.log('Migrated ' + changed + ' brand-hex values to tokens across ' + files + ' files.');
