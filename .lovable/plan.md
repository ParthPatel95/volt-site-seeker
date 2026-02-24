

# Interactive All-In Price Scenario Builder for Power Model

## What You'll Get

A new **"All-In Price Builder"** component in the Power Model results area that lets you interactively toggle cost components on/off and see exactly how the all-in energy price changes. Each scenario is clearly labeled (e.g., "Energy Only", "Energy + DTS", "Energy + DTS + Fortis", etc.) and you can layer on optimization programs (12CP avoidance, price curtailment, or both) to see cumulative impact.

## How It Works

The component will be a single interactive card with two sections:

**1. Cost Component Toggles** -- checkboxes to include/exclude:
- Pool Energy (always on -- baseline)
- Operating Reserve (% surcharge on energy)
- DTS Transmission (Bulk Metered, Regional, POD, TCR, Voltage Control, System Support)
- Rider F (Balancing Pool)
- Retailer Fee
- FortisAlberta Distribution (Demand + Volumetric)
- GST

**2. Optimization Program Toggles** -- layered on top:
- 12CP Avoidance (removes Bulk Coincident Demand charge)
- Price Curtailment (reduces energy cost by avoiding high-price hours)
- Target Uptime adjustment (slider: 90-100%)

**3. Results Display** -- updates instantly as toggles change:
- A labeled scenario name auto-generated from active toggles (e.g., "Energy + DTS + Distribution + 12CP Avoidance")
- All-in price in cents/kWh (CAD and USD)
- Annual total cost
- A comparison bar showing the current scenario vs. the "full stack" scenario
- A running list of up to 8 preset scenario bookmarks for quick comparison (e.g., "Energy Only", "Energy + DTS", "Full Rate 65 Unoptimized", "Full Rate 65 + 12CP", "Full Rate 65 + Both Optimizations")

## Visual Layout

```text
+----------------------------------------------------------+
| All-In Price Scenario Builder                            |
|----------------------------------------------------------|
| COST COMPONENTS              | OPTIMIZATION              |
| [x] Pool Energy (base)       | [ ] 12CP Avoidance        |
| [x] Operating Reserve        | [ ] Price Curtailment     |
| [x] DTS Transmission         | Uptime: [====95%====]     |
| [x] Rider F & Retailer Fee   |                           |
| [x] FortisAlberta Distrib.   |                           |
| [x] GST                      |                           |
|----------------------------------------------------------|
| CURRENT SCENARIO: Energy + DTS + Fortis + 12CP           |
|                                                          |
|  4.82 cents/kWh CAD  |  3.54 cents/kWh USD  | $17.1M/yr |
|                                                          |
| QUICK COMPARE:                                           |
| Energy Only .............. 2.31 cents/kWh                |
| + DTS .................... 3.94 cents/kWh   (+1.63)      |
| + Distribution ........... 4.52 cents/kWh   (+0.58)      |
| + GST .................... 4.75 cents/kWh   (+0.23)      |
| + 12CP Avoidance ......... 4.52 cents/kWh   (-0.23)     |
| + Price Curtailment ...... 4.38 cents/kWh   (-0.14)     |
+----------------------------------------------------------+
```

## Placement

The new component will be inserted in `PowerModelAnalyzer.tsx` between the existing `PowerModelCostProgression` and `PowerModelChargeBreakdown` components. It replaces neither -- both existing components remain for users who prefer the table and funnel views.

## Technical Details

### New File: `src/components/aeso/PowerModelScenarioBuilder.tsx`

**Props:**
- `annual: AnnualSummary` -- all pre-computed totals from the calculator
- `monthly: MonthlyResult[]` -- for recalculating sub-totals
- `cadUsdRate: number`
- `fixedPriceCAD: number`
- `capacityMW: number`

**Logic:**
- Uses the existing `AnnualSummary` component-level totals (totalPoolEnergy, totalOperatingReserve, totalBulkMeteredEnergy, totalRegionalBillingCapacity, totalRegionalMeteredEnergy, totalPodCharges, totalTCR, totalVoltageControl, totalSystemSupport, totalRetailerFee, totalRiderF, totalFortisDemand, totalFortisDistribution, totalGST) to compute each scenario without re-running the calculator.
- Toggle state is local `useState` with boolean flags for each component group.
- The "12CP Avoidance" toggle subtracts `totalBulkCoincidentDemandFull` from the total.
- The "Price Curtailment" toggle subtracts `totalPriceCurtailmentSavings` from the total.
- Quick-compare presets are computed on render by progressively adding component groups.

**UI Components Used:**
- `Checkbox` from radix for toggles
- `Slider` for uptime adjustment
- `Badge` for scenario labels
- `Card` for container
- Existing `cn` utility for conditional styling

### Modified File: `src/components/aeso/PowerModelAnalyzer.tsx`

- Import `PowerModelScenarioBuilder`
- Add it after `PowerModelCostProgression` (around line 382), passing `annual`, `monthly`, `cadUsdRate`, `fixedPriceCAD`, and `capacityMW` props

No changes to calculator logic, tariff constants, or any other existing components.

