// Read-only audit. Captures computed styles across all pages.
const { chromium } = require('playwright');

const BASE = 'http://localhost:8092';

const PAGES = [
  '/', '/about.html', '/contact.html', '/security.html', '/partners.html',
  '/pricing.html', '/faq.html', '/privacy.html', '/terms.html', '/cookies.html',
  '/resources.html', '/roadmap.html', '/changelog.html', '/404.html', '/demo.html',
  '/crowagent-core.html', '/crowmark.html', '/crowcyber.html', '/crowcash.html',
  '/crowesg.html', '/csrd.html', '/products/', '/tools/', '/glossary/', '/blog/'
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const results = [];

  for (const p of PAGES) {
    const url = BASE + p;
    let row = { page: p, error: null };
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      row.status = resp ? resp.status() : 'no-resp';
      await page.waitForTimeout(400);

      row = Object.assign(row, await page.evaluate(() => {
        const cs = (el, ...props) => {
          if (!el) return null;
          const s = getComputedStyle(el);
          const out = {};
          props.forEach(p => out[p] = s[p]);
          return out;
        };
        const num = (v) => v ? parseFloat(v) : null;

        const body = document.body;
        const html = document.documentElement;
        const bodyStyles = cs(body, 'backgroundColor', 'backgroundImage', 'color', 'fontFamily', 'fontSize');
        const htmlStyles = cs(html, 'backgroundColor');

        // Hero detection
        const hero = document.querySelector('.hero, .page-hero, [class*="hero"], section:first-of-type, main > section:first-of-type, main > div:first-of-type');
        // Eyebrow chip
        const eyebrow = document.querySelector('.eyebrow, .hero-eyebrow, .page-hero__eyebrow, .chip, .badge, .pill, [class*="eyebrow"], [class*="chip"]');
        const eyebrowStyles = cs(eyebrow, 'fontSize', 'color', 'backgroundColor', 'padding', 'borderRadius', 'textTransform', 'letterSpacing', 'border');
        const eyebrowClass = eyebrow ? eyebrow.className : null;
        const eyebrowText = eyebrow ? (eyebrow.textContent || '').trim().slice(0, 40) : null;

        // H1
        const h1 = document.querySelector('h1');
        const h1Styles = cs(h1, 'fontSize', 'fontFamily', 'fontWeight', 'color', 'lineHeight', 'maxWidth', 'letterSpacing');
        const h1Text = h1 ? (h1.textContent || '').trim().slice(0, 60) : null;

        // Subtitle - sibling of h1, usually p
        let sub = null;
        if (h1) {
          let n = h1.nextElementSibling;
          while (n && !['P', 'DIV'].includes(n.tagName)) n = n.nextElementSibling;
          sub = n;
        }
        if (!sub) sub = document.querySelector('.hero p, .page-hero p, .hero-sub, .lead, [class*="subtitle"]');
        const subStyles = cs(sub, 'fontSize', 'color', 'maxWidth', 'lineHeight');

        // CTA row near hero
        let ctaBtns = [];
        if (h1) {
          const wrap = h1.closest('section, header, div');
          if (wrap) {
            ctaBtns = Array.from(wrap.querySelectorAll('a.btn, a.button, button, .btn, .button')).slice(0, 4);
          }
        }
        const ctaInfo = ctaBtns.map(b => ({
          tag: b.tagName,
          cls: b.className || '',
          text: (b.textContent || '').trim().slice(0, 24),
          ...cs(b, 'backgroundColor', 'color', 'padding', 'borderRadius', 'fontSize', 'height', 'border', 'fontWeight')
        }));

        // Primary CTA (first) and secondary (second)
        const btnPri = ctaBtns[0];
        const btnSec = ctaBtns[1];
        const btnPriStyles = cs(btnPri, 'backgroundColor', 'color', 'padding', 'borderRadius', 'fontSize', 'height', 'border', 'fontWeight');
        const btnSecStyles = cs(btnSec, 'backgroundColor', 'color', 'padding', 'borderRadius', 'fontSize', 'height', 'border', 'fontWeight');

        // Card sample
        const card = document.querySelector('.card, [class*="card"], .feature, .tile, article');
        const cardStyles = cs(card, 'backgroundColor', 'border', 'borderRadius', 'padding', 'boxShadow', 'backgroundImage');
        const cardClass = card ? card.className : null;

        // Icon: inline SVG
        const svg = document.querySelector('svg');
        let iconStrokeWidth = null, iconStrokeColor = null, iconWidth = null;
        if (svg) {
          iconStrokeWidth = svg.getAttribute('stroke-width');
          if (!iconStrokeWidth) {
            const inner = svg.querySelector('[stroke-width]');
            if (inner) iconStrokeWidth = inner.getAttribute('stroke-width');
          }
          iconStrokeColor = svg.getAttribute('stroke') || getComputedStyle(svg).stroke;
          iconWidth = svg.getAttribute('width') || getComputedStyle(svg).width;
        }

        // H2
        const h2 = document.querySelector('h2');
        const h2Styles = cs(h2, 'fontSize', 'color', 'fontFamily', 'fontWeight', 'lineHeight');

        // Body paragraph
        const para = document.querySelector('main p, section p, p');
        const paraStyles = cs(para, 'fontSize', 'color', 'lineHeight');

        // Banner
        const banner = document.querySelector('.page-abstract-banner');
        const bannerClass = banner ? banner.className : null;
        const hairline = !!document.querySelector('.ca-footer-hairline');

        // count common containers for layout rhythm
        const sectionCount = document.querySelectorAll('section').length;
        const containerMaxW = (() => {
          const c = document.querySelector('.container, .wrap, main > section, main');
          return c ? getComputedStyle(c).maxWidth : null;
        })();

        return {
          status: 'ok',
          body: bodyStyles,
          html: htmlStyles,
          hero: hero ? { tag: hero.tagName, cls: hero.className } : null,
          eyebrow: { found: !!eyebrow, class: eyebrowClass, text: eyebrowText, ...(eyebrowStyles || {}) },
          h1: { text: h1Text, ...(h1Styles || {}) },
          sub: { found: !!sub, tag: sub ? sub.tagName : null, ...(subStyles || {}) },
          ctaCount: ctaBtns.length,
          ctas: ctaInfo,
          btnPri: btnPriStyles,
          btnSec: btnSecStyles,
          card: { class: cardClass, ...(cardStyles || {}) },
          icon: { strokeWidth: iconStrokeWidth, strokeColor: iconStrokeColor, width: iconWidth, hasSvg: !!svg },
          h2: h2Styles,
          para: paraStyles,
          banner: { hasBanner: !!banner, class: bannerClass, hairline },
          layout: { sectionCount, containerMaxW }
        };
      }));
    } catch (e) {
      row.error = String(e).slice(0, 200);
    }
    results.push(row);
    process.stdout.write(`. ${p} ${row.status || row.error}\n`);
  }

  const fs = require('fs');
  fs.writeFileSync('audit-results/consistency-2026-05-18.json', JSON.stringify(results, null, 2));
  console.log('Wrote', results.length, 'rows to audit-results/consistency-2026-05-18.json');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
