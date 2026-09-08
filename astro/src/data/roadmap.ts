/**
 * roadmap.ts: the phases, the AI notes and the prioritisation method behind
 * /roadmap.
 *
 * ── THE ONE RULE THIS FILE ENCODES ──────────────────────────────────────────
 *
 * OA-13: Phase 3 carried the date pill "Q4 2026" directly above the sentence
 * "Early research, not yet committed engineering". A reader takes the date and
 * ignores the caveat, and the date is what gets quoted back.
 *
 * So `date` is OPTIONAL and `status` is NOT. A phase gets a quarter only when
 * that quarter is a commitment somebody will stand behind; everything else
 * prints its status in words and no date at all. The type makes the honest case
 * the easy one: you have to go out of your way to put a date on research.
 *
 * STATUS IS RENDERED AS TEXT, NEVER AS COLOUR OR OPACITY ALONE. Same rule as
 * the timeline in src/pages/about.astro. A reader who cannot see the dimming,
 * or who is reading the printed page, must still be able to tell a shipped
 * thing from a planned one. WCAG 1.4.1.
 */

export type PhaseStatus = 'live' | 'progress' | 'research';

/** The words a reader sees. Never abbreviated to a colour. */
export const STATUS_LABEL: Record<PhaseStatus, string> = {
  live: 'Live now',
  progress: 'In progress',
  research: 'Researching, not committed',
};

export interface RoadmapItem {
  title: string;
  body: string;
  href?: string;
}

export interface Phase {
  /** "Phase 1", "Later". The name of the band, not its timing. */
  name: string;
  status: PhaseStatus;
  /**
   * A quarter, ONLY where it is committed. Leave undefined for anything that is
   * not, and the page prints "No committed date" instead of a number nobody
   * agreed to. See the note at the top of this file.
   */
  date?: string;
  lead: string;
  items: RoadmapItem[];
}

