-- Academy Users table - stores academy-specific profile data
CREATE TABLE public.academy_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Academy Progress table - tracks section-level completion
CREATE TABLE public.academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, module_id, section_id)
);

-- Academy Module Starts - tracks when users begin modules
CREATE TABLE public.academy_module_starts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_visited_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Academy Quiz Attempts - tracks quiz results
CREATE TABLE public.academy_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Academy Roles table for admin access
CREATE TABLE public.academy_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'admin')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.academy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_module_starts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user is academy admin
CREATE OR REPLACE FUNCTION public.is_academy_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.academy_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
$$;

-- RLS Policies for academy_users
CREATE POLICY "Users can view their own academy profile"
  ON public.academy_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own academy profile"
  ON public.academy_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own academy profile"
  ON public.academy_users FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all academy profiles"
  ON public.academy_users FOR SELECT
  USING (public.is_academy_admin(auth.uid()));

-- RLS Policies for academy_progress
CREATE POLICY "Users can view their own progress"
  ON public.academy_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.academy_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.academy_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.academy_progress FOR SELECT
  USING (public.is_academy_admin(auth.uid()));

-- RLS Policies for academy_module_starts
CREATE POLICY "Users can view their own module starts"
  ON public.academy_module_starts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module starts"
  ON public.academy_module_starts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module starts"
  ON public.academy_module_starts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all module starts"
  ON public.academy_module_starts FOR SELECT
  USING (public.is_academy_admin(auth.uid()));

-- RLS Policies for academy_quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.academy_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
  ON public.academy_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
  ON public.academy_quiz_attempts FOR SELECT
  USING (public.is_academy_admin(auth.uid()));

-- RLS Policies for academy_roles
CREATE POLICY "Users can view their own role"
  ON public.academy_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.academy_roles FOR SELECT
  USING (public.is_academy_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.academy_roles FOR ALL
  USING (public.is_academy_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_academy_progress_user_id ON public.academy_progress(user_id);
CREATE INDEX idx_academy_progress_module_id ON public.academy_progress(module_id);
CREATE INDEX idx_academy_module_starts_user_id ON public.academy_module_starts(user_id);
CREATE INDEX idx_academy_quiz_attempts_user_id ON public.academy_quiz_attempts(user_id);

-- Trigger to update last_activity_at
CREATE OR REPLACE FUNCTION public.update_academy_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.academy_users
  SET last_activity_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_academy_activity_on_progress
  AFTER INSERT ON public.academy_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_academy_last_activity();

CREATE TRIGGER update_academy_activity_on_module_start
  AFTER INSERT OR UPDATE ON public.academy_module_starts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_academy_last_activity();