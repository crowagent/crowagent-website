/**
 * Demo page Calendly loader — consent-gated (WS-AUDIT-014).
 *
 * The Calendly iframe sets cookies on calendly.com (a third-party processor)
 * and is therefore not "strictly necessary" under PECR. We do not load
 * https://assets.calendly.com/assets/external/widget.js until ONE of:
 *
 *   1. The user has already granted marketing consent in
 *      ca_cookie_consent_v2.marketing === true, OR
 *   2. The user clicks "Load scheduler" on the inline consent gate.
 *
 * Until then the consent-gate placeholder is shown; the user can also use
 * the secondary "Open on calendly.com" link to leave the site instead.
 *
 * Once loaded, Calendly cookies are scoped to calendly.com and persist on
 * that origin. We do not embed the widget unless the user has chosen to.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'ca_cookie_consent_v2';
  var WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';
  var BOOKING_URL = 'https://calendly.com/crowagent-platform/30min?hide_gdpr_banner=1';

  function hasMarketingConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return false;
      var c = JSON.parse(raw);
      return c && c.marketing === true;
    } catch (_) { return false; }
  }

  function injectWidget() {
    var mount = document.getElementById('calendly-mount');
    var gate = document.getElementById('calendly-consent-gate');
    if (!mount) return;
    if (mount.dataset.loaded === '1') return;
    mount.dataset.loaded = '1';

    // Build the Calendly inline-widget div.
    var div = document.createElement('div');
    div.className = 'calendly-inline-widget';
    div.setAttribute('data-url', BOOKING_URL);
    div.style.width = '100%';
    div.style.height = '800px';
    div.style.minHeight = '800px';
    mount.appendChild(div);

    // Hide the consent gate.
    if (gate) gate.hidden = true;

    // Inject the widget script if not already present.
    if (!document.querySelector('script[src="' + WIDGET_SRC + '"]')) {
      var s = document.createElement('script');
      s.src = WIDGET_SRC;
      s.defer = true;
      document.head.appendChild(s);
    }
  }

  function showGate() {
    var gate = document.getElementById('calendly-consent-gate');
    if (gate) gate.hidden = false;
  }

  function init() {
    if (hasMarketingConsent()) {
      injectWidget();
      return;
    }
    showGate();
    var btn = document.getElementById('calendly-accept');
    if (btn) {
      btn.addEventListener('click', function () { injectWidget(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
