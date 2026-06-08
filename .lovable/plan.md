## Goal
Make the Power Model fail-safe: every all-in price shown on the page must come from one canonical calculation path, and monthly summaries must visibly validate hourly coverage before any annual/scenario numbers are trusted.

## Findings from audit
- **Mixed all-in denominators:** some UI sections calculate rate using delivered kWh, while scenario/full-capacity views use full-capacity kWh or rebuilt totals. This makes different all-in prices appear across the page.
- **Scenario Builder drift:** `PowerModelScenarioBuilder` rebuilds totals independently from component toggles and full 12CP assumptions, instead of using the same canonical scenario totals as `PowerModelCostProgression`.
- **Monthly coverage is incomplete:** database coverage check shows 2026 data currently has missing hours in several months:
  - January: 744 / 744 covered
  - February: 668 / 672 covered, 4 missing
  - March: 607 / 744 covered, 137 missing
  - April: 312 / 720 covered, 408 missing
  - May: 492 / 744 covered, 252 missing
  - June: 150 / 720 covered, 570 missing
- **Timestamp conversion risk:** `convertTrainingDataToHourly` uses local `getHours()` while date uses UTC ISO date. This can mislabel hour-ending and collapse/shift records depending on browser timezone.
- **Database duplicate rows:** the training data has duplicate raw rows per hour; the UI dedupes after download, but the progress/coverage messaging is based on raw rows rather than canonical hourly buckets.

## Plan

### 1. Create a canonical Power Model math layer
- Add shared helpers for:
  - canonical invoice all-in rate = `totalAmountDue / deliveredKWh`
  - effective rate after credits = `(totalAmountDue - credits) / deliveredKWh`
  - full-output reference rate = scenario cost / no-curtailment kWh, clearly labeled as **reference**, never as the invoice all-in rate
  - scenario costs: base/no optimization, 12CP only, price curtailment only, combined optimization
- Replace duplicated formulas in:
  - `PowerModelCostProgression`
  - `PowerModelStrategyComparison`
  - `PowerModelScenarioBuilder`
  - export/PDF rate summaries where needed

### 2. Make all page labels unambiguous
- Use **Invoice all-in rate** only for delivered-kWh invoice math.
- Rename any full-capacity denominator display to **Full-output reference rate**.
- Ensure the headline KPI, scenario comparison, monthly summary annual footer, charts, AI analysis context, CSV, and PDF all agree for the same scenario.

### 3. Add strict hourly data coverage validation
- Add a coverage audit step after loading/uploading data that validates each month by canonical hourly buckets.
- Expected hours use the real calendar month length.
- Flag:
  - missing hours
  - duplicate raw rows per hour
  - partial months
  - invalid pool price / AIL rows
- Show a **Data Validation** card above results with pass/warn/fail status and a month-by-month coverage table.

### 4. Fail closed for incomplete data
- If any completed month has missing hours, mark annual/scenario totals as **not validation-safe**.
- Continue showing monthly rows for inspection, but visually flag incomplete months and prevent them from being mistaken for full-month/annual conclusions.
- Do not impute or fabricate missing hours; the user’s real-data rule requires displaying only validated source data.

### 5. Fix timestamp/hour-ending normalization
- Change database conversion to use UTC hour logic consistently.
- Normalize records by `YYYY-MM-DD + HE 1–24` from the UTC timestamp bucket.
- Deduplicate by canonical hour bucket before calculator use.

### 6. Add tests to lock this down
- Tests that all UI scenario helpers return the same all-in values for the same scenario.
- Tests that monthly coverage detects missing and duplicate hours.
- Tests for UTC HE conversion, especially midnight hour-ending behavior.
- Tests that scenario builder no longer drifts from cost progression.

### 7. Version bump and validation
- Bump `APP_VERSION`.
- Run the targeted Power Model test suite and verify no inconsistent all-in values remain in the audited code paths.