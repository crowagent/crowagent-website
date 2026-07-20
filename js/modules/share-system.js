/*
 * Blog article share row.
 *
 * The LinkedIn / X / email controls are plain static links rendered in the
 * page HTML (they work with JavaScript disabled), so this module only handles
 * "copy link": clipboard write plus a visible and screen-reader-announced
 * confirmation. Every failure path reports back to the user; nothing is
 * swallowed.
 */
(function () {
  'use strict';

  var RESET_MS = 2600;

  function announce(row, message) {
    var status = row && row.querySelector('[data-cas-status]');
    if (!status) return;
    // Clear first so an identical repeat message is still announced.
    status.textContent = '';
    window.setTimeout(function () {
      status.textContent = message;
    }, 40);
  }

  function clear(row, btn) {
    var status = row && row.querySelector('[data-cas-status]');
    if (status) status.textContent = '';
    if (btn) btn.removeAttribute('data-copied');
  }

  /* Fallback for browsers or non-secure contexts where the async Clipboard
     API is unavailable (navigator.clipboard is undefined outside secure
     origins). Returns true when the copy succeeded. */
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.setAttribute('aria-hidden', 'true');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    var ok = false;
    try {
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
      if (window.console && window.console.warn) {
        window.console.warn('share-system: legacy copy failed', err);
      }
    }
    document.body.removeChild(ta);
    return ok;
  }

  function succeed(row, btn) {
    btn.setAttribute('data-copied', 'true');
    announce(row, 'Link copied');
    window.setTimeout(function () {
      clear(row, btn);
    }, RESET_MS);
  }

  function fail(row, btn) {
    announce(row, 'Copy failed, use the address bar');
    window.setTimeout(function () {
      clear(row, btn);
    }, RESET_MS + 2000);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-cas-copy]') : null;
    if (!btn) return;
    e.preventDefault();

    var row = btn.closest('[data-cas]');
    var url = btn.getAttribute('data-cas-url') || window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { succeed(row, btn); },
        function (err) {
          if (window.console && window.console.warn) {
            window.console.warn('share-system: clipboard API rejected', err);
          }
          if (legacyCopy(url)) { succeed(row, btn); } else { fail(row, btn); }
        }
      );
      return;
    }

    if (legacyCopy(url)) { succeed(row, btn); } else { fail(row, btn); }
  });
})();
