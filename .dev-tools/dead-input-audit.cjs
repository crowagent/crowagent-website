// Does every free-standing text input on the site actually DO something when you use it?
//
// WHY THIS EXISTS, AND WHY dead-button-audit COULD NOT COVER IT. On 2026-07-31 the
// "Search this site" box on 404.html was found to be completely inert: a bare <input> with
// no <form> around it, no handler, and no key binding. Typing accepted text, Enter produced
// no navigation, and the command palette stayed hidden — the primary recovery affordance on
// the page a lost visitor has just landed on. dead-button-audit reported 88 buttons all live
// on the same run, because it clicks BUTTONS. Nothing on this site looked at inputs.
//
// An input that sits OUTSIDE a form is the risky shape: a form gives Enter a default action,
// so a form field is never silently dead. A free-standing one only works if JavaScript makes
// it work, and that is exactly the wiring that gets lost in a refactor.
//
// A field is reported DEAD when, after focusing it, typing, and pressing Enter, none of:
//   - the DOM (MutationObserver: nodes, attributes, character data)
//   - the URL
//   - focus landing somewhere other than the field itself
//   - localStorage / sessionStorage
// moved, and no network request was attempted.
//
// The focus caveat matters here for the same reason it does for buttons: focusing the field
// changes activeElement, so a naive "did focus change" test would call every field live.
//
// SAFETY, mirroring dead-button-audit: everything leaving localhost is blocked at the route
// level, fields inside a <form> are skipped entirely so nothing can be submitted, dialogs are
// auto-dismissed, and each field is tested on a FRESH page so one interaction cannot mask the
// next or strand the run on a navigation.
const { chromium } = require("../node_modules/playwright");
const fs = require("fs"), path = require("path");

const SKIP = new Set(["node_modules", ".git", ".claude", "dist", "coverage", ".dev-tools", "stripe-sample", "Assets", "Doc", "scripts", "specs", "docs", "tests"]);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(d, e.name)); }
    else if (e.name.endsWith(".html") && !/^google[0-9a-f]+\.html$/i.test(e.name)) {
      pages.push(path.relative(".", path.join(d, e.name)).split(path.sep).join("/"));
    }
  }
})(".");

const ENUMERATE = () => {
  const out = [];
  document.querySelectorAll("input").forEach((el, i) => {
    const type = (el.type || "text").toLowerCase();
    if (["hidden", "submit", "button", "reset", "checkbox", "radio", "file", "image", "range"].indexOf(type) !== -1) return;
    if (el.disabled || el.readOnly) return;
    if (el.closest("form")) return;                 // a form gives Enter a default action
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return;
    if (r.width < 8 || r.height < 8) return;
    el.setAttribute("data-di-idx", String(i));
    out.push({ idx: i, label: (el.getAttribute("placeholder") || el.id || el.name || "input").slice(0, 34) });
  });
  return out;
};

const OBSERVE = () => {
  window.__diMoved = false;
  window.__diStore = JSON.stringify([Object.keys(localStorage).length, Object.keys(sessionStorage).length]);
  const mo = new MutationObserver(() => { window.__diMoved = true; });
  mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
};

