import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Building2, 
  Target, 
  Award,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  Gauge
} from 'lucide-react';
import { format, addHours, startOfHour, differenceInSeconds } from 'date-fns';

interface ChartSidebarProps {
  currentPrice: number;
  stats: {
    open: number;
    high: number;
    low: number;
    close: number;
    avg: number;
    volatility: number;
    volume: number;
    changePercent: number;
  };
  aesoForecast?: number;
  aiPrediction?: number;
  aiConfidence?: number;
  loading?: boolean;
  aiLoading?: boolean;
  historicalAccuracy?: number;
}

export function ChartSidebar({
  currentPrice,
  stats,
  aesoForecast,
  aiPrediction,
  aiConfidence = 0.85,
  loading = false,
  aiLoading = false,
  historicalAccuracy = 87
}: ChartSidebarProps) {
  const [countdown, setCountdown] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    predictions: true,
    stats: true
  });

  const nextHour = useMemo(() => {
    const now = new Date();
    return startOfHour(addHours(now, 1));
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const seconds = differenceInSeconds(nextHour, now);
      setCountdown(Math.max(0, seconds));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextHour]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPredictionDiff = (prediction?: number) => {
    if (!prediction || !currentPrice) return null;
    const diff = prediction - currentPrice;
    const percent = currentPrice !== 0 ? (diff / currentPrice) * 100 : 0;
    return { diff, percent, isUp: diff >= 0 };
  };

  const aesoDiff = getPredictionDiff(aesoForecast);
  const aiDiff = getPredictionDiff(aiPrediction);

  const toggleSection = (section: 'predictions' | 'stats') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-500';
    if (confidence >= 0.6) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <div className="w-full h-full flex flex-col border-l border-border bg-card overflow-y-auto">
      {/* Countdown Header */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Price Update</span>
          </div>
          <Badge variant="outline" className="text-[10px] h-5">
            {format(nextHour, 'HH:00')} MST
          </Badge>
        </div>
        <motion.div 
          className="text-2xl font-mono font-bold text-foreground tabular-nums text-center"
          key={countdown}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
        >
          {formatCountdown(countdown)}
        </motion.div>
      </div>

      {/* Session Stats Section */}
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection('stats')}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Session Stats</span>
          </div>
          {expandedSections.stats ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.stats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">High</span>
                  <span className="text-xs font-semibold text-red-500">${stats.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-xs font-semibold text-emerald-500">${stats.low.toFixed(2)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">VWAP</span>
                  <span className="text-xs font-semibold text-foreground">${stats.avg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    Volatility
                  </span>
                  <span className={`text-xs font-semibold ${stats.volatility > 20 ? 'text-amber-500' : 'text-foreground'}`}>
                    {stats.volatility.toFixed(1)}%
                  </span>
                </div>
                {stats.volume > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg Load</span>
                    <span className="text-xs font-semibold text-foreground">{stats.volume.toFixed(0)} MW</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Predictions Section */}
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection('predictions')}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-foreground">Forecasts</span>
          </div>
          <div className="flex items-center gap-2">
            {historicalAccuracy && (
              <Badge variant="secondary" className="text-[9px] h-4 gap-0.5 px-1">
                <Award className="w-2.5 h-2.5" />
                {historicalAccuracy}%
              </Badge>
            )}
            {expandedSections.predictions ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        </button>
        <AnimatePresence>
          {expandedSections.predictions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-3">
                {/* AESO Forecast */}
                <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] text-muted-foreground">AESO</span>
                    </div>
                    {aesoDiff && (
                      <span className={`text-[10px] font-medium ${
                        aesoDiff.isUp ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {aesoDiff.isUp ? '+' : ''}{aesoDiff.percent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-blue-600">
                        {aesoForecast !== undefined ? `$${aesoForecast.toFixed(2)}` : '--'}
                      </p>
                    )}
                  </AnimatePresence>
                </div>

                {/* AI Prediction */}
                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-muted-foreground">AI Model</span>
                    </div>
                    {aiDiff && (
                      <span className={`text-[10px] font-medium ${
                        aiDiff.isUp ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {aiDiff.isUp ? '+' : ''}{aiDiff.percent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {aiLoading ? (
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 animate-pulse text-emerald-500" />
                        <span className="text-xs text-muted-foreground">Generating...</span>
                      </div>
                    ) : loading ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-emerald-600">
                        {aiPrediction !== undefined ? `$${aiPrediction.toFixed(2)}` : '--'}
                      </p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confidence */}
                <div className={`p-2 rounded-lg bg-muted/50 border border-border ${aiLoading ? 'animate-pulse' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">AI Confidence</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {aiLoading ? '...' : `${Math.round(aiConfidence * 100)}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${getConfidenceColor(aiConfidence)} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: aiLoading ? '50%' : `${aiConfidence * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Data Attribution */}
      <div className="p-2 text-center border-t border-border">
        <p className="text-[9px] text-muted-foreground">
          Data: AESO & AI Model
        </p>
      </div>
    </div>
  );
}
