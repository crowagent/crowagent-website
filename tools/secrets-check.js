// S-5 — Pre-commit secrets scanner. Greps repo for credential patterns.
// Run via `node tools/secrets-check.js` or as a pre-commit hook.
const fs = require('fs');
const path = require('path');

const PATTERNS = [
  /-----BEGIN (RSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,                                  // AWS access key
  /aws_secret_access_key\s*[:=]\s*['"][a-zA-Z0-9/+]{40}['"]/i,
  /sk_live_[0-9a-zA-Z]{24,}/,                          // Stripe live secret
  /sk_test_[0-9a-zA-Z]{24,}/,                          // Stripe test secret (also flag)
  /[xX][oO][xX][bB]-[0-9]{11,}-[0-9a-zA-Z]{24,}/,      // Slack bot token
  /github_pat_[a-zA-Z0-9_]{82,}/,                      // GitHub PAT
  /ghp_[a-zA-Z0-9]{36,}/,                              // GitHub PAT v2
  /AIza[0-9A-Za-z-_]{35}/,                             // Google API key
  /[0-9]+-[0-9A-Za-z_-]{32}\.apps\.googleusercontent\.com/, // OAuth client
];

const SKIP = new Set(['node_modules','coverage','playwright-report','tests','test-results','.git','_archive','audit','remediation','dist','build','.claude']);

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) { if (SKIP.has(f)) continue; walk(full, out); }
    else if (/\.(js|mjs|cjs|html|css|json|md|yml|yaml|txt|env|ts)$/.test(f)) out.push(full);
  }
  return out;
}

const files = walk('.');
let hits = 0;
for (const f of files) {
  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
  for (const p of PATTERNS) {
    const m = content.match(p);
    if (m) {
      // Skip test-only files
      if (f.includes('test') || f.includes('Test')) continue;
      console.log(`HIT  ${f}  →  ${p}  →  "${m[0].slice(0, 30)}..."`);
      hits++;
    }
  }
}

if (hits > 0) { console.error(`\n${hits} secret pattern(s) detected — fix before commit.`); process.exit(1); }
else { console.log(`Secrets-check: ${files.length} files scanned, 0 hits. CLEAN.`); }
