/**
 * blog-reading-time.js — CrowAgent blog card reading-time normaliser
 *
 * M15 2026-05-16. Lightweight client-side pass over the blog index that
 * normalises every "X min read" badge on .article-card elements.
 *
 * Strategy (in priority order, first wins):
 *   1. data-words="1234" on the .article-card → ceil(words / 220).
 *   2. existing .card-meta-read text matching /(\d+)\s*min\s*read/i → keep it,
 *      but normalise wording to "<n> min read".
 *   3. fall back to .card-preview word count × 8 (heuristic, since previews
 *      are roughly 1/8 the article length) ÷ 220 wpm, clamped to 5–15 min.
 *
 * AVG_WPM = 220 (industry-standard reading speed, e.g. Medium, Nielsen).
 *
 * Idempotent: only mutates the visible text if it changes; safe to run twice.
 * Best-effort: never throws; failures are silent so the page never breaks.
 *
 * No fetch traffic. No network. Pure DOM pass on DOMContentLoaded.
 */
(function () {
  'use strict';

  var AVG_WPM = 220;
  var MIN_MIN = 3;
  var MAX_MIN = 20;

  function clamp(n) {
    if (!isFinite(n) || n < MIN_MIN) return MIN_MIN;
    if (n > MAX_MIN) return MAX_MIN;
    return n;
  }

  function wordsToMinutes(words) {
    if (!isFinite(words) || words <= 0) return 0;
    return clamp(Math.ceil(words / AVG_WPM));
  }

  function countWordsInText(text) {
    if (!text) return 0;
    // Collapse whitespace, split on runs, drop empties.
    var trimmed = String(text).replace(/\s+/g, ' ').trim();
    if (!trimmed) return 0;
    return trimmed.split(' ').length;
  }

  function readMinutesFromExistingText(card) {
    var read = card.querySelector('.card-meta-read');
    if (!read || !read.textContent) return 0;
    var m = read.textContent.match(/(\d+)\s*min\s*read/i);
    if (!m) return 0;
    var n = parseInt(m[1], 10);
    return isFinite(n) && n > 0 ? clamp(n) : 0;
  }

  function computeMinutes(card) {
    // 1. data-words wins
    var dw = card.getAttribute('data-words');
    if (dw) {
      var w = parseInt(dw, 10);
      if (isFinite(w) && w > 0) return wordsToMinutes(w);
    }
    // 2. preserve existing badge if present
    var existing = readMinutesFromExistingText(card);
    if (existing > 0) return existing;
    // 3. preview-based heuristic
    var preview = card.querySelector('.card-preview');
    if (preview) {
      var pw = countWordsInText(preview.textContent);
      // Previews are roughly 1/8 of full article length on this site.
      var est = wordsToMinutes(pw * 8);
      if (est > 0) return est;
    }
    return 0;
  }

  function applyTo(card) {
    var mins = computeMinutes(card);
    if (!mins) return;

    var label = mins + ' min read';
    var read = card.querySelector('.card-meta-read');
    if (read) {
      if (read.textContent !== label) read.textContent = label;
      return;
    }
    // No badge yet — insert one ahead of the <time> element in .card-meta.
    var meta = card.querySelector('.card-meta');
    if (!meta) return;
    var span = document.createElement('span');
    span.className = 'card-meta-read';
    span.textContent = label;
    var sep = document.createTextNode(' · ');
    var first = meta.firstChild;
    meta.insertBefore(span, first);
    meta.insertBefore(sep, first);
  }

  function run() {
    try {
      var cards = document.querySelectorAll('.article-card');
      for (var i = 0; i < cards.length; i++) {
        try { applyTo(cards[i]); } catch (_e) { /* per-card best-effort */ }
      }
    } catch (_outer) { /* never break the page */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
