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

  /* ── A2 (2026-05-18): Focus trap. WCAG 2.1.2 (No Keyboard Trap) is about
     allowing keyboard exit; the SC actually wants focus to STAY inside
     transient surfaces like a consent banner so screen-reader users do not
     "tab past" the decision and miss it. Pattern: capture prior focus on
     open, ring focus between the first and last focusable elements while
     visible, restore prior focus on close. */
  var __caFocusReturnTarget = null;
  var __caFocusTrapAttached = false;

  function getFocusableInBanner() {
    var banner = getBanner();
    if (!banner) return [];
    var sel = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    var nodes = banner.querySelectorAll(sel);
    var visible = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      // Skip elements inside a hidden panel (display:none ancestor inside the banner).
      var hidden = false;
      var p = n;
      while (p && p !== banner) {
        if (p.style && p.style.display === 'none') { hidden = true; break; }
        p = p.parentElement;
      }
      if (!hidden) visible.push(n);
    }
    return visible;
  }

  function onTrapKeydown(e) {
    var banner = getBanner();
    if (!banner || banner.style.display !== 'block') return;
    // WCAG 2.1.2 — Escape key releases the focus trap (move focus to main content).
    if (e.key === 'Escape') {
      e.preventDefault();
      var main = document.getElementById('main-content') || document.querySelector('main');
      if (main) { try { main.focus(); } catch (_) {} }
      return;
    }
    if (e.key !== 'Tab') return;
    var focusables = getFocusableInBanner();
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;
    // If focus has escaped the banner, drag it back.
    if (!banner.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }
    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function activateFocusTrap() {
    var banner = getBanner();
    if (!banner) return;
    try {
      // Capture trigger to restore on close. Skip if the active element IS
      // already inside the banner (re-show case).
      var active = document.activeElement;
      if (active && active !== document.body && !banner.contains(active)) {
        __caFocusReturnTarget = active;
      }
    } catch (_) { /* ignore */ }
    try { document.body.classList.add('cookie-banner-active'); } catch (_) {}
    if (!__caFocusTrapAttached) {
      document.addEventListener('keydown', onTrapKeydown, true);
      __caFocusTrapAttached = true;
    }
    // Initial focus on first focusable element inside banner.
    var focusables = getFocusableInBanner();
    if (focusables.length > 0) {
      // Defer to next frame so injected DOM is laid out before focus call.
      var target = focusables[0];
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(function () { try { target.focus(); } catch (_) {} });
      } else {
        try { target.focus(); } catch (_) {}
      }
    }
  }

  function deactivateFocusTrap() {
    try { document.body.classList.remove('cookie-banner-active'); } catch (_) {}
    if (__caFocusTrapAttached) {
      document.removeEventListener('keydown', onTrapKeydown, true);
      __caFocusTrapAttached = false;
    }
    if (__caFocusReturnTarget && typeof __caFocusReturnTarget.focus === 'function') {
      try { __caFocusReturnTarget.focus(); } catch (_) {}
    }
    __caFocusReturnTarget = null;
  }

  /* ── Banner DOM injection (was /cookie-banner.js) ─────────────────── */
  function injectCookieBanner() {
    if (getBanner()) return; // already injected (idempotent)
    /* JS-runtime audit 2026-05-17 (PART B): added role="region" +
       aria-label so screen readers announce the consent surface, and
       aria-live="polite" so dynamic detail-panel expansion is announced.
       The banner is intentionally NOT role="dialog" (would steal focus on
       first paint, regressing LCP and trapping users). The Esc-to-dismiss
       behaviour is wired below in the boot sequence. */
    /* WS-COOKIE-SLIM (2026-05-22): inline styles slimmed to match the
       Stripe-pattern 56–72px bar. CSS in styles.css carries the
       responsive/heavy lifting via !important rules; inline styles
       remain minimal so display:none toggling stays cheap. The
       "Cookie preferences" strong heading is hidden on mobile via
       CSS so the message line fits on a 390px viewport. */
    var bannerHTML = '<div id="ca-cookie" class="cookie-banner" role="region" aria-label="Cookie consent" aria-live="polite" style="display:none">' +
      '<div class="cookie-inner">' +
        '<div class="cookie-text">' +
          '<strong class="ca-cookie-title">Cookie preferences</strong>' +
          '<p class="ca-cookie-desc">We use cookies to improve your experience and analyse site usage. <a href="/cookies" style="color:var(--ca-teal, #0CC9A8);text-decoration:underline;font-weight:bold;">Cookie policy</a></p>' +
        '</div>' +
        '<div id="ca-cookie-simple" class="cookie-actions">' +
          '<button id="ca-cookie-manage" class="btn-cookie-outline" aria-label="Manage cookie preferences"><span class="cookie-btn-long">Manage preferences</span><span class="cookie-btn-short" aria-hidden="true">Manage</span></button>' +
          '<button id="ca-cookie-reject" class="btn-cookie-outline">Reject all</button>' +
          '<button id="ca-cookie-accept" class="btn-cookie-primary">Accept all</button>' +
        '</div>' +
        '<div id="ca-cookie-detail" class="cookie-detail" style="display:none">' +
          '<div class="cookie-toggle-row">' +
            '<div><span class="cookie-cat-name">Necessary</span><span class="cookie-cat-desc">Session management, security. Always active.</span></div>' +
            '<div class="cookie-toggle cookie-toggle-locked" aria-label="Always active"><span class="toggle-on">On</span></div>' +
          '</div>' +
          /* ISSUE-037 (2026-05-22): single accessible label per toggle.
             Previously each row had a duplicate label (a category-name
             <label for>, plus an aria-label="… toggle" on the wrapping
             <label> around the checkbox). Screen readers announced the
             label twice or computed an ambiguous accessible name. Now:
             - Single <label for> on the category-name (visible)
             - <input role="switch" aria-describedby> on the checkbox
             - sr-only secondary label disambiguates the action only when
               the user reaches it directly with screen-reader navigation
             Result: VoiceOver announces "Analytics cookies, switch, off". */
          '<div class="cookie-toggle-row">' +
            '<div><label for="ca-cookie-analytics" class="cookie-cat-name">Analytics cookies</label><span class="cookie-cat-desc" id="ca-cookie-analytics-desc">Usage analytics via PostHog EU. Helps us improve the product.</span></div>' +
            '<label class="cookie-toggle"><input type="checkbox" id="ca-cookie-analytics" class="cookie-chk" role="switch" aria-describedby="ca-cookie-analytics-desc"><span class="cookie-slider" aria-hidden="true"></span><span class="cookie-pref-toggle-sr">Enable analytics cookies</span></label>' +
          '</div>' +
          '<div class="cookie-toggle-row">' +
            '<div><label for="ca-cookie-marketing" class="cookie-cat-name">Marketing cookies</label><span class="cookie-cat-desc" id="ca-cookie-marketing-desc">Remarketing and conversion tracking. None currently active.</span></div>' +
            '<label class="cookie-toggle"><input type="checkbox" id="ca-cookie-marketing" class="cookie-chk" role="switch" aria-describedby="ca-cookie-marketing-desc"><span class="cookie-slider" aria-hidden="true"></span><span class="cookie-pref-toggle-sr">Enable marketing cookies</span></label>' +
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
    try { document.body.classList.add('has-cookie-banner'); } catch (_) {}
    activateFocusTrap();
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
    try { document.body.classList.add('has-cookie-banner'); } catch (_) {}
    activateFocusTrap();
  }

  function hideBanner() {
    var banner = getBanner();
    if (banner) {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
    }
    try { document.body.classList.remove('has-cookie-banner'); } catch (_) {}
    deactivateFocusTrap();
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

  /* JS-runtime audit 2026-05-17 (PART B): Esc-to-dismiss. PECR-safe default
     is "reject all" — actively dismissing the consent UI without choosing
     should not be treated as consent. There was a parallel handler in
     scripts.js (line 1187) that targeted the WRONG id (`ca-cookie-banner`
     instead of `ca-cookie`) so Esc did nothing in the audit. This handler
     uses the correct id and never duplicates work if a future scripts.js
     fix lands (rejectAll is idempotent — second call writes same value).
     Only fires when the banner is actually visible (display:block) so we
     don't steal Escape from other dialogs (chatbot, modals). */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var banner = getBanner();
    if (!banner || banner.style.display !== 'block') return;
    // Reject = PECR-safe dismissal.
    try { rejectAll(); } catch (_) { /* never break page */ }
  });
})();
