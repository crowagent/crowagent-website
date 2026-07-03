/**
 * tool-engine-cyber-essentials-readiness.js : calculation engine for the
 * Cyber Essentials Readiness pre-screen.
 *
 * Fixes the "form just reloads, no result" bug: the engine was never built, so the
 * submit button (type=submit) did a default form submission. This intercepts submit,
 * scores the five technical control themes, and renders a readable result card.
 *
 * Regulatory basis (NCSC Cyber Essentials Requirements for IT Infrastructure v3.3,
 * 'Danzell', in force 27 April 2026). FIVE technical control themes:
 *   1. Firewalls
 *   2. Secure Configuration
 *   3. Security Update Management   (form question: "Patch Management")
 *   4. User Access Control
 *   5. Malware Protection
 *
 * Score = (controls met / total controls) * 100, rounded.
 *   "yes"     => 1.0 (theme MET)
 *   "partial" => 0.5 (partial : counted as a GAP to address)
 *   "no"      => 0   (GAP)
 *
 * Indicative self-assessment only : NOT certification. Full IASME-assessed audit
 * covers 60+ questions. CE = self-assessed Basic; CE Plus adds an independent
 * hands-on technical audit of the same five themes.
 */
(function () {
  'use strict';

  // The result card is injected inside a .ca-section-light wrapper whose stylesheet
  // forces color/-webkit-text-fill-color to the light-section value with !important.
  // Re-assert our dark-theme inline colour/background declarations with !important so
  // they win (inline !important beats stylesheet !important).
  var IMPORTANT_PROPS = ['color', '-webkit-text-fill-color', 'background', 'background-color', 'border', 'border-top', 'box-shadow'];
  function applyImportant(root) {
    var nodes = root.querySelectorAll('[style]');
    for (var n = 0; n < nodes.length; n++) {
      var st = nodes[n].style;
      for (var p = 0; p < IMPORTANT_PROPS.length; p++) {
        var v = st.getPropertyValue(IMPORTANT_PROPS[p]);
        if (v) { st.setProperty(IMPORTANT_PROPS[p], v, 'important'); }
      }
    }
  }

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
      if (window.CAToolTeaser && window.CAToolTeaser.gateSoftWall &&
          window.CAToolTeaser.gateSoftWall('cyber-essentials-readiness', out)) return;

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
        out.innerHTML = '<div class="tool-result-card" role="alert" style="background:rgba(220,38,38,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:1rem;padding:1.25rem 1.5rem;color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;font-weight:600;">Please answer all five control questions to see your readiness score.</div>';
        applyImportant(out);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }); });
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
        vColor = '#34D399'; vBg = 'rgba(16,185,129,0.12)'; vBorder = 'rgba(52,211,153,0.4)';
        vDetail = 'All five technical control themes are met. You are well placed to self-assess for Cyber Essentials (Basic), and to schedule the independent Cyber Essentials Plus audit of the same controls.';
      } else if (score >= 60) {
        verdict = 'Partial';
        vColor = '#FBBF24'; vBg = 'rgba(245,158,11,0.12)'; vBorder = 'rgba(251,191,36,0.4)';
        vDetail = 'Most controls are in place, but the gaps below will fail a Cyber Essentials assessment. Close them before submitting your self-assessment.';
      } else {
        verdict = 'Not yet ready';
        vColor = '#FCA5A5'; vBg = 'rgba(220,38,38,0.12)'; vBorder = 'rgba(248,113,113,0.4)';
        vDetail = 'Several core controls are missing. A Cyber Essentials assessment requires all five themes to be fully met. Address the gaps below first.';
      }

      // Build MET list.
      var metHtml = '';
      if (met.length) {
        for (var m = 0; m < met.length; m++) {
          metHtml +=
            '<li style="display:flex;align-items:flex-start;gap:0.5rem;margin:0 0 0.5rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;font-weight:600;">' +
              '<span style="color:#34D399;-webkit-text-fill-color:#34D399;font-weight:900;">&#10003;</span>' +
              '<span>' + met[m] + '</span>' +
            '</li>';
        }
      } else {
        metHtml = '<li style="color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;">No themes fully met yet.</li>';
      }

      // Build GAPS list.
      var gapsHtml = '';
      if (gaps.length) {
        for (var g = 0; g < gaps.length; g++) {
          var tag = gaps[g].partial ? ' (partial, finish rollout)' : '';
          gapsHtml +=
            '<li style="display:flex;align-items:flex-start;gap:0.5rem;margin:0 0 0.5rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;font-weight:600;">' +
              '<span style="color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;font-weight:900;">&#10007;</span>' +
              '<span>' + gaps[g].name + tag + '</span>' +
            '</li>';
        }
      } else {
        gapsHtml = '<li style="color:#34D399;-webkit-text-fill-color:#34D399;margin:0;font-weight:600;">No gaps: all five themes met.</li>';
      }

      out.classList.remove('hidden');
      out.innerHTML =
        '<div class="tool-result-card" role="status" aria-live="polite" style="background:#0D2847;border:1px solid rgba(232,240,250,0.12);border-radius:1.25rem;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.45);color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' +
          '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.75rem;">Your readiness score</p>' +
          '<p style="font-size:clamp(2.5rem,1.5rem+4vw,4rem);font-weight:900;line-height:1;margin:0 0 0.25rem;color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + score + '%</p>' +
          '<p style="font-size:0.95rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0 0 1.5rem;"><strong style="color:#E8F0FA;-webkit-text-fill-color:#E8F0FA;">' + met.length + ' of ' + total + '</strong> technical control themes fully met against Cyber Essentials v3.3 (Danzell).</p>' +
          '<div style="background:' + vBg + ';border:1px solid ' + vBorder + ';border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.5rem;">' +
            '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:' + vColor + ';-webkit-text-fill-color:' + vColor + ';margin:0 0 0.35rem;">Verdict</p>' +
            '<p style="font-size:1.25rem;font-weight:900;color:' + vColor + ';-webkit-text-fill-color:' + vColor + ';margin:0 0 0.5rem;">' + verdict + '</p>' +
            '<p style="font-size:0.85rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;">' + vDetail + '</p>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;margin:0 0 0.6rem;">Themes met</p>' +
              '<ul style="list-style:none;margin:0;padding:0;font-size:0.9rem;">' + metHtml + '</ul>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04);border-radius:0.75rem;padding:1rem;">' +
              '<p style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#FCA5A5;-webkit-text-fill-color:#FCA5A5;margin:0 0 0.6rem;">Gaps to address</p>' +
              '<ul style="list-style:none;margin:0;padding:0;font-size:0.9rem;">' + gapsHtml + '</ul>' +
            '</div>' +
          '</div>' +
          '<div style="background:rgba(12,201,168,0.12);border:1px solid rgba(12,201,168,0.35);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem;">' +
            '<p style="font-size:0.85rem;color:#0CC9A8;-webkit-text-fill-color:#0CC9A8;font-weight:700;margin:0 0 0.25rem;">Basic vs Plus</p>' +
            '<p style="font-size:0.8rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;">Cyber Essentials (Basic) is a self-assessment of these five themes. Cyber Essentials Plus adds an independent, hands-on technical audit of the same five themes. Both require all five to be fully met.</p>' +
          '</div>' +
          '<p style="font-size:0.75rem;color:#9FB3C8;-webkit-text-fill-color:#9FB3C8;margin:0;border-top:1px solid rgba(232,240,250,0.10);padding-top:1rem;">Basis: NCSC Cyber Essentials Requirements for IT Infrastructure v3.3 (Danzell), in force 27 April 2026. Indicative self-assessment only, not a certification or assessor decision. A full IASME-aligned assessment covers 60+ questions.</p>' +
        '</div>';
      applyImportant(out);

      if (window.CAToolTeaser) {
        try {
          window.CAToolTeaser.recordRun('cyber-essentials-readiness');
          window.CAToolTeaser.appendUpgradeStrip('cyber-essentials-readiness', out);
        } catch (_) {}
      }
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
