import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRule {
  id: string;
  setting_id: string;
  alert_type: string;
  condition: string;
  threshold_value: number | null;
  custom_metric: string | null;
  message_template: string | null;
  cooldown_minutes: number;
  is_active: boolean;
  last_triggered_at: string | null;
}

interface AlertSetting {
  id: string;
  user_id: string;
  bot_token: string;
  chat_id: string;
  name: string;
  is_active: boolean;
}

interface MarketData {
  poolPrice: number;
  reserveMargin: number;
  totalLoad: number;
  totalGeneration: number;
  priceChange1h: number;
  hasActiveGridAlert: boolean;
  gridAlertType: string | null;
  timestamp: string;
  
  // Extended data
  averagePrice24h: number;
  peakPrice24h: number;
  lowPrice24h: number;
  marketConditions: string;
  
  // Generation mix
  generationMix: {
    gas: number;
    wind: number;
    solar: number;
    hydro: number;
    other: number;
    total: number;
  };
  renewablePercentage: number;
  
  // Interties
  intertieFlows: {
    bc: number;
    sk: number;
    matl: number;
    net: number;
  };
  
  // Time-based
  hour: number;
  isWeekday: boolean;
  dayOfWeek: number;
}

// Default message templates for each alert type
const DEFAULT_TEMPLATES: Record<string, string> = {
  price_low: `🟢 <b>AESO Low Price Alert</b>

💰 Current Pool Price: <b>$\${price}/MWh</b>
📉 Below threshold of $\${threshold}/MWh

⚡ Ideal time for high-consumption operations
🕐 Time: \${timestamp}`,

  price_high: `🔴 <b>AESO High Price Alert</b>

💰 Current Pool Price: <b>$\${price}/MWh</b>
📈 Above threshold of $\${threshold}/MWh

⚠️ Consider reducing load or shifting operations
🕐 Time: \${timestamp}`,

  grid_stress: `⚠️ <b>Grid Stress Warning</b>

📊 Reserve Margin: <b>\${reserveMargin}%</b>
⚡ Below safe threshold of \${threshold}%

🔌 Elevated risk of supply issues
💡 Monitor grid conditions closely
🕐 Time: \${timestamp}`,

  plant_outage: `🏭 <b>Power Plant Outage Alert</b>

⚡ Significant generation capacity offline
📉 Impact on grid reserves expected

🔍 Check AESO for details
🕐 Time: \${timestamp}`,

  eea: `🚨 <b>Energy Emergency Alert</b>

⚡ AESO has declared an <b>EEA</b>
🔴 Grid emergency conditions in effect

💡 Conservation measures recommended
📞 Industrial loads may be curtailed
🕐 Time: \${timestamp}`,

  price_spike: `📈 <b>Price Spike Detected</b>

💰 Current Price: <b>$\${price}/MWh</b>
🚀 \${priceChange}% increase in last hour

⚠️ Rapid price movement detected
🕐 Time: \${timestamp}`,

  price_negative: `💚 <b>Negative Price Alert!</b>

💰 Price: <b>$\${price}/MWh</b>
📉 Getting PAID to use power!

⚡ Ideal for:
• EV charging
• HVAC preconditioning  
• Batch processing
• Energy storage charging

🕐 Time: \${timestamp}`,

  hourly_summary: `🕐 <b>AESO Hourly Update</b>

💰 Current Price: <b>$\${price}/MWh</b>
📊 24h Average: $\${averagePrice}/MWh
📈 Market: \${marketConditions}

⚡ System Load: \${load} MW
🌱 Renewables: \${renewablePercentage}%

<b>Generation Mix:</b>
🔥 Gas: \${gasGen} MW | 💨 Wind: \${windGen} MW
☀️ Solar: \${solarGen} MW | 💧 Hydro: \${hydroGen} MW

🕐 Time: \${timestamp}`,

  daily_morning_briefing: `🌅 <b>AESO Morning Briefing</b>

📊 <b>Overnight Summary:</b>
• Avg Price: $\${averagePrice}/MWh
• Low: $\${lowPrice}/MWh | High: $\${peakPrice}/MWh

⚡ <b>Current Status:</b>
• Pool Price: $\${price}/MWh
• Load: \${load} MW
• Reserve Margin: \${reserveMargin}%

🌱 <b>Generation Mix:</b>
• Gas: \${gasGen} MW | Wind: \${windGen} MW
• Solar: \${solarGen} MW | Hydro: \${hydroGen} MW
• Renewables: \${renewablePercentage}%

🔄 <b>Interties:</b>
BC: \${bcFlow} MW | SK: \${skFlow} MW | MT: \${matlFlow} MW

Have a great day! ☀️
🕐 \${timestamp}`,

  daily_evening_summary: `🌆 <b>AESO Evening Summary</b>

📊 <b>Today's Market:</b>
• Avg Price: $\${averagePrice}/MWh
• Peak: $\${peakPrice}/MWh | Low: $\${lowPrice}/MWh
• Market Trend: \${marketConditions}

⚡ <b>Current Status:</b>
• Pool Price: $\${price}/MWh
• Load: \${load} MW

🌱 <b>Renewable Performance:</b>
• Peak Renewables: \${renewablePercentage}%
• Wind: \${windGen} MW | Solar: \${solarGen} MW

🔄 <b>Net Intertie:</b> \${netFlow} MW

📈 Tomorrow's Outlook: Check AESO forecasts
🕐 \${timestamp}`,

  generation_mix: `⚡ <b>Generation Mix Update</b>

🔥 Natural Gas: <b>\${gasGen} MW</b>
💨 Wind: <b>\${windGen} MW</b>
☀️ Solar: <b>\${solarGen} MW</b>
💧 Hydro: <b>\${hydroGen} MW</b>
🔋 Other: <b>\${otherGen} MW</b>

📊 Total Generation: \${totalGen} MW
🌱 Renewable Share: \${renewablePercentage}%

💰 Pool Price: $\${price}/MWh
🕐 Time: \${timestamp}`,

  renewable_percentage: `🌱 <b>High Renewable Generation!</b>

📊 Renewables at <b>\${renewablePercentage}%</b> of total
Threshold: \${threshold}%

💨 Wind: \${windGen} MW
☀️ Solar: \${solarGen} MW
💧 Hydro: \${hydroGen} MW

💰 Price Impact: $\${price}/MWh
⚡ Great time for flexible loads!
🕐 Time: \${timestamp}`,

  wind_forecast: `💨 <b>Wind Generation Alert</b>

📊 Wind Generation: <b>\${windGen} MW</b>
📈 Above threshold of \${threshold} MW

⚡ Total Load: \${load} MW
🌱 Wind Share: \${windPercentage}%
💰 Pool Price: $\${price}/MWh

🕐 Time: \${timestamp}`,

  solar_production: `☀️ <b>Solar Production Alert</b>

📊 Solar Generation: <b>\${solarGen} MW</b>
📈 Above threshold of \${threshold} MW

⚡ Great for daytime operations
🌱 Solar Share: \${solarPercentage}%
💰 Pool Price: $\${price}/MWh

🕐 Time: \${timestamp}`,

  demand_peak: `📊 <b>Peak Demand Alert</b>

⚡ System Load: <b>\${load} MW</b>
📈 Above threshold of \${threshold} MW

💰 Current Price: $\${price}/MWh
🔋 Reserve Margin: \${reserveMargin}%

⚠️ Consider shifting flexible loads
📉 Peak periods often mean higher prices
🕐 Time: \${timestamp}`,

  intertie_flow: `🔄 <b>Intertie Flow Update</b>

🔗 <b>Power Flows:</b>
• BC: \${bcFlow} MW
• Saskatchewan: \${skFlow} MW
• Montana (MATL): \${matlFlow} MW
• Net Flow: <b>\${netFlow} MW</b>

\${flowDirection}

💰 Price: $\${price}/MWh
🕐 Time: \${timestamp}`,

  custom: `📊 <b>Custom Alert</b>

Metric: \${metric}
Value: \${value}
Condition: \${condition} \${threshold}

🕐 Time: \${timestamp}`,
};

