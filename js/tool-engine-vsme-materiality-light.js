/**
 * tool-engine-vsme-materiality-light.js, calculation engine for the VSME Materiality Light screen.
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the
 * submit button (type=submit) did a default form submission. This intercepts submit,
 * runs an indicative VSME module screen, and renders a fully-readable result card.
 *
 * Regulatory basis (kept EXACT, EFRAG VSME, December 2024):
 *   - The EFRAG Voluntary standard for non-listed SMEs (VSME, 2024) has two modules:
 *       • Basic Module, a minimum set of disclosures for the smallest undertakings.
 *       • Comprehensive Module, additional disclosures, advisable where the SME faces
 *         lender/investor/large-customer (value-chain) data requests, or operates in a
 *         high-impact sector.
 *   - VSME is a VOLUNTARY standard for NON-LISTED SMEs. A listed SME is outside VSME scope
 *     (LSME / ESRS pathway applies), the screen flags this rather than recommending a module.
 *   - This is an INDICATIVE screen, not assurance. Cite EFRAG VSME (2024).
 *
 * No fabricated figures: disclosure-area counts below are the broad VSME disclosure THEMES,
 * presented as indicative coverage, not a precise datapoint tally.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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

  // Indicative VSME disclosure areas (themes), per EFRAG VSME (2024).
  var BASIC_AREAS = [
    'Basis for preparation',
    'Energy and greenhouse gas emissions',
    'Pollution of air, water and soil',
    'Biodiversity',
    'Water',
    'Resource use, circular economy and waste',
    'Workforce: general characteristics',
    'Workforce: health and safety',
    'Workforce: remuneration, collective bargaining and training',
    'Convictions and fines for corruption and bribery'
  ];
  var COMPREHENSIVE_EXTRA = [
    'Strategy: business model and sustainability initiatives',
    'GHG reduction targets and climate transition',
    'Climate risks (physical and transition)',
    'Additional workforce characteristics (value chain)',
    'Human rights policies and incidents',
    'Sex diversity ratio at governance level',
    'Revenue from controversial sectors / EU taxonomy alignment'
  ];

  function init() {
    var form = document.getElementById('vsme-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload

      var listed = (document.getElementById('listed') || {}).value || '';
      var pressure = (document.getElementById('pressure') || {}).value || '';
      var sectors = (document.getElementById('sectors') || {}).value || '';

      if (!listed || !pressure || !sectors) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;font-weight:600;">Please answer all three questions to generate your VSME recommendation.</div>';
        applyImportant(out);
        return;
      }

      // ----- Screen logic (indicative) -----
      var isListed = listed === 'yes';

      // Drivers that make the Comprehensive Module advisable.
      var drivers = [];
      if (pressure === 'high') {
        drivers.push('Frequent, detailed ESG-data requests from CSRD-reporting customers, lenders or investors.');
      } else if (pressure === 'medium') {
        drivers.push('Some value-chain ESG-data requests, with an increasing trend.');
      }
      if (sectors === 'yes') {
        drivers.push('Primary operations in a high-impact sector (construction, energy or transport).');
      }

      // Recommendation: Comprehensive if a strong driver, or two moderate drivers, applies.
      var strong = (pressure === 'high') || (sectors === 'yes' && pressure === 'medium');
      var recommendComprehensive = strong || drivers.length >= 2;

      var totalAreas = recommendComprehensive
        ? BASIC_AREAS.length + COMPREHENSIVE_EXTRA.length
        : BASIC_AREAS.length;

      // Headline + colours.
      var verdictLabel, verdictBg, verdictBorder, verdictColor, verdictBody;

      if (isListed) {
        verdictLabel = 'VSME may not apply: you are listed';
        verdictBg = 'rgba(245,158,11,0.12)'; verdictBorder = 'rgba(251,191,36,0.4)'; verdictColor = '#FBBF24';
        verdictBody = 'The EFRAG VSME standard is for <strong>non-listed</strong> SMEs. As a listed SME you fall outside VSME scope and the listed-SME (LSME) reporting pathway is likely to apply. The areas below are shown for orientation only.';
      } else if (recommendComprehensive) {
        verdictLabel = 'Comprehensive Module advisable';
        verdictBg = 'rgba(16,185,129,0.12)'; verdictBorder = 'rgba(52,211,153,0.4)'; verdictColor = '#34D399';
        verdictBody = 'Based on your value-chain pressure and/or sector, the <strong>Comprehensive Module</strong> (Basic + additional disclosures) is advisable so you can answer lender, investor and large-customer data requests in one place.';
      } else {
        verdictLabel = 'Basic Module is sufficient';
        verdictBg = 'rgba(16,185,129,0.12)'; verdictBorder = 'rgba(52,211,153,0.4)'; verdictColor = '#34D399';
        verdictBody = 'On these answers the <strong>Basic Module</strong> appears sufficient. Revisit if you start receiving detailed ESG-data requests from larger customers, lenders or investors.';
      }

      var headline = isListed
        ? 'Listed SME: outside VSME'
        : (recommendComprehensive ? 'Comprehensive Module' : 'Basic Module');

      // Build disclosure-area list HTML.
      function liList(items, faded) {
        var color = faded ? '#9FB3C8' : '#E8F0FA';
        var html = '';
        for (var i = 0; i < items.length; i++) {
          html += '<li style="display:flex;align-items:flex-start;gap:0.6rem;padding:0.35rem 0;color:' + color + ';-webkit-text-fill-color:' + color + ';font-size:0.9rem;">' +
            '<span style="color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;font-weight:900;line-height:1.4;">&#10003;</span>' +
            '<span>' + esc(items[i]) + '</span>' +
          '</li>';
        }
        return html;
      }

      var driverHtml = '';
      if (!isListed && drivers.length) {
        driverHtml = '<div style="margin-bottom:1.5rem;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.5rem;">Why this path</p>' +
          '<ul style="list-style:none;margin:0;padding:0;">';
        for (var d = 0; d < drivers.length; d++) {
          driverHtml += '<li style="display:flex;align-items:flex-start;gap:0.6rem;padding:0.3rem 0;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;font-size:0.9rem;">' +
            '<span style="color:#FBBF24;-webkit-text-fill-color:#FBBF24;font-weight:900;">&bull;</span>' +
            '<span>' + esc(drivers[d]) + '</span></li>';
        }
        driverHtml += '</ul></div>';
      }

      var compExtraHtml = recommendComprehensive
        ? '<div style="margin-top:1.25rem;">' +
            '<p style="font-size:0.8rem;font-weight:800;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.5rem;">Additional Comprehensive-Module areas</p>' +
            '<ul style="list-style:none;margin:0;padding:0;">' + liList(COMPREHENSIVE_EXTRA, false) + '</ul>' +
          '</div>'
        : '';

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.75rem;">Your recommended VSME path</p>' +
          '<p style="font-size:clamp(2rem,1.2rem+3.5vw,3.25rem);font-weight:900;line-height:1.05;margin:0 0 0.25rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + esc(headline) + '</p>' +
          '<p style="font-size:0.95rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 1.5rem;">' + verdictLabel + '</p>' +

          '<div style="background:' + verdictBg + ';border:1px solid ' + verdictBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.5rem;">' +
            '<p style="color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0;font-size:0.95rem;line-height:1.5;">' + verdictBody + '</p>' +
          '</div>' +

          driverHtml +

          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Indicative disclosure areas</p>' +
              '<p style="font-size:1.6rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + totalAreas + '</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">disclosure themes to cover</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Standard</p>' +
              '<p style="font-size:1.6rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">VSME</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">EFRAG, December 2024</p>' +
            '</div>' +
          '</div>' +

          '<div>' +
            '<p style="font-size:0.8rem;font-weight:800;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0 0 0.5rem;">Basic-Module disclosure areas</p>' +
            '<ul style="list-style:none;margin:0;padding:0;">' + liList(BASIC_AREAS, false) + '</ul>' +
          '</div>' +
          compExtraHtml +

          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:1.25rem 0 0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: EFRAG VSME: Voluntary standard for non-listed SMEs (December 2024), Basic and Comprehensive Modules. This is an indicative screen, not assurance or audit advice. Confirm the applicable disclosures with your reporting framework before relying on this output.</p>' +
        '</div>';
      applyImportant(out);

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('vsme-materiality-light'); } catch (_) {}
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
