-- Create email verification tokens table for VoltMarket
CREATE TABLE IF NOT EXISTS public.voltmarket_email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_email_verification_tokens
ALTER TABLE public.voltmarket_email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_email_verification_tokens
CREATE POLICY "Public can verify tokens" ON public.voltmarket_email_verification_tokens FOR SELECT USING (true);
CREATE POLICY "Anyone can create tokens" ON public.voltmarket_email_verification_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tokens" ON public.voltmarket_email_verification_tokens FOR UPDATE USING (true);

-- Create voltmarket_access_requests table
CREATE TABLE IF NOT EXISTS public.voltmarket_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  company_type TEXT,
  role TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_access_requests
ALTER TABLE public.voltmarket_access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_access_requests
CREATE POLICY "Anyone can submit access requests" ON public.voltmarket_access_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view access requests" ON public.voltmarket_access_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update access requests" ON public.voltmarket_access_requests FOR UPDATE USING (auth.uid() IS NOT NULL);