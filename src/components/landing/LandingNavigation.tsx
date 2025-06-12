
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bitcoin } from 'lucide-react';

export const LandingNavigation = () => {
  return (
    <nav className="relative z-50 flex items-center justify-between p-4 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-electric-blue via-electric-yellow to-neon-green rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-1 bg-slate-950 rounded-md flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-electric-blue">
              <path
                fill="currentColor"
                d="M13 0L6 12h5l-2 12 7-12h-5l2-12z"
              />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            Watt<Bitcoin className="inline w-6 h-6 mx-0" />yte
          </h1>
          <p className="text-xs text-slate-300">Infrastructure Fund</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <Link to="/voltscout" className="text-slate-200 hover:text-electric-blue transition-colors">
          VoltScout
        </Link>
        <Link to="/voltscout">
          <Button 
            variant="outline" 
            className="border-electric-blue/50 text-black hover:bg-electric-blue/10 hover:text-electric-blue bg-white"
          >
            Request Access
          </Button>
        </Link>
      </div>
    </nav>
  );
};