export const PHASES: Phase[] = [
  {
    name: 'Phase 1',
    status: 'live',
    date: 'Q2 2026',
    /*
     * BODIES REFRESHED 2026-09-08 against what is DEPLOYED, not against what is
     * committed. The owner reported this page as not updated while a great deal
     * had shipped, and they were right: these two paragraphs described CrowMark
     * as it stood months earlier and named none of the bid workspace that went
     * live with R2.7.1 on 24 August, nor the supplier relationship management
     * suite that went live with R2.8.1 on 3 September. Every capability named
     * below resolves to a route on the platform's origin/main, which is the tip
     * Vercel reports READY in production.
     */
    lead: 'CrowMark is in production today, in both variants: for suppliers and for buyers. It reads the source regulation directly, so the output you stand behind traces back to a rule rather than to a model.',
    items: [
      {
        title: 'CrowMark for Suppliers',
        body: 'Contracts Finder and Find a Tender refreshed daily, with prior information notices and framework or dynamic market expiry dates so a pipeline is visible before a tender opens. Upload the whole tender pack and get it briefed rather than read cover to cover. Drafting is grounded in your own submitted bids and answer library, with version history, diff, restore and track changes on every answer. Configurable review gates take bid or no bid as gate zero. Deterministic social-value calculation, post-award delivery evidence, and Procurement Act 2023 s.52 and s.71 KPI checks.',
        href: '/crowmark/',
      },
      {
        title: 'CrowMark for Buyers',
        body:
          "Build and publish requirements against a deterministic social value rubric, then locate the evidence for each one across every response received, quoted verbatim or dropped. CrowMark organises. Your evaluation panel scores. After award it keeps going: the commitments made in the winning bid become a tracked supplier profile, with scorecards, periodic review sessions, a risk radar, concerns and their corrective actions, a benefit and value realisation tracker, and a due diligence workspace.",
        href: '/crowmark-buyers/',
      },
    ],
  },
  {
    /*
     * DELIVERED, AND THE BAND KEEPS ITS QUARTER BECAUSE IT MET IT. This band
     * read `status: 'progress'` against `date: 'Q3 2026'` until 2026-09-08,
     * when both of its items were checked against the platform's own release
     * record rather than against memory. Both had shipped.
     *
     * Passkeys landed in Release 2.6 as WS-8, verified live in a browser on
     * 2026-07-26: enrolment, sign in on app.crowagent.ai, credential
     * management in settings, and an RP ID set to the parent domain so one
     * passkey works across the app and the portal. The `auth.passkeys` flag
     * that gated it has since been dropped, so it is on for every account.
     *
     * THE BODY BELOW DESCRIBES A SECOND FACTOR AND NOT A PASSWORDLESS LOGIN,
     * deliberately. Signing in with a passkey INSTEAD of a password is a
     * different thing, it is not shipped, and this page must not imply it.
     */
    name: 'Phase 2',
    status: 'live',
    date: 'Q3 2026',
    lead: 'Delivered in Q3 2026. Security and access work that builds on CrowMark.',
    items: [
      {
        title: 'Passkeys (WebAuthn)',
        body: 'Windows Hello and Touch ID in place of a typed code, as an alternative second factor on your CrowMark account. One passkey covers the app and the portal, and you can list and revoke your credentials in settings.',
      },
      {
        title: 'Deeper grounded auto-fill (public sector)',
        body: "CrowMark's grounded drafting reads the buyer's own published priorities alongside your uploaded evidence, and proposes social value narratives that cite what they came from for you to approve or edit. The model proposes, you decide.",
      },
    ],
  },
  {
    /*
     * NO DATE, AND THAT IS THE OA-13 FIX. This band used to read "Q4 2026"
     * above a lead that calls the same work uncommitted. The two statements
     * cannot both stand, and the one that had to go is the one a prospect would
     * quote back.
     */
    name: 'Phase 3',
    status: 'research',
    lead: 'Early research, not yet committed engineering. Anchored to live regulation rather than speculation.',
    items: [
      {
        title: 'Regulatory Monitor (public sector)',
        body: 'A live UK public procurement regulatory change feed. Material updates to PPN 026 and the Procurement Act 2023 flow straight into the CrowMark dashboard, so you act, not just read.',
      },
      {
        title: 'Tender reasoning copilot (public sector)',
        body: 'One statute-grounded assistant that reasons across PPN 026 and the Procurement Act 2023 at once, answering bid questions and citing the named regulation behind every line. Retrieval-grounded against the source law, never free-styling the legislation.',
      },
    ],
  },
  {
    /*
     * THE "2027" PILL IS GONE. It sat above "on the radar beyond the next
     * twelve months", which is a horizon rather than a plan, and a year printed
     * next to an item reads as a delivery year however it is hedged. The band
     * is called "Later" and the lead says what later means; that is the timing,
     * and it is the only timing anyone can stand behind for this work.
     */
    name: 'Later',
    status: 'research',
    lead: 'On the radar beyond the next twelve months.',
    items: [
      {
        /*
         * NARROWED, AND THE HALF THAT SHIPPED IS NAMED AS SHIPPED. This item
         * read "Broader SSO (SAML 2.0 / OIDC)" and its body claimed "Microsoft
         * Entra ID SSO is available now on Portfolio". Both halves were wrong
         * in opposite directions:
         *
         *   web/app/api/auth/sso/_lib/saml-config.ts is a PROVIDER-AGNOSTIC
         *   SAML 2.0 Service Provider, shipped, with SCIM 2.0 at
         *   web/app/api/scim/v2/** and DNS domain verification. So SAML 2.0 is
         *   not a 2027 item, and /pricing already publishes it as available,
         *   which left two pages of this site contradicting each other.
         *
         *   No plan is named, because which plan includes single sign-on is a
         *   commercial packaging question the repo cannot answer. pricing.astro
         *   states it with no tier attached for the same reason.
         *
         * OIDC genuinely is not built. That is the part that stays here.
         */
        title: 'Enterprise OIDC connectors',
        body: 'SAML 2.0 single sign-on, with SCIM provisioning and DNS domain verification, is live today and covers any provider that speaks SAML. This adds OIDC as a second protocol for the identity providers that prefer it.',
      },
    ],
  },
];

