
import { Territory, MarketData } from './types.ts';

// Helper: call our unified energy-data-integration function for current pricing (live)
async function fetchLiveCurrentPriceCents(market: string): Promise<number | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !anonKey) throw new Error('Missing Supabase env for function call');

    const res = await fetch(`${supabaseUrl}/functions/v1/energy-data-integration`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error(`integration status ${res.status}`);
    const data = await res.json();

    const pricing = market === 'AESO' ? data?.aeso?.pricing : data?.ercot?.pricing;
    // The integration returns $/MWh numbers; convert to ¢/kWh when needed
    // If value looks like $/MWh (tens), use *0.1; if already looks like ¢/kWh (single digits), keep
    const dollarsPerMWh = pricing?.current_price ?? pricing?.average_price;
    if (typeof dollarsPerMWh === 'number') {
      const centsPerKWh = dollarsPerMWh * 0.1; // $/MWh -> ¢/kWh
      return Math.round(centsPerKWh * 1000) / 1000; // keep 3 decimals
    }
  } catch (e) {
    console.error('fetchLiveCurrentPriceCents error:', e);
  }
  return null;
}

// Helper: fetch both live current and today's average price from energy-data-integration (converted to ¢/kWh)
async function fetchLiveAndAverageCents(market: string): Promise<{ currentCents: number | null; averageCents: number | null }> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !anonKey) throw new Error('Missing Supabase env for function call');
    const res = await fetch(`${supabaseUrl}/functions/v1/energy-data-integration`, {
      method: 'POST',
      headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error(`integration status ${res.status}`);
    const data = await res.json();
    const pricing = market === 'AESO' ? data?.aeso?.pricing : data?.ercot?.pricing;
    const toCents = (val: any) => typeof val === 'number' ? Math.round(val * 0.1 * 1000) / 1000 : null;
    const current = toCents(pricing?.current_price);
    const average = toCents(pricing?.average_price);
    return {
      currentCents: current,
      averageCents: average
    };
  } catch (e) {
    console.error('fetchLiveAndAverageCents error:', e);
    return { currentCents: null, averageCents: null };
  }
}

// Helper: attempt to fetch AESO historical hourly/daily SPP/SMP and aggregate to monthly
async function fetchAESOMonthlyAveragesCents(startISO: string, endISO: string): Promise<MarketData[]> {
  const results: MarketData[] = [];
  try {
    // Try AESO public API v1.1 (requires AESO_SUB_KEY)
    const apiKey = Deno.env.get('AESO_SUB_KEY') || Deno.env.get('AESO_API_KEY');
    if (apiKey) {
      const url = `https://api.aeso.ca/report/v1.1/price/spp?startDate=${encodeURIComponent(startISO)}&endDate=${encodeURIComponent(endISO)}&format=json`;
      const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
      if (res.ok) {
        const json: any = await res.json();
        const rows: any[] = json?.return ? json.return : (json?.data || []);
        if (Array.isArray(rows) && rows.length) {
          // Map by month -> { sum$/MWh, count }
          const bucket = new Map<string, { sum: number; count: number }>();
          for (const r of rows) {
            const ts = new Date(r?.begin_datetime_mpt || r?.begin_datetime_utc || r?.timestamp || r?.date || r?.time || Date.now());
            const key = ts.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const price = parseFloat(r?.spp || r?.smp || r?.pool_price || r?.price || r?.value);
            if (!Number.isFinite(price)) continue;
            const cur = bucket.get(key) || { sum: 0, count: 0 };
            cur.sum += price; // price assumed $/MWh
            cur.count += 1;
            bucket.set(key, cur);
          }
          const sortedKeys = Array.from(bucket.keys()).sort((a, b) => new Date(a + ' 1').getTime() - new Date(b + ' 1').getTime());
          for (const key of sortedKeys) {
            const { sum, count } = bucket.get(key)!;
            const dollarsPerMWh = sum / Math.max(count, 1);
            const centsPerKWh = dollarsPerMWh * 0.1;
            results.push({ month: key, marketPrice: Math.round(centsPerKWh * 1000) / 1000 });
          }
          return results;
        }
      } else {
        console.error('AESO API spp status:', res.status);
      }
    } else {
      console.warn('AESO API key not configured, skipping historical fetch');
    }
  } catch (e) {
    console.error('fetchAESOMonthlyAveragesCents error:', e);
  }
  return results; // possibly empty
}

export async function getMarketData(territory: Territory, _currency: string, requireRealData = false): Promise<MarketData[]> {
  console.log('Getting market data (live) for', territory.market);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = now.toISOString().slice(0, 10);

  // Attempt to build monthly series from historical sources
  let months: MarketData[] = [];

  if (territory.market === 'AESO') {
    months = await fetchAESOMonthlyAveragesCents(startISO, endISO);
  } else if (territory.market === 'ERCOT') {
    // TODO: Implement ERCOT historical monthly averages via public reports when available
    months = [];
  }

  // Pull live and average values from integration (one network call)
  const { currentCents, averageCents } = await fetchLiveAndAverageCents(territory.market);
  const currentKey = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // If historical series missing, synthesize a flat 12‑month series using the integration's average price
  if (!requireRealData && (!months || months.length === 0) && (averageCents !== null || currentCents !== null)) {
    const base = averageCents ?? currentCents!;
    const synthetic: MarketData[] = [];
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      synthetic.push({
        month: dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        marketPrice: base
      });
    }
    months = synthetic;
  }

  // Ensure current month uses the latest live price when available
  if (currentCents !== null) {
    const idx = months.findIndex(m => m.month === currentKey);
    if (idx >= 0) months[idx] = { month: currentKey, marketPrice: currentCents };
    else months.push({ month: currentKey, marketPrice: currentCents });
  }

  // Limit to last 12 months and sort chronologically
  months = months
    .filter(Boolean)
    .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime())
    .slice(-12);

  // As a last resort, if still nothing, return one entry for current month (still live, not synthetic)
  if (!months.length && currentCents !== null) {
    months = [{ month: currentKey, marketPrice: currentCents }];
  }

  return months;
}
