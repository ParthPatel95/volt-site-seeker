-- Fix function search path security issues
-- Update functions to use secure search_path

CREATE OR REPLACE FUNCTION public.update_gridbazaar_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_industry_intel_results_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_verified_site(site_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = now(), updated_at = now()
  WHERE id = site_id AND created_by = auth.uid() AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_expired_verification_tokens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.voltmarket_email_verification_tokens 
  WHERE expires_at < now() AND used_at IS NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.bulk_delete_verified_sites(site_ids uuid[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = now(), updated_at = now()
  WHERE id = ANY(site_ids) AND created_by = auth.uid() AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_voltmarket_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_verified_site(site_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = NULL, updated_at = now()
  WHERE id = site_id AND created_by = auth.uid() AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_voltscout_approved(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.voltscout_approved_users 
    WHERE voltscout_approved_users.user_id = is_voltscout_approved.user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_message_conversation_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Find or create conversation
  SELECT id INTO NEW.conversation_id
  FROM public.voltmarket_conversations
  WHERE listing_id = NEW.listing_id
    AND (
      (buyer_id = NEW.sender_id AND seller_id = NEW.recipient_id) OR
      (buyer_id = NEW.recipient_id AND seller_id = NEW.sender_id)
    );
  
  -- If no conversation exists, create one
  IF NEW.conversation_id IS NULL THEN
    INSERT INTO public.voltmarket_conversations (listing_id, buyer_id, seller_id)
    VALUES (NEW.listing_id, NEW.sender_id, NEW.recipient_id)
    RETURNING id INTO NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_approved_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;