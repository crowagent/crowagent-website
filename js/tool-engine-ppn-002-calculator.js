/**
 * tool-engine-ppn-002-calculator.js, calculation engine for the PPN 002 Social Value Calculator.
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the submit
 * button (type=submit) did a default form submission. This intercepts submit, computes the
 * PPN 002 social-value floor analysis, and renders a fully-readable result card.
 *
 * Regulatory basis (Procurement Policy Note PPN 002, Feb 2025):
 *   - The MINIMUM social-value weighting is 10% of the total tender evaluation score.
 *     This floor is ALWAYS 10%, NEVER 5%.
 *   - Given the total evaluation weighting and the proposed social-value weighting, this tool:
 *       1. Computes the mandatory 10% floor in score points (10% of the total evaluation score).
 *       2. Compares the proposed social-value weighting against the floor.
 *       3. Flags COMPLIANT (>= 10% floor) or NON-COMPLIANT (below the 10% floor).
 *   - Currency £ (GBP) only. Indicative estimate, not legal advice.
 */
(function () {
  'use strict';

  var FLOOR_PCT = 10; // PPN 002 mandatory minimum social-value weighting, ALWAYS 10%.

  function pct(n) {
    return (Math.round(n * 100) / 100).toLocaleString('en-GB') + '%';
  }
  function pts(n) {
    return (Math.round(n * 100) / 100).toLocaleString('en-GB');
  }

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
    var form = document.getElementById('ppn-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    var missionLabels = {
      'employment': 'Employment & Training',
      'community': 'Community Support',
      'environment': 'Environmental Action',
      'supply-chain': 'Ethical Supply Chain'
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload

      var mission = (document.getElementById('missionType') || {}).value || '';
      var totalWeighting = parseFloat((document.getElementById('bidWeighting') || {}).value);
      var proposedSv = parseFloat((document.getElementById('socialValueCommitment') || {}).value);

      if (!mission ||
          !isFinite(totalWeighting) || totalWeighting <= 0 || totalWeighting > 100 ||
          !isFinite(proposedSv) || proposedSv < 0 || proposedSv > 100) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" role="alert" style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;font-weight:600;">Please select a bid mission and enter a valid total weighting (1-100%) and proposed social-value weighting (0-100%).</div>';
        applyImportant(out);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }); });
        return;
      }

      // PPN 002: minimum social-value weighting is 10% of the total tender evaluation score.
      var floorPoints = totalWeighting * (FLOOR_PCT / 100); // score points the 10% floor represents
      var compliant = proposedSv >= floorPoints - 1e-9;
      var shortfall = compliant ? 0 : (floorPoints - proposedSv);

      var headlinePct = pct(proposedSv);
      var floorLabel = pct(floorPoints) + ' of the total score';

      var verdictText = compliant
        ? 'Compliant: your ' + pct(proposedSv) + ' social-value weighting meets the PPN 002 10% floor (' + pts(floorPoints) + ' points).'
        : 'Non-compliant: your ' + pct(proposedSv) + ' social-value weighting is below the PPN 002 10% floor (' + pts(floorPoints) + ' points). Increase it by at least ' + pts(shortfall) + ' points.';
      var verdictColor = compliant ? '#34D399' : '#FBBF24';
      var verdictBg = compliant ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)';
      var verdictBorder = compliant ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.4)';
      var verdictTag = compliant ? 'COMPLIANT' : 'NON-COMPLIANT';

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.75rem;">Your proposed social-value weighting</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + headlinePct + '</p>' +
          '<p style="font-size:0.95rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 1.5rem;">Against the PPN 002 mandatory <strong style="color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">10% floor</strong>, which equals <strong style="color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + floorLabel + '</strong> on a ' + pts(totalWeighting) + '-point evaluation.</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Mandatory 10% floor</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + pts(floorPoints) + ' pts</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">10% of ' + pts(totalWeighting) + ' total points</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Your proposed weighting</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + pts(proposedSv) + ' pts</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">' + (compliant ? 'At or above the floor' : pts(shortfall) + ' pts below the floor') + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="background:' + verdictBg + ';border:1px solid ' + verdictBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.65rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0 0 0.4rem;">' + verdictTag + '</p>' +
            '<p style="font-weight:700;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0;">' + verdictText + '</p>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Scored mission</p>' +
            '<p style="font-weight:700;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + (missionLabels[mission] || mission) + ': mapped to the Social Value TOMs framework.</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: Procurement Policy Note PPN 002 (Feb 2025), which mandates a minimum 10% social-value weighting of the total tender evaluation score for in-scope contracts. Indicative estimate: not legal or procurement advice. Verify against your contracting authority&rsquo;s evaluation model.</p>' +
        '</div>';
      applyImportant(out);

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('ppn-002-calculator'); } catch (_) {}
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
