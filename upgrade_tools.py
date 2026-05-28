import os, glob, re

tools_pages = glob.glob('crowagent-website/tools/*/index.html') + glob.glob('crowagent-website/intel/*/index.html')

for path in tools_pages:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Section wrapper upgrades
    content = re.sub(r'class=\"py-40 bg-white text-\[#040E1A\]([^\"]*)\"', r'class="py-60 ca-section-light\1"', content)
    content = re.sub(r'class=\"py-40 bg-\[#040E1A\] text-white([^\"]*)\"', r'class="py-60 ca-section-dark\1"', content)
    
    # Typography scale upgrades (Section Headers)
    content = re.sub(r'<h2 class=\"text-4xl font-black mb-6\">', r'<h2 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-12 text-[#040E1A]">', content)
    content = re.sub(r'<h2 class=\"text-4xl md:text-5xl font-black mb-6\">', r'<h2 class="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-12 text-[#040E1A]">', content)
    
    # Typography scale upgrades (Sub-headers)
    content = re.sub(r'<h2 class=\"text-3xl font-black mb-6\">', r'<h2 class="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-12 text-white">', content)
    
    # Card background upgrades for ca-section-light blending
    content = content.replace('bg-[#F8FAFC]', 'bg-black/5')
    
    # Padding upgrades for tool results and blocks
    content = content.replace('mt-20 p-10', 'mt-32 p-16')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Upgraded {path}')
