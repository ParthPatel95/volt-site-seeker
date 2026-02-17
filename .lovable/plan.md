

# Redesign: Market Intelligence Section + Enhanced Mining Analytics

## Problem (from screenshot)

1. **Mining Economics card text overlaps** -- Hash Price and Mining Rev/MWh values crash into each other ("$0.0289/TH/d$80.35")
2. **Generation Mix card has dead space** -- just a bar chart with 60% empty whitespace below
3. **Mining analytics are surface-level** -- only shows 4 metrics + margin, no cross-referencing of AESO energy data with BTC mining data
4. **Layout is unbalanced** -- two side-by-side cards with very different content density

## Redesign Approach

Replace the current 2-column (Generation Mix | Mining Economics) layout with a single full-width **"Energy x Mining Intelligence"** panel that combines both datasets into one cohesive analytical view.

### New Layout Structure

```text
+------------------------------------------------------------------+
| Generation Mix (compact bar + legend, same as before)             |
+------------------------------------------------------------------+
| MINING & ENERGY ANALYTICS (full-width card)                       |
|                                                                   |
| Row 1: Core BTC Metrics (4 cols)                                  |
| [BTC Price] [Hashrate] [Hash Price] [Difficulty]                  |
|                                                                   |
| Row 2: Energy-Mining Cross Analytics (4 cols)                     |
| [Mining Rev    ] [Energy Cost   ] [Net Profit    ] [Break-even   ]|
| [$/MWh         ] [$/MWh (AESO)  ] [$/MWh         ] [Max $/MWh   ]|
|                                                                   |
| Row 3: Profitability Bar + Key Ratios (inline)                    |
| [===========MARGIN BAR===========] [Cost-to-Mine] [Sats/kWh]     |
|                                                                   |
| Row 4: Network Info (compact footer)                              |
| Block: 937,036 | Reward: 3.125 BTC | Halving: ~784d | LIVE badge |
+------------------------------------------------------------------+
```

### New Analytics (all calculated from real live data)

| Metric | Formula | Data Source |
|---|---|---|
| Break-even Energy Price | `hashPrice * TH_PER_MW / 24` | BTC: mempool.space + Coinbase, converted to the max energy price where margin = 0 |
| Cost to Mine 1 BTC | `energyCostUsd / (dailyBtcPerTH * TH_PER_MW)` per day, then * days-to-mine | AESO pool price + BTC network stats |
| Sats per kWh | `(dailyBTC_per_MW / 24) * 1e8 / 1000` | Hash price + AESO load |
| Net Profit per MWh | `miningRevenue - energyCost` in $/MWh | Both sources combined |
| Energy Cost Ratio | `energyCost / miningRevenue * 100` | Shows what % of mining revenue goes to energy |
| Daily Revenue per MW | `hashPrice * TH_PER_MW` | Scale to facility-level revenue |

All formulas use:
- BTC Price from Coinbase API (live)
- Hashrate/Difficulty from mempool.space (live)
- Energy price from AESO pool price (live, passed as prop)
- Miner efficiency constant: 15 J/TH (S21 Pro, clearly labeled)

### Generation Mix Enhancement

Move it out of a card into a compact inline bar directly above the mining panel -- saves vertical space and visually connects it to the analytics below. Keep the tooltips.

## Technical Details

### File: `src/components/aeso/MiningEconomicsCard.tsx` (full rewrite)

**Rename to** `MiningEnergyAnalytics.tsx` for clarity.

New component structure:
- Accepts `currentAesoPrice` (CAD/MWh) and optional `cadToUsd` rate
- Uses `useBitcoinNetworkStats()` hook (unchanged, already provides all needed BTC data)
- Calculates all new derived metrics internally
- Full-width card with responsive grid (4 cols on desktop, 2 cols on mobile)

Key calculations added:
```typescript
// Break-even: the max energy price where mining still profits
const breakEvenUsdPerMWh = hourlyMiningRevenue_per_MWh; // margin = 0 at this point

// Cost to mine 1 BTC (energy cost only)
const dailyBtcPerMW = stats.dailyBtcPerPH / 1000 * TH_PER_MW / 1e3; 
// Simpler: dailyBTC = hashPrice * TH_PER_MW (in $ terms), so:
const costToMine1BTC = dailyBtcPerMW > 0 
  ? (energyCostUsd * 24) / dailyBtcPerMW 
  : Infinity;

// Sats per kWh consumed
const dailyBtcForOneMW = (stats.hashPrice * TH_PER_MW) / stats.price; // BTC/day/MW
const satsPerKwh = (dailyBtcForOneMW * 1e8) / (24 * 1000); // 1 MW = 1000 kWh/h

// Energy cost as % of revenue
const energyCostRatio = hourlyMiningRevenue_per_MWh > 0 
  ? (energyCostUsd / hourlyMiningRevenue_per_MWh) * 100 
  : 100;
```

Visual margin bar:
```typescript
// A horizontal bar showing energy cost (red portion) vs profit (green portion)
// Width proportional to energyCostRatio
<div className="h-3 rounded-full overflow-hidden flex bg-muted">
  <div className="bg-red-500 h-full" style={{ width: `${Math.min(energyCostRatio, 100)}%` }} />
  <div className="bg-green-500 h-full flex-1" />
</div>
```

### File: `src/components/aeso-hub/tabs/MarketDataTab.tsx`

Changes to Zone 2 (Market Intelligence):
1. Replace the `grid grid-cols-1 lg:grid-cols-2` containing Generation Mix card + MiningEconomicsCard
2. Instead: render Generation Mix as a compact standalone section (no card wrapper, just the bar + legend)
3. Below it: render the new full-width `MiningEnergyAnalytics` component
4. Update import from `MiningEconomicsCard` to `MiningEnergyAnalytics`

### File: `src/hooks/useBitcoinNetworkStats.ts`

No changes needed -- it already provides `hashPrice`, `dailyBtcPerPH`, `price`, `hashrate`, `blockHeight`, `blockReward`, `nextHalvingDays`, and `difficulty`.

### Files Summary

| File | Action |
|---|---|
| `src/components/aeso/MiningEconomicsCard.tsx` | Delete |
| `src/components/aeso/MiningEnergyAnalytics.tsx` | Create -- full rewrite with all new analytics |
| `src/components/aeso-hub/tabs/MarketDataTab.tsx` | Modify -- restructure Zone 2 layout, update imports |

### Responsiveness

- 4-column grids become 2-column on mobile (`grid-cols-2 lg:grid-cols-4`)
- Network footer becomes `flex-wrap` on mobile
- All text uses `text-sm sm:text-base lg:text-lg` scaling
- Margin bar is always full-width

### Dark Mode

All colors use Tailwind semantic tokens (`text-foreground`, `bg-muted`, `border-border`) plus explicit `dark:` variants for colored elements (`bg-green-500/10 dark:bg-green-500/20`).

