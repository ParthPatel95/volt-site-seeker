
# Inventory UI Overhaul: Match AESO Hub Design

## Problem
The current Inventory feature uses a basic tabbed layout embedded within the VoltScout shell. On desktop, it's a flat `Tabs` component with no dedicated sidebar navigation. On mobile, it uses a bottom nav but lacks the polished header and sidebar sheet pattern that the AESO Hub provides. This makes it feel inconsistent with the rest of the platform's professional modules.

## Solution
Refactor Inventory to use the same sidebar-based layout architecture as the AESO Hub: collapsible desktop sidebar, mobile sheet menu, branded header, full-screen module mode, and smooth animated view transitions.

## Architecture Changes

### Current Flow
```text
VoltScout Shell (with main sidebar)
  -> InventoryPage.tsx
     -> Desktop: Tabs component (Dashboard | Items | Groups | ...)
     -> Mobile: BottomNav + AnimatePresence content
```

### New Flow
```text
VoltScout Shell (main sidebar HIDDEN -- full-screen module)
  -> InventoryHub.tsx (new shell component)
     -> InventoryHubLayout (sidebar + content area)
        -> InventoryHubSidebar (collapsible desktop, sheet on mobile)
        -> Content: view-based rendering (Dashboard, Items, Groups, etc.)
```

## What Changes for You

- **Desktop**: A professional collapsible sidebar on the left with grouped navigation (Overview, Management, Tools) replacing the tab strip. Clean branded header with "Inventory Hub" branding and a "Back to VoltScout" link.
- **Mobile**: Hamburger menu opening a slide-out sheet (same as AESO Hub) instead of the bottom navigation bar. The mobile header will show the current view name and subtitle.
- **All views**: Smooth fade/slide transitions between views (same AnimatePresence pattern as AESO Hub).
- **Workspace selector**: Moved into the sidebar (desktop) or the mobile header for cleaner layout.
- **All existing functionality preserved**: Every dialog, scanner, filter, export, and feature remains exactly the same -- only the navigation shell changes.

## Files to Create

### 1. `src/components/inventory/layout/InventoryHubSidebar.tsx`
Collapsible sidebar matching AESO Hub pattern:
- "Back to VoltScout" link at top
- Branded header with Package icon + "Inventory Hub"
- Navigation groups:
  - **Overview**: Dashboard, Alerts
  - **Management**: Items (with count badge), Groups, Categories
  - **Tools**: Transactions, Scanner Settings, Export
- Workspace selector dropdown inside sidebar
- Collapse/expand toggle button at bottom
- Mobile: renders inside a Sheet component

### 2. `src/components/inventory/layout/InventoryHubLayout.tsx`
Layout shell matching AESO Hub pattern:
- Sidebar + main content area in a flex row
- Mobile header with hamburger menu + current view label
- AnimatePresence for view transitions
- Responsive breakpoint detection (lg: 1024px)

### 3. `src/components/inventory/InventoryHub.tsx`
New top-level component replacing `InventoryPage` as the entry point:
- Manages active view state
- Renders InventoryHubLayout with the appropriate content for each view
- Contains all existing hooks (useInventoryItems, useInventoryCategories, etc.)
- Contains all existing dialogs and modals
- Workspace management logic stays here

## Files to Modify

### 4. `src/pages/Inventory.tsx`
- Change import from `InventoryPage` to `InventoryHub`

### 5. `src/pages/VoltScout.tsx`
- Add `/app/inventory` to the `isFullScreenModule` check so the main sidebar hides when inventory is active (same as AESO Hub, Build Management, SecureShare)

## Files Preserved (No Changes)
All existing components remain untouched:
- `InventoryDashboard.tsx`, `InventoryMobileDashboard.tsx`
- `InventoryItemCard.tsx`, `InventorySwipeableCard.tsx`
- `InventoryFilters.tsx`, `InventoryMobileFilters.tsx`
- `InventoryGroupManager.tsx`, `InventoryCategoryManager.tsx`
- `InventoryTransactionsTab.tsx`, `InventoryAlertsTab.tsx`
- `InventoryBarcodeScanner.tsx`, `InventoryCameraCapture.tsx`
- All dialogs (Add, Edit, Adjust, Delete, Export, Scanner Settings)
- `OfflineUploadIndicator.tsx`
- `MetalsMarketTicker.tsx`
- All hooks

## Navigation Structure

```text
OVERVIEW
  - Dashboard        (LayoutDashboard icon)
  - Alerts           (Bell icon, destructive badge with count)

MANAGEMENT
  - Items            (Package icon, secondary badge with count)
  - Groups           (Folder icon)
  - Categories       (Tags icon)

TOOLS
  - Transactions     (History icon)
  - Scanner Settings (ScanBarcode icon)
  - Export           (Download icon)
```

## Sidebar Visual Design
- Same 240px expanded / 64px collapsed widths as AESO Hub
- Same `bg-card border-r border-border` styling
- Same spring animation for collapse/expand
- Same `VoltBuildNavItem` component for nav items (already used by AESO Hub)
- Workspace selector rendered below the branding header with a compact dropdown

## Mobile Design
- Same `Sheet` slide-out pattern as AESO Hub
- Mobile header: hamburger icon + Package icon badge + current view name + "Inventory Hub" subtitle
- No bottom navigation bar (removed -- replaced by sidebar sheet)
- Content padding matches AESO Hub: `p-4 sm:p-6 lg:p-8`

## Technical Notes
- The `InventoryPage.tsx` file will be kept but marked as legacy. The new `InventoryHub.tsx` becomes the active entry point.
- All state management, hooks, and dialog orchestration from `InventoryPage.tsx` will be moved into `InventoryHub.tsx` with the same logic.
- The existing `InventoryBottomNav` and `InventoryMobileHeader` components remain in the codebase but are no longer imported by the new hub layout.
- The `InventoryFAB` component is also no longer needed since "Add Item" and "Scan" actions are accessible from the sidebar and header buttons.
