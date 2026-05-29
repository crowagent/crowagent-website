/**
 * tool-engine-csrd-applicability-checker.js — calculation engine for the CSRD
 * Applicability Checker. Fixes the "form just reloads, no result" bug: the engine
 * was never built, so the submit button (type=submit) did a native form submission.
 * This intercepts submit, applies the Omnibus I large-undertaking test, and renders
 * the result.
 *
 * Statutory basis (CSRD applicability under Omnibus I — Directive (EU) 2026/470,
 * amending the Accounting Directive 2013/34/EU, Arts 3, 19a & 29a):
 *   An undertaking is a LARGE undertaking (in scope) if, on the balance-sheet date,
 *   it EXCEEDS at least TWO of these THREE criteria:
 *     - more than 250 employees;
 *     - net turnover more than EUR 50 million;
 *     - balance-sheet total more than EUR 25 million.
 *   Omnibus I raised/aligned these thresholds. Indicative only — not legal advice.
 */
(function () {
  'use strict';

  // Exact Omnibus I large-undertaking thresholds (Directive (EU) 2026/470).
  var T_EMPLOYEES = 250;     // more than 250 employees
  var T_TURNOVER_M = 50;     // net turnover more than EUR 50 million
  var T_BALANCE_M = 25;      // balance-sheet total more than EUR 25 million

  function eurM(n) {
    return '€' + Number(n).toLocaleString('en-GB', { maximumFractionDigits: 1 }) + 'M';
  }
  function num(n) {
    return Math.round(n).toLocaleString('en-GB');
  }

  function init() {
    var form = document.getElementById('csrd-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload

      var employees = parseFloat((document.getElementById('headcount') || {}).value);
      var turnover = parseFloat((document.getElementById('turnover') || {}).value);
      var balance = parseFloat((document.getElementById('balancesheet') || {}).value);
      var listedEl = document.getElementById('listedpie') || {};
      var listed = (listedEl.value || 'no') === 'yes';

      if (!isFinite(employees) || employees < 0 ||
          !isFinite(turnover) || turnover < 0 ||
          !isFinite(balance) || balance < 0) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:1rem;padding:1.25rem 1.5rem;color:#991B1B;-webkit-text-fill-color:#991B1B;font-weight:600;">Please enter valid figures for headcount, net turnover (&euro;M) and balance-sheet total (&euro;M).</div>';
        return;
      }

      // The 2-of-3 large-undertaking test.
      var empExceeded = employees > T_EMPLOYEES;
      var turnExceeded = turnover > T_TURNOVER_M;
      var balExceeded = balance > T_BALANCE_M;
      var count = (empExceeded ? 1 : 0) + (turnExceeded ? 1 : 0) + (balExceeded ? 1 : 0);
      var inScope = count >= 2;

      // Likely reporting wave (indicative). Listed/PIE large undertakings sit in the
      // earlier wave; other large undertakings in the later wave under Omnibus I phasing.
      var wave = inScope
        ? (listed
            ? 'Likely an earlier reporting wave (listed / public-interest entity).'
            : 'Likely a later reporting wave (large undertaking, not listed / PIE).')
        : 'No reporting wave applies while out of scope.';

      var verdictBg = inScope ? '#FFFBEB' : '#ECFDF5';
      var verdictBorder = inScope ? '#FDE68A' : '#A7F3D0';
      var verdictColor = inScope ? '#B45309' : '#0E7C68';
      var verdictTitle = inScope ? 'IN SCOPE' : 'OUT OF SCOPE';
      var verdictSub = inScope
        ? 'You exceed ' + count + ' of the 3 criteria; a large undertaking under Omnibus I.'
        : 'You exceed ' + count + ' of the 3 criteria, fewer than 2, so not a large undertaking under Omnibus I.';

      function row(label, valueText, exceeded, thresholdText) {
        var mark = exceeded ? 'Exceeded' : 'Not exceeded';
        var markColor = exceeded ? '#0E7C68' : '#667085';
        return '' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding:0.85rem 0;border-bottom:1px solid rgba(4,14,26,0.08);">' +
            '<div>' +
              '<p style="font-size:0.85rem;font-weight:800;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0 0 0.15rem;">' + label + '</p>' +
              '<p style="font-size:0.72rem;color:#667085;-webkit-text-fill-color:#667085;margin:0;">Your figure: ' + valueText + ' &middot; Threshold: ' + thresholdText + '</p>' +
            '</div>' +
            '<span style="font-size:0.72rem;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:' + markColor + ';-webkit-text-fill-color:' + markColor + ';white-space:nowrap;">' + mark + '</span>' +
          '</div>';
      }

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#FFFFFF;border:1px solid rgba(4,14,26,0.10);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(4,14,26,0.06);color:#040E1A;-webkit-text-fill-color:#040E1A;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.75rem;">Your CSRD applicability</p>' +
          '<p style="font-size:clamp(2.25rem,1.5rem+3.5vw,3.5rem);font-weight:900;line-height:1;margin:0 0 0.5rem;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';">' + verdictTitle + '</p>' +
          '<p style="font-size:0.95rem;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 1.5rem;">' + verdictSub + '</p>' +

          '<div style="background:rgba(4,14,26,0.03);border-radius:0.9rem;padding:0.5rem 1.25rem 0.75rem;margin-bottom:1.5rem;">' +
            '<p style="font-size:0.7rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#475467;-webkit-text-fill-color:#475467;margin:1rem 0 0.25rem;">The 2-of-3 test</p>' +
            row('Employees', num(employees), empExceeded, 'more than ' + T_EMPLOYEES) +
            row('Net turnover', eurM(turnover), turnExceeded, 'more than ' + eurM(T_TURNOVER_M)) +
            row('Balance-sheet total', eurM(balance), balExceeded, 'more than ' + eurM(T_BALANCE_M)) +
            '<p style="font-size:0.78rem;font-weight:800;color:#040E1A;-webkit-text-fill-color:#040E1A;margin:0.85rem 0 0;">Criteria exceeded: ' + count + ' of 3 ' + (inScope ? '(2 or more &rarr; in scope)' : '(fewer than 2 &rarr; out of scope)') + '</p>' +
          '</div>' +

          '<div style="background:' + verdictBg + ';border:1px solid ' + verdictBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.7rem;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0 0 0.3rem;">Likely reporting wave</p>' +
            '<p style="font-weight:700;color:' + verdictColor + ';-webkit-text-fill-color:' + verdictColor + ';margin:0;">' + wave + '</p>' +
          '</div>' +

          '<p style="font-size:0.75rem;color:#667085;-webkit-text-fill-color:#667085;margin:0;border-top:1px solid rgba(4,14,26,0.08);padding-top:1rem;">Basis: CSRD applicability under Omnibus I (Directive (EU) 2026/470, amending Directive 2013/34/EU). A large undertaking exceeds at least two of: more than ' + T_EMPLOYEES + ' employees; net turnover more than ' + eurM(T_TURNOVER_M) + '; balance-sheet total more than ' + eurM(T_BALANCE_M) + '. Omnibus I raised/aligned these thresholds. Indicative estimate only, not legal advice.</p>' +
        '</div>';

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('csrd-applicability-checker'); } catch (_) {}
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
