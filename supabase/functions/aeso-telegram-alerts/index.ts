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
    message = message.replace(regex, String(value));
  }
  return message;
}

// Check if an alert should trigger based on conditions
function shouldTrigger(rule: AlertRule, data: MarketData): boolean {
  const { alert_type, condition, threshold_value } = rule;

  switch (alert_type) {
    case 'price_low':
      return data.poolPrice < (threshold_value || 10);

    case 'price_high':
      return data.poolPrice > (threshold_value || 50);

    case 'grid_stress':
      return data.reserveMargin < (threshold_value || 10);

    case 'eea':
      return data.hasActiveGridAlert && data.gridAlertType === 'eea';

    case 'price_spike':
      const spikeThreshold = threshold_value || 100;
      return Math.abs(data.priceChange1h) > spikeThreshold;

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

    // Fetch current AESO data
    let marketData: MarketData;
    
    try {
      // Get latest price from training data or API
      const { data: latestData, error: dataError } = await supabase
        .from('aeso_training_data')
        .select('pool_price, ail_mw, timestamp')
        .order('timestamp', { ascending: false })
        .limit(2);

      if (dataError) throw dataError;

      const currentPrice = latestData?.[0]?.pool_price || 0;
      const previousPrice = latestData?.[1]?.pool_price || currentPrice;
      const priceChange = previousPrice > 0 
        ? ((currentPrice - previousPrice) / previousPrice) * 100 
        : 0;

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
        totalLoad: latestData?.[0]?.ail_mw || 0,
        totalGeneration: 0,
        priceChange1h: priceChange,
        hasActiveGridAlert: hasActiveAlert,
        gridAlertType: eeaAlert ? 'eea' : (gridAlerts?.[0]?.alert_type || null),
        timestamp: new Date().toLocaleString('en-US', { 
          timeZone: 'America/Edmonton',
          dateStyle: 'short',
          timeStyle: 'short'
        }),
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
        timestamp: new Date().toLocaleString('en-US', { 
          timeZone: 'America/Edmonton',
          dateStyle: 'short',
          timeStyle: 'short'
        }),
      };
    }

    console.log('Current market data:', marketData);

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

    // Process each setting and its rules
    for (const setting of settings) {
      const rules = setting.telegram_alert_rules?.filter((r: AlertRule) => r.is_active) || [];
      
      for (const rule of rules) {
        // If testing a specific rule, skip others
        if (testRuleId && rule.id !== testRuleId) continue;

        // Check cooldown (skip if forceCheck or testing)
        if (!forceCheck && !testRuleId && isInCooldown(rule)) {
          console.log(`Rule ${rule.id} (${rule.alert_type}) is in cooldown`);
          continue;
        }

        // Check if rule should trigger
        const triggered = shouldTrigger(rule, marketData);
        
        if (!triggered && !testRuleId) {
          continue;
        }

        console.log(`Rule ${rule.id} (${rule.alert_type}) triggered!`);

        // Build message
        const template = rule.message_template || DEFAULT_TEMPLATES[rule.alert_type] || DEFAULT_TEMPLATES.custom;
        const messageData = {
          price: marketData.poolPrice.toFixed(2),
          threshold: rule.threshold_value || 0,
          reserveMargin: marketData.reserveMargin.toFixed(1),
          priceChange: marketData.priceChange1h.toFixed(1),
          load: marketData.totalLoad,
          metric: rule.custom_metric || 'Unknown',
          value: (marketData as any)[rule.custom_metric || ''] || 'N/A',
          condition: rule.condition,
          timestamp: marketData.timestamp,
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
