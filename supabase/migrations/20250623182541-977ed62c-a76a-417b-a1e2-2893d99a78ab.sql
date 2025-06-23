
-- Create a table to store site access requests
CREATE TABLE public.site_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  power_requirement TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('USA', 'Canada', 'Uganda')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed'))
);

-- Enable RLS
ALTER TABLE public.site_access_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert requests (public form)
CREATE POLICY "Anyone can submit site access requests" ON public.site_access_requests FOR INSERT WITH CHECK (true);

-- Create policy for authenticated users to view requests (for admin purposes)
CREATE POLICY "Authenticated users can view site access requests" ON public.site_access_requests FOR SELECT TO authenticated USING (true);
