/**
 * micro-interactions.js — H1-MICRO-CTA 10-10 (2026-05-10)
 *
 * Stripe-style micro-interactions wired to existing markup classes.
 *
 * Responsibilities:
 *   1. Form-validation listeners — on submit-fail (any form with at least
 *      one [aria-invalid="true"] descendant), add `.shake-once` to those
 *      inputs and remove it after 0.4s so the keyframe can re-trigger.
 *   2. Field is-valid pulse — on `blur` of an input that has a non-empty
 *      value AND no `aria-invalid="true"`, add `.is-valid` for 0.6s.
 *   3. Form-success reveal + auto-dismiss — when a `.form-success` element
 *      gets `data-show="true"` (or class `.is-revealed`), schedule fade-out
 *      after 4.5s by adding `.is-fading` (and removing both flags after
 *      the 0.32s animation).
 *   4. Page-load reveal — sets `body.page-loaded` after DOMContentLoaded +
 *      first paint so `[data-section-reveal]` blocks below the hero
 *      animate in (CSS owns the timing — see styles.css §H1-MICRO-CTA §4).
 *      Also dispatches a CustomEvent('page-loaded') for any other module
 *      that wants to subscribe.
 *   5. Toast helper — `window.__caToast({message, kind})` adds a `.toast`
 *      element to (or creates) `.toast-region`; the CSS handles the
 *      300ms in / 4700ms hold / 300ms out cadence; we remove the node
 *      after 5400ms (animation total = 0.3 + 4.7 + 0.3 = 5.3s; +0.1s
 *      safety margin).
 *
 * Brand-token contract: NO inline-style ratchet. Class toggles only.
 * Reduced-motion: CSS handles it; this module still toggles classes
 * (the rule animation goes to none, but the reveal/show state is correct).
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // 1. Form-validation shake on submit-fail ------------------------------
  function shakeInvalid(form) {
    var bad = form.querySelectorAll('[aria-invalid="true"]');
    for (var i = 0; i < bad.length; i++) {
      var el = bad[i];
      el.classList.remove("shake-once");
      // Force reflow so re-adding the class re-triggers the keyframe.
      void el.offsetWidth;
      el.classList.add("shake-once");
      (function (node) {
        window.setTimeout(function () { node.classList.remove("shake-once"); }, 420);
      })(el);
    }
  }
  document.addEventListener("invalid", function (ev) {
    var t = ev.target;
    if (!t || !t.form) return;
    // Native invalid bubbles per-field; debounce by form.
    var f = t.form;
    if (f.__caShakeQueued) return;
    f.__caShakeQueued = true;
    window.requestAnimationFrame(function () {
      f.__caShakeQueued = false;
      shakeInvalid(f);
    });
  }, true);

  // 2. Field is-valid pulse on blur --------------------------------------
  document.addEventListener("blur", function (ev) {
    var t = ev.target;
    if (!t || !t.matches) return;
    if (!t.matches("input, textarea, select")) return;
    if (t.getAttribute("aria-invalid") === "true") return;
    if (!("value" in t) || !String(t.value).trim()) return;
    t.classList.add("is-valid");
    window.setTimeout(function () { t.classList.remove("is-valid"); }, 620);
  }, true);

  // 3. Form-success reveal + auto-dismiss --------------------------------
  function watchFormSuccess(node) {
    if (node.__caSuccessWired) return;
    node.__caSuccessWired = true;
    window.setTimeout(function () {
      node.classList.add("is-fading");
      window.setTimeout(function () {
        node.classList.remove("is-revealed", "is-fading");
        node.removeAttribute("data-show");
      }, 340);
    }, 4500);
  }
  var successObserver = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      var t = r.target;
      if (!t || !t.classList || !t.classList.contains("form-success")) continue;
      if (t.getAttribute("data-show") === "true" || t.classList.contains("is-revealed")) {
        watchFormSuccess(t);
      }
    }
  });
  function attachSuccessObserver() {
    var nodes = document.querySelectorAll(".form-success");
    for (var i = 0; i < nodes.length; i++) {
      successObserver.observe(nodes[i], { attributes: true, attributeFilter: ["data-show", "class"] });
      // Pick up the case where the element is already shown at first paint.
      var n = nodes[i];
      if (n.getAttribute("data-show") === "true" || n.classList.contains("is-revealed")) {
        watchFormSuccess(n);
      }
    }
  }

  // 4. Page-load reveal ---------------------------------------------------
  function markPageLoaded() {
    document.body.classList.add("page-loaded");
    try {
      window.dispatchEvent(new CustomEvent("page-loaded"));
    } catch (_) { /* IE-style CustomEvent not needed; we ship to evergreen */ }
  }

  // 5. Toast helper -------------------------------------------------------
  function ensureToastRegion() {
    var region = document.querySelector(".toast-region");
    if (region) return region;
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
    return region;
  }
  function caToast(opts) {
    var msg = (opts && opts.message) || "";
    var kind = (opts && opts.kind) || "info";
    if (!msg) return;
    var region = ensureToastRegion();
    var el = document.createElement("div");
    el.className = "toast toast-" + kind + " is-show";
    el.textContent = msg;
    region.appendChild(el);
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 5400);
  }
  window.__caToast = caToast;

  // Init -----------------------------------------------------------------
  function init() {
    attachSuccessObserver();
    // Defer the page-loaded class to the first paint after DOMContentLoaded
    // so [data-section-reveal] blocks transition in cleanly.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(markPageLoaded);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
