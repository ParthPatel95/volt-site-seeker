-- Update RLS policies for due_diligence_reports to restrict access to creators only

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view due diligence reports" ON public.due_diligence_reports;
DROP POLICY IF EXISTS "Authenticated users can insert due diligence reports" ON public.due_diligence_reports;
DROP POLICY IF EXISTS "Authenticated users can update due diligence reports" ON public.due_diligence_reports;

-- Create secure policies that only allow access to the creator
CREATE POLICY "Users can view their own due diligence reports" 
ON public.due_diligence_reports 
FOR SELECT 
USING (auth.uid() = generated_by);

CREATE POLICY "Users can create their own due diligence reports" 
ON public.due_diligence_reports 
FOR INSERT 
WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Users can update their own due diligence reports" 
ON public.due_diligence_reports 
FOR UPDATE 
USING (auth.uid() = generated_by);

CREATE POLICY "Users can delete their own due diligence reports" 
ON public.due_diligence_reports 
FOR DELETE 
USING (auth.uid() = generated_by);