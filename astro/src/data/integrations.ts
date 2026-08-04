/**
 * integrations.ts — what CrowMark actually connects to, and the evidence for
 * each line.
 *
 * ── WHY THIS FILE EXISTS RATHER THAN LIVING IN THE PAGE ─────────────────────
 *
 * OA-10: `integrations.html` claimed "Read-only throughout" in the same
 * sentence as "route alerts to your channels", and named connectors that are
 * not built. The failure was not the wording. It was that the page was a list
 * of logos with no record of where any of it came from, so nobody reviewing it
 * could tell a shipped connector from an aspiration.
 *
 * Every entry below therefore carries the file in the platform repo that
 * evidences it. ANYTHING ADDED HERE NEEDS THE SAME KIND OF LINE. If a
 * connector's scope cannot be pointed at in the repo, it does not belong in
 * these arrays, and the honest move is to leave it off rather than to soften
 * the claim around it.
 *
 * ── THE ONE RULE THIS FILE ENFORCES BY ITS SHAPE ────────────────────────────
 *
 * SOURCES and OUTBOUND are two arrays and must never become one. A source is
 * something we READ. An outbound connector WRITES: it posts a message or
 * creates a file. A single list with a "read only" claim over it is exactly the
 * defect OA-10 recorded, and merging them would recreate it in one edit.
 *
 * ── ONE OBJECT PER VENDOR, REFERENCED FROM EVERY LIST IT APPEARS IN ─────────
 *
 * This file used to say, in as many words, that
 * src/components/sections/Integrations.astro carried its own copy of the six
 * homepage chips and that "the next person to touch that component should
 * import SOURCES from here and delete its local array". That was done on
 * 2026-08-04, and the reason it had to be done is worth keeping, because a
 * duplicate list does not fail loudly — it drifts.
 *
 * Measured at the moment the copies were merged, they had ALREADY drifted, in
 * exactly the way that matters here. The homepage said "Confluence"; this file
 * said "Confluence Cloud". It said "OneDrive"; this file said "OneDrive for
 * Business". It said "Entra ID SSO"; this file said "Microsoft Entra ID". Those
 * are not stylistic differences. Confluence Cloud and Confluence Data Center are
 * different products with different connection models, and personal OneDrive is
 * not supported at all — the note on that entry says so. Two lists meant the
 * site named the same three connectors two different ways on two pages, and
 * nothing could see it.
 *
 * So a vendor is now ONE object, declared once and pushed into every list it
 * belongs to. `SHAREPOINT` is the same object in SOURCES and in HOME_CHIPS, not
 * a matching copy. A correction to its name, its scope or its mark lands
 * everywhere by construction, and there is no second place left to forget.
 *
 * ── THE MARKS ───────────────────────────────────────────────────────────────
 *
 * Every `logo` path below is another company's registered trade mark and is
 * recorded, file by file, in Assets/brand/integrations/LOGO-PROVENANCE.md:
 * where it came from, when, and under what permission.
 *
 * scripts/check-vendor-logos.js FAILS THE BUILD if a path referenced here has
 * no row in that record, or if a row names a file that is not on disk. Adding a
 * mark therefore means recording it. That gate exists because the previous
 * state of this file is the reason it is needed: several marks here are the
 * wrong generation, one stands in for two products that have their own marks,
 * and nobody could tell, because there was nothing to tell it from.
 *
 * READ THE OPEN ITEMS IN THAT RECORD BEFORE CHANGING ANY `logo` LINE.
 *
 * ── SIX MARKS WERE WITHDRAWN ON 2026-08-04, AND THE RULE IS ABOUT ACCURACY ──
 *
 * A-38. Six connectors below used to carry a mark that was not the vendor's
 * current mark for the named product: SharePoint and OneDrive drew the Microsoft
 * CORPORATE symbol, Google Workspace drew the Google "G", and the Teams, Okta and
 * Ping Identity files were generations their vendors have retired. Each was
 * re-checked against the vendor's own brand channel that day and not one can be
 * corrected from an official source at the size this design needs — Okta
 * publishes no colour symbol, Ping publishes no downloadable asset at all,
 * Microsoft's current product icons are behind a licence, and Google publishes no
 * standalone Workspace glyph. The evidence for each is quoted in the record.
 *
 * So they show no mark and are identified BY NAME, which is what they already
 * were: every chip and every row prints `name` in text beside the icon slot, so
 * nothing a reader can use has been lost. Microsoft's own guidance names this as
 * the sanctioned alternative in as many words — a third party may write that its
 * product works with Microsoft Teams and may not draw the Teams icon.
 *
 * THE RULE IS "THE VENDOR'S CURRENT MARK FOR THE NAMED PRODUCT, OR NONE", AND IT
 * IS APPLIED BY ITS OWN TERMS. Two marks that are also served without a licence —
 * Microsoft Entra ID and Google Drive — are the vendor's correct current artwork,
 * so the accuracy rule does not reach them and they stay. Their permission
 * question is unchanged and is still open item 1 for the owner. Mixing the two
 * questions would make the withdrawal look like a legal opinion, and it is not
 * one: it is this file refusing to print a mark that is wrong.
 */

