-- Bookmarks
CREATE TABLE public.academy_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  section_id TEXT,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, section_id)
);
ALTER TABLE public.academy_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookmarks" ON public.academy_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookmarks" ON public.academy_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON public.academy_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Notes
CREATE TABLE public.academy_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, section_id)
);
ALTER TABLE public.academy_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notes" ON public.academy_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own notes" ON public.academy_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON public.academy_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.academy_notes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_academy_notes_updated_at BEFORE UPDATE ON public.academy_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- XP & Streaks
CREATE TABLE public.academy_gamification (
  user_id UUID NOT NULL PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own gamification" ON public.academy_gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own gamification" ON public.academy_gamification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gamification" ON public.academy_gamification FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all gamification" ON public.academy_gamification FOR SELECT USING (public.is_academy_admin(auth.uid()));
CREATE TRIGGER update_academy_gamification_updated_at BEFORE UPDATE ON public.academy_gamification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- XP events log (for audit and admin analytics)
CREATE TABLE public.academy_xp_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL,
  module_id TEXT,
  section_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own xp events" ON public.academy_xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp events" ON public.academy_xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all xp events" ON public.academy_xp_events FOR SELECT USING (public.is_academy_admin(auth.uid()));

-- Module certificates with public verification
CREATE TABLE public.academy_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  exam_score INTEGER,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can verify a certificate" ON public.academy_certificates FOR SELECT USING (true);
CREATE POLICY "Users create own certificates" ON public.academy_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_academy_bookmarks_user ON public.academy_bookmarks(user_id);
CREATE INDEX idx_academy_notes_user_module ON public.academy_notes(user_id, module_id);
CREATE INDEX idx_academy_xp_events_user ON public.academy_xp_events(user_id, created_at DESC);
CREATE INDEX idx_academy_certificates_user ON public.academy_certificates(user_id);