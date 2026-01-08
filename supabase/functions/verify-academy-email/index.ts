import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generateSuccessPage = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verified - WattByte Academy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
      box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
    }
    h1 {
      color: white;
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f7931a 0%, #d4760f 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 14px rgba(247, 147, 26, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(247, 147, 26, 0.4);
    }
    .benefits {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: left;
    }
    .benefits h3 {
      color: white;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .benefits ul {
      list-style: none;
      padding: 0;
    }
    .benefits li {
      color: #94a3b8;
      font-size: 14px;
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .benefits li::before {
      content: "✓";
      color: #22c55e;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✓</div>
    <h1>Email Verified!</h1>
    <p>
      Your WattByte Academy account is now fully activated. You can start taking courses and track your learning progress.
    </p>
    <a href="https://wattbyte.lovable.app/academy" class="button">
      Start Learning
    </a>
    <div class="benefits">
      <h3>You now have access to:</h3>
      <ul>
        <li>All 12+ Bitcoin mining modules</li>
        <li>Progress tracking across devices</li>
        <li>Completion certificates</li>
        <li>Industry-verified content</li>
      </ul>
    </div>
  </div>
</body>
</html>
`;

const generateErrorPage = (message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Failed - WattByte Academy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
    }
    h1 {
      color: white;
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .error {
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: background 0.2s;
    }
    .button:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✕</div>
    <h1>Verification Failed</h1>
    <p class="error">${message}</p>
    <p>
      Please try requesting a new verification email from the Academy page.
    </p>
    <a href="https://wattbyte.lovable.app/academy" class="button">
      Go to Academy
    </a>
  </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(generateErrorPage('No verification token provided'), {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('academy_email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token lookup error:', tokenError);
      return new Response(generateErrorPage('Invalid or expired verification link'), {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }

    // Check if already used
    if (tokenData.used_at) {
      return new Response(generateErrorPage('This verification link has already been used'), {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(generateErrorPage('This verification link has expired. Please request a new one.'), {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }

    // Update academy_users to set is_email_verified = true
    const { error: updateError } = await supabaseClient
      .from('academy_users')
      .update({ is_email_verified: true })
      .eq('user_id', tokenData.user_id);

    if (updateError) {
      console.error('Error updating academy user:', updateError);
      return new Response(generateErrorPage('Failed to verify email. Please try again.'), {
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      });
    }

    // Mark token as used
    await supabaseClient
      .from('academy_email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    console.log('Email verified successfully for user:', tokenData.user_id);

    return new Response(generateSuccessPage(), {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return new Response(
      generateErrorPage('An unexpected error occurred. Please try again.'),
      {
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      }
    );
  }
});
