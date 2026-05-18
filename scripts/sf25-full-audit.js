// SF25 — Honest programmatic audit across all reported defects.
// Verifies each claimed-fixed item by computed CSS / DOM state, NOT agent reports.
// Output: pass/fail rows for every audit item.
const { chromium } = require('playwright');

const PAGES = [
  { name: 'homepage',  url: '/' },
  { name: 'about',     url: '/about.html' },
  { name: 'contact',   url: '/contact.html' },
  { name: 'security',  url: '/security.html' },
  { name: 'resources', url: '/resources.html' },
  { name: 'pricing',   url: '/pricing.html' },
  { name: 'faq',       url: '/faq.html' },
  { name: 'blog-list', url: '/blog/' },
  { name: '404',       url: '/404.html' },
  { name: 'crowcyber', url: '/crowcyber.html' },
  { name: 'tools-mees',url: '/tools/mees-risk-snapshot/' },
];

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '375',  width: 375,  height: 812 },
];

(async () => {
  const b = await chromium.launch({ headless: true });
  const out = {};
  for (const vp of VIEWPORTS) {
    out[vp.name] = {};
    for (const page of PAGES) {
      const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height } });
      const p = await ctx.newPage();
      try {
        await p.goto('http://localhost:8092' + page.url, { waitUntil: 'networkidle', timeout: 20000 });
        await p.waitForTimeout(1200);
        const result = await p.evaluate((vpName) => {
          const r = {};
          // Footer
          const footer = document.querySelector('.ca-footer');
          if (footer) {
            const trustRow = footer.querySelector('.footer-trust-row');
            if (trustRow) {
              const cs = getComputedStyle(trustRow);
              r.footer_trust_direction = cs.flexDirection;
              r.footer_trust_display = cs.display;
              // Are all chips on the same y-axis line?
              const chips = Array.from(trustRow.children);
              const ys = chips.map(c => Math.round(c.getBoundingClientRect().y));
              r.footer_trust_chips = chips.length;
              r.footer_trust_unique_y = new Set(ys).size;
            } else {
              r.footer_trust_direction = 'no .footer-trust-row';
            }
            const socials = footer.querySelectorAll('.foot-social a');
            if (socials.length) {
              const first = socials[0];
              const cs = getComputedStyle(first);
              r.footer_social_w = cs.width;
              r.footer_social_h = cs.height;
              r.footer_social_count = socials.length;
            }
          } else {
            r.footer = 'missing';
          }
          // Nav at desktop
          if (vpName === '1440') {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
              const visibleAnchors = Array.from(navLinks.querySelectorAll('a, .nav-dropdown-trigger'))
                .filter(el => el.offsetParent !== null && el.getBoundingClientRect().right <= 1440);
              r.nav_visible_count = visibleAnchors.length;
              r.nav_total_anchors = navLinks.querySelectorAll('a, .nav-dropdown-trigger').length;
            }
          }
          // Mobile nav at 375
          if (vpName === '375') {
            const ham = document.querySelector('.ham');
            const navLinks = document.querySelector('.nav-links');
            r.mobile_ham_display = ham ? getComputedStyle(ham).display : 'no ham';
            r.mobile_navlinks_display = navLinks ? getComputedStyle(navLinks).display : 'no navlinks';
          }
          // Announce bar ARIA
          const ab = document.getElementById('announce-bar');
          if (ab) {
            r.announce_role = ab.getAttribute('role');
            r.announce_aria_label = ab.getAttribute('aria-label');
            const closer = ab.querySelector('button[data-action="dismiss-bar"], .ab-close');
            r.announce_close_label = closer ? closer.getAttribute('aria-label') : 'no closer';
          }
          // Postcode input label (homepage only)
          const postcode = document.getElementById('demo-postcode');
          if (postcode) {
            const lbl = document.querySelector('label[for="demo-postcode"]');
            r.postcode_has_label = !!lbl;
            r.postcode_label_text = lbl ? lbl.textContent.trim().slice(0, 60) : null;
          }
          // Back to top button presence
          const bt2t = document.getElementById('sf21-back-to-top');
          r.back_to_top_exists = !!bt2t;
          // Skeleton CSS class presence
          r.skeleton_class_used = document.querySelectorAll('.sf18-skeleton').length;
          // Status / uptime button text visibility (security page)
          if (location.pathname.includes('security')) {
            const btn = document.querySelector('.sec-uptime-cta');
            if (btn) {
              const cs = getComputedStyle(btn);
              r.status_btn_color = cs.color;
              r.status_btn_bg = cs.backgroundColor;
            }
          }
          // Headline H1 text
          const h1 = document.querySelector('h1');
          if (h1) r.h1_text = h1.textContent.trim().slice(0, 80);
          // Body color check (text-primary contrast)
          r.body_color = getComputedStyle(document.body).color;
          return r;
        }, vp.name);
        out[vp.name][page.name] = result;
      } catch (e) {
        out[vp.name][page.name] = { error: e.message.slice(0, 100) };
      }
      await ctx.close();
    }
  }
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
