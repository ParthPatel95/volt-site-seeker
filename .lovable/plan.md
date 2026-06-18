## Audit findings

The database table holding hourly data is `public.aeso_training_data`.

For `2024-01-01` through the latest available hour (`2026-06-17 19:00 UTC`), the table is already fully filled at the hourly-bucket level:

- `2024`: 8,784 / 8,784 pool-price hours present
- `2025`: 8,760 / 8,760 pool-price hours present
- `2026 YTD`: 4,028 / 4,028 pool-price hours present through now
- Total: 21,572 / 21,572 expected pool-price hours present
- Missing pool-price hours: 0
- Duplicate hour buckets: 0
- Null pool-price rows: 0
- Negative pool-price rows: 0

So the remaining “missing data” issue is not a missing-row problem in `aeso_training_data`; it is coming from app-side timestamp-to-date/hour conversion and verification visibility.

## Plan

1. Fix the Power Model database conversion
   - Update the database-row-to-hourly-record conversion so each `timestamp` stays in its actual UTC calendar day.
   - Stop converting `00:00 UTC` into `HE 24` of the previous day, because that still leaks one January YTD hour into December.
   - Use stable UTC semantics: date = `timestamp.toISOString().slice(0, 10)`, HE = `UTC hour + 1`.

2. Harden coverage auditing against timezone shifts
   - Replace remaining `new Date(dateString)` parsing in `src/lib/aeso/dataCoverage.ts` with explicit `YYYY-MM-DD` component parsing.
   - This keeps January records from being bucketed into December in any browser timezone.

3. Add an app-level verification for 2024 → now
   - Add or extend the Power Model coverage audit display to clearly show expected vs covered pool-price hours for the selected database range.
   - Make the UI report `100% coverage` only when every expected hourly bucket is present and has pool price.

4. Add regression coverage
   - Add tests for the `2026-01-01T00:00:00Z` conversion so it remains `2026-01-01`, not `2025-12-31`.
   - Add a coverage-audit test for 2024/2025/2026 month bucketing using explicit UTC date parsing.

5. Force clients onto the fixed app
   - Bump `APP_VERSION` after the fix so old cached UI/data logic cannot keep showing stale results.

## No database backfill needed right now

Because the live database audit shows 100% hourly pool-price coverage from 2024 through now, I will not insert or overwrite historical rows unless a later verification query identifies a specific bad hour/value.