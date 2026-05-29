/**
 * tool-engine-late-payment-calculator.js — calculation engine for the Late Payment Calculator.
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the
 * submit button (type=submit) did a default form submission. This intercepts submit,
 * computes statutory interest + fixed compensation, and renders the result.
 *
 * Statute basis — Late Payment of Commercial Debts (Interest) Act 1998 (as amended):
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

  function errorCard(out, message) {
    out.classList.remove('hidden');
    out.innerHTML =
      '<div class="tool-result-card" role="alert" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:1rem;padding:1.25rem 1.5rem;color:#991B1B;-webkit-text-fill-color:#991B1B;font-weight:600;">' +
        message +
      '</div>';
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
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#FFFFFF;border:1px solid rgba(4,14,26,0.10);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(4,14,26,0.06);color:#040E1A;-webkit-text-fill-color:#040E1A;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.75rem;">Total recoverable</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#040E1A;-webkit-text-fill-color:#040E1A;">' + gbp(totalRecoverable) + '</p>' +
          '<p style="font-size:0.95rem;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 1.5rem;">Statutory interest plus fixed compensation on a <strong style="color:#040E1A;-webkit-text-fill-color:#040E1A;">' + gbp(debt) + '</strong> debt, <strong style="color:#040E1A;-webkit-text-fill-color:#040E1A;">' + daysLate.toLocaleString('en-GB') + '</strong> days overdue.</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">' +
            '<div style="background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 0.35rem;">Statutory interest</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0;">' + gbp(interest) + '</p>' +
              '<p style="font-size:0.7rem;color:#667085;-webkit-text-fill-color:#667085;margin:0.25rem 0 0;">8% + ' + baseRatePct.toLocaleString('en-GB') + '% base = ' + (annualRate * 100).toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '% p.a.</p>' +
            '</div>' +
            '<div style="background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 0.35rem;">Fixed compensation</p>' +
              '<p style="font-size:1.4rem;font-weight:900;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0;">' + gbp(compensation) + '</p>' +
              '<p style="font-size:0.7rem;color:#667085;-webkit-text-fill-color:#667085;margin:0.25rem 0 0;">' + bandLabel + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="background:rgba(12,201,168,0.08);border:1px solid rgba(12,201,168,0.25);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.35rem;">Daily interest rate</p>' +
            '<p style="font-size:1.1rem;font-weight:900;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0;">' + gbp(dailyInterest) + ' per day</p>' +
            '<p style="font-size:0.7rem;color:#667085;-webkit-text-fill-color:#667085;margin:0.25rem 0 0;">Interest continues to accrue daily until the debt is paid.</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#667085;-webkit-text-fill-color:#667085;margin:0;border-top:1px solid rgba(4,14,26,0.08);padding-top:1rem;">Basis: Late Payment of Commercial Debts (Interest) Act 1998 (as amended). Statutory interest = 8% plus the Bank of England base rate (base rate shown is your editable assumption, defaulting to 5.25%). Applies to B2B and business-to-public-sector commercial debts only. Indicative estimate, not legal advice.</p>' +
        '</div>';

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('late-payment-calculator'); } catch (_) {}
      }
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
