import type { HourlyRecord } from '@/hooks/usePowerModelCalculator';

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

  return records;
}

/**
 * Convert aeso_training_data database records to HourlyRecord[].
 */
export function convertTrainingDataToHourly(
  data: Array<{ timestamp: string; pool_price: number; ail_mw: number | null }>
): HourlyRecord[] {
  return data
    .filter(d => d.ail_mw != null)
    .map(d => {
      const dt = new Date(d.timestamp);
      return {
        date: dt.toISOString().split('T')[0],
        he: dt.getHours() || 24, // HE 1-24 convention
        poolPrice: d.pool_price,
        ailMW: d.ail_mw!,
      };
    });
}
