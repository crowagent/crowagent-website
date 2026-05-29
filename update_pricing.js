const fs = require('fs');
let html = fs.readFileSync('pricing.html', 'utf8');

const mapping = {
  'id="core"': 'CrowAgent Core Pricing',
  'id="mark"': 'CrowMark Pricing',
  'id="cyber"': 'CrowCyber Pricing',
  'id="cash"': 'CrowCash Pricing',
  'id="esg"': 'CrowESG Pricing'
};

for (const [idStr, title] of Object.entries(mapping)) {
  const searchStr = '<div class="grid grid-cols-1 md:grid-cols-3 gap-8">';
  // Since we only want to match the first occurrence inside each section, we can split by the section ID
  const parts = html.split(idStr);
  if (parts.length > 1) {
    const sectionHtml = parts[1];
    const newSectionHtml = sectionHtml.replace(
      searchStr,
      '<h2 class="ca-section-eyebrow mb-8 text-[#0CC9A8] uppercase tracking-widest text-sm font-bold">' + title + '</h2>\n           ' + searchStr
    );
    html = parts[0] + idStr + newSectionHtml;
  }
}

fs.writeFileSync('pricing.html', html, 'utf8');
console.log('Added pricing headings.');
