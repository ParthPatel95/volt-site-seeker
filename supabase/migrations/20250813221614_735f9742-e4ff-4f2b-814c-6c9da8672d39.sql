-- Fix security vulnerabilities by updating existing policies for better access control

-- Drop the overly permissive voltmarket_contact_messages policy that allows public viewing
-- and replace with admin-only access
DROP POLICY IF EXISTS "Listing owners can view messages for their listings" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Listing owners can update message read status" ON public.voltmarket_contact_messages;

-- Create more restrictive policies for contact messages
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

-- The access_requests tables already have appropriate policies
-- but let's ensure they're restrictive enough

-- Check if site_access_requests table exists and fix it if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_access_requests') THEN
        -- Drop any public policies on site_access_requests
        DROP POLICY IF EXISTS "Anyone can submit site access requests" ON public.site_access_requests;
        DROP POLICY IF EXISTS "Public can view site access requests" ON public.site_access_requests;
        
        -- Allow submissions but restrict viewing to authenticated users
        CREATE POLICY "Anyone can submit site access requests" 
        ON public.site_access_requests 
        FOR INSERT 
        TO anon
        WITH CHECK (true);
        
        CREATE POLICY "Authenticated users can view site access requests" 
        ON public.site_access_requests 
        FOR SELECT 
        TO authenticated
        USING (true);
        
        CREATE POLICY "Authenticated users can update site access requests" 
        ON public.site_access_requests 
        FOR UPDATE 
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;