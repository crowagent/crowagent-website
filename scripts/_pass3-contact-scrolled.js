#!/usr/bin/env node
"use strict";

const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE_URL = "http://localhost:8092";
const OUT_DIR = path.join(__dirname, "..", "audit", "screenshots", "8k-pass2-2026-05-22");
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const vp of [
    { name: "1440x900", w: 1440, h: 900, dpr: 2 },
    { name: "390x844", w: 390, h: 844, dpr: 3 },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: vp.dpr,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/contact.html`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load").catch(() => {});
    // Scroll to the contact-desk photo
    await page.evaluate(() => {
      const img = document.querySelector('img[src*="contact-desk.jpg"]');
      if (img) img.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(1500);
    const out = path.join(OUT_DIR, `contact-scrolled-${vp.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log("wrote", out);
    await ctx.close();
  }
  await browser.close();
})();
