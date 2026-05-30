import os
import re
from glob import glob

def fix_canonical(content, path):
    clean_path = path.replace('\\', '/').replace('index.html', '')
    if clean_path.endswith('/'): clean_path = clean_path[:-1]
    
    canonical_tag = f'<link rel="canonical" href="https://crowagent.ai/{clean_path}">'
    
    if '<link rel="canonical"' in content:
        # Check if it points to localhost or app.crowagent.ai
        if 'localhost' in content or 'app.crowagent.ai' in content:
             return re.sub(r'<link rel="canonical" href=".*?">', canonical_tag, content)
        return content
    
    if '<head>' in content:
        # Try to find a good spot (after title or description)
        if '<meta name="description"' in content:
             return content.replace('<meta name="description"', canonical_tag + '\n<meta name="description"', 1)
        return content.replace('<head>', '<head>\n' + canonical_tag, 1)
    return content

files = glob('blog/*.html') + glob('glossary/*.html')
for f in files:
    if 'index.html' in f: continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = fix_canonical(content, f)
    if new_content != content:
        print(f"Fixed {f}")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
