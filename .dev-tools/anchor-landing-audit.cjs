// Does landing on an in-page anchor leave the target hidden under the sticky nav?
//
// Two earlier versions of this check were wrong, and both wrongnesses are the point:
//   1. Header detection took the tallest fixed/sticky element matching "[class*='nav']"
//      and produced header bottoms of 863px and 1817px. It was matching page-height
//      containers. Now: header/nav only, height 20-200px, pinned within 40px of the top.
//   2. Navigation by mutating location.hash in-page did not scroll at all, because
//      `html { scroll-behavior: smooth }` needs time and re-setting the same hash is a
//      no-op. The detector reported "0 hidden" even with scroll-margin-top forced to 0,
//      i.e. it could not fail. Now: a real navigation to url#id, then POLL until scrollY
//      stops moving, so the smooth scroll has actually finished before measuring.
// Elements with a 0x0 rect (display:none states like #gempty) are skipped: they sit at
// the origin and any "top < headerBottom" test calls them hidden.
const { chromium } = require("../node_modules/playwright");

const BASE = "http://localhost:8092/";
const PAGES = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const KILL = process.argv.includes("--kill-scroll-margin");   // self-test mode

const settle = async (p) => {
  let last = -1, same = 0;
  for (let i = 0; i < 40; i++) {
    const y = await p.evaluate(() => Math.round(window.scrollY));
    if (y === last) { if (++same >= 3) return y; } else { same = 0; last = y; }
    await p.waitForTimeout(90);
  }
  return last;
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });
  if (KILL) await ctx.addInitScript(() => {
    const s = document.createElement("style");
    s.textContent = "*{scroll-margin-top:0!important}";
    const add = () => document.head && document.head.appendChild(s);
    if (document.head) add(); else document.addEventListener("DOMContentLoaded", add);
  });

  let checked = 0, hidden = 0;
  for (const rel of PAGES) {
    const p = await ctx.newPage();
    await p.goto(BASE + rel, { waitUntil: "load" });
    await p.waitForTimeout(1400);
    const meta = await p.evaluate(() => {
      let hb = 0, name = null;
      document.querySelectorAll("header, nav").forEach((el) => {
        const cs = getComputedStyle(el), r = el.getBoundingClientRect();
        if (cs.position !== "fixed" && cs.position !== "sticky") return;
        if (r.height < 20 || r.height > 200 || r.top > 40) return;
        if (r.bottom > hb) { hb = r.bottom; name = el.tagName + (el.className ? "." + String(el.className).split(" ")[0] : ""); }
      });
      const main = document.querySelector("main") || document.body;
      const ids = [...main.querySelectorAll("[id]")].filter((e) => {
        const cs = getComputedStyle(e), r = e.getBoundingClientRect();
        return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0;
      }).map((e) => e.id).filter(Boolean);
      return { hb: Math.round(hb), name, ids };
    });
    await p.close();

    const bad = [];
    for (const id of meta.ids) {
      const q = await ctx.newPage();
      await q.goto(BASE + rel + "#" + id, { waitUntil: "load" });
      await q.waitForTimeout(700);
      await settle(q);
      const r = await q.evaluate((i) => {
        const el = document.getElementById(i);
        if (!el) return null;
        return { top: Math.round(el.getBoundingClientRect().top),
                 smt: getComputedStyle(el).scrollMarginTop,
                 y: Math.round(window.scrollY),
                 atBottom: Math.round(window.scrollY + window.innerHeight) >= Math.round(document.documentElement.scrollHeight) - 2 };
      }, id);
      await q.close();
      if (!r) continue;
      checked++;
      // A target that cannot scroll further because the page has bottomed out is not a defect.
      if (r.top < meta.hb && !r.atBottom) { hidden++; bad.push({ id, ...r }); }
    }
    console.log("  " + rel);
    console.log("     header " + meta.name + ", bottom " + meta.hb + "px | anchors " + meta.ids.length + " | HIDDEN " + bad.length);
    bad.slice(0, 8).forEach((x) => console.log("        #" + x.id.padEnd(24) + " top " + String(x.top).padStart(5) + "px  scroll-margin-top " + x.smt + "  scrollY " + x.y));
  }
  await b.close();
  console.log("\n  " + checked + " anchors checked, " + hidden + " hidden under the header" + (KILL ? "   [SELF-TEST: scroll-margin forced to 0]" : ""));
})();
