/* faq-scrollspy.js
   Adds .is-active to .faq-catnav .faq-chip when the matching .faq-group is
   in view. Pure progressive enhancement: if IO is unavailable, falls back to
   the existing :target / click behaviour.
   Author: faq-redesign 2026-05-17
*/
(function () {
  'use strict';
  if (!document.body || !document.body.classList.contains('f8-faq')) return;

  var nav = document.querySelector('.faq-catnav');
  if (!nav) return;
  var chips = Array.prototype.slice.call(nav.querySelectorAll('.faq-chip'));
  if (!chips.length) return;

  /* Map href -> chip element */
  var chipById = {};
  chips.forEach(function (c) {
    var h = c.getAttribute('href') || '';
    if (h.charAt(0) === '#') chipById[h.slice(1)] = c;
  });

  function setActive(id) {
    chips.forEach(function (c) { c.classList.remove('is-active'); });
    var match = id && chipById[id];
    if (match) match.classList.add('is-active');
  }

  /* Default: first chip active until scroll proves otherwise */
  setActive(chips[0].getAttribute('href').replace(/^#/, ''));

  if (!('IntersectionObserver' in window)) return;

  var groups = Array.prototype.slice.call(
    document.querySelectorAll('.faq-group[id]')
  );
  if (!groups.length) return;

  /* Track visibility ratios so we can pick the most-visible group */
  var ratios = {};
  groups.forEach(function (g) { ratios[g.id] = 0; });

  /* We track each section's distance to a "trigger line" 140px below the
     viewport top (just under the sticky nav).  The active section is the
     last one whose top has crossed that line.  This handles the final
     section correctly even when the page bottom prevents it from being
     "centred" in the viewport. */
  function pickActive() {
    var lineY = 160; /* sticky nav (72) + a little breathing room */
    var current = groups[0].id;
    for (var i = 0; i < groups.length; i++) {
      var top = groups[i].getBoundingClientRect().top;
      if (top - lineY <= 0) {
        current = groups[i].id;
      } else {
        break;
      }
    }
    /* Final-section override: if we're within one viewport of the page
       bottom, activate the last section. */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
      current = groups[groups.length - 1].id;
    }
    setActive(current);
  }

  var rafQueued = false;
  function onScroll() {
    if (rafQueued) return;
    rafQueued = true;
    window.requestAnimationFrame(function () {
      rafQueued = false;
      pickActive();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  pickActive();

  /* Keep the IntersectionObserver as a no-op fallback hook in case future
     code wants to react to group visibility. */
  void IntersectionObserver;

  /* Click handler so the chip lights up immediately on tap */
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var id = (c.getAttribute('href') || '').replace(/^#/, '');
      if (id) setActive(id);
    });
  });
})();
