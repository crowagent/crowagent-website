/* E-batch runtime (2026-05-16):
   - Tool-page visible breadcrumb (built from URL when missing)
   - Legal-page sticky TOC (built from main h2[id])
   - "Last updated" badge promotion to top of legal pages
   - Pricing toggle "Save 10%" + label active-state sync
   No external deps. Defensive try/catch around each block. */
(function () {
  'use strict';

  /* ─── 1. Tool-page breadcrumb ────────────────────────────────────── */
  // Removed (2026-05-28): the runtime injection caused a duplicated
  // vertical stack on Sovereign-v2 pages. Pages now use native breadcrumbs.

  /* ─── 2. Legal-page sticky TOC ──────────────────────────────────── */
  try {
    var isLegal = /\/(privacy|terms|cookies|security|changelog)(\.html)?\/?$/i.test(location.pathname) ||
                  (document.body && document.body.classList.contains('f8-legal'));
    if (isLegal) {
      var content = document.querySelector('main .legal-content, main .legal-page, main article, main .wrap');
      var h2s = content ? Array.from(content.querySelectorAll('h2[id]')) : [];
      // sf30 layout-parity fix 2026-05-18: also skip if a TOC already exists
      // anywhere inside <main> (privacy.html ships its own .legal-toc as a
      // sibling of .priv-article, so the previous in-content guard missed it
      // and a duplicate TOC was injected at the article's firstChild).
      var existingToc = document.querySelector('main .legal-toc');
      if (content && h2s.length >= 3 && !content.querySelector('.legal-toc') && !existingToc) {
        var toc = document.createElement('aside');
        toc.className = 'legal-toc';
        toc.setAttribute('aria-label', 'On this page');
        var html = '<div class="legal-toc-title">On this page</div>';
        h2s.forEach(function (h) {
          html += '<a href="#' + h.id + '">' + (h.textContent || '').trim() + '</a>';
        });
        toc.innerHTML = html;
        content.insertBefore(toc, content.firstChild);
      }
      var lu = content && Array.from(content.querySelectorAll('p, time, em')).find(function (el) {
        return /^last updated[:\s]/i.test((el.textContent || '').trim());
      });
      if (lu && !lu.classList.contains('legal-last-updated') &&
          !(lu.parentNode && lu.parentNode.classList && lu.parentNode.classList.contains('legal-last-updated'))) {
        var badge = document.createElement('div');
        badge.className = 'legal-last-updated';
        badge.textContent = lu.textContent.trim();
        lu.parentNode.replaceChild(badge, lu);
      }
    }
  } catch (_) {}

  /* ─── 3. Pricing toggle "Save 10%" + label active sync ───────────── */
  try {
    var toggleRow = document.querySelector('.toggle-row--premium, .billing-toggle-row');
    var toggleBtn = document.getElementById('ttoggle');
    var lblM = document.getElementById('lbl-m');
    var lblA = document.getElementById('lbl-a');
    if (toggleBtn && lblM && lblA) {
      var sync = function () {
        var annual = toggleBtn.getAttribute('aria-checked') === 'true';
        if (toggleRow) toggleRow.setAttribute('data-annual', annual ? 'true' : 'false');
        lblM.classList.toggle('is-active-label', !annual);
        lblA.classList.toggle('is-active-label', annual);
      };
      toggleBtn.addEventListener('click', function () { setTimeout(sync, 10); });
      toggleBtn.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') setTimeout(sync, 10);
      });
      sync();
    }
  } catch (_) {}
})();
