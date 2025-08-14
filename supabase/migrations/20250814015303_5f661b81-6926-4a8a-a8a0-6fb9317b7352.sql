-- Final fix for security vulnerabilities - only change what needs changing

-- Fix voltmarket_contact_messages: Replace listing owner policies with admin-only policies
DROP POLICY IF EXISTS "Listing owners can view messages for their listings" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Listing owners can update message read status" ON public.voltmarket_contact_messages;

-- Only authenticated users (admins) can view contact messages
CREATE POLICY "Authenticated users can view contact messages" 
ON public.voltmarket_contact_messages 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users (admins) can update contact messages
CREATE POLICY "Authenticated users can update contact messages" 
ON public.voltmarket_contact_messages 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix site_access_requests: Add missing update policy
CREATE POLICY "Authenticated users can update site access requests" 
ON public.site_access_requests 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- The other tables (access_requests, voltmarket_access_requests) already have
-- appropriate policies that restrict viewing to authenticated users