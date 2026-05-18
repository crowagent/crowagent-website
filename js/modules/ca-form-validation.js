/**
 * ca-form-validation.js — SF42 C3 + T3 (2026-05-18)
 *
 * Central form-validation module. Solves C3 (no central validator) and
 * T3 (no double-submit protection). Exposes window.CAFormValidation with
 *   .attach(formEl, ruleset)  — wire validators + submit guard
 *   .release(formEl)          — manual release for fetch callers
 *   .rules                    — required, email, minLength(n), ukPostcode,
 *                               pattern(rx, msg)
 *
 * ruleset shape: { fieldName: [ruleFn, ...] }. Each rule returns `true` or
 * an error-string. First failing rule per field wins. ES5 only.
 */
(function (root) {
  'use strict';
  if (!root || !root.document) return;

  var doc = root.document;
  var reducedMotion = false;
  try {
    reducedMotion = !!(root.matchMedia &&
      root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  var rules = {
    required: function (v) {
      return (v && String(v).replace(/^\s+|\s+$/g, '').length > 0) ||
        'This field is required.';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')) ||
        'Enter a valid email address.';
    },
    minLength: function (n) {
      return function (v) {
        return String(v || '').length >= n ||
          ('Must be at least ' + n + ' characters.');
      };
    },
    ukPostcode: function (v) {
      return /^([Gg][Ii][Rr] 0[Aa]{2}|[A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2})$/
        .test(String(v || '')) || 'Enter a valid UK postcode.';
    },
    pattern: function (rx, msg) {
      return function (v) {
        return rx.test(String(v || '')) || (msg || 'Invalid format.');
      };
    }
  };

  function ensureId(input, name) {
    if (input.id) return input.id;
    input.id = 'caf-' + name + '-' + Math.random().toString(36).slice(2, 8);
    return input.id;
  }

  function errorElFor(input) {
    var id = input.id + '-err';
    var el = doc.getElementById(id);
    if (el) return el;
    el = doc.createElement('span');
    el.id = id;
    el.className = 'form-error';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.style.display = 'none';
    el.style.opacity = '0';
    if (!reducedMotion) el.style.transition = 'opacity 180ms ease-out';
    var anchor = input.parentNode;
    if (anchor && anchor.nextSibling) {
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    } else if (input.parentNode) {
      input.parentNode.appendChild(el);
    }
    return el;
  }

  function showError(input, msg) {
    var errEl = errorElFor(input);
    errEl.textContent = msg;
    errEl.style.display = 'block';
    void errEl.offsetWidth;
    errEl.style.opacity = '1';
    input.setAttribute('aria-invalid', 'true');
    var described = input.getAttribute('aria-describedby') || '';
    if (described.indexOf(errEl.id) === -1) {
      input.setAttribute('aria-describedby',
        (described ? described + ' ' : '') + errEl.id);
    }
  }

  function clearError(input) {
    if (!input || !input.id) return;
    var errEl = doc.getElementById(input.id + '-err');
    if (errEl) {
      errEl.style.opacity = '0';
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
    input.removeAttribute('aria-invalid');
  }

  function findField(form, name) {
    var byName = form.querySelector('[name="' + name + '"]');
    if (byName) return byName;
    return form.querySelector('#' + name);
  }

  function validateField(input, ruleList) {
    var val = input.value != null ? input.value : '';
    for (var i = 0; i < ruleList.length; i++) {
      var res = ruleList[i](val);
      if (res !== true) return res;
    }
    return true;
  }

  function lock(form, btn) {
    form.dataset.submitting = 'true';
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
    }
  }

  function unlock(form, btn) {
    delete form.dataset.submitting;
    if (btn) {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    }
  }

  function attach(formEl, ruleset) {
    if (!formEl || !ruleset) return;
    if (formEl.dataset.cafAttached === 'true') return;
    formEl.dataset.cafAttached = 'true';

    var btn = formEl.querySelector('button[type="submit"], input[type="submit"]');
    var fieldNames = [];
    for (var fname in ruleset) {
      if (!ruleset.hasOwnProperty(fname)) continue;
      fieldNames.push(fname);
      var input = findField(formEl, fname);
      if (!input) continue;
      ensureId(input, fname);
      errorElFor(input);
      (function (inp) {
        var h = function () { clearError(inp); };
        inp.addEventListener('input', h);
        inp.addEventListener('change', h);
      })(input);
    }

    formEl.addEventListener('submit', function (e) {
      if (formEl.dataset.submitting === 'true') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      var hasError = false;
      var firstInvalid = null;
      for (var i = 0; i < fieldNames.length; i++) {
        var name = fieldNames[i];
        var input = findField(formEl, name);
        if (!input) continue;
        var result = validateField(input, ruleset[name]);
        if (result === true) {
          clearError(input);
        } else {
          showError(input, result);
          hasError = true;
          if (!firstInvalid) firstInvalid = input;
        }
      }
      if (hasError) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (firstInvalid && typeof firstInvalid.focus === 'function') {
          firstInvalid.focus();
        }
        return;
      }
      lock(formEl, btn);
      var releaseTimer = setTimeout(function () {
        unlock(formEl, btn);
      }, 8000);
      formEl.addEventListener('reset', function onReset() {
        clearTimeout(releaseTimer);
        unlock(formEl, btn);
        formEl.removeEventListener('reset', onReset);
      });
      formEl._cafRelease = function () {
        clearTimeout(releaseTimer);
        unlock(formEl, btn);
      };
    }, true);

    if (btn) {
      btn.addEventListener('click', function (e) {
        if (formEl.dataset.submitting === 'true') {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }, true);
    }
  }

  function release(formEl) {
    if (formEl && typeof formEl._cafRelease === 'function') {
      formEl._cafRelease();
    }
  }

  root.CAFormValidation = {
    attach: attach,
    release: release,
    rules: rules
  };
})(typeof window !== 'undefined' ? window : this);
