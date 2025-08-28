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

-- 3. Fix voltmarket_contact_messages - only listing owner and message sender can view
DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.voltmarket_contact_messages;
CREATE POLICY "Only message participants can view contact messages"
ON public.voltmarket_contact_messages
FOR SELECT
USING (
  auth.uid() = listing_owner_id OR 
  sender_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- 4. Fix site_access_requests - no user_id column, so make it admin-only
DROP POLICY IF EXISTS "Anyone can view site access requests" ON public.site_access_requests;
CREATE POLICY "Only authenticated admins can view site access requests"
ON public.site_access_requests
FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.voltscout_approved_users 
  WHERE user_id = auth.uid()
));

-- 5. Fix voltmarket_access_requests - make it admin-only since no clear user ownership
DROP POLICY IF EXISTS "Anyone can view voltmarket access requests" ON public.voltmarket_access_requests;
CREATE POLICY "Only authenticated admins can view voltmarket access requests"
ON public.voltmarket_access_requests
FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.voltscout_approved_users 
  WHERE user_id = auth.uid()
));