import os
import re

root_dir = r'C:\Users\bhave\Crowagent Repo\crowagent-website'
target_injection = '<link rel="stylesheet" href="/Assets/css/nav-global-fix-2026-05-27.css?v=20260527">\n<link rel="stylesheet" href="/crowagent-brand-tokens.css?v=20260527">\n</head>'

missing = [
    'privacy.html', 'roadmap.html', 'terms.html',
    'blog/mfa-mandatory-2026.html', 'blog/ppn-002-guide.html',
    'blog/ppn-002-social-value-guide.html', 'blog/ppn-014-cyber-essentials-guide.html',
    'blog/regulatory-updates-2026.html',
    'blog/social-value-portal-vs-crowmark.html', 'blog/social-value-themes-explained.html'
]

count = 0
for file in missing:
    path = os.path.join(root_dir, file.replace('/', '\\'))
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'nav-global-fix-2026-05-27.css' not in content:
            new_content = re.sub(r'</head>', target_injection, content, count=1, flags=re.IGNORECASE)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {file}')
                count += 1

print(f"Total files updated: {count}")
