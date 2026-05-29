const fs = require('fs');
let html = fs.readFileSync('security.html', 'utf8');

html = html.replace(
  '<!-- CONTENT GRID -->\n  <section class="ca-section py-24 border-t border-white/5">',
  '<!-- CONTENT GRID -->\n  <section class="ca-section py-24 border-t border-white/5 bg-white text-[#040E1A]">'
);

html = html.replace(
  '<aside class="lg:col-span-4 lg:sticky lg:top-32 h-fit">\n          <div class="ca-card !bg-white/5 !border-white/5 p-8">\n            <h2 class="text-white font-bold mb-6 text-sm uppercase tracking-widest">Documentation</h3>',
  '<aside class="lg:col-span-4 lg:sticky lg:top-32 h-fit">\n          <div class="ca-card !bg-black/5 !border-black/10 p-8 shadow-sm">\n            <h2 class="text-[#040E1A] font-bold mb-6 text-sm uppercase tracking-widest">Documentation</h3>'
);

html = html.replace(/<a href="#(.*?)" class="ca-toc-link">/g, '<a href="#$1" class="ca-toc-link !text-[#040E1A]/60 hover:!text-[#0CC9A8] [&.active]:!text-[#0CC9A8]">');

html = html.replace(
  '<div class="mt-8 p-6 rounded-2xl bg-[#0CC9A8]/5 border border-[#0CC9A8]/20">\n            <p class="text-sm text-white/80 leading-relaxed">',
  '<div class="mt-8 p-6 rounded-2xl bg-[#0CC9A8]/10 border border-[#0CC9A8]/30">\n            <p class="text-sm text-[#040E1A]/80 leading-relaxed">'
);

html = html.replace(
  '<div class="lg:col-span-8 prose prose-slate prose-invert max-w-none">',
  '<div class="lg:col-span-8 prose prose-slate max-w-none prose-headings:text-[#040E1A] prose-p:text-[#040E1A]/80 prose-li:text-[#040E1A]/80 prose-strong:text-[#040E1A] prose-a:text-[#0CC9A8]">'
);

const parts = html.split('<!-- MAIN CONTENT AREA -->');
if (parts.length === 2) {
  let mainArea = parts[1];
  
  mainArea = mainArea.replace(/text-white\/40/g, 'text-[#040E1A]/60');
  mainArea = mainArea.replace(/text-white\/60/g, 'text-[#040E1A]/80');
  mainArea = mainArea.replace(/text-white\/70/g, 'text-[#040E1A]/80');
  mainArea = mainArea.replace(/text-white\/80/g, 'text-[#040E1A]/90');
  mainArea = mainArea.replace(/text-white/g, 'text-[#040E1A]');
  mainArea = mainArea.replace(/bg-white\/5/g, 'bg-black/5');
  mainArea = mainArea.replace(/border-white\/5/g, 'border-black/10');
  mainArea = mainArea.replace(/border-white\/10/g, 'border-black/10');
  mainArea = mainArea.replace(/border-white\/20/g, 'border-black/20');
  mainArea = mainArea.replace(/border-white/g, 'border-[#040E1A]');
  
  html = parts[0] + '<!-- MAIN CONTENT AREA -->' + mainArea;
}

fs.writeFileSync('security.html', html, 'utf8');
console.log('Update complete.');
