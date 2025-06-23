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
  HelpCircle
} from 'lucide-react';

export function Sidebar() {
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
      icon: Settings,
      label: 'Settings',
      href: '/app/settings',
      active: location.pathname === '/app/settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/app/help',
      active: location.pathname === '/app/help'
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="md:hidden absolute top-4 left-4 text-gray-500 hover:text-gray-800 cursor-pointer" />
      </SheetTrigger>
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
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                isActive ? "bg-gray-100 dark:bg-gray-700 font-medium" : "text-gray-600 dark:text-gray-400"
              )}
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
