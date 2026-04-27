#!/usr/bin/env pwsh
# crowagent-website — DEPLOY STUB (post-Cloudflare-Pages migration, April 2026)
#
# This file used to invoke `vercel --prod` and verify the deploy via curl.
# That workflow is obsolete: crowagent-website now deploys via Cloudflare Pages
# auto-build on every push to `main` (and feature branches get preview URLs).
#
# There is no manual deploy command. To ship: `git push origin main`.
# See CLAUDE.md §17 (domain ownership / deploy) and §18 (production smoke
# methodology + cache-bypass rule) for the current workflow.
#
# Kept as a stub (rather than deleted) so any docs / scripts that still
# reference `deploy.ps1` fail loudly with this notice instead of silently.

Write-Host "deploy.ps1 is a stub — crowagent-website deploys via Cloudflare Pages on git push." -ForegroundColor Yellow
Write-Host "To ship: git push origin main (or open a PR for a preview URL)." -ForegroundColor Yellow
Write-Host "See CLAUDE.md §17 + §18 for the current workflow + post-deploy smoke methodology." -ForegroundColor Yellow
exit 0
