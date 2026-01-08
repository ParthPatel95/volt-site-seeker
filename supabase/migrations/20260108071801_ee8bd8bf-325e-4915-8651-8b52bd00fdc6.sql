-- Fix INSERT policies with proper WITH CHECK clauses
DROP POLICY IF EXISTS "Users can insert their own progress" ON academy_progress;
CREATE POLICY "Users can insert their own progress" ON academy_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own module starts" ON academy_module_starts;
CREATE POLICY "Users can insert their own module starts" ON academy_module_starts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON academy_quiz_attempts;
CREATE POLICY "Users can insert their own quiz attempts" ON academy_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own academy profile" ON academy_users;
CREATE POLICY "Users can insert their own academy profile" ON academy_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add DELETE policies for progress tracking
CREATE POLICY "Users can delete their own progress" ON academy_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own module starts" ON academy_module_starts
  FOR DELETE USING (auth.uid() = user_id);