/**
 * view-transitions.js — safe wrapper around document.startViewTransition()
 *
 * ISSUE-002 fix (2026-05-22): the legacy sovereign-features.js raw call to
 * document.startViewTransition() threw `InvalidStateError: Transition was
 * aborted` and `AbortError: Transition was skipped` on every page nav.
 * Root causes:
 *   (a) Concurrent transitions when the user clicked a second link before
 *       the first finished (race condition).
 *   (b) document.visibilityState === 'hidden' (tab switched mid-nav).
 *   (c) No feature-detection guard for Firefox (which lacks the API today).
 *
 * This module exposes safeViewTransition(updateCallback) which:
 *   1. Falls through to the callback if the API is missing or the document
 *      is hidden.
 *   2. Skips any in-flight transition via window.__activeTransition.
 *   3. Wraps the transition lifecycle in try/catch with an AbortError filter
 *      so AbortError/InvalidStateError no longer surface in the console.
 *   4. Cleans up the global handle in finally so the next nav is unblocked.
 *
 * Loaded via <script type="module" src="/js/modules/view-transitions.js">
 * AND consumed by sovereign-features.js via window.safeViewTransition.
 */
(function () {
  'use strict';

  function safeViewTransition(updateCallback) {
    // Feature detect + hidden-tab guard. Either condition falls through to
    // a synchronous callback so the navigation still happens.
    if (
      typeof document.startViewTransition !== 'function' ||
      document.visibilityState === 'hidden'
    ) {
      try { return Promise.resolve(updateCallback()); }
      catch (err) { return Promise.reject(err); }
    }

    // Abort any in-flight transition before starting a new one. skipTransition
    // is the spec method for cancelling an active transition; older browsers
    // may not implement it, so we wrap in try.
    if (window.__activeTransition) {
      try {
        if (typeof window.__activeTransition.skipTransition === 'function') {
          window.__activeTransition.skipTransition();
        }
      } catch (_) { /* best-effort abort */ }
    }

    var transition;
    try {
      transition = document.startViewTransition(function () {
        return updateCallback();
      });
    } catch (err) {
      // Some browsers throw synchronously when called in an invalid state.
      try { return Promise.resolve(updateCallback()); }
      catch (e) { return Promise.reject(e); }
    }
    window.__activeTransition = transition;

    return transition.finished
      .catch(function (err) {
        // Filter expected transition-cancellation errors. The "InvalidStateError"
        // path fires when a second transition starts before the first commits;
        // "AbortError" fires when skipTransition() runs. Both are normal during
        // rapid navigation and should not surface to the console.
        var name = err && err.name;
        if (name === 'AbortError' || name === 'InvalidStateError') return;
        if (window.console && console.error) {
          console.error('[ViewTransition] Unexpected error:', err);
        }
      })
      .then(function () { /* normalise to undefined */ })
      .finally(function () {
        if (window.__activeTransition === transition) {
          window.__activeTransition = null;
        }
      });
  }

  // Expose globally so non-module consumers (sovereign-features.js loaded as
  // a classic script) can call it. Idempotent — guard against double-load.
  if (!window.safeViewTransition) {
    window.safeViewTransition = safeViewTransition;
  }
})();
