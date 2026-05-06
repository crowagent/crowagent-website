/**
 * sync-pricing-from-stripe.ts
 *
 * MP1 §A4 + REQ-MP1-PRICING-SYNC — Pricing-sync script for the static
 * marketing site (crowagent.ai/pricing).
 *
 * Pulls all active Stripe Prices whose `lookup_key` matches `crowagent_*`
 * and updates the static `pricing.html` between the
 *   <!-- BEGIN_PRICING_CARDS --> ... <!-- END_PRICING_CARDS -->
 * markers in-place. The legacy JSON snapshot mode (used by the platform
 * marketing surface) is preserved behind --json.
 *
 * Lookup-key convention (CLAUDE.md §"Non-Negotiables"):
 *   crowagent_<product-slug>_<tier>_<interval>
 *     product-slug: core | crowmark | csrd | crowcyber | crowcash | crowesg
 *     tier:         starter | pro | portfolio | agency | solo | team | enterprise | free
 *     interval:     monthly | annual
 *
 * Examples:
 *   crowagent_core_starter_monthly        → core/starter monthly
 *   crowagent_crowmark_team_annual        → crowmark/team annual
 *
 * Idempotent: re-running on unchanged Stripe data produces a byte-identical
 * pricing.html (and prices.json in --json mode).
 *
 * Env:
 *   STRIPE_SECRET_KEY  — sk_test_* (sandbox) or sk_live_* (production).
 *                        Read-only price.list is the only API call made; no writes.
 *
 * CLI flags:
 *   --dry-run            Print what would change without writing files.
 *   --html               Update pricing.html (DEFAULT).
 *   --json               Write the JSON snapshot instead (legacy platform mode).
 *   --html-path=<path>   Override pricing.html location (default: ./pricing.html).
 *   --out=<path>         Override JSON output path (default: app/(marketing)/pricing/_data/prices.json).
 *
 * Usage:
 *   npm run sync-pricing             # updates pricing.html
 *   npm run sync-pricing -- --dry-run
 *   npm run sync-pricing -- --json   # legacy JSON snapshot mode
 *
 * Exit codes:
 *   0  success (or dry-run printed)
 *   1  missing STRIPE_SECRET_KEY
 *   2  Stripe API error
 *   3  filesystem error
 *   4  marker block missing in pricing.html (--html mode)
 */

import Stripe from "stripe";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";

type Interval = "monthly" | "annual";

interface MoneyShape {
  amount: number;
  currency: string;
  lookup_key: string;
  price_id: string;
  unit_amount_decimal: string | null;
}

interface TierShape {
  monthly?: MoneyShape;
  annual?: MoneyShape;
}

interface ProductShape {
  tiers: Record<string, TierShape>;
}

interface PricesFile {
  generated_at: string;
  source: "stripe";
  stripe_mode: "test" | "live";
  products: Record<string, ProductShape>;
}

// ---------- helpers ----------

const LOOKUP_RE = /^crowagent_([a-z0-9]+(?:[-_][a-z0-9]+)*)_([a-z]+)_(monthly|annual)$/i;

function parseLookupKey(
  lookup_key: string,
): { product: string; tier: string; interval: Interval } | null {
  const m = LOOKUP_RE.exec(lookup_key);
  if (!m) return null;
  const interval = m[3].toLowerCase() as Interval;
  return {
    product: m[1].toLowerCase(),
    tier: m[2].toLowerCase(),
    interval,
  };
}

function structuredLog(level: "info" | "warn" | "error", message: string, ctx: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    level,
    service: "sync-pricing-from-stripe",
    timestamp: new Date().toISOString(),
    message,
    ...ctx,
  });
  if (level === "error") process.stderr.write(line + "\n");
  else if (level === "warn") process.stderr.write(line + "\n");
  else process.stdout.write(line + "\n");
}

function detectMode(secret: string): "test" | "live" {
  if (secret.startsWith("sk_live_")) return "live";
  return "test";
}

function canonicalise<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(canonicalise) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[k] = canonicalise((value as Record<string, unknown>)[k]);
    }
    return sorted as unknown as T;
  }
  return value;
}

// ---------- HTML update ----------

/**
 * Maps the `data-plan-tier="<key>"` attribute used inside pricing.html to the
 * canonical (product, tier) tuple from the Stripe lookup_key scheme. Core uses
 * bare tier slugs (starter/pro/portfolio) for historical reasons; CrowMark
 * uses bare tier slugs too; CrowCyber/CrowCash use prefixed slugs.
 *
 * If you add a new tier card, register it here AND add a row in
 * docs/stripe-pricing-coordination.md.
 */
