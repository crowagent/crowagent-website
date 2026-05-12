#!/usr/bin/env node
/**
 * Lazy-load chatbot + lottie + storytelling modules behind idle/interaction triggers.
 * Removes direct <script> tags for 8 specific modules and inserts ONE lazy-loader
 * before </body> on every HTML page that referenced them.
 *
 * Idempotent: pages that already contain the lazy-loader-v91 marker are skipped.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'lazy-loader-v91-tbt-perf';

// Patterns that match the script tags we want to REMOVE (regardless of cache-bust version).
// Each pattern matches the entire <script ...></script> tag plus optional inline trailing
// HTML comment and the trailing newline so we don't leave blank lines.
const REMOVE_PATTERNS = [
  // /chatbot.js (with or without query string and trailing comment)
  /[ \t]*<script[^>]+src=["']\/?chatbot\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
  // lottie_light from cdnjs
  /[ \t]*<script[^>]+src=["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/bodymovin\/[^"']*lottie_light[^"']*["'][^>]*><\/script>[ \t]*\r?\n?/gi,
  // /js/modules/lottie-cta.js
  /[ \t]*<script[^>]+src=["']\/?js\/modules\/lottie-cta\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
  // /js/modules/sticky-storytelling.js
  /[ \t]*<script[^>]+src=["']\/?js\/modules\/sticky-storytelling\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
  // /js/modules/sticky-storytelling-content.js
  /[ \t]*<script[^>]+src=["']\/?js\/modules\/sticky-storytelling-content\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
  // /js/modules/hero-staggered-entrance.js
  /[ \t]*<script[^>]+src=["']\/?js\/modules\/hero-staggered-entrance\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
  // /js/modules/spotlight.js
  /[ \t]*<script[^>]+src=["']\/?js\/modules\/spotlight\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
  // /js/modules/page-features.js
  /[ \t]*<script[^>]+src=["']\/?js\/modules\/page-features\.js(?:\?[^"']*)?["'][^>]*><\/script>(?:[ \t]*<!--[^>]*-->)?\r?\n?/gi,
];

const LAZY_LOADER = `<!-- ${MARKER}: defer non-critical JS until idle/first-interaction (TBT perf, 2026-05-12).
     Replaces direct script tags for chatbot, lottie, storytelling, spotlight, hero-staggered, page-features. -->
<script>
(function(){
  var loaded = {};
  function loadScript(src, attrs){
    if(loaded[src]) return;
    loaded[src] = true;
    var s = document.createElement('script');
    s.src = src;
    if(attrs && attrs.integrity){ s.integrity = attrs.integrity; }
    if(attrs && attrs.crossorigin){ s.crossOrigin = attrs.crossorigin; }
    document.head.appendChild(s);
  }
  // Idle-time bundle (fires ~1-2s after first paint)
  var idleBundle = [
    '/js/modules/sticky-storytelling.js?v=91',
    '/js/modules/sticky-storytelling-content.js?v=91',
    '/js/modules/hero-staggered-entrance.js?v=91',
    '/js/modules/spotlight.js?v=91',
    '/js/modules/page-features.js?v=49'
  ];
  function loadIdle(){ idleBundle.forEach(function(u){ loadScript(u); }); }
  if('requestIdleCallback' in window){ requestIdleCallback(loadIdle, {timeout: 2000}); }
  else { setTimeout(loadIdle, 1500); }

  // Interaction-triggered bundle (chatbot + lottie animations — only when user actually engages)
  var interactionBundle = [
    '/chatbot.js?v=91',
    'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.13.0/lottie_light.min.js',
    '/js/modules/lottie-cta.js?v=91'
  ];
  function loadInteraction(){ interactionBundle.forEach(function(u){ loadScript(u); }); cleanup(); }
  var events = ['pointerdown','keydown','touchstart','scroll'];
  function cleanup(){ events.forEach(function(e){ window.removeEventListener(e, loadInteraction, {passive:true}); }); }
  events.forEach(function(e){ window.addEventListener(e, loadInteraction, {passive:true, once:false}); });
  // Safety net — fire after 4s regardless
  setTimeout(loadInteraction, 4000);
})();
</script>
`;

// Owned HTML pages currently referencing chatbot.js (excluding coverage/ + debug-screenshots/)
const TARGETS = [
  '404.html',
  'about.html',
  'changelog.html',
  'contact.html',
  'cookie-preferences.html',
  'cookies.html',
  'crowagent-core.html',
  'crowcash.html',
  'crowcyber.html',
  'crowesg.html',
  'crowmark.html',
  'csrd.html',
  'demo.html',
  'faq.html',
  'glossary/csrd.html',
  'glossary/epc-rating.html',
  'glossary/index.html',
  'glossary/mees-compliance.html',
  'glossary/ppn-002.html',
  'glossary/si-2015-962.html',
  'glossary/toms-framework.html',
  'index.html',
  'partners.html',
  'pricing.html',
  'privacy.html',
  'products/index.html',
  'resources.html',
  'roadmap.html',
  'security.html',
  'terms.html',
  'tools-csrd-checker-methodology.html',
  'tools-csrd-checker.html',
  'tools-cyber-essentials-readiness-methodology.html',
  'tools-cyber-essentials-readiness.html',
  'tools-late-payment-calculator-methodology.html',
  'tools-late-payment-calculator.html',
  'tools-mees-risk-snapshot-methodology.html',
  'tools-mees-risk-snapshot.html',
  'tools-ppn002-calculator-methodology.html',
  'tools-ppn002-calculator.html',
  'tools-vsme-materiality-light-methodology.html',
  'tools-vsme-materiality-light.html',
  'tools.html',
];

let processed = 0;
let skipped = 0;
let removedTagsTotal = 0;
let notFound = 0;

for (const rel of TARGETS) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.warn(`[skip] missing: ${rel}`);
    notFound++;
    continue;
  }
  let html = fs.readFileSync(full, 'utf8');

  if (html.indexOf(MARKER) !== -1) {
    skipped++;
    continue;
  }

  const before = html;
  let removedHere = 0;
  for (const pat of REMOVE_PATTERNS) {
    const matches = html.match(pat);
    if (matches) {
      removedHere += matches.length;
    }
    html = html.replace(pat, '');
  }

  // Insert lazy-loader before </body>. Use first occurrence (some pages have nested
  // </body> in comments — pick the actual closing tag at end of file).
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx === -1) {
    console.warn(`[skip] no </body> in: ${rel}`);
    skipped++;
    continue;
  }

  html = html.slice(0, bodyCloseIdx) + LAZY_LOADER + html.slice(bodyCloseIdx);

  if (html === before) {
    console.warn(`[noop] no change for: ${rel}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(full, html, 'utf8');
  processed++;
  removedTagsTotal += removedHere;
  console.log(`[ok] ${rel}  (-${removedHere} direct script tags)`);
}

console.log('');
console.log(`processed: ${processed}`);
console.log(`skipped:   ${skipped}`);
console.log(`missing:   ${notFound}`);
console.log(`direct tags removed total: ${removedTagsTotal}`);
