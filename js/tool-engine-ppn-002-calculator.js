/**
 * tool-engine-ppn-002-calculator.js, advanced calculation & modeling engine for PPN 002 Social Value.
 *
 * Models PPN 002 mandatory 10% floor compliance AND quantifies National TOMs proxy financial value,
 * Social Value SROI dividends, itemised proxy ledgers, and generates tender-ready response frameworks.
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
  function gbp(n) {
    return '£' + Math.round(n).toLocaleString('en-GB');
  }

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
      'm1-growth': 'M1 Kickstart economic growth',
      'm2-energy': 'M2 Make Britain a clean energy superpower',
      'm3-streets': 'M3 Take back our streets',
      'm4-opportunity': 'M4 Break down barriers to opportunity',
      'm5-nhs': 'M5 Build an NHS fit for the future'
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.CAToolTeaser && window.CAToolTeaser.gateSoftWall &&
          window.CAToolTeaser.gateSoftWall('ppn-002-calculator', out)) return;

      var mission = (document.getElementById('missionType') || {}).value || '';
      var contractValue = parseFloat((document.getElementById('contractValue') || {}).value) || 1000000;
      var totalWeighting = parseFloat((document.getElementById('bidWeighting') || {}).value) || 100;
      var proposedSv = parseFloat((document.getElementById('socialValueCommitment') || {}).value) || 10;

      // Quantitative commitments
      var localJobs = Math.max(0, parseFloat((document.getElementById('localJobs') || {}).value) || 0);
      var apprenticeships = Math.max(0, parseFloat((document.getElementById('apprenticeships') || {}).value) || 0);
      var trainingHours = Math.max(0, parseFloat((document.getElementById('trainingHours') || {}).value) || 0);
      var supplyChainSpend = Math.max(0, parseFloat((document.getElementById('supplyChainSpend') || {}).value) || 0);
      var carbonSaved = Math.max(0, parseFloat((document.getElementById('carbonSaved') || {}).value) || 0);
      var volunteeringHours = Math.max(0, parseFloat((document.getElementById('volunteeringHours') || {}).value) || 0);

      if (!mission ||
          !isFinite(totalWeighting) || totalWeighting <= 0 || totalWeighting > 100 ||
          !isFinite(proposedSv) || proposedSv < 0 || proposedSv > 100 ||
          proposedSv > totalWeighting || contractValue <= 0) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" role="alert" style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;font-weight:600;">Select a mission, enter a valid contract value (£), total evaluation weighting (1-100%) and social-value weighting. The social-value weighting cannot exceed the total score.</div>';
        applyImportant(out);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }); });
        return;
      }

      // National TOMs proxy valuations
      var PROXIES = [
        { key: 'jobs', label: 'Local FTE Jobs Created', qty: localJobs, unit: 'FTE Jobs', rate: 29500, desc: 'Priority local hires (TOMs NT1)' },
        { key: 'appr', label: 'Apprenticeships Created', qty: apprenticeships, unit: 'Apprenticeships', rate: 14200, desc: 'New apprenticeship posts (TOMs NT2)' },
        { key: 'train', label: 'Skills & Training Delivered', qty: trainingHours, unit: 'Hours', rate: 18.5, desc: 'Workforce & community training (TOMs NT8)' },
        { key: 'supply', label: 'Local & VCSE Supply Spend', qty: supplyChainSpend, unit: '£ Spend', rate: 1.0, desc: 'Direct spend with local SMEs/VCSEs (TOMs NT14)' },
        { key: 'carbon', label: 'CO2 Carbon Reduction', qty: carbonSaved, unit: 'Tonnes CO2', rate: 75, desc: 'GHG emissions offset/reduced (TOMs NT31)' },
        { key: 'vol', label: 'Community Volunteering', qty: volunteeringHours, unit: 'Hours', rate: 22.5, desc: 'Employee community volunteering (TOMs NT25)' }
      ];

      var totalMonetisedSv = 0;
      var activeLedgerRows = [];

      for (var i = 0; i < PROXIES.length; i++) {
        var p = PROXIES[i];
        if (p.qty > 0) {
          var val = p.qty * p.rate;
          totalMonetisedSv += val;
          activeLedgerRows.push({
            label: p.label,
            qtyStr: p.unit === '£ Spend' ? gbp(p.qty) : p.qty.toLocaleString('en-GB') + ' ' + p.unit,
            rateStr: p.unit === '£ Spend' ? '£1.00 per £ spend' : gbp(p.rate) + ' / ' + p.unit.replace(/s$/, ''),
            totalVal: val,
            totalStr: gbp(val),
            desc: p.desc
          });
        }
      }

      // PPN 002 10% Floor math
      var floorPoints = totalWeighting * (FLOOR_PCT / 100);
      var svShareOfTotal = (proposedSv / totalWeighting) * 100;
      var compliant = svShareOfTotal >= FLOOR_PCT - 1e-9;
      var shortfall = compliant ? 0 : (floorPoints - proposedSv);
      var svSroiDividend = (totalMonetisedSv / contractValue) * 100;

      // Tier assessment
      var verdictTag = '';
      var verdictText = '';
      var verdictColor = '';
      var verdictBg = '';
      var verdictBorder = '';

      if (!compliant) {
        verdictTag = 'BELOW MANDATORY 10% FLOOR';
        verdictText = 'Your proposed ' + pct(proposedSv) + ' weighting is ' + pct(svShareOfTotal) + ' of the total score, falling below PPN 002’s mandatory 10% floor. Increase by ' + pts(shortfall) + ' points to reach baseline compliance.';
        verdictColor = '#FBBF24';
        verdictBg = 'rgba(245,158,11,0.12)';
        verdictBorder = 'rgba(251,191,36,0.4)';
      } else if (totalMonetisedSv === 0) {
        verdictTag = 'COMPLIANT — FLOOR ONLY (NO METRICS ADDED)';
        verdictText = 'Your ' + pct(proposedSv) + ' weighting meets the 10% floor requirement. Add quantitative commitments above (e.g. jobs, apprenticeships, carbon savings) to model your monetised Social Value SROI and build a competitive tender score.';
        verdictColor = '#34D399';
        verdictBg = 'rgba(16,185,129,0.12)';
        verdictBorder = 'rgba(52,211,153,0.4)';
      } else if (svSroiDividend < 5) {
        verdictTag = 'COMPLIANT — BASIC COMMITMENT FLOOR';
        verdictText = 'Your proposal delivers ' + gbp(totalMonetisedSv) + ' in monetised social value (' + pct(svSroiDividend) + ' SROI on contract value). Meets PPN 002 floor rules.';
        verdictColor = '#34D399';
        verdictBg = 'rgba(16,185,129,0.12)';
        verdictBorder = 'rgba(52,211,153,0.4)';
      } else if (svSroiDividend < 12) {
        verdictTag = 'HIGH COMPETITIVENESS — SOLID MARKET BENCHMARK';
        verdictText = 'Your proposal generates ' + gbp(totalMonetisedSv) + ' in monetised social value (' + pct(svSroiDividend) + ' SROI on contract value). Strong competitive positioning for UK central government tenders.';
        verdictColor = '#0CC9A8';
        verdictBg = 'rgba(12,201,168,0.15)';
        verdictBorder = 'rgba(12,201,168,0.45)';
      } else {
        verdictTag = 'EXCEPTIONAL — TOP 5% TENDER WINNING PROPOSAL';
        verdictText = 'Your proposal models ' + gbp(totalMonetisedSv) + ' in monetised social value (' + pct(svSroiDividend) + ' SROI on contract value). Exceptional social return benchmarked against top-scoring UK bids.';
        verdictColor = '#6EE9D2';
        verdictBg = 'rgba(110,233,210,0.18)';
        verdictBorder = 'rgba(110,233,210,0.5)';
      }

      // Generate Tender Narrative Text
      var missionName = missionLabels[mission] || mission;
      var narrativeBullets = [];
      if (activeLedgerRows.length > 0) {
        for (var k = 0; k < activeLedgerRows.length; k++) {
          narrativeBullets.push('• ' + activeLedgerRows[k].label + ': ' + activeLedgerRows[k].qtyStr + ' (' + activeLedgerRows[k].totalStr + ' National TOMs proxy value)');
        }
      } else {
        narrativeBullets.push('• Minimum 10% social value weighting commitment compliant with PPN 002 mandatory rules.');
      }

      var tenderResponseText = 'SOCIAL VALUE RESPONSE SUMMARY — ' + missionName.toUpperCase() + '\n' +
        'Contract Value: ' + gbp(contractValue) + ' | Proposed SV Weighting: ' + pct(proposedSv) + ' (' + pts(proposedSv) + ' pts)\n' +
        'Total Monetised Social Value: ' + gbp(totalMonetisedSv) + ' (' + pct(svSroiDividend) + ' Social Value SROI Dividend)\n\n' +
        'Key Quantified Commitments (National TOMs Aligned):\n' +
        narrativeBullets.join('\n') + '\n\n' +
        'Methodology & Governance:\n' +
        'All commitments are governed by PPN 002 social value principles and benchmarked against National TOMs proxy financial rates. Quarterly KPI monitoring and evidence reporting will ensure 100% delivery auditability.';

      // Construct Ledger Table HTML
      var ledgerTableHtml = '';
      if (activeLedgerRows.length > 0) {
        var rowsHtml = '';
        for (var r = 0; r < activeLedgerRows.length; r++) {
          var row = activeLedgerRows[r];
          rowsHtml += '<tr style="border-bottom:1px solid rgba(232,240,250,0.08);">' +
            '<td style="padding:0.75rem 0.5rem;font-weight:600;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + row.label + '<br><span style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;font-weight:normal;">' + row.desc + '</span></td>' +
            '<td style="padding:0.75rem 0.5rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + row.qtyStr + '</td>' +
            '<td style="padding:0.75rem 0.5rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;font-size:0.85rem;">' + row.rateStr + '</td>' +
            '<td style="padding:0.75rem 0.5rem;text-align:right;font-weight:700;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;">' + row.totalStr + '</td>' +
          '</tr>';
        }

        ledgerTableHtml =
          '<div style="margin-top:1.5rem;background:rgba(255,255,255,0.03);border:1px solid rgba(232,240,250,0.1);border-radius:0.75rem;padding:1.25rem;">' +
            '<h4 style="margin:0 0 1rem;font-size:0.9rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;">National TOMs Proxy Value Ledger</h4>' +
            '<div style="overflow-x:auto;">' +
              '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;text-align:left;">' +
                '<thead>' +
                  '<tr style="border-bottom:1px solid rgba(232,240,250,0.15);color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;">' +
                    '<th style="padding:0.5rem;">Social Value Measure</th>' +
                    '<th style="padding:0.5rem;">Commitment</th>' +
                    '<th style="padding:0.5rem;">Proxy Benchmark</th>' +
                    '<th style="padding:0.5rem;text-align:right;">Monetised Value (£)</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' + rowsHtml + '</tbody>' +
                '<tfoot>' +
                  '<tr style="border-top:2px solid rgba(12,201,168,0.3);font-weight:900;">' +
                    '<td colspan="3" style="padding:0.75rem 0.5rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">TOTAL MONETISED SOCIAL VALUE CREATED</td>' +
                    '<td style="padding:0.75rem 0.5rem;text-align:right;color:#6EE9D2;-webkit-text-fill-color:#6EE9D2;font-size:1.1rem;">' + gbp(totalMonetisedSv) + '</td>' +
                  '</tr>' +
                '</tfoot>' +
              '</table>' +
            '</div>' +
          '</div>';
      }

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">' +
            '<div>' +
              '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.4rem;">Total Monetised Social Value Created</p>' +
              '<p style="font-size:clamp(2.4rem,1.5rem+3.5vw,3.8rem);font-weight:900;line-height:1;margin:0;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + gbp(totalMonetisedSv) + '</p>' +
              '<p style="font-size:0.9rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.4rem 0 0;">Delivers <strong style="color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + pct(svSroiDividend) + ' Social Value SROI Dividend</strong> on a ' + gbp(contractValue) + ' contract.</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(232,240,250,0.12);border-radius:0.75rem;padding:0.85rem 1.15rem;text-align:right;">' +
              '<p style="font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.25rem;">Tender SV Score</p>' +
              '<p style="font-size:1.6rem;font-weight:900;color:#6EE9D2;-webkit-text-fill-color:#6EE9D2;margin:0;">' + pts(proposedSv) + ' pts</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.2rem 0 0;">' + pct(proposedSv) + ' of ' + pts(totalWeighting) + ' pts total</p>' +
            '</div>' +
          '</div>' +

          '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:0.85rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:0.85rem;">' +
              '<p style="font-size:0.68rem;font-weight:800;text-transform:uppercase;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.25rem;">Mandatory Floor</p>' +
              '<p style="font-size:1.2rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + pts(floorPoints) + ' pts</p>' +
              '<p style="font-size:0.68rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.2rem 0 0;">10% PPN 002 floor</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:0.85rem;">' +
              '<p style="font-size:0.68rem;font-weight:800;text-transform:uppercase;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.25rem;">Proposed Weighting</p>' +
              '<p style="font-size:1.2rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + pts(proposedSv) + ' pts</p>' +
              '<p style="font-size:0.68rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.2rem 0 0;">' + (compliant ? 'Clears floor' : pts(shortfall) + ' pts below floor') + '</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:0.85rem;">' +
              '<p style="font-size:0.68rem;font-weight:800;text-transform:uppercase;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.25rem;">Monetised SV (£)</p>' +
              '<p style="font-size:1.2rem;font-weight:900;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0;">' + gbp(totalMonetisedSv) + '</p>' +
              '<p style="font-size:0.68rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.2rem 0 0;">National TOMs proxy</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:0.85rem;">' +
              '<p style="font-size:0.68rem;font-weight:800;text-transform:uppercase;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.25rem;">Social Value SROI</p>' +
              '<p style="font-size:1.2rem;font-weight:900;color:#6EE9D2;-webkit-text-fill-color:#6EE9D2;margin:0;">' + pct(svSroiDividend) + '</p>' +
              '<p style="font-size:0.68rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.2rem 0 0;">% of contract value</p>' +
            '</div>' +
          '</div>' +

          '<div style="background:' + verdictBg + ';border:1px solid ' + verdictBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.65rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0 0 0.4rem;">' + verdictTag + '</p>' +
            '<p style="font-weight:700;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0;">' + verdictText + '</p>' +
          '</div>' +

          '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Scored Mission Framework</p>' +
            '<p style="font-weight:700;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + missionName + ' (UK Central Government PPN 002 Social Value Model).</p>' +
          '</div>' +

          ledgerTableHtml +

          '<div style="margin-top:1.5rem;background:rgba(4,14,26,0.6);border:1px solid rgba(232,240,250,0.12);border-radius:0.75rem;padding:1.25rem;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">' +
              '<h4 style="margin:0;font-size:0.85rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;">Tender Response Framework Snippet</h4>' +
              '<button id="copy-narrative-btn" style="background:rgba(12,201,168,0.15);border:1px solid rgba(12,201,168,0.4);border-radius:0.5rem;padding:0.35rem 0.75rem;color:#6EE9D2;font-size:0.75rem;font-weight:700;cursor:pointer;">Copy Response Text</button>' +
            '</div>' +
            '<textarea id="narrative-textarea" readonly style="width:100%;height:130px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:0.5rem;padding:0.75rem;color:#E8F0FA;font-family:var(--mono);font-size:0.78rem;line-height:1.45;resize:vertical;">' + tenderResponseText.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</textarea>' +
          '</div>' +

          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:1.25rem 0 0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: Procurement Policy Note PPN 002 (Feb 2025) and National TOMs Framework 2023-24 proxy valuations. Indicative estimate; verify against specific contracting authority evaluation models.</p>' +
        '</div>';

      applyImportant(out);

      // Copy narrative button handler
      var copyBtn = document.getElementById('copy-narrative-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          var ta = document.getElementById('narrative-textarea');
          if (ta) {
            ta.select();
            try {
              navigator.clipboard.writeText(ta.value);
              copyBtn.textContent = 'Copied!';
              setTimeout(function () { copyBtn.textContent = 'Copy Response Text'; }, 2000);
            } catch (_) {
              document.execCommand('copy');
              copyBtn.textContent = 'Copied!';
              setTimeout(function () { copyBtn.textContent = 'Copy Response Text'; }, 2000);
            }
          }
        });
      }

      if (window.CAToolTeaser) {
        try {
          window.CAToolTeaser.recordRun('ppn-002-calculator');
          window.CAToolTeaser.appendUpgradeStrip('ppn-002-calculator', out);
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
