/**
 * tool-engine-mees-risk-snapshot.js, calculation engine for the MEES Risk Snapshot.
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the
 * submit button (type=submit) did a default form submission. This intercepts submit,
 * computes the penalty exposure under SI 2015/962 reg 39, and renders the result.
 *
 * Statute basis (non-domestic / commercial, SI 2015/962 reg 39):
 *   - Breach < 3 months  (short): 10% of rateable value, min £5,000,  max £50,000.
 *   - Breach >= 3 months (long):  20% of rateable value, min £10,000, max £150,000.
 *   (MEES penalty NEVER exceeds £150,000, per platform rule.)
 *   - Band-C verdict: EPC band A/B/C meets the PROPOSED Band C 2028 target; D-G at risk.
 *     (Band C 2028 is a PROPOSAL, not confirmed law.)
 */
(function () {
  'use strict';
  function gbp(n) {
    return '£' + Math.round(n).toLocaleString('en-GB');
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function init() {
    var form = document.getElementById('mees-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload

      var rv = parseFloat((document.getElementById('rateableValue') || {}).value);
      var band = (document.getElementById('currentBand') || {}).value;
      var breach = (document.getElementById('breachLength') || {}).value || 'short';

      if (!isFinite(rv) || rv < 0 || !band) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:1rem;padding:1.25rem 1.5rem;color:#991B1B;font-weight:600;">Please enter a valid rateable value and select your EPC band.</div>';
        return;
      }

      var shortPenalty = clamp(rv * 0.10, 5000, 50000);
      var longPenalty = clamp(rv * 0.20, 10000, 150000);
      var selected = breach === 'long' ? longPenalty : shortPenalty;
      var selectedLabel = breach === 'long' ? '3 months or more' : 'Less than 3 months';

      var meetsTarget = (band === 'A' || band === 'B' || band === 'C');
      var verdictText = meetsTarget
        ? 'Band ' + band + ' meets the proposed Band C 2028 target.'
        : 'Band ' + band + ' falls below the proposed Band C 2028 target: at risk.';
      var verdictColor = meetsTarget ? '#0E7C68' : '#B45309';
      var verdictBg = meetsTarget ? '#ECFDF5' : '#FFFBEB';
      var verdictBorder = meetsTarget ? '#A7F3D0' : '#FDE68A';

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#FFFFFF;border:1px solid rgba(4,14,26,0.10);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(4,14,26,0.06);color:#040E1A;-webkit-text-fill-color:#040E1A;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.75rem;">Your penalty exposure</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#040E1A;-webkit-text-fill-color:#040E1A;">' + gbp(selected) + '</p>' +
          '<p style="font-size:0.95rem;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 1.5rem;">Estimated maximum financial penalty for a <strong>' + selectedLabel + '</strong> breach.</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 0.35rem;">Short breach (&lt;3 mo)</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0;">' + gbp(shortPenalty) + '</p>' +
              '<p style="font-size:0.7rem;color:#667085;-webkit-text-fill-color:#667085;margin:0.25rem 0 0;">10% of rateable value (£5k-£50k)</p>' +
            '</div>' +
            '<div style="background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 0.35rem;">Long breach (&ge;3 mo)</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0;">' + gbp(longPenalty) + '</p>' +
              '<p style="font-size:0.7rem;color:#667085;-webkit-text-fill-color:#667085;margin:0.25rem 0 0;">20% of rateable value (£10k-£150k)</p>' +
            '</div>' +
          '</div>' +
          '<div style="background:' + verdictBg + ';border:1px solid ' + verdictBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-weight:800;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0;">' + verdictText + '</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#667085;-webkit-text-fill-color:#667085;margin:0;border-top:1px solid rgba(4,14,26,0.08);padding-top:1rem;">Basis: SI 2015/962 reg 39 (non-domestic). Penalty is rateable-value-based with a statutory cap of £150,000. Indicative estimate: not legal advice. Band C 2028 is a Government proposal, not confirmed law.</p>' +
        '</div>';

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('mees-risk-snapshot'); } catch (_) {}
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
