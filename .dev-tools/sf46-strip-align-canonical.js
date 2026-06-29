#!/usr/bin/env node
/**
 * SF46 Phase 5 — Strip dead `body.align-canonical` cascade.
 *
 * `align-canonical` body class has been removed from all 66 pages.
 * Rules in styles.css gated on `body.align-canonical` are now dead code.
 * This script removes them — replacing complex :not()-chain overrides
 * with element-level defaults where needed.
 *
 * Strategy: parse styles.css, drop every rule whose selector list
 * STARTS with `body.align-canonical` (or contains it as a leading
 * compound). The element-level defaults are added inline after this run.
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'styles.css');

let css = fs.readFileSync(SRC, 'utf8');

// Match a CSS rule whose selector list contains `body.align-canonical`.
// A rule = (selectors) { declarations }. We use a simple state machine
// rather than regex to handle nested @media etc.
let out = '';
let i = 0;
let removed = 0;
while (i < css.length) {
  // Find the next `{`
  const openIdx = css.indexOf('{', i);
  if (openIdx === -1) { out += css.slice(i); break; }
  // Sniff selector text from previous `}` (or start) to openIdx
  const prevClose = Math.max(
    css.lastIndexOf('}', openIdx),
    css.lastIndexOf(';', openIdx),
    css.lastIndexOf('*/', openIdx)
  );
  const selectorStart = prevClose + 1;
  const selectorText = css.slice(selectorStart, openIdx);
  const isAlignCanonical = /body\.align-canonical\b/.test(selectorText);
  const isAtRule = selectorText.trim().startsWith('@');
  // Find matching close brace
  let depth = 1;
  let j = openIdx + 1;
  while (j < css.length && depth > 0) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') depth--;
    if (depth > 0) j++;
  }
  const closeIdx = j;
  if (isAlignCanonical && !isAtRule) {
    out += css.slice(i, selectorStart);
    removed++;
    i = closeIdx + 1;
    // Eat any trailing whitespace + newline so we don't leave artefacts
    while (i < css.length && /\s/.test(css[i])) i++;
  } else {
    out += css.slice(i, closeIdx + 1);
    i = closeIdx + 1;
  }
}

fs.writeFileSync(SRC, out);
console.log(`Stripped ${removed} body.align-canonical rule(s) from styles.css`);
console.log(`Lines before: ${css.split('\n').length}, after: ${out.split('\n').length}`);
