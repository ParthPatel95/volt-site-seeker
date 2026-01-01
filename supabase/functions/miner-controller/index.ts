import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HydroMiner {
  id: string;
  name: string;
  model: string;
  ip_address: string;
  api_port: number;
  http_port: number;
  firmware_type: 'stock' | 'luxos' | 'braiins' | 'foundry';
  api_credentials: { username?: string; password?: string };
  priority_group: string;
  current_status: string;
}

interface CGMinerResponse {
  STATUS?: Array<{ STATUS: string; Msg: string }>;
  STATS?: any[];
  SUMMARY?: any[];
  POOLS?: any[];
  [key: string]: any;
}

// CGMiner API client - sends JSON commands over TCP
async function sendCGMinerCommand(
  ip: string, 
  port: number, 
  command: string, 
  parameter?: string
): Promise<CGMinerResponse> {
  const payload = parameter 
    ? JSON.stringify({ command, parameter })
    : JSON.stringify({ command });
  
  console.log(`[CGMiner] Sending to ${ip}:${port}: ${payload}`);
  
  try {
    const conn = await Deno.connect({ hostname: ip, port, transport: 'tcp' });
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    await conn.write(encoder.encode(payload));
    
    // Read response with timeout
    const buffer = new Uint8Array(65536);
    const readPromise = conn.read(buffer);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Read timeout')), 10000)
    );
    
    const n = await Promise.race([readPromise, timeoutPromise]);
    conn.close();
    
    if (n === null) {
      throw new Error('Connection closed');
    }
    
    const responseText = decoder.decode(buffer.subarray(0, n as number));
    // CGMiner returns JSON with null byte terminator
    const cleanedResponse = responseText.replace(/\0/g, '').trim();
    console.log(`[CGMiner] Response from ${ip}: ${cleanedResponse.substring(0, 200)}...`);
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error(`[CGMiner] Error communicating with ${ip}:${port}:`, error);
    throw error;
  }
}

// HTTP Digest Auth helper for Bitmain web interface
function createDigestHeader(
  username: string,
  password: string,
  method: string,
  uri: string,
  realm: string,
  nonce: string,
  qop: string,
  nc: string,
  cnonce: string
): string {
  // Simple MD5 implementation for digest auth
  const md5 = async (str: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // For now, return basic auth as fallback
  // Full digest auth implementation would go here
  return `Basic ${btoa(`${username}:${password}`)}`;
}

// Get miner stats via CGMiner API
async function getMinerStats(miner: HydroMiner): Promise<any> {
  try {
    const [stats, summary, pools] = await Promise.all([
      sendCGMinerCommand(miner.ip_address, miner.api_port, 'stats'),
      sendCGMinerCommand(miner.ip_address, miner.api_port, 'summary'),
      sendCGMinerCommand(miner.ip_address, miner.api_port, 'pools'),
    ]);
    
    return {
      stats: stats.STATS || [],
      summary: summary.SUMMARY?.[0] || {},
      pools: pools.POOLS || [],
      online: true,
    };
  } catch (error) {
    console.error(`[Stats] Failed to get stats for ${miner.name}:`, error);
    return {
      stats: [],
      summary: {},
      pools: [],
      online: false,
      error: error.message,
    };
  }
}

// Parse miner stats into standardized format
function parseMinerStats(miner: HydroMiner, rawStats: any): Partial<HydroMiner> {
  const stats = rawStats.stats?.[0] || {};
  const summary = rawStats.summary || {};
  
  // Extract hashrate - different firmware reports differently
  let hashrateTH = 0;
  if (summary['GHS 5s']) {
    hashrateTH = summary['GHS 5s'] / 1000; // Convert GH/s to TH/s
  } else if (summary['MHS 5s']) {
    hashrateTH = summary['MHS 5s'] / 1000000; // Convert MH/s to TH/s
  }
  
  // Extract temperatures
  const chipTemps: number[] = [];
  const fanSpeeds: number[] = [];
  
  // Bitmain stats format
  if (stats.temp_chip) {
    chipTemps.push(...(Array.isArray(stats.temp_chip) ? stats.temp_chip : [stats.temp_chip]));
  }
  if (stats.fan) {
    fanSpeeds.push(...(Array.isArray(stats.fan) ? stats.fan : [stats.fan]));
  }
  
  // For hydro miners, look for inlet/outlet temps
  const inletTemp = stats.temp_water_in || stats.inlet_temp || null;
  const outletTemp = stats.temp_water_out || stats.outlet_temp || null;
  
  return {
    current_hashrate_th: hashrateTH,
    power_consumption_w: summary['Power'] || stats.power || null,
    inlet_temp_c: inletTemp,
    outlet_temp_c: outletTemp,
    chip_temp_avg_c: chipTemps.length > 0 ? chipTemps.reduce((a, b) => a + b, 0) / chipTemps.length : null,
    fan_speed_avg: fanSpeeds.length > 0 ? Math.round(fanSpeeds.reduce((a, b) => a + b, 0) / fanSpeeds.length) : null,
    current_status: rawStats.online ? 'mining' : 'offline',
    last_seen: rawStats.online ? new Date().toISOString() : undefined,
  };
}

// Sleep miner based on firmware type
async function sleepMiner(miner: HydroMiner): Promise<{ success: boolean; message: string }> {
  console.log(`[Sleep] Attempting to sleep ${miner.name} (${miner.firmware_type})`);
  
  try {
    switch (miner.firmware_type) {
      case 'luxos':
        // LuxOS has native curtail command
        const sessionId = crypto.randomUUID().substring(0, 8);
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'curtail', `${sessionId},sleep`);
        return { success: true, message: 'Miner put to sleep via LuxOS curtail' };
        
      case 'braiins':
        // Braiins OS+ - set power target to minimum
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'ascset', '0,freq,0');
        return { success: true, message: 'Miner frequency set to 0 via Braiins' };
        
      case 'foundry':
        // Foundry firmware - use softExit
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'softExit');
        return { success: true, message: 'Miner soft exit initiated via Foundry firmware' };
        
      case 'stock':
      default:
        // Stock Bitmain - restart command to temporarily stop mining
        // Note: Stock firmware doesn't have true sleep, so we set frequency to minimum
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'restart');
        return { success: true, message: 'Mining software restarted (stock firmware - no true sleep)' };
    }
  } catch (error) {
    console.error(`[Sleep] Failed to sleep ${miner.name}:`, error);
    return { success: false, message: error.message };
  }
}

