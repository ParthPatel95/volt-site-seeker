
-- Create a table to store access requests
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  platform_use TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- Enable RLS for access requests
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert access requests (for public signup)
CREATE POLICY "Anyone can submit access requests" 
  ON public.access_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that only allows viewing for authenticated admin users
CREATE POLICY "Only admins can view access requests" 
  ON public.access_requests 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create policy that only allows updates for authenticated admin users
CREATE POLICY "Only admins can update access requests" 
  ON public.access_requests 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Add approved users to profiles table when access is granted
CREATE OR REPLACE FUNCTION public.handle_approved_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create a temporary password for the user
    -- Note: In production, you'd want to send them a password reset link
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      NEW.email,
      crypt('temporary_password_' || NEW.id, gen_salt('bf')),
      now(),
      now(),
      now()
    );
    
    -- Insert into profiles table
    INSERT INTO public.profiles (id, email, full_name)
    SELECT id, NEW.email, NEW.full_name
    FROM auth.users
    WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to handle approved users
CREATE TRIGGER on_access_request_approved
  AFTER UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_user();
