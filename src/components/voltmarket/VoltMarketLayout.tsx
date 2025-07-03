
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
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

export const VoltMarketLayout: React.FC<VoltMarketLayoutProps> = ({ children }) => {
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/voltmarket/home" className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">VoltMarket</span>
                <Badge variant="secondary" className="text-xs">Enhanced</Badge>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/voltmarket/home" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              
              <Link 
                to="/voltmarket/listings" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Search className="w-4 h-4" />
                Browse
              </Link>
              
              <Link 
                to="/voltmarket/search" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Search
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/voltmarket/messages-enhanced" 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs min-w-[1.2rem] h-5">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  
                  <Link 
                    to="/voltmarket/notifications" 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Link>
                  
                  <Link 
                    to="/voltmarket/watchlist" 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Watchlist
                  </Link>
                  
                  {profile?.role === 'seller' && (
                    <Link 
                      to="/voltmarket/create-listing" 
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Listing
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/voltmarket/analytics">
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  
                  <Link to="/voltmarket/verification">
                    <Button variant="ghost" size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Verify
                      {!profile?.is_id_verified && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Incomplete
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  <Link to="/voltmarket/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  
                  <Link to="/voltmarket/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {profile?.company_name || 'Profile'}
                      {profile?.is_id_verified && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">
                          Verified
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/voltmarket/auth">
                  <Button>Sign In</Button>
                </Link>
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
