/**
 * Hourly data coverage audit for the Power Model.
 *
 * Validates the canonical (date, HE) record set BEFORE the calculator runs
 * so monthly summaries never silently understate hours, and annual rollups
 * are clearly flagged as not-validation-safe when any month is incomplete.
 */
import type { HourlyRecord } from '@/hooks/usePowerModelCalculator';

export type CoverageStatus = 'complete' | 'partial' | 'empty';

export interface MonthCoverage {
  /** Year. */
  year: number;
  /** 0-indexed calendar month. */
  month: number;
  /** "January 2026" style label. */
  label: string;
  /** Expected canonical hours in this calendar month. */
  expectedHours: number;
  /** Distinct (date, HE) buckets present. */
  coveredHours: number;
  /** Raw record count (may exceed coveredHours if duplicates were present). */
  rawRecords: number;
  /** Hours expected but not present. */
  missingHours: number;
  /** True when the calendar month has fully elapsed at audit time. */
  isComplete: boolean;
  /** Coverage classification. */
  status: CoverageStatus;
}

export interface CoverageReport {
  totalRecords: number;
  distinctHours: number;
  duplicateRecords: number;
  invalidRecords: number;
  months: MonthCoverage[];
  /** True only when every elapsed month is fully covered. */
  isValidationSafe: boolean;
  /** Earliest record date (ISO). */
  firstDate: string | null;
  /** Latest record date (ISO). */
  lastDate: string | null;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Audit raw (pre-dedupe) and deduped hourly records together so we can flag
 * both missing hours and duplicate raw rows.
 */
export function auditCoverage(
  rawRecords: HourlyRecord[],
  dedupedRecords: HourlyRecord[],
  now: Date = new Date(),
): CoverageReport {
  let invalidRecords = 0;
  const buckets = new Map<string, { year: number; month: number }>();

  for (const r of dedupedRecords) {
    const d = new Date(r.date);
    if (
      Number.isNaN(d.getTime()) ||
      !Number.isFinite(r.he) || r.he < 1 || r.he > 24 ||
      !Number.isFinite(r.poolPrice)
    ) {
      invalidRecords++;
      continue;
    }
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    buckets.set(`${r.date}|${r.he}`, { year, month });
  }

  const monthsByKey = new Map<string, MonthCoverage>();
  for (const { year, month } of buckets.values()) {
    const key = `${year}-${month}`;
    if (!monthsByKey.has(key)) {
      const expected = daysInMonth(year, month) * 24;
      monthsByKey.set(key, {
        year, month,
        label: `${MONTH_NAMES[month]} ${year}`,
        expectedHours: expected,
        coveredHours: 0,
        rawRecords: 0,
        missingHours: expected,
        isComplete: false,
        status: 'empty',
      });
    }
    const m = monthsByKey.get(key)!;
    m.coveredHours += 1;
  }

  for (const r of rawRecords) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const m = monthsByKey.get(key);
    if (m) m.rawRecords += 1;
  }

  const months = Array.from(monthsByKey.values()).sort(
    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
  );

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  for (const m of months) {
    m.missingHours = Math.max(0, m.expectedHours - m.coveredHours);
    m.isComplete = (m.year * 12 + m.month) < (nowYear * 12 + nowMonth);
    if (m.coveredHours === 0) m.status = 'empty';
    else if (m.coveredHours >= m.expectedHours) m.status = 'complete';
    else m.status = 'partial';
  }

  // Validation-safe only when every elapsed month is complete.
  const isValidationSafe = months.every((m) => !m.isComplete || m.status === 'complete');

  const allDates = dedupedRecords.map((r) => r.date).filter(Boolean);
  allDates.sort();

  const distinctHours = buckets.size;
  const duplicateRecords = Math.max(0, rawRecords.length - distinctHours);

  return {
    totalRecords: rawRecords.length,
    distinctHours,
    duplicateRecords,
    invalidRecords,
    months,
    isValidationSafe,
    firstDate: allDates[0] ?? null,
    lastDate: allDates[allDates.length - 1] ?? null,
  };
}