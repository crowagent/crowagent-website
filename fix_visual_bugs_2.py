import os
import re
from glob import glob

def fix_content(content, filename):
    # 1. LM-161: Tap Target Expansion for social/share
    # Social links
    content = content.replace('class="foot-social-link"', 'class="foot-social-link p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"')
    
    # 2. BUG-045: Pricing table header spacing
    if filename == 'pricing.html':
        content = content.replace('<th class="py-6">Starter</th>', '<th class="py-6 px-4 min-w-[120px]">Starter</th>')
        content = content.replace('<th class="py-6">Pro</th>', '<th class="py-6 px-4 min-w-[120px]">Pro</th>')
        content = content.replace('<th class="py-6">Portfolio</th>', '<th class="py-6 px-4 min-w-[120px]">Portfolio</th>')

    # 3. BUG-048: Mobile Aspect Ratio Compression
    if filename == 'index.html':
        # Reduce aspect ratio of large images on mobile
        content = content.replace('aspect-video', 'aspect-square md:aspect-video')
        # Reduce vertical gap in the grid
        content = content.replace('gap-y-32', 'gap-y-16 lg:gap-y-32')

    return content

files = glob('**/*.html', recursive=True)
for f in files:
    if 'node_modules' in f or '.git' in f or '_archive' in f:
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = fix_content(content, os.path.basename(f))
    if new_content != content:
        print(f"Fixed {f}")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
