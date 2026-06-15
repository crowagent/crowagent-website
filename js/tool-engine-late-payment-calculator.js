/**
 * tool-engine-late-payment-calculator.js : calculation engine for the Late Payment Calculator.
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the
 * submit button (type=submit) did a default form submission. This intercepts submit,
 * computes statutory interest + fixed compensation, and renders the result.
 *
 * Statute basis : Late Payment of Commercial Debts (Interest) Act 1998 (as amended):
 *   - Statutory interest rate = 8% PLUS the Bank of England base rate.
 *     Default base rate is an editable ASSUMPTION of 5.25% (user can change the input).
 *   - Interest = debtAmount * (0.08 + baseRate) * (daysLate / 365).
 *   - Fixed statutory compensation by debt size:
 *       £40  if debt < £1,000
 *       £70  if £1,000 <= debt < £10,000
 *       £100 if debt >= £10,000
 *   - Total recoverable = interest + fixed compensation.
 *   Applies to B2B and business-to-public-sector commercial debts only.
 */
(function () {
  'use strict';

  function gbp(n) {
    return '£' + (Math.round(n * 100) / 100).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function fixedCompensation(debt) {
    if (debt < 1000) return 40;
    if (debt < 10000) return 70;
    return 100;
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

  function errorCard(out, message) {
    out.classList.remove('hidden');
    out.innerHTML =
      '<div class="tool-result-card" role="alert" style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;font-weight:600;">' +
        message +
      '</div>';
    applyImportant(out);
  }

  function init() {
    var form = document.getElementById('cash-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload

      var debt = parseFloat((document.getElementById('invoiceAmount') || {}).value);
      var dueStr = (document.getElementById('dueDate') || {}).value;
      var baseRatePct = parseFloat((document.getElementById('baseRate') || {}).value);

      if (!isFinite(debt) || debt <= 0) {
        errorCard(out, 'Please enter a valid principal amount in £ (greater than zero).');
        return;
      }
      if (!dueStr) {
        errorCard(out, 'Please enter the original due date of the invoice.');
        return;
      }

      var due = new Date(dueStr + 'T00:00:00');
      if (isNaN(due.getTime())) {
        errorCard(out, 'Please enter a valid due date.');
        return;
      }

      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var msPerDay = 24 * 60 * 60 * 1000;
      var daysLate = Math.floor((today.getTime() - due.getTime()) / msPerDay);

      if (daysLate <= 0) {
        errorCard(out, 'The due date is today or in the future, so the invoice is not yet overdue. Enter a due date in the past.');
        return;
      }

      if (!isFinite(baseRatePct) || baseRatePct < 0) {
        errorCard(out, 'Please enter a valid Bank of England base rate (%).');
        return;
      }

      var baseRate = baseRatePct / 100;
      var annualRate = 0.08 + baseRate; // statutory rate = 8% + BoE base rate
      var interest = debt * annualRate * (daysLate / 365);
      var dailyInterest = debt * annualRate / 365;
      var compensation = fixedCompensation(debt);
      var totalRecoverable = interest + compensation;

      var bandLabel = debt < 1000
        ? 'debt under £1,000'
        : (debt < 10000 ? 'debt £1,000 to £9,999.99' : 'debt £10,000 or more');

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.75rem;">Total recoverable</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + gbp(totalRecoverable) + '</p>' +
          '<p style="font-size:0.95rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 1.5rem;">Statutory interest plus fixed compensation on a <strong style="color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + gbp(debt) + '</strong> debt, <strong style="color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + daysLate.toLocaleString('en-GB') + '</strong> days overdue.</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Statutory interest</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + gbp(interest) + '</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">8% + ' + baseRatePct.toLocaleString('en-GB') + '% base = ' + (annualRate * 100).toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '% p.a.</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 0.35rem;">Fixed compensation</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + gbp(compensation) + '</p>' +
              '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">' + bandLabel + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="background:rgba(12,201,168,0.12);border:1px solid rgba(12,201,168,0.35);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.35rem;">Daily interest rate</p>' +
            '<p style="font-size:1.1rem;font-weight:900;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;margin:0;">' + gbp(dailyInterest) + ' per day</p>' +
            '<p style="font-size:0.7rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0.25rem 0 0;">Interest continues to accrue daily until the debt is paid.</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: Late Payment of Commercial Debts (Interest) Act 1998 (as amended). Statutory interest = 8% plus the Bank of England base rate (base rate shown is your editable assumption, defaulting to 5.25%). Applies to B2B and business-to-public-sector commercial debts only. Indicative estimate, not legal advice.</p>' +
        '</div>';
      applyImportant(out);

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('late-payment-calculator'); } catch (_) {}
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
