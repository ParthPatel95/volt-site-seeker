import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Bitcoin, GraduationCap, Menu, Home, Server, Zap, Droplets, Building2, Users, TrendingUp, CircuitBoard } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';

export const LandingNavigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 sm:p-3 md:p-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 safe-area-pt shadow-institutional">
      <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
        <EnhancedLogo className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-watt-navy flex items-center">
            <span className="truncate">Watt</span>
            <Bitcoin className="inline w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 -mx-0.5 flex-shrink-0 text-watt-bitcoin" />
            <span className="truncate">yte</span>
          </h1>
          <p className="text-xs sm:text-sm truncate text-watt-navy/60">Infrastructure Company</p>
        </div>
      </Link>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Desktop Navigation */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/academy')}
          className="text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-semibold hidden lg:flex items-center gap-1.5"
        >
          <GraduationCap className="h-4 w-4" />
          Academy
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/hosting')}
          className="text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-semibold hidden lg:flex"
        >
          Hosting
        </Button>
        
        {/* CTA Buttons - Always visible */}
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate('/app')}
          className="border-none hover:bg-watt-bitcoin/90 bg-watt-bitcoin text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target font-semibold"
        >
          VoltScout
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.gridbazaar.com', '_blank')}
          className="border-none hover:bg-watt-coinbase/90 bg-watt-coinbase text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target font-semibold hidden sm:flex"
        >
          GridBazaar
        </Button>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden p-2 text-watt-navy hover:bg-watt-bitcoin/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-white border-l border-gray-200 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <EnhancedLogo className="w-8 h-8" />
                  <span className="font-bold text-watt-navy flex items-center">
                    Watt<Bitcoin className="w-4 h-4 text-watt-bitcoin -mx-0.5" />yte
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Main Links */}
                <div className="px-4 space-y-1">
                  <button
                    onClick={() => handleNavigate('/academy')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-watt-navy hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left font-medium"
                  >
                    <GraduationCap className="h-5 w-5" />
                    Academy
                  </button>
                  <button
                    onClick={() => handleNavigate('/hosting')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-watt-navy hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left font-medium"
                  >
                    <Server className="h-5 w-5" />
                    Hosting
                  </button>
                </div>

                {/* Learn Section */}
                <div className="mt-4 px-4">
                  <p className="px-3 py-2 text-xs font-semibold text-watt-navy/50 uppercase tracking-wider">Learn</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('/bitcoin')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <Bitcoin className="h-4 w-4" />
                      Bitcoin 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/datacenters')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <Server className="h-4 w-4" />
                      Datacenters 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/aeso-101')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <Zap className="h-4 w-4" />
                      AESO 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/hydro-datacenters')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <Droplets className="h-4 w-4" />
                      Hydro Datacenters 101
                    </button>
                    <button
                      onClick={() => handleNavigate('/electrical-infrastructure')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <CircuitBoard className="h-4 w-4" />
                      Electrical Infrastructure 101
                    </button>
                  </div>
                </div>

                {/* Company Section */}
                <div className="mt-4 px-4">
                  <p className="px-3 py-2 text-xs font-semibold text-watt-navy/50 uppercase tracking-wider">Company</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('/about')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <Users className="h-4 w-4" />
                      About Us
                    </button>
                    <button
                      onClick={() => handleNavigate('/wattfund')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-watt-navy/80 hover:bg-watt-bitcoin/5 hover:text-watt-bitcoin transition-colors text-left text-sm"
                    >
                      <TrendingUp className="h-4 w-4" />
                      WattFund
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer CTAs */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                <Button 
                  onClick={() => handleNavigate('/app')}
                  className="w-full bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white font-semibold"
                >
                  VoltScout Platform
                </Button>
                <Button 
                  onClick={() => handleExternalLink('https://www.gridbazaar.com')}
                  className="w-full bg-watt-coinbase hover:bg-watt-coinbase/90 text-white font-semibold"
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
