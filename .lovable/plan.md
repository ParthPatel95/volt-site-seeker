
# Plan: Make Inventory a Standalone Feature Outside Build Management

## Current Architecture Analysis

### Current State
| Aspect | Current |
|--------|---------|
| **Location** | `src/components/voltbuild/inventory/` |
| **Access Path** | VoltScout → Build Management → Inventory Tab |
| **Data Model** | Tied to `voltbuild_projects` via `project_id` FK |
| **Route** | Part of `/app/build` (VoltBuild module) |

### Key Files
- **Main Component**: `VoltInventoryTab.tsx` (600 lines)
- **Components**: 24 UI components in `components/` directory
- **Hooks**: 8 hooks for data management
- **Types**: Type definitions in `types/` directory
- **Edge Function**: `inventory-ai-analyzer/` for AI-powered item detection

---

## Proposed Architecture

### New Structure
| Aspect | New |
|--------|-----|
| **Location** | `src/components/inventory/` (standalone directory) |
| **Access Path** | VoltScout → Operations → Inventory (direct sidebar link) |
| **Data Model** | New `inventory_workspaces` table (user-level, no project dependency) |
| **Route** | `/app/inventory` (own route in VoltScout) |

---

## Implementation Strategy

### Option 1: Full Decoupling (Recommended)

Create a completely standalone inventory system with its own workspace concept:

```text
src/components/inventory/
├── InventoryPage.tsx              (Main page component)
├── InventoryLayout.tsx            (Layout with sidebar)
├── components/                    (Copied from voltbuild/inventory)
│   ├── InventoryDashboard.tsx
│   ├── InventoryItemCard.tsx
│   ├── InventoryAddDialog.tsx
│   └── ... (all 24 components)
├── hooks/
│   ├── useInventoryWorkspaces.ts  (New: manage user workspaces)
│   ├── useInventoryItems.ts       (Modified: use workspace_id)
│   ├── useInventoryCategories.ts
│   └── ... (all 8 hooks)
├── types/
│   ├── inventory.types.ts
│   └── group.types.ts
└── index.ts
```

### New Database Tables

```text
inventory_workspaces
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── name (text)
├── description (text, nullable)
├── icon (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

inventory_items (modified)
├── project_id → workspace_id (migration)
└── ... (all other fields unchanged)

inventory_categories (modified)
├── project_id → workspace_id (migration)
└── ... (all other fields unchanged)

inventory_groups (modified)
├── project_id → workspace_id (migration)
└── ... (all other fields unchanged)

inventory_transactions (modified)
├── project_id → workspace_id (migration)
└── ... (all other fields unchanged)

inventory_group_items (unchanged - references by group_id and item_id)
```

### Option 2: Dual-Mode (Keep Both)

Keep inventory in VoltBuild for project-specific use AND add standalone mode:

- Add `workspace_id` as nullable alongside `project_id`
- Inventory can work with either a project or a standalone workspace
- More complex but preserves existing functionality

---

## Recommended Approach: Option 1 (Full Decoupling)

### Phase 1: File Structure Migration

**Create new directory structure:**
```text
src/components/inventory/           (new standalone feature)
src/pages/Inventory.tsx             (new page wrapper)
```

**Move and refactor files:**
| From | To |
|------|-----|
| `voltbuild/inventory/VoltInventoryTab.tsx` | `inventory/InventoryPage.tsx` |
| `voltbuild/inventory/components/*` | `inventory/components/*` |
| `voltbuild/inventory/hooks/*` | `inventory/hooks/*` |
| `voltbuild/inventory/types/*` | `inventory/types/*` |

### Phase 2: Database Migration

Create migration to rename `project_id` to `workspace_id`:

```sql
-- Create workspaces table
CREATE TABLE inventory_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Package',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE inventory_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces" ON inventory_workspaces
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "Users can create workspaces" ON inventory_workspaces
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workspaces" ON inventory_workspaces
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workspaces" ON inventory_workspaces
  FOR DELETE USING (user_id = auth.uid());

-- Add workspace_id to inventory tables (nullable for migration)
ALTER TABLE inventory_items ADD COLUMN workspace_id UUID REFERENCES inventory_workspaces(id) ON DELETE CASCADE;
ALTER TABLE inventory_categories ADD COLUMN workspace_id UUID REFERENCES inventory_workspaces(id) ON DELETE CASCADE;
ALTER TABLE inventory_groups ADD COLUMN workspace_id UUID REFERENCES inventory_workspaces(id) ON DELETE CASCADE;
ALTER TABLE inventory_transactions ADD COLUMN workspace_id UUID REFERENCES inventory_workspaces(id) ON DELETE CASCADE;
```

