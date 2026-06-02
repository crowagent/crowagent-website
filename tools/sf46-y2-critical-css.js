#!/usr/bin/env node
/**
 * SF46 Y2 — Critical-CSS rollout.
 *
 * Injects a minimal inline <style> block in <head> on every HTML page
 * that doesn't already have one. The block covers above-the-fold tokens
 * + hero/page-title typography + nav-height reservation. Prevents FOUC
 * during the styles.min.css load.
 *
 * Idempotent: skips files that already have an inline `<style>:root{...}`.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Compact critical-CSS — every page archetype. ~1KB.
const CRITICAL = `<style>:root{--bg:#040E1A;--surf:#0A1F3A;--surf2:#0D2847;--teal:#0CC9A8;--teal-d:#0AA88C;--cloud:#E8F0FA;--steel:#B8CCE0;--mist:#8A9DB8;--border2:rgba(12,201,168,.20)}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body{background:var(--bg);color:var(--cloud);min-height:100vh;max-width:100vw;overflow-x:hidden}html{font-family:'Inter','Plus Jakarta Sans',sans-serif;scroll-behavior:smooth}body{font-family:'Inter',sans-serif;font-size:16px;line-height:1.7;padding-top:64px}a{color:inherit;text-decoration:none}img,picture{max-width:100%;height:auto;display:block}.skip-link,.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.skip-link:focus{position:static;width:auto;height:auto;padding:12px 20px;margin:0;overflow:visible;clip:auto;background:var(--teal);color:var(--bg);font-weight:700;display:block;text-align:center;z-index:9999}.wrap,.container,.container-wide{max-width:1400px;margin:0 auto;padding:0 clamp(20px,5vw,64px)}#ca-nav{min-height:72px;display:block}.hero{position:relative;padding:80px 0 60px;text-align:center}.hero h1,.page-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(2.8rem,1.5rem + 5vw,4.6rem);font-weight:800;line-height:1.15;letter-spacing:-.03em;color:var(--cloud);margin-bottom:12px}.hero p,.hero-sub{font-family:'Inter',sans-serif;font-size:clamp(1rem,1.8vw,1.15rem);color:var(--steel);max-width:760px;margin:0 auto 16px;line-height:1.6}.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:700;border-radius:8px;text-decoration:none;padding:14px 32px;font-size:15px}.btn-primary-v2,.sv-btn-v2{background:linear-gradient(180deg,var(--teal) 0%,var(--teal-d) 100%);color:var(--bg);box-shadow:0 2px 4px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.25)}</style>`;

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || ['node_modules','tests','_archive','_drafts','coverage','playwright-report','hero-options'].includes(f)) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

const SENTINEL = /<style>\s*:root\s*\{/;

let added = 0, alreadyHad = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  if (SENTINEL.test(src)) { alreadyHad++; continue; }
  if (!/<\/head>/.test(src)) continue;
  // Inject as the FIRST inline <style> in head so it paints before
  // styles.min.css finishes downloading.
  const headOpen = src.indexOf('<head>');
  if (headOpen < 0) continue;
  const afterCharset = src.indexOf('>', src.indexOf('<meta charset', headOpen)) + 1;
  if (afterCharset > 0) {
    src = src.slice(0, afterCharset) + '\n' + CRITICAL + src.slice(afterCharset);
  } else {
    src = src.replace('</head>', CRITICAL + '\n</head>');
  }
  fs.writeFileSync(file, src);
  added++;
}
console.log(`Y2 critical-CSS: added on ${added} pages | already had on ${alreadyHad}`);
