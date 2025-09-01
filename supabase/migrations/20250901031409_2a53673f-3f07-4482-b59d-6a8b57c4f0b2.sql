-- Fix RLS policies for remaining publicly accessible tables

-- Check and fix site_access_requests policies
DROP POLICY IF EXISTS "Anyone can submit site access requests" ON public.site_access_requests;
DROP POLICY IF EXISTS "Only authenticated admins can view site access requests" ON public.site_access_requests;
DROP POLICY IF EXISTS "Only VoltScout approved users can view site access requests" ON public.site_access_requests;

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

-- Check and fix voltmarket_access_requests policies
DROP POLICY IF EXISTS "Anyone can submit voltmarket access requests" ON public.voltmarket_access_requests;
DROP POLICY IF EXISTS "Only authenticated admins can view voltmarket access requests" ON public.voltmarket_access_requests;
DROP POLICY IF EXISTS "Only VoltScout approved users can view voltmarket access requests" ON public.voltmarket_access_requests;

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

-- Fix scraped_properties table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scraped_properties') THEN
    EXECUTE 'ALTER TABLE public.scraped_properties ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view scraped properties" ON public.scraped_properties';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage scraped properties" ON public.scraped_properties';
    
    EXECUTE 'CREATE POLICY "VoltScout approved users can view scraped properties"
    ON public.scraped_properties
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.voltscout_approved_users 
        WHERE voltscout_approved_users.user_id = auth.uid()
      )
    )';
    
    EXECUTE 'CREATE POLICY "VoltScout approved users can manage scraped properties"
    ON public.scraped_properties
    FOR ALL
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.voltscout_approved_users 
        WHERE voltscout_approved_users.user_id = auth.uid()
      )
    )
    WITH CHECK (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.voltscout_approved_users 
        WHERE voltscout_approved_users.user_id = auth.uid()
      )
    )';
  END IF;
END $$;