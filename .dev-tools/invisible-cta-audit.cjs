// Can you actually SEE every call-to-action?
//
// The reported P0: secondary CTAs compute to a fully transparent background, no
// background-image and a transparent border, so only an inset box-shadow arc draws.
// A user sees bare text where a button is meant to be.
//
// This measures the two things that make a button visible AT ALL:
//   (a) a visible BOUNDARY  — background-color alpha, background-image, border with
//       a non-transparent colour and non-zero width, or an outer box-shadow;
//   (b) a visible LABEL     — contrast of the computed text colour against the real
//       backdrop behind the button (walked up the ancestor chain until an opaque
//       background is found, because a button's ground usually comes from an ancestor).
//
// Reported INVISIBLE when there is no boundary AND label contrast < 3:1 (the button is
// simply not there). Reported FLAT when there is no boundary but the label still reads
// (a text-link masquerading as a button — legitimate for a true ghost, suspicious when
// it sits beside a filled sibling with the same class list).
//
// VALIDATION. Run with --selftest: two buttons are injected into the first page, one
// deliberately transparent-on-transparent (MUST report INVISIBLE) and one filled teal
// (MUST report OK). The run aborts if either expectation fails, so a zero from this
// detector cannot be a blind zero.
const { chromium } = require("../node_modules/playwright");
const fs = require("fs"), path = require("path");

const ORIGIN = "http://localhost:8092";
const SELFTEST = process.argv.includes("--selftest");
const only = process.argv.filter(a => a.endsWith(".html"));

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
const targets = only.length ? only : pages;

// One argument only — page.evaluate takes exactly one.
function probe(arg) {
  const { selftest } = arg;

  if (selftest) {
    const host = document.body;
    const bad = document.createElement("a");
    bad.className = "sv-btn sv-btn--lg __selftest_bad";
    bad.textContent = "Selftest invisible";
    bad.setAttribute("style", "background:transparent!important;background-image:none!important;border:1px solid transparent!important;box-shadow:none!important;color:rgba(0,0,0,0.02)!important;padding:12px 24px;display:inline-block");
    const good = document.createElement("a");
    good.className = "sv-btn sv-btn--lg __selftest_good";
    good.textContent = "Selftest visible";
    good.setAttribute("style", "background:#2DD4BF!important;color:#04060B!important;padding:12px 24px;display:inline-block");
    host.appendChild(bad); host.appendChild(good);
  }

  const parseRGB = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  // The real ground behind an element: walk ancestors until something opaque.
  const backdrop = (el) => {
    let acc = null, n = el.parentElement;
    while (n) {
      const cs = getComputedStyle(n);
      const c = parseRGB(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return { c: acc || { r: 12, g: 16, b: 32, a: 1 }, img: true };
      if (c && c.a > 0) { acc = acc ? over(acc, c) : c; if (c.a >= 0.99) return { c: acc, img: false }; }
      n = n.parentElement;
    }
    return { c: acc || { r: 12, g: 16, b: 32, a: 1 }, img: false };
  };

  const out = [];
  const nodes = document.querySelectorAll("a.sv-btn, button.sv-btn, .sv-btn, a.btn, button.btn, .cta-btn");
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) continue;

    const bgc = parseRGB(cs.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 };
    const hasBgColor = bgc.a > 0.06;
    const hasBgImage = cs.backgroundImage && cs.backgroundImage !== "none";
    let hasBorder = false;
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      const w = parseFloat(cs["border" + side + "Width"]) || 0;
      const c = parseRGB(cs["border" + side + "Color"]);
      const style = cs["border" + side + "Style"];
      if (w > 0 && style !== "none" && c && c.a > 0.06) hasBorder = true;
    }
    // An inset shadow is a highlight arc, not an edge. Only an OUTER shadow bounds a button.
    const sh = cs.boxShadow || "none";
    const hasOuterShadow = sh !== "none" && !/^inset/.test(sh.trim()) && !/^none/.test(sh) &&
      sh.split(/,(?![^(]*\))/).some(s => !/inset/.test(s));

    const boundary = hasBgColor || hasBgImage || hasBorder || hasOuterShadow;

    const ground = backdrop(el);
    const fg = parseRGB(cs.color) || { r: 255, g: 255, b: 255, a: 1 };
    const eff = fg.a < 1 ? over(fg, ground.c) : fg;
    const contrast = ground.img ? null : ratio(eff, ground.c);

    let verdict = "OK";
    if (!boundary) verdict = (contrast !== null && contrast < 3) ? "INVISIBLE" : "FLAT";

    out.push({
      verdict,
      cls: el.className,
      text: (el.textContent || "").trim().slice(0, 40),
      bg: cs.backgroundColor,
      bgImg: hasBgImage ? "yes" : "none",
      border: cs.borderTopWidth + " " + cs.borderTopStyle + " " + cs.borderTopColor,
      shadow: hasOuterShadow ? "outer" : (sh === "none" ? "none" : "inset-only"),
      color: cs.color,
      contrast: contrast === null ? "img" : Math.round(contrast * 100) / 100,
      inline: el.getAttribute("style") ? "INLINE-STYLE" : "",
    });
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("ca_consent", JSON.stringify({ analytics: true, marketing: true, ts: Date.now() }));
      localStorage.setItem("cookieConsent", "accepted");
    } catch (e) { /* storage blocked in this context; banner may overlay, noted in output */ }
  });
  const page = await ctx.newPage();

  let bad = 0, flat = 0, total = 0, selftestSeen = { bad: false, good: false };
  for (const rel of targets) {
    const url = ORIGIN + "/" + rel;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(350);
      await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { /* infinite animation cannot finish; leave it running */ } }));
      const rows = await page.evaluate(probe, { selftest: SELFTEST && rel === targets[0] });
      total += rows.length;
      const hits = rows.filter(r => r.verdict !== "OK");
      if (SELFTEST && rel === targets[0]) {
        for (const r of rows) {
          if (/__selftest_bad/.test(r.cls)) { selftestSeen.bad = r.verdict === "INVISIBLE"; }
          if (/__selftest_good/.test(r.cls)) { selftestSeen.good = r.verdict === "OK"; }
        }
      }
      if (hits.length) {
        console.log("\n=== " + rel + " ===");
        for (const h of hits) {
          if (h.verdict === "INVISIBLE") bad++; else flat++;
          console.log(`  [${h.verdict}] "${h.text}" ${h.inline}`);
          console.log(`      class:    ${h.cls}`);
          console.log(`      bg:       ${h.bg}  bgImage:${h.bgImg}`);
          console.log(`      border:   ${h.border}`);
          console.log(`      shadow:   ${h.shadow}`);
          console.log(`      color:    ${h.color}  contrast-vs-ground: ${h.contrast}`);
        }
      }
    } catch (e) {
      console.log("ERROR " + rel + ": " + e.message);
    }
  }

  console.log(`\n---\nscanned ${targets.length} pages, ${total} CTA elements`);
  console.log(`INVISIBLE (no boundary, label under 3:1): ${bad}`);
  console.log(`FLAT (no boundary, label still reads):    ${flat}`);
  if (SELFTEST) {
    console.log(`selftest: injected-invisible detected=${selftestSeen.bad}  injected-filled clean=${selftestSeen.good}`);
    if (!selftestSeen.bad || !selftestSeen.good) {
      console.log("SELFTEST FAILED — this detector is blind, ignore its zeroes.");
      await browser.close();
      process.exit(2);
    }
  }
  await browser.close();
})();
