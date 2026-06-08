## Goal

Independently reconcile the model's DTS subtotal against the AESO **2026-015T Appendix 1 Bill Estimator** formulas, and surface a pass/fail tolerance check inside the Power Model UI so any drift between our calculator and the official estimator is visible immediately.

## What "reconcile" means here

The AESO Bill Estimator is a fixed monthly formula given (a) contracted/billing capacity (MW), (b) monthly energy (MWh), (c) substation fraction, (d) the highest coincident demand for the month (used for 12CP charge), and (e) average pool price for OR. For every month the model produces, we will recompute the DTS subtotal a second time using a clean, isolated Bill-Estimator implementation, then compare it line-by-line against the calculator's `MonthlyResult.totalDTSCharges` and individual DTS components.

If everything is wired correctly, the two numbers must match within rounding (≤ 0.5 % or ≤ $1, whichever is greater, per line; ≤ 0.1 % on the DTS subtotal). Anything outside tolerance is a real bug.

## Deliverables

### 1. `src/lib/aeso/billEstimator2026.ts` (new — pure functions)
- `estimateDTSMonth(input): DTSEstimateMonth` — single-month estimator that mirrors the official 2026-015T spreadsheet row-by-row:
  - Bulk Coincident Demand = `coincidentDemandRate × billingMW × (1 - successRate)` (configurable; default 0.85 matches calculator)
  - Bulk Metered Energy = `bulkERate × MWh`
  - Regional Billing Capacity = `regCapRate × billingMW`
  - Regional Metered Energy = `regERate × MWh`
  - POD Substation = `podSubRate × subFraction`
  - POD Tiered = identical tier walk to `calculatePODTieredCharge` (re-implemented inline so we're not just calling the same code)
  - Operating Reserve = `orRatePct/100 × poolEnergyAtActualPrice` (pass-through on actual pool price)
  - TCR / Voltage Control / System Support = standard rate × MWh or × MW
  - Returns each component plus `dtsSubtotal`.
- `estimateDTSAnnual(months)` — sums the monthly estimates.
- All inputs are the verified 2026 rates from `AESO_RATE_DTS_2026`; no overrides applied here so the reconciler always compares against the canonical AESO tariff.

### 2. `src/lib/aeso/billEstimatorReconciliation.ts` (new)
- `reconcileMonth(monthlyResult, hourlyForMonth, params)`:
  - Builds the Bill-Estimator inputs from the same monthly running hours/MWh/pool-price the calculator used.
  - Calls `estimateDTSMonth`.
  - Returns an array of line-level deltas: `{ label, calc, estimator, deltaAbs, deltaPct, withinTolerance }`.
- `reconcileAnnual(monthly, hourly, params)` aggregates monthly deltas + computes subtotal-level tolerance flag.
- Tolerance constants: `LINE_ABS_TOL = 1.0`, `LINE_PCT_TOL = 0.005`, `SUBTOTAL_PCT_TOL = 0.001`.

### 3. `src/components/aeso/PowerModelEstimatorReconciliation.tsx` (new card)
- Compact card with title "AESO 2026-015T Bill Estimator — Reconciliation".
- Header badge: green "✓ Matches AESO Estimator (Δ 0.0%)" / amber "⚠ Drift detected (Δ X.X%)" / red "✗ Out of tolerance".
- Two-column table per component (Calculator vs Estimator) with Δ$ and Δ% and a per-row check icon.
- Collapsible "View monthly breakdown" expanding to a 12-row matrix.
- Footer cites the source: AESO 2026-015T Appendix 1 Bill Estimator with `SourceLink`.
- Pure presentational — receives `reconciliation` from a `useMemo` in `PowerModelAnalyzer`.

### 4. Wire into `PowerModelAnalyzer.tsx`
- Compute `const reconciliation = useMemo(() => reconcileAnnual(monthly, hourlyData, params), [monthly, hourlyData, params])`.
- Render `<PowerModelEstimatorReconciliation ... />` immediately under `<PowerModelChargeBreakdown />` so analysts see the validation right next to the charges.

### 5. Tests `src/lib/aeso/__tests__/billEstimator2026.test.ts`
- One known-good scenario from the official spreadsheet: 45 MW billing, 32,850 MWh, full substation, 85 % peak-avoidance — assert each line equals the value `AESO_RATE_DTS_2026` would produce, and assert `reconcileMonth` returns all `withinTolerance: true` for an unmodified calculator run.
- Negative test: synthetic perturbation (e.g. inject a +5 % bump on `regionalBillingCapacity`) to confirm the reconciler flags it as out-of-tolerance.

### 6. Maintenance
- Bump `APP_VERSION` → `'2026.06.08.010'`.
- No DB / edge-function / migration changes.
- Bill-Estimator file path cited in code comments and UI: https://www.aeso.ca/assets/Information-Documents/2026-015T-Appendix-1-Bill-Estimator.xlsx

## Out of scope
- Energy / Pool / OR / Fortis / Rider F / Retailer / GST lines (the Bill Estimator only covers DTS — Fortis service charge is already covered by the prior fix and stays separate).
- Editing override behavior — when the user overrides a tariff, the reconciler still uses canonical AESO rates, so a deliberate override will (correctly) show drift. The UI will explain that with a small note: *"Reconciliation uses official AESO 2026-015T rates. Differences here reflect any tariff overrides you applied."*

## Verification
- Run the new vitest suite — both happy-path and perturbation tests pass.
- Open Power Model for a 45 MW Rate 65 scenario with no overrides → reconciliation card shows all green, Δ ≤ 0.1 % on subtotal.
- Set Regional Billing Capacity override to 3,200 (vs 2,987) → reconciliation flips amber and highlights that exact row.
