import os
import re
from glob import glob

def fix_content(content, filename):
    # 1. LM-160: Tiny Text Bump
    content = content.replace('text-[9px]', 'text-[11px]')
    content = content.replace('text-[10px]', 'text-[11px]')
    content = content.replace('text-2xs', 'text-xs')
    
    # 2. BUG-048: Homepage Section Compression
    if filename == 'index.html':
        content = content.replace('py-60', 'py-32')
        content = content.replace('py-40', 'py-32')
        
        # 3. BUG-047: Heading Gradient Fix
        gradient_fix = """
    <style>
      /* BUG-047: keep the full hero heading legible - gradient stops fix */
      .ca-hero-title span {
        background: linear-gradient(to bottom, #FFFFFF 55%, rgba(255, 255, 255, 0.82) 100%) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }"""
        if '<style>' in content:
            content = content.replace('<style>', '<style>' + gradient_fix)
        else:
            content = content.replace('</head>', '<style>' + gradient_fix + '</style>\n</head>')

    # 4. R2-REC-002: Magnetic Buttons for CTAs
    # Add data-magnetic to primary buttons that don't have it
    content = re.sub(r'class="ca-btn ca-btn-primary" (?!data-magnetic)', r'class="ca-btn ca-btn-primary" data-magnetic ', content)
    content = re.sub(r'class="ca-btn ca-btn-primary !bg', r'class="ca-btn ca-btn-primary data-magnetic !bg', content)

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