/** The four "Live today" notes about how the AI is built. */
export const AI_LIVE: { heading: string; body: string; link?: { label: string; href: string } }[] = [
  {
    heading: 'Deterministic engine, then narrative',
    body: 'The numbers come from code, not a model. Social-value scoring and Procurement Act 2023 s.52 and s.71 KPI checks are computed deterministically. The language model is the last step: it turns that computed result into a readable narrative or report draft. It never invents the figure.',
  },
  {
    heading: 'Two models, two jobs',
    body: "Customer-facing drafting (CrowMark bid narratives) runs on Google Gemini. Heavier reasoning and analysis tasks run on Anthropic's Claude. Both are used as data sub-processors under signed DPAs. Your prompts are not used to train their foundation models. The full list is on the",
    link: { label: 'privacy page', href: '/privacy/' },
  },
  {
    heading: 'Grounded in the source law',
    body: 'CrowMark reads the actual regulation it serves: PPN 026, the next edition of the Social Value Model, published 5 August 2026 and applying to central government procurements commenced on or after 1 January 2027 at 1 million pounds inc VAT or above, and the Procurement Act 2023 sections 52 and 71 for delivery KPIs. Outputs cite the named instrument so the claim is auditable rather than asserted.',
  },
  {
    heading: 'A human signs every output',
    body: 'Under Article 22 UK GDPR, CrowAgent makes no solely-automated decision with legal effect about anyone. AI drafts are advisory. You review, edit and approve before a single word reaches a bid, a report or a buyer. The model proposes. You decide.',
  },
];

/** Where the AI work is heading. Status in words, and a date only where committed. */
export const AI_NEXT: { status: PhaseStatus; heading: string; body: string }[] = [
  {
    /*
     * MOVED TO `live` 2026-09-08, AND IT HAD TO MOVE OR THE PAGE CONTRADICTED
     * ITSELF. This entry and the Phase 2 item of the same name are the same
     * piece of work rendered twice on one page. When Phase 2 became delivered,
     * a second block still reading "we are extending" with an indicative Q3
     * date left /roadmap publishing two different answers about one feature.
     * Whichever way that resolves, it cannot stay split.
     */
    status: 'live',
    heading: 'Deeper grounded auto-fill (public sector)',
    body: "Shipped. CrowMark drafts grounded bid answers from your own submitted bids and answer library, and now reads the buyer's own published priorities alongside your uploaded evidence to propose social value narratives, each suggestion citing what it drew on for you to approve or edit.",
  },
  {
    status: 'research',
    heading: 'Tender reasoning copilot (public sector)',
    body: 'Early research, not committed engineering. One assistant that reasons across PPN 026 and the Procurement Act 2023 at once, answering bid questions and citing the named regulation behind every line. It would be retrieval-grounded against the source law, never free-styling the legislation.',
  },
  {
    status: 'research',
    heading: 'Regulatory monitor feed (public sector)',
    body: 'A live UK public procurement regulatory change feed so material updates to PPN 026 and the Procurement Act 2023 surface in the CrowMark dashboard, with the model summarising what changed and what it means for your existing work. Research stage only.',
  },
];

/** How we decide what to ship next. */
export const METHOD: { n: string; heading: string; body: string }[] = [
  {
    n: '01',
    heading: 'Regulatory deadlines',
    body: 'A statutory instrument with a date attached (PPN 026 applying from 1 January 2027, Procurement Act 2023 commencement) earns a slot before anything else.',
  },
  {
    n: '02',
    heading: 'Demand-led',
    body: 'When the same need comes up repeatedly from the teams we talk to, it moves up the plan. We prioritised post-award delivery evidence because Procurement Act 2023 KPI checks were the most-requested capability adjacent to our social value work.',
  },
  {
    n: '03',
    heading: 'Adjacency to a live product',
    body: 'Post-award delivery evidence sits next to bid drafting because the same team that wins the tender also has to prove KPI performance under Procurement Act 2023 sections 52 and 71.',
  },
  {
    n: '04',
    heading: 'Where the edge sits',
    body: 'CrowAgent does not try to out-feature every bid-writing tool on the market. The edge is grounded, statute-cited accuracy.',
  },
];

/** What we will not build. Scope discipline, stated rather than implied. */
export const WONT_BUILD: { heading: string; body: string }[] = [
  {
    heading: 'EPR / WEEE / Packaging Tax',
    body: 'These are real regulations but adjacent to a buyer CrowAgent does not currently serve. Maybe in 2027, but not on the current roadmap.',
  },
  {
    heading: 'Hallucinating AI copilots',
    body: 'Every AI feature in the platform has a deterministic engine underneath. Narrative generation is the last step, never the source.',
  },
];
