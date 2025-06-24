import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Zap,
  Brain,
  BarChart,
  Settings,
  Building2,
  Factory,
  Database,
  Search
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/app',
      active: location.pathname === '/app'
    },
    {
      icon: Zap,
      label: 'AESO Market',
      href: '/app/aeso-market',
      active: location.pathname === '/app/aeso-market'
    },
    {
      icon: Brain,
      label: 'Market Intelligence',
      href: '/app/aeso-intelligence',
      active: location.pathname === '/app/aeso-intelligence'
    },
    {
      icon: BarChart,
      label: 'Energy Rates',
      href: '/app/energy-rates',
      active: location.pathname === '/app/energy-rates'
    },
    {
      icon: Building2,
      label: 'Corporate Intelligence',
      href: '/app/corporate-intelligence',
      active: location.pathname === '/app/corporate-intelligence'
    },
    {
      icon: Search,
      label: 'Idle Industry Scanner',
      href: '/app/idle-industry-scanner',
      active: location.pathname === '/app/idle-industry-scanner'
    },
    {
      icon: Factory,
      label: 'Power Infrastructure',
      href: '/app/power-infrastructure',
      active: location.pathname === '/app/power-infrastructure'
    },
    {
      icon: Database,
      label: 'Data Management',
      href: '/app/data-management',
      active: location.pathname === '/app/data-management'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/app/settings',
      active: location.pathname === '/app/settings'
    },
  ];

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50">
          <SheetHeader className="mb-4">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through the application
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                  item.active ? "bg-gray-100 dark:bg-gray-700 font-medium" : "text-gray-600 dark:text-gray-400"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                VoltScout
              </h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 px-2">
          <div className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  item.active ? "bg-gray-100 dark:bg-gray-700 font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
