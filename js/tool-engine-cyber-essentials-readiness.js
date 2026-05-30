/**
 * tool-engine-cyber-essentials-readiness.js — calculation engine for the
 * Cyber Essentials Readiness pre-screen.
 *
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the
 * submit button (type=submit) did a default form submission. This intercepts submit,
 * scores the five technical control themes, and renders a readable result card.
 *
 * Regulatory basis (NCSC Cyber Essentials Requirements for IT Infrastructure v3.3,
 * 'Danzell', in force 28 April 2026). FIVE technical control themes:
 *   1. Firewalls
 *   2. Secure Configuration
 *   3. Security Update Management   (form question: "Patch Management")
 *   4. User Access Control
 *   5. Malware Protection
 *
 * Score = (controls met / total controls) * 100, rounded.
 *   "yes"     => 1.0 (theme MET)
 *   "partial" => 0.5 (partial — counted as a GAP to address)
 *   "no"      => 0   (GAP)
 *
 * Indicative self-assessment only — NOT certification. Full IASME-assessed audit
 * covers 60+ questions. CE = self-assessed Basic; CE Plus adds an independent
 * hands-on technical audit of the same five themes.
 */
(function () {
  'use strict';

  function init() {
    var form = document.getElementById('cyber-form');
    var out = document.getElementById('tool-result');
    if (!form || !out) return;

    var THEMES = [
      { id: 'firewalls', name: 'Firewalls' },
      { id: 'config',    name: 'Secure Configuration' },
      { id: 'patch',     name: 'Security Update Management' },
      { id: 'access',    name: 'User Access Control' },
      { id: 'malware',   name: 'Malware Protection' }
    ];

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never let the form do a native submit/reload

      // Read + validate every theme answer.
      var answers = [];
      var missing = false;
      for (var i = 0; i < THEMES.length; i++) {
        var el = document.getElementById(THEMES[i].id);
        var v = el ? el.value : '';
        if (!v) { missing = true; }
        answers.push(v);
      }

      if (missing) {
        out.classList.remove('hidden');
        out.innerHTML = '<div class="tool-result-card" role="alert" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:1rem;padding:1.25rem 1.5rem;color:#991B1B;-webkit-text-fill-color:#991B1B;font-weight:600;">Please answer all five control questions to see your readiness score.</div>';
        out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // Score each theme: yes=1, partial=0.5, no=0.
      var creditMap = { yes: 1, partial: 0.5, no: 0 };
      var total = THEMES.length;
      var creditSum = 0;
      var met = [];
      var gaps = [];
      for (var j = 0; j < THEMES.length; j++) {
        var credit = creditMap[answers[j]];
        if (credit === undefined) credit = 0;
        creditSum += credit;
        if (credit >= 1) {
          met.push(THEMES[j].name);
        } else {
          gaps.push({
            name: THEMES[j].name,
            partial: answers[j] === 'partial'
          });
        }
      }

      var score = Math.round((creditSum / total) * 100);

      // Verdict bands.
      var verdict, vColor, vBg, vBorder, vDetail;
      if (score === 100) {
        verdict = 'Ready';
        vColor = '#0E7C68'; vBg = '#ECFDF5'; vBorder = '#A7F3D0';
        vDetail = 'All five technical control themes are met. You are well placed to self-assess for Cyber Essentials (Basic), and to schedule the independent Cyber Essentials Plus audit of the same controls.';
      } else if (score >= 60) {
        verdict = 'Partial';
        vColor = '#B45309'; vBg = '#FFFBEB'; vBorder = '#FDE68A';
        vDetail = 'Most controls are in place, but the gaps below will fail a Cyber Essentials assessment. Close them before submitting your self-assessment.';
      } else {
        verdict = 'Not yet ready';
        vColor = '#B91C1C'; vBg = '#FEF2F2'; vBorder = '#FECACA';
        vDetail = 'Several core controls are missing. A Cyber Essentials assessment requires all five themes to be fully met. Address the gaps below first.';
      }

      // Build MET list.
      var metHtml = '';
      if (met.length) {
        for (var m = 0; m < met.length; m++) {
          metHtml +=
            '<li style="display:flex;align-items:flex-start;gap:0.5rem;margin:0 0 0.5rem;color:#040E1A;-webkit-text-fill-color:#040E1A;font-weight:600;">' +
              '<span style="color:#0E7C68;-webkit-text-fill-color:#0E7C68;font-weight:900;">&#10003;</span>' +
              '<span>' + met[m] + '</span>' +
            '</li>';
        }
      } else {
        metHtml = '<li style="color:#667085;-webkit-text-fill-color:#667085;margin:0;">No themes fully met yet.</li>';
      }

      // Build GAPS list.
      var gapsHtml = '';
      if (gaps.length) {
        for (var g = 0; g < gaps.length; g++) {
          var tag = gaps[g].partial ? ' (partial, finish rollout)' : '';
          gapsHtml +=
            '<li style="display:flex;align-items:flex-start;gap:0.5rem;margin:0 0 0.5rem;color:#040E1A;-webkit-text-fill-color:#040E1A;font-weight:600;">' +
              '<span style="color:#B91C1C;-webkit-text-fill-color:#B91C1C;font-weight:900;">&#10007;</span>' +
              '<span>' + gaps[g].name + tag + '</span>' +
            '</li>';
        }
      } else {
        gapsHtml = '<li style="color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0;font-weight:600;">No gaps: all five themes met.</li>';
      }

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#FFFFFF;border:1px solid rgba(4,14,26,0.10);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(4,14,26,0.06);color:#040E1A;-webkit-text-fill-color:#040E1A;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.75rem;">Your readiness score</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#040E1A;-webkit-text-fill-color:#040E1A;">' + score + '%</p>' +
          '<p style="font-size:0.95rem;color:#475467;-webkit-text-fill-color:#475467;margin:0 0 1.5rem;"><strong style="color:#040E1A;-webkit-text-fill-color:#040E1A;">' + met.length + ' of ' + total + '</strong> technical control themes fully met against Cyber Essentials v3.3 (Danzell).</p>' +
          '<div style="background:' + vBg + ';border:1px solid ' + vBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.5rem;">' +
            '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:' + vColor + ';-webkit-text-fill-color:' + vColor + ';margin:0 0 0.35rem;">Verdict</p>' +
            '<p style="font-size:1.25rem;font-weight:900;color:' + vColor + ';-webkit-text-fill-color:' + vColor + ';margin:0 0 0.5rem;">' + verdict + '</p>' +
            '<p style="font-size:0.85rem;color:#475467;-webkit-text-fill-color:#475467;margin:0;">' + vDetail + '</p>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0E7C68;-webkit-text-fill-color:#0E7C68;margin:0 0 0.6rem;">Themes met</p>' +
              '<ul style="list-style:none;margin:0;padding:0;font-size:0.9rem;">' + metHtml + '</ul>' +
            '</div>' +
            '<div style="background:rgba(4,14,26,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#B91C1C;-webkit-text-fill-color:#B91C1C;margin:0 0 0.6rem;">Gaps to address</p>' +
              '<ul style="list-style:none;margin:0;padding:0;font-size:0.9rem;">' + gapsHtml + '</ul>' +
            '</div>' +
          '</div>' +
          '<div style="background:rgba(12,201,168,0.07);border:1px solid rgba(12,201,168,0.25);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.85rem;color:#0E7C68;-webkit-text-fill-color:#0E7C68;font-weight:700;margin:0 0 0.25rem;">Basic vs Plus</p>' +
            '<p style="font-size:0.8rem;color:#475467;-webkit-text-fill-color:#475467;margin:0;">Cyber Essentials (Basic) is a self-assessment of these five themes. Cyber Essentials Plus adds an independent, hands-on technical audit of the same five themes. Both require all five to be fully met.</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#667085;-webkit-text-fill-color:#667085;margin:0;border-top:1px solid rgba(4,14,26,0.08);padding-top:1rem;">Basis: NCSC Cyber Essentials Requirements for IT Infrastructure v3.3 (Danzell), in force 28 April 2026. Indicative self-assessment only, not a certification or assessor decision. A full IASME-aligned assessment covers 60+ questions.</p>' +
        '</div>';

      if (window.CAToolTeaser && typeof window.CAToolTeaser.recordRun === 'function') {
        try { window.CAToolTeaser.recordRun('cyber-essentials-readiness'); } catch (_) {}
      }
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
