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

  function init() {
    var form = document.getElementById('csrd-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    function criterion(label, your, threshold, met) {
      var c = met ? '#0E7C68' : '#B45309';
      var icon = met ? '✓ Exceeded' : '✕ Not exceeded';
      return '<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:0.9rem 1.1rem;">' +
        '<div><p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 0.2rem;">' + label + '</p>' +
        '<p style="font-weight:900;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0;">' + your + ' <span style="font-weight:600;color:#667085;-webkit-text-fill-color:#667085;font-size:0.85rem;">(threshold ' + threshold + ')</span></p></div>' +
        '<span style="font-weight:900;font-size:0.95rem;white-space:nowrap;color:' + c + ';-webkit-text-fill-color:' + c + ';">' + icon + '</span></div>';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emp = parseFloat((document.getElementById('headcount') || {}).value);
      var turn = parseFloat((document.getElementById('turnover') || {}).value);

      if (!isFinite(emp) || emp < 0 || !isFinite(turn) || turn < 0) {
        out.classList.remove('hidden');
        out.innerHTML = '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:1rem;padding:1.25rem 1.5rem;color:#991B1B;font-weight:600;">Please enter a valid headcount and net turnover (€M).</div>';
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
      var vColor = inScope ? '#0E7C68' : '#475467';
      var vBg = inScope ? '#ECFDF5' : '#F2F4F7';
      var vBorder = inScope ? '#A7F3D0' : '#E4E7EC';

      out.classList.remove('hidden');
      out.innerHTML =
        '<div role="status" aria-live="polite" style="background:#FFFFFF;border:1px solid rgba(4,14,26,0.10);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(4,14,26,0.06);color:#040E1A;-webkit-text-fill-color:#040E1A;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.75rem;">CSRD applicability: Omnibus I</p>' +
          '<div style="background:' + vBg + ';border:1px solid ' + vBorder + ';border-radius:0.85rem;padding:1.1rem 1.35rem;margin-bottom:1.5rem;">' +
            '<p style="font-size:1.35rem;font-weight:900;margin:0;color:' + vColor + ';-webkit-text-fill-color:' + vColor + ';">' + verdictText + '</p>' +
          '</div>' +
          '<div style="display:grid;gap:0.75rem;margin-bottom:1.25rem;">' + rowEmp + rowTurn + '</div>' +
          '<p style="font-size:0.95rem;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 1.25rem;">Both criteria must be exceeded for a group to fall in scope under the Omnibus I thresholds.</p>' +
          '<p style="font-size:0.75rem;color:#667085;-webkit-text-fill-color:#667085;margin:0;border-top:1px solid rgba(4,14,26,0.08);padding-top:1rem;">Basis: CSRD as amended by Omnibus I (Directive (EU) 2026/470), Articles 19a &amp; 29a: &gt;1,000 employees AND &gt;€450M net turnover, both required. Indicative scope check, not legal advice.</p>' +
        '</div>';

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
