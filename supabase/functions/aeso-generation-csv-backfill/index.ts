import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// AESO fuel type classification based on unit name patterns
const FUEL_TYPE_MAP: Record<string, string> = {
  // Gas units
  'SHEPARD': 'gas', 'HEARTLAND': 'gas', 'GENESEE': 'gas', 'KEEPHILLS': 'gas',
  'RAINBOW': 'gas', 'SUNCOR': 'gas', 'BALZAC': 'gas', 'CROSSFIELD': 'gas',
  'JOFFRE': 'gas', 'COGENERATION': 'gas', 'COGEN': 'gas', 'GT': 'gas',
  'PEAKER': 'gas', 'COMBINED CYCLE': 'gas', 'CC': 'gas', 'CT': 'gas',
  'TURBINE': 'gas', 'NATURAL GAS': 'gas',
  // Wind
  'WIND': 'wind', 'WF': 'wind', 'WINDFARM': 'wind',
  // Solar
  'SOLAR': 'solar', 'PV': 'solar', 'PHOTOVOLTAIC': 'solar',
  // Hydro
  'HYDRO': 'hydro', 'BIGHORN': 'hydro', 'BOW RIVER': 'hydro',
  'CASCADE': 'hydro', 'GHOST': 'hydro', 'HORSESHOE': 'hydro',
  'SPRAY': 'hydro', 'BEARSPAW': 'hydro', 'BRAZEAU': 'hydro',
  // Coal
  'COAL': 'coal', 'BATTLE RIVER': 'coal', 'HR MILNER': 'coal',
  'SUNDANCE': 'coal',
};

function classifyFuelType(unitName: string): string {
  const upper = unitName.toUpperCase();
  for (const [keyword, fuelType] of Object.entries(FUEL_TYPE_MAP)) {
    if (upper.includes(keyword)) return fuelType;
  }
  return 'other';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { csvData, mode = 'info' } = body;

    // Info mode: return instructions for manual CSV upload
    if (mode === 'info' || !csvData) {
      return new Response(JSON.stringify({
        success: true,
        mode: 'info',
        message: 'AESO Generation CSV Backfill - Manual Upload Required',
        instructions: [
          '1. Go to aeso.ca → Market → Data Requests → Historical Generation Data',
          '2. Download "Hourly Metered Volumes and Pool Price and AIL - 2020 to 2025"',
          '3. Open the CSV and use the GenerationDataUploader component in the AI Predictions tab',
          '4. OR call this function with mode="process" and csvData=<csv content>',
        ],
        csvFormat: {
          expectedColumns: ['Date', 'Hour', 'Asset ID', 'Asset Name', 'Volume (MW)'],
          note: 'Per-unit hourly generation will be aggregated by fuel type'
        },
        alternativeEndpoint: 'Use the existing aeso-generation-upload function for chunk-based uploads'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process mode: parse CSV and aggregate by fuel type per hour
    console.log('📊 Processing generation CSV data...');
    
    const lines = csvData.split('\n');
    const headerLine = lines[0];
    console.log(`CSV has ${lines.length} lines, header: ${headerLine?.slice(0, 100)}`);

    // Parse header to find column indices
    const headers = headerLine.split(',').map((h: string) => h.trim().replace(/"/g, ''));
    const dateIdx = headers.findIndex((h: string) => /date/i.test(h));
    const hourIdx = headers.findIndex((h: string) => /hour|he/i.test(h));
    const nameIdx = headers.findIndex((h: string) => /name|asset/i.test(h));
    const volumeIdx = headers.findIndex((h: string) => /volume|mw|generation/i.test(h));

    if (dateIdx < 0 || hourIdx < 0 || volumeIdx < 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not identify required columns (Date, Hour, Volume)',
        foundHeaders: headers
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Aggregate by timestamp and fuel type
    const hourlyAgg: Record<string, Record<string, number>> = {};
    let parsedRows = 0;
    let skippedRows = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c: string) => c.trim().replace(/"/g, ''));
      const date = cols[dateIdx];
      const hour = parseInt(cols[hourIdx]);
      const name = cols[nameIdx] || 'UNKNOWN';
      const volume = parseFloat(cols[volumeIdx]);

      if (!date || isNaN(hour) || isNaN(volume)) {
        skippedRows++;
        continue;
      }

      // Convert to timestamp (HE convention: HE1 = 00:00, HE24 = 23:00)
      const hourUTC = (hour - 1 + 7) % 24; // Mountain to UTC (approx)
      const timestamp = `${date}T${String(hourUTC).padStart(2, '0')}:00:00`;
      const fuelType = classifyFuelType(name);

      if (!hourlyAgg[timestamp]) {
        hourlyAgg[timestamp] = { gas: 0, wind: 0, solar: 0, hydro: 0, coal: 0, other: 0 };
      }
      hourlyAgg[timestamp][fuelType] += volume;
      parsedRows++;
    }

    const timestamps = Object.keys(hourlyAgg);
    console.log(`Parsed ${parsedRows} rows, skipped ${skippedRows}, got ${timestamps.length} unique hours`);

    // Upsert into aeso_training_data
    let updatedRecords = 0;
    const errors: string[] = [];

    for (let i = 0; i < timestamps.length; i += 50) {
      const batch = timestamps.slice(i, i + 50);
      const promises = batch.map(ts => {
        const gen = hourlyAgg[ts];
        return supabase
          .from('aeso_training_data')
          .update({
            generation_gas: Math.round(gen.gas),
            generation_wind: Math.round(gen.wind),
            generation_solar: Math.round(gen.solar),
            generation_hydro: Math.round(gen.hydro),
            generation_coal: Math.round(gen.coal),
            generation_other: Math.round(gen.other),
          })
          .eq('timestamp', ts);
      });

      const results = await Promise.all(promises);
      updatedRecords += results.filter(r => !r.error).length;

      if (results.some(r => r.error)) {
        const firstErr = results.find(r => r.error)?.error;
        errors.push(`Batch ${i}: ${firstErr?.message}`);
      }
    }

    console.log(`✅ Generation backfill complete: ${updatedRecords} records updated`);

    return new Response(JSON.stringify({
      success: true,
      parsedRows,
      skippedRows,
      uniqueTimestamps: timestamps.length,
      updatedRecords,
      sampleTimestamp: timestamps[0],
      sampleData: timestamps[0] ? hourlyAgg[timestamps[0]] : null,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Generation CSV backfill error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
