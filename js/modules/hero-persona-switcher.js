// ── HERO SEGMENT SELECTOR — WP-WEB-004 + Phase 8: UTM Personalization ──
// Self-contained module extracted from scripts.js (WS-AUDIT-043).
// Self-attaches via DOMContentLoaded; exits early if no .seg-btn nodes present.
//
// 2026-05-09 update: also writes localStorage.ca_persona (sticky across sessions)
// alongside the existing sessionStorage.ca_hero_segment so the persona-deadlines
// module picks up the same selection on reload.
(function() {
  // SF10 2026-05-17: one-shot wipe of pre-v10 persona/segment storage so
  // returning visitors land on the founder-locked Cyber default after the
  // velocity reorder. Bump CA_PERSONA_VERSION any time the locked default
  // changes; existing visitors get a clean slate exactly once.
  var CA_PERSONA_VERSION = 'sf10-cyber-2026-05-17';
  try {
    var prev = localStorage.getItem('ca_persona_version');
    if (prev !== CA_PERSONA_VERSION) {
      localStorage.removeItem('ca_persona');
      try { sessionStorage.removeItem('ca_hero_segment'); } catch (e) {}
      localStorage.setItem('ca_persona_version', CA_PERSONA_VERSION);
    }
  } catch (e) {}

  function init() {
    var btns = document.querySelectorAll('.seg-btn');
    if (!btns.length) return;

    // SF30 2026-05-18: hide the universal "Start free trial / Book a demo" CTA
    // pair when any persona tab is active so the per-persona CTAs render
    // exclusively. Called on init and after every segment activation.
    // Sets data-active-seg on .segment-selector so the spec's sibling-combinator
    // CSS hide-rule fires AND writes inline display for belt-and-braces.
    function syncUniversalCta() {
      var activeSeg = document.querySelector('.seg-btn[aria-selected="true"]');
      var universalCta = document.getElementById('hero-cta-default');
      var selector = document.querySelector('.segment-selector');
      if (selector) {
        if (activeSeg) selector.setAttribute('data-active-seg', activeSeg.dataset.seg || '');
        else selector.removeAttribute('data-active-seg');
      }
      if (!universalCta) return;
      universalCta.style.setProperty('display', activeSeg ? 'none' : 'flex', 'important');
    }

    function activateSegment(seg) {
      var targetBtn = document.querySelector('.seg-btn[data-seg="' + seg + '"]');
      if (!targetBtn) return;
      // DT-fix 2026-05-09: removed aria-pressed (axe aria-allowed-attr critical: aria-pressed is for role=button only; segment-selector buttons use role=tab → aria-selected is canonical).
      btns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); b.setAttribute('tabindex','-1'); });
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected','true');
      targetBtn.setAttribute('tabindex','0');
      syncUniversalCta();
      // axe-fix 2026-05-17: `hidden` + `aria-hidden=true` doesn't prevent
      // tabbing into descendant <a>, <button>, <summary>. Toggle `inert` too
      // so the browser excludes the whole subtree from the tab order and AT.
      document.querySelectorAll('.seg-text').forEach(function(el) {
        var hide = el.dataset.for !== seg;
        el.hidden = hide;
        if (hide) {
          el.setAttribute('inert', '');
          el.setAttribute('aria-hidden', 'true');
        } else {
          el.removeAttribute('inert');
          el.removeAttribute('aria-hidden');
        }
      });
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

    // P2 2026-05-17: Stripe-grade cross-fade around the persona swap.
    // - Hard hide/show snapped between H1 / sub / banner / CTAs.
    // - 220ms opacity dip via .is-persona-fading on .hero-content,
    //   coordinated with this swap so the new persona fades back in.
    // - Reduced motion: bypass the fade, call activateSegment instantly.
    var heroContent = document.querySelector('.hero-content');
    var rmm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    function activateSegmentAnimated(seg) {
      if (!heroContent || (rmm && rmm.matches)) {
        activateSegment(seg);
        return;
      }
      heroContent.classList.add('is-persona-fading');
      setTimeout(function() {
        activateSegment(seg);
        requestAnimationFrame(function() {
          heroContent.classList.remove('is-persona-fading');
        });
      }, 200);
    }

    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        activateSegmentAnimated(btn.dataset.seg);
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
          next.focus(); activateSegmentAnimated(next.dataset.seg);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = arr[(idx - 1 + arr.length) % arr.length];
          prev.focus(); activateSegmentAnimated(prev.dataset.seg);
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
      } else if (segmentParam === 'landlord') {
        activateSegment('landlord');
      }
    } catch(e) {}

    // SF30 2026-05-18: final sync once persona restoration + UTM logic settle.
    syncUniversalCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
