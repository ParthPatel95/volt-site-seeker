
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building, 
  Search, 
  MapPin, 
  Database,
  Brain,
  Zap
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
import { ModeToggle } from './ModeToggle';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

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
    <aside className={`bg-secondary border-r border-muted w-60 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center justify-between p-4">
        <span className="font-bold text-xl">VoltScout</span>
        <Sheet>
          <SheetTrigger>
             {/* Settings Icon or Button */}
             ⚙️
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
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <nav className="p-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.label} className="mb-2 last:mb-0">
                <Link
                  to={item.path}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                    location.pathname === item.path ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
