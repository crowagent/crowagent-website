#!/usr/bin/env node
/* TAILWIND ARBITRARY-VALUE -> THEME-UTILITY MIGRATION (2026-06-01, Stage 3)
 * Replaces  bg-[#0CC9A8]  with  bg-ca-teal  etc. inside HTML class attributes only.
 * Lossless: each theme token (@theme --color-ca-*) is the identical hex, so Tailwind
 * compiles the same colour. One-off colours (mac traffic lights, Dracula code theme,
 * goldenrod) are intentionally LEFT inline per token best-practice.
 */
const fs = require('fs');
const path = require('path');

// hex (lowercase) -> theme colour name. Only brand/system colours with @theme tokens.
const MAP = {
  '0cc9a8': 'ca-teal',
  '040e1a': 'ca-bg',
  '000212': 'ca-bg-deep',
  '1e3a58': 'ca-line',
  'a78bfa': 'ca-mark',
  'c2ff57': 'ca-lime',
  'b8cce0': 'ca-steel',
  '0a1f3a': 'ca-surf',
  '0d2847': 'ca-surf2',
  '0f2d52': 'ca-surf3',
  '0aa88c': 'ca-teal-d',
  'e8f0fa': 'ca-cloud',
  '8a9db8': 'ca-mist',
};

function walk(d) {
  let out = [];
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'tests'].includes(f.name) || f.name.startsWith('.')) continue;
    const p = path.join(d, f.name);
    if (f.isDirectory()) out = out.concat(walk(p));
    else if (f.name.endsWith('.html') && !/mock-|concept-|sample-|-original/.test(f.name)) out.push(p);
  }
  return out;
}

// replace -[#hex] with -caToken, only for mapped hexes
function migrateClassValue(cls) {
  return cls.replace(/-\[#([0-9A-Fa-f]{6})\]/g, (m, hex) => {
    const tok = MAP[hex.toLowerCase()];
    return tok ? '-' + tok : m;   // leave one-offs untouched
  });
}

let totalRepls = 0, filesChanged = 0;
const dryRun = process.argv.includes('--dry');
for (const file of walk('.')) {
  const src = fs.readFileSync(file, 'utf8');
  let n = 0;
  // operate ONLY inside class="..." / class='...'
  const out = src.replace(/class=("|')(.*?)\1/gs, (full, q, body) => {
    const migrated = migrateClassValue(body);
    if (migrated !== body) {
      n += (body.match(/-\[#([0-9A-Fa-f]{6})\]/g) || []).filter(x => MAP[x.slice(2, 8).toLowerCase()]).length;
    }
    return 'class=' + q + migrated + q;
  });
  if (out !== src) {
    totalRepls += n; filesChanged++;
    if (!dryRun) fs.writeFileSync(file, out);
  }
}
console.log((dryRun ? '[DRY] ' : '') + 'Migrated ' + totalRepls + ' arbitrary-value hexes to theme utilities across ' + filesChanged + ' HTML files.');
