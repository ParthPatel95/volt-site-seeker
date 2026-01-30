
# Plan: Implement Automatic PWA Update System to Fix Caching Issues

## Problem Summary

The app uses a PWA (Progressive Web App) with service worker caching. When new code deploys, users may see stale cached content until they manually refresh. This causes issues like the Inventory link not appearing even though it exists in the code.

Currently:
- PWA is configured with `registerType: 'autoUpdate'` (silent background updates)
- No UI component notifies users when new content is available
- Users don't know they need to refresh to see latest changes

## Solution Overview

Implement a **multi-layered cache management system** that automatically handles updates without user intervention:

1. **Auto-Refresh on Update Detection** - Automatically reload when new content is available (not just notify)
2. **Periodic Update Checks** - Check for updates every 15 minutes
3. **Visible Update Toast** - Show a brief toast before auto-reloading (gives user context)
4. **Version Tracking** - Track app version to detect stale sessions

---

## Files to Create

### 1. `src/components/pwa/ReloadPrompt.tsx`

A component that uses `vite-plugin-pwa`'s `useRegisterSW` hook to:
- Detect when new content is available (`needRefresh` state)
- Show a brief toast notification: "Updating to latest version..."
- Automatically reload after 2 seconds (no user action required)
- Check for updates every 15 minutes

```text
+--[ Update Toast ]--------------------------------+
| ↻  Updating to latest version...                |
|    Refreshing in 2s                             |
+-------------------------------------------------+
```

### 2. `src/constants/app-version.ts`

A simple version constant that changes with each deployment:
- Used to detect if the user's cached version is outdated
- Allows for emergency cache-busting via version comparison

---

## Files to Modify

### 1. `vite.config.ts`

Update PWA configuration:
- Change `registerType` from `'autoUpdate'` to `'prompt'` (enables needRefresh detection)
- Add `skipWaiting: true` and `clientsClaim: true` to workbox config
- These ensure new service workers take control immediately

### 2. `src/App.tsx`

Add the new `ReloadPrompt` component to the app root (alongside existing `InstallPrompt`)

### 3. `index.html`

Add cache-control meta tags to discourage browser caching of the HTML shell

---

## Technical Implementation

### ReloadPrompt Component Logic

```typescript
// Pseudo-code for the auto-update logic
function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      // Check for updates every 15 minutes
      setInterval(() => registration?.update(), 15 * 60 * 1000);
    },
    onNeedRefresh() {
      // New content available - will auto-reload
    }
  });

  useEffect(() => {
    if (needRefresh) {
      // Show toast, then auto-reload after 2 seconds
      toast.info("Updating to latest version...");
      setTimeout(() => {
        updateServiceWorker(true); // true = reload page
      }, 2000);
    }
  }, [needRefresh]);
}
```

### Vite Config Changes

```typescript
VitePWA({
  registerType: 'prompt', // Changed from 'autoUpdate'
  // ... existing config ...
  workbox: {
    // ... existing config ...
    skipWaiting: true,      // NEW: Activate new SW immediately
    clientsClaim: true,     // NEW: Take control of all clients
  }
})
```

### HTML Meta Tags

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

---

## User Experience Flow

```text
1. User has app open with cached version

2. New deployment is pushed to production

3. Within 15 minutes (or on next navigation):
   - Service worker detects new content
   - ReloadPrompt component shows toast:
     "Updating to latest version..."

4. After 2 seconds:
   - Page automatically reloads
   - User sees fresh content with all new features

5. User continues with no manual action needed
```

---

## Why This Approach Works

| Technique | Purpose |
|-----------|---------|
| `registerType: 'prompt'` | Enables `needRefresh` detection |
| `skipWaiting: true` | New SW takes over immediately |
| `clientsClaim: true` | SW controls all open tabs |
| 15-min interval checks | Catches updates within reasonable time |
| Auto-reload after toast | No user action required |
| Cache-control meta tags | Prevents browser caching HTML |

---

## Fallback Behaviors

- If service worker fails to update: Toast appears with manual "Reload" button
- If user is in middle of form: Can dismiss and reload later (optional enhancement)
- If offline: Shows offline-ready message instead

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/components/pwa/ReloadPrompt.tsx` | Create | Auto-update detection + reload |
| `src/constants/app-version.ts` | Create | Version tracking |
| `vite.config.ts` | Modify | Enable prompt mode + workbox settings |
| `src/App.tsx` | Modify | Add ReloadPrompt component |
| `index.html` | Modify | Add cache-control meta tags |

This ensures users **always see the latest version** without needing to know about browser caching or manual refresh techniques.
