import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Brain, 
  Building2, 
  Timer,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addHours, startOfHour, differenceInSeconds } from 'date-fns';

interface NextHourPreviewProps {
  aesoForecast?: number;
  aiPrediction?: number;
  aiConfidence?: number;
  currentPrice: number;
  loading?: boolean;
}

export function NextHourPreview({
  aesoForecast,
  aiPrediction,
  aiConfidence = 0.85,
  currentPrice,
  loading = false
}: NextHourPreviewProps) {
  const [countdown, setCountdown] = useState(0);

  // Calculate next hour
  const nextHour = useMemo(() => {
    const now = new Date();
    return startOfHour(addHours(now, 1));
  }, []);

  // Update countdown every second
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getPredictionDiff = (prediction?: number) => {
    if (!prediction) return null;
    const diff = prediction - currentPrice;
    const percent = currentPrice !== 0 ? (diff / currentPrice) * 100 : 0;
    return { diff, percent, isUp: diff >= 0 };
  };

  const aesoDiff = getPredictionDiff(aesoForecast);
  const aiDiff = getPredictionDiff(aiPrediction);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Timer className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-white">Next Hour Preview</span>
          </div>
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
            {format(nextHour, 'HH:00')} MST
          </Badge>
        </div>

        {/* Countdown */}
        <div className="text-center mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Arriving in</p>
          <motion.div 
            className="text-3xl font-mono font-bold text-white"
            key={countdown}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            ⏳ {formatCountdown(countdown)}
          </motion.div>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 gap-3 flex-1">
          {/* AESO Forecast */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">AESO Forecast</span>
              </div>
              {aesoDiff && (
                <div className={`flex items-center gap-1 text-xs ${aesoDiff.isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {aesoDiff.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {aesoDiff.isUp ? '+' : ''}{aesoDiff.percent.toFixed(1)}%
                </div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-slate-400">Loading...</span>
                </motion.div>
              ) : (
                <motion.p 
                  key="value"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-blue-400 mt-1"
                >
                  ${aesoForecast?.toFixed(2) || '--'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* AI Prediction */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400">AI Prediction</span>
              </div>
              {aiDiff && (
                <div className={`flex items-center gap-1 text-xs ${aiDiff.isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {aiDiff.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {aiDiff.isUp ? '+' : ''}{aiDiff.percent.toFixed(1)}%
                </div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-sm text-slate-400">Loading...</span>
                </motion.div>
              ) : (
                <motion.p 
                  key="value"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-emerald-400 mt-1"
                >
                  ${aiPrediction?.toFixed(2) || '--'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confidence Bar */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">AI Confidence</span>
              <span className="text-xs font-semibold text-white">{Math.round(aiConfidence * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${getConfidenceColor(aiConfidence)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${aiConfidence * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
