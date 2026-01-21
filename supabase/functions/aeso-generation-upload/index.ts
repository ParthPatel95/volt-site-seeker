import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GenerationRow {
  timestamp: string;
  generation_gas?: number | null;
  generation_wind?: number | null;
  generation_solar?: number | null;
  generation_hydro?: number | null;
  generation_coal?: number | null;
  generation_other?: number | null;
}

interface UploadRequest {
  rows: Record<string, string | number>[];
  columnMapping?: Record<string, string>;
}

// Default column mappings (case-insensitive matching)
const DEFAULT_COLUMN_MAPPINGS: Record<string, string[]> = {
  timestamp: ['timestamp', 'date', 'datetime', 'time', 'date_time', 'begin_datetime_mpt'],
  generation_gas: ['gas', 'natural_gas', 'gas_mw', 'natural gas', 'gas-fired', 'gas_generation'],
  generation_wind: ['wind', 'wind_mw', 'wind_generation', 'wind power'],
  generation_solar: ['solar', 'solar_mw', 'solar_generation', 'solar power'],
  generation_hydro: ['hydro', 'hydro_mw', 'hydro_generation', 'hydroelectric'],
  generation_coal: ['coal', 'coal_mw', 'coal_generation'],
  generation_other: ['other', 'other_mw', 'dual_fuel', 'dual fuel', 'other_generation', 'energy_storage', 'storage'],
};

function findColumnMatch(headers: string[], targetMappings: string[]): string | null {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  for (const mapping of targetMappings) {
    const idx = lowerHeaders.indexOf(mapping.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

function parseTimestamp(value: string): string | null {
  if (!value) return null;
  
  // Try parsing various formats
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  // Try YYYY-MM-DD HH:MM format
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return new Date(
      parseInt(year), parseInt(month) - 1, parseInt(day),
      parseInt(hour), parseInt(minute), 0
    ).toISOString();
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rows, columnMapping }: UploadRequest = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No rows provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get headers from first row
    const headers = Object.keys(rows[0]);
    console.log('Received headers:', headers);

    // Build column mapping
    const mapping: Record<string, string> = {};
    for (const [dbColumn, possibleNames] of Object.entries(DEFAULT_COLUMN_MAPPINGS)) {
      // Check custom mapping first
      if (columnMapping && columnMapping[dbColumn]) {
        mapping[dbColumn] = columnMapping[dbColumn];
      } else {
        const match = findColumnMatch(headers, possibleNames);
        if (match) mapping[dbColumn] = match;
      }
    }

    console.log('Column mapping:', mapping);

    if (!mapping.timestamp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not find timestamp column',
          headers,
          availableMappings: Object.keys(DEFAULT_COLUMN_MAPPINGS)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Parse rows
    const updates: GenerationRow[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const timestamp = parseTimestamp(String(row[mapping.timestamp]));
      
      if (!timestamp) {
        errors.push({ row: i, error: `Invalid timestamp: ${row[mapping.timestamp]}` });
        continue;
      }

      const update: GenerationRow = { timestamp };

      if (mapping.generation_gas) {
        update.generation_gas = parseNumber(row[mapping.generation_gas]);
      }
      if (mapping.generation_wind) {
        update.generation_wind = parseNumber(row[mapping.generation_wind]);
      }
      if (mapping.generation_solar) {
        update.generation_solar = parseNumber(row[mapping.generation_solar]);
      }
      if (mapping.generation_hydro) {
        update.generation_hydro = parseNumber(row[mapping.generation_hydro]);
      }
      if (mapping.generation_coal) {
        update.generation_coal = parseNumber(row[mapping.generation_coal]);
      }
      if (mapping.generation_other) {
        update.generation_other = parseNumber(row[mapping.generation_other]);
      }

      updates.push(update);
    }

    console.log(`Parsed ${updates.length} valid rows, ${errors.length} errors`);

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid rows to update',
          parseErrors: errors.slice(0, 10)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Batch upsert - update existing records by timestamp
    const { error: upsertError, count } = await supabase
      .from('aeso_training_data')
      .upsert(updates, { 
        onConflict: 'timestamp',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: upsertError.message,
          code: upsertError.code
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        processed: updates.length,
        parseErrors: errors.length,
        sampleErrors: errors.slice(0, 5),
        columnMapping: mapping,
        durationMs: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        durationMs: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
