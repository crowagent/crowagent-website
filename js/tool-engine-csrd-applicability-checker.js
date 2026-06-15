/**
 * tool-engine-csrd-applicability-checker.js, CSRD scope checker under Omnibus I.
 * Aligned to the page's published positioning (Directive (EU) 2026/470, Omnibus I):
 * an undertaking is IN SCOPE only if it exceeds BOTH thresholds:
 *   - more than 1,000 employees, AND
 *   - more than €450M net turnover.
 * BOTH are required (page copy: "Threshold Rule, applicability triggers when BOTH
 * headcount exceeds 1,000 AND net turnover exceeds €450M"). Inputs: #headcount, #turnover.
 */
(function () {
  'use strict';
  var EMP = 1000;      // employees threshold (must exceed)
  var TURN = 450;      // net turnover €M threshold (must exceed)

  // The result card is injected inside a .ca-section-light wrapper whose stylesheet
  // forces color/-webkit-text-fill-color to the light-section value with !important.
  // Re-assert our dark-theme inline colour/background declarations with !important so
  // they win (inline !important beats stylesheet !important).
  var IMPORTANT_PROPS = ['color', '-webkit-text-fill-color', 'background', 'background-color', 'border', 'border-top', 'box-shadow'];
  function applyImportant(root) {
    var nodes = root.querySelectorAll('[style]');
    for (var n = 0; n < nodes.length; n++) {
      var st = nodes[n].style;
      for (var p = 0; p < IMPORTANT_PROPS.length; p++) {
        var v = st.getPropertyValue(IMPORTANT_PROPS[p]);
        if (v) { st.setProperty(IMPORTANT_PROPS[p], v, 'important'); }
      }
    }
  }

  function init() {
    var form = document.getElementById('csrd-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    function criterion(label, your, threshold, met) {
      var c = met ? '#34D399' : '#FBBF24';
      var icon = met ? '✓ Exceeded' : '✕ Not exceeded';
      return '<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:0.9rem 1.1rem;">' +
        '<div><p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.2rem;">' + label + '</p>' +
        '<p style="font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + your + ' <span style="font-weight:600;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;font-size:0.85rem;">(threshold ' + threshold + ')</span></p></div>' +
        '<span style="font-weight:900;font-size:0.95rem;white-space:nowrap;color:' + c + ';-webkit-text-fill-color:' + c + ';">' + icon + '</span></div>';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emp = parseFloat((document.getElementById('headcount') || {}).value);
      var turn = parseFloat((document.getElementById('turnover') || {}).value);

      if (!isFinite(emp) || emp < 0 || !isFinite(turn) || turn < 0) {
        out.classList.remove('hidden');
        out.innerHTML = '<div style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;font-weight:600;">Please enter a valid headcount and net turnover (€M).</div>';
        applyImportant(out);
        return;
      }

      var empOver = emp > EMP;
      var turnOver = turn > TURN;
      var inScope = empOver && turnOver; // BOTH required under Omnibus I

      var rowEmp = criterion('Employees', emp.toLocaleString('en-GB'), '> ' + EMP.toLocaleString('en-GB'), empOver);
      var rowTurn = criterion('Net turnover', '€' + turn.toLocaleString('en-GB') + 'M', '> €' + TURN + 'M', turnOver);

      var verdictText = inScope
        ? 'IN SCOPE: your group exceeds BOTH Omnibus I thresholds.'
        : 'OUT OF SCOPE: Omnibus I requires BOTH thresholds to be exceeded.';
      var vColor = inScope ? '#34D399' : '#9FB3C8';
      var vBg = inScope ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)';
      var vBorder = inScope ? 'rgba(52,211,153,0.4)' : 'rgba(232,240,250,0.12)';

      out.classList.remove('hidden');
      out.innerHTML =
        '<div role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.75rem;">CSRD applicability: Omnibus I</p>' +
          '<div style="background:' + vBg + ';border:1px solid ' + vBorder + ';border-radius:0.85rem;padding:1.1rem 1.35rem;margin-bottom:1.5rem;">' +
            '<p style="font-size:1.35rem;font-weight:900;margin:0;color:' + vColor + ';-webkit-text-fill-color:' + vColor + ';">' + verdictText + '</p>' +
          '</div>' +
          '<div style="display:grid;gap:0.75rem;margin-bottom:1.25rem;">' + rowEmp + rowTurn + '</div>' +
          '<p style="font-size:0.95rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 1.25rem;">Both criteria must be exceeded for a group to fall in scope under the Omnibus I thresholds.</p>' +
          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: CSRD as amended by Omnibus I (Directive (EU) 2026/470), Articles 19a &amp; 29a: &gt;1,000 employees AND &gt;€450M net turnover, both required. Indicative scope check, not legal advice.</p>' +
        '</div>';
      applyImportant(out);

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('csrd-applicability-checker'); } catch (_) {}
      }
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
