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
 * ── SIBLING COPY, AND IT SHOULD BE DELETED ──────────────────────────────────
 *
 * src/components/sections/Integrations.astro carries its own copy of the six
 * read-only sources for the homepage chip grid. It predates this file and was
 * out of scope for the pass that added /integrations, so the two are duplicated
 * on purpose and stated here rather than left to be discovered. They agree
 * today, name for name and scope for scope. The next person to touch that
 * component should import SOURCES from here and delete its local array; until
 * then, a correction made in one place has to be made in both.
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
  /** A vector mark from the existing brand set, or undefined for a plain dot. */
  logo?: string;
}

const MS = '/Assets/brand/integrations/color-microsoft.svg';

/**
 * DOCUMENT SOURCES — read, never written.
 *
 *   SharePoint   api/app/services/content_sources.py:953  scopes=("Sites.Read.All",)
 *   OneDrive     content_sources.py:1006                  scopes=("Files.Read.All",)
 *   Confluence   content_sources.py:1060                  an API token that inherits
 *                the issuing user's own permissions; no OAuth app is registered and
 *                no permission is escalated.
 *
 * content_sources.py:93 holds exactly these three. There is no fourth.
 */
export const SOURCES: Connector[] = [
  {
    name: 'SharePoint',
    scope: 'Sites.Read.All',
    note: 'A Microsoft Graph application permission your tenant administrator grants. It reads site content and cannot change it.',
    logo: MS,
  },
  {
    name: 'OneDrive for Business',
    scope: 'Files.Read.All',
    note: 'The same tenant-granted Graph permission, over files rather than sites. Personal OneDrive accounts are not supported.',
    logo: MS,
  },
  {
    name: 'Confluence Cloud',
    scope: 'Your own permissions',
    note: 'An API token issued by you. It inherits exactly the spaces your own account can already open, and nothing is escalated.',
  },
];

/**
 * IDENTITY — sign-in only. Nothing is written back to a directory.
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
export const IDENTITY: Connector[] = [
  {
    name: 'Okta',
    scope: 'SAML 2.0, sign-in only',
    note: 'Entity ID, sign-on URL and signing certificate. The assertion says who is signing in.',
    logo: '/Assets/brand/integrations/color-okta.svg',
  },
  {
    name: 'Microsoft Entra ID',
    scope: 'SAML 2.0, sign-in only',
    note: 'Configured the same way as every other provider, with no Entra-specific path in the code.',
    logo: '/Assets/brand/integrations/color-microsoft-entra-id.svg',
  },
  {
    name: 'Google Workspace',
    scope: 'SAML 2.0, sign-in only',
    note: 'A custom SAML app in the Google admin console, pointed at the metadata URL we publish.',
    logo: '/Assets/brand/integrations/color-google.svg',
  },
  {
    name: 'Ping Identity',
    scope: 'SAML 2.0, sign-in only',
    note: 'Same three fields. Signed assertions are required and unsigned ones are rejected.',
    logo: '/Assets/brand/integrations/color-ping-identity.svg',
  },
  {
    name: 'OneLogin',
    scope: 'SAML 2.0, sign-in only',
    note: 'Same three fields. No app listing to install and nothing to approve on our side.',
  },
  {
    name: 'Any SAML 2.0 provider',
    scope: 'SAML 2.0, sign-in only',
    note: 'Including a self-hosted identity provider. If it issues a signed SAML 2.0 assertion, it works.',
  },
];

/**
 * OUTBOUND — these WRITE, and they are never listed under a read-only claim.
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
    logo: '/Assets/brand/integrations/color-slack.svg',
  },
  {
    name: 'Microsoft Teams',
    scope: 'ChannelMessage.Send',
    note: 'Sends a message into the channel you pick. It cannot change a setting in your tenant.',
    logo: '/Assets/brand/integrations/color-microsoft-teams.svg',
  },
  {
    name: 'Google Drive',
    scope: 'drive.file',
    note: 'Creates the export files it writes, and can open no other file in your Drive.',
    logo: '/Assets/brand/integrations/color-google-drive.svg',
  },
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
