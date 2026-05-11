/**
 * homepage-countdown.js
 *
 * Renders the days-until-MEES-Band-C countdown into [data-band-c-countdown].
 * Source of truth for the date is CLAUDE.md §16 — MEES_BAND_C_DATE = 2028-04-01
 * (PROPOSED — subject to legislative confirmation). Re-uses the same constant
 * the legacy inline IIFE used (var deadline = new Date('2028-04-01T00:00:00Z')).
 *
 * If the deadline is in the past, hide the surrounding sentence entirely
 * (per WP-301 §4.5).
 *
 * 2026-05-09 update — when the hero eyebrow is wired into the persona
 * deadlines module ([data-persona-eyebrow] on the wrapper), this script
 * yields control to persona-deadlines.js (which handles ALL personas
 * including 'property'). Otherwise, on legacy pages with [data-band-c-countdown]
 * but no persona switcher, it continues to render the static MEES countdown.
 */
(function () {
  'use strict';

  var PROPOSED_BAND_C_DATE = Date.UTC(2028, 3, 1); // 2028-04-01 UTC (month is zero-indexed)
  var DAY_MS = 86400000;

  function update() {
    // Persona-aware page (e.g. index.html homepage): persona-deadlines.js owns
    // the eyebrow content for all 6 personas. We must NOT overwrite #countdown-days
    // here or the value flips back to MEES Band C on every 60s tick (root cause
    // of the 2026-05-09 user report: 693-days-frozen bug).
    if (document.querySelector('[data-persona-eyebrow]')) return;

    var nodes = document.querySelectorAll('[data-band-c-countdown]');
    if (!nodes.length) return;
    var diffMs = PROPOSED_BAND_C_DATE - Date.now();
    if (diffMs <= 0) {
      var sentence = document.querySelector('[data-band-c-countdown-sentence]');
      if (sentence) sentence.hidden = true;
      return;
    }
    var days = Math.max(0, Math.ceil(diffMs / DAY_MS));
    var text = String(days.toLocaleString('en-GB'));
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = text;
  }

  function init() {
    update();
    setInterval(update, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