// Single argument: page.evaluate passes exactly one value, so both inputs travel in an object.
const VERDICT = ({ startUrl, idx }) => {
  const el = document.querySelector('[data-di-idx="' + idx + '"]');
  const focusMoved = !!document.activeElement && document.activeElement !== el && document.activeElement !== document.body;
  const storeMoved = JSON.stringify([Object.keys(localStorage).length, Object.keys(sessionStorage).length]) !== window.__diStore;
  return { dom: !!window.__diMoved, url: location.href !== startUrl, focusMoved, storeMoved };
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });

  // SELF-TEST: a planted dead field must read DEAD and a planted live one must read LIVE.
  // A detector that cannot distinguish them is worthless, and the button audit's own history
  // records a first version that called everything live.
  {
    /* A FRESH PAGE PER PROBE, exactly as the main loop does. The first version ran both
       probes on one page and the self-test caught it immediately: the live probe appends a
       node, its MutationObserver stays attached, and the dead probe then inherits a document
       that is already moving — so the dead field read LIVE and the detector could not tell
       the two apart. Sharing a page between probes is the same masking hazard that made the
       button audit test each control on its own page. */
    const probe = async (id) => {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
      const p = await ctx.newPage();
      await p.goto("http://localhost:8092/index.html", { waitUntil: "load", timeout: 60000 });
      await p.waitForTimeout(1400);
      await p.evaluate((which) => {
        const i = document.createElement("input");
        i.id = which; i.type = "text";
        i.style.cssText = "position:fixed;left:10px;bottom:10px;width:200px;height:30px;z-index:99999";
        i.setAttribute("data-di-idx", which);
        document.body.appendChild(i);
        if (which === "di-live") {
          i.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { const d = document.createElement("div"); d.textContent = "moved"; document.body.appendChild(d); }
          });
        }
      }, id);
      await p.waitForTimeout(400);          // let load-time churn settle before observing
      const startUrl = p.url();
      await p.evaluate(OBSERVE);
      await p.evaluate((i) => { document.getElementById(i).focus(); }, id);
      await p.keyboard.type("test");
      await p.keyboard.press("Enter");
      await p.waitForTimeout(500);
      const v = await p.evaluate(VERDICT, { startUrl, idx: id });
      await ctx.close();
      return v.dom || v.url || v.focusMoved || v.storeMoved;
    };
    const liveOk = await probe("di-live");
    const deadOk = await probe("di-dead");
    if (!liveOk || deadOk) {
      console.error("  SELF-TEST FAILED: live field read " + (liveOk ? "live" : "DEAD") +
        ", dead field read " + (deadOk ? "LIVE" : "dead") + ". Detector cannot tell them apart.");
      await b.close(); process.exit(1);
    }
    console.log("  self-test: planted live field reads LIVE, planted dead field reads DEAD. Trustworthy.\n");
  }

  const dead = [];
  let tested = 0;

  for (const rel of pages.sort()) {
    const ctx0 = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p0 = await ctx0.newPage();
    let list = [];
    try {
      await p0.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 60000 });
      await p0.waitForTimeout(1500);
      list = await p0.evaluate(ENUMERATE);
    } catch (e) { /* absence surfaces in the totals */ }
    await ctx0.close();
    if (!list.length) continue;

    for (const item of list) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
      await ctx.route("**/*", (route) => {
        const u = route.request().url();
        if (u.startsWith("http://localhost:8092")) return route.continue();
        return route.abort();
      });
      const p = await ctx.newPage();
      p.on("dialog", (d) => d.dismiss().catch(() => {}));
      let net = 0;
      p.on("request", () => { net++; });
      try {
        await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 60000 });
        await p.waitForTimeout(1400);
        await p.evaluate(ENUMERATE);
        const startUrl = p.url();
        await p.evaluate(OBSERVE);
        const before = net;
        await p.evaluate((i) => { const el = document.querySelector('[data-di-idx="' + i + '"]'); if (el) el.focus(); }, item.idx);
        await p.keyboard.type("tender");
        await p.waitForTimeout(250);
        await p.keyboard.press("Enter");
        await p.waitForTimeout(900);
        const v = await p.evaluate(VERDICT, { startUrl, idx: item.idx });
        tested++;
        if (!v.dom && !v.url && !v.focusMoved && !v.storeMoved && net === before) {
          dead.push(rel + "   \"" + item.label + "\"");
        }
      } catch (e) { /* a navigation mid-probe counts as movement, not a failure */ }
      await ctx.close();
    }
    process.stdout.write(".");
  }
  await b.close();

  console.log("\n\n  free-standing inputs tested: " + tested);
  console.log("  inputs with NO observable effect: " + dead.length);
  dead.forEach((d) => console.log("     " + d));
})();
