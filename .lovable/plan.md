
# Plan: Enhanced Metals-API Integration with Price Trends, Alerts, and Market News

## Overview

Leverage additional Metals-API endpoints to provide users with market intelligence, price trends, and volatility awareness to help them make better quoting decisions.

---

## Current State

| Feature | Status |
|---------|--------|
| Live spot prices | Implemented (XCU, XAL, FE, NI) |
| Price caching | 24-hour database cache with 3 calls/day limit |
| Grade-based pricing | Implemented with scrap multipliers |
| Historical data | Not implemented |
| Price trends | Not implemented |
| Market news | Not implemented |

---

## Proposed Enhancements

### 1. Price Trend Sparklines & Change Indicators

Add visual price trend indicators showing 7-day movement:

```text
+----------------------------------+
| COPPER                           |
| $4.52/lb  ↑ +3.2%  [▁▂▃▄▅▆▇]    |
| 7-day trend                      |
+----------------------------------+
```

**Implementation:**
- Use the **Time-Series endpoint** to fetch 7-day historical data
- Call once daily (during first refresh), cache results for 24 hours
- Display mini sparkline chart next to metal prices
- Show percentage change badge (green/red)

### 2. Market Volatility Warning

Show a warning when metal prices are unusually volatile:

```text
+-----------------------------------------------+
| ⚠️ HIGH VOLATILITY                             |
| Copper prices fluctuated 8.5% this week.       |
| Consider locking in prices quickly.            |
+-----------------------------------------------+
```

**Implementation:**
- Use the **Fluctuation endpoint** with `type=last_week`
- Calculate volatility threshold (>5% = high)
- Display warning banner on spreadsheet

### 3. Market News Feed Widget

Surface relevant metal market news:

```text
+-----------------------------------------------+
| 📰 MARKET NEWS                                 |
|-----------------------------------------------|
| • Gold Prices Drop Below $2,300, Copper...    |
|   June 27, 2024                               |
| • Silver Shows Resilience with Monday...      |
|   Aug 14, 2024                                |
+-----------------------------------------------+
```

**Implementation:**
- Use the **News endpoint** with keyword filters ("copper", "aluminum", "steel")
- Cache for 24 hours
- Display in collapsible section on inventory dashboard

### 4. Quote Comparison Tool

Show how today's quote compares to historical values:

```text
+-----------------------------------------------+
| 📊 QUOTE COMPARISON                            |
|-----------------------------------------------|
| Today's Quote:     $659.50                    |
| 30 days ago:       $612.80  (+7.6%)          |
| 90 days ago:       $701.25  (-5.9%)          |
|-----------------------------------------------|
| Market timing: FAVORABLE                      |
+-----------------------------------------------+
```

**Implementation:**
- Use **Historical LME endpoint** for specific date comparisons
- Calculate equivalent quote value using historical prices
- Show trend indicator (favorable/neutral/unfavorable)

### 5. Best/Worst Case Scenario

Use daily high/low data to show quote ranges:

```text
+-----------------------------------------------+
| 💰 TODAY'S QUOTE RANGE                         |
|-----------------------------------------------|
| Conservative (Low):   $623.40                 |
| Your Quote:           $659.50                 |
| Optimistic (High):    $687.20                 |
+-----------------------------------------------+
```

**Implementation:**
- Use **Lowest/Highest endpoint** for today's date
- Apply to all metals in quote
- Show confidence range

---

## API Call Budget Management

Current budget: **2,500 calls/month** (≈83/day)

| Feature | Calls/Day | Monthly Cost | Priority |
|---------|-----------|--------------|----------|
| Current (spot prices) | 3 | 90 | High |
| Time-series (7-day) | 1 | 30 | High |
| Fluctuation (weekly) | 1 | 30 | Medium |
| News (daily) | 1 | 30 | Medium |
| OHLC (daily high/low) | 1 | 30 | Low |
| **TOTAL** | **7** | **210** | - |