export interface Connector {
  /** As a security reviewer would name it. */
  name: string;
  /**
   * The actual OAuth scope, or the actual mechanism, quoted as it appears in
   * the platform repo. NOT the words "read only", and NOT marketing copy. A
   * scope is checkable; a caption is an assertion.
   */
  scope: string;
  /** One line of what that scope means in practice. */
  note: string;
  /**
   * A vector mark from the existing brand set, or undefined for a plain dot.
   *
   * UNDEFINED IS A VALID AND SOMETIMES CORRECT ANSWER. Both components render a
   * neutral token-coloured dot in the full icon slot when this is absent, and
   * that is deliberately not a placeholder to be filled in at the first
   * opportunity — it is what an unobtainable mark is supposed to look like. An
   * invented, traced or icon-pack mark is a fabricated brand asset.
   *
   * Every value here must appear in Assets/brand/integrations/LOGO-PROVENANCE.md.
   */
  logo?: string;
}

const LOGOS = '/Assets/brand/integrations';

/* ── DOCUMENT SOURCES — read, never written ──────────────────────────────────
 *
 *   SharePoint   api/app/services/content_sources.py:953  scopes=("Sites.Read.All",)
 *   OneDrive     content_sources.py:1006                  scopes=("Files.Read.All",)
 *   Confluence   content_sources.py:1060                  an API token that inherits
 *                the issuing user's own permissions; no OAuth app is registered and
 *                no permission is escalated.
 *
 * content_sources.py:93 holds exactly these three. There is no fourth.
 */

/* No mark. This used to draw the Microsoft CORPORATE symbol, which says "a
   Microsoft product" — true, and not what a logo slot is for. SharePoint's own
   mark is three teal circles and OneDrive's is a blue cloud; neither is
   obtainable outside the licensed channel, so both products are named in text
   and the slot holds the neutral dot. Withdrawal 1 and 2 in LOGO-PROVENANCE.md. */
const SHAREPOINT: Connector = {
  name: 'SharePoint',
  scope: 'Sites.Read.All',
  note: 'A Microsoft Graph application permission your tenant administrator grants. It reads site content and cannot change it.',
};

const ONEDRIVE: Connector = {
  name: 'OneDrive for Business',
  scope: 'Files.Read.All',
  note: 'The same tenant-granted Graph permission, over files rather than sites. Personal OneDrive accounts are not supported.',
};

/**
 * CONFLUENCE CLOUD, AND THE NAME IS LOAD-BEARING.
 *
 * "Confluence" is a family. Confluence Cloud and Confluence Data Center are
 * different products with different connection models, and content_sources.py
 * connects to the Cloud REST API with a user-issued API token. The homepage used
 * to print the bare family name; this is the product.
 *
 * The mark was missing entirely until 2026-08-04 — this entry carried no `logo`,
 * so both surfaces drew the neutral dot beside a name that has a perfectly
 * obtainable official mark. It is now Atlassian's own current Confluence icon,
 * unmodified, served under the permission Atlassian publishes for exactly this
 * use. See LOGO-PROVENANCE.md.
 */
const CONFLUENCE: Connector = {
  name: 'Confluence Cloud',
  scope: 'Your own permissions',
  note: 'An API token issued by you. It inherits exactly the spaces your own account can already open, and nothing is escalated.',
  logo: `${LOGOS}/color-confluence.svg`,
};

export const SOURCES: Connector[] = [SHAREPOINT, ONEDRIVE, CONFLUENCE];

/* ── IDENTITY — sign-in only. Nothing is written back to a directory ─────────
 *
 * The Service Provider is provider-agnostic SAML 2.0, built on @node-saml/node-saml:
 *   web/app/api/auth/sso/_lib/saml-config.ts:9  "provider-agnostic SAML 2.0
 *   Service Provider", identifierFormat null, wantAssertionsSigned true.
 *   Routes: web/app/api/auth/sso/[org]/{login,acs,metadata}/route.ts
 *   SCIM 2.0: web/app/api/scim/v2/**  (Users, Groups, ServiceProviderConfig)
 *   Domain verification: web/lib/auth/domain-verification.ts
 *
 * THE SCOPE LINE IS THE SAME FOR ALL SIX AND THAT IS THE POINT. There is no
 * per-provider integration to differ: the admin form takes an entity ID, a
 * sign-on URL and a certificate, so a provider is supported because it speaks
 * SAML 2.0 rather than because we wrote code for it.
 */

