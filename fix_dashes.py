import os
import re
from glob import glob

def fix_dashes(content):
    # Replace em-dashes and en-dashes with hyphens in text nodes
    # We want to avoid replacing them in script/style blocks or attributes
    
    # 1. em-dashes (— and &mdash;)
    content = content.replace('—', '-')
    content = content.replace('&mdash;', '-')
    
    # 2. en-dashes (– and &ndash;)
    content = content.replace('–', '-')
    content = content.replace('&ndash;', '-')
    
    return content

files = glob('**/*.html', recursive=True) + glob('js/*.js')
for f in files:
    if 'node_modules' in f or '.git' in f or '_archive' in f:
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = fix_dashes(content)
    if new_content != content:
        print(f"Fixed {f}")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
