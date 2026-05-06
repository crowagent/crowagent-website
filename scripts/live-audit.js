const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE_URL = process.env.BASE_URL || 'https://www.crowagent.ai';
const MAX_PAGES = Number(process.env.MAX_PAGES || 80);
const OUT_DIR = path.join(process.cwd(), 'audit-results');
const TODAY = new Date().toISOString().slice(0, 10);

function cleanOrigin(url) {
  const parsed = new URL(url);
  return parsed.origin;
}

function sameSite(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '') === new URL(BASE_URL).hostname.replace(/^www\./, '');
  } catch (_) {
    return false;
  }
}

function normalizeInternalUrl(raw, from = BASE_URL) {
  if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return null;
  if (/^(javascript|data|blob):/i.test(raw)) return raw;
  try {
    const url = new URL(raw, from);
    url.hash = '';
    if (!sameSite(url.href)) return url.href;
    return `${cleanOrigin(BASE_URL)}${url.pathname}${url.search}`;
  } catch (_) {
    return null;
  }
}

function loadSitemapPaths() {
  const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .map((loc) => {
      const url = new URL(loc);
      return `${cleanOrigin(BASE_URL)}${url.pathname}${url.search}`;
    });
}

function severityForIssue(issue) {
  if (/ERR_TOO_MANY_REDIRECTS|redirect loop|navigation failed/i.test(issue)) return 'P0';
  if (/broken link|status 4|status 5|console error|page error|axe critical|axe serious/i.test(issue)) return 'P1';
  if (/missing|duplicate|unlabelled|unlabeled|overflow|tap target|title|description|canonical|h1/i.test(issue)) return 'P2';
  return 'P3';
}

function addIssue(issues, pageUrl, issue, detail = '') {
  issues.push({
    severity: severityForIssue(`${issue} ${detail}`),
    page: pageUrl,
    issue,
    detail,
  });
}

