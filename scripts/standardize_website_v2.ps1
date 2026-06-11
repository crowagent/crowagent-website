$htmlFiles = Get-ChildItem -Path "crowagent-website" -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "coverage" }

$criticalCSS = ":root{--bg:#040E1A;--surf:#0A1F3A;--surf2:#0D2847;--teal:#0CC9A8;--teal-d:#0AA88C;--cloud:#E8F0FA;--steel:#B8CCE0;--mist:#8A9DB8;--border2:rgba(12,201,168,.20);--font-size-h1:clamp(2.8rem,1.5rem + 5vw,4.6rem);--glass-bg:rgba(10,31,58,0.6);--glass-blur:blur(12px)} *,*::before,*::after{box-sizing:border-box;margin:0;padding:0} html,body{background:#040E1A;color:#E8F0FA;min-height:100vh;max-width:100vw;overflow-x:hidden} html{font-family:'Plus Jakarta Sans','Inter',sans-serif;scroll-behavior:smooth} body{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;line-height:1.625;letter-spacing:-0.011em;padding-top:0 !important} a{color:inherit;text-decoration:none} img,picture{max-width:100%;height:auto;display:block} canvas{max-width:100%} button{font-family:inherit;cursor:pointer;border:none;background:transparent} .skip-link,.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0} .skip-link:focus{position:static;width:auto;height:auto;padding:12px 20px;margin:0;overflow:visible;clip:auto;background:var(--teal);color:var(--bg);font-weight:700;display:block;text-align:center;z-index:9999} .announce-bar{height:40px;background:rgba(12,201,168,.08);border-bottom:1px solid var(--border2);display:flex;align-items:center;position:relative;z-index:1001} .announce-bar .wrap{display:flex;align-items:center;justify-content:center;gap:12px;font-size:13px;color:var(--cloud)} #ca-nav{position:sticky;top:0;z-index:1000;background:transparent;backdrop-filter:none} nav{height:64px;display:flex;align-items:center} .hero{position:relative;overflow:visible;padding:clamp(120px,15vw,180px) 0 100px;text-align:center;background-color:var(--bg);isolation:isolate} .hero-inner{display:flex !important;flex-direction:column !important;align-items:center !important;text-align:center !important;max-width:960px !important;margin:0 auto !important;gap:32px !important;position:relative;z-index:10} .hero-has-backdrop .hero-visual{display:none !important} .hero-has-backdrop .hero-content{max-width:100% !important;text-align:center !important} .hero-mesh-bg{position:absolute;inset:0;z-index:-2;overflow:hidden;background:var(--bg);pointer-events:none} .mesh-blob{position:absolute;border-radius:50%;filter:blur(80px);mix-blend-mode:screen;opacity:0.35;animation:mesh-float 20s infinite alternate ease-in-out} .mesh-blob--1{width:60vw;height:60vw;top:-10%;left:-10%;background:radial-gradient(circle, var(--teal) 0%, transparent 70%)} .mesh-blob--2{width:50vw;height:50vw;bottom:-5%;right:-5%;background:radial-gradient(circle, var(--surf2) 0%, transparent 70%)} .hero-backdrop{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none} .hero-backdrop img{width:100%;height:100%;object-fit:cover;object-position:50% 30%;opacity:0.7;filter:saturate(1.1) brightness(0.65) contrast(1.1)} .hero-scrim{position:absolute;inset:0;background:radial-gradient(circle at 50% 35%, transparent 0%, var(--bg) 85%);z-index:1} .hero h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:var(--font-size-h1);font-weight:800;line-height:1.15;letter-spacing:-.03em;color:var(--cloud);margin-bottom:12px;text-shadow:0 4px 12px rgba(0,0,0,0.6)} .hero-h1-accent{color:var(--teal)} .hero-sub{font-family:'Inter',sans-serif;font-size:clamp(1.1rem,2vw,1.25rem);color:var(--steel);max-width:760px;margin:0 auto 24px;line-height:1.6;text-shadow:0 2px 8px rgba(0,0,0,0.4)} .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap} .btn{display:inline-flex;align-items:center;padding:14px 32px;border-radius:12px;font-weight:700;transition:transform 0.2s cubic-bezier(0.16,1,0.3,1)} .btn-primary-v2{background:var(--teal);color:var(--bg)} .btn-secondary{border:1px solid var(--border2);color:var(--cloud)} @keyframes mesh-float{0%{transform:translate(0,0) scale(1)}100%{transform:translate(5%,5%) scale(1.05)}} @media(max-width:768px){.hero{padding:100px 0 60px}.hero-inner{gap:24px}.hero h1{font-size:2.8rem}.hero-sub{font-size:1.1rem}}"

foreach ($file in $htmlFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalContent = $content

        # 1. Versioning
        $content = [regex]::Replace($content, '(\.css|\.js)\?v=\d+', '$1?v=62')
        $content = [regex]::Replace($content, 'styles\.css(\?v=\d+)?', 'styles.css?v=62')
        $content = [regex]::Replace($content, 'scripts\.min\.js(\?v=\d+)?', 'scripts.min.js?v=62')

        # 2. Critical CSS
        if ($content -match '<!-- FINAL-2-LCP.*-->\s*<style>[\s\S]*?</style>') {
            $content = [regex]::Replace($content, '<!-- FINAL-2-LCP.*-->\s*<style>[\s\S]*?</style>', "<!-- FINAL-3-STRATEGIC 2026-05-13 -->`n<style>$criticalCSS</style>")
        }

        # 3. Theme color
        $content = [regex]::Replace($content, '<meta\s+name="theme-color"\s+content="[^"]+">', '<meta name="theme-color" content="#040E1A">')

        # 4. Script Order
        $content = [regex]::Replace($content, '\s*<script[^>]*src="[^"]*nav-inject\.js"[^>]*></script>', '')
        $content = [regex]::Replace($content, '\s*<script[^>]*src="[^"]*scripts\.(min\.)?js[^"]*"[^>]*></script>', '')
        $content = [regex]::Replace($content, '\s*<script[^>]*src="[^"]*enterprise-motion\.js[^"]*"[^>]*></script>', '')
        
        if ($content -match '</body>') {
            $newScripts = "`n<!-- CORE ENGINE -->`n<script src=""/scripts.min.js?v=62"" defer></script>`n<script src=""/js/modules/enterprise-motion.js?v=62"" defer></script>`n<script src=""/js/nav-inject.js"" defer></script>`n"
            $content = [regex]::Replace($content, '\s*(<!--.*?-->\s*)?</body>', "$newScripts</body>")
        }

        if ($content -ne $originalContent) {
            Write-Host "Standardizing $($file.FullName)"
            [System.IO.File]::WriteAllText($file.FullName, $content)
        }
    } catch {
        Write-Error "Error processing $($file.FullName): $_"
    }
}
