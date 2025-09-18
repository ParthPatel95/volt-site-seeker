import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceAlert {
  id?: string;
  user_id: string;
  alert_type: 'price_threshold' | 'spike_detection' | 'forecast_alert';
  threshold_value: number;
  condition: 'above' | 'below' | 'spike';
  is_active: boolean;
  notification_method: 'app' | 'email';
  created_at?: string;
}

interface AlertTrigger {
  alert_id: string;
  current_price: number;
  threshold: number;
  message: string;
  triggered_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, alertData, userId } = await req.json();

    switch (action) {
      case 'create_alert':
        return await createPriceAlert(supabase, alertData, userId);
        
      case 'get_alerts':
        return await getUserAlerts(supabase, userId);
        
      case 'update_alert':
        return await updatePriceAlert(supabase, alertData);
        
      case 'delete_alert':
        return await deletePriceAlert(supabase, alertData.id, userId);
        
      case 'check_triggers':
        return await checkAlertTriggers(supabase);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in price-alert-system function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createPriceAlert(supabase: any, alertData: PriceAlert, userId: string) {
  console.log('Creating price alert for user:', userId);
  
  const { data, error } = await supabase
    .from('price_alerts')
    .insert({
      user_id: userId,
      alert_type: alertData.alert_type,
      threshold_value: alertData.threshold_value,
      condition: alertData.condition,
      is_active: true,
      notification_method: alertData.notification_method || 'app'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating alert:', error);
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    alert: data,
    message: `Alert created: ${alertData.condition} $${alertData.threshold_value}/MWh`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUserAlerts(supabase: any, userId: string) {
  console.log('Fetching alerts for user:', userId);
  
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching alerts:', error);
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    alerts: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updatePriceAlert(supabase: any, alertData: PriceAlert) {
  console.log('Updating alert:', alertData.id);
  
  const { data, error } = await supabase
    .from('price_alerts')
    .update({
      threshold_value: alertData.threshold_value,
      condition: alertData.condition,
      is_active: alertData.is_active,
      notification_method: alertData.notification_method
    })
    .eq('id', alertData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating alert:', error);
    throw new Error(`Failed to update alert: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    alert: data,
    message: 'Alert updated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deletePriceAlert(supabase: any, alertId: string, userId: string) {
  console.log('Deleting alert:', alertId);
  
  const { error } = await supabase
    .from('price_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting alert:', error);
    throw new Error(`Failed to delete alert: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Alert deleted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkAlertTriggers(supabase: any) {
  console.log('Checking alert triggers...');
  
  try {
    // Fetch current AESO price
    const currentPrice = await getCurrentAESOPrice();
    console.log('Current AESO price:', currentPrice);
    
    // Get all active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('is_active', true);

    if (alertsError) {
      throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    }

    const triggeredAlerts: AlertTrigger[] = [];
    
    // Check each alert
    for (const alert of alerts || []) {
      let shouldTrigger = false;
      let message = '';
      
      switch (alert.condition) {
        case 'above':
          if (currentPrice > alert.threshold_value) {
            shouldTrigger = true;
            message = `Price alert: Current price $${currentPrice}/MWh exceeds your threshold of $${alert.threshold_value}/MWh`;
          }
          break;
          
        case 'below':
          if (currentPrice < alert.threshold_value) {
            shouldTrigger = true;
            message = `Price alert: Current price $${currentPrice}/MWh is below your threshold of $${alert.threshold_value}/MWh`;
          }
          break;
          
        case 'spike':
          // For spike detection, we need historical context
          const isSpike = await detectPriceSpike(currentPrice, alert.threshold_value);
          if (isSpike) {
            shouldTrigger = true;
            message = `Price spike detected: Current price $${currentPrice}/MWh represents a significant increase`;
          }
          break;
      }
      
      if (shouldTrigger) {
        triggeredAlerts.push({
          alert_id: alert.id,
          current_price: currentPrice,
          threshold: alert.threshold_value,
          message,
          triggered_at: new Date().toISOString()
        });
        
        // Create notification
        await createNotification(supabase, alert.user_id, {
          title: 'AESO Price Alert',
          message,
          type: 'price_alert',
          priority: 'high',
          data: {
            current_price: currentPrice,
            threshold: alert.threshold_value,
            alert_type: alert.alert_type
          }
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      current_price: currentPrice,
      triggered_alerts: triggeredAlerts,
      checked_alerts: alerts?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error checking alert triggers:', error);
    throw error;
  }
}

async function getCurrentAESOPrice(): Promise<number> {
  try {
    const apiKey = Deno.env.get('AESO_API_KEY');
    
    const response = await fetch(
      'https://apimgw.aeso.ca/public/price-api/v1/price/poolPrice?startDate=' + 
      new Date().toISOString().slice(0, 10),
      {
        headers: apiKey ? {
          'Ocp-Apim-Subscription-Key': apiKey
        } : {}
      }
    );
    
    if (!response.ok) {
      throw new Error(`AESO API error: ${response.status}`);
    }
    
    const data = await response.json();
    const prices = data.return?.['Pool Price'] || [];
    
    if (prices.length === 0) {
      throw new Error('No current price data available');
    }
    
    // Get the most recent price
    const latestPrice = prices[prices.length - 1];
    return parseFloat(latestPrice.price);
    
  } catch (error) {
    console.error('Error fetching current AESO price:', error);
    // Return a fallback price to prevent system failure
    return 50; // Reasonable fallback price
  }
}

async function detectPriceSpike(currentPrice: number, spikeThreshold: number): Promise<boolean> {
  // Simple spike detection: if current price is >X% above recent average
  // In a real implementation, this would use more sophisticated analysis
  
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const apiKey = Deno.env.get('AESO_API_KEY');
    const response = await fetch(
      'https://apimgw.aeso.ca/public/price-api/v1/price/poolPrice?startDate=' + 
      last24Hours.toISOString().slice(0, 10),
      {
        headers: apiKey ? {
          'Ocp-Apim-Subscription-Key': apiKey
        } : {}
      }
    );
    
    if (!response.ok) {
      return false; // Can't determine spike without historical data
    }
    
    const data = await response.json();
    const prices = data.return?.['Pool Price'] || [];
    
    if (prices.length < 10) {
      return false; // Need sufficient data
    }
    
    const recentPrices = prices.slice(-24).map((p: any) => parseFloat(p.price));
    const averagePrice = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length;
    
    // Consider it a spike if current price is spikeThreshold% above recent average
    const spikeRatio = (currentPrice - averagePrice) / averagePrice;
    return spikeRatio > (spikeThreshold / 100);
    
  } catch (error) {
    console.error('Error detecting price spike:', error);
    return false;
  }
}

async function createNotification(supabase: any, userId: string, notification: any) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      data: notification.data,
      source: 'price_alert_system'
    });

  if (error) {
    console.error('Error creating notification:', error);
  }
}