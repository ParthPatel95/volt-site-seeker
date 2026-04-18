import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

export interface Note {
  id: string;
  module_id: string;
  section_id: string;
  content: string;
  updated_at: string;
}

export const useNotes = (moduleId: string) => {
  const { user } = useAcademyAuth();
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<Record<string, any>>({});

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('academy_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', moduleId);
    const map: Record<string, Note> = {};
    (data || []).forEach((n: any) => { map[n.section_id] = n; });
    setNotes(map);
    setLoading(false);
  }, [user, moduleId]);

  useEffect(() => { fetch(); }, [fetch]);

  const saveNote = useCallback((sectionId: string, content: string) => {
    if (!user) return;
    setNotes(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || { id: '', module_id: moduleId, section_id: sectionId, updated_at: '' }), content } as Note,
    }));
    clearTimeout(debounceRef.current[sectionId]);
    debounceRef.current[sectionId] = setTimeout(async () => {
      await supabase.from('academy_notes').upsert({
        user_id: user.id,
        module_id: moduleId,
        section_id: sectionId,
        content,
      }, { onConflict: 'user_id,module_id,section_id' });
    }, 700);
  }, [user, moduleId]);

  return { notes, loading, saveNote, refetch: fetch };
};
