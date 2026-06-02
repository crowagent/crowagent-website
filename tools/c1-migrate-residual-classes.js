#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/c1-migrate-residual-classes.js
   C-1 residual migration — additive only.

   Purpose
   -------
   `tools/migrate-to-sovereign.js` does NOT cover three residual class
   families that the design-system-registry deprecates:
     1. `.f10-related-card` family (slot classes `*-name`, `*-desc`,
        `*__accent`, `*__arrow`) — present on the 6 product hub pages,
        30 cards total.
     2. `.hw ms-card-lift` / `.sector ms-card-lift` — present on product
        pages as who-it's-for / sector strips.
     3. `.pw-sf21-card` — product walkthrough cards (figure) on product
        pages.

   Strategy (additive, non-destructive)
   ------------------------------------
   * KEEP the legacy class on the element (CSS aliases still depend on
     it; deletion is owned by the CSS-side agent).
   * ADD the canonical `.sv-card*` co-class so layout, focus, and a11y
     audits classify it correctly.
   * For `f10-related-card`: also emit `sv-card--accent` and add slot
     classes to child elements (`sv-card__title`, `sv-card__body`,
     `sv-card__accent`, `sv-card__arrow`). aria-* attributes preserved
     verbatim.

   Idempotent. Re-running on already-migrated HTML produces no diff.
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = !process.argv.includes('--apply');
const FILES_FLAG = process.argv.indexOf('--files');
const FILES = FILES_FLAG > -1
  ? process.argv.slice(FILES_FLAG + 1).filter(a => !a.startsWith('--'))
  : [
      'crowagent-core.html',
      'crowcyber.html',
      'crowcash.html',
      'crowmark.html',
      'crowesg.html',
      'csrd.html',
    ];

const stats = {
  filesScanned: 0,
  filesChanged: 0,
  f10AccentAdded: 0,
  f10TitleAdded: 0,
  f10BodyAdded: 0,
  f10AccentSpanAdded: 0,
  f10ArrowSpanAdded: 0,
  hwSvCardAdded: 0,
  sectorSvCardAdded: 0,
  pwSf21SvCardAdded: 0,
};

/**
 * Add a token to a `class="..."` attribute body if it is missing.
 * Always inserted AFTER `sv-card` (or at position-0 if sv-card absent).
 */
function ensureClassToken(classBody, token, after = null) {
  const tokens = classBody.split(/\s+/).filter(Boolean);
  if (tokens.includes(token)) return { body: classBody, added: false };
  if (after && tokens.includes(after)) {
    const idx = tokens.indexOf(after);
    tokens.splice(idx + 1, 0, token);
  } else {
    tokens.unshift(token);
  }
  return { body: tokens.join(' '), added: true };
}

