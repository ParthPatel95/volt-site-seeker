import { Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLogo } from '@/components/EnhancedLogo';

export const LegalPageHeader = () => {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <EnhancedLogo className="w-7 h-7 object-contain" />
          <span className="text-xl font-bold text-foreground flex items-center">
            Watt<Bitcoin className="inline w-5 h-5 -mx-0.5 text-watt-bitcoin" />yte
          </span>
        </Link>
      </div>
    </header>
  );
};
