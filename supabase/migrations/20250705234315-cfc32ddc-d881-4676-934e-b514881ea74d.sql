-- Insert email verification templates if they don't exist
INSERT INTO voltmarket_email_templates (template_type, subject, html_content, variables) 
VALUES 
  (
    'email_verification',
    'Verify your WattBytes account',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">WattBytes</h1>
        <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 16px;">Energy Intelligence Platform</p>
    </div>
    
    <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
        
        <p>Hi {{recipient_name}},</p>
        
        <p>Thanks for signing up for WattBytes! To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{verification_url}}" 
               style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);">
                Verify Email Address
            </a>
        </div>
        
        <p>If the button above doesn''t work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px; font-family: monospace;">{{verification_url}}</p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>If you didn''t create an account with WattBytes, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Best regards,<br>
            The WattBytes Team
        </p>
    </div>
</body>
</html>',
    '["recipient_name", "verification_url"]'::jsonb
  ),
  (
    'email_verification_reminder',
    'Complete your WattBytes registration',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">WattBytes</h1>
        <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 16px;">Energy Intelligence Platform</p>
    </div>
    
    <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Almost There! Verify Your Email</h2>
        
        <p>Hi {{recipient_name}},</p>
        
        <p>We noticed you haven''t verified your email address yet. To unlock full access to WattBytes and ensure you receive important updates, please verify your email:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{verification_url}}" 
               style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);">
                Verify Email Address
            </a>
        </div>
        
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px; font-family: monospace;">{{verification_url}}</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Limited Access:</strong> Until you verify your email, some features may be restricted.</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questions? Reply to this email or contact our support team.<br><br>
            Best regards,<br>
            The WattBytes Team
        </p>
    </div>
</body>
</html>',
    '["recipient_name", "verification_url"]'::jsonb
  )
ON CONFLICT (template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS voltmarket_email_verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone NULL,
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL
);

-- Enable RLS on the tokens table
ALTER TABLE voltmarket_email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email verification tokens
CREATE POLICY "Users can view own tokens"
ON voltmarket_email_verification_tokens FOR SELECT
USING (auth.uid() IN (
  SELECT voltmarket_profiles.user_id 
  FROM voltmarket_profiles 
  WHERE voltmarket_profiles.user_id = voltmarket_email_verification_tokens.user_id
));

-- System can manage tokens (for edge functions)
CREATE POLICY "Service role can manage tokens"
ON voltmarket_email_verification_tokens FOR ALL
USING (auth.role() = 'service_role');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
ON voltmarket_email_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
ON voltmarket_email_verification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
ON voltmarket_email_verification_tokens(expires_at);

-- Clean up expired tokens function
CREATE OR REPLACE FUNCTION clean_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM voltmarket_email_verification_tokens 
  WHERE expires_at < now() AND used_at IS NULL;
END;
$$;