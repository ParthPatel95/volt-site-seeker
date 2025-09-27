-- Fix access_requests table RLS policies to properly restrict access to admins only
-- This fixes the security vulnerability where customer contact information could be stolen

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Only VoltScout approved users can view access requests" ON public.access_requests;

-- Drop the existing UPDATE policy that's too permissive  
DROP POLICY IF EXISTS "Only admins can update access requests" ON public.access_requests;

-- Create a proper SELECT policy that only allows admins to view access requests
CREATE POLICY "Only admins can view access requests" 
ON public.access_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create a proper UPDATE policy that only allows admins to update access requests
CREATE POLICY "Only admins can update access requests" 
ON public.access_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create a DELETE policy for admins to manage access requests
CREATE POLICY "Only admins can delete access requests" 
ON public.access_requests 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));