// Format message with data
function formatMessage(template: string, data: Record<string, any>): string {
  let message = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    message = message.replace(regex, String(value ?? 'N/A'));
  }
  return message;
}

// Check if an alert should trigger based on conditions
function shouldTrigger(rule: AlertRule, data: MarketData, lastTriggeredHour: number | null): boolean {
  const { alert_type, condition, threshold_value } = rule;

  switch (alert_type) {
    case 'price_low':
      return data.poolPrice < (threshold_value || 10);

    case 'price_high':
      return data.poolPrice > (threshold_value || 50);

    case 'price_negative':
      return data.poolPrice < 0;

    case 'grid_stress':
      return data.reserveMargin < (threshold_value || 10);

    case 'eea':
      return data.hasActiveGridAlert && data.gridAlertType === 'eea';

    case 'price_spike':
      const spikeThreshold = threshold_value || 100;
      return Math.abs(data.priceChange1h) > spikeThreshold;

    case 'demand_peak':
      return data.totalLoad > (threshold_value || 11000);

    case 'intertie_flow':
      const flowMagnitude = Math.abs(data.intertieFlows.net);
      return flowMagnitude > (threshold_value || 200);

    // Scheduled alerts - trigger once per hour/day
    case 'hourly_summary':
    case 'generation_mix':
      // Trigger every hour (when hour changes and not recently triggered)
      return lastTriggeredHour !== data.hour;

    case 'daily_morning_briefing':
      // Trigger at 7 AM local time on weekdays
      return data.hour === 7 && lastTriggeredHour !== 7;

    case 'daily_evening_summary':
      // Trigger at 6 PM local time
      return data.hour === 18 && lastTriggeredHour !== 18;

    // Generation mix alerts
    case 'renewable_percentage':
      return data.renewablePercentage > (threshold_value || 30);

    case 'wind_forecast':
      return data.generationMix.wind > (threshold_value || 500);

    case 'solar_production':
      return data.generationMix.solar > (threshold_value || 100);

    case 'custom':
      // For custom alerts, we need the custom_metric field
      const metricValue = (data as any)[rule.custom_metric || ''];
      if (metricValue === undefined) return false;

      switch (condition) {
        case 'above': return metricValue > (threshold_value || 0);
        case 'below': return metricValue < (threshold_value || 0);
        case 'equals': return metricValue === threshold_value;
        case 'change_percent': return Math.abs(metricValue) > (threshold_value || 0);
        default: return false;
      }

    default:
      return false;
  }
}

