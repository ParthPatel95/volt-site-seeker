import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GraduationCap, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const GlobalUserMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userInitials, setUserInitials] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserInitials(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserInitials(session.user.id);
      } else {
        setUserInitials('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserInitials = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('academy_users')
        .select('full_name, email')
        .eq('user_id', userId)
        .single();

      if (data) {
        const name = data.full_name || data.email || '';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials || 'U');
      }
    } catch {
      setUserInitials('U');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate('/academy')} className="cursor-pointer">
          <GraduationCap className="mr-2 h-4 w-4" />
          Academy Home
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/academy/learning')} className="cursor-pointer">
          <BookOpen className="mr-2 h-4 w-4" />
          My Learning
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/academy/progress')} className="cursor-pointer">
          <BarChart3 className="mr-2 h-4 w-4" />
          My Progress
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
