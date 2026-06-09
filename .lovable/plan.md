## Goal
Make AESO hourly data coverage match real calendar hours per month, backfill missing live AESO values, store raw hourly observations append-only, and make the UI stop showing misleading 100% uptime when the month is incomplete.

## Findings from the current data
- `aeso_raw_price_observations` has `0` rows, so prior raw-history inserts are not actually populated yet.
- `aeso_training_data` has duplicate/non-canonical timestamps after Nov 2025, e.g. `2026-06-08 00:00:09` and `2026-06-08 00:00:09.655` both count as separate rows but the same hour.
- There are `8,231` rows where `timestamp` is not exactly top-of-hour.
- There are `3,996` duplicate hourly buckets when normalized with `date_trunc('hour', timestamp)`.
- The Power Model database loader filters out rows where `ail_mw` is null, so it reports AIL-complete hours instead of price-hour coverage.
- The monthly uptime table calculates uptime as `running / loaded rows`, so a month with 151 loaded hours can still show `100%` instead of being flagged as partial.

## Plan

### 1. Add database-side canonical audit utilities
Create read-only RPCs/views that compute AESO coverage by canonical hourly bucket:
- Expected hours per calendar month using a generated UTC hour grid.
- Actual price hours from `aeso_training_data` normalized with `date_trunc('hour', timestamp)`.
- Actual AIL hours, SMP hours, raw observation rows, duplicate bucket counts, and missing hour lists.
- Treat the current in-progress month separately so future hours in the month are not counted as missing.

### 2. Reconcile `aeso_training_data` into one canonical row per hour
Run a controlled data cleanup that:
- Keeps the best row per hour bucket, preferring rows with live `ail_mw`, `system_marginal_price`, and the latest timestamp.
- Normalizes the kept row timestamp to the exact top-of-hour.
- Removes redundant duplicate rows only after their best available values are merged into the canonical row.
- Does not invent or interpolate values.

### 3. Backfill missing historical AESO hours from live APIs
Enhance `aeso-comprehensive-backfill` so the `gaps` phase:
- Audits all missing canonical hours over the requested date range.
- Pulls Pool Price, AIL, and SMP from AESO APIs for affected months.
- Upserts only verified live AESO records into `aeso_training_data`.
- Inserts every fetched AESO hourly record into `aeso_raw_price_observations` append-only with `observed_for`, `observed_at`, `revision_id`, source endpoint, status, request id, and raw payload.
- Produces a month-by-month reconciliation report showing expected, inserted, still missing, and API failures.

### 4. Backfill the raw observation history
Because the raw observation table is empty, populate it from live AESO API responses for the same repaired date range, without overwriting history.
- Historical API pulls create one raw observation per AESO record returned.
- Real-time collector continues appending raw observations going forward.
- Add an idempotency/dedup key for `(observed_for, source_endpoint, revision_id, raw payload hash)` so reruns avoid duplicate raw rows while preserving revised AESO records.

### 5. Fix the Power Model loader and coverage UI
Update the frontend so:
- The database loader does not drop valid price hours just because AIL is temporarily missing.
- Timestamps are canonicalized to top-of-hour before dedupe.
- Coverage audit shows expected vs covered calendar hours, missing hours, duplicate rows, and separate price/AIL/SMP coverage.
- Monthly tables use expected calendar hours for uptime context and clearly mark partial months instead of showing `100%` as if complete.

### 6. Validate against the database
After implementation, run read-only checks confirming:
- Every elapsed full month has expected canonical price hours: 672, 696, 720, or 744 depending on month length.
- Current month coverage is measured only through the latest available/past AESO hour.
- No duplicate canonical buckets remain in `aeso_training_data`.
- Raw observation rows exist for the repaired AESO pulls and include revision/source metadata.
- The UI counts match the database audit results.