const OKTA: Connector = {
  name: 'Okta',
  scope: 'SAML 2.0, sign-in only',
  note: 'Entity ID, sign-on URL and signing certificate. The assertion says who is signing in.',
  /* No mark. The plain ring served here was not an official asset at all: Okta's
     current mark is the faceted "aura", and Okta's press room publishes only a
     black-and-white wordmark pack. Named in text instead. Withdrawal 5. */
};

const ENTRA: Connector = {
  name: 'Microsoft Entra ID',
  scope: 'SAML 2.0, sign-in only',
  note: 'Configured the same way as every other provider, with no Entra-specific path in the code.',
  /* No mark. WITHDRAWN 2026-08-04 BY OWNER DECISION ON A-37, and this one was
     the last Microsoft mark still served. It was the vendor's correct current
     artwork, which is exactly why it survived the earlier withdrawals — and
     correct artwork is not the same thing as licensed artwork. A Microsoft
     licence is generally required, the symbol and logotype must be used
     together where we used the symbol alone, and this file comes from a pack
     whose terms exclude marketing use.
     THE DECISION WAS NOT TO SEEK A LICENCE. The conversion value of these
     logos is near zero, CrowAgent is already on record in a UK IPO dispute,
     and a second file of unlicensed third-party marks is the last thing that
     should be discoverable. Nominative use in TEXT is the low-risk form and
     loses a reader nothing: the name still says which product this is.
     LOGO-PROVENANCE.md keeps the audit record. Withdrawal 7. */
};

const GOOGLE_WORKSPACE: Connector = {
  name: 'Google Workspace',
  scope: 'SAML 2.0, sign-in only',
  note: 'A custom SAML app in the Google admin console, pointed at the metadata URL we publish.',
  /* No mark. This drew the Google corporate "G", which refers to Google the
     company rather than to Workspace, and Google's brand guidance says in terms
     not to use the G in a business's marketing materials. Workspace itself has
     no standalone glyph to use instead. Named in text. Withdrawal 3. */
};

const PING: Connector = {
  name: 'Ping Identity',
  scope: 'SAML 2.0, sign-in only',
  note: 'Same three fields. Signed assertions are required and unsigned ones are rejected.',
  /* No mark. The white "Ping" knocked out of a red square is the pre-2023 mark,
     and Ping publishes no downloadable brand asset at all — the only current
     colour file it serves is the horizontal lockup in its own site chrome, whose
     square cannot be extracted without deconstructing the lockup. Withdrawal 6. */
};

const ONELOGIN: Connector = {
  name: 'OneLogin',
  scope: 'SAML 2.0, sign-in only',
  note: 'Same three fields. No app listing to install and nothing to approve on our side.',
};

const ANY_SAML: Connector = {
  name: 'Any SAML 2.0 provider',
  scope: 'SAML 2.0, sign-in only',
  note: 'Including a self-hosted identity provider. If it issues a signed SAML 2.0 assertion, it works.',
};

export const IDENTITY: Connector[] = [OKTA, ENTRA, GOOGLE_WORKSPACE, PING, ONELOGIN, ANY_SAML];

/* ── OUTBOUND — these WRITE, and they are never listed under a read-only claim ─
 *
 *   Slack         web/lib/connectors/providers.ts:103
 *                 ["chat:write", "chat:write.public", "channels:read"]. Posts via
 *                 chat.postMessage.
 *   Teams         providers.ts:118-126, including "ChannelMessage.Send". Sends into
 *                 a channel.
 *   Google Drive  providers.ts:138-145, "drive.file", commented in that file as
 *                 "access ONLY to files this app creates". Narrow, but still a
 *                 write: the connector's whole job is export.
 *
 * CONNECTOR_PROVIDER_CONFIG (providers.ts:94-154) holds exactly these three.
 */