This stays well under the 2,500/month limit with 2,290 calls remaining for on-demand refreshes.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/inventory/components/PriceTrendSparkline.tsx` | Mini chart showing 7-day price movement |
| `src/components/inventory/components/MarketVolatilityBanner.tsx` | Warning banner for high volatility periods |
| `src/components/inventory/components/MarketNewsFeed.tsx` | Collapsible news widget |
| `src/components/inventory/components/QuoteComparisonCard.tsx` | Historical quote comparison |
| `src/components/inventory/hooks/useMarketIntelligence.ts` | Hook for fetching/caching market data |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/scrap-metal-pricing/index.ts` | Add `timeseries`, `fluctuation`, `news`, `ohlc` actions |
| `supabase/migrations/new_cache_table.sql` | Add `scrap_metal_market_data` table for historical/news cache |
| `src/components/inventory/components/ScrapMetalSpreadsheet.tsx` | Integrate sparklines and volatility banner |
| `src/components/inventory/components/LivePriceIndicator.tsx` | Add price change percentage badge |
| `src/components/inventory/hooks/useScrapMetalPricing.ts` | Add methods for historical data |

---

## Implementation Priority

### Phase 1 (Immediate - High Value)
1. **Price change indicator** (+/-% badge next to prices)
2. **7-day sparkline charts** for major metals
3. Update edge function with `timeseries` action

### Phase 2 (Near-term - Medium Value)
4. **Market volatility banner** warning
5. **Quote comparison tool** showing 30/90 day comparison
6. **News feed widget** on dashboard

### Phase 3 (Future - Nice to Have)
7. **Best/worst case scenario** using OHLC data
8. **Price alerts** (notify when copper crosses threshold)

---

## Database Schema Addition

```sql
CREATE TABLE scrap_metal_market_data (
  id TEXT PRIMARY KEY DEFAULT 'current',
  
  -- Time series data (7-day history per metal)
  timeseries_data JSONB,
  timeseries_fetched_at TIMESTAMPTZ,
  
  -- Fluctuation data  
  fluctuation_data JSONB,
  fluctuation_fetched_at TIMESTAMPTZ,
  
  -- News data
  news_data JSONB,
  news_fetched_at TIMESTAMPTZ,
  
  -- OHLC data
  ohlc_data JSONB,
  ohlc_fetched_at TIMESTAMPTZ,
  
  -- API usage tracking
  api_calls_today INTEGER DEFAULT 0,
  last_api_call_date DATE
);
```

---

## Technical Details

### Time-Series API Call

```typescript
// Fetch 7-day copper price history
const endDate = new Date();
endDate.setDate(endDate.getDate() - 1); // Yesterday (API requirement)
const startDate = new Date();
startDate.setDate(startDate.getDate() - 8);

const response = await fetch(
  `https://metals-api.com/api/timeseries?access_key=${API_KEY}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&symbols=XCU&base=USD`
);
```

### Fluctuation API Call

```typescript
// Get weekly price change
const response = await fetch(
  `https://metals-api.com/api/fluctuation?access_key=${API_KEY}&type=last_week&symbols=XCU`
);

// Response:
// { change: 0.15, change_pct: 3.2 }
```

### News API Call

```typescript
// Get metal news with keyword filter
const response = await fetch(
  `https://metals-api.com/api/get-news?access_key=${API_KEY}&keyword=copper&page=1`
);
```

---

## User Experience Flow

```text
1. User opens Inventory → Demolition Mode

2. Spreadsheet loads with:
   - Live prices (with cache indicator)
   - Sparkline trends next to each metal type
   - Price change badges (+2.1% this week)

3. If high volatility detected:
   - Yellow warning banner at top
   - "Lock in prices quickly" message

4. Quote Summary shows:
   - Today's calculated value
   - Comparison to 30/90 days ago
   - Market timing indicator

5. Optional: Expand "Market News" section
   - Shows latest metal market articles
   - Links to sources
```

---

## Summary

| Enhancement | API Endpoint | Calls/Day | User Value |
|-------------|--------------|-----------|------------|
| Price trend sparklines | Time-Series | 1 | See if prices trending up/down |
| Change indicators | Fluctuation | 1 | Know if good time to sell |
| Market news | News | 1 | Stay informed on market |
| Quote comparison | Historical LME | 0* | Compare to historical quotes |
| Volatility warning | Fluctuation | 0* | Urgency awareness |

*Reuses data from other calls

Total additional API calls: **3/day** (keeping well under budget)
