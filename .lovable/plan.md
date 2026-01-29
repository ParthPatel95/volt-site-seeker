
# Fix: Add Navigation to Standalone Inventory Feature

## Problem Identified

The inventory feature at `/app/inventory` is marked as a "full-screen module" in `VoltScout.tsx`, which hides the main VoltScout sidebar. However, unlike VoltBuild (which has its own sidebar with navigation), the Inventory page has **no navigation whatsoever** - leaving users trapped with no way to exit.

```text
VoltScout.tsx (line 48-51):
const isFullScreenModule = location.pathname.startsWith('/app/build') || 
                           location.pathname.startsWith('/app/secure-share') ||
                           location.pathname.startsWith('/app/inventory');  // <-- hides sidebar
```

---

## Recommended Solution: Option A (Quick Fix)

Remove inventory from the full-screen module list so the main VoltScout sidebar remains visible:

### Changes Required

**File: `src/pages/VoltScout.tsx`**

Update line 48-51 to remove inventory from full-screen modules:

```typescript
// Before
const isFullScreenModule = location.pathname.startsWith('/app/build') || 
                           location.pathname.startsWith('/app/secure-share') ||
                           location.pathname.startsWith('/app/inventory');

// After
const isFullScreenModule = location.pathname.startsWith('/app/build') || 
                           location.pathname.startsWith('/app/secure-share');
```

**File: `src/pages/Inventory.tsx`**

Adjust the wrapper to match other pages that use the main sidebar:

```typescript
export default function Inventory() {
  return <InventoryPage />;
}
```

This allows the standard VoltScout sidebar to remain visible, giving users the ability to navigate away from inventory at any time.

---

## Alternative: Option B (Dedicated Layout - Future Enhancement)

If you want Inventory to have its own full-screen experience like VoltBuild, we would need to:

1. Create `src/components/inventory/InventoryLayout.tsx` - A layout wrapper with custom sidebar
2. Create `src/components/inventory/InventorySidebar.tsx` - Sidebar with:
   - "Back to VoltScout" link
   - Workspace selector
   - Navigation items (Dashboard, Items, Groups, Transactions, Alerts, Categories)
   - Settings button
3. Update `InventoryPage.tsx` to use the new layout

This is more complex but provides a cleaner, immersive inventory management experience. We can implement this as a follow-up enhancement.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/VoltScout.tsx` | Remove `/app/inventory` from `isFullScreenModule` check |
| `src/pages/Inventory.tsx` | Remove extra padding wrapper (let InventoryPage handle its own layout) |

---

## Result

After this fix:
- The VoltScout sidebar will remain visible when accessing `/app/inventory`
- Users can click "Dashboard", "Inventory", or any other sidebar item to navigate away
- The inventory feature retains all its functionality while being navigable
