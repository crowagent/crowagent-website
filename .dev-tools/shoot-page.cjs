// Screenshot any local page in readable vertical slices.
//
// Reading a marketing page as an IMAGE is the only way to judge it — the repo rule
// is that a render suggests a defect and a measurement decides it, and neither is
// possible from source. Full-page in one shot is useless here: these pages run
// 10,000px+ and a single image scales the type down to unreadable.
//
//   node .dev-tools/shoot-page.cjs <url-path> <out-prefix> [width] [maxSlices]
const { chromium } = require("../node_modules/playwright");
const path = require("path");
const fs = require("fs");

const REL = process.argv[2] || "/index.html";
const PREFIX = process.argv[3] || "page";
const WIDTH = Number(process.argv[4] || 1440);
const MAX = Number(process.argv[5] || 8);
const OUT = path.resolve(__dirname, "..", ".shots-tmp");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: 1000 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  // Consent must be set BEFORE first paint or the cookie bar overlays every slice.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("ca_consent", JSON.stringify({ analytics: true, marketing: true, ts: 1 }));
      localStorage.setItem("cookieConsent", "accepted");
    } catch (e) { /* storage unavailable; banner may appear and will be visible in the slice */ }
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });

  await page.goto("http://localhost:8092" + REL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  // Autoplay walkthroughs must be stopped or successive slices photograph different
  // frames of the same component and the page looks inconsistent when it is not.
  await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { /* infinite */ } }));

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 1000;
  const slices = Math.min(MAX, Math.ceil(total / step));
  console.log(`${REL}: ${total}px tall at ${WIDTH}w -> ${slices} slices (of ${Math.ceil(total / step)})`);

  for (let i = 0; i < slices; i++) {
    const y = i * step;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(500);
    await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { /* infinite */ } }));
    const f = path.join(OUT, `${PREFIX}-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: f });
    console.log("  " + f);
  }
  console.log("console errors: " + (errors.length ? errors.slice(0, 5).join(" | ") : "0"));
  await browser.close();
})();
