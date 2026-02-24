
# Mining vs. Hash Purchase Optimizer -- New AESO Hub Module

## Overview
A new "Mining Economics" tab in the AESO Hub that combines historical AESO energy pricing with live Bitcoin network data to answer: **"At what energy price does it make sense to mine, and when should you buy hashrate instead?"**

## Core Concept
For any given hour, a miner has two options:
1. **Mine**: Consume electricity at the AESO pool price to produce BTC
2. **Don't mine (curtail)**: Shut down and, if desired, purchase hashrate on the open market (NiceHash-style marketplace pricing)

The tool backtests this decision across real historical AESO data to show optimal strategies.

## Data Sources (100% Real -- No Fake Data)

| Data | Source | Method |
|---|---|---|
| Hourly AESO pool prices (Jun 2022 -- present) | `aeso_training_data` table | 34,545 real records in database |
| Live BTC price | Coinbase API | Existing `useBitcoinNetworkStats` hook |
| Live network hashrate | mempool.space API | Existing hook |
| Live difficulty | mempool.space API | Existing hook |
| Block reward (3.125 BTC) | Calculated from block height | Existing logic |
| DTS transmission charges | Verified 2026-015T Bill Estimator | `tariff-rates.ts` constants |
| Miner efficiency (15 J/TH) | Industry standard S21 Pro spec | `mining-data.ts` constants |

**Important constraint**: Historical BTC price and hashrate data is NOT available in the database. The tool will clearly label its approach: it uses **current** BTC network conditions applied against **historical** energy prices to answer "given today's mining economics, which past hours would have been profitable?" This is a standard backtesting methodology and will be clearly disclosed in the UI.

## UI Sections

### Section 1: Facility Configuration Panel
Inputs (with sensible defaults from existing constants):
- Capacity: MW deployed (default 45 MW)
- Miner model: dropdown from `ASIC_SPECS` (default S21 Pro, 15 J/TH)
- Pool fee: % (default 1.5%)
- All-in energy rate override: optional manual $/MWh (otherwise uses AESO pool + DTS adder)
- Hash purchase price: $/TH/day -- user input for comparison (NiceHash marketplace reference)
- Date range selector: pick from available historical data (Jun 2022 -- present)

### Section 2: Break-Even Analysis Dashboard
Using live BTC network data, calculate and display:
- **Break-even energy price** ($/MWh): the max pool price where mining is profitable
- **Current AESO pool price** vs break-even (visual gauge)
- **Mining margin** at current price
- **Hash price** ($/TH/day from live data) vs self-mining cost per TH/day

Formula (reusing existing `btcRoiMath.ts` logic):
```
Break-even $/MWh = (hashPrice * TH_per_MW * 24) - poolFee overhead
where TH_per_MW = 1,000,000 / efficiency_J_per_TH
```

### Section 3: Historical Backtest Results
Query `aeso_training_data` for the selected date range and for each hour calculate:
- **Mining revenue**: using current BTC network stats (disclosed as "current conditions backtest")
- **All-in energy cost**: AESO pool price + DTS transmission adder ($12.94/MWh) + DFO charges
- **Net profit/loss per MWh**
- **Decision**: MINE (profitable) or CURTAIL (unprofitable)

Display as:
- **Profitability heatmap**: Month x Hour-of-Day grid colored by average net margin
- **Summary stats**: % of hours profitable, average margin when mining, total profit over period
- **Optimal curtailment threshold**: the pool price above which shutting down maximizes returns (reuses existing Power Model logic pattern)

### Section 4: Mine vs. Buy Hash Comparison
Side-by-side comparison for a given period:
- **Self-mining cost**: total energy cost for the period (from historical AESO data)
- **Equivalent hash purchased**: what the same capital would buy on the hashrate marketplace at the user-specified $/TH/day rate
- **BTC earned**: self-mining output vs purchased hash output
- **Verdict**: which strategy yielded more BTC per dollar

Key metric: **"Indifference energy price"** -- the AESO pool price at which self-mining and buying hash produce equal BTC per dollar spent.

```
Indifference price = hashPurchaseRate * TH_per_MW * 24 / (1000 * cadToUsd)
```
(Converted to CAD/MWh for AESO comparison)

### Section 5: Monthly Strategy Summary Table
A table showing each month in the selected range:
- Average pool price (real from DB)
- Hours profitable (count)
- Hours curtailed (count)
- Total mining revenue (at current BTC conditions)
- Total energy cost
- Net profit
- Comparison: would buying hash have been better?

### Section 6: Source Attribution
All figures linked to sources with badges:
- "Live from mempool.space" for BTC network data
- "Live from Coinbase" for BTC price
- "Historical from AESO" for pool prices
- "Verified 2026-015T" for DTS rates
- Clear disclosure: "Backtest applies current BTC network conditions to historical energy prices"

## Files to Create

### 1. `src/components/aeso/MiningHashOptimizer.tsx` (New)
Main component with all 6 sections. Uses:
- `useBitcoinNetworkStats()` for live BTC data
- Direct Supabase query to `aeso_training_data` for historical AESO prices
- `AESO_TARIFF_2026.TRANSMISSION_ADDER_CAD_MWH` for all-in cost
- `ASIC_SPECS` from `mining-data.ts` for miner efficiency
- Recharts for heatmap and charts

### 2. `src/components/aeso-hub/tabs/MiningEconomicsTab.tsx` (New)
Tab wrapper following the existing pattern (like `EnergizationTab.tsx`).

## Files to Modify

### 3. `src/components/aeso-hub/layout/AESOHubSidebar.tsx`
- Add `'mining-economics'` to `AESOHubView` type union
- Add nav item under "Intelligence" group: `{ id: 'mining-economics', label: 'Mining Economics', icon: Bitcoin }`

### 4. `src/components/aeso-hub/layout/AESOHubLayout.tsx`
- Add `'mining-economics': 'Mining Economics'` to `VIEW_LABELS`

### 5. `src/components/aeso-hub/AESOMarketHub.tsx`
- Import and render `MiningEconomicsTab` when `activeTab === 'mining-economics'`

## Technical Details

### Historical Data Query
```sql
SELECT 
  date_trunc('hour', timestamp) as hour,
  AVG(pool_price) as avg_pool_price,
  MAX(ail_mw) as peak_demand
FROM aeso_training_data
WHERE timestamp >= $startDate AND timestamp <= $endDate
  AND pool_price IS NOT NULL
GROUP BY date_trunc('hour', timestamp)
ORDER BY hour
```
This uses the 34,545+ real records already in the database.

### Core Calculation Logic
Reuses existing patterns from `btcRoiMath.ts` and `MiningEnergyAnalytics.tsx`:
```typescript
const TH_PER_MW = 1_000_000 / minerEfficiency; // e.g., 66,667 for 15 J/TH
const hourlyBtcPerMW = (TH_PER_MW / (networkHashrateEH * 1e6)) * 144 * blockReward / 24;
const hourlyRevenuePerMW = hourlyBtcPerMW * btcPrice;
const allInEnergyCost = (poolPriceCAD + transmissionAdder) * cadToUsd; // USD/MWh
const netMargin = hourlyRevenuePerMW - allInEnergyCost;
const decision = netMargin > 0 ? 'MINE' : 'CURTAIL';
```

### No New Edge Functions Needed
All data sources are already available:
- AESO historical: direct Supabase client query to `aeso_training_data`
- BTC network: existing `useBitcoinNetworkStats` hook (client-side API calls)
- Tariff constants: imported from `tariff-rates.ts`
