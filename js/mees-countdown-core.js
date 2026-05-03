/**
 * MEES countdown for crowagent-core.html page.
 * Externalized from inline script for CSP compliance (DEF-003).
 */
(function(){
  var target = new Date('2028-04-01T00:00:00Z');
  var now = new Date();
  var diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  var el = document.getElementById('mees-days-core');
  if (el && diff > 0) el.textContent = diff;
})();
