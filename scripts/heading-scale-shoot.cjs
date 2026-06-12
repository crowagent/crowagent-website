#!/usr/bin/env node
/**
 * Zero-pixel verification harness. Usage:
 *   NODE_PATH=<platform web node_modules> node heading-scale-shoot.cjs shoot <outDir>
 *   node heading-scale-shoot.cjs compare <beforeDir> <afterDir>
 * Shoots 1440px full-page screenshots of the 5 specified pages + every touched page,
 * with animations disabled and reduced motion, deterministic settings.
 */
const fs = require("fs");
const path = require("path");

const PAGES = [
  // 5 specified verification pages
  "index.html", "crowmark.html", "pricing.html", "blog/index.html", "tools/index.html",
  // every other page touched by the rewrite
  "about.html", "crowagent-core.html", "crowcash.html", "crowcyber.html", "crowesg.html",
  "glossary/index.html", "intel/cyber-essentials-tracker/index.html",
  "intel/mees-tracker/index.html", "partners.html", "products/index.html",
  "resources.html", "roadmap.html",
  "tools/csrd-applicability-checker/index.html", "tools/cyber-essentials-readiness/index.html",
  "tools/late-payment-calculator/index.html", "tools/vsme-materiality-light/index.html",
];
const slug = (p) => p.replace(/\.html$/, "").replace(/[\/]/g, "_") || "index";

async function shoot(outDir) {
  const { chromium } = require("playwright");
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    timezoneId: "UTC",
    locale: "en-GB",
  });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:8095/${p}`, { waitUntil: "networkidle", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(outDir, slug(p) + ".png"),
      fullPage: true, animations: "disabled", caret: "hide",
    });
    await page.close();
    console.log("shot", p);
  }
  await browser.close();
}

function compare(beforeDir, afterDir) {
  const { PNG } = require("pngjs");
  let worst = 0;
  const rows = [];
  for (const p of PAGES) {
    const f = slug(p) + ".png";
    const a = fs.readFileSync(path.join(beforeDir, f));
    const b = fs.readFileSync(path.join(afterDir, f));
    if (a.equals(b)) { rows.push([p, "IDENTICAL (byte-equal)", 0, "0%"]); continue; }
    const ia = PNG.sync.read(a), ib = PNG.sync.read(b);
    if (ia.width !== ib.width || ia.height !== ib.height) {
      rows.push([p, `DIMENSION MISMATCH ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`, -1, "n/a"]);
      worst = Math.max(worst, 100);
      continue;
    }
    let diff = 0;
    for (let i = 0; i < ia.data.length; i += 4) {
      if (ia.data[i] !== ib.data[i] || ia.data[i+1] !== ib.data[i+1] ||
          ia.data[i+2] !== ib.data[i+2] || ia.data[i+3] !== ib.data[i+3]) diff++;
    }
    const total = ia.width * ia.height;
    const pct = (100 * diff) / total;
    worst = Math.max(worst, pct);
    rows.push([p, diff === 0 ? "IDENTICAL (pixel-equal)" : "DIFFERS", diff, pct.toFixed(4) + "%"]);
  }
  for (const r of rows) console.log(r.join("  |  "));
  console.log("WORST_PCT=" + worst.toFixed(4));
}

const [, , cmd, a1, a2] = process.argv;
if (cmd === "shoot") shoot(a1).catch((e) => { console.error(e); process.exit(1); });
else if (cmd === "compare") compare(a1, a2);
else { console.error("usage: shoot <dir> | compare <before> <after>"); process.exit(1); }
