import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

export interface Gamification {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

const xpForLevel = (level: number) => level * 100;
export const levelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 100) + 1);
export const xpProgressInLevel = (xp: number) => {
  const level = levelFromXp(xp);
  const base = (level - 1) * 100;
  return { current: xp - base, needed: 100, percent: ((xp - base) / 100) * 100 };
};

export const XP_AWARDS = {
  section_complete: 10,
  quiz_pass: 25,
  exam_pass: 100,
  module_complete: 150,
} as const;

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const useGamification = () => {
  const { user } = useAcademyAuth();
  const [data, setData] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data: row } = await supabase
      .from('academy_gamification')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (row) setData(row as any);
    else {
      const { data: inserted } = await supabase
        .from('academy_gamification')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (inserted) setData(inserted as any);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const awardXp = useCallback(
    async (eventType: keyof typeof XP_AWARDS, opts?: { module_id?: string; section_id?: string; xp?: number }) => {
      if (!user) return;
      const xp = opts?.xp ?? XP_AWARDS[eventType];
      const today = todayStr();

      // Streak calc
      const last = data?.last_activity_date;
      let newStreak = data?.current_streak ?? 0;
      if (!last) newStreak = 1;
      else {
        const diff = daysBetween(last, today);
        if (diff === 0) newStreak = newStreak || 1;
        else if (diff === 1) newStreak = newStreak + 1;
        else newStreak = 1;
      }
      const longest = Math.max(data?.longest_streak ?? 0, newStreak);
      const newXp = (data?.xp ?? 0) + xp;
      const newLevel = levelFromXp(newXp);

      const { data: updated } = await supabase
        .from('academy_gamification')
        .upsert({
          user_id: user.id,
          xp: newXp,
          level: newLevel,
          current_streak: newStreak,
          longest_streak: longest,
          last_activity_date: today,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      await supabase.from('academy_xp_events').insert({
        user_id: user.id,
        event_type: eventType,
        xp_awarded: xp,
        module_id: opts?.module_id,
        section_id: opts?.section_id,
      });

      if (updated) setData(updated as any);
      return { leveledUp: newLevel > (data?.level ?? 1), newLevel, xpGained: xp };
    },
    [user, data]
  );

  return { data, loading, awardXp, refetch: fetch };
};
