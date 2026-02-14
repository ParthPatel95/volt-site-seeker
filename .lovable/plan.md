
# Enhance Power Model Summary Cards: Analytical Cost Progression + Dual Currency

## What Changes

Replace the current flat grid of summary cards with a structured, analytical layout that shows:

1. **Cost Progression Table** -- How the all-in rate builds up step by step:
   - **Base Energy Rate**: The raw energy cost (fixed contract or avg pool price) in cents/kWh
   - **+ Operating Reserve (12.5%)**: Energy + OR surcharge
   - **+ Transmission (DTS)**: Adding bulk metered, regional, POD, TCR, voltage, system support
   - **+ Distribution (Fortis)**: Adding demand charge + volumetric delivery
   - **+ Riders and Fees**: Rider F, retailer fee
   - **+ GST (5%)**: Final all-in rate
   - Each row shows CAD and USD side by side

2. **12CP Impact Column** -- Show the rate "as-is" (no curtailment) vs. "with 12CP avoidance" to quantify the savings from avoiding peak demand charges

3. **Dual Currency Throughout** -- Every dollar value and cents/kWh rate shown in both CAD and USD using the existing `cadUsdRate` parameter

## Detailed Changes

### 1. New Component: `PowerModelCostProgression.tsx`

A table/card showing the cost buildup:

```
| Component               | cents/kWh (CAD) | cents/kWh (USD) | Annual (CAD)  | Annual (USD)  |
|------------------------|-----------------|-----------------|---------------|---------------|
| Energy (Fixed $52/MWh) | 5.20            | 3.80            | $21.1M        | $15.4M        |
| + Operating Reserve    | 5.85            | 4.27            | $23.7M        | $17.3M        |
| + Transmission (DTS)   | 7.12            | 5.20            | $28.8M        | $21.1M        |
| + Distribution (Fortis)| 8.21            | 5.99            | $33.2M        | $24.3M        |
| + Riders & Fees        | 8.41            | 6.14            | $34.1M        | $24.9M        |
| + GST (5%)             | 8.83            | 6.45            | $35.8M        | $26.1M        |
```

Each row is cumulative so users can see exactly where the cost jumps happen. Color-coded bars show relative contribution.

### 2. Update `PowerModelSummaryCards.tsx`

- Add USD values to every card (not just Total Annual Cost)
- All-in Rate card: show both `8.83 CAD cents/kWh` and `6.45 USD cents/kWh`
- Breakeven: show both CAD and USD
- Net Margin: show both currencies
- Curtailment Savings: show both currencies
- Hosting Revenue: show both currencies

### 3. Update `PowerModelChargeBreakdown.tsx`

- Add a USD column next to the existing CAD cents/kWh column in the per-kWh breakdown table
- USD conversion uses `annual.avgPerKwhUSD / annual.avgPerKwhCAD` ratio (which equals `params.cadUsdRate`)

### 4. Pass `cadUsdRate` to Components

The `PowerModelSummaryCards` and `PowerModelChargeBreakdown` components need access to `cadUsdRate` (currently only available in the calculator hook). Add it as a prop from the parent `PowerModelAnalyzer`.

## Files to Modify

1. **`src/components/aeso/PowerModelCostProgression.tsx`** -- New component showing cumulative cost buildup table with dual currency
2. **`src/components/aeso/PowerModelSummaryCards.tsx`** -- Add USD to all cards
3. **`src/components/aeso/PowerModelChargeBreakdown.tsx`** -- Add USD column
4. **`src/components/aeso/PowerModelAnalyzer.tsx`** -- Pass `cadUsdRate` prop to child components, integrate new progression component
