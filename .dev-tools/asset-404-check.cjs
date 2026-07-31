// Does every asset a page references actually exist and load?
//
// A broken <img> on a marketing page is a credibility failure, and a missing SVG
// logo renders as alt text or nothing at all. This checks the LIVE responses rather
// than the filesystem, because CF Pages and the local server resolve paths
// differently and a file that exists on disk can still 404 over HTTP.
const { chromium } = require("../node_modules/playwright");

const REL = process.argv[2] || "/index.html";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  const failed = [];
  const seen = new Map();
  page.on("response", (r) => {
    const u = r.url();
    if (!seen.has(u)) seen.set(u, r.status());
    if (r.status() >= 400) failed.push(r.status() + "  " + u);
  });
  page.on("requestfailed", (r) => failed.push("FAILED  " + r.url() + "  " + (r.failure() || {}).errorText));

  await page.goto("http://localhost:8092" + REL, { waitUntil: "networkidle", timeout: 60000 });
  // Scroll the whole page so lazy images actually request.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);

  // Images that loaded but are broken (naturalWidth 0) do not always emit a 4xx.
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => (i.currentSrc || i.src || "(no src)") + "   alt=" + JSON.stringify(i.getAttribute("alt")))
  );

  // Every img needs a real alt. Empty alt is only correct for decoration.
  const noAlt = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((i) => i.getAttribute("alt") === null)
      .map((i) => i.currentSrc || i.src)
  );

  console.log("=== HTTP failures ===");
  console.log(failed.length ? [...new Set(failed)].join("\n") : "none");
  console.log("\n=== broken images (naturalWidth 0) ===");
  console.log(broken.length ? broken.join("\n") : "none");
  console.log("\n=== images with NO alt attribute ===");
  console.log(noAlt.length ? noAlt.join("\n") : "none");

  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll("img")].map((i) => ({
      src: (i.currentSrc || i.src).replace(location.origin, ""),
      nat: i.naturalWidth + "x" + i.naturalHeight,
      box: Math.round(i.getBoundingClientRect().width) + "x" + Math.round(i.getBoundingClientRect().height),
    }))
  );
  console.log("\n=== all images: natural vs rendered box ===");
  for (const i of imgs) console.log(`  ${i.nat.padEnd(12)} -> ${i.box.padEnd(12)} ${i.src}`);

  await browser.close();
  process.exit(failed.length || broken.length || noAlt.length ? 1 : 0);
})();
