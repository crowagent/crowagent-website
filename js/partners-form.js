/**
 * Partners form submission handler.
 * Externalized from inline script for CSP compliance (DEF-003).
 */
(function () {
  var form = document.getElementById('partner-form');
  if (!form) return;
  var errorEl = document.getElementById('partner-form-error');
  var successEl = document.getElementById('partner-form-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

    // Honeypot check (DEF-005) — if filled, silently reject
    var honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    var name = form.querySelector('[name="name"]').value.trim();
    var company = form.querySelector('[name="company"]').value.trim();
    var role = form.querySelector('[name="role"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim().replace(/[\r\n]+/g, '');
    var phone = form.querySelector('[name="phone"]').value.trim();
    var partnerType = form.querySelector('[name="partner_type"]').value;
    var description = form.querySelector('[name="description"]').value.trim();

    if (!name || !company || !role || !email || !partnerType) {
      errorEl.textContent = 'Please complete all required fields.';
      errorEl.style.display = 'block';
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
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
