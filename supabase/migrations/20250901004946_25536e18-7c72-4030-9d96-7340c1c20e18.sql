-- Create table for saved energy rate calculations
CREATE TABLE public.saved_energy_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calculation_name TEXT NOT NULL,
  input_data JSONB NOT NULL,
  results_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_energy_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own calculations" 
ON public.saved_energy_calculations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculations" 
ON public.saved_energy_calculations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" 
ON public.saved_energy_calculations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" 
ON public.saved_energy_calculations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_energy_calculations_updated_at
BEFORE UPDATE ON public.saved_energy_calculations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();