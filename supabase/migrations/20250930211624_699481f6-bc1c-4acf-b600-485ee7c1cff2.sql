-- ============================================================================
-- CRITICAL SECURITY FIXES
-- ============================================================================
-- This migration addresses:
-- 1. Infinite recursion in RLS policies
-- 2. Overly permissive profile data access
-- 3. Document and document_permissions policy fixes
-- ============================================================================

-- ============================================================================
-- FIX 1: USER_ROLES TABLE - Remove recursive policies
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create non-recursive policies using the existing has_role() function
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- FIX 2: PROFILES TABLE - Remove ALL existing policies first
-- ============================================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create secure, user-scoped policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- FIX 3: DOCUMENTS TABLE - Fix recursive policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can view documents with permissions" ON public.documents;

-- Non-recursive policy for viewing documents
CREATE POLICY "Users can view documents with permissions"
ON public.documents
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR NOT is_private 
  OR EXISTS (
    SELECT 1 
    FROM public.document_permissions 
    WHERE document_permissions.document_id = documents.id 
    AND document_permissions.user_id = auth.uid()
  )
);

-- ============================================================================
-- FIX 4: DOCUMENT_PERMISSIONS TABLE - Fix recursive policy
-- ============================================================================
DROP POLICY IF EXISTS "Document owners can manage permissions" ON public.document_permissions;

-- Create non-recursive policy
CREATE POLICY "Document owners can manage permissions"
ON public.document_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.documents 
    WHERE documents.id = document_permissions.document_id 
    AND documents.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.documents 
    WHERE documents.id = document_permissions.document_id 
    AND documents.owner_id = auth.uid()
  )
);

-- ============================================================================
-- FIX 5: Add missing search_path to database functions for security
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_gridbazaar_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_industry_intel_results_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_voltmarket_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_message_conversation_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;