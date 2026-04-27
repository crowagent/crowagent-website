/**
 * homepage-compliance-widget.js
 *
 * Replaces the previous Gemini-backed runLiveDemo() (POST app.crowagent.ai/api/chat/public).
 * That call was non-deterministic AND rendered into innerHTML — see WP-301 / docs/wp-301-findings.md.
 *
 * This module renders a fixed informational block. No network call, no LLM, no innerHTML.
 * Copy is regulation-vetted (CLAUDE.md §16) — do not reword.
 */
(function () {
  'use strict';

  var UK_POSTCODE_RE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;
  var SIGNUP_URL = 'https://app.crowagent.ai/signup?plan=starter';

  function $(id) { return document.getElementById(id); }

  function showError(msg) {
    var el = $('demo-error');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.classList.remove('is-hidden');
  }

  function clearError() {
    var el = $('demo-error');
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
    el.classList.add('is-hidden');
  }

  function clearResult() {
    var el = $('demo-result');
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
    el.hidden = true;
    el.classList.add('is-hidden');
  }

  function resetWidget() {
    clearResult();
    clearError();
    var input = $('demo-postcode');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildResult(postcode) {
    var container = el('div', 'demo-result-block');

    container.appendChild(el('div', 'demo-result-eyebrow', 'COMPLIANCE CHECK RESULT'));

    container.appendChild(el(
      'p',
      'demo-result-prose',
      'CrowAgent Core automates MEES compliance across your commercial property portfolio. ' +
      'This free check does not query individual properties — start a trial to upload your portfolio ' +
      'and run automated EPC gap analysis, retrofit cost modelling, and SI 2015/962 reg 39 penalty exposure.'
    ));

    var list = el('ul', 'demo-result-list');
    list.appendChild(el('li', null, 'Automates EPC gap analysis to identify non-compliant assets.'));
    list.appendChild(el('li', null, 'Models retrofit costs against the proposed 2028 Band C target.'));
    list.appendChild(el(
      'li', null,
      'Quantifies penalty exposure (rateable-value based, capped at £150,000 per SI 2015/962 reg 39).'
    ));
    container.appendChild(list);

    var actions = el('div', 'demo-result-actions');

    var primary = el('a', 'btn btn-md btn-primary-v2', 'Get your full report — start free trial →');
    var url = SIGNUP_URL;
    if (postcode) url += '&postcode=' + encodeURIComponent(postcode);
    primary.href = url;
    actions.appendChild(primary);

    var secondary = el('button', 'demo-result-reset', 'Check another postcode →');
    secondary.type = 'button';
    secondary.addEventListener('click', resetWidget);
    actions.appendChild(secondary);

    container.appendChild(actions);

    return container;
  }

  function render(postcode) {
    clearError();
    var resultEl = $('demo-result');
    if (!resultEl) return;
    while (resultEl.firstChild) resultEl.removeChild(resultEl.firstChild);
    resultEl.appendChild(buildResult(postcode));
    resultEl.hidden = false;
    resultEl.classList.remove('is-hidden');
  }

  function runDemo() {
    var input = $('demo-postcode');
    if (!input) return;
    var raw = (input.value || '').trim();
    if (!UK_POSTCODE_RE.test(raw)) {
      clearResult();
      showError('Enter a valid UK postcode.');
      return;
    }
    var postcode = raw.toUpperCase();

    if (typeof window.caSaveIntent === 'function') window.caSaveIntent(postcode);
    if (typeof window.posthog !== 'undefined' && window.posthog.capture) {
      window.posthog.capture('demo_postcode_submitted', { postcode: postcode });
    }

    render(postcode);
  }

  function init() {
    var input = $('demo-postcode');
    var submit = $('demo-submit');
    if (!input || !submit) return;

    input.addEventListener('input', function () {
      input.value = input.value.toUpperCase();
      clearError();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        runDemo();
      }
    });
    submit.addEventListener('click', function (e) {
      e.preventDefault();
      runDemo();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
