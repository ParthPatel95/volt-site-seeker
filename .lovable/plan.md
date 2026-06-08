## Goal

Backfill every missing hour for Dec 2025 → Jun 2026 (the months flagged in the Coverage Audit) using AESO's historical Pool Price report, and harden the live hourly collector so newly arriving hours are stored without future gaps.

## Why hours are missing today

- `aeso-data-collector` (cron `0 * * * *`) writes **one snapshot per run** with the *current* pool price. Any missed cron tick (deploys, transient API failures, function cold start past the top of the hour) leaves a permanent hole — it never re-fetches the missed hour.
- `aeso-comprehensive-backfill` (`phase: 'prices'`) already knows how to pull the historical `poolPrice` report month-by-month and upsert by `timestamp`, but it has a guard that **skips any month with > 600 existing rows**, which is exactly why partially-filled months (Feb 668, Mar 607, May 491, Apr 313, Dec 1) are not being completed.
- DB confirms the gaps: Dec 2025 = 727 distinct hours (raw rows 1 because the audit reads only what the Power Model loaded; full table has more, but Dec is still incomplete), Feb 668/672, Mar 607/744, Apr 312/720, May 492/744, Jun 150/720.

## Plan

### 1. Fix the historical price backfill so it actually fills partial months

Edit `supabase/functions/aeso-comprehensive-backfill/index.ts` (`backfillPrices`):

- Remove the `existingCount > 600` short-circuit. Instead, compute `expectedHours = daysInMonth * 24` and only skip when `existingCount >= expectedHours`.
- After fetching the AESO `poolPrice` report for the month, build a `Set` of timestamps that already exist (`select timestamp where timestamp between ...`) and only upsert the **missing** hours, in chunks of 200 with `onConflict: 'timestamp'`.
- Use `begin_datetime_utc` from AESO verbatim (already UTC, already on hour boundaries) so we match the canonical hour-ending grid the Coverage Audit checks.
- Return `{ month, expected, fetched, inserted, stillMissing }` per month so progress is observable.

### 2. Add a dedicated "fill gaps" entrypoint

Add `phase: 'gaps'` to the same edge function:

- Query `aeso_training_data` for the audit window (default last 12 months), build the expected hour grid in SQL, diff against `distinct date_trunc('hour', timestamp)`, and return the exact missing hours.
- For each missing hour, hit the AESO Pool Price endpoint scoped to that day, upsert only the gap hours. Same logic also fills `system_marginal_price` from `/price/systemMarginalPrice` when available.
- Idempotent and safe to re-run.

### 3. Run the backfill for Dec 2025 → Jun 2026

Invoke the function once for the audit window:

```
phase: 'gaps', startYear: 2025, endYear: 2026, startMonth: 12, endMonth: 6
```

Expected fills (from current DB):
- Dec 2025: ~17 missing hours
- Feb 2026: 4
- Mar 2026: 137
- Apr 2026: 408
- May 2026: 252
- Jun 2026 (elapsed): ~42 (through the hour the job runs)

Run it twice (once for prices, once after weather lookup) so the Power Model coverage card flips to "validation-safe" for every elapsed month.

### 4. Harden the live hourly collector so new gaps stop appearing

Edit `supabase/functions/aeso-data-collector/index.ts`:

- Before writing the current snapshot, look back **6 hours** in `aeso_training_data`. For any hour-ending bucket missing in that window, call the AESO Pool Price report for that single day and upsert the missing hour(s). This makes the cron self-healing across cold starts and brief outages.
- Round the current-snapshot `timestamp` down to the hour (`setMinutes(0,0,0)`) so we always store one canonical row per HE bucket and the upsert on `timestamp` actually de-dupes intra-hour reruns.
- Add a `last_collected_at` log row in `aeso_scheduled_tasks` so we can see when a run truly failed.

### 5. Add a second safety-net cron

Add a daily `0 6 * * *` cron that calls `aeso-comprehensive-backfill` with `phase: 'gaps'` for the trailing 7 days. Catches anything the per-hour self-heal missed.

### 6. Verify

- Re-query the same monthly coverage SQL we used here and confirm every elapsed month shows `distinct_hours = expected`.
- Re-load the Power Model page; the Coverage Audit banner should turn green and "annual totals NOT invoice-safe" should disappear for elapsed months.
- Add a Vitest case in `src/lib/aeso/__tests__/powerModelCanonical.test.ts` asserting `auditCoverage` reports `isValidationSafe: true` against a fixture with no gaps in elapsed months.
- Bump `APP_VERSION`.

## Out of scope

- Re-deriving non-price fields (weather, AIL, generation mix) — those have their own backfill phases already (`weather`, `demand`, `aeso-weather-backfill`, etc.). I'll only run those if you also want the weather/demand columns filled for the same hours; say the word and I'll chain them.
- Changing the canonical math layer or any UI — Power Model code stays untouched; the Coverage Audit card will just flip to green once the rows exist.
