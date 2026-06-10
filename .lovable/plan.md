
# AESO Hourly Coverage Audit + Backfill

## Step 1 — Audit result (already run)

Pulled from `public.audit_aeso_hourly_coverage()` just now. Highlights for every elapsed month:

| month   | expected | price | ail | smp | dup | missing_price | raw_obs |
|---------|---------:|------:|----:|----:|----:|--------------:|--------:|
| 2026-06 (in-progress) | 233 | 234 | 234 | 192 | 0 | 0 | 0 |
| 2026-05 | 744 | 744 | 744 | 492 | 0 | 0 | 0 |
| 2026-04 | 720 | 720 | 720 | 312 | 0 | 0 | 0 |
| 2026-03 | 744 | 744 | 744 | 607 | 0 | 0 | 0 |
| 2026-02 | 672 | 672 | 672 | 668 | 0 | 0 | 0 |
| 2026-01 | 744 | 744 | 744 | 744 | 0 | 0 | 0 |
| 2025-12 | 744 | 744 | 744 | 727 | 0 | 0 | 0 |
| 2025-11 | 720 | 720 | 720 | 512 | 0 | 0 | 0 |
| 2025-10 → 2024-04 | full | full | full | **0** | 0 | 0 | 0 |
| **2025-03** | 744 | **743** | 743 | 0 | 0 | **1** | 0 |
| **2024-03** | 744 | **743** | 743 | 0 | 0 | **1** | 0 |
| earlier months | full | full | full | 0 | 0 | 0 | 0 |

### What this tells us
- **Step 2 dedup is unnecessary** — `duplicate_hour_buckets = 0` on every row.
- **Price + AIL are already 100%** on every elapsed month except 2025-03 and 2024-03, which are each missing exactly 1 UTC hour. These almost certainly correspond to the Mountain-Time DST spring-forward day; AESO's hourly pool price feed does not emit that hour. Worth a `gaps` retry but it may be unfillable from upstream.
- **SMP has the only large gap**: 0 rows for everything older than Nov 2025 and partial coverage for 2025-11 → 2026-06. This is the real work.
- **`aeso_raw_price_observations` is empty** for every month. The new raw-snapshot logger has not actually been writing rows. That is a separate bug — flagging it but **not** fixing it in this run, because the user's runbook scopes this task to canonical-table coverage. Will report it at the end.

## Step 2 — Dedup

Skipped. No month has duplicates.

## Step 3 — Backfill plan

Drive the comprehensive backfill function until every phase reports `isComplete: true`. The function batches months and returns `{ isComplete, remainingRecords, nextOffsetMonths }` so the loop pattern is the same for every phase.

Execution order, with the actual expected workload for each:

1. `phase: 'prices'` — expected to be a near no-op (only 2 hours short across the whole dataset, both DST). Call once, repeat with `offsetMonths = nextOffsetMonths` until `isComplete`.
2. `phase: 'demand'` — expected no-op (AIL already matches price coverage). Drive to `isComplete`.
3. `phase: 'smp'` — the heavy one. Drive to `isComplete`; this will iterate through many month-batches because every month from 2024-04 back to the start of history has zero SMP rows, plus partial fills on 2025-11 → 2026-06.
4. `phase: 'gaps'` — second pass that targets any per-hour holes the bulk phases missed (including the 2 DST hours).
5. `phase: 'interpolate'` — final pass for any residual hour where the bulk fetch could not retrieve a value but neighbors exist.

Each call is idempotent because of `UNIQUE(timestamp)` on `aeso_training_data` and `uq_aeso_raw_obs_dedup` on `aeso_raw_price_observations`, so re-running is safe.

### Loop contract (applies to every phase)

```text
offset = 0
loop:
  res = invoke('aeso-comprehensive-backfill', { phase, offsetMonths: offset })
  log { phase, offset, recordsInserted|Updated, remainingRecords, isComplete }
  if res.isComplete: break
  offset = res.nextOffsetMonths   // fall back to offset + batchMonths if missing
guard: hard cap at 200 iterations per phase to avoid runaway
```

A small Node script will be run via `code--exec` against the project's Supabase URL + anon key (already in the sandbox env) to drive these loops; nothing in the app code changes.

## Step 4 — Verify

Re-run `SELECT * FROM public.audit_aeso_hourly_coverage() ORDER BY month_start DESC;` and, for every `is_elapsed = true` row, confirm:

- `duplicate_hour_buckets = 0`
- `missing_price_hours = 0`
- `price_hours = ail_hours = smp_hours = expected_hours`

For any month still short on any of the three columns, dump the exact hours with:

```sql
SELECT *
FROM public.list_missing_aeso_hours(
  'YYYY-MM-01'::timestamptz,
  ('YYYY-MM-01'::timestamptz + interval '1 month')
);
```

## Deliverables in the final reply

- Before / after audit tables side by side.
- Per-phase invocation count and total records inserted/updated.
- Any hour that could not be filled, grouped by month, with a brief reason (most likely: DST spring-forward, or AESO endpoint returns no SMP that far back).
- Final list of months where `price_hours = ail_hours = smp_hours = expected_hours`.
- A separate callout that `aeso_raw_price_observations` is empty for all months — the canonical table is fine but the raw-snapshot logger isn't writing. Not fixed in this task; flagged for a follow-up.

## Out of scope (explicit)

- No schema changes.
- No edge-function code changes.
- No fix for the empty `aeso_raw_price_observations` table — reported only.
