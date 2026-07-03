// ── MEES COUNTDOWN — RETIRED ──
// The hero countdown previously counted down to a proposed "MEES Band C by
// 1 April 2028" milestone. That interim standard has been WITHDRAWN. The
// Government's 18 Jun 2026 interim response instead proposes a single EPC B
// standard from 2031 for non-domestic lets over 1,000 m², subject to secondary
// legislation and NOT yet law. There is no confirmed statutory date, so we no
// longer render a day-countdown (it would be false precision). The homepage
// eyebrow now shows a static, hedged statement instead.
//
// This module is retained as an inert no-op so any residual #mees-days element
// never displays a misleading number.
(function () {
  var el = document.getElementById('mees-days');
  if (el && !el.textContent.trim()) el.textContent = '';
})();
