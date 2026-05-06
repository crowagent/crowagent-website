# Stripe pricing coordination — crowagent.ai/pricing

**Owner:** Founder / billing
**Sync script:** `scripts/sync-pricing-from-stripe.ts` (run via `npm run sync-pricing`)
**Authoritative spec:** MP1 §A4 (`crowagent-platform/specs/CrowAgent_UX_Spec_Steps_2_3.md` lines 757–759)
**Lookup-key scheme:** `crowagent_<product>_<tier>_<cadence>` (CLAUDE.md §"Non-Negotiables")
**Stripe sandbox account:** `acct_1TB3N8En1snLP2fA` ("Crowagent sandbox")

## How sync works

1. The script lists every active Stripe Price whose `lookup_key LIKE 'crowagent_%'`.
2. It groups by `(product, tier, cadence)` per the lookup-key convention.
3. It rewrites the per-tier price cards on `pricing.html` between
   `<!-- BEGIN_PRICING_CARDS -->` and `<!-- END_PRICING_CARDS -->`.
4. It is **idempotent** — re-running on unchanged Stripe data produces a
   byte-identical `pricing.html`. A no-op run logs `No price changes`.
5. The annual price displayed is **always** `round(monthly × 0.9)` — MP1 §A4
   says "annual saves 10%, never 20%". If Stripe returns a different annual
   amount, the script logs a warning and uses the policy figure (so the
   marketing page can never advertise a discount that disagrees with policy).

## Required Stripe prices — one row per `lookup_key`

Each row below MUST exist in Stripe sandbox. Total: **24 lookup keys**
(4 paid products × 3 tiers × 2 cadences). CrowESG is waitlist-only and has
no Stripe prices.

`Annual amount` is the **full annual charge** (Stripe's `unit_amount` for the
yearly price), which equals `monthly × 12 × 0.9`.

### CrowAgent Core (commercial property compliance)

| lookup_key                              | tier      | cadence | Monthly (GBP) | Annual amount (GBP) |
|-----------------------------------------|-----------|---------|---------------|---------------------|
| `crowagent_core_starter_monthly`        | Starter   | monthly | £149          | —                   |
| `crowagent_core_starter_annual`         | Starter   | annual  | —             | £1,608  (134×12)    |
| `crowagent_core_pro_monthly`            | Pro       | monthly | £299          | —                   |
| `crowagent_core_pro_annual`             | Pro       | annual  | —             | £3,228  (269×12)    |
| `crowagent_core_portfolio_monthly`      | Portfolio | monthly | £599          | —                   |
| `crowagent_core_portfolio_annual`       | Portfolio | annual  | —             | £6,468  (539×12)    |

### CrowMark (PPN 002 social value)

| lookup_key                              | tier      | cadence | Monthly (GBP) | Annual amount (GBP) |
|-----------------------------------------|-----------|---------|---------------|---------------------|
| `crowagent_crowmark_solo_monthly`       | Solo      | monthly | £99           | —                   |
| `crowagent_crowmark_solo_annual`        | Solo      | annual  | —             | £1,068  (89×12)     |
| `crowagent_crowmark_team_monthly`       | Team      | monthly | £149          | —                   |
| `crowagent_crowmark_team_annual`        | Team      | annual  | —             | £1,608  (134×12)    |
| `crowagent_crowmark_agency_monthly`     | Agency    | monthly | £399          | —                   |
| `crowagent_crowmark_agency_annual`      | Agency    | annual  | —             | £4,308  (359×12)    |

### CrowCyber (Cyber Essentials co-pilot)

| lookup_key                                  | tier        | cadence | Monthly (GBP) | Annual amount (GBP) |
|---------------------------------------------|-------------|---------|---------------|---------------------|
| `crowagent_crowcyber_starter_monthly`       | Starter     | monthly | £99           | —                   |
| `crowagent_crowcyber_starter_annual`        | Starter     | annual  | —             | £1,068  (89×12)     |
| `crowagent_crowcyber_pro_monthly`           | Pro         | monthly | £199          | —                   |
| `crowagent_crowcyber_pro_annual`            | Pro         | annual  | —             | £2,148  (179×12)    |
| `crowagent_crowcyber_enterprise_monthly`    | Enterprise  | monthly | £399          | —                   |
| `crowagent_crowcyber_enterprise_annual`     | Enterprise  | annual  | —             | £4,308  (359×12)    |

