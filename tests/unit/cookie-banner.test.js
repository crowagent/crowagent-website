/**
 * tests/unit/cookie-banner.test.js — DEF-046 Jest coverage expansion (2026-05-10).
 *
 * Covers cookie-banner.js (the root shim) AND js/cookie-banner.js (the
 * single source of truth, loaded by the shim). Source is read-only per
 * the agent contract for this row; we only assert observable behaviour.
 *
 * Coverage targets (per row spec):
 *   - First-load show (no consent stored)
 *   - Hide on consent decision
 *   - localStorage write of `ca_cookie_consent_v2`
 *   - Reject calls posthog opt-out hook (window.caPostHogConsentUpdate)
 *   - Esc triggers reject (PECR-safe)
 *   - 12-month expiry on localStorage value (timestamp + retention semantics)
 *
 * Storage strategy: real Object backing for localStorage so the banner's
 * read/write round-trip is observable in test.
 */
'use strict';

window.matchMedia = window.matchMedia || function (query) {
  return {
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return false; }
  };
};

const lsStore = (() => {
  let s = {};
  return {
    getItem: k => Object.prototype.hasOwnProperty.call(s, k) ? s[k] : null,
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: k => { delete s[k]; },
    clear: () => { s = {}; },
    _dump: () => s
  };
})();
Object.defineProperty(global, 'localStorage', { value: lsStore, writable: true });

beforeEach(() => {
  lsStore.clear();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  delete window.__caCookieShimLoaded;
  delete window.__caCookieBannerLoaded;
  delete window.crowagentConsent;
  delete window.crowagentAnalyticsConsent;
  delete window.caPostHogConsentUpdate;
  // Force jest module cache so each test gets a fresh IIFE run.
  jest.resetModules();
});

function loadBanner() {
  // Mark DOM as ready so the IIFE runs the boot() path synchronously.
  Object.defineProperty(document, 'readyState', { value: 'complete', writable: true });
  // Load the canonical implementation (the shim is a 4-line require'r —
  // exercising it via the actual implementation file gives us coverage of
  // the runtime API surface AND the shim itself in the all-tests run).
  jest.isolateModules(() => { require('../../js/cookie-banner.js'); });
  // Also load the root shim — IIFE is idempotent via __caCookieShimLoaded.
  jest.isolateModules(() => { require('../../cookie-banner.js'); });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('cookie-banner — DOM injection + first-load show', () => {
  test('injects #ca-cookie banner when no consent stored', () => {
    loadBanner();
    const banner = document.getElementById('ca-cookie');
    expect(banner).not.toBeNull();
    expect(banner.style.display).toBe('block');
  });

  test('does not show banner when consent already stored', () => {
    lsStore.setItem('ca_cookie_consent_v2', JSON.stringify({
      necessary: true, analytics: true, marketing: false, ts: Date.now()
    }));
    loadBanner();
    const banner = document.getElementById('ca-cookie');
    expect(banner).not.toBeNull();
    // The banner DOM is injected (idempotency) but display:none.
    expect(banner.style.display === 'none' || banner.style.display === '').toBe(true);
  });

  test('public API exposed on window.crowagentConsent', () => {
    loadBanner();
    expect(typeof window.crowagentConsent).toBe('object');
    expect(typeof window.crowagentConsent.acceptAll).toBe('function');
    expect(typeof window.crowagentConsent.rejectAll).toBe('function');
    expect(typeof window.crowagentConsent.hideBanner).toBe('function');
    expect(typeof window.crowagentConsent.showBanner).toBe('function');
    expect(typeof window.crowagentConsent.getState).toBe('function');
  });
});

describe('cookie-banner — consent decisions', () => {
  test('acceptAll writes ca_cookie_consent_v2 with analytics+marketing true', () => {
    loadBanner();
    window.crowagentConsent.acceptAll();
    const raw = localStorage.getItem('ca_cookie_consent_v2');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.necessary).toBe(true);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(true);
    expect(typeof parsed.ts).toBe('number');
  });

  test('rejectAll writes consent with analytics false + marketing false', () => {
    loadBanner();
    window.crowagentConsent.rejectAll();
    const parsed = JSON.parse(localStorage.getItem('ca_cookie_consent_v2'));
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
    expect(parsed.necessary).toBe(true);
  });

  test('mirror key ca_cookie_consent is also written (legacy reader compat)', () => {
    loadBanner();
    window.crowagentConsent.acceptAll();
    expect(localStorage.getItem('ca_cookie_consent')).not.toBeNull();
  });

  test('hideBanner sets display:none + aria-hidden=true', () => {
    loadBanner();
    window.crowagentConsent.hideBanner();
    const banner = document.getElementById('ca-cookie');
    expect(banner.style.display).toBe('none');
    expect(banner.getAttribute('aria-hidden')).toBe('true');
  });

  test('acceptAll then hides the banner automatically', () => {
    loadBanner();
    window.crowagentConsent.acceptAll();
    const banner = document.getElementById('ca-cookie');
    expect(banner.style.display).toBe('none');
  });
});

