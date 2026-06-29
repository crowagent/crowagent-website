// SF46 Phase 1 B6 — sweep brand-color hex inside HTML <style> blocks.
//
// Only replaces hex VALUES (not selectors) that map to canonical brand tokens.
// VS Code / GitHub Primer theme colors (used in code/IDE mockups) are NOT in
// the token map, so they stay verbatim — by design.
//
// Skips: <style>...</style> blocks ONLY scoped; outside-style hex is left
// alone (different B-task). Inside <style> blocks also: comments and url().

const fs = require('fs');
const path = require('path');

const TOKEN_MAP = {
  // Brand surfaces
  '#040E1A': 'var(--bg)',
  '#0A1F3A': 'var(--surf)',
  '#0D2847': 'var(--surf2)',
  '#0F2D52': 'var(--surf3)',
  '#122F55': 'var(--surf4)',
  // Drift navy variants (collapse to canonical)
  '#050E1A': 'var(--bg)',
  '#05101E': 'var(--bg)',
  '#0A1422': 'var(--bg)',
  '#0A1628': 'var(--bg)',
  '#0F2240': 'var(--surf2)',
  '#102840': 'var(--surf2)',
  '#122A4E': 'var(--surf3)',
  // Teal family
  '#0CC9A8': 'var(--teal)',
  '#0CC9A9': 'var(--teal)',
  '#0CC9AB': 'var(--teal)',
  '#10DFBB': 'var(--teal)',
  '#00D4AA': 'var(--teal)',
  '#0AA88C': 'var(--teal-d)',
  '#0AA88A': 'var(--teal-d)',
  '#07A386': 'var(--teal-d)',
  // Text scale
  '#E8F0FA': 'var(--cloud)',
  '#E4ECF7': 'var(--cloud)',
  '#E7ECF2': 'var(--cloud)',
  '#E8EEF7': 'var(--cloud)',
  '#F4F7FB': 'var(--cloud)',
  '#B8CCE0': 'var(--steel)',
  '#8A9DB8': 'var(--mist)',
  // Semantic
  '#F59E0B': 'var(--warn)',
  '#EF4444': 'var(--err)',
  '#22C55E': 'var(--success)',
  // Accents
  '#C2FF57': 'var(--lime)',
  '#5BC8FF': 'var(--sky)',
  '#DAA520': 'var(--gold)',
  '#A78BFA': 'var(--mark)',
  '#F87171': 'var(--coral)',
};

const lookup = {};
for (const [k, v] of Object.entries(TOKEN_MAP)) lookup[k.toUpperCase()] = v;

function isInsideRoot(text, idx) {
  let depth = 0;
  for (let i = idx - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === '}') depth++;
    else if (ch === '{') {
      if (depth === 0) {
        let selStart = i;
        for (let j = i - 1; j >= 0; j--) {
          if (text[j] === '}' || text[j] === ';') { selStart = j + 1; break; }
          if (j === 0) { selStart = 0; break; }
        }
        const sel = text.slice(selStart, i).trim();
        // Strip block comments inside the candidate selector text before checking
        const cleaned = sel.replace(/\/\*[\s\S]*?\*\//g, '');
        return /(^|[\s,])\:root\b/.test(cleaned);
      }
      depth--;
    }
  }
  return false;
}

function isInsideUrl(text, idx) {
  const before = text.slice(0, idx);
  const lastUrl = before.lastIndexOf('url(');
  if (lastUrl === -1) return false;
  const closeAfter = text.indexOf(')', lastUrl);
  return closeAfter !== -1 && closeAfter > idx;
}

function isInsideComment(text, idx) {
  const before = text.slice(0, idx);
  const lastOpen = before.lastIndexOf('/*');
  if (lastOpen === -1) return false;
  const lastClose = before.lastIndexOf('*/');
  return lastClose < lastOpen;
}

function isInsideAttrSelector(text, idx) {
  const before = text.slice(Math.max(0, idx - 50), idx);
  if (/[=]\s*["']\s*$/.test(before)) return true;
  return false;
}

function sweepStyleBlock(block) {
  const HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  let out = '';
  let lastIdx = 0;
  let m;
  let replaced = 0;
  while ((m = HEX_RE.exec(block)) !== null) {
    const idx = m.index;
    if (isInsideComment(block, idx)) continue;
    if (isInsideRoot(block, idx)) continue;
    if (isInsideUrl(block, idx)) continue;
    if (isInsideAttrSelector(block, idx)) continue;
    const hex = m[0].toUpperCase();
    const replacement = lookup[hex];
    if (!replacement) continue;
    out += block.slice(lastIdx, idx) + replacement;
    lastIdx = idx + m[0].length;
    replaced++;
  }
  out += block.slice(lastIdx);
  return { out, replaced };
}

function sweepFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const STYLE_BLOCK_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let out = '';
  let lastIdx = 0;
  let m;
  let total = 0;
  while ((m = STYLE_BLOCK_RE.exec(src)) !== null) {
    const openTagEnd = m.index + m[0].indexOf('>') + 1;
    const closeTagStart = m.index + m[0].lastIndexOf('</style');
    const block = src.slice(openTagEnd, closeTagStart);
    const r = sweepStyleBlock(block);
    out += src.slice(lastIdx, openTagEnd) + r.out;
    lastIdx = closeTagStart;
    total += r.replaced;
  }
  out += src.slice(lastIdx);
  return { out, replaced: total, originalLen: src.length, newLen: out.length };
}

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '_archive', 'debug-screenshots', 'test-results', '.git', 'tests', 'scripts', 'tools'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const apply = process.argv.includes('--apply');
const files = walkHtml('.');

let total = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const r = sweepFile(f);
  if (r.replaced === 0) continue;
  total += r.replaced;
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}  replaced=${r.replaced}  size: ${r.originalLen} -> ${r.newLen}`);
  if (apply) fs.writeFileSync(f, r.out);
}
console.log(`\nTotal: ${total}  (mode=${apply ? 'apply' : 'dry-run'})`);
