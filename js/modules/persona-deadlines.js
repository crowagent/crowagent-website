// ── PERSONA DEADLINES — hero countdown driver ──
// User report 2026-05-09: countdown was stuck on "693 days until MEES Band C"
// regardless of which persona button the visitor clicked. This module wires the
// hero-eyebrow content to the active persona (data-persona on each .seg-btn) so
// the deadline + message changes dynamically.
//
// Contract:
//   #countdown-days   — span that shows the day count (or hidden when in-force)
//   #countdown-label  — span that shows the descriptive label/message
//   #hero-countdown-panel — the eyebrow wrapper (role=status, aria-live=polite)
//   .seg-btn[data-persona] — button whose data-persona key matches PERSONA_DEADLINES
//
// Persistence: localStorage.ca_persona (sticky across sessions)
//   The legacy hero-persona-switcher continues to use sessionStorage.ca_hero_segment
//   for its own seg-text show/hide; both are written on each click for compatibility.
//
// Source-of-truth for dates:
//   property       — MEES Band C 2028 (PROPOSED) per SI 2015/962, see CLAUDE.md §16
//   bid            — PPN 002 mandatory 24 Feb 2025 (in force)
//   cyber          — Cyber Essentials v3.3 'Danzell' in force 28 Apr 2026
//   finance        — Late Payment of Commercial Debts (Interest) Act 1998 (in force)
//   sustainability — CSRD Omnibus I (Directive EU 2026/470) in force 18 Mar 2026
//   sme            — EFRAG VSME 2024 (voluntary, ready for use)
//
// All wording reviewed against CLAUDE.md §16 — we never claim Band C 2028 is law.
(function () {
  'use strict';

  var DAY_MS = 86400000;

  // tense:
  //   'until'    — countdown to a future date (positive integer days)
  //   'since'    — count-up from a past in-force date (positive integer days)
  //   'in-force' — no day count, label only
  var PERSONA_DEADLINES = {
    property: {
      date: Date.UTC(2028, 3, 1), // 2028-04-01 UTC
      tense: 'until',
      shortLabel: 'MEES Band C',
      message: 'days until the proposed MEES Band C deadline (SI 2015/962). Penalty exposure capped at £150,000.'
    },
    bid: {
      date: null,
      tense: 'in-force',
      shortLabel: 'PPN 002',
      message: 'PPN 002 in force since 24 Feb 2025: mandatory minimum 10% social-value weighting on every in-scope contract.'
    },
    cyber: {
      date: Date.UTC(2026, 3, 28), // 2026-04-28 UTC
      tense: 'since',
      shortLabel: "Cyber Essentials v3.3 'Danzell'",
      message: "days since Cyber Essentials v3.3 'Danzell' came into force. MFA gaps and 14-day patch SLA breaches are now auto-fails."
    },
    finance: {
      date: null,
      tense: 'in-force',
      shortLabel: 'Late Payment Act 1998',
      message: 'Late Payment Act 1998 always in force: Bank of England base + 8 percentage points + £40/£70/£100 statutory compensation per overdue invoice.'
    },
    sustainability: {
      date: Date.UTC(2026, 2, 18), // 2026-03-18 UTC
      tense: 'since',
      shortLabel: 'CSRD Omnibus I',
      message: 'days since Omnibus I tightened CSRD scope. New thresholds: >1,000 employees AND >€450M turnover (both required).'
    },
    sme: {
      date: null,
      tense: 'in-force',
      shortLabel: 'EFRAG VSME 2024',
      message: 'EFRAG VSME 2024 ready for use. SME-friendly path with Module B (Basic) + optional Module C (Comprehensive).'
    }
  };

  function readPersistedPersona() {
    try {
      var v = window.localStorage && window.localStorage.getItem('ca_persona');
      if (v && Object.prototype.hasOwnProperty.call(PERSONA_DEADLINES, v)) return v;
    } catch (e) {}
    return null;
  }

  function writePersistedPersona(persona) {
    try {
      if (window.localStorage) window.localStorage.setItem('ca_persona', persona);
    } catch (e) {}
  }

  function render(persona) {
    var cfg = PERSONA_DEADLINES[persona];
    if (!cfg) return;
    var daysEl = document.getElementById('countdown-days');
    var labelEl = document.getElementById('countdown-label');
    var panel = document.getElementById('hero-countdown-panel');
    if (!daysEl || !labelEl) return;

    if (cfg.tense === 'in-force') {
      daysEl.textContent = '';
      daysEl.classList.add('is-hidden');
      daysEl.setAttribute('aria-hidden', 'true');
      labelEl.textContent = cfg.message;
    } else {
      var diffMs = (cfg.tense === 'until') ? (cfg.date - Date.now()) : (Date.now() - cfg.date);
      var days = Math.max(0, Math.ceil(diffMs / DAY_MS));
      daysEl.classList.remove('is-hidden');
      daysEl.removeAttribute('aria-hidden');
      daysEl.textContent = days.toLocaleString('en-GB');
      // The message text is the persona-specific descriptor; for property we keep
      // backward-compatible phrasing matching the previous static eyebrow.
      labelEl.textContent = cfg.message;
    }

    if (panel) {
      panel.setAttribute('data-persona-active', persona);
      panel.setAttribute('aria-label', cfg.shortLabel + ' regulatory countdown');
    }
  }

  function findPersonaForButton(btn) {
    if (!btn) return null;
    var p = btn.getAttribute('data-persona');
    if (p && PERSONA_DEADLINES[p]) return p;
    return null;
  }

  function syncTabState(persona) {
    // Mirror persona onto the matching seg-btn aria state — defensive in case the
    // legacy hero-persona-switcher race-condition (UTM init) changes the active
    // segment after our render. We keep aria-pressed (legacy) and aria-selected
    // (tab role) in sync.
    var btns = document.querySelectorAll('.seg-btn[data-persona]');
    btns.forEach(function (b) {
      var match = b.getAttribute('data-persona') === persona;
      b.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  }

  function activatePersona(persona, opts) {
    if (!PERSONA_DEADLINES[persona]) return;
    render(persona);
    syncTabState(persona);
    if (!opts || opts.persist !== false) writePersistedPersona(persona);
  }

  function bindButtons() {
    var btns = document.querySelectorAll('.seg-btn[data-persona]');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var persona = findPersonaForButton(btn);
        if (persona) activatePersona(persona);
      });
    });
  }

  function initialPersonaFromDom() {
    // Default = whichever button currently carries .active (matches the
    // hero-persona-switcher post-init state). If none, fall back to 'property'.
    var active = document.querySelector('.seg-btn.active[data-persona]');
    if (active) {
      var p = findPersonaForButton(active);
      if (p) return p;
    }
    return 'property';
  }

  function init() {
    var btns = document.querySelectorAll('.seg-btn[data-persona]');
    if (!btns.length) return;

    bindButtons();

    // Restore from localStorage if present (clicks the matching seg-btn so the
    // legacy hero-persona-switcher updates seg-text visibility too).
    var persisted = readPersistedPersona();
    if (persisted) {
      var btn = document.querySelector('.seg-btn[data-persona="' + persisted + '"]');
      if (btn && !btn.classList.contains('active')) {
        // Fire its click so legacy switcher runs, then our click handler renders.
        btn.click();
        return;
      }
    }

    // No persistence (or persisted matches default) — render once based on the
    // active button. Tick periodically so 'until'/'since' counts stay fresh
    // without forcing a page reload.
    activatePersona(initialPersonaFromDom(), { persist: false });
    setInterval(function () { activatePersona(initialPersonaFromDom(), { persist: false }); }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
