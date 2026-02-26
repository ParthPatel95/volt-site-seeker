

# Fix Missing `onAnalyze` Prop on InventorySpreadsheet

## Problem
The `InventorySpreadsheet` component at line 730 of `InventoryPage.tsx` is missing the `onAnalyze` prop. Without it, the per-row AI Analyze sparkle button is hidden (the component conditionally renders it only when `onAnalyze` is provided).

## Solution
Add the `onAnalyze` prop to the `InventorySpreadsheet` usage. The handler will:
1. Take the item's `primary_image_url`
2. Fetch it as base64
3. Call the existing `useInventoryAIAnalysis().analyzeImage()` hook
4. Update the item with the returned AI fields (name, description, SKU, category, condition, cost estimates)

## Changes

### `src/components/inventory/InventoryPage.tsx`
1. Import `useInventoryAIAnalysis` from `./hooks/useInventoryAIAnalysis`
2. Initialize the hook: `const { analyzeImage, isAnalyzing } = useInventoryAIAnalysis()`
3. Create a `handleAnalyzeItem` function that:
   - Fetches the item's `primary_image_url` as a base64 string
   - Calls `analyzeImage(base64, categories.map(c => c.name))`
   - On success, calls `updateItem()` with the AI-returned fields (name, description, sku, category, condition, unit_cost)
   - Shows a success toast
4. Pass `onAnalyze={handleAnalyzeItem}` to the `<InventorySpreadsheet>` component (line 730-742)

This is a single-file change with no new dependencies.

