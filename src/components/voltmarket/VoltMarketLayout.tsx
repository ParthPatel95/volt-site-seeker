
import React from 'react';
import { VoltMarketAuthProvider } from '@/contexts/VoltMarketAuthContext';
import { VoltMarketNavigation } from './VoltMarketNavigation';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

interface VoltMarketLayoutProps {
  children: React.ReactNode;
}

const VoltMarketLayoutContent: React.FC<VoltMarketLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-watt-light/20 to-background">
      {/* New Unified Navigation */}
      <VoltMarketNavigation />

      {/* Main Content with mobile bottom navigation spacing */}
      <main className="pb-20 lg:pb-0">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-background border-t border-border/50 mt-12">
        <div className="container-responsive py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-watt-primary" />
                <span className="text-lg font-bold text-foreground">VoltMarket</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The premier marketplace for energy infrastructure assets, connecting buyers and sellers worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/voltmarket/listings" className="hover:text-watt-primary transition-colors">Browse Listings</Link></li>
                <li><Link to="/voltmarket/search" className="hover:text-watt-primary transition-colors">Advanced Search</Link></li>
                <li><Link to="/voltmarket/analytics" className="hover:text-watt-primary transition-colors">Market Analytics</Link></li>
                <li><Link to="/voltmarket/verification" className="hover:text-watt-primary transition-colors">Get Verified</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-watt-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-watt-primary transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-watt-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-watt-primary transition-colors">API Access</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-watt-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-watt-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-watt-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-watt-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © 2024 VoltMarket. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs bg-watt-success/10 text-watt-success border-watt-success/20">
                Real-time Enabled
              </Badge>
              <Badge variant="secondary" className="text-xs bg-watt-primary/10 text-watt-primary border-watt-primary/20">
                Enhanced Security
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const VoltMarketLayout: React.FC<VoltMarketLayoutProps> = ({ children }) => {
  return (
    <VoltMarketAuthProvider>
      <VoltMarketLayoutContent>
        {children}
      </VoltMarketLayoutContent>
    </VoltMarketAuthProvider>
  );
};
