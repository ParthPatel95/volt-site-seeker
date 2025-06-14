
import { Bitcoin } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="relative z-10 py-8 px-6 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <img 
            src="/lovable-uploads/efd12727-2519-4372-a17f-7cf24282f3bf.png" 
            alt="VoltScout Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-2xl font-bold text-white flex items-center">
            Watt<Bitcoin className="inline w-6 h-6 -mx-0.5" />yte
          </span>
        </div>
        <p className="text-slate-300 mb-3 text-sm">
          Turning power into profit through intelligent infrastructure investment
        </p>
        <p className="text-slate-400 text-xs">
          © 2024 WattByte Infrastructure Fund. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
