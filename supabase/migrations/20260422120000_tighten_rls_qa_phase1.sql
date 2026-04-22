-- Phase 1 RLS hardening
--
-- Several previously-shipped migrations created INSERT/UPDATE policies on
-- intelligence tables with `WITH CHECK (true)` / `USING (true)`. That
-- effectively allowed any authenticated user to write or modify any row,
-- regardless of ownership. Ingest for these tables happens via edge functions
-- that use the service-role key (which bypasses RLS), so we can safely drop
-- the permissive policies without affecting normal data flow.
--
-- For volt_scores we keep client-side inserts but require that the writer
-- owns the property the score is being attached to.

BEGIN;

-- ---------------------------------------------------------------------------
-- Intelligence tables: drop permissive INSERT/UPDATE policies. Reads are
-- preserved via the existing `view` policies created in earlier migrations.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;

DROP POLICY IF EXISTS "Authenticated users can insert distress alerts" ON public.distress_alerts;

DROP POLICY IF EXISTS "Authenticated users can insert corporate insights" ON public.corporate_insights;

DROP POLICY IF EXISTS "Authenticated users can insert news intelligence" ON public.news_intelligence;

DROP POLICY IF EXISTS "Authenticated users can insert social intelligence" ON public.social_intelligence;

DROP POLICY IF EXISTS "Authenticated users can insert linkedin intelligence" ON public.linkedin_intelligence;

DROP POLICY IF EXISTS "Authenticated users can insert industry intelligence" ON public.industry_intelligence;

-- ---------------------------------------------------------------------------
-- volt_scores: replace open-ended insert policy with an ownership check.
-- Inserts are still allowed from the client, but only when the user owns the
-- property the score belongs to.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can insert volt_scores" ON public.volt_scores;

CREATE POLICY "Users can insert volt_scores for their own properties"
  ON public.volt_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = volt_scores.property_id
        AND p.created_by = auth.uid()
    )
  );

COMMIT;
