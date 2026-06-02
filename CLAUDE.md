# CLAUDE.md — Website Full Transformation Enforcement

## ACTIVE SPEC
You are executing: `.kiro/specs/website-full-transformation/tasks.md`
Working directory: `c:\Users\bhave\Crowagent Repo\crowagent-website`

## LOCALHOST REQUIREMENT — NON-NEGOTIABLE
- Start a local HTTP server on port 8092 BEFORE any work begins
- Command: `npx http-server . -p 8092 -c-1 --cors` (run in background)
- NEVER kill the server. Keep it running for the entire session.
- If the server dies, restart it immediately.
- Verify server is live: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8092/crowagent-core.html` must return 200
- The user will be testing at http://localhost:8092 throughout. Do NOT interrupt their access.

## TASK EXECUTION ORDER
Remaining tasks (execute in this exact order):
- 2.1 through 2.6 (Wave 2: Free Tools Pages)
- 3.1 through 3.5 (Wave 3: Blog Pages)
- 4.1 through 4.4 (Wave 4: About/Contact/Partners)
- 5.1 through 5.6 (Wave 5: Legal/Utility Pages)
- 6.1 through 6.4 (Wave 6: Pricing/Roadmap/FAQ/Tools Index)
- 7.1 through 7.8 (Wave 7: Global Issues and Polish)

Task 1.3 (hero redesign) was skipped. Do NOT attempt it unless explicitly asked.

## RULES YOU CANNOT BREAK

### CSS Rules
1. ALL colours MUST use `var(--teal)`, `var(--bg)`, `var(--cloud)`, `var(--steel)`, `var(--mist)`, `var(--surf)`, `var(--surf2)`, `var(--border)`, `var(--border2)` tokens. NEVER hardcode hex values.
2. CTA buttons: background `var(--teal)`, text colour `var(--bg)` (the dark obsidian colour).
3. All CSS changes go in BOTH `styles.css` AND `styles.min.css`.

### Content Rules
4. No em-dashes in user-facing text. Use commas, semicolons, or separate sentences.
5. No AI-sounding language (revolutionize, seamlessly, harness, unleash, cutting-edge, game-changing).
6. MEES Band C 2028 is always "proposed". Never state it as confirmed law.
7. MEES fines NEVER exceed 150,000 GBP.
8. PPN 002 threshold is always 10%. Never 5%.
9. Flag unverifiable claims with `<!-- REVIEW: [claim] -->` HTML comments.

### Technical Rules
10. Respect `prefers-reduced-motion: reduce`. Disable animations for those users.
11. All images must have `alt` attributes.
12. All interactive elements must have min 44x44px touch targets.
13. Do NOT break existing functionality: carousel, nav injection, footer injection, cookie banner must continue working.
14. Do NOT remove or modify `js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`, or `scripts.min.js` unless the task explicitly requires it.

## QUALITY CHECKS — RUN AFTER EVERY TASK

After completing each numbered task (e.g., 2.1, 2.2, etc.), run ALL of these:

```bash
# 1. Server still alive?
curl -s -o /dev/null -w "%{http_code}" http://localhost:8092/ | grep 200

# 2. All HTML pages return 200 (spot check)
for page in crowagent-core.html crowcyber.html crowcash.html crowmark.html crowesg.html csrd.html tools/index.html; do
  echo "$page: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8092/$page)"
done

# 3. CSS syntax check (no unclosed braces)
node -e "const fs=require('fs');const css=fs.readFileSync('styles.css','utf8');const open=(css.match(/\{/g)||[]).length;const close=(css.match(/\}/g)||[]).length;console.log('Braces:',open,'open',close,'close',open===close?'OK':'MISMATCH')"

# 4. No hardcoded hex in new CSS (check last 200 lines)
tail -200 styles.css | grep -n '#[0-9A-Fa-f]\{3,6\}' && echo "FAIL: hardcoded hex found" || echo "PASS: no hardcoded hex"
```

If ANY check fails, fix it before moving to the next task.

## TASK COMPLETION PROTOCOL

For each task:
1. Read the task description carefully
2. Identify ALL files that need changes
3. Make the changes
4. Run quality checks (above)
5. Verify the page renders correctly at localhost:8092
6. Mark the checkbox in tasks.md: change `- [~]` to `- [x]`
7. Move to the next task

## WHAT TO DO IF STUCK
- You have full terminal access, Node.js, npm, Python, grep, curl, and file system access.
- If a dependency is missing, install it.
- If a file does not exist, create it.
- The ONLY acceptable blocker is a missing production API key or external service.
- NEVER say "I will defer this" or "this needs another session."

## FILE STRUCTURE REFERENCE
```
crowagent-website/
  *.html (product pages, Wave 1 DONE)
  tools/
    index.html (tools index page)
    csrd-applicability-checker/index.html
    cyber-essentials-readiness/index.html
    late-payment-calculator/index.html
    mees-risk-snapshot/index.html
    ppn-002-calculator/index.html
    vsme-materiality-light/index.html
  blog/ (blog pages, Wave 3)
  about.html, contact.html, partners.html (Wave 4)
  security.html, privacy.html, terms.html, cookies.html (Wave 5)
  cookie-preferences.html, glossary*.html, changelog.html (Wave 5)
  pricing.html, roadmap.html, faq.html (Wave 6)
  styles.css + styles.min.css
  js/modules/ (carousel.js, cinematic-init.js, etc.)
  Assets/ (images, fonts, SVGs)
```
