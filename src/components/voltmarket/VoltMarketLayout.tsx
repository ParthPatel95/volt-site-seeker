
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Plus, 
  Heart,
  LogOut,
  Zap
} from 'lucide-react';

interface VoltMarketLayoutProps {
  children: React.ReactNode;
}

export const VoltMarketLayout: React.FC<VoltMarketLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useVoltMarketAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/voltmarket');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/voltmarket/home" className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">VoltMarket</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/voltmarket/home" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                to="/voltmarket/listings" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Search className="w-4 h-4" />
                Browse
              </Link>
              {user && (
                <>
                  <Link 
                    to="/voltmarket/messages" 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </Link>
                  <Link 
                    to="/voltmarket/watchlist" 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <Heart className="w-4 h-4" />
                    Watchlist
                  </Link>
                  {profile?.role === 'seller' && (
                    <Link 
                      to="/voltmarket/create-listing" 
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
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
                <div className="flex items-center gap-4">
                  <Link to="/voltmarket/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Link to="/voltmarket/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {profile?.company_name || 'Profile'}
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
    </div>
  );
};
