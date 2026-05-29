const fs = require('fs');

let file = 'pricing.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Unify all panel backgrounds to bg-[#040E1A]
content = content.replace(/<section id="mark" class="py-40 bg-\[\#040E1A\]">/g, '<section id="mark" class="py-40 ca-section-dark bg-[#040E1A] text-white">');
content = content.replace(/<section id="cyber" class="py-40 bg-white text-\[\#040E1A\]">/g, '<section id="cyber" class="py-40 ca-section-dark bg-[#040E1A] text-white">');
content = content.replace(/<section id="cash" class="py-40 bg-\[\#040E1A\]">/g, '<section id="cash" class="py-40 ca-section-dark bg-[#040E1A] text-white">');
content = content.replace(/<section id="esg" class="py-40 bg-white text-\[\#040E1A\]">/g, '<section id="esg" class="py-40 ca-section-dark bg-[#040E1A] text-white">');

// Also update eyebrows to match the dark theme on Cyber and ESG
content = content.replace(/<span class="ca-eyebrow !bg-black\/5 !border-black\/10 !text-\[\#040E1A\]\/40">Cyber Essentials<\/span>/g, '<span class="ca-eyebrow">Cyber Essentials</span>');
content = content.replace(/<span class="ca-eyebrow !bg-black\/5 !border-black\/10 !text-\[\#040E1A\]\/40">ESG Reporting<\/span>/g, '<span class="ca-eyebrow">ESG Reporting</span>');

// Remove text-[#040E1A] from buttons on cyber and esg
content = content.replace(/<a href="\/crowcyber" class="text-xs font-black uppercase tracking-widest text-\[\#0CC9A8\] mb-4">/g, '<a href="/crowcyber" class="text-xs font-black uppercase tracking-widest text-[#0CC9A8] mb-4">');
content = content.replace(/<p class="text-xl text-black\/40 mt-4">/g, '<p class="text-xl text-white/40 mt-4">');
content = content.replace(/<h2 class="text-6xl font-black tracking-tighter">/g, '<h2 class="text-6xl font-black tracking-tighter text-white">');

// Apply ca-card-premium to Mark
content = content.replace(/<div class="ca-card !p-12">/g, '<div class="ca-card ca-card-premium border-l-[3px] border-[#A78BFA] !p-12">');
content = content.replace(/<div class="ca-card !bg-white\/5 !border-\[\#A78BFA\] !p-12 shadow-2xl scale-105 relative z-10">/g, '<div class="ca-card ca-card-premium border-l-[3px] border-[#A78BFA] bg-white/5 !p-12 shadow-2xl scale-105 relative z-10">');
content = content.replace(/<h3 class="font-black text-2xl mb-2 text-white">Starter<\/h4>/g, '<h3 class="font-black text-2xl mb-2 text-white">Starter</h3>');
content = content.replace(/<h3 class="font-black text-2xl mb-2 text-white">Pro<\/h4>/g, '<h3 class="font-black text-2xl mb-2 text-white">Pro</h3>');
content = content.replace(/<h3 class="font-black text-2xl mb-2 text-white">Portfolio<\/h4>/g, '<h3 class="font-black text-2xl mb-2 text-white">Portfolio</h3>');

// Wait, the heading replacements already ran, so they are <h3>. I will ensure they are consistent.

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated ${file}`);
