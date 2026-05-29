const fs = require('fs');
let html = fs.readFileSync('pricing.html', 'utf8');

// Remove from FAQ
html = html.replace(
  '<h2 class="ca-section-eyebrow mb-8 text-[#0CC9A8] uppercase tracking-widest text-sm font-bold">CrowESG Pricing</h2>\n           <div class="grid grid-cols-1 md:grid-cols-3 gap-8">\n              <div class="p-8 border border-black/5 rounded-2xl bg-black/5">',
  '<div class="grid grid-cols-1 md:grid-cols-3 gap-8">\n              <div class="p-8 border border-black/5 rounded-2xl bg-black/5">'
);

// Add to ESG properly
const searchStr = '<div class="grid grid-cols-1 gap-8">';
const idStr = 'id="esg"';
const parts = html.split(idStr);
if (parts.length > 1) {
  const sectionHtml = parts[1];
  const newSectionHtml = sectionHtml.replace(
    searchStr,
    '<h2 class="ca-section-eyebrow mb-8 text-[#0CC9A8] uppercase tracking-widest text-sm font-bold">CrowESG Pricing</h2>\n             ' + searchStr
  );
  html = parts[0] + idStr + newSectionHtml;
}

fs.writeFileSync('pricing.html', html, 'utf8');
console.log('Fixed CrowESG heading.');
