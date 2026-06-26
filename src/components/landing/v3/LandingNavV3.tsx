import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Bitcoin, Menu, Server, Zap, Briefcase, GraduationCap, Users, TrendingUp } from 'lucide-react';
import { EnhancedLogo } from '../../EnhancedLogo';
import { GlobalUserMenu } from '@/components/GlobalUserMenu';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Light cinematic nav: transparent over the hero, solidifies to a white bar
// once you scroll past the first viewport. Slate text throughout.
export function LandingNavV3() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setAuthed(!!s?.user));
    return () => subscription.unsubscribe();
  }, []);

  const go = (p: string) => { navigate(p); setOpen(false); };

  const deskLink = 'hidden xl:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2';

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        solid ? 'bg-white/85 backdrop-blur-md border-b border-slate-200' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <EnhancedLogo className="h-9 w-9 flex-shrink-0 object-contain sm:h-10 sm:w-10" />
          <div className="leading-tight">
            <span className="flex items-center text-lg font-bold text-slate-900 sm:text-xl">
              Watt<Bitcoin className="-mx-0.5 h-4 w-4 text-watt-bitcoin sm:h-5 sm:w-5" />yte
            </span>
            <span className="text-[11px] text-slate-500">Infrastructure Company</span>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={() => navigate('/academy')} className={deskLink}><GraduationCap className="h-4 w-4" />Academy</button>
          <button onClick={() => navigate('/advisory')} className="hidden items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex"><Briefcase className="h-4 w-4" />Advisory</button>
          <button onClick={() => navigate('/hosting')} className={deskLink}><Zap className="h-4 w-4" />Hosting</button>

          <button
            onClick={() => navigate('/app')}
            className="ml-1 inline-flex items-center rounded-full bg-watt-bitcoin px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-watt-bitcoin/90"
          >
            VoltScout
          </button>
          <button
            onClick={() => window.open('https://www.gridbazaar.com', '_blank')}
            className="hidden items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:inline-flex"
          >
            GridBazaar
          </button>

          {authed && <div className="hidden sm:block"><GlobalUserMenu /></div>}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="ml-1 rounded-md p-2 text-slate-700 hover:bg-slate-100 xl:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-l border-slate-200 bg-white p-0 text-slate-900">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-slate-200 p-4">
                  <EnhancedLogo className="h-8 w-8" />
                  <span className="flex items-center font-bold">Watt<Bitcoin className="-mx-0.5 h-4 w-4 text-watt-bitcoin" />yte</span>
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto p-4">
                  {[
                    { p: '/advisory', icon: Briefcase, label: 'Advisory' },
                    { p: '/hosting', icon: Server, label: 'Hosting' },
                    { p: '/academy', icon: GraduationCap, label: 'Academy' },
                    { p: '/about', icon: Users, label: 'About Us' },
                    { p: '/wattfund', icon: TrendingUp, label: 'WattFund' },
                  ].map(({ p, icon: Icon, label }) => (
                    <button key={p} onClick={() => go(p)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
                      <Icon className="h-5 w-5" />{label}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 border-t border-slate-200 p-4">
                  <button onClick={() => go('/app')} className="w-full rounded-full bg-watt-bitcoin py-2.5 font-semibold text-white">VoltScout Platform</button>
                  <button onClick={() => { window.open('https://www.gridbazaar.com', '_blank'); setOpen(false); }} className="w-full rounded-full border border-slate-300 py-2.5 font-medium text-slate-700">GridBazaar</button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
