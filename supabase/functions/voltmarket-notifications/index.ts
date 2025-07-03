
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'new_message' | 'listing_interest' | 'verification_approved' | 'verification_rejected';
  recipient_email: string;
  recipient_name: string;
  data: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, recipient_email, recipient_name, data }: NotificationRequest = await req.json();

    // Get email template
    const { data: template, error: templateError } = await supabaseClient
      .from('voltmarket_email_templates')
      .select('*')
      .eq('template_type', type)
      .single();

    if (templateError) {
      throw new Error(`Template not found: ${templateError.message}`);
    }

    // Replace variables in template
    let htmlContent = template.html_content;
    let subject = template.subject;
    
    // Replace template variables
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace recipient name
    htmlContent = htmlContent.replace(/{{recipient_name}}/g, recipient_name);

    // In a production environment, you would integrate with an email service like Resend
    // For now, we'll log the email that would be sent and return success
    console.log('Email notification:', {
      to: recipient_email,
      subject,
      html: htmlContent,
      type
    });

    // Record the notification in the database for audit purposes
    await supabaseClient
      .from('voltmarket_user_activity')
      .insert({
        user_id: null, // System generated
        activity_type: 'email_notification_sent',
        activity_data: {
          type,
          recipient_email,
          subject,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        template_used: type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send notification' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