describe('cookie-banner — analytics opt-out hook (PostHog)', () => {
  test('rejectAll invokes window.caPostHogConsentUpdate(false)', () => {
    const hook = jest.fn();
    window.caPostHogConsentUpdate = hook;
    loadBanner();
    window.crowagentConsent.rejectAll();
    expect(hook).toHaveBeenCalledWith(false);
  });

  test('acceptAll invokes window.caPostHogConsentUpdate(true)', () => {
    const hook = jest.fn();
    window.caPostHogConsentUpdate = hook;
    loadBanner();
    window.crowagentConsent.acceptAll();
    expect(hook).toHaveBeenCalledWith(true);
  });

  test('setConsent(true,false) writes selective state + opts in to analytics', () => {
    const hook = jest.fn();
    window.caPostHogConsentUpdate = hook;
    loadBanner();
    window.crowagentConsent.setConsent(true, false);
    const parsed = JSON.parse(localStorage.getItem('ca_cookie_consent_v2'));
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(false);
    expect(hook).toHaveBeenCalledWith(true);
  });
});

describe('cookie-banner — getState retrieval', () => {
  test('getState returns the stored consent (analytics + marketing flags)', () => {
    loadBanner();
    window.crowagentConsent.setConsent(true, false);
    const state = window.crowagentConsent.getState();
    expect(state.necessary).toBe(true);
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(false);
  });

  test('getState returns default shape when no consent stored', () => {
    loadBanner();
    // Wipe + re-read.
    lsStore.clear();
    const state = window.crowagentConsent.getState();
    expect(state.necessary).toBe(true);
    expect(state.analytics).toBe(false);
    expect(state.marketing).toBe(false);
    expect(state.ts).toBeNull();
  });
});

describe('cookie-banner — 12-month expiry timestamp semantics', () => {
  test('ts is set to a current epoch ms on write', () => {
    loadBanner();
    const before = Date.now();
    window.crowagentConsent.acceptAll();
    const after = Date.now();
    const parsed = JSON.parse(localStorage.getItem('ca_cookie_consent_v2'));
    expect(parsed.ts).toBeGreaterThanOrEqual(before);
    expect(parsed.ts).toBeLessThanOrEqual(after);
  });

  test('a stored ts older than 12 months is still parseable (caller decides expiry)', () => {
    const oneYearAgo = Date.now() - (366 * 24 * 60 * 60 * 1000);
    lsStore.setItem('ca_cookie_consent_v2', JSON.stringify({
      necessary: true, analytics: true, marketing: false, ts: oneYearAgo
    }));
    loadBanner();
    const state = window.crowagentConsent.getState();
    // The banner doesn't auto-expire — that's up to the host page (PECR
    // says we MAY re-prompt after 12 months). Test that the ts survives
    // the round-trip so a host-side expiry check has the data it needs.
    expect(state.ts).toBe(oneYearAgo);
    const ageMs = Date.now() - state.ts;
    expect(ageMs).toBeGreaterThan(365 * 24 * 60 * 60 * 1000);
  });
});

describe('cookie-banner — Esc key (PECR-safe reject)', () => {
  test('Esc-keydown on the banner root rejects all (no implicit consent)', () => {
    const hook = jest.fn();
    window.caPostHogConsentUpdate = hook;
    loadBanner();
    // PECR doctrine: closing the banner WITHOUT an explicit choice must
    // NOT be treated as consent. The simplest safe path is "Esc = reject".
    // We assert that a host-page wiring of Esc → rejectAll() correctly
    // calls the public API (the API is the contract — Esc handler is in
    // host pages / the optional /js/cookie-banner-keys.js if present).
    window.crowagentConsent.rejectAll();
    expect(hook).toHaveBeenCalledWith(false);
    const banner = document.getElementById('ca-cookie');
    expect(banner.style.display).toBe('none');
  });
});

describe('cookie-banner — root shim coverage', () => {
  test('shim sets the __caCookieShimLoaded guard to prevent double-init', () => {
    loadBanner();
    expect(window.__caCookieShimLoaded).toBe(true);
  });

  test('canonical implementation sets __caCookieBannerLoaded guard', () => {
    loadBanner();
    expect(window.__caCookieBannerLoaded).toBe(true);
  });
});

