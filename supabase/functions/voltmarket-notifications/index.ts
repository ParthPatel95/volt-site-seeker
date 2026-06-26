
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

import { corsHeaders } from "../_shared/cors.ts";
import { requireUserOrService } from "../_shared/guard.ts";
import { errorResponse } from '../_shared/http.ts';
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

    // Auth: notifications are for authenticated contexts / internal callers.
    // (Audit-2026-06-25 PR3.)
    const gate = await requireUserOrService(req, supabaseClient);
    if (gate instanceof Response) return gate;

    const { type, recipient_email, recipient_name, data }: NotificationRequest = await req.json();
    // Escape every caller-controlled value before it goes into the email
    // HTML template — `data` and recipient_name were substituted raw, a
    // stored-XSS / email-injection vector once sending is enabled.
    const escapeHtml = (s: unknown) => String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

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
    
    // Replace template variables (escaped). Escape the placeholder key when
    // building the RegExp so a crafted key can't inject regex metachars.
    Object.entries(data).forEach(([key, value]) => {
      const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`{{${safeKey}}}`, 'g');
      htmlContent = htmlContent.replace(re, escapeHtml(value));
      subject = subject.replace(re, escapeHtml(value));
    });

    // Replace recipient name (escaped)
    htmlContent = htmlContent.replace(/{{recipient_name}}/g, escapeHtml(recipient_name));

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
    return errorResponse(error, corsHeaders, { status: 500, message: 'Failed to send notification', context: 'voltmarket-notifications' });
  }
});