export const OUTBOUND: Connector[] = [
  {
    name: 'Slack',
    scope: 'chat:write',
    note: 'Posts a message into the channel you authorise. It does not read your history or your files.',
    logo: `${LOGOS}/color-slack.svg`,
  },
  {
    name: 'Microsoft Teams',
    scope: 'ChannelMessage.Send',
    note: 'Sends a message into the channel you pick. It cannot change a setting in your tenant.',
    /* No mark. The file served here is one generation behind Microsoft's October
       2025 app-icon refresh, and the current one is licence-gated. Microsoft's
       own guidance names the alternative taken here: a third party may write
       that its product works with Microsoft Teams. Withdrawal 4. */
  },
  {
    name: 'Google Drive',
    scope: 'drive.file',
    note: 'Creates the export files it writes, and can open no other file in your Drive.',
    /* No mark. WITHDRAWN 2026-08-04 BY OWNER DECISION ON A-37, the last Google
       mark still served. Like Entra above it was the vendor's correct current
       artwork; unlike the corporate "G" withdrawn earlier under Withdrawal 3,
       there was no guidance sentence forbidding it outright. It goes anyway,
       and the reason is the decision rather than the artwork: marketing use of
       a Google product mark wants a co-branding arrangement, and none is held.
       Naming the product in text is the form that needs no permission.
       Withdrawal 8. */
  },
];

/**
 * THE HOMEPAGE CHIP GRID — the same six objects, not six matching copies.
 *
 * Three read-only document sources and the three identity providers a UK
 * enterprise buyer is most likely to run. It is a SELECTION from the two arrays
 * above and never a separate list: every entry below is a reference to a const
 * declared earlier in this file, so a name, a scope or a mark corrected once is
 * corrected on both surfaces. See the header note on what happened when this was
 * two arrays.
 *
 * SIX, NOT NINE, AND THAT IS THE OA-10 CORRECTION MADE VISIBLE. The Figma frame
 * draws nine chips, each captioned "read only". Building nine would put that
 * caption under Slack, Teams and Google Drive, which write.
 *
 * ZAPIER AND MAKE ARE WITHHELD, AND THE REASON RECORDED HERE UNTIL 2026-08-04
 * WAS FALSE. It said "no connector exists at all". A Zapier connector DOES
 * exist: `api/app/routers/zapier.py` in crowagent-platform, mounted in main.py
 * at `/api/v1/core/zapier`. Verified on 2026-08-04, both that the file is there
 * and that the router is included, because the whole point of this correction is
 * not to replace one unchecked sentence with another.
 *
 * THE REAL REASON THE CHIP IS OFF is that a chip on this grid says a reader can
 * go and use the thing, and that is a claim about the ZAPIER DIRECTORY rather
 * than about our code: the app has not been confirmed as published there, and an
 * integration nobody can find is not an integration a marketing page may offer.
 * Restore the chip in both trees on the day the directory listing is confirmed.
 *
 * WHY THE DISTINCTION IS WORTH THIS MANY WORDS. Withholding the chip was the
 * right call and it is unchanged; only the justification was wrong. A data file
 * that states something untrue about the codebase is read as ground truth by
 * whoever comes next, and acted on — this is directive W8, no
 * justification-by-assertion, and O-39 is the case that produced it.
 *
 * Make is genuinely unbuilt; there is no router for it. Six is the length the
 * evidence supports. Do not restore the other three from the design file.
 *
 * THE ORDER IS THE READING ORDER AND THE LIGHT FOLLOWS IT. The chip specular
 * runs across the grid a sixth of a beat apart in DOM order, so reordering this
 * array reorders the animation with it. That is the intended coupling.
 */
export const HOME_CHIPS: Connector[] = [
  SHAREPOINT,
  ONEDRIVE,
  CONFLUENCE,
  ENTRA,
  OKTA,
  GOOGLE_WORKSPACE,
];

/**
 * AUTOMATION RULES — trigger, condition, action.
 *
 * api/app/services/workflow_engine.py is the catalogue and
 * api/app/services/workflow_executor.py runs it. The UI is the five-step wizard
 * in web/src/features/workflows/WorkflowBuilder.tsx.
 *
 * ONLY ONE TRIGGER IS NAMED HERE AND THAT IS DELIBERATE. AVAILABLE_TRIGGERS
 * (workflow_engine.py:23-41) defines three, and two of them carry
 * `executable: False`. A trigger that cannot fire is not a feature a reader can
 * use, so `contract.narrative_generated` and `report.generated` are left off
 * rather than listed with a caveat. The deadline sweep is real and scheduled:
 * api/app/tasks/scheduler.py:2346, daily at 04:00 UTC.
 *
 * All three ACTIONS carry `executable: True` (workflow_engine.py:43-68).
 */
export const RULE_STEPS: { label: string; heading: string; body: string }[] = [
  {
    label: 'Trigger',
    heading: 'An event fires',
    body: 'A tender deadline is approaching. CrowMark sweeps for them once a day and fires the rules that match.',
  },
  {
    label: 'Conditions',
    heading: 'Filters you set',
    body: 'How many days before the deadline you want to hear about it: 7, 14, 30, 60 or 90.',
  },
  {
    label: 'Action',
    heading: 'What happens next',
    body: 'Post to a webhook, send an email, or raise an in-app alert to the owner you name.',
  },
];
