

# Plan: Add Live Metal Prices & Market Intelligence to Main Inventory Dashboard

## Overview

Enhance the main Inventory page with a prominent **Metals Market Ticker Bar** showing live prices for all supported metals (precious + industrial), plus a **Market Intelligence Panel** with news feed, sparklines, and volatility alerts - visible without needing to run AI scans.

---

## Current State

| Feature | Location | Visible On Main Page? |
|---------|----------|----------------------|
| Live scrap prices | ScrapMetalSpreadsheet | No (only after AI scan) |
| Market news feed | ScrapMetalSpreadsheet | No (only after AI scan) |
| Volatility warnings | ScrapMetalSpreadsheet | No (only after AI scan) |
| Price trends | ScrapMetalSpreadsheet | No (only after AI scan) |
| Quote comparison | ScrapMetalSpreadsheet | No (only after AI scan) |

---

## Proposed Changes

### 1. Metals Market Ticker Bar (Top of Dashboard)

Add a horizontal scrolling ticker showing live spot prices for **all metals** the API provides:

```text
+---------------------------------------------------------------------------------+
| GOLD        SILVER      PLATINUM   PALLADIUM   COPPER      ALUMINUM   STEEL    |
| $2,347.80   $27.45      $967.20    $1,012.50   $4.52       $1.15      $0.14    |
| +0.8%       -1.2%       +0.3%      -2.1%       +3.2%       +0.5%      -0.4%    |
+---------------------------------------------------------------------------------+
```

**Metals to include:**
- **Precious Metals**: Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD)
- **Industrial Metals**: Copper (XCU), Aluminum (XAL), Iron (FE), Nickel (NI)

### 2. Market Intelligence Cards (Dashboard Tab)

Add a new section to the InventoryDashboard with 3 cards:

| Card | Content |
|------|---------|
| **Price Trends** | 7-day sparklines for key metals with change percentages |
| **Market News** | Latest 3-5 commodity news articles (collapsible) |
| **Volatility Alert** | Warning banner when any metal moves >5% (dismissible) |

### 3. Sidebar Market Summary (Optional)

Add a compact version of metal prices to the sidebar or header area, always visible when browsing inventory.

---

## API Symbol Mapping

The Metals-API supports these symbols that we'll now fetch:

| Symbol | Metal | Unit |
|--------|-------|------|
| XAU | Gold | Troy oz |
| XAG | Silver | Troy oz |
| XPT | Platinum | Troy oz |
| XPD | Palladium | Troy oz |
| XCU | Copper | Troy oz |
| XAL | Aluminum | Troy oz |
| FE | Iron | Metric ton |
| NI | Nickel | Troy oz |

**API Call Budget Impact:**
- Current: 3 spot price calls/day + 4 market data calls/day = 7 calls/day
- No additional calls needed - just expanding the symbols list

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/inventory/components/MetalsMarketTicker.tsx` | Horizontal ticker bar showing all metal prices |
| `src/components/inventory/components/MarketIntelligencePanel.tsx` | Dashboard panel with trends, news, volatility |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/inventory/InventoryPage.tsx` | Add MetalsMarketTicker above tabs |
| `src/components/inventory/components/InventoryDashboard.tsx` | Add MarketIntelligencePanel section |
| `src/components/inventory/hooks/useMarketIntelligence.ts` | Expand to include precious metals |
| `src/components/inventory/hooks/useScrapMetalPricing.ts` | Add precious metals to spot prices |
| `supabase/functions/scrap-metal-pricing/index.ts` | Add XAU, XAG, XPT, XPD to API calls |

---

## Implementation Details

### MetalsMarketTicker Component

```text
+--[ Live Metals Prices ]------------------------------------------------+
| [Gold Chip] [Silver Chip] [Platinum Chip] [Palladium Chip] ...         |
|  $2,347     $27.45        $967.20         $1,012                       |
|  +0.8%      -1.2%         +0.3%           -2.1%                        |
+------------------------------------------------------------------------+
```

Features:
- Horizontal scroll on mobile
- Click to expand details
- Live/Cached/Offline status indicator
- Refresh button
- Auto-updates from the `useMarketIntelligence` hook

### MarketIntelligencePanel Component

Displays on the Dashboard tab below stats:

```text
+--[ Market Intelligence ]-----------------------------------------+
|                                                                   |
| [Volatility Warning Banner - if active]                          |
|                                                                   |
| +--[ Price Trends (7 Days) ]--+  +--[ Market News ]------------+ |
| | COPPER   [sparkline] +3.2%  |  | JPMorgan initiates coverage |
| | ALUMINUM [sparkline] +0.5%  |  | 2 hours ago                 |
| | STEEL    [sparkline] -0.4%  |  |                             |
| | GOLD     [sparkline] +0.8%  |  | Silver shows resilience...  |
| +-----------------------------+  +-----------------------------+ |
+-------------------------------------------------------------------+
```

### Edge Function Updates

Add precious metals to the API calls:

```typescript
// Current symbols
const INDUSTRIAL_SYMBOLS = 'XCU,XAL,FE,NI';

// New symbols (add precious metals)
const ALL_SYMBOLS = 'XAU,XAG,XPT,XPD,XCU,XAL,FE,NI';
```

Price conversions:
- Precious metals: Troy oz to grams/oz for display
- Industrial metals: Keep current conversions (to $/lb)

### useMarketIntelligence Hook Updates

Extend the hook to:
1. Include precious metals in spot prices
2. Provide formatted prices for display (oz, gram, lb)
3. Return both raw API data and user-friendly formatted data

---

## User Experience Flow

```text
1. User navigates to /app/inventory

2. Sees "Live Metals Prices" ticker at top
   - All 8 metals with current prices
   - Green/red percentage changes
   - "Live" indicator with last update time

3. Dashboard tab shows:
   - Existing stats (Total Items, In Stock, etc.)
   - NEW: Market Intelligence section
     - Volatility warning (if applicable)
     - 7-day price trends with sparklines
     - Market news feed (collapsed by default)

4. User can:
   - Hover over metal chips for more details
   - Click refresh to get latest prices
   - Expand news to read articles
   - Dismiss volatility warning

5. All data uses cached prices (24h TTL)
   - No additional API calls on page navigation
   - Respects daily call limits
```

---

## Technical Considerations

### Caching Strategy
- No changes to current caching (24-hour database-backed cache)
- Precious metals added to same cache structure
- Same daily call limits apply

### Error Handling
- If precious metals fail, still show industrial metals
- Graceful fallback to cached data
- Show "Offline" indicator if no data available

### Mobile Responsiveness
- Ticker horizontally scrolls on mobile
- Market Intelligence cards stack vertically
- News feed collapses to save space

---

## Summary

| Enhancement | Location | User Benefit |
|-------------|----------|--------------|
| Metals Market Ticker | Top of Inventory page | See all metal prices at a glance |
| Price Trends | Dashboard tab | Understand market direction |
| Market News | Dashboard tab | Stay informed on market |
| Volatility Alerts | Dashboard tab | Know when to act quickly |

**No additional API calls required** - just expanding the symbols in existing calls.

