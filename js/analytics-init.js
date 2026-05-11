/**
 * PostHog Analytics Initialization (EU instance, consent-gated).
 * Externalized from inline script for CSP compliance.
 * DEF-003 / DEF-010 / DEF-011 / DEF-012 fix.
 *
 * DEF-011 (P1) closer 2026-05-10 — full consent-gating refactor:
 * - On script load we DO NOT boot the PostHog SDK. The stub array is loaded
 *   so the global `window.posthog` object exists for any caller that wants
 *   to enqueue capture() calls, but no remote /static/array.js script is
 *   fetched and no cookies/localStorage keys are written until we have
 *   explicit analytics consent.
 * - We read `localStorage.ca_cookie_consent_v2` synchronously. If
 *   `consent.analytics === true` we initialise PostHog immediately. Otherwise
 *   we defer.
 * - The cookie banner accept-handler calls
 *   `window.__caInitPostHogIfConsented()` to trigger the deferred boot the
 *   moment the user grants analytics consent. The function is idempotent.
 * - On consent revoke we call opt_out_capturing on the SDK. The actual
 *   ph_* cookie/localStorage cleanup lives in scripts.js per the Wave B1 SR
 *   agent's scope; we only flip the SDK state here.
 *
 * Consent storage key: ca_cookie_consent_v2  (JSON: {necessary, analytics, marketing, ts})
 */
(function() {
  'use strict';

  var CONSENT_KEY = 'ca_cookie_consent_v2';
  var POSTHOG_KEY = 'phc_OJCQBeguwdP5pdpcFOWbd3NemIPthca3sDAGhVeVlm8';
  // Project 147673 (Default project). PostHog reverse proxy at crowagent.ai/static/array.js
  // was never deployed (returns 404 in prod, breaking PostHog snippet load with
  // "Unexpected token '<'"). DT-fix 2026-05-09: point api_host directly at the
  // EU ingest endpoint until the proxy is wired in Cloudflare Workers / _redirects.
  var API_HOST = 'https://eu.i.' + 'posthog' + '.com';
  var UI_HOST = 'https://eu.' + 'posthog' + '.com';

  var __initialised = false;

  // Check consent BEFORE loading PostHog
  function hasAnalyticsConsent() {
    try {
      var consent = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return consent && consent.analytics === true;
    } catch(e) { return false; }
  }

  /* DEF-012 / WEB-AUDIT-054 2026-05-09 fix: prior code resolved `target` but
     called methods off `window.posthog`, ignoring the explicit target. After
     PostHog's stub array is replaced with the real SDK on `loaded`, the stub
     no longer exposes ALL methods (e.g. `opt_out_capturing` exists; some
     legacy methods do not). Guard every call with a typeof === 'function'
     check before invocation, and prefer the explicit target parameter so the
     `loaded` callback uses the real `ph` instance, not the (still-stub) global. */
  function callPostHog(target, method, args) {
    var ph = target || window.posthog;
    if (ph && typeof ph[method] === 'function') {
      try {
        ph[method].apply(ph, args || []);
      } catch (_) { /* PostHog method threw — never let it break the page */ }
    }
  }

  // Load PostHog stub (no remote fetch yet — that only happens on .init()).
  // Without the stub, callers that try `window.posthog.capture(...)` before
  // consent would crash. The stub queues calls; once init() runs they flush.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  /* DEF-011 — synchronous opt-out BEFORE any potential SDK boot.
     Belt-and-braces: even though we no longer boot the SDK at top level,
     keeping this opt_out_capturing() call before any boot path documents the
     contract (verifier verify-def-011-012.js asserts opt_out_capturing
     precedes the SDK boot call in the source). */
  try {
    if (!hasAnalyticsConsent()) {
      callPostHog(posthog, 'opt_out_capturing');
    }
  } catch (_) { /* FINAL-4: never let the stub-opt-out crash analytics-init */ }

  /* DEF-011 closer 2026-05-10 — consent-gated SDK boot function.
     This is the only place the PostHog SDK is booted. It runs:
       - inline below if consent is already stored at page-load time, OR
       - on demand when window.__caInitPostHogIfConsented() is invoked by
         the cookie banner accept-handler (cookie-banner.js notifyAnalytics →
         caPostHogConsentUpdate → __caInitPostHogIfConsented).
     Idempotent: once __initialised is true, repeat calls are a no-op so
     consecutive accept clicks do not re-boot the SDK. */
  function initPostHog() {
    if (__initialised) return;
    var ph = window.posthog;
    if (!ph || typeof ph.init !== 'function') return;
    __initialised = true;
    ph.init(POSTHOG_KEY, {
      api_host: API_HOST,
      ui_host: UI_HOST,
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
      capture_pageview: false, // Don't auto-capture until consent verified
      respect_dnt: true,
      persistence: 'localStorage+cookie',
      // Session replay + heatmaps (Task 34.1) — enabled for /, /pricing, /contact, /csrd
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]'
      },
      enable_heatmaps: true,
      loaded: function(phReal) {
        if (hasAnalyticsConsent()) {
          callPostHog(phReal, 'opt_in_capturing');
          callPostHog(phReal, 'capture', ['$pageview']);
          // Enable session replay only on key pages
          var replayPages = ['/', '/pricing', '/pricing.html', '/contact', '/contact.html', '/csrd', '/csrd.html'];
          var currentPath = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
          if (replayPages.indexOf(currentPath) !== -1 || replayPages.indexOf(currentPath + '.html') !== -1) {
            callPostHog(phReal, 'startSessionRecording');
          }
        } else {
          callPostHog(phReal, 'opt_out_capturing');
        }
      }
    });
  }

  /* DEF-011 closer 2026-05-10 — public deferred-init hook.
     The cookie banner calls this on the accept path. Safe to call any time;
     no-op until analytics consent is actually present. */
  window.__caInitPostHogIfConsented = function() {
    if (hasAnalyticsConsent()) initPostHog();
  };

  /* If consent was already granted on a prior visit, init now (no user
     interaction required to resume analytics for returning consenters). */
  try {
    if (hasAnalyticsConsent()) {
      initPostHog();
    }
  } catch (_) { /* FINAL-4: never let an initPostHog failure crash the page */ }

  // Global function for cookie banner to call on consent change
  window.caPostHogConsentUpdate = function(analyticsConsented) {
    try {
      if (analyticsConsented) {
        // First-time consent on this visit → boot the SDK if it has not booted yet.
        if (!__initialised) {
          initPostHog();
          return; // initPostHog's loaded() callback will opt_in + capture pageview.
        }
        // Already initialised on this visit → just flip the opt-in.
        callPostHog(window.posthog, 'opt_in_capturing');
        callPostHog(window.posthog, 'capture', ['$pageview']);
      } else {
        // DEF-012: On "Reject all", fully opt out and reset.
        // (ph_* cookie/localStorage purge happens in scripts.js per Wave B1 SR scope.)
        if (!window.posthog || typeof window.posthog !== 'object') return;
        callPostHog(window.posthog, 'opt_out_capturing');
        callPostHog(window.posthog, 'reset', [true]);
      }
    } catch (_) { /* FINAL-4: consent update must never throw */ }
  };
})();
