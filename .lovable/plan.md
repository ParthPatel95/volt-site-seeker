## 1. Dynamic date range loader for Power Model

**File:** `src/components/aeso/PowerModelAnalyzer.tsx`

Replace the single "Year" number input with a more flexible date selector:

- **Preset chips:** `Last 7 days`, `Last 30 days`, `Last 90 days`, `Last 12 months`, `Year to date`, `Custom`, plus existing year shortcuts (2023, 2024, 2025, 2026).
- **Custom range:** two `<Input type="date">` fields (start / end) shown when `Custom` is selected, validated so `start ≤ end` and clamped to today.
- Internally swap `selectedYear: number` → `dateRange: { start: Date; end: Date; label: string }`. The Supabase query stays the same shape (`gte('timestamp', start).lte('timestamp', end)`), just driven by the new range.
- Update the progress estimate: derive expected record count from `(end − start) / 1h` instead of the hard-coded ~9000/year.
- Update the toast and any downstream copy ("Loaded N records from <label>") and pass the start year to `PowerModelWeatherDrivers` so that component keeps working (it still wants a year — pass `end.getFullYear()`).
- Persist last-used range in `localStorage` so reloads remember it.

No DB or edge-function changes.

## 2. DTS charge verification + uptime / MW behaviour

Two parts: (a) audit numbers, (b) make the calculator's MW/uptime sensitivity visible and correct.

### 2a. Audit numbers in `src/constants/tariff-rates.ts`

Confirm every line in `AESO_RATE_DTS_2026` against AESO's 2026‑015T Bill Estimator + the Rate DTS tariff sheet. The current file already cites that source; I'll re-check each value (Bulk coincident $10,927/MW·mo, Bulk metered $1.23/MWh, Regional billing capacity $2,987/MW·mo, Regional metered $0.93/MWh, POD substation $15,562/mo, POD tiers 5,122 / 3,037 / 2,033 / 1,252, OR 8.13 %, TCR $0.131/MWh, Voltage $0.15/MWh, System Support $50/MW·mo, Rider F $1.26/MWh, GST 5 %). If any value has shifted in the latest AESO posting, update the constant and bump `lastVerified`. No structural change unless a rate moved.

Add a short "Verified against" note + direct PDF link to the 2026‑015T Bill Estimator next to the rates in `PowerModelRateExplainer.tsx` so the source is one click away.

### 2b. Make MW / uptime dependence explicit

The DTS bill is **not** a flat number — it scales with both contracted MW and uptime. Today the calculator already does this correctly inside `usePowerModelCalculator.ts`, but the UI does not surface it. I'll:

- Add a small "How DTS scales" panel in `PowerModelRateExplainer.tsx` documenting which components are MW-driven vs energy-driven vs fixed:

  ```text
  Fixed (independent of MW & uptime):
    • POD substation                  $15,562 / month

  Scales with contracted/billed MW (independent of uptime):
    • Bulk coincident demand (12CP)   $10,927 / MW·mo  ← avoidable
    • Regional billing capacity       $2,987  / MW·mo
    • POD tiered demand               tiered $/MW·mo
    • System Support (highest demand) $50     / MW·mo

  Scales with metered energy (MW × uptime hours):
    • Bulk metered energy             $1.23  / MWh
    • Regional metered energy         $0.93  / MWh
    • TCR                             $0.131 / MWh
    • Voltage control                 $0.15  / MWh
    • Rider F                         $1.26  / MWh
    • Retailer fee                    $0.25  / MWh

  Scales with energy AND pool price:
    • Operating Reserve               8.13 % of pool energy cost

  Applied to subtotal:
    • GST                             5 %
  ```

- Add a tiny "sensitivity preview" inside the explainer that recomputes the monthly DTS bill at the user's currently selected MW and uptime (pulled from `usePowerModelCalculator`'s inputs), so they can see how the number moves. No new math — reuse the existing calculator output.

- Sanity-check `usePowerModelCalculator.ts` to make sure: (i) demand components multiply by `contractedCapacityMW` (or billed MW where 12CP applies), (ii) energy components multiply by actual MWh = `MW × hours_online`, (iii) the 12CP avoidance hours reduce only `bulkSystem.coincidentDemand`, not the rest. Fix any miswiring found (none expected based on the read so far, but I'll verify line-by-line).

## Out of scope

- No change to edge functions, RLS, or DB schema.
- No change to FortisAlberta Rate 65 numbers (those were verified in a prior pass).
- No change to the Power Model's calculation engine beyond bug fixes uncovered during the 2b audit.

## Files touched

- `src/components/aeso/PowerModelAnalyzer.tsx` (date range UI)
- `src/components/aeso/PowerModelRateExplainer.tsx` (scaling panel + verification link)
- `src/constants/tariff-rates.ts` (only if a rate moved)
- `src/hooks/usePowerModelCalculator.ts` (only if audit finds a miswiring)
- `src/constants/app-version.ts` (bump)
