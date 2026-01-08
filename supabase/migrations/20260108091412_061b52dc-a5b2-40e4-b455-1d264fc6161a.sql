-- Add is_email_verified column to academy_users
ALTER TABLE public.academy_users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT false;

-- Create academy email verification tokens table
CREATE TABLE IF NOT EXISTS public.academy_email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tokens table
ALTER TABLE public.academy_email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for tokens - users can read their own tokens
CREATE POLICY "Users can view their own tokens"
ON public.academy_email_verification_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_academy_email_tokens_token ON public.academy_email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_academy_email_tokens_user ON public.academy_email_verification_tokens(user_id);