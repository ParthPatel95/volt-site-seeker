import type { HourlyRecord } from '@/hooks/usePowerModelCalculator';

/**
 * Deduplicate hourly records by full timestamp (date + hour-ending).
 * Later occurrences win (assumes input is in any order; the last write
 * for a given (date, he) key is kept). This prevents the same calendar
 * hour from being counted multiple times when the source data set has
 * overlapping ingests, multiple year imports, or duplicate cron rows.
 */
export function dedupeHourly(records: HourlyRecord[]): HourlyRecord[] {
  const map = new Map<string, HourlyRecord>();
  for (const r of records) {
    map.set(`${r.date}-${r.he}`, r);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.date === b.date) return a.he - b.he;
    return a.date < b.date ? -1 : 1;
  });
}

/**
 * Parse CSV text (from the Power Model spreadsheet export) into HourlyRecord[].
 * Expected columns: Date, HE, Pool $/MWh, AIL MW
 */
export function parsePowerModelCSV(csvText: string): HourlyRecord[] {
  const lines = csvText.trim().split('\n');
  const records: HourlyRecord[] = [];

  for (const line of lines) {
    const cols = line.split(',').map(c => c.trim().replace(/^\$/, '').replace(/,/g, ''));
    // Try to detect header row
    if (cols[0]?.toLowerCase().includes('date') || cols[0]?.toLowerCase().includes('hour')) continue;

    const date = cols[0];
    const he = parseInt(cols[1]);
    const poolPrice = parseFloat(cols[2]);
    const ailMW = parseFloat(cols[3]);

    if (date && !isNaN(he) && !isNaN(poolPrice) && !isNaN(ailMW)) {
      records.push({ date, he, poolPrice, ailMW });
    }
  }

  return dedupeHourly(records);
}

/**
 * Convert aeso_training_data database records to HourlyRecord[].
 */
export function convertTrainingDataToHourly(
  data: Array<{ timestamp: string; pool_price: number; ail_mw: number | null }>
): HourlyRecord[] {
  return dedupeHourly(rawTrainingDataToHourly(data));
}

/**
 * Convert raw training-data rows to HourlyRecord[] WITHOUT deduping.
 * Use this when you need to audit how many duplicate raw rows exist before
 * the canonical (date, HE) collapse. Uses UTC consistently so the date and
 * HE always come from the same hour bucket regardless of browser timezone.
 */
export function rawTrainingDataToHourly(
  data: Array<{ timestamp: string; pool_price: number; ail_mw: number | null }>,
): HourlyRecord[] {
  const out: HourlyRecord[] = [];
  for (const d of data) {
    const dt = new Date(d.timestamp);
    if (Number.isNaN(dt.getTime())) continue;
    // Stable UTC bucketing: keep each timestamp inside its actual UTC
    // calendar day. HE = UTC hour + 1 (so 00:00 UTC -> HE 1, 23:00 UTC ->
    // HE 24). Mapping 00:00 UTC back to HE 24 of the previous day leaks
    // the first hour of January into December and breaks YTD coverage.
    const date = dt.toISOString().slice(0, 10);
    const he = dt.getUTCHours() + 1;
    out.push({
      date,
      he,
      poolPrice: d.pool_price,
      // Coverage audit must see every canonical hour. When live AIL isn't
      // back-filled yet we keep the hour and surface AIL as 0 so the row
      // is still counted toward expected calendar coverage.
      ailMW: d.ail_mw ?? 0,
    });
  }
  return out;
}
