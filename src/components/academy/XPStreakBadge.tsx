import { Flame, Zap } from 'lucide-react';
import { useGamification, xpProgressInLevel } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

export const XPStreakBadge = ({ className }: { className?: string }) => {
  const { data, loading } = useGamification();
  if (loading || !data) return null;
  const prog = xpProgressInLevel(data.xp);
  return (
    <div className={cn('hidden md:flex items-center gap-3 text-xs', className)}>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Flame className="w-3.5 h-3.5" />
        <span className="font-semibold">{data.current_streak}</span>
        <span className="text-muted-foreground hidden lg:inline">day streak</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary">
        <Zap className="w-3.5 h-3.5" />
        <span className="font-semibold">Lv {data.level}</span>
        <div className="w-12 h-1 rounded-full bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${prog.percent}%` }} />
        </div>
      </div>
    </div>
  );
};
