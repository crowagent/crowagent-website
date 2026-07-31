// Find <picture> wrappers whose box does not match the <img> inside them.
//
// WHY THIS EXISTS. Wrapping an <img> in <picture> to add AVIF/WebP sources is invisible in
// the text of a page and invisible to every gate this site has, but it MOVES THE LAYOUT BOX
// UP A LEVEL. Any CSS that sized the img as a flex or grid child keeps matching and stops
// working: `#trust .tr-shots img:first-child { width: 58% }` still matched after the wrap,
// because the img really is the first child of its own <picture>. The <picture> had no width
// of its own, collapsed to 2px, and the percentage resolved against that degenerate box.
// Measured result on the homepage device strip: tablet 126px, phone 67px, and a 306px HOLE
// between them at 768px that widened to 409px at 1024px. It read as a missing third device.
//
// A selector-coverage check cannot find this: nothing is unmatched. Only the geometry shows
// it. So this compares the wrapper's rect to the image's rect and flags any disagreement.
//
// WRITTEN AS A FILE ON PURPOSE, and it SELF-TESTS before reporting: a detector that has never
// been shown to fire is not evidence of absence. Two detectors written earlier this cycle
// reported confident zeroes while blind.
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

// Tolerance of 2px absorbs sub-pixel rounding and 1px borders on the img.
const PROBE = () => {
  const out = [];
  document.querySelectorAll("picture").forEach((pic) => {
    const img = pic.querySelector("img");
    if (!img) { out.push({ why: "picture with no img", sel: "picture", pw: 0, ph: 0, iw: 0, ih: 0 }); return; }
    const p = pic.getBoundingClientRect(), i = img.getBoundingClientRect();
    // An image that has not laid out at all (both zero, lazy and far offscreen) is not a
    // finding: there is nothing to disagree about yet.
    if (i.width === 0 && i.height === 0) return;
    // An ABSOLUTELY POSITIONED img is out of flow: it is placed against the nearest
    // positioned ancestor, not against its <picture>, so a 0x0 inline wrapper is correct and
    // harmless. This is the `div.aspect-video > picture > img.absolute.inset-0` pattern used
    // by every blog card and hero on this site, and without this carve-out the probe reported
    // 60+ "collapsed wrappers" that were all fine, which would have buried the one real hit.
    const ip = getComputedStyle(img).position;
    if (ip === "absolute" || ip === "fixed") return;
    // `display: contents` is the CORRECT way to wrap an img in <picture>: the wrapper is
    // erased from the box tree, the img becomes the flex/grid child directly, and every rule
    // written against the img keeps working. Its rect is 0x0 by definition, which is not a
    // defect. The homepage device strip broke precisely because its wrappers were plain
    // inline boxes instead, so they DID take part in layout and collapsed.
    if (getComputedStyle(pic).display === "contents") return;
    // A DELIBERATE CROP WINDOW IS NOT A COLLAPSE. Mobile art direction on this site zooms a
    // capture and clips it with `overflow: hidden` on an ancestor, so the img is intentionally
    // WIDER than its wrapper — that is what makes the hero and the methodology proof legible
    // at 390px instead of rendering at scale 0.14. The signature of the real defect is the
    // opposite: a wrapper that has collapsed SMALLER than it should be, with nothing clipping.
    // Without this the detector reports both art-directed frames on every run and earns its
    // way into the ignore pile.
    for (let n = pic.parentElement; n && n !== document.body; n = n.parentElement) {
      const ov = getComputedStyle(n);
      if (ov.overflow === "hidden" || ov.overflowX === "hidden") return;
    }
    const dw = Math.abs(p.width - i.width), dh = Math.abs(p.height - i.height);
    if (dw > 2 || dh > 2) {
      const parent = pic.parentElement;
      const pd = parent ? getComputedStyle(parent).display : "";
      out.push({
        why: "wrapper does not match image",
        sel: (parent ? parent.tagName.toLowerCase() + "." + String(parent.className || "-").split(" ")[0] : "?") + " > picture",
        pw: Math.round(p.width), ph: Math.round(p.height),
        iw: Math.round(i.width), ih: Math.round(i.height),
        parentDisplay: pd,
        src: (img.currentSrc || img.src || "").split("/").pop().split("?")[0],
      });
    }
  });
  return out;
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 768, height: 1200 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  // SELF-TEST. Build the exact defect in a blank page and require the probe to report it.
  const sp = await ctx.newPage();
  await sp.setContent(`<div style="display:flex;gap:12px;width:600px">
      <picture><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" style="width:58%"></picture>
      <picture><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" style="width:30%"></picture>
    </div>`);
  await sp.waitForTimeout(200);
  const planted = await sp.evaluate(PROBE);
  await sp.close();
  if (!planted.length) {
    console.error("  SELF-TEST FAILED: probe did not report a planted collapsed <picture>. Detector is blind.");
    await b.close(); process.exit(1);
  }
  console.log("  self-test: probe reports " + planted.length + " collapsed wrapper(s) on a planted defect. Trustworthy.\n");

  const widths = [390, 768, 1440];
  const findings = [];
  let pictures = 0;
  for (const rel of pages.sort()) {
    for (const w of widths) {
      const p = await ctx.newPage();
      await p.setViewportSize({ width: w, height: 1200 });
      try {
        await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
        await p.waitForTimeout(700);
        // Scroll the whole page so lazy images actually load; an unloaded img has no box and
        // would be silently skipped, which is how an earlier image sweep reported a false zero.
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) {
            window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30));
          }
          window.scrollTo(0, 0);
        });
        await p.waitForTimeout(500);
        if (w === 768) pictures += await p.evaluate(() => document.querySelectorAll("picture").length);
        (await p.evaluate(PROBE)).forEach((f) => findings.push({ rel, w, ...f }));
      } catch (e) { findings.push({ rel, w, why: "page failed: " + String(e).slice(0, 60), sel: "", pw: 0, ph: 0, iw: 0, ih: 0 }); }
      await p.close();
    }
  }
  await b.close();

  console.log("  pages: " + pages.length + "   <picture> elements at 768px: " + pictures);
  console.log("  widths checked: " + widths.join(", ") + "\n");
  console.log("  COLLAPSED OR MISMATCHED WRAPPERS: " + findings.length);
  findings.forEach((f) =>
    console.log("     " + f.rel.padEnd(32) + "@" + String(f.w).padEnd(6) + f.sel.padEnd(30) +
      " picture " + f.pw + "x" + f.ph + "  img " + f.iw + "x" + f.ih +
      (f.parentDisplay ? "  parent:" + f.parentDisplay : "") + (f.src ? "  " + f.src : "")));
  if (!findings.length) console.log("     none");
})();
