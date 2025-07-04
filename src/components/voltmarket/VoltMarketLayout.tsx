
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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/voltmarket');
  };

  // Count unread messages
  const unreadCount = messages.filter(m => !m.is_read && m.recipient_id === profile?.id).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Elegant Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <Link to="/voltmarket/home" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                    VoltMarket
                  </span>
                  <span className="text-xs text-slate-500 -mt-1">Energy Infrastructure Marketplace</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/voltmarket/home" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <Link 
                to="/voltmarket/listings" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <Search className="w-4 h-4" />
                <span>Browse</span>
              </Link>
              
              <Link 
                to="/voltmarket/search" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Advanced Search</span>
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/voltmarket/messages-enhanced" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium relative"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs min-w-[1.2rem] h-5 bg-red-500 text-white border-2 border-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  
                  <Link 
                    to="/voltmarket/watchlist" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Watchlist</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Quick Actions */}
                  <div className="hidden md:flex items-center gap-2">
                    <Link to="/voltmarket/analytics">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-700 hover:bg-blue-50">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    
                    <Link to="/voltmarket/verification">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-700 hover:bg-blue-50">
                        <Shield className="w-4 h-4 mr-2" />
                        {profile?.is_id_verified ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 text-xs">
                            Verify ID
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </div>

                  {/* Create Listing Button */}
                  {profile?.role === 'seller' && (
                    <Link to="/voltmarket/create-listing">
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Listing
                      </Button>
                    </Link>
                  )}
                  
                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(profile?.company_name || 'User')}
                        </div>
                        <div className="hidden sm:block text-left">
                          <div className="text-sm font-medium text-slate-900">
                            {profile?.company_name || 'Profile'}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="capitalize">{profile?.role}</span>
                            {profile?.is_id_verified && (
                              <Shield className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-3 border-b border-slate-100">
                        <div className="font-medium text-slate-900">{profile?.company_name || 'User'}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                      <div className="p-1">
                        <Link 
                          to="/voltmarket/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link 
                          to="/voltmarket/profile"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        <Link 
                          to="/voltmarket/verification"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Verification
                        </Link>
                        <hr className="my-1" />
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/voltmarket/auth">
                    <Button variant="ghost" className="text-slate-600 hover:text-blue-700 hover:bg-blue-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/voltmarket/auth">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white/90 backdrop-blur-sm border-t border-blue-100/50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-around">
              <Link to="/voltmarket/home" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors">
                <Home className="w-5 h-5" />
                <span className="text-xs font-medium">Home</span>
              </Link>
              <Link to="/voltmarket/listings" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors">
                <Search className="w-5 h-5" />
                <span className="text-xs font-medium">Browse</span>
              </Link>
              {user && (
                <>
                  <Link to="/voltmarket/messages-enhanced" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors relative">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-medium">Messages</span>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </Link>
                  <Link to="/voltmarket/watchlist" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs font-medium">Watchlist</span>
                  </Link>
                  <Link to="/voltmarket/dashboard" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-xs font-medium">Profile</span>
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
