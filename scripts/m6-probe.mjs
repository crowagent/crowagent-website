// M6 contrast + element probe.
import { chromium } from 'playwright';

const PAGES = ['crowagent-core.html', 'crowcyber.html', 'crowcash.html', 'crowmark.html', 'crowesg.html', 'csrd.html'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem('ca_consent', 'accepted'); } catch (e) {} });
const p = await ctx.newPage();

for (const page of PAGES) {
  await p.goto(`http://localhost:8092/${page}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => p.goto(`http://localhost:8092/${page}`, { waitUntil: 'domcontentloaded' }));
  await p.waitForTimeout(400);
  const data = await p.evaluate(() => {
    const accent = document.querySelector('.hero-h1-accent');
    const heroH1 = document.querySelector('.hero h1, .hero-product h1');
    const hero = document.querySelector('.hero, .hero-product');
    const heroBg = hero ? getComputedStyle(hero) : null;
    const accentCs = accent ? getComputedStyle(accent) : null;
    const h1Cs = heroH1 ? getComputedStyle(heroH1) : null;
    const heroBgImage = heroBg ? heroBg.backgroundImage.slice(0, 100) : null;
    // Sample background colors at a few hero pixel positions (synthetic test)
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    // Inline style count
    const inlineCount = document.querySelectorAll('[style]').length;
    // Sample 10 inline-styled elements
    const inlineSamples = Array.from(document.querySelectorAll('[style]')).slice(0, 10).map(el => ({
      tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), style: el.getAttribute('style').slice(0, 80)
    }));
    // Cinematic walkthrough panels visible?
    const cinematicPanels = Array.from(document.querySelectorAll('.sv-media-frame--cinematic, .pw-sf21')).map(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { cls: el.className.slice(0, 60), top: Math.round(r.top + window.scrollY), h: Math.round(r.height), bg: cs.backgroundColor, visible: r.height > 0 };
    });
    // Cross-sell cards
    const xsell = Array.from(document.querySelectorAll('.f10-related-card, [class*="related"]')).slice(0, 6).map(el => ({
      cls: el.className.slice(0, 60), h: Math.round(el.getBoundingClientRect().height)
    }));
    // Cookie banner present at scroll=0?
    const cookie = document.querySelector('#cookie-banner, .cookie-banner, #ca-cookie-banner');
    return {
      accent: accentCs ? { color: accentCs.color, fillColor: accentCs.webkitTextFillColor, bg: accentCs.backgroundImage.slice(0, 120) } : null,
      h1: h1Cs ? { color: h1Cs.color, fontSize: h1Cs.fontSize, fontWeight: h1Cs.fontWeight } : null,
      heroBgImage,
      heroH: heroRect ? Math.round(heroRect.height) : null,
      inlineCount, inlineSamples,
      cinematicPanels,
      xsell,
      cookiePresent: !!cookie
    };
  });
  console.log(`\n=== ${page} ===`);
  console.log(JSON.stringify(data, null, 2));
}
await browser.close();
