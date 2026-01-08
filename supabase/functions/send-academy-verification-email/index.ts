import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  email: string;
  user_id: string;
  full_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, user_id, full_name }: VerificationRequest = await req.json();

    if (!email || !user_id) {
      throw new Error('Missing required fields: email and user_id');
    }

    // Generate a secure random token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing tokens for this user
    await supabaseClient
      .from('academy_email_verification_tokens')
      .delete()
      .eq('user_id', user_id);

    // Store the new verification token
    const { error: tokenError } = await supabaseClient
      .from('academy_email_verification_tokens')
      .insert({
        user_id,
        email,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error storing token:', tokenError);
      throw new Error('Failed to create verification token');
    }

    // Build verification URL
    const baseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const verificationUrl = `${baseUrl}/functions/v1/verify-academy-email?token=${token}`;

    const recipientName = full_name || 'Learner';

    // Send verification email via Resend
    // NOTE: Update 'from' address to verified custom domain for production
    // e.g., "WattByte Academy <noreply@yourdomain.com>"
    const emailResponse = await resend.emails.send({
      from: "WattByte Academy <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your WattByte Academy email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f7931a 0%, #d4760f 100%); padding: 32px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                        🎓 WattByte Academy
                      </h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="color: white; margin: 0 0 16px 0; font-size: 24px;">
                        Welcome, ${recipientName}!
                      </h2>
                      <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                        Thank you for joining WattByte Academy. To start learning and track your progress across all our Bitcoin mining courses, please verify your email address.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 16px 0 32px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #f7931a 0%, #d4760f 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(247,147,26,0.3);">
                              Verify My Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #f7931a; margin: 0 0 32px 0; font-size: 12px; word-break: break-all; background: rgba(247,147,26,0.1); padding: 12px; border-radius: 6px;">
                        ${verificationUrl}
                      </p>
                      
                      <!-- Benefits -->
                      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">
                        <p style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                          Once verified, you'll be able to:
                        </p>
                        <ul style="color: #94a3b8; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                          <li>Start and track progress across 12+ modules</li>
                          <li>Earn completion certificates</li>
                          <li>Resume learning from any device</li>
                          <li>Access industry-verified content</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: rgba(0,0,0,0.2); padding: 24px 32px; text-align: center;">
                      <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px;">
                        This link expires in 24 hours.
                      </p>
                      <p style="color: #64748b; margin: 0; font-size: 12px;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error details:", {
        error: emailResponse.error,
        email,
        user_id
      });
      
      const errorMessage = emailResponse.error.message || "Unknown email error";
      if (errorMessage.includes("API key")) {
        throw new Error("Email service configuration error. Please contact support.");
      }
      if (errorMessage.includes("domain")) {
        throw new Error("Email domain not verified. Please contact support.");
      }
      throw new Error(`Failed to send verification email: ${errorMessage}`);
    }

    console.log('Verification email sent:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to send verification email' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
