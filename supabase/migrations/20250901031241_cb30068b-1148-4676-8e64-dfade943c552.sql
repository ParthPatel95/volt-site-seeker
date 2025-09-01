-- Create missing tables with proper RLS policies

-- Create site_access_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  site_location text NOT NULL,
  power_requirements text,
  message text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create voltmarket_access_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.voltmarket_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  role text,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create voltmarket_contact_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.voltmarket_contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid,
  sender_id uuid,
  recipient_id uuid,
  sender_email text NOT NULL,
  sender_phone text,
  message text NOT NULL,
  subject text,
  status text DEFAULT 'sent',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.site_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_contact_messages ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for site_access_requests
DROP POLICY IF EXISTS "Anyone can submit site access requests" ON public.site_access_requests;
DROP POLICY IF EXISTS "Only authenticated admins can view site access requests" ON public.site_access_requests;

CREATE POLICY "Anyone can submit site access requests"
ON public.site_access_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only VoltScout approved users can view site access requests"
ON public.site_access_requests
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.voltscout_approved_users 
    WHERE voltscout_approved_users.user_id = auth.uid()
  )
);

-- Create secure RLS policies for voltmarket_access_requests
DROP POLICY IF EXISTS "Anyone can submit voltmarket access requests" ON public.voltmarket_access_requests;
DROP POLICY IF EXISTS "Only authenticated admins can view voltmarket access requests" ON public.voltmarket_access_requests;

CREATE POLICY "Anyone can submit voltmarket access requests"
ON public.voltmarket_access_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only VoltScout approved users can view voltmarket access requests"
ON public.voltmarket_access_requests
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.voltscout_approved_users 
    WHERE voltscout_approved_users.user_id = auth.uid()
  )
);

-- Create secure RLS policies for voltmarket_contact_messages
DROP POLICY IF EXISTS "Users can send contact messages" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Users can view their own contact messages" ON public.voltmarket_contact_messages;

CREATE POLICY "Anyone can send contact messages"
ON public.voltmarket_contact_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only message participants can view contact messages"
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
);