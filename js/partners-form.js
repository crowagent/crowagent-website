/**
 * Partners form submission handler.
 * Externalized from inline script for CSP compliance (DEF-003).
 *
 * WS-AUDIT-024 (2026-05-06): Cloudflare Turnstile is now wired in partners.html
 * via <div class="cf-turnstile" data-sitekey="…" data-callback="onTurnstileSuccess">.
 * Turnstile injects a hidden <input name="cf-turnstile-response"> under the div
 * once it succeeds; the submit handler below already reads that input and
 * rejects the form if no token is present. The callback below is mainly a
 * progressive-enhancement hook so debug builds can observe widget state.
 */
window.onTurnstileSuccess = function (token) {
  if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
    if (typeof console !== 'undefined' && console.info) {
      console.info('[Turnstile] callback fired with token of length', token ? token.length : 0);
    }
  }
};

(function () {
  var form = document.getElementById('partner-form');
  if (!form) return;
  var errorEl = document.getElementById('partner-form-error');
  var successEl = document.getElementById('partner-form-success');

  // WS-AUDIT-037: per-field error messaging. We toggle aria-invalid + the
  // per-field error span when a required value is missing. The aggregated
  // top-of-form error is preserved as a screen-reader fallback.
  function setFieldError(fieldName, msg) {
    var input = form.querySelector('[name="' + fieldName + '"]');
    var errEl = document.getElementById('partner-' + fieldName + '-err');
    if (input) {
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errEl) input.setAttribute('aria-describedby', 'partner-' + fieldName + '-err');
    }
    if (errEl) {
      errEl.textContent = msg || '';
      errEl.style.display = msg ? 'block' : 'none';
    }
  }

  function clearFieldErrors() {
    ['name', 'company', 'role', 'email', 'partner_type'].forEach(function (n) { setFieldError(n, ''); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
    clearFieldErrors();

    // Honeypot check (DEF-005) — if filled, silently reject
    var honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    // WS-AUDIT-006: strip CR/LF on EVERY field that may end up in the mailto:
    // subject or body, not just email. Header-injection guard for legacy mail
    // clients (Apple Mail, Thunderbird) that auto-decode CRLF in mailto URIs.
    var sanitize = function (s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim(); };
    var name = sanitize(form.querySelector('[name="name"]').value);
    var company = sanitize(form.querySelector('[name="company"]').value);
    var role = sanitize(form.querySelector('[name="role"]').value);
    var email = sanitize(form.querySelector('[name="email"]').value);
    var phone = sanitize(form.querySelector('[name="phone"]').value);
    var partnerType = sanitize(form.querySelector('[name="partner_type"]').value);
    var description = sanitize(form.querySelector('[name="description"]').value);

    var hasError = false;
    if (!name) { setFieldError('name', 'Please enter your name.'); hasError = true; }
    if (!company) { setFieldError('company', 'Please enter your company.'); hasError = true; }
    if (!role) { setFieldError('role', 'Please enter your role.'); hasError = true; }
    if (!email) { setFieldError('email', 'Please enter an email address.'); hasError = true; }
    if (!partnerType) { setFieldError('partner_type', 'Please choose a partner type.'); hasError = true; }
    if (hasError) {
      errorEl.textContent = 'Please complete the highlighted fields.';
      errorEl.style.display = 'block';
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFieldError('email', 'Please enter a valid email address.');
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.style.display = 'block';
      return;
    }

    // Turnstile token check, when a valid widget is present.
    var turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (turnstileInput && !turnstileInput.value) {
      if (errorEl) { errorEl.textContent = 'Please complete the security check.'; errorEl.style.display = 'block'; }
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    var payload = {
      name: name,
      company: company,
      role: role,
      email: email,
      phone: phone,
      partner_type: partnerType,
      description: description
    };

    fetch('https://crowagent-platform-production.up.railway.app/api/v1/partners/enquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://crowagent.ai',
      },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (body) {
          throw new Error('Server error ' + res.status + ': ' + body);
        });
      }
      return res.json();
    })
    .then(function () {
      form.style.display = 'none';
      successEl.style.display = 'block';
    })
    .catch(function (err) {
      if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
        console.error('[Partners form] Submission failed:', err);
      }
      // HTML-escape values before mailto construction (DEF-014)
      function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }
      var subject = encodeURIComponent('Partner Enquiry \u2014 ' + company);
      var mailBody = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Role: ' + role + '\n' +
        'Company: ' + company + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'Partner type: ' + partnerType + '\n\n' +
        'About client base:\n' + description
      );
      var mailtoLink = 'mailto:sales@crowagent.ai?subject=' + subject + '&body=' + mailBody;
      errorEl.innerHTML = 'Something went wrong submitting the form. Please <a href="' + escapeHtml(mailtoLink) + '" style="color:var(--teal);text-decoration:underline;">email us directly at sales@crowagent.ai</a> and we\u2019ll pick it up from there.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit enquiry \u2192';
    });
  });
})();
