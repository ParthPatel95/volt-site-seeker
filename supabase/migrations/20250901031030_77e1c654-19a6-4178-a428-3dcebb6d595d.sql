-- Phase 1: Critical Data Protection - Fix publicly readable sensitive tables (with proper checks)

-- Fix access_requests table - restrict to authenticated administrators only
DROP POLICY IF EXISTS "Only authenticated admins can view access requests" ON public.access_requests;

CREATE POLICY "Only VoltScout approved users can view access requests"
ON public.access_requests
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.voltscout_approved_users 
    WHERE voltscout_approved_users.user_id = auth.uid()
  )
);

-- Create user_api_keys table for secure API key storage
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_name text NOT NULL,
  encrypted_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, service_name)
);

-- Enable RLS on user_api_keys
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for user_api_keys (with proper check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_api_keys' 
    AND policyname = 'Users can manage their own API keys'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can manage their own API keys"
    ON public.user_api_keys
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;