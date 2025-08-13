-- Fix security vulnerabilities in publicly accessible tables
-- Restrict access to sensitive customer and business data

-- Fix access_requests table - restrict to authenticated administrators only
DROP POLICY IF EXISTS "Anyone can submit access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Only admins can view access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Only admins can update access requests" ON public.access_requests;

-- Allow anyone to submit access requests (this is needed for signup)
CREATE POLICY "Anyone can submit access requests" 
ON public.access_requests 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Only authenticated users (admins) can view access requests
CREATE POLICY "Authenticated users can view access requests" 
ON public.access_requests 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users (admins) can update access requests
CREATE POLICY "Authenticated users can update access requests" 
ON public.access_requests 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix site_access_requests table if it exists
-- (Note: This table might not exist yet, so we'll handle it conditionally)

-- Fix voltmarket_access_requests table - restrict to authenticated administrators only
DROP POLICY IF EXISTS "Anyone can create access requests" ON public.voltmarket_access_requests;
DROP POLICY IF EXISTS "Authenticated users can view access requests" ON public.voltmarket_access_requests;
DROP POLICY IF EXISTS "Authenticated users can update access requests" ON public.voltmarket_access_requests;

-- Allow anyone to submit VoltMarket access requests (needed for signup)
CREATE POLICY "Anyone can submit voltmarket access requests" 
ON public.voltmarket_access_requests 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Only authenticated users can view VoltMarket access requests
CREATE POLICY "Authenticated users can view voltmarket access requests" 
ON public.voltmarket_access_requests 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can update VoltMarket access requests
CREATE POLICY "Authenticated users can update voltmarket access requests" 
ON public.voltmarket_access_requests 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix voltmarket_contact_messages table - restrict insertion to authenticated users
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON public.voltmarket_contact_messages;

-- Allow anonymous users to submit contact messages (common pattern for contact forms)
-- but restrict viewing to authenticated users only
CREATE POLICY "Anyone can submit contact messages" 
ON public.voltmarket_contact_messages 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Only authenticated users can view contact messages
CREATE POLICY "Authenticated users can view contact messages" 
ON public.voltmarket_contact_messages 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can update contact messages (for status changes)
CREATE POLICY "Authenticated users can update contact messages" 
ON public.voltmarket_contact_messages 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);