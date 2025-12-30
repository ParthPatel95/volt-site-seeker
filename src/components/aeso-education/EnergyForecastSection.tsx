import { TrendingUp, Brain, Thermometer, Wind, Flame, Clock, Target, BarChart3, Zap, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight,
  AESODeepDive,
  AESOStepByStep
} from './shared';

// Simulated forecast data
const forecastData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  predicted: 45 + Math.sin(i / 4) * 20 + Math.random() * 10,
  actual: i < 12 ? 45 + Math.sin(i / 4) * 20 + Math.random() * 5 : null,
  confidence_upper: 55 + Math.sin(i / 4) * 20 + Math.random() * 10,
  confidence_lower: 35 + Math.sin(i / 4) * 20 + Math.random() * 10,
}));

const forecastDrivers = [
  { icon: Thermometer, name: 'Temperature', impact: 'High', desc: 'Cold snaps = +$50-200/MWh', detail: 'Extreme cold (-30°C) drives heating demand while reducing thermal plant efficiency. This double effect can push prices to price cap levels.' },
  { icon: Wind, name: 'Wind Forecast', impact: 'High', desc: 'Low wind = +$30-100/MWh', detail: 'With 4.8GW of wind capacity, calm conditions remove significant low-cost supply from the merit order, forcing expensive gas plants online.' },
  { icon: Flame, name: 'Natural Gas Price', impact: 'Medium', desc: 'Gas sets marginal price 60% of hours', detail: 'Most hours are set by gas-fired generation. When AECO gas prices rise, pool prices follow with a ~10:1 heat rate multiplier.' },
  { icon: Clock, name: 'Time of Day', impact: 'Medium', desc: 'Evening peak premium', detail: 'Prices typically peak 5-8 PM when residential demand rises and solar output falls. Morning ramp (6-9 AM) is second-highest.' },
];

const modelMetrics = [
  { label: 'Direction Accuracy', value: '92%', desc: 'Correctly predicts price direction' },
  { label: 'Avg Error (MAE)', value: '$8.50', desc: 'Average prediction error' },
  { label: '12CP Prediction', value: '85%', desc: 'Successfully identifies peaks' },
];

export const EnergyForecastSection = () => {
  return (
    <AESOSectionWrapper theme="light" id="forecasting">
      <AESOSectionHeader
        badge="AI-Powered Insights"
        badgeIcon={Brain}
        title="Energy Forecasting"
        description="How machine learning predicts prices and optimizes operations. Understanding forecasting methodology helps you make better decisions about when to run and when to curtail."
        theme="light"
        align="center"
      />

      {/* Why Forecasting Matters */}
      <div className="mb-12">
        <AESODeepDive title="Why Price Forecasting Matters" defaultOpen>
          <div className="space-y-4 text-muted-foreground">
            <p>
              In Alberta's real-time market, you pay (or get paid) the pool price at the moment of consumption. 
              Since prices can swing from <strong className="text-foreground">-$50 to $999/MWh</strong> within hours, 
              knowing what's coming is worth millions.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">Avoid Expensive Hours</h4>
                <p className="text-sm">
                  Curtailing during the top 5% most expensive hours can reduce average power costs by 20-30%.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">Capture $0 Hours</h4>
                <p className="text-sm">
                  Running at full capacity during abundant renewable periods captures essentially free electricity.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">12CP Avoidance</h4>
                <p className="text-sm">
                  Predicting monthly system peaks allows you to curtail and eliminate transmission charges.
                </p>
              </div>
            </div>
          </div>
        </AESODeepDive>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left - Forecast Chart */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            24-Hour Price Forecast
          </h3>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} interval={3} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} domain={[20, 80]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`$${value?.toFixed(2)}/MWh`, '']}
                  />
                  <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'Avg', position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--watt-bitcoin))" 
                    strokeWidth={2}
                    dot={false}
                    name="Predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--watt-trust))" 
                    strokeWidth={2}
                    dot={false}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence_upper" 
                    stroke="hsl(var(--watt-bitcoin))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    opacity={0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence_lower" 
                    stroke="hsl(var(--watt-bitcoin))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    opacity={0.3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[hsl(var(--watt-bitcoin))] rounded" />
                <span className="text-xs text-muted-foreground">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[hsl(var(--watt-trust))] rounded" />
                <span className="text-xs text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-[hsl(var(--watt-bitcoin)/0.3)] rounded" style={{ borderTop: '1px dashed' }} />
                <span className="text-xs text-muted-foreground">Confidence Band</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Forecast Drivers */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Key Forecast Drivers
          </h3>

          <div className="space-y-4 mb-6">
            {forecastDrivers.map((driver, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-[hsl(var(--watt-bitcoin)/0.1)]">
                    <driver.icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{driver.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        driver.impact === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))]'
                      }`}>
                        {driver.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{driver.desc}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 pl-16 hidden group-hover:block">{driver.detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Model Performance */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-trust)/0.1)] to-[hsl(var(--watt-trust)/0.05)] border border-[hsl(var(--watt-trust)/0.2)]">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-[hsl(var(--watt-trust))]" />
              VoltScout Model Performance
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {modelMetrics.map((metric, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-[hsl(var(--watt-trust))]">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How Forecasting Works */}
      <AESOStepByStep
        title="How VoltScout Uses Forecasts"
        theme="light"
        steps={[
          {
            title: 'Predict',
            description: 'AI models analyze weather forecasts, demand patterns, gas prices, and historical data to predict prices 24-72 hours ahead.'
          },
          {
            title: 'Alert',
            description: 'Automated alerts notify operators when 12CP events or price spikes are likely, allowing time to prepare curtailment.'
          },
          {
            title: 'Optimize',
            description: 'Dynamic load adjustment recommendations maximize hashrate during cheap hours and minimize exposure during expensive ones.'
          },
          {
            title: 'Profit',
            description: 'The result: 20-30% lower effective electricity costs compared to running 24/7 at flat consumption.'
          }
        ]}
        className="mb-12"
      />

      {/* Results Highlight */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--watt-bitcoin))] flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">Intelligent Load Optimization</p>
              <p className="text-white/70">Powered by AI price forecasting</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--watt-bitcoin))]">$2-5M+</p>
            <p className="text-white/70">Annual savings for a 100MW facility</p>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <AESOKeyInsight variant="tip" title="Combine Forecasting with Grid Programs" theme="light" className="mt-8">
        <p>
          Price forecasting becomes even more powerful when combined with grid program participation. When the model 
          predicts high prices, you're already curtailed — and getting <strong>paid</strong> through Operating Reserve 
          or Demand Response programs. Double benefit: avoid expensive power AND earn revenue.
        </p>
      </AESOKeyInsight>

      {/* Data Source */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-trust))]"></span>
          Model performance metrics based on VoltScout backtesting against historical AESO pool prices
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
