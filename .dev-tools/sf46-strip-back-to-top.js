#!/usr/bin/env node
/**
 * SF46 Phase 5 — Strip dead `#back-to-top` CSS rules.
 *
 * The hardcoded `<button id="back-to-top">` has been removed from
 * index.html. The canonical universal button is `#sf21-back-to-top`
 * (injected via nav-inject.js). Rules targeting `#back-to-top` are
 * now dead.
 *
 * Strategy: drop every rule whose selector starts with `#back-to-top`
 * (or contains it as the leading compound). Same approach as the
 * align-canonical strip.
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'styles.css');

let css = fs.readFileSync(SRC, 'utf8');

let out = '';
let i = 0;
let removed = 0;
while (i < css.length) {
  const openIdx = css.indexOf('{', i);
  if (openIdx === -1) { out += css.slice(i); break; }
  const prevClose = Math.max(
    css.lastIndexOf('}', openIdx),
    css.lastIndexOf(';', openIdx),
    css.lastIndexOf('*/', openIdx)
  );
  const selectorStart = prevClose + 1;
  const selectorText = css.slice(selectorStart, openIdx);
  // Match #back-to-top (but NOT #sf21-back-to-top)
  const isLegacyBackTop = /#back-to-top\b/.test(selectorText) && !/#sf21-back-to-top/.test(selectorText);
  const isAtRule = selectorText.trim().startsWith('@');
  let depth = 1;
  let j = openIdx + 1;
  while (j < css.length && depth > 0) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') depth--;
    if (depth > 0) j++;
  }
  const closeIdx = j;
  if (isLegacyBackTop && !isAtRule) {
    out += css.slice(i, selectorStart);
    removed++;
    i = closeIdx + 1;
    while (i < css.length && /\s/.test(css[i])) i++;
  } else {
    out += css.slice(i, closeIdx + 1);
    i = closeIdx + 1;
  }
}

fs.writeFileSync(SRC, out);
console.log(`Stripped ${removed} #back-to-top rule(s) from styles.css`);
console.log(`Lines before: ${css.split('\n').length}, after: ${out.split('\n').length}`);
