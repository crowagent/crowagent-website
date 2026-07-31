// Overflow, console errors and fixed-element collisions at TABLET width, across every page.
//
// WHY 768 SPECIFICALLY. Every sweep on this site has run at 1440 and 390. 768 was measured
// (page height, hscroll booleans) but never actually examined, and reading one render at that
// width in a single session turned up three real defects that all the automated gates called
// clean: a <picture> wrapper collapse leaving a 306px hole in the homepage device strip, a
// back-to-top FAB intercepting clicks on walkthrough step buttons, and a 332x221px void in
// the footer. 768 is also the exact first pixel above the `max-width:767px` mobile carve-outs,
// so it is where "desktop" rules meet a viewport with almost no gutter. It deserves its own
// standing check.
//
// The fixed-element collision test is the generalisable part: a `position:fixed` control with
// a z-index above the content will SWALLOW CLICKS on anything underneath it, and neither an
// overflow check nor axe reports that.
const { chromium } = require("../node_modules/playwright");
const fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".claude", "dist", "coverage", ".dev-tools", "stripe-sample", "Assets", "Doc", "scripts", "specs", "docs", "tests"]);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(d, e.name)); }
    else if (e.name.endsWith(".html") && !/^google[0-9a-f]+\.html$/i.test(e.name))
      pages.push(path.relative(ROOT, path.join(d, e.name)).split(path.sep).join("/"));
  }
})(ROOT);

const W = 768;