async function auditPage(browser, url, queue, seen, allLinks, issues) {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (['error'].includes(msg.type())) consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  let response;
  try {
    response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await delay(80);
      }
      window.scrollTo(0, 0);
      await delay(150);
    }).catch(() => {});
  } catch (err) {
    addIssue(issues, url, 'Navigation failed', err.message);
    await context.close();
    return { url, ok: false, error: err.message };
  }

  const status = response ? response.status() : null;
  if (status && status >= 400) addIssue(issues, url, `HTTP status ${status}`, page.url());

  const data = await page.evaluate(() => {
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const text = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) || '';
    const meta = (name) =>
      document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ||
      document.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ||
      '';
    const controlName = (el) => {
      const id = el.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
      return (
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        (label ? text(label) : '') ||
        (el.closest('label') ? text(el.closest('label')) : '') ||
        el.getAttribute('placeholder') ||
        text(el)
      ).trim();
    };

    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
      level: Number(h.tagName.slice(1)),
      text: text(h),
    }));
    const linkName = (a) => (
      a.getAttribute('aria-label') ||
      a.getAttribute('title') ||
      text(a) ||
      [...a.querySelectorAll('img[alt]')].map((img) => img.getAttribute('alt')).filter(Boolean).join(' ') ||
      [...a.querySelectorAll('svg title')].map((title) => text(title)).filter(Boolean).join(' ')
    ).trim();
    const links = [...document.querySelectorAll('a[href]')].map((a) => {
      const name = linkName(a);
      return {
        href: a.getAttribute('href'),
        absolute: a.href,
        text: name,
        rawText: text(a),
        className: typeof a.className === 'string' ? a.className : '',
        target: a.getAttribute('target') || '',
        rel: a.getAttribute('rel') || '',
        visible: isVisible(a),
        rect: (() => {
          const r = a.getBoundingClientRect();
          return { width: Math.round(r.width), height: Math.round(r.height) };
        })(),
      };
    });
    const buttons = [...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]')].map((b) => ({
      tag: b.tagName.toLowerCase(),
      type: b.getAttribute('type') || '',
      name: controlName(b),
      visible: isVisible(b),
      rect: (() => {
        const r = b.getBoundingClientRect();
        return { width: Math.round(r.width), height: Math.round(r.height) };
      })(),
    }));
    const formControls = [...document.querySelectorAll('input,select,textarea')].map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || '',
      id: el.id || '',
      name: el.getAttribute('name') || '',
      label: controlName(el),
      required: el.required,
      visible: isVisible(el),
    }));
    const images = [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute('alt'),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      visible: isVisible(img),
    }));
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    const duplicateIds = [...new Set(ids.filter((id, idx) => ids.indexOf(id) !== idx))];
    const buttonLikeLinks = links.filter((item) =>
      !item.rawText || /\b(btn|button|touch|icon|social|cta|toggle)\b/i.test(item.className || '')
    );
    const smallTapTargets = [...buttonLikeLinks, ...buttons]
      .filter((item) => item.visible && item.rect.width > 0 && item.rect.height > 0)
      .filter((item) => !/skip to main content/i.test(item.text || item.name || ''))
      .filter((item) => item.rect.width < 32 || item.rect.height < 32)
      .slice(0, 20)
      .map((item) => ({
        text: item.text || item.name || item.href || item.tag,
        width: item.rect.width,
        height: item.rect.height,
      }));

    return {
      finalUrl: location.href,
      title: document.title,
      metaDescription: meta('description'),
      canonical: attr('link[rel="canonical"]', 'href'),
      ogImage: meta('og:image'),
      twitterImage: meta('twitter:image'),
      lang: document.documentElement.getAttribute('lang') || '',
      headings,
      links,
      buttons,
      formControls,
      images,
      duplicateIds,
      bodyTextLength: document.body.innerText.replace(/\s+/g, ' ').trim().length,
      overflowX: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      smallTapTargets,
    };
  });

  if (!data.title || data.title.trim().length < 10) addIssue(issues, url, 'Missing or weak page title', data.title);
  if (!data.metaDescription || data.metaDescription.trim().length < 70) addIssue(issues, url, 'Missing or thin meta description', data.metaDescription);
  if (!data.lang) addIssue(issues, url, 'Missing html lang attribute');
  if (!data.canonical) addIssue(issues, url, 'Missing canonical URL');
  if (!data.ogImage) addIssue(issues, url, 'Missing og:image');
  if (!data.twitterImage) addIssue(issues, url, 'Missing twitter:image');
  const h1s = data.headings.filter((h) => h.level === 1);
  if (h1s.length !== 1) addIssue(issues, url, `Expected exactly one h1, found ${h1s.length}`, h1s.map((h) => h.text).join(' | '));
  if (data.overflowX > 1) addIssue(issues, url, 'Horizontal overflow on desktop', `${data.overflowX}px`);
  for (const id of data.duplicateIds) addIssue(issues, url, 'Duplicate id', id);
  for (const err of consoleErrors.slice(0, 10)) addIssue(issues, url, 'Console error', err);
  for (const err of pageErrors.slice(0, 10)) addIssue(issues, url, 'Page error', err);
  for (const img of data.images.filter((img) => img.visible && (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0))) {
    addIssue(issues, url, 'Broken image', img.src);
  }
  for (const img of data.images.filter((img) => img.visible && img.alt === null)) {
    addIssue(issues, url, 'Image missing alt attribute', img.src);
  }
  for (const link of data.links.filter((link) => !link.text && link.visible)) {
    addIssue(issues, url, 'Visible link has no accessible text', link.href);
  }
  for (const link of data.links.filter((link) => link.target === '_blank' && !/\bnoopener\b/i.test(link.rel))) {
    addIssue(issues, url, 'target=_blank link missing noopener', link.href);
  }
  for (const btn of data.buttons.filter((btn) => btn.visible && !btn.name)) {
    addIssue(issues, url, 'Visible button/control has no accessible name', btn.tag);
  }
  for (const input of data.formControls.filter((input) => input.visible && !['hidden', 'submit', 'button', 'reset'].includes(input.type) && !input.label)) {
    addIssue(issues, url, 'Visible form control is unlabeled', `${input.tag}#${input.id || input.name}`);
  }
  for (const tap of data.smallTapTargets.slice(0, 5)) {
    addIssue(issues, url, 'Small tap target', `${tap.text} (${tap.width}x${tap.height})`);
  }

  try {
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    for (const violation of axe.violations) {
      const label = `axe ${violation.impact || 'unknown'}: ${violation.id}`;
      addIssue(issues, url, label, `${violation.help} (${violation.nodes.length} nodes)`);
    }
    data.axeViolations = axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
    }));
  } catch (err) {
    addIssue(issues, url, 'Axe scan failed', err.message);
  }

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(data.finalUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
    const mobile = await page.evaluate(() => {
      const candidates = [...document.querySelectorAll('body *')].map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: typeof el.className === 'string' ? el.className : '',
          text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      });
      return {
        overflowX: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        offenders: candidates
          .filter((item) => item.width > 0 && (item.left < -1 || item.right > window.innerWidth + 1))
          .slice(0, 8),
      };
    });
    data.mobile = mobile;
    if (mobile.overflowX > 1) {
      addIssue(
        issues,
        url,
        'Horizontal overflow on mobile',
        `${mobile.overflowX}px; offenders: ${mobile.offenders.map((o) => `${o.tag}${o.id ? `#${o.id}` : ''}.${String(o.className).split(' ')[0]}`).join(', ')}`
      );
    }
  } catch (err) {
    addIssue(issues, url, 'Mobile viewport audit failed', err.message);
  }

  for (const link of data.links) {
    const normalized = normalizeInternalUrl(link.href, data.finalUrl);
    if (!normalized) continue;
    allLinks.add(normalized);
    if (sameSite(normalized) && !seen.has(normalized) && queue.length + seen.size < MAX_PAGES) {
      queue.push(normalized);
    }
  }

  await context.close();
  return { url, ok: true, status, ...data };
}

