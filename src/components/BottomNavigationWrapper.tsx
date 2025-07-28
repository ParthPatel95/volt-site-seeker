import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { useResponsiveNavigation } from '@/hooks/useResponsiveNavigation';
import { 
  Home, 
  Zap, 
  Building2, 
  Factory, 
  Database, 
  Brain,
  Bitcoin,
  Search,
  BarChart3,
  Activity,
  Bell,
  FileText,
  Users,
  Settings
} from 'lucide-react';

// Define navigation items with priorities for mobile
const navigationItems = [
  { id: 'dashboard', path: '/app', icon: Home, label: 'Dashboard', priority: 1 },
  { id: 'search', path: '/app/global-search', icon: Search, label: 'Search', priority: 2 },
  { id: 'power', path: '/app/power-infrastructure', icon: Factory, label: 'Power', priority: 3 },
  { id: 'btc', path: '/app/btc-roi-lab', icon: Bitcoin, label: 'BTC Lab', priority: 4 },
  { id: 'corporate', path: '/app/corporate-intelligence', icon: Building2, label: 'Corporate', priority: 5 },
  { id: 'analytics', path: '/app/advanced-analytics', icon: BarChart3, label: 'Analytics', priority: 6 },
  { id: 'energy', path: '/app/energy-rates', icon: Zap, label: 'Energy', priority: 7 },
  { id: 'industry', path: '/app/industry-intelligence', icon: Brain, label: 'Industry', priority: 8 },
  { id: 'notifications', path: '/app/notifications', icon: Bell, label: 'Alerts', priority: 9 },
  { id: 'documents', path: '/app/documents', icon: FileText, label: 'Docs', priority: 10 },
  { id: 'users', path: '/app/users', icon: Users, label: 'Users', priority: 11 },
  { id: 'realtime', path: '/app/realtime', icon: Activity, label: 'Live Data', priority: 12 },
  { id: 'settings', path: '/app/settings', icon: Settings, label: 'Settings', priority: 13 }
];

interface BottomNavigationWrapperProps {
  className?: string;
}

export function BottomNavigationWrapper({ className }: BottomNavigationWrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { visibleItems } = useResponsiveNavigation(navigationItems);

  // Convert navigation items to bottom navigation format
  const bottomNavItems = visibleItems.map(item => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    onClick: () => navigate(item.path || '/app'),
    active: location.pathname === (item.path || '/app')
  }));

  return (
    <BottomNavigation 
      items={bottomNavItems}
      className={className}
    />
  );
}