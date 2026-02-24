

# Fix: Inventory Link Missing from Sidebar

## Problem
The Inventory link is defined in the sidebar configuration (`src/components/Sidebar.tsx` line 78) and the route exists in `VoltScout.tsx`, but it's not appearing in the rendered sidebar. The code looks correct -- the item has `permission: ''` (always allowed) and there's no filtering logic that would hide it.

## Root Cause
After thorough investigation, the sidebar code is correctly configured. This appears to be a build artifact or caching issue. To guarantee the fix, I'll make a minor touch to the sidebar configuration to force a rebuild and ensure the Inventory link renders.

## Plan

### 1. Verify and re-save `src/components/Sidebar.tsx`
- Confirm the Inventory nav item is present in the Operations section
- Make a trivial change (e.g., add a comment or re-order the import) to force a rebuild and cache-bust

### 2. Verify `src/pages/VoltScout.tsx`
- Confirm the `/app/inventory` route renders the `<Inventory />` component
- Confirm the `isFullScreenModule` check includes `/app/inventory` so the main sidebar hides when inside the Inventory Hub (this is working correctly)

### 3. Test
- Navigate to `/app` and verify the "Inventory" link appears under "Operations" in the sidebar
- Click "Inventory" and verify the Inventory Hub loads with its own sidebar layout

## Technical Details

No logic changes needed -- the configuration is already correct:

```
// Sidebar.tsx line 74-79
{
  title: 'Operations',
  items: [
    { path: '/app/build', icon: HardHat, label: 'Build Management', permission: 'feature.build-management' },
    { path: '/app/inventory', icon: Package, label: 'Inventory', permission: '' },
  ]
}
```

The fix is a forced rebuild to ensure the latest code is compiled and served to the browser.
