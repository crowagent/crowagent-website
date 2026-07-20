/* nebula-livepanels.js - entrance animation for the homepage product screens.

   Four screens carry an overlay that replays the ARRIVAL of the figures on
   the real screenshot underneath: counters count up, bars grow to height,
   trend lines draw in, covers fade off cards and rows in sequence. Then it
   stops. Nothing loops and nothing drifts.

   On CrowCash the figures are the account's own and the resting state is
   the screenshot. On CrowMark, CrowCyber and CrowESG the account is live
   but empty, so those rest on a worked example drawn in vector on top, and
   the frame carries a "Sample data" marker.

   The hero and the CrowMark showcase panel are the same screenshot, so they
   must carry the same figures. Both are stamped from ONE <template>, cloned
   into every [data-nbl-from] host below, which makes divergence impossible.

   Behaviour:
   - One shared requestAnimationFrame loop drives every track. It runs only
     while something is mid-entrance and is cancelled as soon as that screen
     leaves the viewport or the page is hidden, snapping to the final values
     so nothing is left half-drawn.
   - Inside the showcase the entrance replays when a tab is selected, which
     is a reveal of the same figures, not new data. The hero has no tabs, so
     it plays when it comes into view.
   - prefers-reduced-motion: reduce skips the animation entirely and paints
     the final values immediately.
*/
(function () {
  'use strict';

  // Stamp shared overlays in before anything is collected or measured.
  [].slice.call(document.querySelectorAll('[data-nbl-from]')).forEach(function (host) {
    var tpl = document.getElementById(host.getAttribute('data-nbl-from'));
    if (tpl && 'content' in tpl) host.appendChild(tpl.content.cloneNode(true));
  });

  var panels = [].slice.call(document.querySelectorAll('[data-nbl]'));
  if (!panels.length) return;

  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  var money = function (dp) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: 'GBP',
      minimumFractionDigits: dp, maximumFractionDigits: dp
    });
  };
  var gbp = money(2);
  var gbp0 = money(0);
  var whole = new Intl.NumberFormat('en-GB');

  /* ---- timeline shape (ms) ---- */
  var COVER = { at: 60, step: 70, dur: 420 };
  var IN = { at: 120, step: 26, dur: 520 };
  var NUM = { at: 240, step: 90, dur: 980 };
  var BAR = { at: 400, step: 90, dur: 760 };
  var PATH = { at: 660, step: 160, dur: 900 };
  var DOT = { at: 940, step: 90, dur: 380 };

  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  function format(el, v) {
    var f = el.getAttribute('data-nbl-fmt');
    if (f === 'gbp2') return gbp.format(v);
    if (f === 'gbp0') return gbp0.format(v);
    if (f === 'pct') return whole.format(Math.round(v)) + '%';
    return whole.format(Math.round(v));
  }

  /* ---- one-time read of each panel's tracks ---- */
  var shows = panels.map(function (panel) {
    var tracks = [];
    var add = function (nodes, plan, apply) {
      [].slice.call(nodes).forEach(function (el, i) {
        tracks.push({
          el: el,
          start: plan.at + i * plan.step,
          dur: plan.dur,
          apply: apply
        });
      });
    };
    var grow = function (el, p) { el.style.setProperty('--g', String(p)); };
    add(panel.querySelectorAll('.nbl-cover'), COVER, function (el, p) {
      el.style.setProperty('--o', String(1 - p));
    });
    // Chart furniture the screenshot does not already carry: gridlines, axis
    // ticks, category labels. It arrives with the panel, ahead of the figures.
    add(panel.querySelectorAll('.nbl-in'), IN, function (el, p) {
      el.style.setProperty('--i', String(p));
    });
    add(panel.querySelectorAll('[data-nbl-to]'), NUM, function (el, p) {
      el.textContent = format(el, parseFloat(el.getAttribute('data-nbl-to')) * p);
    });
    add(panel.querySelectorAll('.nbl-bar, .nbl-sbar'), BAR, grow);
    // Trend lines draw in. The dash length is the path's own measured length,
    // in viewBox units, so the reveal is exact at every rendered size.
    add(panel.querySelectorAll('.nbl-path'), PATH, function (el, p) {
      var len = el.__nblLen;
      if (len == null) {
        len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0;
        el.__nblLen = len;
      }
      if (!len) return;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len * (1 - p));
    });
    add(panel.querySelectorAll('.nbl-dot'), DOT, grow);
    var end = tracks.reduce(function (m, t) { return Math.max(m, t.start + t.dur); }, 0);
    // host is the tab panel this overlay belongs to, or null in the hero,
    // which has no tabs. watch is what decides "on screen" for this overlay.
    var host = panel.closest('.nb-panel');
    var watch = host ? (host.closest('[data-nb-showcase]') || host) : (panel.closest('.nb-frame') || panel);
    return { panel: panel, host: host, watch: watch, tracks: tracks, end: end, t0: 0, seen: false };
  }).filter(function (s) { return s.tracks.length; });

  if (!shows.length) return;

  function paint(show, p) {
    show.tracks.forEach(function (t) { t.apply(t.el, p); });
  }

  function settle(show) { paint(show, 1); }

  /* ---- shared rAF loop ---- */
  var running = [];
  var raf = 0;

  function frame(ts) {
    raf = 0;
    var still = [];
    for (var i = 0; i < running.length; i++) {
      var show = running[i];
      if (!show.t0) show.t0 = ts;
      var t = ts - show.t0;
      var done = true;
      for (var j = 0; j < show.tracks.length; j++) {
        var tr = show.tracks[j];
        var p = (t - tr.start) / tr.dur;
        if (p < 0) { p = 0; done = false; }
        else if (p < 1) { done = false; }
        else { p = 1; }
        tr.apply(tr.el, easeOut(p));
      }
      if (!done) still.push(show);
    }
    running = still;
    if (running.length) raf = requestAnimationFrame(frame);
  }

  function drop(show, snap) {
    var i = running.indexOf(show);
    if (i > -1) running.splice(i, 1);
    if (snap) settle(show);
    if (!running.length && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function stopAll(snap) {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (snap) running.forEach(settle);
    running = [];
  }

  /* ---- gating: only animate what is on screen, on a visible page ---- */
  var pageVisible = !document.hidden;
  var canObserve = 'IntersectionObserver' in window;

  // A tabbed screen also has to be the tab currently on stage.
  function eligible(show) {
    if (!pageVisible || !show.seen) return false;
    return show.host ? show.host.classList.contains('on') : true;
  }

  function play(show) {
    if (!show) return;
    if (mq.matches) { settle(show); return; }
    if (!eligible(show)) { paint(show, 0); return; }
    show.t0 = 0;
    paint(show, 0);
    if (running.indexOf(show) === -1) running.push(show);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  shows.forEach(function (s) {
    s.seen = !canObserve;
    paint(s, mq.matches ? 1 : 0);
  });

  // The showcase tells a panel it is on stage; the panel replays its entrance.
  document.addEventListener('nb:shown', function (e) {
    var next = null;
    shows.forEach(function (s) { if (s.host && s.host === e.target) next = s; });
    if (!next) return;
    shows.forEach(function (s) {
      if (s === next || !s.host) return;
      drop(s, false);
      if (!mq.matches) paint(s, 0);
    });
    play(next);
  }, true);

  if (canObserve) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // The four showcase overlays share one watched element, so every show
        // pointing at this target has to be updated, not just the first found.
        shows.forEach(function (show) {
          if (show.watch !== entry.target) return;
          if (entry.isIntersecting) {
            if (!show.seen) { show.seen = true; play(show); }
          } else if (show.seen) {
            show.seen = false;
            drop(show, true);
          }
        });
      });
    }, { threshold: 0.25 });
    shows.forEach(function (s) { io.observe(s.watch); });
  }

  document.addEventListener('visibilitychange', function () {
    pageVisible = !document.hidden;
    if (!pageVisible) { stopAll(true); return; }
    shows.forEach(function (s) { if (eligible(s)) play(s); });
  });

  var onMq = function () {
    if (mq.matches) { stopAll(false); shows.forEach(settle); }
    else { shows.forEach(function (s) { if (eligible(s)) play(s); }); }
  };
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onMq);
  else if (typeof mq.addListener === 'function') mq.addListener(onMq);

  if (mq.matches) shows.forEach(settle);
})();
