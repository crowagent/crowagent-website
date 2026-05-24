#!/usr/bin/env node
/**
 * Capture verification screenshots for the 8K-IMAGERY-PASS2 deployment.
 * Outputs to audit/screenshots/8k-pass2-2026-05-22/.
 */
"use strict";

const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE_URL = "http://localhost:8092";
const OUT_DIR = path.join(__dirname, "..", "audit", "screenshots", "8k-pass2-2026-05-22");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = ["/partners.html", "/contact.html"];
const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900, dpr: 2 },
  { name: "390x844", width: 390, height: 844, dpr: 3 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    for (const url of PAGES) {
      const slug = url.replace(/^\//, "").replace(/\.html$/, "");
      const outPath = path.join(OUT_DIR, `${slug}-${vp.name}.png`);
      console.log(`screenshotting ${url} @ ${vp.name} → ${outPath}`);
      await page.goto(`${BASE_URL}${url}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
      // Wait for images to settle
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          const imgs = Array.from(document.images);
          if (!imgs.length) return resolve();
          let pending = imgs.length;
          const done = () => { pending--; if (pending <= 0) resolve(); };
          imgs.forEach((img) => {
            if (img.complete) done();
            else { img.onload = done; img.onerror = done; }
          });
          setTimeout(resolve, 3000);
        });
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: outPath, fullPage: false });
    }
    await ctx.close();
  }
  await browser.close();
  console.log("\nDone.");
})();
