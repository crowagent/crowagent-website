/**
 * PostHog Analytics Initialization (EU instance, consent-gated).
 * Externalized from inline script for CSP compliance.
 * DEF-003 / DEF-010 / DEF-011 / DEF-012 fix.
 *
 * Consent flow:
 * - PostHog is loaded but opt_out_capturing() is called synchronously if no consent
 * - posthog.init() only fires capture if consent is already granted
 * - On "Accept": opt_in_capturing() is called
 * - On "Reject all": opt_out_capturing() + reset(true) clears all data
 */
(function() {
  'use strict';

  var CONSENT_KEY = 'ca_cookie_consent_v2';

  // Check consent BEFORE loading PostHog
  function hasAnalyticsConsent() {
    try {
      var consent = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return consent && consent.analytics === true;
    } catch(e) { return false; }
  }

  function callPostHog(target, method, args) {
    if (target && typeof target[method] === 'function') {
      target[method].apply(target, args || []);
    }
  }

  // Load PostHog stub
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  // Opt out synchronously BEFORE init if no consent (DEF-011)
  if (!hasAnalyticsConsent()) {
    callPostHog(posthog, 'opt_out_capturing');
  }

  // Project 147673 (Default project) routed via managed reverse proxy at crowagent.ai
  // ui_host keeps PostHog-dashboard links pointing back at eu.posthog.com.
  posthog.init('phc_OJCQBeguwdP5pdpcFOWbd3NemIPthca3sDAGhVeVlm8', {
    api_host: 'https://crowagent.ai',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    capture_pageview: false, // Don't auto-capture until consent verified
    respect_dnt: true,
    persistence: hasAnalyticsConsent() ? 'localStorage+cookie' : 'memory',
    // Session replay + heatmaps (Task 34.1) — enabled for /, /pricing, /contact, /csrd
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-ph-mask]'
    },
    enable_heatmaps: true,
    loaded: function(ph) {
      if (hasAnalyticsConsent()) {
        callPostHog(ph, 'opt_in_capturing');
        callPostHog(ph, 'capture', ['$pageview']);
        // Enable session replay only on key pages
        var replayPages = ['/', '/pricing', '/pricing.html', '/contact', '/contact.html', '/csrd', '/csrd.html'];
        var currentPath = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
        if (replayPages.indexOf(currentPath) !== -1 || replayPages.indexOf(currentPath + '.html') !== -1) {
          callPostHog(ph, 'startSessionRecording');
        }
      } else {
        callPostHog(ph, 'opt_out_capturing');
      }
    }
  });

  // Global function for cookie banner to call on consent change
  window.caPostHogConsentUpdate = function(analyticsConsented) {
    if (typeof posthog === 'undefined') return;
    if (analyticsConsented) {
      callPostHog(posthog, 'opt_in_capturing');
      callPostHog(posthog, 'capture', ['$pageview']);
    } else {
      // DEF-012: On "Reject all", fully opt out and reset
      callPostHog(posthog, 'opt_out_capturing');
      callPostHog(posthog, 'reset', [true]);
    }
  };
})();
