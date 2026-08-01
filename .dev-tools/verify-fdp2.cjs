// Verify the fdP2 swap renders — image actually loads, and the <picture> wrapper
// has not collapsed the way it has twice before in this repo.
//
// The panel is `hidden` until the walkthrough advances, so the attribute is removed
// before measuring. Measuring a hidden panel returns zeroes and would read as a
// collapse that is not there.
const { chromium } = require("../node_modules/playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("requestfailed", (r) => errors.push("REQFAIL " + r.url()));

  await page.goto("http://localhost:8092/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { /* infinite */ } }));

  // Reveal FIRST, then wait. The image is loading="lazy" and the panel starts hidden,
  // so the fetch has not even been issued at this point — measuring immediately reports
  // naturalWidth 0 and reads as a broken image. That is the detector being wrong, not
  // the page.
  await page.evaluate(() => {
    const p = document.getElementById("fdP2");
    if (!p) return;
    p.removeAttribute("hidden");
    p.setAttribute("data-on", "true");
  });
  await page.waitForFunction(() => {
    const img = document.querySelector("#fdP2 img");
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 15000 }).catch(() => {});

  const r = await page.evaluate(() => {
    const p = document.getElementById("fdP2");
    if (!p) return { error: "fdP2 not found" };
    const img = p.querySelector("img");
    const pic = p.querySelector("picture");
    const fig = p.querySelector("figure");
    const kick = p.querySelector(".dd-prov");
    const ir = img.getBoundingClientRect();
    const pr = pic.getBoundingClientRect();
    const fr = fig.getBoundingClientRect();
    return {
      kicker: kick.textContent.trim(),
      kickerReal: kick.getAttribute("data-real"),
      src: img.currentSrc || img.src,
      complete: img.complete,
      natural: img.naturalWidth + "x" + img.naturalHeight,
      img: Math.round(ir.width) + "x" + Math.round(ir.height),
      picture: Math.round(pr.width) + "x" + Math.round(pr.height),
      figure: Math.round(fr.width) + "x" + Math.round(fr.height),
      altLen: (img.getAttribute("alt") || "").length,
      leftoverIllustration: !!p.querySelector(".fd-score, .fd-dial, .fd-reasons"),
    };
  });
  console.log(JSON.stringify(r, null, 2));

  const verdicts = [];
  if (r.error) verdicts.push("FAIL " + r.error);
  else {
    if (!r.complete || r.natural === "0x0") verdicts.push("FAIL image did not load");
    const [pw, ph] = r.picture.split("x").map(Number);
    const [iw, ih] = r.img.split("x").map(Number);
    if (pw < 10 || ph < 10) verdicts.push(`FAIL picture wrapper collapsed to ${r.picture}`);
    if (Math.abs(pw - iw) > 2 || Math.abs(ph - ih) > 2) verdicts.push(`FAIL picture ${r.picture} does not match img ${r.img}`);
    if (r.leftoverIllustration) verdicts.push("FAIL CSS illustration markup still present in fdP2");
    if (r.kickerReal !== "true") verdicts.push("FAIL kicker not marked as a real capture");
    if (r.altLen < 80) verdicts.push("FAIL alt text too short to describe the capture");
  }
  console.log(verdicts.length ? verdicts.join("\n") : "PASS — fdP2 renders the real capture, wrapper intact");
  console.log("console errors: " + (errors.length ? errors.join(" | ") : "0"));
  await browser.close();
  process.exit(verdicts.length ? 1 : 0);
})();
