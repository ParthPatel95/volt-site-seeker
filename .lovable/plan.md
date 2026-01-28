

# Fix Plan: Resolve "sortedPeaks is not defined" Error

## Problem Identified

The error is caused by a **circular dependency** between two files:

```text
src/lib/12cpPredictionEngine.ts
     ↓ imports YearlyTop12Data, AllTimePeakHour from
src/hooks/useHistorical12CPPeaks.ts
     ↓ imports generateImprovedPredictions, analyzePeakPatterns from
src/lib/12cpPredictionEngine.ts
```

When JavaScript modules have circular imports, one of them will have incomplete exports during initialization, causing runtime errors like "sortedPeaks is not defined".

---

## Solution: Extract Shared Types to Separate File

Create a new types file that both modules can import from, breaking the cycle.

### Files to Create

| File | Purpose |
|------|---------|
| `src/types/12cpTypes.ts` | Shared interfaces for 12CP peak data |

### File to Modify

| File | Change |
|------|--------|
| `src/lib/12cpPredictionEngine.ts` | Import types from new file instead of hook |
| `src/hooks/useHistorical12CPPeaks.ts` | Import types from new file, re-export for compatibility |

---

## Technical Implementation

### 1. Create `src/types/12cpTypes.ts`

Move these interfaces from `useHistorical12CPPeaks.ts`:

```typescript
export interface AllTimePeakHour {
  rank: number;
  timestamp: string;
  demandMW: number;
  priceAtPeak: number;
  hour: number;
  dayOfWeek: string;
  month: number;
  year: number;
  monthName: string;
}

export interface YearlyTop12Peak {
  year: number;
  rank: number;
  timestamp: string;
  demandMW: number;
  priceAtPeak: number;
  hour: number;
  dayOfWeek: string;
  monthName: string;
  dayOfMonth: number;
  temperatureCalgary: number | null;
  temperatureEdmonton: number | null;
  windSpeed: number | null;
  cloudCover: number | null;
}

export interface YearlyTop12Data {
  year: number;
  peaks: YearlyTop12Peak[];
  yearMaxDemand: number;
  yearMinOf12: number;
}
```

### 2. Update `src/lib/12cpPredictionEngine.ts`

Change import from:
```typescript
import { YearlyTop12Data, AllTimePeakHour } from '@/hooks/useHistorical12CPPeaks';
```

To:
```typescript
import { YearlyTop12Data, AllTimePeakHour } from '@/types/12cpTypes';
```

### 3. Update `src/hooks/useHistorical12CPPeaks.ts`

Import types from the new file and re-export them for backward compatibility:
```typescript
import { 
  AllTimePeakHour, 
  YearlyTop12Peak, 
  YearlyTop12Data 
} from '@/types/12cpTypes';

// Re-export for any existing consumers
export type { AllTimePeakHour, YearlyTop12Peak, YearlyTop12Data };
```

---

## Dependency Flow After Fix

```text
src/types/12cpTypes.ts (shared types - no dependencies)
     ↑
     ├── src/lib/12cpPredictionEngine.ts (imports types)
     │
     └── src/hooks/useHistorical12CPPeaks.ts (imports types AND functions)
              ↓
         src/lib/12cpPredictionEngine.ts (imports functions only, no cycle)
```

---

## Summary

| Issue | Resolution |
|-------|------------|
| Circular dependency | Extract shared interfaces to `src/types/12cpTypes.ts` |
| Module initialization failure | Both files now import types from shared file |
| "sortedPeaks is not defined" error | Will be resolved once circular dependency is broken |

