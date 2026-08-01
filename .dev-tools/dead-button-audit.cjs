// Does every <button> on the site actually DO something?
//
// The consent P0 ("Accept all" did nothing on 23 of 43 pages) survived because nothing
// tested it. This is the general form of that question: click every button and check
// whether anything observable changes.
//
// A button is reported DEAD when, after a real click, none of these moved:
//   - the DOM (MutationObserver: nodes, attributes, or character data)
//   - the URL
//   - focus, LANDING SOMEWHERE OTHER THAN THE BUTTON ITSELF
//   - localStorage / sessionStorage
// and no network request was attempted.
//
// That focus caveat is the whole difference between a working detector and a useless one.
// Clicking a <button> focuses it, so a naive "did activeElement change" test is true on
// every single click and NOTHING can ever be reported dead. Validated against an injected
// handler-less button (must read DEAD) and an injected DOM-mutating one (must read LIVE);
// the first version failed that check and this criterion is what fixed it.
//
// SAFETY. This clicks real controls, so:
//   - external requests are blocked at the route level, so no form can reach a live
//     endpoint and nothing is submitted to app.crowagent.ai;
//   - type=submit is skipped, and so is anything inside a <form>;
//   - dialogs are auto-dismissed, because a native dialog would block the session;
//   - each button is tested on a FRESH page, so one click cannot mask the next and a
//     navigation cannot strand the run.
// That freshness costs time, which is why it runs a page at a time.
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

const ONLY = process.argv[3] ? [process.argv[3]] : pages;

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const dead = [];
  let tested = 0;

  for (const rel of ONLY) {
    // First pass: enumerate the testable buttons on this page.
    const ctx0 = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p0 = await ctx0.newPage();
    let list = [];
    try {
      await p0.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 60000 });
      await p0.waitForTimeout(1600);
      list = await p0.evaluate(() => {
        const out = [];
        document.querySelectorAll("button").forEach((btn, i) => {
          const cs = getComputedStyle(btn);
          const r = btn.getBoundingClientRect();
          if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return;
          if (r.width < 4 || r.height < 4) return;
          if (btn.disabled) return;
          if ((btn.type || "").toLowerCase() === "submit") return;   // never submit
          if (btn.closest("form")) return;                            // never touch forms
          btn.setAttribute("data-db-idx", String(i));
          out.push({ idx: i, label: (btn.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34) || btn.id || btn.className.toString().slice(0, 24) });
        });
        return out;
      });
    } catch (e) { console.log("  ERR enumerate " + rel + " " + String(e).slice(0, 40)); }
    await ctx0.close();
    if (!list.length) continue;

    for (const item of list) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
      // Block anything leaving localhost, so no live endpoint is ever contacted.
      await ctx.route("**/*", (route) => {
        const u = route.request().url();
        if (u.startsWith("http://localhost:8092")) return route.continue();
        return route.abort();
      });
      const p = await ctx.newPage();
      p.on("dialog", (d) => d.dismiss().catch(() => {}));
      let netAttempts = 0;
      p.on("request", () => { netAttempts++; });
      try {
        await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 60000 });
        await p.waitForTimeout(1500);
        // Tag the same button index, then arm the observer.
        await p.evaluate((idx) => {
          const btn = document.querySelectorAll("button")[idx];
          if (!btn) return;
          btn.setAttribute("data-db-target", "1");
          window.__dbChanges = 0;
          window.__dbObs = new MutationObserver((muts) => { window.__dbChanges += muts.length; });
          window.__dbObs.observe(document.documentElement, {
            subtree: true, childList: true, attributes: true, characterData: true
          });
          window.__dbBtn = btn;
          window.__dbBefore = {
            url: location.href,
            ls: (function () { try { return JSON.stringify(Object.keys(localStorage).sort()); } catch (e) { return ""; } })(),
            ss: (function () { try { return JSON.stringify(Object.keys(sessionStorage).sort()); } catch (e) { return ""; } })()
          };
        }, item.idx);
        const netBefore = netAttempts;
        await p.click('[data-db-target="1"]', { timeout: 4000 }).catch(() => {});
        await p.waitForTimeout(650);
        const res = await p.evaluate(() => {
          const b = window.__dbBefore || {};
          const now = {
            url: location.href,
            ls: (function () { try { return JSON.stringify(Object.keys(localStorage).sort()); } catch (e) { return ""; } })(),
            ss: (function () { try { return JSON.stringify(Object.keys(sessionStorage).sort()); } catch (e) { return ""; } })()
          };
          // Focus counts as an effect only if it moved somewhere that is NOT the button we
          // just clicked; the browser focuses the click target on its own.
          var ae = document.activeElement;
          var focusMoved = !!ae && ae !== window.__dbBtn && ae !== document.body && !window.__dbBtn.contains(ae);
          return {
            changes: window.__dbChanges || 0,
            urlMoved: b.url !== now.url,
            focusMoved: focusMoved,
            storageMoved: b.ls !== now.ls || b.ss !== now.ss
          };
        }).catch(() => null);
        tested++;
        const netMoved = netAttempts > netBefore;
        if (res && res.changes === 0 && !res.urlMoved && !res.focusMoved && !res.storageMoved && !netMoved) {
          dead.push({ page: rel, label: item.label });
        }
      } catch (e) { /* a navigation mid-click is itself evidence of an effect */ }
      await ctx.close();
    }
    process.stdout.write(".");
  }
  await b.close();

  console.log("\n\n  buttons tested: " + tested);
  console.log("  buttons with NO observable effect: " + dead.length + "\n");
  const byLabel = {};
  dead.forEach((d) => { (byLabel[d.label] = byLabel[d.label] || []).push(d.page); });
  Object.entries(byLabel).sort((a, b2) => b2[1].length - a[1].length).forEach(([label, ps]) => {
    console.log('  "' + label + '"  on ' + ps.length + " page(s)");
    ps.slice(0, 5).forEach((x) => console.log("      " + x));
  });
})();