async function probeLinks(browser, links, issues) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const request = context.request;
  const results = [];
  const candidates = [...links].filter((href) => /^https?:/i.test(href)).slice(0, 180);

  for (const href of candidates) {
    try {
      const response = await request.get(href, {
        maxRedirects: 8,
        timeout: 12000,
        failOnStatusCode: false,
      });
      const status = response.status();
      results.push({ href, status, finalUrl: response.url() });
      if (status >= 400) addIssue(issues, 'link-check', `Broken link status ${status}`, href);
    } catch (err) {
      results.push({ href, error: err.message });
      addIssue(issues, 'link-check', 'Broken link or redirect loop', `${href} - ${err.message}`);
    }
  }
  await context.close();
  return results;
}

function renderMarkdown(report) {
  const grouped = report.issues.reduce((acc, issue) => {
    acc[issue.severity] = acc[issue.severity] || [];
    acc[issue.severity].push(issue);
    return acc;
  }, {});
  const order = ['P0', 'P1', 'P2', 'P3'];
  const lines = [];
  lines.push(`# CrowAgent Live Site Audit - ${TODAY}`);
  lines.push('');
  lines.push(`Base URL: ${BASE_URL}`);
  lines.push(`Pages audited: ${report.pages.length}`);
  lines.push(`Unique links probed: ${report.linkChecks.length}`);
  lines.push(`Issues found: ${report.issues.length}`);
  lines.push('');
  lines.push('## Summary By Severity');
  for (const sev of order) {
    lines.push(`- ${sev}: ${(grouped[sev] || []).length}`);
  }
  lines.push('');
  for (const sev of order) {
    const issues = grouped[sev] || [];
    if (!issues.length) continue;
    lines.push(`## ${sev} Findings`);
    for (const issue of issues.slice(0, 80)) {
      lines.push(`- ${issue.page}: ${issue.issue}${issue.detail ? ` - ${issue.detail}` : ''}`);
    }
    if (issues.length > 80) lines.push(`- ... ${issues.length - 80} more ${sev} findings in JSON report.`);
    lines.push('');
  }
  lines.push('## Page Inventory');
  for (const page of report.pages) {
    lines.push(`- ${page.url}: ${page.ok ? `status ${page.status}, title "${page.title}"` : `failed - ${page.error}`}`);
  }
  lines.push('');
  return lines.join('\n');
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const seeds = [...new Set(loadSitemapPaths())];
  const queue = [...seeds];
  const seen = new Set();
  const allLinks = new Set(seeds);
  const issues = [];
  const pages = [];

  while (queue.length && seen.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    process.stdout.write(`Auditing ${url}\n`);
    const result = await auditPage(browser, url, queue, seen, allLinks, issues);
    pages.push(result);
  }

  process.stdout.write(`Probing ${allLinks.size} unique links\n`);
  const linkChecks = await probeLinks(browser, allLinks, issues);
  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages,
    linkChecks,
    issues,
  };

  const jsonPath = path.join(OUT_DIR, `live-site-audit-${TODAY}.json`);
  const mdPath = path.join(OUT_DIR, `live-site-audit-${TODAY}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(report));
  process.stdout.write(`Wrote ${jsonPath}\n`);
  process.stdout.write(`Wrote ${mdPath}\n`);
  process.stdout.write(`Issues: ${issues.length}\n`);
})();
