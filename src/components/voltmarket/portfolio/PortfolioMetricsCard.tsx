import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface PortfolioMetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'slate';
  progress?: number;
  alert?: string;
}

export const PortfolioMetricsCard: React.FC<PortfolioMetricsCardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon,
  trend = 'neutral',
  color = 'slate',
  progress,
  alert
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800',
      blue: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800',
      purple: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800',
      orange: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800',
      red: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800',
      slate: 'from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800'
    };
    return colors[color as keyof typeof colors] || colors.slate;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <Card className={`bg-gradient-to-br ${getColorClasses(color)} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}>
      {alert && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${color === 'slate' ? 'text-slate-900 dark:text-slate-100' : `text-${color}-900 dark:text-${color}-100`}`}>
                {value}
              </span>
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className={`text-sm font-semibold ${getTrendColor()}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className={`text-xs ${color === 'slate' ? 'text-slate-500 dark:text-slate-400' : `text-${color}-600 dark:text-${color}-400`}`}>
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-full ${color === 'slate' ? 'bg-slate-200 dark:bg-slate-700' : `bg-${color}-200 dark:bg-${color}-800`}`}>
              {icon}
            </div>
          )}
        </div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {alert && (
          <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-950 rounded border-l-2 border-amber-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-700 dark:text-amber-300">{alert}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};