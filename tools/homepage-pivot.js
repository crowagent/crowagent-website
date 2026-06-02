// HOMEPAGE PIVOT 2026-05-22 — Stripe/Apple/Google rearchitecture
// Replaces lines 286-1482 of index.html (the 1196-line bloated body)
// with 5 focused sections per the brief:
//   2. Trust Strip
//   3. Revenue Trinity (CrowMark / CrowCyber / CrowCash)
//   4. Sovereign Moat
//   5. Future-Proofing Teaser (CrowCore / CrowESG)
//   6. Enterprise Trust
//   (Section 1 Hero + Section 7 Final CTA stay as-is — they were already pivoted/sound.)
const fs = require('fs');

const NEW_SECTIONS = `
<!-- ════════════════════════════════════════════════════════════════════
     SECTION 2 — TRUST STRIP (Powered by UK Regulatory Data)
     Stripe pattern: tight horizontal authority bar immediately below
     hero. Real UK regulator citations only — no customer logos.
     ════════════════════════════════════════════════════════════════════ -->
<section class="hp-trust-strip sv-section sv-section--secondary reveal sf17-reveal" aria-labelledby="hp-trust-strip-heading">
  <div class="sv-container sv-container--standard sv-stack sv-stack--align-center sv-stack--gap-4">
    <p id="hp-trust-strip-heading" class="sv-eyebrow">Powered by UK regulatory data</p>
    <div class="hp-trust-strip__row sv-cluster sv-cluster--gap-6" role="list" aria-label="UK regulators and data sources">
      <div class="hp-trust-strip__item" role="listitem">
        <strong>NCSC</strong>
        <span>Cyber Essentials v3.3</span>
      </div>
      <div class="hp-trust-strip__item" role="listitem">
        <strong>HM Treasury</strong>
        <span>Green Book NPV</span>
      </div>
      <div class="hp-trust-strip__item" role="listitem">
        <strong>MHCLG</strong>
        <span>EPC register</span>
      </div>
      <div class="hp-trust-strip__item" role="listitem">
        <strong>Cabinet Office</strong>
        <span>PPN 002 &amp; 014</span>
      </div>
      <div class="hp-trust-strip__item" role="listitem">
        <strong>Oxford Social Value Bank</strong>
        <span>TOMs framework</span>
      </div>
      <div class="hp-trust-strip__item" role="listitem">
        <strong>ICO</strong>
        <span>Registered controller</span>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════
     SECTION 3 — REVENUE TRINITY (Pillar 1: immediate painkillers)
     The 3-column power block. Each card is a UK SME crisis solved.
     Mobile: stacks vertically below 768px.
     ════════════════════════════════════════════════════════════════════ -->
<section class="hp-trinity sv-section sv-section--primary reveal sf17-reveal" id="revenue-trinity" aria-labelledby="hp-trinity-heading">
  <div class="sv-container sv-container--wide sv-stack sv-stack--align-center sv-stack--gap-10">
    <div class="sv-stack sv-stack--align-center sv-stack--gap-3 sh sh-narrow">
      <p class="sv-eyebrow">The Revenue Trinity</p>
      <h2 id="hp-trinity-heading" class="mx-auto">Three immediate SME wins. One platform.</h2>
      <p class="sh-sub mx-auto">Get paid faster, win the contracts you bid for, and stop losing deals to a missing cyber certificate.</p>
    </div>
    <div class="hp-trinity__grid sv-grid sv-grid--md" role="list">
      <article class="sv-card sv-card--accent hp-trinity__card" role="listitem">
        <div class="hp-trinity__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <p class="sv-card__eyebrow">CrowMark · PPN 002</p>
        <h3 class="sv-card__title">Win the 10% Social Value edge</h3>
        <p class="sv-card__body">Public-sector buyers must apply a minimum 10% Social Value weighting under PPN 002. CrowMark scores your bid against the Oxford Social Value Bank TOMs framework before you submit. Stop losing tenders by 2 points.</p>
        <a href="/crowmark" class="sv-btn sv-btn--sm sv-btn--ghost u-card-cta">Score a bid in 60 seconds <span class="lottie-arrow" data-lottie="arrow-right-stroke" aria-hidden="true"></span></a>
      </article>
      <article class="sv-card sv-card--accent hp-trinity__card" role="listitem">
        <div class="hp-trinity__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p class="sv-card__eyebrow">CrowCyber · PPN 014</p>
        <h3 class="sv-card__title">Your licence to bid</h3>
        <p class="sv-card__body">Without Cyber Essentials, you cannot bid for most public-sector contracts (PPN 014 mandate). CrowCyber walks UK SMEs through the v3.3 Danzell requirements with a free readiness scan and a guided path to certification.</p>
        <a href="/crowcyber" class="sv-btn sv-btn--sm sv-btn--ghost u-card-cta">Check your readiness free <span class="lottie-arrow" data-lottie="arrow-right-stroke" aria-hidden="true"></span></a>
      </article>
      <article class="sv-card sv-card--accent hp-trinity__card" role="listitem">
        <div class="hp-trinity__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <p class="sv-card__eyebrow">CrowCash · Late Payment Act 1998</p>
        <h3 class="sv-card__title">Stop acting as a free bank</h3>
        <p class="sv-card__body">UK SMEs are owed &pound;26B in late invoices. The Late Payment of Commercial Debts (Interest) Act 1998 gives you statutory interest of 8% + Bank Rate. CrowCash computes the exact figure and generates the recovery letter in one click.</p>
        <a href="/crowcash" class="sv-btn sv-btn--sm sv-btn--ghost u-card-cta">Recover your first invoice <span class="lottie-arrow" data-lottie="arrow-right-stroke" aria-hidden="true"></span></a>
      </article>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════
     SECTION 4 — THE SOVEREIGN MOAT
     The Pillar 2 differentiator. Why CrowAgent and not the AI clones.
     Real statute citations, not hallucinations.
     ════════════════════════════════════════════════════════════════════ -->
<section class="hp-moat sv-section sv-section--secondary reveal sf17-reveal" id="sovereign-moat" aria-labelledby="hp-moat-heading">
  <div class="sv-container sv-container--standard sv-stack sv-stack--align-center sv-stack--gap-8">
    <div class="sv-stack sv-stack--align-center sv-stack--gap-3 sh sh-narrow">
      <p class="sv-eyebrow">The Sovereign Moat</p>
      <h2 id="hp-moat-heading" class="mx-auto">Statute-based. Not AI guesswork.</h2>
      <p class="sh-sub mx-auto">Every number CrowAgent surfaces traces to a UK regulation or HM Treasury formula. No black-box LLM hallucinations. Auditable to the section number.</p>
    </div>
    <div class="hp-moat__grid sv-grid sv-grid--md" role="list">
      <div class="hp-moat__row" role="listitem">
        <strong>SI 2015/962 reg 39</strong>
        <span>MEES penalty modelled on rateable value, capped at &pound;150,000. Not a flat figure.</span>
      </div>
      <div class="hp-moat__row" role="listitem">
        <strong>PPN 002 (Feb 2025)</strong>
        <span>10% minimum Social Value weighting in central-government procurement. Verbatim TOMs mapping.</span>
      </div>
      <div class="hp-moat__row" role="listitem">
        <strong>PPN 014 + Cyber Essentials v3.3 Danzell</strong>
        <span>28 Apr 2026 update tracked clause-by-clause. CrowAgent flags non-conformance lines.</span>
      </div>
      <div class="hp-moat__row" role="listitem">
        <strong>Late Payment of Commercial Debts (Interest) Act 1998</strong>
        <span>Statutory interest = 8% + Bank of England base rate. Computed on the invoice day count.</span>
      </div>
      <div class="hp-moat__row" role="listitem">
        <strong>HM Treasury Green Book</strong>
        <span>3.5% NPV discount + Ofgem 2% energy escalation. Investment-grade numbers for board packs.</span>
      </div>
      <div class="hp-moat__row" role="listitem">
        <strong>MHCLG EPC Open Data</strong>
        <span>Live register lookup. Single property or bulk CSV. No stale 2022 data.</span>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════
     SECTION 5 — FUTURE-PROOFING TEASER (Expansion Suite 2027/2028)
     Tease CrowCore (MEES) + CrowESG. Small section, not a primary pillar.
     ════════════════════════════════════════════════════════════════════ -->
<section class="hp-expansion sv-section sv-section--secondary reveal sf17-reveal" id="expansion-suite" aria-labelledby="hp-expansion-heading">
  <div class="sv-container sv-container--standard sv-stack sv-stack--align-center sv-stack--gap-6">
    <div class="sv-stack sv-stack--align-center sv-stack--gap-3 sh sh-narrow">
      <p class="sv-eyebrow">Expansion Suite · 2027 &amp; 2028</p>
      <h2 id="hp-expansion-heading" class="mx-auto">Already on the roadmap.</h2>
      <p class="sh-sub mx-auto">When the long-horizon deadlines become unavoidable, you won't be re-shopping vendors. Two more engines, same platform, same statute discipline.</p>
    </div>
    <div class="hp-expansion__grid sv-grid sv-grid--sm" role="list">
      <article class="sv-card hp-expansion__card" role="listitem">
        <p class="sv-card__eyebrow">CrowCore &middot; MEES 2028 (proposed)</p>
        <h3 class="sv-card__title">Commercial property compliance</h3>
        <p class="sv-card__body">SI 2015/962 reg 39 penalty modelling, EPC band gap analysis, and three costed retrofit scenarios with HM Treasury NPV. Available now &middot; mandatory bite when the proposed Band C 2028 date is enacted.</p>
        <a href="/crowagent-core" class="sv-btn sv-btn--sm sv-btn--ghost u-card-cta">Explore CrowCore <span class="lottie-arrow" data-lottie="arrow-right-stroke" aria-hidden="true"></span></a>
      </article>
      <article class="sv-card hp-expansion__card" role="listitem">
        <p class="sv-card__eyebrow">CrowESG &middot; Q3 2026 waitlist</p>
        <h3 class="sv-card__title">Multi-framework ESG reporting</h3>
        <p class="sv-card__body">GRI Standards 2021, TCFD, post-Omnibus I CSRD/ESRS, ISSB IFRS S1 &amp; S2, and UK SDR. One double-materiality assessment, every framework. Q3 2026 launch.</p>
        <a href="/crowesg" class="sv-btn sv-btn--sm sv-btn--ghost u-card-cta">Join the waitlist <span class="lottie-arrow" data-lottie="arrow-right-stroke" aria-hidden="true"></span></a>
      </article>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════
     SECTION 6 — ENTERPRISE TRUST
     Security, encryption, UK data residency. Tight row, no card sprawl.
     ════════════════════════════════════════════════════════════════════ -->
<section class="hp-enterprise-trust sv-section sv-section--secondary reveal sf17-reveal" aria-labelledby="hp-enterprise-trust-heading">
  <div class="sv-container sv-container--standard sv-stack sv-stack--align-center sv-stack--gap-6">
    <div class="sv-stack sv-stack--align-center sv-stack--gap-3 sh sh-narrow">
      <p class="sv-eyebrow">Enterprise-grade by default</p>
      <h2 id="hp-enterprise-trust-heading" class="mx-auto">Encrypted, UK-resident, ICO-registered.</h2>
    </div>
    <div class="hp-enterprise-trust__row sv-cluster sv-cluster--gap-6" role="list">
      <div class="hp-enterprise-trust__item" role="listitem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>AES-256 at rest</span>
      </div>
      <div class="hp-enterprise-trust__item" role="listitem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>TLS 1.3 in transit</span>
      </div>
      <div class="hp-enterprise-trust__item" role="listitem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>UK + EU data residency</span>
      </div>
      <div class="hp-enterprise-trust__item" role="listitem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <span>UK GDPR compliant</span>
      </div>
      <div class="hp-enterprise-trust__item" role="listitem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        <span>ISO 27001 aligned</span>
      </div>
      <div class="hp-enterprise-trust__item" role="listitem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M20 7 9 18l-5-5"/></svg>
        <span>ICO registered controller</span>
      </div>
    </div>
  </div>
</section>
`;

const css = fs.readFileSync('index.html', 'utf8').split('\n');
console.log('Original line count:', css.length);

// Find the start (line 286 area — hp-audience-band) and end (line 1482 area — just before sv-cta-band)
// Use markers
let startLine = -1, endLine = -1;
for (let i = 0; i < css.length; i++) {
  if (startLine === -1 && css[i].includes('hp-audience-band sv-section')) startLine = i;
  if (startLine !== -1 && css[i].includes('sv-cta-band hp-cta-band')) { endLine = i - 1; break; }
}

if (startLine === -1 || endLine === -1) { console.error('Markers not found:', { startLine, endLine }); process.exit(1); }

// Walk back from startLine to find the section opening tag's enclosing comment if any
// Actually use exact line: take from startLine to endLine (inclusive) as the block to remove
console.log('Replacing lines', startLine + 1, '..', endLine + 1, '(', endLine - startLine + 1, 'lines)');

const before = css.slice(0, startLine);
const after = css.slice(endLine + 1);
const merged = [...before, NEW_SECTIONS, ...after].join('\n');

fs.writeFileSync('index.html', merged);
const newLines = merged.split('\n').length;
console.log('New line count:', newLines, '(diff', newLines - css.length, ')');
