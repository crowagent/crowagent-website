/**
 * copy-cf-config.js — carry the Cloudflare Pages config into the Astro build.
 *
 * THE GAP THIS CLOSES. `astro/dist` contained none of `_headers`, `_redirects`
 * or `robots.txt`. At cutover the site would have lost, in one deploy:
 *
 *   - every security header — CSP, HSTS, X-Frame-Options, Referrer-Policy,
 *     Permissions-Policy, X-Content-Type-Options;
 *   - all 82 redirect rules, so every legacy `.html` URL would 404;
 *   - robots.txt, including its Sitemap: line.
 *
 * Larger than the missing sitemap, and invisible from inside Astro: nothing in
 * the framework knows those files are the deployment contract.
 *
 * COPIED, NOT FORKED. The security headers have a long and carefully argued
 * history — the Google Fonts origins removed from CSP after fonts were
 * self-hosted, the `!` unsets that exist because Pages CONCATENATES a header
 * rather than overriding it. Maintaining a second copy would mean that
 * reasoning drifting out of step within a release or two. One source; this
 * appends to it.
 *
 * WHAT IS APPENDED, AND WHY IT IS SAFE. Astro emits content-hashed assets under
 * `/_assets/`, a path no existing rule covers, so those files would inherit the
 * catch-all's `max-age=0`. A content-hashed filename can be cached immutably by
 * definition: change the bytes and the name changes. The `!` unsets mirror the
 * existing `/Assets/*` block for the same measured reason recorded there.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const REPO_ROOT = path.join(__dirname, '..', '..');

const FILES = ['_headers', '_redirects', 'robots.txt'];

/**
 * Immutable caching for Astro's content-hashed output. Appended rather than
 * edited into the shared file, so the legacy build never sees a path it does
 * not emit.
 */
const ASTRO_HEADERS = `

# ─────────────────────────────────────────────────────────────────────────────
# APPENDED BY astro/scripts/copy-cf-config.js — do not edit here.
#
# Astro emits content-hashed assets under /_assets/. No rule above covers that
# path, so without this block they inherit the catch-all's max-age=0 and are
# revalidated on every navigation despite being immutable by construction: the
# filename contains a hash of the bytes, so a change produces a new URL.
#
# The \`!\` unsets are required for the same measured reason recorded on the
# /Assets/* block: Cloudflare Pages CONCATENATES a header when an earlier rule
# already set it, rather than overriding it, so without them the response
# carries two conflicting cache directives.
# ─────────────────────────────────────────────────────────────────────────────
/_assets/*
  ! Cache-Control
  ! CDN-Cache-Control
  ! Surrogate-Control
  Cache-Control: public, max-age=31536000, immutable
`;

const missing = FILES.filter((f) => !fs.existsSync(path.join(REPO_ROOT, f)));
if (missing.length) {
  console.error(`cf-config: missing at repo root: ${missing.join(', ')}`);
  process.exit(1);
}

for (const file of FILES) {
  const source = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
  const content = file === '_headers' ? source + ASTRO_HEADERS : source;
  fs.writeFileSync(path.join(DIST, file), content, 'utf8');
}

/*
 * Verify rather than assume. A silently empty _headers is a site with no CSP,
 * and it looks exactly like a site with one until somebody checks a response.
 */
const checks = [
  ['_headers', /Content-Security-Policy:/, 'a CSP directive'],
  ['_headers', /^\/_assets\/\*$/m, 'the appended /_assets/* block'],
  ['_redirects', /^\/[^\s]+\s+\/[^\s]+\s+30\d/m, 'at least one redirect rule'],
  ['robots.txt', /^Sitemap:\s*https:\/\//m, 'the Sitemap line'],
];

const failures = [];
for (const [file, pattern, label] of checks) {
  const written = fs.readFileSync(path.join(DIST, file), 'utf8');
  if (!pattern.test(written)) failures.push(`${file} is missing ${label}`);
}

if (failures.length) {
  failures.forEach((f) => console.error(`cf-config: ${f}`));
  process.exit(1);
}

const rules = fs
  .readFileSync(path.join(DIST, '_redirects'), 'utf8')
  .split('\n')
  .filter((l) => l.trim() && !l.trim().startsWith('#')).length;

console.log(`cf-config: _headers, _redirects (${rules} rules) and robots.txt copied into dist`);
