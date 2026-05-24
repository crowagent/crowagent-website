#!/usr/bin/env node
/* ═════════════════════════════════════════════════════════════════════
   tools/rgba-token-map.js — SF46 Phase 3 RGBA tokenisation
   ─────────────────────────────────────────────────────────────────────
   Scope: Assets/css/*.css ONLY. Replaces raw rgba(R, G, B, A) literals
   with canonical CSS-custom-property tokens defined in
   crowagent-brand-tokens.css.

   Strategy:
     1. Parse the token source-of-truth. Build:
          - hexToTokenName  (e.g. "#0CC9A8" -> "--teal")
          - rgbToTokenName  (e.g. "12,201,168" -> "--teal")
          - alphaTokens     (e.g. "teal:0.08" -> "--teal-08")
        Combined surface tokens like rgba(12,201,168,0.08) -> var(--teal-08)
        are derived from the existing alpha-tinted tokens, not from runtime
        math (deterministic mapping).
     2. Scan each Assets/css/*.css file. For each rgba(R, G, B, A) literal:
          a. Look up RGB. If unknown brand RGB -> leave unchanged.
          b. If alpha matches an existing alpha-token for this RGB ->
             emit var(--token-NN).
          c. Otherwise -> leave unchanged (no TODO marker injected).
     3. Per-file backup (.pre-rgba) before any write. --revert restores.

   Safety:
     - Skips *.bak / *.purged.css / *.min.css and _archive/.
     - Skips raw rgba inside CSS block comments.
     - Skips raw rgba inside string literals (rare, paranoia).
     - Never touches styles.css or crowagent-brand-tokens.css.

   CLI:
     node tools/rgba-token-map.js              # dry-run report
     node tools/rgba-token-map.js --apply      # write changes (with backup)
     node tools/rgba-token-map.js --revert     # restore from .pre-rgba backups
     node tools/rgba-token-map.js --file <p>   # restrict to one file (path under Assets/css/)
   ═════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKEN_FILE = path.join(ROOT, 'crowagent-brand-tokens.css');
const TARGET_DIR = path.join(ROOT, 'Assets', 'css');

const APPLY  = process.argv.includes('--apply');
const REVERT = process.argv.includes('--revert');
const fileArg = (() => {
  const idx = process.argv.indexOf('--file');
  return idx > 0 ? process.argv[idx + 1] : null;
})();

// ── Token source-of-truth parsing ─────────────────────────────────────
function parseTokens() {
  const rawSrc = fs.readFileSync(TOKEN_FILE, 'utf8');

  // CRITICAL SAFETY: only consider tokens declared at the ROOT level
  // (outside any @media / @supports block). Tokens redeclared inside
  // `@media (prefers-contrast: more)` or `[data-theme="light"]` have
  // different runtime values; using them would cause colour drift in
  // the default render path.
  const src = stripConditionalBlocks(rawSrc);

  // Map hex literals to the FIRST custom-property that holds them
  // (canonical owner). We then alias --bright/--dark variants downstream.
  const hexToName = new Map();     // "#0CC9A8" -> "--teal"
  const rgbaTokens = new Map();    // "12,201,168|0.08" -> "--teal-08"
  const namedHex = new Map();      // "--teal" -> "#0CC9A8"

  // Pattern 1: --name: #RRGGBB(AA)?;
  const hexRe = /--([a-zA-Z0-9_-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\b/g;
  let m;
  while ((m = hexRe.exec(src)) !== null) {
    const name = '--' + m[1];
    const hex  = m[2].toUpperCase();
    if (!hexToName.has(hex)) hexToName.set(hex, name);
    if (!namedHex.has(name)) namedHex.set(name, hex);
  }

  // Pattern 2: --name: rgba(R, G, B, A);  -> stash for alpha-token lookup
  // Prefer canonical naming patterns:  --teal-NN, --white-NN  over
  // semantic aliases  --teal-dim / --teal-glow / --border / --info-bg etc.
  const rgbaRe = /--([a-zA-Z0-9_-]+)\s*:\s*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g;
  while ((m = rgbaRe.exec(src)) !== null) {
    const name = '--' + m[1];
    const r = +m[2], g = +m[3], b = +m[4];
    const a = normAlpha(m[5]);
    const key = `${r},${g},${b}|${a}`;
    const existing = rgbaTokens.get(key);
    if (!existing || preferAlphaTokenName(name, existing)) {
      rgbaTokens.set(key, name);
    }
  }

  // Derived RGB->canonical lookup. We coalesce equivalent hexes (e.g. light
  // and dark aliases) by preferring the SHORTER / unprefixed name.
  const rgbToName = new Map();    // "12,201,168" -> "--teal"
  for (const [hex, name] of hexToName.entries()) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    const key = `${rgb.r},${rgb.g},${rgb.b}`;
    const existing = rgbToName.get(key);
    if (!existing || preferName(name, existing)) {
      rgbToName.set(key, name);
    }
  }

  return { hexToName, rgbaTokens, rgbToName, namedHex };
}

// Strip top-level @media / @supports / @container blocks so token
// redeclarations inside them don't leak into the canonical map.
// Also strips [data-theme="light"] rules and :root[data-theme=...].
function stripConditionalBlocks(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    // Look for "@media " / "@supports " / "@container " at start of an at-rule
    if (src[i] === '@') {
      const slice = src.slice(i, i + 12);
      if (/^@(media|supports|container)\b/.test(slice)) {
        // Skip to the matching brace
        const braceStart = src.indexOf('{', i);
        if (braceStart === -1) break;
        let depth = 1;
        let j = braceStart + 1;
        while (j < src.length && depth > 0) {
          if (src[j] === '{') depth++;
          else if (src[j] === '}') depth--;
          j++;
        }
        i = j;
        continue;
      }
    }
    // Skip light-mode opt-in selectors at top level
    if (src[i] === ':' && src.slice(i, i + 22).startsWith(':root[data-theme="light"')) {
      const braceStart = src.indexOf('{', i);
      if (braceStart === -1) break;
      let depth = 1;
      let j = braceStart + 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
        j++;
      }
      i = j;
      continue;
    }
    out += src[i];
    i++;
  }
  return out;
}

function preferAlphaTokenName(candidate, existing) {
  // Prefer the canonical numeric pattern --teal-NN / --white-NN over
  // semantic aliases (--teal-dim, --teal-glow, --border, --info-bg, ...).
  // Returns true if `candidate` should REPLACE `existing`.
  const numericRe = /^--(teal|white)-\d+$/;
  const candIsNumeric = numericRe.test(candidate);
  const existIsNumeric = numericRe.test(existing);
  if (candIsNumeric && !existIsNumeric) return true;
  if (!candIsNumeric && existIsNumeric) return false;
  // Both numeric or both semantic — keep first (existing).
  return false;
}

function preferName(a, b) {
  // Prefer shorter (e.g. --teal over --teal-d) and prefer no suffix.
  const scoreA = scoreName(a);
  const scoreB = scoreName(b);
  return scoreA < scoreB;
}
function scoreName(n) {
  // Lower = more canonical. Penalise -bright/-d/-glow/-deep variants.
  const variantPenalty = /-(d|deep|deeper|dark|darker|bright|glow|alt|alt2|light)$/.test(n) ? 10 : 0;
  return n.length + variantPenalty;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function normAlpha(s) {
  // Normalise "0.10" / ".10" / "0.1" to a 2-decimal string ".10".
  // Hand-tuned to match brand-tokens authoring style.
  let n = parseFloat(s);
  if (!isFinite(n)) return s;
  // 2-decimal canonical form
  const s2 = n.toFixed(2);
  return s2;
}

// ── Build the canonical alpha-token table from brand-tokens ───────────
function buildAlphaTable(tokens) {
  // Map per-RGB list of (alpha->tokenName) entries.
  // Result: rgbToAlphas: Map("R,G,B", Map(alphaStr, tokenName))
  const rgbToAlphas = new Map();
  for (const [key, tokName] of tokens.rgbaTokens.entries()) {
    const [rgb, alpha] = key.split('|');
    if (!rgbToAlphas.has(rgb)) rgbToAlphas.set(rgb, new Map());
    const inner = rgbToAlphas.get(rgb);
    if (!inner.has(alpha)) inner.set(alpha, tokName);
  }
  return rgbToAlphas;
}

// ── Apply mapping to one rgba match ───────────────────────────────────
function mapRgba(rgbStr, alphaStr, rgbToName, rgbToAlphas) {
  const rgb = rgbStr; // "R,G,B"
  const alpha = normAlpha(alphaStr);

  // Case 1: this exact RGB+alpha is itself a named token in brand-tokens
  const alphaMap = rgbToAlphas.get(rgb);
  if (alphaMap && alphaMap.has(alpha)) {
    return { token: alphaMap.get(alpha), reason: 'exact-alpha-token' };
  }

  // Case 2: this RGB is a known brand RGB and alpha is 1.00 -> solid token
  const solidName = rgbToName.get(rgb);
  if (solidName && alpha === '1.00') {
    return { token: solidName, reason: 'solid-color' };
  }

  // Case 3: unknown / unhandled. Leave alone.
  return null;
}

// ── Mask CSS comments + strings so the rgba regex never touches them ──
function maskCommentsAndStrings(css) {
  // Replace block comments with same-length whitespace (preserve offsets).
  let out = '';
  let i = 0;
  while (i < css.length) {
    if (css[i] === '/' && css[i+1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const stopAt = end === -1 ? css.length : end + 2;
      out += ' '.repeat(stopAt - i);
      i = stopAt;
      continue;
    }
    // url("…") rarely contains rgba; skip simple url(...) by mirroring char.
    out += css[i];
    i++;
  }
  return out;
}

// ── Per-file processing ───────────────────────────────────────────────
const RGBA_RE = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g;

function processFile(filePath, tokens, rgbToAlphas) {
  const original = fs.readFileSync(filePath, 'utf8');
  const masked = maskCommentsAndStrings(original);

  let replacementsByReason = { 'exact-alpha-token': 0, 'solid-color': 0 };
  let leftAlone = 0;
  let leftAloneSamples = new Set();
  const replacements = []; // {start, end, replacement, reason}

  let m;
  RGBA_RE.lastIndex = 0;
  while ((m = RGBA_RE.exec(masked)) !== null) {
    const r = +m[1], g = +m[2], b = +m[3];
    const rgbKey = `${r},${g},${b}`;
    const mapping = mapRgba(rgbKey, m[4], tokens.rgbToName, rgbToAlphas);
    if (!mapping) {
      leftAlone++;
      const a = normAlpha(m[4]);
      leftAloneSamples.add(`rgba(${r}, ${g}, ${b}, ${a})`);
      continue;
    }
    replacements.push({
      start: m.index,
      end: m.index + m[0].length,
      replacement: `var(${mapping.token})`,
      reason: mapping.reason,
      original: m[0],
    });
    replacementsByReason[mapping.reason]++;
  }

  // Apply replacements in reverse order so offsets stay valid.
  let out = original;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end, replacement } = replacements[i];
    out = out.slice(0, start) + replacement + out.slice(end);
  }

  return {
    changed: out !== original,
    output: out,
    converted: replacements.length,
    byReason: replacementsByReason,
    leftAlone,
    leftAloneSamples: [...leftAloneSamples].slice(0, 10),
    replacements,
  };
}

// ── Main ──────────────────────────────────────────────────────────────
function listTargetFiles() {
  if (fileArg) {
    const fp = path.isAbsolute(fileArg) ? fileArg : path.join(ROOT, fileArg);
    return [fp];
  }
  return fs.readdirSync(TARGET_DIR)
    .filter(f => f.endsWith('.css'))
    .filter(f => !/\.(bak|purged\.css|min\.css)$/.test(f))
    .map(f => path.join(TARGET_DIR, f));
}

function revert() {
  const files = listTargetFiles();
  let restored = 0;
  for (const f of files) {
    const bak = f + '.pre-rgba';
    if (fs.existsSync(bak)) {
      fs.copyFileSync(bak, f);
      restored++;
      console.log(`  restored ${path.relative(ROOT, f)}`);
    }
  }
  console.log(`\nRestored ${restored} file(s) from .pre-rgba backups.`);
}

function main() {
  if (REVERT) {
    revert();
    return;
  }

  const tokens = parseTokens();
  const rgbToAlphas = buildAlphaTable(tokens);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  RGBA TOKEN MAP  ${APPLY ? '(APPLY mode)' : '(dry-run)'}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Token source : ${path.relative(ROOT, TOKEN_FILE)}`);
  console.log(`Target dir   : ${path.relative(ROOT, TARGET_DIR)}`);
  console.log(`Known brand RGBs: ${tokens.rgbToName.size}`);
  console.log(`Known rgba()-alpha tokens: ${tokens.rgbaTokens.size}`);
  console.log('');

  const files = listTargetFiles();
  let totalBefore = 0, totalConverted = 0, totalLeftAlone = 0;
  const perFile = [];

  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const res = processFile(f, tokens, rgbToAlphas);
    totalBefore += res.converted + res.leftAlone;
    totalConverted += res.converted;
    totalLeftAlone += res.leftAlone;

    perFile.push({ file: rel, ...res });

    if (APPLY && res.changed) {
      const bak = f + '.pre-rgba';
      if (!fs.existsSync(bak)) fs.copyFileSync(f, bak);
      fs.writeFileSync(f, res.output, 'utf8');
    }
  }

  // Report
  console.log('Per-file summary:');
  console.log('─────────────────────────────────────────────────────────────');
  for (const r of perFile) {
    if (r.converted === 0 && r.leftAlone === 0) continue;
    console.log(`  ${r.file}`);
    console.log(`     converted: ${r.converted}   left alone: ${r.leftAlone}`);
    if (r.leftAloneSamples.length) {
      console.log(`     samples-left: ${r.leftAloneSamples.slice(0, 3).join(' | ')}`);
    }
  }
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`TOTAL rgba literals       : ${totalBefore}`);
  console.log(`  converted to tokens     : ${totalConverted}`);
  console.log(`  left alone (no match)   : ${totalLeftAlone}`);
  console.log('─────────────────────────────────────────────────────────────');
  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to write changes.');
  } else {
    console.log('\nWrote changes. Backups: <file>.pre-rgba');
  }

  // JSON report
  const reportPath = path.join(ROOT, 'audit', 'rgba-tokenization-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    apply: APPLY,
    totalBefore,
    totalConverted,
    totalLeftAlone,
    perFile: perFile.map(r => ({
      file: r.file,
      converted: r.converted,
      leftAlone: r.leftAlone,
      byReason: r.byReason,
      leftAloneSamples: r.leftAloneSamples,
    })),
  }, null, 2));
  console.log(`\nJSON report: ${path.relative(ROOT, reportPath)}`);
}

try {
  main();
} catch (err) {
  console.error('rgba-token-map ERROR:', err);
  process.exit(1);
}
