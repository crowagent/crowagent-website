// ── MEES 2028 COUNTDOWN — WP-WEB-003 (hero countdown pill) ──
// Self-contained module extracted from scripts.js (WS-AUDIT-043).
// Self-attaches via DOMContentLoaded; exits early if #mees-days not present.
// Drives the hero countdown pill on the homepage; updates every 60s.
// MEES Band C 2028 = PROPOSED target per SI 2015/962 — see CLAUDE.md §16.
(function() {
  function init() {
    var el = document.getElementById('mees-days');
    if (!el) return;
    var target = new Date('2028-04-01T00:00:00Z');
    function update() {
      var now = new Date();
      var diff = target - now;
      if (diff <= 0) { el.textContent = '0'; return; }
      el.textContent = Math.floor(diff / 86400000).toLocaleString('en-GB');
    }
    update();
    setInterval(update, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
