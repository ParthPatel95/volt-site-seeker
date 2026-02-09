

# Fix Telegram Alert Timezone Issues

## Root Cause Analysis

Three issues are causing alerts to show prices "a few hours late":

### 1. Unreliable Timezone Conversion (Primary Cause)
The edge function uses `new Date(date.toLocaleString('en-US', { timeZone: 'America/Edmonton' }))` in multiple places (lines 497, 525, 379). This is a known anti-pattern -- Deno's `Date` constructor does not reliably parse locale-formatted strings, especially on cold starts. This can cause the Mountain Time hour to be off by several hours.

### 2. Duplicate Database Records
Every hour has 2 identical records in `aeso_training_data`. The query fetches 25 records with `LIMIT 25`, which only covers ~12 hours. More critically, `previous` (index 1) is the same hour as `current` (index 0), so `priceChange1h` is always 0%.

### 3. Inconsistent Hour Detection for Scheduled Alerts
`getLastTriggeredHour()` uses the same flawed conversion, causing morning briefings (7 AM) and evening summaries (6 PM) to fire at the wrong Mountain Time hour.

## Solution

### Step 1: Replace toLocaleString Anti-Pattern with Direct UTC Offset Calculation

Create a reliable `toMountainTime()` helper inside the edge function that calculates Mountain Time using a direct UTC offset (UTC-7 for MST, UTC-6 for MDT), matching the approach already used in `src/lib/timezone-utils.ts`.

```typescript
function toMountainTime(date: Date): { hour: number; dayOfWeek: number; isWeekday: boolean; formatted: string } {
  // February = MST (UTC-7). Full DST logic included for year-round correctness.
  const year = date.getUTCFullYear();
  const marchFirst = new Date(Date.UTC(year, 2, 1));
  const secondSundayMarch = 1 + ((7 - marchFirst.getUTCDay()) % 7) + 7;
  const dstStart = new Date(Date.UTC(year, 2, secondSundayMarch, 9, 0, 0)); // 2AM MST = 9AM UTC
  const novFirst = new Date(Date.UTC(year, 10, 1));
  const firstSundayNov = 1 + (novFirst.getUTCDay() === 0 ? 0 : 7 - novFirst.getUTCDay());
  const dstEnd = new Date(Date.UTC(year, 10, firstSundayNov, 8, 0, 0)); // 2AM MDT = 8AM UTC
  
  const isDST = date >= dstStart && date < dstEnd;
  const offsetHours = isDST ? -6 : -7;
  const mt = new Date(date.getTime() + offsetHours * 3600000);
  
  const hour = mt.getUTCHours();
  const dayOfWeek = mt.getUTCDay();
  
  return {
    hour,
    dayOfWeek,
    isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
    formatted: `${mt.getUTCMonth()+1}/${mt.getUTCDate()}/${mt.getUTCFullYear()}, ` +
      `${hour % 12 || 12}:${String(mt.getUTCMinutes()).padStart(2,'0')} ${hour < 12 ? 'AM' : 'PM'} ${isDST ? 'MDT' : 'MST'}`
  };
}
```

### Step 2: Fix All Timezone Conversions in the Edge Function

Replace every occurrence of the anti-pattern:

| Location | Current (broken) | Fixed |
|----------|-----------------|-------|
| Line 497-500 | `new Date(now.toLocaleString('en-US', { timeZone: ... }))` then `.getHours()` | `toMountainTime(now).hour` |
| Line 524-528 | `new Date(dataTimestamp.toLocaleString(...))` then `.getHours()` | `toMountainTime(dataTimestamp).hour` |
| Line 377-380 | `getLastTriggeredHour` uses same pattern | Use `toMountainTime(date).hour` |
| Line 572-576 | `dataTimestamp.toLocaleString(...)` for display | Use `toMountainTime(dataTimestamp).formatted` |
| Line 617-621 | Fallback timestamp formatting | Use `toMountainTime(now).formatted` |

### Step 3: Deduplicate Database Records in Query

Add `DISTINCT ON` equivalent logic to avoid pulling duplicate hourly records:

```typescript
const { data: latestData } = await supabase
  .from('aeso_training_data')
  .select('pool_price, ail_mw, generation_gas, generation_wind, generation_solar, generation_hydro, generation_other, intertie_bc_flow, intertie_sask_flow, intertie_montana_flow, timestamp')
  .order('timestamp', { ascending: false })
  .limit(50); // Fetch more to ensure coverage after dedup

// Deduplicate by hour
const seen = new Set();
const deduped = (latestData || []).filter(d => {
  const hourKey = d.timestamp?.substring(0, 13); // "2026-02-09 21"
  if (seen.has(hourKey)) return false;
  seen.add(hourKey);
  return true;
}).slice(0, 25);
```

This ensures `previous` is actually the prior hour's price, fixing `priceChange1h`.

### Step 4: Add Current Time vs Data Time to Alert Messages

Include both the data timestamp and the current Mountain Time so users can see how fresh the data is:

```
Timestamp format: "2/9/2026, 2:00 PM MST (HE15) | Sent: 2:40 PM MST"
```

## File to Modify

| File | Changes |
|------|---------|
| `supabase/functions/aeso-telegram-alerts/index.ts` | Add `toMountainTime()` helper, replace all `toLocaleString` anti-patterns, deduplicate DB query, enhance timestamp display |

## Expected Outcome

- Alert timestamps will accurately reflect Mountain Time (MST/MDT) regardless of Deno server locale
- Price change calculations will be correct (comparing actual different hours)
- Scheduled alerts (morning briefing, evening summary) will fire at the correct Mountain Time hours
- Alert messages will show both data time and send time for transparency

