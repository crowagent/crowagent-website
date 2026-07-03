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

  // The result card is injected inside a .ca-section-light wrapper whose stylesheet
  // forces color/-webkit-text-fill-color to the light-section value with !important.
  // Re-assert our dark-theme inline colour/background declarations with !important so
  // they win (inline !important beats stylesheet !important). Scope: colour-bearing
  // properties only; layout/spacing inline styles are untouched.
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
    var form = document.getElementById('mees-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload
      if (window.CAToolTeaser && window.CAToolTeaser.gateSoftWall &&
          window.CAToolTeaser.gateSoftWall('mees-risk-snapshot', out)) return;

      var rv = parseFloat((document.getElementById('rateableValue') || {}).value);
      var band = (document.getElementById('currentBand') || {}).value;
      var breach = (document.getElementById('breachLength') || {}).value || 'short';

      if (!isFinite(rv) || rv < 0 || !band) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;font-weight:600;">Please enter a valid rateable value and select your EPC band.</div>';
        applyImportant(out);
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
      var verdictColor = meetsTarget ? '#34D399' : '#FBBF24';
      var verdictBg = meetsTarget ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)';
      var verdictBorder = meetsTarget ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.4)';

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.75rem;">Your penalty exposure</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + gbp(selected) + '</p>' +
          '<p style="font-size:0.95rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 1.5rem;">Estimated maximum financial penalty for a <strong>' + selectedLabel + '</strong> breach.</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Short breach (&lt;3 mo)</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + gbp(shortPenalty) + '</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">10% of rateable value (£5k-£50k)</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Long breach (&ge;3 mo)</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + gbp(longPenalty) + '</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">20% of rateable value (£10k-£150k)</p>' +
            '</div>' +
          '</div>' +
          '<div style="background:' + verdictBg + ';border:1px solid ' + verdictBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-weight:800;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0;">' + verdictText + '</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: SI 2015/962 reg 39 (non-domestic). Penalty is rateable-value-based with a statutory cap of £150,000. Indicative estimate: not legal advice. Band C 2028 is a Government proposal, not confirmed law.</p>' +
        '</div>';
      applyImportant(out);

      if (window.CAToolTeaser) {
        try {
          window.CAToolTeaser.recordRun('mees-risk-snapshot');
          window.CAToolTeaser.appendUpgradeStrip('mees-risk-snapshot', out);
        } catch (_) {}
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