// Check cooldown
function isInCooldown(rule: AlertRule): boolean {
  if (!rule.last_triggered_at) return false;
  
  const lastTriggered = new Date(rule.last_triggered_at);
  const cooldownMs = rule.cooldown_minutes * 60 * 1000;
  const now = new Date();
  
  return (now.getTime() - lastTriggered.getTime()) < cooldownMs;
}

// Get the hour from last triggered timestamp
function getLastTriggeredHour(rule: AlertRule): number | null {
  if (!rule.last_triggered_at) return null;
  const date = new Date(rule.last_triggered_at);
  // Convert to Mountain time
  const mtnDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
  return mtnDate.getHours();
}

// Send Telegram notification
async function sendTelegramAlert(
  supabaseUrl: string,
  supabaseKey: string,
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/telegram-notifier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        action: 'send_message',
        botToken,
        chatId,
        message,
        parseMode: 'HTML',
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    return false;
  }
}

// Helper to explain why a rule didn't trigger (for debugging)
function getNoTriggerReason(rule: AlertRule, data: MarketData, lastTriggeredHour: number | null): string {
  const { alert_type, threshold_value } = rule;
  
  switch (alert_type) {
    case 'price_low':
      return `Price $${data.poolPrice.toFixed(2)} >= threshold $${threshold_value || 10}`;
    case 'price_high':
      return `Price $${data.poolPrice.toFixed(2)} <= threshold $${threshold_value || 50}`;
    case 'price_negative':
      return `Price $${data.poolPrice.toFixed(2)} >= 0`;
    case 'grid_stress':
      return `Reserve margin ${data.reserveMargin}% >= threshold ${threshold_value || 10}%`;
    case 'eea':
      return `No active EEA alert (hasActiveGridAlert=${data.hasActiveGridAlert}, type=${data.gridAlertType})`;
    case 'price_spike':
      return `Price change ${Math.abs(data.priceChange1h).toFixed(1)}% <= threshold ${threshold_value || 100}%`;
    case 'demand_peak':
      return `Load ${data.totalLoad}MW <= threshold ${threshold_value || 11000}MW`;
    case 'intertie_flow':
      return `Net flow ${Math.abs(data.intertieFlows.net)}MW <= threshold ${threshold_value || 200}MW`;
    case 'hourly_summary':
    case 'generation_mix':
      return `Current hour ${data.hour} = last triggered hour ${lastTriggeredHour}`;
    case 'daily_morning_briefing':
      return `Current hour ${data.hour} != 7 OR already triggered this hour (last=${lastTriggeredHour})`;
    case 'daily_evening_summary':
      return `Current hour ${data.hour} != 18 OR already triggered this hour (last=${lastTriggeredHour})`;
    case 'renewable_percentage':
      return `Renewables ${data.renewablePercentage}% <= threshold ${threshold_value || 30}%`;
    case 'wind_forecast':
      return `Wind ${data.generationMix.wind}MW <= threshold ${threshold_value || 500}MW`;
    case 'solar_production':
      return `Solar ${data.generationMix.solar}MW <= threshold ${threshold_value || 100}MW`;
    default:
      return `Unknown alert type or condition not met`;
  }
}

