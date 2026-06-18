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
  /**
   * Strictest possible check: covered hours AND raw rows AND expected hours
   * are all the same number. Only `true` when there is exactly one row per
   * hour for every expected hour in this month (no missing, no duplicates).
   */
  exactMatch: boolean;
}

export interface CoverageReport {
  totalRecords: number;
  distinctHours: number;
  duplicateRecords: number;
  invalidRecords: number;
  months: MonthCoverage[];
  /** True only when every elapsed month is fully covered. */
  isValidationSafe: boolean;
  /**
   * True only when every month in the report (elapsed AND in-progress)
   * satisfies `exactMatch`. This is the "exact points per hour per month"
   * contract we surface to the UI.
   */
  isExactCoverage: boolean;
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
 * Canonical expected hours for a (year, month) bucket given a wall-clock
 * "now". Matches the DB function `audit_aeso_hourly_coverage`:
 *   - fully elapsed month → daysInMonth × 24
 *   - in-progress month   → whole hours since month start (UTC), to `now`
 *   - future month        → 0
 */
function expectedHoursFor(year: number, monthIndex: number, now: Date): number {
  const monthStart = Date.UTC(year, monthIndex, 1);
  const nextMonthStart = Date.UTC(year, monthIndex + 1, 1);
  const nowMs = Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), 0, 0,
  );
  if (nextMonthStart <= nowMs) return daysInMonth(year, monthIndex) * 24;
  if (monthStart > nowMs) return 0;
  return Math.max(0, Math.floor((nowMs - monthStart) / (3600 * 1000)));
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
    // Parse "YYYY-MM-DD" as explicit calendar components — never
    // `new Date(r.date)`, which interprets ISO strings as UTC midnight
    // and can shift to the previous day in negative-offset timezones.
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r.date ?? '');
    if (
      !parts ||
      !Number.isFinite(r.he) || r.he < 1 || r.he > 24 ||
      !Number.isFinite(r.poolPrice)
    ) {
      invalidRecords++;
      continue;
    }
    const year = Number(parts[1]);
    const month = Number(parts[2]) - 1;
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
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r.date ?? '');
    if (!parts) continue;
    const key = `${Number(parts[1])}-${Number(parts[2]) - 1}`;
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