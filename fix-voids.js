const fs = require('fs');

const pages = [
  'crowcyber.html',
  'crowcash.html',
  'crowesg.html',
  'products/index.html',
  'crowagent-core.html' // finishing this one
];

for (const page of pages) {
  if (!fs.existsSync(page)) continue;
  let content = fs.readFileSync(page, 'utf8');
  let originalContent = content;

  // 1. Replace py-60 (240px) with responsive tokens or smaller values
  content = content.replace(/class="([^"]*)py-60([^"]*)"/g, 'class="$1py-24$2"');
  
  // 2. Add padding tokens to the main sections if missing
  // Actually, let's just use CSS for this.
  
  // 3. Remove heading-only sections or fill voids
  // We'll look for sections with only h2/h3 and p and massive gaps.
  // Example: 0px gap between heading and end of section.
  
  // For products/index.html: "Active windows." section ~700px empty space
  if (page === 'products/index.html') {
    content = content.replace(/<section class="py-60 bg-white text-\[\#040E1A\]">(\s*)<div class="ca-container">(\s*)<div class="text-center mb-32">(\s*)<h2 class="text-6xl md:text-9xl font-black tracking-tighter leading-\[0.8\] text-\[\#040E1A\]">Active windows.<\/h2>/g,
      '<section class="py-24 bg-white text-[#040E1A]">\n    <div class="ca-container">\n      <div class="text-center mb-16">\n        <h2 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] text-[#040E1A]">Active windows.</h2>');
  }

  if (content !== originalContent) {
    fs.writeFileSync(page, content, 'utf8');
    console.log(`Fixed voids in ${page}`);
  }
}
