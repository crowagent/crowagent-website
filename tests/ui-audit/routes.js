'use strict';

// ROUTE DISCOVERY FOR THE CORRECTED UI AUDIT HARNESS
//
// RULE 0-V, enforced here rather than described: a route list built by pasting
// filesystem paths into a URL is a corpus defect, and it is silent. The
// 2026-08-31 E2E audit did exactly that. It requested
// http://localhost:3000/(auth)\auth\forgot-password and similar for 138 of its
// 145 platform routes, so 131 were 404 BY CONSTRUCTION and only 13 ever loaded.
// It then reported "CrowMark Bidding Suite (24 sub-routes) Fully Functional"
// over that corpus. A control that reaches nothing.
//
// Two defences live in this file:
//   1. toRoutePath() strips Next route groups, parallel slots and private
//      segments, and normalises the Windows separator. It is unit red-proved in
//      self-test.js against the exact broken URLs from that run.
//   2. Nothing here claims a route exists. Discovery only PROPOSES. harness.js
//      probes every proposal and the denominator reports how many resolved.

const fs = require('node:fs');
const path = require('node:path');

const PAGE_FILES = new Set(['page.tsx', 'page.jsx', 'page.ts', 'page.js', 'page.mdx']);

/**
 * Turn an app-router directory path into a URL path.
 * Returns { route, dynamic, segmentsDropped } or null when the path is not routable.
 */
function toRoutePath(relDir) {
  // Normalise BOTH separators. path.sep alone is not enough because a value can
  // arrive already joined with the wrong one.
  const raw = String(relDir).replace(/\\/g, '/');
  const segments = raw.split('/').filter(Boolean);

  const kept = [];
  const dropped = [];
  let dynamic = false;

  for (const seg of segments) {
    if (/^\(.+\)$/.test(seg)) { dropped.push(seg); continue; }   // (auth) route group
    if (seg.startsWith('@')) { dropped.push(seg); continue; }     // @modal parallel slot
    if (seg.startsWith('_')) { return null; }                     // _private, not routable
    if (/^\[.*\]$/.test(seg)) { dynamic = true; }                 // [token], [...slug]
    kept.push(seg);
  }

  return {
    route: '/' + kept.join('/'),
    dynamic,
    segmentsDropped: dropped,
  };
}

/** Walk a Next app directory and propose routes. Never asserts they resolve. */
function discoverNextRoutes(appDir) {
  const proposals = [];
  const skipped = [];

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.next') continue;
        walk(full);
      } else if (PAGE_FILES.has(e.name)) {
        const rel = path.relative(appDir, dir);
        const parsed = toRoutePath(rel);
        if (!parsed) { skipped.push({ source: full, reason: 'private-segment' }); continue; }
        if (parsed.dynamic) {
          // A dynamic route needs a real parameter value. Guessing one produces a
          // 404 that reads as a broken route. Report it as not covered instead.
          skipped.push({ source: full, route: parsed.route, reason: 'dynamic-needs-sample' });
          continue;
        }
        proposals.push({ route: parsed.route, source: full, segmentsDropped: parsed.segmentsDropped });
      }
    }
  }

  walk(appDir);
  proposals.sort((a, b) => a.route.localeCompare(b.route));
  return { proposals, skipped };
}

/**
 * Discover the website corpus from the BUILT output, which is the deploy
 * artefact and therefore the real router. A file absent from dist is absent
 * from every gate's corpus, so auditing the source tree would measure pages
 * that do not ship.
 */
function discoverStaticRoutes(distDir) {
  const proposals = [];
  const skipped = [];

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === '_assets' || e.name === 'Assets') continue;
        walk(full);
      } else if (e.name === 'index.html') {
        const rel = path.relative(distDir, dir).replace(/\\/g, '/');
        proposals.push({ route: '/' + (rel ? rel + '/' : ''), source: full, segmentsDropped: [] });
      } else if (e.name === '404.html') {
        // The error document is not a route. Auditing it would score the 404
        // page as a healthy page, which is how a 404 launders into an aggregate.
        skipped.push({ source: full, reason: 'error-document' });
      }
    }
  }

  walk(distDir);
  proposals.sort((a, b) => a.route.localeCompare(b.route));
  return { proposals, skipped };
}

module.exports = { toRoutePath, discoverNextRoutes, discoverStaticRoutes, PAGE_FILES };
