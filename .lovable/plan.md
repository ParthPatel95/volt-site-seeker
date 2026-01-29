
# Fix: Make Inventory Link Visible in Sidebar

## Problem Identified

The **Inventory** link IS defined in the sidebar code at line 78:
```typescript
{ path: '/app/inventory', icon: Package, label: 'Inventory', permission: 'feature.inventory' }
```

However, it's **not visible** because:
1. The sidebar hides items when `hasPermission(item.permission)` returns `false`
2. The `feature.inventory` permission doesn't exist in your `user_permissions` table
3. Only `admin@voltscout.com` gets automatic access to all features

Looking at your screenshot, you're logged in as "admin" but unless your email is exactly `admin@voltscout.com`, you need explicit permissions.

---

## Solution Options

### Option A: Grant Inventory Permission to All Users (Quick Fix)

Add a database migration that grants `feature.inventory` permission to existing users and sets it as a default for new users.

**Database Migration:**
```sql
-- Grant inventory permission to all existing users
INSERT INTO user_permissions (user_id, permission)
SELECT id, 'feature.inventory'
FROM auth.users
ON CONFLICT DO NOTHING;
```

### Option B: Make Inventory Always Visible (No Permission Check)

Change the Inventory nav item to not require a permission, making it visible to all authenticated users.

**Code Change in Sidebar.tsx:**
```typescript
// Change from requiring permission...
{ path: '/app/inventory', icon: Package, label: 'Inventory', permission: 'feature.inventory' }

// To using a permission that's always granted or no check
{ path: '/app/inventory', icon: Package, label: 'Inventory', permission: 'always' }
```

And update the `hasPermission` function to treat `'always'` as returning `true`.

### Option C: Update Permissions Logic for New Features (Recommended)

Make the permissions system treat missing/new feature permissions as **accessible by default** rather than denied. This way new features are visible to all users until explicitly restricted.

---

## Recommended: Option B (Simplest Fix)

Make Inventory visible to all authenticated users by either:
1. Removing the permission check for Inventory, OR
2. Adding a fallback that grants access to new features by default

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/Sidebar.tsx` | Update Inventory permission to use a universal access pattern |
| `src/contexts/PermissionsContext.tsx` | Optionally add logic for "always allowed" features |

---

## Implementation

**Sidebar.tsx** - Change Inventory to be always accessible:

```typescript
// Current (line 77-78)
{
  title: 'Operations',
  items: [
    { path: '/app/build', icon: HardHat, label: 'Build Management', permission: 'feature.build-management' },
    { path: '/app/inventory', icon: Package, label: 'Inventory', permission: 'feature.inventory' },
  ]
}

// Updated - Use empty string to skip permission check
{
  title: 'Operations',
  items: [
    { path: '/app/build', icon: HardHat, label: 'Build Management', permission: 'feature.build-management' },
    { path: '/app/inventory', icon: Package, label: 'Inventory', permission: '' },  // Always visible
  ]
}
```

**PermissionsContext.tsx** - Treat empty permission as granted:

```typescript
const hasPermission = useCallback((permission: string) => {
  // Empty permission means always allowed
  if (!permission) return true;
  // Admin always has all permissions
  if (user?.email === 'admin@voltscout.com') return true;
  return permissions.includes(permission);
}, [permissions, user?.email]);
```

---

## Result

After this fix:
- The **Inventory** link will appear in the sidebar under "Operations"
- All authenticated users can access the Inventory feature
- No database changes required
- Future features can use the same pattern if they should be universally accessible
