/**
 * Unified Form Submission Library — CrowAgent Marketing Site
 * Task 35.2: Single lib solving newline stripping, double-submit prevention,
 * ARIA-live announcements, autocomplete, telemetry, and first-party migration path.
 *
 * Usage:
 *   caFormSubmit(form, {
 *     endpoint: 'https://...',
 *     method: 'POST',
 *     onSuccess: function(data) { ... },
 *     onError: function(err) { ... },
 *     successMessage: 'Sent!',
 *     errorMessage: 'Something went wrong.',
 *     timeout: 8000
 *   });
 */
(function() {
  'use strict';

  var SUBMITTING = new WeakSet();

  /**
   * Strip newlines from form values (prevents header injection in email fields)
   */
  function sanitizeValue(val) {
    if (typeof val !== 'string') return val;
    return val.replace(/[\r\n]+/g, '').trim();
  }

  /**
   * Create or get ARIA live region for form announcements
   */
  function getAnnouncer(form) {
    var id = 'ca-form-announce-' + (form.id || Math.random().toString(36).slice(2));
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only';
      form.parentNode.insertBefore(el, form.nextSibling);
    }
    return el;
  }

  /**
   * Announce message to screen readers
   */
  function announce(form, message) {
    var announcer = getAnnouncer(form);
    announcer.textContent = '';
    // Force re-announcement by clearing then setting
    setTimeout(function() { announcer.textContent = message; }, 50);
  }

  /**
   * Collect form data with sanitization
   */
  function collectFormData(form) {
    var data = {};
    var inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(function(input) {
      if (!input.name || input.type === 'submit' || input.type === 'button') return;
      // Skip honeypot fields
      if (input.name === 'website' || input.name === '_gotcha') return;
      if (input.type === 'checkbox') {
        data[input.name] = input.checked;
      } else {
        data[input.name] = sanitizeValue(input.value);
      }
    });
    return data;
  }

  /**
   * Main form submission handler
   */
  function caFormSubmit(form, options) {
    if (!form || !options) return;

    var opts = Object.assign({
      endpoint: '',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 8000,
      successMessage: 'Submitted successfully.',
      errorMessage: 'Something went wrong. Please try again.',
      timeoutMessage: 'Request timed out. Please try again.',
      onSuccess: null,
      onError: null,
      telemetry: true,
      useFormData: false
    }, options);

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Double-submit prevention
      if (SUBMITTING.has(form)) return;
      SUBMITTING.add(form);

      // Honeypot check
      var honeypot = form.querySelector('[name="website"], [name="_gotcha"]');
      if (honeypot && honeypot.value) {
        SUBMITTING.delete(form);
        return;
      }

      var submitBtn = form.querySelector('[type="submit"], .btn-form, .notify-btn');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending\u2026';
        submitBtn.setAttribute('aria-busy', 'true');
      }

      announce(form, 'Submitting form\u2026');

      var body;
      var headers = Object.assign({}, opts.headers);
      if (opts.useFormData) {
        body = new FormData(form);
        // Remove honeypot from FormData
        body.delete('website');
        body.delete('_gotcha');
        delete headers['Content-Type']; // Let browser set multipart boundary
      } else {
        body = JSON.stringify(collectFormData(form));
      }

      var fetchOpts = {
        method: opts.method,
        headers: headers,
        body: body
      };

      // Add AbortSignal.timeout if available (DEF-042)
      if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
        fetchOpts.signal = AbortSignal.timeout(opts.timeout);
      }

      fetch(opts.endpoint, fetchOpts)
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json().catch(function() { return {}; });
        })
        .then(function(responseData) {
          SUBMITTING.delete(form);
          announce(form, opts.successMessage);
          if (submitBtn) {
            submitBtn.textContent = '\u2713 ' + opts.successMessage;
            submitBtn.style.color = 'var(--teal, #0CC9A8)';
            submitBtn.setAttribute('aria-busy', 'false');
          }
          if (opts.onSuccess) opts.onSuccess(responseData);
          // Telemetry
          if (opts.telemetry && typeof posthog !== 'undefined') {
            posthog.capture('form_submitted', {
              form_id: form.id || 'unknown',
              endpoint: opts.endpoint,
              page: window.location.pathname
            });
          }
        })
        .catch(function(err) {
          SUBMITTING.delete(form);
          var isTimeout = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
          var message = isTimeout ? opts.timeoutMessage : opts.errorMessage;
          announce(form, message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.setAttribute('aria-busy', 'false');
          }
          // Show visible error
          var errEl = form.querySelector('[role="alert"], .form-error, .ca-alert-error');
          if (!errEl) {
            errEl = document.createElement('div');
            errEl.setAttribute('role', 'alert');
            errEl.className = 'ca-alert ca-alert-error';
            errEl.style.marginTop = '12px';
            form.appendChild(errEl);
          }
          errEl.textContent = message;
          errEl.style.display = 'block';
          if (opts.onError) opts.onError(err);
        });
    });
  }

  // Export
  window.caFormSubmit = caFormSubmit;
  window.caFormSanitizeValue = sanitizeValue;
  window.caFormCollectData = collectFormData;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { caFormSubmit: caFormSubmit, sanitizeValue: sanitizeValue, collectFormData: collectFormData };
  }
})();
