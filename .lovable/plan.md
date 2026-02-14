

# Add kWh With and Without Savings to Monthly Cost Summary

## What Changes

The Monthly Cost Summary table currently shows only the **actual** MWh consumed (after curtailment). The enhancement adds a comparison showing what consumption **would have been** at full capacity (no curtailment), so users can see the energy they avoided consuming.

## Design

Add two columns to the Monthly Cost Summary table:

| Column | Description |
|--------|-------------|
| **MWh (Actual)** | Current `m.mwh` -- energy consumed after curtailment shutdowns |
| **MWh (Full)** | `m.totalHours * capacityMW` -- energy that would be consumed with no shutdowns |

The "Full" value is simply `totalHours * capacity` for each month. The delta (Full - Actual) represents curtailed energy. The annual footer row shows the same comparison.

Additionally, add a small inline indicator showing the percentage of potential energy that was curtailed (e.g., "4.8% avoided").

## Technical Details

### File: `src/components/aeso/PowerModelChargeBreakdown.tsx`

1. Accept a new prop `capacityMW` (number) to calculate "full capacity" MWh per month
2. Replace the single "MWh" column (line 206) with two columns:
   - **MWh (Actual)**: existing `m.mwh`
   - **MWh (No Curtail)**: `m.totalHours * capacityMW` -- the "what if" scenario
3. Add a small muted text showing the delta: e.g., `-1,620 MWh` or `-4.8%`
4. Update the annual footer row similarly: show `annual.totalMWh` vs `annual.totalHours * capacityMW`

### File: `src/components/aeso/PowerModelAnalyzer.tsx`

Pass `capacityMW` prop (from `params.contractedCapacityMW`) down to `PowerModelChargeBreakdown`.

### No calculator changes needed

The `totalHours` and `capacityMW` are already available -- the "full capacity" MWh is a simple multiplication done in the component.