/* The focus trap and the Esc handler were the two largest untested blocks in
   js/cookie-banner.js. Both are accessibility guarantees rather than cosmetic
   behaviour: the trap is WCAG 2.1.2 (No Keyboard Trap) and the Esc handler is
   the PECR-safe dismissal, so a silent regression in either is a compliance
   defect and not merely a bug. The jest config carries a note asking for
   exactly this. */

function keydown(key, opts) {
  const e = new KeyboardEvent('keydown', Object.assign({
    key: key, bubbles: true, cancelable: true
  }, opts || {}));
  document.dispatchEvent(e);
  return e;
}

// Mirrors getFocusableInBanner()'s selector. The banner shows its simple panel
// and hides the detail panel, so only the simple panel's controls are focusable.
function visibleFocusables() {
  const banner = document.getElementById('ca-cookie');
  const sel = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),'
    + 'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  return Array.prototype.filter.call(banner.querySelectorAll(sel), (n) => {
    for (let p = n; p && p !== banner; p = p.parentElement) {
      if (p.style && p.style.display === 'none') return false;
    }
    return true;
  });
}

describe('cookie-banner — Esc dismisses as a rejection, not as consent', () => {
  test('Escape on a visible banner writes analytics+marketing false and hides it', () => {
    loadBanner();
    expect(document.getElementById('ca-cookie').style.display).toBe('block');

    keydown('Escape');

    const parsed = JSON.parse(localStorage.getItem('ca_cookie_consent_v2'));
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
    expect(parsed.necessary).toBe(true);
    expect(document.getElementById('ca-cookie').style.display).toBe('none');
  });

  test('Escape notifies the analytics hook that consent was refused', () => {
    const hook = jest.fn();
    window.caPostHogConsentUpdate = hook;
    loadBanner();

    keydown('Escape');

    expect(hook).toHaveBeenCalledWith(false);
  });

  test('Escape is ignored once the banner is hidden, so it cannot steal the key', () => {
    loadBanner();
    window.crowagentConsent.hideBanner();
    lsStore.clear();

    keydown('Escape');

    // No decision written: the key belongs to whatever dialog is open instead.
    expect(localStorage.getItem('ca_cookie_consent_v2')).toBeNull();
  });
});

describe('cookie-banner — WCAG 2.1.2 focus trap', () => {
  test('showing the banner marks the body and hiding it clears the mark', () => {
    loadBanner();
    expect(document.body.classList.contains('cookie-banner-active')).toBe(true);

    window.crowagentConsent.hideBanner();
    expect(document.body.classList.contains('cookie-banner-active')).toBe(false);
  });

  test('Tab past the last control wraps to the first', () => {
    loadBanner();
    const f = visibleFocusables();
    expect(f.length).toBeGreaterThan(1);
    f[f.length - 1].focus();

    const e = keydown('Tab');

    expect(e.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(f[0]);
  });

  test('Shift+Tab from the first control wraps to the last', () => {
    loadBanner();
    const f = visibleFocusables();
    f[0].focus();

    const e = keydown('Tab', { shiftKey: true });

    expect(e.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(f[f.length - 1]);
  });

  test('focus that has escaped the banner is dragged back to the first control', () => {
    loadBanner();
    const outside = document.createElement('button');
    outside.textContent = 'elsewhere on the page';
    document.body.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    const e = keydown('Tab');

    expect(e.defaultPrevented).toBe(true);
    expect(visibleFocusables()[0]).toBe(document.activeElement);
  });

  test('a key other than Tab or Escape passes straight through', () => {
    loadBanner();
    const e = keydown('a');
    expect(e.defaultPrevented).toBe(false);
  });

  test('the trap yields to the mobile menu once that opens on top of it', () => {
    loadBanner();
    // Regression guard: the banner used to keep ringing focus between its own
    // buttons while the mobile menu was open, making every link in the open
    // menu unreachable by keyboard. The banner holds focus against the PAGE,
    // never against a dialog the user has since opened over it.
    const mob = document.createElement('div');
    mob.id = 'mob-menu';
    mob.className = 'open';
    document.body.appendChild(mob);

    const f = visibleFocusables();
    f[f.length - 1].focus();

    const e = keydown('Tab');

    expect(e.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(f[f.length - 1]);
  });

  test('Escape inside the trap moves focus to main content', () => {
    loadBanner();
    const main = document.createElement('main');
    main.setAttribute('tabindex', '-1');
    document.body.appendChild(main);

    keydown('Escape');

    expect(document.activeElement).toBe(main);
  });
});
