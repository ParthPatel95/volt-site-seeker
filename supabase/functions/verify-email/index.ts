import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Verification Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .error { color: #dc2626; text-align: center; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">
              <h1>❌ Invalid Verification Link</h1>
              <p>The verification link is invalid or missing required information.</p>
              <p>Please request a new verification email from your account.</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/voltmarket/auth" class="btn">Go to Login</a>
            </div>
          </div>
        </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
          status: 400,
        }
      );
    }

    // Find the verification token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('voltmarket_email_verification_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid or Expired Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .error { color: #dc2626; text-align: center; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">
              <h1>🔗 Link Expired or Invalid</h1>
              <p>This verification link has either expired or has already been used.</p>
              <p>Please request a new verification email from your account settings.</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/voltmarket/auth" class="btn">Go to Login</a>
            </div>
          </div>
        </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
          status: 400,
        }
      );
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Verification Link Expired</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .error { color: #dc2626; text-align: center; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">
              <h1>⏰ Link Expired</h1>
              <p>This verification link has expired. Verification links are valid for 24 hours.</p>
              <p>Please request a new verification email from your account.</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/voltmarket/auth" class="btn">Go to Login</a>
            </div>
          </div>
        </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
          status: 400,
        }
      );
    }

    // Mark token as used
    const { error: markUsedError } = await supabaseClient
      .from('voltmarket_email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError);
    }

    // Update user profile to mark email as verified
    const { error: profileError } = await supabaseClient
      .from('voltmarket_profiles')
      .update({ 
        is_email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', tokenData.user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Verification Error</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .error { color: #dc2626; text-align: center; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">
              <h1>❌ Verification Error</h1>
              <p>There was an error updating your account. Please try again or contact support.</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/voltmarket/auth" class="btn">Go to Login</a>
            </div>
          </div>
        </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
          status: 500,
        }
      );
    }

    // Success! Redirect to wattbyte.com
    const redirectUrl = `https://www.wattbyte.com?verified=true`;
    
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified Successfully</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="3;url=${redirectUrl}">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; }
          .success { color: #16a34a; }
          .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">
            <h1>✅ Email Verified Successfully!</h1>
            <p>Your email address has been verified. You now have full access to WattBytes.</p>
            <div class="loading"></div>
            <p>Redirecting you to WattByte.com...</p>
            <a href="${redirectUrl}" class="btn">Go to WattByte.com</a>
          </div>
        </div>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error verifying email:', error);
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .error { color: #dc2626; text-align: center; }
          .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">
            <h1>❌ Verification Failed</h1>
            <p>An unexpected error occurred during verification. Please try again or contact support.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/voltmarket/auth" class="btn">Go to Login</a>
          </div>
        </div>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 500,
      }
    );
  }
});