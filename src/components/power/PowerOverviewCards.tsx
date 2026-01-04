
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2,
  Zap,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PowerData {
  totalSubstations: number;
  totalCapacity: number;
  averageCapacity: number;
  highCapacityCount: number;
}

interface PowerOverviewCardsProps {
  powerData?: PowerData;
}

export function PowerOverviewCards({ powerData: externalPowerData }: PowerOverviewCardsProps) {
  const [realPowerData, setRealPowerData] = useState<PowerData>({
    totalSubstations: 0,
    totalCapacity: 0,
    averageCapacity: 0,
    highCapacityCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealSubstationData();
  }, []);

  const loadRealSubstationData = async () => {
    try {
      const { data: substations, error } = await supabase
        .from('substations')
        .select('capacity_mva')
        .eq('status', 'active');

      if (error) throw error;

      if (substations && substations.length > 0) {
        const totalSubstations = substations.length;
        const totalCapacity = substations.reduce((sum, sub) => sum + (sub.capacity_mva || 0), 0);
        const averageCapacity = totalCapacity / totalSubstations;
        const highCapacityCount = substations.filter(sub => (sub.capacity_mva || 0) > 100).length;

        setRealPowerData({
          totalSubstations,
          totalCapacity: Math.round(totalCapacity),
          averageCapacity: Math.round(averageCapacity * 10) / 10,
          highCapacityCount
        });
      }
    } catch (error) {
      console.error('Error loading substation data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use real data from database instead of external data
  const powerData = realPowerData;

  const cards = [
    {
      title: "Total Substations",
      value: loading ? "Loading..." : powerData.totalSubstations.toLocaleString(),
      icon: Building2,
      color: "blue",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      description: "Active substations tracked"
    },
    {
      title: "Total Capacity", 
      value: loading ? "Loading..." : `${powerData.totalCapacity.toFixed(0)} MVA`,
      icon: Zap,
      color: "yellow",
      bgColor: "bg-yellow-500",
      lightBg: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      description: "Combined transformer capacity"
    },
    {
      title: "Average Capacity",
      value: loading ? "Loading..." : `${powerData.averageCapacity.toFixed(1)} MVA`,
      icon: Activity,
      color: "green", 
      bgColor: "bg-green-500",
      lightBg: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      description: "Per substation average"
    },
    {
      title: "High Capacity Sites",
      value: loading ? "Loading..." : powerData.highCapacityCount.toLocaleString(),
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-500", 
      lightBg: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      description: "Substations over 100 MVA"
    }
  ];

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card overflow-hidden">
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
                    style={{ width: powerData.totalSubstations > 0 ? `${Math.min((index + 1) * 25, 100)}%` : '0%' }}
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
