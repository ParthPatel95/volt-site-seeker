
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bitcoin, ChevronDown, BookOpen, Server, Zap, Droplets } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LandingNavigation = () => {
  const navigate = useNavigate();

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-semibold hidden lg:flex items-center gap-1"
            >
              Learn
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
            <DropdownMenuItem 
              onClick={() => navigate('/bitcoin')}
              className="cursor-pointer flex items-center gap-2 text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5"
            >
              <BookOpen className="h-4 w-4" />
              Bitcoin 101
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/aeso-101')}
              className="cursor-pointer flex items-center gap-2 text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5"
            >
              <Zap className="h-4 w-4" />
              AESO 101
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/datacenters')}
              className="cursor-pointer flex items-center gap-2 text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5"
            >
              <Server className="h-4 w-4" />
              Datacenters 101
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/hydro-datacenters')}
              className="cursor-pointer flex items-center gap-2 text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5"
            >
              <Droplets className="h-4 w-4" />
              Hydro Datacenters 101
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/hosting')}
          className="text-watt-navy hover:text-watt-bitcoin hover:bg-watt-bitcoin/5 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-semibold hidden sm:flex"
        >
          Hosting
        </Button>
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
          className="border-none hover:bg-watt-coinbase/90 bg-watt-coinbase text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target font-semibold"
        >
          GridBazaar
        </Button>
      </div>
    </nav>
  );
};