// Determine market conditions text
function getMarketConditions(price: number, avg: number, priceChange: number): string {
  if (price < 0) return '💚 Negative pricing';
  if (price < avg * 0.5) return '🟢 Very low prices';
  if (price < avg * 0.8) return '🟢 Below average';
  if (price > avg * 2) return '🔴 Very high prices';
  if (price > avg * 1.3) return '🟠 Above average';
  if (Math.abs(priceChange) > 50) return '📈 Volatile';
  return '🟡 Normal conditions';
}

// Get flow direction text
function getFlowDirection(netFlow: number): string {
  if (netFlow > 100) return '📥 Net importing power';
  if (netFlow < -100) return '📤 Net exporting power';
  return '⚖️ Balanced flows';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body for manual triggers or use defaults
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body is fine for scheduled triggers
    }

    const { forceCheck = false, testRuleId = null } = body;

    console.log('AESO Telegram Alerts check starting...');

    // Get current time in Mountain timezone
    const now = new Date();
    const mtnNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
    const currentHour = mtnNow.getHours();
    const dayOfWeek = mtnNow.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    // Fetch current AESO data
    let marketData: MarketData;
    
    try {
      // Get latest price data
      const { data: latestData, error: dataError } = await supabase
        .from('aeso_training_data')
        .select('pool_price, ail_mw, generation_gas, generation_wind, generation_solar, generation_hydro, generation_other, intertie_bc_flow, intertie_sask_flow, intertie_montana_flow, timestamp')
        .order('timestamp', { ascending: false })
        .limit(25);

      if (dataError) throw dataError;

      const current = latestData?.[0];
      const previous = latestData?.[1];
      const currentPrice = current?.pool_price || 0;
      const previousPrice = previous?.pool_price || currentPrice;
      const priceChange = previousPrice > 0 
        ? ((currentPrice - previousPrice) / previousPrice) * 100 
        : 0;

      // Calculate 24h stats from available data
      const prices24h = latestData?.map(d => d.pool_price).filter(p => p != null) || [];
      const avgPrice = prices24h.length > 0 
        ? prices24h.reduce((a, b) => a + b, 0) / prices24h.length 
        : currentPrice;
      const peakPrice = prices24h.length > 0 ? Math.max(...prices24h) : currentPrice;
      const lowPrice = prices24h.length > 0 ? Math.min(...prices24h) : currentPrice;

      // Generation mix
      const gasGen = current?.generation_gas || 0;
      const windGen = current?.generation_wind || 0;
      const solarGen = current?.generation_solar || 0;
      const hydroGen = current?.generation_hydro || 0;
      const otherGen = current?.generation_other || 0;
      const totalGen = gasGen + windGen + solarGen + hydroGen + otherGen;
      const renewableTotal = windGen + solarGen + hydroGen;
      const renewablePercentage = totalGen > 0 ? (renewableTotal / totalGen) * 100 : 0;

      // Interties
      const bcFlow = current?.intertie_bc_flow || 0;
      const skFlow = current?.intertie_sask_flow || 0;
      const matlFlow = current?.intertie_montana_flow || 0;
      const netFlow = bcFlow + skFlow + matlFlow;

      // Get active grid alerts
      const { data: gridAlerts } = await supabase
        .from('aeso_grid_alerts')
        .select('alert_type, status')
        .eq('status', 'active')
        .limit(5);

      const hasActiveAlert = (gridAlerts?.length || 0) > 0;
      const eeaAlert = gridAlerts?.find(a => a.alert_type === 'eea');

      marketData = {
        poolPrice: currentPrice,
        reserveMargin: 15, // Default, would need to fetch from API
        totalLoad: current?.ail_mw || 0,
        totalGeneration: totalGen,
        priceChange1h: priceChange,
        hasActiveGridAlert: hasActiveAlert,
        gridAlertType: eeaAlert ? 'eea' : (gridAlerts?.[0]?.alert_type || null),
        timestamp: now.toLocaleString('en-US', { 
          timeZone: 'America/Edmonton',
          dateStyle: 'short',
          timeStyle: 'short'
        }),
        averagePrice24h: avgPrice,
        peakPrice24h: peakPrice,
        lowPrice24h: lowPrice,
        marketConditions: getMarketConditions(currentPrice, avgPrice, priceChange),
        generationMix: {
          gas: gasGen,
          wind: windGen,
          solar: solarGen,
          hydro: hydroGen,
          other: otherGen,
          total: totalGen,
        },
        renewablePercentage: Math.round(renewablePercentage * 10) / 10,
        intertieFlows: {
          bc: bcFlow,
          sk: skFlow,
          matl: matlFlow,
          net: netFlow,
        },
        hour: currentHour,
        isWeekday,
        dayOfWeek,
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Use defaults if fetch fails
      marketData = {
        poolPrice: 0,
        reserveMargin: 100,
        totalLoad: 0,
        totalGeneration: 0,
        priceChange1h: 0,
        hasActiveGridAlert: false,
        gridAlertType: null,
        timestamp: now.toLocaleString('en-US', { 
          timeZone: 'America/Edmonton',
          dateStyle: 'short',
          timeStyle: 'short'
        }),
        averagePrice24h: 0,
        peakPrice24h: 0,
        lowPrice24h: 0,
        marketConditions: 'Unknown',
        generationMix: { gas: 0, wind: 0, solar: 0, hydro: 0, other: 0, total: 0 },
        renewablePercentage: 0,
        intertieFlows: { bc: 0, sk: 0, matl: 0, net: 0 },
        hour: currentHour,
        isWeekday,
        dayOfWeek,
      };
    }

    console.log('Current market data:', JSON.stringify(marketData, null, 2));

    // Fetch all active telegram settings with their rules
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_alert_settings')
      .select(`
        *,
        telegram_alert_rules (*)
      `)
      .eq('is_active', true);

    if (settingsError) {
      throw new Error(`Failed to fetch settings: ${settingsError.message}`);
    }

    if (!settings || settings.length === 0) {
      console.log('No active telegram alert settings found');
      return new Response(
        JSON.stringify({ success: true, message: 'No active alert settings', alertsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let alertsSent = 0;
    const alertResults: any[] = [];

    console.log(`Found ${settings.length} active settings to process`);

    // Process each setting and its rules
    for (const setting of settings) {
      const rules = setting.telegram_alert_rules?.filter((r: AlertRule) => r.is_active) || [];
      
      console.log(`Processing setting "${setting.name}" with ${rules.length} active rules`);
      
      for (const rule of rules) {
        // If testing a specific rule, skip others
        if (testRuleId && rule.id !== testRuleId) continue;

        // Check cooldown (skip if forceCheck or testing)
        const inCooldown = isInCooldown(rule);
        if (!forceCheck && !testRuleId && inCooldown) {
          const timeSinceTrigger = rule.last_triggered_at 
            ? Math.round((Date.now() - new Date(rule.last_triggered_at).getTime()) / 60000)
            : 0;
          console.log(`⏳ Rule ${rule.id} (${rule.alert_type}) is in cooldown. Last triggered ${timeSinceTrigger}min ago, cooldown is ${rule.cooldown_minutes}min`);
          continue;
        }

        // Get last triggered hour for scheduled alerts
        const lastTriggeredHour = getLastTriggeredHour(rule);

        // Check if rule should trigger with detailed logging
        const triggered = shouldTrigger(rule, marketData, lastTriggeredHour);
        
        // Log why the rule didn't trigger for debugging
        if (!triggered) {
          console.log(`❌ Rule ${rule.id} (${rule.alert_type}) did NOT trigger. Reason: ${getNoTriggerReason(rule, marketData, lastTriggeredHour)}`);
          if (!testRuleId) continue;
        } else {
          console.log(`✅ Rule ${rule.id} (${rule.alert_type}) TRIGGERED!`);
        }

        // Build message data
        const template = rule.message_template || DEFAULT_TEMPLATES[rule.alert_type] || DEFAULT_TEMPLATES.custom;
        
        const windPercentage = marketData.totalGeneration > 0 
          ? Math.round((marketData.generationMix.wind / marketData.totalGeneration) * 100 * 10) / 10
          : 0;
        const solarPercentage = marketData.totalGeneration > 0 
          ? Math.round((marketData.generationMix.solar / marketData.totalGeneration) * 100 * 10) / 10
          : 0;

        const messageData = {
          price: marketData.poolPrice.toFixed(2),
          threshold: rule.threshold_value || 0,
          reserveMargin: marketData.reserveMargin.toFixed(1),
          priceChange: marketData.priceChange1h.toFixed(1),
          load: Math.round(marketData.totalLoad),
          metric: rule.custom_metric || 'Unknown',
          value: (marketData as any)[rule.custom_metric || ''] || 'N/A',
          condition: rule.condition,
          timestamp: marketData.timestamp,
          // Extended data
          averagePrice: marketData.averagePrice24h.toFixed(2),
          peakPrice: marketData.peakPrice24h.toFixed(2),
          lowPrice: marketData.lowPrice24h.toFixed(2),
          marketConditions: marketData.marketConditions,
          // Generation mix
          gasGen: Math.round(marketData.generationMix.gas),
          windGen: Math.round(marketData.generationMix.wind),
          solarGen: Math.round(marketData.generationMix.solar),
          hydroGen: Math.round(marketData.generationMix.hydro),
          otherGen: Math.round(marketData.generationMix.other),
          totalGen: Math.round(marketData.generationMix.total),
          renewablePercentage: marketData.renewablePercentage.toFixed(1),
          windPercentage: windPercentage.toFixed(1),
          solarPercentage: solarPercentage.toFixed(1),
          // Interties
          bcFlow: marketData.intertieFlows.bc,
          skFlow: marketData.intertieFlows.sk,
          matlFlow: marketData.intertieFlows.matl,
          netFlow: marketData.intertieFlows.net,
          flowDirection: getFlowDirection(marketData.intertieFlows.net),
        };

        const message = formatMessage(template, messageData);

        // Send notification
        const success = await sendTelegramAlert(
          supabaseUrl,
          supabaseKey,
          setting.bot_token,
          setting.chat_id,
          message
        );

        // Log to history
        await supabase.from('telegram_alert_history').insert({
          rule_id: rule.id,
          setting_id: setting.id,
          message,
          trigger_data: { marketData, triggered, testMode: !!testRuleId },
          success,
          error_message: success ? null : 'Failed to send message',
        });

        // Update last_triggered_at if successful
        if (success) {
          await supabase
            .from('telegram_alert_rules')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', rule.id);
          
          alertsSent++;
        }

        alertResults.push({
          ruleId: rule.id,
          alertType: rule.alert_type,
          triggered,
          success,
          message: message.substring(0, 100) + '...',
        });
      }
    }

    console.log(`Alerts check complete. Sent ${alertsSent} alerts.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        alertsSent,
        marketData,
        results: alertResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AESO Telegram Alerts error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
