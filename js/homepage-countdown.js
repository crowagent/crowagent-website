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
 */
(function () {
  'use strict';

  var PROPOSED_BAND_C_DATE = Date.UTC(2028, 3, 1); // 2028-04-01 UTC (month is zero-indexed)
  var DAY_MS = 86400000;

  function update() {
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
