
-- Create enum types for better data integrity
CREATE TYPE property_type AS ENUM ('industrial', 'warehouse', 'manufacturing', 'data_center', 'logistics', 'flex_space', 'other');
CREATE TYPE property_status AS ENUM ('available', 'under_contract', 'sold', 'off_market', 'analyzing');
CREATE TYPE alert_type AS ENUM ('new_property', 'price_change', 'status_change', 'high_voltscore');
CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'viewer');

-- Users profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Properties table - core data storage
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  property_type property_type NOT NULL,
  status property_status NOT NULL DEFAULT 'analyzing',
  square_footage INTEGER,
  lot_size_acres DECIMAL(10,2),
  asking_price DECIMAL(15,2),
  price_per_sqft DECIMAL(10,2),
  year_built INTEGER,
  power_capacity_mw DECIMAL(10,2),
  substation_distance_miles DECIMAL(10,2),
  transmission_access BOOLEAN DEFAULT FALSE,
  zoning TEXT,
  description TEXT,
  listing_url TEXT,
  source TEXT NOT NULL, -- 'loopnet', 'manual', 'broker', etc.
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- VoltScore calculations table
CREATE TABLE public.volt_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  location_score INTEGER NOT NULL CHECK (location_score >= 0 AND location_score <= 100),
  power_score INTEGER NOT NULL CHECK (power_score >= 0 AND power_score <= 100),
  infrastructure_score INTEGER NOT NULL CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
  financial_score INTEGER NOT NULL CHECK (financial_score >= 0 AND financial_score <= 100),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  calculation_details JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Broker contacts
CREATE TABLE public.brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  specialties TEXT[],
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Property-broker relationships
CREATE TABLE public.property_brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  is_listing_agent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, broker_id)
);

-- Alerts and notifications
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Saved searches/criteria
CREATE TABLE public.search_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL, -- stores search parameters
  is_active BOOLEAN DEFAULT TRUE,
  email_alerts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Property notes and analysis
CREATE TABLE public.property_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volt_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing authenticated users to access all data for now)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all properties" ON public.properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update properties" ON public.properties FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view volt_scores" ON public.volt_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert volt_scores" ON public.volt_scores FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can manage brokers" ON public.brokers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage property_brokers" ON public.property_brokers FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own searches" ON public.search_criteria FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage property notes" ON public.property_notes FOR ALL TO authenticated USING (true);

-- Create profiles automatically when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_city_state ON public.properties(city, state);
CREATE INDEX idx_properties_discovered_at ON public.properties(discovered_at DESC);
CREATE INDEX idx_volt_scores_property_id ON public.volt_scores(property_id);
CREATE INDEX idx_volt_scores_overall_score ON public.volt_scores(overall_score DESC);
CREATE INDEX idx_alerts_user_id_created_at ON public.alerts(user_id, created_at DESC);
CREATE INDEX idx_property_notes_property_id ON public.property_notes(property_id);
