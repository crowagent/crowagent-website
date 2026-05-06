/**
 * WEBSITE-FIX-001 WS-6 — Free Tools dual-layer architecture
 *
 * Shared client-side helpers for the marketing-side tool teasers.
 * Each teaser at /tools/<slug>/index.html includes this script + its own
 * tool-engine-<slug>.js (calculation logic).
 *
 * Provides:
 *   - upgradeStrip(slug)               — renders the canonical post-result
 *                                         upgrade strip (Sign-up-free CTA)
 *   - shouldShowSoftWall(slug)         — returns true when a 2nd anonymous
 *                                         run is attempted; teasers replace
 *                                         the result panel with a signup
 *                                         gate when this is true
 *   - recordRun(slug)                  — increments the per-slug run counter
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
      // localStorage may throw in private-mode Safari etc — treat as zero.
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
    return getRunCount(slug) > FREE_RUN_LIMIT;
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
      '  <a class="btn btn-md btn-primary-v2" href="' + signupHref + '">Sign up free &rarr;</a>',
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
      '  <a class="btn btn-lg btn-primary-v2" href="' + signupHref + '">Sign up free &rarr;</a>',
      '  <p class="tool-softwall-fineprint">14-day full access &middot; downgrade to free at any time</p>',
      '</div>'
    ].join('\n');
  }

  // Public API
  window.CrowAgentTeaser = {
    getRunCount: getRunCount,
    recordRun: recordRun,
    shouldShowSoftWall: shouldShowSoftWall,
    upgradeStripHtml: upgradeStripHtml,
    softWallHtml: softWallHtml,
    FREE_RUN_LIMIT: FREE_RUN_LIMIT
  };
})();
