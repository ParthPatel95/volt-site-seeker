import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Brain, 
  Building2, 
  Timer,
  TrendingUp,
  TrendingDown,
  Loader2,
  Target,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addHours, startOfHour, differenceInSeconds } from 'date-fns';

interface NextHourPreviewProps {
  aesoForecast?: number;
  aiPrediction?: number;
  aiConfidence?: number;
  currentPrice: number;
  loading?: boolean;
  aiLoading?: boolean;
  historicalAccuracy?: number;
}

export function NextHourPreview({
  aesoForecast,
  aiPrediction,
  aiConfidence = 0.85,
  currentPrice,
  loading = false,
  aiLoading = false,
  historicalAccuracy = 87
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
    if (confidence >= 0.6) return 'bg-amber-500';
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

  // Calculate prediction spread
  const predictionSpread = aesoForecast && aiPrediction 
    ? Math.abs(aesoForecast - aiPrediction) 
    : null;

  return (
    <Card className="bg-card border-border h-full shadow-sm">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Timer className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Next Hour</span>
          </div>
          <div className="flex items-center gap-2">
            {historicalAccuracy && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Award className="w-3 h-3" />
                {historicalAccuracy}% accurate
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {format(nextHour, 'HH:00')} MST
            </Badge>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center mb-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Price Update In</p>
          <motion.div 
            className="text-3xl font-mono font-bold text-foreground tabular-nums"
            key={countdown}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {formatCountdown(countdown)}
          </motion.div>
        </div>

        {/* Predictions Comparison Bar */}
        {aesoForecast && aiPrediction && (
          <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>AESO</span>
              <span className="font-medium text-foreground">
                Spread: ${predictionSpread?.toFixed(2)}
              </span>
              <span>AI</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(aesoForecast / (aesoForecast + aiPrediction)) * 100}%` }}
                />
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: `${(aiPrediction / (aesoForecast + aiPrediction)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 gap-2 flex-1">
          {/* AESO Forecast */}
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">AESO Forecast</span>
              </div>
              {aesoDiff && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
                  aesoDiff.isUp ? 'text-red-600 bg-red-500/10' : 'text-emerald-600 bg-emerald-500/10'
                }`}>
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
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </motion.div>
              ) : (
                <motion.p 
                  key="value"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-blue-600 mt-1"
                >
                  {aesoForecast !== undefined ? `$${aesoForecast.toFixed(2)}` : '--'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* AI Prediction */}
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">AI Prediction</span>
              </div>
              {aiDiff && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
                  aiDiff.isUp ? 'text-red-600 bg-red-500/10' : 'text-emerald-600 bg-emerald-500/10'
                }`}>
                  {aiDiff.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {aiDiff.isUp ? '+' : ''}{aiDiff.percent.toFixed(1)}%
                </div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {aiLoading ? (
                <motion.div 
                  key="ai-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <Brain className="w-4 h-4 animate-pulse text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Generating...</span>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </motion.div>
              ) : (
                <motion.p 
                  key="value"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-emerald-600 mt-1"
                >
                  {aiPrediction !== undefined ? `$${aiPrediction.toFixed(2)}` : '--'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confidence Bar */}
          <div className={`p-3 rounded-lg bg-muted/50 border border-border ${aiLoading ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">AI Confidence</span>
              </div>
              <span className="text-xs font-bold text-foreground">
                {aiLoading ? '...' : `${Math.round(aiConfidence * 100)}%`}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${getConfidenceColor(aiConfidence)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: aiLoading ? '50%' : `${aiConfidence * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
