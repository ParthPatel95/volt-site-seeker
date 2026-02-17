

# Sidebar Layout for AESO & ERCOT Market Hubs

Convert both Market Hubs from horizontal scrollable tab bars to a professional sidebar-based layout matching the VoltBuild and SecureShare pattern.

## What Changes

Both the AESO Market Hub and ERCOT Market Hub will get:
- A collapsible sidebar on desktop with grouped navigation items and icons
- A slide-out sheet menu on mobile (hamburger button in a compact header)
- Smooth transitions between views
- A "Back to VoltScout" link at the top of the sidebar
- A collapse/expand toggle on desktop

The horizontal scrollable tab bar and the separate header will be removed and replaced by the sidebar layout that fills the full screen height.

## New Files

### 1. `src/components/aeso-hub/layout/AESOHubSidebar.tsx`
Sidebar component modeled on `VoltBuildSidebar.tsx`. Contains:
- "Back to VoltScout" link
- AESO Market Hub logo/branding section
- Grouped navigation items:
  - **Market**: Market Data, Power Model, Generation, Forecasts
  - **Intelligence**: AI Predictions, Datacenter Control, Outages & Alerts
  - **Analytics**: Historical, Analytics Export, Dashboards, Telegram Alerts
- Collapse toggle on desktop, Sheet wrapper on mobile
- Reuses the existing `VoltBuildNavItem` component for consistent nav item styling

### 2. `src/components/aeso-hub/layout/AESOHubLayout.tsx`
Layout wrapper modeled on `VoltBuildLayout.tsx`. Contains:
- Flex container with sidebar + main content area
- Mobile header with hamburger menu button and current view label
- AnimatePresence content transitions
- Mobile detection via resize listener

### 3. `src/components/ercot-hub/layout/ERCOTHubSidebar.tsx`
Same pattern as AESO sidebar but with ERCOT-specific navigation:
- **Market**: Market Data, Generation, Forecasts
- **Intelligence**: Outages & Alerts, Advanced Analytics
- **History**: Historical Pricing

### 4. `src/components/ercot-hub/layout/ERCOTHubLayout.tsx`
Same layout wrapper pattern as AESO, with ERCOT branding.

## Modified Files

### 5. `src/components/aeso-hub/AESOMarketHub.tsx`
- Remove the inline header, sticky scrollable nav bar, and bottom overview cards (move overview cards into the Market Data tab or keep as a footer inside the content area)
- Wrap the entire component in `AESOHubLayout`
- Pass `activeTab` and `setActiveTab` as `currentView`/`onViewChange` to the layout
- Keep all existing hook calls and tab content rendering unchanged

### 6. `src/components/ERCOTMarketComprehensive.tsx`
- Replace `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` with conditional rendering (same pattern AESO already uses)
- Wrap in `ERCOTHubLayout`
- Remove inline header and tab bar
- Keep all existing data cards and content unchanged

## Technical Details

- View types defined as TypeScript union types (e.g., `AESOHubView = 'market' | 'power-model' | ...`)
- Sidebar width: 240px expanded, 64px collapsed (matching VoltBuild)
- Mobile breakpoint: `< 1024px` (matching VoltBuild)
- Sidebar uses `ScrollArea` for overflow on many nav items
- Mobile uses `Sheet` from radix for slide-out menu
- Navigation items reuse `VoltBuildNavItem` component (or a shared copy) for consistent active state styling, badges, and hover animations
- Refresh button moves into the content header area of each tab (or a small toolbar at the top of the main content)

