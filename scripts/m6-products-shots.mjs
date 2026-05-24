// M6 NASA-grade product-page audit shots.
// Capture: 6 pages x 2 viewports x 3 positions (fold/full/footer) = 36 PNGs.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';

const PAGES = [
  'crowagent-core.html',
  'crowcyber.html',
  'crowcash.html',
  'crowmark.html',
  'crowesg.html',
  'csrd.html',
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];
const OUT = 'C:/tmp/m6-products';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const measurements = {};

for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('ca_consent', 'accepted'); } catch (e) {}
      try { localStorage.setItem('cookieconsent_status', 'dismiss'); } catch (e) {}
    });
    const p = await ctx.newPage();
    const url = `http://localhost:8092/${page}`;
    try {
      await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await p.evaluate(() => {
      const sels = ['#cookie-preferences', '#cookie-banner', '.cookie-banner', '[data-cookie-banner]', '#ca-cookie-banner'];
      sels.forEach(s => document.querySelectorAll(s).forEach(el => { el.style.display = 'none'; }));
    });
    await p.waitForTimeout(500);

    // Position 1: fold (above-the-fold)
    await p.screenshot({ path: `${OUT}/${page.replace('.html','')}-${vp.name}-fold.png`, fullPage: false });

    // Wait for any lazy footer-inject / chatbot-inject to land.
    await p.waitForTimeout(2000);

    // Force-trigger reveal-on-scroll observers + eagerly load lazy images.
    // (Playwright's synthetic fullPage scroll doesn't fire IntersectionObserver
    // or trigger lazy-image network fetches reliably.)
    await p.evaluate(async () => {
      document.querySelectorAll('.reveal, .ms-reveal').forEach(el => {
        el.classList.add('visible', 'ms-visible', 'is-revealed', 'in-view');
      });
      document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
      // Walk the page to nudge any remaining observers.
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h + 1000; y += 400) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(800);

    // Position 2: full page
    await p.screenshot({ path: `${OUT}/${page.replace('.html','')}-${vp.name}-full.png`, fullPage: true });

    // Position 3: footer — scroll the .ca-footer into view explicitly,
    // since the footer is injected by footer-inject.js below the document
    // and the scrollHeight reported before injection is shorter.
    await p.evaluate(() => {
      const f = document.querySelector('.ca-footer');
      if (f) f.scrollIntoView({ block: 'end', behavior: 'instant' });
      else window.scrollTo(0, document.documentElement.scrollHeight + 2000);
    });
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/${page.replace('.html','')}-${vp.name}-footer.png`, fullPage: false });

    // Measure key elements
    const m = await p.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight;
      const sections = Array.from(document.querySelectorAll('main > *')).map(el => ({
        tag: el.tagName,
        cls: el.className || '',
        h: Math.round(el.getBoundingClientRect().height),
      }));
      const h1Count = document.querySelectorAll('h1').length;
      const h1Texts = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim().slice(0, 80));
      const heroes = Array.from(document.querySelectorAll('.hero, .hero-product')).map(el => ({
        cls: el.className,
        h: Math.round(el.getBoundingClientRect().height),
      }));
      const cardCount = document.querySelectorAll('.sv-card').length;
      const eyebrowCount = document.querySelectorAll('.sv-eyebrow, .sv-card__eyebrow').length;
      const btnCount = document.querySelectorAll('.sv-btn, .sv-btn--primary, .sv-btn--secondary, .sv-btn--ghost').length;
      const inlineStyles = Array.from(document.querySelectorAll('[style]')).length;
      const chapterNavVisible = (() => {
        const n = document.querySelector('.ca-chapter-nav');
        if (!n) return 'absent';
        const cs = getComputedStyle(n);
        return cs.display + ' / vis=' + cs.visibility;
      })();
      const hasHorizScroll = document.documentElement.scrollWidth > window.innerWidth;
      return { docHeight, sections, h1Count, h1Texts, heroes, cardCount, eyebrowCount, btnCount, inlineStyles, chapterNavVisible, hasHorizScroll, vw: window.innerWidth };
    });
    measurements[`${page}-${vp.name}`] = m;
    console.log(`${page} ${vp.name}: docH=${m.docHeight} h1=${m.h1Count} cards=${m.cardCount} btns=${m.btnCount} inline=${m.inlineStyles} chapterNav=${m.chapterNavVisible} horizScroll=${m.hasHorizScroll}`);

    await ctx.close();
  }
}
await browser.close();
await writeFile(`${OUT}/_measurements.json`, JSON.stringify(measurements, null, 2));
console.log('DONE');
