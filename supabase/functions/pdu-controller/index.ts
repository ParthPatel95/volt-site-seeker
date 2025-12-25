import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDUAction {
  action: 'register' | 'shutdown' | 'power_on' | 'status' | 'schedule_shutdown' | 'list' | 'update' | 'delete';
  pdu_id?: string;
  pdu_ids?: string[];
  pdu_data?: {
    name: string;
    ip_address?: string;
    protocol: string;
    api_endpoint?: string;
    priority_group: string;
    location?: string;
    total_outlets?: number;
    max_capacity_kw?: number;
  };
  reason?: string;
  scheduled_time?: string;
  grace_period_seconds?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: PDUAction = await req.json();
    const { action } = body;

    console.log(`PDU Controller: Received action: ${action}`);

    switch (action) {
      case 'register': {
        const { pdu_data } = body;
        if (!pdu_data) {
          return new Response(JSON.stringify({ error: 'Missing pdu_data' }), {
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
          .from('pdu_devices')
          .insert({
            name: pdu_data.name,
            ip_address: pdu_data.ip_address,
            protocol: pdu_data.protocol,
            api_endpoint: pdu_data.api_endpoint,
            priority_group: pdu_data.priority_group,
            location: pdu_data.location,
            total_outlets: pdu_data.total_outlets || 8,
            max_capacity_kw: pdu_data.max_capacity_kw || 0,
            current_status: 'online',
            created_by: userId,
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`PDU registered: ${data.id}`);
        return new Response(JSON.stringify({ success: true, pdu: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list': {
        const { data, error } = await supabase
          .from('pdu_devices')
          .select('*')
          .order('priority_group', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, pdus: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'status': {
        const { pdu_id, pdu_ids } = body;
        const ids = pdu_ids || (pdu_id ? [pdu_id] : null);

        if (!ids) {
          return new Response(JSON.stringify({ error: 'Missing pdu_id or pdu_ids' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('pdu_devices')
          .select('*')
          .in('id', ids);

        if (error) throw error;

        // Get latest power readings for each PDU
        const { data: readings } = await supabase
          .from('pdu_power_readings')
          .select('*')
          .in('pdu_id', ids)
          .order('timestamp', { ascending: false })
          .limit(ids.length);

        return new Response(JSON.stringify({ 
          success: true, 
          pdus: data,
          readings: readings || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'shutdown': {
        const { pdu_ids, reason, grace_period_seconds } = body;
        if (!pdu_ids || pdu_ids.length === 0) {
          return new Response(JSON.stringify({ error: 'Missing pdu_ids' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get PDU details before shutdown
        const { data: pdus } = await supabase
          .from('pdu_devices')
          .select('*')
          .in('id', pdu_ids);

        const totalLoad = pdus?.reduce((sum, pdu) => sum + (pdu.current_load_kw || 0), 0) || 0;

        // Update PDU status to shutting_down
        const { error: updateError } = await supabase
          .from('pdu_devices')
          .update({ 
            current_status: 'shutting_down',
            last_status_check: new Date().toISOString()
          })
          .in('id', pdu_ids);

        if (updateError) throw updateError;

        // Log the automation action
        const { data: logEntry, error: logError } = await supabase
          .from('datacenter_automation_log')
          .insert({
            action_type: 'shutdown',
            affected_pdus: pdu_ids,
            affected_pdu_count: pdu_ids.length,
            total_load_affected_kw: totalLoad,
            executed_by: reason || 'api_request',
            status: 'executing',
            metadata: { grace_period_seconds, reason }
          })
          .select()
          .single();

        if (logError) throw logError;

        // Simulate grace period and actual shutdown
        // In production, this would send commands to actual PDUs via SNMP/Modbus/REST
        setTimeout(async () => {
          await supabase
            .from('pdu_devices')
            .update({ 
              current_status: 'offline',
              active_outlets: 0,
              current_load_kw: 0,
              last_status_check: new Date().toISOString()
            })
            .in('id', pdu_ids);

          await supabase
            .from('datacenter_automation_log')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              duration_seconds: grace_period_seconds || 60
            })
            .eq('id', logEntry.id);
        }, (grace_period_seconds || 60) * 1000);

        console.log(`Shutdown initiated for ${pdu_ids.length} PDUs`);
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Shutdown initiated for ${pdu_ids.length} PDUs`,
          log_id: logEntry.id,
          affected_load_kw: totalLoad
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'power_on': {
        const { pdu_ids, reason } = body;
        if (!pdu_ids || pdu_ids.length === 0) {
          return new Response(JSON.stringify({ error: 'Missing pdu_ids' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update PDU status
        const { error: updateError } = await supabase
          .from('pdu_devices')
          .update({ 
            current_status: 'starting_up',
            last_status_check: new Date().toISOString()
          })
          .in('id', pdu_ids);

        if (updateError) throw updateError;

        // Get PDU details
        const { data: pdus } = await supabase
          .from('pdu_devices')
          .select('*')
          .in('id', pdu_ids);

        // Log the automation action
        const { data: logEntry } = await supabase
          .from('datacenter_automation_log')
          .insert({
            action_type: 'resume',
            affected_pdus: pdu_ids,
            affected_pdu_count: pdu_ids.length,
            executed_by: reason || 'api_request',
            status: 'executing',
          })
          .select()
          .single();

        // Simulate startup sequence
        setTimeout(async () => {
          for (const pdu of pdus || []) {
            await supabase
              .from('pdu_devices')
              .update({ 
                current_status: 'online',
                active_outlets: pdu.total_outlets,
                last_status_check: new Date().toISOString()
              })
              .eq('id', pdu.id);
          }

          await supabase
            .from('datacenter_automation_log')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', logEntry?.id);
        }, 30000); // 30 second startup

        console.log(`Power on initiated for ${pdu_ids.length} PDUs`);
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Power on initiated for ${pdu_ids.length} PDUs`,
          log_id: logEntry?.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        const { pdu_id, pdu_data } = body;
        if (!pdu_id || !pdu_data) {
          return new Response(JSON.stringify({ error: 'Missing pdu_id or pdu_data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('pdu_devices')
          .update(pdu_data)
          .eq('id', pdu_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, pdu: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete': {
        const { pdu_id } = body;
        if (!pdu_id) {
          return new Response(JSON.stringify({ error: 'Missing pdu_id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('pdu_devices')
          .delete()
          .eq('id', pdu_id);

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
    console.error('PDU Controller error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
