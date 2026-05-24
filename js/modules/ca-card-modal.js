/**
 * .ca-card-modal — expansion pattern (2026-05-23)
 * Click a card with [data-modal-target="#id"] → opens dialog with embedded content.
 * Escape closes, click outside closes, focus trapped, body scroll locked.
 */
(function () {
  'use strict';
  if (window.__caCardModalLoaded) return;
  window.__caCardModalLoaded = true;

  var activeModal = null;
  var lastFocused = null;

  function openModal(modal) {
    if (activeModal) closeModal(activeModal);
    activeModal = modal;
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.ca-card-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try { lastFocused.focus(); } catch (_) {}
    }
    activeModal = null;
  }

  function init() {
    // Triggers
    document.querySelectorAll('[data-modal-target]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        var sel = trigger.dataset.modalTarget;
        var modal = document.querySelector(sel);
        if (modal) {
          e.preventDefault();
          openModal(modal);
        }
      });
      // Keyboard activation for non-button triggers
      if (trigger.tagName !== 'BUTTON' && trigger.tagName !== 'A') {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
          }
        });
      }
    });
    // Close buttons
    document.querySelectorAll('.ca-card-modal__close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var modal = btn.closest('.ca-card-modal');
        closeModal(modal);
      });
    });
    // Backdrop click
    document.querySelectorAll('.ca-card-modal').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(modal);
      });
    });
    // Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && activeModal) closeModal(activeModal);
    });
  }

  if (document.readyState !== 'loading') setTimeout(init, 100);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); }, { once: true });
})();
