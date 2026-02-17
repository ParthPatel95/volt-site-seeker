
# AESO Market Hub Enhancement Plan

## Overview

Consolidate the 11 sidebar views into 6 focused views, add a live Bitcoin Mining Economics panel alongside energy data, and improve the analytical depth across all sections.

## Navigation Consolidation (11 views to 6)

Current sidebar has too many items, several of which are thin wrappers or overlap:

| Current View | Action |
|---|---|
| Market Data | KEEP - primary view |
| Power Model | KEEP - complex standalone tool |
| Generation | MERGE into Market Data (it's just one card showing gen mix) |
| Forecasts | MERGE into Market Data (it's a single forecast panel) |
| AI Predictions | KEEP - has sub-tabs for predictions + training |
| Datacenter Control | KEEP - standalone control center |
| Outages & Alerts | MERGE into Market Data as a section |
| Historical | KEEP as "Analytics" combining Historical + Analytics Export |
| Analytics Export | MERGE into Historical (rename to "Analytics") |
| Dashboards | REMOVE from sidebar (it just links to /app/aeso-dashboards) - add a button in Analytics view instead |
| Telegram Alerts | MERGE into a new "Settings" view (it's a configuration panel) |

### New Sidebar Structure (6 views)

```text
MARKET
  - Market Overview (was Market Data + Generation + Forecasts + Outages)
  - Power Model

INTELLIGENCE
  - AI Predictions
  - Datacenter Control

ANALYTICS
  - Analytics (was Historical + Analytics Export + Dashboards link)
  - Settings (Telegram Alerts config)
```

## Bitcoin Mining Economics Panel (NEW)

Add a "Mining Economics" card section to the Market Overview that shows real BTC mining data alongside energy prices. This is highly relevant for an energy market platform targeting Bitcoin miners.

### Data Sources (100% Real, No Fake Data)

All data from free, public, no-API-key-required endpoints:

| Metric | Source | Endpoint |
|---|---|---|
| BTC Price | Coinbase API | `api.coinbase.com/v2/prices/BTC-USD/spot` |
| Network Hashrate | mempool.space | `mempool.space/api/v1/mining/hashrate/3d` |
| Difficulty | mempool.space | `mempool.space/api/v1/mining/hashrate/3d` |
| Block Height | mempool.space | `mempool.space/api/blocks/tip/height` |
| Block Reward | Calculated | `50 / 2^(floor(height/210000))` |

### Derived Metrics (Calculated from Real Data)

| Metric | Formula |
|---|---|
| Hash Price ($/TH/day) | `(blocksPerDay * blockReward * btcPrice) / (networkHashrate_TH)` |
| Mining Revenue ($/MWh equivalent) | `hashPrice * THs_per_MW / 24` - shows how much BTC revenue 1 MW of mining generates |
| Break-even Energy Cost | `hashPrice * THs_per_MW / 24` vs current AESO pool price |
| Mining Margin | `(miningRevenue - energyCost) / miningRevenue * 100` |

The `useBitcoinNetworkStats` hook already exists and fetches hashrate, difficulty, block height, and BTC price from mempool.space + Coinbase. We extend it to also compute hash price and mining-vs-energy metrics.

### Implementation

1. **Extend `useBitcoinNetworkStats` hook** to add computed fields: `hashPrice`, `hashPriceFormatted`, `dailyBtcPerPH` (daily BTC earned per PH/s)

2. **Create `MiningEconomicsCard` component** - a card that sits in the Market Overview tab showing:
   - BTC Price (live from Coinbase)
   - Hash Price $/TH/day (computed from live data)
   - Network Hashrate (live from mempool.space)
   - Mining Margin indicator comparing mining revenue vs current AESO energy cost
   - All values tagged with "Live" badge when from real APIs, "Fallback" when using cached/default values

3. **Create `EnergyMiningCorrelation` component** - a small analytical widget showing:
   - Current AESO pool price in $/MWh
   - BTC mining revenue per MWh (at current hashrate/price)
   - Simple profit/loss indicator: is it profitable to mine right now given current energy price?
   - Assumes industry-standard efficiency (e.g., S21 Pro at 15 J/TH) for the calculation

## Market Overview Tab Enhancements

The current Market Data tab has good components but they're laid out sequentially with no analytical cohesion. Improvements:

1. **Move Generation Mix** from its own tab into Market Overview as a compact horizontal bar chart below the QuickStatsBar
2. **Move Wind/Solar Forecast** from its own tab into Market Overview below the TradingView chart
3. **Move Outages & Alerts** from its own tab into Market Overview as a collapsible alert banner at the top (only shows when there are active alerts/outages)
4. **Add the Mining Economics Card** after the Hero Price Card row
5. **Remove DataCoverageStatus** from Market Overview (move to Analytics tab - it's an admin/diagnostic tool, not market intelligence)

## Analytics Tab Enhancement

Combine Historical + Analytics Export + Dashboard link into one view:

- Top section: Historical pricing (existing `AESOHistoricalPricing`)
- Middle section: Analytics Export (existing `UnifiedAnalyticsExport`)  
- Bottom: "Create Custom Dashboard" button linking to `/app/aeso-dashboards`
- Move DataCoverageStatus here as a collapsible section

## Technical Details

### Files to Create

| File | Purpose |
|---|---|
| `src/components/aeso/MiningEconomicsCard.tsx` | BTC mining metrics card with hash price, mining margin |
| `src/components/aeso/EnergyMiningCorrelation.tsx` | Energy vs mining profitability indicator |
| `src/components/aeso-hub/tabs/AnalyticsTab.tsx` | Combined Historical + Export + Dashboards |
| `src/components/aeso-hub/tabs/SettingsTab.tsx` | Telegram alerts configuration |

### Files to Modify

| File | Changes |
|---|---|
| `src/hooks/useBitcoinNetworkStats.ts` | Add `hashPrice`, `hashPriceFormatted`, `dailyBtcPerPH` to interface and calculation |
| `src/components/aeso-hub/layout/AESOHubSidebar.tsx` | Update nav groups from 11 items to 6 |
| `src/components/aeso-hub/layout/AESOHubLayout.tsx` | Update VIEW_LABELS for new 6-view structure |
| `src/components/aeso-hub/AESOMarketHub.tsx` | Update tab rendering, pass BTC stats to Market Overview |
| `src/components/aeso-hub/tabs/MarketDataTab.tsx` | Add MiningEconomicsCard, inline Generation/Forecast/Outages, remove DataCoverage |

### Files to Delete (tab wrappers no longer needed)

| File | Reason |
|---|---|
| `src/components/aeso-hub/tabs/GenerationTab.tsx` | Merged into Market Overview |
| `src/components/aeso-hub/tabs/ForecastTab.tsx` | Merged into Market Overview |
| `src/components/aeso-hub/tabs/OutagesAlertsTab.tsx` | Merged into Market Overview |
| `src/components/aeso-hub/tabs/HistoricalTab.tsx` | Replaced by AnalyticsTab |
| `src/components/aeso-hub/tabs/AnalyticsExportTab.tsx` | Replaced by AnalyticsTab |
| `src/components/aeso-hub/tabs/CustomDashboardsTab.tsx` | Link moved into AnalyticsTab |
| `src/components/aeso-hub/tabs/TelegramAlertsTab.tsx` | Replaced by SettingsTab |

### Hash Price Calculation (added to useBitcoinNetworkStats)

```typescript
// Hash Price = daily BTC revenue per TH/s
const blocksPerDay = 144;
const dailyBtcPerTH = (blocksPerDay * blockReward) / (hashrate * 1e6); // hashrate in EH/s = 1e6 TH/s
const hashPrice = dailyBtcPerTH * price; // USD per TH/s per day
```

### Mining vs Energy Calculation (in MiningEconomicsCard)

```typescript
// Industry standard: Antminer S21 Pro = 15 J/TH
const MINER_EFFICIENCY_J_PER_TH = 15;
const TH_PER_MW = 1e6 / MINER_EFFICIENCY_J_PER_TH; // ~66,667 TH/s per MW
const dailyMiningRevenue_per_MW = hashPrice * TH_PER_MW; // USD/day per MW
const hourlyMiningRevenue_per_MWh = dailyMiningRevenue_per_MW / 24; // USD/MWh equivalent
const miningMargin = ((hourlyMiningRevenue_per_MWh - aesoPrice) / hourlyMiningRevenue_per_MWh) * 100;
```

All inputs are from live APIs (mempool.space for hashrate, Coinbase for BTC price, AESO for energy price). The efficiency constant (15 J/TH) is clearly labeled as "Industry Standard - S21 Pro" with a badge.

### Data Source Transparency

Every metric in the Mining Economics card will display a small source badge:
- "Live" (green) - data from real API within last 5 minutes
- "Cached" (yellow) - data from localStorage cache
- "Fallback" (red) - using hardcoded estimates (only when all APIs fail)
