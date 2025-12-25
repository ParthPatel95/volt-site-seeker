import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationDecision {
  timestamp: string;
  current_price: number;
  predicted_price_1h: number;
  predicted_price_6h: number;
  grid_stress_level: 'normal' | 'elevated' | 'high' | 'critical';
  decision: 'continue' | 'prepare_shutdown' | 'shutdown' | 'resume';
  affected_pdu_groups: string[];
  reason: string;
  confidence_score: number;
  estimated_savings: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action } = body;

    console.log(`Automation Engine: Received action: ${action}`);

    switch (action) {
      case 'evaluate': {
        // Get current market data
        const { data: trainingData } = await supabase
          .from('aeso_training_data')
          .select('pool_price, timestamp, market_stress_score, reserve_margin_percent')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        const currentPrice = trainingData?.pool_price || 0;
        const gridStress = trainingData?.market_stress_score || 0;
        const reserveMargin = trainingData?.reserve_margin_percent || 15;

        // Get AI predictions
        const { data: predictions } = await supabase
          .from('aeso_ensemble_predictions')
          .select('ensemble_price, target_timestamp')
          .gte('target_timestamp', new Date().toISOString())
          .order('target_timestamp', { ascending: true })
          .limit(24);

        const prediction1h = predictions?.[0]?.ensemble_price || currentPrice;
        const prediction6h = predictions?.[5]?.ensemble_price || currentPrice;

        // Get active shutdown rules
        const { data: rules } = await supabase
          .from('datacenter_shutdown_rules')
          .select('*')
          .eq('is_active', true);

        // Get current PDU status
        const { data: pdus } = await supabase
          .from('pdu_devices')
          .select('*');

        const onlinePdus = pdus?.filter(p => p.current_status === 'online') || [];
        const offlinePdus = pdus?.filter(p => p.current_status === 'offline') || [];

        // Determine grid stress level
        let gridStressLevel: 'normal' | 'elevated' | 'high' | 'critical' = 'normal';
        if (gridStress > 80 || reserveMargin < 5) gridStressLevel = 'critical';
        else if (gridStress > 60 || reserveMargin < 10) gridStressLevel = 'high';
        else if (gridStress > 40 || reserveMargin < 15) gridStressLevel = 'elevated';

        // Evaluate each rule
        const decisions: AutomationDecision[] = [];
        let primaryDecision: AutomationDecision['decision'] = 'continue';
        let affectedGroups: string[] = [];
        let reason = 'Normal operation';
        let confidence = 0.9;
        let estimatedSavings = 0;

        for (const rule of rules || []) {
          const hardCeiling = rule.price_ceiling_cad;
          const softCeiling = rule.soft_ceiling_cad || hardCeiling * 0.85;
          const floor = rule.price_floor_cad;

          // Check for ceiling breach
          if (currentPrice >= hardCeiling) {
            primaryDecision = 'shutdown';
            affectedGroups = rule.affected_priority_groups;
            reason = `Price CA$${currentPrice.toFixed(2)} exceeds hard ceiling CA$${hardCeiling}`;
            confidence = 0.95;
            
            // Estimate savings based on affected load
            const affectedPdus = onlinePdus.filter(p => 
              affectedGroups.includes(p.priority_group)
            );
            const affectedLoad = affectedPdus.reduce((sum, p) => sum + (p.current_load_kw || 0), 0);
            estimatedSavings = (currentPrice - floor) * affectedLoad / 1000; // Per hour

            // Create alert
            await supabase.from('price_ceiling_alerts').insert({
              alert_type: 'ceiling_breach',
              current_price: currentPrice,
              threshold_price: hardCeiling,
              price_direction: currentPrice > prediction1h ? 'falling' : 'rising',
              grid_stress_level: gridStressLevel,
              rule_id: rule.id,
            });

            break;
          } else if (currentPrice >= softCeiling || prediction1h >= hardCeiling) {
            primaryDecision = 'prepare_shutdown';
            affectedGroups = rule.affected_priority_groups;
            reason = `Price approaching ceiling. Current: CA$${currentPrice.toFixed(2)}, 1h forecast: CA$${prediction1h.toFixed(2)}`;
            confidence = 0.75;

            // Create warning alert
            await supabase.from('price_ceiling_alerts').insert({
              alert_type: 'ceiling_warning',
              current_price: currentPrice,
              threshold_price: softCeiling,
              price_direction: 'rising',
              forecast_breach_hours: 1,
              grid_stress_level: gridStressLevel,
              rule_id: rule.id,
            });
          } else if (currentPrice <= floor && offlinePdus.length > 0) {
            // Check if we should resume
            const offlineFromRule = offlinePdus.filter(p =>
              rule.affected_priority_groups.includes(p.priority_group)
            );
            
            if (offlineFromRule.length > 0 && prediction1h <= floor * 1.1) {
              primaryDecision = 'resume';
              affectedGroups = rule.affected_priority_groups;
              reason = `Price CA$${currentPrice.toFixed(2)} below floor CA$${floor}, forecast stable`;
              confidence = 0.85;

              await supabase.from('price_ceiling_alerts').insert({
                alert_type: 'floor_breach',
                current_price: currentPrice,
                threshold_price: floor,
                price_direction: 'falling',
                grid_stress_level: gridStressLevel,
                rule_id: rule.id,
              });
            }
          }
        }

        // Grid stress emergency override
        if (gridStressLevel === 'critical' && primaryDecision !== 'shutdown') {
          primaryDecision = 'shutdown';
          affectedGroups = ['low', 'medium'];
          reason = `Grid stress critical (${gridStress}/100), reserve margin ${reserveMargin.toFixed(1)}%`;
          confidence = 0.99;

          await supabase.from('price_ceiling_alerts').insert({
            alert_type: 'grid_stress',
            current_price: currentPrice,
            threshold_price: 0,
            grid_stress_level: gridStressLevel,
          });
        }

        const decision: AutomationDecision = {
          timestamp: new Date().toISOString(),
          current_price: currentPrice,
          predicted_price_1h: prediction1h,
          predicted_price_6h: prediction6h,
          grid_stress_level: gridStressLevel,
          decision: primaryDecision,
          affected_pdu_groups: affectedGroups,
          reason,
          confidence_score: confidence,
          estimated_savings: estimatedSavings,
        };

        console.log('Automation decision:', decision);

        return new Response(JSON.stringify({ success: true, decision }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'execute': {
        const { decision } = body as { decision: AutomationDecision };
        if (!decision) {
          return new Response(JSON.stringify({ error: 'Missing decision' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get PDUs to affect
        const { data: pdus } = await supabase
          .from('pdu_devices')
          .select('*')
          .in('priority_group', decision.affected_pdu_groups);

        if (!pdus || pdus.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'No PDUs match the criteria' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const pduIds = pdus.map(p => p.id);

        if (decision.decision === 'shutdown') {
          // Execute shutdown via PDU controller
          const response = await fetch(`${supabaseUrl}/functions/v1/pdu-controller`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              action: 'shutdown',
              pdu_ids: pduIds,
              reason: decision.reason,
            }),
          });

          const result = await response.json();
          return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (decision.decision === 'resume') {
          const offlinePdus = pdus.filter(p => p.current_status === 'offline');
          const offlineIds = offlinePdus.map(p => p.id);

          if (offlineIds.length === 0) {
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'All PDUs already online' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const response = await fetch(`${supabaseUrl}/functions/v1/pdu-controller`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              action: 'power_on',
              pdu_ids: offlineIds,
              reason: decision.reason,
            }),
          });

          const result = await response.json();
          return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Decision: ${decision.decision}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_analytics': {
        const { period_days = 30 } = body;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period_days);

        // Get automation logs for the period
        const { data: logs } = await supabase
          .from('datacenter_automation_log')
          .select('*')
          .gte('executed_at', startDate.toISOString())
          .order('executed_at', { ascending: false });

        // Calculate metrics
        const shutdowns = logs?.filter(l => l.action_type === 'shutdown') || [];
        const resumes = logs?.filter(l => l.action_type === 'resume') || [];

        const totalSavings = logs?.reduce((sum, l) => sum + (l.estimated_savings_cad || 0), 0) || 0;
        const totalCurtailmentHours = shutdowns.reduce((sum, s) => sum + ((s.duration_seconds || 0) / 3600), 0);
        const avgPriceAvoided = shutdowns.length > 0 
          ? shutdowns.reduce((sum, s) => sum + (s.trigger_price || 0), 0) / shutdowns.length 
          : 0;

        // Get active alerts
        const { data: alerts } = await supabase
          .from('price_ceiling_alerts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({
          success: true,
          analytics: {
            period_days,
            total_shutdowns: shutdowns.length,
            total_resumes: resumes.length,
            total_savings_cad: totalSavings,
            total_curtailment_hours: totalCurtailmentHours,
            average_price_avoided_cad: avgPriceAvoided,
            recent_logs: logs?.slice(0, 20) || [],
            active_alerts: alerts || [],
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_rules': {
        const { data: rules, error } = await supabase
          .from('datacenter_shutdown_rules')
          .select('*')
          .order('price_ceiling_cad', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, rules }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create_rule': {
        const { rule_data } = body;
        if (!rule_data) {
          return new Response(JSON.stringify({ error: 'Missing rule_data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user from auth header
        const authHeader = req.headers.get('Authorization');
        let userId = null;
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          userId = user?.id;
        }

        const { data, error } = await supabase
          .from('datacenter_shutdown_rules')
          .insert({
            ...rule_data,
            created_by: userId,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, rule: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_rule': {
        const { rule_id, rule_data } = body;
        if (!rule_id || !rule_data) {
          return new Response(JSON.stringify({ error: 'Missing rule_id or rule_data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('datacenter_shutdown_rules')
          .update(rule_data)
          .eq('id', rule_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, rule: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_rule': {
        const { rule_id } = body;
        if (!rule_id) {
          return new Response(JSON.stringify({ error: 'Missing rule_id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('datacenter_shutdown_rules')
          .delete()
          .eq('id', rule_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Automation Engine error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
