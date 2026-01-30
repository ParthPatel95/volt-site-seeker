
# Plan: Force Cache Clear on App Version Mismatch

## Problem Confirmed

Looking at your screenshot, I can see the sidebar shows:
- ✅ Overview, Markets, Analysis, Settings sections
- ✅ "Build Management" under Operations
- ❌ "Inventory" is missing under Operations

But in the code (line 78 of Sidebar.tsx), Inventory IS present:
```typescript
{ path: '/app/inventory', icon: Package, label: 'Inventory', permission: '' },
```

**This proves your browser is running OLD cached JavaScript** that doesn't include the Inventory link.

---

## Solution: Force Immediate Cache Clear

I'll implement an **aggressive cache-busting mechanism** that detects version mismatches and forces a full reload immediately.

### What I'll Do:

1. **Add Version Check on App Mount** - Compare cached version with current version
2. **Force Clear Service Worker** - Unregister old service worker and clear all caches
3. **Auto-Reload with Cache Bypass** - Use `location.reload(true)` to bypass cache
4. **One-Time Clear on This Build** - Ensure this specific deployment clears old caches

---

## Files to Modify

### 1. `src/App.tsx`

Add a version check hook that runs on mount:

```typescript
import { useEffect } from 'react';
import { APP_VERSION } from './constants/app-version';

// Check if we need to force clear cache
useEffect(() => {
  const cachedVersion = localStorage.getItem('app_version');
  
  if (cachedVersion && cachedVersion !== APP_VERSION) {
    console.log('[Cache] Version mismatch detected, clearing cache...');
    
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
      });
    }
    
    // Update stored version
    localStorage.setItem('app_version', APP_VERSION);
    
    // Force reload bypassing cache
    window.location.reload();
  } else if (!cachedVersion) {
    // First visit, store version
    localStorage.setItem('app_version', APP_VERSION);
  }
}, []);
```

### 2. `src/constants/app-version.ts`

Update the version to trigger cache clear:

```typescript
export const APP_VERSION = '2026.01.30.002'; // Incremented
```

### 3. `src/components/pwa/ReloadPrompt.tsx`

Make auto-reload more aggressive - reduce delay from 2 seconds to 0.5 seconds.

---

## How It Works

```text
User opens app
    │
    ▼
Check localStorage for cached version
    │
    ├── No version stored ──► Store current version, continue
    │
    └── Version exists ──► Compare with current
                              │
                              ├── Match ──► Continue normally
                              │
                              └── Mismatch ──► 
                                    1. Clear all caches
                                    2. Unregister service workers
                                    3. Store new version
                                    4. Force reload page
```

---

## Expected Result

After this change:
1. Your browser will detect the version mismatch
2. It will clear ALL cached data
3. Page will reload with fresh code
4. Inventory link will appear in sidebar

Future users will also get automatic cache clearing whenever a new version is deployed.

---

## Summary

| Change | Purpose |
|--------|---------|
| Version check on mount | Detect stale cache |
| Clear caches API | Remove old cached files |
| Unregister service workers | Remove old SW |
| Force reload | Get fresh code |
| Increment version | Trigger clear for current users |
