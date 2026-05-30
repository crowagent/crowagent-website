import os
import re
from glob import glob

def fix_img_tags(content):
    # Find img tags without width and height
    # Using a simple heuristic: if it's a large background or hero, use 1600x900
    # If it's a product shot carousel, use 1200x675
    # If it's an article card, use 600x400
    
    def replacer(match):
        img_tag = match.group(0)
        if 'width=' in img_tag and 'height=' in img_tag:
            return img_tag
        
        # Heuristics based on class or src
        w, h = "1200", "800" # default
        
        if 'hero' in img_tag or 'absolute inset-0' in img_tag:
            w, h = "1600", "900"
        elif 'article-card' in img_tag:
            w, h = "600", "400"
        elif 'pcar' in img_tag or 'product-shots' in img_tag:
            w, h = "1200", "675"
        elif 'sectors' in img_tag:
            w, h = "800", "600"
            
        # Add attributes before the closing > or />
        if img_tag.endswith('/>'):
            new_tag = img_tag[:-2] + f' width="{w}" height="{h}" />'
        else:
            new_tag = img_tag[:-1] + f' width="{w}" height="{h}">'
        return new_tag

    return re.sub(r'<img[^>]+>', replacer, content)

files = glob('**/*.html', recursive=True)
for f in files:
    if 'node_modules' in f or '.git' in f:
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = fix_img_tags(content)
    if new_content != content:
        print(f"Fixed {f}")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
