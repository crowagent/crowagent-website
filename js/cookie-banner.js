/**
 * Cookie consent — single-source-of-truth (PECR + UK GDPR)
 *
 * WS-AUDIT-028 (2026-05-10): consolidated. Previously the banner DOM
 * was injected by /cookie-banner.js (root, 60 LOC) and the consent API
 * lived here in /js/cookie-banner.js (165 LOC). The split caused
 * duplicate-include defects (e.g. ppn-014-cyber-essentials-guide.html
 * loaded both files) and made the banner-show race-condition harder
 * to reason about (WS-AUDIT-027). Now everything lives here:
 *   - Banner HTML + insertion (was in root cookie-banner.js)
 *   - First-load show logic (was in root cookie-banner.js)
 *   - window.crowagentConsent.* public API
 *   - PECR-safe writeConsent + analytics hook
 * Root /cookie-banner.js is reduced to a 4-line shim that imports this
 * file, so all 59 existing <script src="/cookie-banner.js"> includes
 * keep working without per-page edits.
 *
 * WS-AUDIT-027 (2026-05-10): banner-show no longer waits 1500ms. As soon
 * as the DOM is ready, we inject the banner and (if no stored consent)
 * make it visible synchronously. PostHog init is consent-gated separately
 * in js/analytics-init.js, so eager banner-show cannot leak data.
 *
 * Storage:
 *   - Canonical key:  ca_cookie_consent_v2  (JSON: {necessary, analytics, marketing, ts})
 *   - Mirror key:     ca_cookie_consent     (legacy boolean readers)
 *
 * Categories: strictly necessary (always on), analytics (PostHog gate), marketing.
 */
(function () {
  'use strict';

  // Idempotency guard — if /cookie-banner.js loaded the shim and the shim
  // injected this script, AND a page also has an explicit /js/cookie-banner.js
  // tag (now removed everywhere by WS-AUDIT-028 sweep), do not double-init.
  if (window.__caCookieBannerLoaded) return;
  window.__caCookieBannerLoaded = true;

  var CONSENT_KEY = 'ca_cookie_consent_v2';
  var MIRROR_KEY = 'ca_cookie_consent';

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) raw = localStorage.getItem(MIRROR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function hasStoredConsent() {
    try {
      return !!(localStorage.getItem(CONSENT_KEY) ||
                localStorage.getItem(MIRROR_KEY) ||
                localStorage.getItem('ca-cookie-ok'));
    } catch (_) { return true; /* if storage is unavailable, do not nag */ }
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
    /* DEF-011 closer 2026-05-10 — when the user grants analytics consent,
       trigger the deferred PostHog init defined in js/analytics-init.js.
       Belt-and-braces: caPostHogConsentUpdate also boots the SDK on
       first-time consent, but calling __caInitPostHogIfConsented() first
       guarantees init even if a downstream override of
       caPostHogConsentUpdate has been wired by a host page. */
    if (analyticsConsented && typeof window.__caInitPostHogIfConsented === 'function') {
      try { window.__caInitPostHogIfConsented(); } catch (_) { /* never break the page */ }
    }
    // PostHog hook (already wired in js/analytics-init.js)
    if (typeof window.caPostHogConsentUpdate === 'function') {
      window.caPostHogConsentUpdate(analyticsConsented);
    }
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

  /* ── Banner DOM injection (was /cookie-banner.js) ─────────────────── */
  function injectCookieBanner() {
    if (getBanner()) return; // already injected (idempotent)
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
            '<div><label for="ca-cookie-analytics" class="cookie-cat-name">Analytics cookies</label><span class="cookie-cat-desc">Usage analytics via PostHog EU. Helps us improve the product.</span></div>' +
            '<label class="cookie-toggle" aria-label="Analytics cookies toggle"><input type="checkbox" id="ca-cookie-analytics" class="cookie-chk"><span class="cookie-slider"></span></label>' +
          '</div>' +
          '<div class="cookie-toggle-row">' +
            '<div><label for="ca-cookie-marketing" class="cookie-cat-name">Marketing cookies</label><span class="cookie-cat-desc">Remarketing and conversion tracking. None currently active.</span></div>' +
            '<label class="cookie-toggle" aria-label="Marketing cookies toggle"><input type="checkbox" id="ca-cookie-marketing" class="cookie-chk"><span class="cookie-slider"></span></label>' +
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

  /* ── First-load show ──────────────────────────────────────────────────
     WS-AUDIT-027 (2026-05-10 closer): banner show runs on DOMContentLoaded
     and is INDEPENDENT of scripts.min.js load state — the boot() entry
     below is wired to DOMContentLoaded directly, so even if scripts.min.js
     is slow / blocked / cached-stale the banner still renders.
     Guard: if a consent decision is already stored (any of the canonical /
     mirror / legacy keys), do NOT re-render the banner. The user has
     decided; respect it until they re-open via "Manage cookie preferences".
     Idempotent: a second call to showBannerOnFirstLoad is a no-op once the
     banner is on screen (we re-check display state). */
  function showBannerOnFirstLoad() {
    if (hasStoredConsent()) return;
    var banner = getBanner();
    if (!banner) return;
    // Don't re-render if banner is already visible (e.g. from a previous boot()).
    if (banner.style.display === 'block') return;
    banner.style.display = 'block';
    banner.setAttribute('aria-hidden', 'false');
  }

  /* ── Public API: showBanner / hideBanner / accept / reject ────────── */
  function showBanner(opts) {
    var banner = getBanner();
    if (!banner) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { showBanner(opts); }, { once: true });
      } else {
        setTimeout(function () { var b = getBanner(); if (b) showBanner(opts); }, 50);
      }
      return;
    }
    var simple = getSimplePanel();
    var detail = getDetailPanel();
    var startWithDetail = opts && opts.detail === true;

    if (simple) simple.style.display = startWithDetail ? 'none' : 'flex';
    if (detail) detail.style.display = startWithDetail ? 'flex' : 'none';

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
  function wireTriggers() {
    var triggers = document.querySelectorAll(
      '[data-action="cookie-preferences"], a[href="#cookie-preferences"], a[href="#manage-cookies"], button[data-cookie-prefs]'
    );
    Array.prototype.forEach.call(triggers, function (el) {
      if (el.__caCookieWired) return;
      el.__caCookieWired = true;
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showBanner({ detail: true });
      });
    });
  }

  /* ── Boot sequence ───────────────────────────────────────────────────
     1. Inject the banner DOM (idempotent)
     2. Show on first-load if no stored consent (synchronous — WS-AUDIT-027)
     3. Wire any "manage cookies" triggers on the page
     4. Re-wire after nav/footer injection (ca-nav-ready / ca-footer-ready —
        WS-AUDIT-013 dispatched from js/nav-inject.js) */
  function boot() {
    // FINAL-4 (2026-05-10): wrap each step. cookie-banner.js is a defer
    // script — a top-level throw here surfaces as a pageerror in Firefox's
    // audit, which fed into the NS_ERROR_FAILURE counts on 26 pages. Wrap
    // each step independently so a single failure does not cascade.
    try { injectCookieBanner(); } catch (e) { /* banner inject failed — page still works */ }
    try { showBannerOnFirstLoad(); } catch (e) { /* show failed — user can still open via /cookie-preferences */ }
    try { wireTriggers(); } catch (e) { /* trigger wiring failed — no preference link */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('ca-nav-ready', function () {
    try { wireTriggers(); } catch (e) { /* never break the page on re-wire */ }
  });
  document.addEventListener('ca-footer-ready', function () {
    try { wireTriggers(); } catch (e) { /* never break the page on re-wire */ }
  });
})();
