/**
 * Cookie consent — public API layer (PECR + UK GDPR)
 *
 * The banner DOM is injected by /cookie-banner.js (root) and the per-button
 * click handlers are wired in scripts.min.js. This file ADDS the public
 * window.crowagentConsent.* API used by:
 *   - /cookies.html "Manage cookie preferences" button
 *   - /privacy.html cookie-preferences link
 *   - any future page that needs to re-open the banner
 *
 * It also adds window.crowagentAnalyticsConsent(true|false) — the explicit
 * hook called from the existing js/analytics-init.js consent flow if/when
 * analytics-init switches to the new convention.
 *
 * Storage:
 *   - Canonical key:  ca_cookie_consent_v2  (JSON: {necessary, analytics, marketing, ts})
 *   - Mirror key:     ca_cookie_consent     (same JSON, kept in sync for the
 *                     legacy boolean readers and the spec wording)
 *
 * Categories: strictly necessary (always on), analytics (PostHog gate), marketing.
 */
(function() {
  'use strict';

  var CONSENT_KEY = 'ca_cookie_consent_v2';
  var MIRROR_KEY = 'ca_cookie_consent';

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) raw = localStorage.getItem(MIRROR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeConsent(analytics, marketing) {
    var consent = {
      necessary: true,
      analytics: !!analytics,
      marketing: !!marketing,
      ts: Date.now()
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      localStorage.setItem(MIRROR_KEY, JSON.stringify(consent));
    } catch (e) { /* localStorage unavailable — silent no-op */ }
    notifyAnalytics(!!analytics);
    return consent;
  }

  function notifyAnalytics(analyticsConsented) {
    // PostHog hook (already wired in js/analytics-init.js)
    if (typeof window.caPostHogConsentUpdate === 'function') {
      window.caPostHogConsentUpdate(analyticsConsented);
    }
    // New convention requested by the brief
    if (typeof window.crowagentAnalyticsConsent === 'function' &&
        window.crowagentAnalyticsConsent !== analyticsConsentDefault) {
      // user-defined override — already called above
    }
  }

  // Default no-op so callers can always reference window.crowagentAnalyticsConsent
  function analyticsConsentDefault(analyticsConsented) {
    if (typeof window.caPostHogConsentUpdate === 'function') {
      window.caPostHogConsentUpdate(!!analyticsConsented);
    }
  }
  if (typeof window.crowagentAnalyticsConsent !== 'function') {
    window.crowagentAnalyticsConsent = analyticsConsentDefault;
  }

  function getBanner() { return document.getElementById('ca-cookie'); }
  function getSimplePanel() { return document.getElementById('ca-cookie-simple'); }
  function getDetailPanel() { return document.getElementById('ca-cookie-detail'); }

  function showBanner(opts) {
    var banner = getBanner();
    if (!banner) {
      // Banner DOM not yet injected (root cookie-banner.js runs on DOMContentLoaded).
      // Defer one tick and retry once.
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { showBanner(opts); }, { once: true });
      } else {
        setTimeout(function() {
          var b = getBanner();
          if (b) showBanner(opts);
        }, 50);
      }
      return;
    }
    var simple = getSimplePanel();
    var detail = getDetailPanel();
    var startWithDetail = opts && opts.detail === true;

    if (simple) simple.style.display = startWithDetail ? 'none' : 'flex';
    if (detail) detail.style.display = startWithDetail ? 'flex' : 'none';

    // Pre-tick checkboxes from stored consent so users see their last choice.
    var stored = readConsent();
    var aChk = document.getElementById('ca-cookie-analytics');
    var mChk = document.getElementById('ca-cookie-marketing');
    if (stored) {
      if (aChk) aChk.checked = !!stored.analytics;
      if (mChk) mChk.checked = !!stored.marketing;
    }

    banner.style.display = 'block';
    banner.setAttribute('aria-hidden', 'false');
  }

  function hideBanner() {
    var banner = getBanner();
    if (banner) {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  function acceptAll()  { writeConsent(true, true);   hideBanner(); }
  function rejectAll()  { writeConsent(false, false); hideBanner(); }
  function setConsent(analytics, marketing) {
    writeConsent(!!analytics, !!marketing);
    hideBanner();
  }

  function getState() {
    var stored = readConsent();
    return stored || { necessary: true, analytics: false, marketing: false, ts: null };
  }

  window.crowagentConsent = {
    showBanner: showBanner,
    hideBanner: hideBanner,
    acceptAll: acceptAll,
    rejectAll: rejectAll,
    setConsent: setConsent,
    getState: getState
  };

  // Wire any "Manage cookie preferences" link/button on the page.
  // Convention: data-action="cookie-preferences" or href="#cookie-preferences"
  function wireTriggers() {
    var triggers = document.querySelectorAll(
      '[data-action="cookie-preferences"], a[href="#cookie-preferences"], a[href="#manage-cookies"], button[data-cookie-prefs]'
    );
    Array.prototype.forEach.call(triggers, function(el) {
      if (el.__caCookieWired) return;
      el.__caCookieWired = true;
      el.addEventListener('click', function(e) {
        e.preventDefault();
        showBanner({ detail: true });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireTriggers);
  } else {
    wireTriggers();
  }
  // Re-wire after nav/footer injection (nav-inject.js)
  document.addEventListener('ca-nav-ready', wireTriggers);
  document.addEventListener('ca-footer-ready', wireTriggers);
})();
