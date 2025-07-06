import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home,
  Search, 
  MessageSquare, 
  Heart,
  User, 
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  Zap,
  Shield,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useVoltMarketRealtime } from '@/hooks/useVoltMarketRealtime';

export const VoltMarketNavigation: React.FC = () => {
  const { user, profile, signOut } = useVoltMarketAuth();
  const { messages } = useVoltMarketRealtime();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Count unread messages
  const unreadCount = messages.filter(m => !m.is_read && m.recipient_id === profile?.id).length;

  // Get user initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'U';
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/voltmarket');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Check if route is active
  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Simplified navigation items for elegance
  const primaryNavItems = [
    { name: 'Browse', path: '/voltmarket/listings', icon: Search },
  ];

  const userNavItems = user ? [
    { name: 'Messages', path: '/voltmarket/messages-enhanced', icon: MessageSquare, badge: unreadCount },
  ] : [];

  return (
    <>
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-watt-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand - Fixed Width */}
            <div className="w-64 flex-shrink-0">
              <Link to="/voltmarket/home" className="flex items-center gap-3 group">
                <div className="p-2 bg-watt-gradient rounded-xl group-hover:shadow-watt-glow transition-all duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-watt-primary to-watt-secondary bg-clip-text text-transparent">
                    VoltMarket
                  </span>
                  <span className="text-xs text-muted-foreground -mt-1">Energy Infrastructure Marketplace</span>
                </div>
                <span className="sm:hidden text-xl font-bold text-watt-primary">VM</span>
              </Link>
            </div>

            {/* Right-aligned Navigation */}
            <div className="hidden lg:flex items-center justify-end flex-1 mr-4">
              <nav className="flex items-center gap-1">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'text-watt-primary bg-watt-primary/5' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {userNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'text-watt-primary bg-watt-primary/5' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-watt-warning text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions - Fixed Width */}
            <div className="w-64 flex items-center justify-end gap-3 flex-shrink-0">
              {user ? (
                <>
                  {/* Create Listing CTA - Simplified */}
                  {profile?.role === 'seller' && (
                    <Link to="/voltmarket/create-listing">
                      <Button size="sm" className="bg-watt-gradient hover:opacity-90 text-white shadow-sm">
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">List</span>
                      </Button>
                    </Link>
                  )}

                  {/* Elegant User Profile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 p-1 hover:bg-muted/50 rounded-full">
                        <div className="w-8 h-8 bg-watt-gradient rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(profile?.company_name || 'User')}
                        </div>
                        <div className="hidden lg:block text-left">
                          <div className="text-sm font-medium leading-none">
                            {profile?.company_name?.split(' ')[0] || 'User'}
                          </div>
                          {profile?.is_id_verified && (
                            <div className="text-xs text-watt-success mt-0.5">Verified</div>
                          )}
                        </div>
                        <ChevronDown className="w-3 h-3 text-muted-foreground hidden lg:block" />
                      </Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48">
                       <div className="p-3 border-b">
                         <div className="font-medium text-sm">{profile?.company_name || 'User'}</div>
                         <div className="text-xs text-muted-foreground">{user.email}</div>
                       </div>
                       <DropdownMenuItem asChild>
                         <Link to="/voltmarket/dashboard" className="cursor-pointer">
                           <User className="w-4 h-4 mr-2" />
                           Dashboard
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link to="/voltmarket/verification" className="cursor-pointer">
                           <Shield className="w-4 h-4 mr-2" />
                           {profile?.is_id_verified ? 'Verified' : 'Get Verified'}
                           {profile?.is_id_verified && (
                             <Badge className="ml-auto bg-watt-success/10 text-watt-success border-watt-success/20 text-xs">
                               ✓
                             </Badge>
                           )}
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link to="/voltmarket/watchlist" className="cursor-pointer">
                           <Heart className="w-4 h-4 mr-2" />
                           Watchlist
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem asChild>
                         <Link to="/voltmarket/analytics" className="cursor-pointer">
                           <BarChart3 className="w-4 h-4 mr-2" />
                           Analytics
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link to="/voltmarket/profile" className="cursor-pointer">
                           <Settings className="w-4 h-4 mr-2" />
                           Settings
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                         <LogOut className="w-4 h-4 mr-2" />
                         Sign Out
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/voltmarket/auth">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-watt-primary">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/voltmarket/auth">
                    <Button size="sm" className="bg-watt-gradient hover:opacity-90 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="space-y-2">
                {/* Primary Navigation */}
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive 
                          ? 'text-watt-primary bg-watt-primary/5' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* User Navigation */}
                {user && (
                  <>
                    <div className="border-t border-border/50 my-2 pt-2">
                      {userNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.path);
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                              isActive 
                                ? 'text-watt-primary bg-watt-primary/10' 
                                : 'text-muted-foreground hover:text-watt-primary hover:bg-muted/50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {item.name}
                            {item.badge > 0 && (
                              <Badge className="ml-auto bg-watt-warning text-white text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    {profile?.role === 'seller' && (
                      <Link to="/voltmarket/create-listing">
                        <Button className="w-full bg-watt-gradient hover:opacity-90 text-white mb-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Listing
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-pb">
          <div className="grid grid-cols-5 gap-1 p-2">
            <Link
              to="/voltmarket/home"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl touch-target transition-all duration-200 ${
                isActiveRoute('/voltmarket/home') 
                  ? 'text-watt-primary bg-watt-primary/10' 
                  : 'text-muted-foreground hover:text-watt-primary'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>

            <Link
              to="/voltmarket/listings"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl touch-target transition-all duration-200 ${
                isActiveRoute('/voltmarket/listings') 
                  ? 'text-watt-primary bg-watt-primary/10' 
                  : 'text-muted-foreground hover:text-watt-primary'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs font-medium">Browse</span>
            </Link>

            <Link
              to="/voltmarket/messages-enhanced"
              className={`relative flex flex-col items-center gap-1 p-3 rounded-xl touch-target transition-all duration-200 ${
                isActiveRoute('/voltmarket/messages-enhanced') 
                  ? 'text-watt-primary bg-watt-primary/10' 
                  : 'text-muted-foreground hover:text-watt-primary'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Messages</span>
              {unreadCount > 0 && (
                <div className="absolute top-1 right-2 w-4 h-4 bg-watt-warning rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </Link>

            <Link
              to="/voltmarket/watchlist"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl touch-target transition-all duration-200 ${
                isActiveRoute('/voltmarket/watchlist') 
                  ? 'text-watt-primary bg-watt-primary/10' 
                  : 'text-muted-foreground hover:text-watt-primary'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs font-medium">Watchlist</span>
            </Link>

            <Link
              to="/voltmarket/dashboard"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl touch-target transition-all duration-200 ${
                isActiveRoute('/voltmarket/dashboard') 
                  ? 'text-watt-primary bg-watt-primary/10' 
                  : 'text-muted-foreground hover:text-watt-primary'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};