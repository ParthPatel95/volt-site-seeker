
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
      textColor: "text-blue-600 dark:text-blue-400",
      description: "Properties in portfolio"
    },
    {
      title: "Total Capacity", 
      value: `${powerData.totalPowerCapacity.toFixed(1)} MW`,
      icon: Zap,
      color: "yellow",
      bgColor: "bg-yellow-500",
      lightBg: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      description: "Combined power capacity"
    },
    {
      title: "Average Capacity",
      value: `${powerData.averageCapacity.toFixed(1)} MW`,
      icon: Activity,
      color: "green", 
      bgColor: "bg-green-500",
      lightBg: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      description: "Per property average"
    },
    {
      title: "High Capacity Sites",
      value: powerData.highCapacityCount.toLocaleString(),
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-500", 
      lightBg: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      description: "Properties over 20 MW"
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.lightBg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.textColor}`} />
                </div>
                <div className="text-right min-w-0 flex-1 ml-3">
                  <div className={`text-xl sm:text-2xl font-bold ${card.textColor} mb-1 break-words`}>
                    {card.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-tight">
                    {card.description}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-300 truncate">
                  {card.title}
                </h3>
                <div className={`h-2 ${card.lightBg} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${card.bgColor} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min((index + 1) * 25, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
