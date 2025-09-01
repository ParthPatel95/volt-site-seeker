-- Phase 1: Critical Data Protection - Fix publicly readable sensitive tables

-- Fix access_requests table - restrict to authenticated administrators only
DROP POLICY IF EXISTS "Anyone can submit access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Only authenticated admins can view access requests" ON public.access_requests;

CREATE POLICY "Anyone can submit access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (true);

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

-- Create site_access_requests table policy (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_access_requests') THEN
    EXECUTE 'ALTER TABLE public.site_access_requests ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Anyone can submit site access requests"
    ON public.site_access_requests
    FOR INSERT
    WITH CHECK (true)';
    
    EXECUTE 'CREATE POLICY "Only authenticated admins can view site access requests"
    ON public.site_access_requests
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.voltscout_approved_users 
        WHERE voltscout_approved_users.user_id = auth.uid()
      )
    )';
  END IF;
END $$;

-- Create voltmarket_access_requests table policy (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voltmarket_access_requests') THEN
    EXECUTE 'ALTER TABLE public.voltmarket_access_requests ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Anyone can submit voltmarket access requests"
    ON public.voltmarket_access_requests
    FOR INSERT
    WITH CHECK (true)';
    
    EXECUTE 'CREATE POLICY "Only authenticated admins can view voltmarket access requests"
    ON public.voltmarket_access_requests
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.voltscout_approved_users 
        WHERE voltscout_approved_users.user_id = auth.uid()
      )
    )';
  END IF;
END $$;

-- Create voltmarket_contact_messages table policy (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voltmarket_contact_messages') THEN
    EXECUTE 'ALTER TABLE public.voltmarket_contact_messages ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Users can send contact messages"
    ON public.voltmarket_contact_messages
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL)';
    
    EXECUTE 'CREATE POLICY "Users can view their own contact messages"
    ON public.voltmarket_contact_messages
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL AND (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.voltmarket_listings 
          WHERE voltmarket_listings.id = listing_id 
          AND voltmarket_listings.seller_id = auth.uid()
        )
      )
    )';
  END IF;
END $$;

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

-- Create policies for user_api_keys
CREATE POLICY "Users can manage their own API keys"
ON public.user_api_keys
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);