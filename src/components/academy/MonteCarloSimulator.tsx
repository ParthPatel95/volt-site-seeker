import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  RefreshCw, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface SimulationResult {
  roi: number;
  breakEvenMonths: number;
  survivalProbability: number;
  profitableScenarios: number;
}

interface SimulationParams {
  btcPriceStart: number;
  btcPriceVolatility: number;
  difficultyGrowth: number;
  powerCost: number;
  hashrate: number;
  efficiency: number;
  capex: number;
  simulationMonths: number;
}

const defaultParams: SimulationParams = {
  btcPriceStart: 65000,
  btcPriceVolatility: 60, // Annual volatility %
  difficultyGrowth: 35, // Annual growth %
  powerCost: 0.045, // $/kWh
  hashrate: 100, // TH/s
  efficiency: 20, // J/TH
  capex: 2500, // $ per TH
  simulationMonths: 24,
};

const NUM_SIMULATIONS = 1000;

interface MonteCarloSimulatorProps {
  className?: string;
}

export default function MonteCarloSimulator({ className = '' }: MonteCarloSimulatorProps) {
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [roiDistribution, setRoiDistribution] = useState<number[]>([]);

  // Box-Muller transform for normal distribution
  const randomNormal = useCallback((mean: number, stdDev: number) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }, []);

  // Run a single simulation path
  const runSimulation = useCallback(() => {
    const monthlyVolatility = params.btcPriceVolatility / 100 / Math.sqrt(12);
    const monthlyDiffGrowth = Math.pow(1 + params.difficultyGrowth / 100, 1/12) - 1;
    
    let btcPrice = params.btcPriceStart;
    let difficulty = 1; // Relative to start
    let totalBtcMined = 0;
    let totalPowerCost = 0;
    const hoursPerMonth = 730;
    
    // Network assumptions
    const networkHashrate = 600_000_000; // 600 EH/s
    const blocksPerMonth = 4320; // ~6 blocks/hour * 720 hours
    const blockReward = 3.125; // Post-halving
    
    for (let month = 0; month < params.simulationMonths; month++) {
      // Random walk for BTC price (log-normal)
      const priceReturn = randomNormal(0, monthlyVolatility);
      btcPrice *= Math.exp(priceReturn);
      
      // Difficulty growth with some randomness
      const diffGrowthThisMonth = monthlyDiffGrowth * (0.8 + Math.random() * 0.4);
      difficulty *= (1 + diffGrowthThisMonth);
      
      // Calculate BTC mined this month
      const myHashrate = params.hashrate * 1e12; // Convert TH to H
      const networkHashrateNow = networkHashrate * 1e18 * difficulty;
      const hashShare = myHashrate / networkHashrateNow;
      const btcMinedThisMonth = hashShare * blocksPerMonth * blockReward;
      
      // Power cost for this month
      const powerWatts = params.hashrate * params.efficiency;
      const kwhPerMonth = (powerWatts * hoursPerMonth) / 1000;
      const powerCostThisMonth = kwhPerMonth * params.powerCost;
      
      totalBtcMined += btcMinedThisMonth;
      totalPowerCost += powerCostThisMonth;
    }
    
    // Calculate results
    const totalCapex = params.hashrate * params.capex;
    const btcValueAtEnd = totalBtcMined * btcPrice;
    const netProfit = btcValueAtEnd - totalPowerCost - totalCapex;
    const roi = (netProfit / totalCapex) * 100;
    
    // Find break-even month (simplified)
    const avgMonthlyBtcValue = btcValueAtEnd / params.simulationMonths;
    const avgMonthlyOpex = totalPowerCost / params.simulationMonths;
    const avgMonthlyProfit = avgMonthlyBtcValue - avgMonthlyOpex;
    const breakEvenMonths = avgMonthlyProfit > 0 ? totalCapex / avgMonthlyProfit : Infinity;
    
    return { 
      roi, 
      breakEvenMonths: Math.min(breakEvenMonths, params.simulationMonths * 2),
      profitable: netProfit > 0 
    };
  }, [params, randomNormal]);

  // Run all simulations
  const runAllSimulations = useCallback(() => {
    setIsRunning(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const rois: number[] = [];
      const breakEvens: number[] = [];
      let profitableCount = 0;
      
      for (let i = 0; i < NUM_SIMULATIONS; i++) {
        const result = runSimulation();
        rois.push(result.roi);
        breakEvens.push(result.breakEvenMonths);
        if (result.profitable) profitableCount++;
      }
      
      // Calculate statistics
      const avgRoi = rois.reduce((a, b) => a + b, 0) / rois.length;
      const avgBreakEven = breakEvens.filter(b => b < Infinity).reduce((a, b) => a + b, 0) / 
        breakEvens.filter(b => b < Infinity).length;
      
      setResults({
        roi: avgRoi,
        breakEvenMonths: avgBreakEven || params.simulationMonths,
        survivalProbability: (profitableCount / NUM_SIMULATIONS) * 100,
        profitableScenarios: profitableCount,
      });
      
      // Create distribution buckets for histogram
      const buckets = 20;
      const minRoi = Math.min(...rois);
      const maxRoi = Math.max(...rois);
      const bucketSize = (maxRoi - minRoi) / buckets;
      const distribution = new Array(buckets).fill(0);
      
      rois.forEach(roi => {
        const bucket = Math.min(Math.floor((roi - minRoi) / bucketSize), buckets - 1);
        distribution[bucket]++;
      });
      
      setRoiDistribution(distribution.map(d => d / NUM_SIMULATIONS * 100));
      setIsRunning(false);
    }, 100);
  }, [runSimulation, params.simulationMonths]);

  const updateParam = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Monte Carlo Simulator</h3>
            <p className="text-sm text-muted-foreground">
              {NUM_SIMULATIONS.toLocaleString()} scenario simulations for mining profitability
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Parameters */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Simulation Parameters
            </h4>

            {/* BTC Price */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Starting BTC Price</Label>
                <span className="text-sm font-mono text-primary">${params.btcPriceStart.toLocaleString()}</span>
              </div>
              <Slider
                value={[params.btcPriceStart]}
                onValueChange={([v]) => updateParam('btcPriceStart', v)}
                min={20000}
                max={150000}
                step={1000}
              />
            </div>

            {/* Volatility */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Annual Volatility</Label>
                <span className="text-sm font-mono text-primary">{params.btcPriceVolatility}%</span>
              </div>
              <Slider
                value={[params.btcPriceVolatility]}
                onValueChange={([v]) => updateParam('btcPriceVolatility', v)}
                min={20}
                max={100}
                step={5}
              />
            </div>

            {/* Difficulty Growth */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Annual Difficulty Growth</Label>
                <span className="text-sm font-mono text-primary">{params.difficultyGrowth}%</span>
              </div>
              <Slider
                value={[params.difficultyGrowth]}
                onValueChange={([v]) => updateParam('difficultyGrowth', v)}
                min={0}
                max={80}
                step={5}
              />
            </div>

            {/* Power Cost */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Power Cost ($/kWh)</Label>
                <span className="text-sm font-mono text-primary">${params.powerCost.toFixed(3)}</span>
              </div>
              <Slider
                value={[params.powerCost * 1000]}
                onValueChange={([v]) => updateParam('powerCost', v / 1000)}
                min={20}
                max={100}
                step={1}
              />
            </div>

            {/* Efficiency */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">ASIC Efficiency (J/TH)</Label>
                <span className="text-sm font-mono text-primary">{params.efficiency} J/TH</span>
              </div>
              <Slider
                value={[params.efficiency]}
                onValueChange={([v]) => updateParam('efficiency', v)}
                min={15}
                max={40}
                step={1}
              />
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Simulation Period</Label>
                <span className="text-sm font-mono text-primary">{params.simulationMonths} months</span>
              </div>
              <Slider
                value={[params.simulationMonths]}
                onValueChange={([v]) => updateParam('simulationMonths', v)}
                min={6}
                max={48}
                step={6}
              />
            </div>

            {/* Run Button */}
            <div className="flex gap-3">
              <Button 
                onClick={runAllSimulations} 
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setParams(defaultParams);
                  setResults(null);
                  setRoiDistribution([]);
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Simulation Results
            </h4>

            {results ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Expected ROI</div>
                    <div className={`text-2xl font-bold ${results.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {results.roi >= 0 ? '+' : ''}{results.roi.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Break-Even</div>
                    <div className="text-2xl font-bold text-foreground">
                      {results.breakEvenMonths.toFixed(0)} mo
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Profit Probability</div>
                    <div className={`text-2xl font-bold ${results.survivalProbability >= 50 ? 'text-green-500' : 'text-amber-500'}`}>
                      {results.survivalProbability.toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Profitable Runs</div>
                    <div className="text-2xl font-bold text-foreground">
                      {results.profitableScenarios}/{NUM_SIMULATIONS}
                    </div>
                  </div>
                </div>

                {/* Distribution Histogram */}
                <div className="p-4 bg-muted/20 rounded-xl">
                  <div className="text-sm font-medium text-foreground mb-3">ROI Distribution</div>
                  <div className="flex items-end gap-1 h-32">
                    {roiDistribution.map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height * 3}%` }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex-1 rounded-t ${
                          i < roiDistribution.length / 2 
                            ? 'bg-red-500/60' 
                            : 'bg-green-500/60'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Loss</span>
                    <span>Break-Even</span>
                    <span>Profit</span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className={`p-4 rounded-xl border ${
                  results.survivalProbability >= 70 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : results.survivalProbability >= 50 
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    {results.survivalProbability >= 70 ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="text-sm text-muted-foreground">
                      {results.survivalProbability >= 70 ? (
                        <>Strong profitability outlook. {results.profitableScenarios} of {NUM_SIMULATIONS} scenarios resulted in positive returns.</>
                      ) : results.survivalProbability >= 50 ? (
                        <>Moderate risk. Consider improving efficiency or securing lower power costs to improve outcomes.</>
                      ) : (
                        <>High risk of loss. Current parameters show unfavorable economics. Review assumptions.</>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Configure parameters and run the simulation to see probability distributions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground">
          This simulation uses geometric Brownian motion for BTC price and stochastic difficulty growth.
          Results are probabilistic estimates and should not be considered financial advice.
        </p>
      </div>
    </div>
  );
}
