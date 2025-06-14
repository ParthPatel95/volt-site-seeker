
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2,
  Zap,
  Activity,
  TrendingUp
} from 'lucide-react';

interface PowerData {
  totalProperties: number;
  totalPowerCapacity: number;
  averageCapacity: number;
  highCapacityCount: number;
}

interface PowerOverviewCardsProps {
  powerData: PowerData;
}

export function PowerOverviewCards({ powerData }: PowerOverviewCardsProps) {
  const cards = [
    {
      title: "Total Properties",
      value: powerData.totalProperties.toLocaleString(),
      icon: Building2,
      color: "blue",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
      description: "Properties in portfolio"
    },
    {
      title: "Total Capacity", 
      value: `${powerData.totalPowerCapacity.toFixed(1)} MW`,
      icon: Zap,
      color: "yellow",
      bgColor: "bg-yellow-500",
      lightBg: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Combined power capacity"
    },
    {
      title: "Average Capacity",
      value: `${powerData.averageCapacity.toFixed(1)} MW`,
      icon: Activity,
      color: "green", 
      bgColor: "bg-green-500",
      lightBg: "bg-green-50 dark:bg-green-900/20",
      description: "Per property average"
    },
    {
      title: "High Capacity Sites",
      value: powerData.highCapacityCount.toLocaleString(),
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-500", 
      lightBg: "bg-purple-50 dark:bg-purple-900/20",
      description: "Properties over 20 MW"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.lightBg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {card.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {card.description}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {card.title}
              </h3>
              <div className={`h-2 ${card.lightBg} rounded-full overflow-hidden`}>
                <div 
                  className={`h-full ${card.bgColor} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((card.title.includes('Total') ? 100 : Math.random() * 80 + 20), 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
