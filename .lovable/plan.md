
# Plan: Fix Telegram Price Timestamp Delay

## Problem Identified

The Telegram alerts are showing prices with **incorrect timestamps** (1-2 hours delayed). The root cause is in the `aeso-telegram-alerts` edge function:

**Current behavior (WRONG):**
```typescript
timestamp: now.toLocaleString('en-US', { timeZone: 'America/Edmonton', ... })
hour: currentHour  // derived from `now`
```

The function uses the **current execution time** (`now`) instead of the **actual timestamp from the database record** (`current?.timestamp`).

## Root Cause Analysis

1. **Database stores correct timestamps**: Records have accurate timestamps from when the price was valid (e.g., `2026-01-27 01:00:14.904+00`)

2. **Alert function ignores the data timestamp**: It uses `now` (function execution time) for display, creating a mismatch

3. **AESO API lag**: The AESO Pool Price API reports prices in "hour-ending" format (HE01-HE24), meaning the "current" price is technically for the previous completed hour

## Solution

Modify `supabase/functions/aeso-telegram-alerts/index.ts` to:

1. **Use the database record's timestamp** instead of `now` for display
2. **Extract the hour from the data timestamp** for scheduled alert logic
3. **Handle AESO hour-ending format** correctly (the price for HE17 is the price that was in effect from 16:00-17:00)

## Technical Changes

### File: `supabase/functions/aeso-telegram-alerts/index.ts`

**Change 1: Extract data timestamp (around line 512-514)**
```typescript
// BEFORE
const current = latestData?.[0];
const previous = latestData?.[1];
const currentPrice = current?.pool_price || 0;

// AFTER
const current = latestData?.[0];
const previous = latestData?.[1];
const currentPrice = current?.pool_price || 0;
const dataTimestamp = current?.timestamp ? new Date(current.timestamp) : now;
const dataTimeMtn = new Date(dataTimestamp.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
const dataHour = dataTimeMtn.getHours();
```

**Change 2: Use data timestamp for display (around line 562-566)**
```typescript
// BEFORE
timestamp: now.toLocaleString('en-US', { 
  timeZone: 'America/Edmonton',
  dateStyle: 'short',
  timeStyle: 'short'
}),

// AFTER
timestamp: dataTimestamp.toLocaleString('en-US', { 
  timeZone: 'America/Edmonton',
  dateStyle: 'short',
  timeStyle: 'short'
}) + ' (HE' + (dataHour + 1) + ')',  // Add hour-ending notation for clarity
```

**Change 3: Keep execution hour for scheduled alerts but add data hour (around line 586)**
```typescript
// BEFORE
hour: currentHour,

// AFTER  
hour: currentHour,       // Keep for scheduled alert timing (morning/evening briefings)
dataHour: dataHour,      // Add data hour for logging/debugging
priceValidFor: `HE${String(dataHour + 1).padStart(2, '0')}`,  // Hour-ending the price applies to
```

**Change 4: Add indicator showing data freshness**
```typescript
// In the template data passed to formatMessage, add:
dataAge: Math.round((now.getTime() - dataTimestamp.getTime()) / 60000)  // minutes since price was recorded
```

## Message Template Updates

Update the message templates to clarify the timestamp represents when the price was valid:

```typescript
// Example for price_high template (line 82-88)
price_high: `🔴 <b>AESO High Price Alert</b>

💰 Pool Price: <b>$\${price}/MWh</b> (\${priceValidFor})
📈 Above threshold of $\${threshold}/MWh

⚠️ Consider reducing load or shifting operations
🕐 Price valid for: \${timestamp}`,
```

## Expected Outcome

| Before | After |
|--------|-------|
| "Time: 1/26/26, 5:00 PM" (wrong - shows execution time) | "Time: 1/26/26, 3:00 PM (HE16)" (correct - shows price validity time) |
| User confused about which hour the price applies to | Clear "HE16" notation indicates price was for 15:00-16:00 hour |

## Files to Modify

1. `supabase/functions/aeso-telegram-alerts/index.ts` - Main fix for timestamp handling

## Considerations

- **Scheduled alerts** (morning/evening briefings): Continue using `currentHour` for trigger timing, but display `dataHour` in the message
- **Data freshness warning**: If `dataAge` > 30 minutes, consider adding a warning that data may be stale
- **AESO hour-ending convention**: Prices are reported for "hour-ending" (HE), so HE17 = price from 16:00-17:00