const PLAN_TIER_TO_PRODUCT_TIER: Record<string, { product: string; tier: string }> = {
  // CrowAgent Core
  starter:           { product: "core", tier: "starter" },
  pro:               { product: "core", tier: "pro" },
  portfolio:         { product: "core", tier: "portfolio" },
  // CrowMark
  solo:              { product: "crowmark", tier: "solo" },
  team:              { product: "crowmark", tier: "team" },
  agency:            { product: "crowmark", tier: "agency" },
  // CrowCyber
  "cyber-starter":   { product: "crowcyber", tier: "starter" },
  "cyber-pro":       { product: "crowcyber", tier: "pro" },
  "cyber-enterprise":{ product: "crowcyber", tier: "enterprise" },
  // CrowCash
  "cash-starter":    { product: "crowcash", tier: "starter" },
  "cash-pro":        { product: "crowcash", tier: "pro" },
  "cash-enterprise": { product: "crowcash", tier: "enterprise" },
  // CrowESG is waitlist-only — no Stripe prices yet.
};

interface UpdateChange {
  data_plan_tier: string;
  field: "monthly" | "annual";
  before: number | null;
  after: number;
}

/**
 * MP1 §A4 mandates the annual discount is *exactly* 10% off monthly. If
 * Stripe's annual price doesn't match, prefer the displayed-monthly × 0.9
 * (rounded to nearest £) so the marketing page never advertises a discount
 * that disagrees with company policy. Stripe disagreements are logged.
 *
 * Stripe stores annual prices as the full annual amount; we display the
 * per-month-equivalent. So:
 *   displayed_annual_per_month = round(stripe_annual_amount_pence / 12 / 100)
 */
function poundsFromMonthlyPence(pence: number): number {
  return Math.round(pence / 100);
}

function poundsFromAnnualTotalPence(annualTotalPence: number): number {
  return Math.round(annualTotalPence / 12 / 100);
}

function expectedAnnualPerMonthFromMonthly(monthlyPounds: number): number {
  return Math.round(monthlyPounds * 0.9);
}

