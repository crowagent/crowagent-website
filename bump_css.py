import os

def bump_version():
    target = 'premium-transformation-2026-05-27.css?v=20260528'
    replacement = 'premium-transformation-2026-05-27.css?v=20260528n'
    
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'proposals' in dirs:
            dirs.remove('proposals')
            
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if target in content:
                        new_content = content.replace(target, replacement)
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {path}")
                except Exception as e:
                    print(f"Error updating {path}: {e}")

if __name__ == "__main__":
    bump_version()