function migrateFile(rel) {
  const full = path.join(ROOT, rel);
  let src;
  try {
    src = fs.readFileSync(full, 'utf8');
  } catch (e) {
    console.error('SKIP (read fail): ' + rel + ' — ' + e.message);
    return;
  }
  stats.filesScanned++;
  const before = src;

  // ── 1. f10-related-card container — add sv-card--accent ─────────────
  // Pattern: class="sv-card f10-related-card f10-related-card--<product> ..."
  src = src.replace(
    /class="([^"]*\bf10-related-card\b[^"]*)"/g,
    (match, body) => {
      // Only act when it's the related-card CONTAINER (modifier suffix
      // present), not a child slot.
      if (!/\bf10-related-card--/.test(body)) return match;
      const result = ensureClassToken(body, 'sv-card--accent', 'sv-card');
      if (result.added) stats.f10AccentAdded++;
      return 'class="' + result.body + '"';
    }
  );

  // ── 2. f10-related-card-name → add sv-card__title slot ──────────────
  src = src.replace(
    /class="([^"]*\bf10-related-card-name\b[^"]*)"/g,
    (match, body) => {
      const result = ensureClassToken(body, 'sv-card__title');
      if (result.added) stats.f10TitleAdded++;
      return 'class="' + result.body + '"';
    }
  );

  // ── 3. f10-related-card-desc → add sv-card__body slot ───────────────
  src = src.replace(
    /class="([^"]*\bf10-related-card-desc\b[^"]*)"/g,
    (match, body) => {
      const result = ensureClassToken(body, 'sv-card__body');
      if (result.added) stats.f10BodyAdded++;
      return 'class="' + result.body + '"';
    }
  );

  // ── 4. f10-related-card__accent → add sv-card__accent slot ──────────
  src = src.replace(
    /class="([^"]*\bf10-related-card__accent\b[^"]*)"/g,
    (match, body) => {
      const result = ensureClassToken(body, 'sv-card__accent');
      if (result.added) stats.f10AccentSpanAdded++;
      return 'class="' + result.body + '"';
    }
  );

  // ── 5. f10-related-card__arrow → add sv-card__arrow slot ────────────
  src = src.replace(
    /class="([^"]*\bf10-related-card__arrow\b[^"]*)"/g,
    (match, body) => {
      const result = ensureClassToken(body, 'sv-card__arrow');
      if (result.added) stats.f10ArrowSpanAdded++;
      return 'class="' + result.body + '"';
    }
  );

  // ── 6. hw ms-card-lift (who-it's-for) — add sv-card co-class ────────
  // Pattern requires .hw AND .ms-card-lift on the same element to avoid
  // hitting bare `.hw-grid` etc.
  src = src.replace(
    /class="([^"]*)"/g,
    (match, body) => {
      const tokens = body.split(/\s+/).filter(Boolean);
      const hasHw = tokens.includes('hw');
      const hasMsLift = tokens.includes('ms-card-lift');
      const hasSector = tokens.includes('sector');
      const hasPwCard = tokens.includes('pw-sf21-card');
      const hasSvCard = tokens.includes('sv-card');

      // Skip if none of the targets match.
      if (!((hasHw && hasMsLift) || (hasSector && hasMsLift) || hasPwCard)) {
        return match;
      }
      // Skip if sv-card already present.
      if (hasSvCard) return match;

      tokens.unshift('sv-card');
      if (hasHw && hasMsLift) stats.hwSvCardAdded++;
      else if (hasSector && hasMsLift) stats.sectorSvCardAdded++;
      else if (hasPwCard) stats.pwSf21SvCardAdded++;
      return 'class="' + tokens.join(' ') + '"';
    }
  );

  if (src !== before) {
    stats.filesChanged++;
    if (!DRY) fs.writeFileSync(full, src);
    console.log((DRY ? '[DRY] ' : '[APPLIED] ') + rel);
  } else {
    console.log('[NO-OP] ' + rel);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  C-1 RESIDUAL MIGRATION — ' + (DRY ? 'DRY RUN' : 'APPLY'));
console.log('═══════════════════════════════════════════════════════════════');
for (const f of FILES) migrateFile(f);

console.log('');
console.log('─── Stats ───────────────────────────────────────────────────');
console.log('Files scanned:                  ' + stats.filesScanned);
console.log('Files changed:                  ' + stats.filesChanged);
console.log('f10-related-card → +sv-card--accent: ' + stats.f10AccentAdded);
console.log('f10-related-card-name → +sv-card__title: ' + stats.f10TitleAdded);
console.log('f10-related-card-desc → +sv-card__body:  ' + stats.f10BodyAdded);
console.log('f10-related-card__accent → +sv-card__accent: ' + stats.f10AccentSpanAdded);
console.log('f10-related-card__arrow → +sv-card__arrow:   ' + stats.f10ArrowSpanAdded);
console.log('hw + ms-card-lift → +sv-card:        ' + stats.hwSvCardAdded);
console.log('sector + ms-card-lift → +sv-card:    ' + stats.sectorSvCardAdded);
console.log('pw-sf21-card → +sv-card:             ' + stats.pwSf21SvCardAdded);
console.log('');
console.log(DRY
  ? 'DRY RUN COMPLETE — re-run with --apply to write changes.'
  : 'APPLY COMPLETE.');