function updateHtmlPricing(
  html: string,
  products: Record<string, ProductShape>,
): { html: string; changes: UpdateChange[]; warnings: string[] } {
  const beginMarker = "<!-- BEGIN_PRICING_CARDS";
  const endMarker = "<!-- END_PRICING_CARDS -->";
  const beginIdx = html.indexOf(beginMarker);
  const endIdx = html.indexOf(endMarker);
  if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
    throw new Error(
      `pricing.html marker block not found. Expected '${beginMarker}' ... '${endMarker}'.`,
    );
  }

  const before = html.slice(0, beginIdx);
  const block = html.slice(beginIdx, endIdx + endMarker.length);
  const after = html.slice(endIdx + endMarker.length);

  const changes: UpdateChange[] = [];
  const warnings: string[] = [];

  // Iterate every <div class="pgc"> ... data-plan-tier="<key>" ... </div>
  // We work card-by-card. The price card structure is:
  //   <div class="pgc-price">£<span class="pv" data-m="149" data-a="134">149</span><span class="pp">/mo</span></div>
  // The CTA carries data-plan-tier on the <a>, but the <span class="pv"> is
  // earlier in the same <div class="pgc">. We match each card via a non-greedy
  // regex anchored on its CTA.

  const cardRe = /<div class="pgc(?:[^"]*)"[\s\S]*?data-plan-tier="([^"]+)"[\s\S]*?<\/div>/g;

  // Naive approach: replace data-m / data-a / inner pv text per card by walking
  // the `data-plan-tier` -> price mapping and using a more targeted per-card
  // substring rewrite. Pure regex on full block is brittle; do a 2-pass scan.

  let updatedBlock = block;

  for (const [planTier, mapping] of Object.entries(PLAN_TIER_TO_PRODUCT_TIER)) {
    const productData = products[mapping.product];
    const tierData = productData?.tiers?.[mapping.tier];
    if (!tierData) {
      warnings.push(
        `No Stripe data for ${mapping.product}/${mapping.tier} (data-plan-tier="${planTier}"); leaving HTML unchanged for this card.`,
      );
      continue;
    }
    if (!tierData.monthly) {
      warnings.push(
        `Missing monthly price for ${mapping.product}/${mapping.tier}; leaving HTML unchanged for this card.`,
      );
      continue;
    }

    const monthlyPounds = poundsFromMonthlyPence(tierData.monthly.amount);

    // Annual: prefer Stripe's annual price (per-month-equivalent), else fall
    // back to the policy-mandated 10% discount.
    let annualPerMonthPounds: number;
    if (tierData.annual) {
      const stripeAnnualPerMonth = poundsFromAnnualTotalPence(tierData.annual.amount);
      const policyAnnualPerMonth = expectedAnnualPerMonthFromMonthly(monthlyPounds);
      if (stripeAnnualPerMonth !== policyAnnualPerMonth) {
        warnings.push(
          `Annual price drift for ${mapping.product}/${mapping.tier}: Stripe says £${stripeAnnualPerMonth}/mo, MP1 §A4 mandates £${policyAnnualPerMonth}/mo (10% off £${monthlyPounds}). Using policy figure.`,
        );
      }
      annualPerMonthPounds = policyAnnualPerMonth;
    } else {
      annualPerMonthPounds = expectedAnnualPerMonthFromMonthly(monthlyPounds);
      warnings.push(
        `No annual Stripe price for ${mapping.product}/${mapping.tier}; deriving £${annualPerMonthPounds}/mo from the 10% policy.`,
      );
    }

    // Find the card span (data-plan-tier="<plan>") and rewrite. We anchor on
    // the FULL card via the CTA's data-plan-tier attribute and walk back to
    // the <span class="pv"> within the same card. Cards are bounded by the
    // surrounding <div class="pgc"> ... </div>.

    // Build a card-scoped regex: from <div class="pgc"...> up to the matching
    // <a class="pgc-cta" ... data-plan-tier="<planTier>" ... >...</a></div>.
    // (Using non-greedy ensures we don't span across siblings.)
    const cardScopedRe = new RegExp(
      `(<div class="pgc(?:[^"]*)"[\\s\\S]*?<span class="pv" data-m=")(\\d+)(" data-a=")(\\d+)(">)(\\d+)(<\\/span>[\\s\\S]*?data-plan-tier="${planTier.replace(/[-]/g, "\\$&")}")`,
      "g",
    );

    let matched = false;
    updatedBlock = updatedBlock.replace(
      cardScopedRe,
      (_full, p1, oldM, p3, oldA, p5, _oldVisible, p7) => {
        matched = true;
        const oldMNum = Number(oldM);
        const oldANum = Number(oldA);
        if (oldMNum !== monthlyPounds) {
          changes.push({
            data_plan_tier: planTier,
            field: "monthly",
            before: oldMNum,
            after: monthlyPounds,
          });
        }
        if (oldANum !== annualPerMonthPounds) {
          changes.push({
            data_plan_tier: planTier,
            field: "annual",
            before: oldANum,
            after: annualPerMonthPounds,
          });
        }
        return `${p1}${monthlyPounds}${p3}${annualPerMonthPounds}${p5}${monthlyPounds}${p7}`;
      },
    );

    if (!matched) {
      warnings.push(
        `data-plan-tier="${planTier}" present in mapping but no matching <span class="pv">…</span> + CTA pair found in pricing.html; skipped.`,
      );
    }
  }

  return { html: before + updatedBlock + after, changes, warnings };
}

// ---------- main ----------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const jsonMode = argv.includes("--json");
  // Default mode is HTML; --html is accepted for explicitness.
  const htmlMode = !jsonMode || argv.includes("--html");

  const outArg = argv.find((a) => a.startsWith("--out="));
  const htmlPathArg = argv.find((a) => a.startsWith("--html-path="));
  const defaultOut = join(
    process.cwd(),
    "app",
    "(marketing)",
    "pricing",
    "_data",
    "prices.json",
  );
  const outPath = outArg ? resolve(outArg.slice("--out=".length)) : defaultOut;
  const htmlPath = htmlPathArg
    ? resolve(htmlPathArg.slice("--html-path=".length))
    : resolve(process.cwd(), "pricing.html");

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    structuredLog("error", "STRIPE_SECRET_KEY is not set", {
      hint: "Set sk_test_* (sandbox) or sk_live_* (production) before running",
    });
    process.exit(1);
  }

  const mode = detectMode(secret);
  const stripe = new Stripe(secret, {
    apiVersion: (process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined) ?? "2024-06-20",
    typescript: true,
    appInfo: {
      name: "crowagent-website/sync-pricing",
      version: "1.1.0",
      url: "https://crowagent.ai",
    },
    maxNetworkRetries: 2,
  });

  structuredLog("info", "Listing active Stripe prices", { stripe_mode: mode });

  const products: Record<string, ProductShape> = {};
  let processed = 0;
  let skipped = 0;

  try {
    for await (const price of stripe.prices.list({ active: true, limit: 100, expand: [] })) {
      processed += 1;
      if (!price.lookup_key) {
        skipped += 1;
        continue;
      }
      if (!price.lookup_key.startsWith("crowagent_")) {
        skipped += 1;
        continue;
      }
      const parsed = parseLookupKey(price.lookup_key);
      if (!parsed) {
        structuredLog("warn", "Lookup key does not match canonical pattern; skipping", {
          lookup_key: price.lookup_key,
          price_id: price.id,
        });
        skipped += 1;
        continue;
      }
      const stripeInterval = price.recurring?.interval;
      const expectedInterval = parsed.interval === "monthly" ? "month" : "year";
      if (stripeInterval && stripeInterval !== expectedInterval) {
        structuredLog("warn", "lookup_key interval disagrees with Stripe recurring.interval", {
          lookup_key: price.lookup_key,
          price_id: price.id,
          lookup_key_interval: parsed.interval,
          stripe_interval: stripeInterval,
        });
      }
      if (price.unit_amount === null) {
        structuredLog("warn", "Price has null unit_amount (custom pricing?); skipping", {
          lookup_key: price.lookup_key,
          price_id: price.id,
        });
        skipped += 1;
        continue;
      }

      const productKey = parsed.product;
      const tierKey = parsed.tier;
      products[productKey] ||= { tiers: {} };
      products[productKey].tiers[tierKey] ||= {};
      products[productKey].tiers[tierKey][parsed.interval] = {
        amount: price.unit_amount,
        currency: price.currency,
        lookup_key: price.lookup_key,
        price_id: price.id,
        unit_amount_decimal: price.unit_amount_decimal ?? null,
      };
    }
  } catch (error) {
    structuredLog("error", "Stripe API error while listing prices", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(2);
  }

  if (jsonMode) {
    await writeJsonSnapshot({ products, mode, outPath, dryRun, processed, skipped });
    return;
  }

  if (!htmlMode) {
    structuredLog("error", "No output mode selected; pass --html or --json");
    process.exit(1);
  }

  // ---------- HTML mode ----------
  if (!existsSync(htmlPath)) {
    structuredLog("error", "pricing.html not found", { html_path: htmlPath });
    process.exit(3);
  }

  let originalHtml: string;
  try {
    originalHtml = readFileSync(htmlPath, "utf8");
  } catch (error) {
    structuredLog("error", "Failed to read pricing.html", {
      html_path: htmlPath,
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(3);
  }

  let result: ReturnType<typeof updateHtmlPricing>;
  try {
    result = updateHtmlPricing(originalHtml, products);
  } catch (error) {
    structuredLog("error", "HTML marker block missing", {
      html_path: htmlPath,
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(4);
  }

  for (const w of result.warnings) {
    structuredLog("warn", w);
  }

  if (result.changes.length === 0) {
    structuredLog("info", "No price changes; pricing.html already in sync", {
      stripe_mode: mode,
      products_seen: Object.keys(products).length,
      stripe_prices_processed: processed,
      stripe_prices_skipped: skipped,
    });
    if (dryRun) return;
    return;
  }

  structuredLog("info", "Detected price changes", {
    stripe_mode: mode,
    change_count: result.changes.length,
    changes: result.changes,
  });

  if (dryRun) {
    structuredLog("info", "Dry run — pricing.html NOT written");
    return;
  }

  if (result.html === originalHtml) {
    structuredLog("info", "Computed HTML identical to disk; skipping write (idempotent)");
    return;
  }

  try {
    writeFileSync(htmlPath, result.html, "utf8");
  } catch (error) {
    structuredLog("error", "Failed to write pricing.html", {
      html_path: htmlPath,
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(3);
  }

  structuredLog("info", "Wrote pricing.html", {
    html_path: htmlPath,
    bytes: result.html.length,
    changes_applied: result.changes.length,
  });
}

async function writeJsonSnapshot(opts: {
  products: Record<string, ProductShape>;
  mode: "test" | "live";
  outPath: string;
  dryRun: boolean;
  processed: number;
  skipped: number;
}): Promise<void> {
  const { products, mode, outPath, dryRun, processed, skipped } = opts;
  const payload: PricesFile = canonicalise({
    generated_at: new Date().toISOString(),
    source: "stripe",
    stripe_mode: mode,
    products,
  });

  let final = payload;
  if (!dryRun && existsSync(outPath)) {
    try {
      const existing = JSON.parse(readFileSync(outPath, "utf8")) as PricesFile;
      const prevWithoutTs = { ...existing, generated_at: "<ts>" };
      const nextWithoutTs = { ...payload, generated_at: "<ts>" };
      if (JSON.stringify(canonicalise(prevWithoutTs)) === JSON.stringify(canonicalise(nextWithoutTs))) {
        final = { ...payload, generated_at: existing.generated_at };
      }
    } catch {
      // overwrite on unreadable existing file
    }
  }

  const json = JSON.stringify(final, null, 2) + "\n";

  if (dryRun) {
    process.stdout.write(json);
    structuredLog("info", "Dry run complete (json mode)", {
      processed,
      skipped,
      products: Object.keys(products).length,
    });
    return;
  }

  try {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, json, "utf8");
  } catch (error) {
    structuredLog("error", "Failed to write prices.json", {
      out_path: outPath,
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(3);
  }

  structuredLog("info", "Wrote prices.json", {
    out_path: outPath,
    processed,
    skipped,
    products: Object.keys(products).length,
    bytes: json.length,
  });
}

main().catch((error) => {
  structuredLog("error", "Unhandled failure", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(2);
});
