import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Bitcoin, GraduationCap, Menu, Server, Zap, Droplets, Users, TrendingUp, CircuitBoard, Volume2, Waves, Briefcase, ExternalLink } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';
import { GlobalUserMenu } from '@/components/GlobalUserMenu';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type PrimaryLink = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const PRIMARY_LINKS: PrimaryLink[] = [
  { to: '/advisory', label: 'Advisory', icon: Briefcase },
  { to: '/academy', label: 'Academy', icon: GraduationCap },
  { to: '/hosting', label: 'Hosting', icon: Zap },
];

export const LandingNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 safe-area-pt transition-all duration-200',
        'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70',
        scrolled ? 'border-b border-border shadow-subtle' : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-8 h-14 sm:h-16 lg:h-[68px]">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 min-w-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <EnhancedLogo className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0 transition-transform group-hover:scale-[1.03]" />
          <div className="min-w-0 leading-tight">
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-foreground flex items-center">
              <span>Watt</span>
              <Bitcoin className="inline w-4 h-4 sm:w-[18px] sm:h-[18px] -mx-0.5 flex-shrink-0 text-primary" />
              <span>yte</span>
            </h1>
            <p className="hidden sm:block text-[11px] lg:text-xs tracking-wide text-muted-foreground">
              Infrastructure Company
            </p>
          </div>
        </Link>

        {/* Desktop primary nav */}
        <div className="hidden lg:flex items-center gap-8">
          {PRIMARY_LINKS.map(({ to, label }) => {
            const active = isActive(to);
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={cn(
                  'relative text-sm font-medium tracking-tight transition-colors duration-150 py-1.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
                  'after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-primary after:origin-left after:transition-transform after:duration-200',
                  active
                    ? 'text-foreground after:scale-x-100'
                    : 'text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/app')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm px-3 sm:px-4 h-9 shadow-subtle"
          >
            VoltScout
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://www.gridbazaar.com', '_blank')}
            className="hidden sm:inline-flex h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-border hover:bg-secondary"
          >
            GridBazaar
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
          </Button>

          {isAuthenticated && (
            <div className="hidden sm:block">
              <GlobalUserMenu />
            </div>
          )}

          {/* Mobile / tablet menu trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0 text-foreground hover:bg-secondary"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm bg-background border-l border-border p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                  <EnhancedLogo className="w-9 h-9" />
                  <div className="leading-tight">
                    <p className="font-semibold text-foreground flex items-center text-base">
                      Watt<Bitcoin className="w-4 h-4 text-primary -mx-0.5" />yte
                    </p>
                    <p className="text-[11px] text-muted-foreground tracking-wide">Infrastructure Company</p>
                  </div>
                </div>

                {/* Links */}
                <div className="flex-1 overflow-y-auto py-3">
                  <div className="px-3 space-y-0.5">
                    {PRIMARY_LINKS.map(({ to, label, icon: Icon }) => {
                      const active = isActive(to);
                      return (
                        <button
                          key={to}
                          onClick={() => handleNavigate(to)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-left text-sm font-medium transition-colors',
                            active
                              ? 'bg-secondary text-foreground'
                              : 'text-foreground hover:bg-secondary'
                          )}
                        >
                          <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} />
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Learn */}
                  <div className="mt-5 px-3">
                    <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-[0.08em]">
                      Learn
                    </p>
                    <div className="space-y-0.5">
                      {[
                        { to: '/bitcoin', label: 'Bitcoin 101', icon: Bitcoin },
                        { to: '/datacenters', label: 'Datacenters 101', icon: Server },
                        { to: '/aeso-101', label: 'AESO 101', icon: Zap },
                        { to: '/hydro-datacenters', label: 'Hydro Datacenters 101', icon: Droplets },
                        { to: '/electrical-infrastructure', label: 'Electrical Infrastructure 101', icon: CircuitBoard },
                        { to: '/noise-management', label: 'Noise Management 101', icon: Volume2 },
                        { to: '/immersion-cooling', label: 'Immersion Cooling 101', icon: Waves },
                      ].map(({ to, label, icon: Icon }) => (
                        <button
                          key={to}
                          onClick={() => handleNavigate(to)}
                          className="w-full flex items-center gap-3 rounded-lg px-3 min-h-[40px] text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="mt-5 px-3">
                    <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-[0.08em]">
                      Company
                    </p>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => handleNavigate('/about')}
                        className="w-full flex items-center gap-3 rounded-lg px-3 min-h-[40px] text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        About Us
                      </button>
                      <button
                        onClick={() => handleNavigate('/wattfund')}
                        className="w-full flex items-center gap-3 rounded-lg px-3 min-h-[40px] text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" />
                        WattFund
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer CTAs */}
                <div className="p-4 border-t border-border space-y-2 bg-secondary/30">
                  <Button
                    onClick={() => handleNavigate('/app')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
                  >
                    VoltScout Platform
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExternalLink('https://www.gridbazaar.com')}
                    className="w-full font-semibold h-10 border-border hover:bg-background"
                  >
                    GridBazaar
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
