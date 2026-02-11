

# Fix: Force PWA Cache Update via index.html Inline Script

## Root Cause

The `CacheBuster` component in `App.tsx` cannot fix stale caches because it runs INSIDE the cached JS bundle. When the service worker serves the old bundle, the old `APP_VERSION` is baked into the JavaScript, so it never detects a mismatch. This is a chicken-and-egg problem.

The solution is to add a cache-busting check directly in `index.html`, which is NOT cached by the service worker's content-hash strategy (HTML is served with `no-cache` headers).

## Fix

### File: `index.html`

Add an inline script (BEFORE the React `<script>` tag) that:
1. Stores the current deployment version in a meta tag or inline variable
2. Compares against `localStorage` on every page load
3. If mismatched: unregisters all service workers, clears all caches, and hard-reloads
4. This runs before React, before the service worker can intercept

```
<!-- Add before the React script tag -->
<script>
  (function() {
    var DEPLOY_VERSION = '2026.02.11.003';
    var stored = localStorage.getItem('html_deploy_version');
    if (stored && stored !== DEPLOY_VERSION) {
      localStorage.setItem('html_deploy_version', DEPLOY_VERSION);
      // Purge all service workers and caches
      if ('caches' in window) {
        caches.keys().then(function(names) {
          names.forEach(function(n) { caches.delete(n); });
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
          regs.forEach(function(r) { r.unregister(); });
        });
      }
      // Hard reload after short delay for cleanup
      setTimeout(function() {
        window.location.replace(window.location.pathname + '?_purge=' + Date.now());
      }, 500);
    } else {
      localStorage.setItem('html_deploy_version', DEPLOY_VERSION);
    }
  })();
</script>
```

### File: `src/constants/app-version.ts`

Bump `APP_VERSION` to `'2026.02.11.003'` to stay in sync.

## Why This Works

- `index.html` is served with `Cache-Control: no-cache, no-store, must-revalidate` meta tags, so browsers always fetch the latest HTML
- The inline script runs synchronously BEFORE any cached JS bundles load
- It can detect a version change and purge the service worker before the old React app takes control
- After purge + reload, the browser fetches fresh JS assets with new content-hash filenames

## Files to Modify

| File | Change |
|---|---|
| `index.html` | Add inline version-check script before React script tag |
| `src/constants/app-version.ts` | Bump to `2026.02.11.003` |

This is a 2-file change that permanently fixes the stale PWA problem for all future deployments.

