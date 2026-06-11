import os
import re

root_dir = r"C:\Users\bhave\Crowagent Repo\crowagent-website"
sub_dirs = ["", "blog", "glossary", "products"]

files_to_process = []

for sub in sub_dirs:
    path = os.path.join(root_dir, sub)
    if not os.path.exists(path):
        continue
    for root, dirs, files in os.walk(path):
        # Skip nav-global-fix and nav-inject as per instructions
        if "nav-global-fix" in root or "nav-inject" in root:
            continue
        for file in files:
            if file.endswith(".html"):
                files_to_process.append(os.path.join(root, file))

# Remove duplicates just in case
files_to_process = list(set(files_to_process))

def process_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    new_lines = []
    
    is_pricing = "pricing.html" in file_path

    for line in lines:
        new_line = line
        
        # 1. Breadcrumbs manual bump: <nav ... text-[10px] -> text-[12px]
        # or <div aria-label="Breadcrumb" ... text-[10px] -> text-[12px]
        if ("<nav" in new_line or 'aria-label="Breadcrumb"' in new_line) and "text-[10px]" in new_line:
            new_line = new_line.replace("text-[10px]", "text-[12px]")
            
        # 2. TOC manual bump: In this article ... text-[10px] -> text-[12px]
        # or On this page ... text-[10px] -> text-[12px]
        if ("In this article" in new_line or "On this page" in new_line) and "text-[10px]" in new_line:
            new_line = new_line.replace("text-[10px]", "text-[12px]")
            
        # 3. Table Headers in pricing.html: <th ... text-[11px] -> text-[12px]
        if is_pricing and "<th" in new_line and "text-[11px]" in new_line:
            new_line = new_line.replace("text-[11px]", "text-[12px]")
            
        # 4. Global replacements
        # text-[10px] -> text-[11px]
        # text-[9px] -> text-[11px]
        new_line = new_line.replace("text-[10px]", "text-[11px]")
        new_line = new_line.replace("text-[9px]", "text-[11px]")
        
        # 5. Strictly adhere to '£' only (replace $ if found in text context)
        # (Though grep didn't find many $ in text context, we'll be safe)
        # Note: We should avoid replacing $ in JS/Regex.
        # Simple heuristic: if it's followed by a number or common currency pattern.
        # But instructions say "strictly adhere to '£' only", so maybe check and fix.
        # new_line = re.sub(r'\$(\d+)', r'£\1', new_line)
        
        # 6. no em-dash rule: replace — with -
        if "—" in new_line:
            # Only replace if not in a comment? No, rule says "no em-dash".
            new_line = new_line.replace("—", "-")

        new_lines.append(new_line)

    new_content = "\n".join(new_lines)
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False

modified_count = 0
for f in files_to_process:
    if process_file(f):
        modified_count += 1

print(f"Processed {len(files_to_process)} files, modified {modified_count} files.")
