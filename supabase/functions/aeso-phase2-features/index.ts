import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting Phase 2 Feature Engineering: Fourier & Timing Features')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    const startTime = Date.now()

    // Calculate Phase 2 features using SQL
    const { data: result, error: calcError } = await supabase.rpc('calculate_phase2_features_batch')
    
    if (calcError) {
      console.error('❌ Phase 2 calculation error:', calcError)
      throw calcError
    }

    // Count records with Phase 2 features
    const { count: updatedCount, error: countError } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true })
      .not('fourier_daily_sin_1', 'is', null)

    if (countError) {
      console.error('❌ Count error:', countError)
      throw countError
    }

    // Get sample of newly calculated features
    const { data: sampleData, error: sampleError } = await supabase
      .from('aeso_training_data')
      .select('timestamp, hour_of_day, fourier_daily_sin_1, fourier_daily_cos_1, fourier_weekly_sin, fourier_annual_sin_1, is_morning_ramp, is_evening_peak, is_overnight')
      .not('fourier_daily_sin_1', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(5)

    if (sampleError) {
      console.error('⚠️ Sample fetch error:', sampleError)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('✅ Phase 2 Features Calculated Successfully')
    console.log(`📊 Records updated: ${updatedCount}`)
    console.log(`⏱️ Duration: ${duration}s`)
    console.log('📈 Sample features:', JSON.stringify(sampleData?.slice(0, 2), null, 2))

    return new Response(
      JSON.stringify({
        success: true,
        phase: 2,
        description: 'Fourier transforms and advanced timing features',
        stats: {
          total_records: result?.[0]?.total_records || 0,
          updated_records: updatedCount,
          fourier_features: 8,
          timing_features: 3,
          duration_seconds: parseFloat(duration)
        },
        improvements: [
          '✅ Daily Fourier components (2 harmonics)',
          '✅ Weekly Fourier components',
          '✅ Annual Fourier components (2 harmonics)',
          '✅ Morning ramp indicator (6-9 AM)',
          '✅ Evening peak indicator (5-9 PM)',
          '✅ Overnight indicator (11 PM - 5 AM)'
        ],
        sample_data: sampleData?.slice(0, 3) || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('❌ Phase 2 Feature Engineering Failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        phase: 2
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
