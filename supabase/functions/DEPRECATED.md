# Edge function cleanup catalogue

A QA audit of the 140+ edge functions in this directory found significant
duplication. This file lists overlapping implementations and functions with
no visible client or orchestrator caller, so a future sweep can archive or
delete the redundant ones with confidence.

**Do not delete anything from this list without first confirming the function
is not invoked from:**

1. The client — grep `supabase.functions.invoke('<name>'` under `src/`.
2. Another edge function — grep `invoke('<name>'` under `supabase/functions/`.
3. A cron trigger / database trigger / webhook — check Supabase Dashboard → Database → Webhooks and Edge Functions → Cron.
4. `supabase/config.toml` (if present).

Once you've confirmed a function is unreferenced, move its directory to
`supabase/functions/_deprecated/<name>/` (keep the code, don't delete, so
the change is reversible).

---

## Overlapping implementations

The audit flagged these clusters; only one of each cluster is likely the
current production path. Identify the canonical one via logs / dashboard
invocation counts, then retire the rest.

### Predictors (7 variants)

| Function | Client-invoked? | Likely status |
|---|---|---|
| `aeso-predictor` | yes | — |
| `aeso-ai-predictor` | yes | — |
| `aeso-ensemble-predictor` | yes | — |
| `aeso-optimized-predictor` | yes | — |
| `aeso-predict-realtime` | yes | — |
| `aeso-ml-predictor` | no | candidate for removal |
| `aeso-lstm-predictor` | no | candidate for removal |
| `aeso-price-predictor` | no | candidate for removal |

### Backfills (5 variants)

| Function | Client-invoked? | Likely status |
|---|---|---|
| `aeso-analytics-backfill` | yes | — |
| `aeso-complete-backfill` | yes | — |
| `aeso-comprehensive-backfill` | yes | — |
| `aeso-weather-backfill` | yes | — |
| `aeso-historical-backfill` | no | candidate for removal |
| `aeso-rapid-backfill` | no | candidate for removal |
| `aeso-gas-price-backfill` | no | likely cron-driven — verify |
| `aeso-generation-csv-backfill` | no | likely one-off — verify |
| `aeso-reserves-backfill` | no | likely cron-driven — verify |
| `aeso-smp-backfill` | no | likely cron-driven — verify |

### Trainers (4 variants)

| Function | Client-invoked? | Likely status |
|---|---|---|
| `aeso-ml-trainer` | yes | — |
| `aeso-stacked-ensemble-trainer` | yes | — |
| `aeso-scheduled-retraining` | yes | — |
| `aeso-auto-trainer` | no | candidate for removal |
| `aeso-adaptive-retrainer` | no | likely cron-driven — verify |

### Data collectors (2 variants)

| Function | Client-invoked? | Likely status |
|---|---|---|
| `aeso-data-collector` | yes | — |
| `aeso-comprehensive-data-collector` | no | candidate for removal |

### Scrapers (5 variants)

| Function | Client-invoked? | Likely status |
|---|---|---|
| `comprehensive-property-scraper` | yes | — |
| `real-estate-multi-scraper` | yes | — |
| `loopnet-scraper` | yes | — |
| `ai-property-scraper` | no | candidate for removal |
| `multi-source-scraper` | no | candidate for removal |

### Data quality (3 variants)

| Function | Client-invoked? | Likely status |
|---|---|---|
| `aeso-data-quality-filter` | yes | — |
| `aeso-data-quality-analyzer` | no | candidate for removal |
| `aeso-data-quality-checker` | no | candidate for removal |

---

## Other functions with no visible client caller

Verify via cron / orchestrator references before removing:

- `aeso-feature-calculator` (superseded by `aeso-enhanced-feature-calculator` + `aeso-advanced-feature-engineer`)
- `aeso-market-data`
- `aeso-natural-gas-collector`
- `aeso-performance-tracker`
- `aeso-regime-detector`
- `aeso-weather-integration`
- `energy-rate-intelligence` (see `energy-rate-estimator`)
- `enhanced-verified-scanner`
- `fetch-btc-network-data`
- `generate-image`
- `get-folder-contents`
- `meta-proxy` / `secure-share-meta-proxy`
- `ocr-extract-text`
- `parse-office-document`
- `predictive-analytics`
- `regulatory-data-integration`
- `send-academy-verification-email` (see `send-verification-email`)
- `test-ercot-auth` (test harness — likely safe to delete)
- `track-activity-beacon`
- `translate-document` / `translate-page` (see `translate-aeso-report` for a related active one)
- `verify-academy-email` (see `verify-email`)

---

## Recommended process

1. Pick a cluster (predictors first — 7→1 is the biggest win).
2. Enable Edge Function logging in the Supabase dashboard for each
   candidate for 7 days.
3. Any function with zero invocations at the end of the window → move to
   `_deprecated/`.
4. After one more release cycle with no regressions, delete the
   `_deprecated/` entries entirely.
