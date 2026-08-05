import fs from 'fs';

const data = JSON.parse(fs.readFileSync('C:/Users/bhave/.gemini/antigravity/brain/896f2b09-2ed3-4f5b-982f-aa18ab1213f4/scratch/audit_results.json'));

console.log('=== CONSOLE LOGS & ERRORS ===');
console.log('Logs:', data.consoleLogs);
console.log('Errors:', data.pageErrors);
console.log('Network failures:', data.networkFailures);

console.log('\n=== HEADINGS HIERARCHY ===');
data.headings.forEach(h => console.log(`[${h.tag.toUpperCase()}] ${h.text} (id: ${h.id || 'none'})`));

console.log('\n=== IMAGES AUDIT ===');
const imgs = data.images.filter(i => i.tag === 'img');
console.log('Total img tags:', imgs.length);
const missingAlt = imgs.filter(i => !i.alt || i.alt.trim() === '');
console.log('Img tags missing alt text:', missingAlt.length);
missingAlt.forEach(i => console.log('Missing alt src:', i.src));

console.log('\n=== INTERACTIVE ELEMENTS (UNNAMED / EMPTY TEXT) ===');
const emptyInteractive = data.interactive.filter(i => (!i.text || i.text.length === 0) && (!i.ariaLabel || i.ariaLabel.length === 0));
console.log('Empty interactive count:', emptyInteractive.length);
emptyInteractive.forEach(i => console.log('Empty interactive element:', i.tag, i.id, i.className, i.href));

console.log('\n=== FOCUS OUTLINE & ACCESSIBILITY STYLES ===');
const noOutline = data.interactive.filter(i => i.computed.outlineWidth === '0px' || i.computed.outlineStyle === 'none');
console.log('Interactive elements with default outline: none or 0px:', noOutline.length);

console.log('\n=== UK vs US SPELLING & COPY CHECK ===');
const text = data.fullText;
const ukWords = ['optimise', 'optimisation', 'customise', 'customisation', 'prioritise', 'organisation', 'colour', 'centre'];
const usWords = ['optimize', 'optimization', 'customize', 'customization', 'prioritize', 'organization', 'color', 'center'];

console.log('UK Spelling occurrences:');
ukWords.forEach(w => {
  const matches = (text.match(new RegExp(w, 'gi')) || []).length;
  if (matches > 0) console.log(`  ${w}: ${matches}`);
});

console.log('US Spelling occurrences:');
usWords.forEach(w => {
  const matches = (text.match(new RegExp(w, 'gi')) || []).length;
  if (matches > 0) console.log(`  ${w}: ${matches}`);
});

console.log('\n=== SECTIONS LIST ===');
data.sections.forEach((s, idx) => {
  console.log(`Section ${idx+1}: <${s.tag}> id="${s.id || ''}" data-section="${s.dataSection || ''}" class="${s.className || ''}"`);
  console.log(`  Headings:`, s.headings);
});
