
# Fix: Inventory Missing from Sidebar (Cache Issue)

## Problem Analysis

The Inventory feature IS correctly configured in the codebase:

**Sidebar.tsx (Line 78):**
```typescript
{ path: '/app/inventory', icon: Package, label: 'Inventory', permission: '' },
```

**VoltScout.tsx (Line 134):**
```typescript
<Route path="inventory" element={<Inventory />} />
```

However, your browser is displaying an **outdated cached version** that doesn't include the Inventory link in the Operations section. The current version `'2026.02.01.001'` was just set, but your browser may not have triggered the cache-busting mechanism yet.

---

## Solution

Increment the app version to **force an immediate cache clear** for all users:

| File | Change |
|------|--------|
| `src/constants/app-version.ts` | Change `'2026.02.01.001'` → `'2026.02.03.001'` |

This will:
1. Trigger the CacheBuster component on next page load
2. Clear all browser caches (`caches.keys()`)
3. Unregister stale service workers
4. Force a page reload with fresh content
5. Display the Inventory link in the Operations section

---

## How CacheBuster Works

```text
Browser loads page
       ↓
CacheBuster checks localStorage('app_version')
       ↓
Stored: '2026.02.01.001'  Current: '2026.02.03.001'
       ↓
MISMATCH → Clear caches → Unregister workers → Reload
       ↓
Fresh sidebar with Inventory visible
```

---

## After the Fix

The Operations section in your sidebar should display:
- Build Management
- **Inventory** ← Will appear after cache clear

---

## Alternative: Manual Cache Clear

If the version bump doesn't work, you can also:
1. Open DevTools (F12)
2. Go to Application → Storage
3. Click "Clear site data"
4. Refresh the page

But the version bump should handle this automatically.
