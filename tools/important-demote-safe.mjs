// ARCH-3 Pass 2 — safe selective !important demoter.
// For each !important declaration in target file, only demote if NO OTHER
// CSS file declares the same property for the same selector with !important.
// Conservative: keeps any !important where competition exists.
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';

const TARGETS = process.argv.slice(2);
if (TARGETS.length === 0) {
  console.error('Usage: node tools/important-demote-safe.mjs <file1.css> [file2.css...]');
  process.exit(1);
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules','coverage','playwright-report','tests','test-results','.git','_archive','snapshots','.kiro','audit','remediation'].includes(f)) continue;
      walk(full, out);
    } else if (f.endsWith('.css') && !f.endsWith('.min.css')) out.push(full);
  }
  return out;
}

const allCss = walk('.');

// Step 1: build index of all `!important` declarations across the codebase
// Key = `selector|prop`, Value = array of {file, isLayered}
const importantIndex = new Map();
for (const f of allCss) {
  const css = fs.readFileSync(f, 'utf8');
  try {
    const root = postcss.parse(css);
    let currentLayer = null;
    root.walkAtRules('layer', (atrule) => {
      if (atrule.nodes) currentLayer = atrule.params || 'unnamed';
    });
    root.walkRules((rule) => {
      // Detect if rule is inside @layer
      let parent = rule.parent;
      let inLayer = false;
      while (parent) {
        if (parent.type === 'atrule' && parent.name === 'layer') { inLayer = true; break; }
        parent = parent.parent;
      }
      const selectors = rule.selector.split(',').map(s => s.trim());
      rule.walkDecls((decl) => {
        if (decl.important) {
          for (const sel of selectors) {
            const key = `${sel}|${decl.prop}`;
            if (!importantIndex.has(key)) importantIndex.set(key, []);
            importantIndex.get(key).push({ file: f, isLayered: inLayer });
          }
        }
      });
    });
  } catch (_) { /* skip parse errors */ }
}

// Step 2: for each TARGET file, classify each !important as SAFE/KEEP
for (const target of TARGETS) {
  console.log(`\n=== Auditing ${target} ===`);
  if (!fs.existsSync(target)) { console.error(`  MISSING: ${target}`); continue; }
  const css = fs.readFileSync(target, 'utf8');
  let root;
  try { root = postcss.parse(css); }
  catch (e) { console.error(`  PARSE ERROR: ${e.message}`); continue; }

  const verdicts = [];  // { selector, prop, verdict }
  let safe = 0, keep = 0;
  root.walkRules((rule) => {
    const selectors = rule.selector.split(',').map(s => s.trim());
    rule.walkDecls((decl) => {
      if (decl.important) {
        let allSafe = true;
        for (const sel of selectors) {
          const key = `${sel}|${decl.prop}`;
          const competitors = (importantIndex.get(key) || []).filter(c => c.file !== target);
          // If ANY other file declares same selector|prop with !important, KEEP
          if (competitors.length > 0) { allSafe = false; break; }
        }
        verdicts.push({ rule, decl, selectors: selectors.join(','), prop: decl.prop, verdict: allSafe ? 'SAFE' : 'KEEP' });
        if (allSafe) safe++; else keep++;
      }
    });
  });

  console.log(`  Total !important: ${safe + keep}  |  SAFE: ${safe}  |  KEEP: ${keep}`);

  // Step 3: rewrite only SAFE ones
  if (process.argv.includes('--apply')) {
    let demoted = 0;
    for (const v of verdicts) {
      if (v.verdict === 'SAFE') { v.decl.important = false; demoted++; }
    }
    fs.writeFileSync(target, root.toResult().css);
    console.log(`  --apply: demoted ${demoted} declarations in ${target}`);
  } else {
    console.log(`  (dry-run; pass --apply to demote SAFE declarations)`);
  }
}
