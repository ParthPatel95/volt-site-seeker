import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  SlidersHorizontal,
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
  Bell,
  ChevronDown,
  Building2,
  TrendingUp
} from 'lucide-react';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useVoltMarketRealtime } from '@/hooks/useVoltMarketRealtime';

export const VoltMarketNavigation: React.FC = () => {
  const { user, profile, signOut } = useVoltMarketAuth();
  const { messages } = useVoltMarketRealtime();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Count unread messages
  const unreadCount = messages.filter(m => !m.is_read && m.recipient_id === profile?.id).length;

  // Get user initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'U';
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/voltmarket/listings?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
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

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/voltmarket/home', icon: Home },
    { name: 'Browse', path: '/voltmarket/listings', icon: Search },
    { name: 'Advanced Search', path: '/voltmarket/search', icon: SlidersHorizontal },
  ];

  const userNavItems = user ? [
    { name: 'Messages', path: '/voltmarket/messages-enhanced', icon: MessageSquare, badge: unreadCount },
    { name: 'Watchlist', path: '/voltmarket/watchlist', icon: Heart },
    { name: 'Analytics', path: '/voltmarket/analytics', icon: BarChart3 },
  ] : [];

  return (
    <>
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-watt-primary/10 shadow-sm">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
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

            {/* Enhanced Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search power assets, locations, mining facilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="pl-12 pr-4 h-11 bg-muted/50 border-2 border-transparent focus:border-watt-primary/30 focus:bg-background transition-all duration-300 rounded-xl"
                  />
                  {searchQuery && (
                    <Button 
                      type="submit"
                      size="sm" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-watt-gradient hover:opacity-90 text-white rounded-lg px-4"
                    >
                      Search
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Primary Navigation */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'text-watt-primary bg-watt-primary/10 shadow-sm' 
                        : 'text-muted-foreground hover:text-watt-primary hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Link>
                );
              })}

              {/* User Navigation */}
              {userNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'text-watt-primary bg-watt-primary/10 shadow-sm' 
                        : 'text-muted-foreground hover:text-watt-primary hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                    {item.badge > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-watt-warning text-white text-xs min-w-[1.2rem] h-5 border-2 border-background">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Verification Status */}
                  <div className="hidden md:flex items-center">
                    {profile?.is_id_verified ? (
                      <Badge className="bg-watt-success/10 text-watt-success border-watt-success/20">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Link to="/voltmarket/verification">
                        <Badge className="bg-watt-warning/10 text-watt-warning border-watt-warning/20 hover:bg-watt-warning/20 transition-colors cursor-pointer">
                          <Shield className="w-3 h-3 mr-1" />
                          Verify ID
                        </Badge>
                      </Link>
                    )}
                  </div>

                  {/* Create Listing CTA */}
                  {profile?.role === 'seller' && (
                    <Link to="/voltmarket/create-listing">
                      <Button className="bg-watt-gradient hover:opacity-90 text-white shadow-lg hover:scale-105 transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Create Listing</span>
                        <span className="sm:hidden">List</span>
                      </Button>
                    </Link>
                  )}

                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-xl transition-all duration-200">
                        <div className="w-8 h-8 bg-watt-gradient rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(profile?.company_name || 'User')}
                        </div>
                        <div className="hidden sm:block text-left">
                          <div className="text-sm font-medium">
                            {profile?.company_name || 'Profile'}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="capitalize">{profile?.role}</span>
                            {profile?.is_id_verified && (
                              <Shield className="w-3 h-3 text-watt-success" />
                            )}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-background border border-border/50 shadow-lg">
                      <div className="p-3 border-b border-border/50">
                        <div className="font-medium">{profile?.company_name || 'User'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/voltmarket/dashboard" className="flex items-center gap-3 cursor-pointer">
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/voltmarket/profile" className="flex items-center gap-3 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/voltmarket/analytics" className="flex items-center gap-3 cursor-pointer">
                          <BarChart3 className="w-4 h-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/voltmarket/auth">
                    <Button variant="ghost" className="text-muted-foreground hover:text-watt-primary">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/voltmarket/auth">
                    <Button className="bg-watt-gradient hover:opacity-90 text-white shadow-lg">
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

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-muted/50 border-transparent focus:border-watt-primary/30 rounded-xl"
              />
            </form>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="space-y-2">
                {/* Primary Navigation */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive 
                          ? 'text-watt-primary bg-watt-primary/10' 
                          : 'text-muted-foreground hover:text-watt-primary hover:bg-muted/50'
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