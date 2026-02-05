

# Fix Caching Issue for New Tariff Rate Changes

## Problem Identified

You're not seeing the new rate source badges and updated tariff values because of a **stale cache**. The root cause is:

1. **APP_VERSION outdated**: The version is set to `2026.02.03.001` (from Feb 3rd), but we made changes on Feb 5th. The CacheBuster component only triggers a refresh when it detects a version mismatch.

2. **PWA Service Worker**: The Progressive Web App caches assets aggressively, and without a version bump, users with the old cached version won't see updates.

## Solution

### Step 1: Update App Version

Update `src/constants/app-version.ts` to bump the version:

```typescript
export const APP_VERSION = '2026.02.05.001';  // Changed from '2026.02.03.001'
```

This will cause the CacheBuster component to:
- Detect the version mismatch
- Clear all browser caches
- Unregister service workers
- Force a fresh page reload

### Step 2: Immediate Manual Fix (For You Right Now)

While I implement the version bump, you can immediately force a refresh by:

**Option A - Hard Refresh:**
- **Windows/Linux**: Press `Ctrl + Shift + R`
- **Mac**: Press `Cmd + Shift + R`

**Option B - Clear Site Data (if hard refresh doesn't work):**
1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Clear site data** (or **Storage** → **Clear site data**)
4. Refresh the page

## Files to Modify

| File | Change |
|------|--------|
| `src/constants/app-version.ts` | Update `APP_VERSION` to `'2026.02.05.001'` |

## Expected Result

After the version bump is deployed:
- All users will automatically see the cache being cleared
- A toast will briefly appear: "Updating to latest version..."
- The page will reload with the new tariff rate badges and $12.94/MWh values visible

