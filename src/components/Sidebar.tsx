
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Map,
  Building,
  Bell,
  Zap,
  Database,
  TrendingUp,
  Search,
  Globe,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Property Map', icon: Map },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'corporate-intelligence', label: 'Corporate Intel', icon: TrendingUp },
    { id: 'multi-scraper', label: 'Multi-Source Scraper', icon: Globe },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'infrastructure', label: 'Power Infrastructure', icon: Zap },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-white">
              <path
                fill="currentColor"
                d="M13 0L6 12h5l-2 12 7-12h-5l2-12z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">VoltScout</h1>
            <p className="text-xs text-muted-foreground">Intelligence Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeView === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border space-y-2">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
