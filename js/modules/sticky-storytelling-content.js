/**
 * sticky-storytelling-content.js — H3-FIGMA-WAVE-F-P2 (2026-05-10)
 *
 * Populates the .story-visual hosts inside #how-crowagent-works with
 * lightweight inline-SVG mockups (4 visuals matching the 4 steps).
 * Decoupled from sticky-storytelling.js (which only handles the
 * IntersectionObserver active-class swap).
 *
 * Each visual is brand-token aware (uses currentColor / CSS custom
 * properties), respects prefers-reduced-motion (no animated SVG
 * primitives), and has aria-hidden="true" to keep screen readers
 * focused on the textual .story-step content.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  /* Inline SVG markup per visual — kept under 1KB per panel.
     Stroke colours are currentColor; the host's CSS sets the colour. */
  var VISUALS = {
    "1": [
      '<div class="story-visual-frame" aria-hidden="true">',
      '  <div class="story-mockup story-mockup--check">',
      '    <div class="story-mockup-bar" data-pos="top">',
      '      <span class="story-mockup-dot story-mockup-dot--r"></span>',
      '      <span class="story-mockup-dot story-mockup-dot--y"></span>',
      '      <span class="story-mockup-dot story-mockup-dot--g"></span>',
      '      <span class="story-mockup-url">crowagent.ai/checks</span>',
      '    </div>',
      '    <div class="story-mockup-body">',
      '      <div class="story-mockup-title">Identify obligations</div>',
      '      <ul class="story-mockup-list">',
      '        <li><span class="story-mockup-pill">MEES</span> Postcode lookup</li>',
      '        <li><span class="story-mockup-pill">PPN 002</span> Contract profile</li>',
      '        <li><span class="story-mockup-pill">CSRD</span> Omnibus I check</li>',
      '        <li><span class="story-mockup-pill">VSME</span> Module B/C scope</li>',
      '      </ul>',
      '      <div class="story-mockup-cta">Start free check &rarr;</div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n"),
    "2": [
      '<div class="story-visual-frame" aria-hidden="true">',
      '  <div class="story-mockup story-mockup--verdict">',
      '    <div class="story-mockup-verdict-head">',
      '      <span class="story-mockup-verdict-badge story-mockup-verdict-badge--ok">In scope</span>',
      '      <span class="story-mockup-verdict-conf">Confidence 0.94</span>',
      '    </div>',
      '    <div class="story-mockup-verdict-title">CSRD applies from FY2027</div>',
      '    <div class="story-mockup-cite">Directive (EU) 2026/470 art. 1(2) &mdash; Omnibus I.</div>',
      '    <div class="story-mockup-cite">SI 2015/962 reg 39 &mdash; MEES penalty band.</div>',
      '    <div class="story-mockup-cite">PPN 002 (Cabinet Office, Feb 2025) &mdash; min 10% weighting.</div>',
      '    <div class="story-mockup-actions">',
      '      <span class="story-mockup-btn story-mockup-btn--primary">View full report</span>',
      '      <span class="story-mockup-btn story-mockup-btn--ghost">Download PDF</span>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n"),
    "3": [
      '<div class="story-visual-frame" aria-hidden="true">',
      '  <div class="story-mockup story-mockup--portfolio">',
      '    <div class="story-mockup-portfolio-head">',
      '      <span>Portfolio &middot; 12 properties</span>',
      '      <span class="story-mockup-portfolio-meta">FY2027 NPV</span>',
      '    </div>',
      '    <div class="story-mockup-bar-row">',
      '      <div class="story-mockup-bar2 story-mockup-bar2--a"><span style="width:84%"></span><b>Compliant</b></div>',
      '      <div class="story-mockup-bar2 story-mockup-bar2--b"><span style="width:42%"></span><b>At risk</b></div>',
      '      <div class="story-mockup-bar2 story-mockup-bar2--c"><span style="width:18%"></span><b>Non-compliant</b></div>',
      '    </div>',
      '    <div class="story-mockup-grid3">',
      '      <div><div class="k">£412k</div><div class="l">Penalty avoided</div></div>',
      '      <div><div class="k">14%</div><div class="l">IRR (Balanced)</div></div>',
      '      <div><div class="k">7.2y</div><div class="l">Payback</div></div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n"),
    "4": [
      '<div class="story-visual-frame" aria-hidden="true">',
      '  <div class="story-mockup story-mockup--monitor">',
      '    <div class="story-mockup-monitor-head">Regulatory monitor</div>',
      '    <ul class="story-mockup-timeline">',
      '      <li><span class="story-mockup-tdate">12 Mar</span> <span class="story-mockup-tk">CSRD waveform 2 &mdash; first reports due Q1 2027</span></li>',
      '      <li><span class="story-mockup-tdate">01 Apr</span> <span class="story-mockup-tk">MEES Band C target review</span></li>',
      '      <li><span class="story-mockup-tdate">15 May</span> <span class="story-mockup-tk">PPN 002 mid-year refresh</span></li>',
      '      <li><span class="story-mockup-tdate">30 Jun</span> <span class="story-mockup-tk">VSME annual reminder</span></li>',
      '    </ul>',
      '    <div class="story-mockup-monitor-foot">Email + in-product reminders &middot; 0 missed deadlines</div>',
      '  </div>',
      '</div>'
    ].join("\n")
  };

  function init() {
    var shell = document.getElementById("how-crowagent-works");
    if (!shell) return;
    var visuals = shell.querySelectorAll(".story-visual[data-visual]");
    if (!visuals.length) return;
    for (var i = 0; i < visuals.length; i++) {
      var v = visuals[i];
      var key = v.getAttribute("data-visual");
      if (VISUALS[key] && !v.dataset.populated) {
        v.innerHTML = VISUALS[key];
        v.dataset.populated = "1";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
