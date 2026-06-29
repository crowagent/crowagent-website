#!/usr/bin/env node
/**
 * Master Footer Cleanup — SF46 Phase 5.
 * 
 * Directives:
 * 1. Update copyright line to exactly: "© 2026 CrowAgent Ltd. All rights reserved. Registered in England & Wales."
 * 2. Remove "Sustainability•Intelligence" from that line.
 * 3. Remove registration line: "CrowAgent Ltd · Company No. 17076461, Registered in England & Wales · ICO data controller registered."
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NAV_INJECT_PATH = path.join(ROOT, 'js', 'nav-inject.js');

// 1. Update nav-inject.js (The Source of Truth)
if (fs.existsSync(NAV_INJECT_PATH)) {
    let content = fs.readFileSync(NAV_INJECT_PATH, 'utf8');
    
    // Fix the copyright line (remove &amp; and ensure exactly one line)
    content = content.replace(
        /'\s*<p class="footer-copyright">.*?<\/p>',/g,
        '\'      <p class="footer-copyright">&copy; <span id="footer-year">2026</span> CrowAgent Ltd. All rights reserved. Registered in England & Wales.</p>\','
    );

    // Remove the registration line if it exists as a separate variable or string
    content = content.replace(/CrowAgent Ltd · Company No\. 17076461.*?registered\./g, '');
    
    // Remove legal chips from trust row to keep footer minimal (if requested by "remove this complete line")
    // We already did this via replace tool, but this script ensures it for future runs.
    content = content.replace(/<li><svg.*?ICO registered<\/li>/g, '');
    content = content.replace(/<li><svg.*?Companies House 17076461<\/li>/g, '');

    fs.writeFileSync(NAV_INJECT_PATH, content);
    console.log('✓ Updated js/nav-inject.js');
}

// 2. Sweep all HTML files for any hardcoded artifacts
function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '_archive') walk(fullPath);
        } else if (file.endsWith('.html')) {
            cleanupFooter(fullPath);
        }
    });
}

function cleanupFooter(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    let original = html;

    // Direct removal of the strings provided by the user
    const userStrings = [
        "CrowAgent Ltd · Company No. 17076461, Registered in England & Wales · ICO data controller registered.",
        "CrowAgent Ltd · Company No. 17076461, Registered in England & Wales · ICO data controller registered",
        "© 2026 CrowAgent Ltd. All rights reserved. Sustainability•Intelligence.",
        "© 2026 CrowAgent Ltd. All rights reserved. Sustainability•Intelligence",
        "Sustainability•Intelligence"
    ];

    userStrings.forEach(s => {
        if (html.includes(s)) {
            if (s.includes('©')) {
                html = html.replace(s, '© 2026 CrowAgent Ltd. All rights reserved. Registered in England & Wales.');
            } else {
                html = html.replace(s, '');
            }
        }
    });

    // Also check for common variations with dots/spaces
    html = html.replace(/©\s*2026\s*CrowAgent Ltd\.\s*All rights reserved\.\s*Sustainability\s*•\s*Intelligence\.?/gi, '© 2026 CrowAgent Ltd. All rights reserved. Registered in England & Wales.');
    html = html.replace(/CrowAgent Ltd\s*·\s*Company No\.\s*17076461.*?registered\.?/gi, '');

    if (html !== original) {
        fs.writeFileSync(filePath, html);
        console.log(`✓ Cleaned footer artifacts in ${path.relative(ROOT, filePath)}`);
    }
}

console.log('Starting Global Footer Truth Sweep...');
walk(ROOT);
console.log('Sweep complete.');
