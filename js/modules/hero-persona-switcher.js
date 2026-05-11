// ── HERO SEGMENT SELECTOR — WP-WEB-004 + Phase 8: UTM Personalization ──
// Self-contained module extracted from scripts.js (WS-AUDIT-043).
// Self-attaches via DOMContentLoaded; exits early if no .seg-btn nodes present.
//
// 2026-05-09 update: also writes localStorage.ca_persona (sticky across sessions)
// alongside the existing sessionStorage.ca_hero_segment so the persona-deadlines
// module picks up the same selection on reload.
(function() {
  function init() {
    var btns = document.querySelectorAll('.seg-btn');
    if (!btns.length) return;

    function activateSegment(seg) {
      var targetBtn = document.querySelector('.seg-btn[data-seg="' + seg + '"]');
      if (!targetBtn) return;
      // DT-fix 2026-05-09: removed aria-pressed (axe aria-allowed-attr critical: aria-pressed is for role=button only; segment-selector buttons use role=tab → aria-selected is canonical).
      btns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); b.setAttribute('tabindex','-1'); });
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected','true');
      targetBtn.setAttribute('tabindex','0');
      document.querySelectorAll('.seg-text').forEach(function(el) { el.hidden = (el.dataset.for !== seg); });
      // Persist selection — sessionStorage (legacy DEF-034) + localStorage (2026-05-09 persona).
      try { sessionStorage.setItem('ca_hero_segment', seg); } catch(e) {}
      try {
        var persona = targetBtn.getAttribute('data-persona');
        if (persona) localStorage.setItem('ca_persona', persona);
      } catch(e) {}
      // Sync "How it works" tab to match the active segment
      var hwMap = { 'landlord': 'core', 'supplier': 'mark', 'csrd': 'csrd' };
      var hwTarget = hwMap[seg];
      if (hwTarget) {
        var hwBtn = document.querySelector('.how-tab[data-hw-tab="' + hwTarget + '"]');
        if (hwBtn) hwBtn.click();
      }
    }

    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        activateSegment(btn.dataset.seg);
      });
    });

    // Arrow-key navigation (roving tabindex) — DEF-034 / Task 32.7
    var segGroup = document.querySelector('.segment-selector');
    if (segGroup) {
      segGroup.addEventListener('keydown', function(e) {
        var arr = Array.from(btns);
        var idx = arr.indexOf(document.activeElement);
        if (idx < 0) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = arr[(idx + 1) % arr.length];
          next.focus(); activateSegment(next.dataset.seg);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = arr[(idx - 1 + arr.length) % arr.length];
          prev.focus(); activateSegment(prev.dataset.seg);
        }
      });
    }

    // Restore persisted segment — prefer localStorage.ca_persona (sticky across
    // sessions, written by both this module and persona-deadlines.js), fall
    // back to sessionStorage.ca_hero_segment (legacy DEF-034 / Task 32.7).
    // UTM/query-param block below may override either.
    var restored = false;
    try {
      var savedPersona = localStorage.getItem('ca_persona');
      if (savedPersona) {
        var personaBtn = document.querySelector('.seg-btn[data-persona="' + savedPersona + '"]');
        if (personaBtn && personaBtn.dataset.seg) {
          activateSegment(personaBtn.dataset.seg);
          restored = true;
        }
      }
    } catch(e) {}
    if (!restored) {
      try {
        var saved = sessionStorage.getItem('ca_hero_segment');
        if (saved && document.querySelector('.seg-btn[data-seg="' + saved + '"]')) {
          activateSegment(saved);
        }
      } catch(e) {}
    }

    // Phase 8: Dynamic Personalization based on UTM or query params
    try {
      var params = new URLSearchParams(window.location.search);
      var campaign = (params.get('utm_campaign') || '').toLowerCase();
      var segmentParam = (params.get('segment') || '').toLowerCase();

      if (segmentParam === 'supplier' || campaign.includes('ppn') || campaign.includes('social-value') || campaign.includes('crowmark')) {
        activateSegment('supplier');
      } else if (segmentParam === 'csrd' || campaign.includes('csrd') || campaign.includes('esrs') || campaign.includes('omnibus')) {
        activateSegment('csrd');
      } else if (segmentParam === 'landlord' || campaign.includes('mees') || campaign.includes('epc') || campaign.includes('core')) {
        activateSegment('landlord');
      }
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
