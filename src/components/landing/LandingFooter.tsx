
import { Bitcoin } from 'lucide-react';
import { EnhancedLogo } from '../EnhancedLogo';

export const LandingFooter = () => {
  return (
    <footer className="relative z-10 py-8 px-6 bg-watt-navy border-t border-watt-navy/20">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <EnhancedLogo className="w-8 h-8 object-contain" />
          <span className="text-2xl font-bold text-white flex items-center">
            Watt<Bitcoin className="inline w-6 h-6 -mx-0.5 text-watt-bitcoin" />yte
          </span>
        </div>
        <p className="text-white/70 mb-3 text-sm">
          Turning power into profit through intelligent infrastructure investment
        </p>
        <p className="text-white/50 text-xs">
          © 2024 WattByte Infrastructure Company. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
