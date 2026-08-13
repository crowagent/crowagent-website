---
title: "Accessibility | CrowAgent"
description: "CrowAgent's accessibility statement: what we have tested against WCAG 2.2 AA, the results, what we have not yet tested, and how to report a barrier."
heading: "What we have tested, and what we have not."
eyebrow: "Accessibility"
lastUpdated: "9 August 2026"
---

This statement covers the CrowAgent marketing website at [crowagent.ai](https://crowagent.ai/). The CrowAgent application at `app.crowagent.ai` is a separate product and is **not** covered here; a statement for it will be published separately rather than implied by this one.

## Conformance status

**Partially conformant with WCAG 2.2 level AA.**

We describe it as *partially* conformant deliberately. Automated testing across the site currently finds **no violations at any severity**, but automated tools detect only a portion of the WCAG success criteria. The remainder need manual and assistive-technology testing, and we have not completed that yet. Claiming full conformance on automated evidence alone would overstate what we have actually measured.

## What we tested, and what we found

Testing was run on **9 August 2026** against the live site, not a staging copy.

<div class="prose-scroll" role="region" aria-label="What we tested (table)" tabindex="0"><table> <caption>What we tested</caption> <thead> <tr><th scope="col">what</th><th scope="col">scope</th><th scope="col">result</th></tr> </thead> <tbody> <tr><td>axe-core, serious and critical issues</td><td>13 key pages × Chromium, Firefox, WebKit</td><td><strong>39 / 39 passed</strong></td></tr> <tr><td>axe-core, <strong>every</strong> issue at <strong>any</strong> severity</td><td>every built route, Chromium</td><td><strong>45 / 45 passed</strong></td></tr> </tbody> </table></div>

Tooling: [axe-core](https://github.com/dequelabs/axe-core) driven through Playwright, run against `https://crowagent.ai`. The checks run as part of our build process, so a regression fails the build rather than waiting to be noticed.

## What we have NOT tested

We are listing these because their absence is the reason this statement does not claim full conformance:

- **Manual keyboard-only navigation** of every interactive component.
- **Screen readers**: NVDA, JAWS and VoiceOver.
- **Text resizing and reflow** beyond what automated checks cover, including 400% zoom.
- **Testing with disabled users.** No automated tool substitutes for this, and we have not yet arranged it.
- WCAG 2.2 criteria that are not machine-detectable, which includes several added in 2.2.

Until those are done, there may be barriers on this site that our testing has not surfaced. If you hit one, we would rather hear about it than have you assume we already know.

## Reporting a barrier

If any part of this site prevents you from doing something, tell us:

- Use the [contact form](/contact/), or
- Email **hello@crowagent.ai**

Please include the page address and what you were trying to do. We aim to respond within **5 working days**. If you need something on this site in a different format, ask and we will tell you honestly whether and when we can provide it.

## Enforcement

The Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 apply to public sector bodies. **CrowAgent Ltd is a private supplier and is not a public sector body**, so those regulations do not bind this site. We publish this statement because accessibility matters to our users and because our public sector customers reasonably ask suppliers for one, not because we are legally required to.

Our obligations under the **Equality Act 2010** to make reasonable adjustments do apply, and we take them seriously. If you are dissatisfied with how we respond to an accessibility complaint, you can contact the [Equality Advisory and Support Service (EASS)](https://www.equalityadvisoryservice.com/).

## Preparation of this statement

This statement was prepared on **9 August 2026** and reflects testing carried out on that date. It was based on our own evaluation using the automated tooling described above. It has **not** been independently audited by a third party, and we will say so here until it has been.

We will update this statement when the outstanding testing is complete, and we will change the conformance claim only when the evidence changes, not before.
