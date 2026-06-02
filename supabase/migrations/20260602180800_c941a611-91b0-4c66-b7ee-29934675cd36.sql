-- 1. aeso_model_parameters: lock down writes to service_role
DROP POLICY IF EXISTS "Anyone can view model parameters" ON public.aeso_model_parameters;
DROP POLICY IF EXISTS "Service role can manage model parameters" ON public.aeso_model_parameters;

CREATE POLICY "Authenticated users can view model parameters"
ON public.aeso_model_parameters FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Service role manages model parameters"
ON public.aeso_model_parameters FOR ALL
TO service_role USING (true) WITH CHECK (true);

-- 2. site_access_requests: drop overpermissive policies (strict ones remain)
DROP POLICY IF EXISTS "Authenticated users can view site access requests" ON public.site_access_requests;
DROP POLICY IF EXISTS "Authenticated users can update site access requests" ON public.site_access_requests;

-- 3. user_roles: drop public-read-all
DROP POLICY IF EXISTS "Users can view all user roles" ON public.user_roles;

-- 4. user_permissions: drop public-read-all
DROP POLICY IF EXISTS "Users can view all permissions" ON public.user_permissions;

CREATE POLICY "Users can view their own permissions"
ON public.user_permissions FOR SELECT
TO authenticated USING (user_id = auth.uid());

-- 5. voltmarket_access_requests: replace broken admin check
DROP POLICY IF EXISTS "Admins can view access requests" ON public.voltmarket_access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON public.voltmarket_access_requests;

CREATE POLICY "Admins can view access requests"
ON public.voltmarket_access_requests FOR SELECT
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update access requests"
ON public.voltmarket_access_requests FOR UPDATE
TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. voltmarket_contact_messages: drop overpermissive policies
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON public.voltmarket_contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON public.voltmarket_contact_messages;

CREATE POLICY "Listing owners can update contact messages"
ON public.voltmarket_contact_messages FOR UPDATE
TO authenticated
USING (listing_owner_id = auth.uid())
WITH CHECK (listing_owner_id = auth.uid());