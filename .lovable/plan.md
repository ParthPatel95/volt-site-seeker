## What the database actually contains

A fresh per-month audit of `aeso_training_data` from 2024-01 through now confirms there is **exactly 1 row per hour per month**, with pool price, AIL, and SMP all populated:

```text
2024  every month = days × 24 (Jan 744, Feb 696, …, Dec 744)
2025  every month = days × 24 (incl. Dec 744)
2026  Jan 744, Feb 672, Mar 744, Apr 720, May 744, Jun 426 (elapsed-to-now)
```

Raw rows = distinct hours = price hours = AIL hours = SMP hours for every month. There are no duplicates, no nulls, no gaps. So the remaining work is not a DB backfill — it is enforcing this contract in the app and making every tool read from the same canonical set.

## Plan

### 1. Make "exact points per hour per month" a hard contract in the app
- Extend `src/lib/aeso/dataCoverage.ts` so each `MonthCoverage` carries `expectedHours` calculated as:
  - elapsed months → `daysInMonth(year, month) × 24`
  - in-progress month → hours from month start to "now" hour (UTC), matching how the DB function `audit_aeso_hourly_coverage` already computes it
- A month is `complete` only when `coveredHours === expectedHours` AND `rawRecords === expectedHours` (no duplicates, no missing). Anything else is `partial` and the report is NOT validation-safe.
- Surface a new `exactMatch: boolean` per month so the UI can show a green check only when the count is exact.

### 2. Strengthen the Power Model coverage card
- `src/components/aeso/PowerModelDataCoverage.tsx`: render the new `Expected vs Covered vs Raw` columns side by side; flag any month where `raw ≠ expected` even if covered hours match (catches duplicate-with-missing patterns).
- Header badge becomes "Validated · exact hourly coverage" only when every month in range passes the exact-match contract.

### 3. Add a DB-side authoritative check used by the UI
- Use the existing `public.audit_aeso_hourly_coverage(p_from, p_to)` RPC as the source of truth for the Power Model coverage panel: call it alongside the in-memory audit and show a small "DB ✓ matches" badge when the DB report and the in-memory report agree on every month. If they ever disagree, surface it loudly — that's the only situation where data would be "missing".

### 4. Point every consumer at the same canonical query
Audit and align these tools so they all read the same `aeso_training_data` rows ordered by `timestamp` for the selected range, with no client-side date math that can drop hours:
- `src/hooks/usePowerModelCalculator.ts` (Power Model)
- `src/hooks/useAESOData.tsx`, `useAESOMarketData.tsx`, `useAESOHistoricalPricing` paths used by the landing analytics
- `src/components/landing/AlbertaEnergyAnalytics.tsx` (currently goes through the `aeso-historical-pricing` edge function — switch it to the same canonical table via a thin wrapper so the homepage and the Power Model can never disagree)
- 12CP / peak-demand surfaces already use `get_yearly_top12_peaks` / `get_monthly_peak_demands` against the same table — verify, no change expected

### 5. Regression tests
- Unit tests in `src/lib/aeso/__tests__/` for `auditCoverage`:
  - 2024-02 expects 696, 2024-12 expects 744, 2026-02 expects 672
  - In-progress month: expected = hours-since-month-start
  - Duplicate raw row with same (date, HE) → `exactMatch=false`
- A small Playwright check that opens the Power Model and asserts the coverage badge reads "Validated · exact hourly coverage" for 2024 and 2025.

### 6. Force clients off stale bundles
- Bump `src/constants/app-version.ts` so the SW + version-gate reload picks up the stricter contract.

## Out of scope
- No DB backfill (audit shows 100% coverage).
- No schema changes.
- No changes to ingestion cron — it's already producing exact hourly rows.
