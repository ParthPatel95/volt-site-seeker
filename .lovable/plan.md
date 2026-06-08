## Audit findings — Power Model math

I traced the numbers in the screenshot back through `usePowerModelCalculator.ts` and `PowerModelCostProgression.tsx` and found three real math defects (plus one UX issue) that together explain why "With Price Curtailment" looks identical to the base row and why optimization savings are misstated.

### Bug 1 — Scenario base/with-X formulas double-count 12CP

In `PowerModelCostProgression.tsx`:

```ts
const baseCostPreGST = annual.totalPreGST + full12CPCharge + priceCurtailSavings;
const with12CPCostPreGST = baseCostPreGST - full12CPCharge;
```

`annual.totalPreGST` already contains `(1 - successRate) × full12CPCharge` (15% of the full charge by default, because the calculator applies `peakAvoidanceSuccessRate`). Adding `full12CPCharge` on top makes `baseCost` overstate the unoptimized scenario by 15% of the 12CP charge. Then subtracting the full charge again in `with12CPCostPreGST` zeroes out the entire 12CP line even though a real 12CP-avoidance program still pays ~15% (the missed-peak portion). Both the "Base" and "With 12CP Avoidance" rates are wrong.

**Fix:** introduce explicit annual fields and compute scenarios from them:

```
missingTwelveCP = successRate × full12CPCharge          // added back to model "no avoidance"
withBothPreGST  = annual.totalPreGST                    // optimized (12CP + price)
with12CPOnly    = withBothPreGST + priceCurtailSavings  // 12CP avoidance only
withPriceOnly   = withBothPreGST + missingTwelveCP      // price curtailment only
basePreGST      = withBothPreGST + missingTwelveCP + priceCurtailSavings
```

Apply GST to each, then format.

### Bug 2 — Price-curtailment savings only count pool energy

`calcCurtailSavings` returns `poolPrice × cap` (or `fixedPriceCAD × cap`). The real cost avoided by skipping an hour is the full marginal MWh cost the breakeven formula already encodes:

```
marginal_per_MWh = poolPrice × (1 + orRate)
                 + bulkE + regE + tcr + vcr + riderF + retailer
                 + fortisVolumetric
```

So every curtailed hour also avoids Operating Reserve (8.13% of pool), Bulk/Regional metered energy, TCR, Voltage Control, Rider F, retailer fee, and (where applicable) Fortis volumetric. Today's model under-reports curtailment savings by ~12–18% depending on pool price, and the "Without Curtailment" rebuild in the scenario card is therefore too low.

**Fix:**
- Add a helper `marginalChargesPerMWh(overrides)` that returns the same components used in `calculateBreakeven`.
- Rewrite `calcCurtailSavings(rec)` to:
  - Fixed price PPA: `(fixedPriceCAD × (1 + orRateOnActualPool ? 0 : 0) + marginalNonPool) × cap` — OR is a pass-through on the *actual* pool price even with a PPA, so charge it with `rec.poolPrice × orRate × cap` plus `(fixedPriceCAD + marginalNonPool) × cap`.
  - Floating: `(rec.poolPrice × (1 + orRate) + marginalNonPool) × cap`.
- This keeps consistency with `calculateBreakeven` and with the per-MWh marginals already booked elsewhere in the monthly loop.

### Bug 3 — "Full 12CP" annual line ignores capacity overrides

`totalBulkCoincidentDemandFull = monthly.length × bulkCoincidentRate × cap` uses the *constant* rate even when the user supplied a `tariffOverrides.bulkCoincidentDemand` for the scenario. The 12CP-only column then disagrees with the reconciliation card.

**Fix:** use the resolved `bulkCoincidentRate` (already computed) consistently.

### UX issue — "0 hours qualified" reads as a math error

When no pool-price hours exceed breakeven (common with low-price datasets), `priceCurtailSavings = 0`, so the "With Price Curtailment" row equals "Base" and the combined row equals "12CP Only". That's mathematically correct but looks broken. Add a small inline note ("0 hours above $X/MWh breakeven this period") and surface a dash in the savings column with a tooltip explaining why.

## Changes

1. **`src/hooks/usePowerModelCalculator.ts`**
   - New `marginalNonPoolPerMWh()` helper, reused by `calculateBreakeven` and curtailment savings.
   - Rewrite `calcCurtailSavings` to include OR + all variable charges.
   - Add `annual.missingTwelveCP` and ensure `totalBulkCoincidentDemandFull` uses the resolved override rate.
   - Keep `peakAvoidanceSuccessRate` semantics unchanged.

2. **`src/components/aeso/PowerModelCostProgression.tsx`**
   - Replace scenario derivation with the explicit formulas above.
   - Add the "0 hours qualified" tooltip/inline note when `priceCurtailSavings === 0` and `kwh > 0`.

3. **`src/components/aeso/PowerModelStrategyComparison.tsx`** (Optimization Funnel)
   - Apply the same corrected scenario formulas so the funnel and the table agree.

4. **Tests — `src/lib/aeso/__tests__/`**
   - New `powerModelScenarios.test.ts` covering: (a) base = optimized + missing12CP + price savings; (b) 24×7 strategy parity (`'none'` ⇒ base == optimized); (c) curtailment savings ≈ breakeven × curtailed MWh within tolerance; (d) override rate flows into `totalBulkCoincidentDemandFull`.
   - Extend the existing `billEstimatorReconciliation` test with a successRate=0.85 case to lock the fix.

5. **`src/constants/app-version.ts`** — bump to `'2026.06.08.011'`.

No tariff-rate changes, no DB/edge-function changes, no UI restructuring beyond the small note.

## Verification

- Hand-check against AESO 2026-015T for a 45 MW / 32,850 MWh / 85% peak-success scenario; reconciliation card should stay green.
- For a low-price dataset (no hours above breakeven), scenario table now shows base = optimized in the "Price" row with a clear "0 qualifying hours" note, and the 12CP rows still differ by ~`successRate × $5.9M`.
- All new tests pass.