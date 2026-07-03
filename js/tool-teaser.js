/**
 * WEBSITE-FIX-001 WS-6 - Free Tools dual-layer architecture
 *
 * Shared client-side helpers for the marketing-side tool teasers.
 * Each teaser at /tools/<slug>/index.html includes this script + its own
 * tool-engine-<slug>.js (calculation logic).
 *
 * Provides:
 *   - upgradeStrip(slug)               - renders the canonical post-result
 *                                         upgrade strip (Sign-up-free CTA)
 *   - shouldShowSoftWall(slug)         - returns true when a 2nd anonymous
 *                                         run is attempted; teasers replace
 *                                         the result panel with a signup
 *                                         gate when this is true
 *   - recordRun(slug)                  - increments the per-slug run counter
 *                                         in localStorage
 *
 * Privacy: localStorage only stores a small non-PII counter
 * (key: ca_tool_runs_<slug>, value: integer count). No tool inputs or
 * results are persisted client-side.
 */
(function () {
  'use strict';

  var STORAGE_PREFIX = 'ca_tool_runs_';
  var FREE_RUN_LIMIT = 1; // 2nd run gates to signup

  function getRunCount(slug) {
    try {
      var raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
      var n = parseInt(raw || '0', 10);
      return isNaN(n) ? 0 : n;
    } catch (_) {
      // localStorage may throw in private-mode Safari etc - treat as zero.
      return 0;
    }
  }

  function recordRun(slug) {
    try {
      var n = getRunCount(slug) + 1;
      window.localStorage.setItem(STORAGE_PREFIX + slug, String(n));
      return n;
    } catch (_) {
      return 1;
    }
  }

  function shouldShowSoftWall(slug) {
    // A user gets FREE_RUN_LIMIT free anonymous runs. Once that many runs have
    // been recorded, the next submit is gated. With FREE_RUN_LIMIT = 1 the 1st
    // run is free and the 2nd run shows the soft-wall.
    return getRunCount(slug) >= FREE_RUN_LIMIT;
  }

  /**
   * Returns the upgrade-strip HTML string for insertion after a teaser
   * result. Slug is used in the analytics utm tag on the signup link so
   * conversion attribution is per-tool.
   */
  function upgradeStripHtml(slug) {
    var signupHref =
      'https://app.crowagent.ai/signup?utm_source=teaser&utm_medium=marketing&utm_campaign=' +
      encodeURIComponent(slug);
    return [
      '<div class="tool-upgrade-strip" role="region" aria-label="Upgrade to full tool">',
      '  <div class="tool-upgrade-strip-text">',
      '    <strong>Save this result, export to PDF, and run unlimited scans.</strong>',
      '    <span>No card required &middot; 14-day full access</span>',
      '  </div>',
      '  <a class="sv-btn sv-btn--md sv-btn--primary" href="' + signupHref + '">Sign up free &rarr;</a>',
      '</div>'
    ].join('\n');
  }

  /**
   * Returns the soft-wall HTML string. Replaces the result panel on 2nd
   * anonymous run.
   */
  function softWallHtml(slug) {
    var signupHref =
      'https://app.crowagent.ai/signup?utm_source=teaser_softwall&utm_medium=marketing&utm_campaign=' +
      encodeURIComponent(slug);
    return [
      '<div class="tool-softwall" role="region" aria-label="Sign up to continue">',
      '  <h3>Sign up free to keep going</h3>',
      '  <p>You\'ve used your free anonymous run. Sign up (no card required) for unlimited scans, PDF export, scenario comparison, and audit trail.</p>',
      '  <a class="sv-btn sv-btn--lg sv-btn--primary" href="' + signupHref + '">Sign up free &rarr;</a>',
      '  <p class="tool-softwall-fineprint">14-day full access &middot; downgrade to free at any time</p>',
      '</div>'
    ].join('\n');
  }

  /**
   * If the anonymous free-run allowance for this tool is used up, replace the
   * result panel with the signup soft-wall and return true so the engine can
   * abort before computing/rendering a fresh result. Returns false otherwise.
   * Call this at the very start of the submit handler (after preventDefault).
   */
  function gateSoftWall(slug, outEl) {
    try {
      if (!shouldShowSoftWall(slug)) return false;
      if (outEl) {
        outEl.classList.remove('hidden');
        outEl.innerHTML = softWallHtml(slug);
        requestAnimationFrame(function () {
          try { outEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
        });
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Appends the post-result upgrade strip to the result panel. Idempotent —
   * will not append a second strip if one is already present. Call this after
   * a successful result render (and after recordRun).
   */
  function appendUpgradeStrip(slug, outEl) {
    try {
      if (!outEl || outEl.querySelector('.tool-upgrade-strip')) return;
      var holder = document.createElement('div');
      holder.innerHTML = upgradeStripHtml(slug);
      var strip = holder.firstElementChild || holder;
      outEl.appendChild(strip);
    } catch (_) {}
  }

  // Public API. Canonical global is `window.CAToolTeaser` (the name every tool
  // engine references); `window.CrowAgentTeaser` is kept as a backward-compatible
  // alias. Both point at the same object.
  var api = {
    getRunCount: getRunCount,
    recordRun: recordRun,
    shouldShowSoftWall: shouldShowSoftWall,
    upgradeStripHtml: upgradeStripHtml,
    softWallHtml: softWallHtml,
    gateSoftWall: gateSoftWall,
    appendUpgradeStrip: appendUpgradeStrip,
    FREE_RUN_LIMIT: FREE_RUN_LIMIT
  };
  window.CAToolTeaser = api;
  window.CrowAgentTeaser = api;
})();
