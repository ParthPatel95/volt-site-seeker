import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@3.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  email: string;
  user_id: string;
  is_resend?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { email, user_id, is_resend = false }: VerificationEmailRequest = await req.json();

    // Generate verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Clean up any existing unused tokens for this user
    await supabaseClient
      .from('voltmarket_email_verification_tokens')
      .delete()
      .eq('user_id', user_id)
      .is('used_at', null);

    // Insert new verification token
    const { error: tokenError } = await supabaseClient
      .from('voltmarket_email_verification_tokens')
      .insert({
        user_id,
        token,
        expires_at: expiresAt.toISOString(),
        email
      });

    if (tokenError) {
      throw new Error(`Failed to create verification token: ${tokenError.message}`);
    }

    // Get the appropriate email template
    const templateType = is_resend ? 'email_verification_reminder' : 'email_verification';
    
    const { data: template, error: templateError } = await supabaseClient
      .from('voltmarket_email_templates')
      .select('*')
      .eq('template_type', templateType)
      .single();

    if (templateError) {
      throw new Error(`Email template not found: ${templateError.message}`);
    }

    // Create verification URL - use the correct Supabase project URL
    const verificationUrl = `https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/verify-email?token=${token}`;

    // Get user profile for name
    const { data: profile } = await supabaseClient
      .from('voltmarket_profiles')
      .select('company_name')
      .eq('user_id', user_id)
      .single();

    const recipientName = profile?.company_name || email.split('@')[0] || 'there';

    // Replace template variables
    let htmlContent = template.html_content;
    let subject = template.subject;
    
    htmlContent = htmlContent.replace(/\{\{recipient_name\}\}/g, recipientName);
    htmlContent = htmlContent.replace(/\{\{verification_url\}\}/g, verificationUrl);
    subject = subject.replace(/\{\{recipient_name\}\}/g, recipientName);

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: 'WattMarketplace <noreply@wattmarketplace.com>',
      to: [email],
      subject,
      html: htmlContent,
    });

    if (emailResult.error) {
      throw new Error(`Failed to send email: ${emailResult.error.message}`);
    }

    console.log('Verification email sent successfully:', {
      email,
      user_id,
      is_resend,
      email_id: emailResult.data?.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        expires_at: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending verification email:', error);
    const message = error instanceof Error ? error.message : 'Failed to send verification email';
    return new Response(
      JSON.stringify({ 
        error: message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});