### CrowCash (AI credit control)

| lookup_key                                | tier        | cadence | Monthly (GBP) | Annual amount (GBP) |
|-------------------------------------------|-------------|---------|---------------|---------------------|
| `crowagent_crowcash_starter_monthly`      | Starter     | monthly | £79           | —                   |
| `crowagent_crowcash_starter_annual`       | Starter     | annual  | —             | £852    (71×12)     |
| `crowagent_crowcash_pro_monthly`          | Pro         | monthly | £179          | —                   |
| `crowagent_crowcash_pro_annual`           | Pro         | annual  | —             | £1,932  (161×12)    |
| `crowagent_crowcash_enterprise_monthly`   | Enterprise  | monthly | £349          | —                   |
| `crowagent_crowcash_enterprise_annual`    | Enterprise  | annual  | —             | £3,768  (314×12)    |

### CrowESG — waitlist only

CrowESG launches Q3 2026. **Do not create Stripe prices yet.** The waitlist
CTA on `pricing.html` points users at the marketplace waitlist form; pricing
will be announced ahead of launch (per MP1 §A4 and the on-page note).

### Free / Enterprise / Bundle

Marketing-only — no Stripe price needed:

* **Free tier (CSRD Checker)** — no account required, no Stripe SKU.
* **Enterprise** ("from £999/mo") — bespoke deals quoted by sales; the
  marketing page links to `/contact` rather than checkout.
* **Multi-product bundle (–15%)** — applied as a Stripe Coupon at checkout
  (`crowagent_bundle_15pct`) when an org subscribes to ≥2 paid products. This
  does **not** require additional Price objects.

## Verification checklist (run before any pricing release)

1. From any clone of this repo:
   ```bash
   export STRIPE_SECRET_KEY=sk_test_...   # sandbox sk_test_, never sk_live_
   npm run sync-pricing -- --dry-run
   ```
   Read the structured logs and confirm:
   - `change_count: 0` → pricing.html is in sync, OR
   - The listed `changes` are intended.
2. The script logs a **warning** for every missing lookup_key. Resolve every
   warning before promoting to live mode. Expected zero warnings on a healthy
   sandbox.
3. If the script logs `Annual price drift for ...`, the Stripe annual price
   disagrees with MP1 §A4's "10% off" policy. Pick one:
   - Update the Stripe annual Price object so it equals `monthly × 12 × 0.9`,
     then re-run, OR
   - Get explicit founder approval to change the marketing copy ("Save 10%"
     → whatever Stripe says) and update MP1 §A4 first.
4. After a sync, diff `pricing.html` and eyeball the 12 paid cards.

## Known coordination blockers (2026-05-06)

* **Anthropic Stripe MCP cannot dry-run sandbox.** The Stripe MCP server in
  this Claude environment authenticates to a different account
  (`acct_1TB3MxILkzuI7dCV` "Crowagent Ltd") per
  `~/.claude/.../reference_stripe_two_accounts.md`, so it cannot list
  sandbox Prices. Verification of the 24-row inventory above must be done
  by the user (or by a CI job with the sandbox `sk_test_` key). The script
  itself is the canonical verifier — run it in `--dry-run` mode and read
  the logs.
* **`stripe` and `tsx` are not currently in `package.json` devDependencies.**
  Running `npm run sync-pricing` requires installing them first:
  ```bash
  npm install --save-dev stripe@^14 tsx@^4
  ```
  This was deferred from the previous agent session; the script itself works
  with any reasonably recent Stripe SDK that exposes `prices.list`.

## Change log

* **2026-05-06** — Coordination doc created (#45). Script extended to update
  `pricing.html` in-place between marker comments while preserving the
  legacy JSON snapshot mode behind `--json`.
