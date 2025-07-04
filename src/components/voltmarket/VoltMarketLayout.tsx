
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoltMarketAuthProvider, useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useVoltMarketRealtime } from '@/hooks/useVoltMarketRealtime';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Plus, 
  Heart,
  LogOut,
  Zap,
  Bell,
  Shield,
  BarChart3,
  Settings,
  SlidersHorizontal
} from 'lucide-react';

interface VoltMarketLayoutProps {
  children: React.ReactNode;
}

const VoltMarketLayoutContent: React.FC<VoltMarketLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useVoltMarketAuth();
  const { messages } = useVoltMarketRealtime();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/voltmarket');
  };

  // Count unread messages
  const unreadCount = messages.filter(m => !m.is_read && m.recipient_id === profile?.id).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/voltmarket/home" className="flex items-center gap-3 group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">VoltMarket</span>
                  <span className="text-xs text-blue-100 -mt-1">Energy Infrastructure Marketplace</span>
                </div>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/voltmarket/home" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link 
                to="/voltmarket/listings" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                <span className="font-medium">Browse</span>
              </Link>
              
              <Link 
                to="/voltmarket/search" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Advanced Search</span>
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/voltmarket/messages-enhanced" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Messages</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs min-w-[1.2rem] h-5 bg-red-500 text-white border-2 border-blue-600">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  
                  <Link 
                    to="/voltmarket/watchlist" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">Watchlist</span>
                  </Link>
                  
                  {profile?.role === 'seller' && (
                    <Link 
                      to="/voltmarket/create-listing" 
                      className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-all duration-200 ml-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Listing</span>
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/voltmarket/analytics">
                    <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-white/10">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  
                  <Link to="/voltmarket/verification">
                    <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-white/10">
                      <Shield className="w-4 h-4 mr-2" />
                      {profile?.is_id_verified ? (
                        <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-200 border-orange-200 text-xs">
                          Verify Now
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  <Link to="/voltmarket/dashboard">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Dashboard
                    </Button>
                  </Link>
                  
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <User className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {profile?.company_name || 'Profile'}
                    </span>
                    {profile?.is_id_verified && (
                      <Shield className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-blue-100 hover:text-white hover:bg-white/10">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/voltmarket/auth">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/voltmarket/auth">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-medium">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-blue-700/50 border-t border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-6 overflow-x-auto">
              <Link to="/voltmarket/home" className="flex flex-col items-center gap-1 min-w-0 text-blue-100 hover:text-white">
                <Home className="w-4 h-4" />
                <span className="text-xs">Home</span>
              </Link>
              <Link to="/voltmarket/listings" className="flex flex-col items-center gap-1 min-w-0 text-blue-100 hover:text-white">
                <Search className="w-4 h-4" />
                <span className="text-xs">Browse</span>
              </Link>
              {user && (
                <>
                  <Link to="/voltmarket/messages-enhanced" className="flex flex-col items-center gap-1 min-w-0 text-blue-100 hover:text-white relative">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Messages</span>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></div>
                    )}
                  </Link>
                  <Link to="/voltmarket/watchlist" className="flex flex-col items-center gap-1 min-w-0 text-blue-100 hover:text-white">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">Watchlist</span>
                  </Link>
                  <Link to="/voltmarket/dashboard" className="flex flex-col items-center gap-1 min-w-0 text-blue-100 hover:text-white">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Profile</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">VoltMarket</span>
              </div>
              <p className="text-gray-600 text-sm">
                The premier marketplace for energy infrastructure assets, connecting buyers and sellers worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/voltmarket/listings" className="hover:text-blue-600">Browse Listings</Link></li>
                <li><Link to="/voltmarket/search" className="hover:text-blue-600">Advanced Search</Link></li>
                <li><Link to="/voltmarket/analytics" className="hover:text-blue-600">Market Analytics</Link></li>
                <li><Link to="/voltmarket/verification" className="hover:text-blue-600">Get Verified</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600">API Access</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              © 2024 VoltMarket. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                Real-time Enabled
              </Badge>
              <Badge variant="secondary" className="text-xs">
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
