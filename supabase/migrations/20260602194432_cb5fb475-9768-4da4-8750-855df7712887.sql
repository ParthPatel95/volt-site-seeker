-- ============ voltscout_approved_users ============
DROP POLICY IF EXISTS "Authenticated users can manage voltscout approvals" ON public.voltscout_approved_users;
CREATE POLICY "Admins manage voltscout approvals"
  ON public.voltscout_approved_users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own voltscout approval"
  ON public.voltscout_approved_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ property_notes ============
DROP POLICY IF EXISTS "Users can manage property notes" ON public.property_notes;
CREATE POLICY "Users select own notes"
  ON public.property_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notes"
  ON public.property_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes"
  ON public.property_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes"
  ON public.property_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ voltmarket_notifications ============
DROP POLICY IF EXISTS "Users can view own notifications" ON public.voltmarket_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.voltmarket_notifications;
CREATE POLICY "Users view own notifications"
  ON public.voltmarket_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON public.voltmarket_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============ inventory_groups ============
DROP POLICY IF EXISTS "Users can view groups" ON public.inventory_groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.inventory_groups;
DROP POLICY IF EXISTS "Users can update groups" ON public.inventory_groups;
DROP POLICY IF EXISTS "Users can delete groups" ON public.inventory_groups;
CREATE POLICY "Users select own groups" ON public.inventory_groups FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users insert own groups" ON public.inventory_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users update own groups" ON public.inventory_groups FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users delete own groups" ON public.inventory_groups FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ============ inventory_group_items (scope via parent group) ============
DROP POLICY IF EXISTS "Users can view group items" ON public.inventory_group_items;
DROP POLICY IF EXISTS "Users can add items to groups" ON public.inventory_group_items;
DROP POLICY IF EXISTS "Users can update group items" ON public.inventory_group_items;
DROP POLICY IF EXISTS "Users can remove items from groups" ON public.inventory_group_items;
CREATE POLICY "Users select own group items" ON public.inventory_group_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.inventory_groups g WHERE g.id = group_id AND g.created_by = auth.uid()));
CREATE POLICY "Users insert own group items" ON public.inventory_group_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.inventory_groups g WHERE g.id = group_id AND g.created_by = auth.uid()));
CREATE POLICY "Users update own group items" ON public.inventory_group_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.inventory_groups g WHERE g.id = group_id AND g.created_by = auth.uid()));
CREATE POLICY "Users delete own group items" ON public.inventory_group_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.inventory_groups g WHERE g.id = group_id AND g.created_by = auth.uid()));

-- ============ brokers ============
DROP POLICY IF EXISTS "Authenticated users can manage brokers" ON public.brokers;
CREATE POLICY "Authenticated read brokers" ON public.brokers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert brokers" ON public.brokers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users update own brokers" ON public.brokers FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users delete own brokers" ON public.brokers FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- ============ energy_cost_calculations (no user_id col; require auth, writes admin-only) ============
DROP POLICY IF EXISTS "Users can view energy cost calculations" ON public.energy_cost_calculations;
DROP POLICY IF EXISTS "Users can create energy cost calculations" ON public.energy_cost_calculations;
CREATE POLICY "Authenticated view energy cost calcs" ON public.energy_cost_calculations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage energy cost calcs" ON public.energy_cost_calculations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ volt_scores ============
DROP POLICY IF EXISTS "Authenticated users can insert volt_scores" ON public.volt_scores;
CREATE POLICY "Admins insert volt_scores" ON public.volt_scores FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ datacenter_notification_settings ============
DROP POLICY IF EXISTS "Users can view notification settings" ON public.datacenter_notification_settings;
DROP POLICY IF EXISTS "Users can create notification settings" ON public.datacenter_notification_settings;
DROP POLICY IF EXISTS "Users can update notification settings" ON public.datacenter_notification_settings;
DROP POLICY IF EXISTS "Users can delete notification settings" ON public.datacenter_notification_settings;
CREATE POLICY "Admins manage notification settings" ON public.datacenter_notification_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ datacenter_cost_savings ============
DROP POLICY IF EXISTS "Service role can manage cost savings" ON public.datacenter_cost_savings;
DROP POLICY IF EXISTS "Users can view cost savings" ON public.datacenter_cost_savings;
CREATE POLICY "Authenticated view cost savings" ON public.datacenter_cost_savings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage cost savings" ON public.datacenter_cost_savings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ price_ceiling_alerts ============
DROP POLICY IF EXISTS "Service role can manage price ceiling alerts" ON public.price_ceiling_alerts;
DROP POLICY IF EXISTS "Users can view price ceiling alerts" ON public.price_ceiling_alerts;
CREATE POLICY "Authenticated view price alerts" ON public.price_ceiling_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage price alerts" ON public.price_ceiling_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ miner_control_log ============
DROP POLICY IF EXISTS "Anyone can view control log" ON public.miner_control_log;
DROP POLICY IF EXISTS "Service can insert control log" ON public.miner_control_log;
DROP POLICY IF EXISTS "Service can update control log" ON public.miner_control_log;
CREATE POLICY "Authenticated view control log" ON public.miner_control_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage control log" ON public.miner_control_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ miner_power_readings ============
DROP POLICY IF EXISTS "Anyone can view readings" ON public.miner_power_readings;
DROP POLICY IF EXISTS "Service can insert readings" ON public.miner_power_readings;
CREATE POLICY "Authenticated view readings" ON public.miner_power_readings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage readings" ON public.miner_power_readings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ hydro_miners ============
DROP POLICY IF EXISTS "Anyone can view miners" ON public.hydro_miners;
DROP POLICY IF EXISTS "Authenticated users can manage miners" ON public.hydro_miners;
CREATE POLICY "Authenticated view miners" ON public.hydro_miners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage miners" ON public.hydro_miners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ocr_extractions ============
DROP POLICY IF EXISTS "Anyone can read OCR cache" ON public.ocr_extractions;
DROP POLICY IF EXISTS "Anyone can insert OCR cache" ON public.ocr_extractions;
CREATE POLICY "Authenticated read OCR cache" ON public.ocr_extractions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert OCR cache" ON public.ocr_extractions FOR INSERT TO authenticated WITH CHECK (true);

-- ============ storage.objects: documents bucket DELETE scoped to owner folder ============
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users delete own documents in documents bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);