
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building, 
  Search, 
  MapPin, 
  Database,
  Brain,
  Zap,
  LogOut
} from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ModeToggle } from './ModeToggle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EnhancedLogo } from './EnhancedLogo';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/landing');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/app/',
      description: 'Overview, analytics & alerts'
    },
    { 
      icon: Building, 
      label: 'Properties', 
      path: '/app/properties',
      description: 'Property portfolio management'
    },
    { 
      icon: Search, 
      label: 'Property Scraper', 
      path: '/app/scraper',
      description: 'Multi-source property discovery'
    },
    { 
      icon: Zap, 
      label: 'Energy Rates', 
      path: '/app/energy-rates',
      description: 'Real-time electricity pricing'
    },
    { 
      icon: Brain, 
      label: 'Corporate Intelligence', 
      path: '/app/corporate-intelligence',
      description: 'Company analysis and insights'
    },
    { 
      icon: MapPin, 
      label: 'Power Infrastructure', 
      path: '/app/power-infrastructure',
      description: 'Grid and transmission data'
    },
    { 
      icon: Database, 
      label: 'Data Management', 
      path: '/app/data-management',
      description: 'Import and export tools'
    }
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-secondary border-r border-muted flex flex-col transition-all duration-300 z-40 ${isCollapsed ? 'w-16' : 'w-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 min-h-[4rem]">
        <div className="flex items-center space-x-3">
          <EnhancedLogo className="w-10 h-10 object-contain flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-xl whitespace-nowrap">VoltScout</span>
          )}
        </div>
        {!isCollapsed && (
          <Sheet>
            <SheetTrigger className="flex-shrink-0">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer">
                ⚙️
              </div>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you're done.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Appearance
                  </Label>
                  <div className="col-span-3">
                    <ModeToggle />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Enable Notifications
                  </Label>
                  <div className="col-span-3">
                    <Switch id="notifications" />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      <Separator />
      
      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    location.pathname === item.path ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      
      {/* User Section */}
      {user && (
        <>
          <Separator />
          <div className="p-4 space-y-3">
            {!isCollapsed && (
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className={`w-full flex items-center justify-center ${isCollapsed ? 'px-2' : ''}`}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </>
      )}
      
      {/* Collapse Toggle */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center"
        >
          {isCollapsed ? '→' : '←'}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
