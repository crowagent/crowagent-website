/**
 * csrd-wizard.js — H3-PERF-FIX 2026-05-10.
 *
 * Extracted from scripts.js to reduce the marketing-site shared bundle.
 * The CSRD scope wizard renders only on /csrd; loading its ~6 KB of
 * source from every page was a 4 KB minified hit on scripts.min.js with
 * zero benefit on the other 78 pages.
 *
 * Public surface (exposed on `window` so the existing CSP-compliant
 * delegation in scripts.js can reach the handlers without hard-coding
 * an import — `window.csrdSelect` etc):
 *
 *   window.csrdState
 *   window.csrdSelect(field, value, sourceEl)
 *   window.csrdShowStep(n)
 *   window.csrdMapEmployees(val)
 *   window.csrdMapTurnover(val)
 *   window.csrdGetResult()
 *   window.csrdRenderVerdict()
 *   window.csrdSubmit()
 *   window.submitCSRD(e)            // blog-article and contact CSRD form path
 *   window.showCsrdShare()          // share panel reveal
 *
 * Behaviour preserved exactly from the prior in-scripts.js implementation
 * (DEF-030 advisory verdict, BUG #10/11 immediate verdict render, server
 * re-validation on /api/v1/csrd/check). Email blur validation also lives
 * here (was the freestanding section "CSRD WIZARD EMAIL BLUR VALIDATION").
 *
 * Loader: scripts.js inserts <script defer src="/js/modules/csrd-wizard.js">
 * at runtime when `[data-csrd-step]` is present in the DOM. On non-csrd
 * pages, this file is never fetched, never parsed, never executed.
 *
 * CommonJS export at end-of-file makes the module testable from
 * scripts.test.js (jsdom).
 */
