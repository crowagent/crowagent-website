/* eslint-disable */
// WCAG 2.2 AA audit harness — axe-core + manual keyboard/contrast probes
// Read-only audit; no source files modified.
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const PAGES = [
  { id: 'home',     url: '/' },
  { id: 'pricing',  url: '/pricing.html' },
  { id: 'crowmark', url: '/crowmark.html' },
  { id: 'crowcyber',url: '/crowcyber.html' },
  { id: 'crowcash', url: '/crowcash.html' },
  { id: 'core',     url: '/crowagent-core.html' },
  { id: 'lpc',      url: '/tools/late-payment-calculator/' },
  { id: 'contact',  url: '/contact.html' },
  { id: 'security', url: '/security.html' },
  { id: 'blog',     url: '/blog/' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const out = { generatedAt: new Date().toISOString(), pages: {} };

  for (const p of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

    const url = BASE + p.url;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
    } catch (e) {
      out.pages[p.id] = { url, error: 'navigation failed: ' + e.message };
      await page.close();
      continue;
    }

    // 1) axe-core scan WCAG 2.0/2.1/2.2 A + AA
    let axe;
    try {
      axe = await new AxeBuilder({ page })
        .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'])
        .analyze();
    } catch (e) {
      out.pages[p.id] = { url, error: 'axe failed: ' + e.message };
      await page.close();
      continue;
    }

    const sev = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    const findings = [];
    for (const v of axe.violations) {
      sev[v.impact || 'minor'] = (sev[v.impact || 'minor'] || 0) + v.nodes.length;
      findings.push({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        wcag: (v.tags || []).filter(t => /wcag/i.test(t)),
        count: v.nodes.length,
        samples: v.nodes.slice(0, 5).map(n => ({
          html: (n.html || '').slice(0, 240),
          target: n.target,
          failureSummary: (n.failureSummary || '').slice(0, 400),
        })),
      });
    }

    // 2) Manual probes
    const probes = await page.evaluate(() => {
      const r = {};
      // html lang
      r.htmlLang = document.documentElement.getAttribute('lang') || null;
      // page title
      r.title = document.title || null;
      // h1 count + heading order
      const hs = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      r.h1Count = hs.filter(h => h.tagName === 'H1').length;
      r.headingSkips = [];
      let prev = 0;
      for (const h of hs) {
        const lvl = +h.tagName.substring(1);
        if (prev && lvl > prev + 1) r.headingSkips.push({ from: prev, to: lvl, text: (h.textContent || '').trim().slice(0,80) });
        prev = lvl;
      }
      // skip link: first focusable anchor pointing to id starting with main/content
      const firstA = document.querySelector('a[href^="#"]');
      r.firstAnchor = firstA ? { href: firstA.getAttribute('href'), text: (firstA.textContent || '').trim().slice(0,40) } : null;
      // forms
      const inputs = Array.from(document.querySelectorAll('input,textarea,select')).filter(el => {
        const t = (el.getAttribute('type') || '').toLowerCase();
        return !['hidden','submit','button','reset','image'].includes(t);
      });
      r.unlabeledInputs = inputs.filter(el => {
        if (el.getAttribute('aria-label')) return false;
        if (el.getAttribute('aria-labelledby')) return false;
        if (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) return false;
        if (el.closest('label')) return false;
        if (el.getAttribute('title')) return false;
        return true;
      }).map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        id: el.id || '',
        placeholder: el.getAttribute('placeholder') || '',
      }));
      // images
      const imgs = Array.from(document.querySelectorAll('img'));
      r.imgsTotal = imgs.length;
      r.imgsNoAlt = imgs.filter(i => !i.hasAttribute('alt')).map(i => ({ src: (i.getAttribute('src')||'').slice(0,120) }));
      // small touch targets
      const interactives = Array.from(document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="link"]'));
      r.smallTargets = interactives.map(el => {
        const rct = el.getBoundingClientRect();
        return { el, w: rct.width, h: rct.height };
      }).filter(o => o.el.offsetParent !== null && o.w > 0 && o.w < 24 || (o.el.offsetParent !== null && o.h > 0 && o.h < 24))
        .slice(0,15)
        .map(o => ({
          tag: o.el.tagName.toLowerCase(),
          text: (o.el.textContent || '').trim().slice(0, 40),
          aria: o.el.getAttribute('aria-label') || '',
          w: Math.round(o.w),
          h: Math.round(o.h),
        }));
      // skip link reachability via first Tab — simulate via focusable scan
      const focusables = Array.from(document.querySelectorAll('a[href]:not([tabindex="-1"]),button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'));
      r.firstFocusable = focusables[0] ? {
        tag: focusables[0].tagName.toLowerCase(),
        text: (focusables[0].textContent || '').trim().slice(0,40),
        href: focusables[0].getAttribute('href') || '',
        className: (focusables[0].className || '').toString().slice(0,80),
      } : null;
      // ARIA attribute invalid usage quick check
      const ariaProblems = [];
      document.querySelectorAll('[aria-expanded]').forEach(el => {
        if (!['true','false'].includes(el.getAttribute('aria-expanded'))) {
          ariaProblems.push({ kind: 'aria-expanded-invalid', val: el.getAttribute('aria-expanded'), html: el.outerHTML.slice(0,180) });
        }
      });
      document.querySelectorAll('[aria-controls]').forEach(el => {
        const tgt = el.getAttribute('aria-controls');
        if (tgt && !document.getElementById(tgt)) ariaProblems.push({ kind: 'aria-controls-orphan', val: tgt, html: el.outerHTML.slice(0,180) });
      });
      r.ariaProblems = ariaProblems.slice(0, 20);
      // focus-visible CSS? check if any button has outline removed without replacement
      const focusRing = (() => {
        const sample = document.querySelector('a,button');
        if (!sample) return null;
        sample.focus({ preventScroll: true });
        const cs = getComputedStyle(sample);
        return {
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
          outlineColor: cs.outlineColor,
          boxShadow: cs.boxShadow,
        };
      })();
      r.firstFocusStyle = focusRing;
      return r;
    });

    // 3) prefers-reduced-motion respect: probe via emulated media + count CSS animations still running
    let motion = { reducedAnimations: null };
    try {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(400);
      const count = await page.evaluate(() => {
        let active = 0;
        document.querySelectorAll('*').forEach(el => {
          const cs = getComputedStyle(el);
          if (cs.animationName && cs.animationName !== 'none' && cs.animationDuration && parseFloat(cs.animationDuration) > 0.1) active++;
        });
        return active;
      });
      motion.reducedAnimations = count;
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    } catch (e) {
      motion.error = e.message;
    }

    out.pages[p.id] = {
      url,
      consoleErrors: errs.slice(0, 6),
      axeSummary: sev,
      axeViolations: findings,
      probes,
      motion,
    };
    await page.close();
  }

  await browser.close();
  const outDir = path.join(__dirname);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'a11y-raw-2026-05-23.json'), JSON.stringify(out, null, 2));
  // Concise console summary
  for (const [id, d] of Object.entries(out.pages)) {
    if (d.error) { console.log(id + ' ERROR: ' + d.error); continue; }
    const v = d.axeSummary;
    console.log(`${id.padEnd(10)} | crit=${v.critical||0} ser=${v.serious||0} mod=${v.moderate||0} min=${v.minor||0} | h1=${d.probes.h1Count} skips=${d.probes.headingSkips.length} unlabeled=${d.probes.unlabeledInputs.length} noAlt=${d.probes.imgsNoAlt.length} ariaProb=${d.probes.ariaProblems.length} smallTgt=${d.probes.smallTargets.length} motionAnim=${d.motion.reducedAnimations}`);
  }
  console.log('Raw JSON: audit/a11y-raw-2026-05-23.json');
})();
