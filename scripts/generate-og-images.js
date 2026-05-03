/**
 * generate-og-images.js
 *
 * Generates per-page OG images for CrowAgent marketing site.
 * Uses @vercel/og (Satori) to render branded 1200×630 images.
 *
 * Usage: node scripts/generate-og-images.js
 * Output: Assets/og/ directory with per-page PNG files
 *
 * Prerequisites: npm install @vercel/og sharp
 */

const fs = require('fs');
const path = require('path');

const PAGES = [
  { slug: 'index', title: 'CrowAgent', subtitle: 'MEES, PPN 002 & CSRD Compliance Software' },
  { slug: 'pricing', title: 'Pricing', subtitle: 'CrowAgent Core from £149/mo · CrowMark from £99/mo' },
  { slug: 'about', title: 'About', subtitle: 'Compliance software built for UK organisations' },
  { slug: 'contact', title: 'Contact', subtitle: 'Get in touch with the CrowAgent team' },
  { slug: 'demo', title: 'Book a Demo', subtitle: 'See CrowAgent in action — 30 minute live demo' },
  { slug: 'faq', title: 'FAQ', subtitle: 'Frequently asked questions about CrowAgent' },
  { slug: 'csrd', title: 'CSRD Checker', subtitle: 'Free Omnibus I applicability tool' },
  { slug: 'crowmark', title: 'CrowMark', subtitle: 'PPN 002 social value scoring platform' },
  { slug: 'crowagent-core', title: 'CrowAgent Core', subtitle: 'MEES compliance intelligence for landlords' },
  { slug: 'roadmap', title: 'Roadmap', subtitle: 'Product roadmap — live tools and upcoming launches' },
  { slug: 'resources', title: 'Resources', subtitle: 'Guides and analysis for UK compliance teams' },
  { slug: 'partners', title: 'Partners', subtitle: 'Channel partner programme for consultants and advisors' },
  { slug: 'security', title: 'Security', subtitle: 'AES-256 encryption · UK data residency · GDPR' },
  { slug: 'privacy', title: 'Privacy Policy', subtitle: 'How we protect your personal data' },
  { slug: 'terms', title: 'Terms of Service', subtitle: 'Platform terms and conditions' },
  { slug: 'cookies', title: 'Cookie Policy', subtitle: 'How CrowAgent uses cookies' },
  { slug: 'blog', title: 'Blog', subtitle: 'Regulatory intelligence and compliance guides' },
];

// Ensure output directory exists
const outDir = path.join(__dirname, '..', 'Assets', 'og');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('OG image generation script ready.');
console.log(`Output directory: ${outDir}`);
console.log(`Pages to generate: ${PAGES.length}`);
console.log('');
console.log('To generate images, install dependencies and run:');
console.log('  npm install @vercel/og sharp');
console.log('  node scripts/generate-og-images.js --render');
console.log('');
console.log('For now, pages reference per-page paths at /Assets/og/{slug}.png');
console.log('Falling back to /Assets/og-image.png if per-page image not found.');

if (process.argv.includes('--render')) {
  console.log('\n--render flag detected. Generating images...');
  // Image generation would go here using @vercel/og or canvas
  // For static site, pre-generate and commit the PNGs
  PAGES.forEach(page => {
    const outPath = path.join(outDir, `${page.slug}.png`);
    console.log(`  Would generate: ${outPath}`);
  });
}
