-- Fix RLS policies for existing tables with correct column names

-- Fix voltmarket_contact_messages RLS policies
DROP POLICY IF EXISTS "Users can send contact messages" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Users can view their own contact messages" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Only message participants can view contact messages" ON public.voltmarket_contact_messages;

-- Enable RLS on voltmarket_contact_messages
ALTER TABLE public.voltmarket_contact_messages ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies using correct column names
CREATE POLICY "Anyone can send contact messages"
ON public.voltmarket_contact_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only listing owners and authenticated users can view contact messages"
ON public.voltmarket_contact_messages
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    listing_owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.voltscout_approved_users 
      WHERE voltscout_approved_users.user_id = auth.uid()
    )
  )
);

-- Ensure all sensitive tables have proper RLS
ALTER TABLE public.site_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_access_requests ENABLE ROW LEVEL SECURITY;