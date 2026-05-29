const fs = require('fs');
const path = require('path');

const blogDir = 'blog';
const files = [
  'brown-discount-commercial-property-values.html',
  'csrd-omnibus-i-2026.html',
  'cyber-essentials-v3-3-danzell-2026.html',
  'epc-band-commercial-property-guide.html',
  'epc-register-explained.html',
  'mees-band-c-2028.html',
  'mees-commercial-property-guide.html',
  'mees-compliance-checklist-commercial-property.html',
  'mees-exemptions-guide.html',
  'mees-fine-exposure-calculator-guide.html',
  'mfa-mandatory-2026.html',
  'ppn-002-social-value-explained.html',
  'regulatory-updates-2026.html'
];

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Flatten H1 structure
  // Matches: <h1 ...><span>...<br/>...</span></h1>
  // Matches: <h1 ...><span>...<span>...</span></span></h1>
  html = html.replace(/<h1([\s\S]*?)>([\s\S]*?)<\/h1>/, (match, attrs, content) => {
    // 1. Remove line breaks
    let cleanContent = content.replace(/<br\s*\/?>/gi, ' ');
    // 2. Remove nested spans but keep their content if they have text-[#0CC9A8]
    // First, extract spans
    let spans = [];
    cleanContent = cleanContent.replace(/<span([\s\S]*?)>([\s\S]*?)<\/span>/gi, (sMatch, sAttrs, sText) => {
      spans.push({ attrs: sAttrs, text: sText.trim() });
      return ' __SPAN_PLACEHOLDER__ ';
    });
    
    // If no spans found, just use the text
    if (spans.length === 0) {
      let text = cleanContent.trim().replace(/\.$/, '');
      return `<h1${attrs}><span>${text}</span></h1>`;
    }
    
    // Build new flat structure
    let finalContent = spans.map(s => {
      let sText = s.text.replace(/\.$/, '');
      // If it was a teal span, preserve it
      if (s.attrs.includes('text-[#0CC9A8]')) {
        return `<span class="text-[#0CC9A8]">${sText}</span>`;
      }
      return `<span>${sText}</span>`;
    }).join('\n           ');
    
    return `<h1${attrs}>\n           ${finalContent}\n         </h1>`;
  });
  
  // Ensure Band C 2028 has (proposed)
  html = html.replace(/Band C 2028/gi, (match) => {
     if (html.toLowerCase().includes('proposed')) return match; // already has it maybe
     return 'Band C (proposed) 2028';
  });

  fs.writeFileSync(filePath, html, 'utf8');
});

console.log('Processed remaining blog files.');
