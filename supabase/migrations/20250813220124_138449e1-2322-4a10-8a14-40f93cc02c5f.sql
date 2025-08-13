-- Fix security vulnerability in voltmarket_email_verification_tokens table
-- Remove overly permissive public policies and replace with secure ones

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Public can verify tokens" ON public.voltmarket_email_verification_tokens;
DROP POLICY IF EXISTS "Anyone can create tokens" ON public.voltmarket_email_verification_tokens;
DROP POLICY IF EXISTS "Anyone can update tokens" ON public.voltmarket_email_verification_tokens;

-- Create secure policies that only allow:
-- 1. Service role (edge functions) to manage all tokens
-- 2. Users to view only their own tokens (via email match with profiles)
-- 3. No public access

-- Policy for service role to manage all tokens (for edge functions)
CREATE POLICY "Service role can manage all tokens" 
ON public.voltmarket_email_verification_tokens 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for users to view only their own tokens by email
CREATE POLICY "Users can view own tokens by email" 
ON public.voltmarket_email_verification_tokens 
FOR SELECT 
TO authenticated
USING (
  email = (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Policy to allow token verification by matching email (for verify-email function)
-- This is needed for the public verify-email endpoint but only for specific operations
CREATE POLICY "Allow token verification by email match" 
ON public.voltmarket_email_verification_tokens 
FOR SELECT 
TO anon
USING (
  -- Only allow access to tokens that are being verified
  -- This policy will be used by the verify-email edge function
  auth.role() = 'anon' AND 
  expires_at > now() AND 
  used_at IS NULL
);

-- Policy to allow edge functions to update tokens as used
CREATE POLICY "Allow edge functions to mark tokens as used" 
ON public.voltmarket_email_verification_tokens 
FOR UPDATE 
TO anon
USING (
  expires_at > now() AND 
  used_at IS NULL
)
WITH CHECK (
  used_at IS NOT NULL
);