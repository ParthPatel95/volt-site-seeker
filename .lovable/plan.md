
# Quick-Add Photo + Spreadsheet Inventory View

## Overview

Two changes to make the inventory workflow faster and more practical:

1. **Quick Photo Add** -- Let users snap a photo and immediately save an item with just a name (skip the slow AI analysis). A "Smart Scan" button on each item lets them run AI analysis later when they have time.

2. **Spreadsheet/Table View** -- Replace the card-based items list with an Excel-like table showing all inventory data in sortable, scannable rows.

---

## 1. Quick Photo Add (Skip AI)

### Current Problem
When users tap "Smart Scan", the app captures a photo and immediately sends it to the `inventory-ai-analyzer` Edge Function, which can take 10-20+ seconds. There's no way to just save the photo and fill in details later.

### Solution
Add a **"Quick Add"** option in the `InventorySmartCapture` component. After taking a photo, users see two buttons:
- **"Save as Item"** -- Saves the photo immediately with a default name ("Untitled Item") and lets them edit later. No AI call.
- **"Smart Scan"** -- Runs the existing AI analysis (for when they want detailed auto-fill).

Additionally, in the items spreadsheet view, each row will have a **"Analyze"** button (sparkle icon) that triggers AI analysis on that item's existing photo, updating its fields with the results.

### Changes

**Modified: `src/components/inventory/components/InventorySmartCapture.tsx`**
- In the `preview` state, add a "Save as Item" button alongside the existing "Analyze" button
- "Save as Item" calls a new `onQuickSave` prop with just the image URL and a placeholder name
- The user can then edit the item from the spreadsheet later

**Modified: `src/components/inventory/components/InventoryAddDialog.tsx`**
- Add `onQuickSave` handler that creates a minimal item (name: "Photo Item", image, quantity: 1, condition: "new")
- Wire through the `onQuickSave` from SmartCapture

**Modified: `src/components/inventory/InventoryPage.tsx`**
- Add a `handleQuickSave` function that creates a minimal item with the photo and a timestamped name
- Pass it through to the AddDialog/SmartCapture flow

---

## 2. Excel-Style Spreadsheet View for All Items

### Current Problem
Items display as cards (grid or list), which makes it hard to compare items at a glance, especially with many entries.

### Solution
Create a new `InventorySpreadsheet` component -- an Excel-like table view with:
- Sortable columns: Name, SKU, Category, Quantity, Unit Cost, Total Value, Location, Status, Condition
- Inline quick-edit for quantity and unit cost
- Row click to open item detail
- Per-row action buttons: Edit, Analyze (AI), Delete
- Color-coded status badges
- Sticky header
- Footer row with totals (total items, total value)

### Changes

**New: `src/components/inventory/components/InventorySpreadsheet.tsx`**
- Full-width table using existing `Table` UI components
- Columns: Image (thumbnail), Name, SKU, Category, Qty, Unit, Cost, Total Value, Location, Status, Condition, Actions
- Sortable headers with ArrowUpDown icons
- Inline editing for qty and cost fields (click to edit, Enter to save)
- "Analyze" button per row (sparkle icon) that triggers AI on the item's photo
- Footer row with total count and total portfolio value
- Search filtering built-in

**Modified: `src/components/inventory/InventoryPage.tsx`**
- Add `'spreadsheet'` to the view mode options (grid | list | spreadsheet)
- Add a spreadsheet icon toggle button next to the existing grid/list toggles
- When `viewMode === 'spreadsheet'`, render `InventorySpreadsheet` instead of the card grid
- Default to spreadsheet view
- Wire the "Analyze" action to call `analyzeImage` from `useInventoryAIAnalysis` hook and update the item

---

## Technical Notes

- The Quick Add flow bypasses the Edge Function entirely -- it just uploads the image via `useImageUpload` and creates a DB record with `createItem`
- The per-item "Analyze" button reuses the existing `useInventoryAIAnalysis.analyzeImage()` hook, passing the item's `primary_image_url` as input
- The spreadsheet component follows the same pattern as the existing `ScrapMetalSpreadsheet` but for general inventory
- No new dependencies needed -- uses existing `Table`, `Badge`, `Button` components
