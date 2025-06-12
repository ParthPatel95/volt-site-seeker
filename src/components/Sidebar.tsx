
import { 
  Home, 
  Map, 
  Building, 
  Bell, 
  Zap, 
  Database,
  BarChart3,
  Settings
} from 'lucide-react';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard"
  },
  {
    title: "Discovery Map",
    icon: Map,
    id: "map"
  },
  {
    title: "Properties",
    icon: Building,
    id: "properties"
  },
  {
    title: "Alerts",
    icon: Bell,
    id: "alerts"
  },
];

const analyticsItems = [
  {
    title: "VoltScore Analytics",
    icon: BarChart3,
    id: "analytics"
  },
  {
    title: "Power Infrastructure",
    icon: Zap,
    id: "infrastructure"
  },
  {
    title: "Data Management",
    icon: Database,
    id: "data"
  },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <SidebarContainer className="border-r border-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              VoltScout
            </h1>
            <p className="text-xs text-muted-foreground">Heavy Power Discovery</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core Discovery</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics & AI</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContainer>
  );
}