// Wake miner based on firmware type
async function wakeupMiner(miner: HydroMiner): Promise<{ success: boolean; message: string }> {
  console.log(`[Wakeup] Attempting to wake ${miner.name} (${miner.firmware_type})`);
  
  try {
    switch (miner.firmware_type) {
      case 'luxos':
        const sessionId = crypto.randomUUID().substring(0, 8);
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'curtail', `${sessionId},wakeup`);
        return { success: true, message: 'Miner woken via LuxOS curtail' };
        
      case 'braiins':
        // Braiins - restore default frequency
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'ascset', '0,freq,auto');
        return { success: true, message: 'Miner frequency restored via Braiins' };
        
      case 'foundry':
      case 'stock':
      default:
        // For stock/foundry, restart mining
        await sendCGMinerCommand(miner.ip_address, miner.api_port, 'restart');
        return { success: true, message: 'Mining software restarted' };
    }
  } catch (error) {
    console.error(`[Wakeup] Failed to wake ${miner.name}:`, error);
    return { success: false, message: error.message };
  }
}

// Reboot miner (full system reboot)
async function rebootMiner(miner: HydroMiner): Promise<{ success: boolean; message: string }> {
  console.log(`[Reboot] Attempting to reboot ${miner.name}`);
  
  try {
    // Try HTTP CGI endpoint first (more reliable for full reboot)
    const credentials = miner.api_credentials || { username: 'root', password: 'root' };
    const rebootUrl = `http://${miner.ip_address}:${miner.http_port}/cgi-bin/reboot.cgi`;
    
    const response = await fetch(rebootUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
      },
    });
    
    if (response.ok) {
      return { success: true, message: 'Reboot initiated via HTTP CGI' };
    }
    
    // Fallback to CGMiner restart
    await sendCGMinerCommand(miner.ip_address, miner.api_port, 'restart');
    return { success: true, message: 'Mining software restarted (CGMiner)' };
  } catch (error) {
    console.error(`[Reboot] Failed to reboot ${miner.name}:`, error);
    return { success: false, message: error.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();
    console.log(`[MinerController] Action: ${action}`, params);

    switch (action) {
      case 'list': {
        const { data: miners, error } = await supabase
          .from('hydro_miners')
          .select('*')
          .order('priority_group', { ascending: true })
          .order('name', { ascending: true });
        
        if (error) throw error;
        return new Response(JSON.stringify({ miners }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'register': {
        const { miner_data } = params;
        const { data: miner, error } = await supabase
          .from('hydro_miners')
          .insert(miner_data)
          .select()
          .single();
        
        if (error) throw error;
        
        // Log the action
        await supabase.from('miner_control_log').insert({
          miner_ids: [miner.id],
          action: 'register',
          triggered_by: 'manual',
          execution_status: 'success',
        });
        
        return new Response(JSON.stringify({ miner }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'status': {
        const { miner_ids } = params;
        
        // Get miners from DB
        const { data: miners, error } = await supabase
          .from('hydro_miners')
          .select('*')
          .in('id', miner_ids);
        
        if (error) throw error;
        
        // Poll each miner for live stats
        const statusResults = await Promise.all(
          miners.map(async (miner: HydroMiner) => {
            const rawStats = await getMinerStats(miner);
            const parsedStats = parseMinerStats(miner, rawStats);
            
            // Update miner in DB with latest stats
            if (rawStats.online) {
              await supabase
                .from('hydro_miners')
                .update(parsedStats)
                .eq('id', miner.id);
              
              // Insert reading for history
              await supabase.from('miner_power_readings').insert({
                miner_id: miner.id,
                hashrate_th: parsedStats.current_hashrate_th,
                power_w: parsedStats.power_consumption_w,
                inlet_temp_c: parsedStats.inlet_temp_c,
                outlet_temp_c: parsedStats.outlet_temp_c,
                chip_temp_avg_c: parsedStats.chip_temp_avg_c,
              });
            }
            
            return {
              id: miner.id,
              name: miner.name,
              ...parsedStats,
              raw: rawStats,
            };
          })
        );
        
        return new Response(JSON.stringify({ status: statusResults }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'sleep': {
        const { miner_ids, reason } = params;
        
        const { data: miners, error } = await supabase
          .from('hydro_miners')
          .select('*')
          .in('id', miner_ids);
        
        if (error) throw error;
        
        // Log pending action
        const { data: logEntry } = await supabase
          .from('miner_control_log')
          .insert({
            miner_ids,
            action: 'sleep',
            triggered_by: params.triggered_by || 'manual',
            trigger_reason: reason,
            execution_status: 'in_progress',
          })
          .select()
          .single();
        
        // Execute sleep on each miner
        const results = await Promise.all(
          miners.map(async (miner: HydroMiner) => {
            const result = await sleepMiner(miner);
            
            // Update miner status
            if (result.success) {
              await supabase
                .from('hydro_miners')
                .update({ current_status: 'sleeping' })
                .eq('id', miner.id);
            }
            
            return { id: miner.id, name: miner.name, ...result };
          })
        );
        
        const allSuccess = results.every(r => r.success);
        const anySuccess = results.some(r => r.success);
        
        // Update log entry
        await supabase
          .from('miner_control_log')
          .update({
            execution_status: allSuccess ? 'success' : anySuccess ? 'partial' : 'failed',
            response_data: results,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);
        
        return new Response(JSON.stringify({ results, success: allSuccess }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'wakeup': {
        const { miner_ids, reason, stagger_seconds = 5 } = params;
        
        const { data: miners, error } = await supabase
          .from('hydro_miners')
          .select('*')
          .in('id', miner_ids);
        
        if (error) throw error;
        
        // Log pending action
        const { data: logEntry } = await supabase
          .from('miner_control_log')
          .insert({
            miner_ids,
            action: 'wakeup',
            triggered_by: params.triggered_by || 'manual',
            trigger_reason: reason,
            execution_status: 'in_progress',
          })
          .select()
          .single();
        
        // Stagger wakeups to avoid electrical inrush
        const results: any[] = [];
        for (let i = 0; i < miners.length; i++) {
          const miner = miners[i] as HydroMiner;
          
          if (i > 0 && stagger_seconds > 0) {
            await new Promise(resolve => setTimeout(resolve, stagger_seconds * 1000));
          }
          
          const result = await wakeupMiner(miner);
          
          if (result.success) {
            await supabase
              .from('hydro_miners')
              .update({ current_status: 'mining' })
              .eq('id', miner.id);
          }
          
          results.push({ id: miner.id, name: miner.name, ...result });
        }
        
        const allSuccess = results.every(r => r.success);
        const anySuccess = results.some(r => r.success);
        
        await supabase
          .from('miner_control_log')
          .update({
            execution_status: allSuccess ? 'success' : anySuccess ? 'partial' : 'failed',
            response_data: results,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);
        
        return new Response(JSON.stringify({ results, success: allSuccess }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'reboot': {
        const { miner_ids, reason } = params;
        
        const { data: miners, error } = await supabase
          .from('hydro_miners')
          .select('*')
          .in('id', miner_ids);
        
        if (error) throw error;
        
        const { data: logEntry } = await supabase
          .from('miner_control_log')
          .insert({
            miner_ids,
            action: 'reboot',
            triggered_by: params.triggered_by || 'manual',
            trigger_reason: reason,
            execution_status: 'in_progress',
          })
          .select()
          .single();
        
        const results = await Promise.all(
          miners.map(async (miner: HydroMiner) => {
            // Set status to rebooting first
            await supabase
              .from('hydro_miners')
              .update({ current_status: 'rebooting' })
              .eq('id', miner.id);
            
            const result = await rebootMiner(miner);
            return { id: miner.id, name: miner.name, ...result };
          })
        );
        
        const allSuccess = results.every(r => r.success);
        
        await supabase
          .from('miner_control_log')
          .update({
            execution_status: allSuccess ? 'success' : 'partial',
            response_data: results,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);
        
        return new Response(JSON.stringify({ results, success: allSuccess }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'batch_sleep': {
        const { priority_groups, reason } = params;
        
        // Get miners by priority groups
        const { data: miners, error } = await supabase
          .from('hydro_miners')
          .select('*')
          .in('priority_group', priority_groups)
          .eq('current_status', 'mining');
        
        if (error) throw error;
        
        if (!miners || miners.length === 0) {
          return new Response(JSON.stringify({ 
            results: [], 
            success: true, 
            message: 'No miners to sleep in specified priority groups' 
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        
        // Execute batch sleep directly instead of recursive serve call
        const minerIds = miners.map((m: HydroMiner) => m.id);
        
        // Create batch control log entry
        const { data: logEntry, error: logError } = await supabase
          .from('miner_control_log')
          .insert({
            miner_ids: minerIds,
            action: 'batch_sleep',
            triggered_by: 'automation',
            trigger_reason: reason || 'Price ceiling automation',
            execution_status: 'in_progress',
          })
          .select()
          .single();
        
        if (logError) {
          console.error('Failed to create batch log entry:', logError);
        }
        
        // Execute sleep on all miners in parallel
        const results = await Promise.all(
          miners.map(async (miner: HydroMiner) => {
            try {
              const result = await sleepMiner(miner);
              if (result.success) {
                await supabase
                  .from('hydro_miners')
                  .update({ 
                    current_status: 'sleeping',
                    last_status_change: new Date().toISOString()
                  })
                  .eq('id', miner.id);
              }
              return { id: miner.id, name: miner.name, ...result };
            } catch (err) {
              console.error(`Batch sleep failed for miner ${miner.name}:`, err);
              return { 
                id: miner.id, 
                name: miner.name, 
                success: false, 
                error: err instanceof Error ? err.message : 'Unknown error' 
              };
            }
          })
        );
        
        const allSuccess = results.every(r => r.success);
        
        // Update log entry with results
        if (logEntry) {
          await supabase
            .from('miner_control_log')
            .update({
              execution_status: allSuccess ? 'success' : 'partial_failure',
              response_data: results,
              completed_at: new Date().toISOString(),
            })
            .eq('id', logEntry.id);
        }
        
        return new Response(JSON.stringify({ 
          results, 
          success: allSuccess,
          miners_affected: miners.length,
          priority_groups
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'update': {
        const { miner_id, miner_data } = params;
        
        const { data: miner, error } = await supabase
          .from('hydro_miners')
          .update(miner_data)
          .eq('id', miner_id)
          .select()
          .single();
        
        if (error) throw error;
        
        await supabase.from('miner_control_log').insert({
          miner_ids: [miner_id],
          action: 'update_config',
          triggered_by: 'manual',
          execution_status: 'success',
          response_data: miner_data,
        });
        
        return new Response(JSON.stringify({ miner }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'delete': {
        const { miner_id } = params;
        
        await supabase.from('miner_control_log').insert({
          miner_ids: [miner_id],
          action: 'delete',
          triggered_by: 'manual',
          execution_status: 'success',
        });
        
        const { error } = await supabase
          .from('hydro_miners')
          .delete()
          .eq('id', miner_id);
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      case 'stats': {
        // Get fleet-wide statistics
        const { data: miners } = await supabase
          .from('hydro_miners')
          .select('*');
        
        const stats = {
          total: miners?.length || 0,
          mining: miners?.filter(m => m.current_status === 'mining').length || 0,
          sleeping: miners?.filter(m => m.current_status === 'sleeping').length || 0,
          offline: miners?.filter(m => m.current_status === 'offline').length || 0,
          error: miners?.filter(m => m.current_status === 'error').length || 0,
          totalHashrateTH: miners?.reduce((sum, m) => sum + (m.current_hashrate_th || 0), 0) || 0,
          totalPowerKW: (miners?.reduce((sum, m) => sum + (m.power_consumption_w || 0), 0) || 0) / 1000,
          byPriority: {
            critical: miners?.filter(m => m.priority_group === 'critical').length || 0,
            high: miners?.filter(m => m.priority_group === 'high').length || 0,
            medium: miners?.filter(m => m.priority_group === 'medium').length || 0,
            low: miners?.filter(m => m.priority_group === 'low').length || 0,
            curtailable: miners?.filter(m => m.priority_group === 'curtailable').length || 0,
          },
        };
        
        return new Response(JSON.stringify({ stats }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
  } catch (error) {
    console.error('[MinerController] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
