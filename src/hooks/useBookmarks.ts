import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

export interface Bookmark {
  id: string;
  module_id: string;
  section_id: string | null;
  label: string | null;
  created_at: string;
}

export const useBookmarks = (moduleId?: string) => {
  const { user } = useAcademyAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    let q = supabase.from('academy_bookmarks').select('*').eq('user_id', user.id);
    if (moduleId) q = q.eq('module_id', moduleId);
    const { data } = await q.order('created_at', { ascending: false });
    setBookmarks((data as any) || []);
    setLoading(false);
  }, [user, moduleId]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = useCallback(async (mId: string, sId: string | null, label?: string) => {
    if (!user) return;
    const existing = bookmarks.find(b => b.module_id === mId && b.section_id === sId);
    if (existing) {
      await supabase.from('academy_bookmarks').delete().eq('id', existing.id);
    } else {
      await supabase.from('academy_bookmarks').insert({
        user_id: user.id, module_id: mId, section_id: sId, label
      });
    }
    fetch();
  }, [user, bookmarks, fetch]);

  const isBookmarked = useCallback(
    (mId: string, sId: string | null) =>
      bookmarks.some(b => b.module_id === mId && b.section_id === sId),
    [bookmarks]
  );

  return { bookmarks, loading, toggle, isBookmarked, refetch: fetch };
};
