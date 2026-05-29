const fs = require('fs');
let html = fs.readFileSync('pricing.html', 'utf8');

// The regex matches elements like: <div class="text-4xl font-black mb-6 text-white">£149<span class="text-sm font-medium text-white/40">/mo</span></div>
html = html.replace(/<div class="text-4xl font-black mb-6 text-white">£([0-9,]+)<span class="text-sm font-medium text-white\/40">\/mo<\/span><\/div>/g, (match, priceStr) => {
  let monthlyPrice = parseInt(priceStr.replace(/,/g, ''), 10);
  let annualPrice = monthlyPrice * 10;
  return `<div class="text-4xl font-black mb-6 text-white price-display" data-monthly="${monthlyPrice}" data-annual="${annualPrice}">£<span class="price-val">${monthlyPrice}</span><span class="text-sm font-medium text-white/40 bill-cycle">/mo</span></div>`;
});

// Also replace the toggle HTML to ensure correct IDs and attributes if needed, though they exist.
// Just append the script tag
if (!html.includes('pricing-billing-toggle.js')) {
  html = html.replace('</body>', '  <script src="/js/modules/pricing-billing-toggle.js" defer></script>\n</body>');
}

fs.writeFileSync('pricing.html', html, 'utf8');
console.log('pricing.html updated for toggle.');