### Phase 3: Update Hooks

Modify all inventory hooks to use `workspace_id` instead of `project_id`:

```typescript
// Before (useInventoryItems.ts)
export function useInventoryItems(projectId: string | null, filters?: InventoryFilters)

// After
export function useInventoryItems(workspaceId: string | null, filters?: InventoryFilters)
```

### Phase 4: Create New Entry Points

**New page:** `src/pages/Inventory.tsx`
```typescript
import { InventoryPage } from '@/components/inventory/InventoryPage';

export default function Inventory() {
  return <InventoryPage />;
}
```

**New layout:** `src/components/inventory/InventoryLayout.tsx`
- Sidebar with workspaces list
- Create/edit workspace dialogs
- Main content area

### Phase 5: Update Routing

**Add to VoltScout.tsx:**
```typescript
<Route path="inventory" element={<Inventory />} />
```

**Add to Sidebar.tsx navigation:**
```typescript
{
  title: 'Operations',
  items: [
    { path: '/app/build', icon: HardHat, label: 'Build Management', permission: 'feature.build-management' },
    { path: '/app/inventory', icon: Package, label: 'Inventory', permission: 'feature.inventory' },
  ]
}
```

### Phase 6: Keep VoltBuild Integration (Optional)

Optionally keep a simplified inventory view in VoltBuild that links to the standalone feature:
- Add "Open Inventory" button in VoltBuild
- Filter by associated workspace if project has one linked

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/inventory/InventoryPage.tsx` | Main standalone page |
| `src/components/inventory/InventoryLayout.tsx` | Layout with workspace selector |
| `src/components/inventory/components/WorkspaceSelector.tsx` | Dropdown for workspaces |
| `src/components/inventory/components/CreateWorkspaceDialog.tsx` | Create new workspace |
| `src/components/inventory/hooks/useInventoryWorkspaces.ts` | CRUD for workspaces |
| `src/pages/Inventory.tsx` | Page wrapper for routing |

## Files to Move/Copy

| Source | Destination |
|--------|-------------|
| `voltbuild/inventory/components/*` (24 files) | `inventory/components/*` |
| `voltbuild/inventory/hooks/*` (8 files) | `inventory/hooks/*` |
| `voltbuild/inventory/types/*` (2 files) | `inventory/types/*` |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/VoltScout.tsx` | Add `/inventory` route |
| `src/components/Sidebar.tsx` | Add Inventory nav item |
| All inventory hooks | Replace `projectId` with `workspaceId` |
| All inventory components | Replace project prop with workspace prop |

---

## UI Changes

### New Sidebar Structure
```text
Operations
├── Build Management (/app/build)
└── Inventory (/app/inventory)   ← NEW
```

### Inventory Page Layout
```text
+---------------------------+--------------------------------+
|     Inventory             |                                |
|  [+ New Workspace]        |     Inventory Dashboard        |
|                           |                                |
|  WORKSPACES               |     [Stats Cards]              |
|  ○ Main Warehouse         |                                |
|  ● Shop Tools             |     [Recent Items]             |
|  ○ Project Supplies       |                                |
|                           |     [Low Stock Alerts]         |
|  [Settings]               |                                |
+---------------------------+--------------------------------+
```

---

## Migration Path for Existing Data

For users who have inventory items tied to VoltBuild projects:

1. Create a workspace for each project that has inventory items
2. Copy `project_id` to `workspace_id` 
3. After transition period, make `project_id` nullable
4. Eventually drop `project_id` column

---

## Summary

| Change | Description |
|--------|-------------|
| **New module** | `src/components/inventory/` standalone feature |
| **New route** | `/app/inventory` with own sidebar navigation |
| **New table** | `inventory_workspaces` for user-level organization |
| **Hook updates** | Change from `projectId` to `workspaceId` |
| **Sidebar update** | Add "Inventory" under Operations section |
| **Edge function** | No changes needed (already standalone) |
