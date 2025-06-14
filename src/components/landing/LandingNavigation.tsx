
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bitcoin } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';

export const LandingNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="relative z-50 flex items-center justify-between p-3 sm:p-4 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <EnhancedLogo className="w-10 sm:w-12 h-10 sm:h-12 object-contain" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            Watt<Bitcoin className="inline w-5 sm:w-6 h-5 sm:h-6 -mx-0.5" style={{ color: '#f7af14' }} />yte
          </h1>
          <p className="text-xs" style={{ color: '#00ff88' }}>Infrastructure Fund</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-6">
        <Link to="/app" className="hidden sm:block text-slate-200 hover:text-electric-blue transition-colors">
          VoltScout
        </Link>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/app')}
          className="border-electric-blue/50 text-black hover:bg-electric-blue/10 hover:text-electric-blue bg-white text-sm sm:text-base px-3 sm:px-4"
        >
          Request Access
        </Button>
      </div>
    </nav>
  );
};
