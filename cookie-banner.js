(function() {
  // WS-AUDIT-027: ensure the banner shows on first-load even if scripts.min.js
  // fails to load. PostHog (analytics-init.js) opts-out synchronously when
  // there is no stored consent, so we are PECR-safe; this function just makes
  // the banner reliably visible to the user so they can opt in.
  var CONSENT_KEY_V2 = 'ca_cookie_consent_v2';
  var CONSENT_KEY_LEGACY = 'ca_cookie_consent';

  function hasStoredConsent() {
    try {
      return !!(localStorage.getItem(CONSENT_KEY_V2) || localStorage.getItem(CONSENT_KEY_LEGACY) || localStorage.getItem('ca-cookie-ok'));
    } catch (_) { return true; /* if storage is unavailable, do not nag */ }
  }

  function showBannerOnFirstLoad() {
    if (hasStoredConsent()) return;
    // scripts.min.js handler shows the banner with an 800ms delay and is the
    // primary path. We schedule a fallback at 1500ms in case scripts.min.js
    // is missing or failed to parse — at which point we make the banner
    // visible directly. Both paths are idempotent.
    setTimeout(function() {
      var banner = document.getElementById('ca-cookie');
      if (banner && banner.style.display === 'none') {
        banner.style.display = 'block';
        banner.setAttribute('aria-hidden', 'false');
      }
    }, 1500);
  }

  function injectCookieBanner() {
    var bannerHTML = '<div id="ca-cookie" class="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg);border-top:1px solid var(--border);padding:20px 24px;z-index:9999">' +
      '<div class="cookie-inner">' +
        '<div class="cookie-text">' +
          '<strong style="color:var(--cloud);font-size:14px;">Cookie preferences</strong>' +
          '<p style="margin:6px 0 0;font-size:13px;color:var(--steel);">We use cookies to improve your experience and analyse site usage. <a href="/cookies" style="color:var(--teal);text-decoration:underline;">Cookie policy</a></p>' +
        '</div>' +
        '<div id="ca-cookie-simple" class="cookie-actions">' +
          '<button id="ca-cookie-manage" class="btn-cookie-outline">Manage preferences</button>' +
          '<button id="ca-cookie-reject" class="btn-cookie-outline">Reject all</button>' +
          '<button id="ca-cookie-accept" class="btn-cookie-primary">Accept all</button>' +
        '</div>' +
        '<div id="ca-cookie-detail" class="cookie-detail" style="display:none">' +
          '<div class="cookie-toggle-row">' +
            '<div><span class="cookie-cat-name">Necessary</span><span class="cookie-cat-desc">Session management, security. Always active.</span></div>' +
            '<div class="cookie-toggle cookie-toggle-locked" aria-label="Always active"><span class="toggle-on">On</span></div>' +
          '</div>' +
          '<div class="cookie-toggle-row">' +
            '<div><span class="cookie-cat-name">Analytics</span><span class="cookie-cat-desc">Usage analytics via PostHog EU. Helps us improve the product.</span></div>' +
            '<label class="cookie-toggle" aria-label="Analytics cookies"><input type="checkbox" id="ca-cookie-analytics" class="cookie-chk"><span class="cookie-slider"></span></label>' +
          '</div>' +
          '<div class="cookie-toggle-row">' +
            '<div><span class="cookie-cat-name">Marketing</span><span class="cookie-cat-desc">Remarketing and conversion tracking. None currently active.</span></div>' +
            '<label class="cookie-toggle" aria-label="Marketing cookies"><input type="checkbox" id="ca-cookie-marketing" class="cookie-chk"><span class="cookie-slider"></span></label>' +
          '</div>' +
          '<div class="cookie-detail-actions">' +
            '<button id="ca-cookie-save" class="btn-cookie-primary">Save preferences</button>' +
            '<button id="ca-cookie-accept-all" class="btn-cookie-outline">Accept all</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = bannerHTML;
    document.body.appendChild(tempDiv.firstChild);
  }

  function loadConsentApi() {
    // Public consent API + window.crowagentConsent.* — loaded on every page
    if (document.querySelector('script[data-ca-consent-api]')) return;
    var s = document.createElement('script');
    s.src = '/js/cookie-banner.js';
    s.defer = true;
    s.setAttribute('data-ca-consent-api', '1');
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectCookieBanner();
      loadConsentApi();
      showBannerOnFirstLoad();
    });
  } else {
    injectCookieBanner();
    loadConsentApi();
    showBannerOnFirstLoad();
  }
})();
