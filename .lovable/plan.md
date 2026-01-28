
# Plan: Enhance Grid Alerts Tab with Auto-Refresh & Data Management

## Current State Analysis

### What Exists
| Component | Current Behavior |
|-----------|-----------------|
| `useAESOGridAlerts` hook | Manual fetch only, no auto-refresh |
| `aeso-grid-alerts` edge function | Fetches from AESO RSS feed, stores in `aeso_grid_alerts` table |
| `GridAlertStatusCard` component | Displays alerts with status, timeline, and statistics |
| `TwelveCPAnalyticsTab` | Renders Grid Alerts tab but only fetches on mount |
| Database | Only 2 records from Sept 2025, no cleanup logic |

### Issues Identified
1. **No auto-refresh** - Alerts only fetched when user manually clicks refresh or tab mounts
2. **Stale data** - Old alerts (from months ago) still showing as "active"
3. **No periodic polling** - Users must manually refresh to see new alerts
4. **No data cleanup** - Old/expired alerts accumulate in database
5. **No countdown to next refresh** - Users don't know when data will update

---

## Technical Implementation

### 1. Update `useAESOGridAlerts.ts` Hook

Add auto-refresh functionality with 15-minute polling interval:

```typescript
export function useAESOGridAlerts(autoRefreshInterval: number = 15 * 60 * 1000) {
  // ... existing state ...
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  
  // Auto-fetch on mount and every 15 minutes
  useEffect(() => {
    fetchGridAlerts();
    
    const interval = setInterval(() => {
      fetchGridAlerts();
    }, autoRefreshInterval);
    
    // Update next refresh countdown
    setNextRefresh(new Date(Date.now() + autoRefreshInterval));
    
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);
  
  // Return nextRefresh for UI countdown
  return {
    // ... existing returns ...
    nextRefresh,
    autoRefreshInterval
  };
}
```

### 2. Update Edge Function `aeso-grid-alerts/index.ts`

Add logic to mark old alerts as expired and clean up stale data:

```typescript
// After fetching RSS feed, mark alerts older than 7 days as expired
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

await supabase
  .from('aeso_grid_alerts')
  .update({ 
    status: 'expired',
    updated_at: new Date().toISOString()
  })
  .eq('status', 'active')
  .lt('published_at', sevenDaysAgo.toISOString());

// Delete alerts older than 90 days to prevent database bloat
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

await supabase
  .from('aeso_grid_alerts')
  .delete()
  .lt('published_at', ninetyDaysAgo.toISOString());
```

### 3. Enhance `GridAlertStatusCard.tsx` Component

Add visual enhancements for the auto-refresh feature:

```text
+--------------------------------------------------------------------+
| Grid Status: NORMAL                                 [Refresh]      |
| Adequate reserves: 15.2% margin above minimum                      |
|                                                                    |
| ⏱️ Next auto-refresh in: 14:23                                     |
| 📡 Source: AESO Grid Alert RSS Feed                                |
+--------------------------------------------------------------------+
```

**New Features:**
- Countdown timer showing time until next auto-refresh
- Visual indicator when refresh is in progress
- "Last updated X minutes ago" with relative time
- Badge showing auto-refresh is enabled

### 4. Update `TwelveCPAnalyticsTab.tsx`

Remove manual `useEffect` fetch since hook now handles it:

```typescript
// Before:
useEffect(() => {
  fetchGridAlerts();
}, []);

// After: Remove - hook handles auto-fetch internally
```

### 5. Add Countdown Timer Component

Create a reusable countdown component for next refresh:

```typescript
function RefreshCountdown({ nextRefresh, isLoading }: { nextRefresh: Date | null, isLoading: boolean }) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    if (!nextRefresh) return;
    
    const tick = () => {
      const diff = nextRefresh.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Refreshing...');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextRefresh]);
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="w-3 h-3" />
      <span>Auto-refresh: {isLoading ? 'Updating...' : timeLeft}</span>
    </div>
  );
}
```

---

## Database Cleanup Strategy

### Alert Status Lifecycle
| Status | Definition | Retention |
|--------|-----------|-----------|
| `active` | Currently ongoing alert | Indefinite while active |
| `ended` | Alert has ended (confirmed by AESO) | Keep for 90 days |
| `expired` | Marked stale by system (>7 days active) | Keep for 90 days |

### Cleanup Rules (executed on each fetch)
1. Mark alerts as `expired` if:
   - Status is `active` AND
   - `published_at` is older than 7 days
2. Delete alerts if:
   - `published_at` is older than 90 days

This ensures:
- Fresh data for recent alerts
- Historical context for the past 90 days
- No database bloat from ancient alerts

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAESOGridAlerts.ts` | Add auto-refresh interval, next refresh countdown, cleanup on unmount |
| `supabase/functions/aeso-grid-alerts/index.ts` | Add expire logic for old alerts, delete very old alerts |
| `src/components/aeso/GridAlertStatusCard.tsx` | Add countdown timer, auto-refresh indicator, enhanced status display |
| `src/components/aeso/TwelveCPAnalyticsTab.tsx` | Remove manual fetch, rely on hook's auto-refresh |

---

## User Experience Improvements

### Visual Indicators
| Element | Purpose |
|---------|---------|
| Countdown timer | Shows "Next refresh: 14:23" |
| Pulsing dot | Indicates auto-refresh is active |
| Loading spinner | Shows when refresh is in progress |
| Last updated | Shows "Updated 3 min ago" |

### Notification on Alert Change
When a new alert is detected or status changes:
- Toast notification: "New grid alert detected: [Title]"
- Badge pulse animation on tab

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| RSS feed down | Use cached database alerts, show error message |
| No new alerts in RSS | Keep existing database records, don't mark as expired |
| User manually refreshes | Reset countdown timer, fetch immediately |
| Tab not visible | Continue polling (data stays fresh on return) |
| Very old "active" alerts | Auto-marked as expired after 7 days |

---

## Summary

| Enhancement | Implementation |
|-------------|---------------|
| Auto-refresh every 15 mins | `useEffect` with `setInterval` in hook |
| Countdown timer | Real-time countdown component |
| Expire old active alerts | Edge function marks alerts >7 days as expired |
| Delete ancient alerts | Edge function removes alerts >90 days |
| Loading indicators | Spinner and "Updating..." text during fetch |
| Visual refresh status | "Last updated X min ago" timestamp |