(function (root) {
  'use strict';

  var csrdState = { employees: null, turnover: null, sector: null, step: 1 };

  function csrdSelect(field, value, sourceEl) {
    csrdState[field] = value;
    document.querySelectorAll('[data-csrd-step="' + csrdState.step + '"] .csrd-option').forEach(function (el) {
      el.classList.remove('selected');
    });
    var current = sourceEl || (typeof event !== 'undefined' ? event && event.currentTarget : null);
    if (current && current.classList) current.classList.add('selected');
    var nextStep = csrdState.step + 1;
    setTimeout(function () { csrdShowStep(nextStep); }, 280);
    csrdState.step = nextStep;
  }

  function csrdShowStep(n) {
    document.querySelectorAll('.csrd-step').forEach(function (el) {
      el.style.display = 'none';
      el.classList.remove('active');
    });
    var target = document.querySelector('[data-csrd-step="' + n + '"]');
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
      var focusTarget = target.querySelector('h2, h3, input, button, [tabindex]');
      if (focusTarget) {
        if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus({ preventScroll: false });
      }
    }
    document.querySelectorAll('.csrd-progress-step').forEach(function (el) {
      var step = parseInt(el.dataset.step);
      el.classList.remove('csrd-progress-active', 'csrd-progress-done');
      if (step === n) el.classList.add('csrd-progress-active');
      else if (step < n) el.classList.add('csrd-progress-done');
    });
    csrdState.step = n;
    if (n === 1) { csrdState.employees = null; }
    if (n <= 2) { csrdState.turnover = null; }
    if (n === 3) {
      if (!csrdState.employees || !csrdState.turnover) {
        csrdShowStep(1);
        return;
      }
      csrdRenderVerdict();
    }
  }

  function csrdMapEmployees(val) {
    if (val === '1000+') return 1001;
    if (val === '250-999') return 500;
    return 100;
  }

  function csrdMapTurnover(val) {
    if (val === '450m+') return 451000000;
    if (val === '150m-450m') return 200000000;
    return 10000000;
  }

  function csrdGetResult() {
    var mandatory = csrdState.employees === '1000+' && csrdState.turnover === '450m+';
    var watchlist = csrdState.employees === '1000+' || csrdState.turnover === '450m+';
    return mandatory ? 'mandatory' : watchlist ? 'watchlist' : 'not_required';
  }

  function csrdRenderVerdict() {
    var resultDiv = document.getElementById('csrd-result');
    if (!resultDiv) return;
    var scope = csrdGetResult();
    var html = '';
    if (scope === 'mandatory') {
      html = '<div style="background:rgba(12,201,168,.1);border:1px solid var(--teal);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--teal);font-size:16px">Your organisation is likely IN SCOPE for CSRD</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Both thresholds exceeded: &gt;1,000 employees and &gt;&euro;450M turnover. Per Directive (EU) 2026/470.</p></div>';
    } else if (scope === 'watchlist') {
      html = '<div style="background:rgba(245,158,11,.1);border:1px solid var(--warn);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--warn);font-size:16px">Watch list &mdash; thresholds may change</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">One threshold exceeded. Monitor regulatory updates as scope criteria may evolve.</p></div>';
    } else {
      html = '<div style="background:rgba(138,157,184,.08);border:1px solid var(--steel);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--cloud);font-size:16px">Your organisation is likely OUT OF SCOPE</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Neither threshold exceeded under current Omnibus I criteria.</p></div>';
    }
    resultDiv.innerHTML = html;
    if (typeof root.showCsrdShare === 'function') root.showCsrdShare();
  }

  async function csrdSubmit() {
    var email = document.getElementById('csrd-email');
    if (!email) return;
    var val = email.value.trim().replace(/[\r\n]+/g, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
    var submitBtn = document.querySelector('#csrd-email-form .btn[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
    try {
      var res = await fetch('https://crowagent-platform-production.up.railway.app/api/v1/csrd/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
        body: JSON.stringify({
          company_name: 'Website visitor',
          email: val,
          employee_count: csrdMapEmployees(csrdState.employees),
          annual_turnover_eur: csrdMapTurnover(csrdState.turnover),
          is_listed: false
        })
      });
      if (!res.ok) throw new Error('API error ' + res.status);
      if (submitBtn) { submitBtn.textContent = 'Sent ✓'; submitBtn.style.color = 'var(--teal)'; }
    } catch (e) {
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.__CA_DEBUG__)) {
        console.error('CSRD email error:', e);
      }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send to my email'; }
    }
  }

  // ── CSRD form submission (blog-article inline form / contact form path) ──
  async function submitCSRD(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('.btn-form');
    var orig = btn.innerHTML;
    btn.innerHTML = 'Sending… <span>⟳</span>';
    btn.disabled = true;

    var inputs = form.querySelectorAll('input');
    var selects = form.querySelectorAll('select');
    var data = {
      company: inputs[0] ? inputs[0].value : '',
      email: inputs[1] ? inputs[1].value : '',
      employees: selects[0] ? selects[0].value : '',
      turnover: selects[1] ? selects[1].value : ''
    };

    try {
      var res = await fetch(
        'https://crowagent-platform-production.up.railway.app/api/v1/csrd/check',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined }
      );
      if (res.ok) {
        btn.innerHTML = '✓ Report sent — check your email';
        btn.style.background = 'var(--success)';
      } else {
        throw new Error('API error ' + res.status);
      }
    } catch (err) {
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.borderColor = 'var(--err)';
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.__CA_DEBUG__)) {
        console.error('CSRD form error:', err);
      }
      var errBox = form.querySelector('.csrd-form-error');
      if (!errBox) {
        errBox = document.createElement('div');
        errBox.className = 'csrd-form-error';
        errBox.setAttribute('role', 'alert');
        errBox.className = 'csrd-form-error ca-alert ca-alert-error';
        errBox.style.marginTop = '12px';
        form.appendChild(errBox);
      }
      errBox.textContent = err && err.name === 'TimeoutError' ? 'Request timed out. Please try again.' : 'Something went wrong. Please email hello@crowagent.ai with your company details.';
      errBox.style.display = 'block';
    }
  }

  // ── CSRD Wizard email blur validation (csrd-email field) ──
  function initCsrdEmailBlurValidation() {
    var el = document.getElementById('csrd-email');
    if (!el) return;
    el.addEventListener('blur', function () {
      var val = el.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      var err = document.getElementById('csrd-email-err');
      if (!ok && val.length > 0) {
        if (!err) {
          err = document.createElement('span');
          err.id = 'csrd-email-err';
          err.style.cssText = 'color:var(--err);font-size:12px;display:block;margin-top:4px';
          err.textContent = 'Please enter a valid email';
          el.parentNode.appendChild(err);
        }
        err.style.display = 'block';
      } else if (err) {
        err.style.display = 'none';
      }
    });
  }

  // ── CSRD share mechanic (LinkedIn share + copy-link) ──
  function initCsrdShare() {
    root.showCsrdShare = function () {
      var panel = document.getElementById('csrdShare');
      if (panel) panel.style.display = 'block';
    };
    var liBtn = document.getElementById('csrdLinkedInShare');
    if (liBtn) {
      liBtn.addEventListener('click', function () {
        var text = encodeURIComponent('I just checked our CSRD reporting eligibility with CrowAgent. Find out if your organisation qualifies: ');
        var url = encodeURIComponent('https://crowagent.ai/csrd');
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url + '&summary=' + text, '_blank', 'noopener,width=600,height=500');
      });
    }
    var copyBtn = document.getElementById('csrdCopyLink');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText('https://crowagent.ai/csrd').then(function () {
          copyBtn.textContent = '✓ Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 2000);
        }).catch(function () {
          copyBtn.textContent = 'crowagent.ai/csrd';
        });
      });
    }
  }

  // ── Expose on window so the CSP-compliant delegation in scripts.js works ──
  root.csrdState = csrdState;
  root.csrdSelect = csrdSelect;
  root.csrdShowStep = csrdShowStep;
  root.csrdMapEmployees = csrdMapEmployees;
  root.csrdMapTurnover = csrdMapTurnover;
  root.csrdGetResult = csrdGetResult;
  root.csrdRenderVerdict = csrdRenderVerdict;
  root.csrdSubmit = csrdSubmit;
  root.submitCSRD = submitCSRD;

  // Init blur validation + share mechanic on DOM ready (idempotent).
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        initCsrdEmailBlurValidation();
        initCsrdShare();
      });
    } else {
      initCsrdEmailBlurValidation();
      initCsrdShare();
    }
  }

  // CommonJS export for jest tests.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      get csrdState() { return csrdState; },
      set csrdState(v) {
        csrdState = v;
        root.csrdState = v;
      },
      csrdSelect: csrdSelect,
      csrdShowStep: csrdShowStep,
      csrdMapEmployees: csrdMapEmployees,
      csrdMapTurnover: csrdMapTurnover,
      csrdGetResult: csrdGetResult,
      csrdRenderVerdict: csrdRenderVerdict,
      csrdSubmit: csrdSubmit,
      submitCSRD: submitCSRD
    };
  }
}(typeof window !== 'undefined' ? window : this));
