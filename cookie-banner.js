(function() {
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
    });
  } else {
    injectCookieBanner();
    loadConsentApi();
  }
})();
