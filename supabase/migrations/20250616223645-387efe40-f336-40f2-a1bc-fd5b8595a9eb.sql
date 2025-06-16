
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON public.properties;

DROP POLICY IF EXISTS "Anyone can view scraped properties" ON public.scraped_properties;
DROP POLICY IF EXISTS "Authenticated users can insert scraped properties" ON public.scraped_properties;
DROP POLICY IF EXISTS "Authenticated users can update scraped properties" ON public.scraped_properties;
DROP POLICY IF EXISTS "Authenticated users can delete scraped properties" ON public.scraped_properties;

-- Create new policies for properties table
CREATE POLICY "Anyone can view properties" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update properties" ON public.properties
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete properties" ON public.properties
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create new policies for scraped_properties table
CREATE POLICY "Anyone can view scraped properties" ON public.scraped_properties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert scraped properties" ON public.scraped_properties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update scraped properties" ON public.scraped_properties
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete scraped properties" ON public.scraped_properties
  FOR DELETE USING (auth.uid() IS NOT NULL);