// Runs at a given scroll offset. Returns overflowing elements and any interactive control
// sitting underneath a fixed, visible, non-nav element.
const PROBE = () => {
  // An element wider than the viewport is only a defect if it actually pushes the PAGE wide.
  // Inside a deliberate `overflow-x: auto` scroller it is the intended design: the pricing
  // comparison table and the terms.html pill rail both scroll horizontally on purpose, and
  // both reported here until this carve-out, with document.scrollWidth sitting at exactly 768
  // the whole time. Verifying a non-zero matters as much as verifying a zero.
  const inScroller = (e) => {
    for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };
  // Overflow only matters where it LOSES SOMETHING. The atmosphere layers on this site
  // (`.ca-mesh`, `.nb-fmesh` and friends) are empty absolutely-positioned blobs that bleed
  // past the right edge on purpose and are contained by `overflow-x: clip` on body, so they
  // cost the reader nothing. Requiring text or media means a cut-off heading, paragraph,
  // button or image still reports, while decoration does not. Page-level breakage is not
  // relying on this filter: `hscroll` below is measured separately from document.scrollWidth.
  const carriesContent = (e) =>
    (e.textContent || "").trim().length > 0 || !!e.querySelector("img,svg,video,canvas,picture,input,button");
  const over = [];
  document.querySelectorAll("body *").forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width > 0 && r.right > window.innerWidth + 1 && !inScroller(e) && carriesContent(e)) {
      over.push(e.tagName.toLowerCase() + "." + String(e.className || "-").split(" ")[0].slice(0, 24) + " right=" + Math.round(r.right));
    }
  });

  // Fixed overlays that are actually painted. The sticky header and the cookie banner are
  // EXPECTED to sit over content, so they are excluded by role rather than by guessing:
  // a header/nav is chrome, and the cookie banner is a deliberate modal-ish layer.
  const fixed = [...document.querySelectorAll("body *")].filter((e) => {
    const c = getComputedStyle(e);
    if (c.position !== "fixed" || c.display === "none" || c.visibility === "hidden") return false;
    if (parseFloat(c.opacity) === 0) return false;
    // `pointer-events: none` is the whole point of a decorative full-screen layer: it paints
    // and passes every click straight through. The site's `div.grain` texture overlay is
    // exactly that, and without this it reported a collision with the skip link, the logo and
    // both nav buttons on 7 pages — none of which is real. The defect being hunted is a
    // control that EATS a click, so pointer-events is the correct discriminator, not size.
    if (c.pointerEvents === "none") return false;
    const r = e.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return false;
    if (e.closest("header, nav, #ca-cookie, .cookie-banner, #mob-menu")) return false;
    if (e.tagName === "HEADER" || e.tagName === "NAV") return false;
    return true;
  });

  const collisions = [];
  fixed.forEach((f) => {
    const b = f.getBoundingClientRect();
    [...document.querySelectorAll("a,button,input,select,textarea,[role=button]")].forEach((t) => {
      if (t === f || f.contains(t) || t.contains(f)) return;
      const q = t.getBoundingClientRect();
      if (!q.width || !q.height) return;
      if (q.right > b.left && q.left < b.right && q.bottom > b.top && q.top < b.bottom) {
        collisions.push(
          (f.id ? "#" + f.id : f.tagName.toLowerCase() + "." + String(f.className || "-").split(" ")[0]) +
          " over <" + t.tagName.toLowerCase() + "> " +
          (t.getAttribute("aria-label") || t.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30));
      }
    });
  });
  return { over: [...new Set(over)], collisions: [...new Set(collisions)] };
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  // SELF-TEST: plant a fixed overlay on a real page and require the probe to see it.
  const sp = await ctx.newPage();
  await sp.goto("http://localhost:8092/index.html", { waitUntil: "load", timeout: 45000 });
  await sp.waitForTimeout(900);
  await sp.evaluate(() => {
    const d = document.createElement("div");
    d.id = "planted-overlay";
    d.style.cssText = "position:fixed;left:0;top:0;width:400px;height:400px;z-index:99;background:red";
    document.body.appendChild(d);
    // BOTH arms must be proven. The carve-outs above (scroller ancestor, decoration with no
    // content) are exactly the kind of filter that quietly turns a detector blind, so plant a
    // TEXT-CARRYING element past the right edge and require the overflow arm to see it too.
    const t = document.createElement("p");
    t.id = "planted-overflow";
    t.textContent = "planted overflowing sentence";
    t.style.cssText = "position:absolute;left:" + (window.innerWidth + 40) + "px;top:300px;width:300px";
    document.body.appendChild(t);
  });
  const planted = await sp.evaluate(PROBE);
  await sp.close();
  if (!planted.collisions.length) {
    console.error("  SELF-TEST FAILED: probe saw no collision under a planted 400x400 fixed overlay.");
    await b.close(); process.exit(1);
  }
  if (!planted.over.length) {
    console.error("  SELF-TEST FAILED: probe saw no overflow from a planted off-viewport paragraph. The carve-outs are too broad.");
    await b.close(); process.exit(1);
  }
  console.log("  self-test: probe reports " + planted.collisions.length + " collision(s) and " +
    planted.over.length + " overflow(s) on planted defects. Both arms trustworthy.\n");

  const bad = [];
  for (const rel of pages.sort()) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message.slice(0, 70)));
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 70)); });
    try {
      await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
      await p.waitForTimeout(800);
      await p.addStyleTag({ content: "html,body,*{scroll-behavior:auto !important}" });
      const H = await p.evaluate(() => document.body.scrollHeight);
      const allOver = new Set(), allCol = new Set();
      // Sample down the page: fixed overlays only collide at the offsets where a control
      // happens to be under them, so a single measurement at the top proves nothing.
      for (let y = 0; y < Math.max(1, H - 1000); y += 900) {
        await p.evaluate((yy) => window.scrollTo(0, yy), y);
        await p.waitForTimeout(140);
        const r = await p.evaluate(PROBE);
        r.over.forEach((x) => allOver.add(x));
        r.collisions.forEach((x) => allCol.add(x));
      }
      const hscroll = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (allOver.size || allCol.size || errs.length || hscroll) {
        bad.push({ rel, over: [...allOver], col: [...allCol], errs: [...new Set(errs)], hscroll });
      }
    } catch (e) { bad.push({ rel, over: [], col: [], errs: ["LOAD FAILED: " + String(e).slice(0, 60)], hscroll: false }); }
    await p.close();
  }
  await b.close();

  console.log("  pages swept at " + W + "px: " + pages.length);
  console.log("  PAGES WITH FINDINGS: " + bad.length + "\n");
  bad.forEach((x) => {
    console.log("     " + x.rel);
    if (x.hscroll) console.log("        HORIZONTAL SCROLL");
    x.over.slice(0, 4).forEach((o) => console.log("        overflow: " + o));
    x.col.slice(0, 4).forEach((c) => console.log("        COLLISION: " + c));
    x.errs.slice(0, 3).forEach((e) => console.log("        error: " + e));
  });
  if (!bad.length) console.log("     none");
})();
