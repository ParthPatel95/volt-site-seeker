import { serve, createClient } from "../_shared/imports.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflow = 'full_update' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting workflow: ${workflow}`);
    const startTime = Date.now();
    const results: any = {};

    // Define workflow sequences
    const workflows: Record<string, string[]> = {
      'data_collection': [
        'aeso-natural-gas-collector',
        'aeso-data-collector',
        'aeso-weather-collector'
      ],
      'feature_engineering': [
        'aeso-feature-calculator',
        'aeso-regime-detector'
      ],
      'model_training': [
        'aeso-data-quality-checker',
        'aeso-model-trainer'
      ],
      'prediction': [
        'aeso-ensemble-predictor',
        'aeso-lstm-predictor'
      ],
      'validation': [
        'aeso-prediction-validator',
        'aeso-performance-tracker'
      ],
      'full_update': [
        'aeso-natural-gas-collector',
        'aeso-data-collector',
        'aeso-weather-collector',
        'aeso-data-quality-checker',
        'aeso-feature-calculator',
        'aeso-regime-detector',
        'aeso-ensemble-predictor',
        'aeso-lstm-predictor',
        'aeso-performance-tracker'
      ],
      'daily_maintenance': [
        'aeso-data-quality-checker',
        'aeso-performance-tracker',
        'aeso-prediction-validator'
      ]
    };

    const selectedWorkflow = workflows[workflow] || workflows['full_update'];
    console.log(`Executing ${selectedWorkflow.length} tasks...`);

    // Execute tasks sequentially
    for (const taskName of selectedWorkflow) {
      const taskStart = Date.now();
      console.log(`\n📋 Starting task: ${taskName}`);
      
      try {
        // Call the edge function
        const { data, error } = await supabase.functions.invoke(taskName, {
          body: { orchestrated: true }
        });

        const taskTime = Date.now() - taskStart;

        if (error) {
          console.error(`❌ Task ${taskName} failed:`, error);
          results[taskName] = {
            status: 'failed',
            error: error.message,
            execution_time_ms: taskTime
          };

          // Store failure
          await supabase.from('aeso_scheduled_tasks').insert({
            task_name: taskName,
            task_type: workflow,
            last_run: new Date().toISOString(),
            status: 'failed',
            execution_time_ms: taskTime,
            error_message: error.message
          });

          // For critical tasks, stop the workflow
          if (['aeso-data-collector', 'aeso-data-quality-checker'].includes(taskName)) {
            throw new Error(`Critical task ${taskName} failed, stopping workflow`);
          }
        } else {
          console.log(`✅ Task ${taskName} completed (${taskTime}ms)`);
          results[taskName] = {
            status: 'success',
            data,
            execution_time_ms: taskTime
          };

          // Store success
          await supabase.from('aeso_scheduled_tasks').insert({
            task_name: taskName,
            task_type: workflow,
            last_run: new Date().toISOString(),
            status: 'completed',
            execution_time_ms: taskTime,
            result: data
          });
        }

        // Small delay between tasks to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (taskError: any) {
        console.error(`❌ Task ${taskName} exception:`, taskError);
        results[taskName] = {
          status: 'error',
          error: taskError.message,
          execution_time_ms: Date.now() - taskStart
        };

        // Store error
        await supabase.from('aeso_scheduled_tasks').insert({
          task_name: taskName,
          task_type: workflow,
          last_run: new Date().toISOString(),
          status: 'error',
          execution_time_ms: Date.now() - taskStart,
          error_message: taskError.message
        });

        // Continue with next task unless it's critical
        if (['aeso-data-collector', 'aeso-data-quality-checker'].includes(taskName)) {
          break;
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = Object.values(results).filter((r: any) => r.status === 'success').length;
    const failedCount = Object.values(results).filter((r: any) => r.status === 'failed' || r.status === 'error').length;

    console.log(`\n🏁 Workflow complete: ${successCount}/${selectedWorkflow.length} tasks succeeded`);

    return new Response(
      JSON.stringify({ 
        success: failedCount === 0,
        workflow,
        total_time_ms: totalTime,
        tasks_executed: selectedWorkflow.length,
        tasks_succeeded: successCount,
        tasks_failed: failedCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in orchestrator:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
