

# Fix Responsiveness and UI Issues in Power Model

## Issues Found

### 1. All-in Rate Breakdown -- labels overflow on mobile
The rate breakdown rows use a fixed `w-48` (192px) for labels plus two `w-16` (64px) value columns = 320px minimum width before the progress bar even gets space. On a 390px mobile screen with card padding (~32px), the progress bar is crushed to nearly nothing.

**Fix:** Change label width from `w-48` to `w-32 sm:w-48` (128px on mobile, 192px on desktop). Hide the USD column on mobile using `hidden sm:block` since the CAD value is the primary metric. This gives the bar 160px+ on mobile.

### 2. Over-Contract Credits and Effective Rate rows -- same width issue
The new credit/effective-rate rows at lines 99-112 use the same `w-48` and dual `w-16` layout. Apply the same responsive fix.

### 3. Stat ribbon -- no scroll indicator on mobile  
The stat ribbon can contain 6-7 items at `min-w-[140px]` each (~980px). `overflow-x-auto` works but users may not realize they can scroll. 

**Fix:** Add a subtle gradient fade on the right edge to hint at scrollable content using a CSS pseudo-element approach via a wrapper div.

### 4. Monthly Summary Table header -- wrapping on small screens
The header text "All-in Rate Breakdown (cents/kWh)" plus the badge can wrap awkwardly on mobile.

**Fix:** Make the header `flex-wrap gap-2` (already done) but shrink the CardTitle text to `text-xs sm:text-sm`.

### 5. Unused variable cleanup
`overContractHours` on line 35 of `PowerModelSummaryCards.tsx` is computed but never used. Remove it.

### 6. gl-matrix build error
This is a pre-existing TypeScript error in `node_modules/gl-matrix/index.d.ts` unrelated to our changes. Fix by adding `skipLibCheck: true` to `tsconfig.json` (standard practice for third-party type issues).

## Files Modified

### `src/components/aeso/PowerModelChargeBreakdown.tsx`
- Change label `w-48` to `w-32 sm:w-48` in rate breakdown rows (line 77, 89, 100, 108)
- Hide USD cents column on mobile: add `hidden sm:inline` to the USD `<span>` elements (lines 85, 92, 105, 111)
- Apply same to the All-in Total and Effective Rate footer rows

### `src/components/aeso/PowerModelSummaryCards.tsx`
- Remove unused `overContractHours` variable (line 35)
- Add a scroll-hint gradient wrapper around the stat ribbon `div`

### `tsconfig.json`
- Add `"skipLibCheck": true` to fix the gl-matrix build error

## What does NOT change
- Calculator logic, data flow, and all computations remain identical
- Desktop layout is visually unchanged (same widths apply at `sm:` breakpoint)
- All other AESO Hub tabs and components untouched
