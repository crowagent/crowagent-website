const fs = require('fs');
let html = fs.readFileSync('resources.html', 'utf8');

// 1. FREE TOOLS HUB
html = html.replace(
  /<section class="section-padding section-tone-1">[\s\S]*?<div class="wrap container-standard">[\s\S]*?<div class="section-label">FREE TOOLS<\/div>[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<p class="page-intro">(.*?)<\/p>[\s\S]*?<ul class="article-body">([\s\S]*?)<\/ul>[\s\S]*?<\/div>[\s\S]*?<\/section>/,
  (match, h2, p, ul) => {
    let items = ul.match(/<li>(.*?)<\/li>/g).map(li => {
      let content = li.replace(/<li>(.*?)<\/li>/, '$1');
      // Extract link and text
      let linkMatch = content.match(/<a href="(.*?)">(.*?)<\/a>(.*)/);
      if (linkMatch) {
        return `<div class="ca-glass p-8 flex flex-col gap-4">
          <h3 class="text-xl font-bold text-white"><a href="${linkMatch[1]}" class="hover:text-[#0CC9A8] transition-colors">${linkMatch[2]}</a></h3>
          <p class="text-sm text-white/60 leading-relaxed">${linkMatch[3].replace(/^,\s*/, '')}</p>
        </div>`;
      }
      return `<div class="ca-glass p-8"><p class="text-sm text-white/60">${content}</p></div>`;
    });
    
    return `<!-- FREE TOOLS HUB -->
<section class="ca-section py-32 ca-section-dark bg-[#040E1A] border-t border-white/5">
  <div class="ca-container">
    <div class="mb-16 max-w-3xl">
      <div class="ca-eyebrow mb-6">FREE TOOLS</div>
      <h2 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">${h2}</h2>
      <p class="text-lg text-white/60 leading-relaxed">${p}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
  }
);

// 2. GUIDES
html = html.replace(
  /<section class="section section-tone-0">[\s\S]*?<div class="wrap container-standard">[\s\S]*?<div class="section-label">GUIDES<\/div>[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<p class="page-intro">(.*?)<\/p>[\s\S]*?<div class="resources-grid">([\s\S]*?)<\/div>[\s\S]*?<p class="page-intro"><a href="\/blog">View all articles &rarr;<\/a><\/p>[\s\S]*?<\/div>[\s\S]*?<\/section>/,
  (match, h2, p, grid) => {
    // Transform .sv-card to .ca-glass
    let newGrid = grid.replace(/<div class="sv-card">/g, '<div class="ca-glass p-8 group hover:-translate-y-1 transition-transform duration-300">');
    newGrid = newGrid.replace(/<span class="rc-badge(?: rc-badge-tool)?">(.*?)<\/span>/g, '<span class="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#0CC9A8] mb-6">$1</span>');
    newGrid = newGrid.replace(/<h2 class="rc-title">(.*?)<\/h2>/g, '<h3 class="text-xl font-bold text-white mb-4 group-hover:text-[#0CC9A8] transition-colors">$1</h3>');
    newGrid = newGrid.replace(/<p class="rc-preview">(.*?)<\/p>/g, '<p class="text-sm text-white/60 leading-relaxed mb-8 line-clamp-3">$1</p>');
    newGrid = newGrid.replace(/<span class="rc-meta">(.*?)<\/span>/g, '<span class="block mt-auto text-xs font-bold text-white/40 uppercase tracking-wider">$1</span>');
    newGrid = newGrid.replace(/<a href="(.*?)"/g, '<a href="$1" class="flex flex-col h-full"');
    
    return `<!-- GUIDES -->
<section class="ca-section py-32 ca-section-dark bg-[#000212] border-t border-white/5">
  <div class="ca-container">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
      <div class="max-w-2xl">
        <div class="ca-eyebrow mb-6">GUIDES</div>
        <h2 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">${h2}</h2>
        <p class="text-lg text-white/60 leading-relaxed">${p}</p>
      </div>
      <a href="/blog" class="ca-btn ca-btn-ghost mb-2">View all articles &rarr;</a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${newGrid}
    </div>
  </div>
</section>`;
  }
);

// 3. METHODOLOGY
html = html.replace(
  /<section class="section-padding section-tone-1">[\s\S]*?<div class="wrap container-standard">[\s\S]*?<div class="section-label">METHODOLOGY<\/div>[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<p class="page-intro">(.*?)<\/p>[\s\S]*?<ul class="article-body">([\s\S]*?)<\/ul>[\s\S]*?<\/div>[\s\S]*?<\/section>/,
  (match, h2, p, ul) => {
    let items = ul.match(/<li>(.*?)<\/li>/g).map(li => {
      let content = li.replace(/<li>(.*?)<\/li>/, '$1');
      let linkMatch = content.match(/<a href="(.*?)">(.*?)<\/a>(.*)/);
      if (linkMatch) {
        return `<div class="ca-glass p-8 flex flex-col gap-4 border-l-[3px] border-l-[#A78BFA] !bg-white/5">
          <h3 class="text-xl font-bold text-white"><a href="${linkMatch[1]}" class="hover:text-[#A78BFA] transition-colors">${linkMatch[2]}</a></h3>
          <p class="text-sm text-white/60 leading-relaxed">${linkMatch[3].replace(/^,\s*/, '')}</p>
        </div>`;
      }
      return `<div class="ca-glass p-8 border-l-[3px] border-l-[#A78BFA]"><p class="text-sm text-white/60">${content}</p></div>`;
    });
    
    return `<!-- METHODOLOGY -->
<section class="ca-section py-32 ca-section-dark bg-[#040E1A] border-t border-white/5">
  <div class="ca-container">
    <div class="mb-16 max-w-3xl">
      <div class="ca-eyebrow !text-[#A78BFA] !border-[#A78BFA]/30 !bg-[#A78BFA]/10 mb-6">METHODOLOGY</div>
      <h2 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">${h2}</h2>
      <p class="text-lg text-white/60 leading-relaxed">${p}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
  }
);

// 4. INTEL TRACKERS
html = html.replace(
  /<section class="section-padding section-tone-0">[\s\S]*?<div class="wrap container-standard">[\s\S]*?<div class="section-label">INTEL<\/div>[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<p class="page-intro">(.*?)<\/p>[\s\S]*?<ul class="article-body">([\s\S]*?)<\/ul>[\s\S]*?<\/div>[\s\S]*?<\/section>/,
  (match, h2, p, ul) => {
    let items = ul.match(/<li>(.*?)<\/li>/g).map(li => {
      let content = li.replace(/<li>(.*?)<\/li>/, '$1');
      let linkMatch = content.match(/<a href="(.*?)">(.*?)<\/a>(.*)/);
      if (linkMatch) {
        return `<div class="ca-glass p-8 flex flex-col gap-4 border-l-[3px] border-l-[#C2FF57] !bg-white/5">
          <h3 class="text-xl font-bold text-white"><a href="${linkMatch[1]}" class="hover:text-[#C2FF57] transition-colors">${linkMatch[2]}</a></h3>
          <p class="text-sm text-white/60 leading-relaxed">${linkMatch[3].replace(/^,\s*/, '')}</p>
        </div>`;
      }
      return `<div class="ca-glass p-8 border-l-[3px] border-l-[#C2FF57]"><p class="text-sm text-white/60">${content}</p></div>`;
    });
    
    return `<!-- INTEL TRACKERS -->
<section class="ca-section py-32 ca-section-dark bg-[#000212] border-t border-white/5">
  <div class="ca-container">
    <div class="mb-16 max-w-3xl">
      <div class="ca-eyebrow !text-[#C2FF57] !border-[#C2FF57]/30 !bg-[#C2FF57]/10 mb-6">INTEL</div>
      <h2 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">${h2}</h2>
      <p class="text-lg text-white/60 leading-relaxed">${p}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
  }
);

// 5. GLOSSARY
html = html.replace(
  /<section class="section-padding section-tone-1">[\s\S]*?<div class="wrap container-standard">[\s\S]*?<div class="section-label">GLOSSARY<\/div>[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<p class="page-intro">(.*?)<\/p>[\s\S]*?<ul class="article-body">([\s\S]*?)<\/ul>[\s\S]*?<\/div>[\s\S]*?<\/section>/,
  (match, h2, p, ul) => {
    let content = ul.match(/<li>(.*?)<\/li>/)[1];
    let linkMatch = content.match(/<a href="(.*?)">(.*?)<\/a>(.*)/);
    return `<!-- GLOSSARY -->
<section class="ca-section py-32 ca-section-dark bg-[#040E1A] border-t border-white/5">
  <div class="ca-container">
    <div class="ca-glass p-12 text-center max-w-4xl mx-auto border-t-4 border-t-[#0CC9A8]">
      <div class="ca-eyebrow mb-6 mx-auto inline-block">GLOSSARY</div>
      <h2 class="text-4xl font-black text-white tracking-tight mb-6">${h2}</h2>
      <p class="text-lg text-white/60 leading-relaxed mb-8">${p}</p>
      <p class="text-sm text-white/40 mb-10 italic">${linkMatch[3].replace(/^,\s*/, '')}</p>
      <a href="${linkMatch[1]}" class="ca-btn ca-btn-primary">${linkMatch[2]} &rarr;</a>
    </div>
  </div>
</section>`;
  }
);

fs.writeFileSync('resources.html', html, 'utf8');
console.log('Rebuilt resources.html');
