import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Bitcoin, GraduationCap, Menu, Home, Server, Zap, Droplets, Building2, Users, TrendingUp, CircuitBoard, Volume2, Waves } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';
import { AcademyUserMenu } from '@/components/academy/AcademyUserMenu';
import { supabase } from '@/integrations/supabase/client';

export const LandingNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAcademyUser, setIsAcademyUser] = useState(false);

  // Check if user is authenticated for Academy pages
  const isAcademyRoute = location.pathname.startsWith('/academy') || 
    ['/bitcoin', '/aeso-101', '/datacenters', '/electrical-infrastructure', '/hydro-datacenters', 
     '/immersion-cooling', '/noise-management', '/mining-economics', '/operations', 
     '/strategic-operations', '/taxes-insurance', '/engineering-permitting'].includes(location.pathname);

  useEffect(() => {
    const checkAcademyAuth = async () => {
      if (!isAcademyRoute) {
        setIsAcademyUser(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setIsAcademyUser(!!session?.user);
    };
    
    checkAcademyAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (isAcademyRoute) {
        setIsAcademyUser(!!session?.user);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [isAcademyRoute]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 sm:p-3 md:p-4 bg-background/95 backdrop-blur-sm border-b border-border safe-area-pt shadow-subtle">
      <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
        <EnhancedLogo className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center">
            <span className="truncate">Watt</span>
            <Bitcoin className="inline w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 -mx-0.5 flex-shrink-0 text-primary" />
            <span className="truncate">yte</span>
          </h1>
          <p className="text-xs sm:text-sm truncate text-muted-foreground">Infrastructure Company</p>
        </div>
      </Link>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Desktop Navigation */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/academy')}
          className="text-foreground hover:text-primary hover:bg-primary/10 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-semibold hidden lg:flex items-center gap-1.5"
        >
          <GraduationCap className="h-4 w-4" />
          Academy
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/hosting')}
          className="text-foreground hover:text-primary hover:bg-primary/10 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-semibold hidden lg:flex items-center gap-1.5"
        >
          <Zap className="h-4 w-4" />
          Hosting
        </Button>
        
        {/* CTA Buttons - Always visible */}
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate('/app')}
          className="border-none hover:bg-primary/90 bg-primary text-primary-foreground text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target font-semibold"
        >
          VoltScout
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.gridbazaar.com', '_blank')}
          className="border-none hover:bg-[hsl(var(--watt-navy)/0.15)] bg-[hsl(var(--watt-navy)/0.1)] text-foreground text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target font-semibold hidden sm:flex"
        >
          GridBazaar
        </Button>

        {/* Academy User Menu - show when on academy routes and authenticated */}
        {isAcademyRoute && isAcademyUser && (
          <div className="hidden sm:block">
            <AcademyUserMenu />
          </div>
        )}

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden p-2 text-foreground hover:bg-muted/50"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background border-l border-border p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <EnhancedLogo className="w-8 h-8" />
                  <span className="font-bold text-foreground flex items-center">
                    Watt<Bitcoin className="w-4 h-4 text-primary -mx-0.5" />yte
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Main Links */}
                <div className="px-4 space-y-1">
                  <button
                    onClick={() => handleNavigate('/academy')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left font-medium"
                  >
                    <GraduationCap className="h-5 w-5" />
                    Academy
                  </button>
                  <button
                    onClick={() => handleNavigate('/hosting')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left font-medium"
                  >
                    <Server className="h-5 w-5" />
                    Hosting
                  </button>
                </div>

                {/* Learn Section */}
                <div className="mt-4 px-4">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Learn</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('/bitcoin')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Bitcoin className="h-4 w-4" />
                      Bitcoin 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/datacenters')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Server className="h-4 w-4" />
                      Datacenters 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/aeso-101')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Zap className="h-4 w-4" />
                      AESO 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/hydro-datacenters')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Droplets className="h-4 w-4" />
                      Hydro Datacenters 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/electrical-infrastructure')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <CircuitBoard className="h-4 w-4" />
                      Electrical Infrastructure 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/noise-management')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Volume2 className="h-4 w-4" />
                      Noise Management 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/immersion-cooling')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Waves className="h-4 w-4" />
                      Immersion Cooling 101
                    </button>
                  </div>
                </div>

                {/* Company Section */}
                <div className="mt-4 px-4">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Company</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('/about')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <Users className="h-4 w-4" />
                      About Us
                    </button>
                    <button
                      onClick={() => handleNavigate('/wattfund')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left text-sm"
                    >
                      <TrendingUp className="h-4 w-4" />
                      WattFund
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer CTAs */}
              <div className="p-4 border-t border-border space-y-2">
                <Button 
                  onClick={() => handleNavigate('/app')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  VoltScout Platform
                </Button>
                <Button 
                  onClick={() => handleExternalLink('https://www.gridbazaar.com')}
                  className="w-full border-none bg-[hsl(var(--watt-navy)/0.1)] hover:bg-[hsl(var(--watt-navy)/0.15)] text-foreground font-semibold"
                >
                  GridBazaar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
