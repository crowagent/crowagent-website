/**
 * draft-demo.js — autoplay controller for "How an answer gets drafted".
 *
 * Added 2026-07-30 on owner instruction: the site showed the analytics dashboard and
 * nothing showing how bid writing works.
 *
 * Behaviour:
 *   - advances through the steps on a timer, looping;
 *   - the step rail is a real tablist, so arrow keys and Home/End work and each step is
 *     reachable and announced;
 *   - pausing is a genuine pause, not a slow-down, and the button reports state via
 *     aria-pressed;
 *   - the progress bar is driven from the same duration constant as the timer, so what
 *     the reader sees cannot drift from what actually happens;
 *   - hovering or focusing inside the component pauses it, because reading a step should
 *     not be a race;
 *   - it does NOT run at all under prefers-reduced-motion: the CSS shows every step at
 *     once in that case, so a timer would fight the stylesheet;
 *   - it does nothing until the component is on screen, so the story starts when it is
 *     being read rather than finishing before the reader arrives.
 *
 * Defensive throughout: every hook is checked and the module returns quietly if the
 * markup is not present, so it cannot throw on a page that does not carry the demo.
 */
(function () {
  "use strict";

  if (typeof window === "undefined" || typeof document === "undefined") return;

  // MULTI-INSTANCE, 2026-07-30. This was `document.querySelector`, singular, which bound
  // only the FIRST stage on the page. Once #find and #prove became autoplay walkthroughs
  // sharing this controller, that silently killed every stage after the first: their panels
  // kept the `hidden` attribute, their transport did nothing and their progress bar never
  // moved. Both builders independently predicted the failure before it shipped.
  // Every piece of state below is already closure-local, so one call per root is the whole
  // change. Each stage keeps its own index, timer, paused flag and observer.
  var roots = [].slice.call(document.querySelectorAll("[data-draft-demo]"));
  if (!roots.length) return;
  roots.forEach(setup);

  function setup(root) {

  var steps = [].slice.call(root.querySelectorAll("[data-dd-step]"));
  var panels = [].slice.call(root.querySelectorAll("[data-dd-panel]"));
  if (!steps.length || steps.length !== panels.length) return;

  var pathEl = root.querySelector(".dd-path");
  var pathDefault = pathEl ? pathEl.textContent : "";
  var toggle = root.querySelector("[data-dd-toggle]");
  var status = root.querySelector("[data-dd-status]");
  var bar = root.querySelector("[data-dd-progress]");

  // One source of truth for the cadence. The status text and the progress bar both
  // derive from it, so the component cannot claim a duration it does not use.
  // The transport's accessible name is rewritten on every state change, so it cannot be
  // left to the markup. Derive it from this stage's own tablist label, or a second stage
  // would announce "the drafting walkthrough" while driving something else.
  function stageName() {
    var list = root.querySelector('[role="tablist"]');
    var l = list && list.getAttribute("aria-label");
    if (!l) return "walkthrough";
    return l.replace(/^steps in\s+/i, "").trim() || "walkthrough";
  }
  // MEASURED 2026-07-31: these read "Pause the " + stageName(), and stageName()
  // returns a gerund phrase, so the three stages on index.html announced
  //   "Pause the finding work worth bidding for"
  //   "Pause the drafting an answer"
  //   "Pause the proving delivery"
  // — all three ungrammatical, read live off the button's .sr-only text. Dropping
  // the article makes every derived name correct English without touching the
  // tablist labels the names come from.
  function pauseLabel() { return "Pause " + stageName(); }
  function playLabel() { return "Play " + stageName(); }

  var STEP_MS = 7000;
  var TICK_MS = 100;

  var motionOff = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  function reduced() { return !!(motionOff && motionOff.matches); }

  var index = 0;
  var elapsed = 0;
  var timer = 0;
  var paused = false;
  var onScreen = false;
  var userPaused = false;

  function show(next) {
    index = (next + steps.length) % steps.length;
    for (var i = 0; i < steps.length; i++) {
      var on = i === index;
      steps[i].setAttribute("aria-selected", on ? "true" : "false");
      steps[i].setAttribute("aria-current", on ? "true" : "false");
      steps[i].setAttribute("tabindex", on ? "0" : "-1");
      panels[i].setAttribute("data-on", on ? "true" : "false");
      panels[i].hidden = !on;
    }
    /* PER-STEP CHROME PATH, 2026-07-31. The simulated browser bar is ONE element shared by
       every panel in a stage, so it can only ever be true for the steps that show the same
       route. That broke the moment #prove step 4 started showing a real capture of
       /crowmark/reports while the bar still read /crowmark/contracts/… — BLUEPRINT section 5
       requires simulated chrome to show the real current URL, and a bar that contradicts the
       screenshot beneath it is worse than no bar.
       A panel may now carry data-dd-path; the bar follows it, and falls back to the stage
       default so the other two walkthroughs are untouched. */
    if (pathEl) {
      var want = panels[index] && panels[index].getAttribute("data-dd-path");
      pathEl.textContent = want || pathDefault;
    }
    elapsed = 0;
    paint();
  }

  function paint() {
    if (bar) bar.style.width = Math.min(100, (elapsed / STEP_MS) * 100) + "%";
    if (status) {
      status.textContent = paused
        ? "Paused. Step " + (index + 1) + " of " + steps.length + "."
        : "Step " + (index + 1) + " of " + steps.length + ". Advancing every " + (STEP_MS / 1000) + " seconds.";
    }
  }

  function tick() {
    if (paused || !onScreen) return;
    elapsed += TICK_MS;
    if (elapsed >= STEP_MS) { show(index + 1); return; }
    paint();
  }

  function start() {
    if (timer || reduced()) return;
    timer = window.setInterval(tick, TICK_MS);
  }

  function setPaused(next, byUser) {
    paused = next;
    if (byUser) userPaused = next;
    if (toggle) toggle.setAttribute("aria-pressed", paused ? "true" : "false");
    var label = toggle && toggle.querySelector(".sr-only");
    if (label) label.textContent = paused ? playLabel() : pauseLabel();
    paint();
  }

  // Reduced motion: the stylesheet already reveals every step, so make the DOM match
  // that and stop. No timer, no transport.
  //
  // MEASURED 2026-07-31 in a reducedMotion:"reduce" browser context. The previous
  // version of this branch left each stage as a role="tablist" whose four role="tab"
  // children ALL carried aria-selected="false". The tab pattern requires exactly one
  // selected tab, and on this path there is no selection to make: the stylesheet
  // shows all four panels at once. So a screen reader met a tablist with nothing
  // selected, and arrow keys did nothing because the keydown handler further down is
  // never reached on this path. The four step buttons were also left focusable
  // (tabindex="0") with no click handler bound, which is 12 dead controls on
  // index.html for a keyboard user.
  //
  // With motion off the component is a static outline, so the markup should say that:
  // drop the tab/tabpanel relationship, leave the container as a plain labelled group,
  // and give each step button the one job that still makes sense — move the reader to
  // its step. `behavior: "auto"`, never "smooth": this reader has asked not to be
  // moved by animation.
  function bindJump(btn, panel) {
    btn.addEventListener("click", function () {
      try {
        panel.scrollIntoView({ block: "start", behavior: "auto" });
      } catch (err) {
        panel.scrollIntoView(true);
      }
    });
  }

  if (reduced()) {
    var staticList = root.querySelector('[role="tablist"]');
    if (staticList) {
      staticList.setAttribute("role", "group");
      staticList.removeAttribute("aria-orientation");
    }
    for (var i = 0; i < panels.length; i++) {
      panels[i].setAttribute("data-on", "true");
      panels[i].hidden = false;
      panels[i].removeAttribute("role");
      steps[i].removeAttribute("role");
      steps[i].removeAttribute("aria-selected");
      steps[i].removeAttribute("aria-current");
      steps[i].setAttribute("tabindex", "0");
      bindJump(steps[i], panels[i]);
    }
    if (status) status.textContent = "All " + steps.length + " steps shown, because reduced motion is on.";
    return;
  }

  show(0);
  setPaused(false, false);

  steps.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      show(i);
      setPaused(true, true);   // a deliberate choice should stick
    });
  });

  // Standard tablist keyboard behaviour.
  root.addEventListener("keydown", function (e) {
    if (steps.indexOf(e.target) === -1) return;
    var next = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = steps.length - 1;
    if (next === null) return;
    e.preventDefault();
    show(next);
    setPaused(true, true);
    steps[index].focus();
  });

  if (toggle) {
    // Toggle the USER's intent, not the transient paused flag.
    //
    // Measured bug: clicking the button un-paused it. The event order is mousedown,
    // then focusin, then click. The focusin handler below had already set paused=true
    // (as a hover/focus courtesy pause), so `!paused` evaluated to false and the click
    // resumed playback. aria-pressed reported false while the reader had just asked for
    // pause. Flipping userPaused instead makes the button mean what it says regardless
    // of what focus did a millisecond earlier.
    toggle.addEventListener("click", function () {
      userPaused = !userPaused;
      setPaused(userPaused, true);
    });
  }

  // Reading a step should not be a race. Hover and focus pause; leaving resumes only
  // if the reader had not pressed pause themselves.
  root.addEventListener("mouseenter", function () { if (!userPaused) setPaused(true, false); });
  root.addEventListener("mouseleave", function () { if (!userPaused) setPaused(false, false); });
  root.addEventListener("focusin", function () { if (!userPaused) setPaused(true, false); });
  root.addEventListener("focusout", function (e) {
    if (userPaused) return;
    if (root.contains(e.relatedTarget)) return;
    setPaused(false, false);
  });

  // Only run while on screen.
  if (typeof IntersectionObserver === "function") {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
    }, { threshold: 0.25 }).observe(root);
  } else {
    onScreen = true;
    start();
  }
  }
})();
