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
import crypto from 'node:crypto';
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
 * ── REMOVING 'unsafe-inline' FROM script-src, BY HASHING WHAT IS ACTUALLY IN
 *    THE BUILD ──────────────────────────────────────────────────────────────
 *
 * `'unsafe-inline'` in `script-src` is the single largest hole a CSP can have:
 * it tells the browser to run ANY inline <script> it finds, which is precisely
 * what an injected one is. With it present, the rest of the policy is a
 * statement of intent rather than a defence against XSS.
 *
 * IT WAS THERE BECAUSE THE SITE DELIBERATELY INLINES SCRIPTS. Measured on
 * 2026-08-06: 16 distinct executable inline blocks across 45 documents, some
 * hand-written with a reason above them (the Ctrl/Cmd-K badge, the footer) and
 * some emitted by Astro, which inlines a bundled chunk when it is small.
 *
 * A NONCE IS NOT AVAILABLE, because a nonce must differ per response and this
 * is a static site on a CDN. HASHES are the static-site answer: the policy names
 * the SHA-256 of each script it permits, and the browser runs those and nothing
 * else. An injected script has a different hash and does not run.
 *
 * THE HASHES ARE COMPUTED HERE, FROM `dist`, ON EVERY BUILD, and that is the
 * only safe way to hold them. Astro's minified output changes whenever the
 * source does, so a hand-maintained list in `_headers` would be correct on the
 * day it was written and would silently break the site on the next build. This
 * runs after `astro build`, reads what was actually emitted, and rewrites the
 * directive. It is in THIS file rather than in a later gate because
 * `build:deploy` — the script Cloudflare Pages runs — includes this step and
 * stops before the gates, so anything written later would never reach
 * production.
 *
 * `type="application/ld+json"` IS NOT HASHED and does not need to be: a browser
 * does not execute it, so `script-src` does not govern it. `<script src>` is
 * covered by the origin allow-list already in the directive.
 *
 * `script-src-attr` GOES TO 'none'. That directive governs inline event handler
 * attributes (`onclick="..."`), and the build contains none, so permitting them
 * bought nothing and allowed the most common injected-payload shape.
 */
function inlineScriptHashes() {
  const html = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (path.extname(entry.name).toLowerCase() === '.html') html.push(full);
    }
  })(DIST);

  const hashes = new Set();
  const tag = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const file of html) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = tag.exec(text))) {
      const attrs = m[1] || '';
      const body = m[2];
      if (/\ssrc\s*=/i.test(attrs)) continue;
      if (/type\s*=\s*["']application\/(ld\+json|json)["']/i.test(attrs)) continue;
      if (!body.trim()) continue;
      hashes.add(`'sha256-${crypto.createHash('sha256').update(body, 'utf8').digest('base64')}'`);
    }
  }
  return { hashes: [...hashes].sort(), documents: html.length };
}

const headersPath = path.join(DIST, '_headers');
const { hashes, documents } = inlineScriptHashes();

if (hashes.length === 0) {
  console.error('cf-config: found no inline scripts to hash, which cannot be right. Refusing to weaken the policy silently.');
  process.exit(1);
}

/*
 * LINE BY LINE, AND ONLY THE POLICY LINE. This file explains itself at length
 * in comments, and several of them contain the words `script-src` and
 * `unsafe-inline` while discussing the policy. A document-wide replace rewrote
 * the prose as well as the header on the first attempt and produced a directive
 * reading "script-src + connect-src". Only a line whose first token is
 * `Content-Security-Policy:` is a policy.
 */
const lines = fs.readFileSync(headersPath, 'utf8').split('\n');
let rewrote = 0;

const patched = lines.map((line) => {
  if (!/^\s*Content-Security-Policy:/i.test(line)) return line;
  let out = line;
  /* `script-src ` keeps its trailing space so `script-src-attr` is untouched. */
  out = out.replace(/(script-src )([^;]*)/, (whole, key, value) =>
    value.includes("'unsafe-inline'") ? key + value.replace("'unsafe-inline'", hashes.join(' ')) : whole
  );
  out = out.replace(/script-src-attr [^;]*/, "script-src-attr 'none'");
  if (out !== line) rewrote += 1;
  return out;
});

const headerText = patched.join('\n');
const policies = patched.filter((l) => /^\s*Content-Security-Policy:/i.test(l));

if (rewrote === 0) {
  console.error("cf-config: no Content-Security-Policy line was rewritten. Expected 'unsafe-inline' in script-src.");
  process.exit(1);
}
if (policies.some((l) => /script-src [^;]*'unsafe-inline'/.test(l))) {
  console.error("cf-config: 'unsafe-inline' survived in script-src after rewriting.");
  process.exit(1);
}
if (policies.some((l) => !/script-src [^;]*sha256-/.test(l))) {
  console.error('cf-config: a policy line carries no script hash after rewriting.');
  process.exit(1);
}
fs.writeFileSync(headersPath, headerText);
console.log(
  `cf-config: script-src hardened, ${hashes.length} inline script hash(es) from ${documents} documents, 'unsafe-inline' removed`
);

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
