import os, re
root_dir = r'C:\Users\bhave\Crowagent Repo\crowagent-website'
pages = ['crowcyber.html', 'crowcash.html', 'crowesg.html', 'crowmark.html', 'csrd.html', 'index.html', 'pricing.html']

for page in pages:
    path = os.path.join(root_dir, page)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '<link rel="canonical"' not in content:
            clean_path = page.replace('.html', '')
            if clean_path == 'index':
                clean_path = ''
            
            canonical_tag = f'<link rel="canonical" href="https://crowagent.ai/{clean_path}">'
            
            # Inject before </head>
            new_content = re.sub(r'</head>', f'{canonical_tag}\n</head>', content, count=1, flags=re.IGNORECASE)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Added canonical to {page}')
        else:
            print(f'{page} already has canonical')
