/**
 * MEES countdown for crowagent-core.html — RETIRED.
 * Previously counted down to a proposed "MEES Band C by 1 April 2028" milestone.
 * That interim standard has been WITHDRAWN. The Government's 18 Jun 2026 interim
 * response instead proposes a single EPC B standard from 2031 for non-domestic
 * lets over 1,000 m², subject to secondary legislation and NOT yet law. No
 * confirmed statutory date exists, so no day-countdown is rendered (false
 * precision). Kept as an inert no-op so any residual element shows no number.
 */
(function(){
  var el = document.getElementById('mees-days-core');
  if (el && !el.textContent.trim()) el.textContent = '';
})();
