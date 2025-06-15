
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Briefcase, MessageSquare } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  action: string;
  color: string;
}

export function QuickActionsGrid() {
  const quickActions: QuickAction[] = [
    { 
      title: "Analyze Company", 
      description: "AI-powered company analysis",
      icon: Building2, 
      action: "ai-analysis",
      color: "bg-blue-500"
    },
    { 
      title: "News Intelligence", 
      description: "Latest news and market insights",
      icon: FileText, 
      action: "news-intel",
      color: "bg-green-500"
    },
    { 
      title: "Portfolio Optimizer", 
      description: "Optimize investment portfolios",
      icon: Briefcase, 
      action: "portfolio",
      color: "bg-purple-500"
    },
    { 
      title: "Natural Language Query", 
      description: "Ask questions about your data",
      icon: MessageSquare, 
      action: "nlp-query",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {quickActions.map((action) => (
        <Card key={action.action} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">{action.title}</CardTitle>
                <CardDescription className="text-xs hidden sm:block">{action.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
