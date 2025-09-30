-- ============================================================================
-- SECURITY FIX: Add search_path to remaining database functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.soft_delete_verified_site(site_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = now(), updated_at = now()
  WHERE id = site_id AND created_by = auth.uid() AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.clean_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.voltmarket_email_verification_tokens 
  WHERE expires_at < now() AND used_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.bulk_delete_verified_sites(site_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = now(), updated_at = now()
  WHERE id = ANY(site_ids) AND created_by = auth.uid() AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_verified_site(site_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = NULL, updated_at = now()
  WHERE id = site_id AND created_by = auth.uid() AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_details(user_id uuid)
RETURNS TABLE(id uuid, email text, full_name text, phone text, department text, created_at timestamp with time zone, updated_at timestamp with time zone, last_login timestamp with time zone, is_active boolean, is_verified boolean, roles text[], permissions text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.department,
    p.created_at,
    p.updated_at,
    p.last_login,
    p.is_active,
    p.is_verified,
    COALESCE(ARRAY_AGG(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') as roles,
    COALESCE(ARRAY_AGG(DISTINCT up.permission) FILTER (WHERE up.permission IS NOT NULL), '{}') as permissions
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_permissions up ON p.id = up.user_id
  WHERE p.id = user_id
  GROUP BY p.id, p.email, p.full_name, p.phone, p.department, p.created_at, p.updated_at, p.last_login, p.is_active, p.is_verified;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_with_details()
RETURNS TABLE(id uuid, email text, full_name text, phone text, department text, created_at timestamp with time zone, updated_at timestamp with time zone, last_login timestamp with time zone, is_active boolean, is_verified boolean, roles text[], permissions text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.department,
    p.created_at,
    p.updated_at,
    p.last_login,
    p.is_active,
    p.is_verified,
    COALESCE(ARRAY_AGG(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') as roles,
    COALESCE(ARRAY_AGG(DISTINCT up.permission) FILTER (WHERE up.permission IS NOT NULL), '{}') as permissions
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_permissions up ON p.id = up.user_id
  GROUP BY p.id, p.email, p.full_name, p.phone, p.department, p.created_at, p.updated_at, p.last_login, p.is_active, p.is_verified
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_approved_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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