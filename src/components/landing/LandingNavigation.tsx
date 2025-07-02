
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bitcoin } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';

export const LandingNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 sm:p-3 md:p-4 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 safe-area-pt">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <EnhancedLogo className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center">
            <span className="truncate">Watt</span>
            <Bitcoin className="inline w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 -mx-0.5 flex-shrink-0" style={{ color: '#f7af14' }} />
            <span className="truncate">yte</span>
          </h1>
          <p className="text-xs sm:text-sm truncate" style={{ color: '#00ff88' }}>Infrastructure Fund</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/voltmarket')}
          className="border-none hover:opacity-90 text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target"
          style={{ backgroundColor: '#6366f1' }}
        >
          <span className="hidden sm:inline">Launch </span>VoltMarket
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/app')}
          className="border-none hover:opacity-90 text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 touch-target"
          style={{ backgroundColor: '#f7af14' }}
        >
          <span className="hidden sm:inline">Launch </span>VoltScout
        </Button>
      </div>
    </nav>
  );
};
