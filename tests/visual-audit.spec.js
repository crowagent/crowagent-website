const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Principal Architect Visual Audit', () => {
  const pages = [
    { name: 'homepage', url: '/index.html' },
    { name: 'pricing', url: '/pricing.html' },
    { name: 'about', url: '/about.html' }
  ];

  for (const p of pages) {
    test(`Visual audit of ${p.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(p.url, { waitUntil: 'networkidle' });

      // Wait a bit for animations to settle
      await page.waitForTimeout(2000);

      const metrics = {};

      // 1. Navigation Check
      const nav = page.locator('#ca-nav');
      if (await nav.count() > 0) {
        metrics.nav = await nav.boundingBox();
        metrics.navStyle = await nav.evaluate(el => {
          const s = window.getComputedStyle(el);
          return {
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            height: s.height,
            zIndex: s.zIndex,
            backgroundColor: s.backgroundColor,
            position: s.position
          };
        });
      }

      // 2. Alignment Check (H1 vs First CTA)
      const h1 = page.locator('h1').first();
      const cta = page.locator('.sv-btn--primary, .btn-primary-v2').first();
      
      if (await h1.count() > 0) {
        metrics.h1 = await h1.boundingBox();
        metrics.h1Center = metrics.h1.x + metrics.h1.width / 2;
      }
      
      if (await cta.count() > 0) {
        metrics.cta = await cta.boundingBox();
        metrics.ctaCenter = metrics.cta.x + metrics.cta.width / 2;
        metrics.alignmentDrift = Math.abs(metrics.h1Center - metrics.ctaCenter);
      }

      // 3. Earth Check (Home only)
      if (p.name === 'homepage') {
        const earth = page.locator('.hero-bg-earth');
        if (await earth.count() > 0) {
          metrics.earth = await earth.evaluate(el => {
            const s = window.getComputedStyle(el);
            return {
              display: s.display,
              visibility: s.visibility,
              opacity: s.opacity,
              backgroundImage: s.backgroundImage,
              transform: s.transform,
              zIndex: s.zIndex
            };
          });
        }
      }

      // 4. Overlap Check (Cards)
      const cards = await page.locator('.sv-card, [class*="-card"]').all();
      metrics.cardCount = cards.length;
      metrics.overlaps = [];
      
      const boxes = [];
      for (const card of cards) {
        const box = await card.boundingBox();
        if (box) boxes.push(box);
      }

      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const b1 = boxes[i];
          const b2 = boxes[j];
          const isOverlapping = !(b1.x + b1.width < b2.x || 
                                   b2.x + b2.width < b1.x || 
                                   b1.y + b1.height < b2.y || 
                                   b2.y + b2.height < b1.y);
          if (isOverlapping) {
            metrics.overlaps.push({ i, j });
          }
        }
      }

      console.log(`METRICS for ${p.name}:`, JSON.stringify(metrics, null, 2));

      // Take screenshot
      await page.screenshot({ path: `audit-screenshots/screenshot-${p.name}.png`, fullPage: true });
    });
  }
});
