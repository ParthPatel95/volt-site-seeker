-- Fix critical data exposure vulnerabilities by updating RLS policies

-- 1. Fix access_requests table - restrict SELECT to authenticated admins only
DROP POLICY IF EXISTS "Only admins can view access requests" ON public.access_requests;
CREATE POLICY "Only authenticated admins can view access requests" 
ON public.access_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.voltscout_approved_users 
  WHERE user_id = auth.uid()
));

-- 2. Create secure user_api_keys table for proper API key storage
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);

-- Enable RLS on user_api_keys
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_api_keys
CREATE POLICY "Users can manage their own API keys"
ON public.user_api_keys
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create update trigger for user_api_keys
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Check and fix voltmarket_contact_messages if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voltmarket_contact_messages') THEN
    -- Drop existing overly permissive policies
    DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.voltmarket_contact_messages;
    
    -- Create secure policy - only message participants can view
    CREATE POLICY "Only message participants can view contact messages"
    ON public.voltmarket_contact_messages
    FOR SELECT
    USING (
      auth.uid() = sender_id OR 
      auth.uid() IN (
        SELECT user_id FROM public.voltmarket_profiles 
        WHERE id IN (
          SELECT seller_id FROM public.voltmarket_listings 
          WHERE id = listing_id
        )
      )
    );
  END IF;
END $$;

-- 4. Check and fix site_access_requests if exists  
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_access_requests') THEN
    -- Drop overly permissive policies
    DROP POLICY IF EXISTS "Anyone can view site access requests" ON public.site_access_requests;
    
    -- Create secure policy - only request owners can view
    CREATE POLICY "Users can view their own site access requests"
    ON public.site_access_requests
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Check and fix voltmarket_access_requests if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voltmarket_access_requests') THEN
    -- Drop overly permissive policies
    DROP POLICY IF EXISTS "Anyone can view voltmarket access requests" ON public.voltmarket_access_requests;
    
    -- Create secure policy - only involved parties can view
    CREATE POLICY "Only involved parties can view voltmarket access requests"
    ON public.voltmarket_access_requests
    FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = seller_id);
  END IF;
END $$;