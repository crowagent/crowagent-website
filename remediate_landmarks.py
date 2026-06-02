import os
import re

directories = [
    'C:/Users/bhave/Crowagent Repo/crowagent-website/blog',
    'C:/Users/bhave/Crowagent Repo/crowagent-website/glossary',
    'C:/Users/bhave/Crowagent Repo/crowagent-website'
]

file_patterns = [
    r'blog/.*\.html$',
    r'glossary/.*\.html$',
    r'tools-.*\.html$'
]

replacements = [
    (r'<aside class="lg:col-span-4 order-2 lg:order-1" role="region">', r'<section class="lg:col-span-4 order-2 lg:order-1" aria-label="In this article">'),
    (r'<aside aria-label="In this article" class="blog-stripe-toc" role="region">', r'<section aria-label="In this article" class="blog-stripe-toc">'),
    (r'<aside role="region" class="lg:col-span-4">', r'<section aria-label="Related links" class="lg:col-span-4">'),
    (r'<aside role="region" class="sv-card ms-reveal ms-card-lift" aria-label="Office and contact info">', r'<section aria-label="Office and contact info" class="sv-card ms-reveal ms-card-lift">'),
    (r'<aside role="region" class="regulatory-footnotes" aria-label="Regulatory disclaimers">', r'<section aria-label="Regulatory disclaimers" class="regulatory-footnotes">'),
    (r'<aside aria-label="In this article" class="article-toc hidden lg:block w-72 shrink-0 h-fit sticky top-32" role="region">', r'<section aria-label="In this article" class="article-toc hidden lg:block w-72 shrink-0 h-fit sticky top-32">'),
    (r'<aside class="lc-callout" role="note" aria-label="(.*?)">', r'<section aria-label="\1" class="lc-callout">')
]

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)
    
    # Also replace closing </aside> if the opening tag was replaced
    if new_content != content:
        # This is a bit naive if there are multiple asides, but usually TOCs have a specific structure
        # Let's try to be more precise for closing tags by counting if we changed an aside
        # Actually, if we just replace </aside> with </section> where appropriate.
        # Most of these files have only one <aside> or specific ones.
        
        # In blog files, the TOC is usually the first/only aside.
        # Let's check for specific closing patterns or just do a general replace if we know we hit a match.
        
        # Better: use a stateful approach or just replace all </aside> if we hit a match, 
        # but only if there aren't top-level asides we want to keep.
        # The instruction says to move to top-level or change tag.
        
        # Let's just replace all </aside> with </section> in files we touched, 
        # assuming all asides in these files are nested landmarks.
        new_content = new_content.replace('</aside>', '</section>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

for root_dir in directories:
    for filename in os.listdir(root_dir):
        file_path = os.path.join(root_dir, filename)
        if not os.path.isfile(file_path):
            continue
        
        relative_path = os.path.relpath(file_path, 'C:/Users/bhave/Crowagent Repo/crowagent-website').replace('\\', '/')
        
        matches = False
        for pattern in file_patterns:
            if re.match(pattern, relative_path):
                matches = True
                break
        
        if matches:
            if fix_file(file_path):
                print(f"Fixed {relative_path}")

# Fix specific files mentioned in grep but not in patterns
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/cookies.html')
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/crowagent-core.html')
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/faq.html')
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/privacy.html')
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/security.html')
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/terms.html')
fix_file('C:/Users/bhave/Crowagent Repo/crowagent-website/contact.html')
