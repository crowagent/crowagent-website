import os
import re

root_dir = r'C:\Users\bhave\Crowagent Repo\crowagent-website'
target_injection = """<!-- Sovereign Core v2 — Tailwind v4 Engine + Cinematic Primitives -->
<link rel="stylesheet" href="/Assets/css/nav-global-fix-2026-05-27.css?v=20260527">
<link rel="stylesheet" href="/crowagent-brand-tokens.css?v=20260527">
<!-- Existing Modular Logic -->"""

count = 0
for root, dirs, files in os.walk(root_dir):
    # Exclude unwanted directories
    if any(excluded in root for excluded in ['node_modules', '.git', 'Assets']):
        continue
        
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check if it needs injection
                if 'nav-global-fix-2026-05-27.css' not in content and '<!-- Sovereign Core v2' in content:
                    new_content = re.sub(
                        r'<!-- Sovereign Core v2 — Tailwind v4 Engine \+ Cinematic Primitives -->\s*<!-- Existing Modular Logic -->',
                        target_injection,
                        content,
                        flags=re.MULTILINE
                    )
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Injected CSS into: {path}")
                        count += 1
            except Exception as e:
                print(f"Error processing {path}: {e}")

print(f"Total files updated: {count}")
